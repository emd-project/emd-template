---
name: integrate-claude-design
version: 1.2.0
description: Intègre les outputs livrés par Claude Design (JSX, HTML, snippets Tailwind, mockups, descriptions de sections) dans la structure du template emd-template. Mappe les pages vers app/, les composants vers components/, les tokens vers niche.config.ts, applique les conversions techniques (variables CSS, next/image, RSC vs 'use client'), réutilise les composants MDX existants, ET propage la DA à TOUTES les pages du site (home, hub blog, sous-hub catégorie, article, comparateur, produit, quiz). À utiliser quand l'utilisateur dit « intègre ce qui est dans design-incoming », « merge les designs », « applique les outputs Claude Design », « intègre les écrans livrés », ou quand le dossier design-incoming/ à la racine du repo contient des fichiers à traiter.
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

Quand le dossier `design-incoming/` contient des fichiers livrés par Claude Design (JSX, HTML, snippets Tailwind, mockups), ton rôle est de :

1. Lire chaque fichier livré avant toute action.
2. Mapper chaque output sur la structure du template (pages → `app/`, composants → `components/`, tokens → `niche.config.ts`, contenus → `content/`).
3. Appliquer les conversions techniques obligatoires (variables CSS, `next/image`, RSC par défaut, syntaxe Tailwind v4).
4. Réutiliser les composants MDX et UI déjà présents plutôt que les ressaisir.
5. **Propager la DA à TOUTES les pages, pas seulement la home** (cf. Étape 6 — garde-fou).
6. Respecter le filtre qualité de `CLAUDE.md`.
7. Nettoyer le dossier `design-incoming/` une fois l'intégration committée.

Ne jamais proposer un questionnaire d'init ou une génération de boilerplate à partir de rien. L'init est géré par le skill `nouveau-site` (qui route vers `init-site` ou `configure-from-spec`). Ce skill-ci gère UNIQUEMENT l'intégration de `design-incoming/`. Workflow linéaire : outputs livrés → mapping → conversions → **cohérence toutes pages** → nettoyage.

---

## Étape 1 — Reconnaissance

```bash
ls -la design-incoming/
```

Pour chaque fichier, identifie son type (page complète, section, composant réutilisable, mockup, description). Lis chaque fichier intégralement avant d'écrire. Pas de mapping aveugle.

---

## Étape 2 — Mapping vers la structure du template

| Type d'output Claude Design | Destination |
|---|---|
| Page complète (home, produit, comparateur…) | `app/[route]/page.tsx` |
| Layout / wrapper | `app/[route]/layout.tsx` |
| Composant réutilisable | `components/[Nom].tsx` |
| Section spécifique à une page | `app/[route]/_components/[Nom].tsx` |
| Tokens (couleurs, fonts, vocabulaire, logo) | Champs de `niche.config.ts` |
| Contenu éditorial | `content/` selon le type |
| Mockup PNG / référence visuelle | `public/images/design-references/` (ou jeté après intégration) |

Si un composant livré existe déjà sous un autre nom : **ne pas dupliquer** — enrichir l'existant ou le remplacer si le livrable est meilleur.

---

## Étape 3 — Conversions techniques obligatoires

- **3.1 Couleurs/fonts en dur → variables CSS** : tout vient de `niche.config.ts` (`--accent-1..5`, `--bg-primary`, `--text-primary`, `--font-display`…). Décâbler toute valeur en dur du JSX livré.
- **3.2 `<img>` → `next/image`** avec `alt` descriptif (demander si non fourni).
- **3.3 RSC par défaut** : `'use client'` seulement si `onClick`/`useState`/`useEffect`/hook.
- **3.4 Tailwind v4** : `text-[color]/50` au lieu de `text-opacity-50`, variables CSS au lieu de `@layer`/`theme()`.
- **3.5 Pas de `fonts.googleapis.com` en dur** : fonts via `next/font` dans `app/layout.tsx` (sinon elles ne chargent pas).
- **3.6 Liens Amazon** → `addAffiliateTag()` / `<AffiliateLink>`.

---

## Étape 4 — Réutiliser les composants MDX existants

`<ArticleImage>`, `<ProductCTA>`, `<ProductCarousel>`, `<CompareBar>`/`<CompareBarGroup>`, `<Tip>`, `<Warning>`, `<Verdict>`, `<ProConTable>`, `<PullQuote>`, `<StatCard>`/`<StatRow>`. Ne pas ré-inventer ; améliorer l'existant si besoin.

---

## Étape 5 — Tokens vers niche.config.ts

Mettre à jour `siteName`, `palette.*`, `fonts.*`, `signature.*`. Décâbler toute valeur en dur vers `niche.config.ts`.

---

## Étape 6 — ⚠️ GARDE-FOU : cohérence DA sur TOUTES les pages

