---
name: configure-from-spec
version: 3.0.0
description: Configure un nouveau site fork-é depuis emd-template À PARTIR D'UN FICHIER SPEC pré-rempli par le wizard nano-mentionbox. Lit `init-spec.md`, analyse les exports Semrush dans `semrush-exports/`, écrit `niche.config.ts` + tous les `content/*` (en miroir si N langues), PUIS compose un design Voltéo UNIQUE (type de home + mixage des variantes + tokens mutés dans app/styles/volteo.css) et le montre en PREVIEW minimal (home + 1 hub + 1 article, placeholders, zéro image) pour validation AVANT de bâtir. Après validation : build complet + images plafonnées (≤5) + tâche de rédaction. À utiliser SEULEMENT quand un init-spec.md fraîchement poussé par le wizard est présent à la racine et que l'utilisateur dit « configure le site depuis init-spec.md », « configure depuis la spec », « init from spec », « lance la configuration », « setup le repo ». Ne JAMAIS utiliser pour un site déjà configuré (niche.config.ts.market défini → init-site pour amender). Ne JAMAIS proposer si init-spec.md n'existe pas — proposer init-site.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - WebSearch
  - mcp__nano-mentionbox__generate_image
  - mcp__nano-mentionbox__wait_for_image
  - mcp__nano-mentionbox__github_push_images
---

# configure-from-spec v3.0 — Configurer un site depuis un init-spec.md du wizard

> **Changement v2.x → v3.0** : le design passe par une **PHASE PREVIEW** — Claude compose un design
> Voltéo **unique** (type de home + **mixage** des variantes + **tokens mutés** dans
> `app/styles/volteo.css`) et bâtit un **preview minimal** (home + 1 hub + 1 article, **placeholders,
> zéro image**) → **STOP, validation utilisateur** → puis **BUILD** (arborescence + images **plafonnées
> ≤ 5**, jamais par catégorie/article + tâche de rédaction). Le wizard reste « zéro question » côté
> éditorial, mais s'arrête **une fois** pour valider le **design**. Cf. `docs/AUTO-DESIGN.md` +
> `docs/design-reference/volteo/DESIGN-NOTES.md`.

