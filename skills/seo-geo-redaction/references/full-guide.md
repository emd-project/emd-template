# Guide SEO & GEO — Rédaction (référence complète)

Ce fichier est la référence détaillée du skill `seo-geo-redaction`. Le SKILL.md couvre les essentiels (80 % des cas). Ce guide ajoute les gabarits par format, la checklist exhaustive, les composants MDX et les anti-patterns détaillés.

Lire aussi `content/ton-of-voice.md` pour la voix éditoriale du site (géré par le skill `ton-of-voice`).

---

## 1. Philosophie

Le contenu répond à une seule question : *pourquoi lire cette page plutôt qu'une autre ?*

Trois mots : **expertise, preuve, utilité.**
- **Expertise** : chaque affirmation traçable (source, expérience, raisonnement)
- **Preuve** : données chiffrées, exemples concrets, cas réels
- **Utilité** : chaque paragraphe fait avancer vers une décision ou une compréhension

Posture : un **expert qui parle à un pair légèrement moins avancé**. Direct, parfois opinioné, jamais neutre au point d'être creux.

---

## 2. Anti-patterns IA — Ce qu'il faut bannir

### Patterns lexicaux interdits

**Intensificateurs vides :**
~~crucial, essentiel, fondamental, incontournable, véritablement, réellement, littéralement~~

**Formules d'introduction creuses :**
- ~~« Dans le monde actuel / d'aujourd'hui… »~~
- ~~« À l'ère du numérique… »~~
- ~~« Il est important de noter que… »~~
- ~~« Nous allons voir dans cet article… »~~
- ~~« En conclusion, nous pouvons dire que… »~~

**Méta-commentaires :**
- ~~« Cet article vous donnera toutes les clés pour… »~~
- ~~« Vous trouverez ci-dessous un guide complet… »~~

**Faux équilibre :**
- ~~« D'un côté… de l'autre côté… »~~ sans prise de position finale

### Patterns structurels interdits

| Pattern IA | Alternative humaine |
|---|---|
| Introduction → 3 points → Conclusion | Narration avec tension → résolution |
| Chaque H2 suivi de 3 bullets | Paragraphes de densité variable |
| Même longueur pour chaque section | Sections courtes si simple, longues si complexe |
| Définition systématique de chaque terme | Définir uniquement si le lecteur cible ne connaît pas |
| Rappel de la question en conclusion | Conclusion qui ouvre, pas qui referme |

### Test avant publication
Soumettre le texte à au moins un outil de détection IA. Seuil : **score « humain » ≥ 85 %**.

---

## 3. Avant de rédiger

### Analyse concurrentielle (obligatoire)
- Identifier les 3 premiers résultats Google sur le mot-clé cible
- Noter : angle, structure H2, longueur, FAQ, données structurées
- Trouver le « content gap » : l'info que personne ne donne

### Intention de recherche
| Type | Signal | Réponse attendue |
|---|---|---|
| Informationnelle | « qu'est-ce que », « comment », « pourquoi » | Réponse directe dès le premier paragraphe |
| Transactionnelle | « meilleur », « comparatif », « acheter » | Tableau comparatif + CTA affilié |
| Navigationnelle | nom de marque, nom de produit | Fiche produit ou guide d'achat |

---

## 4. Structure d'article

### Squelette obligatoire
```
H1 — mot-clé principal + année dynamique si « édition courante »
  Chapô — réponse directe en 2-3 phrases (position zéro)
  TL;DR — 3 bullets max (si article > 600 mots)

H2 — sous-thème 1 (question si possible)
  Réponse directe dès la première phrase (< 60 mots)
  Développement, données, exemples
  Lien interne contextuel

H2 — sous-thème 2
  …

H2 — FAQ (6 questions minimum)
  JSON-LD FAQPage généré automatiquement

AuthorCard en bas d'article
```

### Longueur cible
| Type | Mots | FAQ min |
|---|---|---|
| Article blog | 800 – 1 200 | 6 |
| Page pilier / guide | 1 500 – 2 500 | 8 |
| Fiche produit | 300 – 600 | 4 |

### Règles de densité
| Élément | Valeur cible |
|---|---|
| Densité mot-clé principal | 0,5 % – 1,5 % |
| Longueur paragraphe | 3 – 5 phrases |
| Longueur phrase | 15 – 25 mots |
| Ratio texte / listes à puces | ≥ 70 % texte courant |

