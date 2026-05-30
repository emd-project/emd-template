# CDC — Nettoyage du template 10min-template

## Contexte

Ce document est destiné à Claude Code connecté au repo `10min-template` (fork de `10minutesapple`). L'objectif est de transformer ce fork en un **template générique** réutilisable pour n'importe quelle niche.

Le site 10minutesapple reste intact. Ce repo est le template.

---

## Étape 1 — Supprimer tout le contenu Apple

```bash
# Articles
rm content/articles/*.mdx

# Blog
rm -rf content/blog/*/

# Produits (garder 1 exemple)
ls content/produits/ | tail -n +2 | xargs -I {} rm content/produits/{}
# Renommer le restant en exemple
mv content/produits/$(ls content/produits/ | head -1) content/produits/_example.yaml

# Auteur (garder la structure, vider le contenu)
# → sera recréé par le prompt interactif
```

## Étape 2 — Créer niche.config.ts

Créer `/niche.config.ts` — le seul fichier à remplir pour chaque nouveau site :

```ts
export type NicheConfig = {
  // Identité
  siteName: string
  domain: string
  tagline: string

  // Vocabulaire de la niche
  entity: string          // "produit", "destination", "carte"
  entities: string        // pluriel
  entityVerb: string      // "acheter", "explorer", "souscrire"
  dealWord: string        // "deals", "bons plans", "offres"

  // Hero
  heroPrefix: string      // "Choisir votre"
  heroSuffix: string      // "en 10 minutes"
  rotatingWords: string[] // ["iPhone", "Mac"] → ["vol", "hôtel"]
  subtitle: string
  ctaPrimary: { text: string; url: string }
  ctaSecondary: { text: string; url: string }

  // Catégories (1 couleur par catégorie)
  categories: {
    slug: string
    label: string
    accent: string // hex
  }[]

  // Outils
  quiz: {
    enabled: boolean
    question: string        // "Quel iPhone pour vous ?"
    criteria: string[]      // ["budget", "usage", "taille"]
  }
  comparator: {
    enabled: boolean
    criteria: string[]      // ["prix", "performance", "photo"]
  }
  simulator: {
    enabled: boolean
    title: string           // "Calculer votre budget Apple"
    description: string
  }

  // DA
  palette: {
    accent1: string
    accent2: string
    accent3: string
    accent4: string
    accent5: string
    bgPrimary: string
    bgSurface: string
    bgSurface2: string
    textPrimary: string
    textSecondary: string
    textMuted: string
  }
  fonts: {
    display: string   // Google Fonts family name
    body: string      // Google Fonts family name
  }

  // Auteur
  author: {
    name: string
    slug: string
    title: string
    bio: string
    tone: string[]          // ["direct", "honnête", "expert"]
    noGo: string[]          // ["révolutionnaire", "incroyable"]
    formulations: string[]  // ["Honnêtement,", "Le vrai tip :"]
  }

  // Affiliation
  affiliateTag: string     // "ambiancejap0a-21"
  defaultStore: string     // "Amazon"

  // Technique
  vercelRegion: string     // "fra1"
  repo: string             // "org/repo"
  branch: string           // "main"
}

export const niche: NicheConfig = {
  siteName: '',
  domain: '',
  tagline: '',
  entity: '',
  entities: '',
  entityVerb: '',
  dealWord: '',
  heroPrefix: 'Choisir votre',
  heroSuffix: 'en 10 minutes',
  rotatingWords: [],
  subtitle: '',
  ctaPrimary: { text: '', url: '/comparer' },
  ctaSecondary: { text: '', url: '/quiz' },
  categories: [],
  quiz: { enabled: true, question: '', criteria: [] },
  comparator: { enabled: true, criteria: [] },
  simulator: { enabled: true, title: '', description: '' },
  palette: {
    accent1: '#FF3D57',
    accent2: '#FFD23F',
    accent3: '#3DFFC0',
    accent4: '#7B61FF',
    accent5: '#3D9BFF',
    bgPrimary: '#0A0A0F',
    bgSurface: '#13131A',
    bgSurface2: '#1C1C26',
    textPrimary: '#F0F0F5',
    textSecondary: '#9090A8',
    textMuted: '#55556A',
  },
  fonts: { display: 'Unbounded', body: 'Space Grotesk' },
  author: { name: '', slug: '', title: '', bio: '', tone: [], noGo: [], formulations: [] },
  affiliateTag: '',
  defaultStore: 'Amazon',
  vercelRegion: 'fra1',
  repo: '',
  branch: 'main',
}
```

## Étape 3 — Abstraire les composants

Tous les composants qui contiennent du texte Apple doivent lire depuis `niche.config.ts`.

### Fichiers à modifier :

**`app/layout.tsx`**
- Fonts : lire `niche.fonts.display` et `niche.fonts.body`
- metadataBase : lire `niche.domain`
- title/description : lire `niche.siteName` et `niche.tagline`

**`app/globals.css`**
- Toutes les variables `:root` : générées depuis `niche.palette`
- Créer `lib/generate-css-vars.ts` qui produit les variables depuis le config

**`components/home/HeroSection.tsx`**
- `heroPrefix`, `heroSuffix`, `rotatingWords`, `subtitle`, CTAs : depuis `niche`

**`components/home/DealsStrip.tsx`**
- `dealWord` : depuis `niche`
- Contenu du bandeau : depuis `content/pages/home.yaml`

**`components/home/FeaturedTools.tsx`**
- Titres et descriptions : depuis `niche` (quiz.question, comparator, simulator)

**`components/layout/Nav.tsx`**
- Logo : `niche.siteName`
- Liens : `niche.categories` + outils activés

