# Gabarit canonique — Tâche planifiée « article quotidien »

Source de vérité pour la scheduled task de rédaction créée à l'init (`configure-from-spec` étape 13).
Remplacer les `[placeholders]` depuis `niche.config.ts` + la spec, puis créer la tâche.

## Paramètres à injecter

- `[siteName]`, `[repoOwner]/[repoName]`, `[market]` (BE/FR/CH/CA), `[authorName]`, `[authorSlug]`
- `[locales]` = `niche.config.ts.locales` → pilote le miroir (mono-langue vs N langues)
- `[cron]` = selon la cadence du Bloc 3 (`0 8 * * *` par défaut)
- Branche de publication : **`main` par défaut** (le site se rebuild depuis `main` sur Vercel).
  Si workflow de review, utiliser une branche dédiée et merger — jamais de demi-mesure.

## Gabarit du prompt (à coller dans la scheduled task)

```
Tu rédiges et publies UN seul nouvel article de blog par run sur [siteName]
(repo `[repoOwner]/[repoName]`, branche `main`). Aucun brouillon : l'article complet en une
passe, ou rien.

# 0 — Lecture obligatoire (avant la moindre ligne)
PROGRESS.md · niche.config.ts · DECISIONS.md · CLAUDE.md ·
docs/SEO-GEO-REDACTION.md (ou skills/seo-geo-redaction) · docs/IMAGES-WORKFLOW.md ·
docs/AUTHOR-[authorSlug].md · content/ton-of-voice.md · content/mots-cles.md ·
content/concurrents.md · content/faq-base.md · content/calendrier-edito.md ·
skills/humaniser-fr (mode production).
Si locales.length >= 2 : skills/seo-geo-redaction/references/mirror-i18n.md.
Toute règle modifiée depuis le dernier run l'emporte.

# 1 — Choisir UN sujet (content gap) — BLOG = INFORMATIONNEL UNIQUEMENT
Lister les articles publiés (content/blog/[locale]/[categorie]/ et le calendrier). Choisir le
premier sujet non publié du calendrier OU une catégorie sous-couverte. Sujet concret, ciblé,
ancré [market], intention de recherche identifiable, faisable en 1 article de 1100-2100 mots.
Formuler le head term exact. UN SEUL sujet par run.
ANTI-CANNIBALISATION (cf. CLAUDE.md « Classements ») : le sujet doit être INFORMATIONNEL.
INTERDIT de cibler un terme tête commercial appartenant à un asset dédié :
  - « meilleur/top/classement/les meilleurs X » → page /classement (PAS le blog) ;
  - « X vs Y / comparer X et Y » → /comparer ;
  - « quel X choisir / quel X pour [profil] » → /choisir ou /quiz.
Si le calendrier propose un tel sujet : le requalifier en angle informationnel (comment, pourquoi,
qu'est-ce que, prix, définition, avantages/inconvénients, use-case) qui MAILLE vers l'asset, ou passer
au suivant. Le blog ne double jamais un asset commercial.

# 2 — SERP analysis OBLIGATOIRE (non-skippable) + check d'intention
WebSearch sur le head term → top 3 Google.[market_tld]. Pour chacun : titre, chapô, longueur,
H2, FAQ ?, tableau ?. Documenter le content gap (le différenciateur) en 2-3 lignes. Pas de SERP = run échoué.
CHECK D'INTENTION : si la SERP du head term est dominée par des listes « meilleurs/top » ou des
comparatifs 1:1, l'intention appartient au CLASSEMENT/COMPARATEUR, pas au blog → ne pas écrire,
requalifier en angle informationnel ou choisir un autre sujet.

# 3 — Brief (interne, non commité)
Cluster, head term, longue traîne (3-5), persona, intention, format, longueur cible,
concurrents SERP, content gap, sources d'autorité à citer (2-4, priorité .[market_tld]),
FAQ in-flow prévues, schemas JSON-LD.

# 4 — Outline (H1/H2/H3 sans corps)
H1 <= 60 caractères, head term en tête. Chapô 40-60 mots avec réponse directe. TL;DR 3-5 bullets.
>= 70 % des H2 en QUESTION stricte (Faut-il / Quel / Comment / Pourquoi / Est-ce que / Quand / X vs Y).
Les 30 % restants factuels (pas clickbait). FAQ-bloc finale 6-7 questions. 3-4 follow-ups en H3.

# 5 — Rédaction FR (humaniser-fr en mode production)
Voix [authorName]. >= 1 fait concret (chiffre/date/nom/source) par paragraphe. Typo FR stricte.
GEO obligatoire par H2 : Answer (réponse directe < 60 mots) → Explanation → Example chiffré [market].
Signal de définition pour le concept central. >= 3 signaux d'Expérience (dates, données [market],
faits négatifs gênants, cas spécifiques). Sources d'autorité datées (priorité .[market_tld]).
>= 1 tableau comparatif si le sujet s'y prête. Année : utiliser currentYear() côté template —
JAMAIS d'année en dur dans le titre/frontmatter (sinon « 2026 2027 » l'an prochain).

# 6 — Frontmatter MDX (obligatoire)
title, seoTitle (si différent), description (140-155 car.), slug (kebab-case, head term en tête,
SANS année), category, author: [authorSlug], publishedAt (date du run), readingTimeMin,
tldr[], faq[] (6-7), related[] (2-4), featureImage + featureImageAlt (fr + locales).
Composants dispo : ArticleImage, PullQuote, Verdict, StatCard/StatRow, CompareBar, ProConTable, Tip, Warning…
Pas de TL;DR/AiSummary dans le corps : injectés par le template depuis le frontmatter.

# 7 — Images (cf. docs/IMAGES-WORKFLOW.md) : 1 cover GÉNÉRÉ + 2 in-content RÉUTILISÉES
Cover (1 seule génération) : mcp__nano-mentionbox__generate_image (prompt <= 20 mots, cohérent niche +
DA, finir par « no text no logos no watermark no readable plate no magazine overlay »), 16:9, puis
wait_for_image. Retry une fois en `[slug]-cover-v2`. Échec → skip l'article, log « Bloqué » dans
PROGRESS.md, fin. WebP, push via mcp__nano-mentionbox__github_push_images sous
`public/blog/[categorie]/[slug]/`. Renseigner `featureImage` au frontmatter.
Deux images in-content (AUCUNE génération) : insérer exactement 2 <ArticleImage> dans le corps, à
~1/3 et ~2/3 (après le 2e puis le 4e H2), `src` = images EXISTANTES de la catégorie
(`/images/categories/[categorie].webp` et `/images/blog/category-[categorie].webp`), `alt` dans
toutes les locales. Ne JAMAIS réutiliser le cover de l'article courant ; ne RIEN générer de plus.

# 8 — Miroir des langues (si locales.length >= 2)
Traduire l'article dans TOUTES les locales (content/blog/[locale]/[categorie]/[slug].mdx).
Slug naturel par langue. Voix transposée, FAQ traduite, acronymes [market] gardés + explicités.
alt images (cover + in-content) dans toutes les locales. Si une traduction bloque, ne pousse RIEN.
Si mono-langue : ignorer cette étape.

# 9 — Mapping i18n (si locales.length >= 2)
Ajouter le couple dans lib/i18n/article-slugs.ts (articleSlugFrToEn). Obligatoire pour le
sélecteur de langue (zéro-404) et hreflang. cf. mirror-i18n.md.

# 10 — Commit atomique
Tous les MDX (toutes locales) + mapping i18n en UN commit. Cover déjà poussé (étape 7, OK) ;
les images in-content sont des réemplois (rien à pousser).
Message : feat(content): publish [slug] (locales: [...]).

# 11 — Calendrier + PROGRESS
Marquer le sujet [x] + date dans content/calendrier-edito.md. Entrée en tête de PROGRESS.md :
slug(s), catégorie, head term, différenciateur SERP, liens commits, coût image (1 cover).

# 12 — Hard rules
- JAMAIS publier sans SERP analysis (étape 2).
- JAMAIS un article blog sur un terme tête commercial (meilleur/top/classement/vs/quel choisir) —
  ces intentions appartiennent aux assets /classement, /comparer, /choisir (cf. CLAUDE.md). Le blog maille vers eux.
- JAMAIS un seul locale si miroir strict actif.
- JAMAIS d'année en dur dans titre/slug/frontmatter (currentYear() seulement).
- JAMAIS de marque réelle dans un prompt d'image ; prompts <= 20 mots.
- UNE SEULE image générée par article (le cover) ; les 2 in-content sont des réemplois.
- TOUJOURS alt dans toutes les locales · sources datées .[market_tld] · >= 70 % H2 en question ·
  >= 3 signaux d'Expérience.

# 13 — Si le run échoue
Ne pousse RIEN. Ajoute une ligne « Bloqué » dans PROGRESS.md (ce qui a échoué + sujet visé).
Termine proprement. Le run du lendemain repart sur un autre sujet, sans dette.

# 14 — Output final (8-12 lignes max)
Slug(s) publié(s) ou échec + raison · catégorie · head term · mots FR · lien commit · coût image.
Le détail est dans PROGRESS.md.
```

## Pourquoi ce gabarit

- **SERP-first** : pas de rédaction « hors-sol ». Le content gap est la condition d'entrée.
- **Anti-cannibalisation** : le blog est informationnel ; les intentions commerciales (meilleur/top, vs, quel choisir) appartiennent aux assets dédiés (classement/comparateur/choisir). Cf. CLAUDE.md.
- **GEO 2026** : Answer-Explanation-Example + signaux d'Expérience = citabilité LLM.
- **Images économes** : 1 cover généré + 2 images réutilisées par article → site animé, coût minimal, jamais de placeholder.
- **Miroir conditionnel** : multilingue seulement si `locales >= 2`, sinon un seul fichier.
- **Année dynamique** : `currentYear()` côté template, rien en dur → pas de péremption.
- **Anti-footprint** : ne jamais copier le frontmatter/structure d'un autre site.