**Règle des 3 premiers paragraphes** : le mot-clé principal, sa définition contextuelle et la promesse de valeur doivent apparaître avant le premier H2.

---

## 5. SEO on-page

### Titres et meta
- `title` : mot-clé principal en début + différenciateur — max 60 caractères
- `description` : réponse directe à l'intention — max 155 caractères
- H1 unique, **ne répète pas** le title mot pour mot (variante naturelle)
- Hiérarchie stricte : H1 > H2 > H3, jamais de saut

### Années dynamiques
| Type | Exemple | Traitement |
|---|---|---|
| Edition courante | « Guide 2026 », « Meilleur X 2026 » | `currentYear()` côté serveur |
| Date historique | « Fondé en 2012 » | String littérale — jamais remplacée |

### Enrichissement sémantique
- 3 à 5 variantes sémantiques (LSI) du mot-clé principal
- Entités nommées attendues dans le champ sémantique (marques, concepts)
- Questions « People Also Ask » répondues naturellement dans le texte

### Images
- `alt` descriptif (description du contenu, pas « image de… »)
- `next/image` uniquement — jamais de `<img>` nu
- `priority` uniquement sur l'image LCP above-fold
- 1 image ou visuel tous les 400–500 mots minimum

---

## 6. GEO — Optimisation pour les moteurs génératifs

Les moteurs génératifs ne cherchent pas la page qui « matche » — ils cherchent **la source qui mérite d'être citée**. Le contenu doit être extractible, citable et attribuable.

### Les 6 critères GEO

**1. Citabilité directe**
Chaque H2 doit contenir au moins une phrase autonome qui répond complètement à une question, sans contexte externe.
Format : `[Sujet] est/fait [attribut clair] parce que/grâce à [raison concrète].`

**2. Autorité de source**
Mentionner des sources datées et identifiables.
Format : `Selon [Source] ([année]), [stat ou conclusion].`

**3. Structuration en Q&R**
H2/H3 formulés en questions → réponse dans les 50 premiers mots du paragraphe.

**4. Définitions opérationnelles**
Pour tout concept central, proposer une définition courte et originale dans les 200 premiers mots.

**5. Données originales ou synthèses chiffrées**
Au moins un tableau, une comparaison ou une statistique mise en contexte par article.

**6. Fraîcheur signalée**
Date de rédaction/mise à jour visible + `dateModified` en JSON-LD.

### Architecture « chunkable »

Un article GEO-ready se compose de **modules indépendants** extractibles par les LLM :

```
[CHUNK 1] Définition standalone (< 80 mots)
[CHUNK 2] Règle ou principe citable (H2 interrogatif + réponse < 60 mots + développement)
[CHUNK 3] Données / tableau comparatif + phrase de verdict
[CHUNK 4] Processus séquentiel (liste numérotée)
[CHUNK 5] Nuance ou exception (« sauf quand… », « attention si… »)
[CHUNK 6] FAQ (3-5 questions, réponses < 80 mots)
```

**Règle clé : chaque H2 doit pouvoir exister comme réponse standalone à sa propre question de titre.**

Pas de phrases-ponts génériques entre chunks (« Maintenant que nous avons vu X, passons à Y »). Terminer le chunk sur sa conclusion. Commencer le suivant directement.

### E-E-A-T appliqué
- **Experience** : référence à un test réel, un cas vécu
- **Expertise** : vocabulaire technique maîtrisé, nuances, limites
- **Authoritativeness** : citations de pairs, sources tierces
- **Trustworthiness** : sources citées, date visible, auteur identifié

---

## 7. Formats — Doctrine d'usage

### H2 interrogatifs

| Format | Exemple | Usage |
|---|---|---|
| Qu'est-ce que… | Qu'est-ce que le maillage interne ? | Définition |
| Comment… | Comment choisir son outil ? | Processus |
| Pourquoi… | Pourquoi X change les règles ? | Argumentation |
| Quelle différence entre… | Différence entre A et B ? | Comparaison |
| Faut-il… | Faut-il faire X et Y ensemble ? | Recommandation |

Réponse directe en **< 60 mots** sous le H2, puis développement.

### Listes à puces

