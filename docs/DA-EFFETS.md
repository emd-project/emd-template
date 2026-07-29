# DA-EFFETS — catalogue des traitements, à piocher dans `app/styles/da-site.css`

> **À quoi ça sert.** Le layout (quelle home, quelle catégorie, quel article) et la palette sont choisis
> ailleurs (`AUTO-DESIGN.md`, `DA-DIRECTIONS.md`). Ici, on choisit **la peau** : comment se comportent les
> titres, les cartes, les sections, le mouvement, la matière. C'est ce qui fait qu'un site se reconnaît
> au premier coup d'œil — et c'est aujourd'hui le levier le plus sous-exploité du réseau.
>
> **Où on écrit.** Uniquement dans **`app/styles/da-site.css`**, propre au site, importé en dernier.
> Jamais dans les fichiers partagés (`volteo*.css`, `globals.css`) : ils appartiennent aux 24 forks.

## Les 6 règles de composition

1. **Un parti pris d'abord, les effets ensuite.** Écris en une phrase l'idée directrice du site
   (« papier fiduciaire, tableaux comptables sobres, cuivre et marine »). Chaque effet retenu doit
   la servir. Sans parti pris, on empile des effets sans lien et ça se voit.
2. **3 à 5 effets maximum.** Au-delà, ce n'est plus une direction artistique, c'est un sapin de Noël.
3. **Tokens uniquement.** `var(--accent-1)`, `var(--bg-surface)`, `var(--text-secondary)`…
   **Jamais un hex en dur** : il casse le thème et sort de la palette calculée.
4. **Toute animation est neutralisée sous `prefers-reduced-motion`.** Non négociable (WCAG 2.3.3).
5. **Pas de layout ici.** Aucune `grid-template-columns`, aucune largeur de colonne, aucun `position`
   structurel. Le layout appartient aux composants ; `da-site.css` fait de la couleur, de la matière,
   du mouvement, de la typographie.
6. **Recalcule le contraste après.** Un effet qui pose du texte sur un accent ou un dégradé doit
   toujours finir à **≥ 4,5:1** (≥ 3:1 pour les très gros titres). Un dégradé de texte se vérifie sur
   sa couleur **la plus claire**.

> ⚠️ **Limite à connaître.** `PresseHome`, `PresseArticle` et `ClassementList` sont stylés **en inline**
> (`style={{…}}`), et l'inline gagne toujours sur une feuille CSS. Sur ces surfaces, `da-site.css` n'agit
> que par les **tokens** (palette, rayons, fonts). Les effets de ce catalogue portent surtout sur les
> homes Voltéo (magazine, comparateur, marche, fil), les hubs, et la prose d'article.

---

## 1. Titres et typographie

### 1.1 Filet coloré sous les titres de section
Une barre courte sous chaque H2. Sobre, structure la page, marche partout.
```css
.section h2::after, .sec-head h2::after {
  content: ''; display: block; width: 56px; height: 3px; margin-top: 12px;
  background: var(--accent-1); border-radius: 2px;
}
```

### 1.2 Eyebrow en capitales espacées
Le sur-titre devient un signal graphique. **Capitales réservées aux libellés courts (≤ 3 mots).**
```css
.eyebrow {
  text-transform: uppercase; letter-spacing: .14em;
  font-size: 12px; font-weight: 700; color: var(--accent-1);
}
```

### 1.3 Surlignage au feutre
Le mot clé du H1 surligné, comme au marqueur. Chaleureux, éditorial.
```css
h1 .hl {
  background: linear-gradient(transparent 62%, color-mix(in srgb, var(--accent-2) 45%, transparent) 0);
  padding: 0 .08em;
}
```

### 1.4 Titre en dégradé
Deux accents dans le titre. **Fort caractère — à réserver aux DA tech/premium, et à un seul niveau de
titre.** Vérifier le contraste sur la couleur la plus claire du dégradé.
```css
h1 {
  background: linear-gradient(100deg, var(--text-primary) 30%, var(--accent-1));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
```

### 1.5 Lettrine
Première lettre de l'article en grand. Très éditorial, presse et magazine.
```css
.prose-article > p:first-of-type::first-letter {
  float: left; font-family: var(--next-font-display), serif; font-size: 3.4em;
  line-height: .82; padding: .06em .1em 0 0; color: var(--accent-1);
}
```

