import type { Metadata } from 'next'
import { Space_Grotesk, Unbounded } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { niche } from '@/niche.config'
import { t } from '@/lib/i18n'
import './globals.css'

// ── Fonts — remplacer à l'init par les fonts choisies pour la niche ──
const fontPrimary = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--next-font-primary',
  adjustFontFallback: true,
  preload: true,
  display: 'swap',
})

const fontDisplay = Unbounded({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--next-font-display',
  adjustFontFallback: true,
  preload: true,
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? `https://${niche.domain}`
  ),
  title: {
    template: `%s | ${niche.siteName}`,
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
      className={`${fontPrimary.variable} ${fontDisplay.variable}`}
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
