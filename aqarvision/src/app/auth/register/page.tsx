"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { slugify } from "@/lib/utils";

/** Page d'inscription */
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
    <div className="min-h-screen bg-blanc-casse flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-8 w-8 text-or" />
            <span className="text-xl font-bold text-bleu-nuit">
              Aqar<span className="text-or">Vision</span>
            </span>
          </Link>
          <CardTitle className="text-2xl">Créer votre agence</CardTitle>
          <CardDescription>
            Inscrivez-vous pour commencer à gérer vos biens
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            {erreur && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {erreur}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="nom_agence">Nom de l&apos;agence</Label>
              <Input
                id="nom_agence"
                placeholder="Ex: Immobilière El Djazair"
                value={formData.nom_agence}
                onChange={(e) =>
                  setFormData({ ...formData, nom_agence: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@votre-agence.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 caractères"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone / WhatsApp</Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="+213 XX XX XX XX"
                value={formData.telephone}
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Wilaya</Label>
              <Select
                value={formData.wilaya_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, wilaya_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre wilaya" />
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              variant="or"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Créer mon agence"
              )}
            </Button>
            <p className="text-sm text-center text-gray-600">
              Déjà inscrit ?{" "}
              <Link href="/auth/login" className="text-or font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
