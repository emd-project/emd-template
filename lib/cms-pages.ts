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
  siteUrl: `https://${niche.domain}`,
  nav: [],
}
