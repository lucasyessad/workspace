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
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrix, formatSurface, whatsappLink } from "@/lib/utils";
import { getWilayaById } from "@/lib/wilayas";
import { BoutonFavori } from "@/components/favoris/bouton-favori";
import { BoutonComparer } from "@/components/favoris/bouton-comparer";
import { PanneauComparaison } from "@/components/favoris/panneau-comparaison";
import { TrackerVue } from "@/components/analytics/tracker-vue";
import type { Listing, Profile } from "@/types";

interface AgencePageProps {
  params: { agence: string };
  searchParams: { type?: string; transaction?: string };
}

/** Métadonnées dynamiques SEO + Open Graph pour le partage WhatsApp/Facebook */
export async function generateMetadata({
  params,
}: AgencePageProps): Promise<Metadata> {
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

  const titre = `${agence.nom_agence} - Agence Immobilière${wilaya ? ` à ${wilaya.nom_fr}` : ""} | AqarVision`;
  const description = agence.description
    ? agence.description.substring(0, 160)
    : `${agence.nom_agence} - ${count ?? 0} biens immobiliers disponibles${wilaya ? ` à ${wilaya.nom_fr}` : ""} en Algérie. Contactez-nous sur WhatsApp.`;

  return {
    title: titre,
    description,
    keywords: [
      "immobilier", "algérie", wilaya?.nom_fr ?? "", wilaya?.nom_ar ?? "",
      "vente", "location", "appartement", "villa", "terrain",
      agence.nom_agence, "عقارات", "الجزائر",
    ].filter(Boolean),
    openGraph: {
      title: titre,
      description,
      type: "website",
      locale: "fr_DZ",
      alternateLocale: ["ar_DZ"],
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

/** Page publique de l'agence - Mini-site vitrine avec SEO, favoris et analytics */
export default async function AgencePage({
  params,
  searchParams,
}: AgencePageProps) {
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

  // Récupérer les annonces actives avec filtres
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

  // Enregistrer la recherche filtrée pour les analytics
  if (searchParams.type || searchParams.transaction) {
    await supabase.from("analytics_recherches").insert({
      agent_id: agence.id,
      type_bien_filtre: searchParams.type || null,
      transaction_filtre: searchParams.transaction || null,
      wilaya_id: agence.wilaya_id,
    });
  }

  // Schema.org JSON-LD pour le référencement Google
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
    <div className="min-h-screen bg-blanc-casse">
      {/* JSON-LD Schema.org pour le référencement */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* En-tête de l'agence */}
      <header className="bg-bleu-nuit text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
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

            <div className="text-center md:text-left flex-1">
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
                  {wilayaAgence.nom_fr}
                </p>
              )}
              {agence.description && (
                <p className="text-gray-400 mt-2 max-w-lg">
                  {agence.description}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <a
                href={`https://wa.me/${agence.telephone_whatsapp.replace(/\s/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="or" size="lg">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
              </a>
              <a href={`tel:${agence.telephone_whatsapp}`}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Appeler
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Filtres de recherche */}
      <section className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto">
            <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <Link href={`/${params.agence}`}>
              <Badge
                variant={!searchParams.transaction && !searchParams.type ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
              >
                Tous
              </Badge>
            </Link>
            {["Vente", "Location"].map((type) => (
              <Link key={type} href={`/${params.agence}?transaction=${type}`}>
                <Badge
                  variant={searchParams.transaction === type ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                >
                  {type}
                </Badge>
              </Link>
            ))}
            <div className="w-px h-6 bg-gray-200 flex-shrink-0" />
            {["Villa", "Appartement F3", "Terrain", "Local Commercial"].map(
              (type) => (
                <Link key={type} href={`/${params.agence}?type=${type}`}>
                  <Badge
                    variant={searchParams.type === type ? "secondary" : "outline"}
                    className="cursor-pointer whitespace-nowrap"
                  >
                    {type}
                  </Badge>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Liste des biens */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-bleu-nuit mb-6 flex items-center gap-2">
          <Home className="h-6 w-6 text-or" />
          Nos biens disponibles
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({annonces?.length ?? 0} annonces)
          </span>
        </h2>

        {!annonces || annonces.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Aucun bien disponible pour le moment.
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
                <Card
                  key={bien.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Tracker de vue analytics */}
                  <TrackerVue listingId={bien.id} agentId={agence.id} />

                  {/* Image */}
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
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-bleu-nuit">{bien.type_transaction}</Badge>
                      <Badge variant="success">{bien.statut_document}</Badge>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-or text-bleu-nuit px-3 py-1 rounded-full text-sm font-bold">
                        {formatPrix(bien.prix)}
                      </span>
                    </div>
                    {/* Boutons favoris et comparaison */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1">
                      <BoutonFavori bien={bienFavori} taille="sm" />
                      <BoutonComparer bien={bienFavori} />
                    </div>
                  </div>

                  {/* Contenu */}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-bleu-nuit mb-1 line-clamp-1">
                      {bien.titre}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3" />
                      {bien.commune && `${bien.commune}, `}
                      {wilaya?.nom_fr}
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                      <span>{bien.type_bien}</span>
                      <span>|</span>
                      <span>{formatSurface(bien.surface)}</span>
                      {bien.nb_pieces && (
                        <>
                          <span>|</span>
                          <span>{bien.nb_pieces} pièces</span>
                        </>
                      )}
                      {bien.etage !== null && (
                        <>
                          <span>|</span>
                          <span>{bien.etage === 0 ? "RDC" : `${bien.etage}e étage`}</span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {bien.ascenseur && <Badge variant="outline" className="text-xs">Ascenseur</Badge>}
                      {bien.garage && <Badge variant="outline" className="text-xs">Garage</Badge>}
                      {bien.jardin && <Badge variant="outline" className="text-xs">Jardin</Badge>}
                      {bien.citerne && <Badge variant="outline" className="text-xs">Citerne</Badge>}
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={whatsappLink(agence.telephone_whatsapp, bien.titre)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="or" size="sm" className="w-full text-xs">
                          <MessageCircle className="h-3 w-3 mr-1" />
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

      {/* Panneau de comparaison flottant */}
      <PanneauComparaison />

      {/* Footer */}
      <footer className="bg-bleu-nuit text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            Propulsé par{" "}
            <Link href="/" className="text-or hover:underline">
              AqarVision
            </Link>{" "}
            - La plateforme immobilière pour l&apos;Algérie
          </p>
        </div>
      </footer>
    </div>
  );
}
