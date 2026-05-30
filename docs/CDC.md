# Deprecated — ne plus utiliser

Ce cahier des charges décrivait spécifiquement le site `10minutesapple.com` (site source d'où le template a été extrait). Les contraintes génériques applicables à tous les sites enfants ont été déplacées vers les fichiers de référence du template.

Références à jour :

- **Contraintes techniques** (stack, budget JS, TypeScript strict, etc.) → [`CLAUDE.md`](../CLAUDE.md) section « Projet » et « Filtre qualité ».
- **Décisions d'architecture** (Tailwind v4, dark-first, langue FR uniquement, etc.) → [`DECISIONS.md`](../DECISIONS.md).
- **Configuration per-site** (couleurs, fonts, vocabulaire, signature DA) → [`niche.config.ts`](../niche.config.ts).
- **Architecture URL et templates de pages** → [`docs/TEMPLATE-SPEC.md`](TEMPLATE-SPEC.md).
- **SEO & GEO** → skill [`seo-geo-redaction`](../skills/seo-geo-redaction/SKILL.md) (auto-déclenché).
- **Personnalisation par site** → [`docs/DUPLICATION-GUIDE.md`](DUPLICATION-GUIDE.md).

Ce fichier est conservé temporairement pour ne casser aucun lien externe. Il peut être supprimé sans risque via l'UI GitHub.
