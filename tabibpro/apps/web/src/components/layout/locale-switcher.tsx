// ============================================================
// TabibPro — Sélecteur de Langue
// FR | عربي | ⵜⵎⵣ | EN
// Changement instantané sans rechargement
// ============================================================

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocaleOption {
  code: string;
  label: string;
  labelNative: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

const LOCALE_OPTIONS: LocaleOption[] = [
  { code: 'fr', label: 'Français', labelNative: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', label: 'Arabe', labelNative: 'العربية', flag: '🇩🇿', dir: 'rtl' },
  { code: 'ber', label: 'Tamazight', labelNative: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', flag: 'ⵣ', dir: 'ltr' },
  { code: 'en', label: 'English', labelNative: 'English', flag: '🇬🇧', dir: 'ltr' },
];

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = LOCALE_OPTIONS.find((l) => l.code === locale) ?? LOCALE_OPTIONS[0];

  const handleLocaleChange = (newLocale: string) => {
    // Remplacer le préfixe de locale dans l'URL
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Changer de langue"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span role="img" aria-label={currentLocale.label}>
          {currentLocale.flag}
        </span>
        <span className="hidden sm:inline uppercase">{currentLocale.code}</span>
        <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className="absolute end-0 z-20 mt-1 w-44 rounded-xl border border-border bg-card shadow-lg"
              role="listbox"
              aria-label="Sélectionner une langue"
            >
              {LOCALE_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  onClick={() => handleLocaleChange(option.code)}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                    'hover:bg-muted first:rounded-t-xl last:rounded-b-xl',
                    option.code === locale
                      ? 'text-primary-700 font-medium bg-primary-50'
                      : 'text-foreground'
                  )}
                  role="option"
                  aria-selected={option.code === locale}
                  dir={option.dir}
                >
                  <span className="text-base" role="img" aria-label={option.label}>
                    {option.flag}
                  </span>
                  <span className="flex-1 text-start">{option.labelNative}</span>
                  {option.code === locale && (
                    <span className="text-primary-600 text-xs">✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
