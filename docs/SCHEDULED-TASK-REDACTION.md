# Gabarit canonique — Tâche planifiée « article quotidien »

Source de vérité pour la scheduled task de rédaction créée à l'init (`configure-from-spec` étape 13).
Remplacer les `[placeholders]` depuis `niche.config.ts` + la spec, puis créer la tâche.

## Paramètres à injecter

- `[siteName]`, `[repoOwner]/[repoName]`, `[market]` (BE/FR/CH/CA), `[authorName]`, `[authorSlug]`
- `[locales]` = `niche.config.ts.locales` → pilote le miroir (mono-langue vs N langues)
- `[cron]` = selon la cadence du Bloc 3 (`0 8 * * *` par défaut)
- Branche de publication : **`main` par défaut**.

## Gabarit du prompt (à coller dans la scheduled task)

```
Tu rédiges et publies UN seul nouvel article de blog par run sur [siteName]
(repo `[repoOwner]/[repoName]`, branche `main`). Aucun brouillon : l'article complet en une passe, ou rien.

# 0 — Lecture obligatoire (avant la moindre ligne)
PROGRESS.md · niche.config.ts · DECISIONS.md · CLAUDE.md ·
skills/seo-geo-redaction · docs/IMAGES-WORKFLOW.md · docs/AUTHOR-[authorSlug].md ·
content/ton-of-voice.md · content/mots-cles.md · content/concurrents.md · content/faq-base.md ·
content/calendrier-edito.md · content/priorites-geo.md (briefs MentionLab, s'il existe) ·
skills/humaniser-fr (mode production).
Si locales.length >= 2 : skills/seo-geo-redaction/references/mirror-i18n.md.
Toute règle modifiée depuis le dernier run l'emporte.

# 1 — Choisir UN sujet — MODÈLE MENTION (⅔ marques-modèles / ⅓ info)
Priorité : si content/priorites-geo.md a un brief NON coché (gap mesuré MentionLab) → le traiter.
Sinon : lister les articles publiés, choisir une catégorie sous-couverte + intention non couverte. UN seul sujet.
RÈGLE DE SÉLECTION (cf. seo-geo-redaction) :
  - ~⅔ = sujets à MARQUES/MODÈLES (le cœur des mentions) : comparatifs cross-marques, intra-marque,
    « X vs Y », et surtout **« meilleurs X pour [persona/usage] »** (long-tail, anti-cannibalisation). ≥ 2 marques citées.
  - ~⅓ = informationnel utile (comment / pourquoi / qu'est-ce que / prix / définition).
ANTI-CANNIBALISATION (cf. CLAUDE.md « Classements ») : un seul propriétaire par requête EXACTE.
  - NE PAS dupliquer le **head nu** déjà pris par un asset : « les meilleurs X / top X » → page /classement ;
    « comparer X » (outil côte à côte) → /comparer ; « quel X choisir » → /choisir.
  - Le blog cible les **variantes persona/long-tail** (« meilleurs X pour [persona] ») et les **face-à-face** (« X vs Y »),
    et **maille vers** le classement/comparateur du cluster. Varier le persona d'un article à l'autre.

# 2 — SERP analysis OBLIGATOIRE (non-skippable)
WebSearch sur le head term → top 3 Google.[market_tld] (titre, chapô, longueur, H2, FAQ ?, tableau ?).
Content gap documenté. Pas de SERP = run échoué. Si la requête visée est EXACTEMENT le head nu d'un asset existant
(classement/comparateur), requalifier en variante persona/long-tail ou face-à-face.

# 3 — Brief (interne) : cluster, head term, longue traîne, persona, intention, format, longueur, content gap, sources, FAQ, JSON-LD, **marques/modèles à citer (≥ 2)**.

# 4 — Outline (H1/H2/H3 sans corps). H1 <= 60 car., head term en tête. Chapô 40-60 mots. TL;DR 3-5 bullets.
>= 70 % des H2 en QUESTION stricte. FAQ-bloc finale 6-7 questions.

# 5 — Rédaction FR (humaniser-fr). Voix [authorName]. Answer-Explanation-Example par H2. ≥ 3 signaux d'Expérience.
≥ 2 marques/modèles cités, traités factuellement (jamais de promo creuse). Sources datées .[market_tld].
≥ 1 tableau comparatif si comparaison. Année via currentYear() — JAMAIS d'année en dur dans titre/frontmatter.

# 6 — Frontmatter MDX : title (head term, SANS année — la marque est ajoutée par le template), description (140-155 car.),
slug (kebab, head term, SANS année), category, author, publishedAt, readingTimeMin, tldr[], faq[] (6-7), related[] (2-4),
featureImage + featureImageAlt (fr + locales), **tags marques/modèles + persona** (inventaire de mentions). PAS d'élément affilié.

# 7 — Images (cf. docs/IMAGES-WORKFLOW.md) : 1 cover GÉNÉRÉ + 2 in-content RÉUTILISÉES.
Cover : generate_image (prompt <= 20 mots, finir par « no text no logos no watermark »), 16:9 → wait_for_image,
retry une fois en `[slug]-cover-v2`, échec → skip + log « Bloqué ». Push sous public/blog/[categorie]/[slug]/. Renseigner featureImage.
2 <ArticleImage> réutilisées (`/images/categories/[cat].webp`, `/images/blog/category-[cat].webp`) à ~1/3 et ~2/3, alt toutes locales. Rien à générer de plus.

# 8 — Miroir des langues (si locales.length >= 2) : traduire dans TOUTES les locales + alt traduits. Si une trad bloque, ne pousse RIEN.
# 9 — Mapping i18n (si locales.length >= 2) : ajouter le couple dans lib/i18n/article-slugs.ts.
# 10 — Commit atomique : tous les MDX + mapping en UN commit (cover déjà poussé). feat(content): publish [slug] (locales: [...]).
# 11 — Calendrier + PROGRESS : cocher le sujet (+ le brief priorites-geo si applicable), entrée PROGRESS (slug, cat, head term, marques citées, commit, coût 1 cover).

# 12 — Hard rules
- JAMAIS publier sans SERP analysis (étape 2).
- AUCUN élément affilié (modèle mention) ; ≥ 2 marques/modèles cités + tagués ; persona tagué.
- Anti-cannibalisation : NE JAMAIS dupliquer le **head nu** d'un asset (« les meilleurs X / top X » = classement,
  « comparer X » = comparateur, « quel X choisir » = choisir). Les comparatifs **persona/long-tail** et **« X vs Y »** sont OK et souhaités ; mailler vers l'asset.
- Le « trop-informationnel sans marque » (how-to pur, zéro marque) limité à ⅓ max.
- JAMAIS un seul locale si miroir strict actif. JAMAIS d'année en dur. UNE SEULE image générée (cover).
- TOUJOURS alt dans toutes les locales · sources datées · >= 70 % H2 en question · >= 3 signaux d'Expérience.

# 13 — Si le run échoue : ne pousse RIEN, log « Bloqué » dans PROGRESS, fin propre.
# 14 — Output final (8-12 lignes) : slug(s) ou échec + raison · cat · head term · marques citées · mots · commit · coût image.
```

## Pourquoi ce gabarit

- **Modèle mention** : ⅔ sujets à marques/modèles (dont « meilleurs X pour [persona] ») = inventaire de mentions vendable ; ⅓ info. Pas d'affiliation.
- **Anti-cannibalisation par spécificité** : le classement possède le head nu ; le blog les variantes persona/long-tail + face-à-face. Un seul propriétaire par requête exacte.
- **SERP-first** · **GEO 2026** (Answer-Explanation-Example + Expérience) · **images économes** (1 cover + 2 réemplois) · **miroir conditionnel** · **année dynamique**.
