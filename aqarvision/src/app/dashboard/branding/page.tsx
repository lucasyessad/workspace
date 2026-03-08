"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Image as ImageIcon,
  Palette,
  Globe,
  ExternalLink,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BrandingPage() {
  const [loading, setLoading] = useState(true);
  const [profil, setProfil] = useState({
    nom_agence: "",
    logo_url: "",
    slug_url: "",
    description: "",
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
          .select("nom_agence, logo_url, slug_url, description")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfil({
            nom_agence: data.nom_agence || "",
            logo_url: data.logo_url || "",
            slug_url: data.slug_url || "",
            description: data.description || "",
          });
        }
      }
      setLoading(false);
    }
    chargerProfil();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-heading-3 font-bold text-foreground mb-8">
        Identité visuelle
      </h1>

      {/* Preview */}
      <div className="rounded-2xl border border-border bg-white mb-5 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-600 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/40 text-caption">Photo de couverture</p>
          </div>
        </div>
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-muted border-2 border-white -mt-10 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {profil.logo_url ? (
              <img
                src={profil.logo_url}
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

      {/* Section 1: Logo et images */}
      <div className="rounded-2xl border border-border bg-white mb-5">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-body font-semibold text-foreground">
              Logo et images
            </h2>
          </div>
          <p className="text-caption text-muted-foreground mt-0.5">
            Personnalisez l&apos;apparence de votre page publique.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Logo actuel */}
          <div className="space-y-1.5">
            <Label className="text-body-sm font-medium text-foreground">
              Logo actuel
            </Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                {profil.logo_url ? (
                  <img
                    src={profil.logo_url}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                )}
              </div>
              <div>
                <Button variant="outline" size="sm" disabled>
                  <Lock className="h-3.5 w-3.5 mr-1.5" />
                  Changer le logo
                </Button>
                <p className="text-caption text-muted-foreground mt-1">
                  Bientôt disponible
                </p>
              </div>
            </div>
          </div>

          {/* Photo de couverture */}
          <div className="space-y-1.5">
            <Label className="text-body-sm font-medium text-foreground">
              Photo de couverture
            </Label>
            <div className="h-24 rounded-xl bg-muted flex items-center justify-center border border-dashed border-border">
              <div className="text-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground/40 mx-auto mb-1" />
                <p className="text-caption text-muted-foreground">
                  Bientôt disponible
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Couleurs et style */}
      <div className="rounded-2xl border border-border bg-white mb-5">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-body font-semibold text-foreground">
              Couleurs et style
            </h2>
          </div>
          <p className="text-caption text-muted-foreground mt-0.5">
            Définissez les couleurs de votre marque.
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-body-sm font-medium text-foreground">
                Couleur principale
              </Label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-border" />
                <div>
                  <p className="text-body-sm text-foreground font-mono">
                    #1e293b
                  </p>
                  <p className="text-caption text-muted-foreground">
                    Bientôt disponible
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-body-sm font-medium text-foreground">
                Couleur secondaire
              </Label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500 border border-border" />
                <div>
                  <p className="text-body-sm text-foreground font-mono">
                    #f59e0b
                  </p>
                  <p className="text-caption text-muted-foreground">
                    Bientôt disponible
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Informations publiques */}
      <div className="rounded-2xl border border-border bg-white mb-5">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-body font-semibold text-foreground">
              Informations publiques
            </h2>
          </div>
          <p className="text-caption text-muted-foreground mt-0.5">
            Ces informations seront visibles sur votre mini-site.
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="slogan" className="text-body-sm font-medium text-foreground">
              Slogan
            </Label>
            <Input
              id="slogan"
              placeholder="Votre slogan ici..."
              disabled
            />
            <p className="text-caption text-muted-foreground">
              Bientôt disponible
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="horaires" className="text-body-sm font-medium text-foreground">
              Horaires d&apos;ouverture
            </Label>
            <Input
              id="horaires"
              placeholder="Ex: Dim-Jeu 9h-17h"
              disabled
            />
            <p className="text-caption text-muted-foreground">
              Bientôt disponible
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="site_web" className="text-body-sm font-medium text-foreground">
              Site web
            </Label>
            <Input
              id="site_web"
              type="url"
              placeholder="https://www.votre-site.dz"
              disabled
            />
            <p className="text-caption text-muted-foreground">
              Bientôt disponible
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="facebook" className="text-body-sm font-medium text-foreground">
              Facebook
            </Label>
            <Input
              id="facebook"
              type="url"
              placeholder="https://facebook.com/votre-page"
              disabled
            />
            <p className="text-caption text-muted-foreground">
              Bientôt disponible
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="instagram" className="text-body-sm font-medium text-foreground">
              Instagram
            </Label>
            <Input
              id="instagram"
              type="url"
              placeholder="https://instagram.com/votre-compte"
              disabled
            />
            <p className="text-caption text-muted-foreground">
              Bientôt disponible
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Aperçu du mini-site */}
      <div className="rounded-2xl border border-border bg-white mb-5">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-body font-semibold text-foreground">
              Aperçu du mini-site
            </h2>
          </div>
          <p className="text-caption text-muted-foreground mt-0.5">
            Votre page publique accessible par vos clients.
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 text-body-sm text-muted-foreground bg-muted p-3 rounded-lg mb-4">
            <Globe className="h-4 w-4 flex-shrink-0" />
            <span>aqarvision.dz/</span>
            <span className="font-medium text-foreground">
              {profil.slug_url || "votre-agence"}
            </span>
          </div>

          {profil.slug_url && (
            <a
              href={`/${profil.slug_url}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Voir ma page publique
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Save button (disabled) */}
      <div className="flex justify-end">
        <Button disabled>
          <Lock className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
