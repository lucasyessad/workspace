"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Page d'inscription visiteur */
export default function VisiteurRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    password: "",
    telephone: "",
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
          role: "visitor",
          nom: formData.nom,
          telephone: formData.telephone,
        },
      },
    });

    if (error) {
      setErreur(error.message);
      setLoading(false);
      return;
    }

    router.push("/espace");
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

          <h1 className="text-2xl font-bold text-foreground text-center">
            Espace Visiteur
          </h1>
          <p className="text-sm text-gray-500 text-center mt-1.5 mb-6">
            Creez votre compte pour sauvegarder vos recherches
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            {erreur && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                {erreur}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="nom" className="text-sm font-medium text-gray-700">
                Nom complet
              </Label>
              <Input
                id="nom"
                placeholder="Votre nom"
                value={formData.nom}
                onChange={(e) =>
                  setFormData({ ...formData, nom: e.target.value })
                }
                required
                className="rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
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
              <Label htmlFor="telephone" className="text-sm font-medium text-gray-700">
                Telephone{" "}
                <span className="text-gray-400 font-normal">(optionnel)</span>
              </Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="+213 XX XX XX XX"
                value={formData.telephone}
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
                className="rounded-lg"
              />
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
                  Creer mon compte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-sm text-center text-gray-500 pt-2">
              Deja inscrit ?{" "}
              <Link
                href="/auth/visiteur/login"
                className="text-or font-semibold hover:underline"
              >
                Se connecter
              </Link>
            </p>

            <p className="text-sm text-center text-gray-400">
              Vous etes une agence ?{" "}
              <Link
                href="/auth/register"
                className="text-or font-semibold hover:underline"
              >
                Inscription agence
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