### 1.6 Chiffres tabulaires
Les prix, notes et statistiques s'alignent verticalement. **Toujours pertinent sur un comparateur.**
```css
.stat .n, .price, .amt, .val, .b-price, td { font-variant-numeric: tabular-nums; }
```

### 1.7 Titres serrés
Tracking négatif sur les grands titres : plus dense, plus contemporain.
```css
h1, h2 { letter-spacing: -.02em; }
```

---

## 2. Cartes et surfaces

### 2.1 Carte à filet latéral
Un trait d'accent à gauche au lieu d'une bordure complète. Sobre et reconnaissable.
**Pas de `border-radius` sur une bordure d'un seul côté.**
```css
.post, .cat { border: 0; border-left: 3px solid var(--accent-1); border-radius: 0; }
```

### 2.2 Carte pleine
Fond de surface au lieu d'un contour. Doux, moins « administratif ».
```css
.post, .cat { background: var(--bg-surface-2); border-color: transparent; }
```

### 2.3 Relief au survol
La carte se soulève légèrement. L'effet le plus universel — et le plus sûr.
```css
.post, .cat { transition: transform .18s ease, box-shadow .18s ease; }
.post:hover, .cat:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
@media (prefers-reduced-motion: reduce) {
  .post, .cat { transition: none; }
  .post:hover, .cat:hover { transform: none; }
}
```

### 2.4 Bordure qui s'allume
La bordure passe à l'accent au survol. Discret, très efficace en mode sombre.
```css
.post, .cat { transition: border-color .2s ease; }
.post:hover, .cat:hover { border-color: var(--accent-1); }
@media (prefers-reduced-motion: reduce) { .post, .cat { transition: none; } }
```

### 2.5 Coin coupé
Un angle biseauté au lieu d'un rayon. Signature nette, industrielle.
```css
.post, .cat { border-radius: 0; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); }
```

### 2.6 Verre dépoli
Surface translucide floutée. **Uniquement sur un site sombre, et seulement sur des surfaces posées
au-dessus d'un fond coloré** (sinon c'est du gris sale).
```css
.cat, .promo { background: color-mix(in srgb, var(--bg-surface) 60%, transparent); backdrop-filter: blur(12px); }
```

### 2.7 Numérotation en creux
Un grand chiffre fantôme derrière les étapes ou les rangs. Éditorial, aéré.
```css
.step, .mstep { position: relative; }
.step .num, .mstep .num {
  font-size: 64px; font-weight: 800; color: color-mix(in srgb, var(--accent-1) 18%, transparent);
  background: none; border: 0; width: auto; height: auto;
}
```

---

## 3. Sections et ambiance

### 3.1 Fonds alternés
Une section sur deux sur fond de surface : rythme la page sans rien ajouter.
```css
.section:nth-of-type(even) { background: var(--bg-surface-2); }
```

### 3.2 Filet séparateur
Un trait fin entre les sections. Sobriété suisse.
```css
.section + .section { border-top: 1px solid var(--border); }
```

### 3.3 Halo radial
Une lueur d'accent en fond de section. **Sombre uniquement**, et une seule fois par page.
```css
.hero, .md-hero {
  background-image: radial-gradient(60% 50% at 70% 0%, color-mix(in srgb, var(--accent-1) 22%, transparent), transparent 70%);
}
```

### 3.4 Grain
Une texture de papier très légère sur toute la page. Chaleureux, éditorial, imprimé.
**Opacité ≤ 0,04 : au-delà ça salit le texte.**
```css
body::after {
  content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: .035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E");
}
```

### 3.5 Bandeau d'accent pleine largeur
Une section repeinte à l'accent. **Vérifier le contraste du texte à l'intérieur** — c'est le piège n°1.
```css
.stats { background: var(--accent-1); }
.stats, .stats .n, .stats .l { color: var(--bg-primary); }
```

### 3.6 Rythme vertical ample
Des sections plus respirantes. Suffit souvent à faire « premium ».
```css
.section { padding-block: clamp(56px, 9vw, 128px); }
```

---

## 4. Mouvement

> Toujours court (**100-600 ms**), toujours neutralisé sous `prefers-reduced-motion`.
> Le template a déjà une révélation au scroll globale (`volteo-motion.css`) : ne pas la doubler.

