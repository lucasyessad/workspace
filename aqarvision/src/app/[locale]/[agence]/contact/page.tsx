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
  Clock,
  MapPinned,
  Home,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getWilayaById } from "@/lib/wilayas";
import { getDictionnaire, getDirection, type Locale } from "@/lib/i18n";
import type { Profile } from "@/types";

const LOCALES_VALIDES = ["fr", "ar", "en"];

interface ContactPageProps {
  params: { locale: string; agence: string };
}

/** Métadonnées SEO dynamiques */
export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
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

  const titres: Record<string, string> = {
    fr: `Contacter ${agence.nom_agence}${wilaya ? ` - Agence Immobilière à ${wilaya.nom_fr}` : ""} | AqarVision`,
    ar: `تواصل مع ${agence.nom_agence}${wilaya ? ` - وكالة عقارية في ${wilaya.nom_ar}` : ""} | عقار فيجن`,
    en: `Contact ${agence.nom_agence}${wilaya ? ` - Real Estate Agency in ${wilaya.nom_fr}` : ""} | AqarVision`,
  };

  const descriptions: Record<string, string> = {
    fr: `Contactez ${agence.nom_agence} par WhatsApp ou téléphone.${wilaya ? ` Agence immobilière à ${wilaya.nom_fr}.` : ""}`,
    ar: `تواصل مع ${agence.nom_agence} عبر واتساب أو الهاتف.${wilaya ? ` وكالة عقارية في ${wilaya.nom_ar}.` : ""}`,
    en: `Contact ${agence.nom_agence} via WhatsApp or phone.${wilaya ? ` Real estate agency in ${wilaya.nom_fr}.` : ""}`,
  };

  const titre = titres[locale] || titres.fr;
  const description = descriptions[locale] || descriptions.fr;

  const alternates: Record<string, string> = {};
  LOCALES_VALIDES.forEach((l) => {
    alternates[l] = `/${l}/${params.agence}/contact`;
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
    twitter: { card: "summary", title: titre, description },
  };
}

/** Page contact de l'agence */
export default async function ContactPage({ params }: ContactPageProps) {
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

  return (
    <div className="min-h-screen bg-blanc-casse" dir={dir}>
      {/* ─── Header compact ─── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
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
            <a
              href={`https://wa.me/${agence.telephone_whatsapp.replace(/\s/g, "")}`}
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

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        {/* ─── Agency info card ─── */}
        <section className="glass-card rounded-2xl border border-border shadow-soft p-6 md:p-8 mb-5 text-center animate-fade-in-up">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center border border-border mb-4">
            {agence.logo_url ? (
              <img
                src={agence.logo_url}
                alt={agence.nom_agence}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              <Building2 className="h-7 w-7 text-muted-foreground" />
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mb-1.5">
            <h1 className="font-vitrine text-heading-3 font-bold text-foreground">
              {agence.nom_agence}
            </h1>
            {agence.est_verifie && (
              <BadgeCheck className="h-5 w-5 text-or flex-shrink-0" />
            )}
          </div>

          {wilayaAgence && (
            <p className="text-body-sm text-muted-foreground flex items-center justify-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {agence.commune && `${agence.commune}, `}
              {locale === "ar" ? wilayaAgence.nom_ar : wilayaAgence.nom_fr}
            </p>
          )}
        </section>

        {/* ─── Contact methods ─── */}
        <section className="glass-card rounded-2xl border border-border shadow-soft p-6 md:p-8 mb-5 animate-fade-in-up delay-100">
          <p className="text-xs font-semibold text-or uppercase tracking-widest mb-5">
            {locale === "ar" ? "تواصل معنا" : locale === "en" ? "Contact us" : "Contactez-nous"}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <a
              href={`https://wa.me/${agence.telephone_whatsapp.replace(/\s/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="or" size="lg" className="w-full h-14">
                <MessageCircle className="h-5 w-5 me-2" />
                {t.contacter_whatsapp}
              </Button>
            </a>
            <a href={`tel:${agence.telephone_whatsapp}`} className="block">
              <Button variant="outline" size="lg" className="w-full h-14">
                <Phone className="h-5 w-5 me-2" />
                {t.appeler}
              </Button>
            </a>
          </div>

          {/* Contact details */}
          <div className="space-y-4 border-t border-border pt-5">
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-body-sm font-medium text-foreground">
                  {locale === "ar" ? "الهاتف / واتساب" : locale === "en" ? "Phone / WhatsApp" : "Téléphone / WhatsApp"}
                </p>
                <p className="text-body-sm text-muted-foreground">
                  {agence.telephone_whatsapp}
                </p>
              </div>
            </div>

            {agence.adresse && (
              <div className="flex items-start gap-3">
                <Home className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-body-sm font-medium text-foreground">
                    {locale === "ar" ? "العنوان" : locale === "en" ? "Address" : "Adresse"}
                  </p>
                  <p className="text-body-sm text-muted-foreground">
                    {agence.adresse}
                  </p>
                </div>
              </div>
            )}

            {wilayaAgence && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-body-sm font-medium text-foreground">
                    {t.wilaya} / {t.commune}
                  </p>
                  <p className="text-body-sm text-muted-foreground">
                    {agence.commune && `${agence.commune}, `}
                    {locale === "ar" ? wilayaAgence.nom_ar : wilayaAgence.nom_fr}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── Map placeholder ─── */}
        <section className="glass-card rounded-2xl border border-border shadow-soft p-6 md:p-8 mb-5 animate-fade-in-up delay-150">
          <p className="text-xs font-semibold text-or uppercase tracking-widest mb-4">
            {locale === "ar" ? "الموقع" : locale === "en" ? "Location" : "Localisation"}
          </p>
          <div className="rounded-2xl bg-muted h-48 flex flex-col items-center justify-center gap-2">
            <MapPinned className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-body-sm text-muted-foreground">
              {locale === "ar"
                ? "الخريطة قريبا"
                : locale === "en"
                ? "Map coming soon"
                : "Carte bientôt disponible"}
            </p>
          </div>
        </section>

        {/* ─── Working hours ─── */}
        <section className="glass-card rounded-2xl border border-border shadow-soft p-6 md:p-8 mb-5 animate-fade-in-up delay-200">
          <p className="text-xs font-semibold text-or uppercase tracking-widest mb-4">
            {locale === "ar" ? "ساعات العمل" : locale === "en" ? "Working hours" : "Horaires d'ouverture"}
          </p>
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="space-y-1.5">
              <div className="flex justify-between gap-8">
                <p className="text-body-sm font-medium text-foreground">
                  {locale === "ar"
                    ? "الأحد - الخميس"
                    : locale === "en"
                    ? "Sunday - Thursday"
                    : "Dimanche - Jeudi"}
                </p>
                <p className="text-body-sm text-muted-foreground">
                  {locale === "ar" ? "9:00 - 17:00" : "9h - 17h"}
                </p>
              </div>
              <div className="flex justify-between gap-8">
                <p className="text-body-sm font-medium text-foreground">
                  {locale === "ar"
                    ? "الجمعة - السبت"
                    : locale === "en"
                    ? "Friday - Saturday"
                    : "Vendredi - Samedi"}
                </p>
                <p className="text-body-sm text-muted-foreground">
                  {locale === "ar"
                    ? "مغلق"
                    : locale === "en"
                    ? "Closed"
                    : "Fermé"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
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
