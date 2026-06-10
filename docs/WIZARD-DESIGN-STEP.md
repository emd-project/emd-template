# WIZARD — Étape Design (nano-mentionbox « Créer EMD »)

Spécification de l'étape « Design » du wizard. Objectif : **cadrer Claude à l'init** pour qu'il parte
d'un **skin Voltéo** prouvé. Deux voies mutuellement exclusives. Le wizard écrit le résultat dans le
bloc `## Design` de `init-spec.md` (lu par `configure-from-spec` → `docs/AUTO-DESIGN.md` →
`docs/design-reference/volteo/DESIGN-NOTES.md`).

## Texte d'intro (copie UI suggérée)

> **Le design de ton site.** Deux options :
> — Tu as une maquette Claude Design ? Importe le ZIP, on l'intègre tel quel.
> — Pas de maquette ? Choisis un **style** (4 identités prêtes) + ta thématique. Claude part de ce
>   style, l'adapte à ta niche et le rend unique (tu pourras le remplacer plus tard).

## Voie 1 — Import ZIP (design sur-mesure)

- Champ upload d'un `.zip` Claude Design → poussé dans `design-incoming/` du repo forké.
- Bloc init-spec :

```yaml
## Design
source: zip
```

→ `configure-from-spec` Cas A : délègue à `integrate-claude-design`.

## Voie 2 — Choix d'un skin Voltéo (par défaut, « je n'y connais rien »)

Chaque question a une option « Laisse Claude choisir » pour ne jamais bloquer.

1. **Type de site** (pilote la home + le hero)
   - Comparateur (offres, prix, outils) · Magazine / blog (articles à la une) · Hybride
2. **Style visuel (skin)** — 4 identités prêtes, avec aperçu :
   - **V1 Électrique** — vif, tech, amical (clair, bleu, arrondi)
   - **V2 Éditorial** — presse, autorité (clair, serif, papier chaud)
   - **V3 Suisse / Minimal** — premium neutre, B2B (monochrome + 1 rouge, épuré)
   - **V4 Premium sombre** — haut de gamme (sombre, accent lumineux)
3. **Thématique (verticale)** — donne les couleurs de catégorie :
   - Énergie · Assurance · Auto · Tech · *Autre (Claude compose 5 accents)*
4. **Couleur de marque** (optionnel) — un hex pour personnaliser l'accent, ou « Laisse Claude »

Optionnel (replié) : **Site de référence / inspiration** (URL) · **Sections incontournables**.

### Bloc init-spec produit

```yaml
## Design
source: questionnaire
archetype: comparateur       # comparateur | magazine | hybride
skin: V2                     # V1 | V2 | V3 | V4 | auto
vertical: energie            # energie | assurance | auto | tech | custom
brandColor: auto             # hex (#1AA35F) ou auto
mustHaveSections: [estimateur, deals]   # optionnel
```

→ `configure-from-spec` Cas B : exécute `docs/AUTO-DESIGN.md`, qui lit ce bloc pour
**appliquer le skin** (bloc prêt à coller de `volteo/DESIGN-NOTES.md`), reporter la **verticale**, puis
**muter** (anti-footprint).

## Règle

Le bloc `## Design` est **toujours présent**. Si `skin`/`vertical` manquent ou valent `auto`,
AUTO-DESIGN les déduit de la niche (mode dégradé) — mais ne laisse jamais les placeholders, et part
toujours d'un skin Voltéo (jamais de composition « depuis zéro » par défaut).
