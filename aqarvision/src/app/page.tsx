import Link from "next/link";
import {
  Building2,
  Sparkles,
  Shield,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/** Page d'accueil - Landing principale AqarVision */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-blanc-casse">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-or" />
            <span className="text-xl font-bold text-bleu-nuit">
              Aqar<span className="text-or">Vision</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="or">Commencer gratuitement</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-bleu-nuit mb-6">
            Professionnalisez votre{" "}
            <span className="text-or">agence immobilière</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            La première plateforme SaaS dédiée aux agences immobilières en
            Algérie. Gérez vos annonces, créez votre vitrine en ligne et
            utilisez l&apos;IA pour des descriptions professionnelles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button variant="or" size="lg" className="w-full sm:w-auto">
                Créer mon agence
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#fonctionnalites">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Découvrir les fonctionnalités
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-bleu-nuit mb-12">
            Tout ce dont vous avez besoin
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Carte 1 */}
            <div className="p-6 rounded-xl border bg-blanc-casse hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-or/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-or" />
              </div>
              <h3 className="text-xl font-semibold text-bleu-nuit mb-2">
                IA Rédactionnelle
              </h3>
              <p className="text-gray-600">
                Transformez des points clés en descriptions professionnelles
                bilingues (FR/AR) en un clic grâce à l&apos;intelligence
                artificielle.
              </p>
            </div>

            {/* Carte 2 */}
            <div className="p-6 rounded-xl border bg-blanc-casse hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-or/10 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-or" />
              </div>
              <h3 className="text-xl font-semibold text-bleu-nuit mb-2">
                Mini-site Vitrine
              </h3>
              <p className="text-gray-600">
                Obtenez votre page publique professionnelle avec filtres de
                recherche et boutons de contact WhatsApp intégrés.
              </p>
            </div>

            {/* Carte 3 */}
            <div className="p-6 rounded-xl border bg-blanc-casse hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-or/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-or" />
              </div>
              <h3 className="text-xl font-semibold text-bleu-nuit mb-2">
                Vérification Documents
              </h3>
              <p className="text-gray-600">
                Système de vérification des documents de propriété : Acte,
                Livret foncier, Concession. Gagnez la confiance de vos clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-bleu-nuit py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à digitaliser votre agence ?
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Rejoignez les agences qui font confiance à AqarVision pour
            développer leur activité en ligne.
          </p>
          <Link href="/auth/register">
            <Button variant="or" size="lg">
              Démarrer maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} AqarVision. Tous droits réservés.
          </p>
          <p className="mt-1">
            Plateforme immobilière pour l&apos;Algérie
          </p>
        </div>
      </footer>
    </div>
  );
}