**`components/layout/Footer.tsx`**
- Logo, colonnes, copyright : depuis `niche`

**`lib/blog.ts`**
- `CATEGORY_LABELS` : généré depuis `niche.categories`

**`lib/utils/affiliate.ts`**
- Tag : `niche.affiliateTag`

**`cms.config.ts`**
- `siteName`, `repo`, `branch` : depuis `niche`
- `categories options` : depuis `niche.categories`

**`app/sitemap.ts`** et **`app/robots.ts`**
- Domaine : depuis `niche.domain`

**`CLAUDE.md`**
- Domaine, repo, branche, auteur : depuis `niche`

## Étape 4 — Créer les fichiers exemples

```
content/
├── articles/_example.mdx          ← 1 article template avec tous les composants
├── produits/_example.yaml          ← 1 produit template avec format multi-liens
├── authors/_example.yaml           ← 1 auteur template
├── categories/_example.yaml        ← 1 catégorie template
├── pages/home.yaml                 ← textes par défaut (placeholders)
├── pages/deals.yaml                ← textes par défaut
├── pages/comparer.yaml             ← textes par défaut
└── settings.yaml                   ← structure par défaut
```

Les fichiers `_example.*` sont des modèles avec des commentaires expliquant chaque champ. Ils sont supprimés lors de l'init d'un nouveau site.

## Étape 5 — Implémenter le 2FA (TOTP / Google Authenticator)

Tous les sites issus du template doivent inclure le 2FA pour les rédacteurs email/mdp.

**Flow utilisateur :**
1. L'admin crée un rédacteur dans `/admin/users`
2. Premier login du rédacteur → le CMS affiche un QR code TOTP à scanner avec Google Authenticator / Authy
3. Le rédacteur scanne → le secret TOTP est stocké dans `content/users.yaml` (champ `totpSecret`)
4. À chaque login suivant : email + mot de passe + code à 6 chiffres

**Implémentation :**

1. **Créer `packages/cms/lib/totp.ts`** (~80 lignes, zéro dépendance) :
   - `generateTotpSecret()` → chaîne base32 aléatoire (20 bytes)
   - `generateTotpQrUrl(secret, email, siteName)` → URL `otpauth://totp/...` pour QR code
   - `verifyTotp(secret, code)` → boolean (HMAC-SHA1 via Web Crypto API, fenêtre ±1 période de 30s)
   - Utiliser uniquement Web Crypto API (pas de lib externe)

2. **Modifier `packages/cms/types.ts`** :
   ```ts
   export type CmsUser = {
     email: string
     name: string
     role: CmsRole
     hash: string
     salt: string
     totpSecret?: string    // base32, ajouté au premier setup
     totpEnabled?: boolean  // true après scan du QR
   }
   ```

3. **Modifier `packages/cms/lib/users.ts`** :
   - `createUser()` → génère `totpSecret`, `totpEnabled: false`
   - `enableTotp(email)` → met `totpEnabled: true` après vérification du premier code
   - `verifyUserTotp(email, code)` → vérifie le code TOTP

4. **Modifier `app/api/cms/auth/[...action]/route.ts`** :
   - Login POST : si `totpEnabled`, exiger le champ `totpCode` dans le body
   - Si `!totpEnabled` et premier login → retourner `{ requireSetup: true, qrUrl: "..." }`

5. **Modifier `packages/cms/components/LoginForm.tsx`** :
   - Si `requireSetup` → afficher QR code (via `<img src="https://api.qrserver.com/v1/create-qr-code/?data={qrUrl}" />`)
   - Champ "Code à 6 chiffres" sous email/mdp
   - Après scan + premier code valide → `totpEnabled: true`

6. **Modifier `app/api/cms/users/route.ts`** :
   - Action `resetTotp` → regénère le secret, remet `totpEnabled: false`
   - Accessible dans `/admin/users` via bouton "Reset 2FA"

**Sécurité :**
- Le secret TOTP est stocké en clair dans `content/users.yaml` (nécessaire pour vérification). Acceptable car le fichier est dans un repo privé, accessible uniquement via GitHub token.
- Fenêtre de vérification : ±1 période (accepte le code précédent et suivant pour compenser le décalage d'horloge)
- Les admins GitHub OAuth ne sont pas concernés (GitHub a son propre 2FA)

**QR code sans dépendance externe :**
Alternative au service qrserver.com : générer le QR en SVG côté serveur avec une lib légère (`qrcode` npm, ~15kb) ou afficher le secret en texte pour saisie manuelle.

## Étape 6 — Créer le prompt interactif

Le fichier `docs/PROMPT-INIT.md` contient le prompt que l'utilisateur donne à Claude Code pour initialiser un nouveau site :

---

## Étape 6 — Vérification

- [ ] `niche.config.ts` est le seul fichier de config de niche
- [ ] Aucune mention de "Apple", "iPhone", "Mac", "iPad", "Watch" dans le code (sauf dans les exemples)
- [ ] `tsc --noEmit` passe
- [ ] Le site build avec les valeurs par défaut (même si vides)
- [ ] Le CMS fonctionne sur `/admin`
- [ ] Les outils (quiz, comparateur, simulateur) sont configurables via `niche.config.ts`

---

## Ce qu'on NE touche PAS

```
packages/cms/              ← CMS complet (identique)
app/admin/                 ← Pages admin (identique)
app/api/cms/               ← API routes (identique)
scripts/upload-blob.ts     ← Upload images (identique)
lib/cms-pages.ts           ← Helper pages (identique)
components/blog/           ← Composants MDX (identique)
components/ui/             ← AuthorByline, AuthorCard (identique)
```
