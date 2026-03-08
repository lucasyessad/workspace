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
  Filter,
  ArrowRight,
  ShieldCheck,
  Clock,
  Award,
  TrendingUp,
  Star,
  ChevronRight,
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
import {
  BadgeAgreee,
  BadgeVerifiee,
  BlocConfiance,
  BandeauPresence,
} from "@/components/branding/trust-badges";
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

/** Page publique localisée de l'agence — vitrine complète */
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

  // Toutes les annonces actives (sans filtre) pour les stats
  const { data: toutesAnnonces } = await supabase
    .from("listings")
    .select("*")
    .eq("agent_id", agence.id)
    .eq("est_active", true)
    .order("created_at", { ascending: false });

  const allListings = (toutesAnnonces as Listing[]) || [];

  // Annonces filtrées
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

  // Statistiques
  const nbTotal = allListings.length;
  const nbVente = allListings.filter((a) => a.type_transaction === "Vente").length;
  const nbLocation = allListings.filter((a) => a.type_transaction === "Location").length;
  const anneesActivite = Math.max(
    1,
    new Date().getFullYear() - new Date(agence.created_at).getFullYear()
  );

  // Wilayas couvertes
  const wilayaIds = Array.from(new Set(allListings.map((a) => a.wilaya_id)));
  const wilayasCouvertes = wilayaIds
    .map((id) => getWilayaById(id))
    .filter(Boolean)
    .map((w) => (locale === "ar" ? w!.nom_ar : w!.nom_fr));

  // Types de biens disponibles (pour les filtres dynamiques)
  const typesDisponibles = Array.from(new Set(allListings.map((a) => a.type_bien)));

  // Annonces mises en avant (3 premières avec photos)
  const misesEnAvant = allListings
    .filter((a) => a.photos && a.photos.length > 0)
    .slice(0, 3);

  // Annonces filtrées
  const filteredListings = (annonces as Listing[]) || [];
  const hasFilters = !!(searchParams.type || searchParams.transaction);

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
    numberOfEmployees: { "@type": "QuantitativeValue", value: nbTotal },
  };

  return (
    <div className="min-h-screen bg-blanc-casse" dir={dir}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── Navigation top bar ─── */}
      <nav className="bg-white border-b border-border/50">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-bleu-nuit rounded flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Aqar<span className="text-or">Vision</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-5 text-caption text-muted-foreground">
              <Link
                href={`/${locale}/${params.agence}`}
                className="text-foreground font-medium"
              >
                {t.accueil}
              </Link>
              <Link
                href={`/${locale}/${params.agence}/a-propos`}
                className="hover:text-foreground transition-colors"
              >
                {locale === "ar" ? "من نحن" : locale === "en" ? "About" : "À propos"}
              </Link>
              <Link
                href={`/${locale}/${params.agence}/contact`}
                className="hover:text-foreground transition-colors"
              >
                {locale === "ar" ? "اتصل بنا" : locale === "en" ? "Contact" : "Contact"}
              </Link>
            </div>
            <LangueSwitcher localeActuelle={locale} slug={params.agence} />
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-10 md:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Logo agence */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0 border border-border shadow-soft">
              {agence.logo_url ? (
                <img
                  src={agence.logo_url}
                  alt={agence.nom_agence}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <Building2 className="h-10 w-10 text-muted-foreground" />
              )}
            </div>

            {/* Info agence */}
            <div className="text-center lg:text-start flex-1">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                <h1 className="text-heading-2 md:text-heading-1 font-bold text-foreground">
                  {agence.nom_agence}
                </h1>
                {agence.est_verifie && (
                  <BadgeCheck className="h-6 w-6 text-or flex-shrink-0" />
                )}
              </div>

              {wilayaAgence && (
                <p className="text-body text-muted-foreground flex items-center justify-center lg:justify-start gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-or" />
                  {agence.commune && `${agence.commune}, `}
                  {locale === "ar" ? wilayaAgence.nom_ar : wilayaAgence.nom_fr}
                  {agence.adresse && ` — ${agence.adresse}`}
                </p>
              )}

              {agence.description && (
                <p className="text-body-sm text-muted-foreground max-w-2xl leading-relaxed mb-5">
                  {agence.description}
                </p>
              )}

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-6">
                {agence.est_verifie && <BadgeAgreee locale={locale} />}
                <BadgeVerifiee locale={locale} />
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-100">
                  <Award className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                  <span className="text-caption font-medium text-purple-700">
                    {locale === "ar"
                      ? `${anneesActivite} سنة نشاط`
                      : locale === "en"
                      ? `${anneesActivite} year${anneesActivite > 1 ? "s" : ""} active`
                      : `${anneesActivite} an${anneesActivite > 1 ? "s" : ""} d'activité`}
                  </span>
                </div>
              </div>

              {/* Stats rapides */}
              <div className="flex items-center justify-center lg:justify-start gap-6 md:gap-8">
                <div className="text-center">
                  <p className="text-heading-3 font-bold text-bleu-nuit">{nbTotal}</p>
                  <p className="text-caption text-muted-foreground">
                    {locale === "ar" ? "عقار" : locale === "en" ? "listings" : "annonces"}
                  </p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-heading-3 font-bold text-bleu-nuit">{nbVente}</p>
                  <p className="text-caption text-muted-foreground">{t.vente}</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-heading-3 font-bold text-bleu-nuit">{nbLocation}</p>
                  <p className="text-caption text-muted-foreground">{t.location}</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-heading-3 font-bold text-bleu-nuit">{wilayasCouvertes.length}</p>
                  <p className="text-caption text-muted-foreground">
                    {locale === "ar" ? "ولايات" : locale === "en" ? "provinces" : "wilayas"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions CTA */}
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              <a
                href={`https://wa.me/${agence.telephone_whatsapp.replace(/\s/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="or" size="lg" className="min-w-[200px]">
                  <MessageCircle className="h-4 w-4 me-2" />
                  WhatsApp
                </Button>
              </a>
              <a href={`tel:${agence.telephone_whatsapp}`}>
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  <Phone className="h-4 w-4 me-2" />
                  {t.appeler}
                </Button>
              </a>
              <p className="text-caption text-muted-foreground">
                {agence.telephone_whatsapp}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Biens mis en avant ─── */}
      {!hasFilters && misesEnAvant.length >= 3 && (
        <section className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-heading-3 font-bold text-foreground flex items-center gap-2.5">
                <Star className="h-5 w-5 text-or" />
                {locale === "ar"
                  ? "عقارات مميزة"
                  : locale === "en"
                  ? "Featured Properties"
                  : "Biens à la une"}
              </h2>
              <p className="text-body-sm text-muted-foreground mt-1">
                {locale === "ar"
                  ? "أحدث عقاراتنا المتاحة"
                  : locale === "en"
                  ? "Our latest available properties"
                  : "Nos derniers biens disponibles"}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {misesEnAvant.map((bien) => {
              const wilaya = getWilayaById(bien.wilaya_id);
              return (
                <Link
                  key={bien.id}
                  href={`/${locale}/${params.agence}/${bien.id}`}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 block"
                >
                  <TrackerVue listingId={bien.id} agentId={agence.id} />

                  {/* Image grande */}
                  <div className="relative h-56 md:h-64 bg-muted overflow-hidden">
                    <img
                      src={bien.photos[0]}
                      alt={bien.titre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 start-3 flex gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-bleu-nuit/90 text-white backdrop-blur-sm">
                        {bien.type_transaction}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600/90 text-white backdrop-blur-sm">
                        {bien.statut_document}
                      </span>
                    </div>

                    {/* Photo counter */}
                    {bien.photos.length > 1 && (
                      <div className="absolute top-3 end-3 px-2 py-0.5 rounded-md bg-black/50 text-white text-[11px] backdrop-blur-sm">
                        {bien.photos.length} photos
                      </div>
                    )}

                    {/* Prix + infos en overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-4">
                      <p className="text-white text-lg font-bold">
                        {formatPrix(bien.prix)}
                        {bien.type_transaction === "Location" && (
                          <span className="text-white/70 text-sm font-normal">
                            {" "}/ {locale === "ar" ? "شهر" : locale === "en" ? "month" : "mois"}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-or transition-colors">
                      {bien.titre}
                    </h3>
                    <p className="text-caption text-muted-foreground flex items-center gap-1 mb-3">
                      <MapPin className="h-3 w-3" />
                      {bien.commune && `${bien.commune}, `}
                      {locale === "ar" ? wilaya?.nom_ar : wilaya?.nom_fr}
                    </p>

                    {/* Specs inline */}
                    <div className="flex items-center gap-3 text-caption text-muted-foreground">
                      <span>{formatSurface(bien.surface)}</span>
                      {bien.nb_pieces && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>
                            {bien.nb_pieces} {locale === "ar" ? "غرف" : locale === "en" ? "rooms" : "pcs"}
                          </span>
                        </>
                      )}
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>{bien.type_bien}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Filtres sticky ─── */}
      <div className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center gap-2.5 overflow-x-auto">
            <Filter className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <Link href={`/${locale}/${params.agence}`}>
              <Badge
                variant={!searchParams.transaction && !searchParams.type ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
              >
                {t.tous} ({nbTotal})
              </Badge>
            </Link>
            {[
              { value: "Vente", label: t.vente, count: nbVente },
              { value: "Location", label: t.location, count: nbLocation },
            ].map(({ value, label, count }) => (
              <Link key={value} href={`/${locale}/${params.agence}?transaction=${value}`}>
                <Badge
                  variant={searchParams.transaction === value ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                >
                  {label} ({count})
                </Badge>
              </Link>
            ))}
            <div className="w-px h-4 bg-border flex-shrink-0" />
            {typesDisponibles.map((type) => (
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

      {/* ─── Grille des annonces ─── */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-heading-3 font-bold text-foreground flex items-center gap-2.5">
              <Home className="h-5 w-5 text-or" />
              {t.nos_biens}
            </h2>
            <p className="text-body-sm text-muted-foreground mt-1">
              {hasFilters
                ? `${filteredListings.length} ${
                    locale === "ar"
                      ? "نتيجة"
                      : locale === "en"
                      ? "results"
                      : "résultat(s)"
                  }`
                : `${nbTotal} ${
                    locale === "ar"
                      ? "عقار متاح"
                      : locale === "en"
                      ? "properties available"
                      : "biens disponibles"
                  }`}
            </p>
          </div>
          {hasFilters && (
            <Link href={`/${locale}/${params.agence}`}>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                {locale === "ar" ? "مسح الفلاتر" : locale === "en" ? "Clear filters" : "Effacer les filtres"}
              </Button>
            </Link>
          )}
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-5 bg-muted rounded-2xl flex items-center justify-center">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium mb-1">{t.aucun_resultat}</p>
            <p className="text-body-sm text-muted-foreground mb-6">
              {locale === "ar"
                ? "جرب تغيير معايير البحث"
                : locale === "en"
                ? "Try changing your filters"
                : "Essayez de modifier vos filtres"}
            </p>
            <Link href={`/${locale}/${params.agence}`}>
              <Button variant="outline" size="sm">
                {locale === "ar" ? "مسح الفلاتر" : locale === "en" ? "Clear filters" : "Effacer les filtres"}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((bien) => {
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
                <Link
                  key={bien.id}
                  href={`/${locale}/${params.agence}/${bien.id}`}
                  className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-card transition-all duration-300 block"
                >
                  <TrackerVue listingId={bien.id} agentId={agence.id} />

                  {/* Image */}
                  <div className="relative h-52 bg-muted overflow-hidden">
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
                      <span className="text-white font-bold">
                        {formatPrix(bien.prix)}
                        {bien.type_transaction === "Location" && (
                          <span className="text-white/70 text-xs font-normal">
                            {" "}/ {locale === "ar" ? "شهر" : locale === "en" ? "mo" : "mois"}
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Favori/Comparer */}
                    <div className="absolute top-3 end-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <BoutonFavori bien={bienFavori} taille="sm" />
                      <BoutonComparer bien={bienFavori} />
                    </div>

                    {/* Photo count */}
                    {bien.photos && bien.photos.length > 1 && (
                      <div className="absolute bottom-3 end-3 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] backdrop-blur-sm">
                        {bien.photos.length}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-or transition-colors">
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
                      {bien.etage !== null && bien.etage !== undefined && (
                        <span className="px-2 py-0.5 rounded-md bg-muted text-caption text-muted-foreground">
                          {locale === "ar" ? "ط" : locale === "en" ? "F" : "ét."}{bien.etage}
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

                    {/* CTA */}
                    <span className="text-caption font-medium text-or flex items-center gap-1">
                      {t.voir_details}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <PanneauComparaison />

      {/* ─── Section Confiance + Zones ─── */}
      <section className="bg-white border-t border-border">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Bloc de confiance */}
            <BlocConfiance
              estVerifie={agence.est_verifie}
              nbAnnonces={nbTotal}
              wilaya={locale === "ar" ? wilayaAgence?.nom_ar : wilayaAgence?.nom_fr}
              anneesActivite={anneesActivite}
              locale={locale}
            />

            {/* Zones couvertes + stats */}
            <div className="space-y-5">
              {wilayasCouvertes.length > 0 && (
                <BandeauPresence wilayas={wilayasCouvertes} locale={locale} />
              )}

              {/* Stats détaillées */}
              <div className="rounded-2xl border border-border bg-white p-5">
                <h3 className="text-body-sm font-semibold text-foreground mb-4">
                  {locale === "ar"
                    ? "أرقامنا الرئيسية"
                    : locale === "en"
                    ? "Key figures"
                    : "Nos chiffres clés"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50 text-center">
                    <TrendingUp className="h-5 w-5 text-bleu-nuit mx-auto mb-2" />
                    <p className="text-heading-4 font-bold text-bleu-nuit">{nbTotal}</p>
                    <p className="text-caption text-muted-foreground">
                      {locale === "ar" ? "عقار منشور" : locale === "en" ? "Published" : "Publiés"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-50 text-center">
                    <Clock className="h-5 w-5 text-or mx-auto mb-2" />
                    <p className="text-heading-4 font-bold text-or">{anneesActivite}</p>
                    <p className="text-caption text-muted-foreground">
                      {locale === "ar"
                        ? "سنة خبرة"
                        : locale === "en"
                        ? `Year${anneesActivite > 1 ? "s" : ""}`
                        : `An${anneesActivite > 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-emerald-50 text-center">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                    <p className="text-heading-4 font-bold text-emerald-600">
                      {allListings.filter((a) => a.statut_document === "Acte" || a.statut_document === "Livret foncier").length}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {locale === "ar"
                        ? "بوثائق رسمية"
                        : locale === "en"
                        ? "With legal docs"
                        : "Avec acte"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 text-center">
                    <MapPin className="h-5 w-5 text-purple-600 mx-auto mb-2" />
                    <p className="text-heading-4 font-bold text-purple-600">{wilayasCouvertes.length}</p>
                    <p className="text-caption text-muted-foreground">
                      {locale === "ar" ? "ولاية" : locale === "en" ? "Provinces" : "Wilayas"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Contact ─── */}
      <section className="bg-bleu-nuit">
        <div className="container mx-auto px-4 py-12 md:py-16 text-center">
          <h2 className="text-heading-3 md:text-heading-2 font-bold text-white mb-3">
            {locale === "ar"
              ? "هل تبحثون عن عقار محدد؟"
              : locale === "en"
              ? "Looking for a specific property?"
              : "Vous cherchez un bien précis ?"}
          </h2>
          <p className="text-body text-white/70 max-w-lg mx-auto mb-8">
            {locale === "ar"
              ? "تواصلوا معنا وسنساعدكم في العثور على العقار المثالي"
              : locale === "en"
              ? "Contact us and we'll help you find the perfect property"
              : "Contactez-nous et nous vous aiderons à trouver le bien idéal"}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`https://wa.me/${agence.telephone_whatsapp.replace(/\s/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-or hover:bg-or/90 text-bleu-nuit font-semibold min-w-[220px]"
              >
                <MessageCircle className="h-4 w-4 me-2" />
                {t.contacter_whatsapp}
              </Button>
            </a>
            <a href={`tel:${agence.telephone_whatsapp}`}>
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 min-w-[220px]"
              >
                <Phone className="h-4 w-4 me-2" />
                {agence.telephone_whatsapp}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer élaboré ─── */}
      <footer className="bg-white border-t border-border">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Colonne agence */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-bleu-nuit rounded-lg flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-body font-bold text-foreground">
                  {agence.nom_agence}
                </span>
              </div>
              {agence.description && (
                <p className="text-caption text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                  {agence.description}
                </p>
              )}
              {wilayaAgence && (
                <p className="text-caption text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  {agence.commune && `${agence.commune}, `}
                  {locale === "ar" ? wilayaAgence.nom_ar : wilayaAgence.nom_fr}
                </p>
              )}
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-body-sm font-semibold text-foreground mb-3">
                {locale === "ar" ? "روابط سريعة" : locale === "en" ? "Quick links" : "Liens rapides"}
              </h4>
              <nav className="space-y-2">
                <Link
                  href={`/${locale}/${params.agence}`}
                  className="block text-caption text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.accueil}
                </Link>
                <Link
                  href={`/${locale}/${params.agence}?transaction=Vente`}
                  className="block text-caption text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "ar" ? "عقارات للبيع" : locale === "en" ? "For sale" : "Biens à vendre"}
                </Link>
                <Link
                  href={`/${locale}/${params.agence}?transaction=Location`}
                  className="block text-caption text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "ar" ? "عقارات للإيجار" : locale === "en" ? "For rent" : "Biens à louer"}
                </Link>
                <Link
                  href={`/${locale}/${params.agence}/a-propos`}
                  className="block text-caption text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "ar" ? "من نحن" : locale === "en" ? "About us" : "À propos"}
                </Link>
                <Link
                  href={`/${locale}/${params.agence}/contact`}
                  className="block text-caption text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "ar" ? "اتصل بنا" : locale === "en" ? "Contact" : "Contact"}
                </Link>
              </nav>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-body-sm font-semibold text-foreground mb-3">
                {locale === "ar" ? "تواصلوا معنا" : locale === "en" ? "Contact us" : "Nous contacter"}
              </h4>
              <div className="space-y-2.5">
                <a
                  href={`https://wa.me/${agence.telephone_whatsapp.replace(/\s/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-caption text-muted-foreground hover:text-or transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
                <a
                  href={`tel:${agence.telephone_whatsapp}`}
                  className="flex items-center gap-2 text-caption text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {agence.telephone_whatsapp}
                </a>
                {agence.adresse && (
                  <p className="flex items-center gap-2 text-caption text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    {agence.adresse}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3">
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
              &copy; {new Date().getFullYear()} {agence.nom_agence} &middot; AqarVision
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
