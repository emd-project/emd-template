# Référence — Fintech dark glass (archétype comparateur data)

> ⚠️ INSPIRATION, jamais à copier. Réinterpréter ces techniques pour une DA unique par site. Cf. `../README.md`.

## Langage visuel

- **Dual dark/light**, défaut **sombre** : fond `#0b0d12`, cartes `#131722`, bordures glass `rgba(255,255,255,0.06–0.14)`.
- **Dégradé signature** bleu→violet→cyan (`#5b8def → #b794f4 → #4fd1c5`), accent `#8b9bff`.
- **Fonts** : display **Fraunces** (serif variable, axes SOFT/WONK), texte **Inter**, mono JetBrains (chiffres tabulaires).
- Rayons `8 / 14 / 20 / 28px`, ombres profondes + inset subtil sur les cartes.

## Techniques distinctives (à réinterpréter)

- **Glass** : `linear-gradient(180deg, rgba(255,255,255,.04), .01)` + `backdrop-filter: blur(16–20px)` sur les cartes.
- **Texte dégradé animé** : `gradShimmer` 8s linear infinite (le dégradé glisse dans le titre).
- **Orbes flottants** : `orbDrift1/2/3` 14–18s ease-in-out infinite (taches de couleur en fond, lentes).
- **Bordures masquées** : `mask: linear-gradient(#000 0 0) content-box, …` (bord dégradé).
- **Reveals** : `.reveal` translateY(24px), `heroFadeUp`, `stickyIn`.

## Traits de layout

Dense, data-forward : tableaux comparatifs, page **brokers**, **calculateur**, chiffres tabulaires (mono). Premium-utilitaire.

## Idées de signature

- `anchor` : bloc de stats tabulaires (mono, tnum).
- `oneRule` : « glass + un dégradé maîtrisé, jamais flat corporate, chiffres en mono ».

## Comment ADAPTER (obligatoire)

Changer le dégradé (autres teintes), l'accent, repenser le calculateur selon la niche (pas un calc « courtiers » partout). Garder le **principe** glass + data + dégradé animé, pas les couleurs ni la page exacte.
