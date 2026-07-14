import type { CmsConfig } from '@/packages/cms/types'
import { niche } from '@/niche.config'

/**
 * cms.config.ts — schéma des collections éditables dans /admin.
 *
 * MODÈLE MENTION : aucune collection ni aucun champ de monétisation (liens
 * marchands, CTA d'achat, disclaimer). Le CMS n'édite que de l'éditorial.
 */

// Build category options from niche config
const categoryOptions = niche.categories.map((cat) => ({
  label: cat.label,
  value: cat.slug,
}))

// Add default utility categories
const articleCategoryOptions = [
  ...categoryOptions,
  { label: 'Astuces', value: 'astuces' },
]

export const cmsConfig: CmsConfig = {
  siteName: niche.siteName,
  repo: niche.repo,
  branch: niche.branch,
  collections: {
    articles: {
      label: 'Articles',
      path: 'content/articles',
      format: 'mdx',
      fields: {
        title: { type: 'text', label: 'Titre', required: true },
        description: { type: 'textarea', label: 'Description SEO', required: true },
        featureImage: { type: 'image', label: 'Image principale' },
        publishedAt: { type: 'date', label: 'Date publication', required: true },
        updatedAt: { type: 'date', label: 'Date MAJ' },
        readingTimeMin: { type: 'number', label: 'Temps de lecture (min)', default: 5 },
        categorie: { type: 'select', label: 'Catégorie', options: articleCategoryOptions },
        authorSlug: { type: 'relation', label: 'Auteur', collection: 'authors' },
        tags: { type: 'tags', label: 'Tags' },
        aiSummary: { type: 'list', label: 'En bref', itemType: 'textarea' },
        faq: {
          type: 'repeater',
          label: 'FAQ',
          fields: {
            q: { type: 'text', label: 'Question', required: true },
            a: { type: 'textarea', label: 'Réponse', required: true },
          },
        },
      },
    },
    authors: {
      label: 'Auteurs',
      path: 'content/authors',
      format: 'yaml',
      fields: {
        name: { type: 'text', label: 'Nom', required: true },
        bio: { type: 'textarea', label: 'Bio' },
        jobTitle: { type: 'text', label: 'Titre' },
      },
    },
    categories: {
      label: 'Catégories',
      path: 'content/categories',
      format: 'yaml',
      fields: {
        label: { type: 'text', label: 'Nom affiché', required: true },
        description: { type: 'textarea', label: 'Description SEO' },
      },
    },
    pages: {
      label: 'Pages',
      path: 'content/pages',
      format: 'yaml',
      fields: {
        title: { type: 'text', label: 'Titre principal' },
        subtitle: { type: 'textarea', label: 'Sous-titre' },
        eyebrow: { type: 'text', label: 'Sur-titre' },
        cta_primary: { type: 'text', label: 'Bouton principal' },
        cta_primary_url: { type: 'text', label: 'URL bouton principal' },
        cta_secondary: { type: 'text', label: 'Bouton secondaire' },
        cta_secondary_url: { type: 'text', label: 'URL bouton secondaire' },
        marquee: { type: 'list', label: 'Bandeau défilant', itemType: 'text' },
        faq_title: { type: 'text', label: 'Titre section FAQ' },
        // Home page fields
        h1_prefix: { type: 'text', label: 'H1 — préfixe' },
        h1_suffix: { type: 'text', label: 'H1 — suffixe' },
        rotating_words: { type: 'list', label: 'Mots rotatifs (H1)', itemType: 'text' },
        tools_eyebrow: { type: 'text', label: 'Outils — sur-titre' },
        tools_title: { type: 'text', label: 'Outils — titre' },
        tools_cta: { type: 'text', label: 'Outils — bouton CTA' },
        tools_cta_url: { type: 'text', label: 'Outils — URL CTA' },
        // Quiz page fields
        steps: {
          type: 'repeater',
          label: 'Étapes du quiz',
          fields: {
            id: { type: 'text', label: 'Identifiant', required: true },
            question: { type: 'text', label: 'Question', required: true },
            options: {
              type: 'repeater',
              label: 'Options',
              fields: {
                label: { type: 'text', label: 'Libellé', required: true },
                value: { type: 'text', label: 'Valeur', required: true },
                emoji: { type: 'text', label: 'Emoji (optionnel)' },
              },
            },
          },
        },
      },
    },
    settings: {
      label: 'Paramètres',
      path: 'content',
      format: 'yaml',
      singleton: true,
      slug: 'settings',
      fields: {
        siteName: { type: 'text', label: 'Nom du site', required: true },
        siteDescription: { type: 'textarea', label: 'Description' },
        siteUrl: { type: 'text', label: 'URL du site' },
        nav: {
          type: 'repeater',
          label: 'Navigation',
          fields: {
            label: { type: 'text', label: 'Libellé', required: true },
            url: { type: 'text', label: 'URL (vide si menu déroulant)' },
          },
        },
      },
    },
  },
  media: {
    path: 'public/images',
    allowedTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    maxSizeMB: 5,
  },
}
