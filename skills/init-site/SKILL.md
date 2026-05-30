---
name: init-site
version: 2.0.0
description: Bootstrap d'un nouveau site forké du template emd-template. Lance UN SEUL interview groupé par blocs thématiques en commençant par le Bloc 0 (marché géo + langues), puis les autres blocs (voix, mots-clés, calendrier, concurrents, FAQ, mentions, auteur). Écrit tous les fichiers en une seule passe, y compris niche.config.ts.locales/defaultLocale/market/localePrefix qui pilotent toute l'architecture i18n du site. À utiliser une fois après "Use this template" sur GitHub. Triggers explicites — « initialise ce site », « configure ce site », « setup le site », « init-site », « bootstrap le site », « lance la conf », « première configuration ». Trigger implicite — si l'utilisateur demande sa première rédaction sur un site visiblement non configuré (≥ 2 fichiers content/ avec TODO ou niche.config.ts.market vide), proposer init-site AVANT de lancer ton-of-voice seul.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# init-site — Bootstrap d'un nouveau site forké

Ce skill remplit en une seule passe tous les fichiers de configuration éditoriale du site forké. Économise des tokens vs déclencher ton-of-voice + 4 autres skills séparément, et garantit la cohérence entre les fichiers (audience définie une fois, réutilisée partout, **locales + marché géo définis AVANT tout**).

## Étape 0 — Audit de l'état actuel

Avant tout interview, lire l'état de chaque fichier-cible :

| Fichier | Statut « non défini » si… |
|---|---|
| `niche.config.ts` | `locales`, `defaultLocale`, `market` absents ou avec valeur placeholder (`'TODO'`, `''`) |
| `content/ton-of-voice.md` | absent OU contient ≥ 1 `TODO` |
| `content/mots-cles.md` | absent OU contient ≥ 1 `TODO` |
| `content/calendrier-edito.md` | absent OU contient ≥ 1 `TODO` |
| `content/concurrents.md` | absent OU contient ≥ 1 `TODO` |
| `content/faq-base.md` | absent OU contient ≥ 1 `TODO` |
| `content/pages/mentions-legales.yaml` | absent OU contient ≥ 1 `TODO` |
| `docs/AUTHOR-[slug].md` | optionnel — proposé seulement si l'utilisateur signe ses articles d'un nom propre |

Annoncer à l'utilisateur le bilan :

> J'ai audité l'état du site. Voici ce qu'il reste à définir : [liste]. Je vais te poser les questions par blocs thématiques, en commençant par les **langues et le marché** (Bloc 0) qui conditionnent toute la suite. ~5-10 minutes au total.

Si TOUT est déjà rempli (zéro TODO + niche.config.ts.market défini), informer et sortir.

---

## Bloc 0 — Langues et marché géo (NOUVEAU, OBLIGATOIRE EN PREMIER)

**Pourquoi ce bloc en premier** : la réponse pilote toute l'architecture du site — routing Next.js (`app/page.tsx` vs `app/[locale]/...`), middleware i18n, hreflang, sitemap, frontmatter MDX, sélecteur de langue, schema.org, OG locale, devise par défaut. Coder le reste avant d'avoir cette réponse = refactor lourd garanti.

### Q0.1 — Pays cible principal ?

> Quel est le **marché géographique principal** du site ? (Détermine OG locale, devise, schema.org addressCountry, références institutionnelles citées par seo-geo-redaction.)

| Option | Code | Conséquences |
|---|---|---|
| 🇧🇪 Belgique | `BE` | OG `fr_BE`, devise `EUR`, références FSMA/BNB/Test-Achats |
| 🇫🇷 France | `FR` | OG `fr_FR`, devise `EUR`, références ACPR/AMF/UFC-Que Choisir |
| 🇨🇦 Canada | `CA` | OG `fr_CA`, devise `CAD`, références AMF Québec |
| 🇨🇭 Suisse | `CH` | OG `fr_CH`, devise `CHF`, références FINMA/SECO |
| Autre | (libre) | À préciser : code ISO pays, devise, régulateur principal |

