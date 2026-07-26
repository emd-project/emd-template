/**
 * Read CMS page content from YAML files.
 * Server-side only (uses fs).
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const PAGES_DIR = path.join(process.cwd(), 'content/pages')
const SETTINGS_PATH = path.join(process.cwd(), 'content/settings.yaml')

/** Read a page's YAML content */
export function getPageContent<T extends Record<string, unknown>>(slug: string): T {
  const filePath = path.join(PAGES_DIR, `${slug}.yaml`)
  if (!fs.existsSync(filePath)) return {} as T
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data } = matter(`---\n${raw}\n---`)
  return data as T
}

/**
 * True si le quiz d'une locale a de VRAIES questions.
 * Locale par défaut → `content/pages/quiz.yaml` ; autre locale → `quiz.<locale>.yaml`.
 *
 * Garde anti-page-vide : sans questions, /quiz et /en/quiz renvoient 404, le bloc
 * quiz de /choisir/[produit] disparaît, et les CTA « Faire le quiz » ne doivent pas
 * être émis (ni dans les pages, ni dans le sitemap).
 */
export function hasQuizSteps(locale: string): boolean {
  const slug = locale === niche.defaultLocale ? 'quiz' : `quiz.${locale}`
  const steps = getPageContent(slug).steps
  return Array.isArray(steps) && steps.length > 0
}

/** Read site settings */
export function getSiteSettings(): SiteSettings {
  if (!fs.existsSync(SETTINGS_PATH)) return defaultSettings
  const raw = fs.readFileSync(SETTINGS_PATH, 'utf-8')
  const { data } = matter(`---\n${raw}\n---`)
  return { ...defaultSettings, ...data } as SiteSettings
}

export type NavItem = {
  label: string
  url?: string
  children?: { label: string; url: string }[]
}

export type SiteSettings = {
  siteName: string
  siteDescription: string
  siteUrl: string
  nav: NavItem[]
}

import { niche } from '@/niche.config'

const defaultSettings: SiteSettings = {
  siteName: niche.siteName,
  siteDescription: niche.tagline,
  siteUrl: `https://www.${niche.domain}`,
  nav: [],
}
