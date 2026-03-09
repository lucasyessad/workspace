import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { rechercherAnnonces, type FiltresRecherche } from "@/lib/recherche";
import { FiltresGlobaux } from "@/components/recherche/filtres-globaux";
import { GrilleResultats } from "@/components/recherche/grille-resultats";
import { getDirection, type Locale } from "@/lib/i18n";

const LOCALES_VALIDES = ["fr", "ar", "en"];

interface RecherchePageProps {
  params: { locale: string };
  searchParams: Record<string, string | string[] | undefined>;
}

const meta = {
  fr: {
    titre: "Explorer les biens immobiliers en Algérie | AqarVision",
    description:
      "Recherchez parmi des milliers d'annonces immobilières en Algérie. Vente et location d'appartements, villas, terrains et locaux commerciaux.",
  },
  ar: {
    titre: "استكشف العقارات في الجزائر | عقار فيجن",
    description:
      "ابحث بين آلاف الإعلانات العقارية في الجزائر. بيع وإيجار شقق، فيلات، أراضي ومحلات تجارية.",
  },
  en: {
    titre: "Explore Real Estate in Algeria | AqarVision",
    description:
      "Search thousands of property listings across Algeria. Sale and rental of apartments, villas, land and commercial properties.",
  },
};

export async function generateMetadata({
  params,
}: RecherchePageProps): Promise<Metadata> {
  const locale = LOCALES_VALIDES.includes(params.locale) ? params.locale : "fr";
  const m = meta[locale as keyof typeof meta] || meta.fr;

  const alternates: Record<string, string> = {};
  LOCALES_VALIDES.forEach((l) => {
    alternates[l] = `/${l}/recherche`;
  });

  return {
    title: m.titre,
    description: m.description,
    alternates: { languages: alternates },
    openGraph: {
      title: m.titre,
      description: m.description,
      type: "website",
      locale: locale === "ar" ? "ar_DZ" : locale === "en" ? "en_US" : "fr_DZ",
      siteName: "AqarVision",
    },
  };
}

export default async function RecherchePage({
  params,
  searchParams,
}: RecherchePageProps) {
  const locale = (
    LOCALES_VALIDES.includes(params.locale) ? params.locale : "fr"
  ) as Locale;
  const dir = getDirection(locale);

  // Normalize searchParams to single strings
  const filtres: FiltresRecherche = {};
  for (const [key, val] of Object.entries(searchParams)) {
    if (typeof val === "string") {
      filtres[key as keyof FiltresRecherche] = val;
    } else if (Array.isArray(val) && val.length > 0) {
      filtres[key as keyof FiltresRecherche] = val[0];
    }
  }

  const resultats = await rechercherAnnonces(filtres);

  return (
    <div className="min-h-screen bg-blanc-casse" dir={dir}>
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 bg-bleu-nuit rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              Aqar<span className="text-or">Vision</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href={`/${locale}/recherche`}
              className="text-sm font-semibold text-foreground"
            >
              {locale === "ar" ? "استكشاف" : locale === "en" ? "Explore" : "Explorer"}
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {locale === "ar" ? "الأسعار" : locale === "en" ? "Pricing" : "Tarifs"}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {locale === "ar" ? "دخول" : locale === "en" ? "Log in" : "Connexion"}
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-medium bg-bleu-nuit text-white px-4 py-2 rounded-lg hover:bg-bleu-nuit/90 transition-colors"
            >
              {locale === "ar"
                ? "ابدأ مجانا"
                : locale === "en"
                ? "Get started"
                : "Commencer"}
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <Suspense
        fallback={
          <div className="h-32 bg-white border-b border-border animate-pulse" />
        }
      >
        <FiltresGlobaux locale={locale} />
      </Suspense>

      {/* Results */}
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-14">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white border border-border overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <GrilleResultats
          annonces={resultats.annonces}
          total={resultats.total}
          page={resultats.page}
          parPage={resultats.parPage}
          locale={locale}
        />
      </Suspense>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-white py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-bleu-nuit rounded flex items-center justify-center">
              <Building2 className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs text-muted-foreground">
              {locale === "ar"
                ? "مدعوم من عقار فيجن"
                : locale === "en"
                ? "Powered by AqarVision"
                : "Propulsé par AqarVision"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AqarVision
          </p>
        </div>
      </footer>
    </div>
  );
}
