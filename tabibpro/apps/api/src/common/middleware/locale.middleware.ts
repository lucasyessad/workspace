// ============================================================
// TabibPro — Middleware Locale
// Détecte la langue : header Accept-Language ou query ?lang=
// Langues supportées : fr (défaut), ar, ber, en
// ============================================================

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const LOCALES_SUPPORTEES = ['fr', 'ar', 'ber', 'en'] as const;
const LOCALE_DEFAUT = 'fr';

@Injectable()
export class LocaleMiddleware implements NestMiddleware {
  use(req: Request & { locale?: string }, res: Response, next: NextFunction) {
    // 1. Paramètre URL ?lang=ar
    const langParam = req.query.lang as string;
    if (langParam && LOCALES_SUPPORTEES.includes(langParam as any)) {
      req.locale = langParam;
      return next();
    }

    // 2. Header Accept-Language
    const acceptLanguage = req.headers['accept-language'] || '';
    const detected = LOCALES_SUPPORTEES.find((l) =>
      acceptLanguage.toLowerCase().includes(l)
    );

    req.locale = detected || LOCALE_DEFAUT;
    next();
  }
}
