// ============================================================
// TabibPro Mobile — Dashboard Professionnel
// Vue synthétique de la journée du médecin
// ============================================================

import { ScrollView, View, Text, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/lib/theme';

const STATS_JOUR = [
  { label: 'Patients', valeur: '12', sous: '5 restants', couleur: COLORS.primary[600], bg: COLORS.primary[50] },
  { label: 'Consultations', valeur: '7', sous: 'terminées', couleur: '#059669', bg: '#d1fae5' },
  { label: 'CA du jour', valeur: '42 000', sous: 'DA', couleur: '#d97706', bg: '#fef3c7' },
  { label: 'Stock alerte', valeur: '3', sous: 'médicaments', couleur: '#dc2626', bg: '#fee2e2' },
];

const FILE_ATTENTE = [
  { id: '1', nom: 'Hamidi Soraya', heure: '09:15', attenteMin: 10, urgent: false },
  { id: '2', nom: 'Khelif Yacine', heure: '09:30', attenteMin: 25, urgent: false },
  { id: '3', nom: 'Meddah Fatima', heure: '09:45', attenteMin: 15, urgent: true },
];

export default function ProDashboardScreen() {
  const { session } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const now = new Intl.DateTimeFormat('fr-DZ', {
    weekday: 'long', day: 'numeric', month: 'long',
    timeZone: 'Africa/Algiers',
  }).format(new Date());

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary[600]} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Dr. {session?.nom} 👨‍⚕️</Text>
          <Text style={styles.date}>{now}</Text>
        </View>
        <View style={styles.onlineDot}>
          <View style={styles.onlineDotInner} />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {STATS_JOUR.map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
            <Text style={[styles.statValeur, { color: s.couleur }]}>{s.valeur}</Text>
            <Text style={[styles.statSous, { color: s.couleur }]}>{s.sous}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* File d'attente */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>File d'attente</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>En direct</Text>
          </View>
        </View>

        <View style={styles.fileCard}>
          {FILE_ATTENTE.map((p, i) => (
            <View key={p.id} style={[styles.fileRow, i < FILE_ATTENTE.length - 1 && styles.fileRowBorder]}>
              <View style={[styles.fileBadge, { backgroundColor: p.urgent ? '#fee2e2' : COLORS.primary[50] }]}>
                <Text style={[styles.fileBadgeText, { color: p.urgent ? '#dc2626' : COLORS.primary[700] }]}>
                  {p.urgent ? '!' : i + 1}
                </Text>
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileNom}>{p.nom}</Text>
                <Text style={styles.fileDetail}>Arrivée {p.heure} · Attente {p.attenteMin} min</Text>
              </View>
              <TouchableOpacity
                style={styles.voirBtn}
                onPress={() => router.push('/pro/(tabs)/consultation')}
              >
                <Text style={styles.voirBtnText}>Voir</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Actions rapides */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: '👤', label: 'Nouveau patient', route: '/pro/(tabs)/patients' },
            { icon: '📋', label: 'Ordonnance', route: '/pro/(tabs)/consultation' },
            { icon: '🤖', label: 'IA — Diagnostic', route: '/pro/(tabs)/consultation' },
            { icon: '💊', label: 'Stock', route: '/pro/(tabs)/consultation' },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionCard}
              onPress={() => router.push(a.route as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SPACING.xl, paddingTop: SPACING.xl,
  },
  greeting: { ...TYPOGRAPHY.h2, color: COLORS.gray[900] },
  date: { ...TYPOGRAPHY.small, color: COLORS.gray[500], marginTop: 2 },
  onlineDot: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center',
  },
  onlineDotInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  statCard: {
    width: '47%', borderRadius: RADIUS.xl, padding: SPACING.lg, alignItems: 'center',
  },
  statValeur: { fontSize: 24, fontWeight: '800' },
  statSous: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  statLabel: { fontSize: 12, color: COLORS.gray[600], marginTop: 4, fontWeight: '600' },
  section: { marginBottom: SPACING.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  sectionTitle: { ...TYPOGRAPHY.label, color: COLORS.gray[500], textTransform: 'uppercase' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  liveText: { fontSize: 10, color: '#10b981', fontWeight: '600' },
  fileCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, ...SHADOWS.sm },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md },
  fileRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.gray[100] },
  fileBadge: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  fileBadgeText: { fontSize: 13, fontWeight: '800' },
  fileInfo: { flex: 1 },
  fileNom: { fontSize: 14, fontWeight: '600', color: COLORS.gray[900] },
  fileDetail: { fontSize: 11, color: COLORS.gray[500], marginTop: 2 },
  voirBtn: {
    backgroundColor: COLORS.primary[600], borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 6,
  },
  voirBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  actionCard: {
    width: '47%', backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.lg, alignItems: 'center', gap: SPACING.sm, ...SHADOWS.sm,
  },
  actionIcon: { fontSize: 28 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.gray[700], textAlign: 'center' },
});
