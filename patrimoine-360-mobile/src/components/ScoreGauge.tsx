import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../lib/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreGaugeProps {
  value: number;
  max: number;
  label: string;
  color?: "success" | "warning" | "danger" | "accent";
}

const colorMap = { success: colors.success, warning: colors.warning, danger: colors.danger, accent: colors.accent };

export default function ScoreGauge({ value, max, label, color = "accent" }: ScoreGaugeProps) {
  const pct = Math.min(100, (value / max) * 100);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const strokeColor = colorMap[color];

  const animValue = useRef(new Animated.Value(circumference)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: offset,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [offset]);

  return (
    <View style={styles.container}>
      <View style={styles.svgContainer}>
        <Svg width={120} height={120} viewBox="0 0 120 120" style={{ transform: [{ rotate: "-90deg" }] }}>
          <Circle cx={60} cy={60} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
          <AnimatedCircle
            cx={60} cy={60} r={radius} fill="none"
            stroke={strokeColor} strokeWidth={8} strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={animValue}
          />
        </Svg>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.max}>/ {max}</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 8 },
  svgContainer: { width: 120, height: 120, position: "relative" },
  valueContainer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" },
  value: { fontSize: 24, fontWeight: "700", color: colors.white, fontVariant: ["tabular-nums"] },
  max: { fontSize: 11, color: colors.textMuted },
  label: { fontSize: 12, color: colors.textSecondary, textAlign: "center" },
});
