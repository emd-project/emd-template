# Calendrier éditorial — [nom du site]

<!--
Ce fichier définit le rythme et les formats récurrents de publication. Pas
un planning à la date près — un cadre qui répond à « combien on publie, de
quoi, dans quel rythme » pour que les rédactions générées par Claude
respectent la cadence et la diversité de formats sans qu'on le rappelle à
chaque demande.

Lien avec les autres skills et fichiers :
- `seo-geo-redaction` lit ce fichier pour : choisir le format adapté à une
  requête, suggérer le bon gabarit (guide / comparatif / FAQ / news), et
  éviter de proposer un format hors-stratégie.
- `content/mots-cles.md` fournit le QUOI (sujets, requêtes), ce fichier
  fournit le QUAND et le COMMENT-format.

Format : Markdown lisible humain. Pas de YAML.

Tant qu'au moins un `TODO` reste, `init-site` considère le calendrier comme
non défini.
-->

## Cadence

À quel rythme on publie. Trois choix réalistes selon les ressources : modeste / rythmé / industriel. Choisir UN seul.

- **Cadence cible** : TODO (ex : « 2 articles par semaine, 1 brief par mois »)
- **Cadence plancher** : TODO (en-dessous duquel on considère qu'on n'avance plus — ex : « 4 articles par mois »)
- **Jours de publication préférés** : TODO (ex : mardi + jeudi pour les articles, lundi pour le brief)

## Formats récurrents

Trois à six formats canoniques qu'on réutilise. Chaque format = un gabarit clair, un objectif SEO/GEO précis, une longueur cible. Si tu n'as qu'un format (« je fais des articles »), tu n'as pas de stratégie de format.

### Format 1 — TODO (nom court, ex : « Guide d'achat »)
- **Objectif** : TODO (informationnel / transactionnel / GEO / brand awareness)
- **Gabarit** : TODO (référence à un docs/ ou à un article existant, ex : « gabarit guide-2024 »)
- **Longueur cible** : TODO (ex : 1800-2500 mots)
- **Fréquence** : TODO (ex : 2 par mois)
- **Page cible type** : TODO (ex : `/guides/[slug]`)

### Format 2 — TODO (ex : « Comparatif court »)
[Idem]

### Format 3 — TODO (ex : « FAQ thématique »)
[Idem]

### Format 4 — TODO (ex : « Article d'actu / news »)
[Idem]

## Thématiques par période

Si le domaine a une saisonnalité forte (immobilier au printemps, retail à Noël, fiscal en mai-juin, etc.), la coucher ici. Sinon laisser une seule entrée « hors-saisonnalité ».

- **Janvier-Février** : TODO
- **Mars-Avril** : TODO
- **Mai-Juin** : TODO
- **Juillet-Août** : TODO
- **Septembre-Octobre** : TODO
- **Novembre-Décembre** : TODO

## Rotation des angles

Pour éviter qu'un cluster s'épuise visuellement (tous les articles se ressemblent), une rotation d'angles. Quatre à six angles différents pour aborder un même sujet.

- TODO (ex : « angle prix-rapport-utilité »)
- TODO (ex : « angle retour d'expérience à un an »)
- TODO (ex : « angle "ce que la marque ne dit pas" »)
- TODO (ex : « angle débutant absolu »)
- TODO (ex : « angle utilisateur avancé »)

## Republication / refresh

Les vieux articles ne se refresh pas automatiquement. Ces règles servent quand TU demandes à Claude un audit ou un refresh — il consulte ce fichier pour appliquer ta politique de manière cohérente.

- **Cycle de refresh** : TODO (ex : « tout article > 12 mois et > 100 visites/mois est candidat à refresh quand je le demande »)
- **Critère de refresh majeur** vs **mise à jour mineure** : TODO (ex : majeur = chiffres clés à mettre à jour OU produit phare changé. Mineur = ajustement de liens internes + correction.)
- **Signaler le refresh** : TODO (modifier `updated_at` dans frontmatter + ajouter une note de mise à jour visible OUI/NON)

## Brief & idéation

Comment les sujets entrent dans le pipeline.

- **Source d'idées principale** : TODO (Search Console requêtes émergentes / interview client / Reddit / outil externe — choisir 1-2 pas 5)
- **Format du brief avant rédaction** : TODO (ex : « brief 1 page : requête cible + intent + 3 questions du PAA + outline H2 »)
- **Validation avant écriture** : TODO (relecture humaine du brief OUI/NON — recommandé OUI pour limiter les pertes de temps)

---

*Dernière définition : [date]. À réviser tous les 6 mois ou quand la cadence dérape (sous-plancher 2 mois de suite).*
