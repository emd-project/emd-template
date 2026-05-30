---
name: seo-geo-redaction
version: 2.0.0
description: Applique les règles SEO et GEO (Generative Engine Optimization) à toute rédaction de contenu éditorial français. Couvre le brief, l'outline validé, la structure d'article, la citabilité par les moteurs génératifs, les featured snippets, les signaux d'Expérience (E-E-A-T), les données structurées JSON-LD, le maillage interne, la stratégie d'images (avec génération nano-banana), et les anti-patterns IA structurels (titres, ponctuation, formulations d'authenticité simulée). À utiliser AVANT toute rédaction de contenu éditorial — article de blog, page pilier, fiche produit, comparatif, guide, tutoriel, FAQ. Triggers — « rédige un article », « écris une fiche produit », « crée un guide », « génère le texte SEO de », « produis un brief », « rédige le comparatif », « écris la page pilier », « rédige le tutoriel », « fais-moi un article SEO », « rédige le brief avant d'écrire ». Lit obligatoirement avant rédaction — content/mots-cles.md, content/concurrents.md, content/faq-base.md, content/calendrier-edito.md, content/personas.md, content/ton-of-voice.md. Délègue à humaniser-fr toute la chasse aux tics lexicaux et à la typographie française. Gabarits complets, checklist exhaustive et doctrine d'usage des formats dans references/full-guide.md (à charger uniquement si besoin du détail).
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - WebSearch
  - WebFetch
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

Si l'un de ces fichiers contient encore des `TODO`, lancer `init-site` plutôt que tenter de combler le trou en rédigeant.

## Étape 1 — Brief avant outline avant rédaction (workflow obligatoire)

Économie de tokens et de pivots. Trois sous-étapes, l'utilisateur valide chacune avant de passer à la suivante.

### 1.1 Brief (1 page max)

Produire un brief structuré et le montrer à l'utilisateur AVANT d'écrire la moindre phrase d'article.

```
## Brief — [titre provisoire]

- **Cluster** : (depuis mots-cles.md)
- **Head term cible** : (depuis mots-cles.md)
- **Mots-clés longue traîne** : 3-5 requêtes (depuis mots-cles.md)
- **Persona dominant** : (depuis personas.md)
- **Intention de recherche** : informationnelle / commerciale / transactionnelle / navigationnelle
- **Format** : (guide / comparatif / FAQ / news / retour d'expérience — depuis calendrier-edito.md)
- **Longueur cible** : (selon format)
- **Concurrents directs sur la requête** : 2-3 (depuis concurrents.md + recherche web si nécessaire)
- **Content gap identifié** : l'angle que personne ne couvre, à exploiter
- **Sources autorité à citer** : 2-4 sources concrètes prévues (datées, identifiées)
- **FAQ in-flow prévues (H3)** : 3-5 questions venant du persona OU du PAA Google
- **Schemas JSON-LD prévus** : Article + Person + BreadcrumbList + FAQPage (et HowTo / ItemList si applicable)
```

### 1.2 Outline (squelette validé)

Une fois le brief validé, produire un outline complet en H1/H2/H3 sans rédiger le corps. L'utilisateur valide. Économie de 60-70% des tokens en cas de pivot structurel.

```
H1 — [titre final, ≤ 60 caractères, head term en début]

Chapô (40-60 mots) — réponse directe à l'intention de recherche
TL;DR — 3-5 bullets (obligatoire dès 400 mots)

H2 — [question 1, formulée comme l'utilisateur la tape] ?
  Réponse directe en < 60 mots (citabilité standalone)
  H3 — sous-angle 1
  H3 — sous-angle 2

H2 — [question 2 ou affirmation factuelle pour les 30% déclaratifs]
  Idem

H2 — Questions fréquentes (FAQ in-flow OU FAQ-bloc selon position dans l'article)
  H3 — question précise 1 (du persona ou du PAA)
  H3 — question précise 2
  ...

Key Takeaways (encadré récap après l'H2 majeur du milieu)

AuthorCard en bas
```

### 1.3 Rédaction

L'utilisateur a validé brief + outline. Maintenant écrire en respectant les règles ci-dessous.

## Étape 2 — Source d'autorité SERP

Pour le content gap et le calibrage de profondeur, il faut connaître les 3 premiers résultats Google sur le head term. Trois façons de l'obtenir, par ordre de préférence :

1. **L'utilisateur fournit un export Semrush** (Organic Research ou Keyword Gap) — déjà lu dans `content/mots-cles.md` ou collé dans la conversation. C'est la source la plus précise.
2. **WebSearch** sur le head term — disponible via le tool, à utiliser si pas d'export Semrush. Permet de lire les titres, premiers paragraphes, et structure des concurrents.
3. **L'utilisateur colle les 3 premiers titres + chapôs manuellement** dans la conversation. Fallback acceptable.

Ne JAMAIS inventer ce que disent les concurrents. Si aucune des trois sources n'est disponible, demander à l'utilisateur de paster les SERP avant de continuer.

Pour chaque résultat top 3, noter : titre exact, chapô (1er paragraphe), longueur estimée, H2 visibles, présence FAQ, schemas détectés. C'est de cette analyse que sort le content gap.

## Étape 3 — Structure obligatoire

### Architecture de page

```
H1 — head term + différenciateur, ≤ 60 caractères, année dynamique si pertinent
  Chapô (40-60 mots) — réponse directe en 1-3 phrases, citable standalone

  TL;DR — 3-5 bullets (obligatoire dès 400 mots, recommandé dès 250)

H2 — sous-thème 1 (en question 70 % du temps)
  Réponse directe < 60 mots (chunk citable)
  Développement, données, exemple chiffré
  Lien interne contextuel
  Optionnel : H3 in-flow FAQ (drill vertical sur le sous-thème, sans paraphraser le H2)

H2 — sous-thème 2 (idem)

H2 — Comparatif / Données mesurées (tableau normé si applicable)

H2 — Questions fréquentes (FAQ-bloc final, 6 questions min, JSON-LD FAQPage)

[Key Takeaways — encadré récap après l'H2 majeur central]

AuthorCard en bas (lien vers /auteurs/[slug])
```

### Longueurs cibles par format

| Type | Mots | FAQ-bloc min | FAQ in-flow H3 par H2 |
|---|---|---|---|
| Article blog | 800–1 200 | 6 | 0-2 (selon H2) |
| Page pilier / guide | 1 500–2 500 | 8 | 1-3 par H2 majeur |
| Fiche produit | 300–600 | 4 | 0-1 |
| Comparatif | 1 200–1 800 | 6 | 0-2 |
| Tutoriel / HowTo | 600–1 200 | 4 | 1 par étape |

### Règle des 70 % H2 en question

Au moins 70 % des H2 d'un article doivent être formulés comme des questions. Définition stricte de "question" :

- **Compte** : *Faut-il…*, *Quel…*, *Comment…*, *Pourquoi…*, *Est-ce que…*, *Quand…*, *Où…*, *X vs Y : lequel choisir ?*
- **Ne compte pas** : *Choisir un X en 3 étapes*, *Le meilleur X 2026*, *X : ce qu'il faut savoir* (formulations promotionnelles ou déguisées)

Les 30 % restants doivent être des H2 **déclaratifs factuels**, pas des annonces de révélation. Voir Étape 5 ci-dessous pour la liste des H2 déclaratifs propres vs IA-cliché.

### Règle FAQ in-flow H3

Sous certains H2 stratégiques, glisser une mini-FAQ en H3 qui drille la verticale du sujet. Différent de la FAQ-bloc finale (en JSON-LD FAQPage).

- H2 = horizontal (couvre un sous-thème)
- H3 in-flow = vertical (drille un cas précis, une situation, un détail)

Anti-répétition stricte : un H3 ne paraphrase JAMAIS son H2. Test : si tu peux remplacer le mot-clé du H2 par un autre dans le H3 sans changer la formulation, c'est une paraphrase.

Source des questions H3, dans l'ordre de préférence :

1. **PAA Google** sur le head term (via WebSearch ou export Semrush) — pour le volume et l'alignement SERP
2. **Questions persona** (depuis `content/personas.md`, section "Questions par étape de funnel" du persona dominant) — pour la différenciation et la longue traîne

Pour un cluster ultra-concurrentiel où le PAA est déjà saturé, prioriser le persona. Pour un cluster émergent, le PAA suffit.

## Étape 4 — Critères GEO opérationnels

### 4.1 Citabilité par chunk

Les moteurs génératifs lisent par chunks de ~500-1000 tokens. Une section bien GEO = un chunk = une idée auto-suffisante.

Règle : chaque H2 doit pouvoir être copié-collé seul dans une conversation IA, sans aucun contexte de l'article, et faire sens. Si la lecture standalone nécessite "voir plus haut" ou un pronom dont le référent est ailleurs, le chunk est cassé.

### 4.2 Pattern Answer-Explanation-Example par sous-section

Structure obligatoire de chaque H2 :

```
1. Réponse directe à la question du H2 (< 60 mots, 2-3 phrases)
2. Explication / contexte / nuance (2-4 paragraphes)
3. Exemple chiffré, cas concret, ou donnée originale
```

Cette structure est citée trois fois plus que l'ordre inverse (contexte d'abord, réponse en fin). Les LLMs extraient la première réponse.

