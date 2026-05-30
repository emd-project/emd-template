# DA Anti-IA — Guide autonome pour Claude Code

Ce doc est lu par Claude Code pendant l'init. Il contient les règles pour
créer une direction artistique qui ne ressemble PAS à un site généré par IA.

**Principe fondamental** : l'utilisateur n'est pas designer. Claude Code prend
TOUTES les décisions DA de manière autonome, les propose en bloc, et explique
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

Claude Code choisit l'ancre en fonction de la niche et l'active dans
`niche.signature.components`.

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

2-3 vrais magazines/sites dont on emprunte le TON VISUEL (pas le contenu).
Claude Code les choisit selon la niche :

| Niche | Inspirations type |
|---|---|
| Tech premium | The Verge, Wired, Monocle |
| Cuisine | Bon Appétit, Cereal Magazine, Kinfolk |
| Finance | Bloomberg, The Economist, FT |
| Voyage | Condé Nast Traveler, Wallpaper*, Kinfolk |
| Santé | Headspace (app), Calm, Ro |
| Gaming | Polygon, IGN minimal, Kotaku |
| Lifestyle | Highsnobiety, Hypebeast, Ssense |

Ces inspirations servent à calibrer les choix de font pairing, densité, et
traitement typographique — PAS à copier leur layout.

---

## Les patterns interdits (`signature.forbidden`)

Claude Code remplit automatiquement ces interdits selon la niche.
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

En ajoutant des interdits spécifiques à la niche :

- **Tech** : + "fond noir pur #000000" (trop générique — utiliser un noir teinté)
- **Cuisine** : + "images stock souriantes" + "palette pastel homogène"
- **Finance** : + "illustrations flat style Notion" + "tout en bleu corporate"
- **Voyage** : + "hero plein écran avec parallax" (trop 2018)

---

## Composants signature disponibles

Le template embarque 4 composants dans `components/signature/` :

### `<Lettrine>`
Drop cap éditoriale sur le premier paragraphe d'un article. Lettre en display
font + accent color. Usage en MDX :
```mdx
<Lettrine>Le marché des aspirateurs robots a radicalement changé en 2025...</Lettrine>
```

### `<PullQuote>`
Citation éditoriale entre sections. Grande typo display en italique, bordure
latérale accent. Usage :
```mdx
<PullQuote attribution="Test labo 2025">Le S8 MaxV écrase tout ce qu'on a testé cette année.</PullQuote>
```

### `<EditorialFootnote>`
Note de marge/encart éditorial. Fond surface, bordure accent4. Pour les
apartés, mises en contexte, ou "note de la rédaction". Usage :
```mdx
<EditorialFootnote label="Note">Prix relevés en mars 2025. Susceptibles de varier.</EditorialFootnote>
```

### `<TabularStat>`
Stat tabulaire façon magazine business. Label à gauche, grosse valeur accent à
droite. Pour les chiffres clés. Usage :
```mdx
<TabularStat label="Autonomie" value="180" unit="min" accent={1} />
<TabularStat label="Puissance" value="11 000" unit="Pa" accent={2} />
```

---

## Workflow pendant l'init (ce que Claude Code fait)

Au Bloc 6 du PROMPT-INIT, Claude Code :

1. **Lit la niche** (Bloc 1) et cherche dans `lib/da-presets` le preset le
   plus proche
2. **Compose le preset** : palette + fonts + style + anti-patterns
3. **Choisit la signature** autonomement :
   - `anchor` : basé sur la niche et le tone
   - `oneRule` : choisit une règle contrariante pertinente
   - `inspiration` : 2-3 magazines/sites cohérents
   - `forbidden` : patterns IA + patterns spécifiques niche
   - `components` : active les composants signature pertinents
4. **Présente le tout à l'utilisateur** en un bloc structuré :

```
Voici la DA que je propose pour [siteName] :

■ Style : dark / split hero / effets aurora / cards bordered
■ Palette : [tableau avec les 11 couleurs]
■ Fonts : [display] + [body]
■ Signature :
  · Ancre : lettrine monospace sur chaque article
  · Règle : jamais de gradient sur les boutons — flat + border
  · Inspirations : The Verge, Monocle, Wired
  · Composants activés : lettrine, tabularStat
  · Interdit : [liste des patterns bannis]

Raisonnement : [1-2 phrases expliquant pourquoi ces choix]

Tu valides ou tu ajustes ?
```

