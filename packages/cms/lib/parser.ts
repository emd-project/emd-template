/**
 * Parse and serialize YAML frontmatter + MDX body.
 * Lightweight — no dependency on gray-matter (which is Node-only).
 */

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/

/** Parse a file with YAML frontmatter + body */
export function parseContent(raw: string): { data: Record<string, unknown>; body: string } {
  const match = raw.match(FRONTMATTER_RE)
  if (!match) return { data: {}, body: raw }

  const yamlStr = match[1]
  const body = match[2]
  const data = parseSimpleYaml(yamlStr)

  return { data, body }
}

/** Serialize data + body back to frontmatter format */
export function serializeContent(data: Record<string, unknown>, body?: string): string {
  const yaml = serializeSimpleYaml(data)
  if (body !== undefined) {
    return `---\n${yaml}---\n\n${body}`
  }
  return yaml
}

/** Parse pure YAML file (no frontmatter delimiters) */
export function parseYaml(raw: string): Record<string, unknown> {
  return parseSimpleYaml(raw)
}

/** Simple YAML parser — handles strings, numbers, booleans, arrays, objects */
function parseSimpleYaml(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const lines = yaml.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const keyMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/)

    if (!keyMatch) { i++; continue }

    const key = keyMatch[1]
    const valueStr = keyMatch[2].trim()

    if (valueStr === '') {
      // Could be array or nested object — check next line
      if (i + 1 < lines.length && lines[i + 1]?.match(/^\s+-\s/)) {
        // Array
        const arr: unknown[] = []
        i++
        while (i < lines.length) {
          const arrLine = lines[i]
          const arrMatch = arrLine.match(/^\s+-\s(.*)$/)
          if (!arrMatch) break
          const val = arrMatch[1].trim()
          // Check if it's an object item (has key: value on next lines with more indent)
          if (val.match(/^\w[\w-]*\s*:/)) {
            // Inline object in array: - key: value
            const obj: Record<string, unknown> = {}
            const inlineMatch = val.match(/^(\w[\w-]*)\s*:\s*(.*)$/)
            if (inlineMatch) {
              obj[inlineMatch[1]] = parseValue(inlineMatch[2].trim())
              // Check for continuation lines
              i++
              while (i < lines.length) {
                const contLine = lines[i]
                const contMatch = contLine.match(/^\s{4,}(\w[\w-]*)\s*:\s*(.*)$/)
                if (!contMatch) break
                obj[contMatch[1]] = parseValue(contMatch[2].trim())
                i++
              }
            }
            arr.push(obj)
            continue
          }
          arr.push(parseValue(val))
          i++
        }
        result[key] = arr
        continue
      }
      result[key] = ''
    } else {
      result[key] = parseValue(valueStr)
    }
    i++
  }

  return result
}

function parseValue(str: string): unknown {
  if (str === 'true') return true
  if (str === 'false') return false
  if (str === 'null' || str === '~') return null
  if (/^-?\d+$/.test(str)) return parseInt(str, 10)
  if (/^-?\d+\.\d+$/.test(str)) return parseFloat(str)
  // Remove quotes
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1)
  }
  // Inline array [a, b, c]
  if (str.startsWith('[') && str.endsWith(']')) {
    return str.slice(1, -1).split(',').map((s) => parseValue(s.trim()))
  }
  return str
}

/** Simple YAML serializer */
function serializeSimpleYaml(data: Record<string, unknown>, indent = 0): string {
  const prefix = ' '.repeat(indent)
  let out = ''

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue

    if (Array.isArray(value)) {
      out += `${prefix}${key}:\n`
      for (const item of value) {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          const entries = Object.entries(item as Record<string, unknown>)
          if (entries.length > 0) {
            out += `${prefix}  - ${entries[0][0]}: ${yamlValue(entries[0][1])}\n`
            for (let j = 1; j < entries.length; j++) {
              out += `${prefix}    ${entries[j][0]}: ${yamlValue(entries[j][1])}\n`
            }
          }
        } else {
          out += `${prefix}  - ${yamlValue(item)}\n`
        }
      }
    } else if (typeof value === 'object') {
      out += `${prefix}${key}:\n`
      out += serializeSimpleYaml(value as Record<string, unknown>, indent + 2)
    } else {
      out += `${prefix}${key}: ${yamlValue(value)}\n`
    }
  }

  return out
}

function yamlValue(v: unknown): string {
  if (typeof v === 'string') {
    if (v.includes(':') || v.includes('#') || v.includes("'") || v.includes('"') || v.includes('\n') || v === '') {
      return `"${v.replace(/"/g, '\\"')}"`
    }
    return `"${v}"`
  }
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return '""'
}
