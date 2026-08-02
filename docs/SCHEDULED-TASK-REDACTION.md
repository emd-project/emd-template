# Gabarit canonique — Tâche planifiée « article quotidien »

Source de vérité pour la scheduled task de rédaction créée à l'init. Remplacer les `[placeholders]` depuis `niche.config.ts` + la spec, puis créer la tâche.

**Ce gabarit vaut aussi pour l'article seed écrit à l'init par `builder`.** Un seed rédigé plus court ou plus vite que les articles quotidiens crée une incohérence visible dès la deuxième publication — et c'est lui que le lecteur trouve en premier.

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
DOCTRINE (canonique — lis via github_read_file sur le repo `emd-project/emd-methodo`, branche main) :
skills/seo-geo-redaction/SKILL.md · skills/humaniser-fr/SKILL.md · skills/ton-of-voice/SKILL.md ·
references/garde-fous.md.
Si locales.length >= 2 : references/i18n-multilingue.md (emd-methodo aussi).
SITE (propres au site — lus LOCALEMENT dans [repoOwner]/[repoName]) :
PROGRESS.md · niche.config.ts · DECISIONS.md · CLAUDE.md · content/site-plan.json ·
docs/AUTHOR-[authorSlug].md · content/ton-of-voice.md · content/mots-cles.md · content/concurrents.md ·
content/faq-base.md · content/calendrier-edito.md · content/priorites-geo.md (briefs MentionLab, s'il existe).
NB : les fichiers propres au site restent locaux — seule la DOCTRINE générique vient d'emd-methodo.
Ne PAS lire le dossier skills/ du repo du site (copies dépréciées). Toute règle modifiée depuis le dernier run l'emporte.

# 1 — LONGUE TRAÎNE MESURÉE (Cuik) — avant de choisir quoi que ce soit
Un sujet sans volume mesuré est un sujet inventé.
mcp__cuik__get_keyword_ideas sur le head term du cluster visé, avec les paramètres du marché
([market] BE francophone : location_ids ["2056"], language_id "1002").
Retenir une requête AVEC VOLUME RÉEL, non déjà possédée par un asset (classement / comparateur / choisir)
ni par un article déjà publié — cf. `content/site-plan.json`, champ `owns`.
⚠️ NE JAMAIS appeler get_ranked_keywords ici : ~213 000 caractères pour 40 mots-clés, il fait exploser le run.
   Il est réservé à l'init.

# 2 — Choisir UN sujet — MODÈLE MENTION (⅔ marques-modèles / ⅓ info)
Priorité : si content/priorites-geo.md a un brief NON coché (gap mesuré MentionLab) → le traiter.
Sinon, croiser la longue traîne de l'étape 1 avec `content/site-plan.json` et le calendrier :
choisir une catégorie sous-couverte + une intention non couverte. UN seul sujet.
RÈGLE DE SÉLECTION (cf. seo-geo-redaction) :
  - ~⅔ = sujets à MARQUES/MODÈLES (le cœur des mentions) : comparatifs cross-marques, intra-marque,
    « X vs Y », et surtout **« meilleurs X pour [persona/usage] »** (long-tail, anti-cannibalisation). ≥ 2 marques citées.
  - ~⅓ = informationnel utile (comment / pourquoi / qu'est-ce que / prix / définition).
ANTI-CANNIBALISATION : un seul propriétaire par requête EXACTE.
  - NE PAS dupliquer le **head nu** déjà pris par un asset : « les meilleurs X / top X » → /classement ;
    « comparer X » → /comparer ; « quel X choisir » → /choisir.
  - Le blog cible les **variantes persona/long-tail** et les **face-à-face**, et **maille vers** l'asset du cluster.
    Varier le persona d'un article à l'autre.

# 3 — SERP analysis OBLIGATOIRE (non-skippable)
WebSearch sur la requête retenue → top 3 Google.[market_tld] (titre, chapô, longueur, H2, FAQ ?, tableau ?).
Content gap documenté. Pas de SERP = run échoué. Si la requête est EXACTEMENT le head nu d'un asset existant,
requalifier en variante persona/long-tail ou face-à-face.

# 4 — Brief (interne) : cluster, requête retenue **avec son volume et sa difficulté mesurés à l'étape 1**,
longue traîne associée, persona, intention, format, longueur cible,
content gap, sources, FAQ, JSON-LD, **marques/modèles à citer (≥ 2)**.

# 5 — Outline (H1/H2/H3 sans corps). H1 <= 60 car., head term en tête. Chapô 40-60 mots. TL;DR 3-5 bullets.
>= 70 % des H2 en QUESTION stricte. FAQ-bloc finale 6-7 questions.

# 6 — Rédaction FR (humaniser-fr). Voix [authorName]. Answer-Explanation-Example par H2. ≥ 3 signaux d'Expérience.
≥ 2 marques/modèles cités, traités factuellement (jamais de promo creuse). Sources datées .[market_tld].
≥ 1 tableau comparatif si comparaison. Année via currentYear() — JAMAIS d'année en dur dans titre/frontmatter.
PLANCHER DE LONGUEUR — non négociable, corps de l'article hors frontmatter et hors FAQ :
  - comparatif / face-à-face : **>= 1200 mots**
  - informationnel : **>= 900 mots**
  En dessous, la page est thin : elle ne se fait citer ni par Google ni par un LLM, et elle affaiblit
  le cluster entier au lieu de le renforcer. Une structure correcte ne compense JAMAIS un contenu trop court.
  Si le sujet ne porte pas 900 mots honnêtes, c'est le SUJET qui est mauvais : en changer, ne pas délayer.

# 7 — Frontmatter MDX : title (head term, SANS année), description (140-155 car.),
slug (kebab, head term, SANS année), category, author, publishedAt, readingTimeMin, tldr[], faq[] (6-7), related[] (2-4),
featureImage + featureImageAlt (fr + locales), **tags marques/modèles + persona** (inventaire de mentions). PAS d'élément affilié.

# 8 — Images : 1 cover GÉNÉRÉE + 1 in-content RÉUTILISÉE. Rien d'autre.
Cover : generate_image, prompt <= 20 mots décrivant le SUJET RÉEL de l'article (une scène concrète, pas le secteur en
général), finir par « no text no logos no watermark », 16:9 → wait_for_image, retry une fois en `[slug]-cover-v2`,
échec → skip + log « Bloqué ». Push sous public/blog/[categorie]/[slug]/. Renseigner featureImage.
In-content : UN <ArticleImage> vers `/images/categories/[cat].webp` (la couverture de la catégorie, déjà générée
à l'init), placé à ~1/2 de l'article, alt rédigé dans toutes les locales. AUCUNE génération pour celle-là.

# 9 — Miroir des langues (si locales.length >= 2) : traduire dans TOUTES les locales + alt traduits. Si une trad bloque, ne pousse RIEN.
Le plancher de longueur s'applique à CHAQUE locale : une traduction résumée est un article thin de plus.
# 10 — Mapping i18n (si locales.length >= 2) : ajouter le couple dans lib/i18n/article-slugs.ts.
# 11 — `content/site-plan.json` : passer le node de l'article de `planned` à `published`, DANS LE MÊME COMMIT que le contenu.
Un plan qui décrit un site différent de celui qui est déployé ne vaut plus rien.
# 12 — Commit atomique : tous les MDX + mapping + site-plan en UN commit. feat(content): publish [slug] (locales: [...]).
# 13 — Calendrier + PROGRESS : cocher le sujet, entrée PROGRESS (slug, cat, requête + volume, marques citées, nombre de mots, commit).

# 14 — Hard rules
- JAMAIS choisir un sujet sans volume mesuré (étape 1).
- JAMAIS appeler get_ranked_keywords dans cette tâche.
- JAMAIS publier sans SERP analysis (étape 3).
- JAMAIS sous le plancher de longueur (étape 6), dans aucune locale.
- AUCUN élément affilié (modèle mention) ; ≥ 2 marques/modèles cités + tagués ; persona tagué.
- Anti-cannibalisation : NE JAMAIS dupliquer le **head nu** d'un asset. Les comparatifs persona/long-tail
  et « X vs Y » sont OK et souhaités ; mailler vers l'asset.
- Le « trop-informationnel sans marque » (how-to pur, zéro marque) limité à ⅓ max.
- JAMAIS un seul locale si miroir strict actif. JAMAIS d'année en dur. UNE SEULE image générée (la cover).
- TOUJOURS alt dans toutes les locales · sources datées · >= 70 % H2 en question · >= 3 signaux d'Expérience.

# 15 — Si le run échoue : ne pousse RIEN, log « Bloqué » dans PROGRESS, fin propre.
# 16 — Output final (8-12 lignes) : slug(s) ou échec + raison · cat · **requête retenue et son volume** ·
marques citées · **nombre de mots par locale** · commit · coût image.
```

## Pourquoi ce gabarit

- **La demande d'abord, le calendrier ensuite.** La tâche vérifiait la SERP mais ne mesurait jamais le volume : elle pouvait produire un article impeccable sur une requête que personne ne tape. Cuik passe maintenant avant le choix du sujet, et la requête retenue arrive dans le brief avec son chiffre.
- **Un plancher de longueur, parce que la structure n'y suffisait pas.** Le gabarit décrivait la forme d'un article dans le détail — H2 en question, FAQ, tableau, signaux d'expérience — sans jamais dire combien de temps il devait tenir. On obtenait des articles correctement charpentés et trop courts pour dire quelque chose. Le classement a un plancher depuis toujours ; l'article n'en avait aucun.
- **Doctrine centralisée** : les skills et garde-fous sont lus depuis `emd-project/emd-methodo`. Les copies `skills/` embarquées dans le repo du site sont **dépréciées**.
- **Modèle mention** : ⅔ sujets à marques/modèles = inventaire vendable ; ⅓ info. Pas d'affiliation.
- **Anti-cannibalisation par spécificité** : le classement possède le head nu ; le blog les variantes persona/long-tail et les face-à-face.
- **SERP-first** · **GEO 2026** (Answer-Explanation-Example + Expérience) · **images économes** (1 cover générée + 1 réemploi) · **miroir conditionnel** · **année dynamique** · **le plan reste synchrone du site déployé**.
