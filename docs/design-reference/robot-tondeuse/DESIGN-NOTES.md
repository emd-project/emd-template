# Référence — Éditorial organique (archétype magazine / hybride)

> ⚠️ INSPIRATION, jamais à copier. Réinterpréter ces techniques pour une DA unique par site. Cf. `../README.md`.

## Langage visuel

- **Palette naturelle, claire** : verts forêt `#1a2e1f / #243b2a / #3a5a3d`, sage, sables/crèmes (`#ece2cc`, `#f5efe1`, `#faf6ec`), accent **cuivre** `#b8623d`. Fond crème, jamais blanc pur.
- **Fonts** : titres en **serif** Instrument Serif (poids 400, élégant), texte **Inter**, mono JetBrains.
- **Rayons** doux (`6 / 12 / 20 / 28px`), **ombres en couches** (sm→xl), profondeur discrète.

## Techniques distinctives (à réinterpréter)

- **Entrées** : `fadeUp`, `fadeIn`, `scaleIn` (easing `cubic-bezier(.16,1,.3,1)`).
- **Stagger** : `.stagger > *` avec delays `nth-child` (0.05s → 0.3s) — apparition en cascade.
- **Anims ludiques de niche** : `mowPath`, `grassWave`, `pulseRing`, `orbit`, `blink`. ⚠️ Ce sont des anims **spécifiques à la tondeuse** — à **RE-créer** selon la niche du site (jamais reprendre `mowPath` sur un site qui n'a rien à tondre).
- **Texture** : `repeating-linear-gradient` + `mix-blend-mode: multiply` (grain papier léger).

## Traits de layout

Éditorial : grand titre serif, hiérarchie aérée, sections respirées, cartes papier. Hub + outils intégrés.

## Idées de signature

- `anchor` : lettrine ou pull-quote serif entre sections.
- `oneRule` : « titres serif, fond crème jamais blanc pur, une micro-animation propre à la niche ».

## Comment ADAPTER (obligatoire)

Changer la famille de couleurs (forêt → autre univers cohérent avec la niche), garder le **principe** serif + naturel + stagger. Les animations « métier » se **réinventent** à chaque site (une pour la niche), elles ne se copient pas.
