"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { wilayas } from "@/lib/wilayas";

export interface FiltresRecherche {
  query: string;
  typeBien: string;
  typeTransaction: string;
  wilaya: string;
  prixMin: string;
  prixMax: string;
  surfaceMin: string;
  surfaceMax: string;
  pieces: string;
}

const defaultFiltres: FiltresRecherche = {
  query: "",
  typeBien: "",
  typeTransaction: "",
  wilaya: "",
  prixMin: "",
  prixMax: "",
  surfaceMin: "",
  surfaceMax: "",
  pieces: "",
};

interface Props {
  onSearch: (filtres: FiltresRecherche) => void;
  initialFiltres?: Partial<FiltresRecherche>;
}

/** Composant de recherche avancée avec filtres */
export default function FiltresRechercheComponent({ onSearch, initialFiltres }: Props) {
  const [filtres, setFiltres] = useState<FiltresRecherche>({
    ...defaultFiltres,
    ...initialFiltres,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFiltre = (key: keyof FiltresRecherche, value: string) => {
    setFiltres((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filtres);
  };

  const handleReset = () => {
    setFiltres(defaultFiltres);
    onSearch(defaultFiltres);
  };

  const activeFiltersCount = Object.entries(filtres).filter(
    ([key, value]) => key !== "query" && value !== ""
  ).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
      {/* Barre de recherche principale */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une annonce..."
            value={filtres.query}
            onChange={(e) => updateFiltre("query", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="relative"
        >
          <SlidersHorizontal className="h-4 w-4 mr-1" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-or text-bleu-nuit text-xs font-bold rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        <Button variant="or" onClick={handleSearch}>
          Rechercher
        </Button>
      </div>

      {/* Filtres rapides */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={filtres.typeTransaction}
          onValueChange={(v) => updateFiltre("typeTransaction", v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Transaction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vente">Vente</SelectItem>
            <SelectItem value="location">Location</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filtres.typeBien}
          onValueChange={(v) => updateFiltre("typeBien", v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type de bien" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="appartement">Appartement</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="terrain">Terrain</SelectItem>
            <SelectItem value="bureau">Bureau</SelectItem>
            <SelectItem value="local_commercial">Local commercial</SelectItem>
            <SelectItem value="hangar">Hangar</SelectItem>
            <SelectItem value="autre">Autre</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filtres.wilaya}
          onValueChange={(v) => updateFiltre("wilaya", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Wilaya" />
          </SelectTrigger>
          <SelectContent>
            {wilayas.map((w) => (
              <SelectItem key={w.code} value={w.code}>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {w.code} - {w.nom_fr}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Prix min (DA)</Label>
              <Input
                type="number"
                placeholder="0"
                value={filtres.prixMin}
                onChange={(e) => updateFiltre("prixMin", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Prix max (DA)</Label>
              <Input
                type="number"
                placeholder="∞"
                value={filtres.prixMax}
                onChange={(e) => updateFiltre("prixMax", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Surface min (m²)</Label>
              <Input
                type="number"
                placeholder="0"
                value={filtres.surfaceMin}
                onChange={(e) => updateFiltre("surfaceMin", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Surface max (m²)</Label>
              <Input
                type="number"
                placeholder="∞"
                value={filtres.surfaceMax}
                onChange={(e) => updateFiltre("surfaceMax", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Pièces minimum</Label>
              <Select
                value={filtres.pieces}
                onValueChange={(v) => updateFiltre("pieces", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="h-4 w-4 mr-1" />
              Réinitialiser les filtres
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
