// ============================================================
// TabibPro Mobile — Agenda Professionnel
// Vue semaine — weekend DZ : Vendredi + Samedi
// ============================================================

import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/lib/theme';

type StatutRdv = 'CONFIRME' | 'EN_ATTENTE' | 'ANNULE' | 'TERMINE';

interface Rdv {
  id: string;
  heure: string;
  patient: string;
  motif: string;
  statut: StatutRdv;
  dureeMin: number;
  typePaiement: 'CNAS' | 'CASNOS' | 'AUCUN';
}

// Jours de la semaine courante (DZ : Dim-Jeu travail, Ven-Sam repos)
function getWeekDays(baseDate: Date) {
  const days = [];
  // Trouver le dimanche de la semaine en cours (début semaine algérienne)
  const day = baseDate.getDay();
  const diff = day === 0 ? 0 : -day;
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + diff + i);
    days.push(d);
  }
  return days;
}

const JOURS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const WEEKEND_DZ = [5, 6]; // Vendredi=5, Samedi=6

const RDV_PAR_JOUR: Record<string, Rdv[]> = {
  '0': [ // Dimanche
    { id: '1', heure: '08:00', patient: 'Benali Amina', motif: 'Consultation générale', statut: 'TERMINE', dureeMin: 20, typePaiement: 'CNAS' },
    { id: '2', heure: '08:30', patient: 'Boudiaf Karim', motif: 'Suivi diabète', statut: 'TERMINE', dureeMin: 30, typePaiement: 'CASNOS' },
    { id: '3', heure: '10:00', patient: 'Hamidi Soraya', motif: 'Renouvellement ordonnance', statut: 'CONFIRME', dureeMin: 15, typePaiement: 'AUCUN' },
    { id: '4', heure: '10:30', patient: 'Khelif Yacine', motif: 'Bilan de santé', statut: 'EN_ATTENTE', dureeMin: 30, typePaiement: 'CNAS' },
  ],
  '1': [
    { id: '5', heure: '09:00', patient: 'Meddah Fatima', motif: 'Consultation HTA', statut: 'CONFIRME', dureeMin: 20, typePaiement: 'CASNOS' },
    { id: '6', heure: '11:00', patient: 'Zouaoui Ahmed', motif: 'Asthme — contrôle', statut: 'EN_ATTENTE', dureeMin: 25, typePaiement: 'AUCUN' },
  ],
};

const STATUT_STYLE: Record<StatutRdv, { bg: string; text: string; bar: string }> = {
  TERMINE:    { bg: '#d1fae5', text: '#065f46', bar: '#34d399' },
  CONFIRME:   { bg: COLORS.primary[50], text: COLORS.primary[700], bar: COLORS.primary[500] },
  EN_ATTENTE: { bg: COLORS.gray[100], text: COLORS.gray[600], bar: COLORS.gray[300] },
  ANNULE:     { bg: '#fee2e2', text: '#991b1b', bar: '#f87171' },
};

