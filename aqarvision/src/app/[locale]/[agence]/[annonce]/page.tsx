import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Building2,
  Phone,
  MapPin,
  MessageCircle,
  BadgeCheck,
  ArrowLeft,
  Ruler,
  DoorOpen,
  Layers,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  Calendar,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrix, formatSurface, whatsappLink } from "@/lib/utils";
import { getWilayaById } from "@/lib/wilayas";
import { getDictionnaire, getDirection, type Locale } from "@/lib/i18n";
import { TrackerVue } from "@/components/analytics/tracker-vue";
import { BlocConfiance } from "@/components/branding/trust-badges";
import type { Listing, Profile } from "@/types";

const LOCALES_VALIDES = ["fr", "ar", "en"];

interface AnnoncePageProps {
  params: { locale: string; agence: string; annonce: string };
}

/** Métadonnées SEO dynamiques pour la fiche annonce */
export async function generateMetadata({
  params,
}: AnnoncePageProps): Promise<Metadata> {
  const locale = LOCALES_VALIDES.includes(params.locale) ? params.locale : "fr";
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug_url", params.agence)
    .single();

  if (!profile) return { title: "Annonce non trouvée - AqarVision" };

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", params.annonce)
    .eq("agent_id", profile.id)
    .eq("est_active", true)
    .single();

  if (!listing) return { title: "Annonce non trouvée - AqarVision" };

  const bien = listing as Listing;
  const agence = profile as Profile;
  const wilaya = getWilayaById(bien.wilaya_id);

  const titre = `${bien.titre} - ${formatPrix(bien.prix)} | ${agence.nom_agence}`;
  const description = `${bien.type_bien} ${bien.type_transaction === "Location" ? "à louer" : "à vendre"} - ${formatSurface(bien.surface)}${wilaya ? ` à ${wilaya.nom_fr}` : ""}. ${bien.description?.substring(0, 120) || ""}`;

  return {
    title: titre,
    description,
    openGraph: {
      title: titre,
      description,
      type: "article",
      locale: locale === "ar" ? "ar_DZ" : locale === "en" ? "en_US" : "fr_DZ",
      siteName: "AqarVision",
      images: bien.photos?.[0]
        ? [{ url: bien.photos[0], width: 800, height: 600, alt: bien.titre }]
        : [],
    },
    twitter: { card: "summary_large_image", title: bien.titre, description },
  };
}

