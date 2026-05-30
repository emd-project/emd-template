# Deprecated — ne plus utiliser

Ce prompt d'initialisation de direction artistique n'est plus le workflow officiel.

Le template bascule sur **Claude Design** pour la création visuelle : le designer produit des outputs (JSX, HTML, snippets), tu les colles dans `design-incoming/`, et le skill `integrate-claude-design` les intègre automatiquement avec les bonnes conversions (variables CSS, `next/image`, RSC, réutilisation des composants existants).

Références à jour :

- [`skills/integrate-claude-design/SKILL.md`](../skills/integrate-claude-design/SKILL.md) — workflow d'intégration des outputs Claude Design.
- [`docs/DA-PRESETS.md`](DA-PRESETS.md) — helpers et presets DA réutilisables.
- [`docs/DA-ANTI-IA.md`](DA-ANTI-IA.md) — patterns visuels anti-IA à éviter.
- [`niche.config.ts`](../niche.config.ts) champ `signature` — personnalité visuelle unique du site (anchor, oneRule, forbidden).

Ce fichier est conservé temporairement pour ne casser aucun lien externe. Il peut être supprimé sans risque via l'UI GitHub.
