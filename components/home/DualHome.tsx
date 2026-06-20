/**
 * DualHome — home archétype « portail » (deux portes : Comparateur ✕ Magazine).
 * Portée depuis la maquette home-v2 (Voltéo). Server Component, zéro JS.
 * LOCALE-AWARE via la prop `locale`. Visuels décoratifs (aria-hidden) sans texte
 * de niche en dur → pas de fuite FR sur /en. Classes : .portal-intro / .doors / .door.
 */
import Link from 'next/link'
import { niche, localePath } from '@/niche.config'
import { tl } from '@/lib/i18n'

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
)
const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)

export function DualHome({ locale = niche.defaultLocale }: { locale?: string }) {
  const L = (k: string) => tl(locale, `home.${k}`)
  const lp = (p: string) => localePath(locale, p)
  const word = niche.rotatingWords?.[0] ?? niche.entities
  const catCount = niche.categories.length || 5

  return (
    <main id="main-content">

      <section className="portal-intro">
        <div className="wrap">
          <span className="eyebrow">{L('dualEyebrow')}</span>
          <h1>{niche.heroPrefix} <span className="hl">{word}</span> {niche.heroSuffix}</h1>
          <p>{L('dualIntro')}</p>
        </div>
      </section>

      <section className="doors">
        <div className="wrap">
          <div className="doors-grid">

            <Link href={lp(niche.ctaPrimary?.url ?? '/comparer')} className="door door-compare">
              <span className="door-blob" />
              <span className="door-kicker"><span className="door-num">01</span> {L('doorCompareKicker')}</span>
              <h2>{L('doorCompareTitle')}</h2>
              <p className="door-sub">{L('doorCompareSub')}</p>
              <ul className="door-points">
                <li><Check /> {L('doorComparePoint1')}</li>
                <li><Check /> {L('doorComparePoint2')}</li>
                <li><Check /> {L('doorComparePoint3')}</li>
              </ul>
              <div className="door-visual" aria-hidden="true">
                <div className="compare-vis">
                  <div className="cv-bar"><div className="cv-track"><div className="cv-fill now" style={{ height: '100%' }} /></div></div>
                  <div className="cv-bar"><div className="cv-track"><div className="cv-fill opt" style={{ height: '62%' }} /></div></div>
                  <div className="cv-save"><div className="s-val">✓</div></div>
                </div>
              </div>
              <span className="door-cta">{L('doorCompareCta')} <Arrow /></span>
            </Link>

            <Link href={lp('/blog')} className="door door-mag">
              <span className="door-blob" />
              <span className="door-kicker"><span className="door-num">02</span> {L('doorMagKicker')} <span className="magpill">MAG</span></span>
              <h2>{L('doorMagTitle')}</h2>
              <p className="door-sub">{L('doorMagSub')}</p>
              <ul className="door-points">
                <li><Check /> {L('doorMagPoint1')}</li>
                <li><Check /> {L('doorMagPoint2')}</li>
                <li><Check /> {L('doorMagPoint3')}</li>
              </ul>
              <div className="door-visual" aria-hidden="true">
                <div className="mag-vis">
                  <div className="mv"><div className="ph" /></div>
                  <div className="stack"><div className="mv"><div className="ph" /></div><div className="mv"><div className="ph" /></div></div>
                  <div className="stack"><div className="mv"><div className="ph" /></div><div className="mv"><div className="ph" /></div></div>
                </div>
              </div>
              <span className="door-cta">{L('doorMagCta')} <Arrow /></span>
            </Link>

          </div>
        </div>
      </section>

      <section className="portal-stats">
        <div className="wrap">
          <div className="ps"><div className="n">{catCount}</div><div className="l">{L('statCategories')}</div></div>
          <div className="ps"><div className="n">100%</div><div className="l">{L('statIndependent')}</div></div>
          <div className="ps"><div className="n">0 €</div><div className="l">{L('statFree')}</div></div>
          <div className="ps"><div className="n">2 min</div><div className="l">{L('statTime')}</div></div>
        </div>
      </section>
    </main>
  )
}
