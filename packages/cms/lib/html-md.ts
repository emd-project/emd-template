/**
 * Lightweight HTML ↔ Markdown converter for TipTap editor.
 *
 * Block extraction strategy:
 * - MDX/JSX components, shortcodes [[…]], and GFM tables are extracted
 *   BEFORE MD→HTML conversion and stored with [[MDXBLOCK0]] placeholders.
 * - Placeholders survive the round-trip as plain text in TipTap.
 * - On save, blocks are reinserted at their original positions.
 */

// MDX component tags to preserve as-is (not converted)
const MDX_TAGS = ['Tip', 'Warning', 'Verdict', 'PullQuote', 'StatCard', 'StatRow', 'CompareBar', 'CompareBarGroup', 'ProductCTA', 'ArticleImage', 'ProductCarousel', 'AISummarize', 'ProConTable']
const MDX_TAG_REGEX = new RegExp(`(<(?:${MDX_TAGS.join('|')})[\\s\\S]*?(?:\\/>|<\\/(?:${MDX_TAGS.join('|')})>))`, 'g')

// ─── Block extraction ──────────────────────────────────────────────────

const MDX_PLACEHOLDER_RE = /\[\[MDXBLOCK(\d+)\]\]/g

const JSX_BLOCK_RE =
  /(?:^|\n)(<[A-Z][a-zA-Z0-9]*(?:\s[^>]*)?\/>|<([A-Z][a-zA-Z0-9]*)(?:\s[^>]*)?>[\s\S]*?<\/\2>)/g

const GFM_TABLE_RE =
  /(?:^|\n)((?:\|[^\n]+\|\s*\n)\|[\s:|-]+\|\s*\n(?:\|[^\n]+\|\s*\n?)+)/g

const SHORTCODE_BLOCK_RE =
  /(?:^|\n)(\[\[[a-z]+[^\]]*\]\][\s\S]*?\[\[\/[a-z]+\]\])/g

const SHORTCODE_INLINE_RE =
  /(\[\[[a-z]+(?::[^\]]+|[^\]]*)\]\])/g

export function extractMdxBlocks(markdown: string): {
  cleaned: string
  blocks: Record<string, string>
} {
  const blocks: Record<string, string> = {}
  let idx = 0

  function extract(_m: string, captured: string): string {
    const key = `[[MDXBLOCK${idx++}]]`
    blocks[key.slice(2, -2)] = captured.trim()
    return `\n\n${key}\n\n`
  }

  let cleaned = markdown
  cleaned = cleaned.replace(JSX_BLOCK_RE, (_m, p1) => extract(_m, p1))
  cleaned = cleaned.replace(GFM_TABLE_RE, (_m, p1) => extract(_m, p1))
  cleaned = cleaned.replace(SHORTCODE_BLOCK_RE, (_m, p1) => extract(_m, p1))
  cleaned = cleaned.replace(SHORTCODE_INLINE_RE, (_m, p1) => extract(_m, p1))

  return { cleaned: cleaned.trim(), blocks }
}

export function reinsertMdxBlocks(markdown: string, blocks: Record<string, string>): string {
  return markdown.replace(MDX_PLACEHOLDER_RE, (match) => {
    const key = match.slice(2, -2)
    return blocks[key] ?? match
  })
}

