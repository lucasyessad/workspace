// ============================================================
// TabibPro — Service i18n
// FR (défaut), AR, BER, EN
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

type Locale = 'fr' | 'ar' | 'ber' | 'en';

@Injectable()
export class I18nService {
  private readonly logger = new Logger(I18nService.name);
  private readonly translations: Record<Locale, Record<string, string>> = {
    fr: {},
    ar: {},
    ber: {},
    en: {},
  };

  constructor() {
    this.loadTranslations();
  }

  private loadTranslations() {
    const locales: Locale[] = ['fr', 'ar', 'ber', 'en'];
    const dir = path.join(__dirname, '..', 'i18n');

    for (const locale of locales) {
      try {
        const filePath = path.join(dir, locale, 'messages.json');
        if (fs.existsSync(filePath)) {
          this.translations[locale] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
      } catch (err) {
        this.logger.warn(`Impossible de charger les traductions [${locale}]`);
      }
    }
  }

  t(key: string, locale: Locale = 'fr', params?: Record<string, string>): string {
    const translation =
      this.translations[locale]?.[key] ||
      this.translations['fr']?.[key] ||
      key;

    if (!params) return translation;

    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(`{{${k}}}`, v),
      translation,
    );
  }
}