### 4.1 Soulignement au survol
Le lien se souligne de gauche à droite. Le plus sûr des effets de mouvement.
```css
.post h3, .cat h3 { background-image: linear-gradient(var(--accent-1), var(--accent-1));
  background-size: 0 2px; background-position: 0 100%; background-repeat: no-repeat;
  transition: background-size .25s ease; }
.post:hover h3, .cat:hover h3 { background-size: 100% 2px; }
@media (prefers-reduced-motion: reduce) { .post h3, .cat h3 { transition: none; } }
```

### 4.2 Apparition en cascade
Les cartes d'une grille arrivent l'une après l'autre. **Décalage court (≤ 60 ms), 6 éléments max.**
```css
.posts > * { animation: da-rise .45s ease both; }
.posts > :nth-child(2) { animation-delay: .06s }
.posts > :nth-child(3) { animation-delay: .12s }
@keyframes da-rise { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { .posts > * { animation: none } }
```

### 4.3 Bouton qui s'enfonce
Retour tactile au clic. Minuscule, mais on le sent.
```css
.btn { transition: transform .1s ease; }
.btn:active { transform: scale(.97); }
@media (prefers-reduced-motion: reduce) { .btn { transition: none } .btn:active { transform: none } }
```

### 4.4 Nav qui se densifie au scroll
La barre se resserre et s'opacifie une fois la page défilée (classe `.scrolled` déjà posée par le template).
```css
.nav.scrolled { background: color-mix(in srgb, var(--bg-primary) 88%, transparent); backdrop-filter: blur(10px); }
```

---

## 5. Détails de finition

### 5.1 Anneau de focus signé
Reprend l'accent du site. **À poser systématiquement** : le focus visible est une obligation (WCAG 2.4.7).
```css
:focus-visible { outline: 2px solid var(--accent-1); outline-offset: 2px; border-radius: 2px; }
```

### 5.2 Sélection de texte à l'accent
Un détail que personne ne remarque consciemment, et qui signe le site.
```css
::selection { background: color-mix(in srgb, var(--accent-1) 25%, transparent); color: var(--text-primary); }
```

### 5.3 Puces de liste à l'accent
```css
.prose-article ul li::marker { color: var(--accent-1); }
```

### 5.4 Citations décalées
```css
.prose-article blockquote {
  border-left: 3px solid var(--accent-1); padding-left: 20px; font-style: normal;
  font-family: var(--next-font-display), serif; font-size: 1.15em;
}
```

### 5.5 Tableaux zébrés
```css
.prose-article table tbody tr:nth-child(odd) { background: var(--bg-surface-2); }
```

---

## Combinaisons cohérentes (exemples, à ne pas recopier tel quel)

| Parti pris | Effets retenus |
|---|---|
| **Presse imprimée, papier et encre** | 1.5 lettrine · 3.4 grain · 5.4 citations décalées · 3.2 filet séparateur |
| **Documents financiers, sobriété suisse** | 1.6 chiffres tabulaires · 2.1 filet latéral · 3.2 filet séparateur · 5.1 focus signé |
| **Tech premium sombre** | 1.4 titre dégradé · 2.6 verre dépoli · 3.3 halo radial · 4.1 soulignement |
| **Magazine chaleureux** | 1.3 surlignage feutre · 2.2 carte pleine · 3.1 fonds alternés · 4.2 cascade |
| **Industriel, net** | 2.5 coin coupé · 1.7 titres serrés · 3.6 rythme ample · 4.3 bouton enfoncé |

**Ces combinaisons sont des illustrations de cohérence, pas un menu à réutiliser.** Deux sites du réseau
ne doivent jamais partager la même sélection d'effets : c'est le troisième niveau d'anti-empreinte,
après le squelette et la palette.

---

## Contrôle avant commit

1. **3 à 5 effets**, tous au service du parti pris écrit en tête de `da-site.css`.
2. **Zéro hex** dans le fichier.
3. Chaque animation a son `prefers-reduced-motion`.
4. Aucune règle de layout.
5. Contraste recalculé sur toute surface repeinte (3.5, 1.4, 2.6 surtout).
6. La sélection d'effets **diffère** de celle des 3 derniers sites (à vérifier dans leur `da-site.css`).