/** Convert Markdown (with possible MDX) to HTML for TipTap */
export function markdownToHtml(md: string): string {
  // Extract MDX blocks and replace with placeholders
  const mdxBlocks: string[] = []
  let html = md.replace(MDX_TAG_REGEX, (match) => {
    mdxBlocks.push(match)
    return `<div data-mdx="${mdxBlocks.length - 1}" style="background:#1a1a2e;border:1px solid #333;border-radius:6px;padding:12px;margin:12px 0;font-family:monospace;font-size:12px;color:#888;white-space:pre-wrap;">${escapeHtml(match)}</div>`
  })

  // Code blocks
  const codeBlocks: string[] = []
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    codeBlocks.push(code)
    return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`
  })

  // Headings
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>')

  // Markdown pipe tables → HTML tables
  html = convertMarkdownTablesToHtml(html)

  // Images (before links)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<s>$1</s>')

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Blockquotes
  const lines = html.split('\n')
  const result: string[] = []
  let inBlockquote = false
  let inList = false
  let listType = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Blockquotes
    if (line.match(/^>\s?(.*)$/)) {
      const content = line.replace(/^>\s?/, '')
      if (!inBlockquote) { result.push('<blockquote>'); inBlockquote = true }
      result.push(`<p>${content}</p>`)
      continue
    }
    if (inBlockquote) { result.push('</blockquote>'); inBlockquote = false }

    // Unordered lists
    if (line.match(/^[-*]\s(.+)$/)) {
      const content = line.replace(/^[-*]\s/, '')
      if (!inList || listType !== 'ul') {
        if (inList) result.push(`</${listType}>`)
        result.push('<ul>'); inList = true; listType = 'ul'
      }
      result.push(`<li>${content}</li>`)
      continue
    }

    // Ordered lists
    if (line.match(/^\d+\.\s(.+)$/)) {
      const content = line.replace(/^\d+\.\s/, '')
      if (!inList || listType !== 'ol') {
        if (inList) result.push(`</${listType}>`)
        result.push('<ol>'); inList = true; listType = 'ol'
      }
      result.push(`<li>${content}</li>`)
      continue
    }

    if (inList) { result.push(`</${listType}>`); inList = false; listType = '' }

    // Empty lines
    if (!line.trim()) {
      result.push('')
      continue
    }

    // Already HTML
    if (line.trim().startsWith('<')) {
      result.push(line)
      continue
    }

    // Paragraph
    result.push(`<p>${line}</p>`)
  }

  if (inBlockquote) result.push('</blockquote>')
  if (inList) result.push(`</${listType}>`)

  return result.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

/** Convert TipTap HTML to Markdown for saving */
export function htmlToMarkdown(html: string): string {
  let md = html

  // Restore MDX blocks from placeholders
  md = md.replace(/<div[^>]*data-mdx="(\d+)"[^>]*>[\s\S]*?<\/div>/g, (_, idx) => {
    return `\n\n` // MDX blocks are preserved in original markdown
  })

  // Normalize
  md = md.replace(/\u200B/g, '')
  md = md.replace(/&nbsp;/g, ' ')

  // Block elements
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n')

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    const text = content.replace(/<\/?p[^>]*>/g, '').trim()
    return '\n' + text.split('\n').map((l: string) => `> ${l.trim()}`).filter((l: string) => l !== '> ').join('\n') + '\n'
  })

  // Lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    return '\n' + content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n').trim() + '\n'
  })
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    let i = 0
    return '\n' + content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m: string, text: string) => {
      i++
      return `${i}. ${text}\n`
    }).trim() + '\n'
  })

  // Code blocks
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, code) => {
    return '\n```\n' + unescapeHtml(code.trim()) + '\n```\n'
  })

  // Horizontal rule
  md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n')

  // Inline elements
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
  md = md.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '$1')
  md = md.replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, '~~$1~~')
  md = md.replace(/<del[^>]*>([\s\S]*?)<\/del>/gi, '~~$1~~')
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)')

  // Tables → markdown pipe tables
  md = convertHtmlTablesToMarkdown(md)

  // Paragraphs/divs → newlines
  md = md.replace(/<\/p>/gi, '\n')
  md = md.replace(/<p[^>]*>/gi, '')
  md = md.replace(/<\/div>/gi, '\n')
  md = md.replace(/<div[^>]*>/gi, '')
  md = md.replace(/<br\s*\/?>/gi, '\n')

  // Strip remaining tags
  md = md.replace(/<[^>]+>/g, '')

  // Unescape
  md = unescapeHtml(md)

  // Clean whitespace
  md = md.replace(/\n{3,}/g, '\n\n').trim()

  return md
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function unescapeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
}

/** Convert markdown pipe tables to HTML <table> */
function convertMarkdownTablesToHtml(md: string): string {
  const lines = md.split('\n')
  const result: string[] = []
  let i = 0

  while (i < lines.length) {
    // Detect a table: line with |, followed by separator line |---|
    if (
      lines[i]?.includes('|') &&
      i + 1 < lines.length &&
      /^\|?\s*[-:]+[-|:\s]+\s*\|?$/.test(lines[i + 1])
    ) {
      const headerCells = parsePipeRow(lines[i])
      // Skip separator line
      i += 2

      let tableHtml = '<table><thead><tr>'
      for (const cell of headerCells) {
        tableHtml += `<th>${cell}</th>`
      }
      tableHtml += '</tr></thead><tbody>'

      while (i < lines.length && lines[i]?.includes('|')) {
        const cells = parsePipeRow(lines[i])
        tableHtml += '<tr>'
        for (const cell of cells) {
          tableHtml += `<td>${cell}</td>`
        }
        tableHtml += '</tr>'
        i++
      }
      tableHtml += '</tbody></table>'
      result.push(tableHtml)
    } else {
      result.push(lines[i])
      i++
    }
  }
  return result.join('\n')
}

/** Parse a markdown pipe-table row into cells */
function parsePipeRow(line: string): string[] {
  let trimmed = line.trim()
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1)
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1)
  return trimmed.split('|').map(c => c.trim())
}

/** Convert HTML <table> to markdown pipe table */
function convertHtmlTablesToMarkdown(html: string): string {
  return html.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    const rows: string[][] = []
    let isHeader = false
    let headerRowCount = 0

    // Extract rows from thead and tbody
    const theadMatch = tableContent.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i)
    const tbodyMatch = tableContent.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i)

    function extractRows(content: string, markHeader: boolean) {
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
      let rowMatch
      while ((rowMatch = rowRegex.exec(content)) !== null) {
        const cells: string[] = []
        const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi
        let cellMatch
        while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
          // Strip inner tags for the cell text
          const cellText = cellMatch[1].replace(/<[^>]+>/g, '').trim()
          cells.push(cellText)
        }
        if (cells.length > 0) {
          rows.push(cells)
          if (markHeader) headerRowCount++
        }
      }
    }

    if (theadMatch) {
      extractRows(theadMatch[1], true)
    }
    if (tbodyMatch) {
      extractRows(tbodyMatch[1], false)
    }

    // If no thead/tbody, just extract all rows; treat first as header
    if (!theadMatch && !tbodyMatch) {
      extractRows(tableContent, false)
      headerRowCount = rows.length > 0 ? 1 : 0
    }

    if (rows.length === 0) return ''

    const colCount = Math.max(...rows.map(r => r.length))
    const mdRows: string[] = []

    for (let r = 0; r < rows.length; r++) {
      const cells = rows[r]
      while (cells.length < colCount) cells.push('')
      mdRows.push('| ' + cells.join(' | ') + ' |')

      // Insert separator after header row(s)
      if (r === (headerRowCount > 0 ? headerRowCount - 1 : 0) && r === 0) {
        mdRows.push('| ' + cells.map(() => '---').join(' | ') + ' |')
      }
    }

    return '\n' + mdRows.join('\n') + '\n'
  })
}
