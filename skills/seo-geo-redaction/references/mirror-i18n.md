# Miroir strict multi-langue — Référence technique

> Annexe au skill `seo-geo-redaction`. À lire dès que `niche.config.ts.locales.length >= 2`.

Quand un site supporte ≥ 2 langues, **tout est traduit dans toutes les locales**, sans exception. Cette règle est non-négociable et imposée dès le Bloc 0 d'`init-site`.

## Pourquoi miroir strict

Un miroir partiel (FR complet + EN à 40% par exemple) casse :
- **L'expérience utilisateur** — un visiteur EN qui clique sur un lien retombe en FR
- **Le SEO** — hreflang incomplet, Google indexe partiellement, signal de qualité dégradé
- **Le sélecteur de langue** — propose des liens vers des 404
- **La confiance** — un site qui se prétend bilingue mais ne l'est pas paraît amateur

Le coût d'un miroir partiel est supérieur au coût d'un miroir strict bien orchestré dès le départ.

## Périmètre du miroir

Tout fichier visible côté utilisateur final existe dans les N locales :

| Type | Convention de stockage |
|---|---|
| Articles blog | `content/blog/[locale]/[categorie]/[slug].mdx` (1 fichier par locale, slug peut différer par langue) |
| Pages utilitaires (À propos, mentions, FAQ, contact, politique cookies) | `content/pages/[name].yaml` + `content/pages/[name].[locale].yaml` |
| Composants UI (boutons, labels, micro-copy) | `messages/[locale].json` (next-intl) ou dictionnaire serveur `lib/i18n/dict/[locale].ts` |
| Métadonnées (titles, descriptions) | Dans le frontmatter MDX OU dans `messages/[locale].json` |
| Voix éditoriale | `content/ton-of-voice.md` (transposée) OU `content/ton-of-voice.[locale].md` (adaptée) selon Q0.3 init-site |
| Mots-clés | `content/mots-cles.md` (langue principale uniquement, traduction par article) |
| Concurrents | `content/concurrents.md` (langue principale uniquement) |
| FAQ de base | `content/faq-base.md` (langue principale, traduite par article) |

## Routing imposé (Next.js App Router)

```
app/
  [locale]/
    page.tsx              ← Homepage
    blog/
      page.tsx            ← Hub blog
      [categorie]/
        page.tsx          ← Hub catégorie
        [slug]/
          page.tsx        ← Article
    auteurs/
      [slug]/
        page.tsx          ← Page auteur
    [page-utilitaire]/
      page.tsx            ← À propos, mentions, etc.
```

Configuration `next-intl` (ou équivalent) :

```ts
// next.config.ts ou middleware.ts
import { createMiddleware } from 'next-intl/middleware'
import { niche } from './niche.config'

export default createMiddleware({
  locales: niche.locales,
  defaultLocale: niche.defaultLocale,
  localePrefix: niche.localePrefix ?? 'as-needed',
})
```

**Pourquoi `localePrefix: 'as-needed'`** : la locale par défaut a des URLs courtes (`/blog/article` au lieu de `/fr/blog/article`) → SEO optimal pour le marché principal. Les autres locales sont sous segment (`/en/blog/article`). hreflang clean, sitemap simple.

## Workflow de rédaction par article (miroir strict)

Un article = N fichiers MDX (un par locale). Workflow :

```
1. Brief + outline en langue principale (ex: FR)
2. Rédaction de l'article FR — voix, signaux GEO, FAQ
3. Génération images (cover + mid si applicable) — partagées entre locales
4. Traduction EN — voix transposée, FAQ traduite, sources adaptées au marché EN
5. Si Q0.2 inclut NL/DE/autre → traduire dans toutes les autres locales
6. Mise à jour mapping i18n des slugs (lib/i18n/article-slugs.ts — DÉJÀ présent dans le template)
7. Commit atomique : TOUS les fichiers MDX + mapping i18n en UN seul commit
```

