import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "ThermoPilot AI",
  description: "Plateforme SaaS d'analyse énergétique automatisée",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${outfit.className} ${outfit.variable}`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
