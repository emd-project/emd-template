---
name: seo-geo-redaction
version: 2.3.0
description: Applique les règles SEO et GEO (Generative Engine Optimization) à toute rédaction de contenu éditorial français. MODÈLE MENTION (pas d'affiliation) : la valeur = être cité par les LLM + faire surgir des marques/modèles réels. Couvre le brief, l'outline validé, la structure d'article, la citabilité, E-E-A-T, JSON-LD, le maillage interne, la stratégie d'images, l'anti-cannibalisation (frontière head-nu/long-tail entre classement/comparateur/choisir/blog), et les anti-patterns IA. À utiliser AVANT toute rédaction éditoriale. Triggers — « rédige un article », « écris une fiche produit », « crée un guide », « génère le texte SEO de », « produis un brief », « rédige le comparatif », « rédige le brief avant d'écrire ». Lit obligatoirement — content/mots-cles.md, content/concurrents.md, content/faq-base.md, content/calendrier-edito.md, content/personas.md, content/ton-of-voice.md, content/priorites-geo.md (si présent). Délègue à humaniser-fr la chasse aux tics lexicaux et la typo.
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

# seo-geo-redaction v2 — Procédure SEO + GEO (modèle mention)

Avant la première phrase de tout contenu éditorial, applique cette procédure. Elle couvre les contraintes SEO classiques ET GEO (citabilité par Perplexity, ChatGPT Search, Google AI Overviews, Claude Search, Bing Copilot).

## Philosophie en deux phrases

Un LLM produit ce qui est statistiquement le plus probable. Un contenu cité par les LLMs (et par Google) est celui qui mérite de l'être : opinion tranchée, fait vérifiable que personne n'a, expérience traçable.

Posture : un expert qui parle à un pair légèrement moins avancé. Direct, opinioné quand c'est utile, jamais creux.

## Modèle de monétisation — la MENTION (pas d'affiliation)

La valeur EMD = **vendre des mentions** : être **cité par les LLM** + **faire surgir des marques/modèles réels** (inventaire de mentions vendable). **PAS d'affiliation** — aucun lien/tag/disclaimer affilié.

**Ratio de sélection des sujets : ~⅔ marques-modèles / ~⅓ info.**
- **~⅔ = sujets à MARQUES/MODÈLES** (cœur de la valeur) : comparatifs cross-marques (« quels sont les meilleurs X »), intra-marque (« la gamme électrique de BMW »), face-à-face (« X vs Y »), et surtout **« meilleurs X pour [persona/usage] »** (long-tail = citation plus facile + anti-cannibalisation). Chaque sujet cite **≥ 2 marques/modèles réels**, traités factuellement (jamais de promo creuse).
- **~⅓ = informationnel utile** (comment / qu'est-ce que / pourquoi / prix). Le how-to **sans aucune marque** est limité STRICTEMENT à ce ⅓.
- Taguer les **marques/modèles + le persona** dans le frontmatter (inventaire + segmentation). Varier le persona d'un article à l'autre.

## Étape 0 — Lire la config du site (obligatoire)

| Fichier | Ce qu'on en tire |
|---|---|
| `content/ton-of-voice.md` | Voix (qui parle, comment, vocabulaire interdit local) |
| `content/personas.md` | Persona dominant (un seul par article) |
| `content/mots-cles.md` | Cluster, head term, longue traîne, requêtes à ÉVITER (= head nu déjà pris par un asset) |
| `content/concurrents.md` | Qui domine la SERP, faiblesses à exploiter |
| `content/faq-base.md` | Q-R réutilisables ; adapter, ne pas re-rédiger |
| `content/calendrier-edito.md` | Format demandé dans la rotation ? Cadence ? |
| `content/priorites-geo.md` | Briefs GEO mesurés (boucle MentionLab) — à traiter EN PRIORITÉ s'il en existe des non cochés |

Si un fichier contient encore des `TODO`, lancer `nouveau-site` (init) plutôt que combler en rédigeant.

### Carte d'intentions — UN propriétaire par requête EXACTE (anti-cannibalisation)

Frontière par **spécificité de requête** (le blog FAIT des comparatifs marques — c'est le cœur des mentions — mais ne duplique pas le head nu d'un asset) :

| Requête | Propriétaire |
|---|---|
| head nu « les meilleurs X / top X / classement X » | **Classement** `/classement/X` (page rankée de référence) |
| « meilleurs X pour [persona/usage] » (long-tail) | **Blog** (comparatif persona — cœur mentions) |
| « X vs Y » (2 items, face-à-face) | **Blog** |
| « comparer X » côte à côte, multi-items interactif | **Comparateur** `/comparer/X` |
| « quel X choisir / quel X pour moi » | **Choisir / Quiz** `/choisir/X`, `/quiz` |
| comment / pourquoi / qu'est-ce que / prix / définition | **Blog** (informationnel) |

Le blog **maille vers** le classement/comparateur du cluster. Jamais deux pages sur la **même requête exacte**. **Page Classement : ≥ 1000 mots** (data-driven dans `content/data/classements.json` ; en dessous = thin, non citable → enrichir le JSON).

## Étape 1 — Brief avant outline avant rédaction (workflow obligatoire)

Si `content/priorites-geo.md` a un brief **non coché** (gap mesuré MentionLab), le traiter en priorité (puis le cocher après publication). Sinon, content gap classique.

### 1.1 Brief (1 page max)
```
## Brief — [titre provisoire]
- **Cluster** / **Head term cible** / **Longue traîne** (3-5)
- **Persona dominant** · **Marques/modèles à citer (≥ 2)**
- **Intention** : informationnelle / comparative-mentions / transactionnelle
- **Format** · **Longueur cible**
- **Concurrents SERP** (2-3) · **Content gap**
- **Sources autorité** (2-4, datées) · **FAQ in-flow (H3)** (3-5) · **JSON-LD**
```
> ⚠️ **Check anti-cannibalisation** : si le head term du brief est le **head nu** d'un asset (« les meilleurs X » générique → classement ; « comparer X » → comparateur ; « quel X choisir » → choisir), requalifier en **variante persona/long-tail** (« meilleurs X pour [persona] ») ou **face-à-face** (« X vs Y ») qui maille vers l'asset.

### 1.2 Outline (squelette validé) — H1/H2/H3 sans corps.
### 1.3 Rédaction — brief + outline validés → écrire selon les règles ci-dessous.

## Étape 2 — Source d'autorité SERP
Top 3 Google sur le head term : 1) Export Semrush, 2) WebSearch, 3) titres+chapôs collés. Ne JAMAIS inventer ce que disent les concurrents (titre exact, chapô, longueur, H2, FAQ, schemas). C'est de là que sort le content gap.
> **Check d'intention** : si la SERP du head term est exactement « les meilleurs X » rankés (intention classement) ou un outil de comparaison, requalifier en variante persona/long-tail ou face-à-face.

