---
name: humaniser-fr
version: 1.1.0
description: Détecte ET prévient les marqueurs de rédaction par IA dans tout texte français. À utiliser dans DEUX cas. (1) Mode production : quand l'utilisateur demande à Claude de produire du contenu en français — « rédige un article », « écris une fiche produit », « crée une page À propos », « rédige la FAQ », « génère le texte de », « fais-moi un comparatif », « produis un brief », « compose un titre SEO », « rédige l'intro », « écris une newsletter ». Dans ce mode, Claude internalise les règles AVANT d'écrire la première ligne. (2) Mode review : quand l'utilisateur fait relire un texte existant — « humanise ce texte », « ça sonne IA », « ça sent ChatGPT », « retire les tics IA », « relis cet article SEO ». NE PAS charger pour du code TS/JS, des configs, ou des questions purement techniques sans dimension rédactionnelle.
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---

# humaniser-fr — éditeur anti-IA pour textes français

Ce skill a deux usages distincts. Identifie lequel s'applique avant d'agir.

## Mode production (par défaut quand on te demande de rédiger)

L'utilisateur te demande de produire un texte : article, fiche produit, page (À propos, mentions, méthodologie), FAQ, brief, intro, titre SEO, meta-description, newsletter, post social. Le skill se charge **avant** la rédaction.

Procédure courte :

