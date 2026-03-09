"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Page de réinitialisation du mot de passe */
export default function NouveauMotDePassePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (password.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setErreur("Une erreur est survenue. Veuillez réessayer ou demander un nouveau lien.");
      setLoading(false);
      return;
    }

    setSucces(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blanc-casse px-4 relative overflow-hidden">
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

          {succes ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <h1 className="font-vitrine text-heading-3 font-bold text-foreground text-center">
                Mot de passe modifié
              </h1>
              <p className="text-body-sm text-muted-foreground text-center">
                Votre mot de passe a été réinitialisé avec succès.
              </p>
              <Button
                variant="default"
                className="w-full"
                onClick={() => {
                  router.push("/dashboard");
                  router.refresh();
                }}
              >
                Accéder au tableau de bord
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-vitrine text-heading-3 font-bold text-foreground text-center">
                Nouveau mot de passe
              </h1>
              <p className="text-body-sm text-muted-foreground text-center mt-1.5 mb-6">
                Choisissez un nouveau mot de passe pour votre compte
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {erreur && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                    {erreur}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-body-sm font-medium text-foreground">
                    Nouveau mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-body-sm font-medium text-foreground">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
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
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      Réinitialiser le mot de passe
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
