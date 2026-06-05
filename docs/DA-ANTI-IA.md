# DA Anti-IA — Référence (symptômes + signature + CSS par style UI)

Doc de **référence** utilisée par `docs/AUTO-DESIGN.md` pendant l'init. AUTO-DESIGN **orchestre** la
composition de la DA (archétype, palette, fonts, signature) ; ce doc fournit les **règles anti-IA** et
**l'application CSS concrète** par style UI.

**Principe** : l'utilisateur n'est pas designer. Claude prend TOUTES les décisions DA de manière
autonome (pendant `init-site` / `configure-from-spec` → AUTO-DESIGN), les propose en bloc, et explique
le raisonnement. L'utilisateur valide ou ajuste.

---

## Les 7 symptômes d'un site IA

Tout site qui cumule 3+ de ces symptômes sera identifié comme "fait par IA" :

1. **Hero centré bleu-violet dégradé** — le layout par défaut de v0/Lovable
2. **Cards avec icônes pastel rondes** — Lucide icons dans des cercles colorés
3. **Bento grid symétrique** — grille 2×2 ou 3×3 parfaitement alignée
4. **Texte "lorem-y"** — superlatifs vides, structure identique partout
5. **Boutons gradient avec ombre portée** — le CTA "IA-coded"
6. **Palette trop propre** — 2 couleurs max, 0 aspérité, 0 texture
7. **Typographie monotone** — 1 seule font weight, 0 hiérarchie visuelle

---

## La méthode : "1 ancre + 1 règle + 3 inspirations"

Chaque site a besoin de 3 choses pour avoir une personnalité :

### 1. L'ancre visuelle (`signature.anchor`)

Un élément éditorial distinctif qu'on retrouve sur le site. Exemples :

| Niche | Ancre possible |
|---|---|
| Tech/gadgets | Lettrine monospace sur chaque article + filet accent top |
| Cuisine/food | Pull quote calligraphique entre les sections |
| Finance/crypto | Stats tabulaires façon Financial Times |
| Voyage/lifestyle | Note éditoriale façon Condé Nast Traveler |
| Santé/wellness | Encart "Le saviez-vous" avec bordure accent douce |
| Mode/beauté | Caption stylisée sous chaque image produit |

Claude choisit l'ancre en fonction de la niche et l'active dans `niche.signature.components`.

### 2. La règle contrariante (`signature.oneRule`)

UNE règle de design qui va CONTRE les habitudes IA. Exemples :

- "Jamais de gradient sur les boutons — flat + border uniquement"
- "Jamais de cards avec coins arrondis > 4px"
- "Jamais d'icônes dans des cercles colorés"
- "Titres toujours alignés à gauche, jamais centrés"
- "Aucun élément pleine largeur sur desktop"
- "Bordure top accent sur CHAQUE section, pas de fond coloré"

Cette règle doit être VISIBLE — le site a l'air intentionnel, pas par défaut.

### 3. Les inspirations (`signature.inspiration`)

2-3 vrais magazines/sites dont on emprunte le TON VISUEL (pas le contenu). Choisis selon la niche :

| Niche | Inspirations type |
|---|---|
| Tech premium | The Verge, Wired, Monocle |
| Cuisine | Bon Appétit, Cereal Magazine, Kinfolk |
| Finance | Bloomberg, The Economist, FT |
| Voyage | Condé Nast Traveler, Wallpaper*, Kinfolk |
| Santé | Headspace (app), Calm, Ro |
| Gaming | Polygon, IGN minimal, Kotaku |
| Lifestyle | Highsnobiety, Hypebeast, Ssense |

Ces inspirations calibrent le font pairing, la densité, et le traitement typographique — PAS à copier le layout.

---

## Les patterns interdits (`signature.forbidden`)

Base minimum pour TOUT site :

```
[
  "hero centré avec gradient bleu-violet",
  "cards bento grid symétrique avec icônes rondes pastel",
  "boutons gradient avec box-shadow",
  "palette 2 couleurs sans texture ni variation",
  "sections alternées blanc/gris clair identiques"
]
```

Interdits spécifiques niche :
- **Tech** : + "fond noir pur #000000" (trop générique — utiliser un noir teinté)
- **Cuisine** : + "images stock souriantes" + "palette pastel homogène"
- **Finance** : + "illustrations flat style Notion" + "tout en bleu corporate"
- **Voyage** : + "hero plein écran avec parallax" (trop 2018)

---

## Composants signature disponibles

Le template embarque 4 composants dans `components/signature/` :

