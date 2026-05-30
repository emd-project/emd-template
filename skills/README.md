# skills/

Skills locaux au template — chargés automatiquement par Claude Code (et tout client compatible : Codex CLI, Gemini CLI, Cursor, etc.) quand leurs triggers correspondent à la requête utilisateur.

Chaque skill suit la convention Anthropic : un sous-dossier en kebab-case contenant un `SKILL.md` avec frontmatter YAML (`name`, `description`, etc.), plus éventuellement `scripts/`, `references/`, `assets/`.

## Skills inclus dans le template

| Skill | Rôle | Triggers principaux |
|---|---|---|
| [`init-site`](./init-site/SKILL.md) v2 | Bootstrap d'un nouveau site forké via **interview chat** : Bloc 0 (marché + langues) en premier, puis voix, mots-clés, calendrier, concurrents, FAQ, mentions légales, auteur. Écriture en une seule passe. À utiliser quand l'utilisateur n'a PAS pré-rempli un init-spec.md via le wizard. | « initialise ce site », « configure ce site », « setup le site », « bootstrap le site », « première configuration » |
| [`configure-from-spec`](./configure-from-spec/SKILL.md) | Bootstrap automatique depuis un **`init-spec.md` pré-rempli** par le wizard nano-mentionbox (onglet "Créer un EMD"). Lit la spec + design-incoming/, écrit niche.config.ts + tous les content/* + docs/AUTHOR-*, intègre le design, crée la scheduled task de rédaction quotidienne. Aucun interview — tout vient du wizard. | « configure le site depuis init-spec.md », « configure depuis la spec », « init from spec », « lance la configuration » |
| [`integrate-claude-design`](./integrate-claude-design/SKILL.md) | Intègre les outputs livrés par Claude Design dans la structure emd-template (mapping, conversions, réutilisation des composants, filtre qualité, nettoyage). Appelé automatiquement par `configure-from-spec` si `design-incoming/` est présent. | « intègre ce qui est dans design-incoming », « merge les designs » |
| [`ton-of-voice`](./ton-of-voice/SKILL.md) | Définit (via interview 8 questions) OU applique la voix éditoriale du site forké. Une voix par site, fixée une fois. | Tous triggers de rédaction. Si `content/ton-of-voice.md` est vide → mode interview. Sinon → mode application. |
| [`seo-geo-redaction`](./seo-geo-redaction/SKILL.md) | Procédure complète SEO + GEO : brief, outline validé, structure, signaux GEO (Answer-Explanation-Example, désambiguïsation, signaux d'Expérience, follow-ups), anti-patterns IA structurels, données structurées JSON-LD (incl. Speakable), stratégie d'images (nano-banana), monitoring de citabilité, **miroir strict multi-langue** ([`references/mirror-i18n.md`](./seo-geo-redaction/references/mirror-i18n.md)). Lit les 6 fichiers de `content/`. | « rédige un article », « écris une fiche produit », « produis un brief SEO », « crée un guide », « génère le texte de » |
| [`humaniser-fr`](./humaniser-fr/SKILL.md) | Prévient ET corrige les marqueurs IA dans tout texte français (Mode production + Mode review). Couvre tics lexicaux, typographie française, footprint inter-sites pour sites affiliés. | Production : « rédige », « écris ». Review : « humanise », « sonne IA », « relis » |

## Workflow d'un nouveau site — deux entrées possibles

### Entrée A — Via le wizard nano-mentionbox (recommandé)

1. Stagiaire ouvre nano-mentionbox → onglet "Créer un EMD" → wizard 10 étapes.
2. Le wizard pousse `init-spec.md` + (optionnel) `design-incoming/design.zip` à la racine d'un nouveau repo créé depuis ce template via l'API GitHub.
3. Stagiaire ouvre Claude Cowork sur le nouveau repo et dit *« configure le site depuis init-spec.md »*.
4. Skill `configure-from-spec` se charge → lit la spec → écrit tout → délègue à `integrate-claude-design` si zip → crée la scheduled task → commit atomique.

C'est le workflow optimisé pour un stagiaire : la partie éditoriale (réponses aux 7 blocs) se fait dans une UI guidée, la partie technique (écriture du code) est entièrement déléguée à Claude.

### Entrée B — Interview classique en chat (sans wizard)

Si pas d'`init-spec.md` à la racine, l'utilisateur lance directement :

> « initialise ce site »

Le skill `init-site` v2 se charge et déroule l'interview en chat (7 blocs, ~10 min). C'est l'entrée utilisée par les personnes à l'aise avec un workflow conversationnel pur, sans passer par l'UI nano-mentionbox.

Les deux entrées produisent le même résultat final : un site configuré avec `niche.config.ts` rempli, tous les fichiers de `content/*`, le design intégré, et la scheduled task de rédaction quotidienne.

## Comportement sur trigger de rédaction

Sur tout « rédige », « écris », « crée une page », « produis un brief », etc., **trois skills se chargent en parallèle** : `ton-of-voice` (qui parle), `seo-geo-redaction` (comment structurer pour Google + LLM), `humaniser-fr` (garde-fous anti-IA). Ils sont complémentaires, pas en conflit.

Si **plusieurs** fichiers de `content/` sont vides — typiquement après un fork frais sans bootstrap — `seo-geo-redaction` doit proposer `init-site` OU `configure-from-spec` à l'utilisateur AVANT de tenter de rédiger.

## Ajouter un skill

1. Créer un sous-dossier en kebab-case (`mon-skill/`).
2. Y écrire `SKILL.md` avec un frontmatter YAML clair : `name`, `description` (QUOI + QUAND, avec phrases de déclenchement concrètes), `allowed-tools`.
3. L'ajouter au tableau ci-dessus.

Référence : [Guide officiel Anthropic — Building Skills for Claude](https://github.com/anthropics/skills).
