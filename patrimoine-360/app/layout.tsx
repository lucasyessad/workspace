import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import ToastProvider from "@/components/Toast";
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
  themeColor: "#1a2340",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] btn-primary">
          Aller au contenu principal
        </a>
        <ThemeProvider>
          <ToastProvider>
            <main id="main-content">
              {children}
            </main>
            <Disclaimer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
