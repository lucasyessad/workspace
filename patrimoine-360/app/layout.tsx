import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Disclaimer from "@/components/Disclaimer";

export const metadata: Metadata = {
  title: {
    default: "Patrimoine 360° — Copilote Financier Intelligent",
    template: "%s | Patrimoine 360°",
  },
  description: "Visualise, analyse et optimise ton patrimoine avec un copilote financier intelligent. 12 modules experts, calculs en temps réel, analyse IA personnalisée.",
  keywords: ["patrimoine", "finance personnelle", "budget", "retraite", "investissement", "immobilier", "fiscalité", "IA", "copilote financier", "gestion patrimoine"],
  authors: [{ name: "Patrimoine 360°" }],
  creator: "Patrimoine 360°",
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://patrimoine360.app"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Patrimoine 360°",
    title: "Patrimoine 360° — Copilote Financier Intelligent",
    description: "La plateforme qui transforme tes données financières en décisions concrètes. 12 modules patrimoniaux, analyses IA, export PDF premium.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Patrimoine 360° — Copilote Financier Intelligent",
    description: "Ton patrimoine, enfin lisible. Analyses IA, projections financières et plan d'action personnalisé.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Patrimoine 360°",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366F1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen bg-[#0B0F1A]">
        <ThemeProvider>
          {children}
          <Disclaimer />
        </ThemeProvider>
      </body>
    </html>
  );
}
