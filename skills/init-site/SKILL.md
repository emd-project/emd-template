---
name: init-site
version: 4.2.0
description: Bootstrap d'un nouveau site forké du template emd-template, SANS init-spec wizard (interview en chat). Lance UN interview groupé par blocs (Bloc 0 marché+langues d'abord, puis voix, mots-clés, calendrier, concurrents, FAQ, mentions, auteur), écrit niche.config.ts + tous les content/*, PUIS sélectionne la DA via le SYSTÈME DE VARIANTES (full-auto : suggestVariants + override thématique → niche.config.layouts + permutations + palette) et build directement. À utiliser une fois après "Use this template" quand il n'y a PAS d'init-spec.md. Triggers — « initialise ce site », « configure ce site », « setup le site », « bootstrap le site », « init-site », « lance la conf ». Trigger implicite — première rédaction sur un site visiblement non configuré (niche.config.ts.market vide ou content/ avec TODO). Le routeur nouveau-site appelle ce skill quand aucun init-spec.md n'est présent.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebSearch
  - mcp__nano-mentionbox__generate_image
  - mcp__nano-mentionbox__wait_for_image
  - mcp__nano-mentionbox__github_push_images
---

# init-site v4.2 — Bootstrap d'un nouveau site forké (interview + DA full-auto)

Remplit la config éditoriale (interview groupé), **puis** sélectionne la DA via le **système de
variantes en full-auto** et build. Voltéo est le **moteur** : on **sélectionne** des variantes, on ne
recopie/mixe rien à la main.

> **v4.2** : la DA passe par le système de variantes (étape 8) — `suggestVariants` + override thématique
> → `niche.config.layouts` + `permutations` + `palette`, dépublication des previews, **sans phase de
> validation**. Tokens = `niche.config.palette` → `globals.css` (jamais `volteo.css`). Seed **bilingue**
> si `locales` ≥ 2. Cf. `docs/AUTO-DESIGN.md`.

## Pré-requis (au démarrage)
**MCP nano-mentionbox disponible** (`mcp__nano-mentionbox__generate_image`). Si absent → prévenir : les
images de la phase BUILD ne pourront pas tourner.

## Étape 0 — Audit de l'état actuel
Lire l'état des fichiers-cibles (`niche.config.ts`, `content/*`, `docs/AUTHOR-*`). Annoncer le bilan.
Si tout est rempli + DA écrite → sortir.

---

## Bloc 0 — Langues et marché géo (OBLIGATOIRE EN PREMIER)
Pilote routing/i18n/hreflang/OG/devise/régulateur.
- **Q0.1 Pays** → `market`. **Q0.2 Langues** (ordre = priorité) → `locales[]` + `defaultLocale: 'fr'`.
- **Q0.3 (si N≥2) Voix par langue** : unique transposée (reco) ou par locale.
Conséquences : 1 langue → pas d'arbre `/en` ; N≥2 → `app/en/...` + miroir strict.

## Étape 1 — Voix (→ ton-of-voice.md) · délègue à `ton-of-voice`.
## Étape 2 — Mots-clés (→ mots-cles.md) · Semrush si fourni, sinon mini-interview.
## Étape 3 — Calendrier (→ calendrier-edito.md).
## Étape 4 — Concurrents (→ concurrents.md).
## Étape 5 — FAQ base (→ faq-base.md).
## Étape 6 — Mentions légales (→ pages/mentions-legales.yaml) · email contact obligatoire.
## Étape 7 — Auteur (→ docs/AUTHOR-[slug].md) si nom propre.
## Étape 7bis — Personas (→ personas.md, AUTO-DÉRIVÉ).

---

## Étape 8 — DA via le SYSTÈME DE VARIANTES (full-auto, AUCUNE validation)

Si `design-incoming/` contient un livrable Claude Design → `integrate-claude-design`. Sinon, dérouler
`docs/AUTO-DESIGN.md` (full-auto) :

1. **Variante** : `suggestVariants(niche.domain)` (`lib/variants.ts`) + **override thématique** selon
   l'intent dominant des clusters → écrire `niche.config.layouts.home` (magazine/comparateur/marche/fil)
   + `layouts.category` (classic/editorial) + `niche.style.hero` cohérent. (`marche` si classements générés.)
2. **Permutations** : depuis `suggestVariants` → écrire `niche.config.permutations` (`shape`/`border`/`shadow`).
3. **Palette & fonts** : preset déterministe (`docs/DA-PRESETS.md`, par thématique + seed domaine, ou
   `brandColor` si fourni) → écrire **`niche.config.palette`** PUIS propager dans **`app/globals.css :root`**
   (+ `@theme`) + **fonts** dans **`app/layout.tsx`**. **JAMAIS** dans `app/styles/volteo.css :root` (alias only).
4. **Dépublier les previews** non retenues : supprimer `/home-vN`, `/cat-vN`, `/art-v1` (+ `/en/...`).
5. **Annoncer** (sans s'arrêter) : variante + permutations + palette retenues, puis enchaîner le BUILD.

---

## Étape 9 — BUILD

1. **Arborescence + contenu d'amorçage réel** (sourcé) : pages, catégories browsables, 1-2 articles seed.
   **Seed BILINGUE si `locales` ≥ 2** : chaque seed en FR **et** dans chaque autre langue (miroir strict)
   **+ paire dans `lib/i18n/article-slugs.ts`**. Sinon `/en` vide + `LangSwitch` 404 = **échec d'init**.
   Modèle : `content/blog/guides/article-modele.mdx` ↔ `content/blog/en/guides/article-model.mdx`.
   Si `locales` = 1 → un seul fichier.
2. **Images — plafond strict** : **≤ ~5** (hero home + couverture hub). **JAMAIS** par catégorie/article.
   Cf. `docs/IMAGES-WORKFLOW.md`. `mcp__nano-mentionbox__generate_image` → WebP → `public/images/`.
3. **Tâche de rédaction quotidienne** : **demander confirmation** (effet de bord global), puis créer
   selon `docs/SCHEDULED-TASK-REDACTION.md` (TaskId `[repoName]-article-daily`, cron du Bloc 3, `0 8 * * *`).

---

## Étape 10 — Récapitulatif final
```
Init terminé.
- Config : niche.config.ts + content/* (voix, mots-cles, personas, calendrier, concurrents, faq, légal, auteur)
- DA (auto) : home=[x] · category=[x] · shape/border/shadow=[..] · palette=[preset] (→ globals.css)
- Previews dépubliées · Build : arborescence + seed (bilingue si N≥2) · images ≤5 · tâche [si confirmée]
Routing : [..] · Miroir strict : [oui/non] · Marché : [x] · Locales : [..]
```

## Règles strictes
- **Bloc 0 en PREMIER**.
- **DA = système de variantes** (full-auto) : `niche.config.layouts` + `permutations` + `palette` écrits.
  Pas de « skin posé sans variante choisie » : un site sans `layouts` = sélection auto non faite = bug.
- **Tokens = `niche.config.palette` → `app/globals.css`** + fonts `app/layout.tsx`. **Rien dans `volteo.css :root`.**
- **Dépublier les previews** une fois la variante choisie.
- **Seed bilingue dès N≥2** : jamais FR-only (routes `/en` vides = échec). Miroir strict + mapping i18n.
- **Plafond images** : ≤ ~5, jamais par catégorie/article.
- **NE JAMAIS inventer** une réponse → `TODO`.

## Lien avec les autres skills / docs
`nouveau-site` (routeur) · `configure-from-spec` (avec spec) · `docs/AUTO-DESIGN.md` · `lib/variants.ts` ·
`components/layout/PermutationStyle.tsx` · `docs/DA-PRESETS.md` · `docs/IMAGES-WORKFLOW.md` ·
`docs/SCHEDULED-TASK-REDACTION.md` · `ton-of-voice` + `seo-geo-redaction` + `humaniser-fr`.
