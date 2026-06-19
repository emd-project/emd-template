# AUTO-DESIGN — DA à l'init (doctrine Voltéo v2 : assemblage + preview)

> **Voltéo est le DÉFAUT du moteur** (les composants RSC produisent déjà la structure). On ne recopie
> rien : on **réutilise les composants** et on **compose un mix unique** par site. Détail complet :
> **[`docs/design-reference/volteo/DESIGN-NOTES.md`](design-reference/volteo/README.md)**.
> Les 5 directions de départ : **[`docs/DA-DIRECTIONS.md`](DA-DIRECTIONS.md)**.

## Quand exécuter

Init (`configure-from-spec` ou `init-site`, via `nouveau-site`), si `design-incoming/` est vide.
- `design-incoming/` non vide → `integrate-claude-design`.
- vide → dérouler les phases ci-dessous.

---

## Unicité par ASSEMBLAGE (pas par skin)

Trois leviers (cf. DESIGN-NOTES §0) :
1. **Type de home** selon l'intent : `comparateur` (transactionnel) · `magazine` (informationnel, défaut) · `portail`. Piloté par `niche.style.hero` (`split` → comparateur ; `centered`/`minimal` → magazine).
2. **Mixage des variantes** : étudier `docs/design-reference/volteo/*-V1..V4` + `marche`/`fil`/`portail`, **puiser et recombiner** des traitements (hero, ordre des sections, anims) — **jamais copier** une variante.
3. **Tokens mutés** via **`niche.config.palette` → tokens `app/globals.css :root`** (`--accent-1..5`, `--bg-*`, `--text-*`, `--border*`, `--radius-*`) + fonts dans `app/layout.tsx`. Direction de départ + valeurs : **[`DA-DIRECTIONS.md`](DA-DIRECTIONS.md)**.

> ⚠️ **`app/styles/volteo.css :root` est une couche d'ALIAS vers `globals.css` — NE JAMAIS y écrire de
> valeurs.** La source unique de la DA est `niche.config.palette` (couleurs) + `layout.tsx` (fonts).
> Écrire dans `volteo.css :root` re-casse la source unique. **Plus jamais** d'écriture là, ni de
> valeurs « brutes » de skin : on remplit `niche.config.palette` et on **mute**.

---

## PHASE 1 — PREVIEW (valider le design AVANT de tout construire)

1. Choisir le **type de home** + composer le **mix** + appliquer/**muter** les **tokens** via
   **`niche.config.palette` → `globals.css`** (+ fonts dans `layout.tsx`).
2. Construire **le strict minimum pour VOIR** : **la home** + **UN** hub/catégorie + **UN** article —
   en **contenu bouchon** + **images placeholder** (`.ph`/`ImagePlaceholder`), **AUCUNE génération d'images** (1 hero max).
3. **STOP.** Annoncer : type de home retenu (et pourquoi), variantes mixées + ce qui a été recombiné,
   direction DA + mutations. **Montrer le preview et ATTENDRE la validation de l'utilisateur.**

> **INTERDIT en preview** : bâtir toute l'arborescence, générer toutes les images, écrire tous les
> articles, créer la tâche de rédaction. On valide d'abord la **direction visuelle**.

---

## PHASE 2 — BUILD (seulement après validation du design)

Après « ok » de l'utilisateur :
- créer **toute l'arborescence** (catégories, pages, articles d'amorçage) ;
- générer les images **dans le plafond** : **≤ ~5** (hero home + couverture hub), **jamais** par
  catégorie/article — le reste à la demande ou via la tâche de rédaction (cf. `IMAGES-WORKFLOW.md`) ;
- le **logo & favicon** = **mark SVG sur mesure + wordmark** (inline `Nav.tsx` + `app/icon.svg`),
  **pas** une image Gemini (cf. `DA-DIRECTIONS.md` § LOGO & FAVICON) ;
- écrire le contenu réel **sourcé** ;
- créer la **tâche de rédaction** quotidienne.

---

## Checklist (fin de PREVIEW, avant validation)

Cf. **DESIGN-NOTES §5** : type de home cohérent · mix assumé (≥ 2 variantes recombinées, pas une copie) ·
tokens appliqués via **`niche.config.palette` → `globals.css`** + fonts, **mutés** (**rien dans `volteo.css :root`**) ·
direction choisie parmi les 5 · mode **light OU dark fixe** · logo = mark SVG + wordmark · contraste AA ·
preview = home + 1 hub + 1 article en **placeholders, zéro image générée** · **rien d'autre construit** ·
**validation demandée**.

Un init qui « build tout + génère les images » **avant** validation = **bug d'init**.
Un site en **clone d'une variante**, en **tokens bruts d'un skin**, ou avec une **valeur écrite dans
`volteo.css :root`** = **bug d'init**.

Garde-fous anti-IA : [`DA-ANTI-IA.md`](DA-ANTI-IA.md). Fallback hors-cadre : [`DA-PRESETS.md`](DA-PRESETS.md).
