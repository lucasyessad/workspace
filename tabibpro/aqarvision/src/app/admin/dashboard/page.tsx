"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  FileText,
  MessageCircle,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  totalAgences: number;
  totalAnnonces: number;
  totalContacts: number;
  pendingVerifications: number;
  abonnementsParPlan: Record<string, number>;
}

/** Page principale du dashboard admin */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-or" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-red-500">Erreur de chargement des statistiques.</p>;
  }

  const cards = [
    {
      titre: "Agences inscrites",
      valeur: stats.totalAgences,
      icon: Building2,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      titre: "Annonces publiées",
      valeur: stats.totalAnnonces,
      icon: FileText,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      titre: "Contacts générés",
      valeur: stats.totalContacts,
      icon: MessageCircle,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      titre: "Vérifications en attente",
      valeur: stats.pendingVerifications,
      icon: FileCheck,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-bleu-nuit mb-6">
        Tableau de bord administrateur
      </h1>

      {/* Cartes de stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <Card key={card.titre}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.titre}</p>
                  <p className="text-3xl font-bold text-bleu-nuit mt-1">
                    {card.valeur}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Répartition des abonnements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-or" />
            Répartition des abonnements actifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["trial", "starter", "pro", "enterprise"].map((plan) => (
              <div
                key={plan}
                className="text-center p-4 rounded-lg bg-gray-50"
              >
                <p className="text-2xl font-bold text-bleu-nuit">
                  {stats.abonnementsParPlan[plan] || 0}
                </p>
                <p className="text-sm text-gray-500 capitalize mt-1">{plan}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
