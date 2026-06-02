# WIZARD — Étape Design (nano-mentionbox « Créer EMD »)

Spécification de l'étape « Design » du wizard. Objectif : **cadrer Claude à l'init** pour qu'il
sorte une vraie DA. Deux voies mutuellement exclusives. Le wizard écrit le résultat dans le bloc
`## Design` de `init-spec.md` (lu par `configure-from-spec` → `docs/AUTO-DESIGN.md`).

## Texte d'intro (copie UI suggérée)

> **Le design de ton site.** Deux options :
> — Tu as une maquette Claude Design ? Importe le ZIP, on l'intègre tel quel.
> — Pas de maquette ? Réponds à 4 questions, Claude compose une vraie direction artistique
>   adaptée à ta niche (tu pourras la remplacer plus tard si le site performe).

## Voie 1 — Import ZIP (design sur-mesure)

- Champ upload d'un `.zip` Claude Design.
- Le backend décompresse et pousse les fichiers dans `design-incoming/` du repo forké.
- Bloc init-spec :

```yaml
## Design
source: zip
```

→ `configure-from-spec` Cas A : délègue à `integrate-claude-design`.

## Voie 2 — Questionnaire (par défaut, « je n'y connais rien »)

4 questions, toutes avec une option « Laisse Claude choisir » pour ne jamais bloquer :

1. **Type de site** (pilote la home + le hero)
   - Comparateur (offres, prix, outils)
   - Magazine / blog informationnel (articles à la une)
   - Hybride (éditorial + comparateur)
2. **Ambiance** (1-3 choix — pilote palette + fonts)
   - Confiance / sérieux · Éditorial / chic · Tech / moderne · Chaleureux · Vif / jeune ·
     Premium / luxe · Écolo / nature
3. **Couleur de marque** (optionnel)
   - Un hex, ou « Laisse Claude choisir »
4. **Clair ou sombre**
   - Clair · Sombre · Laisse Claude décider

Optionnel (replié, « pour aller plus loin ») :
- **Site de référence / inspiration** (URL ou nom)
- **Sections incontournables** (multi) : articles à la une, comparateur, estimateur, deals,
  quiz, newsletter

### Bloc init-spec produit

```yaml
## Design
source: questionnaire
archetype: magazine          # comparateur | magazine | hybride
mood: [editorial, chic]      # 1-3 mots
brandColor: auto             # hex (#1AA35F) ou auto
mode: light                  # light | dark | auto
reference: "the-verge.com"   # optionnel
mustHaveSections: [featured-articles, categories, newsletter]  # optionnel
```

→ `configure-from-spec` Cas B : exécute `docs/AUTO-DESIGN.md`, qui lit ce bloc pour choisir
l'archétype (home + hero), puis compose palette/fonts via `composePreset()` avec `mood` +
`brandColor` + `mode`.

## Règle

Le bloc `## Design` est **toujours présent** dans init-spec. S'il manque, AUTO-DESIGN infère
l'archétype et les moods depuis la niche (mode dégradé), mais ne laisse jamais les placeholders.
