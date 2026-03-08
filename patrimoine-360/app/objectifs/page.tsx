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
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-white transition"><ArrowLeft size={18} /></Link>
            <div>
              <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                <Target size={24} className="text-indigo-400" /> Centre d&apos;objectifs
              </h1>
              <p className="text-sm text-gray-500">Définis, suis et priorise tes objectifs patrimoniaux.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setShowForm(true); setEditingId(null); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition">
              <Plus size={16} /> Nouvel objectif
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>

        {/* Summary */}
        {objectives.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
              <div className="text-2xl font-bold text-white">{objectives.length}</div>
              <div className="text-xs text-gray-500">Objectifs</div>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
              <div className="text-2xl font-bold text-indigo-400">{totalCurrent.toLocaleString("fr-FR")}€</div>
              <div className="text-xs text-gray-500">Accumulé</div>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
              <div className="text-2xl font-bold text-gray-300">{totalTarget.toLocaleString("fr-FR")}€</div>
              <div className="text-xs text-gray-500">Cible totale</div>
            </div>
          </motion.div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#111827] border border-white/[0.08] rounded-2xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-serif font-bold text-white">{editingId ? "Modifier" : "Nouvel"} objectif</h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre de l'objectif" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50" />
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50">
                    {categories.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} placeholder="Montant cible (€)" className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50" />
                    <input type="number" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} placeholder="Montant actuel (€)" className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50">
                      <option value="1">Priorité 1 (haute)</option>
                      <option value="2">Priorité 2</option>
                      <option value="3">Priorité 3 (moyenne)</option>
                      <option value="4">Priorité 4</option>
                      <option value="5">Priorité 5 (basse)</option>
                    </select>
                  </div>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optionnel)" rows={2} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50" />
                  <button onClick={handleSave} disabled={!form.title} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition disabled:opacity-40">
                    {editingId ? "Enregistrer" : "Créer l'objectif"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Objectives List */}
        {objectives.length === 0 ? (
          <div className="text-center py-16">
            <Target className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-500">Aucun objectif défini. Commence par en créer un !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedObjectives.map((obj, i) => {
              const cat = categories.find((c) => c.value === obj.category);
              const pct = obj.targetAmount > 0 ? Math.min(100, (obj.currentAmount / obj.targetAmount) * 100) : 0;
              return (
                <motion.div key={obj.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border p-4 transition ${obj.status === "completed" ? "border-green-500/30 bg-green-500/5 opacity-70" : "border-white/[0.08] bg-white/[0.02]"}`}
                >
                  <div className="flex items-start gap-3">
                    <button onClick={() => handleToggleStatus(obj.id)} className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${obj.status === "completed" ? "bg-green-500 border-green-500" : "border-white/[0.2] hover:border-indigo-500"}`}>
                      {obj.status === "completed" && <Check size={12} className="text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{cat?.icon}</span>
                        <h4 className={`font-medium text-sm ${obj.status === "completed" ? "line-through text-gray-500" : "text-white"}`}>{obj.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono">P{obj.priority}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <span>{obj.currentAmount.toLocaleString("fr-FR")}€ / {obj.targetAmount.toLocaleString("fr-FR")}€</span>
                        {obj.targetDate && <span>Échéance : {new Date(obj.targetDate).toLocaleDateString("fr-FR")}</span>}
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                      </div>
                      {obj.notes && <p className="text-xs text-gray-600 mt-2">{obj.notes}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(obj)} className="p-1.5 text-gray-500 hover:text-gray-300 transition"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(obj.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition"><Trash2 size={14} /></button>
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
