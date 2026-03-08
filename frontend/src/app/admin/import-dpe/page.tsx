"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Upload, Hash, CheckCircle2, AlertTriangle, Search,
  FileText, X, ArrowRight, ExternalLink, Info, Shield,
  Download, RefreshCw, Loader2,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { type SoftwareConfig } from "../logiciels-agrees/page";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface DpeImportResult {
  source: "xml" | "ademe_api";
  numeroDpe: string;
  adresse: string;
  etiquetteDpe: string;
  etiquetteGes: string;
  consoEp: number | null;
  emissionGes: number | null;
  dateEtablissement: string;
  diagnostiqueur: string | null;
  methodeDpe: string | null;
  software: string | null;
  rawData: Record<string, unknown>;
}

interface AdemeRecord {
  numero_dpe: string;
  adresse_ban: string;
  etiquette_dpe: string;
  etiquette_ges?: string;
  conso_ep_energie?: number;
  emission_ges?: number;
  date_etablissement_dpe: string;
  nom_methode_dpe?: string;
}

// ─── DPE Colors ────────────────────────────────────────────────────────────────

const DPE_COLORS: Record<string, string> = {
  A: "#00a84f", B: "#52b748", C: "#c8d200", D: "#f7e400", E: "#f0a500", F: "#e8500a", G: "#cc0000",
};

// ─── ADEME API ─────────────────────────────────────────────────────────────────

async function fetchDpeByNumber(numeroDpe: string): Promise<AdemeRecord | null> {
  try {
    const url = `https://data.ademe.fr/data-fair/api/v1/datasets/dpe-v2-logements-existants/lines?q=${encodeURIComponent(numeroDpe)}&size=1&select=numero_dpe,adresse_ban,etiquette_dpe,etiquette_ges,conso_ep_energie,emission_ges,date_etablissement_dpe,nom_methode_dpe`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return json.results?.[0] ?? null;
  } catch { return null; }
}

async function searchDpeByAddress(address: string): Promise<AdemeRecord[]> {
  try {
    const url = `https://data.ademe.fr/data-fair/api/v1/datasets/dpe-v2-logements-existants/lines?q=${encodeURIComponent(address)}&size=8&select=numero_dpe,adresse_ban,etiquette_dpe,etiquette_ges,conso_ep_energie,emission_ges,date_etablissement_dpe,nom_methode_dpe`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return json.results ?? [];
  } catch { return []; }
}

// ─── Parse XML DPE (format ADEME standard) ────────────────────────────────────

function parseXmlDpe(xmlContent: string): Partial<DpeImportResult> | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, "application/xml");
    const err = doc.querySelector("parsererror");
    if (err) return null;

    function getText(tag: string): string {
      return doc.querySelector(tag)?.textContent?.trim() ?? "";
    }
    function getNum(tag: string): number | null {
      const v = getText(tag);
      const n = parseFloat(v);
      return isNaN(n) ? null : n;
    }

    // Tentative de lecture des champs communs aux formats XML ADEME/3CL
    const numeroDpe = getText("numero_dpe") || getText("NumeroDPE") || getText("Reference_DPE") || "";
    const etiquette = getText("etiquette_dpe") || getText("Etiquette_DPE") || getText("ClasseEnergie") || "";
    const etiquetteGes = getText("etiquette_ges") || getText("Etiquette_GES") || getText("ClasseGES") || "";
    const adresse = getText("adresse_ban") || getText("Adresse") || getText("adresse_complete") || "";
    const date = getText("date_etablissement_dpe") || getText("DateEtablissement") || getText("Date_DPE") || "";
    const conso = getNum("conso_ep_energie") || getNum("Conso_EP") || getNum("ConsommationEnergie");
    const ges = getNum("emission_ges") || getNum("Emission_GES") || getNum("EmissionGES");
    const diag = getText("diagnostiqueur") || getText("Diagnostiqueur") || getText("NomDiagnostiqueur") || null;
    const methode = getText("nom_methode_dpe") || getText("Methode") || null;

    return { numeroDpe, etiquetteDpe: etiquette, etiquetteGes, adresse, dateEtablissement: date, consoEp: conso, emissionGes: ges, diagnostiqueur: diag, methodeDpe: methode, source: "xml" };
  } catch { return null; }
}

// ─── Saved imports (localStorage) ─────────────────────────────────────────────

