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
import { GaleriePhotos } from "@/components/vitrine/galerie-photos";
import { BoutonPartage } from "@/components/vitrine/bouton-partage";
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
  const videos = bien.videos || [];
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

      {/* ─── Header compact with glassmorphism ─── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <Link
            href={`/${locale}/${params.agence}`}
            className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <div className="flex items-center gap-2">
              {agence.logo_url ? (
                <img
                  src={agence.logo_url}
                  alt={agence.nom_agence}
                  className="w-6 h-6 rounded-lg object-cover"
                />
              ) : (
                <div className="w-6 h-6 bg-bleu-nuit rounded-lg flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              <span className="text-body-sm font-medium hidden sm:inline">
                {agence.nom_agence}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <BoutonPartage titre={bien.titre} />
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

      <main className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-10">
          {/* ─── Colonne principale ─── */}
          <div className="space-y-6">

            {/* ─── 1. Gallery — Interactive ─── */}
            <GaleriePhotos
              photos={photos}
              titre={bien.titre}
              typeTransaction={bien.type_transaction}
              statutDocument={bien.statut_document}
            />

            {/* Vidéos */}
            {videos.length > 0 && (
              <div className="rounded-2xl border border-border/60 bg-white p-6 md:p-8 shadow-soft">
                <h2 className="text-heading-4 font-bold text-foreground mb-4">
                  {locale === "ar" ? "فيديوهات" : locale === "en" ? "Videos" : "Vidéos"}
                </h2>
                <div className="grid gap-4">
                  {videos.map((video, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden">
                      <video
                        src={video}
                        controls
                        preload="metadata"
                        className="w-full aspect-video bg-black rounded-2xl"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── 2. Title + Price — Clear hierarchy ─── */}
            <div className="animate-fade-in-up">
              {/* Price — most prominent, text-heading-2 text-or bold */}
              <p className="text-heading-2 font-bold text-or mb-1">
                {formatPrix(bien.prix)}
                {bien.type_transaction === "Location" && (
                  <span className="text-body-lg font-normal text-muted-foreground ms-1">
                    / {locale === "ar" ? "شهر" : locale === "en" ? "month" : "mois"}
                  </span>
                )}
              </p>

              {/* Title — text-heading-3 */}
              <h1 className="font-vitrine text-heading-3 font-bold text-foreground mb-2.5">
                {bien.titre}
              </h1>

              {/* Location — subtle with MapPin */}
              <p className="text-body-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                {bien.quartier && `${bien.quartier}, `}
                {bien.commune && `${bien.commune}, `}
                {locale === "ar" ? wilaya?.nom_ar : wilaya?.nom_fr}
              </p>

              {/* Publication date — subtle caption */}
              <p className="text-caption text-muted-foreground/70 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {locale === "ar"
                  ? `نُشر في ${datePublication}`
                  : locale === "en"
                  ? `Published ${datePublication}`
                  : `Publié le ${datePublication}`}
              </p>
            </div>

            {/* ─── 3. Characteristics grid — Premium stat cards ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="glass-card rounded-xl border border-border/60 p-4 text-center shadow-soft cursor-pointer">
                <Ruler className="h-5 w-5 text-or mx-auto mb-2.5" />
                <p className="text-heading-4 font-bold text-foreground">{bien.surface}</p>
                <p className="text-caption text-muted-foreground mt-0.5">m²</p>
              </div>
              {bien.nb_pieces && (
                <div className="glass-card rounded-xl border border-border/60 p-4 text-center shadow-soft cursor-pointer">
                  <DoorOpen className="h-5 w-5 text-or mx-auto mb-2.5" />
                  <p className="text-heading-4 font-bold text-foreground">{bien.nb_pieces}</p>
                  <p className="text-caption text-muted-foreground mt-0.5">
                    {locale === "ar" ? "غرف" : locale === "en" ? "rooms" : "pièces"}
                  </p>
                </div>
              )}
              {bien.etage !== null && bien.etage !== undefined && (
                <div className="glass-card rounded-xl border border-border/60 p-4 text-center shadow-soft cursor-pointer">
                  <Layers className="h-5 w-5 text-or mx-auto mb-2.5" />
                  <p className="text-heading-4 font-bold text-foreground">{bien.etage}</p>
                  <p className="text-caption text-muted-foreground mt-0.5">
                    {locale === "ar" ? "طابق" : locale === "en" ? "floor" : "étage"}
                  </p>
                </div>
              )}
              <div className="glass-card rounded-xl border border-border/60 p-4 text-center shadow-soft cursor-pointer">
                <ShieldCheck className="h-5 w-5 text-or mx-auto mb-2.5" />
                <p className="text-body-sm font-bold text-foreground">{bien.statut_document}</p>
                <p className="text-caption text-muted-foreground mt-0.5">
                  {locale === "ar" ? "وثيقة" : locale === "en" ? "document" : "papier"}
                </p>
              </div>
            </div>

            {/* ─── 4. Description — Clean prose card ─── */}
            {bien.description && (
              <div className="rounded-2xl border border-border/60 bg-white p-6 md:p-8 shadow-soft">
                <h2 className="text-heading-4 font-bold text-foreground mb-4">
                  {t.description}
                </h2>
                <div
                  className="text-body text-muted-foreground leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: bien.description }}
                />
              </div>
            )}

            {/* ─── 5. Amenities — Emerald pills with check icon ─── */}
            {equipements.length > 0 && (
              <div className="rounded-2xl border border-border/60 bg-white p-6 md:p-8 shadow-soft">
                <h2 className="text-heading-4 font-bold text-foreground mb-4">
                  {locale === "ar" ? "المميزات" : locale === "en" ? "Amenities" : "Équipements"}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {equipements.map((eq) => (
                    <div
                      key={eq.key}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50/70 border border-emerald-100"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <span className="text-body-sm font-medium text-foreground">{eq.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── 7. Similar properties — Premium cards ─── */}
            {similaires && similaires.length > 0 && (
              <div className="pt-2">
                <h2 className="text-heading-4 font-bold text-foreground mb-5">
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
                        className="group glass-card rounded-2xl border border-border/60 overflow-hidden shadow-soft cursor-pointer"
                      >
                        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                          {sim.photos?.[0] ? (
                            <img
                              src={sim.photos[0]}
                              alt={sim.titre}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="h-10 w-10 text-muted-foreground/20" />
                            </div>
                          )}
                          {/* Subtle bottom gradient */}
                          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                        </div>
                        <div className="p-4">
                          <p className="font-semibold text-body-sm text-foreground line-clamp-1 mb-1">
                            {sim.titre}
                          </p>
                          <p className="text-caption text-muted-foreground flex items-center gap-1 mb-2">
                            <MapPin className="h-3 w-3" />
                            {sim.commune && `${sim.commune}, `}
                            {locale === "ar" ? wSim?.nom_ar : wSim?.nom_fr}
                          </p>
                          <p className="text-body font-bold text-or">
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

          {/* ─── 6. Sidebar contact — Sticky, premium ─── */}
          <div className="space-y-5">
            {/* Card agence — shadow-card, rounded-2xl */}
            <div className="glass-card rounded-2xl p-6 sticky top-20 shadow-card border border-border/40">
              {/* Agency logo + name + verified */}
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0 border border-border/50 overflow-hidden">
                  {agence.logo_url ? (
                    <img
                      src={agence.logo_url}
                      alt={agence.nom_agence}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-foreground text-body-lg">{agence.nom_agence}</h3>
                    {agence.est_verifie && (
                      <BadgeCheck className="h-5 w-5 text-or flex-shrink-0" />
                    )}
                  </div>
                  {wilayaAgence && (
                    <p className="text-caption text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {agence.commune && `${agence.commune}, `}
                      {locale === "ar" ? wilayaAgence.nom_ar : wilayaAgence.nom_fr}
                    </p>
                  )}
                </div>
              </div>

              {/* Verified badge */}
              {agence.est_verifie && (
                <div className="flex items-center gap-2.5 mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
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

              {/* WhatsApp primary (variant="or"), phone secondary */}
              <div className="space-y-2.5">
                <a
                  href={whatsappLink(agence.telephone_whatsapp, bien.titre)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="or" size="lg" className="w-full shadow-soft hover:shadow-card transition-shadow duration-200">
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

              {/* Phone number displayed subtly */}
              <p className="text-center text-caption text-muted-foreground/70 mt-4 tracking-wide">
                {agence.telephone_whatsapp}
              </p>
            </div>

            {/* Summary card */}
            <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft">
              <h3 className="text-body-sm font-bold text-foreground mb-3.5">
                {locale === "ar" ? "ملخص" : locale === "en" ? "Summary" : "Résumé"}
              </h3>
              <div className="space-y-0">
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
                  <div key={i} className="flex justify-between text-body-sm py-2.5 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">{item.value}</span>
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

      {/* ─── 8. Mobile CTA — Fixed bottom bar with glassmorphism ─── */}
      <div className="fixed bottom-0 inset-x-0 lg:hidden bg-white/95 backdrop-blur-sm border-t border-border/50 p-3 z-50 shadow-float">
        <div className="flex gap-2.5 max-w-lg mx-auto">
          <a
            href={whatsappLink(agence.telephone_whatsapp, bien.titre)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="or" size="lg" className="w-full shadow-soft">
              <MessageCircle className="h-4 w-4 me-2" />
              WhatsApp
            </Button>
          </a>
          <a href={`tel:${agence.telephone_whatsapp}`}>
            <Button variant="outline" size="lg" className="px-4">
              <Phone className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/50 bg-white py-8 pb-24 lg:pb-8">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
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
