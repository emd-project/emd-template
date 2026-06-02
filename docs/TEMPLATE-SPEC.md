# TEMPLATE-SPEC — Architecture du moteur emd-template

Vue d'ensemble de l'architecture actuelle. Le template est un **moteur de sites éditoriaux
multi-niches** : un seul jeu de composants, piloté par `niche.config.ts`, décliné en plusieurs
archétypes et directions artistiques.

## Principe

Un nouveau site = un fork du template + un `niche.config.ts` rempli (+ contenu). **Aucun composant
n'est dupliqué par site** : tout lit `niche.config.ts`. Deux sites diffèrent par leur config
(palette, fonts, archétype, catégories, voix), pas par leur code.

## Fichier maître : `niche.config.ts`

Seul fichier obligatoire à remplir. Contient : identité (siteName, domain, tagline), vocabulaire de
niche, hero, catégories (1 accent par catégorie), outils (quiz/comparateur/simulateur), **style**
(`mode` clair/sombre, `hero`, `effects`, `cards`, `homeSections`), **palette** + **fonts**, auteur,
signature DA, affiliation, et le **bloc i18n** (`market`, `locales`, `defaultLocale`, `localePrefix`).

Aucune couleur / font / nom / tagline en dur dans le JSX — tout passe par ce fichier.

## Bootstrap d'un site

1. **Wizard nano-mentionbox** (« Créer EMD ») → pousse `init-spec.md` (+ exports Semrush, + design).
2. **`configure-from-spec`** écrit `niche.config.ts` + `content/*` + calendrier + crée la tâche quotidienne.
3. **Design** : zip Claude Design → `integrate-claude-design` ; sinon → `docs/AUTO-DESIGN.md`
   (composition depuis `lib/da-presets/`).
4. **Images** : génération des slots structurels (`lib/image-slots.ts`) — cf. `docs/IMAGES-WORKFLOW.md`.

Alternative sans wizard : skill `init-site` (interview par blocs).

## Archétypes

`niche.config.ts.homeSections` + `style.hero` définissent l'archétype :
- **comparateur** : hero `split` (visuel produit), sections outils + catégories + offres.
- **magazine / blog** : hero éditorial, home menée par l'article à la une (`RecentArticles`) + grilles.
- **hybride** : mix.

## Direction artistique

- `lib/da-presets/` : 161 palettes, 72 paires de fonts, 75 styles UI, 161 règles par niche (`composePreset`).
- `docs/design-reference/` : maquettes de référence (barres qualité) par archétype.
- `docs/AUTO-DESIGN.md` : procédure de composition quand aucun design n'est fourni.
- Mode clair/sombre : `niche.style.mode` + `ThemeToggle` + `@media (prefers-color-scheme)`.

## Images (V2)

Vraies images partout (fini le « no image »). Registre `lib/image-slots.ts` (prompt par slot),
moteurs Gemini→Flux (`lib/image-generation.ts`, CMS) et nano-mentionbox (init + tâches).
Détail : `docs/IMAGES-WORKFLOW.md`. `components/ui/ImagePlaceholder` rend la vraie image si présente.

## i18n

FR par défaut. Si `locales.length >= 2` : routing `app/[locale]/...`, middleware, **miroir strict**
(tout traduit), `LangSwitcher` **zéro-404** (`components/layout/LangSwitcher.tsx` + `lib/i18n/article-slugs.ts`),
hreflang vers les seules traductions existantes. Cf. `skills/seo-geo-redaction/references/mirror-i18n.md`.

## Contenu (rédaction)

Tâche quotidienne selon `docs/SCHEDULED-TASK-REDACTION.md` : SERP analysis obligatoire, GEO 2026
(Answer-Explanation-Example, signaux d'Expérience), images cover/mid, miroir i18n, année dynamique
(`currentYear()`). Skills : `seo-geo-redaction`, `ton-of-voice`, `humaniser-fr`.

## Ce qu'on ne duplique pas entre sites

`packages/cms/` · `app/admin/` · `app/api/cms/` · `components/blog/` · `components/ui/` · `lib/` —
identiques d'un site à l'autre. Seuls `niche.config.ts` + `content/` + les images changent.

## SEO

`title.template: '%s'` (les pages s'auto-brandent — pas de double nom de site). Année dynamique.
JSON-LD complet. Canonicals + hreflang. Sitemap + robots.
