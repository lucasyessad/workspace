"use client";
import { useMemo } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area,
} from "recharts";
import { FormData, CalculationResult } from "@/types";
import { motion } from "framer-motion";

const COLORS = ["#818CF8", "#6366F1", "#4ADE80", "#FACC15", "#EF4444", "#A855F7", "#38BDF8", "#FB923C"];

interface ChartsProps {
  moduleId: number;
  formData: FormData;
  calculations: CalculationResult[] | null;
}

function num(v: string | number | undefined): number {
  if (v === undefined || v === "") return 0;
  return typeof v === "number" ? v : parseFloat(v) || 0;
}

function Module1Charts({ formData, calculations }: { formData: FormData; calculations: CalculationResult[] | null }) {
  const data = useMemo(() => {
    const epargne = num(formData.epargne);
    const investissements = num(formData.investissements);
    const dettes = num(formData.dettes);
    return [
      { name: "Épargne", value: epargne },
      { name: "Investissements", value: investissements },
      { name: "Dettes", value: dettes },
    ].filter((d) => d.value > 0);
  }, [formData]);

  const barData = useMemo(() => [
    { name: "Revenus", montant: num(formData.revenus) },
    { name: "Dépenses", montant: num(formData.depenses) },
    { name: "Épargne", montant: num(formData.revenus) - num(formData.depenses) },
  ], [formData]);

  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Répartition du patrimoine</h4>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#E5E7EB" }} formatter={(v: unknown) => `${Number(v).toLocaleString("fr-FR")}€`} />
            <Legend wrapperStyle={{ color: "#9CA3AF", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Cash-flow mensuel</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#E5E7EB" }} formatter={(v: unknown) => `${Number(v).toLocaleString("fr-FR")}€`} />
            <Bar dataKey="montant" radius={[6, 6, 0, 0]}>
              {barData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Module2Charts({ formData }: { formData: FormData }) {
  const data = useMemo(() => {
    const age = num(formData.age);
    const epargne = num(formData.epargne_retraite);
    const capacite = num(formData.capacite_epargne);
    const ageRetraite = num(formData.age_retraite) || 65;
    const niveauVie = num(formData.niveau_vie);
    const objectif = niveauVie * 12 * 25;
    const r = 0.05 / 12;
    const points: { age: number; portefeuille: number; objectif: number }[] = [];

    for (let a = age; a <= ageRetraite; a++) {
      const mois = (a - age) * 12;
      const proj = mois > 0
        ? epargne * Math.pow(1 + r, mois) + capacite * ((Math.pow(1 + r, mois) - 1) / r)
        : epargne;
      points.push({ age: a, portefeuille: Math.round(proj), objectif });
    }
    return points;
  }, [formData]);

  if (data.length <= 1) return null;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <h4 className="text-sm font-medium text-gray-300 mb-3">Projection retraite</h4>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="age" stroke="#6B7280" fontSize={11} tickFormatter={(v) => `${v} ans`} />
          <YAxis stroke="#6B7280" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
          <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#E5E7EB" }} formatter={(v: unknown) => `${Number(v).toLocaleString("fr-FR")}€`} />
          <Area type="monotone" dataKey="portefeuille" stroke="#818CF8" fill="rgba(129,140,248,0.15)" strokeWidth={2} name="Portefeuille" />
          <Area type="monotone" dataKey="objectif" stroke="#EF4444" fill="none" strokeWidth={1.5} strokeDasharray="5 5" name="Objectif" />
          <Legend wrapperStyle={{ color: "#9CA3AF", fontSize: 12 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Module5Charts({ formData }: { formData: FormData }) {
  const data = useMemo(() => {
    const detteStr = String(formData.dettes_detail || "");
    const lines = detteStr.split("\n").filter((l) => l.trim());
    const dettes: { nom: string; solde: number; taux: number }[] = [];
    for (const line of lines) {
      const nums = line.match(/[\d]+[.,]?[\d]*/g);
      if (nums && nums.length >= 2) {
        dettes.push({
          nom: line.split(":")[0]?.trim() || `Dette ${dettes.length + 1}`,
          solde: parseFloat(nums[0].replace(",", ".")),
          taux: parseFloat(nums[1].replace(",", ".")),
        });
      }
    }
    return dettes;
  }, [formData]);

  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <h4 className="text-sm font-medium text-gray-300 mb-3">Répartition des dettes</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis type="number" stroke="#6B7280" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
          <YAxis dataKey="nom" type="category" stroke="#6B7280" fontSize={11} width={100} />
          <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#E5E7EB" }} formatter={(v: unknown) => `${Number(v).toLocaleString("fr-FR")}€`} />
          <Bar dataKey="solde" radius={[0, 6, 6, 0]} name="Solde">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Module10Charts({ formData }: { formData: FormData }) {
  const data = useMemo(() => {
    const prix = num(formData.prix_bien);
    const loyer = num(formData.loyer_mensuel);
    const apport = num(formData.apport);
    if (prix <= 0) return [];
    const emprunt = prix - apport;
    const tm = 0.035 / 12;
    const n = 240;
    const mensualite = emprunt > 0 ? emprunt * (tm * Math.pow(1 + tm, n)) / (Math.pow(1 + tm, n) - 1) : 0;
    const charges = loyer * 0.25;
    const cashFlow = loyer - mensualite - charges;
    return [
      { name: "Loyer", montant: Math.round(loyer) },
      { name: "Crédit", montant: Math.round(mensualite) },
      { name: "Charges", montant: Math.round(charges) },
      { name: "Cash-flow", montant: Math.round(cashFlow) },
    ];
  }, [formData]);

  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <h4 className="text-sm font-medium text-gray-300 mb-3">Décomposition cash-flow immobilier</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
          <YAxis stroke="#6B7280" fontSize={11} />
          <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#E5E7EB" }} formatter={(v: unknown) => `${Number(v).toLocaleString("fr-FR")}€`} />
          <Bar dataKey="montant" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Module11Charts({ formData }: { formData: FormData }) {
  const data = useMemo(() => {
    const revenu = num(formData.revenu_mensuel);
    if (revenu <= 0) return [];
    return [
      { name: "Besoins (50%)", value: Math.round(revenu * 0.5) },
      { name: "Envies (30%)", value: Math.round(revenu * 0.3) },
      { name: "Épargne (20%)", value: Math.round(revenu * 0.2) },
    ];
  }, [formData]);

  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <h4 className="text-sm font-medium text-gray-300 mb-3">Répartition 50/30/20</h4>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
            <Cell fill="#818CF8" />
            <Cell fill="#FACC15" />
            <Cell fill="#4ADE80" />
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#E5E7EB" }} formatter={(v: unknown) => `${Number(v).toLocaleString("fr-FR")}€`} />
          <Legend wrapperStyle={{ color: "#9CA3AF", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Charts({ moduleId, formData, calculations }: ChartsProps) {
  const chartMap: Record<number, React.ReactNode> = {
    1: <Module1Charts formData={formData} calculations={calculations} />,
    2: <Module2Charts formData={formData} />,
    5: <Module5Charts formData={formData} />,
    10: <Module10Charts formData={formData} />,
    11: <Module11Charts formData={formData} />,
  };

  const chart = chartMap[moduleId];
  if (!chart) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <h3 className="text-lg font-serif font-semibold text-white flex items-center gap-2 mb-4">
        <span className="w-1 h-5 bg-cyan-500 rounded-full" />
        Visualisations
      </h3>
      {chart}
    </motion.div>
  );
}
