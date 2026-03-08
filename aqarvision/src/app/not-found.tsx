import Link from "next/link";
import { Building2, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Page 404 personnalisée */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-blanc-casse flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-or/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Building2 className="h-10 w-10 text-or" />
        </div>
        <h1 className="text-6xl font-bold text-bleu-nuit mb-4">404</h1>
        <h2 className="text-xl font-semibold text-bleu-nuit mb-2">
          Page introuvable
        </h2>
        <p className="text-gray-600 mb-8">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
          Vérifiez l&apos;URL ou retournez à l&apos;accueil.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="or">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l&apos;accueil
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline">
              Espace Agent
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
