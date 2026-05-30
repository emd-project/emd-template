---
name: init-site
version: 1.0.0
description: Bootstrap d'un nouveau site forké du template emd-template. Détecte tous les fichiers de configuration non remplis (ton-of-voice, mots-cles, calendrier-edito, concurrents, faq-base, mentions-legales, AUTHOR-*), lance UN SEUL interview groupé par blocs thématiques (au lieu de N interviews séparés à chaque trigger), et écrit tous les fichiers en une seule passe. À utiliser une fois après "Use this template" sur GitHub. Triggers explicites — « initialise ce site », « configure ce site », « setup le site », « init-site », « bootstrap le site », « lance la conf », « première configuration ». Trigger implicite — si l'utilisateur demande sa première rédaction sur un site visiblement non configuré (≥ 2 fichiers content/ avec TODO), proposer init-site AVANT de lancer ton-of-voice seul.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# init-site — Bootstrap d'un nouveau site forké

Ce skill remplit en une seule passe tous les fichiers de configuration éditoriale du site forké. Économise des tokens vs déclencher ton-of-voice + 4 autres skills séparément, et garantit la cohérence entre les fichiers (audience définie une fois, réutilisée partout).

## Étape 0 — Audit de l'état actuel

Avant tout interview, lire l'état de chaque fichier-cible :

| Fichier | Statut « non défini » si… |
|---|---|
| `content/ton-of-voice.md` | absent OU contient ≥ 1 `TODO` |
| `content/mots-cles.md` | absent OU contient ≥ 1 `TODO` |
| `content/calendrier-edito.md` | absent OU contient ≥ 1 `TODO` |
| `content/concurrents.md` | absent OU contient ≥ 1 `TODO` |
| `content/faq-base.md` | absent OU contient ≥ 1 `TODO` |
| `content/pages/mentions-legales.yaml` | absent OU contient ≥ 1 `TODO` |
| `docs/AUTHOR-[slug].md` | optionnel — proposé seulement si l'utilisateur signe ses articles d'un nom propre |

Annoncer à l'utilisateur le bilan :

> J'ai audité l'état du site. Voici ce qu'il reste à définir : [liste]. Je vais te poser les questions par blocs thématiques (5 blocs, ~5-10 minutes au total). Tu peux répondre à un bloc, sauter, ou me donner un export Semrush au lieu de l'interview pour la partie mots-clés.

Si TOUT est déjà rempli (zéro TODO), informer et sortir :

> Le site est déjà configuré. Pour re-déclencher l'interview sur une partie, supprime le fichier concerné ou remets-y un TODO.

## Étape 1 — Bloc voix et audience (alimente ton-of-voice.md)

Déléguer au skill `ton-of-voice` en mode définition (les 8 questions existantes). Ne PAS dupliquer le questionnaire ici — on lance le skill existant, on récupère le résultat, on passe au bloc suivant.

Si `content/ton-of-voice.md` est déjà rempli, sauter ce bloc.

## Étape 2 — Bloc mots-clés (alimente mots-cles.md)

Annoncer :

> Pour les mots-clés, deux options : soit tu colles un export Semrush (CSV ou copié-collé du tableau Keyword Magic Tool / Organic Research), soit on fait un mini-interview de 6 questions. L'export Semrush donne un résultat beaucoup plus précis. Tu as un export sous la main ?

### Cas A — Export Semrush fourni

L'utilisateur colle un CSV ou un tableau de keywords avec au minimum les colonnes Keyword / Volume / KD / Intent.

1. Parser les keywords. Regrouper par thème sémantique en 3 à 5 **clusters** (cible : pas plus de 5).
2. Pour chaque cluster, identifier :
   - **Head term** = le keyword avec le plus gros volume et un KD acceptable
   - **Longue traîne** = les keywords < 1000 vol/mois et > 50 vol/mois sur le même thème
   - **Quick wins** = les keywords avec KD ≤ 30 et intent commercial/informational (5-10 max, alimentent la section « Requêtes prioritaires 90 jours »)
   - **À éviter** = les keywords avec KD > 60 OU intent non-rentable (alimentent la section « Requêtes à NE PAS cibler »)
