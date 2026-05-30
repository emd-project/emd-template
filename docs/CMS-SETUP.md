# Guide de configuration du CMS — emd-template

Ce document est un tuto pas-à-pas pour mettre en route le CMS sur un nouveau site issu du template. Il couvre : pré-requis, variables d'environnement, tokens GitHub, Vercel Blob, déploiement, premier login, gestion des rédacteurs, et troubleshooting.

**Durée estimée** : 30-45 minutes pour la première fois, 10 minutes pour les suivantes.

---

## Vue d'ensemble

Le CMS est intégré au site. Il tourne sur `/admin` et permet à des rédacteurs non-techniques de créer/éditer des articles, produits, auteurs et pages, sans toucher au code.

**Architecture résumée :**
- Pas de base de données. Le contenu est stocké sous forme de fichiers YAML/MDX dans ton repo GitHub.
- Chaque sauvegarde dans le CMS = un commit Git sur la branche principale.
- Les images uploadées sont stockées sur **Vercel Blob** (CDN), pas dans le repo.
- Authentification double : soit GitHub OAuth (admins), soit email + mot de passe (rédacteurs).
- Toutes les permissions sont gérées côté API, pas côté UI (l'interface est identique admin/rédacteur).

---

## 1. Pré-requis

Avant de commencer, tu dois avoir :

- [ ] Un compte **GitHub** avec le repo du site déjà créé et pushé
- [ ] Un compte **Vercel** connecté à ce repo, avec un premier déploiement réussi
- [ ] Le site public accessible sur son URL (ex: `https://monsite.vercel.app`)
- [ ] `openssl` disponible localement (macOS/Linux → déjà là, Windows → WSL ou Git Bash)

**Optionnel** (pour la génération d'images IA) :
- [ ] Une clé **Google AI Studio** (Gemini — recommandé) ou un compte **Black Forest Labs** (Flux — fallback)

---

## 2. Les 3 variables d'environnement obligatoires

Le CMS a besoin de **3 variables** pour fonctionner. Tu vas les générer dans les étapes suivantes, puis les coller dans Vercel.

| Variable | À quoi ça sert | Comment l'obtenir |
|---|---|---|
| `CMS_SECRET` | Chiffre les cookies de session du CMS (AES-256-GCM) | Commande locale (étape 3) |
| `CMS_GITHUB_TOKEN` | Permet au CMS de lire/écrire dans ton repo GitHub | Personal Access Token (étape 4) |
| `BLOB_READ_WRITE_TOKEN` | Permet au CMS d'uploader des images sur Vercel Blob | Créé automatiquement (étape 5) |

Tu peux aussi ajouter plus tard (optionnel) : `GITHUB_CMS_CLIENT_ID`, `GITHUB_CMS_CLIENT_SECRET` (OAuth GitHub pour admins), `GEMINI_API_KEY` (génération images Gemini — recommandé), `BFL_API_KEY` (génération images Flux — fallback).

---

## 3. Générer `CMS_SECRET`

C'est une clé aléatoire de 32 bytes en hexadécimal. Ouvre un terminal et lance :

```bash
openssl rand -hex 32
```

Tu obtiens quelque chose comme :

```
a3f7c9e8b2d4f1a6c8e3b5d7f9a1c4e6b8d2f4a7c9e1b3d5f7a9c2e4b6d8f1a3
```

**Copie cette valeur, tu vas la coller dans Vercel à l'étape 6.**

Ne la partage jamais. Ne la commit jamais. Si quelqu'un l'obtient, il peut forger des cookies de session et accéder à ton `/admin`.

---

## 4. Créer le Personal Access Token GitHub (`CMS_GITHUB_TOKEN`)

C'est le token qui permet au CMS de lire et écrire des fichiers dans ton repo GitHub via l'API. Il faut **un fine-grained token**, pas un classique.

### Étape 4.1 — Aller dans les settings

1. Connecte-toi à GitHub
2. Clique sur ton avatar en haut à droite → **Settings**
3. Dans le menu de gauche, tout en bas → **Developer settings**
4. **Personal access tokens** → **Fine-grained tokens**
5. Clique sur **Generate new token**

### Étape 4.2 — Remplir le formulaire

Copie-colle exactement ces valeurs :

| Champ | Valeur |
|---|---|
| **Token name** | `cms-[nom-du-site]` (ex: `cms-10minutescbd`) |
| **Expiration** | 1 year (ou custom selon ta politique) |
| **Description** | CMS access for site editing |
| **Resource owner** | Toi-même ou l'organisation propriétaire du repo |
| **Repository access** | **Only select repositories** → choisir UNIQUEMENT le repo concerné |

### Étape 4.3 — Permissions

C'est **l'étape critique**. Cherche la section **Repository permissions** et configure :

| Permission | Niveau | Raison |
|---|---|---|
| **Contents** | **Read and write** | Lire et modifier les fichiers de contenu (articles, YAML, etc.) |
| **Metadata** | **Read-only** (auto-coché) | Lister les fichiers du repo |

**Ne coche rien d'autre.** Le CMS n'a pas besoin de plus. Principe du moindre privilège.

### Étape 4.4 — Générer et copier

1. Clique **Generate token** en bas
2. **Copie immédiatement la valeur** affichée (elle commence par `github_pat_`)
3. Tu ne pourras plus la voir ensuite — si tu la perds, tu devras en créer une nouvelle

**Colle-la dans un endroit temporaire sécurisé** (gestionnaire de mots de passe, note chiffrée). Tu vas la mettre dans Vercel à l'étape 6.

---

## 5. Créer le Vercel Blob Store (`BLOB_READ_WRITE_TOKEN`)

Vercel Blob stocke les images uploadées via le CMS. Le token est **créé automatiquement** par Vercel quand tu crées le store — tu n'as rien à générer à la main.

### Étape 5.1 — Créer le store

1. Va sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique sur ton projet (celui du site)
3. En haut, onglet **Storage**
4. Clique **Create Database** → sélectionne **Blob**
5. Donne-lui un nom : `[nom-site]-images` (ex: `10minutescbd-images`)
6. **Important** : coche **Public access** (sinon les images ne seront pas affichables sur le site)
7. Clique **Create**

### Étape 5.2 — Connecter au projet

Après création, Vercel te propose de connecter le store au projet :

1. Clique **Connect to Project**
2. Sélectionne ton projet
3. Environment : **Production, Preview, Development** (tout cocher)
4. Clique **Connect**

**C'est tout.** Vercel a automatiquement ajouté `BLOB_READ_WRITE_TOKEN` aux variables d'environnement de ton projet. Tu n'as rien à copier-coller pour celle-là.

Pour vérifier : va dans **Settings → Environment Variables** du projet, tu dois voir `BLOB_READ_WRITE_TOKEN` dans la liste (valeur masquée).

---

## 6. Installer les variables d'environnement dans Vercel

Maintenant tu ajoutes `CMS_SECRET` (étape 3) et `CMS_GITHUB_TOKEN` (étape 4) dans Vercel.

### Étape 6.1 — Accéder aux env vars

1. Dashboard Vercel → ton projet
2. **Settings** (en haut)
3. **Environment Variables** (dans le menu de gauche)

### Étape 6.2 — Ajouter `CMS_SECRET`

1. **Key** : `CMS_SECRET`
2. **Value** : colle la valeur générée à l'étape 3 (le long hex)
3. **Environment** : coche **Production**, **Preview**, **Development**
4. Clique **Save**

### Étape 6.3 — Ajouter `CMS_GITHUB_TOKEN`

1. **Key** : `CMS_GITHUB_TOKEN`
2. **Value** : colle le token GitHub généré à l'étape 4 (commence par `github_pat_`)
3. **Environment** : coche **Production**, **Preview**, **Development**
4. Clique **Save**

### Étape 6.4 — Vérifier

Dans la liste des Environment Variables, tu dois maintenant voir au minimum :

- ✅ `BLOB_READ_WRITE_TOKEN` (ajouté automatiquement à l'étape 5)
- ✅ `CMS_SECRET`
- ✅ `CMS_GITHUB_TOKEN`

Si ces 3 variables sont présentes, le CMS peut fonctionner.

---

## 7. Redéployer pour activer les variables

**Les variables d'environnement ne sont prises en compte qu'au prochain déploiement.** Tu dois forcer un redéploiement.

### Méthode rapide

1. Dashboard Vercel → ton projet → onglet **Deployments**
2. Clique sur le dernier déploiement réussi (le plus récent en haut)
3. En haut à droite, clique sur les **trois points** `⋯`
4. **Redeploy**
5. Confirme (décoche "Use existing Build Cache" si proposé)

### Méthode alternative (nouveau commit)

Push n'importe quel petit changement sur la branche principale (ex: modifier le README). Vercel détecte le push et redéploie automatiquement.

### Vérification du build

1. Pendant que le build tourne, ouvre l'onglet **Logs**
2. Vérifie qu'il n'y a pas d'erreur "Missing environment variable"
3. Attends que le statut passe à **Ready** (vert)

Si le build échoue avec une erreur liée au CMS, va voir la section **Troubleshooting** en bas de ce tuto.

---

## 8. Premier accès au CMS

Une fois le redéploiement terminé (statut **Ready** sur Vercel), tu peux accéder au CMS.

### Étape 8.1 — Ouvrir l'interface admin

Va sur : `https://ton-domaine.vercel.app/admin`

Tu vois un écran de login avec deux onglets (ou deux zones) :
- **GitHub OAuth** (si tu l'as configuré — optionnel, voir section 11 plus bas)
- **Email / mot de passe** (toujours disponible)

### Étape 8.2 — Créer le premier admin

Au tout premier accès, **aucun utilisateur n'existe**. Il faut créer le premier admin à la main en ajoutant un fichier dans le repo.

**Méthode 1 — Via le script local** (recommandée)

Dans un terminal, sur ton projet local :

```bash
node -e "
const crypto = require('crypto');
const salt = crypto.randomBytes(16).toString('hex');
const email = 'ton-email@exemple.com';
const password = 'ton-mot-de-passe-12-chars-mini';
const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
console.log('- email:', email);
console.log('  name: \"Ton Nom\"');
console.log('  displayName: \"Ton Nom\"');
console.log('  role: admin');
console.log('  hash:', hash);
console.log('  salt:', salt);
"
```

Copie le résultat et colle-le dans `content/users.yaml` :

```yaml
- email: "ton-email@exemple.com"
  name: "Ton Nom"
  displayName: "Ton Nom"
  role: admin
  hash: "a3f7c9e8b2d4f1..."
  salt: "56c2148f8d9f74..."
```

Commit et push ce fichier :

```bash
git add content/users.yaml
git commit -m "chore: add first admin user"
git push
```

Vercel redéploie automatiquement.

**Méthode 2 — Via le CMS d'un autre site**

Si tu as déjà un site avec le CMS qui tourne, tu peux t'y connecter et utiliser la section **Users** pour créer un nouvel utilisateur dont les données seront accessibles.

### Étape 8.3 — Login

Retourne sur `https://ton-domaine.vercel.app/admin`, saisis ton email et ton mot de passe, et clique **Se connecter**.

Tu arrives sur le dashboard admin avec la sidebar de gauche qui liste toutes les collections (Articles, Auteurs, Produits, Catégories, Pages, Médias, Images du site) et la section Administration (Paramètres, Utilisateurs).

**Ça marche ?** Passe à l'étape 9.
**Ça ne marche pas ?** Va voir le Troubleshooting en fin de tuto.

---

## 9. Créer un rédacteur

Une fois connecté en admin, tu peux créer des comptes rédacteurs directement depuis l'interface.

### Étape 9.1 — Accéder à la gestion des utilisateurs

1. Dans la sidebar, **Administration** → **Utilisateurs**
2. Tu vois la liste des utilisateurs existants (au minimum toi)
3. Clique **+ Nouvel utilisateur** en haut à droite

### Étape 9.2 — Remplir le formulaire

| Champ | Valeur |
|---|---|
| **Email** | L'email réel du rédacteur (sert de login) |
| **Nom** | Nom complet ou pseudo |
| **Nom affiché** | Version user-friendly (affichée dans l'éditeur et la sidebar) |
| **Mot de passe** | Minimum 12 caractères. Génère-en un solide. |
| **Rôle** | **Rédacteur** (ne pas mettre Admin sauf si vraiment besoin) |

Clique **Créer**.

### Étape 9.3 — Transmettre les identifiants au rédacteur

Communique le login + mot de passe au rédacteur de manière sécurisée (**pas par email en clair**) :

- Gestionnaire de mots de passe partagé
- Message chiffré (Signal, ProtonMail)
- Appel + SMS séparé

Dis-lui de se connecter sur `https://ton-domaine.vercel.app/admin` et de changer son mot de passe au premier login (s'il le souhaite).

### Différences admin vs rédacteur

L'interface est **identique** pour les deux rôles. Les différences sont uniquement au niveau des permissions API :

- **Admin** : tout (créer, éditer, supprimer, gérer users, modifier settings)
- **Rédacteur** : créer et éditer articles/produits/auteurs, mais pas supprimer, pas toucher aux settings ni aux users

---

## 10. Workflow éditorial

### Créer un article

1. Sidebar → **Articles** → **+ Nouvel article**
2. Remplis les champs :
   - **Titre** (obligatoire)
   - **Description SEO** (max 155 caractères, obligatoire)
   - **Image principale** (upload, URL, ou génération IA si Flux configuré)
   - **Date de publication**
   - **Catégorie** (select depuis les catégories de ton `niche.config.ts`)
   - **Auteur** (select depuis les auteurs créés)
   - **Tags** (séparés par virgules)
   - **En bref** : 3 bullets qui s'afficheront dans le bloc AI Summary
   - **FAQ** : 6 questions minimum pour le SEO
   - **Sticky CTA** : bouton affilié qui reste collé en bas de l'article
3. Dans l'éditeur principal à gauche, rédige le corps de l'article en WYSIWYG (ou colle du Markdown, ou importe un `.md`)
4. Utilise les shortcodes MDX disponibles (`<ProductCTA>`, `<ProductCarousel>`, `<ArticleImage>`, `<Tip>`, `<Warning>`, `<Verdict>`, `<ProConTable>`, etc.)
5. **Statut** en haut à droite : **Brouillon** (ne sera pas visible) ou **Publier** (sera live)
6. Clique **Enregistrer**

Chaque sauvegarde commit le fichier `content/articles/[slug].mdx` sur ton repo GitHub. Vercel redéploie automatiquement et l'article apparaît sur le site en 30-60 secondes.

### Uploader une image

1. Sidebar → **Médias**
2. Clique **Upload** et sélectionne une image (PNG, JPEG, WebP, SVG)
3. L'image est uploadée sur Vercel Blob et immédiatement disponible
4. Copie son URL et colle-la dans le champ `featureImage` d'un article

### Générer une image avec l'IA

Si tu as configuré `BFL_API_KEY` (section 12 plus bas), tu peux :

1. Dans l'éditeur d'article, champ **Image principale** → bouton **✨ Générer avec IA**
2. Un champ texte apparaît, pré-rempli avec le titre de l'article
3. Adapte le prompt si nécessaire
4. Clique **Générer**
5. L'image est générée via Flux 2 Pro, uploadée sur Blob, et liée à l'article

### Gérer les catégories

1. Sidebar → **Catégories**
2. Tu peux créer/éditer les catégories (label affiché, description SEO)
3. Les slugs des catégories doivent correspondre à ceux définis dans `niche.config.ts`

### Éditer les textes de la home

1. Sidebar → **Pages**
2. Clique sur **home** dans la liste
3. Tu peux éditer : eyebrow, H1 prefix, H1 suffix, rotating words, subtitle, CTAs, textes de la section outils
4. Enregistre → le site se met à jour

---

## 11. (Optionnel) Configurer GitHub OAuth pour les admins

Par défaut, tout le monde se connecte avec email/mot de passe. Si tu préfères que les admins se connectent directement avec leur compte GitHub (sans mot de passe à gérer), configure une OAuth App.

### Étape 11.1 — Créer l'OAuth App

1. GitHub → ton avatar → **Settings** → **Developer settings** → **OAuth Apps**
2. **New OAuth App**
3. Remplis :
   - **Application name** : `CMS [nom-site]`
   - **Homepage URL** : `https://ton-domaine.vercel.app`
   - **Authorization callback URL** : `https://ton-domaine.vercel.app/api/cms/auth/callback`
4. **Register application**

### Étape 11.2 — Récupérer les credentials

Sur la page de l'app qui vient d'être créée :

1. Copie le **Client ID** (visible)
2. Clique **Generate a new client secret** → copie le secret (ne sera plus visible ensuite)

### Étape 11.3 — Ajouter dans Vercel

Dans **Settings → Environment Variables** de ton projet Vercel, ajoute :

- `GITHUB_CMS_CLIENT_ID` = le Client ID
- `GITHUB_CMS_CLIENT_SECRET` = le Client secret
- `CMS_ALLOWED_USERS` = liste des usernames GitHub autorisés, séparés par virgules (ex: `alice,bob`)

**Environment** : Production + Preview + Development.

Redéploie (section 7).

### Étape 11.4 — Login via GitHub

Sur `/admin`, un bouton **Se connecter avec GitHub** apparaît. Les users dont le username est dans `CMS_ALLOWED_USERS` peuvent s'y connecter — ils auront automatiquement le rôle **admin**.

---

## 12. (Optionnel) Activer la génération d'images IA

Le CMS intègre deux providers pour générer des images à partir d'un prompt :

| Provider | Modèle | Recommandé | Coût indicatif |
|---|---|---|---|
| **Gemini** (Google) | gemini-2.0-flash-exp | Oui — rapide, gratuit en tier free | Gratuit (limites API) |
| **Flux** (Black Forest Labs) | flux-2-pro-preview | Fallback | ~0,05€ / image |

Le système détecte automatiquement le provider disponible (Gemini prioritaire).

### Étape 12.1 — Option A : Gemini (recommandé)

1. Va sur [aistudio.google.com](https://aistudio.google.com)
2. Crée un projet ou utilise un existant
3. **Get API key** → copie la clé
4. Dans Vercel **Settings → Environment Variables** : `GEMINI_API_KEY` = ta clé

### Étape 12.1 — Option B : Flux (fallback)

1. Va sur [api.bfl.ml](https://api.bfl.ml)
2. **Dashboard** → **API Keys** → **Create new key**
3. Dans Vercel **Settings → Environment Variables** : `BFL_API_KEY` = ta clé BFL

Redéploie après avoir ajouté la clé.

### Étape 12.2 — Utiliser dans le CMS

Dans n'importe quel champ **Image** du CMS, un bouton **Générer avec IA** apparaît. Tu saisis un prompt, l'image est générée, uploadée sur Vercel Blob, et liée automatiquement au champ.

### Étape 12.3 — Génération batch (images structurelles)

Pour générer toutes les images du site d'un coup (hero, catégories, etc.) :

```bash
# Toutes les images
npx tsx scripts/generate-images.ts

# Seulement les images home
npx tsx scripts/generate-images.ts --section home

# Un slot précis
npx tsx scripts/generate-images.ts --slot home-hero-background

# Voir les prompts sans générer
npx tsx scripts/generate-images.ts --dry-run

# Forcer un provider
npx tsx scripts/generate-images.ts --provider gemini
```

Les images sont stockées sur Vercel Blob (si `BLOB_READ_WRITE_TOKEN` est configuré) ou en local dans `public/`.

---

## 13. Troubleshooting

### "Invalid session" ou déconnexion immédiate après login

**Cause** : `CMS_SECRET` absent ou différent entre builds.

**Fix** : vérifie que `CMS_SECRET` est bien dans les env vars Vercel, et qu'il n'a **pas** été modifié récemment (si tu le changes, toutes les sessions existantes sont invalidées).

---

### "GitHub API error 401" ou "Bad credentials"

**Cause** : `CMS_GITHUB_TOKEN` expiré, invalide, ou sans les bonnes permissions.

**Fix** :
1. Vérifie que le token n'a pas expiré (GitHub → Settings → Developer settings → Fine-grained tokens)
2. Vérifie les permissions : **Contents Read/Write** minimum
3. Vérifie que le token a bien accès au repo concerné (**Only select repositories**)
4. Si tu as régénéré le token, mets à jour `CMS_GITHUB_TOKEN` dans Vercel et redéploie

---

### "GitHub API error 404" quand on sauvegarde

**Cause** : `cms.config.ts` pointe vers le mauvais repo ou la mauvaise branche.

**Fix** : ouvre `cms.config.ts` et vérifie que `repo` et `branch` correspondent au vrai repo/branche GitHub. Par défaut ils lisent `niche.repo` et `niche.branch` — vérifie donc `niche.config.ts`.

⚠️ **Piège fréquent** : la branche principale n'est pas toujours `main`. Elle peut être `master`, `production`, ou un nom custom. Vérifie avec `git branch -a` localement.

---

### Les images ne s'affichent pas après upload

**Cause** : Blob Store pas en **Public access**.

**Fix** :
1. Dashboard Vercel → ton projet → **Storage** → clique sur le Blob Store
2. **Settings** du store
3. Vérifie **Public access** → doit être **enabled**
4. Si tu dois le changer, recrée le store avec l'option cochée et reconnecte-le au projet

---

### "Failed to parse YAML" à l'ouverture d'une collection

**Cause** : un fichier YAML du repo est mal formaté (caractère spécial, indentation cassée).

**Fix** :
1. Va sur GitHub dans le repo
2. Ouvre le fichier concerné (ex: `content/articles/mon-article.mdx`)
3. Vérifie le frontmatter YAML (entre les `---`) : guillemets manquants, indentation incohérente, etc.
4. Corrige et commit

---

### Les articles publiés ne s'affichent pas sur le site

**Cause** : Vercel n'a pas redéployé après la sauvegarde CMS.

**Fix** :
1. Dashboard Vercel → ton projet → **Deployments**
2. Un nouveau déploiement devrait être en cours (déclenché par le commit fait par le CMS)
3. Si rien ne se déclenche, vérifie que Vercel est bien connecté au bon repo et à la bonne branche
4. Force un redéploiement manuel si besoin (section 7)

---

### "Missing BLOB_READ_WRITE_TOKEN" dans les logs

**Cause** : le Blob Store n'a pas été connecté au projet.

**Fix** : Dashboard Vercel → **Storage** → Blob Store → **Projects** → vérifie que ton projet est dans la liste. Sinon clique **Connect Project**.

---

### Build Vercel échoue après ajout des env vars

**Cause** : le build n'utilise pas les nouvelles variables (cache).

**Fix** :
1. Deployments → dernier build → **⋯** → **Redeploy**
2. **Décoche** "Use existing Build Cache"
3. Confirme

---

## 14. Référence rapide

### URL du CMS

`https://ton-domaine.vercel.app/admin`

### Variables d'environnement

```
# Obligatoires
CMS_SECRET=<openssl rand -hex 32>
CMS_GITHUB_TOKEN=<PAT fine-grained, Contents R/W>
BLOB_READ_WRITE_TOKEN=<auto via Vercel Blob>

# Optionnelles — OAuth GitHub admins
GITHUB_CMS_CLIENT_ID=<Client ID OAuth App>
GITHUB_CMS_CLIENT_SECRET=<Client Secret OAuth App>
CMS_ALLOWED_USERS=username1,username2

# Optionnelle — image IA (Gemini recommandé, Flux en fallback)
GEMINI_API_KEY=<clé Google AI Studio>
BFL_API_KEY=<clé Black Forest Labs>
```

### Collections disponibles dans le CMS

| Collection | Chemin fichiers | Format |
|---|---|---|
| Articles | `content/articles/` | MDX |
| Auteurs | `content/authors/` | YAML |
| Produits | `content/produits/` | YAML |
| Catégories | `content/categories/` | YAML |
| Pages | `content/pages/` | YAML |
| Paramètres | `content/settings.yaml` | YAML (singleton) |
| Utilisateurs | `content/users.yaml` | YAML (admin only) |
| Médias | Vercel Blob | Images |
| Images du site | Registre `lib/image-slots.ts` | Lecture seule |

### Commandes utiles

```bash
# Générer un CMS_SECRET
openssl rand -hex 32

# Régénérer localement le hash d'un utilisateur
node -e "const c=require('crypto');const s=c.randomBytes(16).toString('hex');const h=c.pbkdf2Sync('mon-mdp',s,100000,32,'sha256').toString('hex');console.log('salt:',s,'\nhash:',h)"

# Vérifier quelle branche est utilisée par le CMS
grep branch niche.config.ts
grep branch cms.config.ts

# Générer toutes les images structurelles (hero, catégories, etc.)
npx tsx scripts/generate-images.ts

# Générer avec aperçu des prompts seulement
npx tsx scripts/generate-images.ts --dry-run

# Voir les variables d'environnement Vercel en CLI (si Vercel CLI installée)
vercel env ls
```

### Flow complet : de la création d'un article à sa mise en ligne

```
Rédacteur se connecte → /admin
    ↓
Crée un nouvel article → remplit les champs + body MDX
    ↓
Clique "Enregistrer"
    ↓
CMS API → GitHub API → crée content/articles/[slug].mdx sur la branche principale
    ↓
Vercel détecte le commit → lance un build
    ↓
Build terminé → déploiement prod
    ↓
Article visible sur https://ton-domaine.vercel.app/blog/[categorie]/[slug]
```

Durée typique : 30 à 60 secondes entre le clic "Enregistrer" et l'article en ligne.

---

## Questions restantes ?

Si un point n'est pas clair ou si tu rencontres une erreur non listée dans le Troubleshooting, regarde :
- `docs/CMS-SPEC.md` — spécification technique complète du CMS
- `docs/TEMPLATE-SPEC.md` — architecture du template
- Le code dans `packages/cms/` — implémentation

Ou demande à Claude Code en pointant vers ce fichier.
