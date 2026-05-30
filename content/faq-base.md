# FAQ base — [nom du site]

<!--
Ce fichier centralise les questions récurrentes du domaine — celles qui
reviennent dans plusieurs articles, qui sont du pain bénit pour la
citabilité LLM (GEO) et pour les featured snippets / People Also Ask.

Au lieu de réinventer ces Q-R à chaque article, les skills puisent ici
et adaptent au contexte du sujet précis. Économie de tokens directe + 
cohérence des réponses entre articles d'un même site.

Lien avec les autres skills et fichiers :
- `seo-geo-redaction` injecte automatiquement les FAQ pertinentes dans les
  briefs et génère le JSON-LD `FAQPage` à partir de cette base.
- `content/mots-cles.md` section longue traîne croise avec ces questions :
  beaucoup de FAQ ici correspondent à des requêtes longues.

Format : Q-R en Markdown, regroupé par thème. Réponses courtes (2-4 phrases)
qui restent valables hors-contexte d'un article spécifique. Pas de réponses
qui dépendent du produit ou de l'utilisateur — celles-ci vont dans l'article.

Tant qu'au moins un `TODO` reste, `init-site` considère la FAQ comme non
définie.
-->

## Thème A — TODO (nom court du thème, ex : « Tarification »)

**Q : TODO ?**
R : TODO (2-4 phrases, factuel, sans tic IA).

**Q : TODO ?**
R : TODO

**Q : TODO ?**
R : TODO

## Thème B — TODO (ex : « Mise en route »)

**Q : TODO ?**
R : TODO

**Q : TODO ?**
R : TODO

## Thème C — TODO (ex : « Cas d'usage »)

**Q : TODO ?**
R : TODO

**Q : TODO ?**
R : TODO

## Thème D — TODO (ex : « Comparaison vs alternatives »)

**Q : TODO ?**
R : TODO

**Q : TODO ?**
R : TODO

## Questions hors-périmètre

Questions qu'on entend souvent mais auxquelles on choisit volontairement de ne pas répondre (hors-sujet, trop spéculatif, trop juridique). Documenter le refus évite de répondre par accident dans un article.

- TODO (ex : « Quel est le meilleur outil X en 2027 ? » — projection non vérifiable)
- TODO (ex : « Est-ce que c'est légal de... ? » — on renvoie vers un avocat, pas notre métier)
- TODO

## Sources et mise à jour

- **Source initiale** : TODO (People Also Ask Google sur head terms / r/[subreddit] / interviews clients / ChatGPT "questions fréquentes sur X")
- **Date du dernier passage** : TODO
- **Critère pour ajouter une nouvelle Q** : TODO (ex : « si une question revient dans 3 articles + sa rédaction prend > 30 lignes, elle remonte ici »)

---

*Dernière définition : [date]. À enrichir au fil des articles : chaque question récurrente qu'on rédige plusieurs fois doit remonter ici.*
