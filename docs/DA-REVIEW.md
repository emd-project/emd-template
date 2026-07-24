# DA-REVIEW — relire ses propres captures

> Checklist à dérouler sur `.da-shots/` après `node scripts/da-shots.mjs`.
> **Obligatoire en full-auto** : il n'y a plus de validation humaine avant le build,
> donc c'est le SEUL juge entre le CSS écrit et le site livré.

## Pourquoi

La DA était écrite à l'aveugle. Un bug de contraste pouvait vivre des mois :
correct en mode clair, texte invisible en mode sombre, aucune étape capable de
faire la différence. Quatre fichiers de layout étaient dans ce cas.

On ne juge donc pas sur le code. **On regarde les images.**

---

## 1. Lisibilité — la paire clair/sombre (BLOQUANT)

Ouvrir chaque route dans les **deux** modes, côte à côte. Pour chaque bloc :

- [ ] Le texte est-il lisible dans les **deux** captures ? Un bloc qui disparaît
      dans un seul mode = **bug de paire invariante**.
- [ ] Les surfaces sombres volontaires (ticker, tableau, une, encart final,
      voile photo) restent-elles sombres **dans les deux modes** ?
- [ ] Le texte posé sur un **accent plein** (bandeau stats, bloc promo, badges)
      est-il lisible **dans les deux modes** ?

> **La règle** : un couple de tokens n'est sûr que si les DEUX s'inversent ensemble.
> `--ink` + `--bg-primary` ✅ · `--ink` + `#fff` ❌ · accent + `--bg-primary` ❌
> Correctif : `--chrome-*` / `--on-accent` (`app/styles/volteo-chrome.css`).
> Le lint `tests/unit/da-guards.test.ts` attrape les littéraux ; il n'attrape PAS
> un mauvais couple de tokens. C'est ici que ça se voit.

## 2. Les 7 symptômes du site fait par IA (cf. `DA-ANTI-IA.md`)

En cumuler 3 = identifié comme généré. Sur les captures :

- [ ] Hero centré à dégradé bleu-violet
- [ ] Cards à icônes pastel rondes
- [ ] Bento grid parfaitement symétrique
- [ ] Texte « lorem-y » (superlatifs vides, structure identique partout)
- [ ] Boutons dégradé + ombre portée
- [ ] Palette trop propre (2 couleurs, zéro aspérité)
- [ ] Typographie monotone (un seul poids, aucune hiérarchie)

## 3. Typographie

- [ ] La font **display** est-elle visiblement différente de la **body** ?
      (si elles se ressemblent, `suggestFonts` n'a pas été appliqué à `layout.tsx`)
- [ ] Est-ce encore **Bricolage Grotesque / Hanken Grotesk** ? → l'init n'a pas tourné.
- [ ] La hiérarchie H1 → H2 → H3 → corps est-elle lisible **sur la capture**,
      sans lire le CSS ?

## 4. Empreinte réseau — la question qui compte à 500 sites

- [ ] Mise à côté de la dernière capture d'un **autre** site du réseau : est-ce
      qu'on voit deux sites différents, ou le même avec une autre couleur ?
- [ ] Qu'est-ce qui diffère **réellement** ? Si la réponse est « la teinte de
      l'accent », ce n'est **pas suffisant**. Doivent aussi varier : le squelette,
      le rythme vertical, la stratégie de surface, l'usage des accents.
- [ ] Le nombre d'accents utilisés visuellement est-il le même partout (5) ?
      Un site en mono-accent ne ressemble à aucun autre.

## 5. Structure & responsive

- [ ] Mobile : aucun débordement horizontal, burger accessible à droite.
- [ ] Desktop : la home ne fait pas défiler à l'infini une même grille répétée.
- [ ] Les images sont-elles de vraies images, ou des placeholders `.ph` rayés ?
      Des placeholders en prod = **bug d'init**.

---

## Verdict

Un point BLOQUANT de la section 1 → **corriger et re-shooter**, pas de build.
Trois symptômes ou plus en section 2 → reprendre la DA avant de continuer.
Section 4 sans réponse convaincante → la variété est cosmétique : c'est le signe
qu'il faut faire varier la **structure**, pas la palette.
