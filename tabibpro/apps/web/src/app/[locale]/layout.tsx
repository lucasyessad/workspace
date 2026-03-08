// ============================================================
// TabibPro — Layout racine — Support RTL + 4 langues
// ============================================================

import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import '@/styles/globals.css';

// Polices — Support multilingue
// Latin : Inter (médical professionnel)
// Arabe & Tamazight : CSS Google Fonts via globals.css

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const SUPPORTED_LOCALES = ['fr', 'ar', 'ber', 'en'];

// Locales RTL (arabe)
const RTL_LOCALES = ['ar'];

export const metadata: Metadata = {
  title: {
    default: 'TabibPro',
    template: '%s | TabibPro',
  },
  description: 'Logiciel de gestion médicale professionnel — Édition Algérie',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  keywords: ['médecin', 'cabinet médical', 'Algérie', 'CNAS', 'dossier patient'],
};

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;

  if (!SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const isRTL = RTL_LOCALES.includes(locale);

  return (
    <html
      lang={locale}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        {/* Polices Google pour arabe et tamazight */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&family=Noto+Sans+Tifinagh&family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* Service Worker PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then(
                    reg => console.log('SW registered:', reg.scope),
                    err => console.warn('SW registration failed:', err)
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${isRTL ? 'font-arabic' : 'font-sans'} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <AuthProvider>
              <ThemeProvider>
                {children}
                <Toaster
                  position={isRTL ? 'bottom-left' : 'bottom-right'}
                  expand
                  richColors
                  closeButton
                />
              </ThemeProvider>
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
