// ============================================================
// TabibPro Mobile — Mon Dossier Médical (Patient)
// Constantes, ordonnances, documents, vaccins
// ============================================================

import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/auth.store';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/lib/theme';

const ORDONNANCES = [
  { id: '1', date: '27/02/2026', medecin: 'Dr. Belkacem', medicaments: ['Metformine 850mg', 'Amlodipine 5mg'], statut: 'ACTIVE' },
  { id: '2', date: '12/01/2026', medecin: 'Dr. Belkacem', medicaments: ['Amoxicilline 500mg'], statut: 'EXPIREE' },
];

const VACCINATIONS = [
  { id: '1', nom: 'Grippe saisonnière', date: '15/10/2025', rappel: 'Oct 2026', statut: 'OK' },
  { id: '2', nom: 'COVID-19 (rappel)', date: '02/05/2025', rappel: '—', statut: 'OK' },
  { id: '3', nom: 'Hépatite B', date: '—', rappel: 'En retard', statut: 'RETARD' },
];

const ANTECEDENTS = ['Diabète type 2 (2020)', 'Hypertension artérielle (2019)'];
const ALLERGIES = ['Pénicilline (réaction cutanée sévère)', 'Aspirine (urticaire)'];

export default function PatientDossierScreen() {
  const { session } = useAuthStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Mon dossier médical</Text>
        <View style={styles.chifaBadge}>
          <Text style={styles.chifaText}>🏥 Chifa</Text>
        </View>
      </View>

      {/* Identité */}
      <View style={styles.identiteCard}>
        <View style={styles.identiteHeader}>
          <View style={styles.avatarBig}>
            <Text style={styles.avatarBigText}>
              {session?.prenom?.charAt(0)}{session?.nom?.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.nom}>{session?.prenom} {session?.nom}</Text>
            <Text style={styles.infoLine}>Née le 12/04/1985 · 40 ans</Text>
            <Text style={styles.infoLine}>Alger, Algérie</Text>
            <Text style={styles.infoLine}>🩸 Groupe sanguin : A+</Text>
          </View>
        </View>
        <View style={styles.assuranceRow}>
          <View style={styles.assuranceBadge}>
            <Text style={styles.assuranceText}>CNAS</Text>
          </View>
          <Text style={styles.assuranceNum}>N° Chifa : 1984 0412 0016 ****</Text>
        </View>
      </View>

      {/* Alertes médicales */}
      <View style={styles.alerteBox}>
        <Text style={styles.alerteTitle}>⚠️ Allergies connues</Text>
        {ALLERGIES.map((a, i) => (
          <Text key={i} style={styles.alerteItem}>• {a}</Text>
        ))}
      </View>

      {/* Antécédents */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Antécédents médicaux</Text>
        <View style={styles.listCard}>
          {ANTECEDENTS.map((ant, i) => (
            <View key={i} style={[styles.listRow, i < ANTECEDENTS.length - 1 && styles.listRowBorder]}>
              <Text style={styles.listDot}>●</Text>
              <Text style={styles.listText}>{ant}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Ordonnances actives */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ordonnances</Text>
        {ORDONNANCES.map((ord) => (
          <TouchableOpacity key={ord.id} style={styles.ordCard} activeOpacity={0.85}>
            <View style={styles.ordHeader}>
              <View>
                <Text style={styles.ordDate}>{ord.date}</Text>
                <Text style={styles.ordMedecin}>{ord.medecin}</Text>
              </View>
              <View style={[
                styles.ordStatut,
                { backgroundColor: ord.statut === 'ACTIVE' ? '#d1fae5' : COLORS.gray[100] }
              ]}>
                <Text style={[
                  styles.ordStatutText,
                  { color: ord.statut === 'ACTIVE' ? '#065f46' : COLORS.gray[500] }
                ]}>
                  {ord.statut === 'ACTIVE' ? 'Active' : 'Expirée'}
                </Text>
              </View>
            </View>
            <View style={styles.ordMedicaments}>
              {ord.medicaments.map((m, i) => (
                <Text key={i} style={styles.ordMedicament}>💊 {m}</Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Vaccinations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Carnet de vaccination</Text>
        <View style={styles.listCard}>
          {VACCINATIONS.map((v, i) => (
            <View key={v.id} style={[styles.vaccRow, i < VACCINATIONS.length - 1 && styles.listRowBorder]}>
              <View style={[styles.vaccDot, { backgroundColor: v.statut === 'OK' ? '#34d399' : '#f87171' }]} />
              <View style={styles.vaccInfo}>
                <Text style={styles.vaccNom}>{v.nom}</Text>
                <Text style={styles.vaccDate}>
                  {v.date !== '—' ? `Fait le ${v.date}` : 'Non administré'} · Rappel : {v.rappel}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  content: { paddingBottom: SPACING.xxxl },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxxl, paddingBottom: SPACING.md,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100],
  },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.gray[900] },
  chifaBadge: { backgroundColor: '#dbeafe', borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4 },
  chifaText: { fontSize: 12, fontWeight: '700', color: '#1d4ed8' },
  identiteCard: {
    backgroundColor: COLORS.primary[700], margin: SPACING.lg,
    borderRadius: RADIUS.xl, padding: SPACING.lg, ...SHADOWS.md,
  },
  identiteHeader: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  avatarBig: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarBigText: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  nom: { fontSize: 17, fontWeight: '800', color: COLORS.white, marginBottom: 4 },
  infoLine: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  assuranceRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  assuranceBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  assuranceText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  assuranceNum: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  alerteBox: {
    backgroundColor: '#fff7ed', borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.lg, marginBottom: SPACING.lg,
    padding: SPACING.lg, borderWidth: 1, borderColor: '#fed7aa',
  },
  alerteTitle: { fontSize: 13, fontWeight: '700', color: '#9a3412', marginBottom: SPACING.sm },
  alerteItem: { fontSize: 13, color: '#9a3412', marginTop: 2 },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  sectionTitle: { ...TYPOGRAPHY.label, color: COLORS.gray[500], textTransform: 'uppercase', marginBottom: SPACING.sm },
  listCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, ...SHADOWS.sm },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, padding: SPACING.md },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.gray[100] },
  listDot: { color: COLORS.primary[500], fontSize: 10, marginTop: 4 },
  listText: { flex: 1, fontSize: 13, color: COLORS.gray[700] },
  ordCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.sm, ...SHADOWS.sm },
  ordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  ordDate: { fontSize: 13, fontWeight: '700', color: COLORS.gray[900] },
  ordMedecin: { fontSize: 12, color: COLORS.gray[500], marginTop: 2 },
  ordStatut: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  ordStatutText: { fontSize: 11, fontWeight: '700' },
  ordMedicaments: { gap: 4 },
  ordMedicament: { fontSize: 13, color: COLORS.gray[700] },
  vaccRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md },
  vaccDot: { width: 10, height: 10, borderRadius: 5 },
  vaccInfo: { flex: 1 },
  vaccNom: { fontSize: 13, fontWeight: '600', color: COLORS.gray[900] },
  vaccDate: { fontSize: 11, color: COLORS.gray[500], marginTop: 2 },
});
