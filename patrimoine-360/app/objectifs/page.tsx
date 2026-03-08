"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Target, Trash2, Edit3, Check, X } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

interface Objective {
  id: string;
  title: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: number;
  status: "active" | "paused" | "completed" | "abandoned";
  notes: string;
}

const categories = [
  { value: "residence", label: "Résidence principale", icon: "🏠" },
  { value: "retraite", label: "Retraite", icon: "🏖️" },
  { value: "independance", label: "Indépendance financière", icon: "🎯" },
  { value: "transmission", label: "Transmission", icon: "📜" },
  { value: "expatriation", label: "Expatriation", icon: "✈️" },
  { value: "epargne", label: "Épargne", icon: "💰" },
  { value: "investissement", label: "Investissement", icon: "📈" },
  { value: "autre", label: "Autre", icon: "⭐" },
];

function loadObjectives(): Objective[] {
  try {
    const stored = localStorage.getItem("patrimoine360_objectives");
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveObjectives(objectives: Objective[]) {
  localStorage.setItem("patrimoine360_objectives", JSON.stringify(objectives));
}

export default function ObjectifsPage() {
  const { theme, toggleTheme } = useTheme();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", category: "epargne", targetAmount: "", currentAmount: "", targetDate: "", priority: "3", notes: "",
  });

  useEffect(() => { setObjectives(loadObjectives()); }, []);

  const handleSave = () => {
    const obj: Objective = {
      id: editingId || Date.now().toString(),
      title: form.title,
      category: form.category,
      targetAmount: parseFloat(form.targetAmount) || 0,
      currentAmount: parseFloat(form.currentAmount) || 0,
      targetDate: form.targetDate,
      priority: parseInt(form.priority) || 3,
      status: "active",
      notes: form.notes,
    };

    let updated: Objective[];
    if (editingId) {
      updated = objectives.map((o) => o.id === editingId ? obj : o);
    } else {
      updated = [...objectives, obj];
    }

    setObjectives(updated);
    saveObjectives(updated);
    setShowForm(false);
    setEditingId(null);
    setForm({ title: "", category: "epargne", targetAmount: "", currentAmount: "", targetDate: "", priority: "3", notes: "" });
  };

  const handleEdit = (obj: Objective) => {
    setForm({
      title: obj.title, category: obj.category, targetAmount: String(obj.targetAmount),
      currentAmount: String(obj.currentAmount), targetDate: obj.targetDate, priority: String(obj.priority), notes: obj.notes,
    });
    setEditingId(obj.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const updated = objectives.filter((o) => o.id !== id);
    setObjectives(updated);
    saveObjectives(updated);
  };

  const handleToggleStatus = (id: string) => {
    const updated = objectives.map((o) => {
      if (o.id !== id) return o;
      return { ...o, status: o.status === "completed" ? "active" as const : "completed" as const };
    });
    setObjectives(updated);
    saveObjectives(updated);
  };

  const sortedObjectives = [...objectives].sort((a, b) => a.priority - b.priority);
  const totalTarget = objectives.filter((o) => o.status === "active").reduce((s, o) => s + o.targetAmount, 0);
  const totalCurrent = objectives.filter((o) => o.status === "active").reduce((s, o) => s + o.currentAmount, 0);

  return (
    <div className="min-h-screen px-4 py-8 bg-[var(--color-bg)]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition"><ArrowLeft size={18} /></Link>
            <div>
              <h1 className="text-heading-xl font-serif text-[var(--color-text-primary)] flex items-center gap-2">
                <Target size={24} className="text-gold-500" /> Centre d&apos;objectifs
              </h1>
              <p className="text-body-sm text-[var(--color-text-tertiary)]">Définis, suis et priorise tes objectifs patrimoniaux.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setShowForm(true); setEditingId(null); }} className="btn-primary text-sm">
              <Plus size={16} /> Nouvel objectif
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>

        {objectives.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-4 mb-8">
            <div className="surface-card p-4 text-center">
              <div className="text-2xl font-bold text-[var(--color-text-primary)]">{objectives.length}</div>
              <div className="text-caption text-[var(--color-text-muted)]">Objectifs</div>
            </div>
            <div className="surface-card p-4 text-center">
              <div className="text-2xl font-bold text-gold-500">{totalCurrent.toLocaleString("fr-FR")}€</div>
              <div className="text-caption text-[var(--color-text-muted)]">Accumulé</div>
            </div>
            <div className="surface-card p-4 text-center">
              <div className="text-2xl font-bold text-[var(--color-text-secondary)]">{totalTarget.toLocaleString("fr-FR")}€</div>
              <div className="text-caption text-[var(--color-text-muted)]">Cible totale</div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="surface-elevated p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-heading font-serif text-[var(--color-text-primary)]">{editingId ? "Modifier" : "Nouvel"} objectif</h2>
                  <button onClick={() => setShowForm(false)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre de l'objectif" className="input-premium" />
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-premium">
                    {categories.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} placeholder="Montant cible (€)" className="input-premium" />
                    <input type="number" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} placeholder="Montant actuel (€)" className="input-premium" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className="input-premium" />
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="input-premium">
                      <option value="1">Priorité 1 (haute)</option>
                      <option value="2">Priorité 2</option>
                      <option value="3">Priorité 3 (moyenne)</option>
                      <option value="4">Priorité 4</option>
                      <option value="5">Priorité 5 (basse)</option>
                    </select>
                  </div>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optionnel)" rows={2} className="input-premium" />
                  <button onClick={handleSave} disabled={!form.title} className="w-full btn-primary justify-center py-3 disabled:opacity-40">
                    {editingId ? "Enregistrer" : "Créer l'objectif"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {objectives.length === 0 ? (
          <div className="text-center py-16">
            <Target className="mx-auto text-[var(--color-text-muted)] mb-4" size={48} />
            <p className="text-[var(--color-text-tertiary)]">Aucun objectif défini. Commence par en créer un !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedObjectives.map((obj, i) => {
              const cat = categories.find((c) => c.value === obj.category);
              const pct = obj.targetAmount > 0 ? Math.min(100, (obj.currentAmount / obj.targetAmount) * 100) : 0;
              return (
                <motion.div key={obj.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border p-4 transition ${obj.status === "completed" ? "border-success-500/30 bg-success-500/5 opacity-70" : "surface-card"}`}
                >
                  <div className="flex items-start gap-3">
                    <button onClick={() => handleToggleStatus(obj.id)} className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${obj.status === "completed" ? "bg-success-500 border-success-500" : "border-[var(--color-border)] hover:border-gold-500"}`}>
                      {obj.status === "completed" && <Check size={12} className="text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{cat?.icon}</span>
                        <h4 className={`font-medium text-body-sm ${obj.status === "completed" ? "line-through text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)]"}`}>{obj.title}</h4>
                        <span className="text-overline px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-500">P{obj.priority}</span>
                      </div>
                      <div className="flex items-center gap-4 text-caption text-[var(--color-text-muted)] mb-2">
                        <span>{obj.currentAmount.toLocaleString("fr-FR")}€ / {obj.targetAmount.toLocaleString("fr-FR")}€</span>
                        {obj.targetDate && <span>Échéance : {new Date(obj.targetDate).toLocaleDateString("fr-FR")}</span>}
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--color-surface-active)] overflow-hidden">
                        <motion.div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-500" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                      </div>
                      {obj.notes && <p className="text-caption text-[var(--color-text-muted)] mt-2">{obj.notes}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(obj)} className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(obj.id)} className="p-1.5 text-[var(--color-text-muted)] hover:text-danger-500 transition"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