5. L'utilisateur dit "ok" ou demande un ajustement spécifique
6. Claude Code applique et passe à l'étape suivante

---

## Checklist DA — avant de valider l'Étape 1

- [ ] Palette ≠ 2 couleurs — minimum 3 accents utilisés visuellement
- [ ] Font display ≠ font body — contraste typographique visible
- [ ] Au moins 1 composant signature activé
- [ ] `signature.forbidden` contient 3+ patterns
- [ ] Aucun des 7 symptômes IA listés plus haut n'est présent
- [ ] Le fond n'est pas un noir/blanc pur — toujours teinté
- [ ] Les cards ont un traitement (border-top, watermark, accent) pas juste un fond
- [ ] Le hero a un élément asymétrique ou un détail visuel (pas centré symétrique)
- [ ] prefers-reduced-motion respecté sur toutes les animations

---

## Mapping niche → signature par défaut

Claude Code utilise cette table comme point de départ. Il peut adapter.

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

C'est la section la plus importante. Quand Claude Code choisit un UI style
via `findUIStyles()`, il **DOIT** modifier `globals.css` et les composants
en conséquence. Pas juste changer les couleurs — changer la **forme**.

Le style UI est trouvé dans la base via :
```ts
const styles = findUIStyles(['tech', 'premium', 'dark'], 3)
// → ex: styles[0].category = "Dark Mode (OLED)"
// → styles[0].cssKeywords = "backdrop-filter, border: 1px solid rgba(...)..."
// → styles[0].variables = "--border-radius: 12px, --shadow: 0 0 20px..."
```

Claude lit le `cssKeywords`, `variables`, `effects` et `checklist` du style
et applique les transformations ci-dessous.

### Brutalism / Neubrutalism
```css
--radius-sm: 0; --radius-md: 0; --radius-lg: 0; --radius-full: 0;
--shadow: 4px 4px 0 var(--text-primary);
/* Borders épaisses, typo massive, couleurs crues */
```
- `border-radius: 0` partout — cartes, boutons, inputs
- `box-shadow: 4px 4px 0` — ombre dure, pas de blur
- Titres en uppercase ou extra-bold (800+)
- Borders 2-3px solid, pas 1px
- Pas de transitions douces — `transition: none` ou très court (100ms)

### Glassmorphism / Liquid Glass
```css
--glass-bg: rgba(255,255,255,0.05);
--glass-border: rgba(255,255,255,0.08);
--glass-blur: 16px;
```
- Cards : `backdrop-filter: blur(16px); background: var(--glass-bg)`
- Borders semi-transparentes `rgba(255,255,255,0.08)`
- Ombres diffuses `0 8px 32px rgba(0,0,0,0.3)`
- Border-radius généreux (12-16px)
- Fond avec gradient subtil sous le blur

### Minimalism / Swiss Style
```css
--radius-sm: 0; --radius-md: 2px; --radius-lg: 4px;
/* Pas de shadows, pas d'effets, grid strict */
```
- Zéro ombre, zéro gradient, zéro animation décorative
- Grid 12 colonnes strictes
- Beaucoup de whitespace (spacing ×1.5)
- Typo mono-weight ou 2 weights max (400, 700)
- Couleurs : noir, blanc, 1 accent unique

### Editorial / Magazine
```css
--radius-sm: 0; --radius-md: 0; --radius-lg: 0;
/* Serif pour titres, grille asymétrique */
```
- Font display **serif** (Playfair, Cormorant, Libre Baskerville)
- Grille asymétrique (pas 3 colonnes égales)
- Pull quotes et lettrines systématiques
- Filets horizontaux entre sections
- Espacement aéré, ligne de base visible

### Aurora UI
```css
/* Gradients animés, glow effects */
--aurora-1: var(--accent-1); --aurora-2: var(--accent-4); --aurora-3: var(--accent-3);
```
- Gradient animé en background (déjà implémenté via AuroraBackground)
- Glow sur les éléments hover : `box-shadow: 0 0 20px rgba(accent, 0.3)`
- Transitions fluides (300-400ms)
- Border-radius moyens (8-12px)

