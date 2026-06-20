# Claude Code — emd-template

## Premier réflexe à chaque session

1. Lire **PROGRESS.md** et `/docs/` selon la tâche en cours.
2. Si `design-incoming/` contient des fichiers → le skill `integrate-claude-design` prend le relais. **Ne JAMAIS** proposer un questionnaire d'init.
3. Si `design-incoming/` est vide → demander à l'utilisateur ce qu'il veut faire. Pas de séquence d'init automatique.

## Parité FR ⇄ EN (OBLIGATOIRE)

Le site est bilingue (FR par défaut + EN sous `/en`). **Toute modification côté FR doit être répliquée côté EN dans le MÊME commit** — code ET données. Une tâche « fix » / rédaction qui change le FR sans toucher l'EN est un **bug** (les gabarits divergent : ex. route FR passée en gabarit magazine avec sommaire, route EN restée une-colonne).

**Paires de routes — modifier les DEUX :**

| FR (`app/(site)/…`) | EN (`app/en/…`) |
|---|---|
| `page.tsx` (home) | `en/page.tsx` |
| `blog/`, `blog/[categorie]/`, `blog/[categorie]/[slug]/` | `en/blog/…` |
| `comparer/`, `comparer/[produit]/` | `en/comparer/…` |
| `classement/[produit]/` | `en/classement/[produit]/` |
| `choisir/[produit]/` | `en/choisir/[produit]/` |
| `quiz/` | `en/quiz/` |
| `simulateur/` | `en/simulateur/` |
| `deals/` | `en/deals/` |
| `auteurs/[slug]/` | `en/auteurs/[slug]/` |
| `mentions-legales/` | `en/legal-notice/` (slug différent) |
| `confidentialite/` | `en/privacy/` (slug différent) |
| `[article]/` (standalone) | `en/[article]/` *(à créer si absent)* |

**Composants à libellés :** prop `locale` + `tl(locale, …)`, **jamais de FR en dur**. Un composant rendu sur `/en` reçoit `locale="en"` (Nav, Footer, AISummarize, AuthorByline/Card, Pagination, ToolCTA, Warning, ProductCTA/Carousel, ProConTable, AutoProductCTAs, ComparateurSelector, QuizEngine, ClassementList…).

**Données — TRADUIRE, ne PAS partager le FR :**

| FR | EN |
|---|---|
| `content/data/comparateurs.json` | `content/data/comparateurs.en.json` |
| `content/data/classements.json` | `content/data/classements.en.json` |
| `content/pages/quiz.yaml` | `content/pages/quiz.en.yaml` |
| `content/blog/[cat]/*.mdx` | `content/blog/en/[cat]/*.mdx` + mapping `lib/i18n/article-slugs.ts` |
| `content/produits/*.yaml` | libellés produits traduits (name/hook) |

**Garde-fou :** `tests/i18n-parity.test.ts` ÉCHOUE si une locale EN est active et que les données outils EN (comparateurs + classements) ne couvrent pas le FR. `vitest run` étant dans le filtre qualité, **la parité ne peut pas être oubliée**. Étendre ce test quand de nouvelles données localisables apparaissent.

## Classements (Top N) — asset GEO #1

La page `/classement/[produit]` est l'asset le plus citable en GEO. Règles :

- **Propriétaire de l'intent commercial** : le classement possède TOUT le cluster « meilleur X / top X / classement X / quels sont les meilleurs X » (même intent). Le **blog ne cible JAMAIS** ce terme tête → il couvre l'**informationnel** (comment choisir, X vs Y, prix, avantages/inconvénients, persona/use-case). Maillage blog → classement. À l'init, le mot-clé tête est **réservé** au classement et exclu du `calendrier-edito`. → zéro cannibalisation.
- **Riche & data-driven** : tout le contenu (TL;DR citable, `criteria`, `methodology`, `sources`, `faq`, et par item `verdict`/`pros`/`cons`/`bestFor`/`score`) vit dans `content/data/classements.json` (+ `.en`). Le template `ClassementList` est **bête** (lit le JSON, 0 JS, SSR). JSON-LD `ItemList` + `FAQPage`.
- **Personas = segments DANS la page** (badges « Meilleur pour … »), **jamais** des pages par persona (cannibalisation + thin).
- **Check SERP UNIQUEMENT à l'init** (via skills GEO) pour **remplir le JSON** (vraies entités, critères, personas, mot-clé tête). Le **runtime ne fait aucune recherche**. Étape **optionnelle et dégradable** : `generateStaticParams` = clés du JSON → **pas de données = pas de page, jamais de crash**. Ne JAMAIS mettre de logique SERP/recherche dans le runtime (anti-usine-à-gaz).

