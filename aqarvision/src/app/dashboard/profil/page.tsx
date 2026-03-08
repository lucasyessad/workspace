"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
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
import { validerTelephoneAlgerien } from "@/lib/validation";

export default function ProfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreurTel, setErreurTel] = useState<string | null>(null);
  const [profil, setProfil] = useState({
    nom_agence: "",
    telephone_whatsapp: "",
    wilaya_id: "",
    commune: "",
    adresse: "",
    description: "",
    slug_url: "",
  });

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
            telephone_whatsapp: data.telephone_whatsapp || "",
            wilaya_id: data.wilaya_id ? String(data.wilaya_id) : "",
            commune: data.commune || "",
            adresse: data.adresse || "",
            description: data.description || "",
            slug_url: data.slug_url || "",
          });
        }
      }
      setLoading(false);
    }
    chargerProfil();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setErreurTel(null);

    const validationTel = validerTelephoneAlgerien(profil.telephone_whatsapp);
    if (!validationTel.valide) {
      setErreurTel(validationTel.message);
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        nom_agence: profil.nom_agence,
        telephone_whatsapp: profil.telephone_whatsapp,
        wilaya_id: profil.wilaya_id ? parseInt(profil.wilaya_id) : null,
        commune: profil.commune || null,
        adresse: profil.adresse || null,
        description: profil.description || null,
      })
      .eq("id", user.id);

    if (error) {
      setMessage("Erreur lors de la sauvegarde : " + error.message);
    } else {
      setMessage("Profil mis à jour avec succès !");
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

  return (
    <div className="max-w-2xl">
      <h1 className="text-heading-3 font-bold text-foreground mb-8">Profil</h1>

      <form onSubmit={handleSave}>
        <div className="rounded-2xl border border-border bg-white">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-body font-semibold text-foreground">
              Informations de l&apos;agence
            </h2>
            <p className="text-caption text-muted-foreground mt-0.5">
              Ces informations apparaissent sur votre page publique.
            </p>
          </div>

          <div className="p-6 space-y-5">
            {message && (
              <div
                className={`p-3 text-body-sm rounded-lg ${
                  message.startsWith("Erreur")
                    ? "text-red-600 bg-red-50 border border-red-100"
                    : "text-emerald-700 bg-emerald-50 border border-emerald-100"
                }`}
              >
                {message}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="nom" className="text-body-sm font-medium">
                Nom de l&apos;agence
              </Label>
              <Input
                id="nom"
                value={profil.nom_agence}
                onChange={(e) =>
                  setProfil({ ...profil, nom_agence: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tel" className="text-body-sm font-medium">
                Téléphone / WhatsApp
              </Label>
              <Input
                id="tel"
                type="tel"
                placeholder="+213 5XX XX XX XX"
                value={profil.telephone_whatsapp}
                onChange={(e) => {
                  setProfil({ ...profil, telephone_whatsapp: e.target.value });
                  setErreurTel(null);
                }}
                required
              />
              {erreurTel && (
                <p className="text-xs text-red-500">{erreurTel}</p>
              )}
              <p className="text-caption text-muted-foreground">
                Format : +213 5/6/7XX XX XX XX ou 05/06/07XX XX XX XX
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-body-sm font-medium">Wilaya</Label>
                <Select
                  value={profil.wilaya_id}
                  onValueChange={(v) =>
                    setProfil({ ...profil, wilaya_id: v })
                  }
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
              <div className="space-y-1.5">
                <Label htmlFor="commune" className="text-body-sm font-medium">
                  Commune
                </Label>
                <Input
                  id="commune"
                  value={profil.commune}
                  onChange={(e) =>
                    setProfil({ ...profil, commune: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adresse" className="text-body-sm font-medium">
                Adresse
              </Label>
              <Input
                id="adresse"
                value={profil.adresse}
                onChange={(e) =>
                  setProfil({ ...profil, adresse: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-body-sm font-medium">
                Description de l&apos;agence
              </Label>
              <Textarea
                id="desc"
                value={profil.description}
                onChange={(e) =>
                  setProfil({ ...profil, description: e.target.value })
                }
                rows={4}
                placeholder="Présentez votre agence..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-body-sm font-medium">
                URL de votre page publique
              </Label>
              <div className="flex items-center gap-2 text-body-sm text-muted-foreground bg-muted p-3 rounded-lg">
                <span>aqarvision.dz/</span>
                <span className="font-medium text-foreground">
                  {profil.slug_url}
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border flex justify-end">
            <Button type="submit" disabled={saving}>
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
        </div>
      </form>
    </div>
  );
}
