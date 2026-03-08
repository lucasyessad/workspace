import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { modules } from "../lib/modules";
import { getCompletedModules } from "../lib/storage";
import { colors, radius, spacing } from "../lib/theme";
import { RootStackParamList } from "../types";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Dashboard">;
};

export default function DashboardScreen({ navigation }: Props) {
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      getCompletedModules().then(setCompletedModules);
    }, [])
  );

  const total = modules.length;
  const done = completedModules.length;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Patrimoine <Text style={styles.titleAccent}>360°</Text>
          </Text>
          <Text style={styles.subtitle}>
            12 modules experts · Calculs en temps réel · Analyse IA
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progression globale</Text>
            <Text style={styles.progressCount}>{done}/{total} modules</Text>
          </View>
          <View style={styles.progressTrack}>
            {modules.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.progressSegment,
                  completedModules.includes(m.id) && styles.progressSegmentDone,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Module Grid */}
        <View style={styles.grid}>
          {modules.map((m) => {
            const isComplete = completedModules.includes(m.id);
            return (
              <TouchableOpacity
                key={m.id}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("Module", { id: m.id })}
              >
                {isComplete && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
                <View style={styles.cardTop}>
                  <Text style={styles.cardIcon}>{m.icon}</Text>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardNumber}>Module {String(m.id).padStart(2, "0")}</Text>
                    <Text style={styles.cardTitle}>{m.title}</Text>
                  </View>
                </View>
                <Text style={styles.cardDesc}>{m.description}</Text>
                <Text style={styles.cardStyle}>Style {m.style}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: spacing.lg, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 28 },
  title: { fontSize: 32, fontWeight: "700", color: colors.white },
  titleAccent: { color: colors.accent },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 6 },
  progressSection: { marginBottom: 24 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 13, color: colors.textMuted },
  progressCount: { fontSize: 13, color: colors.textMuted, fontVariant: ["tabular-nums"] },
  progressTrack: { flexDirection: "row", gap: 3 },
  progressSegment: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)" },
  progressSegmentDone: { backgroundColor: colors.success },
  grid: { gap: 12 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 18,
    position: "relative",
  },
  checkBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(74,222,128,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkText: { color: colors.success, fontSize: 12 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 8 },
  cardIcon: { fontSize: 28 },
  cardMeta: { flex: 1 },
  cardNumber: { fontSize: 11, color: colors.accent, fontVariant: ["tabular-nums"] },
  cardTitle: { fontSize: 15, fontWeight: "600", color: colors.white, marginTop: 2 },
  cardDesc: { fontSize: 12, color: colors.textMuted, lineHeight: 17, marginBottom: 6 },
  cardStyle: { fontSize: 10, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: 1.5 },
});
