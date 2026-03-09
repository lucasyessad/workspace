"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Image as ImageIcon,
  Globe,
  ExternalLink,
  Save,
  Upload,
  X,
  Check,
  Camera,
  Palette,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssistantDescription } from "@/components/shared/assistant-description";
import { ThemeSelector } from "@/components/dashboard/theme-selector";
import { WILAYAS } from "@/lib/wilayas";
import { resolveThemeColors } from "@/lib/themes";

export default function BrandingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [profil, setProfil] = useState({
    nom_agence: "",
    logo_url: "",
    slug_url: "",
    description: "",
    telephone_whatsapp: "",
    commune: "",
    adresse: "",
    wilaya_id: 0,
    theme_id: "classique",
    custom_primary: "#0c1b2a",
    custom_accent: "#b8963e",
  });

  // Preview for new logo before upload
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    async function chargerProfil() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfil({
            nom_agence: data.nom_agence || "",
            logo_url: data.logo_url || "",
            slug_url: data.slug_url || "",
            description: data.description || "",
            telephone_whatsapp: data.telephone_whatsapp || "",
            commune: data.commune || "",
            adresse: data.adresse || "",
            wilaya_id: data.wilaya_id || 0,
            theme_id: data.theme_id || "classique",
            custom_primary: data.custom_primary || "#0c1b2a",
            custom_accent: data.custom_accent || "#b8963e",
          });
        }
      }
      setLoading(false);
    }
    chargerProfil();
  }, []);

  /* ── Logo selection ── */
  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Seules les images sont acceptées" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Le logo ne doit pas dépasser 5 Mo",
      });
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function cancelLogo() {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  /* ── Upload logo ── */
  async function uploadLogo(): Promise<string | null> {
    if (!logoFile) return null;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", logoFile);
      formData.append("type", "logo");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.erreur || "Erreur upload");

      return data.url;
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Erreur lors de l'upload du logo",
      });
      return null;
    } finally {
      setUploadingLogo(false);
    }
  }

  /* ── Save all ── */
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage({ type: "error", text: "Non authentifié" });
      setSaving(false);
      return;
    }

    // Upload logo if new one selected
    let newLogoUrl = profil.logo_url;
    if (logoFile) {
      const url = await uploadLogo();
      if (url) {
        newLogoUrl = url;
      } else {
        setSaving(false);
        return;
      }
    }

    // Update profile
    const { error } = await supabase
      .from("profiles")
      .update({
        logo_url: newLogoUrl || null,
        description: profil.description || null,
        theme_id: profil.theme_id || "classique",
        custom_primary: profil.theme_id === "custom" ? profil.custom_primary : null,
        custom_accent: profil.theme_id === "custom" ? profil.custom_accent : null,
      })
      .eq("id", user.id);

    if (error) {
      setMessage({
        type: "error",
        text: "Erreur : " + error.message,
      });
    } else {
      setProfil((prev) => ({ ...prev, logo_url: newLogoUrl }));
      setLogoFile(null);
      setLogoPreview(null);
      if (logoInputRef.current) logoInputRef.current.value = "";
      setMessage({
        type: "success",
        text: "Identité visuelle mise à jour !",
      });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayLogo = logoPreview || profil.logo_url;
  const themeColors = resolveThemeColors(profil.theme_id, profil.custom_primary, profil.custom_accent);

  return (
    <div className="max-w-2xl">
      <h1 className="text-heading-3 font-bold text-foreground mb-8">
        Identité visuelle
      </h1>

      {/* Message */}
      {message && (
        <div
          className={`mb-5 p-4 rounded-xl flex items-center gap-3 text-body-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-red-50 text-red-600 border border-red-100"
          }`}
        >
          {message.type === "success" ? (
            <Check className="h-4 w-4 flex-shrink-0" />
          ) : (
            <X className="h-4 w-4 flex-shrink-0" />
          )}
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="ms-auto hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* ═══ Preview card ═══ */}
        <div className="rounded-2xl border border-border bg-white mb-6 overflow-hidden">
          <div
            className="h-28 relative"
            style={{ background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.primary}cc)` }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white/30 text-caption">
                Aperçu de votre vitrine
              </p>
            </div>
          </div>
          <div className="px-6 py-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-muted border-2 border-white -mt-12 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-card">
              {displayLogo ? (
                <img
                  src={displayLogo}
                  alt={profil.nom_agence}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-heading-4 font-bold text-muted-foreground">
                  {profil.nom_agence?.charAt(0)?.toUpperCase() || "A"}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-body font-semibold text-foreground truncate">
                {profil.nom_agence || "Nom de l'agence"}
              </p>
              <p className="text-caption text-muted-foreground truncate">
                {profil.description || "Description de votre agence"}
              </p>
            </div>
          </div>
        </div>

        {/* ═══ Logo ═══ */}
        <div className="rounded-2xl border border-border bg-white mb-6">
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-or" />
              <h2 className="text-body font-semibold text-foreground">Logo</h2>
            </div>
            <p className="text-caption text-muted-foreground mt-0.5">
              Votre logo apparaît sur votre vitrine et dans les résultats de
              recherche.
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-5">
              {/* Current / Preview */}
              <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border border-border">
                {displayLogo ? (
                  <img
                    src={displayLogo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                )}
              </div>

              <div className="flex-1">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleLogoSelect}
                  className="hidden"
                />

                {logoFile ? (
                  <div className="space-y-3">
                    <p className="text-body-sm text-foreground font-medium">
                      {logoFile.name}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {(logoFile.size / 1024 / 1024).toFixed(2)} Mo
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cancelLogo}
                      >
                        <X className="h-3.5 w-3.5 me-1.5" />
                        Annuler
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        Changer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 me-1.5" />
                      {profil.logo_url ? "Changer le logo" : "Ajouter un logo"}
                    </Button>
                    <p className="text-caption text-muted-foreground">
                      JPG, PNG ou WebP. Max 5 Mo. Recommandé : 400x400px.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Informations publiques ═══ */}
        <div className="rounded-2xl border border-border bg-white mb-6">
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-or" />
              <h2 className="text-body font-semibold text-foreground">
                Description publique
              </h2>
            </div>
            <p className="text-caption text-muted-foreground mt-0.5">
              Présentez votre agence aux visiteurs de votre vitrine.
            </p>
          </div>

          <div className="p-6">
            <AssistantDescription
              value={profil.description}
              onChange={(text) =>
                setProfil({ ...profil, description: text })
              }
              type="agence"
              context={{
                nom_agence: profil.nom_agence,
                wilaya: WILAYAS.find((w) => w.id === profil.wilaya_id)?.nom_fr || "",
                commune: profil.commune,
              }}
              placeholder="Présentez votre agence, vos spécialités, votre zone géographique..."
              rows={4}
              maxLength={500}
            />
          </div>
        </div>

        {/* ═══ Thème de la vitrine ═══ */}
        <div className="rounded-2xl border border-border bg-white mb-6">
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-or" />
              <h2 className="text-body font-semibold text-foreground">
                Thème de la vitrine
              </h2>
            </div>
            <p className="text-caption text-muted-foreground mt-0.5">
              Choisissez un thème pour votre vitrine ou créez le vôtre.
            </p>
          </div>

          <div className="p-6">
            <ThemeSelector
              selectedThemeId={profil.theme_id}
              customPrimary={profil.custom_primary}
              customAccent={profil.custom_accent}
              onSelect={(themeId, customPrimary, customAccent) => {
                setProfil({
                  ...profil,
                  theme_id: themeId,
                  ...(customPrimary && { custom_primary: customPrimary }),
                  ...(customAccent && { custom_accent: customAccent }),
                });
              }}
            />
          </div>
        </div>

        {/* ═══ Informations complémentaires ═══ */}
        <div className="rounded-2xl border border-border bg-white mb-6">
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-or" />
              <h2 className="text-body font-semibold text-foreground">
                Informations complémentaires
              </h2>
            </div>
            <p className="text-caption text-muted-foreground mt-0.5">
              Réseaux sociaux et informations additionnelles.
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-body-sm font-medium">Facebook</Label>
              <Input placeholder="https://facebook.com/votre-page" disabled />
              <p className="text-caption text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" /> Bientôt disponible
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-body-sm font-medium">Instagram</Label>
              <Input placeholder="https://instagram.com/votre-compte" disabled />
              <p className="text-caption text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" /> Bientôt disponible
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-body-sm font-medium">Horaires d&apos;ouverture</Label>
              <Input placeholder="Ex: Dim-Jeu 9h-17h" disabled />
              <p className="text-caption text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" /> Bientôt disponible
              </p>
            </div>
          </div>
        </div>

        {/* ═══ Aperçu du mini-site ═══ */}
        <div className="rounded-2xl border border-border bg-white mb-6">
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-or" />
              <h2 className="text-body font-semibold text-foreground">
                Votre vitrine
              </h2>
            </div>
            <p className="text-caption text-muted-foreground mt-0.5">
              Votre page publique accessible par vos clients.
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2 text-body-sm text-muted-foreground bg-blanc-casse p-4 rounded-xl mb-4 border border-border">
              <Globe className="h-4 w-4 flex-shrink-0 text-or" />
              <span>aqarvision.dz/fr/</span>
              <span className="font-semibold text-foreground">
                {profil.slug_url || "votre-agence"}
              </span>
            </div>

            {profil.slug_url && (
              <a
                href={`/fr/${profil.slug_url}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button type="button" variant="outline" size="sm">
                  <ExternalLink className="h-3.5 w-3.5 me-1.5" />
                  Voir ma vitrine
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* ═══ Save button ═══ */}
        <div className="flex items-center justify-between">
          <p className="text-caption text-muted-foreground">
            {logoFile
              ? "Logo modifié — pensez à enregistrer"
              : ""}
          </p>
          <Button type="submit" disabled={saving || uploadingLogo}>
            {saving || uploadingLogo ? (
              <>
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
                {uploadingLogo ? "Upload du logo..." : "Enregistrement..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 me-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
