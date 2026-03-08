"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus, X, Clock, Check } from "lucide-react";

interface Reminder {
  id: string;
  title: string;
  message: string;
  type: string;
  frequency: string;
  nextTrigger: string;
  isActive: boolean;
}

const reminderTypes = [
  { value: "budget_review", label: "Révision budget", icon: "💰" },
  { value: "objective_check", label: "Suivi objectifs", icon: "🎯" },
  { value: "rebalance", label: "Rééquilibrage", icon: "⚖️" },
  { value: "debt_payment", label: "Remboursement dette", icon: "💳" },
  { value: "emergency_fund", label: "Fonds d'urgence", icon: "🛡️" },
  { value: "custom", label: "Personnalisé", icon: "⭐" },
];

const frequencies = [
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuel" },
  { value: "quarterly", label: "Trimestriel" },
  { value: "yearly", label: "Annuel" },
  { value: "once", label: "Une seule fois" },
];

function loadReminders(): Reminder[] {
  try {
    const stored = localStorage.getItem("patrimoine360_reminders");
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveReminders(reminders: Reminder[]) {
  localStorage.setItem("patrimoine360_reminders", JSON.stringify(reminders));
}

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "budget_review", frequency: "monthly", nextTrigger: "" });

  useEffect(() => { setReminders(loadReminders()); }, []);

  const dueReminders = reminders.filter((r) => r.isActive && new Date(r.nextTrigger) <= new Date());

  const handleCreate = () => {
    const reminder: Reminder = {
      id: Date.now().toString(),
      ...form,
      nextTrigger: form.nextTrigger || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isActive: true,
    };
    const updated = [...reminders, reminder];
    setReminders(updated);
    saveReminders(updated);
    setShowForm(false);
    setForm({ title: "", message: "", type: "budget_review", frequency: "monthly", nextTrigger: "" });
  };

  const handleDismiss = (id: string) => {
    const updated = reminders.map((r) => {
      if (r.id !== id) return r;
      const next = new Date(r.nextTrigger);
      if (r.frequency === "weekly") next.setDate(next.getDate() + 7);
      else if (r.frequency === "monthly") next.setMonth(next.getMonth() + 1);
      else if (r.frequency === "quarterly") next.setMonth(next.getMonth() + 3);
      else if (r.frequency === "yearly") next.setFullYear(next.getFullYear() + 1);
      else return { ...r, isActive: false };
      return { ...r, nextTrigger: next.toISOString().split("T")[0] };
    });
    setReminders(updated);
    saveReminders(updated);
  };

  const handleDelete = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveReminders(updated);
  };

  return (
    <>
      <button onClick={() => setShowPanel(!showPanel)} className="relative p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition">
        <Bell size={18} className="text-[var(--color-text-tertiary)]" />
        {dueReminders.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger-500 text-white text-[10px] flex items-center justify-center font-bold">
            {dueReminders.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showPanel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm p-4 pt-16">
            <motion.div initial={{ x: 20 }} animate={{ x: 0 }} exit={{ x: 20 }}
              className="surface-elevated p-5 w-full max-w-sm max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-heading font-serif text-[var(--color-text-primary)] flex items-center gap-2">
                  <Bell size={18} className="text-gold-500" /> Rappels
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowForm(true)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-tertiary)]">
                    <Plus size={16} />
                  </button>
                  <button onClick={() => setShowPanel(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-tertiary)]">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {dueReminders.length > 0 && (
                <div className="mb-4">
                  <p className="text-caption text-danger-500 font-medium mb-2">En retard</p>
                  {dueReminders.map((r) => {
                    const typeInfo = reminderTypes.find((t) => t.value === r.type);
                    return (
                      <div key={r.id} className="flex items-start gap-2 p-3 rounded-xl border border-danger-500/20 bg-danger-500/5 mb-2">
                        <span>{typeInfo?.icon}</span>
                        <div className="flex-1">
                          <p className="text-body-sm text-[var(--color-text-primary)] font-medium">{r.title}</p>
                          {r.message && <p className="text-caption text-[var(--color-text-muted)]">{r.message}</p>}
                        </div>
                        <button onClick={() => handleDismiss(r.id)} className="p-1 text-success-500 hover:text-success-400">
                          <Check size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-2">
                {reminders.filter((r) => r.isActive && !dueReminders.includes(r)).map((r) => {
                  const typeInfo = reminderTypes.find((t) => t.value === r.type);
                  return (
                    <div key={r.id} className="flex items-start gap-2 p-3 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)]">
                      <span>{typeInfo?.icon}</span>
                      <div className="flex-1">
                        <p className="text-body-sm text-[var(--color-text-secondary)]">{r.title}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                          <Clock size={10} /> {new Date(r.nextTrigger).toLocaleDateString("fr-FR")} — {frequencies.find((f) => f.value === r.frequency)?.label}
                        </p>
                      </div>
                      <button onClick={() => handleDelete(r.id)} className="p-1 text-[var(--color-text-muted)] hover:text-danger-500"><X size={12} /></button>
                    </div>
                  );
                })}
              </div>

              {reminders.length === 0 && !showForm && (
                <p className="text-caption text-[var(--color-text-muted)] text-center py-4">Aucun rappel configuré.</p>
              )}

              {showForm && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 rounded-xl border border-gold-500/20 bg-gold-500/5 space-y-3">
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre du rappel"
                    className="input-premium" />
                  <input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Message (optionnel)"
                    className="input-premium" />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="input-premium text-sm">
                      {reminderTypes.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                    </select>
                    <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                      className="input-premium text-sm">
                      {frequencies.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <input type="date" value={form.nextTrigger} onChange={(e) => setForm({ ...form, nextTrigger: e.target.value })}
                    className="input-premium" />
                  <div className="flex gap-2">
                    <button onClick={handleCreate} disabled={!form.title} className="flex-1 btn-primary justify-center py-2 disabled:opacity-40">Créer</button>
                    <button onClick={() => setShowForm(false)} className="btn-secondary py-2">Annuler</button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
