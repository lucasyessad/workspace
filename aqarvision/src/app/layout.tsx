import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
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
      <body className={`${inter.variable} ${cairo.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
