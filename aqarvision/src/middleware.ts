import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Locales supportées */
const LOCALES = ["fr", "ar", "en"];
const LOCALE_DEFAUT = "fr";

/** Détecter la locale depuis les préférences du navigateur */
function detecterLocale(request: NextRequest): string {
  // Cookie de préférence
  const cookieLocale = request.cookies.get("locale")?.value;
  if (cookieLocale && LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Accept-Language
  const acceptLanguage = request.headers.get("accept-language") || "";
  if (acceptLanguage.includes("ar")) return "ar";
  if (acceptLanguage.includes("en")) return "en";

  return LOCALE_DEFAUT;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Ignorer les routes internes
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return await updateSession(request);
  }

  // Vérifier si le pathname a déjà une locale
  const hasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Rediriger les pages publiques d'agences vers la version localisée
  // Exclure la page d'accueil "/"
  if (!hasLocale && pathname !== "/" && pathname.length > 1) {
    const locale = detecterLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
