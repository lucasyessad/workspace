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
  Check,
  Filter,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const alternates: Record<string, string> = {};
  LOCALES_VALIDES.forEach((l) => {
    alternates[l] = `/${l}/${params.agence}`;
  });

  return {
    title: titre,
    description,
    alternates: { languages: alternates },
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
    twitter: { card: "summary", title: agence.nom_agence, description },
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

  if (!profile) notFound();

  const agence = profile as Profile;
  const wilayaAgence = getWilayaById(agence.wilaya_id);

  let query = supabase
    .from("listings")
    .select("*")
    .eq("agent_id", agence.id)
    .eq("est_active", true)
    .order("created_at", { ascending: false });

  if (searchParams.type) query = query.eq("type_bien", searchParams.type);
  if (searchParams.transaction) query = query.eq("type_transaction", searchParams.transaction);

  const { data: annonces } = await query;

  if (searchParams.type || searchParams.transaction) {
    await supabase.from("analytics_recherches").insert({
      agent_id: agence.id,
      type_bien_filtre: searchParams.type || null,
      transaction_filtre: searchParams.transaction || null,
      wilaya_id: agence.wilaya_id,
    });
  }

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

  const nbAnnonces = annonces?.length ?? 0;

  return (
    <div className="min-h-screen bg-blanc-casse" dir={dir}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── Header agence ─── */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between h-14 border-b border-border/50">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-bleu-nuit rounded flex items-center justify-center">
                <Building2 className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Aqar<span className="text-or">Vision</span>
              </span>
            </Link>
            <LangueSwitcher localeActuelle={locale} slug={params.agence} />
          </div>

          {/* Agency info */}
          <div className="py-8 md:py-12">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              {/* Logo */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                {agence.logo_url ? (
                  <img
                    src={agence.logo_url}
                    alt={agence.nom_agence}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              {/* Info */}
              <div className="text-center md:text-start flex-1">
                <div className="flex items-center justify-center md:justify-start gap-2.5 mb-1">
                  <h1 className="text-heading-3 md:text-heading-2 font-bold text-foreground">
                    {agence.nom_agence}
                  </h1>
                  {agence.est_verifie && (
                    <BadgeCheck className="h-5 w-5 text-or flex-shrink-0" />
                  )}
                </div>
                {wilayaAgence && (
                  <p className="text-body-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {agence.commune && `${agence.commune}, `}
                    {locale === "ar" ? wilayaAgence.nom_ar : wilayaAgence.nom_fr}
                  </p>
                )}
                {agence.description && (
                  <p className="text-body-sm text-muted-foreground mt-2 max-w-lg leading-relaxed">
                    {agence.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2.5">
                <a
                  href={`https://wa.me/${agence.telephone_whatsapp.replace(/\s/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="or" size="default">
                    <MessageCircle className="h-4 w-4 me-2" />
                    WhatsApp
                  </Button>
                </a>
                <a href={`tel:${agence.telephone_whatsapp}`}>
                  <Button variant="outline" size="default">
                    <Phone className="h-4 w-4 me-2" />
                    {t.appeler}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Filtres ─── */}
      <div className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center gap-2.5 overflow-x-auto">
            <Filter className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
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
            <div className="w-px h-4 bg-border flex-shrink-0" />
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
      </div>

      {/* ─── Annonces ─── */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-heading-3 font-bold text-foreground flex items-center gap-2.5">
            <Home className="h-5 w-5 text-or" />
            {t.nos_biens}
            <span className="text-body-sm font-normal text-muted-foreground">
              ({nbAnnonces})
            </span>
          </h2>
        </div>

        {!annonces || annonces.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-5 bg-muted rounded-2xl flex items-center justify-center">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium mb-1">{t.aucun_resultat}</p>
            <p className="text-body-sm text-muted-foreground mb-6">
              {locale === "ar" ? "جرب تغيير معايير البحث" : locale === "en" ? "Try changing your filters" : "Essayez de modifier vos filtres"}
            </p>
            <Link href={`/${locale}/${params.agence}`}>
              <Button variant="outline" size="sm">
                {locale === "ar" ? "مسح الفلاتر" : locale === "en" ? "Clear filters" : "Effacer les filtres"}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                <div
                  key={bien.id}
                  className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-card transition-shadow duration-300"
                >
                  <TrackerVue listingId={bien.id} agentId={agence.id} />

                  {/* Image */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {bien.photos?.[0] ? (
                      <img
                        src={bien.photos[0]}
                        alt={bien.titre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 start-3 flex gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-bleu-nuit/80 text-white backdrop-blur-sm">
                        {bien.type_transaction}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-600/80 text-white backdrop-blur-sm">
                        {bien.statut_document}
                      </span>
                    </div>

                    {/* Prix */}
                    <div className="absolute bottom-3 start-3">
                      <span className="text-white text-sm font-bold">
                        {formatPrix(bien.prix)}
                      </span>
                    </div>

                    {/* Favori/Comparer */}
                    <div className="absolute top-3 end-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <BoutonFavori bien={bienFavori} taille="sm" />
                      <BoutonComparer bien={bienFavori} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                      {bien.titre}
                    </h3>
                    <p className="text-caption text-muted-foreground flex items-center gap-1 mb-3">
                      <MapPin className="h-3 w-3" />
                      {bien.commune && `${bien.commune}, `}
                      {locale === "ar" ? wilaya?.nom_ar : wilaya?.nom_fr}
                    </p>

                    {/* Specs */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="px-2 py-0.5 rounded-md bg-muted text-caption text-muted-foreground">
                        {bien.type_bien}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-muted text-caption text-muted-foreground">
                        {formatSurface(bien.surface)}
                      </span>
                      {bien.nb_pieces && (
                        <span className="px-2 py-0.5 rounded-md bg-muted text-caption text-muted-foreground">
                          {bien.nb_pieces} {locale === "ar" ? "غرف" : locale === "en" ? "rooms" : "pcs"}
                        </span>
                      )}
                    </div>

                    {/* Amenities */}
                    {(bien.ascenseur || bien.garage || bien.jardin || bien.citerne) && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {bien.ascenseur && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{t.ascenseur}</Badge>}
                        {bien.garage && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{t.garage}</Badge>}
                        {bien.jardin && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{t.jardin}</Badge>}
                        {bien.citerne && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{t.citerne}</Badge>}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <a
                        href={whatsappLink(agence.telephone_whatsapp, bien.titre)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="or" size="sm" className="w-full">
                          <MessageCircle className="h-3.5 w-3.5 me-1.5" />
                          WhatsApp
                        </Button>
                      </a>
                      <a href={`tel:${agence.telephone_whatsapp}`}>
                        <Button variant="outline" size="sm">
                          <Phone className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <PanneauComparaison />

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-white py-8">
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
