#!/usr/bin/env node
/**
 * scripts/validate-voice.mjs — LA SECONDE PORTE DE LA PHASE 1.
 *
 * `content/voice-profile.json` est le contrat de voix : qui parle, à qui, sur
 * quel ton, avec quels mots — et surtout, en quoi cette voix diffère de celle
 * des autres sites du réseau.
 *
 * Pourquoi ce contrôle existe, et pourquoi il porte sur le RÉSEAU et pas
 * seulement sur le site : les mentions légales sont `noindex` et volontairement
 * identiques partout, c'est un choix assumé et sans risque SEO. Les pages
 * éditoriales — à propos, méthodologie, page auteur — sont **indexées et
 * comparables**. C'est là qu'un réseau se détecte.
 *
 * Relevé du parc au 01/08/2026, sur 19 sites :
 *   · trois prénoms d'auteur déjà partagés — Damien sur 3 sites, Camille sur 2,
 *     Julien sur 2
 *   · format incohérent — 9 sites en prénom seul, 9 en prénom + initiale
 *   · deux signatures quasi identiques, à un mot près
 *
 * Usage :
 *   node scripts/validate-voice.mjs content/voice-profile.json
 *   node scripts/validate-voice.mjs content/voice-profile.json registry/voice-registry.json
 *   node scripts/validate-voice.mjs content/voice-profile.json <registre> --warn-only
 *
 * Sans registre, les contrôles de divergence (VOICE-06, VOICE-07) sont
 * SAUTÉS et signalés. Le registre vit dans `emd-project/emd-template` et n'est
 * jamais copié dans un fork : un fork le lit à distance. Le passer ici suppose
 * donc de l'avoir récupéré au préalable.
 *
 * ⛔ NE JAMAIS assouplir une règle pour faire passer un run.
 *
 * Node pur — aucune dépendance externe.
 */

import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const positional = args.filter((a) => !a.startsWith('--'))
const file = positional[0] ?? 'content/voice-profile.json'
const registryPath = positional[1] ?? null
const WARN_ONLY = args.includes('--warn-only')

const errors = []
const warnings = []
const fail = (rule, where, msg) => errors.push({ rule, where, msg })
const warn = (rule, where, msg) => warnings.push({ rule, where, msg })

// ─── Chargement ───────────────────────────────────────────────

const read = (p) => {
  const abs = path.resolve(process.cwd(), p)
  if (!fs.existsSync(abs)) return null
  try {
    return JSON.parse(fs.readFileSync(abs, 'utf-8'))
  } catch (e) {
    console.error(`\nvalidate-voice — JSON invalide dans ${p} :\n  ${e.message}\n`)
    process.exit(1)
  }
}

const voice = read(file)
if (!voice) {
  console.error(`\nvalidate-voice — fichier introuvable : ${file}\n`)
  process.exit(1)
}

const registry = registryPath ? read(registryPath) : null
if (registryPath && !registry) {
  console.error(`\nvalidate-voice — registre introuvable : ${registryPath}\n`)
  process.exit(1)
}

// ─── Outils ───────────────────────────────────────────────────

const isStr = (v) => typeof v === 'string' && v.trim().length > 0
const isArr = (v) => Array.isArray(v)

