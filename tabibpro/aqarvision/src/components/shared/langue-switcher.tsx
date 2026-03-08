"use client";

import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import type { Locale } from "@/lib/i18n";

const LANGUES: { code: Locale; label: string; short: string }[] = [
  { code: "fr", label: "Français", short: "FR" },
  { code: "ar", label: "العربية", short: "AR" },
  { code: "en", label: "English", short: "EN" },
];

interface LangueSwitcherProps {
  localeActuelle: Locale;
  slug: string;
}

/** Composant de changement de langue pour les pages publiques */
export function LangueSwitcher({ localeActuelle, slug }: LangueSwitcherProps) {
  const router = useRouter();

  function changerLangue(locale: Locale) {
    // Sauvegarder la préférence dans un cookie
    document.cookie = `locale=${locale};path=/;max-age=${365 * 24 * 60 * 60}`;
    router.push(`/${locale}/${slug}`);
  }

  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
      <Globe className="h-4 w-4 text-gray-300" />
      {LANGUES.map((langue) => (
        <button
          key={langue.code}
          onClick={() => changerLangue(langue.code)}
          className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
            localeActuelle === langue.code
              ? "bg-or text-bleu-nuit"
              : "text-gray-300 hover:text-white"
          }`}
          aria-label={`Changer la langue en ${langue.label}`}
        >
          {langue.short}
        </button>
      ))}
    </div>
  );
}