const LS_IMPORTS = "dpe_imports_v1";
function loadImports(): DpeImportResult[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_IMPORTS) ?? "[]"); } catch { return []; }
}
function saveImports(list: DpeImportResult[]) {
  localStorage.setItem(LS_IMPORTS, JSON.stringify(list));
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ImportDpePage() {
  // Lire ?mode= depuis l'URL
  const [initialMode, setInitialMode] = useState<"xml" | "number">("xml");
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("mode") === "number") setInitialMode("number");
  }, []);

  const [activeMode, setActiveMode] = useState<"xml" | "number">(initialMode);
  useEffect(() => setActiveMode(initialMode), [initialMode]);

  // Config logiciel agréé
  const [swConfig, setSwConfig] = useState<SoftwareConfig | null>(null);
  useEffect(() => {
    try { const c = localStorage.getItem("software_config_v1"); if (c) setSwConfig(JSON.parse(c)); } catch { /* ignore */ }
  }, []);

  // XML import state
  const fileRef = useRef<HTMLInputElement>(null);
  const [xmlFile, setXmlFile]       = useState<File | null>(null);
  const [xmlParsed, setXmlParsed]   = useState<Partial<DpeImportResult> | null>(null);
  const [xmlError, setXmlError]     = useState<string | null>(null);
  const [xmlLoading, setXmlLoading] = useState(false);
  const [dragOver, setDragOver]     = useState(false);

  // Number/address search state
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchMode, setSearchMode]       = useState<"number" | "address">("number");
  const [searchResults, setSearchResults] = useState<AdemeRecord[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDone, setSearchDone]       = useState(false);
  const [selectedAdeme, setSelectedAdeme] = useState<AdemeRecord | null>(null);

  // Imports saved
  const [imports, setImports]       = useState<DpeImportResult[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => { setImports(loadImports()); }, []);

  // ── XML handling ──

  function handleFile(file: File) {
    if (!file.name.endsWith(".xml")) { setXmlError("Le fichier doit être au format XML (.xml)."); return; }
    setXmlFile(file);
    setXmlError(null);
    setXmlLoading(true);
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      const parsed = parseXmlDpe(content);
      if (!parsed) { setXmlError("Le fichier XML n'est pas reconnu. Vérifiez qu'il s'agit bien d'un export DPE ADEME."); }
      else setXmlParsed(parsed);
      setXmlLoading(false);
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function saveXmlImport() {
    if (!xmlParsed) return;
    const record: DpeImportResult = {
      source: "xml",
      numeroDpe: xmlParsed.numeroDpe ?? "–",
      adresse: xmlParsed.adresse ?? "–",
      etiquetteDpe: xmlParsed.etiquetteDpe ?? "?",
      etiquetteGes: xmlParsed.etiquetteGes ?? "?",
      consoEp: xmlParsed.consoEp ?? null,
      emissionGes: xmlParsed.emissionGes ?? null,
      dateEtablissement: xmlParsed.dateEtablissement ?? "",
      diagnostiqueur: xmlParsed.diagnostiqueur ?? null,
      methodeDpe: xmlParsed.methodeDpe ?? null,
      software: swConfig?.selectedSoftware ?? null,
      rawData: {},
    };
    const updated = [record, ...imports.slice(0, 49)];
    saveImports(updated); setImports(updated);
    setImportSuccess(true); setTimeout(() => setImportSuccess(false), 3000);
  }

  // ── ADEME search ──

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearchLoading(true); setSearchDone(false); setSelectedAdeme(null);
    let results: AdemeRecord[] = [];
    if (searchMode === "number") {
      const r = await fetchDpeByNumber(searchQuery.trim());
      results = r ? [r] : [];
    } else {
      results = await searchDpeByAddress(searchQuery.trim());
    }
    setSearchResults(results); setSearchLoading(false); setSearchDone(true);
  }

  function saveAdemeImport(r: AdemeRecord) {
    const record: DpeImportResult = {
      source: "ademe_api",
      numeroDpe: r.numero_dpe,
      adresse: r.adresse_ban,
      etiquetteDpe: r.etiquette_dpe,
      etiquetteGes: r.etiquette_ges ?? "?",
      consoEp: r.conso_ep_energie ?? null,
      emissionGes: r.emission_ges ?? null,
      dateEtablissement: r.date_etablissement_dpe,
      diagnostiqueur: null,
      methodeDpe: r.nom_methode_dpe ?? null,
      software: swConfig?.selectedSoftware ?? null,
      rawData: r as unknown as Record<string, unknown>,
    };
    const updated = [record, ...imports.filter(i => i.numeroDpe !== r.numero_dpe).slice(0, 49)];
    saveImports(updated); setImports(updated); setSelectedAdeme(r);
    setImportSuccess(true); setTimeout(() => setImportSuccess(false), 3000);
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={15} style={{ color: `var(--brand-500)` }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `var(--brand-500)` }}>Administration</p>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Import DPE officiel</h1>
            <p className="text-sm text-gray-500">
              Importez un DPE officiel depuis {swConfig?.selectedSoftware ? <strong>{swConfig.selectedSoftware.toUpperCase()}</strong> : "votre logiciel agréé"} ou retrouvez-le dans la base ADEME.
            </p>
          </div>
          <Link href="/admin/logiciels-agrees"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex-shrink-0">
            <Shield size={12} /> Logiciel agréé
          </Link>
        </div>

        {!swConfig?.selectedSoftware && (
          <div className="flex items-start gap-3 p-4 rounded-md mb-6 text-sm" style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
            <AlertTriangle size={14} style={{ color: "#d97706", flexShrink: 0 }} className="mt-0.5" />
            <p className="text-xs text-gray-700">
              Aucun logiciel agréé configuré.{" "}
              <Link href="/admin/logiciels-agrees" className="underline font-semibold" style={{ color: "#d97706" }}>Configurez votre logiciel partenaire →</Link>
            </p>
          </div>
        )}

        {/* ── Mode selector ───────────────────────────────────────── */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveMode("xml")}
            className="flex items-center gap-2 px-4 py-2.5 rounded text-sm font-semibold border-2 transition-all"
            style={{ borderColor: activeMode === "xml" ? `var(--brand-500)` : "#e0e0e0", backgroundColor: activeMode === "xml" ? `var(--brand-50)` : "#fff", color: activeMode === "xml" ? `var(--brand-500)` : "#555" }}>
            <Upload size={15} />Import XML
          </button>
          <button onClick={() => setActiveMode("number")}
            className="flex items-center gap-2 px-4 py-2.5 rounded text-sm font-semibold border-2 transition-all"
            style={{ borderColor: activeMode === "number" ? "#000091" : "#e0e0e0", backgroundColor: activeMode === "number" ? "#e8eeff" : "#fff", color: activeMode === "number" ? "#000091" : "#555" }}>
            <Search size={15} />Base ADEME
          </button>
        </div>

        {/* ══ Mode XML ══════════════════════════════════════════════ */}
        {activeMode === "xml" && (
          <div className="space-y-5">
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition-all"
              style={{
                borderColor: dragOver ? `var(--brand-500)` : xmlFile ? `var(--brand-500)` : "#d1d5db",
                backgroundColor: dragOver ? `var(--brand-50)` : xmlFile ? "#f0faf4" : "#fafafa",
              }}>
              <input ref={fileRef} type="file" accept=".xml" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              {xmlLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={32} className="animate-spin text-gray-400" />
                  <p className="text-sm text-gray-500">Analyse du fichier XML…</p>
                </div>
              ) : xmlFile ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText size={32} style={{ color: `var(--brand-500)` }} />
                  <p className="font-semibold text-gray-900 text-sm">{xmlFile.name}</p>
                  <p className="text-xs text-gray-400">{(xmlFile.size / 1024).toFixed(1)} Ko · Cliquez pour changer</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload size={32} className="text-gray-300" />
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">Déposez votre fichier XML DPE ici</p>
                    <p className="text-xs text-gray-400 mt-1">ou cliquez pour parcourir · Format XML ADEME standard</p>
                  </div>
                </div>
              )}
            </div>

            {xmlError && (
              <div className="flex items-center gap-2 p-3 rounded text-xs" style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5" }}>
                <AlertTriangle size={13} style={{ color: "#dc2626" }} />
                <span className="text-red-700">{xmlError}</span>
              </div>
            )}

            {/* Parsed result */}
            {xmlParsed && !xmlError && (
              <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} style={{ color: `var(--brand-500)` }} />
                    Fichier XML reconnu
                  </p>
                  <button onClick={() => { setXmlFile(null); setXmlParsed(null); setXmlError(null); }}
                    className="text-gray-300 hover:text-gray-500 transition-colors"><X size={16} /></button>
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { l: "Numéro DPE", v: xmlParsed.numeroDpe || "–" },
                    { l: "Adresse", v: xmlParsed.adresse || "–" },
                    { l: "Date DPE", v: xmlParsed.dateEtablissement ? new Date(xmlParsed.dateEtablissement).toLocaleDateString("fr-FR") : "–" },
                    { l: "Méthode", v: xmlParsed.methodeDpe || "3CL-DPE 2021" },
                    { l: "Diagnostiqueur", v: xmlParsed.diagnostiqueur || "–" },
                    { l: "Conso. EP", v: xmlParsed.consoEp ? `${xmlParsed.consoEp} kWh/m²/an` : "–" },
                  ].map(f => (
                    <div key={f.l}>
                      <p className="text-xs text-gray-400 mb-0.5">{f.l}</p>
                      <p className="text-sm font-semibold text-gray-700 truncate">{f.v}</p>
                    </div>
                  ))}
                </div>
                {/* DPE badge */}
                {xmlParsed.etiquetteDpe && xmlParsed.etiquetteDpe !== "?" && (
                  <div className="px-5 pb-5 flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-md flex items-center justify-center text-2xl font-bold text-white"
                        style={{ backgroundColor: DPE_COLORS[xmlParsed.etiquetteDpe] ?? "#999" }}>
                        {xmlParsed.etiquetteDpe}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Étiquette DPE</p>
                        <p className="font-bold text-gray-900">Classe {xmlParsed.etiquetteDpe}</p>
                      </div>
                    </div>
                    {xmlParsed.etiquetteGes && xmlParsed.etiquetteGes !== "?" && (
                      <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
                        <div className="w-14 h-14 rounded-md flex items-center justify-center text-2xl font-bold text-white"
                          style={{ backgroundColor: DPE_COLORS[xmlParsed.etiquetteGes] ?? "#999" }}>
                          {xmlParsed.etiquetteGes}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Étiquette GES</p>
                          <p className="font-bold text-gray-900">Classe {xmlParsed.etiquetteGes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="px-5 pb-5">
                  <button onClick={saveXmlImport}
                    className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-bold text-white transition-colors"
                    style={{ backgroundColor: importSuccess ? "#16a34a" : `var(--brand-500)` }}
                    onMouseEnter={e => { if (!importSuccess) (e.currentTarget as HTMLElement).style.backgroundColor = `var(--brand-600)`; }}
                    onMouseLeave={e => { if (!importSuccess) (e.currentTarget as HTMLElement).style.backgroundColor = `var(--brand-500)`; }}>
                    {importSuccess ? <CheckCircle2 size={14} /> : <Download size={14} />}
                    {importSuccess ? "DPE importé !" : "Importer ce DPE dans ThermoPilot AI"}
                  </button>
                </div>
              </div>
            )}

            {/* Format hint */}
            <div className="flex items-start gap-3 p-4 rounded text-xs" style={{ backgroundColor: "#e8eeff", border: "1px solid #c5d0f5" }}>
              <Info size={13} style={{ color: "#000091", flexShrink: 0 }} className="mt-0.5" />
              <div className="text-gray-700">
                <p className="font-semibold mb-1">Format XML attendu</p>
                <p>Le fichier XML doit être exporté depuis un logiciel agréé (PLEIADES, CLIMAWIN, DPEWIN, etc.) au format standard ADEME. Il contient les champs <code className="bg-gray-100 px-1 rounded">numero_dpe</code>, <code className="bg-gray-100 px-1 rounded">etiquette_dpe</code>, <code className="bg-gray-100 px-1 rounded">conso_ep_energie</code>, etc.</p>
              </div>
            </div>
          </div>
        )}

        {/* ══ Mode ADEME ════════════════════════════════════════════ */}
        {activeMode === "number" && (
          <div className="space-y-5">
            {/* Search mode toggle */}
            <div className="flex gap-2">
              <button onClick={() => setSearchMode("number")}
                className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold border transition-all"
                style={{ borderColor: searchMode === "number" ? "#000091" : "#e0e0e0", backgroundColor: searchMode === "number" ? "#e8eeff" : "#fff", color: searchMode === "number" ? "#000091" : "#666" }}>
                <Hash size={12} />Par numéro DPE
              </button>
              <button onClick={() => setSearchMode("address")}
                className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold border transition-all"
                style={{ borderColor: searchMode === "address" ? "#000091" : "#e0e0e0", backgroundColor: searchMode === "address" ? "#e8eeff" : "#fff", color: searchMode === "address" ? "#000091" : "#666" }}>
                <Search size={12} />Par adresse
              </button>
            </div>

            {/* Search input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={searchMode === "number" ? "Ex : 1234567890123 (13 chiffres)" : "Ex : 12 rue de la Paix, Paris 75001"}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 bg-white"
              />
              <button onClick={handleSearch} disabled={searchLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded text-sm font-bold text-white disabled:opacity-50 transition-colors"
                style={{ backgroundColor: "#000091" }}>
                {searchLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                Rechercher
              </button>
            </div>

            {/* Results */}
            {searchDone && (
              <div>
                {searchResults.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 rounded border border-gray-200 text-sm text-gray-400">
                    <AlertTriangle size={16} className="text-amber-400" />
                    Aucun DPE trouvé dans la base ADEME. Le DPE doit avoir été transmis par le diagnostiqueur.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map(r => {
                      const isSaved = imports.some(i => i.numeroDpe === r.numero_dpe);
                      const isSelected = selectedAdeme?.numero_dpe === r.numero_dpe;
                      return (
                        <div key={r.numero_dpe}
                          className="bg-white border-2 rounded-md overflow-hidden transition-all"
                          style={{ borderColor: isSelected ? "#000091" : "#e0e0e0" }}>
                          <div className="p-4 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              {/* DPE badge */}
                              <div className="w-12 h-12 rounded flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                                style={{ backgroundColor: DPE_COLORS[r.etiquette_dpe] ?? "#999" }}>
                                {r.etiquette_dpe}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{r.adresse_ban}</p>
                                <p className="text-xs text-gray-400 mt-0.5">N° DPE : {r.numero_dpe}</p>
                                <p className="text-xs text-gray-400">
                                  Établi le {new Date(r.date_etablissement_dpe).toLocaleDateString("fr-FR")}
                                  {r.nom_methode_dpe ? ` · ${r.nom_methode_dpe}` : ""}
                                </p>
                                {(r.conso_ep_energie || r.emission_ges) && (
                                  <div className="flex items-center gap-3 mt-1.5">
                                    {r.conso_ep_energie && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-medium text-gray-700">{r.conso_ep_energie} kWh/m²/an</span>}
                                    {r.emission_ges && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-medium text-gray-700">{r.emission_ges} kg CO₂/m²/an</span>}
                                    {r.etiquette_ges && <span className="text-xs px-2 py-0.5 rounded font-bold text-white" style={{ backgroundColor: DPE_COLORS[r.etiquette_ges] ?? "#999" }}>GES {r.etiquette_ges}</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              {isSaved && <span className="text-xs font-semibold text-green-600 flex items-center gap-1"><CheckCircle2 size={12} />Importé</span>}
                              <button onClick={() => saveAdemeImport(r)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold text-white transition-colors"
                                style={{ backgroundColor: isSelected ? "#16a34a" : "#000091" }}>
                                {isSelected ? <CheckCircle2 size={12} /> : <Download size={12} />}
                                {isSelected ? "Importé !" : "Importer"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <a href="https://observatoire-dpe.fr/" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs mt-1" style={{ color: "#000091" }}>
                      <ExternalLink size={11} />Consulter l'Observatoire DPE complet
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── DPE importés ─────────────────────────────────────────── */}
        {imports.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">DPE importés ({imports.length})</h2>
              <button onClick={() => { saveImports([]); setImports([]); }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
                <X size={11} />Vider
              </button>
            </div>
            <div className="space-y-2">
              {imports.map((imp, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-200 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: DPE_COLORS[imp.etiquetteDpe] ?? "#999" }}>
                      {imp.etiquetteDpe}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 truncate max-w-xs">{imp.adresse}</p>
                      <p className="text-xs text-gray-400">N° {imp.numeroDpe} · {imp.source === "xml" ? "XML" : "Base ADEME"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {imp.consoEp && <span className="text-xs text-gray-400">{imp.consoEp} kWh/m²/an</span>}
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>Importé</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
