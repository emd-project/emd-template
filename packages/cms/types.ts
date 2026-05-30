/** Field types supported by the CMS */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'date'
  | 'select'
  | 'slug'
  | 'tags'
  | 'relation'
  | 'repeater'
  | 'list'
  | 'image'

export type FieldDef = {
  type: FieldType
  label: string
  required?: boolean
  default?: unknown
  /** For 'select' */
  options?: { label: string; value: string }[]
  /** For 'relation' — references another collection */
  collection?: string
  /** For 'repeater' — sub-fields */
  fields?: Record<string, FieldDef>
  /** For 'list' — type of each item */
  itemType?: 'text' | 'textarea'
}

export type CollectionDef = {
  label: string
  path: string
  format: 'mdx' | 'yaml'
  /** If true, entries are in subdirectories by category */
  categorized?: boolean
  /** If true, only one entry exists (e.g. settings.yaml) */
  singleton?: boolean
  /** Fixed slug for singletons */
  slug?: string
  fields: Record<string, FieldDef>
}

export type MediaConfig = {
  path: string
  allowedTypes: string[]
  maxSizeMB: number
}

export type CmsConfig = {
  siteName: string
  repo: string
  branch: string
  collections: Record<string, CollectionDef>
  media: MediaConfig
}

/** An entry loaded from a content file */
export type ContentEntry = {
  slug: string
  data: Record<string, unknown>
  body?: string
  sha: string // GitHub file SHA (needed for updates)
}

/** User role */
export type CmsRole = 'admin' | 'editor'

/** Session data stored in the cookie */
export type CmsSession = {
  /** GitHub token (only for OAuth users) */
  githubToken?: string
  /** Display name or email */
  user: string
  /** User-friendly display name */
  displayName?: string
  /** User role */
  role: CmsRole
  /** Auth method used */
  authMethod: 'github' | 'password'
  expiresAt: number
}

/** A CMS user stored in content/users.yaml */
export type CmsUser = {
  email: string
  name: string
  /** User-friendly display name shown in the UI */
  displayName?: string
  role: CmsRole
  /** PBKDF2 hash of password */
  hash: string
  /** Salt used for hashing */
  salt: string
}
