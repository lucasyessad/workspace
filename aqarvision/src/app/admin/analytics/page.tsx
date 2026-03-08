"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlatformAnalytics {
  totalAgences: number;
  totalAnnonces: number;
  totalContacts: number;
  pendingVerifications: number;
  abonnementsParPlan: Record<string, number>;
}

/** Page analytics globale de la plateforme (admin) */
export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<PlatformAnalytics | null>(null);
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
    return <p className="text-red-500">Erreur de chargement.</p>;
  }

  const totalAbonnements = Object.values(stats.abonnementsParPlan).reduce(
    (a, b) => a + b,
    0
  );

  const conversionRate =
    totalAbonnements > 0 && stats.totalAgences > 0
      ? ((totalAbonnements / stats.totalAgences) * 100).toFixed(1)
      : "0";

  const revenueEstimate =
    (stats.abonnementsParPlan["starter"] || 0) * 2500 +
    (stats.abonnementsParPlan["pro"] || 0) * 5500;

  return (
    <div>
      <h1 className="text-2xl font-bold text-bleu-nuit mb-6">
        Analytics plateforme
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Taux de conversion</p>
                <p className="text-2xl font-bold text-bleu-nuit">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Revenu estimé/mois</p>
                <p className="text-2xl font-bold text-bleu-nuit">
                  {revenueEstimate.toLocaleString("fr-DZ")} DA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Eye className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Annonces / agence</p>
                <p className="text-2xl font-bold text-bleu-nuit">
                  {stats.totalAgences > 0
                    ? (stats.totalAnnonces / stats.totalAgences).toFixed(1)
                    : "0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-or/10 rounded-lg">
                <MousePointerClick className="h-5 w-5 text-or" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Contacts / agence</p>
                <p className="text-2xl font-bold text-bleu-nuit">
                  {stats.totalAgences > 0
                    ? (stats.totalContacts / stats.totalAgences).toFixed(1)
                    : "0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition des plans */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des abonnements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["trial", "starter", "pro", "enterprise"].map((plan) => {
              const count = stats.abonnementsParPlan[plan] || 0;
              const pct = totalAbonnements > 0 ? (count / totalAbonnements) * 100 : 0;
              return (
                <div key={plan}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-medium">{plan}</span>
                    <span className="text-gray-500">
                      {count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-or rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
