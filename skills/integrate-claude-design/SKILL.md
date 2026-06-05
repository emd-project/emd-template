---
name: integrate-claude-design
version: 1.1.0
description: Intègre les outputs livrés par Claude Design (JSX, HTML, snippets Tailwind, mockups, descriptions de sections) dans la structure du template emd-template. Mappe les pages vers app/, les composants vers components/, les tokens vers niche.config.ts, applique les conversions techniques (variables CSS, next/image, RSC vs 'use client'), et réutilise les composants MDX existants. À utiliser quand l'utilisateur dit « intègre ce qui est dans design-incoming », « merge les designs », « applique les outputs Claude Design », « intègre les écrans livrés », ou quand le dossier design-incoming/ à la racine du repo contient des fichiers à traiter.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# integrate-claude-design — Intégration des outputs Claude Design

## Mission

Quand le dossier `design-incoming/` contient des fichiers livrés par Claude Design (un site externe qui génère du JSX, HTML, snippets Tailwind, mockups), ton rôle est de :

1. Lire chaque fichier livré avant toute action.
2. Mapper chaque output sur la structure du template (pages → `app/`, composants → `components/`, tokens → `niche.config.ts`, contenus → `content/`).
3. Appliquer les conversions techniques obligatoires (variables CSS, `next/image`, RSC par défaut, syntaxe Tailwind v4).
4. Réutiliser les composants MDX et UI déjà présents plutôt que les ressaisir.
5. Respecter le filtre qualité de `CLAUDE.md`.
6. Nettoyer le dossier `design-incoming/` une fois l'intégration committée.

Ne jamais proposer un questionnaire d'init ou une génération de boilerplate à partir de rien. L'init est géré par le skill `nouveau-site` (qui route vers `init-site` ou `configure-from-spec`). Ce skill-ci gère UNIQUEMENT l'intégration de `design-incoming/`. Le workflow est linéaire : outputs livrés → mapping → conversions → nettoyage.

---

## Étape 1 — Reconnaissance

Avant tout, recense ce qui est dans `design-incoming/` :

```bash
ls -la design-incoming/
```

Pour chaque fichier, identifie son type (page complète, section, composant réutilisable, mockup, description textuelle) et son intention. Si un fichier est ambigu, demande à l'utilisateur avant de mapper.

Lis chaque fichier intégralement avant d'écrire la moindre ligne dans `app/` ou `components/`. Pas de mapping aveugle.

---

## Étape 2 — Mapping vers la structure du template

| Type d'output Claude Design | Destination dans le template |
|---|---|
| Page complète (home, page produit, page comparateur…) | `app/[route]/page.tsx` |
| Layout / wrapper | `app/[route]/layout.tsx` |
| Composant réutilisable (Hero, Card, Footer custom…) | `components/[Nom].tsx` |
| Section spécifique à une page | `app/[route]/_components/[Nom].tsx` |
| Tokens (couleurs, fonts, vocabulaire, logo) | Champs de `niche.config.ts` |
| Contenu éditorial (texte, FAQ, briefs) | `content/` selon le type |
| Mockup PNG / référence visuelle | `public/images/design-references/` (ou jeté si plus nécessaire après intégration) |

Si Claude Design a livré un composant qui existe déjà dans `components/` sous un autre nom, **ne pas dupliquer**. Le signaler à l'utilisateur, proposer soit d'enrichir le composant existant, soit de le remplacer si le livrable est meilleur.

---

## Étape 3 — Conversions techniques obligatoires

Aucun output Claude Design ne va dans le repo tel quel. Applique systématiquement :

### 3.1 Couleurs et fonts en dur → variables CSS

```tsx
// ❌ Avant (livré par Claude Design)
<div className="bg-[#FF3D57] text-white font-['Unbounded']">
// ✅ Après (intégré dans le template)
<div className="bg-[var(--accent-1)] text-[var(--text-primary)] font-display">
```

Toutes les couleurs viennent de `niche.config.ts` → variables CSS (`--accent-1` à `--accent-5`, `--bg-primary`, `--bg-surface`, `--text-primary`, etc.). Idem fonts (`--font-display`, `--font-primary`, `--font-mono`). Si une couleur/font livrée ne correspond à aucun token : l'ajouter à `niche.config.ts` (en discuter) ou prendre le plus proche.

### 3.2 `<img>` → `next/image`

```tsx
// ❌ Avant
<img src="/hero.jpg" alt="Hero" className="w-full" />
// ✅ Après
import Image from 'next/image'
<Image src="/hero.jpg" alt="Hero décrivant le sujet en mots-clés" width={1200} height={600} className="w-full" />
```

L'`alt` doit être descriptif. Si Claude Design n'a pas fourni d'alt utile, demander à l'utilisateur plutôt qu'inventer.

