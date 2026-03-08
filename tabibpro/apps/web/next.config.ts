// ============================================================
// TabibPro — Configuration Next.js 15
// IHM Professionnelle — Support multilingue + PWA
// ============================================================

import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // ---- Locales supportées ----
  // La configuration des locales est gérée par next-intl
  // Locales : fr, ar, ber, en
  // Default : fr

  // ---- Sécurité ----
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=self, microphone=self' },
      ],
    },
  ],

  // ---- Images ----
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.tabibpro.dz' },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // ---- Output standalone (Docker) ----
  output: 'standalone',

  // ---- Optimisation ----
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // ---- Expérimental ----
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-dialog'],
  },

  // ---- Webpack (pour PDFjs) ----
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default withNextIntl(nextConfig);
