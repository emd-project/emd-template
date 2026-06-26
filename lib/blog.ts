/**
 * lib/blog.ts — utilitaires serveur pour les articles MDX.
 * FR : content/blog/[categorie]/*.mdx (+ content/articles/*.mdx).
 * EN : content/blog/en/[categorie]/*.mdx (miroir produit par la tâche quotidienne).
 * Server-side uniquement (fs, path).
 *
 * i18n — BLOC 1 (fondation additive) :
 *  - Filtre catégories : SEULS les dossiers de catégories FR réelles sont lus comme
 *    catégories. Un dossier de locale (`en`/`nl`/…) n'apparaît JAMAIS comme catégorie.
 *  - Lecteurs miroir `…En()` : lisent la version EN des articles sans toucher au FR.
 *  cf. emd-methodo/references/i18n-multilingue.md
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { categoryLabels, categoryAccents, niche } from '@/niche.config'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')
const BLOG_DIR_EN = path.join(process.cwd(), 'content/blog/en')
const ARTICLES_DIR = path.join(process.cwd(), 'content/articles')

export const CATEGORY_LABELS: Record<string, string> = categoryLabels()
export const CATEGORY_ACCENT: Record<string, string> = categoryAccents()

/**
 * Dossiers de locale réservés : ne doivent JAMAIS être lus comme des catégories FR.
 * Construit à partir des locales du site (toutes sauf la locale par défaut) + un
 * filet de sécurité statique (`en`/`nl`/`de`) pour les contenus déversés avant config.
 */
const RESERVED_LOCALE_DIRS: Set<string> = new Set<string>([
  ...niche.locales.filter((l) => l !== niche.defaultLocale),
  'en',
  'nl',
  'de',
])

/**
 * Liste blanche des catégories FR réelles, dérivée de niche.config (`niche.categories`).
 * Vide tant que le template n'est pas configuré → on retombe alors sur « tout dossier
 * qui n'est pas un dossier de locale », ce qui garde le build FR fonctionnel.
 */
const FR_CATEGORY_WHITELIST: Set<string> = new Set(niche.categories.map((c) => c.slug))

/**
 * `true` si `dir` est une catégorie FR légitime (jamais un dossier de locale).
 * - Si la liste blanche est renseignée → appartenance stricte à celle-ci.
 * - Sinon (template vierge) → tout dossier sauf un dossier de locale réservé.
 */
function isFrCategory(dir: string): boolean {
  if (RESERVED_LOCALE_DIRS.has(dir)) return false
  if (FR_CATEGORY_WHITELIST.size > 0) return FR_CATEGORY_WHITELIST.has(dir)
  return true
}

/** Formatte une date ISO en français. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export type ArticleMeta = {
  slug: string
  categorie: string
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  readingTimeMin: number
  featureImage?: string
  aiSummary?: string[]
  tags?: string[]
  faq?: { q: string; a: string }[]
  /** True pour les articles dans content/articles/ (URLs racine). */
  standalone?: boolean
  draft?: boolean
  stickyCta?: { label: string; url: string }[]
  stickyCtaMessage?: string
  authorSlug?: string
}

/** Retourne le href correct pour un article (blog ou standalone). */
export function articleHref(article: ArticleMeta): string {
  if (article.standalone) return `/${article.slug}`
  return `/blog/${article.categorie}/${article.slug}`
}

export type ArticleRaw = {
  meta: ArticleMeta
  content: string
}

/**
 * Cover effective d'un article : `featureImage` du frontmatter si défini, SINON
 * l'image de CATÉGORIE (`/images/blog/category-[cat].webp`) **uniquement si le fichier
 * existe** — on ne renvoie jamais un chemin d'image inexistant (pas d'image cassée).
 * → Un article sans cover généré affiche l'illustration de sa catégorie (dans l'article
 *   ET dans les cartes/listings) plutôt qu'un placeholder rayé. Les standalone n'ont
 *   pas d'image de catégorie. Si rien n'existe, retourne undefined (placeholder dev).
 */
function resolveFeatureImage(raw: unknown, categorie: string, standalone: boolean): string | undefined {
  const v = typeof raw === 'string' ? raw.trim() : ''
  if (v) return v
  if (standalone) return undefined
  const catImg = `/images/blog/category-${categorie}.webp`
  try {
    if (fs.existsSync(path.join(process.cwd(), 'public', catImg))) return catImg
  } catch {
    /* ignore — pas d'accès fs au runtime serverless : on laisse undefined */
  }
  return undefined
}

function parseMeta(data: Record<string, unknown>, slug: string, categorie: string, standalone = false): ArticleMeta {
  return {
    slug,
    categorie,
    title: (data.title as string) ?? '',
    description: (data.description as string) ?? '',
    publishedAt: (data.publishedAt as string) ?? '',
    updatedAt: data.updatedAt as string | undefined,
    readingTimeMin: (data.readingTimeMin as number) ?? 5,
    featureImage: resolveFeatureImage(data.featureImage, categorie, standalone),
    aiSummary: data.aiSummary as string[] | undefined,
    tags: data.tags as string[] | undefined,
    faq: data.faq as { q: string; a: string }[] | undefined,
    standalone,
    draft: !!data.draft,
    stickyCta: data.stickyCta as { label: string; url: string }[] | undefined,
    stickyCtaMessage: data.stickyCtaMessage as string | undefined,
    authorSlug: data.authorSlug as string | undefined,
  }
}

