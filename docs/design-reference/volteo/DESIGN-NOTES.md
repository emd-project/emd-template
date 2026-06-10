# Voltéo — Mode d'emploi (structure + DA + mapping vers le moteur)

> **À quoi sert ce dossier.** Voltéo est la **référence design** lue à l'init. Claude doit en
> reproduire DEUX choses dans le moteur Next.js : (1) la **STRUCTURE** des pages (sections, hero,
> grilles, ordre) à partir des fichiers **HTML** de référence, et (2) la **DA** (couleurs, fonts,
> formes) à partir des **tokens CSS**. Appliquer seulement les couleurs sur la structure existante
> du moteur = **bug d'init** : le site garde l'ancien squelette (héritage pré-Voltéo) et n'est pas
> un site Voltéo. Doctrine : partir d'un skin **prouvé**, reproduire sa **structure** + ses
> **tokens**, puis **muter** pour rester unique (anti-footprint).

---

## ⚠️ 0. Reproduire la STRUCTURE (NON négociable)

**Le CSS seul ne suffit PAS** : il ne porte pas la structure. La structure vit dans les **pages HTML
de référence** ci-dessous. Claude doit **reconstruire les composants du moteur** (`components/`,
`app/`) pour qu'ils produisent CES sections, dans CET ordre — **pas** recolorer le squelette par défaut.

| Type de page | HTML de référence | CSS de layout | À reproduire dans le moteur |
|---|---|---|---|
| **Home comparateur** | `home-comparateur.html` | `assets/home.css` | home archétype comparateur (`app/(site)/page.tsx` + sections) |
| **Home magazine** | `home-magazine.html` | `assets/magazine.css` | home archétype magazine |
| **Hub / catégorie** | `hub-categorie.html` | `assets/hub.css` | `/blog` + `/blog/[categorie]` |
| **Article** | `article.html` | `assets/article.css` | `/blog/[categorie]/[slug]` |

### Ordre des sections à respecter

