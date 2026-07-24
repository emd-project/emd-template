# Todo — emd-template (nettoyage repo, 2026-07)

## Phase 1 — Consolidation docs ✅ (2026-07-24)
- [x] `docs/AUTO-DESIGN.md` v5 = doc DA unique (absorbe DA-TYPOGRAPHY, DA-PRESETS, doctrine tokens de DESIGN-NOTES ; tranche la contradiction images → `getAllImageSlots()`)
- [x] Tombstones vidés : CDC, SEO-GEO-REDACTION, DUPLICATION-GUIDE, TEMPLATE-SPEC, WIZARD-DESIGN-STEP, DA-PRESETS, DA-TYPOGRAPHY
- [x] DESIGN-NOTES recentré en note de fabrique (hors chemin d'init)
- [x] README corrigé (check-placeholders manuel, composants produit retirés, DA full-auto)
- [x] DECISIONS annoté (décisions remplacées 2026-07)
- [x] DA-ANTI-IA aligné (variantes, composants MDX non câblés retirés)
- [x] package.json (test:e2e retiré) + tests/setup.ts (mocks fonts alignés sur layout.tsx)

## Phase 2 — Purge physique
- [ ] `git rm` des lots morts (tombstones + fichiers identifiés par l'audit) + vérification des liens entrants

## Phase 3 — Fusion skills → methodo
- [ ] Rapatrier/fusionner les skills du template vers emd-methodo, repointer les références

## Chantiers ouverts
- [ ] Script d'init `apply-da` (branche le fallback `lib/da-presets/`)
- [ ] Sections composables (home)
- [ ] Passe 1 typo — câblage `volteo-scale.css` (dev humain, en cours sur les CSS)