/**
 * Lit tous les .mdx de baseDir/[categorie]/ (un niveau).
 * `categoryFilter` décide quels sous-dossiers comptent comme catégories.
 */
function readArticlesDir(baseDir: string, categoryFilter: (dir: string) => boolean): ArticleMeta[] {
  const articles: ArticleMeta[] = []
  if (!fs.existsSync(baseDir)) return articles
  const categories = fs
    .readdirSync(baseDir)
    .filter((f) => fs.statSync(path.join(baseDir, f)).isDirectory() && categoryFilter(f))
  for (const categorie of categories) {
    const files = fs.readdirSync(path.join(baseDir, categorie)).filter((f) => f.endsWith('.mdx'))
    for (const file of files) {
      const slug = file.replace(/\.mdx$/, '')
      const raw = fs.readFileSync(path.join(baseDir, categorie, file), 'utf-8')
      const { data } = matter(raw)
      articles.push(parseMeta(data, slug, categorie, false))
    }
  }
  return articles
}

function sortByDate(a: ArticleMeta[]): ArticleMeta[] {
  return a
    .filter((x) => !x.draft)
    .sort((x, y) => new Date(y.publishedAt).getTime() - new Date(x.publishedAt).getTime())
}

export function getAllArticles(): ArticleMeta[] {
  // 1. Blog articles FR (content/blog/[categorie]/[slug].mdx) — catégories en liste blanche.
  const articles: ArticleMeta[] = readArticlesDir(BLOG_DIR, isFrCategory)

  // 2. Standalone articles (content/articles/[slug].mdx)
  if (fs.existsSync(ARTICLES_DIR)) {
    const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.mdx'))
    for (const file of files) {
      const slug = file.replace(/\.mdx$/, '')
      const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8')
      const { data } = matter(raw)
      const categorie = (data.categorie as string) ?? 'general'
      articles.push(parseMeta(data, slug, categorie, true))
    }
  }

  return sortByDate(articles)
}

/** Retourne les catégories qui ont au moins un article, avec leur nombre. */
export function getCategories(): { slug: string; label: string; count: number }[] {
  const articles = getAllArticles()
  const map: Record<string, number> = {}
  for (const a of articles) map[a.categorie] = (map[a.categorie] ?? 0) + 1
  return Object.entries(map).map(([slug, count]) => ({
    slug, label: CATEGORY_LABELS[slug] ?? slug, count,
  }))
}

export function getArticleRaw(categorie: string, slug: string): ArticleRaw {
  const filePath = path.join(BLOG_DIR, categorie, `${slug}.mdx`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return { meta: parseMeta(data, slug, categorie, false), content }
}

export function articleExists(categorie: string, slug: string): boolean {
  return fs.existsSync(path.join(BLOG_DIR, categorie, `${slug}.mdx`))
}

/**
 * Retourne jusqu'à `limit` articles liés.
 * Priorité : même catégorie → autres catégories. Exclut l'article courant.
 */
export function getRelatedArticles(
  categorie: string,
  currentSlug: string,
  limit = 3
): ArticleMeta[] {
  const all = getAllArticles()
  const sameCat = all.filter((a) => a.categorie === categorie && a.slug !== currentSlug)
  const otherCat = all.filter((a) => a.categorie !== categorie)
  return [...sameCat, ...otherCat].slice(0, limit)
}

// ─── EN (miroir) ─────────────────────────────────────────
// Lecteurs miroir de la version EN des articles. Additifs : ils NE sont importés
// par aucune route tant que l'arbre `app/en/` (bloc 2) n'existe pas, mais compilent.
// content/blog/en/ utilise les MÊMES slugs de catégories que le FR → on réutilise
// la liste blanche (privée de tout dossier de locale imbriqué par sécurité).

export function getAllArticlesEn(): ArticleMeta[] {
  return sortByDate(readArticlesDir(BLOG_DIR_EN, isFrCategory))
}

export function getCategoriesEn(): { slug: string; label: string; count: number }[] {
  const articles = getAllArticlesEn()
  const map: Record<string, number> = {}
  for (const a of articles) map[a.categorie] = (map[a.categorie] ?? 0) + 1
  return Object.entries(map).map(([slug, count]) => ({
    slug, label: CATEGORY_LABELS[slug] ?? slug, count,
  }))
}

export function getArticleRawEn(categorie: string, slug: string): ArticleRaw {
  const filePath = path.join(BLOG_DIR_EN, categorie, `${slug}.mdx`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return { meta: parseMeta(data, slug, categorie, false), content }
}

export function articleExistsEn(categorie: string, slug: string): boolean {
  return fs.existsSync(path.join(BLOG_DIR_EN, categorie, `${slug}.mdx`))
}

export function getRelatedArticlesEn(
  categorie: string,
  currentSlug: string,
  limit = 3
): ArticleMeta[] {
  const all = getAllArticlesEn()
  const sameCat = all.filter((a) => a.categorie === categorie && a.slug !== currentSlug)
  const otherCat = all.filter((a) => a.categorie !== categorie)
  return [...sameCat, ...otherCat].slice(0, limit)
}
