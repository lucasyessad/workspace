"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, User, MapPin, Briefcase, Wallet, TrendingUp, PiggyBank, CreditCard, LogOut, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { UserProfile } from "@/types";

interface ProfileField {
  id: keyof UserProfile;
  label: string;
  type: "number" | "text";
  placeholder: string;
  suffix?: string;
  icon: React.ReactNode;
  group: string;
}

const profileFields: ProfileField[] = [
  { id: "nom", label: "Nom", type: "text", placeholder: "Votre nom", icon: <User size={16} />, group: "Identité" },
  { id: "age", label: "Âge", type: "number", placeholder: "35", icon: <User size={16} />, group: "Identité" },
  { id: "lieu_residence", label: "Lieu de résidence", type: "text", placeholder: "Paris, France", icon: <MapPin size={16} />, group: "Identité" },
  { id: "statut_fiscal", label: "Statut fiscal", type: "text", placeholder: "Célibataire, Marié...", icon: <Briefcase size={16} />, group: "Identité" },
  { id: "revenus_mensuels", label: "Revenus mensuels nets", type: "number", placeholder: "5000", suffix: "€", icon: <Wallet size={16} />, group: "Revenus & Dépenses" },
  { id: "revenus_annuels", label: "Revenus annuels bruts", type: "number", placeholder: "60000", suffix: "€", icon: <Wallet size={16} />, group: "Revenus & Dépenses" },
  { id: "depenses_mensuelles", label: "Dépenses mensuelles", type: "number", placeholder: "3500", suffix: "€", icon: <CreditCard size={16} />, group: "Revenus & Dépenses" },
  { id: "capacite_epargne", label: "Capacité d'épargne mensuelle", type: "number", placeholder: "500", suffix: "€", icon: <PiggyBank size={16} />, group: "Revenus & Dépenses" },
  { id: "epargne_totale", label: "Épargne totale", type: "number", placeholder: "50000", suffix: "€", icon: <PiggyBank size={16} />, group: "Patrimoine" },
  { id: "investissements", label: "Investissements", type: "number", placeholder: "30000", suffix: "€", icon: <TrendingUp size={16} />, group: "Patrimoine" },
  { id: "dettes_totales", label: "Dettes totales", type: "number", placeholder: "15000", suffix: "€", icon: <CreditCard size={16} />, group: "Patrimoine" },
];

const groups = ["Identité", "Revenus & Dépenses", "Patrimoine"];

export default function ProfilPage() {
  const { user, profile, loading, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleChange = (id: keyof UserProfile, value: string | number) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile(formData);
    setSaving(false);
    if (!result.error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="animate-spin w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2">
              <User size={20} className="text-gold-500" />
              <h1 className="text-heading font-serif text-[var(--color-text-primary)]">Mon Profil</h1>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost text-sm text-danger-500 hover:text-danger-400">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="surface-card p-6 mb-6">
            <p className="text-body-sm text-[var(--color-text-tertiary)]">
              Connecté en tant que <span className="text-[var(--color-text-primary)] font-medium">{user.email}</span>
            </p>
            <p className="text-caption text-[var(--color-text-muted)] mt-1">
              Les informations de votre profil sont automatiquement pré-remplies dans les modules concernés.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {groups.map((group) => (
              <div key={group} className="surface-card p-6">
                <h2 className="text-body font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                  {group === "Identité" && <User size={18} className="text-gold-500" />}
                  {group === "Revenus & Dépenses" && <Wallet size={18} className="text-gold-500" />}
                  {group === "Patrimoine" && <TrendingUp size={18} className="text-gold-500" />}
                  {group}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profileFields
                    .filter((f) => f.group === group)
                    .map((field) => (
                      <div key={field.id}>
                        <label className="block text-caption font-medium text-[var(--color-text-secondary)] mb-1.5">
                          {field.label}
                          {field.suffix && <span className="text-[var(--color-text-muted)] ml-1">({field.suffix})</span>}
                        </label>
                        <input
                          type={field.type}
                          value={String(formData[field.id] ?? "")}
                          onChange={(e) =>
                            handleChange(
                              field.id,
                              field.type === "number"
                                ? e.target.value === "" ? "" as unknown as number : Number(e.target.value)
                                : e.target.value
                            )
                          }
                          className="input-premium w-full"
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-end gap-3">
              {saved && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-success-500 text-sm flex items-center gap-1"
                >
                  <CheckCircle size={14} /> Profil sauvegardé
                </motion.span>
              )}
              <button type="submit" disabled={saving} className="btn-primary py-2.5 px-6">
                {saving ? (
                  <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <><Save size={16} /> Enregistrer</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