→ Écrit dans `niche.config.ts → market: 'BE' | 'FR' | 'CA' | 'CH' | string`

### Q0.2 — Combien de langues sur le site ?

> Combien de langues va supporter le site, dans l'ordre de priorité éditoriale ?

**Présets** (si marché = BE) :
- `FR` seul (mono-langue, marché FR-BE)
- `FR + EN`
- `FR + NL`
- `FR + EN + NL`
- `FR + NL + DE + EN`
- Autre (préciser les codes ISO)

**Présets** (si marché = FR / CA / CH) :
- `FR` seul (mono-langue)
- `FR + EN`
- Autre

→ Écrit dans `niche.config.ts → locales: [...]` + `defaultLocale: 'fr'`

### Q0.3 — (Conditionnelle, si N ≥ 2) Variation de voix par langue ?

> La voix éditoriale change-t-elle selon la langue, ou c'est la même transposée ?

- **Voix unique transposée** (recommandé) — le ton FR est traduit tel quel en EN/NL. Une seule définition `content/ton-of-voice.md`, traduction au moment de la rédaction.
- **Voix adaptée par langue** — NL plus formel, EN plus direct, etc. Une définition par langue : `content/ton-of-voice.md`, `content/ton-of-voice.nl.md`, etc.

→ Détermine si on duplique `content/ton-of-voice.md` par langue ou pas.

### Conséquences automatiques (pas de question, écriture directe)

| Choix Q0.2 | Routing Next.js | localePrefix | Middleware i18n | Sélecteur langue |
|---|---|---|---|---|
| 1 langue | `app/page.tsx` direct | n/a | aucun | aucun |
| 2+ langues | `app/[locale]/...` | `'as-needed'` (default sans préfixe, autres sous segment) | `next-intl` middleware obligatoire | `<LangSwitcher>` dans header |

**Pourquoi `localePrefix: 'as-needed'`** : URLs courtes pour le marché principal (SEO optimal) + segments propres pour les autres locales. Recommandé par next-intl.

### Règle : miroir strict (NON-NÉGOCIABLE si N ≥ 2)

À partir du moment où `locales.length ≥ 2`, **tout est traduit dans toutes les locales**, sans exception :
- Articles blog (chaque article = N fichiers MDX dans `content/blog/[locale]/[categorie]/[slug].mdx`)
- Pages utilitaires (À propos, mentions légales, FAQ globale, contact, politique cookies)
- Composants UI (via `messages/[locale].json` ou dictionnaires serveur)
- Schema.org `inLanguage` + hreflang généré automatiquement par locale

Voir `skills/seo-geo-redaction/references/mirror-i18n.md` pour le détail technique.

Un visiteur en EN qui clique « À propos » ne doit JAMAIS tomber sur une page FR.

### Sortie immédiate du Bloc 0

À la fin de ce bloc, écrire `niche.config.ts` avec les champs corrects :

```ts
export const niche: NicheConfig = {
  // ...
  market: 'BE',                       // <- Q0.1
  defaultLocale: 'fr',                // <- première de locales
  locales: ['fr', 'en'],              // <- Q0.2
  localePrefix: 'as-needed',          // <- imposé si locales.length >= 2 ; omis sinon
  // ...
}
```

Puis annoncer à l'utilisateur :

> Marché et langues verrouillés. À partir d'ici, tous les fichiers seront créés en miroir dans les N langues, et le routing sera `[appliquer la convention selon Q0.2]`. On enchaîne avec la voix éditoriale.

---

## Étape 1 — Bloc voix et audience (alimente ton-of-voice.md)

Déléguer au skill `ton-of-voice` en mode définition (les 8 questions existantes).

**Cascade depuis Bloc 0** :
- Si Q0.3 = voix unique → un seul fichier `content/ton-of-voice.md` (traduit au runtime lors de la rédaction)
- Si Q0.3 = voix adaptée par langue → N fichiers `content/ton-of-voice.[locale].md`