**Le piège n°1 : une home magnifique, mais le hub blog, les catégories et les articles restent en design par défaut.** Inacceptable. Un design ne livre presque jamais TOUS les écrans — tu dois **étendre** la DA livrée aux pages manquantes en réutilisant ses composants, tokens, traitements (cartes, hero, typo, animations, espacements).

Passer en revue **chaque type de page** et s'assurer qu'il partage la DA :

| Route | Type | À vérifier |
|---|---|---|
| `/` | Home | DA livrée appliquée |
| `/blog` | **Hub** | header, grille d'articles, filtres, footer = même DA |
| `/blog/[categorie]` | **Sous-hub** (catégorie) | en-tête de catégorie, liste, pagination = même DA |
| `/blog/[categorie]/[slug]` | **Article** | typo de corps, titres, cartes MDX, cover/mid, AuthorCard, FAQ = même DA |
| `/comparer` · `/comparer/[produit]` | Comparateur + produit | tableaux, CompareBar, CTA = même DA |
| `/choisir/[produit]` | Guide d'achat | étapes, critères = même DA |
| `/quiz` · `/simulateur` · `/deals` | Outils | formulaires, résultats = même DA |
| `/auteurs/[slug]` | Auteur | carte, bio = même DA |
| `/mentions-legales` · `/confidentialite` | Légal | au moins typo + header/footer cohérents |

Règle : la DA passe par les **tokens** (`niche.config.ts` + variables CSS) ET par le **traitement des composants partagés** (Nav, Footer, Card, Hero, sections, composants MDX). Si une page utilise des classes/couleurs en dur ou un vieux composant non re-stylé, elle décroche → corriger.

**Vérification obligatoire** (ne pas se fier au code seul) :

```bash
pnpm dev   # puis ouvrir chaque route ci-dessus
```

Rendre chaque type de page et **comparer visuellement** à la home. Idéalement, capturer un screenshot par type. Une page qui ne ressemble pas au reste du site = **bug d'intégration**, on ne livre pas.

---

## Étape 7 — Filtre qualité (hérité de CLAUDE.md)

- [ ] `tsc --noEmit` passe · `npm run lint` passe
- [ ] Aucun `<img>` brut · tous les `alt` descriptifs
- [ ] Aucune couleur hex en dur dans le JSX (`grep -rE "#[0-9a-fA-F]{3,6}" app/ components/`)
- [ ] Aucune référence `fonts.googleapis.com` · fonts via `next/font`
- [ ] `'use client'` uniquement sur composants interactifs
- [ ] Liens Amazon via `addAffiliateTag()` / `<AffiliateLink>`
- [ ] **DA cohérente sur TOUTES les routes** (home, hub /blog, sous-hub catégorie, article, comparateur, produit, quiz) — vérifié page par page (Étape 6). Aucune page en design par défaut.
- [ ] `prefers-reduced-motion` respecté · composants nouveaux < 150 lignes

---

## Étape 8 — Nettoyage et commit

1. Vider `design-incoming/` (sauf `READ-FIRST.md`).
2. `PROGRESS.md` + `DECISIONS.md` (choix non triviaux, et **quelles pages ont dû être restylées** au-delà du livrable).
3. Commit Conventional Commits. Jamais sur main directement : branche `feature/integrate-design-[date]` + PR.

---

## Ce qu'il NE faut PAS faire

- **Ne pas styler uniquement la home** en laissant `/blog`, les catégories et les articles en design par défaut. La DA couvre TOUT le site (Étape 6).
- **Ne pas** lancer d'interview d'init ici (c'est `nouveau-site`).
- **Ne pas** recopier du JSX sans le filtre qualité.
- **Ne pas** inventer couleur/font/nom/slogan absent du livrable (demander ou `TODO`).
- **Ne pas** toucher à `packages/cms/`, `lib/`, `middleware.ts` sans raison documentée.
- **Ne pas** dupliquer un composant existant.
- **Ne pas** committer avec `design-incoming/` non vide (sauf `READ-FIRST.md`).

---

## Si `design-incoming/` est vide ou absent

Ne rien déclencher. Demander ce que veut l'utilisateur. Pour composer une DA SANS livrable Claude Design : `docs/AUTO-DESIGN.md`, déclenché par l'init.

---

## Format de sortie attendu

1. Récapitulatif des fichiers livrés (nom + type + destination).
2. Conversions appliquées.
3. **Pages restylées au-delà du livrable** (hub, sous-hub, article, outils…) pour la cohérence DA.
4. Résultat du filtre qualité (dont la vérif toutes-pages de l'Étape 6).
5. Décisions non triviales.
6. Proposition de commit (message + branche). Confirmation que `design-incoming/` est vide.
