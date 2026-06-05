# Référence — Beam / Cinéma (archétype comparateur / review)

> ⚠️ INSPIRATION, jamais à copier. Réinterpréter ces techniques pour une DA unique par site. Cf. `../README.md`.

## Langage visuel

- **Dual mode** ink/paper : encre `#0B0A0F` (quasi-noir) ↔ papier crème `#F4F1EA`. Jamais blanc pur.
- **Accent « beam »** violet `#9B6CFF` (+ deep `#6c3ff0`, soft `#c4a6ff`) + ambre `#FFD24A`.
- **Variable `--intensity`** (0–1) qui pilote la force du glow, du grain et des scanlines : un seul curseur règle toute l'ambiance.
- **Fonts** : display **Archivo Expanded** (800–900, ultra-large, letter-spacing négatif), sans **Archivo**, mono **Space Mono** (labels, méta).

## Techniques distinctives (à réinterpréter)

- **Reveals au scroll** : `[data-reveal]` translateY(28px) + opacity, easing `cubic-bezier(.16,1,.3,1)`, delay en variable.
- **Wipe** : `[data-wipe]` clip-path `inset(0 100% 0 0)` → `inset(0)` (révélation latérale).
- **Texte mot-à-mot** : `.word>span` translateY(105%) qui remonte, delays échelonnés.
- **Filets** : `.rule` scaleX(0)→1 (trait qui se dessine).
- **Header sticky** : transition backdrop-filter `blur(14px) saturate(1.2)`.
- **Grain** : overlay `mix-blend-mode: overlay`, opacité `0.05 * var(--intensity)`.
- **Scanlines** : `repeating-linear-gradient` + `mix-blend-mode: multiply`, opacité × intensity.
- **Beam** : `radial-gradient` en `color-mix(in oklab, var(--beam) …)` posés en coin.
- **Vignette de thumb** : radial sombre en bas de l'image.
- `prefers-reduced-motion` : tout neutralisé.

## Traits de layout

Hero très contrasté, typo display énorme, bascule ink/paper. Cartes avec vignette + hover translate.

## Idées de signature

- `anchor` : caption mono + filet accent en tête de section.
- `oneRule` : « display ultra-expanded, jamais centré mou ; tout réagit à `--intensity` ».

## Comment ADAPTER (obligatoire)

Changer la teinte « beam », la font display (une autre expanded/condensed), le couple ink/paper, le niveau d'intensité ; ne **jamais** reprendre le violet `#9B6CFF` tel quel sur un autre site. Garder le **principe** (un accent lumineux + grain + reveals), pas les valeurs.
