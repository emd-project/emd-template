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

# 0bis — UN CLASSEMENT PAR SEMAINE (court-circuite tout le reste)
Lis `content/site-plan.json` et `PROGRESS.md`, puis tranche AVANT de chercher un sujet d'article :
  - reste-t-il un asset `type: "classement"` en `status: "planned"` ?
  - un classement a-t-il déjà été publié il y a MOINS de 7 jours ?

→ **Il en reste un ET rien depuis 7 jours : tu publies LE CLASSEMENT aujourd'hui, À LA PLACE de l'article.**
  Prends celui de plus haute `priority`. Saute les étapes 1 à 7 et applique la section « CLASSEMENT » ci-dessous.
→ **Sinon : article normal**, continue à l'étape 1.

Quand tous les classements du plan sont `published`, cette règle s'éteint d'elle-même. Aucune intervention nécessaire.

## CLASSEMENT — quoi produire
Tout le contenu vit dans `content/data/classements.json` (+ `.en.json`). Le composant lit le JSON : ne touche jamais au template.
- **Top 5 à 8 items RÉELS**, issus d'une recherche SERP dédiée + Cuik. `rank`, `nom`, `score`/100, `badge`/`bestFor`, `verdict`, `pros`/`cons`, `prix`, `url` (lien NEUTRE vers la source officielle, jamais affilié).
- **< 5 items crédibles sur le marché belge → NE PUBLIE PAS.** Repasse le node en `planned`, note-le dans PROGRESS, et fais l'article du jour à la place. Un classement à trois items est plus faible qu'un classement absent.
- **≥ 1000 mots** : `excerpt` (≤ 160 c) + `intro` answer-first + `tldr` 3-5 puces + `sections` 3-5 blocs dont le `q` est un **H2 en question** + `criteria` + `methodology` + `sources` datées + `faq` 6-7.
- **Miroir EN strict** dans `classements.en.json`, même plancher de mots.
- **JSON-LD** : `ItemList` + `FAQPage` + `BreadcrumbList`.
- **Liens sortants** : ≥ 2 liens d'AUTORITÉ en dofollow. Lien produit uniquement si le produit s'achète en ligne, en nofollow.
- **Images** : réutilise la couverture de la catégorie du cluster. **Aucune génération pour un classement.**

## CLASSEMENT — enrichir les dérivés au passage
Si le classement publié est un **classement de SEGMENT** (pas un intra-marque) :
- ajoute sa famille à `content/data/comparateurs.json` (+ `.en`) : `modeles` = ses items, `specsLabels` = ses `criteria`, `prix` en number, `sourceUrl` neutre ;
- ajoute son entrée à `content/data/choisir.json` : `tldr` + `sections` + `faq` repris du classement.

Un **intra-marque** n'alimente NI le comparateur NI `/choisir` : comparer les modèles d'une même marque côte à côte, c'est déjà ce que fait le classement.

## CLASSEMENT — publication
Passe le node de `planned` à `published` dans `content/site-plan.json`, **dans le même commit** que les données. Entrée PROGRESS : slug, nb d'items, nb de mots FR/EN, marques citées, date. Commit : `feat(content): publish ranking [slug] (locales: [...])`.

# 1 — LONGUE TRAÎNE MESURÉE (Cuik) — avant de choisir quoi que ce soit
Un sujet sans volume mesuré est un sujet inventé.
mcp__cuik__get_keyword_ideas sur le head term du cluster visé, avec les paramètres du marché
([market] BE francophone : location_ids ["2056"], language_id "1002").
Retenir une requête AVEC VOLUME RÉEL, non déjà possédée par un asset (classement / comparateur / choisir)
ni par un article déjà publié — cf. `content/site-plan.json`, champ `owns`.
⚠️ NE JAMAIS appeler get_ranked_keywords ici : ~213 000 caractères pour 40 mots-clés, il fait exploser le run.
   Il est réservé à l'init.

