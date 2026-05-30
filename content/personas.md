# Personas — [nom du site]

<!--
Ce fichier définit les 2 à 4 personas du site. Pas des "buyer personas"
marketing fantasmés, des archétypes opérationnels qui pilotent les choix
éditoriaux : quelles questions on traite, quel niveau d'expertise on suppose,
quel vocabulaire on emploie, quel format on privilégie selon l'étape du
funnel.

Lien avec les autres skills et fichiers :
- `seo-geo-redaction` lit ce fichier pour la règle "FAQ in-flow H3 persona-focused"
  (au lieu de PAA quand le sujet est niche ou non-couvert dans les SERP).
  Le skill choisit le persona pertinent selon le sujet de l'article.
- `content/mots-cles.md` croise avec ce fichier : un cluster = un ou deux
  personas dominants, pas tous les personas pour tous les clusters.
- `content/ton-of-voice.md` reste la voix unique du site (qui parle), ce
  fichier définit à qui on parle dans le détail (qui écoute).

Tant qu'au moins un `TODO` reste, `init-site` considère les personas comme
non définis et redéclenchera le bloc.

Format : 1 section par persona, structure fixe. Pas de YAML — les skills
lisent comme du contexte texte.
-->

## Persona 1 — TODO (nom court mémo, ex : "Solo Freelance Débutant")

### Situation
TODO (1-3 phrases factuelles : qui est-il, où, depuis quand, contexte de vie/pro qui compte pour son comportement de recherche).

Exemple : *"Antoine, 28 ans, ancien salarié devenu auto-entrepreneur depuis 8 mois. Travaille seul depuis chez lui dans le développement web. Premier exercice fiscal en approche, jamais géré une compta de sa vie."*

### Ce qu'il cherche
TODO (3-5 objectifs concrets en venant sur le site, formulés depuis SON point de vue, pas depuis le nôtre).

- TODO (ex : "Comprendre s'il doit choisir BNC ou BIC sans devoir lire le BOFIP")
- TODO
- TODO

### Ce qu'il évite ou craint
TODO (3-5 frictions, peurs, ou anti-modèles que TU dois éviter pour gagner sa confiance).

- TODO (ex : "Les articles sponsorisés Pennylane déguisés en comparatifs")
- TODO (ex : "Les démos vidéo de 30 minutes")
- TODO

### Niveau d'expertise sur le sujet
TODO (cocher) :
- [ ] Débutant absolu (premières recherches sur le sujet)
- [ ] Intermédiaire (a déjà lu 3-5 articles, connaît le vocabulaire de base)
- [ ] Avancé (connaît les nuances, cherche un avis tranché ou un edge case)

### Vocabulaire qu'il emploie
TODO (5-10 mots ou expressions que CE persona utilise spontanément quand il cherche, à intégrer dans les H2/H3 pour le matching SEO + GEO).

- TODO (ex : "facture micro" et pas "facturation auto-entrepreneur")
- TODO
- TODO

### Vocabulaire qu'il ne comprend PAS
TODO (3-5 jargon à éviter ou à expliquer immédiatement quand on s'adresse à ce persona).

- TODO (ex : "exigibilité de la TVA" — il connaît mais sans connaître le terme exact)
- TODO

### Questions par étape de funnel

#### Découverte (vient de réaliser qu'il a un problème)
3 à 5 questions exactes qu'il taperait dans Google ou Perplexity à ce stade.

- TODO (ex : "Est-ce que je dois faire des factures même sans TVA ?")
- TODO
- TODO

#### Évaluation (compare des options)
3 à 5 questions au stade évaluation.

- TODO (ex : "Pennylane gratuit suffit ou pas pour un micro à 15k€/an ?")
- TODO
- TODO

#### Décision (sur le point de choisir)
3 à 5 questions au stade décision.

- TODO (ex : "Si je prends Pennylane et que je change d'avis dans 6 mois, je récupère mes données ?")
- TODO

#### Post-décision / usage (après l'achat ou l'inscription)
2 à 3 questions qu'il se posera APRÈS, et auxquelles on peut répondre pour cycler le trafic récurrent.

- TODO (ex : "Comment générer ma première facture Pennylane sans me planter ?")
- TODO

### Sources d'info qu'il consulte
TODO (3-5 endroits où ce persona traîne avant de lire ton article — utile pour ajuster le ton et savoir contre quel discours on s'aligne ou se différencie).

- TODO (ex : r/AutoEntrepreneurFR, La Fabrique du Net, podcast "L'After Eco")
- TODO

---

## Persona 2 — TODO (nom court)

[Même structure intégrale qu'au-dessus]

### Situation
TODO

### Ce qu'il cherche
- TODO
- TODO
- TODO

### Ce qu'il évite ou craint
- TODO
- TODO

### Niveau d'expertise sur le sujet
- [ ] Débutant
- [ ] Intermédiaire
- [ ] Avancé

### Vocabulaire qu'il emploie
- TODO

### Vocabulaire qu'il ne comprend PAS
- TODO

### Questions par étape de funnel

#### Découverte
- TODO

#### Évaluation
- TODO

#### Décision
- TODO

#### Post-décision / usage
- TODO

### Sources d'info qu'il consulte
- TODO

---

## Persona 3 — TODO (optionnel)

[Idem. Ne créer un troisième persona QUE s'il a un comportement réellement différent des deux premiers, sinon c'est de la dilution.]

## Persona 4 — TODO (optionnel, rare)

[Idem. Quatre personas, c'est déjà une niche très large — vérifie que tu n'es pas en train de tout couvrir au lieu de t'adresser à quelqu'un.]

---

## Mapping persona → cluster

Petit tableau de référence pour le skill `seo-geo-redaction` : pour chaque cluster défini dans `content/mots-cles.md`, quel(s) persona(s) sont dominants.

| Cluster | Persona dominant | Persona secondaire |
|---|---|---|
| TODO (nom cluster 1) | TODO (Persona 1) | TODO ou ∅ |
| TODO (nom cluster 2) | TODO | TODO |
| TODO (nom cluster 3) | TODO | TODO |

Règle : un article tape UN persona à la fois, pas plusieurs. Si tu hésites, c'est probablement que le sujet est trop large et qu'il faut le splitter en deux articles.

---

## Sources des personas

D'où viennent les données ci-dessus, pour pouvoir les rafraîchir dans 12 mois sans repartir de zéro.

- **Sources d'observation** : TODO (interviews clients / lecture de threads Reddit-Discord-Quora / analyse Search Console des requêtes vers le site / sondage email / questions reçues sur le formulaire de contact)
- **Date de la dernière révision** : TODO
- **Quand re-réviser** : à minima tous les 12 mois, ou si le mix d'audience du site change (signaux : changement net dans les sources Search Console, nouveaux types de questions reçues, etc.)

---

*Dernière définition : [date]. À éditer sans skill quand un persona évolue, à régénérer entièrement via `init-site` si trois personas ou plus ont changé.*
