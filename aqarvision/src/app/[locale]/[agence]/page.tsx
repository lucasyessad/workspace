import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Building2,
  Phone,
  MapPin,
  Search,
  MessageCircle,
  BadgeCheck,
  Home,
  Globe,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrix, formatSurface, whatsappLink } from "@/lib/utils";
import { getWilayaById } from "@/lib/wilayas";
import { getDictionnaire, getDirection, type Locale } from "@/lib/i18n";
import { BoutonFavori } from "@/components/favoris/bouton-favori";
import { BoutonComparer } from "@/components/favoris/bouton-comparer";
import { PanneauComparaison } from "@/components/favoris/panneau-comparaison";
import { TrackerVue } from "@/components/analytics/tracker-vue";
import { LangueSwitcher } from "@/components/shared/langue-switcher";
import type { Listing, Profile } from "@/types";

const LOCALES_VALIDES = ["fr", "ar", "en"];

interface AgenceLocalePageProps {
  params: { locale: string; agence: string };
  searchParams: { type?: string; transaction?: string };
}

/** Métadonnées dynamiques SEO avec hreflang */
export async function generateMetadata({
  params,
}: AgenceLocalePageProps): Promise<Metadata> {
  const locale = LOCALES_VALIDES.includes(params.locale) ? params.locale : "fr";
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug_url", params.agence)
    .single();

  if (!profile) {
    return { title: "Agence non trouvée - AqarVision" };
  }

  const agence = profile as Profile;
  const wilaya = getWilayaById(agence.wilaya_id);

  const { count } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", agence.id)
    .eq("est_active", true);

  const titres: Record<string, string> = {
    fr: `${agence.nom_agence} - Agence Immobilière${wilaya ? ` à ${wilaya.nom_fr}` : ""} | AqarVision`,
    ar: `${agence.nom_agence} - وكالة عقارية${wilaya ? ` في ${wilaya.nom_ar}` : ""} | عقار فيجن`,
    en: `${agence.nom_agence} - Real Estate Agency${wilaya ? ` in ${wilaya.nom_fr}` : ""} | AqarVision`,
  };

  const descriptions: Record<string, string> = {
    fr: `${count ?? 0} biens immobiliers disponibles${wilaya ? ` à ${wilaya.nom_fr}` : ""}. Contactez-nous sur WhatsApp.`,
    ar: `${count ?? 0} عقار متاح${wilaya ? ` في ${wilaya.nom_ar}` : ""}. تواصلوا معنا عبر واتساب.`,
    en: `${count ?? 0} properties available${wilaya ? ` in ${wilaya.nom_fr}` : ""}. Contact us on WhatsApp.`,
  };

  const titre = titres[locale] || titres.fr;
  const description = agence.description?.substring(0, 160) || descriptions[locale] || descriptions.fr;

  // Hreflang alternates pour les moteurs de recherche
  const alternates: Record<string, string> = {};
  LOCALES_VALIDES.forEach((l) => {
    alternates[l] = `/${l}/${params.agence}`;
  });

  return {
    title: titre,
    description,
    alternates: {
      languages: alternates,
    },
    openGraph: {
      title: titre,
      description,
      type: "website",
      locale: locale === "ar" ? "ar_DZ" : locale === "en" ? "en_US" : "fr_DZ",
      siteName: "AqarVision",
      images: agence.logo_url
        ? [{ url: agence.logo_url, width: 200, height: 200, alt: agence.nom_agence }]
        : [],
    },
    twitter: {
      card: "summary",
      title: agence.nom_agence,
      description,
    },
  };
}

