"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Save, Trash2, ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
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
import { compresserImage, formaterTailleFichier, FORMATS_IMAGE_ACCEPTES } from "@/lib/compression-image";
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

/** Page d'édition d'une annonce existante */
export default function EditerAnnoncePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotosFiles, setNewPhotosFiles] = useState<File[]>([]);
  const [newPhotosPreviews, setNewPhotosPreviews] = useState<string[]>([]);
  const [compression, setCompression] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    est_active: true,
  });

  // Charger les données de l'annonce
  useEffect(() => {
    async function chargerAnnonce() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .eq("agent_id", user.id)
        .single();

      if (error || !data) {
        router.push("/dashboard/annonces");
        return;
      }

      setFormData({
        titre: data.titre || "",
        description: data.description || "",
        prix: data.prix ? String(data.prix) : "",
        surface: data.surface ? String(data.surface) : "",
        type_bien: data.type_bien || "",
        type_transaction: data.type_transaction || "Vente",
        statut_document: data.statut_document || "Acte",
        wilaya_id: data.wilaya_id ? String(data.wilaya_id) : "",
        commune: data.commune || "",
        quartier: data.quartier || "",
        etage: data.etage !== null ? String(data.etage) : "",
        nb_pieces: data.nb_pieces !== null ? String(data.nb_pieces) : "",
        ascenseur: data.ascenseur || false,
        citerne: data.citerne || false,
        garage: data.garage || false,
        jardin: data.jardin || false,
        est_active: data.est_active ?? true,
      });
      setExistingPhotos(data.photos || []);
      setLoading(false);
    }
    chargerAnnonce();
  }, [id, router]);

  function updateField(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  /** Gestion de l'ajout de nouvelles photos */
  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const fichiers = e.target.files;
    if (!fichiers) return;

    setCompression("Compression en cours...");
    const fichiersArray = Array.from(fichiers);
    const nouvelles: string[] = [];
    const nouveauxFiles: File[] = [];

    for (const fichier of fichiersArray) {
      try {
        const compresse = await compresserImage(fichier, {
          maxLargeur: 1200,
          maxHauteur: 1200,
          qualite: 0.8,
          tailleMaxOctets: 500 * 1024,
        });
        nouveauxFiles.push(compresse);
        nouvelles.push(URL.createObjectURL(compresse));
        setCompression(
          `Compressé : ${formaterTailleFichier(fichier.size)} → ${formaterTailleFichier(compresse.size)}`
        );
      } catch {
        nouveauxFiles.push(fichier);
        nouvelles.push(URL.createObjectURL(fichier));
      }
    }

    setNewPhotosPreviews((prev) => [...prev, ...nouvelles]);
    setNewPhotosFiles((prev) => [...prev, ...nouveauxFiles]);
    setTimeout(() => setCompression(null), 3000);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function supprimerPhotoExistante(index: number) {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function supprimerNouvellePhoto(index: number) {
    setNewPhotosPreviews((prev) => prev.filter((_, i) => i !== index));
    setNewPhotosFiles((prev) => prev.filter((_, i) => i !== index));
  }

  /** Sauvegarder les modifications */
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Upload new photos
    const uploadedUrls: string[] = [];
    for (const fichier of newPhotosFiles) {
      const nomFichier = `${user.id}/${Date.now()}-${fichier.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("listing-photos")
        .upload(nomFichier, fichier);

      if (uploadError) {
        console.error("Erreur upload:", uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("listing-photos")
        .getPublicUrl(uploadData.path);

      uploadedUrls.push(urlData.publicUrl);
    }

    const allPhotos = [...existingPhotos, ...uploadedUrls];

    const { error } = await supabase
      .from("listings")
      .update({
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
        est_active: formData.est_active,
        photos: allPhotos,
      })
      .eq("id", id)
      .eq("agent_id", user.id);

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMessage("Annonce mise à jour avec succès !");
      setExistingPhotos(allPhotos);
      setNewPhotosFiles([]);
      setNewPhotosPreviews([]);
    }
    setSaving(false);
  }

  /** Supprimer l'annonce */
  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", id)
      .eq("agent_id", user.id);

    if (error) {
      setMessage("Erreur lors de la suppression : " + error.message);
      setDeleting(false);
      return;
    }

    router.push("/dashboard/annonces");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-or" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/annonces">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-bleu-nuit">Modifier l&apos;annonce</h1>
      </div>

      <form onSubmit={handleSave}>
        {message && (
          <div
            className={`p-3 text-sm rounded-md mb-4 ${
              message.startsWith("Erreur")
                ? "text-red-600 bg-red-50"
                : "text-green-600 bg-green-50"
            }`}
          >
            {message}
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations principales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titre">Titre</Label>
              <Input
                id="titre"
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES_BIEN.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Transaction</Label>
                <Select
                  value={formData.type_transaction}
                  onValueChange={(v) => updateField("type_transaction", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES_TRANSACTION.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
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
                  value={formData.surface}
                  onChange={(e) => updateField("surface", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Document</Label>
              <Select
                value={formData.statut_document}
                onValueChange={(v) => updateField("statut_document", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS_DOCUMENT.map((doc) => (
                    <SelectItem key={doc} value={doc}>{doc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Localisation & Détails</CardTitle>
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
                  value={formData.commune}
                  onChange={(e) => updateField("commune", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quartier">Quartier</Label>
              <Input
                id="quartier"
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
                  value={formData.etage}
                  onChange={(e) => updateField("etage", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nb_pieces">Pièces</Label>
                <Input
                  id="nb_pieces"
                  type="number"
                  value={formData.nb_pieces}
                  onChange={(e) => updateField("nb_pieces", e.target.value)}
                />
              </div>
            </div>

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
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={6}
              required
            />
          </CardContent>
        </Card>

        {/* Photos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>
              Gérez les photos de votre annonce
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Photos existantes */}
            {existingPhotos.length > 0 && (
              <div>
                <Label className="mb-2 block">Photos actuelles</Label>
                <div className="grid grid-cols-3 gap-2">
                  {existingPhotos.map((photo, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={photo}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => supprimerPhotoExistante(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nouvelles photos (previews) */}
            {newPhotosPreviews.length > 0 && (
              <div>
                <Label className="mb-2 block">Nouvelles photos à ajouter</Label>
                <div className="grid grid-cols-3 gap-2">
                  {newPhotosPreviews.map((photo, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={photo}
                        alt={`Nouvelle ${i + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-green-300"
                      />
                      <button
                        type="button"
                        onClick={() => supprimerNouvellePhoto(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload zone */}
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
              <p className="text-sm text-gray-600 mb-2">
                Ajouter des photos
              </p>
              <input
                type="file"
                multiple
                accept={FORMATS_IMAGE_ACCEPTES}
                onChange={handlePhotos}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Choisir des fichiers
              </Button>
            </div>
            {compression && (
              <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
                {compression}
              </p>
            )}
            <p className="text-xs text-gray-400">
              {existingPhotos.length + newPhotosPreviews.length} photo(s) au total
            </p>
          </CardContent>
        </Card>

        {/* Statut et actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Statut de publication</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.est_active}
                onChange={(e) => updateField("est_active", e.target.checked)}
                className="w-4 h-4"
              />
              <div>
                <span className="text-sm font-medium">Annonce active</span>
                <p className="text-xs text-gray-500">
                  L&apos;annonce sera visible sur votre page publique
                </p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex items-center justify-between">
          <div>
            {!confirmDelete ? (
              <Button
                type="button"
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">Confirmer ?</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Oui, supprimer"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Non
                </Button>
              </div>
            )}
          </div>

          <Button type="submit" variant="or" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
