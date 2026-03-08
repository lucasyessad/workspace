"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { authApi, billingApi } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { User, Building2, Mail, Globe, CreditCard, Save, Palette } from "lucide-react";
import { applyBrandTheme, storeBrandSettings } from "@/lib/theme";

interface Profile {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  job_title?: string;
  organization_id: string;
  organization_name: string;
  organization_type: string;
  plan: string;
}

const PLAN_BADGE: Record<string, string> = {
  starter: "bg-gray-100 text-gray-700",
  pro: "bg-blue-100 text-blue-700",
  enterprise: "bg-purple-100 text-purple-700",
};

const ORG_TYPES: Record<string, string> = {
  syndic: "Syndic de copropriété",
  bureau_etudes: "Bureau d'études",
  collectivite: "Collectivité territoriale",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orgName, setOrgName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [timezone, setTimezone] = useState("Europe/Paris");
  const [brandColor, setBrandColor] = useState("#2563eb");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    authApi.me().then((r) => {
      const p = r.data as Profile & { brand_color?: string; logo_url?: string };
      setProfile(p);
      setOrgName(p.organization_name);
      setBrandColor(p.brand_color ?? "#2563eb");
      setLogoUrl(p.logo_url ?? "");
      storeBrandSettings({
        brand_color: p.brand_color ?? "#2563eb",
        organization_name: p.organization_name,
        logo_url: p.logo_url,
      });
      if (p.brand_color) applyBrandTheme(p.brand_color);
    }).finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateOrgProfile({
        name: orgName,
        billing_email: billingEmail,
        timezone,
        brand_color: brandColor,
        logo_url: logoUrl || null,
      });
      storeBrandSettings({ brand_color: brandColor, organization_name: orgName, logo_url: logoUrl || null });
      applyBrandTheme(brandColor);
      addToast("Profil mis à jour", "success");
      const r = await authApi.me();
      setProfile(r.data as Profile);
    } catch {
      addToast("Erreur lors de la mise à jour", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profil & Organisation</h1>
          <p className="text-gray-500 mt-1">Gérez les informations de votre compte</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Chargement...</div>
        ) : profile && (
          <>
            {/* User info card (read-only) */}
            <div className="card p-6 mb-6">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                Votre compte
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Nom</p>
                  <p className="font-medium text-gray-900">
                    {[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Poste</p>
                  <p className="font-medium text-gray-900">{profile.job_title || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Plan</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${PLAN_BADGE[profile.plan] ?? "bg-gray-100 text-gray-700"}`}>
                    <CreditCard size={11} />
                    {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Organisation edit form */}
            <form onSubmit={handleSave} className="card p-6">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 size={16} className="text-gray-400" />
                Organisation
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Type</label>
                  <p className="text-sm font-medium text-gray-700">
                    {ORG_TYPES[profile.organization_type] ?? profile.organization_type}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nom de l&apos;organisation</label>
                  <input
                    type="text"
                    className="input"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Mail size={12} /> Email de facturation
                  </label>
                  <input
                    type="email"
                    className="input"
                    placeholder="facturation@votreorganisation.fr"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Globe size={12} /> Fuseau horaire
                  </label>
                  <select
                    className="input"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="Europe/Berlin">Europe/Berlin (UTC+1)</option>
                    <option value="America/Cayenne">Amérique/Cayenne (UTC-3)</option>
                    <option value="Indian/Reunion">La Réunion (UTC+4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2 flex items-center gap-1">
                    <Palette size={12} /> Couleur de marque (thème de l&apos;interface)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => { setBrandColor(e.target.value); applyBrandTheme(e.target.value); }}
                      className="h-10 w-16 rounded cursor-pointer border border-gray-200"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {["#2563eb","#7c3aed","#059669","#dc2626","#d97706","#0891b2","#be185d","#1e293b"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { setBrandColor(c); applyBrandTheme(c); }}
                          className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                          style={{ backgroundColor: c, borderColor: brandColor === c ? "#111" : "transparent" }}
                          title={c}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{brandColor}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Le thème s&apos;applique immédiatement à toute l&apos;interface.</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">URL du logo (optionnel)</label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://monentreprise.fr/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">Affiché dans la barre latérale à la place de l&apos;icône 🌡️</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button type="submit" className="btn-primary" disabled={saving}>
                  <Save size={15} />
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </AppLayout>
  );
}