export default function ProAgendaScreen() {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDay());
  const weekDays = getWeekDays(today);

  const rdvsDuJour = RDV_PAR_JOUR[String(selectedDay % 2)] ?? [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Agenda</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ RDV</Text>
        </TouchableOpacity>
      </View>

      {/* Sélecteur de jours */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.weekScroll}
        contentContainerStyle={styles.weekContent}
      >
        {weekDays.map((d) => {
          const dow = d.getDay();
          const isToday = d.toDateString() === today.toDateString();
          const isSelected = dow === selectedDay;
          const isWeekend = WEEKEND_DZ.includes(dow);

          return (
            <TouchableOpacity
              key={dow}
              style={[
                styles.dayBtn,
                isSelected && styles.dayBtnSelected,
                isWeekend && styles.dayBtnWeekend,
              ]}
              onPress={() => !isWeekend && setSelectedDay(dow)}
              disabled={isWeekend}
            >
              <Text style={[styles.dayName, isSelected && styles.dayNameSelected, isWeekend && styles.dayNameWeekend]}>
                {JOURS_FR[dow]}
              </Text>
              <Text style={[styles.dayNum, isSelected && styles.dayNumSelected, isWeekend && styles.dayNameWeekend]}>
                {d.getDate()}
              </Text>
              {isToday && !isSelected && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Label jour sélectionné */}
      <View style={styles.dayLabel}>
        <Text style={styles.dayLabelText}>
          {new Intl.DateTimeFormat('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long' })
            .format(weekDays[selectedDay])}
        </Text>
        <Text style={styles.dayLabelCount}>{rdvsDuJour.length} rendez-vous</Text>
      </View>

      {/* Liste RDV */}
      <ScrollView contentContainerStyle={styles.rdvList} showsVerticalScrollIndicator={false}>
        {rdvsDuJour.length === 0 ? (
          <View style={styles.emptyDay}>
            <Text style={styles.emptyDayIcon}>📅</Text>
            <Text style={styles.emptyDayText}>Aucun rendez-vous ce jour</Text>
          </View>
        ) : (
          rdvsDuJour.map((rdv) => {
            const statut = STATUT_STYLE[rdv.statut];
            return (
              <TouchableOpacity key={rdv.id} style={styles.rdvCard} activeOpacity={0.85}>
                <View style={[styles.rdvBar, { backgroundColor: statut.bar }]} />
                <View style={styles.rdvContent}>
                  <View style={styles.rdvHeader}>
                    <Text style={styles.rdvHeure}>{rdv.heure}</Text>
                    <Text style={styles.rdvDuree}>{rdv.dureeMin} min</Text>
                    <View style={[styles.rdvStatut, { backgroundColor: statut.bg }]}>
                      <Text style={[styles.rdvStatutText, { color: statut.text }]}>
                        {rdv.statut === 'EN_ATTENTE' ? 'En attente' : rdv.statut === 'CONFIRME' ? 'Confirmé' : rdv.statut === 'TERMINE' ? 'Terminé' : 'Annulé'}
                      </Text>
                    </View>
                    {rdv.typePaiement !== 'AUCUN' && (
                      <View style={styles.cnasBadge}>
                        <Text style={styles.cnasBadgeText}>{rdv.typePaiement}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.rdvPatient}>{rdv.patient}</Text>
                  <Text style={styles.rdvMotif}>{rdv.motif}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Bouton ajouter créneau */}
        <TouchableOpacity style={styles.addSlotBtn}>
          <Text style={styles.addSlotBtnText}>+ Ajouter un créneau</Text>
        </TouchableOpacity>
      </ScrollView>
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
  weekScroll: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100] },
  weekContent: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, gap: SPACING.sm },
  dayBtn: {
    width: 48, alignItems: 'center', paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  dayBtnSelected: { backgroundColor: COLORS.primary[600] },
  dayBtnWeekend: { opacity: 0.35 },
  dayName: { fontSize: 11, fontWeight: '600', color: COLORS.gray[500] },
  dayNameSelected: { color: COLORS.white },
  dayNameWeekend: { color: COLORS.gray[400] },
  dayNum: { fontSize: 18, fontWeight: '800', color: COLORS.gray[900], marginTop: 2 },
  dayNumSelected: { color: COLORS.white },
  todayDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: COLORS.primary[500], marginTop: 3,
  },
  dayLabel: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  dayLabelText: { fontSize: 14, fontWeight: '600', color: COLORS.gray[800] },
  dayLabelCount: { fontSize: 12, color: COLORS.gray[500] },
  rdvList: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl, gap: SPACING.sm },
  rdvCard: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl, overflow: 'hidden', ...SHADOWS.sm,
  },
  rdvBar: { width: 4 },
  rdvContent: { flex: 1, padding: SPACING.md },
  rdvHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  rdvHeure: { fontSize: 14, fontWeight: '800', color: COLORS.gray[900] },
  rdvDuree: { fontSize: 11, color: COLORS.gray[400] },
  rdvStatut: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2 },
  rdvStatutText: { fontSize: 10, fontWeight: '700' },
  cnasBadge: { backgroundColor: '#dbeafe', borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 2 },
  cnasBadgeText: { fontSize: 10, fontWeight: '700', color: '#1d4ed8' },
  rdvPatient: { fontSize: 14, fontWeight: '700', color: COLORS.gray[900] },
  rdvMotif: { fontSize: 12, color: COLORS.gray[500], marginTop: 2 },
  emptyDay: { alignItems: 'center', paddingTop: 60, gap: SPACING.md },
  emptyDayIcon: { fontSize: 40 },
  emptyDayText: { fontSize: 14, color: COLORS.gray[500] },
  addSlotBtn: {
    borderWidth: 1, borderColor: COLORS.primary[200], borderStyle: 'dashed',
    borderRadius: RADIUS.xl, paddingVertical: SPACING.lg, alignItems: 'center', marginTop: SPACING.sm,
  },
  addSlotBtnText: { fontSize: 14, color: COLORS.primary[600], fontWeight: '600' },
});
