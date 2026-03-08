// ============================================================
// TabibPro Mobile — Inscription Patient
// Étape 1: Téléphone → Étape 2: OTP → Étape 3: Infos + consentement
// ============================================================

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Switch,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/store/auth.store';
import { useI18n } from '@/i18n/use-i18n';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/lib/theme';

type Step = 'phone' | 'otp' | 'details';

export default function PatientRegisterScreen() {
  const { t } = useI18n();
  const { setSession } = useAuthStore();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [consentLoi, setConsentLoi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ─── Étape 1 : Envoi OTP ────────────────────────────────
  const handleSendOtp = async () => {
    if (!phone || phone.length < 9) {
      setError('Numéro de téléphone invalide.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // TODO: await api.post('/auth/patient/send-otp', { phone: `+213${phone}` });
      setStep('otp');
    } catch {
      setError('Impossible d\'envoyer le code. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Étape 2 : Vérification OTP ─────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Le code doit contenir 6 chiffres.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // TODO: await api.post('/auth/patient/verify-otp', { phone: `+213${phone}`, otp });
      setStep('details');
    } catch {
      setError('Code incorrect ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Étape 3 : Création du compte ───────────────────────
  const handleCreateAccount = async () => {
    if (!nom || !prenom || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (!consentLoi) {
      setError('Vous devez accepter le traitement de vos données (Loi 18-07).');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // TODO: await api.post('/auth/patient/register', { phone, nom, prenom, password, consentLoi });
      setSession({
        userId: 'patient-new',
        role: 'PATIENT',
        nom,
        prenom,
        email: '',
        token: 'new-token',
        refreshToken: 'new-refresh',
      });
      router.replace('/patient/(tabs)/accueil');
    } catch {
      setError('Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels: Record<Step, string> = {
    phone: 'Téléphone',
    otp: 'Vérification',
    details: 'Informations',
  };

  const stepIndex = { phone: 0, otp: 1, details: 2 }[step];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <TouchableOpacity
            onPress={() => step === 'phone' ? router.back() : setStep(step === 'otp' ? 'phone' : 'otp')}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>‹ Retour</Text>
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.title}>{t('auth.register')}</Text>
          <Text style={styles.subtitle}>{t('welcome.patient_mode')}</Text>
        </Animated.View>

        {/* Indicateur d'étapes */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.stepsRow}>
          {(['phone', 'otp', 'details'] as Step[]).map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepCircle, i <= stepIndex && styles.stepCircleActive]}>
                <Text style={[styles.stepNum, i <= stepIndex && styles.stepNumActive]}>
                  {i < stepIndex ? '✓' : String(i + 1)}
                </Text>
              </View>
              <Text style={[styles.stepLabel, i <= stepIndex && styles.stepLabelActive]}>
                {stepLabels[s]}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Formulaire */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.form}>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* ── Étape 1 : Téléphone ── */}
          {step === 'phone' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('auth.phone')} *</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.phonePrefix}>
                    <Text style={styles.phonePrefixText}>🇩🇿 +213</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="0XX XX XX XX"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    autoComplete="tel"
                    autoFocus
                  />
                </View>
              </View>

              <Text style={styles.hint}>
                Un code de vérification sera envoyé par SMS sur ce numéro.
              </Text>

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={styles.btnText}>
                  {loading ? 'Envoi du code...' : 'Recevoir le code SMS →'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Étape 2 : OTP ── */}
          {step === 'otp' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('auth.mfa_code')} *</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="· · · · · ·"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  autoFocus
                  textAlign="center"
                />
              </View>

              <Text style={styles.hint}>
                Code envoyé au +213 {phone.slice(0, 3)}** ** **
              </Text>

              <TouchableOpacity
                style={[styles.btn, (loading || otp.length !== 6) && styles.btnDisabled]}
                onPress={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                activeOpacity={0.85}
              >
                <Text style={styles.btnText}>
                  {loading ? 'Vérification...' : 'Vérifier le code →'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resendBtn} onPress={() => { setOtp(''); setStep('phone'); }}>
                <Text style={styles.resendText}>Changer de numéro</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Étape 3 : Infos + Consentement ── */}
          {step === 'details' && (
            <>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Prénom *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Amina"
                    value={prenom}
                    onChangeText={setPrenom}
                    autoCapitalize="words"
                    autoFocus
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Nom *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Benali"
                    value={nom}
                    onChangeText={setNom}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('auth.password')} *</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Minimum 8 caractères"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    autoComplete="new-password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Consentement Loi 18-07 */}
              <View style={styles.consentBox}>
                <Switch
                  value={consentLoi}
                  onValueChange={setConsentLoi}
                  trackColor={{ false: COLORS.gray[300], true: COLORS.primary[400] }}
                  thumbColor={consentLoi ? COLORS.primary[600] : COLORS.gray[400]}
                />
                <Text style={styles.consentText}>
                  J'accepte que TabibPro traite mes données de santé conformément à la{' '}
                  <Text style={styles.consentLink}>Loi 18-07</Text> relative à la protection des données personnelles.
                  Ces données sont stockées localement en Algérie.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.btn, (loading || !consentLoi) && styles.btnDisabled]}
                onPress={handleCreateAccount}
                disabled={loading || !consentLoi}
                activeOpacity={0.85}
              >
                <Text style={styles.btnText}>
                  {loading ? 'Création du compte...' : '✓ Créer mon compte'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Déjà un compte */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/patient-login')}>
              <Text style={styles.loginLink}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  scroll: { flexGrow: 1, padding: SPACING.xxl },
  header: { alignItems: 'center', marginBottom: SPACING.lg, marginTop: SPACING.xl },
  backBtn: { alignSelf: 'flex-start', marginBottom: SPACING.lg },
  backText: { color: COLORS.primary[600], fontSize: 16 },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.primary[100],
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  avatarEmoji: { fontSize: 32 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.gray[900] },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.gray[500], marginTop: 4 },
  stepsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  stepItem: { alignItems: 'center', gap: SPACING.xs },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.gray[200], alignItems: 'center', justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: COLORS.primary[600] },
  stepNum: { fontSize: 13, fontWeight: '700', color: COLORS.gray[500] },
  stepNumActive: { color: COLORS.white },
  stepLabel: { ...TYPOGRAPHY.caption, color: COLORS.gray[400] },
  stepLabelActive: { color: COLORS.primary[600], fontWeight: '600' },
  form: { gap: SPACING.lg },
  errorBox: {
    backgroundColor: '#FEF2F2', borderRadius: RADIUS.md,
    padding: SPACING.md, borderWidth: 1, borderColor: '#FCA5A5',
  },
  errorText: { color: COLORS.danger, fontSize: 14 },
  inputGroup: { gap: SPACING.xs },
  label: { ...TYPOGRAPHY.label, color: COLORS.gray[700], textTransform: 'uppercase' },
  input: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.gray[200],
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    fontSize: 15, ...SHADOWS.sm,
  },
  otpInput: {
    fontSize: 28, fontWeight: '700', letterSpacing: 12,
    paddingVertical: SPACING.lg,
  },
  phoneRow: { flexDirection: 'row', gap: SPACING.sm },
  phonePrefix: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.gray[200],
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    justifyContent: 'center', ...SHADOWS.sm,
  },
  phonePrefixText: { fontSize: 14, color: COLORS.gray[700] },
  phoneInput: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.gray[200],
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    fontSize: 15, ...SHADOWS.sm,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.gray[200],
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    fontSize: 15, ...SHADOWS.sm,
  },
  eyeBtn: { position: 'absolute', right: SPACING.md },
  eyeText: { fontSize: 18 },
  row: { flexDirection: 'row', gap: SPACING.sm },
  hint: { ...TYPOGRAPHY.bodySmall, color: COLORS.gray[500], textAlign: 'center' },
  btn: {
    backgroundColor: COLORS.primary[600], borderRadius: RADIUS.lg,
    paddingVertical: 14, alignItems: 'center', marginTop: SPACING.sm, ...SHADOWS.md,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  resendBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  resendText: { color: COLORS.primary[600], fontSize: 14 },
  consentBox: {
    flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start',
    backgroundColor: COLORS.primary[50], borderRadius: RADIUS.md,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.primary[200],
  },
  consentText: { ...TYPOGRAPHY.bodySmall, color: COLORS.gray[700], flex: 1, lineHeight: 18 },
  consentLink: { color: COLORS.primary[600], fontWeight: '600' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.sm },
  loginText: { color: COLORS.gray[500], fontSize: 14 },
  loginLink: { color: COLORS.primary[600], fontSize: 14, fontWeight: '600' },
});
