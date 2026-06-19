# DA-DIRECTIONS — 5 directions de design + spec logo/favicon

> **Source unique de la DA** : `niche.config.palette` (couleurs) réécrit les tokens **`app/globals.css :root`**,
> et `app/layout.tsx` porte les fonts (`next/font`). **On n'écrit JAMAIS de valeurs dans `app/styles/volteo.css :root`**
> (couche d'alias). Détail doctrinal : [`design-reference/volteo/DESIGN-NOTES.md`](design-reference/volteo/DESIGN-NOTES.md).

## Comment lire ces directions

Chaque direction est un **point de départ reconnaissable**, exprimé dans le système de tokens actuel :

- **Couleurs** → `niche.config.palette` : `accent1..5`, `bgPrimary`, `bgSurface`, `bgSurface2`,
  `textPrimary`, `textSecondary`, `textMuted` → tokens `--accent-1..5`, `--bg-primary` / `--bg-surface`
  / `--bg-surface-2`, `--text-primary` / `--text-secondary` / `--text-muted`.
- **Mode** → `niche.style.mode` (`'light'` | `'dark'`). **Un site est light OU dark, FIXE — jamais de toggle.**
- **Rayons** → `--radius-sm` / `--radius-md` / `--radius-lg` / `--radius-xl` (fixés dans `globals.css`).
- **Fonts** → `niche.fonts.display` / `niche.fonts.body` → `--next-font-display` / `--next-font-primary`
  câblés dans `layout.tsx`.
- **Type de home** → `niche.style.hero` (`split` → comparateur ; `centered`/`minimal` → magazine/portail).

> **Après avoir choisi une direction, on MUTE** pour l'unicité par site (anti-footprint) :
> teinte de marque **±12–45°** sur l'accent, accent secondaire ré-accordé, **paire de fonts du même
> registre** (pas les fonts exactes du voisin), rayons ajustés. Deux sites du réseau ne partagent
> jamais la même direction *non mutée*.

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
| fonts (display / body) | **Bricolage Grotesque / Hanken Grotesk** |
| densité | aérée, énergique, contrastes francs |

- **Niches** : tech, mobilité, énergie, télécom.
- **Home** : **comparateur** (`hero: split`) ou **portail**.
- **Mutation** : décaler le bleu vers cyan/indigo (±20–40°), garder la lime en spark ponctuel.

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
| fonts (display / body) | **Newsreader (serif) / Hanken Grotesk** |
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
| fonts (display / body) | **Helvetica-like neutre** (display = body) |
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
| fonts (display / body) | **Sora / Hanken Grotesk** |
| densité | feutrée, halos discrets, surfaces profondes |

- **Niches** : luxe, premium, high-tech.
- **Home** : **portail** ou **comparateur** (`hero: split`).
- **Site dark FIXE** : ne pas câbler de switch clair/sombre.
- **Mutation** : périwinkle → lavande/cobalt, ou passer en cuivre + lime ; garder le graphite profond.

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
| fonts (display / body) | **sans humaniste (Inter-like)** (display ≈ body) |
| densité | généreuse et accueillante, formes douces |

- **Niches** : familial, maison, santé, quotidien.
- **Home** : **magazine** ou **portail** (`hero: centered`/`minimal`).
- **Mutation** : terracotta → rouille/abricot, sauge → olive/eucalyptus ; humaniste alternative (Figtree, Source Sans…).

---

## Récap — choix puis mutation

1. Choisir la direction selon la **niche** + l'**intent** (qui fixe aussi le type de home).
2. Renseigner les valeurs dans **`niche.config.palette`** + `niche.style.mode`/`hero` + `niche.fonts`.
3. Câbler les fonts dans **`app/layout.tsx`**.
4. **Muter** (teinte ±12–45°, fonts du même registre, rayons) pour l'unicité.
5. **Ne rien écrire dans `volteo.css :root`.** Mode **light OU dark fixe**, jamais de toggle.

---

# LOGO & FAVICON — symbole Gemini vectorisé en SVG

> **Pipeline complet et validé : [`emd-methodo/references/logo-pipeline.md`](https://github.com/emd-project/emd-methodo/blob/main/references/logo-pipeline.md).** Résumé ci-dessous.
> Le logo n'est **PAS un SVG dessiné à la main** (rendu géométrique générique = les vieux logos « nuls »),
> ni un **raster collé tel quel**. On **génère le SYMBOLE avec Gemini**, on le **vectorise** en SVG propre,
> et on l'**inline** dans le header + le favicon. Gemini reste aussi utilisé pour les **photos** (hero, couvertures).

## Composition du logo

Le logo = **un MARK SVG** (symbole vectorisé) + **le wordmark** :

- **Mark** = un **symbole conçu pour la niche, généré par Gemini** (bold, formes pleines, fort contraste,
  **SANS texte**), puis **vectorisé** (`vtracer`, mode silhouette) en SVG **un seul `<path>`**,
  **tintable** (`fill="currentColor"`), net de **16px** à grand format.
- **Wordmark** = le **nom du site** en **texte CSS** dans la font de titrage (`--next-font-display`),
  à côté/sous le mark — **JAMAIS dans l'image** (Gemini écrit mal → artefacts).

## Pipeline (résumé — détail dans `references/logo-pipeline.md`)

1. `generate_image(filename="logo-<site>-mark", aspect_ratio="1:1", prompt="<concept niche> bold flat vector brand icon, single solid shape, high contrast black on white, centered, no text, no letters, no gradient, no 3d")` → `wait_for_image`.
2. Sandbox : `pip install vtracer --break-system-packages` ; `convert <png> -background white -flatten -colorspace Gray -threshold 55% mark.png` ; `vtracer(... colormode='binary', mode='spline' ...)`.
3. Nettoyage → `fill="currentColor"` + `viewBox` + retrait des width/height fixes (SVG inline-ready).
4. **Contrôle de lisibilité réduit à 16px** (favicon).

## Intégration (câblage réel)

- **Logo** : le SVG nettoyé **inline dans `components/.../Nav.tsx`**, tinté par tokens (`color: var(--accent-1)`),
  + **wordmark en texte CSS**. **Pas de `<img>`**, pas de raster.
- **Favicon** = le **même mark** (sans wordmark) écrit dans **`app/icon.svg`** (Next génère le favicon). Pas de texte.

## Unicité (anti-footprint)

- Le mark est **unique par site** : concept de symbole différent de tout autre site du réseau, dérivé de la
  **niche** + de l'**accent de marque**.

### Concepts de mark par type de niche (inspiration du prompt Gemini)

- **Finance / assurance / banque** : bouclier abstrait, pilier/colonne, chevron ascendant, segments empilés.
- **Énergie / mobilité / télécom** : éclair géométrisé, nœud + arcs (réseau), onde/signal, flèche de flux.
- **Lifestyle / famille / maison / santé** : toit minimal, feuille/pousse, arc protecteur, cercles concentriques.
- **Tech / premium / high-tech** : monogramme géométrique, prisme/facette, grille de points, orbite/anneau.

> Générer **2–3 symboles** (varier le filename `-v2`/`-v3`), retenir **un** distinct de tout autre site, puis
> le décliner en favicon (mark seul, vérifié lisible à 16px).
