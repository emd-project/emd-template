# Voltéo — Référence design (barre qualité du moteur)

Ce dossier est une **référence de direction artistique**, lue à l'init pour composer
la DA d'un nouveau site. Ce n'est PAS du code de production : rien ici n'est importé
dans `app/` ou `components/`.

## Le système
- `assets/styles.css` — design system Voltéo (tokens, nav, boutons, cartes, footer, badges).
- `assets/theme-v1.css` → `theme-v4.css` — les 4 **skins** (identités : couleurs, fonts, formes).
- `assets/vertical-*.css` — packs **verticale** (énergie, assurance, auto, tech) : redéfinissent
  les 5 couleurs de catégorie (`--cat-1..5`).
- `assets/main.js` — comportements partagés (nav scroll, reveal, compteurs).

## Les 4 skins
- **V1 Électrique** — bleu vif, grotesque arrondi, clair & aéré. Grand public, tech & amical.
- **V2 Éditorial** — serif fort, papier chaud, angles nets. Presse / autorité.
- **V3 Suisse / Minimal** — monochrome + 1 rouge, grille stricte, zéro ombre. Premium neutre / B2B.
- **V4 Premium sombre** — fond sombre, accent lumineux, grande typo. Haut de gamme.

Voir `DESIGN-NOTES.md` pour le mode d'emploi (mapping skin → `niche.config.ts` + `app/globals.css`).
