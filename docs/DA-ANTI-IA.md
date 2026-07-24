# DA Anti-IA — garde-fous (symptômes + signature)

> **Rôle.** Garde-fous anti-IA + signature éditoriale, valables quelle que soit la sélection retenue.
> La **forme** d'un site (couleurs, fonts, rayons, ombres) vient de la **variante + palette + typo
> seedées à l'init** (cf. [`AUTO-DESIGN.md`](AUTO-DESIGN.md) : `suggestVariants` + direction mutée +
> `suggestFonts`) — ce doc ne définit aucun style UI. Il sert à **éviter les marqueurs IA** et à
> **poser une signature éditoriale** par-dessus la sélection.

---

## Les 7 symptômes d'un site IA

Cumuler 3+ = identifié comme « fait par IA » :

1. **Hero centré bleu-violet dégradé** (layout par défaut v0/Lovable)
2. **Cards avec icônes pastel rondes** (Lucide dans des cercles colorés)
3. **Bento grid symétrique** (2×2 / 3×3 parfaitement aligné)
4. **Texte « lorem-y »** (superlatifs vides, structure identique partout)
5. **Boutons gradient avec ombre portée** (le CTA « IA-coded »)
6. **Palette trop propre** (2 couleurs, 0 aspérité, 0 texture)
7. **Typographie monotone** (1 seul weight, 0 hiérarchie)

> Les variantes du moteur évitent déjà ces symptômes par construction. Vérifier surtout après
> **mutation** de la palette.

---

## Signature éditoriale : « 1 ancre + 1 règle + 3 inspirations »

Posée dans `niche.signature` (par-dessus la sélection), pour donner une personnalité propre au site.

- **`anchor`** — un élément éditorial distinctif récurrent (ex. tech : lettrine CSS + filet accent ;
  food : pull quote calligraphique ; finance : stats tabulaires façon FT ; santé : encart « Le saviez-vous »).
- **`oneRule`** — UNE règle contrariante visible (ex. « jamais de gradient sur les boutons » ;
  « titres toujours alignés à gauche » ; « bordure top accent sur chaque section »).
- **`inspiration`** — 2-3 vrais magazines dont on emprunte le **ton visuel**, pas le layout
  (ex. tech : The Verge, Wired, Monocle ; food : Bon Appétit, Kinfolk ; finance : Bloomberg, FT).
- **`forbidden`** — patterns IA + interdits de niche (cf. les 7 symptômes + spécifiques).

Mapping niche → signature par défaut (point de départ adaptable) :

| Niche | anchor | oneRule |
|---|---|---|
| Tech / gadgets | lettrine CSS + filet accent | boutons flat sans gradient |
| Cuisine / food | pull quote calligraphique | coins de cards ≤ 8px |
| Finance / crypto | stats tabulaires FT | titres jamais centrés |
| Voyage / lifestyle | note éditoriale Condé Nast | aucun full-width desktop |
| Santé / wellness | encart « Le saviez-vous » | fond jamais blanc pur |
| Auto / moto | specs tabulaires | fond noir teinté, jamais #000 |

> Les ancres se réalisent en **CSS** (ex. lettrine via `::first-letter`, stats via
> `font-variant-numeric: tabular-nums`) ou avec les composants MDX **câblés** du moteur — pas en
> inventant des composants.

---

## Composants dans les articles

- **`<PullQuote>`** (`components/blog`, câblé dans le pipeline MDX) — citation entre sections
  (display italique, bordure latérale accent). C'est le **seul** composant « signature » utilisable
  dans un MDX.
- ⛔ **`<Lettrine>` / `<TabularStat>` / `<EditorialFootnote>` ne sont PAS câblés dans le pipeline
  MDX** : un article qui les utilise ne rend rien (ou casse). Ne pas les prescrire dans les briefs ;
  obtenir l'effet équivalent en CSS (lettrine `::first-letter`, stats tabulaires) ou via les
  composants listés dans `CLAUDE.md` § Rédaction.

---

## Checklist anti-IA — avant de clore l'init

- [ ] Aucun des 7 symptômes présent.
- [ ] Palette ≥ 3 accents utilisés visuellement ; fond jamais blanc/noir pur (sauf parti pris Net/Suisse).
- [ ] Font display ≠ font body (contraste typo visible) — sauf mono-famille assumée du pool.
- [ ] `signature.anchor` + `signature.oneRule` posés ; `signature.forbidden` ≥ 3 patterns.
- [ ] Cards traitées (border-top / watermark / accent), pas juste un fond.
- [ ] Direction **mutée** (teinte ±12–45°, cf. `DA-DIRECTIONS.md`) — pas les valeurs brutes.
- [ ] `prefers-reduced-motion` respecté.
