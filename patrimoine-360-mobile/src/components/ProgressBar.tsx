import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { colors, radius } from "../lib/theme";

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  suffix?: string;
  color?: "success" | "warning" | "danger" | "accent";
}

const barColors = { success: colors.success, warning: colors.warning, danger: colors.danger, accent: colors.accent };

export default function ProgressBar({ value, max, label, suffix, color = "accent" }: ProgressBarProps) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, { toValue: pct, duration: 1000, useNativeDriver: false }).start();
  }, [pct]);

  const width = animWidth.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}{suffix}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width, backgroundColor: barColors[color] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  header: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 13, color: colors.textSecondary },
  value: { fontSize: 13, fontWeight: "600", color: colors.white, fontVariant: ["tabular-nums"] },
  track: { height: 8, borderRadius: radius.full, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  fill: { height: "100%", borderRadius: radius.full },
});
