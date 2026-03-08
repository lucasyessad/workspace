// ============================================================
// TabibPro Mobile — Liste Patients (Professionnel)
// Recherche, filtres, accès dossiers
// ============================================================

import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/lib/theme';

interface Patient {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  telephone: string;
  assurance: 'CNAS' | 'CASNOS' | 'AUCUN';
  dernierRdv: string;
  pathologies: string[];
}

const PATIENTS_DEMO: Patient[] = [
  { id: '1', nom: 'Benali', prenom: 'Amina', dateNaissance: '12/04/1985', telephone: '0555 12 34 56', assurance: 'CNAS', dernierRdv: '27/02/2026', pathologies: ['Diabète T2', 'HTA'] },
  { id: '2', nom: 'Boudiaf', prenom: 'Karim', dateNaissance: '03/09/1978', telephone: '0661 98 76 54', assurance: 'CASNOS', dernierRdv: '27/02/2026', pathologies: ['Diabète T2'] },
  { id: '3', nom: 'Hamidi', prenom: 'Soraya', dateNaissance: '22/11/1990', telephone: '0770 11 22 33', assurance: 'AUCUN', dernierRdv: '27/02/2026', pathologies: [] },
  { id: '4', nom: 'Khelif', prenom: 'Yacine', dateNaissance: '07/02/2000', telephone: '0550 44 55 66', assurance: 'CNAS', dernierRdv: '27/02/2026', pathologies: [] },
  { id: '5', nom: 'Meddah', prenom: 'Fatima', dateNaissance: '15/07/1965', telephone: '0663 77 88 99', assurance: 'CASNOS', dernierRdv: '12/01/2026', pathologies: ['HTA', 'Insuffisance rénale'] },
  { id: '6', nom: 'Zouaoui', prenom: 'Ahmed', dateNaissance: '30/03/1972', telephone: '0555 00 11 22', assurance: 'CNAS', dernierRdv: '05/12/2025', pathologies: ['Asthme'] },
];

const ASSURANCE_COLOR: Record<string, { bg: string; text: string }> = {
  CNAS: { bg: '#d1fae5', text: '#065f46' },
  CASNOS: { bg: '#ede9fe', text: '#5b21b6' },
  AUCUN: { bg: COLORS.gray[100], text: COLORS.gray[500] },
};

function PatientCard({ patient }: { patient: Patient }) {
  const ass = ASSURANCE_COLOR[patient.assurance];
  const initiales = `${patient.prenom.charAt(0)}${patient.nom.charAt(0)}`;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View style={styles.cardLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initiales}</Text>
        </View>
        <View style={styles.infos}>
          <Text style={styles.nom}>{patient.prenom} {patient.nom}</Text>
          <Text style={styles.detail}>Né(e) le {patient.dateNaissance}</Text>
          <Text style={styles.detail}>📞 {patient.telephone}</Text>
          {patient.pathologies.length > 0 && (
            <View style={styles.pathosRow}>
              {patient.pathologies.map((p) => (
                <View key={p} style={styles.pathoBadge}>
                  <Text style={styles.pathoText}>{p}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      <View style={styles.cardRight}>
        <View style={[styles.assuranceBadge, { backgroundColor: ass.bg }]}>
          <Text style={[styles.assuranceText, { color: ass.text }]}>{patient.assurance}</Text>
        </View>
        <Text style={styles.dernierRdv}>Dernière visite{'\n'}{patient.dernierRdv}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ProPatientsScreen() {
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = PATIENTS_DEMO.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.nom.toLowerCase().includes(q) ||
      p.prenom.toLowerCase().includes(q) ||
      p.telephone.includes(q)
    );
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Patients ({PATIENTS_DEMO.length})</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Nouveau</Text>
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Nom, prénom ou téléphone..."
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary[600]} />}
        renderItem={({ item }) => <PatientCard patient={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun patient trouvé</Text>
          </View>
        }
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
  addBtn: {
    backgroundColor: COLORS.primary[600], borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  addBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginHorizontal: SPACING.lg, marginVertical: SPACING.md,
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.gray[200], ...SHADOWS.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.gray[800] },
  list: { padding: SPACING.lg, paddingTop: 0 },
  sep: { height: SPACING.sm },
  card: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.md, ...SHADOWS.sm,
  },
  cardLeft: { flexDirection: 'row', gap: SPACING.md, flex: 1 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary[100], alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800', color: COLORS.primary[700] },
  infos: { flex: 1 },
  nom: { fontSize: 15, fontWeight: '700', color: COLORS.gray[900] },
  detail: { fontSize: 12, color: COLORS.gray[500], marginTop: 2 },
  pathosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  pathoBadge: {
    backgroundColor: '#fef3c7', borderRadius: RADIUS.full,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  pathoText: { fontSize: 10, fontWeight: '600', color: '#92400e' },
  cardRight: { alignItems: 'flex-end', gap: SPACING.sm },
  assuranceBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  assuranceText: { fontSize: 11, fontWeight: '700' },
  dernierRdv: { fontSize: 10, color: COLORS.gray[400], textAlign: 'right', lineHeight: 14 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, color: COLORS.gray[500] },
});