## Pré-requis (seuls points d'arrêt « bloqueur »)
1. **`init-spec.md` existe** à la racine. Sinon → proposer `init-site`.
2. **MCP nano-mentionbox dispo** — sinon STOP (les images du BUILD ne tourneront pas ; la PREVIEW, elle, n'en génère aucune).
3. **Champs critiques** : Bloc 0 (marché+langues), Bloc 1 (voix), Bloc 6 (mentions, email contact). Sinon STOP.
4. **`niche.config.ts.market` vide** (sinon site déjà configuré → STOP).

En dehors de ces 4 points + **la validation du design (preview)**, ne pas s'interrompre : la spec fait foi.

---

## Étape 1 — Parser `init-spec.md`
Sections YAML : `## Identité`, `## Bloc 0..7`, `## Design` (`archetype`, `skin`, `vertical`, `brandColor`). Détecter les « 🤖 Mode AUTO ».

## Étape 2 — Validation sémantique
`market` valide · `locales[0]===defaultLocale` · `localePrefix as-needed`⇒N≥2 · email contact (STOP si absent) · slug auteur kebab-case. Corrections mineures silencieuses (notées dans PROGRESS).

## Étape 3 — Analyser Semrush (`semrush-exports/*.csv`)
Agréger/dédoublonner · classer l'intent · clusteriser (5-10) · dériver l'arborescence (`niche.config.ts.categories` TOUJOURS depuis les clusters).

## Étapes 4–11 — Écrire la config + le contenu
`niche.config.ts` · `mots-cles.md` · `calendrier-edito.md` (50 articles priorisés) · `ton-of-voice.md` ·
`personas.md` (auto) · `concurrents.md` · `faq-base.md` · `pages/mentions-legales.yaml` (+ locales) ·
`docs/AUTHOR-[slug].md` (si Bloc 7). (Écriture de fichiers — pas de génération lourde ici.)

---

## Étape 12 — Design PREVIEW (assemblage Voltéo) — STOP POUR VALIDATION

`ls -la design-incoming/` :
- **non vide** → `integrate-claude-design`.
- **vide** → `docs/AUTO-DESIGN.md` (Phase 1). Lire le bloc `## Design` (`archetype`, `skin`, `vertical`, `brandColor`) puis :
  1. **Type de home** depuis `archetype` (comparateur/magazine/portail) → `niche.style.hero`.
  2. **Mixage des variantes** : étudier `docs/design-reference/volteo/*-V1..V4` + `marche`/`fil`/`portail`,
     **puiser et recombiner** (jamais copier une variante).
  3. **Tokens** : appliquer + **muter** le `skin` (DESIGN-NOTES §2) dans **`app/styles/volteo.css :root`**
     + **fonts** dans **`app/layout.tsx`**. (Si `skin`/`vertical` = `auto` → déduire de la niche.)
     **PAS** `niche.config.palette` ni `globals.css --accent-1`.
  4. **Preview minimal** : home + **1** hub/catégorie + **1** article, en **contenu bouchon** + **images
     placeholder** — **ZÉRO génération d'images** (1 hero max).
  5. **STOP.** Annoncer type de home + mix + tokens, **montrer le preview, ATTENDRE la validation.**

⚠️ `niche.config.ts.categories` (clusters Semrush) ne doit PAS être écrasé par le design.
**INTERDIT en preview** : arborescence complète, images en masse, tous les articles, tâche de rédaction.

---

## Étape 13 — BUILD (UNIQUEMENT après validation du design)

1. **Arborescence + contenu d'amorçage réel** (sourcé) : catégories browsables, 1-2 articles seed.
2. **Images — plafond strict** : **≤ ~5** (hero home + couverture hub). **JAMAIS** par catégorie/article.
   Reste à la demande / tâche de rédaction. Cf. `docs/IMAGES-WORKFLOW.md`. WebP → `public/images/`.
3. **Tâche de rédaction quotidienne** (la spec vaut consentement) : créer selon
   `docs/SCHEDULED-TASK-REDACTION.md` (TaskId `[repoName]-article-daily`, cron du Bloc 3, `0 8 * * *` défaut).

## Étape 14 — PROGRESS.md + DECISIONS.md (design retenu : type, mix, tokens, mutations ; images ; corrections).
## Étape 15 — Commit atomique (Conventional Commits anglais).
## Étape 16 — Récap utilisateur (marché/locales/clusters/categories/design validé/images ≤5/tâche/repo).

---

## Règles strictes
- **NE JAMAIS exécuter** sans `init-spec.md` · **NE JAMAIS écraser** un `niche.config.ts` rempli.
- **PREVIEW avant BUILD** : design montré en placeholders (home + 1 hub + 1 article, **zéro image**),
  **validation obligatoire** avant tout build. « Build tout + images en masse » avant validation = **échec d'init**.
- **Plafond images** au BUILD : ≤ ~5, jamais par catégorie/article.
- **Tokens** dans `app/styles/volteo.css` + fonts dans `app/layout.tsx`. Unicité par **assemblage**, jamais un clone de variante.
- Zéro question côté éditorial (la spec fait foi) **sauf** la validation du design · commit atomique · miroir strict si N≥2 · categories depuis Semrush.

## Lien avec les autres skills / docs
`nouveau-site` · `init-site` (sans spec) · `integrate-claude-design` (étape 12 cas A) · `docs/AUTO-DESIGN.md` ·
`docs/design-reference/volteo/DESIGN-NOTES.md` · `docs/IMAGES-WORKFLOW.md` · `docs/SCHEDULED-TASK-REDACTION.md` ·
`seo-geo-redaction` + `ton-of-voice` + `humaniser-fr`.