### 4.3 Signaux de définition

Pour les concepts centraux, utiliser les marqueurs de définition que les modèles repèrent activement :

- *X désigne…*
- *X est défini comme…*
- *X consiste à…*
- *Concrètement, X signifie…*
- *Au sens [contexte], X correspond à…*

Une définition par concept central, dans les 200 premiers mots de l'article ou de la section qui l'introduit.

### 4.4 Désambiguïsation explicite

Quand un terme ou une intention de recherche peut être ambigu, désambiguïser dès le chapô :

> *Si tu cherches X au sens A (contexte 1), la réponse est… Si tu cherches au sens B (contexte 2), voir la section [Y] plus bas.*

Les LLMs adorent ça : ils peuvent citer la branche pertinente sans inventer. Cible : tout article dont la requête principale a plus d'une intention possible.

### 4.5 Signaux d'Expérience (E-E-A-T, le premier "E")

Le contenu GEO 2026 valorise la première main vérifiable. Inclure dans l'article au moins **trois signaux d'expérience** parmi :

- Une date précise contextuelle (*"J'ai pris l'abonnement en janvier 2024, j'ai donc l'ancien tarif gelé"*)
- Une donnée chiffrée non-promotionnelle (*"L'app a planté 2 fois en mars, plus jamais depuis"*)
- Un fait négatif gênant (*"Le forfait à 39€ est moins bien que celui à 29€ si tu n'as pas la fibre"*)
- Un cas spécifique qui limite la généralité (*"Mon test vaut pour un T3 mal isolé. En maison passive, recommencer"*)
- Une opinion contre-intuitive argumentée (*"Le modèle pas cher gagne sur 3 des 5 critères"*)
- Une référence visuelle vérifiable (capture, ticket, facture, mesure)

