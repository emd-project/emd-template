# DESIGN-NOTES — Comparateur énergie (barre qualité)

Extraction distillée de la maquette « Voltéo ». Sert de **niveau cible** quand l'init compose
une DA automatiquement (cf. `docs/AUTO-DESIGN.md`). Ce n'est pas la seule DA possible : c'est un
exemple de DA *aboutie* dont il faut reproduire la **rigueur**, pas les couleurs exactes.

## Philosophie

DA « éditorial chaleureux + confiance ». Mode clair, fond crème (jamais blanc pur), encre
profonde presque-noire. L'objectif émotionnel d'un comparateur : clarté, neutralité, sérieux
rassurant. Aucune section n'est vide ou plate — chaque bloc a un fond traité, une carte, une
profondeur. Le « beau » vient de la cohérence du système, pas d'effets gratuits.

## Système de couleurs (le cœur)

Trois familles, à reproduire pour n'importe quelle niche :

1. **Neutres chauds** — fond (`cream`), fond secondaire (`cream-2`), papier (`paper`, pour les
   cartes), encre (`ink`), encre-2 et encre-3 (textes secondaires). Le fond n'est PAS blanc :
   c'est une teinte douce qui réchauffe toute la page.
2. **Un accent de marque** + sa version foncée + une version « soft » (tint pâle pour les fonds
   de badges/icônes). C'est la couleur signature du site.
3. **Une couleur par catégorie** (ici : élec/gaz/vert/eau/mobilité), chacune avec sa version
   « soft ». C'est ce qui rend un comparateur lisible : chaque univers a son code couleur,
   réutilisé dans les badges, icônes de cartes, pips, lignes.

Règle d'or : chaque couleur vive a toujours une variante « soft » associée pour les fonds.

## Typographie

Deux familles : un **display grotesque** expressif pour les titres (poids 700-800, tracking
serré ~-0.02em à -0.035em, `text-wrap: balance`) et un **body grotesque** lisible pour le texte
(400-700). Hiérarchie franche : H1 clamp(40-72px), H2 clamp(32-50px), corps 16-19px, line-height
généreux (1.6 sur le corps). Les eyebrows sont en petites capitales espacées (.12em) avec un
petit trait avant.

## Forme & profondeur

Rayons généreux et variés : `10px` (champs), `16px` (cartes moyennes), `24px` (grandes cartes),
`34px` (blocs hero/outil). Boutons **pill** (rayon 100px). Trois niveaux d'ombre douce et basse
(jamais d'ombre dure). Bordures fines `1px` couleur ligne sur fond papier. Cartes blanches
posées sur fond crème = lisibilité maximale.

## Motion (sobre, jamais clinquant)

- `reveal` au scroll : translateY(28px)+opacity, cubic-bezier doux, délais en cascade (d1..d5).
- micro-flottement (`bob`) sur les cartes du visuel hero.
- marquee horizontal lent pour la bande de confiance (logos/fournisseurs).
- **`prefers-reduced-motion` respecté** : tout figé, pas de scroll smooth.

## Patterns de sections (home d'un comparateur)

1. **Hero split** : à gauche eyebrow + H1 (avec mot surligné) + sous-titre chiffré + **mini-form
   de comparaison** (2 champs + CTA + note de réassurance). À droite, **visuel produit** :
   carte « facture optimisée » flottante + mini-carte + chip d'économie verte. Fond : blobs
   floutés animés (pas d'aurora).
2. **Bande de confiance** : « N fournisseurs comparés » + marquee de noms.
3. **Cartes catégories** : grille 3 colonnes, une couleur par catégorie (icône en tint soft,
   glow au hover, lien « Comparer → »).
4. **Comment ça marche** : 3 étapes numérotées reliées par une ligne pointillée.
5. **Outil estimateur** : bloc sombre (inverse du reste), sliders + toggles à gauche, carte
   résultat chiffrée à droite (gros chiffre d'économie en vert).
6. **Table comparative** : onglets par catégorie + cartes d'offres, une carte « best » mise en
   avant (bordure accent + badge).
7. **Stats** : bande pleine couleur accent, 4 chiffres animés.
8. **Quiz teaser** : carte sombre + aperçu d'une question.
9. **Blog teaser** : 3 cartes d'articles.
10. **Newsletter** : bloc plein (vert), formulaire centré.
11. **Footer** sombre riche : marque + 3-4 colonnes + social.

## Variantes d'ambiance

La maquette propose 3 palettes interchangeables (électrique/néon/solaire) via `data-theme`.
À l'init, on n'en garde qu'UNE (celle qui colle à la niche), mais le principe — un accent
pivot + neutres chauds cohérents — reste.

## Comment s'en servir comme barre qualité

Quand l'init compose une DA (cf. `AUTO-DESIGN.md`), viser CE niveau de finition :
- fond teinté (jamais blanc pur), cartes papier, profondeur douce ;
- un accent + une couleur par catégorie, chacune avec sa version soft ;
- display expressif vs body lisible, hiérarchie franche ;
- chaque section a un fond traité et au moins un élément « vivant » (carte, visuel, chiffre) ;
- motion sobre + reduced-motion respecté.
Reproduire la **rigueur du système**, en adaptant les teintes/fonts au preset de la niche.
