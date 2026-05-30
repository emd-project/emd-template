import '@testing-library/jest-dom'
import { vi } from 'vitest'

// next/font/google ne fonctionne pas dans jsdom — mock complet
vi.mock('next/font/google', () => ({
  Space_Grotesk: () => ({ variable: '--next-font-primary', className: '' }),
  Syne: () => ({ variable: '--next-font-display', className: '' }),
  JetBrains_Mono: () => ({ variable: '--next-font-mono', className: '' }),
}))

// next/navigation — mock minimal pour les composants qui l'utilisent
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
