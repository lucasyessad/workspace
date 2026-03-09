"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Loader2, ArrowLeft, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Page de mot de passe oublié */
export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoye, setEnvoye] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErreur(null);

    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/auth/nouveau-mot-de-passe",
    });

    if (error) {
      setErreur("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
      return;
    }

    setEnvoye(true);
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

          <h1 className="font-vitrine text-heading-3 font-bold text-foreground text-center">
            Mot de passe oublié
          </h1>
          <p className="text-body-sm text-muted-foreground text-center mt-1.5 mb-6">
            Entrez votre email pour réinitialiser votre mot de passe
          </p>

          {envoye ? (
            <div className="space-y-4">
              <div className="p-4 text-sm text-green-700 bg-green-50 rounded-lg border border-green-100 flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Un email vous a été envoyé</p>
                  <p className="mt-1 text-green-600">
                    Consultez votre boîte de réception et cliquez sur le lien
                    pour réinitialiser votre mot de passe. Pensez à vérifier vos
                    spams.
                  </p>
                </div>
              </div>

              <Link href="/auth/login" className="block">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {erreur && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                  {erreur}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-body-sm font-medium text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le lien de réinitialisation"
                )}
              </Button>

              <p className="text-body-sm text-center text-muted-foreground pt-2">
                <Link
                  href="/auth/login"
                  className="text-or font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Retour à la connexion
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
