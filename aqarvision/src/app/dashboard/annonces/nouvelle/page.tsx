"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WILAYAS } from "@/lib/wilayas";
import type {
  TypeBien,
  TypeTransaction,
  StatutDocument,
} from "@/types";

const TYPES_BIEN: TypeBien[] = [
  "Villa", "Appartement F1", "Appartement F2", "Appartement F3",
  "Appartement F4", "Appartement F5+", "Terrain", "Local Commercial",
  "Duplex", "Studio", "Hangar", "Bureau",
];

const TYPES_TRANSACTION: TypeTransaction[] = [
  "Vente", "Location", "Location vacances",
];

const STATUTS_DOCUMENT: StatutDocument[] = [
  "Acte", "Livret foncier", "Concession", "Promesse de vente", "Timbré", "Autre",
];

/** Formulaire "Smart" de création d'annonce - Adapté au marché algérien */
export default function NouvelleAnnoncePage() {
  const router = useRouter();
  const [etape, setEtape] = useState(1);
  const [loading, setLoading] = useState(false);
  const [genereIA, setGenereIA] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    prix: "",
    surface: "",
    type_bien: "" as TypeBien | "",
    type_transaction: "Vente" as TypeTransaction,
    statut_document: "Acte" as StatutDocument,
    wilaya_id: "",
    commune: "",
    quartier: "",
    etage: "",
    nb_pieces: "",
    ascenseur: false,
    citerne: false,
    garage: false,
    jardin: false,
    // Points clés pour la génération IA
    points_cles: "",
  });

  function updateField(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  /** Générer une description avec l'IA à partir des points clés */
  async function genererAvecIA() {
    if (!formData.points_cles.trim()) return;
    setGenereIA(true);

    // Simulation de génération IA (à remplacer par un appel API réel)
    const wilaya = WILAYAS.find((w) => String(w.id) === formData.wilaya_id);
    const description = `${formData.type_bien || "Bien"} ${formData.type_transaction === "Location" ? "à louer" : "à vendre"} situé${formData.commune ? ` à ${formData.commune}` : ""}${wilaya ? `, wilaya de ${wilaya.nom_fr}` : ""}.\n\n${formData.points_cles}\n\nSurface : ${formData.surface} m² | Prix : ${formData.prix} DA\nDocuments : ${formData.statut_document}\n\nContactez-nous pour plus d'informations ou pour organiser une visite.`;

    setFormData((prev) => ({ ...prev, description }));
    setGenereIA(false);
  }

  /** Gestion de l'upload des photos */
  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const fichiers = e.target.files;
    if (!fichiers) return;

    const nouvelles: string[] = [];
    Array.from(fichiers).forEach((fichier) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          nouvelles.push(ev.target.result as string);
          if (nouvelles.length === fichiers.length) {
            setPhotosPreviews((prev) => [...prev, ...nouvelles]);
          }
        }
      };
      reader.readAsDataURL(fichier);
    });
  }

  function supprimerPhoto(index: number) {
    setPhotosPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  /** Soumettre le formulaire */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErreur(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErreur("Vous devez être connecté.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("listings").insert({
      titre: formData.titre,
      description: formData.description,
      prix: parseInt(formData.prix),
      surface: parseInt(formData.surface),
      type_bien: formData.type_bien,
      type_transaction: formData.type_transaction,
      statut_document: formData.statut_document,
      wilaya_id: formData.wilaya_id ? parseInt(formData.wilaya_id) : null,
      commune: formData.commune || null,
      quartier: formData.quartier || null,
      etage: formData.etage ? parseInt(formData.etage) : null,
      nb_pieces: formData.nb_pieces ? parseInt(formData.nb_pieces) : null,
      ascenseur: formData.ascenseur,
      citerne: formData.citerne,
      garage: formData.garage,
      jardin: formData.jardin,
      agent_id: user.id,
      photos: photosPreviews,
    });

    if (error) {
      setErreur(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/annonces");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-bleu-nuit mb-6">
        Nouvelle annonce
      </h1>

      {/* Indicateur d'étapes */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                etape >= step
                  ? "bg-or text-bleu-nuit"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step}
            </div>
            <span className="text-sm text-gray-600 hidden sm:inline">
              {step === 1 && "Informations"}
              {step === 2 && "Détails"}
              {step === 3 && "Photos & Description"}
            </span>
            {step < 3 && <div className="flex-1 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {erreur && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md mb-4">
            {erreur}
          </div>
        )}

        {/* Étape 1 : Informations de base */}
        {etape === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Informations du bien</CardTitle>
              <CardDescription>
                Renseignez les informations principales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titre">Titre de l&apos;annonce</Label>
                <Input
                  id="titre"
                  placeholder="Ex: Villa F4 avec jardin à Hydra"
                  value={formData.titre}
                  onChange={(e) => updateField("titre", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type de bien</Label>
                  <Select
                    value={formData.type_bien}
                    onValueChange={(v) => updateField("type_bien", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES_BIEN.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Type de transaction</Label>
                  <Select
                    value={formData.type_transaction}
                    onValueChange={(v) => updateField("type_transaction", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES_TRANSACTION.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prix">Prix (DA)</Label>
                  <Input
                    id="prix"
                    type="number"
                    placeholder="Ex: 15000000"
                    value={formData.prix}
                    onChange={(e) => updateField("prix", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surface">Surface (m²)</Label>
                  <Input
                    id="surface"
                    type="number"
                    placeholder="Ex: 120"
                    value={formData.surface}
                    onChange={(e) => updateField("surface", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type de papier / Document</Label>
                <Select
                  value={formData.statut_document}
                  onValueChange={(v) => updateField("statut_document", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUTS_DOCUMENT.map((doc) => (
                      <SelectItem key={doc} value={doc}>
                        {doc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="or"
                  onClick={() => setEtape(2)}
                >
                  Suivant
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 2 : Détails spécifiques au marché algérien */}
        {etape === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Détails du bien</CardTitle>
              <CardDescription>
                Informations spécifiques et localisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Wilaya</Label>
                  <Select
                    value={formData.wilaya_id}
                    onValueChange={(v) => updateField("wilaya_id", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {WILAYAS.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {w.code} - {w.nom_fr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commune">Commune</Label>
                  <Input
                    id="commune"
                    placeholder="Ex: Hydra"
                    value={formData.commune}
                    onChange={(e) => updateField("commune", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quartier">Quartier</Label>
                <Input
                  id="quartier"
                  placeholder="Ex: Cité des 200 lgts"
                  value={formData.quartier}
                  onChange={(e) => updateField("quartier", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="etage">Étage</Label>
                  <Input
                    id="etage"
                    type="number"
                    placeholder="RDC = 0"
                    value={formData.etage}
                    onChange={(e) => updateField("etage", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nb_pieces">Nombre de pièces</Label>
                  <Input
                    id="nb_pieces"
                    type="number"
                    placeholder="Ex: 4"
                    value={formData.nb_pieces}
                    onChange={(e) => updateField("nb_pieces", e.target.value)}
                  />
                </div>
              </div>

              {/* Caractéristiques spécifiques */}
              <div className="space-y-2">
                <Label>Caractéristiques</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { field: "ascenseur", label: "Ascenseur" },
                    { field: "citerne", label: "Citerne / Réservoir" },
                    { field: "garage", label: "Garage" },
                    { field: "jardin", label: "Jardin" },
                  ].map(({ field, label }) => (
                    <label
                      key={field}
                      className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={formData[field as keyof typeof formData] as boolean}
                        onChange={(e) => updateField(field, e.target.checked)}
                        className="w-4 h-4 text-or"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEtape(1)}
                >
                  Précédent
                </Button>
                <Button
                  type="button"
                  variant="or"
                  onClick={() => setEtape(3)}
                >
                  Suivant
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 3 : Photos et Description IA */}
        {etape === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Photos & Description</CardTitle>
              <CardDescription>
                Ajoutez des photos et utilisez l&apos;IA pour la description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload de photos */}
              <div className="space-y-2">
                <Label>Photos du bien</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Glissez vos photos ici ou cliquez pour sélectionner
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotos}
                    className="hidden"
                    id="photos-upload"
                  />
                  <label htmlFor="photos-upload">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>Choisir des fichiers</span>
                    </Button>
                  </label>
                </div>
                {/* Aperçu des photos */}
                {photosPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {photosPreviews.map((photo, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={photo}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => supprimerPhoto(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Génération IA */}
              <div className="space-y-2">
                <Label htmlFor="points_cles">
                  Points clés (pour génération IA)
                </Label>
                <Textarea
                  id="points_cles"
                  placeholder="Ex: Vue sur mer, 3 chambres spacieuses, cuisine équipée, parking, proche commodités..."
                  value={formData.points_cles}
                  onChange={(e) => updateField("points_cles", e.target.value)}
                  rows={3}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={genererAvecIA}
                  disabled={genereIA || !formData.points_cles.trim()}
                >
                  {genereIA ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Générer avec IA
                    </>
                  )}
                </Button>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre bien en détail..."
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEtape(2)}
                >
                  Précédent
                </Button>
                <Button type="submit" variant="or" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publication...
                    </>
                  ) : (
                    "Publier l'annonce"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