## Étape 3 — Structure obligatoire
```
H1 — head term + différenciateur, ≤ 60 caractères (SANS année ; la marque est ajoutée par le template)
  Chapô (40-60 mots) — réponse directe citable standalone
  TL;DR — 3-5 bullets (obligatoire dès 400 mots)
H2 — sous-thème (en question 70 % du temps)
  Réponse directe < 60 mots (chunk citable) → développement → exemple chiffré (≥ 2 marques quand pertinent)
H2 — Comparatif / Données mesurées (tableau normé si applicable)
H2 — Questions fréquentes (FAQ-bloc final, 6 questions min, JSON-LD FAQPage)
[Key Takeaways] · AuthorCard en bas
```

### Longueurs cibles par format
| Type | Mots | FAQ-bloc min |
|---|---|---|
| Article blog | 800–1 200 | 6 |
| Page pilier / guide | 1 500–2 500 | 8 |
| Comparatif | 1 200–1 800 | 6 |
| Tutoriel / HowTo | 600–1 200 | 4 |
| **Page Classement (data JSON)** | **≥ 1 000** | 4-6 |

### Règle des 70 % H2 en question
≥ 70 % des H2 en question (*Faut-il / Quel / Comment / Pourquoi / Est-ce que / X vs Y : lequel ?*). 30 % déclaratifs factuels. Cf. Étape 5.

### Règle FAQ in-flow H3
Sous certains H2 stratégiques, mini-FAQ H3 verticale (H3 ne paraphrase jamais son H2). Source : PAA Google, sinon personas.

## Étape 4 — Critères GEO opérationnels
- **4.1 Citabilité par chunk** · **4.2 Answer-Explanation-Example** par H2 (cité 3× plus) · **4.3 Signaux de définition** (1 par concept central, < 200 premiers mots) · **4.4 Désambiguïsation** dès le chapô · **4.5 ≥ 3 signaux d'Expérience** (date contextuelle, donnée non-promo, fait négatif, cas limitant, opinion contre-intuitive) · **4.6 3-4 follow-ups H3** · **4.7 Tableau normé** (en-têtes 1-3 mots, 1 ligne = 1 option, max 5-6 colonnes) · **4.8 Hiérarchie sources** (.gov > .edu > DOI > orgs officielles > presse datée) · **4.9 Fraîcheur** (datePublished + dateModified, currentYear(), ≥ 1 donnée < 18 mois).

## Étape 5 — Anti-patterns IA structurels
- **5.1 Titres à bannir** : *Mon avis honnête · Verdict final · Le piège à éviter · Sans langue de bois · Faut-il craquer ? · Le secret que personne ne dit · Plot twist / Game changer.*
- **5.2 « Ce qui / Ce que » en amorce** → H2 factuel ou interrogatif strict.
- **5.3 H2 déclaratifs propres** (les 30 %) : annoncer une donnée/catégorie, jamais un sentiment. Test 💥 : si le sens ne change pas, c'est du clickbait.
- **5.4 Ponctuation** : — max 3/article · pas de triple point · éviter `:` en fin de H2 · gras 1/§ max · zéro émoji en titre.
- **5.5 Conclusions de section** : pas de phrase-pont, pas de résumé redondant, pas de *En somme / Au final*.