/** Page détail d'une annonce immobilière */
export default async function AnnoncePage({ params }: AnnoncePageProps) {
  const locale = (LOCALES_VALIDES.includes(params.locale) ? params.locale : "fr") as Locale;
  const dir = getDirection(locale);
  const t = getDictionnaire(locale);
  const supabase = createClient();

  // Charger l'agence
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug_url", params.agence)
    .single();

  if (!profile) notFound();
  const agence = profile as Profile;
  const wilayaAgence = getWilayaById(agence.wilaya_id);

  // Charger l'annonce
  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", params.annonce)
    .eq("agent_id", agence.id)
    .eq("est_active", true)
    .single();

  if (!listing) notFound();
  const bien = listing as Listing;
  const wilaya = getWilayaById(bien.wilaya_id);

  // Compter les annonces actives de l'agence
  const { count: nbAnnoncesAgence } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", agence.id)
    .eq("est_active", true);

  // Calculer les années d'activité
  const anneesActivite = Math.max(
    0,
    new Date().getFullYear() - new Date(agence.created_at).getFullYear()
  );

  // Charger les biens similaires
  const { data: similaires } = await supabase
    .from("listings")
    .select("*")
    .eq("agent_id", agence.id)
    .eq("est_active", true)
    .eq("type_bien", bien.type_bien)
    .neq("id", bien.id)
    .limit(3);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: bien.titre,
    description: bien.description,
    url: `/${locale}/${params.agence}/${bien.id}`,
    image: bien.photos,
    offers: {
      "@type": "Offer",
      price: bien.prix,
      priceCurrency: "DZD",
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: bien.commune || wilaya?.nom_fr,
      addressRegion: wilaya?.nom_fr,
      addressCountry: "DZ",
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: bien.surface,
      unitCode: "MTK",
    },
    numberOfRooms: bien.nb_pieces,
  };

  const photos = bien.photos || [];
  const datePublication = new Date(bien.created_at).toLocaleDateString(
    locale === "ar" ? "ar-DZ" : locale === "en" ? "en-GB" : "fr-FR",
    { day: "numeric", month: "long", year: "numeric" }
  );

  // Équipements
  const equipements = [
    { key: "ascenseur", label: t.ascenseur, active: bien.ascenseur },
    { key: "garage", label: t.garage, active: bien.garage },
    { key: "jardin", label: t.jardin, active: bien.jardin },
    { key: "citerne", label: t.citerne, active: bien.citerne },
  ].filter((e) => e.active);

  return (
    <div className="min-h-screen bg-blanc-casse" dir={dir}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrackerVue listingId={bien.id} agentId={agence.id} />

      {/* ─── Header compact ─── */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href={`/${locale}/${params.agence}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <div className="flex items-center gap-2">
              {agence.logo_url ? (
                <img
                  src={agence.logo_url}
                  alt={agence.nom_agence}
                  className="w-6 h-6 rounded object-cover"
                />
              ) : (
                <div className="w-6 h-6 bg-bleu-nuit rounded flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              <span className="text-body-sm font-medium hidden sm:inline">
                {agence.nom_agence}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Share2 className="h-4 w-4" />
            </Button>
            <a
              href={whatsappLink(agence.telephone_whatsapp, bien.titre)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="or" size="sm">
                <MessageCircle className="h-3.5 w-3.5 me-1.5" />
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* ─── Colonne principale ─── */}
          <div className="space-y-6">
            {/* Galerie photos */}
            {photos.length > 0 ? (
              <div className="space-y-3">
                {/* Photo principale */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-muted">
                  <img
                    src={photos[0]}
                    alt={bien.titre}
                    className="w-full h-full object-cover"
                  />
                  {/* Badges sur la photo */}
                  <div className="absolute top-4 start-4 flex gap-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-bleu-nuit/80 text-white backdrop-blur-sm">
                      {bien.type_transaction}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-600/80 text-white backdrop-blur-sm">
                      {bien.statut_document}
                    </span>
                  </div>
                  {/* Compteur photos */}
                  {photos.length > 1 && (
                    <div className="absolute bottom-4 end-4 px-3 py-1 rounded-lg bg-black/50 text-white text-xs backdrop-blur-sm">
                      1 / {photos.length}
                    </div>
                  )}
                </div>
                {/* Miniatures */}
                {photos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {photos.slice(0, 6).map((photo, i) => (
                      <div
                        key={i}
                        className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                          i === 0 ? "border-or" : "border-transparent"
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`${bien.titre} - ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {photos.length > 6 && (
                      <div className="w-20 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-caption font-medium text-muted-foreground">
                        +{photos.length - 6}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[16/10] rounded-2xl bg-muted flex items-center justify-center">
                <Building2 className="h-16 w-16 text-muted-foreground/20" />
              </div>
            )}

            {/* Titre et prix */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-heading-2 font-bold text-foreground mb-1.5">
                    {bien.titre}
                  </h1>
                  <p className="text-body-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {bien.quartier && `${bien.quartier}, `}
                    {bien.commune && `${bien.commune}, `}
                    {locale === "ar" ? wilaya?.nom_ar : wilaya?.nom_fr}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-heading-2 font-bold text-or">
                    {formatPrix(bien.prix)}
                  </p>
                  {bien.type_transaction === "Location" && (
                    <span className="text-caption text-muted-foreground">
                      / {locale === "ar" ? "شهر" : locale === "en" ? "month" : "mois"}
                    </span>
                  )}
                </div>
              </div>

              {/* Date */}
              <p className="text-caption text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {locale === "ar"
                  ? `نُشر في ${datePublication}`
                  : locale === "en"
                  ? `Published ${datePublication}`
                  : `Publié le ${datePublication}`}
              </p>
            </div>

            {/* Caractéristiques principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border bg-white p-4 text-center">
                <Ruler className="h-5 w-5 text-or mx-auto mb-2" />
                <p className="text-heading-4 font-bold text-foreground">{bien.surface}</p>
                <p className="text-caption text-muted-foreground">m²</p>
              </div>
              {bien.nb_pieces && (
                <div className="rounded-xl border border-border bg-white p-4 text-center">
                  <DoorOpen className="h-5 w-5 text-or mx-auto mb-2" />
                  <p className="text-heading-4 font-bold text-foreground">{bien.nb_pieces}</p>
                  <p className="text-caption text-muted-foreground">
                    {locale === "ar" ? "غرف" : locale === "en" ? "rooms" : "pièces"}
                  </p>
                </div>
              )}
              {bien.etage !== null && bien.etage !== undefined && (
                <div className="rounded-xl border border-border bg-white p-4 text-center">
                  <Layers className="h-5 w-5 text-or mx-auto mb-2" />
                  <p className="text-heading-4 font-bold text-foreground">{bien.etage}</p>
                  <p className="text-caption text-muted-foreground">
                    {locale === "ar" ? "طابق" : locale === "en" ? "floor" : "étage"}
                  </p>
                </div>
              )}
              <div className="rounded-xl border border-border bg-white p-4 text-center">
                <ShieldCheck className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                <p className="text-body-sm font-semibold text-foreground">{bien.statut_document}</p>
                <p className="text-caption text-muted-foreground">
                  {locale === "ar" ? "وثيقة" : locale === "en" ? "document" : "papier"}
                </p>
              </div>
            </div>

            {/* Description */}
            {bien.description && (
              <div className="rounded-2xl border border-border bg-white p-6">
                <h2 className="text-heading-4 font-bold text-foreground mb-4">
                  {t.description}
                </h2>
                <div
                  className="text-body-sm text-muted-foreground leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: bien.description }}
                />
              </div>
            )}

            {/* Équipements */}
            {equipements.length > 0 && (
              <div className="rounded-2xl border border-border bg-white p-6">
                <h2 className="text-heading-4 font-bold text-foreground mb-4">
                  {locale === "ar" ? "المميزات" : locale === "en" ? "Amenities" : "Équipements"}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {equipements.map((eq) => (
                    <div
                      key={eq.key}
                      className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-50"
                    >
                      <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-body-sm text-foreground">{eq.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Biens similaires */}
            {similaires && similaires.length > 0 && (
              <div>
                <h2 className="text-heading-4 font-bold text-foreground mb-4">
                  {locale === "ar"
                    ? "عقارات مشابهة"
                    : locale === "en"
                    ? "Similar properties"
                    : "Biens similaires"}
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {(similaires as Listing[]).map((sim) => {
                    const wSim = getWilayaById(sim.wilaya_id);
                    return (
                      <Link
                        key={sim.id}
                        href={`/${locale}/${params.agence}/${sim.id}`}
                        className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-card transition-shadow"
                      >
                        <div className="relative h-32 bg-muted">
                          {sim.photos?.[0] ? (
                            <img
                              src={sim.photos[0]}
                              alt={sim.titre}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="h-8 w-8 text-muted-foreground/20" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="font-semibold text-body-sm text-foreground line-clamp-1">
                            {sim.titre}
                          </p>
                          <p className="text-caption text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {sim.commune && `${sim.commune}, `}
                            {locale === "ar" ? wSim?.nom_ar : wSim?.nom_fr}
                          </p>
                          <p className="text-body-sm font-bold text-or mt-1.5">
                            {formatPrix(sim.prix)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ─── Sidebar contact ─── */}
          <div className="space-y-5">
            {/* Card agence */}
            <div className="rounded-2xl border border-border bg-white p-6 sticky top-20">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                  {agence.logo_url ? (
                    <img
                      src={agence.logo_url}
                      alt={agence.nom_agence}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-foreground">{agence.nom_agence}</h3>
                    {agence.est_verifie && (
                      <BadgeCheck className="h-4 w-4 text-or flex-shrink-0" />
                    )}
                  </div>
                  {wilayaAgence && (
                    <p className="text-caption text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {agence.commune && `${agence.commune}, `}
                      {locale === "ar" ? wilayaAgence.nom_ar : wilayaAgence.nom_fr}
                    </p>
                  )}
                </div>
              </div>

              {/* Badges de confiance */}
              {agence.est_verifie && (
                <div className="flex items-center gap-2 mb-5 p-3 rounded-lg bg-emerald-50">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-caption font-medium text-emerald-700">
                    {locale === "ar"
                      ? "وكالة معتمدة ومتحقق منها"
                      : locale === "en"
                      ? "Verified & approved agency"
                      : "Agence vérifiée et agréée"}
                  </span>
                </div>
              )}

              {/* Actions contact */}
              <div className="space-y-2.5">
                <a
                  href={whatsappLink(agence.telephone_whatsapp, bien.titre)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="or" size="lg" className="w-full">
                    <MessageCircle className="h-4 w-4 me-2" />
                    {t.contacter_whatsapp}
                  </Button>
                </a>
                <a href={`tel:${agence.telephone_whatsapp}`} className="block">
                  <Button variant="outline" size="lg" className="w-full">
                    <Phone className="h-4 w-4 me-2" />
                    {t.appeler}
                  </Button>
                </a>
              </div>

              {/* Numéro visible */}
              <p className="text-center text-caption text-muted-foreground mt-4">
                {agence.telephone_whatsapp}
              </p>
            </div>

            {/* Info rapide */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="text-body-sm font-semibold text-foreground mb-3">
                {locale === "ar" ? "ملخص" : locale === "en" ? "Summary" : "Résumé"}
              </h3>
              <div className="space-y-2.5">
                {[
                  {
                    label: t.type_bien,
                    value: bien.type_bien,
                  },
                  {
                    label: t.type_transaction,
                    value: bien.type_transaction,
                  },
                  {
                    label: t.surface,
                    value: formatSurface(bien.surface),
                  },
                  ...(bien.nb_pieces
                    ? [{ label: t.nb_pieces, value: `${bien.nb_pieces}` }]
                    : []),
                  ...(bien.etage !== null && bien.etage !== undefined
                    ? [{ label: t.etage, value: `${bien.etage}` }]
                    : []),
                  {
                    label: t.statut_document,
                    value: bien.statut_document,
                  },
                  {
                    label: t.wilaya,
                    value: locale === "ar" ? wilaya?.nom_ar || "" : wilaya?.nom_fr || "",
                  },
                  ...(bien.commune
                    ? [{ label: t.commune, value: bien.commune }]
                    : []),
                  ...(bien.quartier
                    ? [{ label: t.quartier, value: bien.quartier }]
                    : []),
                ].map((item, i) => (
                  <div key={i} className="flex justify-between text-body-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bloc de confiance */}
            <BlocConfiance
              estVerifie={agence.est_verifie}
              nbAnnonces={nbAnnoncesAgence ?? 0}
              wilaya={locale === "ar" ? wilayaAgence?.nom_ar : wilayaAgence?.nom_fr}
              anneesActivite={anneesActivite}
              locale={locale}
            />
          </div>
        </div>
      </main>

      {/* ─── Sticky CTA mobile ─── */}
      <div className="fixed bottom-0 inset-x-0 lg:hidden bg-white border-t border-border p-3 z-50">
        <div className="flex gap-2.5 max-w-lg mx-auto">
          <a
            href={whatsappLink(agence.telephone_whatsapp, bien.titre)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="or" size="lg" className="w-full">
              <MessageCircle className="h-4 w-4 me-2" />
              WhatsApp
            </Button>
          </a>
          <a href={`tel:${agence.telephone_whatsapp}`}>
            <Button variant="outline" size="lg">
              <Phone className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-white py-8 pb-24 lg:pb-8">
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
