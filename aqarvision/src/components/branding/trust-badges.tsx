import { BadgeCheck, ShieldCheck, Clock, MapPin, Building2, Award } from "lucide-react";
import type { Locale } from "@/lib/i18n";

interface TrustBadgeProps {
  locale?: Locale;
}

/** Badge "Agence agréée" */
export function BadgeAgreee({ locale = "fr" }: TrustBadgeProps) {
  const labels = {
    fr: "Agence agréée",
    ar: "وكالة معتمدة",
    en: "Licensed agency",
  };

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
      <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
      <span className="text-caption font-medium text-emerald-700">
        {labels[locale]}
      </span>
    </div>
  );
}

/** Badge "Annonce vérifiée" */
export function BadgeVerifiee({ locale = "fr" }: TrustBadgeProps) {
  const labels = {
    fr: "Annonce vérifiée",
    ar: "إعلان موثق",
    en: "Verified listing",
  };

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
      <ShieldCheck className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
      <span className="text-caption font-medium text-blue-700">
        {labels[locale]}
      </span>
    </div>
  );
}

/** Badge "Réponse rapide" */
export function BadgeReponseRapide({ locale = "fr" }: TrustBadgeProps) {
  const labels = {
    fr: "Réponse rapide",
    ar: "رد سريع",
    en: "Quick response",
  };

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
      <Clock className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
      <span className="text-caption font-medium text-amber-700">
        {labels[locale]}
      </span>
    </div>
  );
}

/** Bloc de confiance agence — version complète */
interface BlocConfianceProps {
  estVerifie: boolean;
  nbAnnonces: number;
  wilaya?: string;
  anneesActivite?: number;
  locale?: Locale;
}

export function BlocConfiance({
  estVerifie,
  nbAnnonces,
  wilaya,
  anneesActivite,
  locale = "fr",
}: BlocConfianceProps) {
  const items = [
    ...(estVerifie
      ? [
          {
            icon: ShieldCheck,
            label: {
              fr: "Agence vérifiée et agréée",
              ar: "وكالة معتمدة ومتحقق منها",
              en: "Verified & licensed agency",
            }[locale],
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
        ]
      : []),
    {
      icon: Building2,
      label: {
        fr: `${nbAnnonces} bien${nbAnnonces > 1 ? "s" : ""} publié${nbAnnonces > 1 ? "s" : ""}`,
        ar: `${nbAnnonces} عقار منشور`,
        en: `${nbAnnonces} published listing${nbAnnonces > 1 ? "s" : ""}`,
      }[locale],
      color: "text-bleu-nuit",
      bg: "bg-blue-50",
    },
    ...(wilaya
      ? [
          {
            icon: MapPin,
            label: {
              fr: `Présence à ${wilaya}`,
              ar: `متواجدون في ${wilaya}`,
              en: `Located in ${wilaya}`,
            }[locale],
            color: "text-or",
            bg: "bg-amber-50",
          },
        ]
      : []),
    ...(anneesActivite && anneesActivite > 0
      ? [
          {
            icon: Award,
            label: {
              fr: `${anneesActivite} an${anneesActivite > 1 ? "s" : ""} d'activité`,
              ar: `${anneesActivite} سنة نشاط`,
              en: `${anneesActivite} year${anneesActivite > 1 ? "s" : ""} of activity`,
            }[locale],
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
        ]
      : []),
  ];

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <h3 className="text-body-sm font-semibold text-foreground mb-4">
        {{
          fr: "Pourquoi nous faire confiance",
          ar: "لماذا تثقون بنا",
          en: "Why trust us",
        }[locale]}
      </h3>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-3 rounded-lg ${item.bg}`}
          >
            <item.icon className={`h-4 w-4 ${item.color} flex-shrink-0`} />
            <span className="text-body-sm text-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Bandeau "Présence locale" compact */
interface BandeauPresenceProps {
  wilayas: string[];
  locale?: Locale;
}

export function BandeauPresence({ wilayas, locale = "fr" }: BandeauPresenceProps) {
  if (wilayas.length === 0) return null;

  return (
    <div className="rounded-xl bg-muted/50 border border-border p-4">
      <p className="text-caption font-medium text-muted-foreground mb-2">
        {{
          fr: "Zones couvertes",
          ar: "المناطق المغطاة",
          en: "Areas covered",
        }[locale]}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {wilayas.map((w) => (
          <span
            key={w}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-border text-caption text-foreground"
          >
            <MapPin className="h-3 w-3 text-or" />
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}
