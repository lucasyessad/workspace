import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { useI18n } from './use-i18n';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n();

  useEffect(() => {
    // Activer le RTL pour l'arabe
    const shouldBeRTL = locale === 'ar';
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    }
  }, [locale]);

  return <>{children}</>;
}
