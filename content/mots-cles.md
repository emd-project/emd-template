# Mots-clés — [nom du site]

<!--
Ce fichier définit la stratégie de mots-clés du site forké. Une stratégie par
site, fixée à l'init via le skill `init-site`, raffinée ensuite manuellement
ou via le skill `seo-geo-redaction` quand de nouvelles opportunités émergent.

Lien avec les autres skills et fichiers :
- `seo-geo-redaction` lit ce fichier pour : choisir les head terms d'un brief,
  prioriser les sujets, éviter les requêtes hors-stratégie, et nourrir les
  champs JSON-LD `keywords`.
- `niche.config.ts → categories` doit être cohérent avec les clusters listés
  ici (un cluster = une catégorie ou un sous-thème, pas l'inverse).
- `content/ton-of-voice.md` reste la référence éditoriale, ce fichier ne le
  duplique pas — il dit QUOI couvrir, pas COMMENT le rédiger.

Format : sections fixes ci-dessous. Pas de YAML : lisibilité humaine prioritaire
sur parsabilité machine (les skills lisent ce fichier comme du contexte texte).

Tant qu'au moins un `TODO` reste dans ce fichier, `init-site` considère la
stratégie comme non définie et redéclenchera l'interview au besoin.
-->

## Positionnement global

Une phrase qui résume contre qui on se bat et auprès de qui on existe.

TODO (ex : « blog français sur les outils SaaS no-code à destination des solopreneurs et freelances, positionné contre Indie Hackers FR et Tools.fyi, avec un angle prix-rapport-utilité plus que tendance »).

## Clusters thématiques

Trois à cinq grands silos qui couvrent tout le contenu du site. Chaque cluster doit pouvoir produire au moins dix articles sans s'épuiser. Si tu n'en vois que deux, tu n'as pas encore une niche, tu as un sujet.

### Cluster 1 — TODO (nom)
- **Intention dominante** : informationnelle / transactionnelle / navigationnelle (cocher une seule)
- **Volume estimé** : TODO (faible / moyen / fort — ordre d'idée Ahrefs/Semrush si tu as accès, sinon feeling)
- **Concurrence directe** : TODO (1-3 sites qui dominent ce cluster aujourd'hui)
- **Pourquoi on peut gagner** : TODO (1 phrase concrète — angle, fraîcheur, expertise interne)

### Cluster 2 — TODO
[Idem]

### Cluster 3 — TODO
[Idem]

[Ajouter Cluster 4 et 5 si pertinent. Ne pas inventer des clusters pour faire le nombre — mieux vaut trois clusters denses que cinq vides.]

## Mots-clés piliers (head terms)

Un par cluster. Ce sont les requêtes courtes et concurrentielles qu'on cible avec une page-mère longue (pillar page) — pas avec dix articles diffus.

- **Cluster 1 → TODO** (ex : « meilleur logiciel devis BTP »)
- **Cluster 2 → TODO**
- **Cluster 3 → TODO**

## Longue traîne — questions concrètes

Dix à vingt requêtes longues réelles tapées par l'audience. Source : People Also Ask, Reddit, Quora, communautés Discord/Slack du domaine, ou les `// » dans la search bar` de la niche. Pas de questions inventées.

- TODO (ex : « comment automatiser ses devis sans Excel »)
- TODO (ex : « est-ce que Pennylane gère la TVA intracommunautaire »)
- TODO
- TODO
- TODO

[Continuer jusqu'à 15-20 entrées. Garder un mix : « comment X », « X vs Y », « est-ce que X », « meilleur X pour Y », « X est-il rentable ».]

## Requêtes prioritaires — 90 jours

Cinq à dix mots-clés sur lesquels on veut être en top 10 dans les trois mois. Choix réaliste : difficulté Ahrefs/KD ≤ 30 sauf domaine déjà autoritaire, intent aligné avec une page existante ou facile à créer.

| Requête | Cluster | Page cible | Statut |
|---|---|---|---|
| TODO | TODO | TODO (URL prévue) | À rédiger / Brouillon / Publié |
| TODO | TODO | TODO | À rédiger |
| TODO | TODO | TODO | À rédiger |

[Mettre à jour la colonne Statut au fil des publications. Cette table est aussi un mini-tableau de bord pour les revues mensuelles.]

## Requêtes à NE PAS cibler

Cinq à dix intentions de recherche qu'on évite volontairement, et pourquoi. Économise du temps d'arbitrage à chaque nouvelle idée d'article.

- TODO (ex : « comparatif Pennylane vs Sage » — trop concurrentiel court terme, on n'a pas l'autorité)
- TODO (ex : « avis Pennylane » — captée par les comparateurs affiliés, marge nulle)
- TODO

## Vocabulaire de niche

Synonymes, jargon, abréviations que l'audience emploie réellement. À distinguer du vocabulaire de `niche.config.ts` (qui sert l'UI : entity, entityVerb, etc.) — ici c'est pour enrichir les textes et matcher les requêtes variantes.

- TODO (ex : « facturation auto-entrepreneur » = « facture micro-entreprise » = « devis micro »)
- TODO
- TODO

## Source primaire — export Semrush

Le skill `init-site` demande un export Semrush au moment du setup (CSV ou copié-collé du tableau). Si fourni, il sert de base pour pré-remplir les sections ci-dessus (clusters, head terms, longue traîne, priorités 90j) au lieu d'un interview à froid.

Format attendu (au minimum) :
- **Keyword** (la requête exacte)
- **Volume** (recherches mensuelles)
- **KD** (keyword difficulty 0-100)
- **Intent** (informational / commercial / transactional / navigational)
- **CPC** (optionnel mais utile pour identifier la valeur commerciale)
- **SERP features** (optionnel — featured snippet, PAA, etc.)

Sources Semrush typiques à exporter :
- *Keyword Magic Tool* sur le head term principal (filtré KD ≤ 30) → alimente la longue traîne
- *Organic Research → Competitors* sur les concurrents directs → alimente la section Concurrents
- *Keyword Gap* entre nous et 3 concurrents → identifie les opportunités

Coller l'export brut dans la section ci-dessous (ou laisser TODO si pas encore d'export disponible — l'interview prend le relais).

### Export brut

```
TODO — coller ici le CSV Semrush, OU la liste de mots-clés copiée-collée depuis l'interface, OU laisser vide si l'interview suffit.
```

## Autres sources

D'où viennent les données qui ne sortent pas de Semrush, pour qu'on puisse les rafraîchir dans six mois sans repartir de zéro.

- Outil(s) complémentaire(s) : TODO (Ahrefs / Ubersuggest / Google Search Console / Keywords Everywhere / autre)
- Date du dernier audit : TODO
- Communautés sources pour la longue traîne : TODO (sub-reddits, serveurs Discord, groupes Facebook…)

---

*Dernière définition : [date]. À réviser tous les 3-6 mois ou quand un cluster s'épuise / une opportunité émerge.*
