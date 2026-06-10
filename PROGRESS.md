# Progression — emd-template

## Architecture actuelle

Le template est prêt à être réutilisé. Workflow par défaut :

1. **Use this template** sur GitHub → nouveau repo.
2. `npm install && npm run dev`.
3. Soit coller les outputs Claude Design dans `design-incoming/` (le skill `integrate-claude-design` prend le relais), soit lancer `/nouveau-site` (init).
4. À l'init sans design fourni : choisir un **skin Voltéo** (V1–V4) + template + verticale, l'appliquer puis le muter — cf. `docs/AUTO-DESIGN.md` + `docs/design-reference/volteo/`.

Quatre skills s'auto-déclenchent selon le contexte :

- `integrate-claude-design` — sur `design-incoming/` non vide ou « intègre les designs ».
- `ton-of-voice` — sur toute rédaction (mode interview si `content/ton-of-voice.md` est vide, sinon application).
- `seo-geo-redaction` — sur toute rédaction (structure SEO + GEO + JSON-LD).
- `humaniser-fr` — sur toute rédaction (mode production) et sur les triggers de relecture (mode review).

## Invariants du template

- `niche.config.ts` est l'unique fichier de configuration technique éditable par site.
- `content/ton-of-voice.md` est l'unique fichier de configuration éditoriale éditable par site.
- `packages/cms/` est portable tel quel entre sites.
- Le `CategorySection` générique remplace les sections hardcodées.
- Tout ce qui touche aux fonts, couleurs et vocabulaire passe par variables CSS / config — jamais en dur dans le JSX.
- Aucune copie texte d'un site enfant à l'autre (anti-footprint SEO inter-sites).
- **Design** : source unique `docs/design-reference/volteo/` (4 skins + 4 verticales). Partir d'un skin → appliquer → muter. Pas de composition « depuis zéro » par défaut.

## Historique

- Moteur Next.js générique : composants abstraits (`Hero`, `Nav`, `Footer`, `FeaturedTools`, `DealsStrip`, `AuthorTeaser`), zéro contenu de niche hardcodé.
- Création de `niche.config.ts` comme source de vérité technique.
- Bascule du workflow init-prompt (questions à chaque fork) vers le workflow Claude Design + `design-incoming/`.
- Migration vers Skills (convention Anthropic officielle, fin 2025) : intégration design, voix éditoriale, rédaction SEO/GEO, anti-IA sont des Skills auto-déclenchés.
- **Refonte design « Voltéo »** : remplacement de l'ancienne approche « composer une DA depuis 161 presets » par un système de **4 skins prouvés + 4 verticales** (`docs/design-reference/volteo/`). À l'init, Claude **choisit** un skin/template/verticale, applique le bloc prêt à coller, puis mute (anti-footprint). Doctrine consolidée : `AUTO-DESIGN.md` réduit à un routeur, `da-presets` rétrogradé en fallback, anciens packs d'inspiration hors chemin d'init.
