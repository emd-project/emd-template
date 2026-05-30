# Guide de personnalisation par site

Checklist des modifications à faire sur un nouveau repo forké du template `emd-template`. La plupart du travail éditorial passe par les Skills (auto-déclenchés) ; ce qui reste manuel est ci-dessous.

Le workflow officiel :

1. **Use this template** sur GitHub (pas un fork) → nouveau repo propre.
2. Cloner localement, `npm install`, `npm run dev`.
3. **Lancer `init-site`** dès la première session Claude sur le repo. Le skill orchestre l'interview groupé qui remplit en une passe tous les fichiers de config éditoriaux (voix, mots-clés, calendrier, concurrents, FAQ, mentions légales, personas, auteur). 15-25 minutes de discussion, et le site est configuré côté contenu.
4. Suivre la checklist ci-dessous pour ce qui reste manuel (config technique, identité visuelle, déploiement).

---

## Étape 1 — Bootstrap éditorial via `init-site`

À la première session Claude sur le nouveau repo, taper *"initialise ce site"* (ou *"configure le repo"*, *"setup le site"*). Le skill `init-site` audite l'état des fichiers `content/` et déroule un interview en 7 blocs :

1. **Voix éditoriale** → écrit `content/ton-of-voice.md` (8 questions, délègue à `ton-of-voice` en mode définition)
2. **Mots-clés** → écrit `content/mots-cles.md` (import Semrush prioritaire si dispo, sinon interview 6 questions)
3. **Calendrier éditorial** → écrit `content/calendrier-edito.md` (cadence, formats, saisonnalité, refresh)
4. **Concurrents** → écrit `content/concurrents.md` (directs, indirects, gaps, anti-modèles)
5. **FAQ base** → écrit `content/faq-base.md` (Q-R réutilisables cross-articles)
6. **Mentions légales** → écrit `content/pages/mentions-legales.yaml` (éditeur, hébergeur, contact, RGPD, cookies)
7. **Personas** → écrit `content/personas.md` (2-4 archétypes : situation, vocabulaire, questions par étape de funnel)
8. **Auteur(s)** → écrit `docs/AUTHOR-[slug].md` pour chaque auteur signé (optionnel, dépend du site)

Le skill conduit les blocs un par un et l'utilisateur répond en bloc unique. Économie de tokens vs interview question par question.

Pour redéclencher l'interview sur un seul bloc (ex : refaire le calendrier édito 6 mois après) : supprimer le fichier concerné OU y remettre un `TODO` puis relancer `init-site`. Le skill détecte les fichiers non définis et propose de les recompléter.

## Étape 2 — Configuration technique (`niche.config.ts`)

C'est le SEUL fichier de configuration technique éditable. Remplir au minimum :

- `siteName`, `domain`, `tagline`
- `entity`, `entities`, `entityVerb`, `dealWord` (vocabulaire de la niche)
- `heroPrefix`, `heroSuffix`, `rotatingWords`, `subtitle`
- `categories` (1 à 5 catégories minimum, cohérent avec les clusters définis dans `content/mots-cles.md`)
- `palette` (5 accents + 3 backgrounds + 3 textes) ou les laisser et les écraser via Claude Design
- `fonts.display`, `fonts.body` (Google Fonts)
- `logo` (texte du logo)
- `affiliateTag` (tag Amazon)
- `repo` (« org/repo » du nouveau site)
- `branch` (en général `main`)
- `signature` (anchor, oneRule, inspiration, forbidden — clé anti-IA visuelle)

Les champs `author.*` peuvent rester vides si tu utilises `content/ton-of-voice.md` (voix générique du site).

## Étape 3 — Identité visuelle (si pas de Claude Design)

Si tu as des outputs Claude Design à intégrer : les coller dans `design-incoming/` et lancer le skill `integrate-claude-design`.

Sinon, modifier à la main :

- `app/layout.tsx` : fonts Google (`next/font`), `metadataBase`, `title.default`, `description`.
- `app/globals.css` : variables `:root` (couleurs, radii, shadows). Voir `docs/DA-PRESETS.md` pour les helpers.
- `app/admin/layout.tsx` : couleurs du sidebar admin pour matcher la palette.
- `components/layout/Nav.tsx` et `components/layout/Footer.tsx` : logo, liens.

## Étape 4 — Contenu d'amorçage technique

Au-delà de ce que `init-site` remplit, quelques fichiers de pages restent à compléter manuellement (ils dépendent de la structure UI du template, pas de la stratégie éditoriale) :