L'expérience ne s'annonce **jamais** par des formules d'authenticité (voir Étape 5 anti-patterns). Elle se prouve par les détails.

### 4.6 Anticipation des follow-ups

Les sessions de recherche IA sont conversationnelles. Après avoir répondu à la question principale, anticiper 3-4 follow-ups naturels et y répondre en H3 successifs.

Exemple sur head term "Quel routeur Wi-Fi choisir ?" :
- H3 : *Et pour un budget < 100 € ?*
- H3 : *Si j'ai déjà la box opérateur ?*
- H3 : *Wi-Fi 6 ou Wi-Fi 7 en 2026 ?*

Un article qui pré-répond à 4 follow-ups peut être cité 4 fois dans une même session AI Overview.

### 4.7 Tableau comparatif normé

Quand un comparatif est pertinent, format strict pour maximiser la citation par AI Overviews :

- **En-têtes courts** : 1 à 3 mots, pas de phrase
- **Cellules sans phrases complètes** : valeurs, chiffres, oui/non, mots-clés
- **Pas de merged cells** (les LLMs les parsent mal)
- **Pas d'icônes mélangées avec du texte** dans une même cellule
- **Une ligne = un produit / une option, pas un mix**
- **Max 5-6 colonnes** (au-delà, illisible et mal extrait)

