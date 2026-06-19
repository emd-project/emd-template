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

## 2. Où s'appliquent les tokens (skin) — SOURCE UNIQUE

La consolidation des tokens est **faite**. La source canonique de la DA est désormais **`niche.config.palette`**,
qui réécrit les tokens **`app/globals.css :root`**. On applique/mute la DA en **deux endroits seulement** :

- **`niche.config.ts` → `palette` + `style`** — la palette (`accent1..5`, `bgPrimary`, `bgSurface`,
  `bgSurface2`, `textPrimary`, `textSecondary`, `textMuted`) alimente les tokens `:root` de `globals.css` :
  `--accent-1..5`, `--bg-primary` / `--bg-surface` / `--bg-surface-2`, `--text-primary` / `--text-secondary`
  / `--text-muted`, `--border` / `--border-strong`. `style.mode` (`'dark' | 'light'`) fixe le mode ;
  `style.hero` (`'split' | 'centered' | 'minimal'`) pilote le type de home ; les **rayons**
  (`--radius-sm/md/lg/xl/full`) sont fixés dans `globals.css`.
- **`app/layout.tsx`** — les fonts `next/font` (`--next-font-display` / `--next-font-primary`), choisies
  d'après `niche.fonts.display` / `niche.fonts.body`.

> ⚠️ **`app/styles/volteo.css :root` est désormais une couche d'ALIAS vers les tokens `globals.css`.**
> **NE JAMAIS y écrire de valeurs** (`--cream`, `--ink`, `--primary`, `--spark`, `--r`, etc. ne sont plus
> que des alias de `--bg-*` / `--text-*` / `--accent-*` / `--radius-*`). Y poser une valeur **re-casserait
> la source unique** et désynchroniserait la DA. Toute la DA passe par **`niche.config.palette` → `globals.css`
> (+ fonts dans `layout.tsx`)**, **plus jamais** par `volteo.css`.

### Directions de départ (5 DA)

Les valeurs de départ ne sont **plus** des blocs `:root` de volteo, mais des presets exprimés en
**tokens `globals` / `niche.config.palette`**. Voir **[`docs/DA-DIRECTIONS.md`](../../DA-DIRECTIONS.md)** :
5 directions complètes (Électrique, Éditorial, Net/Suisse, Premium sombre, Chaleureux), chacune donnant
`--accent-1` + accent secondaire, le mode bg (clair/foncé), les rayons, la paire de fonts et la densité.

### Skins de départ (exprimés en tokens globals / niche.config.palette)

| Skin (direction) | `palette.bgPrimary` / `bgSurface` / `textPrimary` | `--accent-1` / accent secondaire | `--radius-*` | fonts (display / body) | mode |
|---|---|---|---|---|---|
| **V1 Électrique** (défaut, clair) | `#EDF1F8` / `#FFF` / `#0D1626` | `#3D5AFE` / lime `#CCFF48` | `--radius-lg` 16px | Bricolage Grotesque / Hanken Grotesk | light |
| **V2 Éditorial** (clair crème) | `#FBF7F0` / `#FFF` / `#1B1813` | `#9E2B25` / or `#C8922F` | `--radius-sm` ~3px | Newsreader (serif) / Hanken Grotesk | light |
| **V3 Net / Suisse** (blanc) | `#FFFFFF` / `#FFF` / `#0A0A0A` | `#E2231A` (ou noir) | `0` (pas de rayon) | Helvetica-like / Helvetica-like | light |
| **V4 Premium sombre** | `#0C1118` / `#141E2D` / `#EAF0F8` | `#7C9CFF` / lime `#CCFF48` | `--radius-lg` 16px | Sora / Hanken Grotesk | **dark FIXE** |
| **V5 Chaleureux** (clair sable) | `#F7F1E6` / `#FFF` / `#231C14` | `#C2410C` / vert sauge | `--radius-md` ~8px | Inter-like (humaniste) / idem | light |

> On renseigne ces valeurs dans **`niche.config.palette`** (les `accent1`/`bgPrimary`/`textPrimary`…),
> jamais dans `volteo.css`. On **mute** ensuite (teinte de marque ±12–45°, paire de fonts du même
> registre, rayons) pour rester unique. Un site est **light OU dark fixe — pas de toggle**.

---

## 3. Init en DEUX PHASES — PREVIEW puis BUILD

### Phase 1 — PREVIEW (valider le design AVANT de tout construire)

Objectif : **VOIR** le design proposé, vite, sans rien générer de lourd. Claude :

1. Choisit le **type de home** + compose le **mix** (sections puisées dans les variantes) + applique +
   **mute** les **tokens** via **`niche.config.palette` → `globals.css`** (+ fonts dans `layout.tsx`).
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

> Note : le **logo & le favicon** ne sont **pas** des images raster Gemini — ce sont un **mark SVG sur
> mesure** + wordmark, posés inline dans `Nav.tsx` et `app/icon.svg`. Cf. **[`docs/DA-DIRECTIONS.md`](../../DA-DIRECTIONS.md)
> § LOGO & FAVICON**. Gemini reste réservé aux **photos**.

---

## 5. Checklist — design validé (fin de PREVIEW)

- [ ] **Type de home** choisi selon l'intent (comparateur/magazine/portail).
- [ ] **Mix** assumé : sections/hero/traitements recombinés depuis ≥ 2 variantes — pas une copie d'une variante.
- [ ] **Tokens** appliqués via **`niche.config.palette` → `globals.css`** + fonts dans `layout.tsx`, puis
      **mutés** (anti-footprint). **Rien d'écrit dans `volteo.css :root`** (alias only).
- [ ] **Direction** choisie parmi les 5 de `DA-DIRECTIONS.md` puis mutée. Mode **light OU dark fixe** (pas de toggle).
- [ ] **Logo = mark SVG sur mesure + wordmark** (inline `Nav.tsx`) · **favicon = mark seul** (`app/icon.svg`) — unique par site.
- [ ] Contraste AA · fond ≠ blanc pur (sauf direction Net/Suisse) · mode cohérent.
- [ ] Preview = **home + 1 hub + 1 article**, en **placeholders**, **zéro image générée** (1 hero max).
- [ ] **Rien** d'autre construit (pas d'arborescence complète, pas d'images en masse). **Validation demandée.**

Un init qui part en « build tout + génère toutes les images » avant validation = **bug d'init**.
Un site qui ressort en **clone d'une variante**, avec les **tokens bruts d'un skin**, ou avec une **valeur
écrite dans `volteo.css :root`** = **bug d'init**.