/** Page publique localisée de l'agence */
export default async function AgenceLocalePage({
  params,
  searchParams,
}: AgenceLocalePageProps) {
  const locale = (LOCALES_VALIDES.includes(params.locale) ? params.locale : "fr") as Locale;
  const dir = getDirection(locale);
  const t = getDictionnaire(locale);
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug_url", params.agence)
    .single();

  if (!profile) {
    notFound();
  }

  const agence = profile as Profile;
  const wilayaAgence = getWilayaById(agence.wilaya_id);

  // Récupérer les annonces avec filtres
  let query = supabase
    .from("listings")
    .select("*")
    .eq("agent_id", agence.id)
    .eq("est_active", true)
    .order("created_at", { ascending: false });

  if (searchParams.type) {
    query = query.eq("type_bien", searchParams.type);
  }
  if (searchParams.transaction) {
    query = query.eq("type_transaction", searchParams.transaction);
  }

  const { data: annonces } = await query;

  // Analytics : enregistrer les recherches filtrées
  if (searchParams.type || searchParams.transaction) {
    await supabase.from("analytics_recherches").insert({
      agent_id: agence.id,
      type_bien_filtre: searchParams.type || null,
      transaction_filtre: searchParams.transaction || null,
      wilaya_id: agence.wilaya_id,
    });
  }

  // Schema.org JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agence.nom_agence,
    description: agence.description,
    telephone: agence.telephone_whatsapp,
    address: {
      "@type": "PostalAddress",
      addressLocality: agence.commune,
      addressRegion: wilayaAgence?.nom_fr,
      addressCountry: "DZ",
    },
    ...(agence.logo_url && { image: agence.logo_url }),
    areaServed: { "@type": "Country", name: "Algeria" },
  };

  return (
    <div className="min-h-screen bg-blanc-casse" dir={dir}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* En-tête */}
      <header className="bg-bleu-nuit text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          {/* Sélecteur de langue */}
          <div className="flex justify-end mb-4">
            <LangueSwitcher
              localeActuelle={locale}
              slug={params.agence}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-white/10 rounded-xl flex items-center justify-center">
              {agence.logo_url ? (
                <img
                  src={agence.logo_url}
                  alt={agence.nom_agence}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <Building2 className="h-10 w-10 text-or" />
              )}
            </div>

            <div className="text-center md:text-start flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-bold">{agence.nom_agence}</h1>
                {agence.est_verifie && (
                  <BadgeCheck className="h-6 w-6 text-or" />
                )}
              </div>
              {wilayaAgence && (
                <p className="text-gray-300 mt-1 flex items-center justify-center md:justify-start gap-1">
                  <MapPin className="h-4 w-4" />
                  {agence.commune && `${agence.commune}, `}
                  {locale === "ar" ? wilayaAgence.nom_ar : wilayaAgence.nom_fr}
                </p>
              )}
              {agence.description && (
                <p className="text-gray-400 mt-2 max-w-lg">{agence.description}</p>
              )}
            </div>

            <div className="flex gap-3">
              <a
                href={`https://wa.me/${agence.telephone_whatsapp.replace(/\s/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="or" size="lg">
                  <MessageCircle className="h-5 w-5 me-2" />
                  {t.contacter_whatsapp.split(" ").slice(-1)[0]}
                </Button>
              </a>
              <a href={`tel:${agence.telephone_whatsapp}`}>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  <Phone className="h-5 w-5 me-2" />
                  {t.appeler}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Filtres */}
      <section className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto">
            <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <Link href={`/${locale}/${params.agence}`}>
              <Badge
                variant={!searchParams.transaction && !searchParams.type ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
              >
                {t.tous}
              </Badge>
            </Link>
            {[
              { value: "Vente", label: t.vente },
              { value: "Location", label: t.location },
            ].map(({ value, label }) => (
              <Link key={value} href={`/${locale}/${params.agence}?transaction=${value}`}>
                <Badge
                  variant={searchParams.transaction === value ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                >
                  {label}
                </Badge>
              </Link>
            ))}
            <div className="w-px h-6 bg-gray-200 flex-shrink-0" />
            {["Villa", "Appartement F3", "Terrain", "Local Commercial"].map((type) => (
              <Link key={type} href={`/${locale}/${params.agence}?type=${type}`}>
                <Badge
                  variant={searchParams.type === type ? "secondary" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                >
                  {type}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Liste des biens */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-bleu-nuit mb-6 flex items-center gap-2">
          <Home className="h-6 w-6 text-or" />
          {t.nos_biens}
          <span className="text-sm font-normal text-gray-500 ms-2">
            ({annonces?.length ?? 0})
          </span>
        </h2>

        {!annonces || annonces.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              {t.aucun_resultat}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(annonces as Listing[]).map((bien) => {
              const wilaya = getWilayaById(bien.wilaya_id);
              const bienFavori = {
                id: bien.id,
                titre: bien.titre,
                prix: bien.prix,
                surface: bien.surface,
                type_bien: bien.type_bien,
                photo: bien.photos?.[0] || null,
                wilaya: wilaya?.nom_fr || "",
                commune: bien.commune,
                slug_agence: params.agence,
                ajouteLe: "",
              };

              return (
                <Card key={bien.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <TrackerVue listingId={bien.id} agentId={agence.id} />

                  <div className="relative h-48 bg-gray-100">
                    {bien.photos?.[0] ? (
                      <img
                        src={bien.photos[0]}
                        alt={bien.titre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Building2 className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute top-3 start-3 flex gap-2">
                      <Badge className="bg-bleu-nuit">{bien.type_transaction}</Badge>
                      <Badge variant="success">{bien.statut_document}</Badge>
                    </div>
                    <div className="absolute bottom-3 end-3">
                      <span className="bg-or text-bleu-nuit px-3 py-1 rounded-full text-sm font-bold">
                        {formatPrix(bien.prix)}
                      </span>
                    </div>
                    <div className="absolute top-3 end-3 flex flex-col gap-1">
                      <BoutonFavori bien={bienFavori} taille="sm" />
                      <BoutonComparer bien={bienFavori} />
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-bleu-nuit mb-1 line-clamp-1">
                      {bien.titre}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3" />
                      {bien.commune && `${bien.commune}, `}
                      {locale === "ar" ? wilaya?.nom_ar : wilaya?.nom_fr}
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                      <span>{bien.type_bien}</span>
                      <span>|</span>
                      <span>{formatSurface(bien.surface)}</span>
                      {bien.nb_pieces && (
                        <>
                          <span>|</span>
                          <span>{bien.nb_pieces} {locale === "ar" ? "غرف" : locale === "en" ? "rooms" : "pièces"}</span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {bien.ascenseur && <Badge variant="outline" className="text-xs">{t.ascenseur}</Badge>}
                      {bien.garage && <Badge variant="outline" className="text-xs">{t.garage}</Badge>}
                      {bien.jardin && <Badge variant="outline" className="text-xs">{t.jardin}</Badge>}
                      {bien.citerne && <Badge variant="outline" className="text-xs">{t.citerne}</Badge>}
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={whatsappLink(agence.telephone_whatsapp, bien.titre)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="or" size="sm" className="w-full text-xs">
                          <MessageCircle className="h-3 w-3 me-1" />
                          WhatsApp
                        </Button>
                      </a>
                      <a href={`tel:${agence.telephone_whatsapp}`}>
                        <Button variant="outline" size="sm">
                          <Phone className="h-3 w-3" />
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <PanneauComparaison />

      <footer className="bg-bleu-nuit text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            {locale === "ar"
              ? "مدعوم من عقار فيجن - المنصة العقارية للجزائر"
              : locale === "en"
              ? "Powered by AqarVision - The real estate platform for Algeria"
              : "Propulsé par AqarVision - La plateforme immobilière pour l'Algérie"}
          </p>
        </div>
      </footer>
    </div>
  );
}
