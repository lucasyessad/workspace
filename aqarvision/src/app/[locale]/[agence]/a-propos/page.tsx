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
  ShieldCheck,
  Calendar,
  Home,
  Info,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { whatsappLink } from "@/lib/utils";
import { getWilayaById } from "@/lib/wilayas";
import { getDictionnaire, getDirection, type Locale } from "@/lib/i18n";
import type { Profile } from "@/types";

const LOCALES_VALIDES = ["fr", "ar", "en"];

interface AProposPageProps {
  params: { locale: string; agence: string };
}

/** Métadonnées SEO dynamiques */
export async function generateMetadata({
  params,
}: AProposPageProps): Promise<Metadata> {
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
    fr: `À propos de ${agence.nom_agence}${wilaya ? ` - Agence Immobilière à ${wilaya.nom_fr}` : ""} | AqarVision`,
    ar: `حول ${agence.nom_agence}${wilaya ? ` - وكالة عقارية في ${wilaya.nom_ar}` : ""} | عقار فيجن`,
    en: `About ${agence.nom_agence}${wilaya ? ` - Real Estate Agency in ${wilaya.nom_fr}` : ""} | AqarVision`,
  };

  const descriptions: Record<string, string> = {
    fr: `Découvrez ${agence.nom_agence}, agence immobilière${wilaya ? ` à ${wilaya.nom_fr}` : ""}.${agence.description ? ` ${agence.description.substring(0, 120)}` : ""}`,
    ar: `تعرّف على ${agence.nom_agence}، وكالة عقارية${wilaya ? ` في ${wilaya.nom_ar}` : ""}.${agence.description ? ` ${agence.description.substring(0, 120)}` : ""}`,
    en: `Discover ${agence.nom_agence}, real estate agency${wilaya ? ` in ${wilaya.nom_fr}` : ""}.${agence.description ? ` ${agence.description.substring(0, 120)}` : ""}`,
  };

  const titre = titres[locale] || titres.fr;
  const description = descriptions[locale] || descriptions.fr;

  const alternates: Record<string, string> = {};
  LOCALES_VALIDES.forEach((l) => {
    alternates[l] = `/${l}/${params.agence}/a-propos`;
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

/** Page À propos de l'agence */
export default async function AProposPage({ params }: AProposPageProps) {
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

  // Nombre d'annonces actives
  const { count: nbAnnonces } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", agence.id)
    .eq("est_active", true);

  const dateInscription = new Date(agence.created_at).toLocaleDateString(
    locale === "ar" ? "ar-DZ" : locale === "en" ? "en-GB" : "fr-FR",
    { month: "long", year: "numeric" }
  );

  return (
    <div className="min-h-screen bg-blanc-casse" dir={dir}>
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
        {/* ─── Hero section ─── */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 md:w-28 md:h-28 mx-auto rounded-2xl bg-muted flex items-center justify-center border border-border mb-5">
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

          <div className="flex items-center justify-center gap-2.5 mb-2">
            <h1 className="text-heading-2 md:text-heading-1 font-bold text-foreground">
              {agence.nom_agence}
            </h1>
            {agence.est_verifie && (
              <BadgeCheck className="h-6 w-6 text-or flex-shrink-0" />
            )}
          </div>

          {wilayaAgence && (
            <p className="text-body text-muted-foreground flex items-center justify-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {agence.commune && `${agence.commune}, `}
              {locale === "ar" ? wilayaAgence.nom_ar : wilayaAgence.nom_fr}
            </p>
          )}
        </div>

        {/* ─── À propos ─── */}
        {agence.description && (
          <section className="rounded-2xl border border-border bg-white p-6 md:p-8 mb-5">
            <p className="text-xs font-semibold text-or uppercase tracking-widest mb-4">
              {locale === "ar" ? "حول الوكالة" : locale === "en" ? "About" : "À propos"}
            </p>
            <p className="text-body text-muted-foreground leading-relaxed whitespace-pre-line">
              {agence.description}
            </p>
          </section>
        )}

        {/* ─── Informations ─── */}
        <section className="rounded-2xl border border-border bg-white p-6 md:p-8 mb-5">
          <p className="text-xs font-semibold text-or uppercase tracking-widest mb-4">
            {locale === "ar" ? "المعلومات" : locale === "en" ? "Information" : "Informations"}
          </p>
          <div className="space-y-4">
            {wilayaAgence && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-body-sm font-medium text-foreground">
                    {t.wilaya}
                  </p>
                  <p className="text-body-sm text-muted-foreground">
                    {locale === "ar" ? wilayaAgence.nom_ar : wilayaAgence.nom_fr}
                  </p>
                </div>
              </div>
            )}

            {agence.commune && (
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-body-sm font-medium text-foreground">
                    {t.commune}
                  </p>
                  <p className="text-body-sm text-muted-foreground">
                    {agence.commune}
                  </p>
                </div>
              </div>
            )}

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

            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-body-sm font-medium text-foreground">
                  {locale === "ar" ? "الهاتف" : locale === "en" ? "Phone" : "Téléphone"}
                </p>
                <p className="text-body-sm text-muted-foreground">
                  {agence.telephone_whatsapp}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Badge de confiance ─── */}
        {agence.est_verifie && (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 md:p-8 mb-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-body font-semibold text-emerald-800">
                  {locale === "ar"
                    ? "وكالة معتمدة ومتحقق منها"
                    : locale === "en"
                    ? "Verified & approved agency"
                    : "Agence vérifiée et agréée"}
                </p>
                <p className="text-body-sm text-emerald-700 mt-0.5">
                  {locale === "ar"
                    ? "تم التحقق من هوية وبيانات هذه الوكالة من طرف فريق عقار فيجن"
                    : locale === "en"
                    ? "This agency's identity and information have been verified by the AqarVision team"
                    : "L'identité et les informations de cette agence ont été vérifiées par l'équipe AqarVision"}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ─── Statistiques ─── */}
        <section className="grid grid-cols-2 gap-4 mb-5">
          <div className="rounded-2xl border border-border bg-white p-6 text-center">
            <Home className="h-5 w-5 text-or mx-auto mb-2" />
            <p className="text-heading-3 font-bold text-foreground">
              {nbAnnonces ?? 0}
            </p>
            <p className="text-caption text-muted-foreground">
              {locale === "ar"
                ? "إعلان نشط"
                : locale === "en"
                ? "Active listings"
                : "Annonces actives"}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-6 text-center">
            <Calendar className="h-5 w-5 text-or mx-auto mb-2" />
            <p className="text-body font-bold text-foreground">
              {dateInscription}
            </p>
            <p className="text-caption text-muted-foreground">
              {locale === "ar"
                ? "عضو منذ"
                : locale === "en"
                ? "Member since"
                : "Membre depuis"}
            </p>
          </div>
        </section>

        {/* ─── CTA Contact ─── */}
        <section className="rounded-2xl border border-border bg-white p-6 md:p-8">
          <p className="text-xs font-semibold text-or uppercase tracking-widest mb-4">
            {locale === "ar" ? "تواصل معنا" : locale === "en" ? "Contact us" : "Contactez-nous"}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`https://wa.me/${agence.telephone_whatsapp.replace(/\s/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="or" size="lg" className="w-full">
                <MessageCircle className="h-4 w-4 me-2" />
                {t.contacter_whatsapp}
              </Button>
            </a>
            <a href={`tel:${agence.telephone_whatsapp}`} className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                <Phone className="h-4 w-4 me-2" />
                {t.appeler}
              </Button>
            </a>
          </div>
          <p className="text-center text-caption text-muted-foreground mt-4">
            {agence.telephone_whatsapp}
          </p>
        </section>
      </main>

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
