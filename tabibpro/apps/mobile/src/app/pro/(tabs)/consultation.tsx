// ============================================================
// TabibPro Mobile — Consultation Rapide (Professionnel)
// Saisie constantes, diagnostic, ordonnance, IA
// ============================================================

import { useState } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/lib/theme';

type Etape = 'PATIENT' | 'CONSTANTES' | 'CLINIQUE' | 'ORDONNANCE';

const ETAPES: { key: Etape; label: string; emoji: string }[] = [
  { key: 'PATIENT', label: 'Patient', emoji: '👤' },
  { key: 'CONSTANTES', label: 'Constantes', emoji: '🩺' },
  { key: 'CLINIQUE', label: 'Clinique', emoji: '📋' },
  { key: 'ORDONNANCE', label: 'Ordonnance', emoji: '💊' },
];

export default function ProConsultationScreen() {
  const [etape, setEtape] = useState<Etape>('PATIENT');
  const [tiersPayant, setTiersPayant] = useState(false);
  const [constantes, setConstantes] = useState({
    ta: '', pouls: '', temperature: '', poids: '', taille: '', spo2: '',
  });
  const [diagnostic, setDiagnostic] = useState('');
  const [notesMedecin, setNotesMedecin] = useState('');
  const [iaQuery, setIaQuery] = useState('');
  const [iaSuggestion, setIaSuggestion] = useState('');
  const [iaLoading, setIaLoading] = useState(false);

  const demanderIA = async () => {
    if (!iaQuery.trim()) return;
    setIaLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIaSuggestion('Sur la base des éléments décrits, les hypothèses à explorer incluent :\n1. Hypertension non contrôlée\n2. Syndrome d\'anxiété\n\n⚠️ Suggestion uniquement — décision médicale appartient au praticien.');
    setIaLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Nouvelle consultation</Text>
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>

      {/* Stepper */}
      <View style={styles.stepper}>
        {ETAPES.map((e, i) => (
          <TouchableOpacity
            key={e.key}
            style={[styles.stepBtn, etape === e.key && styles.stepBtnActive]}
            onPress={() => setEtape(e.key)}
          >
            <Text style={[styles.stepEmoji, etape === e.key && styles.stepEmojiActive]}>{e.emoji}</Text>
            <Text style={[styles.stepLabel, etape === e.key && styles.stepLabelActive]}>{e.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ---- ETAPE PATIENT ---- */}
        {etape === 'PATIENT' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patient</Text>

            <TouchableOpacity style={styles.patientSelector}>
              <Text style={styles.patientSelectorText}>🔍 Rechercher un patient...</Text>
            </TouchableOpacity>

            {/* Patient sélectionné (démo) */}
            <View style={styles.patientCard}>
              <View style={styles.patientAvatar}>
                <Text style={styles.patientAvatarText}>AB</Text>
              </View>
              <View style={styles.patientInfo}>
                <Text style={styles.patientNom}>Benali Amina</Text>
                <Text style={styles.patientDetail}>Née le 12/04/1985 · 40 ans</Text>
                <Text style={styles.patientDetail}>📞 0555 12 34 56 · CNAS</Text>
                <View style={styles.allergiesBox}>
                  <Text style={styles.allergiesTitle}>⚠️ Allergies : </Text>
                  <Text style={styles.allergiesText}>Pénicilline, Aspirine</Text>
                </View>
              </View>
            </View>

            {/* Tiers payant */}
            <View style={styles.tiersRow}>
              <Text style={styles.tiersLabel}>Tiers payant CNAS</Text>
              <Switch
                value={tiersPayant}
                onValueChange={setTiersPayant}
                trackColor={{ true: COLORS.primary[500] }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>
        )}

        {/* ---- ETAPE CONSTANTES ---- */}
        {etape === 'CONSTANTES' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Constantes vitales</Text>

            <View style={styles.constantesGrid}>
              {[
                { key: 'ta', label: 'Tension (mmHg)', placeholder: '120/80', keyb: 'default' as const },
                { key: 'pouls', label: 'Pouls (bpm)', placeholder: '72', keyb: 'numeric' as const },
                { key: 'temperature', label: 'Température (°C)', placeholder: '37.0', keyb: 'decimal-pad' as const },
                { key: 'poids', label: 'Poids (kg)', placeholder: '70', keyb: 'decimal-pad' as const },
                { key: 'taille', label: 'Taille (cm)', placeholder: '170', keyb: 'numeric' as const },
                { key: 'spo2', label: 'SpO2 (%)', placeholder: '98', keyb: 'numeric' as const },
              ].map((field) => (
                <View key={field.key} style={styles.constanteInput}>
                  <Text style={styles.inputLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={field.placeholder}
                    keyboardType={field.keyb}
                    value={(constantes as any)[field.key]}
                    onChangeText={(v) => setConstantes((prev) => ({ ...prev, [field.key]: v }))}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ---- ETAPE CLINIQUE ---- */}
        {etape === 'CLINIQUE' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Examen clinique & Diagnostic</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Motif de consultation *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Décrivez le motif..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Examen clinique</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Examen clinique détaillé..."
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Diagnostic principal</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: HTA stade 2, Diabète T2..."
                value={diagnostic}
                onChangeText={setDiagnostic}
              />
            </View>

            {/* Assistant IA */}
            <View style={styles.iaPanel}>
              <View style={styles.iaPanelHeader}>
                <Text style={styles.iaPanelTitle}>🤖 Assistant IA (anonymisé)</Text>
              </View>
              <TextInput
                style={[styles.textInput, { marginBottom: SPACING.sm }]}
                placeholder="Décrire les symptômes pour aide au diagnostic..."
                value={iaQuery}
                onChangeText={setIaQuery}
              />
              <TouchableOpacity
                style={[styles.iaBtn, iaLoading && styles.iaBtnDisabled]}
                onPress={demanderIA}
                disabled={iaLoading}
              >
                <Text style={styles.iaBtnText}>
                  {iaLoading ? 'Analyse...' : 'Demander à l\'IA →'}
                </Text>
              </TouchableOpacity>
              {iaSuggestion ? (
                <View style={styles.iaSuggestion}>
                  <Text style={styles.iaSuggestionText}>{iaSuggestion}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes confidentielles</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Notes privées — non partagées avec le patient..."
                multiline
                numberOfLines={3}
                value={notesMedecin}
                onChangeText={setNotesMedecin}
              />
            </View>
          </View>
        )}

        {/* ---- ETAPE ORDONNANCE ---- */}
        {etape === 'ORDONNANCE' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ordonnance</Text>

            <View style={styles.ordTypeRow}>
              {['STANDARD', 'BIZONE', 'CHRONIQUE', 'STUPEFIANT'].map((t) => (
                <TouchableOpacity key={t} style={styles.ordTypeBtn}>
                  <Text style={styles.ordTypeBtnText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.addMedBtn}>
              <Text style={styles.addMedBtnText}>+ Ajouter un médicament</Text>
            </TouchableOpacity>

            {/* Ligne ordonnance démo */}
            <View style={styles.ligneOrd}>
              <View style={styles.ligneOrdHeader}>
                <Text style={styles.ligneOrdNom}>Metformine 850mg</Text>
                <TouchableOpacity><Text style={styles.ligneOrdDelete}>✕</Text></TouchableOpacity>
              </View>
              <Text style={styles.ligneOrdDetail}>DCI : Metformine · 1 cp matin + 1 cp soir · 90 jours</Text>
              <Text style={styles.ligneOrdRemb}>Remboursable CNAS à 80%</Text>
            </View>

            <View style={styles.ligneOrd}>
              <View style={styles.ligneOrdHeader}>
                <Text style={styles.ligneOrdNom}>Amlodipine 5mg</Text>
                <TouchableOpacity><Text style={styles.ligneOrdDelete}>✕</Text></TouchableOpacity>
              </View>
              <Text style={styles.ligneOrdDetail}>DCI : Amlodipine · 1 cp soir · 30 jours</Text>
              <Text style={styles.ligneOrdRemb}>Remboursable CNAS à 100%</Text>
            </View>

            <TextInput
              style={[styles.textInput, styles.textArea, { marginTop: SPACING.md }]}
              placeholder="Instructions générales pour le patient..."
              multiline
              numberOfLines={2}
            />

            <TouchableOpacity style={styles.printBtn}>
              <Text style={styles.printBtnText}>🖨️ Générer & Imprimer</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  saveBtn: {
    backgroundColor: COLORS.primary[600], borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  saveBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  stepper: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.gray[100],
  },
  stepBtn: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm },
  stepBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary[600] },
  stepEmoji: { fontSize: 18, opacity: 0.5 },
  stepEmojiActive: { opacity: 1 },
  stepLabel: { fontSize: 9, color: COLORS.gray[400], fontWeight: '600', marginTop: 2 },
  stepLabelActive: { color: COLORS.primary[600] },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  section: { gap: SPACING.md },
  sectionTitle: { ...TYPOGRAPHY.label, color: COLORS.gray[500], textTransform: 'uppercase' },
  patientSelector: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.gray[200], borderStyle: 'dashed',
    padding: SPACING.lg, alignItems: 'center', ...SHADOWS.sm,
  },
  patientSelectorText: { color: COLORS.gray[400], fontSize: 14 },
  patientCard: {
    flexDirection: 'row', gap: SPACING.md, backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl, padding: SPACING.lg, ...SHADOWS.sm,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary[500],
  },
  patientAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.primary[100], alignItems: 'center', justifyContent: 'center',
  },
  patientAvatarText: { fontSize: 16, fontWeight: '800', color: COLORS.primary[700] },
  patientInfo: { flex: 1 },
  patientNom: { fontSize: 16, fontWeight: '700', color: COLORS.gray[900] },
  patientDetail: { fontSize: 12, color: COLORS.gray[500], marginTop: 2 },
  allergiesBox: { flexDirection: 'row', marginTop: 4 },
  allergiesTitle: { fontSize: 11, fontWeight: '700', color: '#9a3412' },
  allergiesText: { fontSize: 11, color: '#9a3412' },
  tiersRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.lg, ...SHADOWS.sm,
  },
  tiersLabel: { fontSize: 14, fontWeight: '600', color: COLORS.gray[700] },
  constantesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  constanteInput: { width: '47%' },
  inputGroup: { gap: SPACING.xs },
  inputLabel: { ...TYPOGRAPHY.label, color: COLORS.gray[600], fontSize: 11, textTransform: 'uppercase' },
  textInput: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.gray[200],
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    fontSize: 14, color: COLORS.gray[900], ...SHADOWS.sm,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  iaPanel: {
    backgroundColor: '#f5f3ff', borderRadius: RADIUS.xl,
    padding: SPACING.lg, borderWidth: 1, borderColor: '#ddd6fe',
  },
  iaPanelHeader: { marginBottom: SPACING.sm },
  iaPanelTitle: { fontSize: 13, fontWeight: '700', color: '#5b21b6' },
  iaBtn: {
    backgroundColor: '#7c3aed', borderRadius: RADIUS.lg,
    paddingVertical: 10, alignItems: 'center',
  },
  iaBtnDisabled: { opacity: 0.5 },
  iaBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  iaSuggestion: {
    marginTop: SPACING.md, backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: '#ddd6fe',
  },
  iaSuggestionText: { fontSize: 12, color: COLORS.gray[700], lineHeight: 18 },
  ordTypeRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  ordTypeBtn: {
    backgroundColor: COLORS.gray[100], borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  ordTypeBtnText: { fontSize: 11, fontWeight: '600', color: COLORS.gray[600] },
  addMedBtn: {
    borderWidth: 1, borderColor: COLORS.primary[200], borderStyle: 'dashed',
    borderRadius: RADIUS.xl, paddingVertical: 12, alignItems: 'center',
  },
  addMedBtnText: { color: COLORS.primary[600], fontSize: 14, fontWeight: '600' },
  ligneOrd: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.md, ...SHADOWS.sm, borderLeftWidth: 3, borderLeftColor: COLORS.primary[400],
  },
  ligneOrdHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ligneOrdNom: { fontSize: 14, fontWeight: '700', color: COLORS.gray[900] },
  ligneOrdDelete: { color: COLORS.gray[400], fontSize: 16 },
  ligneOrdDetail: { fontSize: 12, color: COLORS.gray[600], marginTop: 4 },
  ligneOrdRemb: { fontSize: 11, color: '#059669', marginTop: 2, fontWeight: '600' },
  printBtn: {
    backgroundColor: COLORS.primary[700], borderRadius: RADIUS.xl,
    paddingVertical: 14, alignItems: 'center', marginTop: SPACING.md, ...SHADOWS.md,
  },
  printBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});
