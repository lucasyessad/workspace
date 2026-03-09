"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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
import { WILAYAS } from "@/lib/wilayas";
import { slugify } from "@/lib/utils";

/** Page d'inscription moderne */
export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom_agence: "",
    email: "",
    password: "",
    telephone: "",
    wilaya_id: "",
  });

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErreur(null);

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          nom_agence: formData.nom_agence,
          telephone: formData.telephone,
          slug: slugify(formData.nom_agence),
          wilaya_id: parseInt(formData.wilaya_id),
        },
      },
    });

    if (error) {
      setErreur(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blanc-casse px-4 py-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-or/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-bleu-nuit/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="w-full max-w-md animate-fade-in-up relative">
        <div className="glass-card rounded-2xl border border-border shadow-card p-8">
          <div className="flex justify-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 bg-bleu-nuit rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">
                AqarVision
              </span>
            </Link>
          </div>

          <h1 className="font-vitrine text-heading-3 font-bold text-foreground text-center">
            Creer votre agence
          </h1>
          <p className="text-body-sm text-muted-foreground text-center mt-1.5 mb-6">
            Inscrivez-vous et commencez a publier vos annonces
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            {erreur && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                {erreur}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="nom_agence" className="text-body-sm font-medium text-foreground">
                Nom de l&apos;agence
              </Label>
              <Input
                id="nom_agence"
                placeholder="Ex: Immobiliere El Djazair"
                value={formData.nom_agence}
                onChange={(e) =>
                  setFormData({ ...formData, nom_agence: e.target.value })
                }
                required
                className="rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-body-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@votre-agence.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-body-sm font-medium text-foreground">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 caracteres"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                minLength={6}
                required
                className="rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telephone" className="text-body-sm font-medium text-foreground">
                Telephone / WhatsApp
              </Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="+213 XX XX XX XX"
                value={formData.telephone}
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
                required
                className="rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-body-sm font-medium text-foreground">Wilaya</Label>
              <Select
                value={formData.wilaya_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, wilaya_id: value })
                }
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Selectionnez votre wilaya" />
                </SelectTrigger>
                <SelectContent>
                  {WILAYAS.map((wilaya) => (
                    <SelectItem key={wilaya.id} value={String(wilaya.id)}>
                      {wilaya.code} - {wilaya.nom_fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creation en cours...
                </>
              ) : (
                <>
                  Creer mon agence
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-body-sm text-center text-muted-foreground pt-2">
              Deja inscrit ?{" "}
              <Link
                href="/auth/login"
                className="text-or font-semibold hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
