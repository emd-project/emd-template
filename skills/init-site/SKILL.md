---
name: init-site
version: 4.1.0
description: Bootstrap d'un nouveau site forké du template emd-template, SANS init-spec wizard (interview en chat). Lance UN interview groupé par blocs (Bloc 0 marché+langues d'abord, puis voix, mots-clés, calendrier, concurrents, FAQ, mentions, auteur), écrit niche.config.ts + tous les content/*, PUIS compose un design Voltéo UNIQUE (type de home + mixage des variantes + tokens mutés) et le montre en PREVIEW minimal (home + 1 hub + 1 article, placeholders, zéro image) pour validation AVANT de bâtir. Après validation : build complet + images plafonnées (≤5) + tâche de rédaction. À utiliser une fois après "Use this template" quand il n'y a PAS d'init-spec.md. Triggers — « initialise ce site », « configure ce site », « setup le site », « bootstrap le site », « init-site », « lance la conf ». Trigger implicite — première rédaction sur un site visiblement non configuré (niche.config.ts.market vide ou content/ avec TODO). Le routeur nouveau-site appelle ce skill quand aucun init-spec.md n'est présent.
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

# init-site v4 — Bootstrap d'un nouveau site forké (interview + preview design)

Remplit la config éditoriale, **puis** compose un design **unique** et le **montre en preview** pour
validation **avant** de tout bâtir. Voltéo est le **défaut du moteur** : on **réutilise les composants**,
on ne recopie rien.

> **Nouveau en v4** : le design passe par une **PHASE PREVIEW** (home + 1 hub + 1 article, en
> placeholders, **zéro image générée**) → **STOP, validation utilisateur** → puis **BUILD** (images
> plafonnées ≤ 5, jamais par catégorie/article). On ne part **jamais** en « build tout + génère toutes
> les images » avant validation. Cf. `docs/AUTO-DESIGN.md` + `docs/design-reference/volteo/DESIGN-NOTES.md`.
>
> **Nouveau en v4.1** : le **seed est bilingue dès l'init** si `locales` ≥ 2 (cf. étape 9). Un arbre
> `/en` promis mais vide = échec d'init.

## Pré-requis (au démarrage)
**MCP nano-mentionbox disponible** (`mcp__nano-mentionbox__generate_image`). Si absent → prévenir : les
images de la phase BUILD ne pourront pas tourner. La phase PREVIEW, elle, ne génère **aucune** image (placeholders).

## Étape 0 — Audit de l'état actuel
Lire l'état de chaque fichier-cible (`niche.config.ts` market/locales, `content/ton-of-voice.md`,
`mots-cles.md`, `personas.md`, `calendrier-edito.md`, `concurrents.md`, `faq-base.md`,
`pages/mentions-legales.yaml`, `niche.style/palette/signature`, `docs/AUTHOR-*`). Annoncer le bilan.
Si tout est rempli + design validé → sortir.

---

## Bloc 0 — Langues et marché géo (OBLIGATOIRE EN PREMIER)
Pilote routing/i18n/hreflang/OG/devise/régulateur.
- **Q0.1 Pays** → `market` (BE/FR/CA/CH/autre, avec OG locale + régulateur).
- **Q0.2 Langues** (ordre = priorité) → `locales[]` + `defaultLocale: 'fr'`.
- **Q0.3 (si N≥2) Voix par langue** : unique transposée (reco) ou par locale.
Conséquences auto : 1 langue → `app/page.tsx` ; N≥2 → `app/[locale]/...` + `next-intl` + miroir strict
(cf. `skills/seo-geo-redaction/references/mirror-i18n.md`). Écrire `niche.config.ts` (Bloc 0) et enchaîner.

## Étape 1 — Voix (→ ton-of-voice.md) · délègue à `ton-of-voice` (8 questions), miroir Bloc 0.
## Étape 2 — Mots-clés (→ mots-cles.md) · Semrush si fourni, sinon mini-interview (6 q). Clusters head/longue traîne/quick wins/à éviter.
## Étape 3 — Calendrier (→ calendrier-edito.md) · cadence + formats + saisonnalité (× locales).
## Étape 4 — Concurrents (→ concurrents.md).
## Étape 5 — FAQ base (→ faq-base.md) · PAA des head terms.
## Étape 6 — Mentions légales (→ pages/mentions-legales.yaml) · email contact obligatoire.
## Étape 7 — Auteur (→ docs/AUTHOR-[slug].md) si nom propre.
## Étape 7bis — Personas (→ personas.md, AUTO-DÉRIVÉ, sans question).

---

## Étape 8 — Design PREVIEW (assemblage Voltéo) — STOP POUR VALIDATION

Exécuter **`docs/AUTO-DESIGN.md` (Phase 1)**. Si `design-incoming/` contient un livrable Claude Design →
`integrate-claude-design`. Sinon :

1. **Type de home** selon l'intent dominant des clusters : comparateur (transactionnel) / magazine
   (informationnel, défaut) / portail → écrire `niche.style.hero` (`split`=comparateur ; `centered`/`minimal`=magazine).
2. **Mixage des variantes** : étudier `docs/design-reference/volteo/*-V1..V4` + `marche`/`fil`/`portail`,
   **puiser et recombiner** des traitements (hero, ordre des sections, anims) — **jamais copier** une variante.
3. **Tokens** : appliquer + **muter** un skin (DESIGN-NOTES §2) dans **`app/styles/volteo.css :root`**
   (`--cream/--ink/--primary/--cat-1..5/--r`…) + les **fonts** dans **`app/layout.tsx`** (next/font).
   **PAS** `niche.config.palette` ni `globals.css --accent-1`.
4. **Construire le MINIMUM pour VOIR** : **la home** + **UN** hub/catégorie + **UN** article, en
   **contenu bouchon** + **images placeholder** (`.ph`/`ImagePlaceholder`) — **ZÉRO génération d'images** (1 hero max).
5. **STOP.** Annoncer : type de home (et pourquoi), variantes mixées + ce qui a été recombiné,
   tokens/mutations. **Montrer le preview et ATTENDRE la validation.**

**INTERDIT en preview** : bâtir toute l'arborescence, générer toutes les images, écrire tous les
articles, créer la tâche de rédaction. On valide la **direction visuelle** d'abord.

---

## Étape 9 — BUILD (UNIQUEMENT après validation du design)

Une fois l'utilisateur OK sur le design :
1. **Arborescence + contenu d'amorçage réel** (sourcé) : pages, catégories browsables, 1-2 articles seed.
   **Seed BILINGUE si `locales` ≥ 2** : chaque article seed est écrit en FR **et** dans chaque autre
   langue (miroir strict, `content/blog/[locale]/[categorie]/[slug].mdx`), **avec la paire ajoutée à
   `lib/i18n/article-slugs.ts`**. Sinon `/en` vide + `LangSwitch` 404 + hreflang manquant = **échec d'init**.
   Modèle de référence : `content/blog/guides/article-modele.mdx` ↔ `content/blog/en/guides/article-model.mdx`.
   Si `locales` = 1 → un seul fichier, pas d'arbre `/en`.
2. **Images — plafond strict** : **≤ ~5** (hero home + couverture hub `/blog`). **JAMAIS** une image par
   catégorie ni par article. Le reste **à la demande** ou via la **tâche de rédaction**. Cf. `docs/IMAGES-WORKFLOW.md`.
   `mcp__nano-mentionbox__generate_image` → WebP → `public/images/`.
3. **Tâche de rédaction quotidienne** : **demander confirmation** (effet de bord global), puis créer
   selon `docs/SCHEDULED-TASK-REDACTION.md` (TaskId `[repoName]-article-daily`, cron du Bloc 3, `0 8 * * *` défaut).

---

## Étape 10 — Récapitulatif final
```
Init terminé.
- Config : niche.config.ts + content/* (voix, mots-cles, personas, calendrier, concurrents, faq, légal, auteur)
- Design VALIDÉ : type de home [x] · variantes mixées [..] · tokens (volteo.css) mutés
- Build : arborescence + contenu seed (bilingue si N≥2) · images ≤5 (hero + cover hub) · tâche de rédaction [si confirmée]
Routing : [..] · Miroir strict : [oui/non] · Marché : [x] · Locales : [..]
Prochaines étapes : pnpm dev · déploiement Vercel
```

## Règles strictes
- **Bloc 0 en PREMIER**.
- **PREVIEW avant BUILD** : design montré en placeholders (home + 1 hub + 1 article, **zéro image**),
  **validation obligatoire** avant tout build. Partir en « build tout + images en masse » avant validation = **échec d'init**.
- **Seed bilingue dès N≥2** : un site bilingue ne sort JAMAIS de l'init en FR-only (routes `/en` vides = échec).
  Le multilingue n'est **pas** reporté à plus tard — seed + mapping i18n faits **maintenant**.
- **Plafond images** au BUILD : ≤ ~5, jamais par catégorie/article.
- **Tokens** dans `app/styles/volteo.css` + fonts dans `app/layout.tsx`. Unicité par **assemblage** (type + mix + mutation), jamais un clone de variante.
- **NE JAMAIS inventer** une réponse → `TODO`. **Miroir strict** dès N≥2.

## Lien avec les autres skills / docs
`nouveau-site` (routeur) · `configure-from-spec` (avec spec) · `docs/AUTO-DESIGN.md` ·
`docs/design-reference/volteo/DESIGN-NOTES.md` · `docs/IMAGES-WORKFLOW.md` · `docs/SCHEDULED-TASK-REDACTION.md` ·
`ton-of-voice` + `seo-geo-redaction` + `humaniser-fr`.
