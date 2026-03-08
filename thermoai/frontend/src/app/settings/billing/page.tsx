"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { billingApi } from "@/lib/api";
import { Check, Zap, Crown, Building2 } from "lucide-react";

interface Plan {
  id: string;
  label: string;
  monthly_eur: number;
  limits: { audits_per_month: number; api_keys: number; team_members: number };
  features: string[];
}

interface Subscription {
  plan: string;
  plan_label: string;
  monthly_eur: number;
  limits: { audits_per_month: number; api_keys: number; team_members: number };
  usage: { audits_this_month: number; audits_limit: number; audits_remaining: number };
  features: string[];
}

const PLAN_ICONS: Record<string, React.ElementType> = {
  starter: Zap,
  pro: Crown,
  enterprise: Building2,
};

const PLAN_COLORS: Record<string, string> = {
  starter: "border-gray-200",
  pro: "border-brand-400 ring-2 ring-brand-200",
  enterprise: "border-purple-400 ring-2 ring-purple-100",
};

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([billingApi.getPlans(), billingApi.getSubscription()])
      .then(([p, s]) => {
        setPlans(p.data);
        setSubscription(s.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade(planId: string) {
    setUpgrading(planId);
    try {
      await billingApi.upgrade(planId);
      const s = await billingApi.getSubscription();
      setSubscription(s.data);
    } finally {
      setUpgrading(null);
    }
  }

  const usagePercent =
    subscription && subscription.usage.audits_limit !== -1
      ? Math.min(
          100,
          (subscription.usage.audits_this_month / subscription.usage.audits_limit) * 100
        )
      : null;

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Abonnement</h1>
          <p className="text-gray-500 mt-1">Gérez votre plan ThermoPilot AI</p>
        </div>

        {/* Current usage */}
        {subscription && (
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Plan actuel</p>
                <p className="text-xl font-bold text-gray-900">{subscription.plan_label}</p>
              </div>
              <span className="text-2xl font-bold text-brand-600">
                {subscription.monthly_eur} €
                <span className="text-sm font-normal text-gray-500">/mois</span>
              </span>
            </div>

            {usagePercent !== null && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Audits ce mois</span>
                  <span className="font-medium">
                    {subscription.usage.audits_this_month} / {subscription.usage.audits_limit}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usagePercent >= 90 ? "bg-red-500" : "bg-brand-500"
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                {usagePercent >= 90 && (
                  <p className="text-xs text-red-600 mt-1">
                    Limite bientôt atteinte — passez au plan Pro pour des audits illimités.
                  </p>
                )}
              </div>
            )}

            {subscription.usage.audits_limit === -1 && (
              <p className="text-sm text-green-600 mt-2">Audits illimités</p>
            )}
          </div>
        )}

        {/* Plans grid */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Chargement...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = PLAN_ICONS[plan.id] ?? Zap;
              const isCurrent = subscription?.plan === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`card p-6 flex flex-col ${PLAN_COLORS[plan.id] ?? "border-gray-200"}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                      <Icon size={20} className="text-brand-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{plan.label}</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {plan.monthly_eur} €
                        <span className="text-sm font-normal text-gray-400">/mois</span>
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="text-xs text-gray-400 mb-4 space-y-1">
                    <p>
                      Audits/mois :{" "}
                      {plan.limits.audits_per_month === -1 ? "∞" : plan.limits.audits_per_month}
                    </p>
                    <p>
                      Clés API :{" "}
                      {plan.limits.api_keys === 0
                        ? "—"
                        : plan.limits.api_keys === -1
                        ? "∞"
                        : plan.limits.api_keys}
                    </p>
                    <p>
                      Membres :{" "}
                      {plan.limits.team_members === -1 ? "∞" : plan.limits.team_members}
                    </p>
                  </div>

                  {isCurrent ? (
                    <span className="text-center text-sm text-brand-600 font-semibold py-2 bg-brand-50 rounded-lg">
                      Plan actuel
                    </span>
                  ) : (
                    <button
                      className="btn-primary w-full justify-center"
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading === plan.id}
                    >
                      {upgrading === plan.id ? "Mise à jour..." : "Choisir ce plan"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-6 text-center">
          Les changements de plan sont pris en compte immédiatement.
          Aucune carte bancaire n&apos;est requise en mode démonstration.
        </p>
      </div>
    </AppLayout>
  );
}
