# Claude Code — emd-template

## Premier réflexe à chaque session

1. Lire **PROGRESS.md** et `/docs/` selon la tâche en cours.
2. Si `design-incoming/` contient des fichiers → le skill `integrate-claude-design` prend le relais. **Ne JAMAIS** proposer un questionnaire d'init.
3. Si `design-incoming/` est vide → demander à l'utilisateur ce qu'il veut faire. Pas de séquence d'init automatique.

## Parité FR ⇄ EN (OBLIGATOIRE)

Le site est bilingue (FR par défaut + EN sous `/en`). **Toute modification côté FR doit être répliquée côté EN dans le MÊME commit** — code ET données. Une tâche « fix » / rédaction qui change le FR sans toucher l'EN est un **bug** (les gabarits divergent).

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
| `auteurs/[slug]/` | `en/auteurs/[slug]/` |
| `mentions-legales/` | `en/legal-notice/` (slug différent) |
| `confidentialite/` | `en/privacy/` (slug différent) |
| `[article]/` (standalone) | `en/[article]/` *(à créer si absent)* |

> La route `/deals` est **désactivée par défaut** (`niche.config.deals.enabled === false`, modèle MENTION) : la page rend `notFound()`, le lien disparaît de la nav et du sitemap. Ne pas la (re)mettre en avant.

**Composants à libellés :** prop `locale` + `tl(locale, …)`, **jamais de FR en dur**. Un composant rendu sur `/en` reçoit `locale="en"` (Nav, Footer, AISummarize, AuthorByline/Card, Pagination, ToolCTA, Warning, ProConTable, ComparateurSelector, QuizEngine, ClassementList…).

**Données — TRADUIRE, ne PAS partager le FR :**

| FR | EN |
|---|---|
| `content/data/comparateurs.json` | `content/data/comparateurs.en.json` |
| `content/data/classements.json` | `content/data/classements.en.json` |
| `content/data/choisir.json` | `content/data/choisir.en.json` |
| `content/pages/quiz.yaml` | `content/pages/quiz.en.yaml` |
| `content/blog/[cat]/*.mdx` | `content/blog/en/[cat]/*.mdx` + mapping `lib/i18n/article-slugs.ts` |

**Garde-fou :** `tests/i18n-parity.test.ts` ÉCHOUE si une locale EN est active et que les données outils EN (comparateurs + classements) ne couvrent pas le FR. `vitest run` étant dans le filtre qualité, **la parité ne peut pas être oubliée**.

## Monétisation — par la MENTION (AUCUNE affiliation)

Le modèle économique EMD = **vendre des mentions** : une marque paie pour être **citée favorablement** dans le contenu, qui alimente ensuite les réponses des LLM (GEO). **Il n'y a PAS d'affiliation.** La valeur d'une page = (1) être **citée par les LLM** et (2) **faire surgir des marques/modèles réels** (inventaire de mentions vendable). Taguer les marques/modèles + le persona dans le frontmatter.

