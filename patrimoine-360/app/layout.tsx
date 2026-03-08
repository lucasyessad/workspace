import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patrimoine 360° — Planification Financière Complète",
  description: "12 modules experts, calculs en temps réel, analyse IA personnalisée",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#0B0F1A]">
        {children}
      </body>
    </html>
  );
}
