---
name: configure-from-spec
version: 3.2.0
description: Configure un nouveau site fork-é depuis emd-template À PARTIR D'UN FICHIER SPEC pré-rempli par le wizard nano-mentionbox. Lit `init-spec.md`, analyse les exports Semrush dans `semrush-exports/`, écrit `niche.config.ts` + tous les `content/*` (en miroir si N langues), PUIS sélectionne la DA via le SYSTÈME DE VARIANTES (full-auto : suggestVariants + override thématique → niche.config.layouts + permutations + palette) et build directement. À utiliser SEULEMENT quand un init-spec.md fraîchement poussé par le wizard est présent à la racine et que l'utilisateur dit « configure le site depuis init-spec.md », « configure depuis la spec », « init from spec », « lance la configuration », « setup le repo ». Ne JAMAIS utiliser pour un site déjà configuré (niche.config.ts.market défini → init-site pour amender). Ne JAMAIS proposer si init-spec.md n'existe pas — proposer init-site.
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

# configure-from-spec v3.2 — Configurer un site depuis un init-spec.md du wizard

> **v3.2** : la DA passe par le **SYSTÈME DE VARIANTES en full-auto** (étape 12). Fini le « mix V1-V4
> à la main + mutation dans volteo.css » : on **sélectionne** une variante (`layouts`) + des
> **permutations** (`shape`/`border`/`shadow`) + une **palette**, on les **écrit dans `niche.config`**,
> on **dépublie les previews**, et on build — **sans phase de validation**. Cf. `docs/AUTO-DESIGN.md`.
> Le seed reste **bilingue dès le provisioning** si `locales` ≥ 2 (étape 13).

## Pré-requis (seuls points d'arrêt « bloqueur »)
1. **`init-spec.md` existe** à la racine. Sinon → proposer `init-site`.
2. **MCP nano-mentionbox dispo** — sinon STOP (les images du BUILD ne tourneront pas).
3. **Champs critiques** : Bloc 0 (marché+langues), Bloc 1 (voix), Bloc 6 (mentions, email contact). Sinon STOP.
4. **`niche.config.ts.market` vide** (sinon site déjà configuré → STOP).

En dehors de ces 4 points, ne pas s'interrompre : la spec fait foi. **Pas de validation de design** (full-auto).

---

## Étape 1 — Parser `init-spec.md`
Sections YAML : `## Identité`, `## Bloc 0..7`, `## Design` (`archetype`, `skin`, `vertical`, `brandColor`). Détecter les « 🤖 Mode AUTO ».

## Étape 2 — Validation sémantique
`market` valide · `locales[0]===defaultLocale` · `localePrefix as-needed`⇒N≥2 · email contact (STOP si absent) · slug auteur kebab-case.

## Étape 3 — Analyser Semrush (`semrush-exports/*.csv`)
Agréger/dédoublonner · classer l'intent · clusteriser (5-10) · dériver l'arborescence (`niche.config.ts.categories` TOUJOURS depuis les clusters).

## Étapes 4–11 — Écrire la config + le contenu
`niche.config.ts` · `mots-cles.md` · `calendrier-edito.md` (50 articles) · `ton-of-voice.md` ·
`personas.md` (auto) · `concurrents.md` · `faq-base.md` · `pages/mentions-legales.yaml` (+ locales) ·
`docs/AUTHOR-[slug].md` (si Bloc 7).

---

## Étape 12 — DA via le SYSTÈME DE VARIANTES (full-auto, AUCUNE validation)

