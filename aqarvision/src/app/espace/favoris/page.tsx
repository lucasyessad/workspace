import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWilayaById } from "@/lib/wilayas";
import { formatPrix } from "@/lib/utils";
import { RemoveFavoriteButton } from "./remove-button";

export default async function FavorisPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: favorites } = await supabase
    .from("favorites")
    .select(
      "*, listing:listings(*, agent:profiles(nom_agence, slug_url))"
    )
    .eq("visitor_id", user!.id)
    .order("created_at", { ascending: false });

  const count = favorites?.length ?? 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
        {count > 0 && (
          <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-[#0c1b2a] text-white text-xs font-medium">
            {count}
          </span>
        )}
      </div>

      {count === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Vous n&apos;avez pas encore de favoris
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Parcourez les annonces et ajoutez vos biens preferes en favoris.
          </p>
          <Link
            href="/fr/recherche"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0c1b2a] text-white text-sm font-medium rounded-lg hover:bg-[#0c1b2a]/90 transition-colors"
          >
            <Search className="h-4 w-4" />
            Rechercher des biens
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites!.map((fav) => {
            const listing = fav.listing;
            if (!listing) return null;

            const wilaya = listing.wilaya_id
              ? getWilayaById(listing.wilaya_id)
              : null;
            const photo =
              listing.photos && listing.photos.length > 0
                ? listing.photos[0]
                : null;

            return (
              <div
                key={fav.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-100">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={listing.titre || "Bien immobilier"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <Heart className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <RemoveFavoriteButton favoriteId={fav.id} />
                  </div>
                  {listing.type_bien && (
                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded">
                      {listing.type_bien}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <Link
                    href={
                      listing.agent?.slug_url
                        ? `/fr/${listing.agent.slug_url}/${listing.id}`
                        : "#"
                    }
                    className="block"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-[#b8963e] transition-colors">
                      {listing.titre}
                    </h3>
                  </Link>
                  {wilaya && (
                    <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <MapPin className="h-3 w-3" />
                      {wilaya.nom_fr}
                      {listing.commune ? `, ${listing.commune}` : ""}
                    </p>
                  )}
                  <p className="text-base font-bold text-[#0c1b2a] mt-2">
                    {formatPrix(listing.prix)}
                  </p>
                  {listing.agent?.nom_agence && (
                    <p className="text-xs text-gray-400 mt-1">
                      {listing.agent.nom_agence}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
