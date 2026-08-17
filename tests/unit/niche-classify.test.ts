import { describe, expect, it } from 'vitest'
import { classifyNiche, entityHead, type HomeFamily } from '@/lib/niche-classify'
import { suggestVariants } from '@/lib/variants'

/**
 * Table de décision — DOMAINES RÉELS du réseau.
 *
 * Le bug d'origine : la règle « intent comparatif → comparateur » vivait en
 * langue naturelle dans docs/AUTO-DESIGN.md, donc rien ne pouvait l'attraper.
 * « meilleure-citadine.be » sortait en home comparateur alors que c'est un site
 * PRODUIT (on n'achète pas une citadine en ligne) → magazine.
 *
 * 2026-08-12 — `lib/variants.ts` est passé de cinq squelettes de home à deux
 * (`magazine`, `marche`) : `presse`, `fil` et `comparateur` n'existent plus
 * comme variantes de home. `classifyNiche` n'a PAS changé et rend toujours les
 * trois mêmes FAMILLES (`comparateur`, `editorial`, `beaute`) : les cas
 * ci-dessous portent sur la famille, ils sont donc inchangés. Seules les
 * attentes sur la variante de home ont été mises à jour (plus bas).
 */
const CASES: ReadonlyArray<{ domain: string; expect: HomeFamily; why: string }> = [
  // ── Produits physiques → editorial (squelette magazine) ───────────────────
  { domain: 'meilleure-citadine.be', expect: 'editorial', why: 'objet acheté ailleurs' },
  { domain: 'comparatif-aspirateur.fr', expect: 'editorial', why: 'modificateur ≠ signal' },
  { domain: 'top-tondeuse-robot.be', expect: 'editorial', why: 'modificateur ≠ signal' },
  { domain: 'meilleur-matelas.fr', expect: 'editorial', why: 'objet' },
  { domain: 'guide-smartphone.be', expect: 'editorial', why: 'objet' },
  { domain: 'meilleure-machine-cafe.be', expect: 'editorial', why: 'objet' },

  // ── Services souscriptibles → comparateur (squelette marche) ──────────────
  { domain: 'simulateur-assurance-auto.be', expect: 'comparateur', why: 'tête = assurance' },
  { domain: 'comparateur-energie.be', expect: 'comparateur', why: 'énergie = fournisseur' },
  { domain: 'meilleure-banque-en-ligne.be', expect: 'comparateur', why: 'banque' },
  { domain: 'top-vpn.fr', expect: 'comparateur', why: 'abonnement' },
  { domain: 'meilleur-forfait-mobile.be', expect: 'comparateur', why: 'forfait' },
  { domain: 'comparatif-credit-hypothecaire.be', expect: 'comparateur', why: 'crédit' },

  // ── Beauté & mode → famille `beaute` ──────────────────────────────────────
  // La famille reste une famille à part entière (elle porte la peau) ; depuis
  // le 2026-08-12 elle prend le squelette `magazine` comme `editorial`.
  { domain: 'beaute-naturelle.be', expect: 'beaute', why: 'beauté' },
  { domain: 'guide-maquillage.fr', expect: 'beaute', why: 'beauté' },
  { domain: 'tendances-mode.be', expect: 'beaute', why: 'mode' },
]

describe('classifyNiche — famille de design par domaine', () => {
  for (const c of CASES) {
    it(`${c.domain} → ${c.expect} (${c.why})`, () => {
      expect(classifyNiche({ domain: c.domain }).family).toBe(c.expect)
    })
  }
})

describe('classifyNiche — faux positifs du matching par sous-chaîne', () => {
  // L'ancien `COMPARATEUR_KEYWORDS.some(k => s.includes(k))` matchait `paris`
  // (paris sportifs) dans un nom de ville.
  it('« meilleur-hotel-paris » n\'est pas un site de paris sportifs', () => {
    expect(classifyNiche({ domain: 'meilleur-hotel-paris.fr' }).family).toBe('editorial')
  })

  // ... et `soin` (beauté) dans « soins palliatifs ».
  it('« soins-palliatifs » n\'est pas un site beauté', () => {
    expect(classifyNiche({ domain: 'guide-soins-palliatifs.be' }).family).not.toBe('beaute')
  })

  // Le premier token de contenu est la TÊTE en français : « assurance auto »
  // est une assurance, pas une voiture.
  it('« assurance-auto » pèse assurance (tête) plus que auto (modifieur)', () => {
    const r = classifyNiche({ domain: 'assurance-auto.be' })
    expect(r.family).toBe('comparateur')
    expect(r.confidence).toBe('high')
  })
})

