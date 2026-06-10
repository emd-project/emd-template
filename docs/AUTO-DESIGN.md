# AUTO-DESIGN — Composer la DA à l'init (doctrine Voltéo)

> **Source unique de la DA : [`docs/design-reference/volteo/`](design-reference/volteo/README.md).**
> On ne compose plus une DA « à partir de zéro ». On **part d'un skin Voltéo prouvé** (V1–V4),
> on l'**applique mécaniquement**, puis on le **mute** pour rester unique. Tout le mapping et les
> blocs prêts à coller sont dans **[`volteo/DESIGN-NOTES.md`](design-reference/volteo/DESIGN-NOTES.md)**.

## Quand exécuter

Pendant l'init (`configure-from-spec` ou `init-site`, via `nouveau-site`), **seulement si
`design-incoming/` est vide**.
- `design-incoming/` non vide → c'est `integrate-claude-design` qui pilote. Ne PAS exécuter ceci.
- `design-incoming/` vide → dérouler les 4 étapes ci-dessous. **Ne jamais laisser** la palette/fonts
  par défaut de `niche.config.ts`.

---

## Étape 1 — Choisir (poser les questions d'abord)

Trois choix. Toujours offrir « laisse Claude choisir » (Claude déduit de la niche + de l'intent des mots-clés).

1. **Archétype → template** : Comparateur · Magazine · Hybride. Pilote `homeSections` + `hero`.
   - comparateur → `hero: split`, sections outils/offres.
   - magazine → `hero: centered`/`minimal`, sections articles à la une.
2. **Skin (point de départ)** :
   - **V1 Électrique** — grand public, tech & amical (clair, bleu, arrondi).
   - **V2 Éditorial** — presse, autorité (clair, serif, papier chaud, angles nets).
   - **V3 Suisse / Minimal** — premium neutre, B2B (clair, monochrome + 1 rouge, zéro ombre).
   - **V4 Premium sombre** — haut de gamme (sombre, accent lumineux).
3. **Verticale** : énergie (défaut) · assurance · auto · tech · *custom (5 hex)*. Donne les couleurs de catégorie.

---

## Étape 2 — Appliquer (copier, ne rien inventer)

Suivre **[`volteo/DESIGN-NOTES.md`](design-reference/volteo/DESIGN-NOTES.md)** :
- §5 — copier le **bloc prêt à coller** du skin choisi dans `niche.config.ts` (`palette`, `fonts`, `style`).
- §4 — reporter les **couleurs de catégorie** de la verticale dans `accent3/4/5` (+ catégories).
- §3b — reporter dans `app/globals.css` : `--radius-*`, `--shadow-*`, et les **correctifs ciblés**
  (V3 = rayon 0 / zéro ombre ; V4 = re-noircir les sections à fond plein sombre).

Convention marque : `accent1 = --primary` du skin (le moteur n'a pas de token de marque séparé).

---

## Étape 3 — Muter (anti-footprint, transformations bornées)

Le skin est un **départ**, jamais un clone. Appliquer 2–3 mutations encadrées (cf. DESIGN-NOTES §6) :
teinte de marque (±12–45°), paire de fonts du même registre, rayons dans la fourchette du skin.
La verticale différencie déjà les couleurs de catégorie.

> Un site qui sort en **valeurs brutes du skin** = clone = **bug d'init**.

---

## Étape 4 — Valider (checklist qui bloque)

Dérouler la **checklist DESIGN-NOTES §7** (contraste AA, fond non blanc pur sauf V3, mode cohérent,
correctifs V3/V4 reportés, skin muté, plus aucun placeholder). Tant qu'elle ne passe pas, l'init n'est
pas finie. Puis **générer les images** structurelles (cf. `IMAGES-WORKFLOW.md`).

Annoncer à l'utilisateur : template + skin + verticale retenus (et pourquoi), ce qui a été muté.

---

## Fallback — niche sans skin adapté (rare)

Les 4 skins + 4 verticales couvrent la majorité des cas (comparateurs & magazines). Pour une niche
vraiment hors-cadre (ex. SaaS, portfolio) où aucun skin ne colle, on peut composer une DA sur mesure
depuis la bibliothèque optionnelle `lib/da-presets/` (cf. [`DA-PRESETS.md`](DA-PRESETS.md)) en visant
le même niveau de finition que Voltéo. **Ce n'est pas le chemin par défaut** — à n'utiliser que si les
skins ne conviennent pas, et à signaler explicitement.

Garde-fous anti-IA (7 symptômes + interdits) : cf. [`DA-ANTI-IA.md`](DA-ANTI-IA.md).
