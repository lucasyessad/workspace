import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CalculationResult } from "../types";
import MetricCard from "./MetricCard";
import ScoreGauge from "./ScoreGauge";
import ProgressBar from "./ProgressBar";
import { colors, radius } from "../lib/theme";

interface Props {
  results: CalculationResult[];
}

export default function LocalCalculations({ results }: Props) {
  if (!results || results.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.accent} />
        <Text style={styles.title}>Calculs instantanés</Text>
      </View>
      <View style={styles.grid}>
        {results.map((r, i) => {
          if (r.type === "score" && r.max) {
            return (
              <View key={i} style={styles.gaugeContainer}>
                <ScoreGauge value={Number(r.value)} max={r.max} label={r.label} color={r.color} />
              </View>
            );
          }
          if (r.type === "progress" && r.max) {
            return (
              <View key={i} style={styles.progressContainer}>
                <ProgressBar value={Number(r.value)} max={r.max} label={r.label} suffix={r.suffix} color={r.color} />
              </View>
            );
          }
          return (
            <View key={i} style={styles.metricWrapper}>
              <MetricCard label={r.label} value={r.value} suffix={r.suffix} color={r.color} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  accent: { width: 3, height: 18, backgroundColor: colors.accent, borderRadius: 2 },
  title: { fontSize: 17, fontWeight: "600", color: colors.white },
  grid: { gap: 10 },
  gaugeContainer: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 16,
  },
  progressContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 14,
  },
  metricWrapper: {},
});