3. Demander à l'utilisateur de confirmer/ajuster la proposition de clusters.
4. Demander le positionnement global (1 phrase) et les concurrents directs aperçus dans Semrush.
5. Écrire `content/mots-cles.md` rempli (zéro TODO sauf pour les sections optionnelles qu'on ne peut pas dériver de l'export).
6. Coller l'export brut intégralement dans la section « Export brut » du fichier — c'est la source de vérité pour le prochain refresh.

### Cas B — Pas d'export Semrush

Poser ces 6 questions en un bloc unique :

1. **Positionnement** — En une phrase, contre qui on se bat et auprès de qui on existe ?
2. **Clusters** — Trois à cinq grands silos qui couvriront le site. Pour chacun : nom + une phrase qui le résume.
3. **Mots-clés piliers** — Un head term par cluster (la requête courte la plus juteuse, même si très concurrentielle).
4. **Longue traîne** — Dix à quinze questions concrètes que ton audience tape réellement. Pas des questions plausibles, des questions vues (Reddit, Discord, Search Console, Quora).
5. **Priorités 90 jours** — Cinq à dix requêtes qu'on attaque en premier. Choix réaliste — pas les head terms ultra-concurrentiels.
6. **À éviter** — Trois à cinq intentions qu'on ne cible PAS volontairement, et pourquoi.

Écrire `content/mots-cles.md`. Laisser un `TODO` explicite à la section « Export brut » pour rappeler qu'on peut enrichir plus tard avec Semrush.

## Étape 3 — Bloc calendrier éditorial (alimente calendrier-edito.md)

Poser ces 5 questions en bloc :

1. **Cadence cible** et **cadence plancher** — combien d'articles par semaine/mois on vise, et en dessous de quoi on considère qu'on stagne.
2. **Formats récurrents** — 3 à 6 formats canoniques (guide d'achat / comparatif / FAQ / news / interview / retour d'expérience). Pour chacun : longueur cible et fréquence.
3. **Saisonnalité** — y a-t-il une saisonnalité forte du domaine ? Si oui, lister les pics par bimestre.
4. **Rotation d'angles** — 4 à 6 angles pour aborder un même sujet sans se répéter visuellement.
5. **Refresh** — politique de mise à jour des vieux articles (cycle, critère majeur/mineur, signalement).

Écrire `content/calendrier-edito.md`.

## Étape 4 — Bloc concurrents (alimente concurrents.md)

Poser ces 4 questions en bloc :

1. **Directs (3-5 max)** — pour chacun : URL, pourquoi tu le considères direct (chevauchement de clusters), une force, une faiblesse.
2. **Indirects (3-5 max)** — forums, agrégateurs, comparateurs, sites de marques qui captent du trafic sur tes requêtes sans être de même type.
3. **Gaps** — où la SERP est faible aujourd'hui sur tes clusters (résultats datés, AI overview, articles courts), opportunités à attaquer en priorité.
4. **Anti-modèles** — 2 à 5 pratiques observées chez les concurrents que tu refuses de reproduire.

Si l'utilisateur a un export Semrush (étape 2 cas A), réutiliser les concurrents identifiés par Semrush comme proposition de départ — l'utilisateur valide/ajuste.

Écrire `content/concurrents.md`.

## Étape 5 — Bloc FAQ base (alimente faq-base.md)

Annoncer :

> Pour la FAQ de base, je peux soit te poser quelques questions, soit te proposer une base de Q-R candidates dérivées des People Also Ask des head terms identifiés à l'étape mots-clés. Tu préfères ?

### Cas A — Génération à partir des head terms

1. Pour chacun des head terms définis à l'étape 2, simuler les 3-5 questions People Also Ask les plus probables (le modèle a une bonne intuition là-dessus pour les domaines courants — sinon, demander à l'utilisateur de lister les PAA réels qu'il voit dans Google).
2. Regrouper par thème (3-5 thèmes).
3. Proposer pour chaque question une réponse-cadre de 2-4 phrases, **factuelle, neutre, sans tic IA**.
4. Demander à l'utilisateur de valider/réécrire chaque réponse — c'est la source qui sera réinjectée dans tous les articles, donc précision > vitesse.

### Cas B — Interview classique

Poser :
1. Quels sont les 3-5 thèmes de questions qui reviennent en boucle dans ton domaine ?
2. Pour chaque thème, 3 à 5 questions exactes (formulées comme les utilisateurs les posent — pas reformulées).
3. Réponse-cadre courte pour chacune.

