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

1. **Sélection automatique** (par défaut, zéro décision humaine) : famille via `classifyNiche` (secteur),
   variante via `suggestVariants(domaine, famille)` + permutations, palette (direction mutée) via
   `niche.config.palette` → `globals.css`, typo via `suggestFonts` → `layout.tsx`. Déterministe
   (seed = domaine), anti-empreinte — cf. `docs/AUTO-DESIGN.md` (LE doc DA).
2. **Import Claude Design** : déposer un zip dans `design-incoming/` → le skill `integrate-claude-design`
   l'intègre.

Dans les deux cas, le site sort **animé par de vraies images** (générées à la fin de l'init, checklist
`getAllImageSlots()`), jamais en placeholders — cf. `docs/IMAGES-WORKFLOW.md`. Plus de palette/fonts
par défaut, jamais de clone brut.

## Placeholders : le garde-fou est MANUEL

**Le template ne livre plus de faux contenu.** Il livre des trous, et il sait les détecter. C'est un
changement de contrat : historiquement, `QuizEngine` affichait un quiz « Catégorie A / B / C » avec un
« Modèle placeholder » à « À définir », `comparateurs.json` contenait des « Modèle A/B/C » à 299 €, et
tout ça est parti en prod sur une vingtaine de sites sans que personne ne le voie. Un placeholder
silencieux qui *ressemble* à du contenu est pire qu'une section absente.

### Le garde-fou

```bash
npm run check:placeholders          # liste fichier:ligne — motif détecté
npm run check:placeholders -- --warn-only   # affiche sans faire échouer
```

`scripts/check-placeholders.mjs` (Node pur, zéro dépendance) est un **check MANUEL** : il n'est
**plus enchaîné dans `npm run build`** et le workflow CI (`.github/workflows/check-placeholders.yml`)
est **désactivé**. Le lancer soi-même à l'init et avant un déploiement — rien ne le fait à votre place.

Le gate s'arme tout seul : tant que `niche.config.ts` n'est pas configuré (`siteName: 'emd-template'`,
`domain: 'example.com'`), il reste en warn-only — le template nu contient des gabarits par construction.
Dès que la niche est renseignée, il signale.

### Ce qu'il détecte

| Motif | Exemple |
|---|---|
| Chaînes gabarits | `Modèle A/B/C`, `Catégorie A/B/C`, `Category A`, `Modèle placeholder`, `À définir`, `sera personnalisé`, `à remplacer à l'init`, `Comparatif de démonstration`, `TBD`, `Lorem ipsum` |
| Tableaux de data vides en dur | `const DEALS: Deal[] = []`, `const CYCLES: CyclePrix[] = []` |
| JSON de data vide | `content/data/*.json` qui parse en `{}` ou `[]` |
| Gabarits encore présents | `content/**/_example.*`, `content/**/article-modele.mdx` |
| Quiz activé sans questions | `niche.quiz.enabled: true` + `content/pages/quiz.yaml` avec `steps: []` |

### Le contrat des composants

- **`QuizEngine`** n'a **aucune question par défaut**. Sans `steps` : `throw` explicite en dev,
  `return null` en prod. Il ne fabrique plus de quiz bidon. Les questions viennent de
  `content/pages/quiz.yaml` (CMS `/admin`) ; la recommandation finale vient de la prop `recommend`
  (à défaut : uniquement des faits — le choix du visiteur et des liens vers `/comparer` et `/choisir`).
- **Data vide = section absente**, jamais une section « Modèle A ». Les hubs `/comparer`, `/classement`,
  `/simulateur` affichent un état vide explicite ; `/quiz` renvoie 404 s'il n'a pas de questions.
- Les gabarits `_*.mdx` ne sont plus lus par `lib/blog.ts` (fini l'article publié à l'URL `/_example`),
  et `article-modele.mdx` est en `draft: true`. **Ils doivent quand même être supprimés à l'init.**

### À l'init, donc

1. Remplir `content/data/comparateurs.json`, `classements.json`, `choisir.json` avec les **vrais**
   modèles de la niche (structure de référence : `docs/examples/*.example.json`).
2. Remplir `content/pages/quiz.yaml` (ou passer `niche.quiz.enabled` à `false`).
3. Remplir `CYCLES` (`app/(site)/simulateur/page.tsx`) ou supprimer la page. `/deals` reste
   désactivée par défaut (`niche.config.deals.enabled: false`, modèle MENTION) — ne pas la remplir.
4. **Supprimer** `content/produits/_example.yaml`, `content/articles/_example.mdx`,
   `content/blog/guides/article-modele.mdx`.
