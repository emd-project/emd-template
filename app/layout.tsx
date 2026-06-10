import type { Metadata } from 'next'
import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { niche } from '@/niche.config'
import { t } from '@/lib/i18n'
import './globals.css'
import './styles/volteo.css'
import './styles/volteo-magazine.css'

// ── Fonts — défaut V1 Voltéo (Hanken Grotesk + Bricolage Grotesque) ──
//    Remplacées à l'init par les fonts du skin choisi pour la niche.
const fontPrimary = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--next-font-primary',
  adjustFontFallback: true,
  preload: true,
  display: 'swap',
})

const fontDisplay = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--next-font-display',
  adjustFontFallback: true,
  preload: true,
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? `https://${niche.domain}`
  ),
  // IMPORTANT — anti double-marque : les pages incluent DÉJÀ le nom du site dans
  // leur <title> (ex. "Comparateur 2026 | MonSite"). Le template ne doit donc PAS
  // le rajouter (`%s | MonSite` produirait "… | MonSite | MonSite"). On laisse `%s`
  // qui rend le titre de la page tel quel. `default` (home, sans title propre) garde la marque.
  title: {
    template: '%s',
    default: `${niche.tagline} | ${niche.siteName}`,
  },
  description: niche.tagline,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: '/',
    ...(niche.locales.length > 1 ? {
      languages: Object.fromEntries(
        niche.locales.map((locale) => [locale, `https://${niche.domain}/${locale === niche.defaultLocale ? '' : locale}`])
      ),
    } : {}),
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fr"
      className={`js ${fontPrimary.variable} ${fontDisplay.variable}`}
    >
      {/* Script inline : applique data-theme avant tout rendu pour éviter le flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-to-content">
          {t('common.skipToContent')}
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