### 4.8 Hiérarchie des sources d'autorité

Quand on cite, hiérarchie GEO à respecter :

1. **`.gov`** (institutions étatiques : service-public.fr, INSEE, INPI, URSSAF, ANSES, ANSM…)
2. **`.edu`** ou universitaires (publications HAL, Cairn, thèses)
3. **Recherche primaire avec DOI** (papier scientifique avec identifiant)
4. **Organisations officielles internationales** (OMS, OCDE, Eurostat, UE)
5. **Sources sectorielles établies** (presse spécialisée datée + nommée)
6. **Sources tertiaires** (blogs experts, podcasts, communautés) — uniquement en complément, jamais en source principale

Format de citation dans le corps : *"Selon [Nom de la source] ([année]), [stat ou affirmation]."* avec lien hypertexte sur le nom.

### 4.9 Fraîcheur signalée

- Date de publication visible en haut de l'article (`datePublished`)
- Date de dernière mise à jour (`dateModified`) si différente
- Année "édition courante" via fonction serveur (`currentYear()`), jamais en dur
- Au moins une donnée datée < 18 mois dans le corps

## Étape 5 — Anti-patterns IA structurels

Distinct des tics lexicaux couverts par `humaniser-fr`. Ici on chasse les **structures** qui simulent l'expérience ou l'authenticité.

### 5.1 Titres et H2 à bannir

Tout ce qui annonce l'authenticité par la forme :

