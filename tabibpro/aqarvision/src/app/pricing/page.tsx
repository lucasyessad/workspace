import Link from "next/link";
import {
  Building2,
  Check,
  ArrowRight,
  Sparkles,
  BarChart3,
  Globe,
  Shield,
  Camera,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs - AqarVision | Plateforme Immobilière Algérie",
  description:
    "Découvrez nos formules adaptées aux agences immobilières algériennes. À partir de 2 500 DA/mois.",
};

/** Les différents plans tarifaires */
const plans = [
  {
    nom: "Starter",
    prix: "2 500",
    devise: "DA/mois",
    description: "Pour les agents indépendants qui démarrent",
    populaire: false,
    fonctionnalites: [
      "10 annonces actives",
      "Page publique agence",
      "Upload 5 photos/annonce",
      "Contact WhatsApp",
      "Support email",
    ],
    limites: [
      "Pas de génération IA",
      "Pas d'analytics",
      "Pas de multi-langue",
    ],
  },
  {
    nom: "Pro",
    prix: "5 500",
    devise: "DA/mois",
    description: "Pour les agences qui veulent se démarquer",
    populaire: true,
    fonctionnalites: [
      "50 annonces actives",
      "Page publique personnalisée",
      "Upload 15 photos/annonce",
      "Génération IA trilingue (FR/AR/EN)",
      "Analytics complets",
      "Compression photos auto",
      "Badge agence vérifiée",
      "Support prioritaire",
    ],
    limites: [],
  },
  {
    nom: "Enterprise",
    prix: "Sur devis",
    devise: "",
    description: "Pour les grandes agences et réseaux",
    populaire: false,
    fonctionnalites: [
      "Annonces illimitées",
      "Multi-agences / Réseau",
      "API personnalisée",
      "Intégration CRM",
      "WhatsApp Business API",
      "Formation dédiée",
      "Account Manager",
      "SLA garanti",
    ],
    limites: [],
  },
];

/** Page de tarification */
export default function PricingPage() {
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
              <Button variant="or">Commencer</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* En-tête */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-bleu-nuit mb-4">
          Des tarifs adaptés à <span className="text-or">votre agence</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choisissez la formule qui correspond à vos besoins.
          Tous les plans incluent un essai gratuit de 14 jours.
        </p>
      </section>

      {/* Cartes de prix */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.nom}
              className={`relative overflow-hidden ${
                plan.populaire
                  ? "border-or border-2 shadow-lg scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.populaire && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-or text-bleu-nuit rounded-none rounded-bl-lg px-3 py-1">
                    Populaire
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-bleu-nuit">
                  {plan.nom}
                </CardTitle>
                <p className="text-sm text-gray-500">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-bleu-nuit">
                    {plan.prix}
                  </span>
                  {plan.devise && (
                    <span className="text-gray-500 ml-1">{plan.devise}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/auth/register">
                  <Button
                    variant={plan.populaire ? "or" : "outline"}
                    className="w-full mb-6"
                  >
                    Essai gratuit 14 jours
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>

                <ul className="space-y-3">
                  {plan.fonctionnalites.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                  {plan.limites.map((l) => (
                    <li
                      key={l}
                      className="flex items-start gap-2 text-sm text-gray-400"
                    >
                      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                        &mdash;
                      </span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Fonctionnalités incluses */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-bleu-nuit mb-12">
            Toutes nos fonctionnalités
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Sparkles,
                titre: "IA Rédactionnelle",
                desc: "Descriptions professionnelles en 3 langues",
              },
              {
                icon: Globe,
                titre: "Multi-langue",
                desc: "Français, Arabe et Anglais avec support RTL",
              },
              {
                icon: BarChart3,
                titre: "Analytics",
                desc: "Vues, clics WhatsApp, contacts, recherches",
              },
              {
                icon: Camera,
                titre: "Photos optimisées",
                desc: "Compression auto pour les connexions mobiles",
              },
              {
                icon: Shield,
                titre: "Sécurité documents",
                desc: "Suivi des types de papiers (Acte, Livret...)",
              },
              {
                icon: MessageCircle,
                titre: "Contact WhatsApp",
                desc: "Messages pré-remplis avec le titre du bien",
              },
            ].map(({ icon: Icon, titre, desc }) => (
              <div key={titre} className="flex items-start gap-3">
                <div className="p-2 bg-or/10 rounded-lg flex-shrink-0">
                  <Icon className="h-5 w-5 text-or" />
                </div>
                <div>
                  <h3 className="font-semibold text-bleu-nuit">{titre}</h3>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} AqarVision. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
