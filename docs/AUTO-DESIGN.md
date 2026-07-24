# AUTO-DESIGN — DA à l'init (doctrine v4 : système de variantes, full-auto)

> **Voltéo est le moteur** : les composants RSC produisent déjà toutes les structures. L'unicité d'un
> site vient de la **sélection** dans le **système de variantes** : (squelette choisi) × (permutations
> de tokens) × (palette/typo). La sélection est **déterministe et automatique** — zéro validation.

> **v4** — trois corrections par rapport à v3 :
> 1. l'« override thématique » en langue naturelle est **SUPPRIMÉ** (il écrasait le résolveur) ;
> 2. `presse` est ajouté partout (il manquait dans les 3 listes de variantes) ;
> 3. la **typo** a enfin une étape à elle (`suggestFonts` était cité mais jamais exécuté).

## Quand exécuter

Init (`configure-from-spec` ou `init-site`, via `nouveau-site`), si `design-incoming/` est vide.
- `design-incoming/` non vide → `integrate-claude-design` (livrable Claude Design fourni).
- vide → dérouler la sélection auto ci-dessous.

---

## La DA = 4 leviers — `niche.config.ts` (+ `layout.tsx` pour les fonts)

### 1. Famille — `lib/niche-classify.ts`

**C'est la SEULE décision de famille. Ne pas la refaire à la main.**

```ts
import { classifyNiche } from '@/lib/niche-classify'
const { family, head, confidence, reason, conflict } = classifyNiche({
  domain: niche.domain,
  siteName: niche.siteName,
  sector,               // colonne CATÉGORIE de pipeline/sites.csv, ou secteur de la spec
})
```

L'axe de décision : **peut-on SOUSCRIRE l'entité en ligne, ou est-ce un objet acheté ailleurs ?**

| Famille | Quand | Pool de home |
|---|---|---|
| `comparateur` | service souscriptible : assurance, banque, énergie, télécom, crédit, casino, VPN, forfait | ⅔ `marche` · ⅓ `comparateur` |
| `beaute` | beauté & mode | `presse` (identité complète) |
| `editorial` | produit physique (voiture, aspirateur, TV…), hospitality, tech, **et défaut prudent** | ⅔ `magazine` · ⅓ `fil` |

> ⛔ **NE PAS classer sur « la requête est-elle comparative ? »**
> Presque tous les domaines du réseau le sont (« meilleure-citadine », « comparatif-aspirateur »).
> Ce critère — c'était la règle de la v3 — envoyait **tout le monde** sur la home comparateur, y
> compris les sites produit. « meilleure-citadine » est un site **magazine** : on n'achète pas une
> citadine en ligne. Le modificateur (`meilleur`, `comparatif`, `top`, `prix`…) est du **bruit** ;
> le signal est l'**entité** (`citadine`).

- **Le secteur fait foi** quand il est disponible — c'est la vérité terrain.
- `conflict` renseigné → le secteur et le domaine se contredisent : **le signaler**, c'est presque
  toujours un libellé douteux dans `sites.csv`.
- `confidence: 'low'` → aucun mot-clé reconnu, défaut prudent `editorial` : **l'annoncer** aussi.

### 2. Squelette + permutations — `lib/variants.ts`

```ts
import { suggestVariants } from '@/lib/variants'
const v = suggestVariants(niche.domain, family)   // family : celle de classifyNiche
```

`suggestVariants(niche.domain)` **sans 2ᵉ argument fonctionne aussi** — la famille est alors déduite
du seed. Passer `family` explicitement reste préférable dès que le **secteur** est connu.

- **Home** : `magazine` · `comparateur` · `marche` · `fil` · **`presse`**
  (`marche` nécessite `content/data/classements.json`).
- **Catégorie** : `classic` · `editorial` · **`presse`**. **Article** : `classic` · **`presse`**.
- ⚠️ `presse` est une **IDENTITÉ**, pas une home : dès `layouts.home === 'presse'`, `isPresse()`
  bascule le layout (masthead + footer éditoriaux) **et** les vues catégorie/article.
- **Permutations** : `shape` (`rounded`/`soft`/`sharp`) · `border` (`standard`/`hairline`/`bold`) ·
  `shadow` (`standard`/`flat`/`deep`) → écrire dans `niche.config.permutations`.
  Appliquées par `PermutationStyle` (override de tokens en `!important`, theme-safe) — **rien en CSS**.
- Écrire `niche.style.hero` cohérent (`split` pour comparateur/marche, sinon `centered`).

### 3. Palette — `niche.config.palette` → `app/globals.css`

- Spec fournit `brandColor`/`skin` → les utiliser.
- Sinon **partir d'une des 5 directions de [`DA-DIRECTIONS.md`](DA-DIRECTIONS.md)** (choisie selon la
  niche + l'intent), **PUIS LA MUTER** : teinte de marque ±12–45°, accent secondaire ré-accordé.
  Deux sites du réseau ne partagent **jamais** une direction non mutée.
- Écrire dans **`niche.config.palette`**, puis **propager** dans **`app/globals.css`**.

> ⚠️ **`globals.css` contient PLUSIEURS blocs de palette** — `@theme`, `:root`,
> `@media (prefers-color-scheme: light)`, `html[data-theme="light"]`, `html[data-theme="dark"]`,
> plus deux valeurs dans `volteo-hub.css`. Réécrire seulement `:root` + `@theme` laisse tous les
> sites **identiques en mode clair**. Les traiter TOUS.

> `lib/da-presets/` (161 palettes) reste un **fallback profond** pour une niche vraiment hors-cadre
> (SaaS, portfolio). Ne pas y aller par défaut : muter une des 5 directions donne un meilleur résultat.