describe('classifyNiche — secteur = vérité terrain', () => {
  it('le secteur gagne sur le domaine', () => {
    expect(classifyNiche({ domain: 'meilleure-citadine.be', sector: 'Assurance' }).family)
      .toBe('comparateur')
  })

  it('un désaccord secteur/domaine est SURFACÉ, jamais silencieux', () => {
    const r = classifyNiche({ domain: 'assurance-habitation.be', sector: 'Voiture' })
    expect(r.family).toBe('editorial') // le secteur fait foi
    expect(r.conflict).toEqual({ fromSector: 'editorial', fromDomain: 'comparateur' })
    expect(r.reason).toMatch(/VÉRIFIER/)
  })
})

describe('classifyNiche — défaut prudent', () => {
  it('niche inconnue → editorial en confiance basse (à surfacer)', () => {
    const r = classifyNiche({ domain: 'guide-du-cafe.be' })
    expect(r.family).toBe('editorial')
    expect(r.confidence).toBe('low')
  })
})

describe('entityHead — entité nue (sert aussi à dériver niche.entity)', () => {
  it.each([
    ['www.meilleure-citadine.be', 'citadine'],
    ['comparateur-assurance-auto.fr', 'assurance auto'],
    ['https://top-vpn.be/', 'vpn'],
  ])('%s → %s', (domain, head) => {
    expect(entityHead(domain)).toBe(head)
  })
})

describe('suggestVariants — la famille est déduite du seed', () => {
  // RÉGRESSION : `family` valait 'editorial' par défaut, donc cet appel exact —
  // celui écrit dans init-site/SKILL.md et configure-from-spec/SKILL.md —
  // rendait la famille comparateur (et son squelette `marche`) inatteignable.
  //
  // 2026-08-12 : l'intention de ces cas est inchangée — la famille doit être
  // déduite du seed — mais un pool ne contient plus qu'UN squelette
  // (comparateur → `marche`, editorial et beaute → `magazine`). Les attentes
  // sur `home` sont donc devenues exactes au lieu d'être une liste de
  // possibles, et `fil` / `comparateur` / `presse` n'y figurent plus.
  it('un site produit reste dans le pool editorial', () => {
    const v = suggestVariants('meilleure-citadine.be')
    expect(v.family).toBe('editorial')
    expect(v.home).toBe('magazine')
  })

  it('un site service part dans le pool comparateur', () => {
    const v = suggestVariants('simulateur-assurance-auto.be')
    expect(v.family).toBe('comparateur')
    expect(v.home).toBe('marche')
  })

  // Avant le 2026-08-12 ce cas vérifiait qu'un site beauté sortait avec
  // l'identité `presse` COMPLÈTE (home + pages catégorie dédiées). Cette
  // identité a été retirée ; ce qui reste à garantir, et qui n'a pas changé,
  // c'est que la famille `beaute` est bien reconnue — c'est elle qui porte la
  // peau du site. Son squelette est désormais `magazine`, comme editorial.
  it('un site beauté est reconnu comme tel et prend le squelette magazine', () => {
    const v = suggestVariants('beaute-naturelle.be')
    expect(v.family).toBe('beaute')
    expect(v.home).toBe('magazine')
    // La variante de catégorie reste tirée du seed (plus de variante dédiée).
    expect(['classic', 'editorial']).toContain(v.category)
  })

  it('reste déterministe (même seed → même combinaison)', () => {
    expect(suggestVariants('meilleure-citadine.be'))
      .toEqual(suggestVariants('meilleure-citadine.be'))
  })

  it('un secteur explicite l\'emporte sur la déduction', () => {
    const v = suggestVariants('meilleure-citadine.be', 'comparateur')
    expect(v.home).toBe('marche')
  })
})