> ⚠️ **L'appareillage d'affiliation a été SUPPRIMÉ du code** (composants `AffiliateLink`, `ProductCTA`,
> `AutoProductCTAs`, `ProductCarousel`, `StickyCTA`, `ProductAffiliate` ; `lib/utils/affiliate`,
> `lib/products`, `lib/article-ctas`, plugin remark ; champs `affiliateTag`/`defaultStore`,
> `stickyCta`/`stickyCtaMessage` ; page `/deals`). **NE PAS les réintroduire, NE PAS les utiliser dans les MDX**
> (un `<ProductCTA/>` dans un article casse le build : le composant n'existe plus). **Aucun lien marchand, aucun
> CTA d'achat, aucun prix barré.** Un lien produit LÉGITIME est **NEUTRE** : vers la source officielle / la page
> de la marque, `rel="noopener noreferrer nofollow"`, via le champ `url`/`sourceUrl` des données (rendu
> automatiquement par `ClassementList` et `ChoisirEditorial` — « Voir la fiche officielle → »). Pour orienter le
> lecteur : renvoyer vers un **outil interne** (`/comparer`, `/classement`, `/quiz`).

## Classements (Top N) & anti-cannibalisation — asset GEO #1

La page `/classement/[produit]` est l'asset le plus citable en GEO. Règles :

- **Frontière par SPÉCIFICITÉ de requête — un seul propriétaire par requête EXACTE :**

  | Requête | Asset propriétaire |
  |---|---|
  | head nu « les meilleurs X / top X / classement X » | **Classement** `/classement/X` (LA page rankée de référence) |
  | « meilleurs X pour [persona/usage] » (long-tail qualifié) | **Blog** — comparatif persona (cœur des mentions) |
  | « X vs Y » (2 items précis, face-à-face) | **Blog** |
  | « comparer X » côte à côte, multi-items interactif | **Comparateur** `/comparer/X` |
  | « quel X choisir / quel X pour moi » | **Choisir / Quiz** `/choisir/X`, `/quiz` |
  | comment / pourquoi / qu'est-ce que / prix / définition | **Blog** (informationnel) |

  Le **blog FAIT** des comparatifs marques/modèles (c'est le cœur des mentions, cf. `seo-geo-redaction`) : « meilleurs X **pour [persona]** », « X vs Y ». Il ne **duplique jamais le head nu** (« les meilleurs X » générique = page classement) et **maille vers** le classement. Pas deux pages sur la **même requête exacte**.
- **Réservation à l'init :** le **head nu** de chaque cluster est attribué au **classement** (et au comparateur pour le côte-à-côte). Le blog reçoit les **variantes persona/long-tail + face-à-face**. Cf. `content/mots-cles.md` (« requêtes à ÉVITER »).
- **Volume minimum : une page classement fait ≥ 1000 mots** (intro + `excerpt` court + `sections` H2-questions + TL;DR + `criteria` + `methodology` + `sources` + `faq` + par item `verdict`/`pros`/`cons`/`bestFor`). En dessous = thin, non citable → enrichir le JSON.
- **Riche & data-driven** : tout le contenu vit dans `content/data/classements.json` (+ `.en`). Le template `ClassementList` est **bête** (lit le JSON, 0 JS, SSR). JSON-LD `ItemList` + `FAQPage`.
- **Personas = segments DANS la page** (badges « Meilleur pour … »), **jamais** des pages par persona.
- **Check SERP UNIQUEMENT à l'init** (via skills GEO) pour **remplir le JSON**. Le **runtime ne fait aucune recherche**. `generateStaticParams` = clés du JSON → **pas de données = pas de page, jamais de crash**.

## Pages clés dérivées du classement (zéro placeholder)

À l'init, le **comparateur** (`content/data/comparateurs.json`), **/choisir** (`content/data/choisir.json`) et le **quiz** (`niche.config.quiz`) sont **dérivés des items du classement seed** (la recherche SERP est déjà faite). Un site ne sort jamais avec une page-coquille : soit la page est remplie, soit elle est désactivée (quiz : `enabled: false`). Aucune chaîne de gabarit (« Modèle A », « À définir », « Lorem ipsum ») ne survit à l'init.

## Variantes de design & preview (dépublication)

- **Choisir une variante = supprimer physiquement les autres** (anti-bloat + anti-empreinte). Resolver `niche.config.layouts` + permutations (`shape`/`border`/`shadow`) + tokens/fonts mutés. Cf. `docs/AUTO-DESIGN.md`, `lib/variants.ts`.
- **Le SECTEUR décide de la famille de home** (`homeFamily()`), le seed tranche dedans : Beauty/Mode → `presse` (identité éditoriale) ; Assurance/Banque/Énergie/Télécom → `comparateur` (⅔ `marche`, ⅓ `comparateur`) ; Voiture/Retail/Hospitality → `editorial` (⅔ `magazine`, ⅓ `fil`).
- Les routes **preview** (`/home-vN`, `/cat-vN`, `/art-vN`) sont **noindex** et **supprimées à l'init**. Un fork qui garde plusieurs variantes ou une preview = **bug d'init**.

## Rédaction de contenu (article, page, FAQ, brief, intro…)

Sur tout trigger de rédaction (« rédige », « écris », « crée une page », « produis un brief », « relis »), **trois skills s'auto-déclenchent en parallèle** :

- `ton-of-voice` — voix éditoriale du site.
- `seo-geo-redaction` — structure SEO + GEO + **modèle mention** (⅔ comparatifs marques/modèles déclinés persona / ⅓ info).
- `humaniser-fr` — garde-fous anti-IA.

Un article rédigé/upgradé côté FR doit l'être aussi côté EN (cf. « Parité FR⇄EN »). Composants MDX disponibles : `Tip`, `Warning`, `Verdict`, `PullQuote`, `CompareBar`/`CompareBarGroup`, `ProConTable`, `StatCard`/`StatRow`, `ArticleImage`, `ToolCTA`. **Pas de composant produit marchand** (supprimés — cf. « Monétisation »).

Lire aussi `docs/AUTHOR-[slug].md` si l'article a un auteur dédié.

## Projet
Moteur de sites éditoriaux multi-niches · Stack : Next.js ~16.2.1 + Tailwind v4 + TypeScript strict
Langue : FR par défaut · i18n piloté par niche.config.ts (locales/market) — cf. skills/init-site

## Rendu serveur (SEO) — JS minimal, HTML complet
Tout le contenu doit être dans le **HTML rendu serveur** : Server Components par défaut, SSR/SSG, **JS minimal**.
`curl -s <url>` doit retourner le H1 et le texte **sans JS**. Animations en **CSS**. `'use client'` seulement pour
un îlot interactif isolé — jamais sur `page.tsx`, jamais pour *afficher* du contenu.

## DA à l'init (sans livrable Claude Design)
Si `design-incoming/` est vide, **NE JAMAIS garder la palette/fonts par défaut**. Exécuter **`docs/AUTO-DESIGN.md`** :
famille de home via `homeFamily(secteur)` + variante via `suggestVariants(domaine, famille)` + permutations
(`shape`/`border`/`shadow`), palette via `niche.config.palette` → `globals.css`, typo via `suggestFonts`
(`lib/typography.ts`) → `layout.tsx`. Un site qui sort avec le thème par défaut, sans variante choisie, ou avec
une valeur écrite dans `volteo.css :root` = **bug d'init**.

## Images — registre `lib/image-slots.ts` (aucun slot oublié)
La checklist d'images est **`getAllImageSlots()`** (source unique, dérivée de `niche.config.categories`/`author`) :
hero home, **les 2 slots par catégorie**, avatar auteur, + **1 cover par article seed**. Génération **une par une,
à la fin** de l'init (cf. `docs/IMAGES-WORKFLOW.md`). La tâche quotidienne génère **1 cover + 2 in-content
réutilisées**. `next/image` uniquement · `alt` FR + EN.

## Assets autorisés
Images : `public/images/` (structurelles) · `public/blog/[categorie]/[slug]/` (articles). `next/image` + `alt`.
Icônes : lucide-react · SVG inline. OG : `app/opengraph-image.tsx`. Jamais : picsum/unsplash/placeholder.com/hotlink CDN tiers.

## Fonts
`--next-font-primary` · `--next-font-display` · `--next-font-mono` (next/font). Défaut V1 : Hanken Grotesk + Bricolage Grotesque.
Pool typo : `lib/typography.ts` (`suggestFonts`).

## Configuration centralisée
`niche.config.ts` est le fichier maître. Pour personnaliser un site : modifier uniquement `niche.config.ts`, pas les composants.

## Comportement
- Tâche 3+ étapes → plan tasks/todo.md avant · Blocage → STOP + re-plan · Correction → tasks/lessons.md · Done → prouver avant de marquer

## Filtre qualité — avant chaque commit
- [ ] tsc --noEmit · next lint · vitest run
- [ ] **Parité FR⇄EN** : tout changement FR répliqué en EN · `tests/i18n-parity.test.ts` vert
- [ ] **Modèle mention, AUCUNE affiliation** : aucun composant/lien produit marchand · marques/modèles + persona tagués · liens produits NEUTRES (source officielle)
- [ ] **Anti-cannibalisation** : aucun article blog ne duplique le **head nu** d'un asset (« les meilleurs X / top X » → classement) ; comparatifs persona/long-tail + « X vs Y » OK
- [ ] Images via next/image uniquement · alt obligatoire · registre `getAllImageSlots`
- [ ] **curl -s retourne le H1 + le contenu SANS JS**
- [ ] Variables CSS · zéro hardcode · composants < 150 lignes
- [ ] Page classement ≥ 1000 mots (sinon enrichir le JSON)
- [ ] Article : byline + AuthorCard + JSON-LD author (sans photo)
- [ ] prefers-reduced-motion respecté · contraste AA selon le mode

## Git
Jamais direct sur main · feature = branche = PR · Conventional Commits anglais

## Code
TS strict · HTML sémantique · params Promise await · Jamais 'use client' sur page.tsx · jamais d'event handler dans un Server Component

## Fin de session
git add PROGRESS.md DECISIONS.md && git commit -m "docs: update PROGRESS and DECISIONS"
