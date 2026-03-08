import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Clipboard from "expo-clipboard";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import Markdown from "react-native-markdown-display";
import { getModule } from "../lib/modules";
import { getPromptConfig } from "../lib/prompts";
import { calculate } from "../lib/calculators";
import { loadState, saveModuleState, clearModuleState } from "../lib/storage";
import { FormData as FData, CalculationResult, RootStackParamList } from "../types";
import ModuleForm from "../components/ModuleForm";
import LocalCalculations from "../components/LocalCalculations";
import { colors, radius, spacing } from "../lib/theme";

// IMPORTANT: Set your API URL here
const API_URL = "http://10.0.2.2:3000/api/analyze"; // Android emulator -> localhost
// const API_URL = "http://localhost:3000/api/analyze"; // iOS simulator

type Props = NativeStackScreenProps<RootStackParamList, "Module">;

export default function ModuleScreen({ route, navigation }: Props) {
  const moduleId = route.params.id;
  const mod = getModule(moduleId);

  const [formData, setFormData] = useState<FData>({});
  const [calculations, setCalculations] = useState<CalculationResult[] | null>(null);
  const [aiResult, setAiResult] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Load saved state
  useEffect(() => {
    (async () => {
      const state = await loadState();
      const moduleState = state.modules[moduleId];
      if (moduleState) {
        setFormData(moduleState.formData || {});
        setAiResult(moduleState.aiResult || "");
      } else {
        setFormData({});
        setAiResult("");
      }
    })();
  }, [moduleId]);

  // Recalculate
  useEffect(() => {
    if (mod?.hasCalculator) {
      const results = calculate(moduleId, formData);
      setCalculations(results);
    }
  }, [formData, moduleId, mod?.hasCalculator]);

  // Save on change
  useEffect(() => {
    const save = async () => {
      await saveModuleState(moduleId, { formData, aiResult, completed: !!aiResult });
    };
    // Debounce save
    const timer = setTimeout(save, 500);
    return () => clearTimeout(timer);
  }, [formData, aiResult, moduleId]);

  const handleFieldChange = useCallback((id: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleAnalyze = async () => {
    setIsStreaming(true);
    setAiResult("");

    abortRef.current = new AbortController();

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, formData }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        setAiResult(`**Erreur**: ${err.error || "Une erreur est survenue"}`);
        setIsStreaming(false);
        return;
      }

      const text = await response.text();
      let accumulated = "";

      const lines = text.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) accumulated += parsed.text;
            if (parsed.error) accumulated += `\n\n**Erreur**: ${parsed.error}`;
          } catch {}
        }
      }

      setAiResult(accumulated);
      await saveModuleState(moduleId, { formData, aiResult: accumulated, completed: true });
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setAiResult(`**Erreur**: ${err.message}`);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopyPrompt = async () => {
    const promptConfig = getPromptConfig(moduleId);
    if (!promptConfig) return;
    const fullPrompt = `${promptConfig.system}\n\n---\n\n${promptConfig.buildUserPrompt(formData)}`;
    await Clipboard.setStringAsync(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    Alert.alert("Réinitialiser", "Supprimer toutes les données de ce module ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          setFormData({});
          setAiResult("");
          setCalculations(null);
          await clearModuleState(moduleId);
        },
      },
    ]);
  };

  const handleExportPdf = async () => {
    if (!mod) return;
    const calcHtml = calculations
      ? calculations.map((c) => `<tr><td>${c.label}</td><td><strong>${typeof c.value === "number" ? c.value.toLocaleString("fr-FR") : c.value}</strong> ${c.suffix || ""}</td></tr>`).join("")
      : "";

    const html = `
      <html>
      <head><meta charset="utf-8"><style>
        body { font-family: -apple-system, sans-serif; padding: 24px; color: #1a1a1a; }
        h1 { color: #6366F1; font-size: 24px; }
        h2 { color: #333; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        td { padding: 8px; border: 1px solid #eee; }
        .disclaimer { font-size: 10px; color: #999; margin-top: 40px; text-align: center; }
      </style></head>
      <body>
        <h1>Patrimoine 360° — ${mod.title}</h1>
        <p style="color:#666">Style ${mod.style} · ${new Date().toLocaleDateString("fr-FR")}</p>

        <h2>Données saisies</h2>
        <table>${Object.entries(formData).filter(([, v]) => v !== "" && v !== undefined).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table>

        ${calcHtml ? `<h2>Calculs</h2><table>${calcHtml}</table>` : ""}

        ${aiResult ? `<h2>Analyse IA</h2><div>${aiResult.replace(/\n/g, "<br>")}</div>` : ""}

        <p class="disclaimer">Ce document est fourni à titre éducatif uniquement et ne constitue pas un conseil financier professionnel.</p>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Exporter PDF" });
    } catch {}
  };

  if (!mod) {
    return (
      <View style={styles.screen}>
        <Text style={styles.errorText}>Module non trouvé</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Module Header */}
        <View style={styles.moduleHeader}>
          <Text style={styles.moduleIcon}>{mod.icon}</Text>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleTag}>Module {String(mod.id).padStart(2, "0")} · Style {mod.style}</Text>
            <Text style={styles.moduleTitle}>{mod.title}</Text>
            <Text style={styles.moduleDesc}>{mod.description}</Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />
            <Text style={styles.sectionTitle}>Vos informations</Text>
            <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
              <Text style={styles.resetText}>Réinitialiser</Text>
            </TouchableOpacity>
          </View>
          <ModuleForm fields={mod.fields} formData={formData} onChange={handleFieldChange} />
        </View>

        {/* Calculations */}
        {calculations && calculations.length > 0 && (
          <View style={styles.section}>
            <LocalCalculations results={calculations} />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.analyzeBtn, isStreaming && styles.disabled]}
            onPress={handleAnalyze}
            disabled={isStreaming}
            activeOpacity={0.8}
          >
            {isStreaming ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.analyzeBtnIcon}>🤖</Text>
            )}
            <Text style={styles.analyzeBtnText}>
              {isStreaming ? "Analyse en cours..." : "Lancer l'analyse IA"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleCopyPrompt} activeOpacity={0.7}>
            <Text style={styles.secondaryBtnText}>
              {copied ? "✓ Copié !" : "📋 Copier le prompt"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Result */}
        {aiResult ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.accentBar, { backgroundColor: "#A855F7" }]} />
              <Text style={styles.sectionTitle}>Analyse IA</Text>
              {isStreaming && <ActivityIndicator color={colors.accent} size="small" />}
            </View>
            <View style={styles.aiResultBox}>
              <Markdown style={markdownStyles}>{aiResult}</Markdown>
            </View>
          </View>
        ) : null}

        {/* Export */}
        {(aiResult || (calculations && calculations.length > 0)) && (
          <TouchableOpacity style={styles.exportBtn} onPress={handleExportPdf} activeOpacity={0.7}>
            <Text style={styles.exportBtnText}>📄 Exporter en PDF</Text>
          </TouchableOpacity>
        )}

        {/* Navigation */}
        <View style={styles.nav}>
          {moduleId > 1 && (
            <TouchableOpacity onPress={() => navigation.replace("Module", { id: moduleId - 1 })}>
              <Text style={styles.navText}>← Module {String(moduleId - 1).padStart(2, "0")}</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {moduleId < 12 && (
            <TouchableOpacity onPress={() => navigation.replace("Module", { id: moduleId + 1 })}>
              <Text style={styles.navText}>Module {String(moduleId + 1).padStart(2, "0")} →</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  heading1: { color: colors.white, fontSize: 20, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  heading2: { color: colors.white, fontSize: 17, fontWeight: "600", marginTop: 14, marginBottom: 6 },
  heading3: { color: colors.white, fontSize: 15, fontWeight: "600", marginTop: 12, marginBottom: 4 },
  strong: { color: colors.white, fontWeight: "600" },
  bullet_list: { marginLeft: 4 },
  ordered_list: { marginLeft: 4 },
  list_item: { marginBottom: 4 },
  table: { borderWidth: 1, borderColor: colors.border },
  thead: { backgroundColor: "rgba(99,102,241,0.1)" },
  th: { padding: 8, borderWidth: 1, borderColor: colors.border, color: colors.accent, fontWeight: "600", fontSize: 12 },
  td: { padding: 8, borderWidth: 1, borderColor: colors.border, fontSize: 12 },
  code_inline: { color: colors.accent, backgroundColor: "rgba(99,102,241,0.1)", paddingHorizontal: 4, borderRadius: 4, fontSize: 13 },
  code_block: { backgroundColor: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 8, fontSize: 12 },
  hr: { backgroundColor: colors.border, height: 1, marginVertical: 16 },
  blockquote: { borderLeftWidth: 3, borderLeftColor: colors.accent, paddingLeft: 12, opacity: 0.8 },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: spacing.lg, paddingTop: 16, paddingBottom: 40 },
  errorText: { color: colors.textMuted, textAlign: "center", marginTop: 100 },
  moduleHeader: { flexDirection: "row", alignItems: "flex-start", gap: 14, marginBottom: 24 },
  moduleIcon: { fontSize: 36 },
  moduleInfo: { flex: 1 },
  moduleTag: { fontSize: 11, color: colors.accent, fontVariant: ["tabular-nums"] },
  moduleTitle: { fontSize: 22, fontWeight: "700", color: colors.white, marginTop: 2 },
  moduleDesc: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  accentBar: { width: 3, height: 18, backgroundColor: colors.accent, borderRadius: 2 },
  sectionTitle: { fontSize: 17, fontWeight: "600", color: colors.white, flex: 1 },
  resetBtn: { padding: 4 },
  resetText: { fontSize: 12, color: colors.textMuted },
  actions: { gap: 10, marginBottom: 24 },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.accentDark,
  },
  analyzeBtnIcon: { fontSize: 18 },
  analyzeBtnText: { color: colors.white, fontSize: 15, fontWeight: "600" },
  disabled: { opacity: 0.6 },
  secondaryBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  secondaryBtnText: { color: colors.textSecondary, fontSize: 14 },
  aiResultBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 18,
  },
  exportBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.03)",
    marginBottom: 24,
  },
  exportBtnText: { color: colors.textSecondary, fontSize: 14 },
  nav: {
    flexDirection: "row",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navText: { fontSize: 13, color: colors.textMuted },
});
