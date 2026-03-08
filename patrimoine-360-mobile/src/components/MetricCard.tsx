import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius } from "../lib/theme";

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  color?: "success" | "warning" | "danger" | "accent";
}

const valueColors = { success: colors.success, warning: colors.warning, danger: colors.danger, accent: colors.accent };
const borderColors = { success: "rgba(74,222,128,0.2)", warning: "rgba(250,204,21,0.2)", danger: "rgba(239,68,68,0.2)", accent: "rgba(129,140,248,0.2)" };

export default function MetricCard({ label, value, suffix, color = "accent" }: MetricCardProps) {
  const formatted = typeof value === "number" ? value.toLocaleString("fr-FR") : value;
  return (
    <View style={[styles.card, { borderColor: borderColors[color] }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColors[color] }]}>
        {formatted}
        {suffix ? <Text style={styles.suffix}> {suffix}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 14,
  },
  label: { fontSize: 10, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  value: { fontSize: 18, fontWeight: "600", fontVariant: ["tabular-nums"] },
  suffix: { fontSize: 12, color: colors.textMuted },
});