### Dark Mode OLED
```css
--bg-primary: #000000; /* exception : vrai noir pour OLED */
--bg-surface: #0A0A0A;
```
- Fond vrai noir `#000` (économie batterie OLED)
- Accents vifs sur fond noir (contraste maximum)
- Borders très subtiles `rgba(255,255,255,0.04)`
- Pas de surface grise — soit noir soit accent

### Neumorphism / Soft UI
```css
--shadow-raised: 6px 6px 12px rgba(0,0,0,0.2), -6px -6px 12px rgba(255,255,255,0.03);
--shadow-inset: inset 4px 4px 8px rgba(0,0,0,0.2), inset -4px -4px 8px rgba(255,255,255,0.03);
```
- Double shadow (ombre + lumière) sur les cards et boutons
- Fond et cards de couleur très proche (pas de border)
- Border-radius généreux (12-20px)
- Inputs avec `box-shadow: inset` (apparence enfoncée)

### Bento Box / Bento Grid
```css
/* Grille asymétrique façon macOS widgets */
```
- Home : grille CSS irrégulière avec `grid-template-areas`
- Cards de tailles variées (span 1, span 2, tall, wide)
- Border-radius uniforme (16px)
- Gap constant entre les blocs
- Pas de hero traditionnel — le hero EST la grille

### Retro / Y2K / Vaporwave
```css
--radius-sm: 0; --radius-md: 0;
/* Couleurs saturées, typo pixelisée ou condensée */
```
- Couleurs très saturées (magenta, cyan, jaune)
- Typo condensée ou pixel-art
- Borders visibles, parfois doubles
- Gradients linéaires (pas radiaux)
- Textures : scan lines, noise fort

### Cyberpunk / HUD / Sci-Fi
```css
/* Angles coupés, glow neon, fond très sombre */
--glow: 0 0 10px var(--accent-1), 0 0 30px rgba(accent, 0.2);
```
- Coins coupés via `clip-path` au lieu de border-radius
- Glow neon sur les accents (`text-shadow`, `box-shadow`)
- Fond très sombre avec accent vif (cyan, magenta, lime)
- Typo monospace pour les données
- Animations : glitch, scan lines, flicker

### Conversion-Optimized / Trust & Authority
```css
/* Plus conservateur, focus lisibilité et confiance */
```
- Pas d'effets décoratifs — focus contenu
- CTA très visibles (taille, couleur, position)
- Badges de confiance, étoiles, témoignages
- Typo large et lisible (16px+ body)
- Whitespace généreux autour des CTA

---

## COMMENT CLAUDE APPLIQUE LE STYLE UI

Pendant l'init, étape 1 (Config + DA), Claude Code :

1. **Identifie le style** via `findUIStyles()` + niche rule `stylePriority`
2. **Lit les `cssKeywords` et `variables`** du style trouvé
3. **Réécrit `globals.css`** avec les variables CSS adaptées :
   - `--radius-*` (0 pour brutalism, 12-16px pour glass, etc.)
   - `--shadow` / `--glass-bg` / `--glow` selon le style
   - transitions, spacing, borders
4. **Adapte les composants** si nécessaire :
   - Cards : shadows, borders, radius, backdrop-filter
   - Boutons : flat vs gradient vs neumorphic
   - Hero : layout selon le `pattern` de la niche rule
   - Navigation : style des liens, active states
5. **Ajoute du CSS custom** dans la section `/* ── Style UI ── */` de globals.css
   pour les effets spécifiques au style (glow, glassmorphism, clip-path, etc.)

**IMPORTANT** : Ne pas se limiter aux 4 variantes structurelles (`hero`, `cards`,
`effects`, `mode`). Le style UI va PLUS LOIN — il modifie le border-radius, les
ombres, les transitions, la densité, et parfois le layout même des composants.
Les 4 variantes sont un minimum, le style UI les complète et les dépasse.

**Le résultat** : deux sites avec le même hero `split` mais l'un en Brutalism et
l'autre en Glassmorphism auront une apparence radicalement différente — pas juste
des couleurs différentes sur le même squelette.
