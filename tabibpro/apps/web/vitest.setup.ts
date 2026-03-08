// ============================================================
// TabibPro — Vitest setup — Web
// Polyfills et mocks globaux pour les tests React
// ============================================================

import '@testing-library/jest-dom';

// Mock next/navigation (utilisé dans les composants client)
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ locale: 'fr', id: 'test-id' }),
  usePathname: () => '/fr/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