## Variantes de design & preview (dépublication)

Quand le système de variantes (home/catégorie/article) sera en place :
- **Choisir une variante = supprimer physiquement les autres** (le site forké ne contient QUE son style → anti-bloat + anti-empreinte réseau).
- Le **resolver n'importe que la variante retenue**. Unicité par : variante choisie + **permutations** (`sectionOrder`, `blocks` on/off, `heroStyle`, `shape` rounded/soft/sharp, bordures/ombres) + **tokens/fonts mutés**.
- Les routes de **preview** (`/preview/*`) sont **dev-only** : `noindex` + `robots disallow`, et **supprimées à l'init**.
- Un fork qui garde plusieurs variantes, une route `/preview/*`, ou un clone brut sans mutation = **bug d'init**.

## Rédaction de contenu (article, fiche produit, page, FAQ, brief, intro, newsletter…)

Sur tout trigger de rédaction (« rédige », « écris », « crée une page », « produis un brief », « relis »), **trois skills s'auto-déclenchent en parallèle** :

- `ton-of-voice` — applique la voix éditoriale du site (ou la définit via interview de 8 questions si `content/ton-of-voice.md` est vide).
- `seo-geo-redaction` — structure SEO + GEO (citabilité LLM, JSON-LD, FAQ, maillage).
- `humaniser-fr` — garde-fous anti-IA (mode production + review).

Avant la première ligne, ces trois skills internalisent leurs règles. Pas de travail manuel.
Un article rédigé/upgradé côté FR doit l'être aussi côté EN (cf. « Parité FR⇄EN ») : même gabarit, miroir EN + mapping de slug.
Le blog reste **informationnel** : il ne double jamais le classement (cf. « Classements »).

Lire aussi `docs/AUTHOR-[slug].md` si l'article a un auteur dédié.

## Projet
Moteur de sites éditoriaux multi-niches · Stack : Next.js ~16.2.1 + Tailwind v4 + TypeScript strict
Langue : FR par défaut · i18n piloté par niche.config.ts (locales/market) — cf. skills/init-site
Configuration centralisée dans `niche.config.ts`

## Rendu serveur (SEO) — JS minimal, HTML complet
Tout le contenu (home, comparateur, hub, articles) doit être dans le **HTML rendu serveur** : Server
Components par défaut, SSR/SSG, **JS minimal**. `curl -s <url>` doit retourner le H1 et le texte
**sans JS**. Animations en **CSS** — on ne cache JAMAIS du contenu en attendant le JS. `'use client'`
seulement pour un îlot interactif isolé (toggle thème, menu mobile, carousel) — jamais sur `page.tsx`,
jamais pour *afficher* du contenu.
**Port Voltéo** : on reproduit la structure en **RSC + `next/image`** ; les scripts statiques de Voltéo
(`main.js`, `home.js`, compteurs, read-progress, theme-switch…) **ne sont PAS repris tels quels** —
le décoratif passe en CSS, le vraiment interactif devient un petit client component isolé.

## DA & images
DA : typographie configurable · effets CSS · SVG inline · composition selon `niche.style.mode`
Toute section visuellement vide est un bug de DA. Claude Code a toute latitude — documenter dans DECISIONS.md.

## DA à l'init (sans livrable Claude Design)
Lors d'un init (`configure-from-spec` OU `init-site`), si `design-incoming/` est vide, **NE JAMAIS garder
la palette/fonts par défaut** de `niche.config.ts`.
Exécuter **`docs/AUTO-DESIGN.md`** : **choisir un skin Voltéo** (V1–V4) + un **template** (comparateur/
magazine) + une **verticale**, **reproduire la STRUCTURE** des pages de référence
(`docs/design-reference/volteo/DESIGN-NOTES.md` §0), copier le **bloc prêt à coller** (§5), reporter
rayons/correctifs dans `app/globals.css`, puis **muter** (teinte/fonts/rayons — anti-footprint).
Source design **unique** : `docs/design-reference/volteo/`. Un site qui sort de l'init avec le thème
par défaut, **en structure par défaut**, **ou en clone brut d'un skin**, est un **bug d'init**.

