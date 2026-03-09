"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Upload, X, Languages, Check, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WILAYAS } from "@/lib/wilayas";
import { validerPrix, validerSurface } from "@/lib/validation";
import { compresserImage, formaterTailleFichier, FORMATS_IMAGE_ACCEPTES } from "@/lib/compression-image";
import type { Locale } from "@/lib/i18n";
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

const LANGUES_IA: { code: Locale; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
];

export default function NouvelleAnnoncePage() {
  const router = useRouter();
  const [etape, setEtape] = useState(1);
  const [loading, setLoading] = useState(false);
  const [genereIA, setGenereIA] = useState(false);
  const [langueIA, setLangueIA] = useState<Locale>("fr");
  const [erreur, setErreur] = useState<string | null>(null);
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);
  const [photosFiles, setPhotosFiles] = useState<File[]>([]);
  const [compression, setCompression] = useState<string | null>(null);
  const [videosPreviews, setVideosPreviews] = useState<string[]>([]);
  const [videosFiles, setVideosFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
    points_cles: "",
  });

  function updateField(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function genererAvecIA() {
    if (!formData.points_cles.trim()) return;
    setGenereIA(true);

    const wilaya = WILAYAS.find((w) => String(w.id) === formData.wilaya_id);

    try {
      const response = await fetch("/api/generer-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points_cles: formData.points_cles,
          type_bien: formData.type_bien,
          type_transaction: formData.type_transaction,
          surface: formData.surface,
          prix: formData.prix,
          commune: formData.commune,
          wilaya: wilaya?.nom_fr || "",
          statut_document: formData.statut_document,
          nb_pieces: formData.nb_pieces,
          etage: formData.etage,
          ascenseur: formData.ascenseur,
          citerne: formData.citerne,
          garage: formData.garage,
          jardin: formData.jardin,
          locale: langueIA,
        }),
      });

      const data = await response.json();
      if (data.description) {
        setFormData((prev) => ({ ...prev, description: data.description }));
      }
    } catch {
      setErreur("Erreur lors de la génération IA");
    }

    setGenereIA(false);
  }

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const fichiers = e.target.files;
    if (!fichiers) return;

    setCompression("Compression en cours...");

    const fichiersArray = Array.from(fichiers);
    const nouvelles: string[] = [];
    const nouveauxFiles: File[] = [];

    for (const fichier of fichiersArray) {
      try {
        const tailleBefore = fichier.size;
        const compresse = await compresserImage(fichier, {
          maxLargeur: 1200,
          maxHauteur: 1200,
          qualite: 0.8,
          tailleMaxOctets: 500 * 1024,
        });
        const tailleAfter = compresse.size;

        if (tailleBefore > tailleAfter) {
          setCompression(
            `Compressé : ${formaterTailleFichier(tailleBefore)} → ${formaterTailleFichier(tailleAfter)}`
          );
        }

        nouveauxFiles.push(compresse);
        nouvelles.push(URL.createObjectURL(compresse));
      } catch {
        nouveauxFiles.push(fichier);
        nouvelles.push(URL.createObjectURL(fichier));
      }
    }

    setPhotosPreviews((prev) => [...prev, ...nouvelles]);
    setPhotosFiles((prev) => [...prev, ...nouveauxFiles]);
    setTimeout(() => setCompression(null), 3000);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function supprimerPhoto(index: number) {
    setPhotosPreviews((prev) => prev.filter((_, i) => i !== index));
    setPhotosFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const FORMATS_VIDEO_ACCEPTES = "video/mp4,video/quicktime,video/webm";
  const TAILLE_MAX_VIDEO = 50 * 1024 * 1024; // 50 Mo
  const MAX_VIDEOS = 2;

  function handleVideos(e: React.ChangeEvent<HTMLInputElement>) {
    const fichiers = e.target.files;
    if (!fichiers) return;

    const fichiersArray = Array.from(fichiers);
    const restants = MAX_VIDEOS - videosFiles.length;

    if (restants <= 0) {
      setErreur("Vous pouvez ajouter au maximum 2 vidéos.");
      return;
    }

    const aAjouter = fichiersArray.slice(0, restants);

    for (const fichier of aAjouter) {
      if (fichier.size > TAILLE_MAX_VIDEO) {
        setErreur(`La vidéo "${fichier.name}" dépasse la taille maximale de 50 Mo.`);
        return;
      }
    }

    const nouvelles: string[] = aAjouter.map((f) => URL.createObjectURL(f));

    setVideosPreviews((prev) => [...prev, ...nouvelles]);
    setVideosFiles((prev) => [...prev, ...aAjouter]);
    setErreur(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  }

  function supprimerVideo(index: number) {
    setVideosPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setVideosFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function validerEtape(etapeCible: number): boolean {
    if (etapeCible > 1 && etape === 1) {
      if (!formData.titre.trim()) { setErreur("Le titre est requis"); return false; }
      if (!formData.type_bien) { setErreur("Le type de bien est requis"); return false; }
      if (formData.prix) {
        const validPrix = validerPrix(Number(formData.prix), formData.type_transaction);
        if (!validPrix.valide) { setErreur(validPrix.message); return false; }
      }
      if (formData.surface) {
        const validSurface = validerSurface(Number(formData.surface));
        if (!validSurface.valide) { setErreur(validSurface.message); return false; }
      }
    }
    setErreur(null);
    return true;
  }

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

    const photosUrls: string[] = [];
    for (const fichier of photosFiles) {
      const nomFichier = `${user.id}/${Date.now()}-${fichier.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("listing-photos")
        .upload(nomFichier, fichier);

      if (uploadError) { console.error("Erreur upload:", uploadError); continue; }

      const { data: urlData } = supabase.storage
        .from("listing-photos")
        .getPublicUrl(uploadData.path);

      photosUrls.push(urlData.publicUrl);
    }

    const videosUrls: string[] = [];
    for (const fichier of videosFiles) {
      const nomFichier = `${user.id}/${Date.now()}-${fichier.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("listing-videos")
        .upload(nomFichier, fichier);

      if (uploadError) { console.error("Erreur upload vidéo:", uploadError); continue; }

      const { data: urlData } = supabase.storage
        .from("listing-videos")
        .getPublicUrl(uploadData.path);

      videosUrls.push(urlData.publicUrl);
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
      photos: photosUrls,
      videos: videosUrls,
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
    <div className="max-w-2xl">
      <h1 className="text-heading-3 font-bold text-foreground mb-8">
        Nouvelle annonce
      </h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { n: 1, label: "Informations" },
          { n: 2, label: "Détails" },
          { n: 3, label: "Photos" },
        ].map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                  etape > n
                    ? "bg-emerald-100 text-emerald-700"
                    : etape === n
                    ? "bg-bleu-nuit text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {etape > n ? <Check className="h-3.5 w-3.5" /> : n}
              </div>
              <span className="text-caption text-muted-foreground hidden sm:inline">
                {label}
              </span>
            </div>
            {i < 2 && <div className="flex-1 h-px bg-border" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {erreur && (
          <div className="p-3 text-body-sm text-red-600 bg-red-50 rounded-lg border border-red-100 mb-5">
            {erreur}
          </div>
        )}

        {/* Step 1 */}
        {etape === 1 && (
          <div className="rounded-2xl border border-border bg-white">
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-body font-semibold text-foreground">Informations du bien</h2>
              <p className="text-caption text-muted-foreground mt-0.5">Renseignez les informations principales</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="titre" className="text-body-sm font-medium">Titre de l&apos;annonce</Label>
                <Input
                  id="titre"
                  placeholder="Ex: Villa F4 avec jardin à Hydra"
                  value={formData.titre}
                  onChange={(e) => updateField("titre", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-body-sm font-medium">Type de bien</Label>
                  <Select value={formData.type_bien} onValueChange={(v) => updateField("type_bien", v)}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      {TYPES_BIEN.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-body-sm font-medium">Transaction</Label>
                  <Select value={formData.type_transaction} onValueChange={(v) => updateField("type_transaction", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPES_TRANSACTION.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prix" className="text-body-sm font-medium">Prix (DA)</Label>
                  <Input id="prix" type="number" placeholder="15000000" value={formData.prix} onChange={(e) => updateField("prix", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="surface" className="text-body-sm font-medium">Surface (m²)</Label>
                  <Input id="surface" type="number" placeholder="120" value={formData.surface} onChange={(e) => updateField("surface", e.target.value)} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-body-sm font-medium">Document</Label>
                <Select value={formData.statut_document} onValueChange={(v) => updateField("statut_document", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUTS_DOCUMENT.map((doc) => (
                      <SelectItem key={doc} value={doc}>{doc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="button" onClick={() => { if (validerEtape(2)) setEtape(2); }}>
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {etape === 2 && (
          <div className="rounded-2xl border border-border bg-white">
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-body font-semibold text-foreground">Détails du bien</h2>
              <p className="text-caption text-muted-foreground mt-0.5">Localisation et caractéristiques</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-body-sm font-medium">Wilaya</Label>
                  <Select value={formData.wilaya_id} onValueChange={(v) => updateField("wilaya_id", v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {WILAYAS.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>{w.code} - {w.nom_fr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="commune" className="text-body-sm font-medium">Commune</Label>
                  <Input id="commune" placeholder="Hydra" value={formData.commune} onChange={(e) => updateField("commune", e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quartier" className="text-body-sm font-medium">Quartier</Label>
                <Input id="quartier" placeholder="Cité des 200 lgts" value={formData.quartier} onChange={(e) => updateField("quartier", e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="etage" className="text-body-sm font-medium">Étage</Label>
                  <Input id="etage" type="number" placeholder="RDC = 0" value={formData.etage} onChange={(e) => updateField("etage", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nb_pieces" className="text-body-sm font-medium">Pièces</Label>
                  <Input id="nb_pieces" type="number" placeholder="4" value={formData.nb_pieces} onChange={(e) => updateField("nb_pieces", e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-body-sm font-medium">Caractéristiques</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { field: "ascenseur", label: "Ascenseur" },
                    { field: "citerne", label: "Citerne" },
                    { field: "garage", label: "Garage" },
                    { field: "jardin", label: "Jardin" },
                  ].map(({ field, label }) => (
                    <label
                      key={field}
                      className="flex items-center gap-2.5 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData[field as keyof typeof formData] as boolean}
                        onChange={(e) => updateField(field, e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-body-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => setEtape(1)}>Précédent</Button>
                <Button type="button" onClick={() => setEtape(3)}>Suivant</Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {etape === 3 && (
          <div className="rounded-2xl border border-border bg-white">
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-body font-semibold text-foreground">Photos & Description</h2>
              <p className="text-caption text-muted-foreground mt-0.5">Compression auto + génération IA trilingue</p>
            </div>
            <div className="p-6 space-y-5">
              {/* Upload */}
              <div className="space-y-2">
                <Label className="text-body-sm font-medium">Photos du bien</Label>
                <div
                  className="border border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-muted-foreground/30 hover:bg-muted/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files?.length) {
                      const input = fileInputRef.current;
                      if (input) {
                        const dt = new DataTransfer();
                        Array.from(e.dataTransfer.files).forEach(f => dt.items.add(f));
                        input.files = dt.files;
                        input.dispatchEvent(new Event("change", { bubbles: true }));
                      }
                    }
                  }}
                >
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-body-sm text-foreground mb-0.5">
                    Glissez vos photos ici
                  </p>
                  <p className="text-caption text-muted-foreground mb-3">
                    Compression automatique pour les connexions mobiles
                  </p>
                  <input
                    type="file"
                    multiple
                    accept={FORMATS_IMAGE_ACCEPTES}
                    onChange={handlePhotos}
                    className="hidden"
                    ref={fileInputRef}
                    id="photos-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    Parcourir
                  </Button>
                </div>
                {compression && (
                  <p className="text-caption text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                    {compression}
                  </p>
                )}
                {photosPreviews.length > 0 && (
                  <>
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {photosPreviews.map((photo, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden">
                          <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-20 object-cover" />
                          <button
                            type="button"
                            onClick={() => supprimerPhoto(i)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-caption text-muted-foreground">
                      {photosPreviews.length} photo(s)
                    </p>
                  </>
                )}
              </div>

              {/* Upload vidéos */}
              <div className="space-y-2">
                <Label className="text-body-sm font-medium">Vidéos du bien</Label>
                <p className="text-caption text-muted-foreground">
                  Jusqu&apos;à 2 vidéos (MP4, MOV, WebM) — 50 Mo max par vidéo
                </p>
                <div
                  className="border border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-muted-foreground/30 hover:bg-muted/30 transition-colors"
                  onClick={() => videoInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files?.length) {
                      const input = videoInputRef.current;
                      if (input) {
                        const dt = new DataTransfer();
                        Array.from(e.dataTransfer.files).forEach(f => dt.items.add(f));
                        input.files = dt.files;
                        input.dispatchEvent(new Event("change", { bubbles: true }));
                      }
                    }
                  }}
                >
                  <Video className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-body-sm text-foreground mb-0.5">
                    Glissez vos vidéos ici
                  </p>
                  <p className="text-caption text-muted-foreground mb-3">
                    Formats acceptés : MP4, MOV, WebM
                  </p>
                  <input
                    type="file"
                    multiple
                    accept={FORMATS_VIDEO_ACCEPTES}
                    onChange={handleVideos}
                    className="hidden"
                    ref={videoInputRef}
                    id="videos-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); videoInputRef.current?.click(); }}
                    disabled={videosFiles.length >= MAX_VIDEOS}
                  >
                    Parcourir
                  </Button>
                </div>
                {videosPreviews.length > 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {videosPreviews.map((video, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden">
                          <video
                            src={video}
                            controls
                            className="w-full aspect-video object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => supprimerVideo(i)}
                            className="absolute top-2 right-2 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-caption text-muted-foreground">
                      {videosPreviews.length} / {MAX_VIDEOS} vidéo(s)
                    </p>
                  </>
                )}
              </div>

              {/* IA */}
              <div className="space-y-2">
                <Label htmlFor="points_cles" className="text-body-sm font-medium">Points clés (pour IA)</Label>
                <Textarea
                  id="points_cles"
                  placeholder="Vue sur mer, 3 chambres, cuisine équipée, parking..."
                  value={formData.points_cles}
                  onChange={(e) => updateField("points_cles", e.target.value)}
                  rows={3}
                />

                <div className="flex items-center gap-2">
                  <Languages className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex gap-1">
                    {LANGUES_IA.map((langue) => (
                      <button
                        key={langue.code}
                        type="button"
                        onClick={() => setLangueIA(langue.code)}
                        className={`px-2.5 py-1 rounded-md text-caption font-medium transition-colors ${
                          langueIA === langue.code
                            ? "bg-bleu-nuit text-white"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {langue.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={genererAvecIA}
                  disabled={genereIA || !formData.points_cles.trim()}
                >
                  {genereIA ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Génération...</>
                  ) : (
                    <><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Générer avec l&apos;IA</>
                  )}
                </Button>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-body-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre bien en détail..."
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={6}
                  required
                  dir={langueIA === "ar" ? "rtl" : "ltr"}
                />
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => setEtape(2)}>Précédent</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publication...</>
                  ) : (
                    "Publier l'annonce"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
