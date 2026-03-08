// ============================================================
// TabibPro Mobile — Connexion Professionnel
// Email + Mot de passe + MFA (6 chiffres)
// ============================================================

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/store/auth.store';
import { useI18n } from '@/i18n/use-i18n';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/lib/theme';

type Step = 'credentials' | 'mfa';

export default function ProLoginScreen() {
  const { t } = useI18n();
  const { setSession } = useAuthStore();
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentials = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // TODO: Appel API réel — vérifier credentials, recevoir OTP par SMS/Email
      // const res = await api.post('/auth/pro/login', { email, password });
      setStep('mfa');
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfa = async () => {
    if (mfaCode.length !== 6) {
      setError('Le code MFA doit contenir 6 chiffres.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // TODO: Appel API réel — vérifier code MFA
      // const res = await api.post('/auth/pro/mfa', { email, code: mfaCode });
      setSession({
        userId: 'pro-demo',
        role: 'MEDECIN',
        nom: 'Meziane',
        prenom: 'Karim',
        email,
        token: 'demo-token-pro',
        refreshToken: 'demo-refresh-pro',
        numeroCnom: 'CNOM-16-2018-042',
        specialite: 'Médecine générale',
      });
      router.replace('/pro/(tabs)/dashboard');
    } catch {
      setError('Code MFA invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <TouchableOpacity onPress={() => step === 'mfa' ? setStep('credentials') : router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Retour</Text>
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>🩺</Text>
          </View>
          <Text style={styles.title}>{t('welcome.pro_mode')}</Text>
          <Text style={styles.subtitle}>
            {step === 'credentials'
              ? 'Connectez-vous à votre espace professionnel'
              : 'Saisissez le code envoyé sur votre téléphone'}
          </Text>
        </Animated.View>

        {/* Indicateur d'étape */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.steps}>
          <View style={[styles.stepDot, step === 'credentials' && styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, step === 'mfa' && styles.stepDotActive]} />
        </Animated.View>

        {/* Formulaire */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.form}>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {step === 'credentials' ? (
            <>
              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('auth.email')} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="docteur@cabinet.dz"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Mot de passe */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('auth.password')} *</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    autoComplete="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>{t('auth.forgot_password')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                onPress={handleCredentials}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={styles.loginBtnText}>
                  {loading ? 'Vérification...' : 'Continuer →'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Code MFA */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('auth.mfa_code')} *</Text>
                <TextInput
                  style={[styles.input, styles.mfaInput]}
                  placeholder="· · · · · ·"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={mfaCode}
                  onChangeText={setMfaCode}
                  autoFocus
                  textAlign="center"
                />
              </View>

              <Text style={styles.mfaHint}>
                Code envoyé à {email.replace(/(.{2}).*(@.*)/, '$1***$2')}
              </Text>

              <TouchableOpacity
                style={[styles.loginBtn, (loading || mfaCode.length !== 6) && styles.loginBtnDisabled]}
                onPress={handleMfa}
                disabled={loading || mfaCode.length !== 6}
                activeOpacity={0.85}
              >
                <Text style={styles.loginBtnText}>
                  {loading ? 'Vérification...' : t('auth.login')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resendBtn} onPress={() => setMfaCode('')}>
                <Text style={styles.resendText}>Renvoyer le code</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Numéro CNOM */}
          <View style={styles.cnomBox}>
            <Text style={styles.cnomIcon}>🏥</Text>
            <Text style={styles.cnomText}>
              Réservé aux professionnels inscrits au CNOM Algérie
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  scroll: { flexGrow: 1, padding: SPACING.xxl },
  header: { alignItems: 'center', marginBottom: SPACING.xl, marginTop: SPACING.xl },
  backBtn: { alignSelf: 'flex-start', marginBottom: SPACING.xl },
  backText: { color: COLORS.accent[600], fontSize: 16 },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.accent[100],
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  avatarEmoji: { fontSize: 32 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.gray[900] },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.gray[500], marginTop: 4, textAlign: 'center' },
  steps: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, marginBottom: SPACING.xl,
  },
  stepDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.gray[300],
  },
  stepDotActive: { backgroundColor: COLORS.accent[500], width: 24, borderRadius: 5 },
  stepLine: { width: 40, height: 2, backgroundColor: COLORS.gray[200] },
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
  mfaInput: {
    fontSize: 28, fontWeight: '700', letterSpacing: 12,
    paddingVertical: SPACING.lg,
  },
  mfaHint: { ...TYPOGRAPHY.bodySmall, color: COLORS.gray[500], textAlign: 'center', marginTop: -SPACING.sm },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.gray[200],
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    fontSize: 15, ...SHADOWS.sm,
  },
  eyeBtn: { position: 'absolute', right: SPACING.md },
  eyeText: { fontSize: 18 },
  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: { color: COLORS.accent[600], fontSize: 13 },
  loginBtn: {
    backgroundColor: COLORS.accent[600], borderRadius: RADIUS.lg,
    paddingVertical: 14, alignItems: 'center', marginTop: SPACING.sm, ...SHADOWS.md,
  },
  loginBtnDisabled: { opacity: 0.5 },
  loginBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  resendBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  resendText: { color: COLORS.accent[600], fontSize: 14 },
  cnomBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primary[50], borderRadius: RADIUS.md,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.primary[200],
    marginTop: SPACING.sm,
  },
  cnomIcon: { fontSize: 18 },
  cnomText: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary[700], flex: 1 },
});
