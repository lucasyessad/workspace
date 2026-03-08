// ============================================================
// TabibPro Mobile — Mes Rendez-vous (Patient)
// Historique + à venir
// ============================================================

import { ScrollView, View, Text, TouchableOpacity, StyleSheet, SectionList } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/lib/theme';

type StatutRdv = 'PREVU' | 'CONFIRME' | 'TERMINE' | 'ANNULE' | 'NON_VENU';

interface Rdv {
  id: string;
  medecin: string;
  specialite: string;
  date: string;
  heure: string;
  statut: StatutRdv;
  motif: string;
  wilaya: string;
}

const STATUT_CONFIG: Record<StatutRdv, { label: string; color: string; bg: string }> = {
  PREVU:    { label: 'Prévu',    color: COLORS.primary[700], bg: COLORS.primary[50] },
  CONFIRME: { label: 'Confirmé', color: '#065f46',           bg: '#d1fae5' },
  TERMINE:  { label: 'Terminé',  color: COLORS.gray[600],    bg: COLORS.gray[100] },
  ANNULE:   { label: 'Annulé',   color: '#991b1b',           bg: '#fee2e2' },
  NON_VENU: { label: 'Non venu', color: '#92400e',           bg: '#fef3c7' },
};

const SECTIONS = [
  {
    title: 'À venir',
    data: [
      { id: '1', medecin: 'Dr. Hamid Belkacem', specialite: 'Médecin généraliste', date: '09/03/2026', heure: '10h30', statut: 'CONFIRME' as StatutRdv, motif: 'Bilan de santé', wilaya: 'Alger (16)' },
      { id: '2', medecin: 'Dr. Nadia Ferhat', specialite: 'Cardiologue', date: '15/03/2026', heure: '14h00', statut: 'PREVU' as StatutRdv, motif: 'Suivi HTA', wilaya: 'Alger (16)' },
    ],
  },
  {
    title: 'Historique',
    data: [
      { id: '3', medecin: 'Dr. Hamid Belkacem', specialite: 'Médecin généraliste', date: '27/02/2026', heure: '09h00', statut: 'TERMINE' as StatutRdv, motif: 'Renouvellement ordonnance', wilaya: 'Alger (16)' },
      { id: '4', medecin: 'Dr. Hamid Belkacem', specialite: 'Médecin généraliste', date: '12/01/2026', heure: '10h00', statut: 'TERMINE' as StatutRdv, motif: 'Consultation grippe', wilaya: 'Alger (16)' },
      { id: '5', medecin: 'Dr. Karima Ouali', specialite: 'Endocrinologue', date: '05/12/2025', heure: '11h00', statut: 'ANNULE' as StatutRdv, motif: 'Suivi diabète', wilaya: 'Alger (16)' },
    ],
  },
];

function RdvCard({ rdv }: { rdv: Rdv }) {
  const statut = STATUT_CONFIG[rdv.statut];
  const estAVenir = rdv.statut === 'PREVU' || rdv.statut === 'CONFIRME';

  return (
    <View style={[styles.card, estAVenir && styles.cardActive]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Text style={styles.medecin}>{rdv.medecin}</Text>
          <Text style={styles.specialite}>{rdv.specialite}</Text>
        </View>
        <View style={[styles.statutBadge, { backgroundColor: statut.bg }]}>
          <Text style={[styles.statutText, { color: statut.color }]}>{statut.label}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <Text style={styles.detail}>📅 {rdv.date} à {rdv.heure}</Text>
        <Text style={styles.detail}>📍 {rdv.wilaya}</Text>
        <Text style={styles.detail}>💬 {rdv.motif}</Text>
      </View>

      {estAVenir && (
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]}>
            <Text style={[styles.actionBtnText, styles.actionBtnDangerText]}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function PatientRdvScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Mes rendez-vous</Text>
        <TouchableOpacity style={styles.newRdvBtn}>
          <Text style={styles.newRdvBtnText}>+ Nouveau</Text>
        </TouchableOpacity>
      </View>

      <SectionList
        sections={SECTIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <RdvCard rdv={item} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxxl, paddingBottom: SPACING.md,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100],
  },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.gray[900] },
  newRdvBtn: {
    backgroundColor: COLORS.primary[600], borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  newRdvBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  list: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  sectionHeader: {
    ...TYPOGRAPHY.label, color: COLORS.gray[500],
    textTransform: 'uppercase', marginBottom: SPACING.sm, marginTop: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  cardActive: { borderLeftWidth: 3, borderLeftColor: COLORS.primary[500] },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  cardLeft: { flex: 1 },
  medecin: { fontSize: 15, fontWeight: '700', color: COLORS.gray[900] },
  specialite: { fontSize: 12, color: COLORS.gray[500], marginTop: 2 },
  statutBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  statutText: { fontSize: 11, fontWeight: '700' },
  cardDetails: { gap: 4, marginBottom: SPACING.md },
  detail: { fontSize: 13, color: COLORS.gray[600] },
  cardActions: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: {
    flex: 1, borderRadius: RADIUS.md, paddingVertical: 8,
    alignItems: 'center', backgroundColor: COLORS.gray[100],
  },
  actionBtnDanger: { backgroundColor: '#fee2e2' },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.gray[700] },
  actionBtnDangerText: { color: '#991b1b' },
});
