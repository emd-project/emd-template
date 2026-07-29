# DA-DIRECTIONS — 5 directions de design + spec logo/favicon

> **Source unique de la DA** : `niche.config.palette` (couleurs) alimente les tokens de **`app/globals.css`**,
> et `app/layout.tsx` porte les fonts (`next/font`). **On n'écrit JAMAIS de valeurs dans `app/styles/volteo.css :root`**
> (couche d'alias).
>
> ⚠️ **`globals.css` contient CINQ blocs de palette** : `@theme`, `:root`,
> `@media (prefers-color-scheme: light)`, `html[data-theme="light"]`, `html[data-theme="dark"]`.
> **Les traiter TOUS.** Ne réécrire que `:root` laisse **tous les sites identiques en mode clair** —
> c'est le bug de propagation le plus fréquent du réseau.

## Comment lire ces directions

Chaque direction est un **point de départ reconnaissable**, exprimé dans le système de tokens actuel :

- **Couleurs** → `niche.config.palette` : `accent1..5`, `bgPrimary`, `bgSurface`, `bgSurface2`,
  `textPrimary`, `textSecondary`, `textMuted` → tokens `--accent-1..5`, `--bg-primary` / `--bg-surface`
  / `--bg-surface-2`, `--text-primary` / `--text-secondary` / `--text-muted`.
- **Mode** → `niche.style.mode` (`'light'` | `'dark'`). **Un site est light OU dark, FIXE — jamais de toggle.**
- **Rayons** → `--radius-sm` / `--radius-md` / `--radius-lg` / `--radius-xl` (fixés dans `globals.css`).
- **Fonts** → câblées dans **`app/layout.tsx`** via `next/font/google`. ⚠️ `niche.config.fonts` n'est lu
  par **aucun code** : l'y écrire seul ne change rien au rendu (le renseigner en plus, pour la trace).
- **Type de home** → `niche.style.hero` (`split` → comparateur ; `centered`/`minimal` → magazine/portail).

> **Après avoir choisi une direction, on MUTE** pour l'unicité par site (anti-footprint) :
> teinte de marque **±12–45°** sur l'accent, accent secondaire ré-accordé, **paire de fonts du même
> registre** (pas les fonts exactes du voisin), rayons ajustés. Deux sites du réseau ne partagent
> jamais la même direction *non mutée*.

> ⛔ **PAIRE INTERDITE — `Bricolage Grotesque` × `Hanken Grotesk`.** C'est la paire **par défaut du
> template**. Un site qui sort avec elle est indistinguable d'un fork jamais configuré. Elle est exclue
> du tirage de `suggestFonts` ; ne la réintroduis pas à la main depuis ce document.

> ⚠️ **Vérifier la divergence sur les FONDS, pas seulement sur l'accent.** Deux palettes d'origines
> différentes peuvent partager exactement le même couple `bgPrimary`/`bgSurface` (`#F8FAFC`/`#FFFFFF`
> est le cas classique) : les deux sites paraissent alors jumeaux malgré des accents distincts. Contrôler
> **teinte d'accent-1 (≥ 25° d'écart)** ET **couple de fonds** face aux 3 derniers sites de la famille.

---

## 1. Électrique — clair, tech / dynamique

| Token | Valeur de départ |
|---|---|
| `mode` | `light` (bg ≠ blanc pur) |
| `--bg-primary` / `--bg-surface` | `#EDF1F8` / `#FFFFFF` |
| `--text-primary` | `#0D1626` |
| `--accent-1` | **bleu électrique `#3D5AFE`** |
| accent secondaire | **pointe lime `#CCFF48`** |
| `--radius-*` | généreux — `--radius-lg` **16px** |
| fonts (display / body) | **Space Grotesk / Inter** — ou Archivo / Figtree, Manrope seul |
| densité | aérée, énergique, contrastes francs |