const norm = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** Mots vides français : ils gonflent artificiellement toute mesure de similarité. */
const STOP = new Set(['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'a', 'au', 'aux', 'et', 'ou', 'en', 'sur', 'pour', 'par', 'dans', 'que', 'qui', 'ne', 'pas', 'on', 'se', 'ce', 'cette', 'est', 'sont', 'plus', 'jamais', 'toujours', 'chaque', 'son', 'sa', 'ses', 'avec', 'sans'])

const tokens = (s) => new Set(norm(s).split(' ').filter((t) => t.length > 2 && !STOP.has(t)))

/** Jaccard : |A ∩ B| / |A ∪ B|. Au-delà de 0,6, deux formules disent la même chose. */
const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0
  let inter = 0
  for (const t of a) if (b.has(t)) inter++
  return inter / (a.size + b.size - inter)
}

const firstNameOf = (name) => (isStr(name) ? norm(name).split(' ')[0] : null)

const PERSONS = ['je', 'nous', 'impersonnel']
const ADDRESSES = ['vous', 'tu']
const GENDERS = ['m', 'f']

const speaker = voice.speaker ?? {}
const register = voice.register ?? {}
const lexicon = voice.lexicon ?? {}
const signature = voice.signature ?? {}

// ═══ VOICE-00 — forme ══════════════════════════════════════════

if (voice.schemaVersion !== '1.0') fail('VOICE-00', 'schemaVersion', `attendu "1.0", reçu ${JSON.stringify(voice.schemaVersion)}`)
if (!isStr(voice?.site?.domain)) fail('VOICE-00', 'site.domain', 'requis')
if (!isStr(voice?.reader?.state)) {
  fail('VOICE-00', 'reader.state', "dans quel état le lecteur arrive-t-il ? C'est la question qui fixe le registre, bien plus que le secteur — et sans réponse écrite, le ton est choisi au hasard.")
}

// ═══ VOICE-01 — format du nom d'auteur ═════════════════════════

{
  const n = speaker.authorName
  const FORMAT = /^\p{Lu}[\p{L}'’-]+(?: \p{Lu}[\p{L}'’-]+)? \p{Lu}\.$/u

  if (!isStr(n)) {
    fail('VOICE-01', 'speaker.authorName', 'requis')
  } else if (/^la r[ée]daction$/i.test(n.trim())) {
    fail('VOICE-01', 'speaker.authorName', "« la rédaction » n'est pas un auteur : aucune E-E-A-T ne s'y attache")
  } else if (!FORMAT.test(n.trim())) {
    const bare = /^\p{Lu}[\p{L}'’-]+$/u.test(n.trim())
    fail(
      'VOICE-01',
      'speaker.authorName',
      bare
        ? `« ${n} » est un prénom seul — lu comme un pseudonyme, il affaiblit l'E-E-A-T. Format attendu : « ${n} X. » (prénom + initiale du nom).`
        : `« ${n} » ne respecte pas le format « Prénom X. ». Un nom de famille complet est inventé, donc invérifiable ; un prénom seul est un pseudonyme.`
    )
  }
}

// ═══ VOICE-02 — genre grammatical réel ═════════════════════════

{
  if (!GENDERS.includes(lexicon.entityGender)) {
    fail('VOICE-02', 'lexicon.entityGender', `requis, « m » ou « f » — il pilote TOUS les accords FR (meilleur·e·s, Quel/Quelle, le/la). Une faute d'accord sur le H1 est visible par tout lecteur.`)
  }
  // Recoupement avec niche.config.ts quand il est déjà écrit : deux sources de
  // vérité qui divergent valent moins qu'une seule.
  const cfg = path.resolve(process.cwd(), 'niche.config.ts')
  if (fs.existsSync(cfg)) {
    const raw = fs.readFileSync(cfg, 'utf-8')
    const m = raw.match(/entityGender:\s*'([mf])'/)
    if (m && GENDERS.includes(lexicon.entityGender) && m[1] !== lexicon.entityGender) {
      fail('VOICE-02', 'lexicon.entityGender', `« ${lexicon.entityGender} » ici, « ${m[1]} » dans niche.config.ts — les deux doivent dire la même chose`)
    }
  }
}

// ═══ VOICE-03 — personne et adresse déclarées ══════════════════

if (!PERSONS.includes(register.person)) fail('VOICE-03', 'register.person', `requis parmi ${PERSONS.join(' | ')}`)
if (!ADDRESSES.includes(register.address)) fail('VOICE-03', 'register.address', `requis parmi ${ADDRESSES.join(' | ')}`)
if (!isArr(register.tone) || register.tone.filter(isStr).length < 2) {
  fail('VOICE-03', 'register.tone', 'au moins deux qualificatifs de ton')
}

// ═══ VOICE-04 — bio E-E-A-T réelle ═════════════════════════════

{
  const bio = speaker.bio
  if (!isStr(bio)) {
    fail('VOICE-04', 'speaker.bio', 'requise')
  } else {
    if (bio.trim().length < 400) {
      fail('VOICE-04', 'speaker.bio', `${bio.trim().length} caractères — minimum 400. Une bio courte ne porte aucune expertise vérifiable.`)
    }
    if (!isStr(speaker.location)) fail('VOICE-04', 'speaker.location', 'lieu réel requis (ville ou région)')
    else if (!norm(bio).includes(norm(speaker.location))) {
      warn('VOICE-04', 'speaker.bio', `le lieu « ${speaker.location} » n'apparaît pas dans la bio`)
    }
    if (!/\b(19|20)\d{2}\b/.test(bio) && !speaker.since) {
      fail('VOICE-04', 'speaker.bio', "aucune ancienneté datée. « suit le marché depuis 2014 » est vérifiable ; « passionné depuis toujours » ne l'est pas.")
    }
    const fn = firstNameOf(speaker.authorName)
    if (fn && !norm(bio).split(' ').includes(fn)) {
      warn('VOICE-04', 'speaker.bio', `la bio ne nomme jamais « ${speaker.authorName} »`)
    }
  }
}

// ═══ VOICE-05 — lexique : garde-fous anti-IA ═══════════════════

{
  const banned = isArr(lexicon.banned) ? lexicon.banned.filter(isStr) : []
  if (banned.length < 5) {
    fail('VOICE-05', 'lexicon.banned', `${banned.length} mot(s) proscrit(s) — minimum 5. C'est la liste qui tient la voix à distance des tics d'IA, et elle doit être propre au site.`)
  }

  // Tics génériques : leur présence DANS les formulations signature ou les
  // tournures préférées est une faute, pas un goût.
  const TICS = ['plongez', 'univers', 'incontournable', 'revolutionnaire', 'sans hesiter', 'coup de coeur', 'il est important de noter', 'que demander de plus', 'a l heure ou', 'force est de constater', 'veritable', 'ravira']
  const surfaces = [...(isArr(signature.formulations) ? signature.formulations : []), ...(isArr(lexicon.preferred) ? lexicon.preferred : [])].filter(isStr)
  for (const s of surfaces) {
    const n = norm(s)
    for (const tic of TICS) {
      if (n.includes(tic)) fail('VOICE-05', 'signature/lexicon', `« ${s} » contient le tic « ${tic} »`)
    }
  }
}

// ═══ VOICE-06 / 07 — divergence au registre ════════════════════

{
  const sites = isArr(registry?.sites) ? registry.sites : null
  if (!sites) {
    warn('VOICE-06', 'registre', "absent — les contrôles de divergence réseau sont SAUTÉS. Le registre vit dans emd-project/emd-template et ne se copie pas dans un fork : le récupérer avant de valider.")
  } else {
    const self = norm(voice?.site?.domain ?? '')
    const others = sites.filter((s) => norm(s?.domain ?? '') !== self && !String(s?.domain ?? '').startsWith('['))

    // VOICE-06 — un prénom d'auteur n'appartient qu'à un site.
    const fn = firstNameOf(speaker.authorName)
    if (fn) {
      const clash = others.filter((s) => firstNameOf(s?.authorName) === fn)
      if (clash.length) {
        fail('VOICE-06', 'speaker.authorName', `le prénom « ${fn} » est déjà porté par ${clash.map((s) => s.domain).join(', ')}. Deux pages auteur indexées avec le même prénom relient deux sites en trente secondes.`)
      }
    }

    // VOICE-07 — la formule signature est propre au site.
    const mine = tokens(signature.anchor ?? '')
    if (!mine.size) {
      fail('VOICE-07', 'signature.anchor', "requise — c'est la phrase qui distingue ce site de ses voisins")
    } else {
      for (const o of others) {
        const sim = jaccard(mine, tokens(o?.signature ?? ''))
        if (sim >= 0.6) {
          fail('VOICE-07', 'signature.anchor', `similarité ${(sim * 100).toFixed(0)} % avec ${o.domain} (« ${o.signature} »). Deux sites qui disent la même chose de la même façon sont le même site.`)
        } else if (sim >= 0.4) {
          warn('VOICE-07', 'signature.anchor', `similarité ${(sim * 100).toFixed(0)} % avec ${o.domain}`)
        }
      }
    }

    const forms = isArr(signature.formulations) ? signature.formulations.filter(isStr) : []
    if (forms.length < 3) warn('VOICE-07', 'signature.formulations', `${forms.length} formulation(s) — viser au moins 3`)
  }
}

// ─── Rapport ──────────────────────────────────────────────────

const render = (list, mark) => {
  const byWhere = new Map()
  for (const f of list) {
    if (!byWhere.has(f.where)) byWhere.set(f.where, [])
    byWhere.get(f.where).push(f)
  }
  for (const [where, items] of [...byWhere.entries()].sort()) {
    console.log(`\n  ${where}`)
    for (const it of items) console.log(`    ${mark} ${it.rule}  ${it.msg}`)
  }
}

console.log(`\nvalidate-voice — ${file}${registry ? ` · registre : ${registryPath}` : ' · SANS registre'}`)
if (isStr(speaker.authorName)) console.log(`  auteur : ${speaker.authorName} · ${register.person ?? '?'} / ${register.address ?? '?'} · entité ${lexicon.entityGender ?? '?'}`)

if (warnings.length) {
  console.log(`\n${warnings.length} avertissement(s) :`)
  render(warnings, '!')
}

if (!errors.length) {
  console.log('\nOK — la voix passe tous les invariants.\n')
  process.exit(0)
}

console.log(`\n${errors.length} violation(s) :`)
render(errors, 'x')

if (WARN_ONLY) process.exit(0)

console.log('\nCorriger la VOIX, jamais le validateur.\n')
process.exit(1)