### 3.3 Server Component par défaut, `'use client'` seulement si interactif

Garder `'use client'` uniquement si le composant a un `onClick`, un `useState`, un `useEffect`, ou un hook React. Sinon, le retirer.

### 3.4 Syntaxe Tailwind v4 (pas v3)

| Tailwind v3 | Tailwind v4 |
|---|---|
| `text-opacity-50` | `text-[color]/50` |
| `bg-opacity-X` | `bg-[color]/X` |
| `@layer` custom | Variables CSS dans `globals.css` |
| `theme()` dans CSS | `var(--token)` directement |

Vérifier : `grep -r "text-opacity-\|bg-opacity-" components/ app/`.

### 3.5 Pas de fonts.googleapis.com en dur
Retirer tout `<link href="https://fonts.googleapis.com/...">`. Les fonts passent par `next/font` dans `app/layout.tsx`.

### 3.6 Liens Amazon → `addAffiliateTag()` ou `<AffiliateLink>`
Convertir tout lien Amazon brut. Vérifier que le tag affilié est configuré dans `niche.config.ts`.

---

## Étape 4 — Réutiliser les composants MDX existants

| Besoin | Composant template à réutiliser |
|---|---|
| Image inline dans un article | `<ArticleImage>` |
| Carte produit affilié | `<ProductCTA>` |
| Carousel de produits | `<ProductCarousel>` |
| Barre de comparaison | `<CompareBar>` / `<CompareBarGroup>` |
| Bloc conseil | `<Tip>` |
| Bloc avertissement | `<Warning>` |
| Verdict avec note | `<Verdict>` |
| Tableau pros/cons | `<ProConTable>` |
| Citation mise en avant | `<PullQuote>` |
| Statistique | `<StatCard>` / `<StatRow>` |

Ne pas ré-inventer un composant existant. Si l'output Claude Design est meilleur : améliorer l'existant, pas créer un parallèle.

---

## Étape 5 — Tokens vers niche.config.ts
Mettre à jour `siteName`, `palette.*`, `fonts.*`, `signature.*`, etc. Décâbler toute valeur en dur du JSX livré vers `niche.config.ts`.

---

## Étape 6 — Filtre qualité (hérité de CLAUDE.md)

- [ ] `tsc --noEmit` passe · `npm run lint` passe
- [ ] Aucun `<img>` brut (`grep -r "<img " app/ components/`)
- [ ] Tous les `alt` descriptifs
- [ ] Aucune couleur hex en dur dans le JSX (`grep -rE "#[0-9a-fA-F]{3,6}" app/ components/`)
- [ ] Aucune référence `fonts.googleapis.com`
- [ ] `'use client'` uniquement sur composants interactifs
- [ ] Liens Amazon via `addAffiliateTag()` ou `<AffiliateLink>`
- [ ] `prefers-reduced-motion` respecté si animations
- [ ] Composants nouveaux < 150 lignes

---

## Étape 7 — Nettoyage et commit

1. Supprimer le contenu de `design-incoming/` (sauf `READ-FIRST.md`).
2. Mettre à jour `PROGRESS.md`.
3. Documenter les choix non triviaux dans `DECISIONS.md`.
4. Commit Conventional Commits. Jamais directement sur main : créer une branche `feature/integrate-design-[date]` et ouvrir une PR.

---

## Ce qu'il NE faut PAS faire

- **Ne pas** lancer d'interview d'init ni de questionnaire ici. L'init passe par `nouveau-site` (→ `init-site` ou `configure-from-spec`). Ce skill gère UNIQUEMENT `design-incoming/`.
- **Ne pas** recopier du JSX sans le filtre qualité.
- **Ne pas** inventer couleur/font/nom/slogan absent du livrable. Demander ou laisser un `TODO`.
- **Ne pas** toucher à `packages/cms/`, `lib/`, `middleware.ts`, ni aux composants génériques sans raison documentée dans `DECISIONS.md`.
- **Ne pas** dupliquer un composant existant.
- **Ne pas** committer avec `design-incoming/` non vide (sauf `READ-FIRST.md`).

---

## Si `design-incoming/` est vide ou absent

Ne rien déclencher. Demander ce que veut l'utilisateur (rédiger, configurer le site via `nouveau-site`, fix…). Ne PAS générer de design « from scratch ». Pour composer une DA SANS livrable Claude Design, c'est `docs/AUTO-DESIGN.md`, déclenché par l'init.

---

## Format de sortie attendu

1. Récapitulatif des fichiers livrés (nom + type + destination).
2. Conversions appliquées.
3. Décisions non triviales.
4. Résultat du filtre qualité.
5. Proposition de commit (message + branche).
6. Confirmation que `design-incoming/` est vide.