- **Niches** : tech, mobilité, énergie, télécom.
- **Home** : **comparateur** (`hero: split`) ou **portail**.
- **Mutation** : décaler le bleu vers cyan/indigo (±20–40°), garder la lime en spark ponctuel.
- *(Cette direction prescrivait Bricolage × Hanken — la paire par défaut du template. Remplacée : voir
  l'encadré « paire interdite » ci-dessus.)*

---

## 2. Éditorial — clair crème, magazine chic

| Token | Valeur de départ |
|---|---|
| `mode` | `light` (crème) |
| `--bg-primary` / `--bg-surface` | `#FBF7F0` / `#FFFFFF` |
| `--text-primary` | `#1B1813` |
| `--accent-1` | **bordeaux `#9E2B25`** |
| accent secondaire | **or `#C8922F`** |
| `--radius-*` | doux — `--radius-sm` **~3px** |
| fonts (display / body) | **Newsreader (serif) / Inter** |
| densité | colonnes magazine, lettrines, sérénité éditoriale |

- **Niches** : lifestyle, conseil, famille.
- **Home** : **magazine** (`hero: centered`).
- **Mutation** : virer le bordeaux vers brique/prune, l'or vers laiton ; serif de titrage du même registre (Fraunces, Spectral…).

---

## 3. Net / Suisse — blanc, sobre / autoritaire

| Token | Valeur de départ |
|---|---|
| `mode` | `light` (blanc, **seule direction qui assume le blanc pur**) |
| `--bg-primary` / `--bg-surface` | `#FFFFFF` / `#FFFFFF` |
| `--text-primary` | `#0A0A0A` |
| `--accent-1` | **rouge `#E2231A`** (ou noir) |
| accent secondaire | noir `#0A0A0A` (mono-accent assumé) |
| `--radius-*` | **`0` — aucun rayon** |
| fonts (display / body) | **grotesque neutre Google** — Inter, Archivo ou Manrope (display = body). ⚠️ **Pas Helvetica Neue** : police système non-Google, rendu non déterministe hors macOS. |
| densité | grille stricte, beaucoup de blanc, hiérarchie typographique pure |

- **Niches** : finance, banque, assurance.
- **Home** : **comparateur** (`hero: split`).
- **Mutation** : rouge → écarlate/cardinal, ou bascule full-noir ; rester sans rayon, ne pas multiplier les accents.

---

## 4. Premium sombre — fond graphite, haut de gamme

| Token | Valeur de départ |
|---|---|
| `mode` | **`dark` — FIXE, pas de toggle** |
| `--bg-primary` / `--bg-surface` | `#0C1118` / `#141E2D` |
| `--text-primary` | `#EAF0F8` |
| `--accent-1` | **périwinkle `#7C9CFF`** (ou cuivre) |
| accent secondaire | **lime `#CCFF48`** (ou cuivre `#B87333`) |
| `--radius-*` | généreux — `--radius-lg` **16px** |
| fonts (display / body) | **Sora / Inter** |
| densité | feutrée, halos discrets, surfaces profondes |

- **Niches** : luxe, premium, high-tech.
- **Home** : **portail** ou **comparateur** (`hero: split`).
- **Site dark FIXE** : ne pas câbler de switch clair/sombre.
- **Mutation** : périwinkle → lavande/cobalt, ou passer en cuivre + lime ; garder le graphite profond.
- ⚠️ En sombre, **ne jamais poser un token qui s'inverse** (`--text-primary`, `--bg-primary`) sur un fond
  qui ne s'inverse pas (accent, scrim photo) → texte invisible. Passer par un token de surface inversée dédié.

---

## 5. Chaleureux — clair sable / ivoire, accessible

| Token | Valeur de départ |
|---|---|
| `mode` | `light` (sable / ivoire) |
| `--bg-primary` / `--bg-surface` | `#F7F1E6` / `#FFFFFF` |
| `--text-primary` | `#231C14` |
| `--accent-1` | **terracotta `#C2410C`** |
| accent secondaire | **vert sauge** (`#6B8E5A` env.) |
| `--radius-*` | moyen — `--radius-md` **~8px** |
| fonts (display / body) | **sans humaniste** — Figtree, Source Sans 3 ou Nunito Sans (display ≈ body) |
| densité | généreuse et accueillante, formes douces |

- **Niches** : familial, maison, santé, quotidien.
- **Home** : **magazine** ou **portail** (`hero: centered`/`minimal`).
- **Mutation** : terracotta → rouille/abricot, sauge → olive/eucalyptus.

---

## Récap — choix, mutation, vérification

1. Choisir la direction selon la **niche** + l'**intent**.
2. Renseigner **`niche.config.palette`** + `niche.style.mode`/`hero`.
3. **Muter** (teinte ±12–45°, fonts du même registre, rayons).
4. **Propager dans les CINQ blocs** de `globals.css`. Rien dans `volteo.css :root`.
5. Câbler les fonts dans **`app/layout.tsx`** (jamais `niche.config.fonts` seul).
6. **Vérifier** : contraste WCAG **calculé** (≥ 4,5 texte / ≥ 3 gros titres et bordures, en clair ET en
   sombre) + divergence accent **et** fonds vs les 3 derniers sites de la famille.

*(Si aucune de ces 5 directions ne colle vraiment à la niche, second recours : `lib/da-presets/palettes.json`
— 161 palettes curatées, à muter de la même façon. Jamais d'hex improvisés.)*

---

# LOGO & FAVICON

> **Pipeline complet : [`emd-methodo/references/logo-pipeline.md`](https://github.com/emd-project/emd-methodo/blob/main/references/logo-pipeline.md).**
> ⚠️ **Deux objets, deux méthodes — ne pas les confondre :**
> - **Favicon (`app/icon.svg`) = MONOGRAMME** : rond `palette.accent1` + **initiale de la thématique**,
>   couleur de lettre calculée (blanc si contraste ≥ 4,5, sinon `textPrimary`). **Jamais un mark dessiné** :
>   à 16px, une silhouette vectorisée devient une tache.
> - **Logo du header = mark dessiné** (Gemini → vectorisé), inline dans `Nav.tsx`, tintable, + wordmark texte.

## Composition du logo du header

- **Mark** = symbole conçu pour la niche, **généré par Gemini** (bold, formes pleines, fort contraste,
  **SANS texte**), puis **vectorisé** (`vtracer`, mode silhouette) en SVG **un seul `<path>`**,
  **tintable** (`fill="currentColor"`).
- **Wordmark** = le nom du site en **texte CSS** dans `--next-font-display`, à côté du mark —
  **JAMAIS dans l'image** (Gemini écrit mal → artefacts).

## Pipeline (résumé)

1. `generate_image(filename="logo-<site>-mark", aspect_ratio="1:1", prompt="<concept niche> bold flat vector brand icon, single solid shape, high contrast black on white, centered, no text, no letters, no gradient, no 3d")` → `wait_for_image`.
2. Sandbox : `pip install vtracer --break-system-packages` ; `convert <png> -background white -flatten -colorspace Gray -threshold 55% mark.png` ; `vtracer(... colormode='binary', mode='spline' ...)`.
3. Nettoyage → `fill="currentColor"` + `viewBox`, retrait des width/height fixes.
4. **Inline dans `Nav.tsx`**, tinté `color: var(--accent-1)`. **Pas de `<img>`, pas de raster.**

## Unicité (anti-footprint)

Le mark est **unique par site**, dérivé de la niche et de l'accent de marque. Concepts par famille :
- **Finance / assurance / banque** : bouclier abstrait, pilier, chevron ascendant, segments empilés.
- **Énergie / mobilité / télécom** : éclair géométrisé, nœud + arcs, onde/signal, flèche de flux.
- **Lifestyle / famille / maison / santé** : toit minimal, feuille, arc protecteur, cercles concentriques.
- **Tech / premium** : monogramme géométrique, prisme, grille de points, orbite.

> Générer **2–3 symboles** (varier le filename `-v2`/`-v3`), retenir celui qui est distinct de tout autre
> site du réseau.