### `<Lettrine>`
Drop cap éditoriale sur le premier paragraphe. Lettre en display font + accent color.
```mdx
<Lettrine>Le marché des aspirateurs robots a radicalement changé en 2025...</Lettrine>
```

### `<PullQuote>`
Citation éditoriale entre sections. Grande typo display italique, bordure latérale accent.
```mdx
<PullQuote attribution="Test labo 2025">Le S8 MaxV écrase tout ce qu'on a testé cette année.</PullQuote>
```

### `<EditorialFootnote>`
Note de marge/encart. Fond surface, bordure accent4. Pour apartés, mises en contexte.
```mdx
<EditorialFootnote label="Note">Prix relevés en mars 2025. Susceptibles de varier.</EditorialFootnote>
```

### `<TabularStat>`
Stat tabulaire façon magazine business. Label à gauche, grosse valeur accent à droite.
```mdx
<TabularStat label="Autonomie" value="180" unit="min" accent={1} />
<TabularStat label="Puissance" value="11 000" unit="Pa" accent={2} />
```

---

## Comment AUTO-DESIGN utilise ce doc (pendant l'init)

Pendant `AUTO-DESIGN.md` (étapes DA de `init-site` / `configure-from-spec`), Claude :

1. **Lit la niche** (clusters / spec) et cherche dans `lib/da-presets` le preset le plus proche.
2. **Compose le preset** : palette + fonts + style + anti-patterns (`composePreset`).
3. **Choisit la signature** de façon autonome :
   - `anchor` : selon la niche et le ton
   - `oneRule` : une règle contrariante pertinente
   - `inspiration` : 2-3 magazines/sites cohérents
   - `forbidden` : patterns IA + patterns spécifiques niche
   - `components` : active les composants signature pertinents
4. **Applique le style UI** (section CSS ci-dessous) : pas juste les couleurs — la **forme**.
5. **Présente le tout à l'utilisateur** en un bloc structuré (style, palette, fonts, signature + raisonnement), puis applique après validation.

```
Voici la DA que je propose pour [siteName] :
■ Style : [mode] / [hero] / effets [effects] / cards [cards]
■ Palette : [11 couleurs]
■ Fonts : [display] + [body]
■ Signature : ancre · règle · inspirations · composants · interdits
Raisonnement : [1-2 phrases]
Tu valides ou tu ajustes ?
```

---

## Checklist DA — avant de valider

- [ ] Palette ≠ 2 couleurs — minimum 3 accents utilisés visuellement
- [ ] Font display ≠ font body — contraste typographique visible
- [ ] Au moins 1 composant signature activé
- [ ] `signature.forbidden` contient 3+ patterns
- [ ] Aucun des 7 symptômes IA présent
- [ ] Le fond n'est pas un noir/blanc pur — toujours teinté
- [ ] Les cards ont un traitement (border-top, watermark, accent), pas juste un fond
- [ ] Le hero a un élément asymétrique ou un détail visuel
- [ ] prefers-reduced-motion respecté sur toutes les animations

---

## Mapping niche → signature par défaut

Point de départ (adaptable) :

| Type de niche | anchor | oneRule | components |
|---|---|---|---|
| Tech / gadgets | lettrine mono + filet accent | boutons flat sans gradient | lettrine, tabularStat |
| Cuisine / food | pull quote calligraphique | jamais de cards coins ronds > 8px | pullQuote, editorialFootnote |
| Finance / crypto | stats tabulaires FT-style | titres jamais centrés | tabularStat, editorialFootnote |
| Voyage / lifestyle | note éditoriale Condé Nast | aucun élément full-width desktop | pullQuote, editorialFootnote |
| Santé / wellness | encart "Le saviez-vous" | fond jamais blanc pur — crème/off-white | editorialFootnote, pullQuote |
| Mode / beauté | caption stylisée sous images | jamais d'ombre portée sur les cartes | pullQuote, lettrine |
| Gaming / esport | stat block façon fiche RPG | jamais de bleu corporate | tabularStat, lettrine |
| Éducation | note pédagogique marge | cards sans icônes décoratives | editorialFootnote, tabularStat |
| Immobilier | chiffres clés tabulaires | jamais de stock photo | tabularStat, editorialFootnote |
| Auto / moto | specs tabulaires | fond noir teinté, jamais #000 | tabularStat, lettrine |

---

## APPLICATION CSS CONCRÈTE PAR STYLE UI

La section la plus importante. Quand Claude choisit un UI style via `findUIStyles()`, il **DOIT**
modifier `globals.css` et les composants en conséquence. Pas juste les couleurs — la **forme**.

