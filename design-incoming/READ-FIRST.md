# design-incoming/

Zone d'atterrissage pour les outputs livrés par **Claude Design** (JSX, HTML, snippets Tailwind, mockups).

Colle ici les fichiers livrés, puis ouvre Claude Code et dis simplement : **« intègre ce qui est dans design-incoming »**.

Le skill [`integrate-claude-design`](../skills/integrate-claude-design/SKILL.md) se charge automatiquement et s'occupe du mapping, des conversions (variables CSS, `next/image`, RSC), de la réutilisation des composants existants, du filtre qualité et du nettoyage.

Quand ce dossier est vide ou n'a pas changé depuis le dernier commit, aucun travail n'est déclenché.
