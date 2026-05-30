# Progression — emd-template

## Architecture actuelle

Le template est prêt à être réutilisé. Workflow par défaut :

1. **Use this template** sur GitHub → nouveau repo.
2. `npm install && npm run dev`.
3. Soit coller les outputs Claude Design dans `design-incoming/` (le skill `integrate-claude-design` prend le relais), soit remplir `niche.config.ts` à la main.
4. À la première demande de rédaction, le skill `ton-of-voice` conduit un interview de 8 questions et fixe la voix éditoriale du site.

Quatre skills s'auto-déclenchent selon le contexte :

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

## Historique

- Origine : fork du site 10minutesapple, nettoyage complet du contenu Apple (articles, sections, configs hardcodées).
- Abstraction des composants (`Hero`, `Nav`, `Footer`, `FeaturedTools`, `DealsStrip`, `AuthorTeaser`).
- Création de `niche.config.ts` comme source de vérité technique.
- Bascule du workflow init-prompt (10 questions à chaque fork) vers le workflow Claude Design + `design-incoming/`.
- Migration vers Skills (convention Anthropic officielle, fin 2025) : les workflows récurrents (intégration design, voix éditoriale, rédaction SEO/GEO, anti-IA) sont désormais des Skills auto-déclenchés avec frontmatter YAML.
- Audit de cohérence : nettoyage des refs mortes (README, PROGRESS), création du template AUTHOR, archivage des docs obsolètes (CDC, PROMPT-DA).
