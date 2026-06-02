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

## Skills locaux
Voir [`skills/README.md`](skills/README.md) pour la liste des skills bundlés avec le template.

## DA & images
DA : typographie configurable · effets aurora/noise CSS · SVG inline · composition dark bold
Toute section visuellement vide est un bug de DA. Claude Code a toute latitude — documenter dans DECISIONS.md.

## DA à l'init (sans livrable Claude Design)
Lors d'un init (`configure-from-spec` OU `init-site`), si aucun livrable Claude Design n'est fourni
(`design-incoming/` vide), **NE JAMAIS garder la palette/fonts par défaut** de `niche.config.ts`
(rouge `#FF3D57`, fonts Unbounded/Space Grotesk). Exécuter **`docs/AUTO-DESIGN.md`** : composer une
vraie DA depuis `lib/da-presets/` (`composePreset()`) en s'inspirant de la barre qualité
`docs/design-reference/comparateur-energie/`, puis écrire palette + fonts + `niche.style` + `niche.signature`.
Un site qui sort de l'init avec le thème par défaut est un **bug d'init**.

## Assets autorisés
Images : `public/images/` — uploadées via le CMS ou commitées directement
Utiliser `next/image` avec `alt` descriptif pour toutes les images éditoriales
Icônes : lucide-react · SVG inline pour éléments décoratifs
OG : générées via app/opengraph-image.tsx
Jamais : picsum · unsplash · placeholder.com · images hotlinkées depuis un CDN tiers

## Fonts
Next.js variables : `--next-font-primary` (Space Grotesk) · `--next-font-display` (configurable) · `--next-font-mono` (JetBrains Mono)
Tailwind theme : `--font-primary` → `var(--next-font-primary)` · idem pour display et mono

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
- [ ] Images via next/image uniquement (pas de `<img>` nu) · alt obligatoire
- [ ] Variables CSS · zéro hardcode · composants < 150 lignes
- [ ] Secrets hors repo · CSP sans unsafe-eval
- [ ] zéro fonts.googleapis.com · adjustFontFallback:true
- [ ] Article : byline + AuthorCard + JSON-LD author (sans photo)
- [ ] Tous les liens Amazon passent par addAffiliateTag() ou <AffiliateLink>
- [ ] curl retourne H1 sans JS
- [ ] Chaque section a un fond traité documenté dans DECISIONS.md
- [ ] prefers-reduced-motion respecté sur toutes les animations
- [ ] Contraste texte/fond vérifié pour chaque effet DA (dark-only)
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
