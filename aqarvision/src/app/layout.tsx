import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display, Cairo } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AqarVision - Plateforme immobilière premium',
    template: '%s | AqarVision',
  },
  description:
    'Plateforme SaaS immobilière multi-agences pour le marché algérien. Gérez vos annonces, vos leads et votre visibilité en ligne.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${jakarta.variable} ${playfair.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
