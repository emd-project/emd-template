---
name: configure-from-spec
version: 1.0.0
description: Configure un nouveau site fork-é depuis emd-template À PARTIR D'UN FICHIER SPEC pré-rempli par le wizard nano-mentionbox. Lit `init-spec.md` à la racine du repo (généré par l'onglet "Créer un EMD" de nano-mentionbox), parse les 7 blocs structurés, écrit niche.config.ts + tous les fichiers content/* + docs/AUTHOR-* en miroir dans toutes les locales, délègue à integrate-claude-design si design-incoming/design.zip est présent, et crée les scheduled tasks de rédaction quotidienne selon la cadence du Bloc 3. À utiliser dans CE cas et CE cas SEULEMENT : un init-spec.md fraîchement poussé par le wizard est présent à la racine du repo et l'utilisateur dit explicitement « configure le site depuis init-spec.md », « configure depuis la spec », « init from spec », « lance la configuration », « setup le repo ». Ne JAMAIS utiliser pour un site déjà configuré (niche.config.ts.market défini → utiliser init-site classique pour amender). Ne JAMAIS proposer ce skill si init-spec.md n'existe pas — proposer init-site à la place.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# configure-from-spec — Configurer un site depuis un init-spec.md du wizard

Ce skill prend en entrée un fichier `init-spec.md` à la racine du repo (poussé par le wizard nano-mentionbox "Créer un EMD") et produit en sortie une configuration complète du site : `niche.config.ts`, tous les fichiers `content/*`, `docs/AUTHOR-*`, le design intégré, et les scheduled tasks de rédaction. En un seul commit atomique.

## Pré-requis vérifiés au démarrage

1. **`init-spec.md` existe** à la racine du repo. Si absent → ne PAS exécuter, proposer `init-site` classique.
2. **`niche.config.ts.market` est vide ou placeholder** (`'TODO'`, valeur par défaut `'BE'` du template inchangé, etc.). Si déjà rempli → demander à l'utilisateur s'il veut écraser (cas refresh) ou proposer init-site pour amender.
3. **Git status clean** ou changements non liés. Pas de modifs en cours dans `content/*`, `niche.config.ts`, etc.

Si un pré-requis échoue, expliquer clairement à l'utilisateur AVANT de toucher quoi que ce soit.

---

## Étape 1 — Parser le init-spec.md

Lire `init-spec.md`. Le fichier est structuré en sections Markdown avec des codeblocks YAML pour les données structurées et de la prose libre entre.

Sections attendues :
- `## Identité du site` (YAML : siteName, domain, tagline)
- `## Bloc 0 — Marché et langues` (YAML : market, defaultLocale, locales, localePrefix, voiceMode)
- `## Bloc 1 — Voix éditoriale` (YAML : qui_parle, audience, ton_descripteurs, ton_anti, tu_ou_vous, formulations_signature, mots_bannis, inspirations)
- `## Bloc 2 — Mots-clés` (prose : positioning + clusters formattés en sub-sections `### Cluster N — Nom`)
- `## Bloc 3 — Calendrier éditorial` (YAML)
- `## Bloc 4 — Concurrents` (sub-sections Directs / Indirects / Gaps / Anti-modèles)
- `## Bloc 5 — FAQ de base` (sub-sections par thème)
- `## Bloc 6 — Mentions légales` (YAML)
- `## Bloc 7 — Auteur` (YAML, optionnel)
- `## Design (Claude Design)` (référence à design-incoming/design.zip + YAML tokens extraits)

Si une section attendue manque (sauf Bloc 7 et Design qui sont optionnels), arrêter et expliquer à l'utilisateur quel bloc compléter dans le wizard avant de relancer.

---

## Étape 2 — Validation sémantique (avant écriture)

Avant d'écrire le moindre fichier, vérifier la cohérence des données parsées :

| Check | Action si échec |
|---|---|
| `market` ∈ ['BE', 'FR', 'CA', 'CH', autre code ISO valide] | Demander confirmation à l'utilisateur |
| `locales[0]` === `defaultLocale` | Forcer alignement, prévenir l'utilisateur |
| Si `localePrefix === 'as-needed'` → `locales.length >= 2` | Sinon retirer `localePrefix` |
| Si `voiceMode === 'per-language'` → vérifier qu'on a des sections voix par langue (sinon traiter comme `unique`) | Avertir |
| Au moins 3 clusters dans Bloc 2 | Avertir si moins, mais continuer |
| Au moins 6 questions FAQ totales dans Bloc 5 | Avertir si moins, continuer |
| Mentions légales : email contact présent | Bloquer si absent (RGPD) |
| Auteur (si présent) : slug en kebab-case | Forcer normalisation |
| Cohérence market ↔ locales (ex : market BE avec locale `fr-CA` → suspicieux) | Demander confirmation |

Si plusieurs warnings, les regrouper dans un message à l'utilisateur AVANT d'écrire. Pas de bombarder de questions séparées.

---

## Étape 3 — Écrire `niche.config.ts`

Remplacer `niche.config.ts` (qui contient les placeholders du template) par une version remplie avec les valeurs du spec.

Mapping spec → niche.config.ts :

```ts
{
  siteName: spec.identity.siteName,
  domain: spec.identity.domain,
  tagline: spec.identity.tagline,

  // Vocabulaire de la niche — dérivé du contexte. À DEMANDER à l'utilisateur si pas dérivable
  // (le wizard ne pose pas cette question — l'utilisateur peut la compléter à la main).
  entity: 'TODO',
  entities: 'TODO',
  entityVerb: 'TODO',
  dealWord: 'offres',

  // Hero et catégories — laisser placeholders (Claude Design ou édition manuelle les rempliront)
  heroPrefix: 'TODO',
  heroSuffix: 'TODO',
  rotatingWords: [],
  subtitle: spec.identity.tagline,
  ctaPrimary: { text: 'Comparer →', url: '/comparer' },
  ctaSecondary: { text: 'Quiz', url: '/quiz' },
  categories: [],

  // Style et palette — depuis design ou placeholders si pas de design
  style: { mode: 'light', hero: 'split', effects: 'subtle', cards: 'bordered', uiStyle: '' },
  palette: spec.design?.extractedTokens?.palette ?? niche.palette,
  fonts: spec.design?.extractedTokens?.fonts ?? { display: 'Unbounded', body: 'Inter' },

  // Auteur depuis Bloc 7 si présent
  author: spec.block6_7?.author ? {
    name: spec.block6_7.author.name,
    slug: spec.block6_7.author.slug,
    title: spec.block6_7.author.title,
    bio: spec.block6_7.author.bio,
    tone: spec.block6_7.author.tone,
    noGo: spec.block6_7.author.noGo,
    formulations: spec.block6_7.author.formulations,
  } : { name: '', slug: '', title: '', bio: '', tone: [], noGo: [], formulations: [] },

  // i18n — Bloc 0 — PILOTE TOUT
  market: spec.block0.market,
  defaultLocale: spec.block0.defaultLocale,
  locales: spec.block0.locales,
  localePrefix: spec.block0.locales.length >= 2 ? 'as-needed' : undefined,

  // Signature DA — depuis design.tokens.signature ou placeholders
  signature: spec.design?.extractedTokens?.signature ?? { anchor: '', oneRule: '', inspiration: [], forbidden: [], components: [] },

  // Technique
  vercelRegion: 'fra1',
  repo: `${spec.identity.repoOwner}/${spec.identity.repoName}`,
  branch: 'main',

  // Affiliation
  affiliateTag: '',
  defaultStore: 'Amazon',

  // Logo + sections home (placeholders)
  logo: spec.identity.siteName,
  homeSections: ['ticker', 'deals', 'articles', 'categories', 'tools', 'author'],
}
```

Laisser `TODO` explicites sur les champs non dérivables du spec — l'utilisateur les complétera plus tard ou Claude Design les remplira via `integrate-claude-design`.

---

## Étape 4 — Écrire `content/ton-of-voice.md`

À partir du Bloc 1, suivre le gabarit standard du skill `ton-of-voice`. Voir `skills/ton-of-voice/SKILL.md` section "Gabarit de fichier".

Champs à remplir : qui parle, audience cible, ton 3 mots, ce qu'on n'est PAS, tu/vous, formulations signature, vocabulaire banni, inspirations.

**Si Bloc 0 `voiceMode === 'per-language'`** : créer aussi `content/ton-of-voice.[locale].md` pour chaque locale autre que la default, avec un placeholder TODO sur les sections qui doivent être adaptées (le spec ne fournit qu'une version, le contenu adapté reste à rédiger).

---

## Étape 5 — Écrire `content/mots-cles.md`

Format gabarit standard :
- Section "Positionnement" (depuis spec.block2.positioning)
- Section "Clusters" — un sous-titre par cluster avec head term, longue traîne, quick wins, à éviter
- Section "Export brut" — TODO si pas d'export Semrush joint au spec, ou bien coller les paths des CSV s'ils existent dans le repo

---

## Étape 6 — Écrire `content/calendrier-edito.md`

À partir du Bloc 3 :
- Cadence cible + cadence plancher
- Formats récurrents (un par bullet avec longueur + fréquence)
- Saisonnalité si présente
- Rotation d'angles (4-6 angles)
- Politique de refresh

**Note importante à inscrire dans le fichier** : "Chaque entrée du calendrier produit `locales.length` articles (un par langue, miroir strict — cf. `skills/seo-geo-redaction/references/mirror-i18n.md`)."

---

## Étape 7 — Écrire `content/concurrents.md`

À partir du Bloc 4 : Directs (avec force + faiblesse), Indirects, Gaps SERP, Anti-modèles.

---

## Étape 8 — Écrire `content/faq-base.md`

À partir du Bloc 5 : un thème par section H2, chaque question en H3 avec réponse en prose.

---

## Étape 9 — Écrire `content/pages/mentions-legales.yaml`

À partir du Bloc 6 mentions :

```yaml
editeur:
  raison_sociale: ...
  forme_juridique: ...
  identifiant_fiscal: ...   # SIRET (FR) / BCE (BE) / RC (CH)
  adresse: ...
  representant_legal: ...
contact:
  email: ...
  telephone: ...
hebergeur:
  nom: Vercel Inc.
  adresse: ...
  url: https://vercel.com
dpo:
  email: ...
cookies:
  enabled: false
  types: []
propriete_intellectuelle: Tous droits réservés
date_maj: YYYY-MM-DD
```

**Si N locales** : générer AUSSI `content/pages/mentions-legales.[locale].yaml` pour chaque locale autre que default. Le contenu factuel reste identique (mêmes raison sociale, adresse, etc.) mais le wording RGPD/cookies est traduit.

---

## Étape 10 — Écrire `docs/AUTHOR-[slug].md` (si Bloc 7 présent)

À partir du Bloc 7 : suivre le gabarit `docs/AUTHOR-template.md` du repo.

Si `voiceMode === 'per-language'` : la bio et le titre sont dans la langue principale uniquement. Les pages auteur seront traduites au moment de la publication des premiers articles (le contenu adapté reste à rédiger).

---

## Étape 11 — Intégrer le design (si présent)

Si `design-incoming/design.zip` existe à la racine du repo :

1. Extraire le zip dans `design-incoming/` :
   ```bash
   cd design-incoming && unzip -o design.zip && rm design.zip
   ```
2. Déléguer au skill `integrate-claude-design` :
   - Lit chaque fichier du dossier (mockups, JSX, HTML, tokens)
   - Mappe vers `app/`, `components/`, `niche.config.ts.palette`, `niche.config.ts.fonts`, `niche.config.ts.signature`
   - Applique les conversions techniques (couleurs en var CSS, next/image, RSC vs 'use client', etc.)
   - Nettoie le dossier après intégration

Si pas de design : laisser les placeholders palette/fonts/signature dans niche.config.ts. L'utilisateur pourra livrer le design plus tard via le workflow `integrate-claude-design` standard.

---

## Étape 12 — Créer les scheduled tasks de rédaction

Les scheduled tasks ne sont **pas** créées via fichier MDX dans le repo — elles sont créées via le système de scheduled tasks de Cowork (`mcp__scheduled-tasks__create_scheduled_task`).

À partir de la cadence du Bloc 3, créer UNE scheduled task quotidienne qui :
- Lit `niche.config.ts.locales` au runtime → génère un article dans toutes les locales (miroir strict)
- Applique le pipeline complet : analyse content gap → SERP analysis → brief → outline → rédaction (skills humaniser-fr + seo-geo-redaction + ton-of-voice) → traduction dans les autres locales → mapping i18n → commit atomique sur la branche par défaut → MAJ PROGRESS.md
- TaskId : `[repoName]-article-daily` (ex: `meilleure-voiture-electrique-article-daily`)
- Cron suggéré : matin local Europe/Brussels (ex: `0 8 * * *`) — ajustable par l'utilisateur après création
- Prompt complet à inscrire dans la task (cf. les scheduled tasks existantes mve-article-daily, mcc-article-daily comme références)

Si la cadence cible est différente de "1 article/jour" (ex: 3×/semaine), adapter le cron en conséquence (`0 8 * * 1,3,5` pour lundi/mercredi/vendredi).

**Demander confirmation à l'utilisateur AVANT de créer la scheduled task** — c'est un système global Cowork, pas un fichier du repo.

---

## Étape 13 — Mettre à jour PROGRESS.md et DECISIONS.md

`PROGRESS.md` : ajouter une section en tête :

```markdown
## Complété — Session YYYY-MM-DD (configure-from-spec)

Site bootstrappé depuis init-spec.md généré par nano-mentionbox wizard.

- [x] niche.config.ts (market: XX, locales: [...], localePrefix: ...)
- [x] content/ton-of-voice.md
- [x] content/mots-cles.md
- [x] content/calendrier-edito.md
- [x] content/concurrents.md
- [x] content/faq-base.md
- [x] content/pages/mentions-legales.yaml (+ variantes locales si N langues)
- [x] docs/AUTHOR-[slug].md (si auteur présent)
- [x] Design intégré depuis design-incoming/ (si présent)
- [x] Scheduled task [repoName]-article-daily créée

## En cours

- [ ] Compléter les TODO restants dans niche.config.ts (entity, entities, entityVerb, heroPrefix, heroSuffix, rotatingWords, ctaPrimary, categories)
- [ ] Valider en local : `pnpm dev` → vérifier que les 3 pages principales rendent
- [ ] Premier déploiement Vercel preview
- [ ] Pousser sur main pour activer le premier run de la scheduled task
```

`DECISIONS.md` : créer le fichier s'il n'existe pas, et ajouter :

```markdown
# Décisions — [siteName]

## Tranchées (Bloc 0 init-spec)

- market: [XX]
- locales: [...]
- defaultLocale: [...]
- localePrefix: as-needed (si ≥ 2 locales) | n/a
- voiceMode: [unique | per-language]
- Miroir strict imposé : [activé/désactivé selon locales.length]

## Tranchées (autres blocs)

- Auteur : [nom + slug ou "site signe sous nom de site"]
- Cadence éditoriale : [cadence Bloc 3]
- ...
```

---

## Étape 14 — Commit atomique

UN seul commit avec TOUS les fichiers générés. Branche par défaut du repo (`main` ou la branche feature courante selon le contexte).

Message de commit (Conventional Commits anglais) :

```
feat(init): bootstrap site from nano-mentionbox spec

Generated via configure-from-spec skill from init-spec.md.
- niche.config.ts: market=BE, locales=[fr,en], localePrefix=as-needed
- 7 content files written (ton-of-voice, mots-cles, calendrier-edito,
  concurrents, faq-base, mentions-legales, author)
- Design integrated from design-incoming/ via integrate-claude-design
- Scheduled task [repoName]-article-daily created

Co-authored-by: Claude <noreply@anthropic.com>
```

**Branche** : si le repo est tout neuf (créé par le wizard), pousser sur `main` (la branche par défaut). Si l'utilisateur a entre-temps créé une feature branch, demander avant de pousser sur main.

---

## Étape 15 — Récapitulatif à l'utilisateur

Après le commit, livrer à l'utilisateur :

```
✓ Site bootstrappé en N commits.

Marché : BE
Locales : fr, en (miroir strict)
Auteur : Sophie Laurent (sophie-laurent)
Design : intégré depuis design-incoming/ (OU "à intégrer plus tard")
Scheduled task : meilleure-cafe-be-article-daily, cron 0 8 * * *
  (premier run demain matin 8h)

Prochaines étapes manuelles :
1. Compléter les 8 TODO restants dans niche.config.ts
2. pnpm dev → vérifier rendu local
3. Premier déploiement Vercel
4. (optionnel) "Run now" sur la scheduled task pour pré-approuver les tools

Lien repo : https://github.com/[owner]/[name]
```

---

## Règles strictes

- **NE JAMAIS exécuter** si `init-spec.md` est absent — proposer `init-site` à la place.
- **NE JAMAIS écraser** un `niche.config.ts` déjà rempli sans demander confirmation explicite.
- **NE JAMAIS écrire** une réponse inventée si le spec est incomplet → laisser un TODO et avertir.
- **TOUJOURS un commit atomique** avec TOUS les fichiers du bootstrap. Pas de demi-bootstrap.
- **TOUJOURS demander confirmation** avant de créer la scheduled task (effet de bord global).
- **TOUJOURS appliquer le miroir strict** si `locales.length >= 2` — pas d'option "FR d'abord, EN plus tard".

---

## Si le spec est partiellement rempli

Cas typique : l'utilisateur a publié depuis le wizard avec `validation.missing` non-vide (force-publish). Dans ce cas :

1. Identifier les blocs manquants en parsant le init-spec.md.
2. Pour chaque bloc manquant, écrire le fichier correspondant avec des `TODO` explicites au lieu de contenu.
3. Marquer dans PROGRESS.md section "Bloqué" : "Bloc X manquant dans init-spec.md — relancer le wizard nano-mentionbox en mode édition pour compléter."
4. **Ne PAS créer la scheduled task** si Bloc 0, 1, 2, 3, ou 6 manquent (les blocs critiques pour la rédaction).

---

## Lien avec les autres skills

- `init-site` (v2) : skill alternatif quand l'utilisateur n'a PAS de init-spec.md — interview manuel direct en chat. À utiliser si pas passé par le wizard nano-mentionbox.
- `integrate-claude-design` : appelé par configure-from-spec à l'étape 11 si `design-incoming/` existe.
- `ton-of-voice`, `seo-geo-redaction`, `humaniser-fr` : utilisés ensuite à chaque rédaction d'article (via la scheduled task).

Une fois ce skill exécuté, le site est prêt pour la première rédaction. La scheduled task quotidienne s'occupe du reste.