- **Home comparateur** : nav → **hero split** (texte + mini-form à gauche, carte facture animée à
  droite) → bande de confiance (marquee fournisseurs) → grille de catégories colorées → « comment ça
  marche » (3 étapes reliées) → **estimateur** (bloc sombre, sliders + carte résultat chiffrée) →
  **table comparative** (onglets catégorie + cartes d'offres, une carte « best ») → stats pleine
  couleur → quiz teaser → blog teaser (3 cartes) → newsletter → footer.
- **Home magazine** : topbar fine → nav (pastille MAG) → bandeau de rubriques → **mosaïque hero**
  (1 grande une + 4 cartes) → corps **2 colonnes** : main (rubriques = 1 article principal + liste
  compacte ; bloc « à la une » pleine largeur ; édito/citation ; grille 3) **+ sidebar** (réseaux,
  dossier promo vers le comparateur, populaires, newsletter) → footer.
- **Hub / catégorie** : nav → hero hub (fil d'ariane, titre, méta) → **barre de filtres sticky**
  (chips par catégorie) → article à la une (featured 2 colonnes) → grille d'articles + « charger
  plus » → grille de guides par thème → newsletter → footer.
- **Article** : barre de progression de lecture → nav → hero article (fil d'ariane, titre,
  standfirst, byline + partage) → cover → corps **2 colonnes** : **sommaire sticky (TOC)** + prose
  (lettrine, callout, pull-quote, tableau de données, figure, encadré « à retenir ») → tags + carte
  auteur → CTA comparateur → « à lire ensuite » (3 cartes) → newsletter → footer.

> Le moteur a ses propres composants : on les **adapte/recrée** pour produire ces structures (en
> RSC, `next/image`, variables CSS). Si une page sort avec l'ordre / les sections par défaut du
> template (héritage pré-Voltéo), c'est un **bug d'init** — même si les couleurs sont les bonnes.

---

## 1. Trois couches orthogonales

| Couche | Ce qu'elle fixe | Fichier source | Change par site |
|---|---|---|---|
| **Skin** (V1–V4) | marque, fonds, texte, fonts, formes (rayons/ombres) | `theme-vN.css` | ✅ on en choisit 1 |
| **Verticale** | les couleurs de catégorie (`--cat-1..5`) | `vertical-*.css` | ✅ on en choisit 1 |
| **Template** | structure/sections de la home + pages | HTML de réf. (§0) | ✅ comparateur / magazine |

N'importe quel skin × n'importe quelle verticale fonctionne. On choisit **un de chaque**, on **reproduit la structure (§0)**, on applique les tokens, on mute.

---

## 2. Choisir (ce que Claude demande à l'init)

1. **Archétype → template.** Comparateur (offres/prix/outils) ou Magazine (articles à la une) ou Hybride.
2. **Skin (point de départ).**
   - **V1 Électrique** — bleu vif, grotesque arrondi, clair & aéré → grand public, tech & amical.
   - **V2 Éditorial** — serif fort, papier chaud, angles nets → presse, autorité, contenu long.
   - **V3 Suisse / Minimal** — monochrome + 1 rouge, grille stricte, zéro ombre → premium neutre, B2B.
   - **V4 Premium sombre** — fond sombre, accent lumineux, grande typo → haut de gamme.
3. **Verticale** — énergie (défaut) · assurance · auto · tech · *(custom : 5 hex)*.

> Toujours proposer « laisse Claude choisir » : Claude déduit du nom de niche + de l'intent des mots-clés.

---

## 3. Appliquer — mapping DÉTERMINISTE skin → moteur

Le skin se pose à **deux endroits**. Claude **copie les valeurs**, il n'invente rien.

### 3a. `niche.config.ts`

| Champ config | Source skin (token) |
|---|---|
| `palette.accent1` | `--primary` (couleur de **marque**) |
| `palette.accent2` | `--spark` (accent secondaire) |
| `palette.accent3/4/5` | **couleurs de catégorie de la verticale** (voir §4) |
| `palette.bgPrimary` | `--cream` |
| `palette.bgSurface` | `--paper` |
| `palette.bgSurface2` | `--cream-2` |
| `palette.textPrimary` | `--ink` |
| `palette.textSecondary` | `--ink-2` |
| `palette.textMuted` | `--ink-3` |
| `fonts.display` | `--font-display` (1ʳᵉ famille) |
| `fonts.body` | `--font-body` (1ʳᵉ famille) |
| `style.mode` | clair (V1/V2/V3) · sombre (V4) |
| `style.effects` | `subtle` (V1/V2/V4) · `none` (V3) |
| `style.cards` | `bordered` (V1/V2) · `minimal` (V3) · `filled` (V4) |
| `style.hero` | dépend du **template** : `split` (comparateur) · `centered`/`minimal` (magazine) |
| `style.uiStyle` | libellé : `electrique` / `editorial-press` / `swiss-minimal` / `premium-dark` |

> **Convention marque.** Le moteur n'a pas de token de marque séparé : **`--accent-1` EST la marque**
> (focus, liens, gradient hero, hover…). On pose donc `accent1 = --primary` du skin. Les catégories
> recyclent `accent1..5` ; la 1ʳᵉ catégorie prend donc la couleur de marque (voulu).

### 3b. `app/globals.css` (`:root` + variantes clair/sombre)

| Variable globals | Source skin |
|---|---|
| `--radius-sm/md/lg/xl` | `--r-sm` / `--r` / `--r-lg` / `--r-xl` |
| `--shadow-sm/md/lg` | `--shadow-sm` / `--shadow` / `--shadow-lg` |
| `--accent-1..5`, `--bg-*`, `--text-*` | idem palette ci-dessus, **dans le bon bloc** (`prefers-color-scheme` / `[data-theme]`) |

**Correctifs ciblés à reporter** (sinon = bug visuel) :
- **V3** : `border-radius: 0` partout + cartes plates à filet hairline, **aucune ombre**.
- **V4 (sombre)** : re-noircir les sections qui utilisaient `--ink`/`--primary` en fond plein
  (`.tool`, `.quiz-cta`, `.stats`, `.ctab.on`, `.chip.on`, `.promo`, `.footer`, `.btn-*` texte foncé
  sur accent clair). Cf. la fin de `assets/theme-v4.css`.

---

## 4. La verticale → couleurs de catégorie

Le pack verticale redéfinit 5 slots (`--cat-1..5`). On les reporte dans les accents catégorie du moteur.

| Verticale | cat-1 | cat-2 | cat-3 | cat-4 | cat-5 |
|---|---|---|---|---|---|
| **énergie** | `#FFB400` élec | `#FF6B35` gaz | `#1AA35F` vert | `#2D8FE0` eau | `#7C5CFF` mobilité |
| **assurance** | `#3D5AFE` auto | `#7C5CFF` habitation | `#1AA35F` santé | `#F5A623` vie | `#E0524D` animaux |
| **auto** | `#2563EB` citadine | `#E0524D` SUV | `#1AA35F` élec | `#F5A623` utilitaire | `#8B5CF6` premium |
| **tech** | `#0A84FF` smartphones | `#5E5CE6` ordis | `#FF375F` montres | `#FF9F0A` audio | `#30D158` access. |

`accent1` reste la marque (skin) ; `accent3/4/5` (et plus si besoin) prennent les couleurs catégorie de la verticale, en gardant des teintes bien distinctes les unes des autres.

---

## 5. Blocs prêts à coller (skin → `niche.config.ts`, verticale énergie)

> `accent3/4/5` = couleurs catégorie : à remplacer par celles de la verticale réellement choisie (§4).

### V1 — Électrique (clair)
```ts
style: { mode: 'light', hero: 'split', effects: 'subtle', cards: 'bordered', uiStyle: 'electrique' },
palette: {
  accent1: '#3D5AFE', accent2: '#CCFF48', accent3: '#1AA35F', accent4: '#2D8FE0', accent5: '#7C5CFF',
  bgPrimary: '#EDF1F8', bgSurface: '#FFFFFF', bgSurface2: '#DFE6F2',
  textPrimary: '#0D1626', textSecondary: '#3A465B', textMuted: '#7B8799',
},
fonts: { display: 'Bricolage Grotesque', body: 'Hanken Grotesk' },
// globals.css : --radius 16px (sm10/lg24/xl34), ombres douces basses
```

### V2 — Éditorial (clair)
```ts
style: { mode: 'light', hero: 'split', effects: 'subtle', cards: 'bordered', uiStyle: 'editorial-press' },
palette: {
  accent1: '#9E2B25', accent2: '#C8922F', accent3: '#1AA35F', accent4: '#2D8FE0', accent5: '#7C5CFF',
  bgPrimary: '#FBF7F0', bgSurface: '#FFFFFF', bgSurface2: '#F1E8D9',
  textPrimary: '#1B1813', textSecondary: '#4A443A', textMuted: '#8A8173',
},
fonts: { display: 'Newsreader', body: 'Hanken Grotesk' },
// globals.css : --radius 3px (angles nets), filets éditoriaux, liens soulignés
```

### V3 — Suisse / Minimal (clair)
```ts
style: { mode: 'light', hero: 'minimal', effects: 'none', cards: 'minimal', uiStyle: 'swiss-minimal' },
palette: {
  accent1: '#E2231A', accent2: '#0A0A0A', accent3: '#1AA35F', accent4: '#2D8FE0', accent5: '#7C5CFF',
  bgPrimary: '#FFFFFF', bgSurface: '#FFFFFF', bgSurface2: '#F1F1F1',
  textPrimary: '#0A0A0A', textSecondary: '#3A3A3A', textMuted: '#8C8C8C',
},
fonts: { display: 'Helvetica Neue', body: 'Helvetica Neue' },
// globals.css : --radius 0 partout, shadow = filet 1px (pas d'ombre portée)
```

### V4 — Premium sombre (sombre)
```ts
style: { mode: 'dark', hero: 'split', effects: 'subtle', cards: 'filled', uiStyle: 'premium-dark' },
palette: {
  accent1: '#7C9CFF', accent2: '#CCFF48', accent3: '#1AA35F', accent4: '#2D8FE0', accent5: '#7C5CFF',
  bgPrimary: '#0C1118', bgSurface: '#141E2D', bgSurface2: '#121B28',
  textPrimary: '#EAF0F8', textSecondary: '#A7B4C6', textMuted: '#6E7E93',
},
fonts: { display: 'Sora', body: 'Hanken Grotesk' },
// globals.css : --radius 16px, ombres profondes + reporter les correctifs sombre (§3b)
```

---

## 6. Muter (anti-footprint) — transformations BORNÉES

Le skin est un **point de départ**, jamais un clone. Appliquer 2–3 mutations encadrées :

- **Teinte de marque** : faire pivoter `accent1` de **±12 à ±45°** (garder la même famille de skin,
  changer la couleur). Recalculer `accent2`/soft en cohérence.
- **Fonts** : remplacer la paire par une paire **du même registre** (ex. V2 : Newsreader → Fraunces /
  Source Serif ; V1 : Bricolage → Clash/Cabinet ; V4 : Sora → Space Grotesk/Geist).
- **Rayons** : varier `--r` dans la fourchette du skin (V1/V4 : 12–20 px ; V2 : 2–6 px ; V3 : 0).
- **Structure** : on garde l'**ossature** Voltéo (§0) mais on peut varier l'ordre d'1-2 sections
  secondaires ou ajouter une section propre à la niche (cf. anti-footprint). On ne revient JAMAIS au
  squelette par défaut.
- **Verticale** : les couleurs de catégorie viennent du pack choisi → déjà différenciantes.

Règle : si un visiteur peut dire « c'est le même site que X », la mutation est insuffisante.

---

## 7. Checklist qualité — l'init n'est PAS finie tant que ✗

- [ ] **Structure Voltéo reproduite** : home (selon comparateur/magazine), hub et article suivent
      l'ordre des sections de **§0** — pas le squelette par défaut du moteur (héritage pré-Voltéo).
- [ ] `bgPrimary` ≠ blanc pur (teinté) — sauf V3 où le blanc pur est le parti pris.
- [ ] Contraste texte/fond **AA** vérifié (texte principal ≥ 4.5:1, gros titres ≥ 3:1).
- [ ] `mode` cohérent avec le skin (V4 = sombre ; V1/V2/V3 = clair).
- [ ] Une couleur **distincte** par catégorie (verticale appliquée, pas de doublon).
- [ ] Correctifs **V3** (rayon 0, zéro ombre) **/ V4** (sections sombres re-noircies) reportés.
- [ ] Skin **muté** : teinte/fonts/rayons ≠ valeurs brutes du skin (anti-footprint).
- [ ] `prefers-reduced-motion` respecté ; chaque section a un fond traité (pas de bloc plat vide).
- [ ] Aucun placeholder restant dans `palette`/`fonts` de `niche.config.ts`.

Un site qui sort de l'init en **structure par défaut** (couleurs Voltéo sur l'ancien squelette), en
**clone brut d'un skin**, ou avec un **contraste cassé** = **bug d'init**.