1. **Lire** une fois les catégories A à J ci-dessous pour internaliser ce qu'il faut éviter.
2. **Garder en tête les cinq règles d'or** :
   - Privilégier *est* / *sont* aux verbes pompeux (*constitue*, *représente*, *incarne*, *s'impose comme*).
   - Bannir les connecteurs en pluie en début de phrase (*Par ailleurs*, *De plus*, *En outre*, *Néanmoins*, *Ainsi*).
   - Donner au moins un fait concret (chiffre, date, nom propre, source) par paragraphe — pas du remplissage adjectival.
   - Interdire *véritable* antéposé, les triades systématiques, et les conclusions positives génériques (*l'avenir s'annonce prometteur*).
   - Respecter la typographie française (« » avec espace insécable, espace insécable avant `:` `;` `?` `!`, accents sur majuscules : *À, É, È, Ê, Ô*).
3. **Écrire directement propre.** Pas de premier jet IA à corriger ensuite — le but est de sortir un texte qui ne nécessitera PAS de passe humaniser-fr derrière.
4. **Audit interne** avant de livrer : appliquer en silence les cinq tests rapides ci-dessous (verbe être, connecteur d'ouverture, opinion, chiffres concrets, *véritable*). Corriger ce qui sonne encore IA.
5. **Livrer.**

Le réflexe à acquérir : un bon texte n'est pas un texte IA *qui a été corrigé*. C'est un texte qui n'a jamais été IA dès le départ.

**Important pour les sites du réseau** : en mode production, applique aussi la catégorie G (spécifique sites affilés / SEO) si le texte est destiné à un site éditorial ou comparateur. Et pense au footprint inter-sites (G2) : si tu rédiges une page structurelle (À propos, FAQ, mentions, méthodologie), vérifie que le wording n'est pas identique à ce qui existe sur un autre site de la galaxie.

## Mode review (relecture d'un texte existant)

L'utilisateur te donne un texte déjà écrit et te demande de l'humaniser, ou te dit qu'il sonne IA. Procédure en neuf étapes décrite plus bas (voir section « Process de correction (mode review) »).

---

## Pourquoi un skill spécifique au français

Les guides anti-IA publics (Wikipedia : Signs of AI writing, plugins de détection) sont pensés pour l'anglais. Le français a ses propres biais :

- L'IA française gonfle son vocabulaire pour sonner « soutenue » (*effectuer* à la place de *faire*, *problématique* nominalisé à la place de *problème*).
- Elle traduit littéralement depuis l'anglais (*adresser un problème*, *faire du sens*, *délivrer de la valeur*).
- Elle empile des connecteurs académiques en début de phrase (*Par ailleurs*, *De plus*, *En outre*, *Néanmoins*) avec une fréquence absurde.
- Elle massacre la typographie française : guillemets anglais, espaces insécables absentes avant `:` `;` `?` `!`, accents oubliés sur les majuscules (*Etat*, *Apres*, *A propos*).
- Sur les sites affilés, elle tombe systématiquement dans le registre « blog d'autorité » générique (*notre comparateur indépendant*, *les meilleurs produits testés et approuvés*, *notre coup de cœur sans hésiter*) — patterns que Google a vu passer dix millions de fois et qui sont la signature numéro un d'un texte généré.

Ce skill couvre ces points, plus les marqueurs anti-footprint inter-sites (formules identiques d'un site affilé à l'autre).

---

## Cinq tests rapides : ce texte sonne-t-il IA ?

À appliquer en mode review sur un paragraphe pris au hasard, ou en mode production sur ton propre brouillon avant de livrer.

1. **Test du verbe être.** Compte les *est* et *sont*. Moins d'un par paragraphe = suspect. L'IA évite *est*/*sont* au profit de *constitue*, *représente*, *incarne*, *s'impose comme*.
2. **Test du connecteur d'ouverture.** Combien de phrases commencent par *Par ailleurs*, *De plus*, *En outre*, *Cependant*, *Néanmoins*, *Ainsi*, *En effet* ? Plus d'une fois par paragraphe = IA.
3. **Test de l'opinion.** Trouve une phrase qui exprime un point de vue, un doute, un sentiment mêlé. Aucune en deux paragraphes = IA.
4. **Test des chiffres concrets.** Combien de faits vérifiables (date, nom propre, chiffre, source) ? Moins d'un par 100 mots = IA en train de meubler.
5. **Test du *véritable*.** Compte les occurrences de *véritable* avant un nom (*un véritable atout*, *une véritable révolution*). Plus de zéro = à reformuler.

Trois tests sur cinq positifs = le texte est IA, intervenir.

---

## Catégorie A — Les mots qui veulent dire grand-chose et ne disent rien

### A1. Vocabulaire gonflant

Suspects récurrents : *crucial, essentiel, fondamental, incontournable, indispensable, majeur, central, stratégique, captivant, fascinant, passionnant, transformateur, révolutionnaire, disruptif, robuste, innovant, dynamique, vibrant, profond, durable, pertinent, significatif*.

Ces adjectifs reviennent à cinq ou dix fois la fréquence d'un texte humain. Ils donnent l'impression d'importance sans rien démontrer.

**Avant**
> Notre solution stratégique répond aux enjeux fondamentaux du secteur grâce à une approche dynamique et innovante.

**Après**
> Notre outil fait deux choses : il génère les briefs en cinq minutes, et il alerte quand un mot-clé sort du top 10.

Méthode : remplace l'adjectif par un fait. Si tu ne sais pas par quoi remplacer, c'est probablement que la phrase ne dit rien d'utile et qu'il faut la supprimer.

### A2. *Véritable* posé comme cale

*Un véritable atout, une véritable opportunité, un véritable défi, une véritable révolution.* Quasiment toujours retirable sans perte de sens.

**Avant** : *Cette fonctionnalité représente un véritable atout pour les utilisateurs.*
**Après** : *Les utilisateurs gagnent quatre clics par commande grâce à cette fonctionnalité.*

### A3. Verbes passe-partout

*Permettre de, garantir, favoriser, optimiser, valoriser, accompagner, répondre aux besoins, mettre en place, s'inscrire dans.*

Verbes vides qui remplacent un verbe concret presque toujours disponible.

**Avant** : *Notre méthode permet de répondre aux besoins en optimisant les processus.*
**Après** : *Notre méthode raccourcit la mise en ligne d'une fiche produit de 30 minutes à 8 minutes.*

### A4. Doublets d'adjectifs

*Simple et intuitif*, *robuste et fiable*, *rapide et efficace*, *clair et structuré*. L'IA accole presque toujours deux adjectifs synonymes. Garde-en un, et seulement si tu peux le justifier.

---

## Catégorie B — Les tournures qui essaient de « faire pro »

### B1. Évitement du verbe être

L'IA refuse d'écrire *est* et *sont*, et les remplace par *constitue, représente, incarne, se présente comme, s'affirme comme, s'impose comme, fait figure de, demeure, se révèle*. *Est* est presque toujours plus juste.

**Avant** : *Cette méthode constitue une référence dans le domaine et s'impose comme l'outil incontournable.*
**Après** : *Cette méthode est utilisée par trois équipes sur quatre.*

### B2. Phrases en miroir et parallélismes négatifs

*Ce n'est pas X, c'est Y.* *Loin d'être X, c'est Y.* *Bien plus qu'un simple X, c'est Y.* *Non seulement X, mais Y aussi.* *Pas X. Pas Y. Z.* *Le vrai sujet n'est pas X, c'est Y.*

Ces structures « sonnent bien » mais définissent la chose par ce qu'elle n'est pas plutôt que d'affirmer ce qu'elle est. Un humain dit ce qu'il pense.

**Avant** : *Ce n'est pas un simple comparateur, c'est un véritable assistant d'achat. Non seulement il classe les produits, mais il aide aussi à décider.*
**Après** : *C'est un comparateur qui pose trois questions et te ressort la machine qui correspond à ton usage.*

### B3. Triades systématiques

L'IA aligne les énumérations par trois pour faire « complet » : *rapide, efficace et fiable*, *innovant, performant et durable*, *les particuliers, les entreprises et les institutions*. Réduis à un seul élément concret, ou casse la triade.

### B4. Anaphores marketing

*Pour celles qui osent. Pour celles qui inventent. Pour celles qui ne renoncent jamais.* — *Parce que… Parce que… Parce que…* — *Plus de X. Plus de Y. Plus de Z.*

Tic de slogan publicitaire que l'IA reproduit dès qu'on lui demande un texte « inspirant ». Très rare dans une vraie conversation.

### B5. Connecteurs académiques en pluie

*Par ailleurs, De plus, En outre, De surcroît, Néanmoins, Toutefois, Cependant, En effet, Ainsi, Par conséquent, En définitive, Force est de constater.*

L'IA ouvre une phrase sur deux par un connecteur lourd. Dans 80 % des cas tu peux le supprimer sans rien perdre.

**Avant** : *Le marché évolue. Par ailleurs, les attentes changent. De plus, la concurrence se renforce. Cependant, des opportunités émergent.*
**Après** : *Le marché évolue. Les attentes changent, la concurrence se renforce, et il reste de la place.*

### B6. Tournures pseudo-soutenues

*Il convient de noter que, force est de constater que, dans cette optique, dans ce cadre, à cet égard, à l'aune de, au regard de, à l'issue de, dans la mesure où.*

Faux registre académique. L'IA empile des formules qui sonnent comme un mémoire de stage. À supprimer presque toujours.

### B7. Fausses gammes (« de X à Y »)

*De la stratégie produit à l'expérience utilisateur, en passant par la gouvernance des données…* — façon de donner l'illusion de tout couvrir en encadrant par deux extrêmes. Préfère lister concrètement : *On intervient sur trois sujets : roadmap produit, UX, gouvernance data.*

### B8. Auto-validation rhétorique

*Et c'est précisément le but. Et c'est tout l'enjeu. Voilà toute la question. C'est là que tout se joue. C'est précisément pour cela que.*

L'IA pose une affirmation, puis se félicite à voix haute de l'avoir posée. À supprimer systématiquement.

### B9. Méta-annonces

*Voici ce qu'on en sait. Voici les éléments clés. Pour bien comprendre, il faut savoir que. Commençons par. Avant d'aller plus loin.*

Préambule auto-référentiel qui annonce ce qu'on va dire avant de le dire. Supprime, attaque directement le contenu.

### B10. Posture didactique

*Ce qu'il faut comprendre, c'est que. Il faut savoir que. Notez que. Gardez à l'esprit que. Retenez ceci. Il est essentiel de comprendre.*

Position de prof face à un élève. Condescendant en contexte pro. Présente l'info, le lecteur en tire ses conclusions.

---

## Catégorie C — Les automatismes du chatbot qui se voient

### C1. Artefacts conversationnels

*Bien sûr ! Avec plaisir ! Voici… J'espère que cela vous aide. N'hésitez pas à… Souhaitez-vous que je…*

Du texte de chat copié-collé dans un contenu final. Aucune indulgence : supprime sans réfléchir.

### C2. Avis de coupure de connaissance

*À ma dernière mise à jour, selon les informations disponibles, bien que les détails précis ne soient pas largement documentés, sur la base des données accessibles.*

L'IA injecte ses limites dans le texte produit. Soit on a la donnée, on la met. Soit on ne l'a pas, on ne meuble pas.

### C3. Ton flatteur ou servile

*Excellente question ! Vous avez tout à fait raison. C'est une remarque très pertinente. Bien vu !*

Politesse de chatbot. À enlever en contenu publié.

### C4. Sur-qualification (hedging)

*On pourrait potentiellement penser qu'il est possible que cette politique puisse avoir un certain impact.*

Empilement de modalisateurs (*pourrait*, *peut-être*, *possible*, *certain*) qui vide la phrase. Garde un seul modalisateur, ou aucun.

### C5. Conclusions positives génériques

*L'avenir s'annonce prometteur. Les perspectives sont enthousiasmantes. Un bel avenir se dessine.*

Conclusion qui ne dit rien. Remplace par un fait : *L'entreprise prévoit d'ouvrir deux bureaux en 2026.*

---

## Catégorie D — Les calques de l'anglais

### D1. Anglicismes IA

| Forme IA | Forme française |
|---|---|
| adresser un problème | traiter un problème |
| faire du sens | avoir du sens |
| supporter (un cas, une charge) | prendre en charge |
| délivrer de la valeur | apporter quelque chose de concret |
| implémenter (souvent excessif) | mettre en place, coder, intégrer |
| drive (un projet, une stratégie) | piloter, mener |
| basé sur | fondé sur, à partir de |
| matcher | correspondre, faire correspondre |
| sourcer | trouver, chercher, recruter |

### D2. Calques syntaxiques

- **Virgule d'Oxford** : *On a livré la spec, le code, et les tests.* → *…la spec, le code et les tests.* (pas de virgule avant *et* en français)
- ***En termes de*** : *En termes de performance…* → *Côté performance…* ou *Pour la performance…*
- ***Prendre en considération*** → *tenir compte de*
- ***Bien que + indicatif*** : *bien que les améliorations sont prévues* → *bien que des améliorations soient prévues* (subjonctif)

### D3. Transitions pseudo-journalistiques

*Est moins X qu'on ne le pense. Plus Y qu'il n'y paraît. Cache une réalité plus nuancée. En apparence X, en réalité Y. Derrière les chiffres se cache.*

Préambule rhétorique qui annonce une nuance avant de la livrer. Un humain donne la nuance directement.

---

## Catégorie E — La typographie française que personne ne corrige

L'IA en français (Claude inclus) maltraite cinq points systématiquement.

### E1. Guillemets

| Forme | Quand | Correction |
|---|---|---|
| `"texte"` (droits) | défaut clavier | → `« texte »` |
| `"texte"` (anglais U+201C/U+201D) | copié depuis ChatGPT | → `« texte »` |

À l'intérieur des guillemets français, on met une **espace insécable** (U+00A0), pas une espace normale.

### E2. Espace insécable avant `:` `;` `?` `!`

*Voici le résultat: c'est validé!* → *Voici le résultat : c'est validé !* (avec espace insécable U+00A0)

### E3. Apostrophe

L'apostrophe courbe (`’`, U+2019) est plus propre que la droite (`'`). Acceptable de mixer selon le contexte (web, code), mais l'IA est souvent **incohérente** dans un même texte — c'est ça qui trahit.

### E4. Accents sur les majuscules

Règle française : les majuscules s'accentuent. L'IA les oublie en début de phrase et dans les titres.

| IA | Correct |
|---|---|
| Etat des lieux | État des lieux |
| Apres trois mois | Après trois mois |
| A propos | À propos |
| Ecole | École |
| Edition | Édition |
| Evolution | Évolution |

### E5. Accents oubliés sur les mots fréquents

*Ou est-ce que ca se trouve? La ou tu as cherche.* → *Où est-ce que ça se trouve ? Là où tu as cherché.*

Couples à surveiller : *où/ou*, *à/a*, *là/la*, *ça/ca*, *dû/du*, *sûr/sur*.

Le signal IA le plus net : un paragraphe avec tous les accents, le suivant sans. Un humain est cohérent (toujours ou jamais).

---

## Catégorie F — La structure obsessionnelle des LLM

### F1. Surutilisation du tiret cadratin (—)

L'IA utilise le tiret cadratin cinq à dix fois plus que les francophones natifs. En français, hors dialogue, c'est rare. Remplace par une virgule, un deux-points, ou une parenthèse.

### F2. Gras mécanique

L'IA met en gras des termes au hasard, plusieurs fois par paragraphe. Garde le gras uniquement pour ce qui mérite vraiment l'œil (un par paragraphe maximum), ou enlève-le.

### F3. Listes à puces « en-tête en gras : »

Signature visuelle ultime des LLM :

```
- **Expérience utilisateur :** L'interface a été améliorée.
- **Performance :** Les performances ont été optimisées.
- **Sécurité :** La sécurité a été renforcée.
```

Convertis en prose, ou en liste sans en-tête en gras. Si la liste est vraiment utile, garde-la simple.

### F4. Émojis décoratifs

🚀 💡 ✅ posés devant des puces ou des titres. Aucun rédacteur humain ne décore systématiquement ses titres avec une fusée. À retirer en contenu pro.

### F5. Variation élégante (synonymie excessive)

*Le protagoniste affronte plusieurs épreuves. Le personnage principal doit surmonter ces obstacles. Le héros finit par triompher. Notre homme rentre chez lui.*

L'IA évite la répétition à tout prix en cyclant des synonymes qui rendent le texte difficile à suivre. Répète le nom sans honte : c'est plus clair que de jongler entre quatre désignations.

---

## Catégorie G — Spécifique sites affilés, comparateurs, blogs d'autorité SEO

C'est ici que ton réseau de sites est le plus exposé. Ces patterns sont la signature numéro un du contenu affilé généré par IA, celle que Google a vu passer le plus souvent. Ne jamais les laisser passer.

### G1. Méta-discours d'autorité

| Pattern à bannir | Pourquoi |
|---|---|
| *Notre comparateur indépendant…* | Le mot *indépendant* dans une page affiliée est un drapeau rouge. |
| *Notre méthodologie rigoureuse…* | Sauf à expliquer concrètement la méthode sur trois lignes minimum, supprime. |
| *Tous les produits ont été testés…* | Si tu n'as pas testé physiquement chaque produit, ne le dis pas. |
| *Pourquoi nous faire confiance ?* | Section vide neuf fois sur dix. Si tu réponds par « parce qu'on est experts depuis 10 ans », c'est encore pire. |
| *Notre verdict, sans hésiter…* | « Sans hésiter » est un tic de fiche produit IA. |
| *Le rapport qualité-prix imbattable* | Cliché de PMU SEO. |
| *Le coup de cœur de la rédaction* | « Coup de cœur » sur un site affilié sonne faux. |
| *À l'heure de choisir… / À l'heure où…* | Ouverture d'article tic. |

### G2. Boilerplate inter-sites (footprint SEO)

Les pages structurelles (À propos, Mentions légales, FAQ, Méthodologie, Politique éditoriale) sont les plus copiées-collées d'un site affilié à l'autre. Google compare ces pages entre sites pour détecter les réseaux. Pour chaque site, ces pages doivent :

- Mentionner un **nom propre réel** (la personne ou l'équipe derrière le site, pas « l'équipe éditoriale »).
- Mentionner un **lieu réel** (ville, région).
- Mentionner une **date réelle** (création du site, années d'expérience dans le domaine).
- Avoir un **wording propre** : ne JAMAIS copier-coller le texte d'un autre site de la même galaxie. Si tu n'as pas le temps de réécrire, passe d'abord par humaniser-fr.

**Test du footprint** : prends une phrase au hasard de la page « À propos » du site, mets-la entre guillemets dans Google. Si Google retourne d'autres pages affiliées avec la même phrase, footprint détecté.

### G3. Conclusions de fiche produit génériques

*Si vous cherchez un X qui combine performance et simplicité, ce modèle est fait pour vous.* — *En définitive, ce produit s'adresse aux utilisateurs exigeants qui ne veulent pas faire de compromis.* — *Vous l'aurez compris : un excellent choix.*

Toutes ces conclusions sont des phrases bouchon. Termine par un fait ou un verdict spécifique : *Ce modèle convient si tu écris plus de 4 h par jour. Sinon, le 13 pouces suffit largement.*

### G4. FAQ génériques

Les questions du genre *Comment fonctionne X ? Pourquoi choisir Y ? Est-ce que Z est rentable ?* avec des réponses de trois lignes vagues sont le pattern le plus dupliqué entre sites IA. Si tu fais une FAQ : pose des vraies questions précises (*Combien de temps tient la batterie en usage vidéo 4K ?*) et réponds avec un fait, pas une généralité.

### G5. Disclaimers affiliés copiés-collés

*Ce site contient des liens affiliés. Lorsque vous achetez via ces liens, nous touchons une commission sans surcoût pour vous.*

Ce texte exact apparaît sur des milliers de sites. Reformule pour chaque site : change la longueur, le ton, l'ordre des informations. Le sens reste le même, l'empreinte change.

---

## Catégorie H — Inflation et brochure touristique

### H1. Inflation d'importance

*Marque un tournant, moment charnière, étape cruciale, témoigne de, s'inscrit dans une dynamique de, héritage durable, paysage en pleine évolution, à l'aube de, à l'ère de, dans un monde en perpétuelle mutation.*

L'IA gonfle l'importance d'un sujet en le reliant à des « grandes tendances ». À supprimer presque toujours.

### H2. Inflation de notoriété

*Couverture indépendante, médias nationaux et internationaux, plébiscité par la presse, présence active sur les réseaux sociaux, plus de X abonnés.*

Empile des médias et des chiffres pour gonfler la crédibilité. Une seule mention concrète et datée vaut mieux qu'une liste vague.

### H3. Langage promotionnel (brochure touristique)

*Nichée au cœur de, écrin de verdure, joyau, véritable havre, riche patrimoine, à couper le souffle, dépaysement garanti, vibrant, dynamique, charme authentique, hors du temps.*

L'IA tombe dedans dès qu'on lui parle de patrimoine, de ville, de culture, de gastronomie ou d'entreprise. À nettoyer systématiquement.

### H4. Analyses en participe présent

*Soulignant, mettant en lumière, témoignant de, illustrant, reflétant, contribuant à, permettant de, favorisant, ouvrant la voie à, traduisant.*

L'IA accroche un participe présent en fin de phrase pour ajouter du faux fond. À supprimer presque toujours.

### H5. Attributions floues

*Selon les experts, les analystes s'accordent, plusieurs sources indiquent, des observateurs estiment, la communauté reconnaît.*

L'IA invoque des autorités vagues. Cite une source précise (nom, date, titre) ou ne cite pas.

### H6. Sections « Défis et perspectives » en clôture

Plan-type IA : un dernier paragraphe qui aligne *défis + opportunités + perspectives + dynamique* sans rien dire. Supprime ce paragraphe, ou remplace par un fait daté et chiffré.

### H7. Registre pseudo-littéraire (mièvre)

*Promesse murmurée, instant suspendu, secret brûlant, désir vibrant, comme si le temps s'était figé, comme une promesse oubliée.*

Quand on demande à l'IA un texte « littéraire », elle tombe dans un registre mièvre, plein de comparaisons en *comme si* et de noms abstraits accolés à des participes émotionnels. À réécrire en supprimant les métaphores creuses.

---

## Catégorie I — Phrases creuses et délayage

L'IA délaie. Réductions évidentes :

| Forme IA | Forme courte |
|---|---|
| Afin de pouvoir atteindre cet objectif | Pour atteindre cet objectif |
| Dans le cadre de la mise en place de cette démarche | Pour cette démarche |
| À l'heure actuelle | Aujourd'hui (ou rien) |
| Au sein de l'organisation | Dans l'entreprise |
| Dans la mesure où il pleuvait | Comme il pleuvait |
| Le système a la capacité de traiter | Le système traite |
| Il est important de noter que les données montrent | Les données montrent |
| Force est de constater que | ∅ |
| Il convient de souligner que | ∅ |
| En définitive | ∅ |

### Faux registre familier dans contexte pro

Miroir inverse du délayage soutenu : quand on demande à l'IA d'être « plus naturelle », elle balance des idiomes colloquiaux (*ça pique*, *ça coince*, *ça envoie*, *fait son boulot*, *plus qu'honnête*) dans un texte par ailleurs pro. Le mélange sonne forcé. Un humain choisit son registre et s'y tient.

---

## Catégorie J — Le piège de la voix manquante

C'est le piège ultime : un texte peut être nettoyé de tous les marqueurs ci-dessus et sonner encore IA, parce qu'il n'a **aucune voix**.

### Signes d'un texte sans voix
- Toutes les phrases ont la même longueur.
- Aucune opinion, juste des faits neutres alignés.
- Aucun doute, aucune nuance, aucun sentiment mêlé.
- Pas de première personne quand le contexte s'y prête.
- Aucun trait d'humour, aucune aspérité.
- Lit comme une fiche Wikipédia ou un communiqué.

### Comment ramener une voix

**Avoir une opinion.** Ne pas se contenter de rapporter : réagir. *Honnêtement, je trouve ce produit largement surévalué pour son prix* est plus humain que *ce produit présente certains avantages et inconvénients.*

**Varier le rythme.** Phrases courtes. Puis une phrase plus longue, qui prend le temps de poser le contexte avant d'arriver à l'idée. Mélange.

**Reconnaître la complexité.** Les vrais gens ont des sentiments mêlés. *C'est bluffant techniquement mais ça me met mal à l'aise sur la vie privée* bat *cette technologie présente des aspects positifs et négatifs.*

**Utiliser *je* / *on* / *nous* quand c'est juste.** La première personne en revue produit ou en article SEO n'est pas un manque de pro, c'est une signature humaine.

**Laisser passer un peu de désordre.** Une parenthèse, une demi-pensée, une digression brève. La structure parfaite sonne algorithmique.

**Être précis sur ce qu'on ressent.** Pas *c'est préoccupant* mais *il y a un truc qui me gêne dans l'idée que l'algo décide à 3 h du matin pendant que personne ne regarde.*

---

## Process de correction (mode review)

Applicable quand l'utilisateur te donne un texte existant à humaniser. En mode production, applique plutôt la procédure courte en haut du document.

1. **Lecture rapide** du texte d'entrée. Identifier le registre attendu (pro, familier, technique, narratif).
2. **Passe rapide** sur les cinq tests rapides (verbe être, connecteur, opinion, chiffres, *véritable*).
3. **Marquage** des occurrences problématiques par catégorie (A à J).
4. **Première réécriture** : reformule chaque passage marqué. Garde le sens, accepte que la formulation change parfois beaucoup.
5. **Vérifications après réécriture** :
   - Le texte sonne juste à voix haute ?
   - Les structures de phrase varient ?
   - Y a-t-il au moins un fait concret par paragraphe ?
   - La typographie française est correcte (« », espaces insécables, accents) ?
   - Le registre est tenu de bout en bout, pas un patchwork ?
6. **Présente une première version humanisée.**
7. **Audit final** : se demander *qu'est-ce qui sonne encore IA dans ce texte ?* Répondre brièvement, en trois à cinq puces.
8. **Version finale** : corriger ce qui sonne encore IA, livrer la dernière passe.
9. **Récap des changements** (optionnel, sur demande) : lister les catégories de modifications faites.

### Format de sortie attendu (mode review)

1. Première réécriture
2. *Qu'est-ce qui sonne encore IA dans ce texte ?* (puces brèves)
3. Version finale
4. Récap des changements (si l'utilisateur le demande)

---

## Cas concret : page « À propos » d'un site comparateur affilié

**Avant** (sonne IA, et possiblement copié-collé d'un autre site de la galaxie)

> Bienvenue sur 10minutesapple ! Nous sommes ravis de vous présenter notre histoire.
>
> Fondé par une équipe d'experts passionnés, 10minutesapple constitue une véritable référence dans le paysage du conseil tech. Notre comparateur indépendant, plébiscité par la presse, vous accompagne dans le choix de votre prochain produit Apple grâce à une méthodologie rigoureuse et transparente.
>
> Ce n'est pas un simple site de comparatifs : c'est un véritable partenaire qui vous aide à prendre la bonne décision. Non seulement nos analyses sont basées sur des tests poussés, mais elles s'inscrivent dans une dynamique d'objectivité totale.
>
> - **Indépendance :** Nous ne sommes liés à aucune marque.
> - **Expertise :** Plus de 10 ans d'expérience dans le secteur.
> - **Transparence :** Toutes nos sources sont citées.
>
> Par ailleurs, notre équipe se tient à jour des dernières innovations. De plus, nous mettons un point d'honneur à délivrer un contenu de qualité. En définitive, faire confiance à 10minutesapple, c'est s'assurer du meilleur conseil.
>
> N'hésitez pas à nous contacter si vous souhaitez en savoir plus !

**Première réécriture**

> Le site existe depuis 2022. Il est tenu par Mathias, basé à Bruxelles, qui passe beaucoup trop de temps à comparer des MacBook depuis 15 ans.
>
> Ce qu'on fait : on teste les machines Apple sur 3-4 usages concrets (montage vidéo, dev, bureautique lourde, gaming léger via Crossover) et on dit laquelle convient pour quel cas. On ne teste pas tout, on teste ce qu'on utilise.
>
> Ce qu'on ne fait pas : des « tests express en boutique », des « verdicts sans hésiter », des classements top 10 où tout le monde est numéro un. Si on n'a pas eu la machine trois semaines à la maison, on ne donne pas d'avis.
>
> Comment on est rémunérés : liens affilés Amazon, Fnac, Apple Store. Si tu cliques et que tu achètes, on touche une commission qui ne change pas ton prix.
>
> Pour nous écrire : contact@10minutesapple.com.

**Qu'est-ce qui sonne encore IA dans ce texte ?**
- Le ton est cohérent mais légèrement « manifeste » : la structure *ce qu'on fait / ce qu'on ne fait pas* sent un peu le plan.
- *Beaucoup trop de temps à comparer* peut sonner cliché.

**Version finale**

> Le site existe depuis 2022. Il est tenu par Mathias, basé à Bruxelles. Premier MacBook acheté en 2011 (un Air, mort en 2018), depuis j'enchaîne — et je teste à chaque fois ce que je préférerais qu'on m'ait dit avant.
>
> On teste les machines Apple sur 3-4 usages concrets : montage vidéo, dev, bureautique lourde, et gaming léger via Crossover (oui, ça marche maintenant sur certains jeux). On garde la machine trois semaines minimum avant d'écrire. Si on n'a pas eu le temps, on ne publie pas.
>
> Rémunération : liens affilés Amazon, Fnac, Apple Store. Une commission quand tu achètes via nos liens, sans surcoût pour toi.
>
> Contact : contact@10minutesapple.com.

**Changements faits**
- Supprimé : artefacts conversationnels (*Bienvenue*, *N'hésitez pas*), inflation (*véritable référence*, *plébiscité par la presse*, *méthodologie rigoureuse*), méta-discours d'autorité (*notre comparateur indépendant*), parallélisme négatif (*ce n'est pas un simple X, c'est un véritable Y*), liste à puces avec en-têtes en gras, connecteurs en pluie (*Par ailleurs*, *De plus*, *En définitive*), anglicisme (*basé sur*, *délivrer*).
- Ajouté : un nom propre (Mathias), un lieu (Bruxelles), une date (2022), une expérience datée (2011), une méthodo concrète (trois semaines, 3-4 usages), une transparence financière précise.
- Ramené : une voix (première personne, anecdote du Air mort en 2018, petite digression sur Crossover).

---

## Cas d'usage hors humaniser-fr

Ce skill ne se substitue pas à :

- Une **traduction** : ce n'est pas son rôle.
- Un texte **techniquement spécialisé** où certains mots flaggés comme « IA » sont en fait précis (un papier médical peut utiliser *crucial* à juste titre).
- Une **fiction littéraire assumée** où certains tics (mièvres, lyriques, anaphoriques) sont des choix stylistiques.

En cas de doute, demande à l'utilisateur le registre attendu avant d'appliquer.

---

## Pour aller plus loin

Ce skill s'inspire d'observations terrain sur les contenus français générés par IA, des guides publics francophones (Wikipedia FR — *Identifier l'usage d'une IA générative*, *Projet Observatoire des IA*) et de la communauté open source des skills anti-IA (notamment *alxbd/boileau* et *blader/humanizer*, à consulter en complément). Le texte de ce SKILL.md, ses exemples et son organisation sont propres au template emd-template.
