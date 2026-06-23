---
name: seo-geo-redaction
version: 2.2.0
description: Applique les règles SEO et GEO (Generative Engine Optimization) à toute rédaction de contenu éditorial français. Couvre le brief, l'outline validé, la structure d'article, la citabilité par les moteurs génératifs, les featured snippets, les signaux d'Expérience (E-E-A-T), les données structurées JSON-LD, le maillage interne, la stratégie d'images (génération via le MCP nano-mentionbox), l'anti-cannibalisation (carte d'intentions classement/comparateur/choisir/blog), et les anti-patterns IA structurels (titres, ponctuation, formulations d'authenticité simulée). À utiliser AVANT toute rédaction de contenu éditorial — article de blog, page pilier, fiche produit, comparatif, guide, tutoriel, FAQ. Triggers — « rédige un article », « écris une fiche produit », « crée un guide », « génère le texte SEO de », « produis un brief », « rédige le comparatif », « écris la page pilier », « rédige le tutoriel », « fais-moi un article SEO », « rédige le brief avant d'écrire ». Lit obligatoirement avant rédaction — content/mots-cles.md, content/concurrents.md, content/faq-base.md, content/calendrier-edito.md, content/personas.md, content/ton-of-voice.md. Délègue à humaniser-fr toute la chasse aux tics lexicaux et à la typographie française. Gabarits complets, checklist exhaustive et doctrine d'usage des formats dans references/full-guide.md (à charger uniquement si besoin du détail).
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - WebSearch
  - WebFetch
  - mcp__nano-mentionbox__generate_image
  - mcp__nano-mentionbox__wait_for_image
  - mcp__nano-mentionbox__github_push_images
---

# seo-geo-redaction v2 — Procédure SEO + GEO

Avant la première phrase de tout contenu éditorial, applique cette procédure. Elle couvre les contraintes SEO classiques ET GEO (citabilité par les moteurs génératifs : Perplexity, ChatGPT Search, Google AI Overviews, Claude Search, Bing Copilot).

## Philosophie en deux phrases

Un LLM produit ce qui est statistiquement le plus probable. Un contenu cité par les LLMs (et par Google) est celui qui mérite de l'être pour des raisons non-probables : une opinion tranchée, un fait vérifiable que personne n'a, une expérience traçable.

Posture : un expert qui parle à un pair légèrement moins avancé. Direct, opinioné quand c'est utile, jamais neutre au point d'être creux.

## Étape 0 — Lire la config du site (obligatoire)

Avant tout, lire ces six fichiers dans `content/` et internaliser leur contenu. C'est la mémoire structurelle du site, partagée entre tous les articles.

| Fichier | Ce qu'on en tire |
|---|---|
| `content/ton-of-voice.md` | Voix (qui parle, comment, vocabulaire interdit local au site) |
| `content/personas.md` | À qui on parle pour CET article (un seul persona dominant par article) |
| `content/mots-cles.md` | Cluster du sujet, head term, longue traîne associée, requêtes à ÉVITER |
| `content/concurrents.md` | Qui domine la SERP du sujet, leurs faiblesses à exploiter, anti-modèles |
| `content/faq-base.md` | Q-R réutilisables ; ne PAS re-rédiger, juste adapter au contexte |
| `content/calendrier-edito.md` | Format demandé existe-t-il dans la rotation ? Cadence respectée ? |

`content/personas.md` est créé automatiquement par l'init (`init-site` / `configure-from-spec`). Si l'un de ces fichiers contient encore des `TODO`, lancer `nouveau-site` (init) plutôt que tenter de combler le trou en rédigeant.

### Carte d'intentions — UNE intention = UN asset (anti-cannibalisation, OBLIGATOIRE)

Avant de retenir un sujet, vérifier qu'il n'empiète pas sur un asset commercial dédié. Le **blog est informationnel** ; les intentions commerciales appartiennent à des pages dédiées :

| Intention recherchée | Asset propriétaire | À NE PAS écrire en blog |
|---|---|---|
| meilleur / top / classement / les meilleurs X | **Classement** `/classement/X` | « les meilleurs X », « top X », « classement X » |
| X vs Y / comparer / X ou Y (items précis) | **Comparateur** `/comparer/X` | « X vs Y », « comparer X et Y » |
| quel X choisir / quel X pour [profil] / lequel | **Choisir / Quiz** `/choisir/X`, `/quiz` | « quel X choisir », « lequel prendre » |
| comment / pourquoi / qu'est-ce que / prix / définition / avantages-inconvénients / use-case | **Blog** (ce skill) | — |

- À l'init, les termes tête des 3 assets sont **réservés** : attribués à l'asset, **retirés du `calendrier-edito`**, et listés en « requêtes à ÉVITER » dans `mots-cles.md`. Le blog **maille vers** l'asset (lien contextuel), ne le **double jamais**.
- Les 3 assets ne se chevauchent pas non plus entre eux : liste rankée (classement) ≠ comparaison 1:1 (comparateur) ≠ reco personnalisée (choisir/quiz).
- **Page Classement : ≥ 1000 mots.** Le contenu data-driven vit dans `content/data/classements.json` (intro + TL;DR + `criteria` + `methodology` + `sources` + `faq` + par item `verdict`/`pros`/`cons`/`bestFor`). En dessous de 1000 mots = page thin, non citable → enrichir le JSON.

## Étape 1 — Brief avant outline avant rédaction (workflow obligatoire)

Économie de tokens et de pivots. Trois sous-étapes, l'utilisateur valide chacune avant la suivante.

### 1.1 Brief (1 page max)

Produire un brief structuré et le montrer à l'utilisateur AVANT d'écrire la moindre phrase d'article.

```
## Brief — [titre provisoire]
- **Cluster** / **Head term cible** / **Mots-clés longue traîne** (3-5) (depuis mots-cles.md)
- **Persona dominant** (depuis personas.md)
- **Intention de recherche** : informationnelle / commerciale / transactionnelle / navigationnelle
- **Format** (guide / comparatif / FAQ / news / retour d'expérience — depuis calendrier-edito.md)
- **Longueur cible** (selon format)
- **Concurrents directs sur la requête** : 2-3 (concurrents.md + recherche web si besoin)
- **Content gap** : l'angle que personne ne couvre
- **Sources autorité à citer** : 2-4 (datées, identifiées)
- **FAQ in-flow prévues (H3)** : 3-5 (persona OU PAA Google)
- **Schemas JSON-LD** : Article + Person + BreadcrumbList + FAQPage (+ HowTo / ItemList si applicable)
```

> ⚠️ **Check anti-cannibalisation (cf. Étape 0)** : si le head term du brief est une intention commerciale (meilleur/top, X vs Y, quel choisir), STOP — c'est un asset (`/classement`, `/comparer`, `/choisir`), pas un article. Requalifier en angle informationnel qui maille vers l'asset.

### 1.2 Outline (squelette validé)
Une fois le brief validé, produire un outline complet en H1/H2/H3 sans rédiger le corps. L'utilisateur valide. Économie de 60-70 % des tokens en cas de pivot.

### 1.3 Rédaction
Brief + outline validés → écrire en respectant les règles ci-dessous.

## Étape 2 — Source d'autorité SERP

Pour le content gap et le calibrage, connaître les 3 premiers résultats Google sur le head term, par ordre de préférence :
1. **Export Semrush** (dans `mots-cles.md` ou collé) — le plus précis.
2. **WebSearch** sur le head term.
3. **Top 3 titres + chapôs collés** par l'utilisateur.

Ne JAMAIS inventer ce que disent les concurrents. Pour chaque top 3 : titre exact, chapô, longueur, H2 visibles, présence FAQ, schemas. C'est de là que sort le content gap.

> **Check d'intention** : si la SERP du head term est dominée par des listes « meilleurs / top » ou des comparatifs 1:1, l'intention appartient au **classement / comparateur**, pas au blog → requalifier en angle informationnel ou changer de sujet.

## Étape 3 — Structure obligatoire

```
H1 — head term + différenciateur, ≤ 60 caractères, année dynamique si pertinent
  Chapô (40-60 mots) — réponse directe citable standalone
  TL;DR — 3-5 bullets (obligatoire dès 400 mots)
H2 — sous-thème (en question 70 % du temps)
  Réponse directe < 60 mots (chunk citable) → développement → exemple chiffré
  Lien interne contextuel · optionnel : H3 in-flow FAQ
H2 — Comparatif / Données mesurées (tableau normé si applicable)
H2 — Questions fréquentes (FAQ-bloc final, 6 questions min, JSON-LD FAQPage)
[Key Takeaways — encadré récap après l'H2 central]
AuthorCard en bas (lien vers /auteurs/[slug])
```

### Longueurs cibles par format

| Type | Mots | FAQ-bloc min | FAQ in-flow H3 par H2 |
|---|---|---|---|
| Article blog | 800–1 200 | 6 | 0-2 |
| Page pilier / guide | 1 500–2 500 | 8 | 1-3 |
| Fiche produit | 300–600 | 4 | 0-1 |
| Comparatif | 1 200–1 800 | 6 | 0-2 |
| Tutoriel / HowTo | 600–1 200 | 4 | 1 par étape |
| **Page Classement (data JSON)** | **≥ 1 000** | 4-6 | — |

### Règle des 70 % H2 en question
Au moins 70 % des H2 formulés comme des questions (*Faut-il…*, *Quel…*, *Comment…*, *Pourquoi…*, *Est-ce que…*, *X vs Y : lequel ?*). Les 30 % restants : déclaratifs factuels (pas d'annonces de révélation). Cf. Étape 5.

### Règle FAQ in-flow H3
Sous certains H2 stratégiques, une mini-FAQ H3 qui drille la verticale (H2 = horizontal, H3 = vertical). Un H3 ne paraphrase JAMAIS son H2. Source des questions : PAA Google d'abord, sinon questions persona (`content/personas.md`).

## Étape 4 — Critères GEO opérationnels

- **4.1 Citabilité par chunk** : chaque H2 copiable seul dans une IA et fait sens (pas de « voir plus haut »).
- **4.2 Answer-Explanation-Example** par H2 : réponse directe < 60 mots → explication 2-4 paragraphes → exemple chiffré. Cité 3× plus que l'ordre inverse.
- **4.3 Signaux de définition** : *X désigne… / X est défini comme… / Concrètement, X signifie…* (une par concept central, dans les 200 premiers mots).
- **4.4 Désambiguïsation** dès le chapô si la requête a plusieurs intentions.
- **4.5 Signaux d'Expérience (E-E-A-T)** : ≥ 3 parmi date précise contextuelle, donnée chiffrée non-promo, fait négatif gênant, cas spécifique limitant, opinion contre-intuitive argumentée, référence visuelle vérifiable. L'expérience se prouve par les détails, jamais par des formules d'authenticité (cf. Étape 5).
- **4.6 Anticipation des follow-ups** : 3-4 follow-ups naturels en H3 successifs.
- **4.7 Tableau comparatif normé** : en-têtes 1-3 mots, cellules sans phrases, pas de merged cells, une ligne = une option, max 5-6 colonnes.
- **4.8 Hiérarchie des sources** : `.gov` > `.edu` > recherche primaire DOI > orgs officielles internationales > presse spécialisée datée > tertiaire (complément). Format : *Selon [Source] ([année]), [stat].*
- **4.9 Fraîcheur** : `datePublished` + `dateModified`, année via `currentYear()` (jamais en dur), ≥ 1 donnée datée < 18 mois.

## Étape 5 — Anti-patterns IA structurels

### 5.1 Titres / H2 à bannir
*Mon avis honnête sur… · Verdict final · Le piège à éviter · Sans langue de bois · Le vrai test · Faut-il craquer ? · Ce que les marques ne veulent pas… · Le secret que personne ne dit · Plot twist / Game changer · Spoiler · On ne va pas tourner autour du pot.*

### 5.2 Pattern « Ce qui / Ce que » en amorce
*Ce qu'il faut savoir sur… · Ce que personne ne vous dit · Ce qui change avec X · Voici ce que…* → remplacer par un H2 factuel ou interrogatif strict.

### 5.3 H2 déclaratifs propres (les 30 % autorisés)
Annoncer une donnée/catégorie, jamais un sentiment. OK : *Le coût total sur 24 mois · Critères d'évaluation · Comparaison vs Bouygues et SFR · Méthodologie du test sur 90 jours.* Interdit : *Notre verdict honnête · Le détail qui change tout · Ce qui m'a surpris.* Test : remplace le H2 par 💥 ; si le sens du paragraphe ne change pas, c'est du clickbait.

### 5.4 Ponctuation
Tiret cadratin (—) : max 3 dans l'article. Pas de triple point dramatique. Éviter le deux-points en fin de H2. Gras : un par paragraphe max. Émojis dans titres/puces : interdits. (Détail : `humaniser-fr` F1/F2/F4.)

### 5.5 Conclusions de section
Pas de phrase-pont (*Maintenant que…, passons à…*), pas de résumé redondant, pas de question rhétorique de transition, pas de *En somme / Au final* en ouverture de conclusion. Une section finit sur sa dernière info utile.

## Étape 6 — Stratégie d'images

Génération via le MCP **nano-mentionbox** (`mcp__nano-mentionbox__generate_image`, Gemini 3.1 Flash Image / Nano Banana 2). Les dimensions et noms de fichiers sont alignés sur `docs/IMAGES-WORKFLOW.md` et `lib/image-slots.ts` — source unique, ne pas réinventer.

### 6.1 Cover (obligatoire)
- Une image en tête d'article. Prompt dérivé du H1 + voix + **DA du site** (`niche.signature`).
- Fichier : `[slug]-cover.webp` (slug identique à la page). Dimensions : **1280×720 (16:9)**, WebP.
- Alt : descriptif factuel + head term naturel, ≤ 125 caractères, jamais « image de ».

### 6.2 In-content (2 images réutilisées, pas de génération)
- Le corps reçoit **2 `<ArticleImage>` réutilisées** des visuels de catégorie déjà générés à l'init
  (`/images/categories/[cat].webp`, `/images/blog/category-[cat].webp`), placées ~1/3 et ~2/3. Aucune génération supplémentaire.
- Légende (caption) courte et factuelle si la donnée le mérite (les LLMs lisent les captions).

### 6.3 Workflow (pattern fire-and-poll)
1. Prompt selon voix + signature DA (≤ ~20 mots, sujet + ambiance + style, finir par « no text, no logos, no watermark »). Jamais de marque réelle.
2. `mcp__nano-mentionbox__generate_image` (aspect 16:9) → `mcp__nano-mentionbox__wait_for_image`. Retry une fois en `[slug]-cover-v2` si échec.
3. Vérifier le résultat, compresser WebP, pousser via `mcp__nano-mentionbox__github_push_images` sous `public/blog/[categorie]/[slug]/`.
4. Insérer en MDX via `next/image` (jamais `<img>` nu) avec alt rédigé manuellement (FR + locales).

### 6.4 Anti-patterns image
Pas de stock photos génériques, pas de captures sans contexte, pas d'alt robotisé, max 4-5 images pour un article < 1000 mots.

## Étape 7 — Données structurées (JSON-LD)

| Page | Schemas |
|---|---|
| Article | Article + Person + BreadcrumbList + FAQPage |
| Page auteur | Person |
| Comparatif | BreadcrumbList + ItemList |
| Classement | BreadcrumbList + ItemList + FAQPage |
| Guide / pilier | Article (+ HowTo si étapes) |
| Fiche produit | Product + AggregateRating si applicable |
| FAQ | FAQPage + BreadcrumbList |

Champs Article : `headline`, `datePublished`, `dateModified`, `author` (Person + `sameAs`), `publisher`, `description`, `inLanguage`.

### 7.1 Speakable
Ajouter `speakable` (cssSelector `.article-tldr`, `.article-key-takeaway`) + classes correspondantes en MDX. Signal fort de citabilité.

## Étape 8 — Infrastructure GEO
- **8.1 `public/llms.txt`** : index du site pour crawlers LLM (généré par l'init, tenu à jour).
- **8.2 `robots.txt`** : ne bloquer AUCUN crawler IA (GPTBot, ClaudeBot/anthropic-ai, PerplexityBot, CCBot, Google-Extended).

## Étape 9 — On-page essentiel
`title` (head term + différenciateur, ≤ 60 car., **sans année** — la marque est ajoutée par le template) · `description` (140-155 car., sans clickbait) · H1 unique variante du title · hiérarchie H1>H2>H3 · paragraphes 3-5 phrases · ratio **70 % prose + 30 % blocs structurés** · années via `currentYear()` · densité en champ sémantique (≥ 60 % des entités liées mentionnées), pas en pourcentage.

## Étape 10 — Maillage et liens
2-4 liens internes contextuels (ancres descriptives) · 1 lien vers la page pilier du cluster · **1 lien vers l'asset commercial du cluster** (classement / comparateur / choisir) · 1 lien transversal · max 1 lien externe / 500 mots vers sources d'autorité (hiérarchie 4.8) · liens Amazon via `addAffiliateTag()` / `<AffiliateLink>` · affiliate disclosure reformulée par site (cf. `humaniser-fr` G5).

## Étape 11 — Audit final avant livraison

- [ ] Brief + outline validés AVANT rédaction
- [ ] 6 fichiers config lus, aucun TODO bloquant
- [ ] **Anti-cannibalisation** : le sujet est informationnel, ne cible aucun terme tête d'asset (meilleur/top/vs/quel choisir) · maille vers l'asset
- [ ] Réponse directe dans le chapô (40-60 mots) · TL;DR (≥ 400 mots)
- [ ] ≥ 70 % des H2 en question · chunk standalone < 60 mots par H2 · Answer-Explanation-Example
- [ ] ≥ 1 signal de définition · désambiguïsation si requête ambiguë · ≥ 3 signaux d'Expérience
- [ ] FAQ in-flow H3 sous ≥ 1 H2 · FAQ-bloc finale ≥ 6 questions
- [ ] Sources datées · ≥ 1 tableau ou stat chiffrée
- [ ] Cover générée (+ 2 in-content réutilisées) · alt manuel pour chaque image
- [ ] JSON-LD Article + Person + BreadcrumbList + FAQPage · Speakable sur TL;DR + Key Takeaways
- [ ] Aucun H2/H3 de la liste anti-patterns · ≤ 3 tirets cadratins · affiliate disclosure si liens
- [ ] 2-4 liens internes · lien vers pilier + asset commercial · cross-check `humaniser-fr` passé

## Étape 12 — Monitoring de citabilité (mensuel)
Tester 5 head terms publiés sur Perplexity / ChatGPT Search / Google AI Overview / Claude Search. Logger. Chute brutale = relancer un audit GEO sur l'article.

## Étape 13 — Refresh d'articles
Stratégie dans `content/calendrier-edito.md`. Refresh majeur : `dateModified`, toutes les données datées, screenshots, re-check sources et concurrents.

## Pour aller plus loin
Gabarits par format, checklist exhaustive, doctrine des composants MDX → `references/full-guide.md` (charger à la demande).

## Compatibilité avec les autres skills
Sur les triggers de rédaction, trois skills en parallèle : `ton-of-voice` (voix), `seo-geo-redaction` (structure + GEO, ce skill), `humaniser-fr` (tics lexicaux + typo + footprint). Ce skill délègue à `humaniser-fr` toute la chasse aux mots-tics et la typo. Pour le bootstrap (remplir `content/`), c'est `nouveau-site` → `init-site` / `configure-from-spec`.
