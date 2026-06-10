# Références design

## ✅ Source canonique : `volteo/`

**[`volteo/`](volteo/README.md) est LA référence design du moteur.** C'est elle qu'on lit à l'init
(via [`docs/AUTO-DESIGN.md`](../AUTO-DESIGN.md)) : 4 skins prouvés (V1–V4) + 4 verticales + le mode
d'emploi complet ([`volteo/DESIGN-NOTES.md`](volteo/DESIGN-NOTES.md) : mapping, blocs prêts à coller,
mutation, checklist).

Doctrine : **partir d'un skin Voltéo → l'appliquer → le muter** pour rester unique. On ne compose plus
une DA « à partir de zéro ».

## 🗄️ Anciens packs d'inspiration (optionnels, hors chemin d'init)

Les dossiers ci-dessous datent de l'ancienne approche « composer depuis zéro ». Ils ne sont **plus sur
le chemin d'init**. On peut éventuellement y puiser une **idée d'animation/traitement à réinterpréter**
pendant l'étape de **mutation** d'un skin — jamais pour cloner.

| Dossier | Statut |
|---|---|
| `comparateur-energie/` | **Remplacé par `volteo/`** (c'était le Voltéo early). À supprimer. |
| `magazine-blog/` | Inspiration mutation optionnelle (archétype magazine). |
| `beam-projecteur/` | Inspiration mutation optionnelle (glow / dual ink-paper). |
| `robot-tondeuse/` | Inspiration mutation optionnelle (éditorial organique, serif). |
| `klarolab/` | Inspiration mutation optionnelle (fintech dark glass). |

## ⚠️ Règle anti-footprint (inchangée)

Deux sites ne doivent **jamais** partager la même DA. Un skin Voltéo est un **point de départ** :
toujours le **muter** (teinte de marque, fonts, rayons — cf. `volteo/DESIGN-NOTES.md` §6). Un site qui
ressort en valeurs brutes d'un skin = footprint SEO détectable = **bug d'init**.