## Images — SOBRE à l'init (plafond strict)
À l'init, après AUTO-DESIGN, générer **AU PLUS ~5 images** : le(s) visuel(s) du **hero** de la home +
la **couverture du hub** `/blog`. **INTERDIT** de générer une image par catégorie ni par article à
l'init (sur-génération = lent, coûteux, générique). Le reste se génère **à la demande** (fine-tuning)
ou par la **tâche de rédaction quotidienne** (`cover` + `mid` d'article). Mieux vaut **5 images bien
placées que 15 fades**. `next/image` uniquement · `alt` descriptif FR + EN. Cf. `docs/IMAGES-WORKFLOW.md`.

## Assets autorisés
Images : `public/images/` (structurelles) · `public/blog/[categorie]/[slug]/` (articles) — générées (IA) ou commitées
Utiliser `next/image` avec `alt` descriptif pour toutes les images éditoriales
Icônes : lucide-react · SVG inline pour éléments décoratifs
OG : générées via app/opengraph-image.tsx
Jamais : picsum · unsplash · placeholder.com · images hotlinkées depuis un CDN tiers

## Fonts
Next.js variables : `--next-font-primary` · `--next-font-display` · `--next-font-mono` (via next/font)
Défaut Voltéo V1 : Hanken Grotesk (primary) + Bricolage Grotesque (display). `--font-body`/`--font-display`
(design-system Voltéo) sont branchées dessus dans `app/styles/volteo.css`.

## Liens affiliés
TOUT lien Amazon dans le code ou le contenu MDX doit passer par addAffiliateTag() ou le composant <AffiliateLink>.
Plugin remark actif sur tous les fichiers MDX.
Tag affilié configuré dans `niche.config.ts`.

## Configuration centralisée
`niche.config.ts` est le fichier maître. Tous les composants, configs et pages en dépendent.
Pour personnaliser un site : modifier uniquement `niche.config.ts`, pas les composants.

## Comportement
- Tâche 3+ étapes → plan tasks/todo.md avant
- Blocage → STOP + re-plan
- Correction → tasks/lessons.md immédiatement
- Done → prouver avant de marquer

## Filtre qualité — avant chaque commit
- [ ] tsc --noEmit · next lint · vitest run
- [ ] **Parité FR⇄EN** : tout changement FR répliqué en EN (routes + composants `locale`-aware + données outils) · `tests/i18n-parity.test.ts` vert
- [ ] Images via next/image uniquement (pas de `<img>` nu) · alt obligatoire · **≤ ~5 images à l'init**
- [ ] **curl -s retourne le H1 + le contenu SANS JS** (rendu serveur, JS minimal)
- [ ] Variables CSS · zéro hardcode · composants < 150 lignes
- [ ] Secrets hors repo · CSP sans unsafe-eval
- [ ] zéro fonts.googleapis.com · adjustFontFallback:true
- [ ] Article : byline + AuthorCard + JSON-LD author (sans photo)
- [ ] Tous les liens Amazon passent par addAffiliateTag() ou <AffiliateLink>
- [ ] Structure Voltéo reproduite (home/hub/article) — pas le squelette par défaut
- [ ] prefers-reduced-motion respecté sur toutes les animations
- [ ] Contraste texte/fond vérifié pour chaque effet DA (selon le mode clair/sombre)
- [ ] middleware.ts présent et actif

## Git
Jamais direct sur main · feature = branche = PR · Conventional Commits anglais
Branches : feature/ · fix/ · content/

## Code
TS strict · HTML sémantique · params Promise await
Jamais 'use client' sur page.tsx · getData() serveur · fetch cache explicite
Jamais d'event handler (onXxx) dans un Server Component — CSS :hover ou extraire 'use client'

## Fin de session
git add PROGRESS.md DECISIONS.md && git commit -m "docs: update PROGRESS and DECISIONS"
Pusher branche courante — jamais main.
