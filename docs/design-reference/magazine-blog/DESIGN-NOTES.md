# DESIGN-NOTES — Magazine / Blog informationnel (barre qualité)

Deuxième archétype, à côté du comparateur (`../comparateur-energie/`). Sert de niveau cible
quand l'init compose une DA pour un site **éditorial / informationnel** (pas transactionnel).
Reproduire la **rigueur**, pas les couleurs.

## Philosophie

Contenu d'abord. La confiance vient de la **typographie** et du **blanc**, pas d'un visuel
produit. Sensation « kiosque / rédaction » : titres forts, hiérarchie nette, lecture confortable.
La home n'a PAS de formulaire de comparaison ni d'estimateur — elle met en avant des **articles**.

## Couleurs

Palette retenue (souvent neutres + 1 accent éditorial). Le fond peut être clair (crème/blanc cassé
+ encre) ou affirmé, mais reste sobre : la couleur ponctue (catégories, liens, accents), elle ne
sature pas. Une couleur par catégorie en **petits tags**, pas en aplats.

## Typographie (le cœur de l'archétype)

La typo EST le design. Contraste fort : un display à caractère (serif éditorial « Playfair/
Fraunces »-like, ou grotesque expressif) pour les titres d'articles + un body très lisible. Gros
titres d'articles, interlignage généreux, mesure de lecture ~65-75 caractères.

## Pattern de home (magazine)

1. **Bandeau ticker** des derniers articles (optionnel) — `ArticleTicker`.
2. **Article à la une** : un grand featured + grille des suivants — `RecentArticles` (fait
   déjà exactement ça : featured 2 cols + grille).
3. **Rails par catégorie / rubriques** — `CategorySection`.
4. **Masonry / grille éditoriale** pour explorer — `ArticleMasonry`.
5. **Auteur / à propos** (autorité éditoriale) — `AuthorTeaser`.
6. **Newsletter**.
Pas de : hero quick-form, estimateur à sliders, table d'offres, bandeau « N fournisseurs ».

## Sections home (niche.config.ts.homeSections)

Archétype magazine → mener avec l'éditorial :
`homeSections: ['ticker', 'articles', 'categories', 'author']`
(à comparer au comparateur : `['ticker', 'deals', 'articles', 'categories', 'tools', 'author']`).
Le hero penche `centered` ou `minimal` (éditorial), pas `split` avec visuel produit.

## Motion

Sobre. Révélations douces au scroll, pas d'animations « produit ». `prefers-reduced-motion`
respecté.

## Comment s'en servir comme barre qualité

- typo à fort contraste display/body, titres d'articles généreux ;
- home menée par un **article à la une** + grille, pas par un outil ;
- couleur sobre qui ponctue, une teinte par rubrique en petit tag ;
- blanc et hiérarchie comme matière première ;
- aucune section vide ou plate.
