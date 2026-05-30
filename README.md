# emd-template

Template Next.js pour sites éditoriaux « 10 minutes » — comparateur, quiz, simulateur, deals, blog. Toute la configuration passe par `niche.config.ts`. CMS intégré sur `/admin`. Workflows de rédaction et d'intégration design pris en charge par des Skills auto-déclenchés.

## Démarrage

```bash
# 1. "Use this template" sur GitHub → nouveau repo, clone-le
cp .env.example .env.local
npm install
npm run dev

# 2. Colle les outputs Claude Design dans design-incoming/
# 3. Ouvre Claude Code → « intègre ce qui est dans design-incoming/ »
#    (Le skill integrate-claude-design prend le relais automatiquement.)
```

Pas d'outputs Claude Design ? Remplis `niche.config.ts` à la main, c'est le seul fichier obligatoire.

## Skills auto-déclenchés

Le dossier `skills/` contient quatre skills qui se chargent automatiquement quand leurs triggers correspondent :

| Skill | Quand il s'active |
|---|---|
| `integrate-claude-design` | « intègre ce qui est dans design-incoming », « merge les designs » |
| `ton-of-voice` | Tout trigger de rédaction. Si `content/ton-of-voice.md` est vide → conduit un interview de 8 questions. |
| `seo-geo-redaction` | Tout trigger de rédaction (article, fiche produit, brief, comparatif…) |
| `humaniser-fr` | Production (écrit propre dès le départ) + Review (« humanise », « sonne IA ») |

Sur une demande de rédaction, `ton-of-voice` + `seo-geo-redaction` + `humaniser-fr` se chargent en parallèle. Détail dans [`skills/README.md`](skills/README.md).

## Stack

| Outil | Version |
|---|---|
| Next.js | ~16.2.1 (patch auto) |
| TypeScript | strict |
| Tailwind CSS | v4 |
| Hébergement | Vercel — région fra1 |
| CMS | Custom (packages/cms/) |

## Composants MDX

Disponibles dans les articles :

| Composant | Usage |
|---|---|
| `<ArticleImage>` | Image optimisée inline (`src`, `alt`, `caption`) |
| `<ProductCTA>` | Carte produit affilié (`name`, `price`, `url`, `image?`, `badge?`, `hook?`) |
| `<ProductCarousel>` | Carousel horizontal de produits (`products="slug-1,slug-2"`) |
| `<CompareBar>` | Barre comparaison visuelle (`label`, `left`, `right`, `leftName`, `rightName`) |
| `<CompareBarGroup>` | Wrapper pour grouper les CompareBar |
| `<Tip>` | Bloc conseil |
| `<Warning>` | Bloc avertissement |
| `<Verdict>` | Verdict avec note (`note`, `label`) |
| `<ProConTable>` | Tableau avantages/inconvénients (`pros`, `cons`) |
| `<PullQuote>` | Citation mise en avant (`author`) |
| `<StatCard>` | Statistique (`value`, `label`) |
| `<StatRow>` | Wrapper pour grouper les StatCard |

## CMS (`/admin`)

- Éditeur WYSIWYG TipTap (tables, images, formatage)
- Import intelligent (copier-coller texte brut)
- Sidebar SEO compacte
- FAQ preview en temps réel
- Upload images + génération IA (Flux)
- Gestion auteurs avec vue articles
- Display name utilisateurs
- Éditeurs enrichis par page (home, quiz)

## Pages incluses

| Route | Type |
|---|---|
| `/` | Home dynamique |
| `/blog` | Hub articles |
| `/blog/[categorie]/[slug]` | Article MDX |
| `/comparer` | Comparateur |
| `/comparer/[produit]` | Comparateur par catégorie |
| `/quiz` | Quiz interactif (questions éditables via CMS) |
| `/simulateur` | Simulateur |
| `/deals` | Deals |
| `/choisir/[produit]` | Guide d'achat |
| `/auteurs/[slug]` | Page auteur (JSON-LD Person) |
| `/mentions-legales` | Mentions légales |
| `/confidentialite` | Politique de confidentialité |
| `/admin/*` | CMS complet |

## SEO & GEO

- JSON-LD (Article, Person, BreadcrumbList, FAQPage, WebSite)
- OG dynamique par page
- Sitemap + robots.ts
- hreflang prêt (ajouter `'en'` dans `niche.locales` pour activer)
- Doctrine de rédaction : skill `seo-geo-redaction` (auto-déclenché sur la rédaction)

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run lint` | ESLint |
| `npm run type-check` | Vérification TypeScript |
| `npm run test` | Tests unitaires (Vitest) |

## Documentation

- [`skills/README.md`](skills/README.md) — Index des Skills auto-déclenchés
- [`design-incoming/READ-FIRST.md`](design-incoming/READ-FIRST.md) — Zone d'atterrissage des outputs Claude Design
- [`content/ton-of-voice.md`](content/ton-of-voice.md) — Voix éditoriale du site (rempli via interview au premier lancement)
- [`docs/AUTHOR-template.md`](docs/AUTHOR-template.md) — Squelette pour fichiers auteur (`docs/AUTHOR-[slug].md`)
- [`docs/TEMPLATE-SPEC.md`](docs/TEMPLATE-SPEC.md) — Architecture du template
- [`docs/CMS-SPEC.md`](docs/CMS-SPEC.md) — Documentation CMS
- [`docs/DA-PRESETS.md`](docs/DA-PRESETS.md) — Presets de direction artistique
- [`docs/DA-ANTI-IA.md`](docs/DA-ANTI-IA.md) — Patterns visuels anti-IA
- [`docs/DUPLICATION-GUIDE.md`](docs/DUPLICATION-GUIDE.md) — Checklist de personnalisation par site
- [`DECISIONS.md`](DECISIONS.md) — Décisions d'architecture
- [`PROGRESS.md`](PROGRESS.md) — Progression et historique

## Variables Vercel

```
CMS_SECRET=<openssl rand -hex 32>
CMS_GITHUB_TOKEN=<PAT GitHub>
BLOB_READ_WRITE_TOKEN=<auto via Vercel Blob>
GITHUB_CMS_CLIENT_ID=<OAuth App>       # optionnel
GITHUB_CMS_CLIENT_SECRET=<OAuth App>   # optionnel
BFL_API_KEY=<Flux — génération images> # optionnel
```