5. `npm run check:placeholders` → doit sortir « aucun placeholder détecté ».

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

- **Doctrine unique : `docs/AUTO-DESIGN.md`** — sélection déterministe : famille (`classifyNiche`) →
  variante + permutations (`suggestVariants`) → palette (direction de `docs/DA-DIRECTIONS.md` mutée)
  → typo (`suggestFonts`, pool `lib/typography.ts`).
- **Variantes** : home `magazine`/`comparateur`/`marche`/`fil`/`presse` · catégorie `classic`/`editorial`/`presse`
  · article `classic`/`presse` (cf. `lib/variants.ts`). Les previews sont dépubliées à l'init.
- **Mode** clair OU sombre **fixe** via `niche.style.mode` — pas de toggle.
- **Fallback** : `lib/da-presets/` (161 palettes) — uniquement pour une niche hors-cadre (cf. AUTO-DESIGN).
- **Images V2** : registre `lib/image-slots.ts` (`getAllImageSlots()`), génération Gemini→Flux (CMS)
  ou nano-mentionbox (init + tâches).

## Composants MDX (articles)

`<ArticleImage>` · `<CompareBar>` / `<CompareBarGroup>` · `<Tip>` · `<Warning>` · `<Verdict>` ·
`<ProConTable>` · `<PullQuote>` · `<StatCard>` / `<StatRow>` · `<ToolCTA>`.
**Aucun composant produit marchand** (`ProductCTA`, `ProductCarousel`… supprimés — modèle MENTION,
sans affiliation ; les utiliser dans un MDX casse le build).

## CMS (`/admin`)

Éditeur WYSIWYG TipTap · import intelligent · sidebar SEO · FAQ preview · upload + génération
d'images (Gemini/Flux) · gestion auteurs · 2FA TOTP.

## Pages incluses

| Route | Type |
|---|---|
| `/` | Home dynamique (variante pilotée par `niche.config.layouts`) |
| `/blog` · `/blog/[categorie]` · `/blog/[categorie]/[slug]` | Hub + catégorie + article MDX |
| `/comparer` · `/comparer/[produit]` | Comparateur |
| `/classement/[produit]` | Classement Top N (asset GEO #1) |
| `/choisir/[produit]` | Guide d'achat |
| `/quiz` · `/simulateur` | Outils (`/deals` désactivée par défaut — modèle MENTION) |
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
| `npm run check:placeholders` | Garde-fou anti-placeholder — **manuel** (`--warn-only` pour ne pas échouer) |
| `npm run lint` | ESLint |
| `npm run type-check` | Vérification TypeScript |
| `npm run test` | Tests (Vitest) |

## Documentation

- [`docs/AUTO-DESIGN.md`](docs/AUTO-DESIGN.md) — **LE doc DA** (famille → variantes → palette → typo → images)
- [`docs/DA-DIRECTIONS.md`](docs/DA-DIRECTIONS.md) — 5 directions de design + spec logo/favicon
- [`docs/DA-ANTI-IA.md`](docs/DA-ANTI-IA.md) — Garde-fous anti-IA + signature
- [`docs/IMAGES-WORKFLOW.md`](docs/IMAGES-WORKFLOW.md) — Stratégie images V2
- [`docs/examples/`](docs/examples/) — Gabarits de STRUCTURE des data (comparateurs, classements) — documentation, pas du contenu
- [`docs/SCHEDULED-TASK-REDACTION.md`](docs/SCHEDULED-TASK-REDACTION.md) — Gabarit de la tâche quotidienne
- [`skills/seo-geo-redaction/references/mirror-i18n.md`](skills/seo-geo-redaction/references/mirror-i18n.md) — Miroir multi-langue
- [`docs/CMS-SPEC.md`](docs/CMS-SPEC.md) — CMS · [`DECISIONS.md`](DECISIONS.md) · [`PROGRESS.md`](PROGRESS.md)
- `emd-methodo/ops/anti-placeholder.md` — Doctrine anti-placeholder (problème, parade, checklist par site)

## Variables Vercel

```
CMS_SECRET=<openssl rand -hex 32>
CMS_GITHUB_TOKEN=<PAT GitHub>
BLOB_READ_WRITE_TOKEN=<auto via Vercel Blob>
GEMINI_API_KEY=<génération d'images — primaire>   # ou BFL_API_KEY (Flux, fallback)
GITHUB_CMS_CLIENT_ID=<OAuth App>       # optionnel
GITHUB_CMS_CLIENT_SECRET=<OAuth App>   # optionnel
```
