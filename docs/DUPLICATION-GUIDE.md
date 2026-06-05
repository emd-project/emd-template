# Guide de personnalisation par site

Checklist des modifications à faire sur un nouveau repo forké du template `emd-template`. La plupart du travail éditorial passe par les Skills (auto-déclenchés) ; ce qui reste manuel est ci-dessous.

Le workflow officiel :

1. **Use this template** sur GitHub (pas un fork) → nouveau repo propre.
2. Cloner localement, `npm install`, `npm run dev`.
3. **Lancer `/nouveau-site`** dès la première session Claude sur le repo. Le routeur déclenche
   `configure-from-spec` (si un `init-spec.md` du wizard est présent) OU `init-site` (interview en chat).
   L'init remplit toute la config éditoriale, compose la DA et génère les images.
4. Suivre la checklist ci-dessous pour ce qui reste manuel (config technique, déploiement).

---

## Étape 1 — Bootstrap éditorial via `/nouveau-site`

À la première session Claude sur le nouveau repo, taper **`/nouveau-site`** (ne PAS taper « lance l'init » seul → percute le `/init` intégré de Claude). Le routeur choisit :

- **`init-spec.md` présent** (poussé par le wizard nano-mentionbox) → `configure-from-spec` : configuration **automatique, zéro question**.
- **Pas de spec** → `init-site` : interview en blocs qui remplit en une passe les fichiers `content/` :

1. **Bloc 0 — Marché + langues** → `niche.config.ts` (market, locales, defaultLocale, localePrefix)
2. **Voix éditoriale** → `content/ton-of-voice.md` (8 questions, délègue à `ton-of-voice`)
3. **Mots-clés** → `content/mots-cles.md` (import Semrush prioritaire, sinon interview 6 questions)
4. **Calendrier éditorial** → `content/calendrier-edito.md`
5. **Concurrents** → `content/concurrents.md`
6. **FAQ base** → `content/faq-base.md`
7. **Mentions légales** → `content/pages/mentions-legales.yaml`
8. **Auteur(s)** → `docs/AUTHOR-[slug].md` (optionnel)

Puis, **sans question** : `content/personas.md` (auto-dérivé de l'audience + des clusters), la **DA** (via `docs/AUTO-DESIGN.md`), les **images structurelles** (via le MCP nano-mentionbox), et la **scheduled task** de rédaction.

Pour redéclencher un seul bloc plus tard : supprimer le fichier concerné OU y remettre un `TODO`, puis relancer `/nouveau-site`.

## Étape 2 — Configuration technique (`niche.config.ts`)

Seul fichier de config technique éditable. Remplir au minimum :
`siteName`, `domain`, `tagline` · `entity`, `entities`, `entityVerb`, `dealWord` · `heroPrefix`, `heroSuffix`, `rotatingWords`, `subtitle` · `categories` (cohérent avec `content/mots-cles.md`) · `palette` (ou laisser l'init/Claude Design les écrire) · `fonts.display`, `fonts.body` · `logo` · `affiliateTag` · `repo` · `branch` · `signature`.

## Étape 3 — Identité visuelle

Si livrables Claude Design : les coller dans `design-incoming/` et lancer `integrate-claude-design`.
Sinon, la DA est composée automatiquement par l'init (AUTO-DESIGN). Réglages manuels possibles :
`app/layout.tsx` (fonts `next/font`, `metadataBase`, title/description), `app/globals.css` (variables `:root` — cf. `docs/DA-PRESETS.md`), `app/admin/layout.tsx` (couleurs sidebar), `Nav.tsx` / `Footer.tsx` (logo, liens).

## Étape 4 — Contenu d'amorçage technique

Au-delà de ce que l'init remplit : `content/settings.yaml`, `content/pages/home.yaml`, `content/pages/deals.yaml` (disclaimer affiliation reformulé), `content/pages/comparer.yaml`, et au moins 1 article test dans `content/articles/`.

## Étape 5 — SEO technique par site

`app/sitemap.ts` (domaine) · `app/robots.ts` (domaine, ne bloquer AUCUN crawler IA : GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended) · `app/opengraph-image.tsx` · `public/llms.txt` (généré par l'init, à tenir à jour) · `niche.config.ts → vercelRegion` (fra1 par défaut).

## Étape 6 — Affiliation

`niche.config.ts → affiliateTag` · vérifier `lib/utils/affiliate.ts` · disclosure (`affiliate_disclaimer` dans `content/pages/*.yaml`, reformulé par site — `humaniser-fr` G5).

## Étape 7 — Auteur(s) signé(s)

Si nom propre : `docs/AUTHOR-[slug].md` (créé par l'init) + `content/authors/[slug].yaml` + référencer le slug dans les MDX (`authorSlug`). Cf. `docs/AUTHOR-template.md`.

## Étape 8 — Variables d'environnement Vercel

```
CMS_SECRET=<openssl rand -hex 32>
CMS_GITHUB_TOKEN=<PAT GitHub avec accès au nouveau repo, scope: repo>
BLOB_READ_WRITE_TOKEN=<auto via Vercel Blob store>
GITHUB_CMS_CLIENT_ID=<OAuth App du site (optionnel)>
GITHUB_CMS_CLIENT_SECRET=<secret OAuth (optionnel)>
CMS_ALLOWED_USERS=<username GitHub admin>
GEMINI_API_KEY=<clé Gemini — génération d'images (primaire), utilisée par le CMS et le MCP nano-mentionbox>
BFL_API_KEY=<clé Flux — fallback de génération d'images (optionnel)>
```

Créer aussi un Vercel Blob store (Storage > Blob > Public access).

## Étape 9 — Vérifications avant premier déploiement

- [ ] `npm run build` passe · `npm run type-check` passe
- [ ] Au moins 1 article test s'affiche sur `/blog`
- [ ] CMS accessible sur `/admin`
- [ ] Tous les fichiers `content/` configurés (plus de TODO)
- [ ] `public/llms.txt` généré et à jour
- [ ] `robots.txt` ne bloque AUCUN crawler IA
- [ ] DA composée (plus de thème par défaut) + images structurelles générées (zéro placeholder en prod)
- [ ] Aucune mention résiduelle du domaine/nom du site source dans le code (sauf `content/`)
- [ ] Liens affiliés testés · disclaimer reformulé pour CE site

## Ce qu'on NE touche PAS

Identiques pour tous les sites enfants :

```
packages/cms/      ← CMS complet
app/admin/         ← Pages admin (sauf couleurs layout)
app/api/cms/       ← API routes CMS
middleware.ts      ← CSP / headers
lib/cms-pages.ts   ← Helper lecture pages YAML
```

Les **skills** ne vivent plus dans chaque site : ils sont centralisés (un clone d'`emd-template` lié dans `~/.claude/skills/` par l'installeur), mis à jour d'un `git pull`. Modifier ces dossiers casse la portabilité entre sites du réseau.