### 4. Typographie — `suggestFonts` → `app/layout.tsx`

```ts
import { suggestFonts } from '@/lib/typography'
const pair = suggestFonts(niche.domain, v.home)   // 16 paires curées, biaisées par l'archetype
```

**Écrire la paire dans `app/layout.tsx`** via `next/font/google` (imports **statiques** : nom Google →
espaces remplacés par `_`, ex. `Space Grotesk` → `Space_Grotesk`), alimentant `--next-font-display`
(titres) et `--next-font-primary` (corps).

> ⚠️ **`niche.config.fonts` n'est lu par AUCUN code.** L'y écrire sans toucher `layout.tsx` ne change
> **rien** au rendu — c'est le piège n°1 : le site sort en Bricolage/Hanken par défaut alors que la
> config annonce autre chose. La source réelle de la typo, c'est `layout.tsx`, point.
> Renseigner `niche.config.fonts` **en plus**, pour la traçabilité.

> ⚠️ **`app/styles/volteo.css :root` est une couche d'ALIAS — NE JAMAIS y écrire de valeurs.**

- Mode **light OU dark** selon la DA, contraste **AA**.
- Si le site est **sombre** : vérifier les surfaces de chrome (cf. `app/styles/volteo-chrome.css`).
  Ne jamais poser un token qui s'inverse (`--ink`, `--bg-primary`, `--cream`) sur un fond qui ne
  s'inverse pas (accent, scrim photo) → texte invisible. Utiliser `--chrome-*` / `--on-accent`.

---

## Animation (globale, unique)
`app/styles/volteo-motion.css` : révélation « fade-up » au scroll, 100 % CSS (scroll-driven), zéro JS,
`@supports` + `prefers-reduced-motion`. **Identique partout**, rien à configurer.

---

## Procédure (full-auto, sans validation)

1. **Famille** : `classifyNiche({ domain, siteName, sector })` → **annoncer** `family` + `reason`
   (+ `conflict` / `confidence: 'low'` s'il y en a).
2. **Variantes** : `suggestVariants(niche.domain, family)` → écrire `niche.config.layouts`
   (`home`, `category`, `article`) + `niche.config.permutations` + `niche.style.hero`.
3. **Palette** : direction mutée → `niche.config.palette` → **tous** les blocs de `globals.css`.
4. **Typo** : `suggestFonts(niche.domain, home)` → **`app/layout.tsx`** (+ `niche.config.fonts` pour trace).
5. **Dépublier les previews** : supprimer `/home-vN`, `/cat-vN`, `/art-vN` (+ `/en/...`).
6. **Annoncer** (sans s'arrêter) le récapitulatif, puis enchaîner le BUILD.

> Sélection déterministe (seed domaine) + famille (secteur) → deux sites divergent automatiquement
> (squelette, formes, palette **et** typo) sans choix manuel.

---

## BUILD

- **Arborescence + seed réel sourcé** ; **seed BILINGUE si `locales` ≥ 2** (FR + miroir + paire
  `lib/i18n/article-slugs.ts`) — un `/en` vide = échec.
- **Images — plafond strict ≤ ~5** (hero home + couverture hub). **JAMAIS** par catégorie/article.
  Cf. `IMAGES-WORKFLOW.md`.
- **Logo & favicon** = mark SVG sur mesure + wordmark (inline `Nav.tsx` + `app/icon.svg`).
- **Tâche de rédaction** quotidienne (cf. `SCHEDULED-TASK-REDACTION.md`).

---

## Garde-fous (bug d'init si violé)

- Site qui sort avec le **thème par défaut** (`#FF3D57`, logo `emd·template`, **fonts non changées
  dans `layout.tsx`**) ou des **placeholders d'images** en prod.
- **Palette propagée dans `:root` seulement** → tous les sites identiques en mode clair.
- **Valeur écrite dans `volteo.css :root`**.
- **Aucune variante choisie** : `niche.config.layouts` doit être renseigné.
- **Famille décidée à la main** au lieu de `classifyNiche` (c'est ce qui envoyait les sites produit
  sur une home comparateur).
- **Previews non dépubliées** : `/home-vN`, `/cat-vN`, `/art-vN` ne doivent plus exister en prod.
- Images > 5 au build, ou une image par catégorie/article.

---

## ⚠️ Contradiction connue — à trancher

**[`design-reference/volteo/DESIGN-NOTES.md`](design-reference/volteo/DESIGN-NOTES.md) §3** décrit
encore un init **en deux phases avec validation utilisateur** (« STOP. Montre le preview et attend sa
validation »), et qualifie de « bug d'init » ce que la présente procédure demande de faire.

**C'est CE fichier qui fait foi : l'init est full-auto, sans phase de preview.** `DESIGN-NOTES.md` §0,
§1 et §3 sont périmés (ils décrivent aussi l'unicité « par assemblage / recombinaison des variantes
V1-V4 », remplacée par la sélection) et doivent être réécrits. En attendant, ne pas les suivre.

---

Garde-fous anti-IA : [`DA-ANTI-IA.md`](DA-ANTI-IA.md) · directions : [`DA-DIRECTIONS.md`](DA-DIRECTIONS.md)
· typo : [`DA-TYPOGRAPHY.md`](DA-TYPOGRAPHY.md) · fallback profond : [`DA-PRESETS.md`](DA-PRESETS.md).
Référence code : `lib/niche-classify.ts` · `lib/variants.ts` · `lib/typography.ts` ·
`components/layout/PermutationStyle.tsx` · `app/styles/volteo-chrome.css`.