- *Mon avis honnête sur…*
- *Verdict final / Verdict après X mois*
- *Le piège qu'on a évité / Le piège à éviter*
- *Sans langue de bois*
- *Le vrai test*
- *Mon retour d'expérience honnête*
- *Faut-il craquer ?*
- *Voici ce que j'ai vraiment pensé*
- *Ce que les marques ne veulent pas que vous sachiez*
- *Le secret que personne ne dit*
- *Plot twist / Game changer / Disruption*
- *Une bonne surprise / Mauvaise surprise* (sauf suivi d'une donnée)
- *Spoiler / Spoiler alert*
- *On ne va pas tourner autour du pot*

### 5.2 Pattern "Ce qui / Ce que" en amorce de H2 ou H3

À bannir comme amorce :

- *Ce qu'il faut savoir sur…*
- *Ce que personne ne vous dit*
- *Ce qui change avec X*
- *Ce qu'il se passe quand…*
- *Voici ce que / Voilà ce qui*
- *Ce que j'ai appris en X mois*

Remplacer par un H2 factuel ou interrogatif strict (voir 70 % H2 questions à l'Étape 3).

### 5.3 H2 déclaratifs propres (les 30 % autorisés)

Un H2 déclaratif doit **annoncer une donnée ou une catégorie**, jamais un sentiment ou une révélation.

Exemples corrects :
- *Le coût total sur 24 mois*
- *Critères d'évaluation utilisés*
- *Comparaison vs Bouygues et SFR*
- *Méthodologie du test sur 90 jours*
- *Différences appartement (T3, 65 m²) vs maison (90 m²)*
- *3 vérifications avant achat*

Exemples interdits (même factuels en apparence) :
- ❌ *Notre verdict honnête*
- ❌ *Le détail qui change tout*
- ❌ *Ce qui m'a surpris*
- ❌ *Mon avis d'expert*

Test : remplace le H2 par 💥. Si le sens du paragraphe ne change pas, c'est un titre clickbait, pas un titre factuel.

### 5.4 Ponctuation

- **Tiret cadratin (—)** : maximum 3 occurrences dans tout l'article. Au-delà = red flag IA. Remplacer par point, virgule, parenthèses ou deux-points selon le cas. Voir `humaniser-fr` F1 pour le détail.
- **Tiret demi-cadratin (–)** : seulement pour intervalles (*pages 12–15*, *2018–2024*).
- **Triple point dramatique (…!)** : interdit.
- **Deux-points en fin de H2** (*Logiciel comptable : notre comparatif*) : à éviter, tic IA fréquent.
- **Gras mécanique** : un gras par paragraphe maximum, et seulement si l'œil doit vraiment s'arrêter. Voir `humaniser-fr` F2.
- **Émojis dans titres ou puces** : interdits en contenu publié. Voir `humaniser-fr` F4.

### 5.5 Conclusions de section

Anti-patterns à éviter en fin de H2 :

- Phrases-pont vers le H2 suivant (*Maintenant que nous avons vu X, passons à Y*)
- Résumé qui répète ce qu'on vient de dire
- Question rhétorique qui sert de transition (*Mais alors, comment faire ?*)
- *En somme / En définitive / Au final / Finalement* en début de paragraphe-conclusion

Une section termine sur sa dernière information utile, le H2 suivant attaque directement.

## Étape 6 — Stratégie d'images

Tu as accès au MCP `nano-banana` (Gemini 3.1 Flash Image / Nano Banana 2) pour générer des images. Stratégie par article :

### 6.1 Hero image

Une image en haut d'article, générée à partir d'un prompt dérivé du H1 et de la voix du site. Conventions :

- Dimensions : 1376×768 (16:9) ou 1248×832 (3:2) selon le layout du template
- Format : WebP
- Nom de fichier : `[slug-article]-hero.webp` (slug exactement identique au slug de la page)
- Alt text : descriptif factuel + head term naturellement incluse, ≤ 125 caractères, jamais "image de" ou "photo de"
- Style : cohérent avec `niche.config.ts → signature` (palette, fonts visuelles, ambiance)

### 6.2 Visuels par H2

Un visuel tous les 400-500 mots de prose, en complément du hero. Conventions :

- Dimensions : 1184×864 (4:3) pour les visuels in-flow
- Nom de fichier : `[slug-article]-[h2-slug].webp`
- Légende (caption) sous l'image si la donnée mérite : courte, factuelle, citable séparément du contexte (les LLMs lisent les captions)

### 6.3 Workflow nano-banana

1. Définir le prompt selon la voix et la signature du site (5-15 mots, sujet + ambiance + style)
2. Appeler `mcp__nano-banana__generate_image` (ou `mcp__nano-mentionbox__generate_image` selon la config) avec le bon aspect_ratio
3. Vérifier le résultat (`github_view_image` ou local)
4. Si OK, pousser via `github_push_images` sur la branche de travail
5. Insérer dans le MDX avec `next/image` et alt text rédigé manuellement

### 6.4 Anti-patterns image

- Stock photos génériques (laptop sur table, équipe qui sourit)
- Captures d'écran sans contexte ni annotation
- Images sans alt text ou avec alt text robotisé ("image de logiciel")
- Plus de 4-5 images dans un article < 1000 mots (lourdeur visuelle)

## Étape 7 — Données structurées (JSON-LD)

| Page | Schemas obligatoires |
|---|---|
| Article (blog post) | Article + Person + BreadcrumbList + FAQPage |
| Page auteur | Person |
| Comparatif | BreadcrumbList + ItemList |
| Guide / Page pilier | Article (+ HowTo si étapes claires) |
| Fiche produit | Product + AggregateRating si applicable |
| Page FAQ | FAQPage + BreadcrumbList |

Champs Article obligatoires : `headline`, `datePublished`, `dateModified`, `author` (Person avec lien `sameAs` au profil), `publisher` (Organization), `description`, `inLanguage: "fr"`.

### 7.1 SpeakableSpecification (boost AI assistant)

Pour les sections que tu veux explicitement faire lire à voix haute par Google Assistant / Siri / Alexa / certains AI overview engines, ajouter à Article :

```json
"speakable": {
  "@type": "SpeakableSpecification",
  "cssSelector": [".article-tldr", ".article-key-takeaway"]
}
```

Et dans le MDX, mettre les classes `article-tldr` sur la TL;DR et `article-key-takeaway` sur les encadrés Key Takeaways. Signal fort de citabilité.

## Étape 8 — Infrastructure GEO

### 8.1 llms.txt

Fichier à la racine du site (`public/llms.txt`) qui décrit le site aux crawlers LLM. Format émergent, déjà adopté par Anthropic, OpenAI, Hugging Face, etc.

```
# [Nom du site]

> Description courte du site (1-2 phrases factuelles, pas de marketing).

## Pages structurelles
- [/](/) — Page d'accueil
- [/blog](/blog) — Articles éditoriaux
- [/comparer](/comparer) — Comparatifs produits
- [/auteurs](/auteurs) — Profils des rédacteurs (E-E-A-T)

## Articles prioritaires
- [Titre article 1](/blog/slug-1) — résumé en 1 ligne
- [Titre article 2](/blog/slug-2) — résumé en 1 ligne
```

À tenir à jour. Le skill `init-site` peut en générer un premier brouillon depuis `content/settings.yaml` et `content/articles/`.

### 8.2 robots.txt

Vérifier que `robots.txt` n'interdit AUCUN crawler IA majeur :
- `GPTBot` (OpenAI)
- `ClaudeBot` / `anthropic-ai` (Anthropic)
- `PerplexityBot` (Perplexity)
- `CCBot` (Common Crawl, utilisé par plusieurs LLMs)
- `Google-Extended` (Google AI Overviews)

Bloquer un crawler IA, c'est se retirer volontairement du circuit GEO. À ne faire que sur décision explicite.

## Étape 9 — On-page essentiel (SEO classique)

- `title` : head term en début + différenciateur, max 60 caractères
- `description` : réponse directe à l'intention, max 155 caractères, sans clickbait
- H1 unique, **variante naturelle** du title (jamais identique)
- Hiérarchie stricte H1 > H2 > H3, jamais de saut H1 → H3
- Paragraphes 3-5 phrases, phrases 15-25 mots, varier
- Ratio prose / blocs structurés (listes, tables, encadrés) : **70 % prose pour la profondeur + 30 % blocs structurés pour la citabilité** (PAS 100 % prose comme dans la v1)
- Années "édition courante" → `currentYear()` côté serveur
- Densité mot-clé : ne pas calibrer en pourcentage. Calibrer en **champ sémantique** (lister les entités liées au head term et vérifier qu'au moins 60 % sont mentionnées au moins une fois)

## Étape 10 — Maillage et liens

- 2-4 liens internes contextuels par article (ancres descriptives, jamais "cliquez ici" ou "en savoir plus")
- 1 lien vers la page pilier du cluster (cohérent avec `content/mots-cles.md`)
- 1 lien transversal vers un autre cluster (pour la circulation d'autorité)
- Max 1 lien externe par 500 mots, vers sources d'autorité selon hiérarchie 4.8
- Tous les liens Amazon passent par `addAffiliateTag()` ou `<AffiliateLink>` (cf. `niche.config.ts → affiliateTag`)
- Affiliate disclosure obligatoire en début d'article si présence de liens affiliés (formulation reformulée par site cf. `humaniser-fr` G5)

## Étape 11 — Audit final avant livraison

Mini-checklist à passer en silence avant de livrer :

- [ ] Brief + outline validés par l'utilisateur AVANT rédaction
- [ ] Les 6 fichiers config lus, aucun TODO bloquant
- [ ] Réponse directe à l'intention dans le chapô (40-60 mots citables)
- [ ] TL;DR présente (≥ 400 mots dans l'article)
- [ ] ≥ 70 % des H2 en forme question (strict)
- [ ] Chaque H2 a un chunk standalone < 60 mots en réponse directe
- [ ] Pattern Answer-Explanation-Example dans chaque H2
- [ ] Au moins 1 signal de définition pour le concept central
- [ ] Désambiguïsation si requête ambiguë
- [ ] ≥ 3 signaux d'Expérience disséminés (dates, faits négatifs, cas spécifique)
- [ ] FAQ in-flow H3 sous au moins 1 H2 stratégique (PAA ou persona)
- [ ] FAQ-bloc finale ≥ 6 questions
- [ ] Sources d'autorité datées et identifiables
- [ ] Au moins 1 tableau ou statistique chiffrée
- [ ] Hero image générée + 1 visuel par 400-500 mots
- [ ] Alt text rédigé manuellement pour chaque image
- [ ] JSON-LD Article + Person + BreadcrumbList + FAQPage présents
- [ ] Speakable JSON-LD ajouté sur TL;DR + Key Takeaways
- [ ] Aucun H2 / H3 dans la liste anti-patterns (Étape 5)
- [ ] ≤ 3 tirets cadratins dans tout l'article
- [ ] Affiliate disclosure si liens affiliés
- [ ] 2-4 liens internes contextuels présents
- [ ] Lien vers page pilier du cluster
- [ ] Cross-check `humaniser-fr` passé (lexique, typographie, voix)

## Étape 12 — Monitoring de citabilité (mensuel, hors-rédaction)

Pas de monitoring = optimisation à l'aveugle. Réflexe à inscrire dans `content/calendrier-edito.md` ou un planning séparé.

Tous les mois, prendre 5 head terms publiés et tester manuellement :

- Sur **Perplexity** : taper la requête, regarder si le site sort dans les sources citées
- Sur **ChatGPT Search** : idem
- Sur **Google AI Overview** : idem (visible directement dans la SERP, encadré violet en haut)
- Sur **Claude Search** : idem si actif sur le compte

Logger les résultats dans un fichier ou Notion. Une chute brutale = problème de citabilité ; relancer un audit GEO sur l'article concerné.

## Étape 13 — Mise à jour / refresh d'articles existants

Hors-périmètre direct de ce skill : la stratégie de refresh est définie dans `content/calendrier-edito.md` (cycle, critère majeur/mineur, signalement). Quand l'utilisateur demande un refresh, ce skill se charge ; il consulte `calendrier-edito.md` pour appliquer les règles, puis applique la même procédure que ci-dessus (avec brief + outline réduits si modification mineure).

Au moins ces éléments à mettre à jour systématiquement lors d'un refresh majeur :
- `dateModified` JSON-LD
- Toutes les données chiffrées et datées
- Tous les screenshots datés
- Re-check des sources autorité (lien mort ? Donnée obsolète ?)
- Re-check des concurrents directs (un nouveau venu dans le top 3 ?)

## Pour aller plus loin

Gabarits par format détaillés (comparatif, tutoriel, fiche produit, page pilier, FAQ thématique), checklist exhaustive de publication, doctrine d'usage des composants MDX du template, exemples chiffrés de bons et mauvais articles → voir [`references/full-guide.md`](references/full-guide.md). À charger seulement quand tu as besoin du détail — ce SKILL.md suffit dans 80 % des cas.

## Compatibilité avec les autres skills

Sur les triggers de rédaction, trois skills se chargent en parallèle. Pas de chevauchement, chacun a sa responsabilité :

- **`ton-of-voice`** — voix éditoriale spécifique au site (qui parle, comment). Lit `content/ton-of-voice.md`.
- **`seo-geo-redaction`** (ce skill) — structure pour Google + LLM, brief, outline, signaux GEO, anti-patterns structurels. Lit les 6 fichiers de `content/`.
- **`humaniser-fr`** — tics lexicaux IA, typographie française, footprint inter-sites. Mode production et mode review.

Ce skill délègue explicitement à `humaniser-fr` toute la chasse aux mots-tics (vocabulaire gonflant, anglicismes, doublets d'adjectifs, etc.) et toute la typographie française (guillemets, espaces insécables, accents). Si pendant la rédaction tu repères un tic lexical, c'est `humaniser-fr` qui te le rappellera ; ce skill garde son focus sur la structure et le GEO.

Pour le bootstrap initial du site (remplir les 6 fichiers de `content/`), c'est le skill `init-site` qui orchestre, à utiliser une seule fois après "Use this template" sur GitHub.