`ls -la design-incoming/` :
- **non vide** → `integrate-claude-design`.
- **vide** → dérouler `docs/AUTO-DESIGN.md` (procédure full-auto) :
  1. **Variante** : `suggestVariants(niche.domain)` (`lib/variants.ts`) + **override thématique** →
     écrire `niche.config.layouts.home` (magazine/comparateur/marche/fil) + `layouts.category`
     (classic/editorial) + `niche.style.hero` cohérent. (`marche` seulement si classements générés.)
  2. **Permutations** : depuis `suggestVariants` → écrire `niche.config.permutations`
     (`shape`/`border`/`shadow`). (Appliquées par `PermutationStyle`, rien en CSS.)
  3. **Palette & fonts** : depuis `## Design` (`brandColor`/`skin`) sinon **preset** déterministe
     (`docs/DA-PRESETS.md`, par thématique + seed) → écrire **`niche.config.palette`** PUIS propager
     dans **`app/globals.css :root`** (+ `@theme`) + **fonts** dans **`app/layout.tsx`**.
     **JAMAIS** de valeur dans `app/styles/volteo.css :root` (alias only). PAS de `niche.config.palette`
     ignorée au profit de volteo.css.
  4. **Dépublier les previews** non retenues : supprimer `/home-vN`, `/cat-vN`, `/art-v1` (+ `/en/...`).

⚠️ `niche.config.ts.categories` (clusters Semrush) ne doit PAS être écrasé.

---

## Étape 13 — BUILD

1. **Arborescence + contenu d'amorçage réel** (sourcé) : catégories browsables, 1-2 articles seed.
   **Seed BILINGUE si `locales` ≥ 2** : chaque seed en FR **et** dans chaque autre langue (miroir strict,
   `content/blog/[locale]/[categorie]/[slug].mdx`), **+ paire dans `lib/i18n/article-slugs.ts`**. Sinon
   `/en` vide + `LangSwitch` 404 = **échec d'init**. Modèle : `article-modele.mdx` ↔ `en/article-model.mdx`.
   Si `locales` = 1 → un seul fichier, pas d'arbre `/en`.
2. **Images — plafond strict** : **≤ ~5** (hero home + couverture hub). **JAMAIS** par catégorie/article.
   Cf. `docs/IMAGES-WORKFLOW.md` (1 cover généré + 2 in-content réutilisées par article à la rédaction).
3. **Tâche de rédaction quotidienne** : créer selon `docs/SCHEDULED-TASK-REDACTION.md`
   (TaskId `[repoName]-article-daily`, cron du Bloc 3, `0 8 * * *` défaut).

## Étape 14 — PROGRESS.md + DECISIONS.md (variante + permutations + palette retenues ; previews dépubliées ; images ; corrections).
## Étape 15 — Commit atomique (Conventional Commits anglais).
## Étape 16 — Récap utilisateur (marché/locales/clusters/variante+permutations+palette/images ≤5/tâche/repo).

---

## Règles strictes
- **NE JAMAIS exécuter** sans `init-spec.md` · **NE JAMAIS écraser** un `niche.config.ts` rempli.
- **DA = système de variantes** : `niche.config.layouts` + `permutations` + `palette` DOIVENT être écrits.
  Un site qui sort sans `layouts` (fallback magazine non choisi) = la sélection auto n'a pas tourné = bug.
- **Tokens = `niche.config.palette` → `app/globals.css`** + fonts dans `app/layout.tsx`. **Rien dans `volteo.css :root`.**
- **Dépublier les previews** (`/home-vN`, `/cat-vN`, `/art-v1` + `/en`) une fois la variante choisie.
- **Seed bilingue dès N≥2** : jamais FR-only ; le multilingue n'est pas reporté. Miroir strict + mapping i18n.
- **Plafond images** au BUILD : ≤ ~5, jamais par catégorie/article.
- Zéro question (la spec fait foi, DA full-auto) · commit atomique · categories depuis Semrush.

## Lien avec les autres skills / docs
`nouveau-site` · `init-site` (sans spec) · `integrate-claude-design` · `docs/AUTO-DESIGN.md` ·
`lib/variants.ts` · `components/layout/PermutationStyle.tsx` · `docs/DA-PRESETS.md` · `docs/IMAGES-WORKFLOW.md` ·
`docs/SCHEDULED-TASK-REDACTION.md` · `seo-geo-redaction` + `ton-of-voice` + `humaniser-fr`.