Si déjà rempli, sauter ce bloc.

---

## Étape 2 — Bloc mots-clés (alimente mots-cles.md)

**Cascade depuis Bloc 0** : on demande UN seul set de mots-clés dans la langue principale. Les mots-clés des autres locales sont dérivés au moment de la rédaction (pas d'export Semrush par langue à l'init — trop lourd pour 90% des cas).

Annoncer :

> Pour les mots-clés, deux options : soit tu colles un export Semrush, soit on fait un mini-interview de 6 questions. Set unique en langue principale (`{defaultLocale}`) — la traduction se fait par article au moment de la rédaction. Tu as un export sous la main ?

### Cas A — Export Semrush fourni

1. Parser. Regrouper par thème sémantique en 3 à 5 **clusters**.
2. Pour chaque cluster : head term, longue traîne (< 1000 vol/mois), quick wins (KD ≤ 30), à éviter (KD > 60).
3. Demander à l'utilisateur de confirmer/ajuster.
4. Demander le positionnement global et les concurrents directs.
5. Écrire `content/mots-cles.md` + coller l'export brut dans la section « Export brut ».

### Cas B — Pas d'export Semrush

Poser 6 questions en bloc :

1. **Positionnement** — En une phrase, contre qui on se bat et auprès de qui on existe ?
2. **Clusters** — 3 à 5 silos. Pour chacun : nom + une phrase.
3. **Mots-clés piliers** — Un head term par cluster.
4. **Longue traîne** — 10-15 questions concrètes que l'audience tape réellement.
5. **Priorités 90 jours** — 5 à 10 requêtes réalistes.
6. **À éviter** — 3 à 5 intentions qu'on ne cible PAS et pourquoi.

Écrire `content/mots-cles.md`.

---

## Étape 3 — Bloc calendrier éditorial (alimente calendrier-edito.md)

Poser 5 questions en bloc :

