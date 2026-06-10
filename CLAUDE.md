# Claude Code — emd-template

## Premier réflexe à chaque session

1. Lire **PROGRESS.md** et `/docs/` selon la tâche en cours.
2. Si `design-incoming/` contient des fichiers → le skill `integrate-claude-design` prend le relais. **Ne JAMAIS** proposer un questionnaire d'init.
3. Si `design-incoming/` est vide → demander à l'utilisateur ce qu'il veut faire. Pas de séquence d'init automatique.

## Rédaction de contenu (article, fiche produit, page, FAQ, brief, intro, newsletter…)

Sur tout trigger de rédaction (« rédige », « écris », « crée une page », « produis un brief », « relis »), **trois skills s'auto-déclenchent en parallèle** :

- `ton-of-voice` — applique la voix éditoriale du site (ou la définit via interview de 8 questions si `content/ton-of-voice.md` est vide).
- `seo-geo-redaction` — structure SEO + GEO (citabilité LLM, JSON-LD, FAQ, maillage).
- `humaniser-fr` — garde-fous anti-IA (mode production + review).

Avant la première ligne, ces trois skills internalisent leurs règles. Pas de travail manuel.

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
