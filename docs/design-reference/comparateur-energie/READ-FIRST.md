# Référence de DA — Comparateur énergie (« Voltéo »)

Ce dossier est une **référence de direction artistique aboutie**, pas du code de production.
Il sert de **barre qualité** au moment de l'init d'un nouveau site (cf. `docs/AUTO-DESIGN.md`) :
quand aucun livrable Claude Design n'est fourni, l'init étudie cette référence + les presets de
`lib/da-presets/` pour composer une vraie DA, au lieu de copier le thème par défaut du template.

Contenu :
- `index.html` — page d'accueil de référence (structure + sections d'un comparateur)
- `assets/styles.css` — système de design partagé (tokens, boutons, nav, footer, cartes)
- `assets/home.css` — DA de la home (hero, bill-card, estimateur, table d'offres, stats…)
- `DESIGN-NOTES.md` — extraction distillée des principes (couleurs, typo, espacements, motion)

Ne pas importer ces fichiers dans `app/` ou `components/`. Ils ne sont là que pour être lus.
