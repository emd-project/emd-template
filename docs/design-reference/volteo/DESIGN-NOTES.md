# Voltéo — Notes de fabrique (maquettes de référence)

> **MATIÈRE DE PORTAGE HUMAIN — ce document n'est PLUS dans le chemin d'init.**
> Aucun agent d'init ne doit le lire ni le suivre. **La doctrine tokens vit dans
> [`docs/AUTO-DESIGN.md`](../../AUTO-DESIGN.md)** (source unique `niche.config.palette` → `globals.css`,
> `volteo.css :root` = alias only). Ce fichier ne sert qu'aux **sessions humaines de portage** :
> transformer un traitement vu dans une maquette HTML en variante/permutation du moteur.

## Ce que contient `docs/design-reference/volteo/`

Des **maquettes HTML statiques**, historiquement produites comme barres de qualité, aujourd'hui
utilisées comme **réservoir de traitements** à porter dans les composants RSC :

- `home-comparateur-V1..V4` + `home-comparateur-marche` — 4 traitements de home comparateur
  (hero split + carte, steps, stats) + la variante « marché » (orbites/chips, ticker, tableau du
  marché, spotlight n°1).
- `home-magazine-V1..V4` + `home-magazine-fil` — 4 traitements de home magazine (une à la une,
  grilles, mosaïques) + la variante « fil » (flux continu).
- `home-portail-V1..V4` — traitements portail.
- `hub-categorie-V1..V4` — 4 traitements de hub/page catégorie.
- `article` — gabarit d'article long-form.

Chaque série montre des **TRAITEMENTS différents** du même type de page : hero, ordre et présence
des sections, animations, densité, gestion des cartes (border-top, watermark, mosaïque vs grille).
C'est la matière première : on **étudie**, on **repère un traitement** qui manque au moteur, on le
**porte** en composant/variante — on ne copie jamais une maquette telle quelle dans un site.

## Comment s'en servir (session de portage)

1. Identifier dans une maquette un traitement absent du système de variantes
   (`lib/variants.ts`, `components/home/*`, `components/blog/*`).
2. Le porter en **composant réutilisable** piloté par tokens (`--accent-*`, `--bg-*`, `--radius-*`) —
   jamais de valeurs en dur, jamais rien dans `volteo.css :root` (couche d'alias).
3. L'exposer comme variante ou permutation dans `lib/variants.ts` si le traitement est structurel.
4. Vérifier le rendu dans les deux modes s'il touche au chrome (cf. `app/styles/volteo-chrome.css`).

## Historique (pour comprendre les fossiles)

Les notions de « skin V1–V4 prêt à coller », de « recombinaison manuelle des variantes » et d'« init
en deux phases avec preview validé par l'utilisateur » sont **abandonnées** : l'init est full-auto
(sélection déterministe — cf. `docs/AUTO-DESIGN.md`). Si une maquette ou un commentaire y fait encore
référence, c'est un fossile de cette époque, pas une consigne.
