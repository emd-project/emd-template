---
name: nouveau-site
version: 1.0.0
description: Point d'entrée unique pour configurer un site neuf forké depuis emd-template. ROUTE automatiquement vers le bon skill d'init selon l'état du repo, sans jamais déclencher le /init intégré de Claude (qui ne fait que documenter le code). À utiliser dès qu'un utilisateur veut bootstrapper/configurer un site. Triggers explicites — « /nouveau-site », « nouveau site », « crée le site », « configure le site », « initialise ce site », « setup le site », « bootstrap le site », « lance la configuration », « configure depuis init-spec ». Ce skill ne rédige rien lui-même : il détecte le contexte puis délègue à configure-from-spec (si init-spec.md présent) ou init-site (sinon).
allowed-tools:
  - Read
  - Glob
  - Bash
---

# nouveau-site — Routeur d'initialisation de site

Ce skill est le **point d'entrée unique** pour configurer un site neuf. Il existe pour une raison précise : la phrase « lance l'init » ou « init » déclenche le `/init` **intégré** de Claude (qui se contente de générer un CLAUDE.md de documentation = « bête copie » du repo). Ce routeur capte l'intention et délègue au vrai pipeline EMD.

Ne JAMAIS exécuter le `/init` intégré sur un repo emd-template. Toujours passer par ce routeur.

## Étape 0 — Pré-requis MCP (vérification dure)

Avant toute chose, vérifier que l'outil de génération d'images est disponible : `mcp__nano-mentionbox__generate_image`.

- **Disponible** → continuer.
- **Indisponible** → STOP. Prévenir l'utilisateur :
  > Le MCP nano-mentionbox n'est pas branché sur cette machine. L'app locale doit tourner et le MCP doit être installé (script « Installer MCP »). Sans lui, le site sortira sans logo ni images — ce qui est un échec d'init. Branche le MCP, puis relance `/nouveau-site`.

  Ne pas continuer en mode dégradé silencieux. L'init produit OBLIGATOIREMENT une DA + des images (cf. skills `init-site` / `configure-from-spec`).

## Étape 1 — Détecter le contexte

Vérifier l'état du repo, dans cet ordre :

1. **`init-spec.md` à la racine ?** (`ls init-spec.md` ou Glob)
   - **Oui** → c'est une entrée wizard. Router vers le skill **`configure-from-spec`**. Annoncer :
     > `init-spec.md` détecté (sortie du wizard). Je configure le site automatiquement depuis la spec.
   - **Non** → passer au point 2.

2. **`niche.config.ts.market` déjà rempli (≠ placeholder) et `content/*` sans TODO ?**
   - **Oui** → le site est **déjà configuré**. Ne PAS relancer un init complet. Demander à l'utilisateur ce qu'il veut amender (un bloc précis, la DA, un refresh) et router vers le skill adéquat.
   - **Non** → passer au point 3.

3. **Repo frais, pas de spec** → router vers le skill **`init-site`** (interview groupé en chat). Annoncer :
   > Pas de `init-spec.md` : je lance l'interview d'init en chat (~10 min), puis je compose la DA et génère les images.

## Étape 2 — Déléguer

Charger le skill cible (`configure-from-spec` OU `init-site`) et le laisser dérouler sa procédure complète. Ce routeur ne réécrit pas leur logique — il choisit lequel exécuter.

Rappel non négociable, quel que soit le chemin : un site qui sort de l'init avec le **thème par défaut** (`#FF3D57`, dark/aurora, logo `emd·template`) OU avec des **placeholders d'images** est un **échec d'init**. La DA composée + les images structurelles sont obligatoires.

## Ce que ce skill NE fait PAS

- Il ne pose pas les questions d'interview lui-même (c'est `init-site`).
- Il ne parse pas l'`init-spec.md` lui-même (c'est `configure-from-spec`).
- Il ne rédige aucun article (ce sont `ton-of-voice` + `seo-geo-redaction` + `humaniser-fr`).
- Il ne déclenche jamais le `/init` intégré de Claude.