Écrire `content/faq-base.md`.

## Étape 6 — Bloc mentions légales (alimente mentions-legales.yaml)

Poser ces questions en bloc — c'est plus du factuel que de l'éditorial :

1. **Éditeur** : raison sociale, forme juridique, SIRET (si FR), adresse, représentant légal.
2. **Contact** : email public, téléphone (optionnel).
3. **Hébergeur** : nom + adresse + URL (Vercel par défaut pour la stack emd-template — proposer directement les coordonnées Vercel Inc. comme valeur par défaut, l'utilisateur confirme ou corrige).
4. **DPO** : email RGPD (peut être identique au contact).
5. **Cookies** : oui/non — si oui, quels types (analytics, affiliation, préférences).
6. **PI** : tous droits réservés / CC-BY / autre.

Écrire `content/pages/mentions-legales.yaml`.

## Étape 7 — Bloc auteur (alimente docs/AUTHOR-[slug].md)

Demander :

> Tu signes les articles d'un nom propre (Mathias Cetani / Sophie Lambert / etc.) ou tu signes sous le nom du site ? Si nom propre, je crée la fiche auteur. Sinon on saute.

Si nom propre :

1. Demander le slug (ex : `mathias` → fichier `docs/AUTHOR-mathias.md`).
2. Si plusieurs auteurs prévus, boucler sur cette étape pour chacun.
3. Pour CHAQUE auteur, dérouler l'interview du gabarit `docs/AUTHOR-template.md` :
   - Identité (nom, slug, titre, lieu, activité depuis)
   - Bio 3-5 lignes
   - Tonalité 3 mots / pas-3 mots
   - 3-5 formulations signature
   - Vocabulaire interdit spécifique
   - Tu / vous + raison
   - Spécificités d'expertise (3 faits vérifiables)
   - Schema.org Person (sameAs LinkedIn / Twitter — réels)
4. Écrire `docs/AUTHOR-[slug].md` à partir du gabarit existant.
5. Rappeler à l'utilisateur de créer aussi `content/authors/[slug].yaml` côté CMS (référence du gabarit dans `DUPLICATION-GUIDE.md` étape 2).

## Étape 8 — Récapitulatif final

Une fois TOUS les blocs traités, faire un résumé :

> Configuration terminée. Fichiers écrits :
> - content/ton-of-voice.md ✓
> - content/mots-cles.md ✓ (avec export Semrush intégré OU interview)
> - content/calendrier-edito.md ✓
> - content/concurrents.md ✓
> - content/faq-base.md ✓
> - content/pages/mentions-legales.yaml ✓
> - docs/AUTHOR-mathias.md ✓ (si auteur fourni)
>
> Prochaines étapes manuelles (cf. docs/DUPLICATION-GUIDE.md) : niche.config.ts, content/settings.yaml, identité visuelle, variables d'env Vercel.

## Règles strictes

- **Ne JAMAIS inventer** une réponse si l'utilisateur ne fournit pas l'info. Laisser un `TODO` explicite dans le fichier — le pattern repose là-dessus pour redéclencher le bloc plus tard.
- **Bloc par bloc, pas question par question**. L'utilisateur répond en un seul message par bloc. C'est la clé de l'économie de tokens et du flow utilisateur.
- **Réutiliser les données entre blocs**. Audience définie au bloc 1 → réinjectée au bloc 4 (concurrents). Head terms définis au bloc 2 → réinjectés au bloc 5 (FAQ). Ne PAS reposer deux fois la même question.
- **Si l'utilisateur saute un bloc**, écrire le fichier avec des `TODO` partout dans les sections concernées et continuer — ne pas bloquer le setup pour un bloc.
- **L'export Semrush a priorité sur l'interview** pour la partie mots-clés et concurrents. Le mentionner systématiquement avant d'attaquer le bloc 2.

## Lien avec les autres skills

Une fois `init-site` exécuté avec succès, les skills `ton-of-voice`, `seo-geo-redaction`, `humaniser-fr`, `integrate-claude-design` peuvent travailler sans relancer d'interview. Si l'un d'eux détecte que `content/[fichier].md` contient encore des TODO sur un setup non terminé, il doit relancer `init-site` plutôt que de combler le trou lui-même — chaque skill garde sa responsabilité.
