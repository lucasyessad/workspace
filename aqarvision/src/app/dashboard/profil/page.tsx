"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
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

/** Page de gestion du profil de l'agence */
export default function ProfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
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
        <Loader2 className="h-8 w-8 animate-spin text-or" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-bleu-nuit mb-6">Mon profil</h1>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Informations de l&apos;agence</CardTitle>
            <CardDescription>
              Ces informations apparaissent sur votre page publique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <div
                className={`p-3 text-sm rounded-md ${
                  message.startsWith("Erreur")
                    ? "text-red-600 bg-red-50"
                    : "text-green-600 bg-green-50"
                }`}
              >
                {message}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nom">Nom de l&apos;agence</Label>
              <Input
                id="nom"
                value={profil.nom_agence}
                onChange={(e) =>
                  setProfil({ ...profil, nom_agence: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tel">Téléphone / WhatsApp</Label>
              <Input
                id="tel"
                type="tel"
                value={profil.telephone_whatsapp}
                onChange={(e) =>
                  setProfil({ ...profil, telephone_whatsapp: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Wilaya</Label>
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
              <div className="space-y-2">
                <Label htmlFor="commune">Commune</Label>
                <Input
                  id="commune"
                  value={profil.commune}
                  onChange={(e) =>
                    setProfil({ ...profil, commune: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                value={profil.adresse}
                onChange={(e) =>
                  setProfil({ ...profil, adresse: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description de l&apos;agence</Label>
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

            <div className="space-y-2">
              <Label>URL de votre page publique</Label>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                <span>aqarvision.dz/</span>
                <span className="font-medium text-bleu-nuit">
                  {profil.slug_url}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
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
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
