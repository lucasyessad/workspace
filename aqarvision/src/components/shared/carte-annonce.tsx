import Link from "next/link";
import {
  Building2,
  MapPin,
  Ruler,
  DoorOpen,
  Camera,
  BadgeCheck,
} from "lucide-react";
import { formatPrix, formatSurface } from "@/lib/utils";
import type { ListingAvecAgence } from "@/lib/recherche";
import type { Locale } from "@/lib/i18n";

interface CarteAnnonceProps {
  annonce: ListingAvecAgence;
  locale: Locale;
  wilayaNom: string;
}

const labels = {
  fr: { vente: "Vente", location: "Location", mois: "mois", pcs: "pcs" },
  ar: { vente: "بيع", location: "إيجار", mois: "شهر", pcs: "غرف" },
  en: { vente: "Sale", location: "Rental", mois: "mo", pcs: "rooms" },
};

export function CarteAnnonce({ annonce, locale, wilayaNom }: CarteAnnonceProps) {
  const t = labels[locale];
  const agence = annonce.profiles;
  const hasPhotos = annonce.photos && annonce.photos.length > 0;

  return (
    <Link
      href={`/${locale}/${agence.slug_url}/${annonce.id}`}
      className="group block rounded-2xl bg-white border border-border overflow-hidden glass-card cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {hasPhotos ? (
          <img
            src={annonce.photos[0]}
            alt={annonce.titre}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Building2 className="h-10 w-10 text-muted-foreground/20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Badge transaction */}
        <div className="absolute top-3 start-3">
          <span
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold backdrop-blur-md ${
              annonce.type_transaction === "Vente"
                ? "bg-emerald-500/90 text-white"
                : "bg-blue-500/90 text-white"
            }`}
          >
            {annonce.type_transaction === "Vente" ? t.vente : t.location}
          </span>
        </div>

        {/* Photo count */}
        {annonce.photos && annonce.photos.length > 1 && (
          <div className="absolute top-3 end-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 text-white text-[11px] font-medium backdrop-blur-md">
            <Camera className="h-3 w-3" />
            {annonce.photos.length}
          </div>
        )}

        {/* Price */}
        <div className="absolute bottom-3 start-3">
          <p className="text-white text-lg font-bold drop-shadow-md">
            {formatPrix(annonce.prix)}
            {annonce.type_transaction === "Location" && (
              <span className="text-white/70 text-xs font-normal ms-1">
                /{t.mois}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-body font-semibold text-foreground line-clamp-1 group-hover:text-or transition-colors duration-200">
            {annonce.titre}
          </h3>
          <span className="px-2 py-0.5 rounded-md bg-or/10 text-[11px] font-semibold text-or whitespace-nowrap flex-shrink-0">
            {annonce.type_bien}
          </span>
        </div>

        <p className="text-caption text-muted-foreground flex items-center gap-1 mt-1.5 mb-3">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          {annonce.commune && `${annonce.commune}, `}
          {wilayaNom}
        </p>

        {/* Agency badge */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
          {agence.logo_url ? (
            <img
              src={agence.logo_url}
              alt={agence.nom_agence}
              className="w-5 h-5 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-5 h-5 bg-bleu-nuit rounded flex items-center justify-center flex-shrink-0">
              <Building2 className="h-3 w-3 text-white" />
            </div>
          )}
          <span className="text-caption text-muted-foreground truncate">
            {agence.nom_agence}
          </span>
          {agence.est_verifie && (
            <BadgeCheck className="h-3.5 w-3.5 text-or flex-shrink-0" />
          )}
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-3 text-caption text-muted-foreground">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blanc-casse">
            <Ruler className="h-3 w-3 text-or" />
            {formatSurface(annonce.surface)}
          </span>
          {annonce.nb_pieces && (
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blanc-casse">
              <DoorOpen className="h-3 w-3 text-or" />
              {annonce.nb_pieces} {t.pcs}
            </span>
          )}
          <span className="ms-auto text-[11px] px-2 py-1 rounded-lg bg-blanc-casse font-medium">
            {annonce.statut_document}
          </span>
        </div>
      </div>
    </Link>
  );
}
