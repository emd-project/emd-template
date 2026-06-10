# Voltéo — Doctrine design du moteur (assemblage unique + preview)

> **Voltéo n'est plus une référence à reproduire : c'est le DÉFAUT du moteur.** Les composants RSC
> (`components/home/MagazineHome`, `ComparateurHome`, le hub `/blog`, l'article) produisent **déjà** la
> structure Voltéo. On ne « recopie » plus rien : on **réutilise les composants** et on **compose +
> mute** pour que chaque site soit **unique** — sans repartir d'un simple skin.

---

## 0. L'unicité par ASSEMBLAGE (pas par skin)

Trois leviers, du plus structurant au plus fin. **Un site = un mix réfléchi des trois.**

1. **Type de home** (choisi selon l'intent des mots-clés) :
   - `comparateur` (transactionnel : prix, meilleur, souscrire) → `ComparateurHome`.
   - `magazine` (informationnel : guides, actus) → `MagazineHome` (**défaut**).
   - `portail` / variantes animées (`marche`, `fil`) → traitements alternatifs.
2. **Mixage des variantes** : `docs/design-reference/volteo/` contient **4 versions** de chaque type
   (`home-comparateur-V1..V4` + `home-comparateur-marche`, `home-magazine-V1..V4` + `home-magazine-fil`,
   `home-portail-V1..V4`, `hub-categorie-V1..V4`, `article`). **Elles montrent des TRAITEMENTS différents**
   (hero, ordre des sections, animations, densité). Claude les **étudie, puise et RECOMBINE** — il ne
   copie **jamais** une variante telle quelle. C'est ici que naît l'unicité structurelle.
3. **Tokens (skin) mutés** : couleurs / fonts / formes (§2).

> Anti-footprint : deux sites du réseau ne doivent jamais partager le même mix (type + sections + tokens).
> Tracer le choix (type de home + skin) par site pour forcer la diversité.

---

## 1. Réutiliser les composants, varier l'assemblage

Le but n'est PAS de réécrire des composants par site, mais de **réutiliser au maximum** ceux du moteur
et de varier : le **type de home**, **l'ordre / la présence des sections**, les **traitements** (cartes,
hero, mosaïque vs grille…) inspirés des variantes, et les **tokens**. Un nouveau composant ne se crée
que si un traitement n'existe nulle part.

---

## 2. Où s'appliquent les tokens (skin) — NOUVEAU

Le moteur utilise les **tokens Voltéo**. Appliquer/muter la DA = surcharger :

- **`app/styles/volteo.css` `:root`** — `--cream`, `--cream-2`, `--paper`, `--ink`, `--ink-2`, `--ink-3`,
  `--line`, `--primary`, `--primary-d`, `--primary-soft`, `--spark`, `--cat-1..5` (+ `-soft`),
  `--r-sm/--r/--r-lg/--r-xl`, ombres.
- **`app/layout.tsx`** — les fonts `next/font` (`--next-font-display`/`--next-font-primary`).

⚠️ **Plus** via `niche.config.palette` ni `globals.css --accent-1`. Les blocs « prêts à coller » des
skins (ci-dessous) donnent les valeurs ; on les écrit dans `volteo.css :root`.

### Skins de départ (valeurs `:root` à coller dans volteo.css)

| Skin | --cream / --paper / --ink | --primary / --spark | --r | fonts (display / body) |
|---|---|---|---|---|
| **V1 Électrique** (défaut, clair) | #EDF1F8 / #FFF / #0D1626 | #3D5AFE / #CCFF48 | 16px | Bricolage Grotesque / Hanken Grotesk |
| **V2 Éditorial** (clair) | #FBF7F0 / #FFF / #1B1813 | #9E2B25 / #C8922F | 3px | Newsreader / Hanken Grotesk |
| **V3 Suisse** (clair) | #FFF / #FFF / #0A0A0A | #E2231A / #E2231A | 0 | Helvetica Neue / Helvetica Neue |
| **V4 Premium sombre** | #0C1118 / #141E2D / #EAF0F8 | #7C9CFF / #CCFF48 | 16px | Sora / Hanken Grotesk |

Verticale → `--cat-1..5` (énergie/assurance/auto/tech, cf. les packs `assets/vertical-*.css`).
**Muter** ensuite (teinte de marque ±12–45°, paire de fonts du même registre, rayons) pour rester unique.

---

## 3. Init en DEUX PHASES — PREVIEW puis BUILD

### Phase 1 — PREVIEW (valider le design AVANT de tout construire)

Objectif : **VOIR** le design proposé, vite, sans rien générer de lourd. Claude :

1. Choisit le **type de home** + compose le **mix** (sections puisées dans les variantes) + applique +
   **mute** les **tokens** dans `volteo.css` (+ fonts dans `layout.tsx`).
2. Construit **le strict minimum pour voir** :
   - **la home** (type choisi),
   - **UN** hub / page catégorie (placeholder),
   - **UN** article (placeholder).
3. Avec du **contenu bouchon** + **images placeholder** (le composant `.ph` / `ImagePlaceholder`) —
   **AUCUNE génération d'images** (1 hero max si vraiment nécessaire).
4. **STOP. Montre le preview à l'utilisateur et attend sa validation.**

**INTERDIT en preview** : construire toute l'arborescence, générer toutes les images, écrire tous les
articles, créer la tâche de rédaction. On veut juste **valider la direction visuelle**.

### Phase 2 — BUILD (seulement après validation du design)

Une fois le design validé : créer **toute l'arborescence** (catégories, pages, articles d'amorçage),
générer les images **dans le plafond** (§4), écrire le contenu réel sourcé, créer la tâche de rédaction.

---

## 4. Plafond images (strict)

- **Preview** : **placeholders uniquement** (zéro génération, 1 hero max).
- **Build** : **≤ ~5 images** — hero de la home + couverture du hub. **Jamais** une image par catégorie
  ni par article à l'init. Le reste **à la demande** (fine-tuning) ou via la **tâche de rédaction**
  quotidienne (`cover` + `mid`). `next/image` uniquement · `alt` FR + EN.

---

## 5. Checklist — design validé (fin de PREVIEW)

- [ ] **Type de home** choisi selon l'intent (comparateur/magazine/portail).
- [ ] **Mix** assumé : sections/hero/traitements recombinés depuis ≥ 2 variantes — pas une copie d'une variante.
- [ ] **Tokens** appliqués dans `volteo.css :root` + fonts dans `layout.tsx`, puis **mutés** (anti-footprint).
- [ ] Contraste AA · fond ≠ blanc pur (sauf V3) · mode cohérent.
- [ ] Preview = **home + 1 hub + 1 article**, en **placeholders**, **zéro image générée** (1 hero max).
- [ ] **Rien** d'autre construit (pas d'arborescence complète, pas d'images en masse). **Validation demandée.**

Un init qui part en « build tout + génère toutes les images » avant validation = **bug d'init**.
Un site qui ressort en **clone d'une variante** ou avec les **tokens bruts d'un skin** = **bug d'init**.