1. **Cadence cible** et **cadence plancher**.
2. **Formats récurrents** — 3 à 6 formats canoniques (guide, comparatif, FAQ, news, retour d'expérience). Longueur cible + fréquence par format.
3. **Saisonnalité** — pics par bimestre.
4. **Rotation d'angles** — 4 à 6 angles.
5. **Refresh** — politique de mise à jour.

**Cascade depuis Bloc 0** : noter dans le fichier que chaque entrée du calendrier produit `locales.length` articles (un par langue, miroir strict).

Écrire `content/calendrier-edito.md`.

---

## Étape 4 — Bloc concurrents (alimente concurrents.md)

Poser 4 questions en bloc :

1. **Directs (3-5 max)** — URL, pourquoi direct, force, faiblesse.
2. **Indirects (3-5 max)** — forums, agrégateurs, comparateurs, sites de marques.
3. **Gaps** — où la SERP est faible.
4. **Anti-modèles** — 2 à 5 pratiques refusées.

**Cascade depuis Bloc 0** : un seul set FR. Les concurrents par locale sont notés ad hoc dans l'analyse SERP de chaque article si pertinent.

Écrire `content/concurrents.md`.

---

## Étape 5 — Bloc FAQ base (alimente faq-base.md)

Annoncer :

> Pour la FAQ de base, soit je te pose quelques questions, soit je te propose des Q-R candidates dérivées des PAA des head terms identifiés au bloc 2. Tu préfères ?

### Cas A — Génération à partir des head terms

1. Simuler les 3-5 PAA pour chaque head term.
2. Regrouper par thème.
3. Proposer réponse-cadre 2-4 phrases, factuelle, sans tic IA.
4. Demander validation/réécriture par question.

### Cas B — Interview classique

1. 3-5 thèmes de questions récurrentes.
2. Pour chaque thème, 3 à 5 questions exactes.
3. Réponse-cadre courte.

**Cascade depuis Bloc 0** : FAQ écrite en langue principale. Au moment de la rédaction d'un article EN/NL/DE, les Q-R réutilisées sont traduites en ligne.

Écrire `content/faq-base.md`.

---

## Étape 6 — Bloc mentions légales (alimente mentions-legales.yaml)

Poser en bloc :

1. **Éditeur** : raison sociale, forme juridique, identifiant fiscal (SIRET FR / BCE BE / RC CH), adresse, représentant légal.
2. **Contact** : email public, téléphone (optionnel).
3. **Hébergeur** : nom + adresse + URL (Vercel Inc. par défaut).
4. **DPO** : email RGPD.
5. **Cookies** : oui/non + types.
6. **PI** : tous droits réservés / CC-BY / autre.

**Cascade depuis Bloc 0** : ENSUITE générer les versions traduites dans toutes les locales (`content/pages/mentions-legales.yaml`, `content/pages/mentions-legales.nl.yaml`, etc.). Le contenu factuel reste identique, seul le wording RGPD/cookies est adapté à la langue.

Écrire le fichier principal + variantes locales.

---

## Étape 7 — Bloc auteur (alimente docs/AUTHOR-[slug].md)

Demander :

> Tu signes les articles d'un nom propre ou sous le nom du site ? Si nom propre, je crée la fiche auteur.

Si nom propre, dérouler l'interview du gabarit `docs/AUTHOR-template.md`.

**Cascade depuis Bloc 0** : si Q0.3 = voix adaptée, la bio et le titre auteur sont traduits par langue. La fiche schema.org Person reste unique, les pages auteur sont en miroir.

Écrire `docs/AUTHOR-[slug].md`.

---

## Étape 8 — Récapitulatif final

```
Configuration terminée. Fichiers écrits :
- niche.config.ts ✓ (market, locales, defaultLocale, localePrefix verrouillés au Bloc 0)
- content/ton-of-voice.md ✓
- content/mots-cles.md ✓
- content/calendrier-edito.md ✓
- content/concurrents.md ✓
- content/faq-base.md ✓
- content/pages/mentions-legales.yaml ✓ (+ variantes locales si N langues)
- docs/AUTHOR-[slug].md ✓ (si auteur fourni)

Routing imposé : [`app/page.tsx` direct | `app/[locale]/...` avec localePrefix:'as-needed']
Miroir strict : [activé/désactivé]
Marché : [BE/FR/CA/CH/...]
Locales : [fr / fr,en / fr,en,nl / ...]
```

---

## Règles strictes

- **Bloc 0 est OBLIGATOIRE en PREMIER**. Aucun autre bloc ne peut commencer avant que `niche.config.ts.market`, `locales`, `defaultLocale`, `localePrefix` soient écrits.
- **Ne JAMAIS inventer** une réponse si l'utilisateur ne fournit pas l'info. Laisser un `TODO` explicite.
- **Bloc par bloc**, pas question par question. Un seul message utilisateur par bloc.
- **Réutiliser les données entre blocs**. Locales définies au Bloc 0 → réinjectées partout.
- **L'export Semrush a priorité sur l'interview** pour les blocs 2 et 4.
- **Miroir strict NON-négociable** dès N ≥ 2 locales. Pas d'option « page FR seulement », même pour les utilitaires.

---

## Lien avec les autres skills

Une fois `init-site` exécuté :
- `ton-of-voice`, `seo-geo-redaction`, `humaniser-fr`, `integrate-claude-design` travaillent sans relancer d'interview.
- `seo-geo-redaction` lit `niche.config.ts.locales` au début de chaque rédaction pour déterminer combien de versions de l'article produire (miroir strict — cf. `skills/seo-geo-redaction/references/mirror-i18n.md`).
- Les **scheduled tasks** de rédaction quotidienne sur les sites enfants doivent lire `niche.config.ts.locales` au runtime et **toujours générer une version par locale** — pas de fallback « skip EN si non traduit ». La traduction systématique est une garantie de cohérence du miroir.
