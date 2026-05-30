import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession, getGitHubToken } from '@/packages/cms/lib/get-session'
import { listFiles, getFile } from '@/packages/cms/lib/github'
import { parseYaml, parseContent } from '@/packages/cms/lib/parser'
import { cmsConfig } from '@/cms.config'

export const dynamic = 'force-dynamic'

type AuthorEntry = {
  slug: string
  name: string
  bio: string
  jobTitle: string
}

type ArticleRef = {
  slug: string
  title: string
  publishedAt: string
  categorie: string
}

type AuthorWithArticles = AuthorEntry & {
  articles: ArticleRef[]
  latestDate: string
}

export default async function AuthorsAdminPage() {
  const session = await getSession()
  if (!session) notFound()
  const token = await getGitHubToken()
  if (!token) notFound()

  const authorsDef = cmsConfig.collections.authors
  if (!authorsDef) notFound()

  // Load authors from GitHub
  const authorFiles = await listFiles(token, cmsConfig.repo, authorsDef.path, cmsConfig.branch)
  const yamlFiles = authorFiles.filter((f) => f.type === 'file' && f.name.endsWith('.yaml'))

  const authors: AuthorEntry[] = await Promise.all(
    yamlFiles.map(async (f) => {
      const slug = f.name.replace(/\.yaml$/, '')
      try {
        const file = await getFile(token, cmsConfig.repo, f.path, cmsConfig.branch)
        if (!file) return { slug, name: slug, bio: '', jobTitle: '' }
        const data = parseYaml(file.content)
        return {
          slug,
          name: (data.name as string) || slug,
          bio: (data.bio as string) || '',
          jobTitle: (data.jobTitle as string) || '',
        }
      } catch {
        return { slug, name: slug, bio: '', jobTitle: '' }
      }
    })
  )

  // Load articles to match authorSlug
  const articlesDef = cmsConfig.collections.articles
  let allArticles: ArticleRef[] & { authorSlug?: string }[] = []

  if (articlesDef) {
    const articleFiles = await listFiles(token, cmsConfig.repo, articlesDef.path, cmsConfig.branch)
    const mdxFiles = articleFiles.filter((f) => f.type === 'file' && f.name.endsWith('.mdx'))

    const loaded = await Promise.all(
      mdxFiles.map(async (f) => {
        const slug = f.name.replace(/\.mdx$/, '')
        try {
          const file = await getFile(token, cmsConfig.repo, f.path, cmsConfig.branch)
          if (!file) return null
          const { data } = parseContent(file.content)
          return {
            slug,
            title: (data.title as string) || slug,
            publishedAt: (data.publishedAt as string) || '',
            categorie: (data.categorie as string) || '',
            authorSlug: (data.authorSlug as string) || '',
          }
        } catch {
          return null
        }
      })
    )
    allArticles = loaded.filter((a): a is NonNullable<typeof a> => a !== null)
  }

  // Build author -> articles map
  const articlesByAuthor = new Map<string, ArticleRef[]>()
  for (const article of allArticles) {
    const aSlug = (article as { authorSlug?: string }).authorSlug
    if (aSlug) {
      const list = articlesByAuthor.get(aSlug) || []
      list.push(article)
      articlesByAuthor.set(aSlug, list)
    }
  }

  // Merge
  const authorsWithArticles: AuthorWithArticles[] = authors.map((author) => {
    const articles = (articlesByAuthor.get(author.slug) || [])
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    const latestDate = articles.length > 0 ? articles[0].publishedAt : ''
    return { ...author, articles, latestDate }
  })

  // Sort: authors with most articles first
  authorsWithArticles.sort((a, b) => b.articles.length - a.articles.length)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Auteurs</h1>
          <p style={{ fontSize: 13, color: '#55556A', margin: '4px 0 0' }}>
            {authors.length} auteur{authors.length !== 1 ? 's' : ''} &middot; {allArticles.length} article{allArticles.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/authors/new"
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #FF3D57, #FF6B3D)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          + Nouvel auteur
        </Link>
      </div>

      {authorsWithArticles.length === 0 ? (
        <div className="cms-card" style={{ textAlign: 'center', padding: 40, color: '#55556A' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>&#128100;</div>
          <p style={{ margin: 0, fontSize: 14 }}>Aucun auteur. Commencez par en cr&eacute;er un.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {authorsWithArticles.map((author) => (
            <div key={author.slug} className="cms-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Author header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: author.articles.length > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'linear-gradient(135deg, #1C1C26, #13131A)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: '#9090A8', fontWeight: 700, flexShrink: 0,
                }}>
                  {author.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#F0F0F5' }}>{author.name}</span>
                    {author.jobTitle && (
                      <span style={{ fontSize: 11, color: '#55556A' }}>&middot; {author.jobTitle}</span>
                    )}
                  </div>
                  {author.bio && (
                    <div style={{
                      fontSize: 12, color: '#9090A8', marginTop: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {author.bio}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                    background: author.articles.length > 0 ? 'rgba(61,255,192,0.08)' : 'rgba(255,255,255,0.04)',
                    color: author.articles.length > 0 ? '#3DFFC0' : '#55556A',
                  }}>
                    {author.articles.length} article{author.articles.length !== 1 ? 's' : ''}
                  </span>
                  <Link
                    href={`/admin/authors/${author.slug}`}
                    style={{
                      fontSize: 12, color: '#9090A8', textDecoration: 'none',
                      padding: '4px 10px', borderRadius: 6,
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    Modifier
                  </Link>
                </div>
              </div>

              {/* Articles list */}
              {author.articles.length > 0 && (
                <div style={{ padding: '0' }}>
                  {author.articles.map((article, idx) => (
                    <Link
                      key={article.slug}
                      href={`/admin/articles/${article.slug}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 20px 10px 74px',
                        textDecoration: 'none', color: '#F0F0F5',
                        borderBottom: idx < author.articles.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                        transition: 'background 150ms ease',
                      }}
                      className="cms-row"
                    >
                      <span style={{ fontSize: 12, color: '#55556A', width: 16, textAlign: 'center' }}>&#128196;</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {article.title}
                      </span>
                      {article.categorie && (
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                          background: 'rgba(123,97,255,0.1)', color: '#7B61FF',
                        }}>
                          {article.categorie}
                        </span>
                      )}
                      {article.publishedAt && (
                        <span style={{ fontSize: 11, color: '#55556A', flexShrink: 0 }}>
                          {new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
