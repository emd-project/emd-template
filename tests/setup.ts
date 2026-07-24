import '@testing-library/jest-dom'
import { vi } from 'vitest'

// next/font/google ne fonctionne pas dans jsdom — mock complet.
// Les fonts mockées = celles réellement importées par app/layout.tsx
// (défaut V1 Voltéo : Hanken Grotesk corps + Bricolage Grotesque titres).
// Si l'init remplace la paire dans layout.tsx, aligner ce mock.
vi.mock('next/font/google', () => ({
  Hanken_Grotesk: () => ({ variable: '--next-font-primary', className: '' }),
  Bricolage_Grotesque: () => ({ variable: '--next-font-display', className: '' }),
}))

// next/navigation — mock minimal pour les composants qui l'utilisent
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