```ts
const styles = findUIStyles(['tech', 'premium', 'dark'], 3)
// styles[0].cssKeywords / .variables / .effects / .checklist
```

### Brutalism / Neubrutalism
```css
--radius-sm: 0; --radius-md: 0; --radius-lg: 0; --radius-full: 0;
--shadow: 4px 4px 0 var(--text-primary);
```
- `border-radius: 0` partout · `box-shadow: 4px 4px 0` (dur, sans blur) · titres uppercase/extra-bold · borders 2-3px · transitions très courtes

### Glassmorphism / Liquid Glass
```css
--glass-bg: rgba(255,255,255,0.05);
--glass-border: rgba(255,255,255,0.08);
--glass-blur: 16px;
```
- Cards : `backdrop-filter: blur(16px)` · borders semi-transparentes · ombres diffuses · radius 12-16px · fond gradient subtil sous le blur

### Minimalism / Swiss Style
```css
--radius-sm: 0; --radius-md: 2px; --radius-lg: 4px;
```
- Zéro ombre/gradient/animation déco · grid 12 colonnes strictes · whitespace ×1.5 · 2 weights max · noir/blanc/1 accent

### Editorial / Magazine
```css
--radius-sm: 0; --radius-md: 0; --radius-lg: 0;
```
- Font display **serif** (Playfair, Cormorant, Libre Baskerville) · grille asymétrique · pull quotes + lettrines · filets horizontaux · espacement aéré

### Aurora UI
```css
--aurora-1: var(--accent-1); --aurora-2: var(--accent-4); --aurora-3: var(--accent-3);
```
- Gradient animé en background (AuroraBackground) · glow hover `0 0 20px rgba(accent,0.3)` · transitions 300-400ms · radius 8-12px

### Dark Mode OLED
```css
--bg-primary: #000000; --bg-surface: #0A0A0A;
```
- Fond vrai noir `#000` (OLED) · accents vifs · borders très subtiles · pas de surface grise

### Neumorphism / Soft UI
```css
--shadow-raised: 6px 6px 12px rgba(0,0,0,0.2), -6px -6px 12px rgba(255,255,255,0.03);
--shadow-inset: inset 4px 4px 8px rgba(0,0,0,0.2), inset -4px -4px 8px rgba(255,255,255,0.03);
```
- Double shadow · fond et cards très proches (pas de border) · radius 12-20px · inputs `box-shadow: inset`

### Bento Box / Bento Grid
- Home : grille CSS irrégulière (`grid-template-areas`) · cards de tailles variées · radius uniforme 16px · gap constant · le hero EST la grille

### Retro / Y2K / Vaporwave
```css
--radius-sm: 0; --radius-md: 0;
```
- Couleurs très saturées (magenta, cyan, jaune) · typo condensée/pixel · borders visibles · gradients linéaires · scan lines/noise

### Cyberpunk / HUD / Sci-Fi
```css
--glow: 0 0 10px var(--accent-1), 0 0 30px rgba(accent, 0.2);
```
- Coins coupés via `clip-path` · glow neon · fond très sombre + accent vif · typo monospace pour les données · glitch/scan lines

### Conversion-Optimized / Trust & Authority
- Pas d'effets déco — focus contenu · CTA très visibles · badges de confiance/étoiles · typo large (16px+) · whitespace généreux autour des CTA

---

## Comment Claude applique le style UI

Pendant les étapes DA de l'init (via AUTO-DESIGN) :

1. **Identifie le style** via `findUIStyles()` + niche rule `stylePriority`.
2. **Lit `cssKeywords` et `variables`** du style.
3. **Réécrit `globals.css`** : `--radius-*`, `--shadow` / `--glass-bg` / `--glow`, transitions, spacing, borders.
4. **Adapte les composants** : cards (shadows/borders/radius/backdrop-filter), boutons (flat vs gradient vs neumorphic), hero (selon le `pattern` de la niche rule), navigation.
5. **Ajoute du CSS custom** dans la section `/* ── Style UI ── */` de globals.css (glow, glassmorphism, clip-path…).

**IMPORTANT** : ne pas se limiter aux 4 variantes structurelles (`hero`, `cards`, `effects`, `mode`).
Le style UI va PLUS LOIN — border-radius, ombres, transitions, densité, parfois le layout. Deux sites
avec le même hero `split`, l'un Brutalism l'autre Glassmorphism, sont radicalement différents — pas
juste des couleurs différentes sur le même squelette.
