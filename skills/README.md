# skills/

Skills locaux au template — chargés automatiquement par Claude Code (et tout client compatible : Codex CLI, Gemini CLI, Cursor, etc.) quand leurs triggers correspondent à la requête utilisateur.

Chaque skill suit la convention Anthropic : un sous-dossier en kebab-case contenant un `SKILL.md` avec frontmatter YAML (`name`, `description`, etc.), plus éventuellement `scripts/`, `references/`, `assets/`.

## Skills inclus dans le template

| Skill | Rôle | Triggers principaux |
|---|---|---|
| [`init-site`](./init-site/SKILL.md) | Bootstrap d'un nouveau site forké : audit des fichiers de config vides, interview groupé par blocs thématiques (voix, mots-clés, calendrier, concurrents, FAQ, mentions légales, auteur, personas), écriture en une seule passe. | « initialise ce site », « configure ce site », « setup le site », « bootstrap le site », « première configuration » |
| [`integrate-claude-design`](./integrate-claude-design/SKILL.md) | Intègre les outputs livrés par Claude Design dans la structure emd-template (mapping, conversions, réutilisation des composants, filtre qualité, nettoyage) | « intègre ce qui est dans design-incoming », « merge les designs » |
| [`ton-of-voice`](./ton-of-voice/SKILL.md) | Définit (via interview 8 questions) OU applique la voix éditoriale du site forké. Une voix par site, fixée une fois. | Tous triggers de rédaction. Si `content/ton-of-voice.md` est vide → mode interview. Sinon → mode application. |
| [`seo-geo-redaction`](./seo-geo-redaction/SKILL.md) | Procédure complète SEO + GEO : brief, outline validé, structure, signaux GEO (Answer-Explanation-Example, désambiguïsation, signaux d'Expérience, follow-ups), anti-patterns IA structurels, données structurées JSON-LD (incl. Speakable), stratégie d'images (nano-banana), monitoring de citabilité. Lit les 6 fichiers de `content/`. | « rédige un article », « écris une fiche produit », « produis un brief SEO », « crée un guide », « génère le texte de » |
| [`humaniser-fr`](./humaniser-fr/SKILL.md) | Prévient ET corrige les marqueurs IA dans tout texte français (Mode production + Mode review). Couvre tics lexicaux, typographie française, footprint inter-sites pour sites affiliés. | Production : « rédige », « écris ». Review : « humanise », « sonne IA », « relis » |

## Comportement sur trigger de rédaction

Sur tout « rédige », « écris », « crée une page », « produis un brief », etc., **trois skills se chargent en parallèle** : `ton-of-voice` (qui parle), `seo-geo-redaction` (comment structurer pour Google + LLM), `humaniser-fr` (garde-fous anti-IA). Ils sont complémentaires, pas en conflit.

Si `content/ton-of-voice.md` n'est pas encore défini sur le site enfant, `ton-of-voice` enclenche un mini-interview de 8 questions auprès de l'utilisateur avant de laisser la main aux autres skills.

Si **plusieurs** fichiers de `content/` (ton-of-voice, mots-cles, calendrier-edito, concurrents, faq-base, personas, mentions-legales) sont vides — typiquement après un fork frais — `seo-geo-redaction` doit proposer `init-site` à l'utilisateur AVANT de tenter de rédiger. `init-site` orchestre tous les interviews en une seule passe, économise des tokens vs déclencher 6 skills séparément.

## Comportement sur trigger de bootstrap

Après "Use this template" sur GitHub, le premier appel de l'utilisateur est typiquement *"initialise ce site"* ou *"configure le repo"*. Le skill `init-site` se charge alors et déroule l'interview groupé. Une seule fois, jamais en cours de vie du site.

## Ajouter un skill

1. Créer un sous-dossier en kebab-case (`mon-skill/`).
2. Y écrire `SKILL.md` avec un frontmatter YAML clair : `name`, `description` (QUOI + QUAND, avec phrases de déclenchement concrètes), `allowed-tools`.
3. L'ajouter au tableau ci-dessus.

Référence : [Guide officiel Anthropic — Building Skills for Claude](https://github.com/anthropics/skills).
