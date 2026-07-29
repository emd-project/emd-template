# design-reference — statut réel (audit du 27/07/2026)

> **Ce dossier n'est PAS sur le chemin d'init.** Aucun agent de provisionnement ne doit le lire pour
> produire un site. La DA à l'init se décide avec `docs/AUTO-DESIGN.md` + `lib/niche-classify.ts` +
> `lib/variants.ts` + `lib/typography.ts` + `docs/DA-DIRECTIONS.md`. Point.
>
> Ce dossier est un **réservoir de portage** : une réserve de mises en page déjà dessinées, dans
> laquelle un humain (ou un agent explicitement mandaté pour un chantier de composants) vient puiser.

---

## Ce qu'il y a dedans, honnêtement

### `volteo/` — la seule matière réelle, déjà exploitée à ~80 %

Maquettes HTML statiques autonomes + un design system CSS en variables. Zéro dépendance externe
(pas de framework, pas de CDN, pas d'image binaire, visuels en SVG inline).

**21 fichiers HTML = 7 documents distincts.** Les séries `-V1/-V2/-V3/-V4` sont **byte-identiques** :
seule change la 3ᵉ balise `<link>` (`theme-vN.css`). Les « 4 traitements de home » n'existent pas —
c'est **1 traitement × 4 palettes**. Toute l'information de skin est dans les 4 `assets/theme-*.css`.

| Document distinct | Statut | Déjà porté dans le template ? |
|---|---|---|
| `home-comparateur` (+3 clones) | rend (table d'offres vide) | ✅ `ComparateurHome` |
| `home-magazine` (+3 clones) | rend | ✅ `MagazineHome` |
| `home-comparateur-marche` | ⚠️ **sans style** (`assets/marche.css` absent) | ✅ `MarcheHome` |
| `home-magazine-fil` | ⚠️ **sans style** (`assets/fil.css` absent) | ✅ `FilHome` |
| `home-portail` / `home-v2` (+3 clones) | ⚠️ **sans style** (`assets/home-v2.css` absent) | ❌ **non porté** |
| `hub-categorie` (+3 clones) | rend (filtres morts) | ✅ hubs blog / catégorie |
| `article` | rend (TOC scrollspy mort) | ✅ `ArticleView` |

**6 assets sont référencés mais absents** du repo : `marche.css`, `fil.css`, `home-v2.css`, `home.js`,
`hub.js`, `article.js`. Conséquence : les maquettes les plus intéressantes ne sont plus lisibles que
comme **structure HTML**, pas comme rendu. Les porter, c'est **redessiner**, pas recopier.

### Ce qui reste RÉELLEMENT à prendre

Tout le reste est déjà dans le template. Ce qui n'y est pas :

1. **Archétype de home « deux portes »** (`.doors` / `.door-num` / `.door-cta`, dans `home-portail`) —
   une page-carrefour sans conversion, deux cartes-liens géantes numérotées vers deux univers.
   **C'est une 6ᵉ variante de home entière**, et c'est le meilleur candidat : la famille `comparateur`
   n'a qu'un pool de 2 variantes, ce qui fabrique mécaniquement des sites jumeaux.
2. **Hero purement typographique** (`.portal-intro`) — les 5 homes ont toutes un hero avec visuel.
3. **Feature horizontal pleine largeur** intercalé entre deux rubriques (`.mag-feature`).
4. **Carte-quiz illustrative en CTA** (`.quiz-cta`) — statique, décoratif, sans blocage.
5. **Mini bar-chart de prix dans une carte** (`.compare-vis`) — à ne pas confondre avec `CompareBar`,
   qui est un composant MDX d'article.
6. **Marquee de marques** (`.marquee-track`) — ⚠️ `components/effects/MarqueeStrip.tsx` **existe déjà
   et n'est importé nulle part** ; il ne manque qu'une source de données « marques ».
7. *(Optionnel, client component)* **Estimateur à curseurs** (`.tool-grid`) — le seul élément du corpus
   qui exige `'use client'`. Aucun `input[type=range]` n'existe aujourd'hui dans le repo.

**À ne PAS porter** : le comparatif à onglets (le corps du tableau est vide, `home.js` étant absent :
il n'y a aucun design à reprendre) · le load-more du hub (régression SEO/RSC vs pagination serveur) ·
les compteurs de réseaux sociaux (chiffres qu'un site neuf n'a pas) · le theme-switcher `localStorage`
(contraire à la règle « un site est light OU dark, FIXE »).

**Pièges de portage** : Voltéo nomme ses tokens `--primary`/`--ink`/`--cream`/`--cat-1..5` (le template
utilise `--accent-*`/`--bg-*`) et **utilise `--ink` à la fois comme couleur de texte et comme fond**, ce
qui casse en sombre — `theme-v4` le rattrape par ~30 correctifs et `theme-v3` par ~25 `!important`.
**Ne pas reproduire** : un fond inversé doit passer par un token dédié. Enfin `theme-v3` repose sur
**Helvetica Neue**, police système non-Google : rendu non déterministe hors macOS.

### `magazine-blog/`, `klarolab/`, `beam-projecteur/`, `robot-tondeuse/` — ARCHIVE, ne pas lire

Ces 4 dossiers ne contiennent **aucune maquette, aucun code, aucune capture** : uniquement de la prose
d'ambiance (8 Ko au total). Ils décrivent des atmosphères et des techniques d'animation, pas des mises
en page — matière première nulle pour un catalogue de sections.

⚠️ **`magazine-blog/DESIGN-NOTES.md` est activement trompeur** : il décrit une API morte
(`niche.config.homeSections`, `ArticleTicker`, `RecentArticles`, `ArticleMasonry`, `CategorySection`,
`AuthorTeaser`) — tous supprimés. Son contenu a été remplacé par une pierre tombale.

**Les seules idées à ne pas perdre** (le reste est à réinventer de toute façon, les notes elles-mêmes
interdisant la copie) :
- `--intensity` (0→1) comme **curseur d'ambiance unique** pilotant glow + grain + scanlines (*beam*) ;
- **stats tabulaires en chiffres mono `font-variant-numeric: tabular-nums`** (*klarolab*) ;
- **masonry éditorial** et **bloc auteur/autorité en home** (*magazine-blog*) — les deux seules sections
  de ce fichier réellement absentes du template.

> Ces 4 dossiers ne peuvent pas être supprimés par un agent (l'outil GitHub disponible écrit et écrase,
> il ne supprime pas ; et on ne veut pas de workflow CI pour ça). **Suppression à faire à la main**, ainsi
> que celle des 14 clones `-V2/-V3/-V4` de `volteo/` (garder un fichier par layout distinct + les 4
> `assets/theme-*.css`, qui portent toute l'information de skin).

---

## Contradiction levée

L'ancienne version de ce README présentait `volteo/` comme « source canonique lue à l'init », alors que
`volteo/DESIGN-NOTES.md` dit en tête l'exact inverse (« ce document n'est PLUS dans le chemin d'init,
aucun agent d'init ne doit le lire »). **C'est `DESIGN-NOTES.md` qui a raison.** Ce dossier est une
réserve de portage, pas une doctrine.
