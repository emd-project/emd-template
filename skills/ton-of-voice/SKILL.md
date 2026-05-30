---
name: ton-of-voice
version: 1.0.0
description: Définit ET applique la voix éditoriale du site forké. UNE voix par site, fixée une fois, respectée pour toujours. À utiliser AVANT toute rédaction de contenu français — article, fiche produit, page À propos, FAQ, brief, intro, titre SEO, newsletter. Triggers : « rédige », « écris », « crée une page/article/fiche/FAQ », « produis un brief », « génère le texte de », « fais-moi un comparatif », « compose un titre ». Comportement dépend de content/ton-of-voice.md : (1) si rempli → applique le ton défini. (2) si vide, absent, ou contient encore des TODO → conduit un mini-interview de 8 questions auprès de l'utilisateur pour le remplir, sauvegarde le fichier, PUIS attaque la rédaction demandée.
allowed-tools:
  - Read
  - Write
  - Edit
---

# ton-of-voice — Voix éditoriale du site

Ce skill définit OU applique la voix éditoriale du site forké. Une voix par site, fixée à la première rédaction, respectée par tout ce qui s'écrit ensuite.

## Étape 0 — Charger la voix existante

Avant toute autre action, lire `content/ton-of-voice.md` :

- Le fichier **n'existe pas** OU **contient un ou plusieurs `TODO`** → aller en **Mode définition**.
- Le fichier **existe et est rempli** (zéro TODO) → aller en **Mode application**.

## Mode définition (premier appel sur un nouveau site)

Annoncer à l'utilisateur :

> Avant de rédiger quoi que ce soit, j'ai besoin de définir la voix éditoriale du site. Huit questions courtes, ça prend cinq minutes — on s'y tient ensuite pour toujours.

Puis poser les 8 questions ci-dessous. Préférer un bloc unique (l'utilisateur répond à son rythme dans un seul message) plutôt que question par question, sauf si l'utilisateur demande l'inverse.

1. **Qui parle ?** Première personne (`je`), collectif (`on`, `nous`), ou pas de marque personnelle (formulation neutre) ?
2. **À qui parle-t-on ?** Décris l'audience cible : profil, niveau d'expertise, état d'esprit en arrivant sur le site.
3. **Trois mots qui décrivent le ton souhaité.** Exemples : *direct, chaleureux, expert, dégagé, terre-à-terre, ironique*.
4. **Trois mots qui décrivent ce qu'on N'EST PAS.** Exemples : *pas corporate, pas mièvre, pas didactique, pas commercial, pas militant*.
5. **Tu ou vous ?** Et pourquoi ce choix.
6. **Trois formulations signature** — des phrases ou tournures qu'on retrouverait dans tes textes (au moins une par site). Exemples : *« Honnêtement, »*, *« Le vrai tip : »*, *« Concrètement, ça donne quoi ? »*, *« Bon, soyons clairs : »*.
7. **Cinq mots à bannir** spécifiquement sur ce site, au-delà du vocabulaire IA générique déjà couvert par humaniser-fr. Exemples typiques : *passion*, *univers*, *expert(e)*, *sérénité*, *immersif*.
8. **Une ou deux références d'inspiration** — médias, blogs, créateurs, podcasts dont le ton ressemble à ce que tu vises. Exemples : *Le Monde Diplomatique*, *Substack de tel auteur*, *podcast Splash*.

Une fois les réponses recueillies, **écrire `content/ton-of-voice.md`** avec le gabarit ci-dessous rempli. Confirmer à l'utilisateur que le fichier est créé, puis enchaîner sur la rédaction qu'il avait demandée à l'origine.

IMPORTANT : si l'utilisateur ne répond pas à une question, laisser un `TODO` explicite à cet endroit dans le fichier plutôt qu'inventer une réponse plausible. Mieux vaut un fichier partiellement TODO qu'un fichier inventé qui figerait une fausse voix.

## Mode application

Lire `content/ton-of-voice.md` et internaliser :

- Qui parle (1ère personne / collectif / neutre).
- Audience cible.
- Mots-tons attendus (les trois descripteurs du ton).
- Mots-tons interdits (les trois descripteurs de « ce qu'on n'est PAS »).
- Tu ou vous.
- Formulations signature — à utiliser au moins une fois dans un article long.
- Vocabulaire banni — à grepper sur le draft avant livraison.
- Référence d'inspiration — à consulter mentalement en cas de doute sur le registre.

Rédiger en respectant ces contraintes. Audit interne avant de livrer : le texte respecte-t-il la voix définie ? Sinon, refaire.

## Si la rédaction demandée sort du cadre

Si le sujet demandé est manifestement incompatible avec la voix définie (par exemple ton défini = *direct, terre-à-terre* et on demande un texte *poétique, élégiaque*), prévenir l'utilisateur AVANT d'écrire :

> Le ton défini pour ce site est X. Ce que tu me demandes correspondrait plutôt à Y. On reste sur X ou on adapte ?

Pas de mise à jour silencieuse de `content/ton-of-voice.md` — la voix se redéfinit explicitement, jamais à la volée.

## Gabarit de fichier `content/ton-of-voice.md`

Format à respecter quand on remplit le fichier :

```markdown
# Ton de voix — [nom du site]

## Qui parle
[1ère personne `je` / collectif `on` ou `nous` / neutre]

## Audience cible
[Description en 1-3 phrases]

## Ton (trois mots)
- [Mot 1]
- [Mot 2]
- [Mot 3]

## Ce qu'on n'est PAS (trois mots)
- [Mot 1]
- [Mot 2]
- [Mot 3]

## Tu / vous
[Choix + raison]

## Formulations signature
- [Formulation 1]
- [Formulation 2]
- [Formulation 3]

## Vocabulaire banni (au-delà des tics IA génériques)
- [Mot 1]
- [Mot 2]
- [Mot 3]
- [Mot 4]
- [Mot 5]

## Inspirations
- [Média / créateur 1]
- [Média / créateur 2 si pertinent]

---

*Dernière définition : [date du jour]. Pour redéfinir, supprimer ce fichier ou y remettre des `TODO` puis relancer le skill.*
```

## Lien avec les autres skills

Sur les triggers de rédaction, trois skills se chargent en parallèle. Pas de conflit, ils sont complémentaires :

- **ton-of-voice** (ce skill) — définit COMMENT on parle (voix éditoriale spécifique au site).
- **seo-geo-redaction** — définit COMMENT structurer pour Google + LLM (squelette, citabilité, JSON-LD).
- **humaniser-fr** — garde-fous anti-IA pendant l'écriture (tics à éviter, typo française).
