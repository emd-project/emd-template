---
name: init-site
version: 3.2.0
description: Bootstrap d'un nouveau site forké du template emd-template, SANS init-spec wizard (interview en chat). Lance UN interview groupé par blocs (Bloc 0 marché+langues d'abord, puis voix, mots-clés, calendrier, concurrents, FAQ, mentions, auteur), écrit niche.config.ts + tous les content/* + personas auto-dérivés, PUIS — étapes non sautables — applique un skin Voltéo (structure + DA) via docs/AUTO-DESIGN.md, génère les images structurelles via le MCP nano-mentionbox, et crée la scheduled task de rédaction. À utiliser une fois après "Use this template" quand il n'y a PAS d'init-spec.md. Triggers — « initialise ce site », « configure ce site », « setup le site », « bootstrap le site », « init-site », « lance la conf ». Trigger implicite — première rédaction sur un site visiblement non configuré (niche.config.ts.market vide ou content/ avec TODO). Le routeur nouveau-site appelle ce skill quand aucun init-spec.md n'est présent.
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

# init-site v3 — Bootstrap d'un nouveau site forké (interview)

Ce skill remplit en une passe toute la config éditoriale du site, **puis** applique la DA et génère les images. Économie de tokens vs déclencher 5 skills séparément, et cohérence garantie (audience définie une fois, réutilisée partout ; locales + marché définis AVANT tout).

> **Nouveau en v3** : l'init ne s'arrête plus à la config. Il **applique une vraie DA** (étape 8, skin Voltéo : structure + tokens) et **génère les images structurelles** (étape 9) — ces étapes ne sont PAS optionnelles. Un site qui sort de l'init avec le thème par défaut (`#FF3D57`, dark/aurora, logo `emd·template`), avec la **structure de pages par défaut**, OU avec des placeholders d'images est un **échec d'init**.

## Pré-requis (vérifier au démarrage)

**MCP nano-mentionbox disponible** (`mcp__nano-mentionbox__generate_image`). Si absent → prévenir l'utilisateur : sans lui, les étapes 9 (images) ne pourront pas tourner et le site sortira en placeholders = échec d'init. Proposer de brancher le MCP (script « Installer MCP ») avant de continuer, ou de poursuivre la config en sachant qu'il faudra générer les images ensuite.

## Étape 0 — Audit de l'état actuel

Avant l'interview, lire l'état de chaque fichier-cible :

| Fichier | « non défini » si… |
|---|---|
| `niche.config.ts` | `locales`, `defaultLocale`, `market` absents ou placeholder (`'TODO'`, `''`) |
| `content/ton-of-voice.md` | absent OU ≥ 1 `TODO` |
| `content/mots-cles.md` | absent OU ≥ 1 `TODO` |
| `content/personas.md` | absent OU ≥ 1 `TODO` |
| `content/calendrier-edito.md` | absent OU ≥ 1 `TODO` |
| `content/concurrents.md` | absent OU ≥ 1 `TODO` |
| `content/faq-base.md` | absent OU ≥ 1 `TODO` |
| `content/pages/mentions-legales.yaml` | absent OU ≥ 1 `TODO` |
| `niche.style` / `niche.palette` / `niche.signature` | valeurs par défaut (DA non appliquée) |
| `docs/AUTHOR-[slug].md` | optionnel — si l'utilisateur signe d'un nom propre |

Annoncer le bilan : « J'ai audité l'état du site. Voici ce qu'il reste à définir : [liste]. Je pose les questions par blocs, en commençant par les langues et le marché (Bloc 0). ~10 min, puis je applique la DA et génère les images. »

Si TOUT est rempli (zéro TODO, market défini, DA appliquée, images présentes) → informer et sortir.

---

## Bloc 0 — Langues et marché géo (OBLIGATOIRE EN PREMIER)

**Pourquoi en premier** : pilote tout — routing Next.js (`app/page.tsx` vs `app/[locale]/...`), middleware i18n, hreflang, sitemap, frontmatter MDX, sélecteur de langue, schema.org, OG locale, devise.

### Q0.1 — Pays cible principal ?

| Option | Code | Conséquences |
|---|---|---|
| 🇧🇪 Belgique | `BE` | OG `fr_BE`, EUR, références FSMA/BNB/Test-Achats |
| 🇫🇷 France | `FR` | OG `fr_FR`, EUR, références ACPR/AMF/UFC-Que Choisir |
| 🇨🇦 Canada | `CA` | OG `fr_CA`, CAD, références AMF Québec |
| 🇨🇭 Suisse | `CH` | OG `fr_CH`, CHF, références FINMA/SECO |
| Autre | (libre) | code ISO + devise + régulateur |

→ `niche.config.ts → market`.

### Q0.2 — Combien de langues ? (ordre = priorité éditoriale)

Présets BE : `FR` seul · `FR+EN` · `FR+NL` · `FR+EN+NL` · `FR+NL+DE+EN` · Autre.
Présets FR/CA/CH : `FR` seul · `FR+EN` · Autre.
→ `niche.config.ts → locales[]` + `defaultLocale: 'fr'`.

### Q0.3 — (si N ≥ 2) Voix par langue ?
- **Voix unique transposée** (recommandé) : un seul `content/ton-of-voice.md`, traduit à la rédaction.
- **Voix adaptée par langue** : un fichier par locale.

### Conséquences automatiques (écriture directe, pas de question)

| Choix | Routing | localePrefix | Middleware | Sélecteur |
|---|---|---|---|---|
| 1 langue | `app/page.tsx` | n/a | aucun | aucun |
| 2+ langues | `app/[locale]/...` | `'as-needed'` | `next-intl` obligatoire | `<LangSwitcher>` |

**Miroir strict (NON-négociable si N ≥ 2)** : tout est traduit dans toutes les locales (articles, pages utilitaires, composants UI via `messages/[locale].json`, schema.org `inLanguage` + hreflang). Voir `skills/seo-geo-redaction/references/mirror-i18n.md`.

### Sortie immédiate du Bloc 0
Écrire `niche.config.ts` (market, defaultLocale, locales, localePrefix), puis : « Marché et langues verrouillés. Tous les fichiers seront créés en miroir dans les N langues, routing = [convention]. On enchaîne avec la voix. »

---

## Étape 1 — Voix et audience (→ ton-of-voice.md)
Déléguer à `ton-of-voice` en mode définition (8 questions). Cascade Bloc 0 : un fichier unique (Q0.3 = unique) ou N fichiers par locale. Sauter si déjà rempli.

## Étape 2 — Mots-clés (→ mots-cles.md)
Un seul set en langue principale (les autres locales dérivées à la rédaction). Cas A : export Semrush fourni → parser, 3-5 clusters (head term, longue traîne, quick wins KD≤30, à éviter KD>60). Cas B : mini-interview 6 questions (positionnement, clusters, piliers, longue traîne, priorités 90j, à éviter). Écrire `content/mots-cles.md`.

## Étape 3 — Calendrier éditorial (→ calendrier-edito.md)
5 questions (cadence cible + plancher, formats récurrents, saisonnalité, rotation d'angles, refresh). Noter que chaque entrée produit `locales.length` articles (miroir). Écrire `content/calendrier-edito.md`.

## Étape 4 — Concurrents (→ concurrents.md)
4 questions (directs 3-5 avec URL/force/faiblesse, indirects, gaps SERP, anti-modèles). Un set FR. Écrire `content/concurrents.md`.

## Étape 5 — FAQ base (→ faq-base.md)
Cas A : dériver des PAA des head terms. Cas B : interview (3-5 thèmes, 3-5 questions précises, réponses-cadre courtes factuelles). Écrire `content/faq-base.md`.

## Étape 6 — Mentions légales (→ pages/mentions-legales.yaml)
Éditeur (raison sociale, forme, identifiant fiscal, adresse, représentant), contact (email obligatoire), hébergeur (Vercel par défaut), DPO, cookies, PI. Générer le fichier principal + variantes locales. Écrire.

## Étape 7 — Auteur (→ docs/AUTHOR-[slug].md)
Si nom propre → dérouler le gabarit `docs/AUTHOR-template.md`. Sinon sauter.

## Étape 7bis — Personas (→ content/personas.md, AUTO-DÉRIVÉ)
**Sans question supplémentaire.** Dériver 2 à 4 personas de l'audience (Étape 1) + des clusters/intentions (Étape 2) + du marché (Bloc 0). Pour chacun : situation, expertise, vocabulaire, déclencheur d'achat, et « Questions par étape de funnel » (découverte/comparaison/décision — alimentent les FAQ in-flow). Archétypes ancrés dans les clusters réels, pas de démographie inventée. `seo-geo-redaction` exige ce fichier.

---

## Étape 8 — Direction artistique (AUTO-DESIGN, skin Voltéo) — OBLIGATOIRE, NON SAUTABLE

Exécuter **`docs/AUTO-DESIGN.md`** (doctrine Voltéo). Si `design-incoming/` contient un livrable Claude Design → déléguer plutôt à `integrate-claude-design`. Sinon, **poser les 3 choix** puis appliquer :

1. **Template** — archétype (comparateur / magazine / hybride) depuis l'intent dominant des clusters → pilote `niche.style.hero` + `homeSections` + **la structure des pages**.
2. **Skin** — proposer V1 Électrique / V2 Éditorial / V3 Suisse-Minimal / V4 Premium-sombre selon le ton de la niche ; l'utilisateur valide (ou « laisse Claude choisir »).
3. **Verticale** — énergie / assurance / auto / tech / custom → couleurs de catégorie.
4. **Reproduire la STRUCTURE (NON négociable)** — reconstruire les composants du moteur (`components/`, `app/`) pour produire **les sections + l'ordre** des pages HTML de référence du template choisi (`docs/design-reference/volteo/DESIGN-NOTES.md` §0) : `home-comparateur.html` **ou** `home-magazine.html` (home), `hub-categorie.html` (`/blog` + `/blog/[categorie]`), `article.html` (`/blog/[categorie]/[slug]`). Appliquer seulement les couleurs sur le squelette par défaut du moteur = bug d'init.
5. **Appliquer les tokens** — copier le **bloc prêt à coller** du skin (`…/DESIGN-NOTES.md` §5) dans `niche.palette` / `niche.fonts` / `niche.style` ; reporter la verticale (§4) dans les accents catégorie ; reporter rayons + correctifs (§3b — V3 angles 0/zéro ombre, V4 sections sombres) dans `app/globals.css`.
6. **Muter** (teinte de marque, fonts, rayons — DESIGN-NOTES §6) pour rester unique, écrire `niche.signature` (anchor/oneRule/inspiration/forbidden/components — cf. `docs/DA-ANTI-IA.md`), puis dérouler la **checklist** (DESIGN-NOTES §7).

**NE JAMAIS** garder la palette/fonts par défaut (`#FF3D57`, Unbounded/Space Grotesk, dark+aurora), **ni** la **structure de pages par défaut** du moteur (héritage pré-Voltéo), **ni** sortir en **clone brut d'un skin** = bug d'init. (Fallback `lib/da-presets/` uniquement si aucun skin ne colle — cf. `docs/DA-PRESETS.md`.)

## Étape 9 — Images structurelles (MCP nano-mentionbox) — OBLIGATOIRE, NON SAUTABLE

Voir **`docs/IMAGES-WORKFLOW.md`**. Après AUTO-DESIGN, générer les slots structurels (`home-hero-background`, `home-hero-visual`, `home-category-[slug]` + `blog-category-background-[slug]` par catégorie, `author-[slug]` si auteur) via `mcp__nano-mentionbox__generate_image` (fire-and-poll → `wait_for_image`), prompts de la bibliothèque + `lib/image-slots.ts` **alignés sur le skin appliqué**. Compresser en WebP, pousser via `mcp__nano-mentionbox__github_push_images` sous `public/images/`.

Prompts ≤ ~20 mots, finir par « no text, no logos, no watermark ». Si la génération échoue, laisser le placeholder et le noter dans PROGRESS.md (ne pas bloquer tout l'init), mais le signaler clairement. Un site neuf en placeholders = bug.

## Étape 10 — Scheduled task de rédaction quotidienne

Chemin sans-wizard → **demander confirmation** avant de créer (effet de bord global). Si oui, créer selon le gabarit canonique `docs/SCHEDULED-TASK-REDACTION.md` (remplacer les `[placeholders]` depuis `niche.config.ts`). TaskId `[repoName]-article-daily`, cron selon la cadence du Bloc 3 (`0 8 * * *` par défaut).

---

## Étape 11 — Récapitulatif final

```
Init terminé.
- niche.config.ts ✓ (market, locales, defaultLocale, localePrefix)
- content/ton-of-voice.md ✓ · mots-cles ✓ · personas ✓ (auto) · calendrier ✓ · concurrents ✓ · faq-base ✓
- content/pages/mentions-legales.yaml ✓ (+ variantes locales si N langues)
- docs/AUTHOR-[slug].md ✓ (si auteur)
- DA appliquée ✓ : template [x] · skin [Vn] · verticale [x] · structure Voltéo reproduite · muté (plus de thème ni de structure par défaut, pas de clone)
- Images structurelles ✓ : hero + fonds catégories (+ auteur) générés et poussés
- Scheduled task ✓ (si confirmée)

Routing : [app/page.tsx | app/[locale]/...] · Miroir strict : [oui/non] · Marché : [x] · Locales : [...]
Prochaines étapes : pnpm dev → vérifier rendu · déploiement Vercel
```

---

## Règles strictes

- **Bloc 0 OBLIGATOIRE en PREMIER** : aucun autre bloc avant que market/locales/defaultLocale/localePrefix soient écrits.
- **Étapes 8 (DA) et 9 (images) NON SAUTABLES** : un site qui sort en thème par défaut, en **structure de pages par défaut**, en clone brut d'un skin, ou en placeholders = échec d'init.
- **NE JAMAIS inventer** une réponse manquante → `TODO` explicite.
- **Bloc par bloc**, un seul message utilisateur par bloc. Réutiliser les données entre blocs.
- **Personas auto-dérivés** (pas de bloc d'interview dédié).
- **Miroir strict NON-négociable** dès N ≥ 2 locales.

## Lien avec les autres skills
- `nouveau-site` : routeur qui appelle ce skill quand pas d'`init-spec.md`.
- `configure-from-spec` : équivalent AVEC init-spec wizard (zéro question).
- `docs/AUTO-DESIGN.md` (étape 8, skin Voltéo) · `docs/design-reference/volteo/DESIGN-NOTES.md` · `docs/IMAGES-WORKFLOW.md` (étape 9) · `docs/SCHEDULED-TASK-REDACTION.md` (étape 10).
- `ton-of-voice`, `seo-geo-redaction`, `humaniser-fr` : utilisés à chaque rédaction ensuite (lisent les content/* écrits ici, dont personas.md).
