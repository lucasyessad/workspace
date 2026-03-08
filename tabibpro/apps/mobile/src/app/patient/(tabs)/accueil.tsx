// ============================================================
// TabibPro Mobile — Accueil Patient
// Prochain RDV, résumé santé, accès rapide
// ============================================================

import { ScrollView, View, Text, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/lib/theme';

const PROCHAINS_RDV = [
  {
    id: '1',
    medecin: 'Dr. Hamid Belkacem',
    specialite: 'Médecin généraliste',
    date: 'Dimanche 09 Mars 2026',
    heure: '10h30',
    adresse: 'Cabinet médical, Alger Centre',
    wilaya: 'Alger (16)',
  },
];

export default function PatientAccueilScreen() {
  const { session } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: fetch API
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
          <Text style={styles.greeting}>Bonjour, {session?.prenom} 👋</Text>
          <Text style={styles.date}>{now}</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {session?.prenom?.charAt(0)}{session?.nom?.charAt(0)}
          </Text>
        </View>
      </View>

      {/* Prochain RDV */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prochain rendez-vous</Text>
        {PROCHAINS_RDV.length > 0 ? (
          PROCHAINS_RDV.map((rdv) => (
            <TouchableOpacity key={rdv.id} style={styles.rdvCard} activeOpacity={0.85}>
              <View style={styles.rdvHeader}>
                <View style={styles.rdvDateBadge}>
                  <Text style={styles.rdvDateText}>{rdv.heure}</Text>
                </View>
                <View style={styles.rdvInfo}>
                  <Text style={styles.rdvMedecin}>{rdv.medecin}</Text>
                  <Text style={styles.rdvSpecialite}>{rdv.specialite}</Text>
                </View>
              </View>
              <View style={styles.rdvDetails}>
                <Text style={styles.rdvDateFull}>📅 {rdv.date}</Text>
                <Text style={styles.rdvAdresse}>📍 {rdv.adresse} · {rdv.wilaya}</Text>
              </View>
              <View style={styles.rdvActions}>
                <TouchableOpacity style={styles.rdvBtn}>
                  <Text style={styles.rdvBtnText}>Confirmer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.rdvBtn, styles.rdvBtnSecondary]}>
                  <Text style={[styles.rdvBtnText, styles.rdvBtnSecondaryText]}>Reporter</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Aucun rendez-vous prévu</Text>
            <TouchableOpacity
              style={styles.priseRdvBtn}
              onPress={() => router.push('/patient/(tabs)/rdv')}
            >
              <Text style={styles.priseRdvBtnText}>Prendre un RDV</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Accès rapide */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accès rapide</Text>
        <View style={styles.quickGrid}>
          {[
            { icon: '📋', label: 'Mon dossier', route: '/patient/(tabs)/dossier' },
            { icon: '💊', label: 'Ordonnances', route: '/patient/(tabs)/dossier' },
            { icon: '💬', label: 'Messages', route: '/patient/(tabs)/messagerie' },
            { icon: '📅', label: 'Mes RDV', route: '/patient/(tabs)/rdv' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.quickCard}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.quickIcon}>{item.icon}</Text>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Constantes vitales récentes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dernières constantes</Text>
        <View style={styles.constantesGrid}>
          {[
            { label: 'Tension', valeur: '125/80', unite: 'mmHg', couleur: COLORS.primary[600], ok: true },
            { label: 'Pouls', valeur: '72', unite: 'bpm', couleur: COLORS.emerald, ok: true },
            { label: 'Poids', valeur: '75', unite: 'kg', couleur: COLORS.amber, ok: true },
            { label: 'Glycémie', valeur: '1.2', unite: 'g/L', couleur: COLORS.emerald, ok: true },
          ].map((c) => (
            <View key={c.label} style={styles.constanteCard}>
              <Text style={styles.constanteLabel}>{c.label}</Text>
              <Text style={[styles.constanteValeur, { color: c.couleur }]}>{c.valeur}</Text>
              <Text style={styles.constanteUnite}>{c.unite}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.constanteDate}>Mesurées le 27/02/2026</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  greeting: { ...TYPOGRAPHY.h2, color: COLORS.gray[900] },
  date: { ...TYPOGRAPHY.small, color: COLORS.gray[500], marginTop: 2 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary[100],
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: COLORS.primary[700] },
  section: { marginBottom: SPACING.xl },
  sectionTitle: { ...TYPOGRAPHY.label, color: COLORS.gray[500], textTransform: 'uppercase', marginBottom: SPACING.sm },
  rdvCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.lg, ...SHADOWS.md,
    borderLeftWidth: 4, borderLeftColor: COLORS.primary[500],
  },
  rdvHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  rdvDateBadge: {
    backgroundColor: COLORS.primary[600], borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  rdvDateText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  rdvInfo: { flex: 1 },
  rdvMedecin: { fontSize: 15, fontWeight: '700', color: COLORS.gray[900] },
  rdvSpecialite: { fontSize: 12, color: COLORS.gray[500], marginTop: 2 },
  rdvDetails: { gap: 4, marginBottom: SPACING.md },
  rdvDateFull: { fontSize: 13, color: COLORS.gray[700] },
  rdvAdresse: { fontSize: 12, color: COLORS.gray[500] },
  rdvActions: { flexDirection: 'row', gap: SPACING.sm },
  rdvBtn: {
    flex: 1, backgroundColor: COLORS.primary[600], borderRadius: RADIUS.md,
    paddingVertical: 8, alignItems: 'center',
  },
  rdvBtnSecondary: { backgroundColor: COLORS.gray[100] },
  rdvBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  rdvBtnSecondaryText: { color: COLORS.gray[700] },
  emptyCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.xl, alignItems: 'center', ...SHADOWS.sm,
  },
  emptyText: { color: COLORS.gray[500], fontSize: 14, marginBottom: SPACING.md },
  priseRdvBtn: {
    backgroundColor: COLORS.primary[600], borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xl, paddingVertical: 10,
  },
  priseRdvBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  quickCard: {
    width: '47%', backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.lg, alignItems: 'center', gap: SPACING.sm, ...SHADOWS.sm,
  },
  quickIcon: { fontSize: 28 },
  quickLabel: { fontSize: 13, fontWeight: '600', color: COLORS.gray[700], textAlign: 'center' },
  constantesGrid: { flexDirection: 'row', gap: SPACING.sm },
  constanteCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center', ...SHADOWS.sm,
  },
  constanteLabel: { fontSize: 10, color: COLORS.gray[500], fontWeight: '600', textTransform: 'uppercase' },
  constanteValeur: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  constanteUnite: { fontSize: 9, color: COLORS.gray[400], marginTop: 2 },
  constanteDate: { fontSize: 11, color: COLORS.gray[400], textAlign: 'right', marginTop: SPACING.xs },
});