# 2 — Choisir UN sujet — MODÈLE MENTION (½ marques-modèles / ¼ evergreen pratique / ¼ info)
Priorité : si content/priorites-geo.md a un brief NON coché (gap mesuré MentionLab) → le traiter.
Sinon, croiser la longue traîne de l'étape 1 avec `content/site-plan.json` et le calendrier :
choisir une catégorie sous-couverte + une intention non couverte. UN seul sujet.
RÈGLE DE SÉLECTION — ½ / ¼ / ¼ :
  - **½ = sujets à MARQUES/MODÈLES** (le cœur des mentions) : comparatifs cross-marques, intra-marque,
    « X vs Y », et surtout **« meilleurs X pour [persona/usage] »**. ≥ 2 marques citées.
  - **¼ = EVERGREEN PRATIQUE** : procédures, entretien, démarches — « comment atténuer une rayure »,
    « comment résilier », « que faire après un sinistre », « à quelle fréquence changer ».
    Peu disputé, durable, et c'est le format que les LLM citent le plus volontiers. C'est aussi là que les
    marques de PRODUITS apparaissent naturellement : un article sur les rayures cite Meguiar's, 3M, Turtle Wax.
    Second inventaire de mentions, pas un renoncement au premier.
  - **¼ = informationnel** : définitions, prix, « pourquoi », « qu'est-ce que ».
  Regarde ce qui est déjà publié avant de choisir : l'ancienne règle ⅔/⅓ a produit des sites où presque
  tous les articles étaient des comparatifs déclinés par persona, donc interchangeables. Rééquilibre.
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
LIENS SORTANTS — deux natures, à ne jamais confondre :
  - **Liens d'AUTORITÉ : ≥ 2 par article, en dofollow normal.** Source officielle, régulateur, administration,
    Wikipédia, documentation constructeur, étude datée. Une page qui ne cite personne a l'air d'une page qui ne
    sait rien — et un lien vers une source solide est un signal de qualité, pas une fuite de trafic.
    NE PAS leur mettre `nofollow` : ce serait se priver du signal tout en gardant le lien.
  - **Liens PRODUIT : uniquement si le produit s'achète en ligne**, et seulement là où ça rend service au lecteur
    (un evergreen pratique « quel kit pour une rayure », un classement de produits). Vers la fiche marchand ou la
    page officielle, en `rel="noopener noreferrer nofollow"`. **Aucune affiliation, aucun tag, aucun prix barré,
    aucun compte à rebours.** Sur un comparatif de modèles de voitures, le lien utile est la fiche constructeur,
    pas un marchand.
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
- ≥ 2 liens d'AUTORITÉ en dofollow (source officielle, régulateur, Wikipédia, constructeur, étude datée).
- Lien produit UNIQUEMENT si le produit s'achète en ligne, en nofollow, sans affiliation.
- Anti-cannibalisation : NE JAMAIS dupliquer le **head nu** d'un asset. Les comparatifs persona/long-tail
  et « X vs Y » sont OK et souhaités ; mailler vers l'asset.
- Respecter la répartition ½ comparatifs / ¼ evergreen pratique / ¼ informationnel, en regardant ce qui est déjà publié.
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
- **Modèle mention, sur deux inventaires.** ½ comparatifs de marques et de modèles ; ¼ evergreen pratique, où ce sont les marques de PRODUITS qui surgissent — un article sur la réparation d'une rayure cite trois fabricants aussi naturellement qu'un comparatif cite trois constructeurs. Pas d'affiliation, jamais.
- **Lier vers l'extérieur est un signal, pas un risque.** La consigne « aucune affiliation » avait fini par produire des articles qui ne citaient personne. Un lien vers une source officielle en dofollow vaut mieux que pas de lien ; un lien marchand se justifie par l'utilité, en nofollow, et seulement quand le produit s'achète en ligne.
- **Anti-cannibalisation par spécificité** : le classement possède le head nu ; le blog les variantes persona/long-tail et les face-à-face.
- **SERP-first** · **GEO 2026** (Answer-Explanation-Example + Expérience) · **images économes** (1 cover générée + 1 réemploi) · **miroir conditionnel** · **année dynamique** · **le plan reste synchrone du site déployé**.
- **Un classement par semaine, pas quatre le premier jour.** Les classements sont les pages les plus citables du site et les plus lourdes à produire — quatre en FR et EN, c'était onze mille mots avant la mise en ligne. Un seul part à l'init, les autres sortent au rythme d'un par semaine, à la place de l'article du jour. La règle s'éteint seule quand le plan est épuisé.