**Utiliser quand** : 4-8 éléments, énumération sans ordre naturel.
**Éviter quand** : < 4 éléments (écrire en prose), > 8 éléments (regrouper).

```
❌ Liste robotique :
- Optimiser les balises meta
- Améliorer la vitesse de chargement
- Créer du contenu de qualité

✅ Liste avec texture humaine :
- Optimiser les balises meta — title et description en priorité
- Vitesse de chargement : LCP < 2,5 s est le seuil critique Core Web Vitals
- Contenu : la longueur ne fait pas la qualité, la couverture sémantique si
```

Les items ne sont pas tous de la même longueur. Au moins un contient une nuance.

### Tableaux comparatifs

**Utiliser quand** : 3+ éléments sur plusieurs critères, données chiffrées.
**Toujours suivi** d'une phrase de verdict qui guide la décision.

```
❌ Tableau vague :
| Outil | Facilité | Prix | Qualité |
| Outil A | Facile | Abordable | Bonne |

✅ Tableau précis :
| Outil | Prise en main | Prix/mois | Précision |
| Outil A | < 5 min | Gratuit / 10 € | ~85 % |
```

Cellules = valeurs précises, pas jugements vagues (« bon », « moyen »).

### Matrice format × intention

| Intention | Format prioritaire | À éviter |
|---|---|---|
| Définition | Paragraphe dense + définition isolée | Liste à puces en intro |
| Comparaison | Tableau + verdict | Pros/cons sans synthèse |
| Tutoriel | Liste numérotée par étape | Narratif sans séparation d'étapes |
| Recommandation | Tableau + « Pour quel profil » | Réponse floue sans position |
| Dépannage | « Pourquoi X » + « Comment corriger » | Long développement sans solution |

---

## 8. Maillage interne