**Règle d'or** : si le commit ne contient pas un fichier MDX par locale, abandonner. Mieux vaut un run skippé qu'un miroir cassé en prod.

## hreflang automatique — UNIQUEMENT les locales qui existent

Chaque page déclare ses variantes locales dans `<head>` via `<link rel="alternate" hreflang="...">`.

**Règle anti-404** : n'émettre une alternate `hreflang` QUE pour les locales où la traduction
**existe réellement** (fichier MDX présent / slug mappé). Un hreflang pointant vers une page
absente est un signal cassé pour Google. Pour un article, filtrer sur `articleSlugInOrNull(slug, defaultLocale, loc) != null` (ou l'existence du fichier).

Implémentation typique dans `generateMetadata()` :

```ts
import { niche } from '@/niche.config'

export async function generateMetadata({ params }) {
  const { locale, ...rest } = await params
  const path = buildPath(rest) // ex: /blog/aides-fiscalite/[slug]

  const languages: Record<string, string> = {}
  for (const loc of niche.locales) {
    // n'ajouter QUE si la version `loc` existe (sinon pas d'alternate)
    if (!translationExists(rest, loc)) continue
    languages[loc === niche.defaultLocale ? 'x-default' : loc] =
      loc === niche.defaultLocale ? path : `/${loc}${path}`
  }

  return {
    alternates: {
      canonical: locale === niche.defaultLocale ? path : `/${locale}${path}`,
      languages,
    },
  }
}
```

## Sitemap multi-langue

`app/sitemap.ts` doit produire une entrée par (URL × locale). Format simplifié :

```ts
import { niche } from '@/niche.config'

export default function sitemap() {
  const articles = getAllArticles() // tous les articles, toutes locales
  return articles.flatMap((article) =>
    niche.locales.map((loc) => ({
      url: `${baseUrl}${localePath(loc, article.path)}`,
      lastModified: article.updatedAt ?? article.publishedAt,
      alternates: {
        languages: Object.fromEntries(
          niche.locales.map((l) => [l, `${baseUrl}${localePath(l, article.path)}`])
        ),
      },
    }))
  )
}
```

## Schema.org `inLanguage` + Person `sameAs`

Dans le JSON-LD Article, déclarer la langue de la version courante :

```json
{
  "@type": "Article",
  "inLanguage": "fr-BE",  // ou "en-BE", "nl-BE", etc. selon market + locale
  "author": {
    "@type": "Person",
    "name": "...",
    "sameAs": ["https://linkedin.com/in/...", "https://twitter.com/..."]
  }
}
```

Le code langue suit le format BCP 47 : `{locale}-{market}`. Exemples : `fr-BE`, `en-BE`, `nl-BE`, `fr-CH`, `de-CH`.

## Sélecteur de langue — composant prêt, GARANTIE zéro-404

Le template embarque **déjà** le composant `components/layout/LangSwitcher.tsx` et le mapping
`lib/i18n/article-slugs.ts`. **NE PAS en regénérer un from scratch** à l'init — le câbler.

À l'init multilingue (`locales.length >= 2`), une seule chose à faire : insérer `<LangSwitcher />`
dans le header (`components/layout/Nav.tsx`). En mono-langue il rend `null` (aucun effet), donc il
peut même rester câblé en permanence.

Garanties du composant (à préserver si tu le modifies) :
- Liste les locales actives de `niche.config.ts.locales`, marque la locale active.
- Navigue vers l'URL équivalente dans la locale cible via `articleSlugInOrNull()`.
- **JAMAIS une 404** : si le slug d'article n'a pas de traduction connue → fallback sur l'accueil
  de la langue cible. Les pages à route fixe (blog, comparer, mentions…) font un simple swap de
  préfixe (elles existent dans toutes les locales grâce au miroir strict).
- Met à jour le cookie `NEXT_LOCALE`.

Le mapping `lib/i18n/article-slugs.ts` est la **source de vérité** du switcher : tant qu'un article
y est inscrit, le switcher pointe juste. S'il n'y est pas, le switcher dégrade proprement (accueil),
il ne casse pas. La règle reste de TOUJOURS inscrire chaque nouvel article dans le mapping.

## Mapping de slugs entre locales

Slug naturel par langue (recommandé SEO). Mapping bidirectionnel dans `lib/i18n/article-slugs.ts`
(présent dans le template, vide au départ) :

```ts
// lib/i18n/article-slugs.ts
export const articleSlugFrToEn: Record<string, string> = {
  'meilleure-voiture-electrique-2026': 'best-electric-car-2026',
  'comparatif-cartes-credit-belgique': 'belgium-credit-card-comparison',
  // ...
}
// articleSlugEnToFr est dérivé automatiquement.
// Helpers fournis : articleSlugInOrNull(slug, from, to) (→ null si non traduit, pour le fallback)
//                   translateArticleSlug(slug, from, to)  (→ même slug en dernier recours)
```

Utilisé par :
- Le sélecteur de langue (savoir où rediriger — sinon accueil, jamais 404)
- Les redirects (si un user tape un slug FR sur `/en/...`, rediriger vers le bon slug EN)
- hreflang (pointer vers les bonnes alternates, et seulement si elles existent)

## Anti-patterns à éviter

| Erreur | Conséquence | Fix |
|---|---|---|
| Publier l'article FR sans la version EN | Miroir cassé, hreflang vide en EN | Refuser le commit jusqu'à avoir les N versions |
| Slug identique dans toutes les locales | SEO pénalisé (Google détecte le duplicate URL pattern) | Slug naturel dans chaque langue + mapping |
| Oublier le mapping i18n dans `lib/i18n/article-slugs.ts` | Switcher dégradé (renvoie à l'accueil) + hreflang incomplet | Validation pre-commit : tout nouveau MDX apparaît dans le mapping |
| Regénérer un LangSwitcher maison à l'init | Risque de 404 réintroduit | Câbler le composant fourni `components/layout/LangSwitcher.tsx` |
| hreflang vers une traduction inexistante | Signal cassé pour Google | N'émettre l'alternate que si la version existe |
| Traduire les noms d'institutions belges (FSMA, BNB, SPF) | Confusion lecteur, perte d'autorité | Garder les acronymes officiels, ajouter une parenthèse explicative en EN |
| Mentions légales en FR uniquement | RGPD partiellement servi, expérience cassée | Mentions légales traduites dans toutes les locales |
| hreflang `x-default` oublié | Google ne sait pas quelle locale servir aux marchés ambigus | Toujours déclarer `x-default` pointant vers la locale par défaut |

## Coût opérationnel

Pour un site bilingue (FR + EN), le coût marginal du miroir strict :
- **Traduction** : 1 passe Claude par article (~2-3K tokens en sortie EN après le FR)
- **Vérification** : pas de re-fact-check des sources, juste relecture style
- **Cover/mid images** : partagées entre locales, 0 coût additionnel
- **Maintenance** : refresh d'un article = refresh des N versions en parallèle

Équivalent budget : ×1.5 vs mono-langue (pas ×2, parce que le brief, le SERP et les images sont mutualisés).

## Quand assouplir la règle

Jamais en production. Si pour une raison X la traduction d'une langue n'est pas faisable sur un article (ex : sources critiques uniquement en FR, sujet hyper-local sans pertinence pour le marché EN), il vaut mieux :
1. Ne pas publier l'article du tout sur le site
2. OU le restreindre à un sous-domaine `fr-only.*` séparé qui n'est pas multi-langue

Le mélange « article publié uniquement en FR sur un site bilingue » est interdit.

## Mise en pause exceptionnelle

Si le site doit temporairement opérer en mono-langue (pendant que l'équipe traduit le backlog), basculer `niche.config.ts.locales` à `['fr']` UNIQUEMENT et accepter que le site redevient mono-langue. Pas de double standard. Quand la traduction est prête, ré-étendre `locales` et publier toutes les traductions accumulées en une seule passe.
