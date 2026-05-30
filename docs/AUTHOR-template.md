# Auteur — [Prénom Nom]

<!--
Ce fichier définit la voix d'UN auteur spécifique du site. Un fichier par auteur,
nommé `docs/AUTHOR-[slug].md` (ex : `docs/AUTHOR-mathias.md`).

Lien avec ton-of-voice :
- `content/ton-of-voice.md` = voix par défaut du site (s'applique à tout contenu non signé).
- `docs/AUTHOR-[slug].md` = override par auteur pour les articles signés.
- En cas de conflit, AUTHOR gagne sur ton-of-voice pour les articles que cet auteur signe.

Un site avec UN seul auteur peut se contenter de ton-of-voice et ignorer ce fichier.
Un site multi-auteurs (Mathias + Jean + Sophie…) crée un AUTHOR par personne.

Pour activer un auteur côté site :
1. Créer ce fichier à docs/AUTHOR-[slug].md.
2. Créer la fiche auteur côté CMS : content/authors/[slug].yaml.
3. Référencer le slug dans l'article MDX (champ authorSlug).
-->

## Identité

- **Nom complet** : TODO
- **Slug** (URL-safe) : TODO
- **Titre / rôle** : TODO (ex : rédacteur en chef, expert tech, etc.)
- **Lieu** : TODO (ville, pays)
- **Activité depuis** : TODO (année ou expérience concrète dans le domaine)

## Bio (3-5 lignes)

TODO : bio courte qui sera affichée sur `/auteurs/[slug]` et en bas d'article (AuthorCard). Doit contenir au moins un fait vérifiable (date, lieu, expérience, projet antérieur).

## Voix éditoriale

### Tonalité (trois mots)
- TODO
- TODO
- TODO

### Ce qu'il/elle n'est PAS (trois mots)
- TODO
- TODO
- TODO

### Formulations signature
Trois à cinq tournures récurrentes qui font reconnaître l'auteur dès la première ligne. Exemples :
- TODO (ex : « Honnêtement, »)
- TODO (ex : « Le vrai tip : »)
- TODO (ex : « Concrètement, ça donne quoi ? »)

### Vocabulaire interdit (spécifique à cet auteur)
Au-delà du vocabulaire IA générique couvert par `humaniser-fr`, listes des mots/expressions que cet auteur n'utilise jamais. Exemples :
- TODO (ex : « passionné »)
- TODO (ex : « univers »)
- TODO (ex : « expérience immersive »)

### Tu / vous
TODO + raison.

### Spécificités d'expertise
Ce que l'auteur connaît mieux que la moyenne, ce qui rend ses opinions crédibles. Mentionner les expériences réelles, les tests pratiqués, les années de pratique. Exemples :
- TODO (ex : « teste les MacBook depuis 2011 »)
- TODO (ex : « a écrit pour Télérama et 01net entre 2014 et 2020 »)
- TODO (ex : « ancien développeur iOS chez X »)

## Schema.org Person

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "TODO",
  "url": "https://[domaine]/auteurs/[slug]",
  "jobTitle": "TODO",
  "description": "TODO (même bio que ci-dessus)",
  "sameAs": [
    "TODO (URL LinkedIn, Twitter, Mastodon, site perso… — réels uniquement, ne pas inventer)"
  ]
}
```

## Références d'inspiration rédactionnelle

Deux ou trois auteurs, médias, podcasts dont le ton ressemble à ce vers quoi cet auteur tend :
- TODO
- TODO

---

*Dernière mise à jour : [date]. À réviser quand l'auteur signe régulièrement (~10 articles), pour ajuster la voix observée en pratique.*