- Chaque article : 2-4 liens internes contextuels
- Lien vers la page pilier de la catégorie (`/comparer/[cat]` ou `/choisir/[cat]`)
- Lien vers 1-2 articles de la même catégorie
- Lien vers 1 article d'une autre catégorie (maillage transversal)
- Ancres descriptives — jamais « cliquez ici »
- Max 1 lien externe par 500 mots (sources d'autorité uniquement)

### Breadcrumbs
Format : Accueil > Catégorie > Article
JSON-LD BreadcrumbList sur toutes les pages sauf Home.

---

## 9. Liens externes et affiliation

### Sources
- Chiffres : toujours sourcés avec lien vers la source
- Sources primaires > sources secondaires
- `target="_blank" rel="noopener"` pour les liens externes
- `rel="nofollow noopener sponsored"` pour les liens affiliés

### Liens affiliés
- Tous les liens Amazon passent par `addAffiliateTag()` ou `<AffiliateLink>`
- Tag configuré dans `niche.config.ts`
- Disclosure visible sur chaque page avec des liens affiliés

---

## 10. Données structurées (JSON-LD)

| Page | Schemas obligatoires |
|---|---|
| Home | WebSite |
| Article | Article + Person + BreadcrumbList + FAQPage |
| Page auteur | Person |
| Comparatif | BreadcrumbList + ItemList |
| Page pilier | BreadcrumbList |
| Guide / tutoriel | Article (+ HowTo si applicable) |

Champs obligatoires Article : `headline`, `datePublished`, `dateModified`, `author` (Person), `publisher` (Organization), `description`.

---

## 11. FAQ

- 6 questions minimum par article, 8 pour les pages piliers
- Questions formulées comme les utilisateurs les tapent
- Réponse directe en première phrase (< 80 mots), développement ensuite
- JSON-LD FAQPage côté serveur
- Chaque question apporte une info unique — pas de FAQ générique

### Sources de questions
1. Google « People Also Ask » sur le mot-clé
2. Autocomplétion Google
3. Forums (Reddit, forums spécialisés)
4. Questions réelles des utilisateurs du site

---

## 12. Gabarits par format

### Article informatif
```
H1 — Qu'est-ce que [sujet] : définition, enjeux et applications
  Intro (100-150 mots) — définition + contexte + promesse
H2 — Définition complète
  H3 — Origine et évolution
  H3 — Ce que [sujet] n'est pas
H2 — Comment fonctionne [sujet]
  H3 — Mécanisme + exemple réel
H2 — Cas d'usage principaux
H2 — Limites et points de vigilance
H2 — FAQ (6+ questions)
Conclusion (80-120 mots) — synthèse + prochaine étape
```

### Article comparatif
```
H1 — [A] vs [B] : comparaison complète (année)
  Intro — contexte du choix + critères annoncés
H2 — Présentation de [A]
H2 — Présentation de [B]
H2 — Comparaison critère par critère [TABLEAU]
H2 — Pour quel profil choisir [A] ?
H2 — Pour quel profil choisir [B] ?
H2 — Notre verdict
H2 — FAQ
```

### Article tutoriel
```
H1 — Comment [accomplir X] en [Y étapes]
  Intro — problème + prérequis + résultat attendu
H2 — Ce dont vous avez besoin
H2 — Étape 1 : [Verbe d'action + résultat]
H2 — Étape 2 : …
H2 — Erreurs courantes à éviter
H2 — Variantes et optimisations
H2 — FAQ
```

---

## 13. Composants MDX disponibles

| Composant | Usage | Syntaxe |
|---|---|---|
| `<ArticleImage>` | Image inline | `<ArticleImage src="…" alt="…" caption="…" />` |
| `<ProductCTA>` | Carte produit | `<ProductCTA name="…" price="…" url="…" image="…" />` |
| `<ProductCarousel>` | Carousel produits | `<ProductCarousel products="slug-1,slug-2" />` |
| `<CompareBar>` | Barre comparaison | `<CompareBar label="…" left="88" right="95" />` |
| `<ProConTable>` | Pour/Contre | `<ProConTable pros="A\|B\|C" cons="X\|Y" />` |
| `<Tip>` | Conseil | `<Tip>Texte du conseil</Tip>` |
| `<Warning>` | Avertissement | `<Warning>Texte</Warning>` |
| `<Verdict>` | Verdict noté | `<Verdict note="8" label="Excellent">Texte</Verdict>` |
| `<PullQuote>` | Citation | `<PullQuote author="…">Texte</PullQuote>` |
| `<StatCard>` | Statistique | `<StatCard value="92%" label="Satisfaction" />` |

**ATTENTION** : les props MDX sont des **strings uniquement**. Utiliser `|` comme séparateur pour les listes.

---

## 14. Checklist avant publication

### SEO technique
- [ ] Meta title unique, < 60 chars, mot-clé en début
- [ ] Meta description unique, < 155 chars, réponse directe
- [ ] H1 unique, variante du title (pas identique)
- [ ] Hiérarchie H1 > H2 > H3 stricte, aucun saut
- [ ] JSON-LD Article + Person + BreadcrumbList + FAQPage
- [ ] Canonical défini
- [ ] Images : alt descriptif, next/image, WebP

### GEO
- [ ] Chaque H2 contient une phrase citable standalone
- [ ] Au moins 3 phrases citables par article
- [ ] Sources datées et identifiables
- [ ] Chunks autonomes (chaque H2 testable en isolation)
- [ ] ≥ 50 % des H2 formulés en questions (articles informatifs)
- [ ] Tableaux suivis d'un verdict textuel

### Contenu
- [ ] Réponse directe dès le premier paragraphe
- [ ] 2-4 liens internes contextuels
- [ ] Sources externes d'autorité citées
- [ ] FAQ 6+ questions, JSON-LD serveur
- [ ] Densité mot-clé : 0,5-1,5 %
- [ ] Aucune année hardcodée pour « édition courante »
- [ ] Liens affiliés via addAffiliateTag() / AffiliateLink
- [ ] Score détection IA ≥ 85 % humain

### Anti-patterns IA
- [ ] Aucun intensificateur vide (crucial, essentiel, fondamental)
- [ ] Aucune formule d'intro creuse
- [ ] Sections de longueur variable (pas symétriques)
- [ ] Items de listes de longueur variable
- [ ] Prise de position dans les comparaisons
- [ ] Pas de méta-commentaire sur le contenu

### EEAT
- [ ] AuthorByline en haut (nom + date + temps lecture)
- [ ] AuthorCard en bas d'article
- [ ] Page /auteurs/[slug] publiée et indexable
- [ ] Author JSON-LD dans l'article
- [ ] Expérience terrain mentionnée
- [ ] Nuances et limites exposées

### Rendu
- [ ] `curl` retourne le H1 sans JS
- [ ] Pas de contenu dans useEffect/useState
