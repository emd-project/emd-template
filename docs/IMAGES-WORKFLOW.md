# IMAGES — Workflow

**La source unique est `lib/image-slots.ts`.** Ce document ne fait que l'expliquer : ids, chemins,
dimensions et prompts vivent dans le code, jamais ici. En cas de doute, le fichier gagne.

## Le registre : deux familles, c'est tout

| Slot | Fichier | Dimensions |
|---|---|---|
| `category-<slug>` — une par catégorie de blog | `/images/categories/<slug>.webp` | 1600×900 |
| `author-<slug>` — portrait de l'auteur | `/images/authors/<slug>.webp` | 512×512 |

**La couverture de catégorie sert trois fois pour une seule génération :**

1. la carte de la catégorie sur la **home** ;
2. l'**en-tête du hub** `/blog/<categorie>` ;
3. l'**illustration in-content** des articles de cette catégorie (`<ArticleImage>`, aucun fichier
   nouveau).

Le registre a compté 24 slots. Un audit du rendu n'en a trouvé **aucun** affiché par une page : ils
étaient générés à chaque provisionnement — la partie la plus longue d'un run — pour des fichiers que
personne ne voyait. Ont disparu : `home-hero-background`, `home-hero-visual`, `home-hero`,
`comparer-hero`, `quiz-hero`, `simulateur-hero`, `deals-hero`, `og-default`, `home-category-*`,
`blog-category-background-*`.

## À l'init

**1 image par catégorie + 1 portrait d'auteur**, plus la cover de l'article seed. Pour un site à six
catégories : **sept générations**, pas une de plus. `getAllImageSlots()` est la checklist exhaustive.

## Hors registre

- **Cover d'article** — `featureImage` du frontmatter, une par article, produite par la tâche de
  rédaction à partir du sujet réel de l'article. Prompt composé via `composeImagePrompt()`.
- **Image OpenGraph** — générée dynamiquement par `app/opengraph-image.tsx`. **Aucun fichier** à
  produire, à pousser ou à vérifier.

## Règle de génération (séquentiel strict)

`generate_image` → `wait_for_image` → conversion WebP → `github_push_images`. Une image à la fois,
jamais en parallèle. **Un seul retry**, suffixé `-v2`. Si le retry échoue : **skip et log**, on passe
à la suivante. Une image manquante ne bloque jamais la publication.

## Règle de prompt

**Le SUJET commande. Le parti pris ne gouverne que le TRAITEMENT** — lumière, matière, palette.
Jamais ce qui est représenté.

> Cas vécu : un site de voitures de luxe dont le parti pris était « papier comptable à bandes
> vertes » est revenu avec **vingt photos de papier à bandes vertes**. La catégorie « Électrique
> premium » montrait une feuille de comptabilité avec un câble posé dessus. Elle devait montrer une
> **recharge**, traitée dans le registre visuel du site. Le parti pris avait mangé le sujet.

- Une image décrit une **scène**, pas un concept : « atelier de préparation, capot ouvert, lampe
  baladeuse », pas « voiture de luxe ».
- Un prompt qui marcherait à l'identique sur un autre site du réseau est un prompt raté.
- Prompts **≤ 20 mots**, finissant par « **no text, no logos, no watermark** ».
- **Jamais** de marque réelle.

## Alt

`alt` **écrit à la main**, dans **toutes les locales**. Jamais généré, jamais recopié du prompt.
`next/image` uniquement, jamais de `<img>` nu.

## La règle qui prime

**On n'ajoute pas un slot au registre sans le brancher dans un composant.**

Un slot déclaré et non rendu coûte une génération et un aller-retour réseau, pour rien. C'est
exactement ce qui a produit les 24 slots invisibles. Le branchement d'abord, la déclaration ensuite.
