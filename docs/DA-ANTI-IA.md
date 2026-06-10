# DA Anti-IA — garde-fous (symptômes + signature)

> **Rôle.** Garde-fous anti-IA + composants signature, valables quel que soit le skin Voltéo retenu.
> La **forme** d'un site (couleurs, fonts, rayons, ombres) vient maintenant du **skin Voltéo** choisi à
> l'init (cf. [`design-reference/volteo/DESIGN-NOTES.md`](design-reference/volteo/DESIGN-NOTES.md)) —
> ce doc ne définit plus de catalogue de styles UI. Il reste la référence pour **éviter les marqueurs IA**
> et **poser une signature éditoriale** par-dessus le skin.

L'utilisateur n'est pas designer : Claude décide, propose en bloc, explique. L'utilisateur valide ou ajuste.

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

> Les skins Voltéo évitent déjà ces symptômes par construction. Vérifier surtout après **mutation**.

---

## Signature éditoriale : « 1 ancre + 1 règle + 3 inspirations »

Posée dans `niche.signature` (par-dessus le skin), pour donner une personnalité propre au site.

- **`anchor`** — un élément éditorial distinctif récurrent (ex. tech : lettrine mono + filet accent ;
  food : pull quote calligraphique ; finance : stats tabulaires façon FT ; santé : encart « Le saviez-vous »).
- **`oneRule`** — UNE règle contrariante visible (ex. « jamais de gradient sur les boutons » ;
  « titres toujours alignés à gauche » ; « bordure top accent sur chaque section »).
- **`inspiration`** — 2-3 vrais magazines dont on emprunte le **ton visuel**, pas le layout
  (ex. tech : The Verge, Wired, Monocle ; food : Bon Appétit, Kinfolk ; finance : Bloomberg, FT).
- **`forbidden`** — patterns IA + interdits de niche (cf. les 7 symptômes + spécifiques).
- **`components`** — active les composants signature pertinents (ci-dessous).

Mapping niche → signature par défaut (point de départ adaptable) :

| Niche | anchor | oneRule | components |
|---|---|---|---|
| Tech / gadgets | lettrine mono + filet accent | boutons flat sans gradient | lettrine, tabularStat |
| Cuisine / food | pull quote calligraphique | coins de cards ≤ 8px | pullQuote, editorialFootnote |
| Finance / crypto | stats tabulaires FT | titres jamais centrés | tabularStat, editorialFootnote |
| Voyage / lifestyle | note éditoriale Condé Nast | aucun full-width desktop | pullQuote, editorialFootnote |
| Santé / wellness | encart « Le saviez-vous » | fond jamais blanc pur | editorialFootnote, pullQuote |
| Auto / moto | specs tabulaires | fond noir teinté, jamais #000 | tabularStat, lettrine |

---

## Composants signature (dans `components/signature/`)

- **`<Lettrine>`** — drop cap éditoriale (display font + accent) sur le 1ᵉʳ paragraphe.
- **`<PullQuote>`** — citation entre sections (display italique, bordure latérale accent).
- **`<EditorialFootnote>`** — encart/note de marge (fond surface, bordure accent).
- **`<TabularStat>`** — stat tabulaire façon magazine business (label gauche, valeur accent droite).

```mdx
<Lettrine>Le marché des aspirateurs robots a changé en 2025…</Lettrine>
<PullQuote attribution="Test labo 2025">Le S8 MaxV écrase tout cette année.</PullQuote>
<TabularStat label="Autonomie" value="180" unit="min" accent={1} />
```

---

## Checklist anti-IA — avant de valider l'init

- [ ] Aucun des 7 symptômes présent.
- [ ] Palette ≥ 3 accents utilisés visuellement ; fond jamais blanc/noir pur (sauf parti pris V3).
- [ ] Font display ≠ font body (contraste typo visible).
- [ ] ≥ 1 composant signature activé ; `signature.forbidden` ≥ 3 patterns.
- [ ] Cards traitées (border-top / watermark / accent), pas juste un fond.
- [ ] Skin **muté** (cf. DESIGN-NOTES §6) — pas les valeurs brutes.
- [ ] `prefers-reduced-motion` respecté.

> Pour le mapping skin → CSS (rayons, ombres, correctifs clair/sombre), voir
> [`design-reference/volteo/DESIGN-NOTES.md`](design-reference/volteo/DESIGN-NOTES.md) §3 et §6.
