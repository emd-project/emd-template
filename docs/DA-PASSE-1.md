# Passe 1 — câbler l'échelle typographique

> **À exécuter dans une session Claude Code avec un clone local**, parce que
> chaque étape se vérifie à l'œil sur des captures. Cette passe ne se fait pas
> à l'aveugle : voir § « Ce que ce n'est PAS ».

## Objectif

Remplacer les **~171 `font-size` en dur** (9 fichiers CSS, zéro token) par
l'échelle de [`app/styles/volteo-scale.css`](../app/styles/volteo-scale.css),
afin que `--fs-ratio` et `--space-unit` deviennent des **axes réellement
variables** d'un site à l'autre.

## Ce que ce n'est PAS

**Ce n'est pas un refactor neutre.** Le pipeline porte ~25 tailles distinctes,
demi-pixels compris (`14.5px`, `15.5px`, `12.5px`, `16.5px`, `13.5px`…), issues
d'ajustements successifs. Les ramener sur **8 crans** va **changer la taille de
certains éléments**.

C'est le résultat recherché — un rythme régulier est précisément ce qu'une
échelle apporte, et l'irrégularité actuelle n'est pas un choix de design mais
une sédimentation. Mais ça veut dire qu'**on ne peut pas câbler sans regarder**.

## Correspondance (ratio 1.25, base 17px)

| Token | ≈ rendu | Absorbe les valeurs actuelles | Usages types |
|---|---|---|---|
| `--fs-3xs` | ~8.7px | — | (réserve) |
| `--fs-2xs` | ~10.9px | 10 · 10.5 · 11 · 11.5 | `.cmp-new`, `.cmp-cell-label`, `th`, `.pop .pmeta` |
| `--fs-xs` | ~12.1px | 12 · 12.5 | `.md-updated`, `.post-meta`, `.rub-n`, `.toc-title` |
| `--fs-sm` | ~13.6px | 13 · 13.5 · 14 · 14.5 | `.tag`, `.eyebrow`, `.seeall`, `.side-news p`, `td` |
| `--fs-md` | 17px | 15 · 15.5 · 16 · 16.5 · 17 | corps, `.btn`, `.nav-links a`, `.chip` |
| `--fs-lg` | ~21.3px | 18 · 19 · 20 · 21 · 22 | `.post h3`, `.lead-art h3`, `.cat h3`, `.mstep h3` |
| `--fs-xl` | ~26.6px | 25 · 26 | `.pop .rank`, `.list-head h3`, `.promo h4` |
| `--fs-2xl` | ~33.2px | 30 | `.trd .trn`, `.mobile-menu a` |
| `--fs-3xl` | ~41.5px | 38 · 46 | bornes hautes des `clamp()` |

> **Le point de tension est `--fs-md`.** Il absorbe la grappe 15–17 : boutons,
> liens de nav et chips **grossissent** de 1 à 2px. C'est le changement le plus
> visible de la passe. Si le rendu se dégrade, la réponse n'est PAS de
> réintroduire `15.5px` — c'est de descendre ces éléments à `--fs-sm`.

## Ordre d'exécution

Un fichier à la fois. **Captures entre chaque.** Ordre choisi du moins au plus
risqué (surface visible croissante) :

| # | Fichier | ~`font-size` | Note |
|---|---|---|---|
| 1 | `volteo-article.css` | 7 | petite surface, bon rodage |
| 2 | `volteo-hub.css` | 12 | ⚠️ contient aussi 2 valeurs de palette à déplacer |
| 3 | `volteo.css` | 20 | base partagée → impacte tout |
| 4 | `volteo-magazine.css` | 23 | home par défaut |
| 5 | `volteo-comparateur.css` | 30 | |
| 6 | `volteo-fil.css` | 25 | |
| 7 | `volteo-marche.css` | 45 | le plus gros |
| 8 | `globals.css` | 9 | `.prose-article` → `--lh-loose` |

À chaque étape :

```bash
node scripts/da-shots.mjs --routes /,/blog,/home-v3,/home-v4,/home-v5
```

puis dérouler [`DA-REVIEW.md`](DA-REVIEW.md) — **§ 1 (paires clair/sombre) et
§ 3 (typographie)** au minimum. Comparer avec les captures de l'étape
précédente : si un bloc devient illisible ou déborde, c'est cette étape-là.

## Règles

- **Ne jamais** réintroduire un demi-pixel. S'il faut ajuster, changer de cran.
- Les `clamp()` de hero prennent `--fs-h1/h2/h3`, pas des px.
- `line-height` : `--lh-tight` (titres) · `--lh-snug` (titres de carte) ·
  `--lh-body` (corps) · `--lh-loose` (prose article). Pas d'autre valeur.
- Paddings de section (`96px`, `90px`, `80px`, `64px`…) → `--section-y`.
- `tests/unit/da-guards.test.ts` doit rester vert à chaque étape.

## Hors périmètre (à traiter plus tard)

- `globals.css` définit `--space-1..24` en **valeurs fixes** ; `--gap-*` de
  `volteo-scale.css` les remplacera, mais migrer les deux systèmes en même
  temps rendrait toute régression impossible à attribuer.
- `components/presse/*.tsx` sont **inline-stylés** (`fontSize: 11`,
  `letterSpacing: '0.14em'`…) : aucun token CSS ne peut les atteindre. Ils
  doivent d'abord passer en classes. C'est le seul poste de la refonte que je
  n'ai pas su chiffrer.
- `--color-accent-5` manque toujours dans le bloc `@theme` de `globals.css`.

## Ensuite

Une fois l'échelle câblée, `--fs-ratio` / `--space-unit` / `--section-y`
deviennent des **axes de grammaire** (passe 2) : un `GrammarStyle` les émet par
site, comme `PermutationStyle` émet déjà shape/border/shadow. C'est là que la
variété inter-sites cesse d'être chromatique.