## Étape 6 — Stratégie d'images
Via MCP **nano-mentionbox**. Dimensions/noms alignés sur `docs/IMAGES-WORKFLOW.md` + `lib/image-slots.ts`.
- **Cover (obligatoire)** : `[slug]-cover.webp`, 1280×720 (16:9), WebP. Prompt = H1 + voix + DA. Alt factuel ≤ 125 car.
- **2 in-content RÉUTILISÉES** (pas de génération) : `<ArticleImage>` vers `/images/categories/[cat].webp` + `/images/blog/category-[cat].webp`, ~1/3 et ~2/3.
- **Workflow fire-and-poll** : prompt ≤ 20 mots finissant par « no text, no logos, no watermark », jamais de marque réelle dans le prompt → generate_image (16:9) → wait_for_image → retry `[slug]-cover-v2` → WebP → github_push_images sous `public/blog/[categorie]/[slug]/` → MDX `next/image` + alt manuel (FR + locales).

## Étape 7 — Données structurées (JSON-LD)
| Page | Schemas |
|---|---|
| Article | Article + Person + BreadcrumbList + FAQPage |
| Classement | BreadcrumbList + ItemList + FAQPage |
| Comparatif | BreadcrumbList + ItemList |
| Page auteur | Person |
| Guide / pilier | Article (+ HowTo si étapes) |
Champs Article : `headline`, `datePublished`, `dateModified`, `author` (Person + `sameAs`), `publisher`, `description`, `inLanguage`. **Speakable** sur `.article-tldr` / `.article-key-takeaway`.

## Étape 8 — Infrastructure GEO
`public/llms.txt` (index crawlers LLM) · `robots.txt` ne bloque AUCUN crawler IA (GPTBot, ClaudeBot/anthropic-ai, PerplexityBot, CCBot, Google-Extended).

## Étape 9 — On-page essentiel
`title` (head term + différenciateur, ≤ 60 car., **sans année** — marque ajoutée par le template) · `description` 140-155 car. sans clickbait · H1 unique · hiérarchie H1>H2>H3 · paragraphes 3-5 phrases · ratio 70 % prose / 30 % blocs · années via `currentYear()`.

## Étape 10 — Maillage et liens (modèle mention)
2-4 liens internes contextuels (ancres descriptives) · 1 lien vers la **page pilier** du cluster · **1 lien vers l'asset commercial** du cluster (classement / comparateur / choisir) · 1 lien transversal · max 1 lien externe / 500 mots vers sources d'autorité. **Pas de lien affilié** (modèle mention). Les marques citées le sont **factuellement**, sans lien sortant promotionnel.

## Étape 11 — Audit final avant livraison
- [ ] Brief + outline validés · 6 fichiers config lus · brief `priorites-geo` prioritaire traité s'il existe
- [ ] **Modèle mention** : ≥ 2 marques/modèles cités + tagués · persona tagué · AUCUN élément affilié
- [ ] **Anti-cannibalisation** : ne duplique pas le head nu d'un asset · variante persona/long-tail ou « X vs Y » · maille vers l'asset
- [ ] Réponse directe dans le chapô · TL;DR (≥ 400 mots) · ≥ 70 % H2 en question · Answer-Explanation-Example
- [ ] ≥ 1 signal de définition · ≥ 3 signaux d'Expérience · sources datées · ≥ 1 tableau si comparaison
- [ ] FAQ in-flow H3 + FAQ-bloc ≥ 6 · Cover générée + 2 in-content réutilisées · alt manuel par image
- [ ] JSON-LD complet + Speakable · aucun anti-pattern de titre · ≤ 3 tirets cadratins
- [ ] 2-4 liens internes · lien pilier + asset commercial · cross-check `humaniser-fr` passé

## Étape 12 — Monitoring de citabilité (mensuel)
Tester 5 head terms publiés sur Perplexity / ChatGPT Search / Google AI Overview / Claude Search. Logger. Chute = ré-audit GEO. La boucle MentionLab alimente `content/priorites-geo.md`.

## Étape 13 — Refresh d'articles
Refresh majeur : `dateModified`, données datées, re-check sources et concurrents.

## Compatibilité avec les autres skills
Triggers de rédaction → trois skills en parallèle : `ton-of-voice` (voix), `seo-geo-redaction` (structure + GEO + mention, ce skill), `humaniser-fr` (tics + typo + footprint). Bootstrap `content/` : `nouveau-site` → `init-site` / `configure-from-spec`. Gabarits détaillés : `references/full-guide.md`.
