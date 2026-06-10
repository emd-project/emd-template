# emd-template

Moteur Next.js pour **sites éditoriaux multi-niches** — comparateurs et magazines/blogs informationnels.
Toute la configuration passe par `niche.config.ts`. CMS intégré sur `/admin`. Direction artistique,
rédaction et intégration prises en charge par des skills auto-déclenchés.

## Démarrage

Le plus simple : via le **wizard nano-mentionbox** (« Créer EMD ») — il remplit `init-spec.md`,
crée le repo depuis ce template, et Claude le configure (« configure le site depuis init-spec.md »).

```bash
# En local
cp .env.example .env.local
npm install
npm run dev
```

### Le design à l'init — deux voies

1. **Choix d'un skin Voltéo** (par défaut, zéro compétence design) : type de site (comparateur /
   magazine / hybride), **skin V1–V4** (4 identités prêtes), et **verticale** (énergie / assurance /
   auto / tech). Claude **applique le skin** (bloc prêt à coller) puis le **mute** pour rester unique —
   cf. `docs/AUTO-DESIGN.md` + `docs/design-reference/volteo/`.
2. **Import Claude Design** : déposer un zip dans `design-incoming/` → le skill `integrate-claude-design`
   l'intègre.

Dans les deux cas, le site sort **animé par de vraies images** (générées à l'init), jamais en
placeholders — cf. `docs/IMAGES-WORKFLOW.md`. Plus de palette/fonts par défaut, jamais de clone brut d'un skin.

## Skills auto-déclenchés

| Skill | Quand il s'active |
|---|---|
| `configure-from-spec` | « configure le site depuis init-spec.md » (wizard) |
| `init-site` | Init manuel sans init-spec.md |
| `integrate-claude-design` | « intègre ce qui est dans design-incoming » |
| `ton-of-voice` | Tout trigger de rédaction (interview de 8 questions si vide) |
| `seo-geo-redaction` | Tout trigger de rédaction (SEO + GEO + miroir i18n) |
| `humaniser-fr` | Production + review (anti-patterns IA) |

Sur une demande de rédaction, `ton-of-voice` + `seo-geo-redaction` + `humaniser-fr` se chargent en parallèle.

## Stack

| Outil | Version |
|---|---|
| Next.js | ~16.2.1 |
| TypeScript | strict |
| Tailwind CSS | v4 |
| Hébergement | Vercel — région fra1 |
| CMS | Custom (`packages/cms/`) |

## Direction artistique

- **Source unique : Voltéo** (`docs/design-reference/volteo/`) — 4 skins (V1 Électrique, V2 Éditorial,
  V3 Suisse-Minimal, V4 Premium-sombre) + 4 verticales (énergie/assurance/auto/tech). Doctrine :
  **choisir un skin → l'appliquer → le muter** (anti-footprint). Mode d'emploi + blocs prêts à coller :
  `docs/design-reference/volteo/DESIGN-NOTES.md`.
- **Archétypes** : `comparateur` / `magazine` / `hybride` — pilotent la home (`niche.style.homeSections`) et le hero.
- **Mode** clair/sombre via `niche.style.mode` + `ThemeToggle`.
- **Fallback** : `lib/da-presets/` (161 palettes) — uniquement si aucun skin ne convient (`docs/DA-PRESETS.md`).
- **Images V2** : registre `lib/image-slots.ts`, génération Gemini→Flux (CMS) ou nano-mentionbox (init + tâches).

## Composants MDX (articles)

`<ArticleImage>` · `<ProductCTA>` · `<ProductCarousel>` · `<CompareBar>` / `<CompareBarGroup>` ·
`<Tip>` · `<Warning>` · `<Verdict>` · `<ProConTable>` · `<PullQuote>` · `<StatCard>` / `<StatRow>`.

## CMS (`/admin`)

Éditeur WYSIWYG TipTap · import intelligent · sidebar SEO · FAQ preview · upload + génération
d'images (Gemini/Flux) · gestion auteurs · 2FA TOTP.

## Pages incluses

| Route | Type |
|---|---|
| `/` | Home dynamique (sections pilotées par l'archétype) |
| `/blog` · `/blog/[categorie]` · `/blog/[categorie]/[slug]` | Hub + catégorie + article MDX |
| `/comparer` · `/comparer/[produit]` | Comparateur |
| `/choisir/[produit]` | Guide d'achat |
| `/quiz` · `/simulateur` · `/deals` | Outils |
| `/auteurs/[slug]` | Page auteur (JSON-LD Person) |
| `/mentions-legales` · `/confidentialite` | Légal |
| `/admin/*` | CMS complet |

## SEO & GEO

- JSON-LD (Article, Person, BreadcrumbList, FAQPage, WebSite)
- Titres sans double marque (`title.template: '%s'`, les pages s'auto-brandent)
- Année dynamique via `currentYear()` (jamais en dur)
- OG dynamique · sitemap · robots
- i18n : miroir strict si `locales.length >= 2`, `LangSwitcher` **zéro-404**, hreflang vers les seules traductions existantes
- Doctrine de rédaction : skill `seo-geo-redaction` (+ `references/mirror-i18n.md`)

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Développement |
| `npm run build` | Build production |
| `npm run lint` | ESLint |
| `npm run type-check` | Vérification TypeScript |
| `npm run test` | Tests (Vitest) |

## Documentation

- [`docs/TEMPLATE-SPEC.md`](docs/TEMPLATE-SPEC.md) — Architecture du moteur
- [`docs/AUTO-DESIGN.md`](docs/AUTO-DESIGN.md) — Doctrine DA à l'init (skin Voltéo → appliquer → muter)
- [`docs/design-reference/volteo/`](docs/design-reference/volteo/README.md) — **Source design : skins + verticales + DESIGN-NOTES**
- [`docs/WIZARD-DESIGN-STEP.md`](docs/WIZARD-DESIGN-STEP.md) — Étape design du wizard (skin / zip)
- [`docs/DA-ANTI-IA.md`](docs/DA-ANTI-IA.md) — Garde-fous anti-IA + signature
- [`docs/DA-PRESETS.md`](docs/DA-PRESETS.md) — Bibliothèque de fallback (optionnelle)
- [`docs/IMAGES-WORKFLOW.md`](docs/IMAGES-WORKFLOW.md) — Stratégie images V2
- [`docs/SCHEDULED-TASK-REDACTION.md`](docs/SCHEDULED-TASK-REDACTION.md) — Gabarit de la tâche quotidienne
- [`skills/seo-geo-redaction/references/mirror-i18n.md`](skills/seo-geo-redaction/references/mirror-i18n.md) — Miroir multi-langue
- [`docs/CMS-SPEC.md`](docs/CMS-SPEC.md) — CMS · [`DECISIONS.md`](DECISIONS.md) · [`PROGRESS.md`](PROGRESS.md)

## Variables Vercel

```
CMS_SECRET=<openssl rand -hex 32>
CMS_GITHUB_TOKEN=<PAT GitHub>
BLOB_READ_WRITE_TOKEN=<auto via Vercel Blob>
GEMINI_API_KEY=<génération d'images — primaire>   # ou BFL_API_KEY (Flux, fallback)
GITHUB_CMS_CLIENT_ID=<OAuth App>       # optionnel
GITHUB_CMS_CLIENT_SECRET=<OAuth App>   # optionnel
```
