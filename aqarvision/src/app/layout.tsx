import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cairo, Playfair_Display } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "AqarVision - Plateforme Immobilière Algérie",
  description:
    "Professionnalisez votre agence immobilière avec AqarVision. Gestion d'annonces, mini-site vitrine et aide IA.",
  keywords: ["immobilier", "algérie", "agence", "annonces", "SaaS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr">
      <body className={`${jakarta.variable} ${cairo.variable} ${playfair.variable} font-sans antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-bleu-nuit focus:text-white focus:rounded-lg focus:text-sm">
          Aller au contenu principal
        </a>
        {children}
      </body>
    </html>
  );
}
