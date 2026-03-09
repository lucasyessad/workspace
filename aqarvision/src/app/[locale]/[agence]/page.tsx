import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Building2,
  Phone,
  MapPin,
  MessageCircle,
  BadgeCheck,
  ShieldCheck,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { getWilayaById } from "@/lib/wilayas";
import { getDictionnaire, getDirection, type Locale } from "@/lib/i18n";
import { resolveThemeColors } from "@/lib/themes";
import { LangueSwitcher } from "@/components/shared/langue-switcher";
import { FiltresAvances } from "@/components/vitrine/filtres-avances";
import { ChatbotVitrine } from "@/components/vitrine/chatbot-vitrine";
import type { Listing, Profile } from "@/types";

const LOCALES_VALIDES = ["fr", "ar", "en"];

interface AgenceLocalePageProps {
  params: { locale: string; agence: string };
  searchParams: { type?: string; transaction?: string };
}

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

  if (!profile) return { title: "Agence non trouvée - AqarVision" };

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
  const description =
    agence.description?.substring(0, 160) ||
    descriptions[locale] ||
    descriptions.fr;

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

export default async function AgenceLocalePage({
  params,
}: AgenceLocalePageProps) {
  const locale = (
    LOCALES_VALIDES.includes(params.locale) ? params.locale : "fr"
  ) as Locale;
  const dir = getDirection(locale);
  const t = getDictionnaire(locale);
  const supabase = createClient();

  /* ── Data ── */
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug_url", params.agence)
    .single();

  if (!profile) notFound();
  const agence = profile as Profile;
  const wilayaAgence = getWilayaById(agence.wilaya_id);
  const theme = resolveThemeColors(
    agence.theme_id || "classique",
    agence.custom_primary,
    agence.custom_accent
  );

  const { data: toutesAnnonces } = await supabase
    .from("listings")
    .select("*")
    .eq("agent_id", agence.id)
    .eq("est_active", true)
    .order("created_at", { ascending: false });

  const allListings = (toutesAnnonces as Listing[]) || [];

  /* ── Stats ── */
  const nbTotal = allListings.length;
  const nbVente = allListings.filter((a) => a.type_transaction === "Vente").length;
  const nbLocation = allListings.filter((a) => a.type_transaction === "Location").length;

  // Hero background from first listing with photo
  const hero = allListings.find((a) => a.photos && a.photos.length > 0);

  // Build wilaya map for client component
  const wilayaIds = Array.from(new Set(allListings.map((a) => a.wilaya_id)));
  const wilayaMap: Record<number, { nom_fr: string; nom_ar: string }> = {};
  for (const id of wilayaIds) {
    const w = getWilayaById(id);
    if (w) wilayaMap[id] = { nom_fr: w.nom_fr, nom_ar: w.nom_ar };
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

  return (
    <div className="min-h-screen bg-blanc-casse" dir={dir}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ═══════════════════════════════════════════
          HERO — Premium Glassmorphism
          ═══════════════════════════════════════════ */}
      <header className="relative overflow-hidden min-h-[85vh] md:min-h-[90vh] flex flex-col" style={{ backgroundColor: theme.primary }}>
        {/* Background image with parallax-like overlay */}
        {hero?.photos?.[0] && (
          <div className="absolute inset-0">
            <img
              src={hero.photos[0]}
              alt=""
              className="w-full h-full object-cover opacity-20"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}ee 0%, ${theme.primary}cc 40%, ${theme.primary}e6 70%, ${theme.primary} 100%)`,
              }}
            />
          </div>
        )}

        {/* Decorative accent glow */}
        <div
          className="absolute top-1/4 end-0 w-[500px] h-[500px] rounded-full opacity-[0.07] blur-[120px]"
          style={{ backgroundColor: theme.accent }}
        />

        {/* Nav */}
        <nav className="relative z-10">
          <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 opacity-70 hover:opacity-100 transition-opacity"
            >
              <div className="w-8 h-8 glass-dark rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-white/70">
                Aqar<span style={{ color: theme.accent }}>Vision</span>
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-6 text-body-sm">
                <Link
                  href={`/${locale}/${params.agence}`}
                  className="text-white font-medium"
                >
                  {t.accueil}
                </Link>
                <Link
                  href={`/${locale}/${params.agence}/a-propos`}
                  className="text-white/50 hover:text-white transition-colors duration-200"
                >
                  {locale === "ar" ? "من نحن" : locale === "en" ? "About" : "À propos"}
                </Link>
                <Link
                  href={`/${locale}/${params.agence}/contact`}
                  className="text-white/50 hover:text-white transition-colors duration-200"
                >
                  Contact
                </Link>
              </div>
              <LangueSwitcher localeActuelle={locale} slug={params.agence} />
            </div>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="container mx-auto px-4 md:px-8 py-12 md:py-0">
            <div className="max-w-3xl">
              {/* Identity */}
              <div className="flex items-center gap-5 mb-8 animate-fade-in-up">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl glass-dark flex items-center justify-center flex-shrink-0">
                  {agence.logo_url ? (
                    <img
                      src={agence.logo_url}
                      alt={agence.nom_agence}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-white/60" />
                  )}
                </div>
                <div>
                  {agence.est_verifie && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-caption font-medium text-emerald-400">
                        {locale === "ar"
                          ? "وكالة معتمدة"
                          : locale === "en"
                          ? "Verified agency"
                          : "Agence vérifiée"}
                      </span>
                    </div>
                  )}
                  <p className="text-body text-white/50 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {agence.commune && `${agence.commune}, `}
                    {wilayaAgence && (locale === "ar" ? wilayaAgence.nom_ar : wilayaAgence.nom_fr)}
                  </p>
                </div>
              </div>

              {/* Name — Playfair Display for luxury feel */}
              <h1 className="font-vitrine text-[2.5rem] md:text-[4rem] lg:text-[4.5rem] font-bold text-white leading-[1.1] tracking-tight mb-4 animate-fade-in-up delay-75">
                {agence.nom_agence}
                {agence.est_verifie && (
                  <BadgeCheck className="inline-block h-6 w-6 md:h-8 md:w-8 ms-3 align-middle" style={{ color: theme.accent }} />
                )}
              </h1>

              {agence.description && (
                <p className="text-body-lg text-white/50 leading-relaxed mb-10 max-w-xl animate-fade-in-up delay-100">
                  {agence.description}
                </p>
              )}

              {/* CTA */}
              <div className="flex flex-wrap items-center gap-4 mb-16 animate-fade-in-up delay-150">
                <a
                  href={`https://wa.me/${agence.telephone_whatsapp.replace(/\s/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="h-12 px-7 text-body font-semibold rounded-xl cursor-pointer transition-all duration-200 hover:brightness-110 hover:shadow-lg"
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.accentForeground,
                    }}
                  >
                    <MessageCircle className="h-5 w-5 me-2" />
                    WhatsApp
                  </Button>
                </a>
                <a href={`tel:${agence.telephone_whatsapp}`}>
                  <Button
                    size="lg"
                    className="h-12 px-7 text-body glass-dark text-white rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/15"
                  >
                    <Phone className="h-5 w-5 me-2" />
                    {t.appeler}
                  </Button>
                </a>
              </div>

              {/* Stats — Glass cards */}
              <div className="flex items-center gap-3 md:gap-4 animate-fade-in-up delay-200">
                <div className="glass-dark rounded-2xl px-6 py-4 text-center min-w-[90px]">
                  <p className="text-heading-3 md:text-heading-2 font-bold text-white">{nbTotal}</p>
                  <p className="text-caption text-white/40 mt-0.5">
                    {locale === "ar" ? "عقار" : locale === "en" ? "Listings" : "Annonces"}
                  </p>
                </div>
                <div className="glass-dark rounded-2xl px-6 py-4 text-center min-w-[90px]">
                  <p className="text-heading-3 md:text-heading-2 font-bold text-white">{nbVente}</p>
                  <p className="text-caption text-white/40 mt-0.5">{t.vente}</p>
                </div>
                <div className="glass-dark rounded-2xl px-6 py-4 text-center min-w-[90px]">
                  <p className="text-heading-3 md:text-heading-2 font-bold text-white">{nbLocation}</p>
                  <p className="text-caption text-white/40 mt-0.5">{t.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blanc-casse to-transparent" />
      </header>

      {/* ═══════════════════════════════════════════
          FILTERS + GRID (Client Component)
          ═══════════════════════════════════════════ */}
      <FiltresAvances
        annonces={allListings}
        agenceId={agence.id}
        slugAgence={params.agence}
        locale={locale}
        wilayaMap={wilayaMap}
      />

      {/* ═══════════════════════════════════════════
          MAP + INFO — Glassmorphism cards
          ═══════════════════════════════════════════ */}
      {wilayaAgence && (
        <section className="bg-blanc-casse">
          <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
            {/* Section heading */}
            <div className="text-center mb-12">
              <p className="text-caption font-semibold uppercase tracking-widest mb-3" style={{ color: theme.accent }}>
                {locale === "ar" ? "الموقع" : locale === "en" ? "Location" : "Localisation"}
              </p>
              <h2 className="font-vitrine text-heading-2 md:text-heading-1 font-bold text-foreground">
                {locale === "ar"
                  ? "تفضلوا بزيارتنا"
                  : locale === "en"
                  ? "Visit us"
                  : "Rendez-nous visite"}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-border shadow-card h-[350px] md:h-[450px]">
                <iframe
                  title={`${agence.nom_agence} - ${locale === "ar" ? "الموقع" : locale === "en" ? "Location" : "Localisation"}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent("")}&layer=mapnik&marker=&query=${encodeURIComponent(
                    `${agence.commune ? agence.commune + ", " : ""}${wilayaAgence.nom_fr}, Algeria`
                  )}`}
                  allowFullScreen
                />
              </div>

              {/* Info cards */}
              <div className="space-y-4">
                {/* Address */}
                <div className="glass-card rounded-2xl p-5 border border-border cursor-default">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${theme.accent}15` }}>
                      <MapPin className="h-5 w-5" style={{ color: theme.accent }} />
                    </div>
                    <div>
                      <p className="text-body font-semibold text-foreground">
                        {locale === "ar" ? "العنوان" : locale === "en" ? "Address" : "Adresse"}
                      </p>
                      <p className="text-body-sm text-muted-foreground mt-1">
                        {agence.adresse && `${agence.adresse}, `}
                        {agence.commune && `${agence.commune}, `}
                        {locale === "ar" ? wilayaAgence.nom_ar : wilayaAgence.nom_fr}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <a
                  href={`tel:${agence.telephone_whatsapp}`}
                  className="glass-card block rounded-2xl p-5 border border-border cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${theme.accent}15` }}>
                      <Phone className="h-5 w-5" style={{ color: theme.accent }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-body font-semibold text-foreground">
                        {locale === "ar" ? "الهاتف" : locale === "en" ? "Phone" : "Téléphone"}
                      </p>
                      <p className="text-body-sm text-muted-foreground mt-1">
                        {agence.telephone_whatsapp}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground/40 mt-1 flex-shrink-0" />
                  </div>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${agence.telephone_whatsapp.replace(/\s/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card block rounded-2xl p-5 border border-border hover:border-emerald-200 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-body font-semibold text-foreground">WhatsApp</p>
                      <p className="text-body-sm text-muted-foreground mt-1">
                        {locale === "ar"
                          ? "تواصلوا معنا عبر واتساب"
                          : locale === "en"
                          ? "Message us on WhatsApp"
                          : "Écrivez-nous sur WhatsApp"}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground/40 mt-1 flex-shrink-0" />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          CTA — Premium gradient
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: theme.primary }}>
        {/* Decorative elements */}
        <div
          className="absolute top-0 start-1/4 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[100px]"
          style={{ backgroundColor: theme.accent }}
        />
        <div
          className="absolute bottom-0 end-1/4 w-[300px] h-[300px] rounded-full opacity-[0.04] blur-[80px]"
          style={{ backgroundColor: theme.accent }}
        />

        <div className="relative z-10 container mx-auto px-4 md:px-8 py-20 md:py-28">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-caption font-medium text-white/60 mb-8">
              <Sparkles className="h-3.5 w-3.5" style={{ color: theme.accent }} />
              {locale === "ar"
                ? "خدمة شخصية"
                : locale === "en"
                ? "Personalized service"
                : "Service personnalisé"}
            </div>

            <h2 className="font-vitrine text-heading-2 md:text-heading-1 font-bold text-white mb-4">
              {locale === "ar"
                ? "لم تجدوا ما تبحثون عنه؟"
                : locale === "en"
                ? "Didn't find what you're looking for?"
                : "Vous n'avez pas trouvé votre bien ?"}
            </h2>
            <p className="text-body-lg text-white/50 mb-10 max-w-lg mx-auto">
              {locale === "ar"
                ? "تواصلوا معنا مباشرة وسنبحث لكم عن العقار المناسب"
                : locale === "en"
                ? "Contact us directly and we'll find the right property for you"
                : "Contactez-nous directement, nous trouverons le bien qui vous correspond"}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`https://wa.me/${agence.telephone_whatsapp.replace(/\s/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="h-13 px-8 min-w-[220px] text-body font-semibold rounded-xl cursor-pointer transition-all duration-200 hover:brightness-110 hover:shadow-lg"
                  style={{ backgroundColor: theme.accent, color: theme.accentForeground }}
                >
                  <MessageCircle className="h-5 w-5 me-2" />
                  {t.contacter_whatsapp}
                </Button>
              </a>
              <a href={`tel:${agence.telephone_whatsapp}`}>
                <Button
                  size="lg"
                  className="h-13 px-8 min-w-[220px] text-body glass-dark text-white rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/15"
                >
                  <Phone className="h-5 w-5 me-2" />
                  {agence.telephone_whatsapp}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER — Clean & premium
          ═══════════════════════════════════════════ */}
      <footer style={{ backgroundColor: theme.primary }}>
        <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="grid md:grid-cols-3 gap-10 mb-12">
            {/* Agency */}
            <div>
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-xl glass-dark flex items-center justify-center">
                  {agence.logo_url ? (
                    <img
                      src={agence.logo_url}
                      alt={agence.nom_agence}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <Building2 className="h-5 w-5 text-white/60" />
                  )}
                </div>
                <div>
                  <p className="text-body font-semibold text-white">
                    {agence.nom_agence}
                  </p>
                  {agence.est_verifie && (
                    <p className="text-caption text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      {locale === "ar"
                        ? "وكالة معتمدة"
                        : locale === "en"
                        ? "Verified agency"
                        : "Agence vérifiée"}
                    </p>
                  )}
                </div>
              </div>
              {agence.description && (
                <p className="text-body-sm text-white/35 leading-relaxed line-clamp-3">
                  {agence.description}
                </p>
              )}
            </div>

            {/* Navigation */}
            <div>
              <p className="text-caption font-semibold text-white/50 uppercase tracking-widest mb-5">
                Navigation
              </p>
              <nav className="space-y-3">
                {[
                  { href: `/${locale}/${params.agence}`, label: t.accueil },
                  {
                    href: `/${locale}/${params.agence}/a-propos`,
                    label: locale === "ar" ? "من نحن" : locale === "en" ? "About" : "À propos",
                  },
                  {
                    href: `/${locale}/${params.agence}/contact`,
                    label: "Contact",
                  },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-body-sm text-white/35 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact */}
            <div>
              <p className="text-caption font-semibold text-white/50 uppercase tracking-widest mb-5">
                Contact
              </p>
              <div className="space-y-3.5">
                <a
                  href={`https://wa.me/${agence.telephone_whatsapp.replace(/\s/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-body-sm text-white/35 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 flex-shrink-0" />
                  WhatsApp
                </a>
                <a
                  href={`tel:${agence.telephone_whatsapp}`}
                  className="flex items-center gap-3 text-body-sm text-white/35 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  {agence.telephone_whatsapp}
                </a>
                {wilayaAgence && (
                  <p className="flex items-center gap-3 text-body-sm text-white/35">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    {agence.commune && `${agence.commune}, `}
                    {locale === "ar" ? wilayaAgence.nom_ar : wilayaAgence.nom_fr}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-caption text-white/25">
              {locale === "ar"
                ? "مدعوم من عقار فيجن"
                : locale === "en"
                ? "Powered by AqarVision"
                : "Propulsé par AqarVision"}
            </span>
            <span className="text-caption text-white/25">
              &copy; {new Date().getFullYear()} {agence.nom_agence}
            </span>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════
          CHATBOT
          ═══════════════════════════════════════════ */}
      <ChatbotVitrine
        annonces={allListings}
        nomAgence={agence.nom_agence}
        telephone={agence.telephone_whatsapp}
        slugAgence={params.agence}
        locale={locale}
        wilayaMap={wilayaMap}
      />
    </div>
  );
}