- `content/settings.yaml` : `siteName`, `siteDescription`, `siteUrl`, structure de navigation.
- `content/pages/home.yaml` : eyebrow, h1_prefix/suffix, rotating_words, subtitle, CTAs, tools section.
- `content/pages/deals.yaml` : titres + bandeau défilant + disclaimer affiliation (reformulé pour CE site).
- `content/pages/comparer.yaml` : titres.
- Au moins 1 article de test dans `content/articles/` pour valider le build blog.

## Étape 5 — SEO technique par site

- `app/sitemap.ts` : domaine.
- `app/robots.ts` : domaine, ne PAS bloquer les crawlers IA majeurs (GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended) — cf. `seo-geo-redaction` Étape 8.2.
- `app/opengraph-image.tsx` : couleurs et fonts si custom.
- `public/llms.txt` : fichier d'index pour crawlers LLM, généré automatiquement par `init-site` à partir de `content/settings.yaml` et premiers articles. À tenir à jour quand les pages prioritaires changent.
- Vérifier que `niche.config.ts → vercelRegion` est sur la bonne région (fra1 par défaut).

## Étape 6 — Affiliation

- `niche.config.ts` → `affiliateTag` : tag Amazon du site.
- Vérifier que `lib/utils/affiliate.ts` lit bien ce tag (devrait être auto).
- Disclosure affiliation : champ `affiliate_disclaimer` dans `content/pages/*.yaml` (à reformuler pour CHAQUE site, anti-footprint SEO — le skill `humaniser-fr` catégorie G5 gère ça).

## Étape 7 — Auteur(s) signé(s)

Si tu signes les articles d'un nom propre (Mathias Cetani / Sophie Lambert / etc.), `init-site` a déjà créé `docs/AUTHOR-[slug].md`. Reste à créer côté CMS la fiche correspondante :

- `content/authors/[slug].yaml` (nom, slug, bio courte, photo, sameAs LinkedIn / Twitter)
- Référencer le slug dans les articles MDX via le champ `authorSlug`

Voir `docs/AUTHOR-template.md` pour la structure du fichier auteur.

## Étape 8 — Variables d'environnement Vercel

```
CMS_SECRET=<openssl rand -hex 32>
CMS_GITHUB_TOKEN=<PAT GitHub avec accès au nouveau repo, scope: repo>
BLOB_READ_WRITE_TOKEN=<auto via Vercel Blob store>
GITHUB_CMS_CLIENT_ID=<OAuth App du site (optionnel)>
GITHUB_CMS_CLIENT_SECRET=<secret OAuth (optionnel)>
CMS_ALLOWED_USERS=<username GitHub admin>
BFL_API_KEY=<clé Flux pour génération d'images (optionnel — sinon nano-banana via MCP)>
GEMINI_API_KEY=<clé Gemini si génération d'images via nano-banana>
```

Créer aussi un Vercel Blob store (Storage > Blob > Public access) — le `BLOB_READ_WRITE_TOKEN` se crée automatiquement.

## Étape 9 — Vérifications avant premier déploiement

- [ ] `npm run build` passe sans erreur.
- [ ] `npm run type-check` passe.
- [ ] Au moins 1 article test build correctement et est affiché sur `/blog`.
- [ ] CMS accessible sur `/admin`.
- [ ] Tous les fichiers de `content/` configurés par `init-site` sont remplis (plus de TODO).
- [ ] `public/llms.txt` généré et à jour.
- [ ] `robots.txt` n'interdit AUCUN crawler IA (GPTBot, ClaudeBot, etc.).
- [ ] Aucune mention résiduelle du domaine ou du nom du site source dans le code (sauf `content/`).
- [ ] Liens affiliés Amazon testés : clic via `<AffiliateLink>` retourne le bon tag.
- [ ] Affiliate disclaimer reformulé pour CE site (différent des autres sites de la galaxie).

## Ce qu'on NE touche PAS

Ces dossiers sont identiques pour tous les sites enfants :

```
packages/cms/              ← CMS complet (auth, CRUD, media, users, WYSIWYG)
app/admin/                 ← Pages admin (sauf couleurs layout)
app/api/cms/               ← API routes CMS
scripts/upload-blob.ts     ← Script upload images
middleware.ts              ← Passthrough CSP / headers
lib/cms-pages.ts           ← Helper lecture pages YAML
skills/                    ← Skills auto-déclenchés (sauf si tu en ajoutes des spécifiques au site)
```

Des modifications dans ces dossiers cassent la portabilité entre sites du réseau.
