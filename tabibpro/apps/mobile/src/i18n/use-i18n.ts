import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, type Locale } from './translations';

interface I18nState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: 'fr',
      setLocale: (locale) => set({ locale }),
      t: (key: string) => {
        const { locale } = get();
        const keys = key.split('.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let value: any = translations[locale] ?? translations['fr'];
        for (const k of keys) {
          value = value?.[k];
        }
        if (typeof value === 'string') return value;
        // Fallback to French
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fallback: any = translations['fr'];
        for (const k of keys) {
          fallback = fallback?.[k];
        }
        return typeof fallback === 'string' ? fallback : key;
      },
    }),
    {
      name: 'tabibpro-locale',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
