"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import EnergyLabel from "@/components/ui/EnergyLabel";
import { buildingsApi } from "@/lib/api";
import { Building } from "@/types";
import { Building2, Plus, MapPin, Calendar } from "lucide-react";
import Link from "next/link";

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buildingsApi.listBuildings()
      .then((r) => setBuildings(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bâtiments</h1>
            <p className="text-gray-500 mt-1">{buildings.length} bâtiment(s) dans votre portefeuille</p>
          </div>
          <Link href="/buildings/new" className="btn-primary">
            <Plus size={16} />
            Nouveau bâtiment
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : buildings.length === 0 ? (
          <div className="card p-16 text-center">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun bâtiment</h3>
            <p className="text-gray-500 mb-6">Ajoutez votre premier bâtiment pour commencer</p>
            <Link href="/buildings/new" className="btn-primary">
              <Plus size={16} />
              Ajouter un bâtiment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buildings.map((building) => (
              <Link key={building.id} href={`/buildings/${building.id}`}>
                <div className="card p-5 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{building.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">
                        {building.building_type ?? "—"}
                      </p>
                    </div>
                    <EnergyLabel label={building.current_energy_label} size="sm" />
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-500">
                    {building.city && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} />
                        <span>{building.postal_code} {building.city}</span>
                      </div>
                    )}
                    {building.construction_year && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        <span>Construit en {building.construction_year}</span>
                      </div>
                    )}
                    {building.heated_area_m2 && (
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} />
                        <span>{building.heated_area_m2} m² chauffés</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
