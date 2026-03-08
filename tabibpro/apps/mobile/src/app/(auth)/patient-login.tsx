// ============================================================
// TabibPro Mobile — Connexion Patient
// Par téléphone (prioritaire) ou email
// ============================================================

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/store/auth.store';
import { useI18n } from '@/i18n/use-i18n';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/lib/theme';

export default function PatientLoginScreen() {
  const { t } = useI18n();
  const { setSession } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // TODO: Appel API réel
      // const res = await api.post('/auth/patient/login', { phone, password });
      setSession({
        userId: 'patient-demo',
        role: 'PATIENT',
        nom: 'Benali',
        prenom: 'Amina',
        email: '',
        token: 'demo-token',
        refreshToken: 'demo-refresh',
      });
      router.replace('/patient/(tabs)/accueil');
    } catch {
      setError('Numéro de téléphone ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Connexion TabibPro',
      fallbackLabel: 'Utiliser le mot de passe',
    });
    if (result.success) {
      // Connexion automatique avec token stocké
      router.replace('/patient/(tabs)/accueil');
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Retour</Text>
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.title}>{t('welcome.patient_mode')}</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre espace patient</Text>
        </Animated.View>

        {/* Formulaire */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.form}>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Téléphone */}
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
              />
            </View>
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

          {/* Bouton connexion */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>
              {loading ? 'Connexion...' : t('auth.login')}
            </Text>
          </TouchableOpacity>

          {/* Biométrique */}
          <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometric}>
            <Text style={styles.biometricIcon}>🔐</Text>
            <Text style={styles.biometricText}>{t('auth.biometric')}</Text>
          </TouchableOpacity>

          {/* Inscription */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>{t('auth.no_account')} </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/patient-register')}>
              <Text style={styles.registerLink}>{t('auth.register')}</Text>
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
  header: { alignItems: 'center', marginBottom: SPACING.xxxl, marginTop: SPACING.xl },
  backBtn: { alignSelf: 'flex-start', marginBottom: SPACING.xl },
  backText: { color: COLORS.primary[600], fontSize: 16 },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.primary[100],
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  avatarEmoji: { fontSize: 32 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.gray[900] },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.gray[500], marginTop: 4, textAlign: 'center' },
  form: { gap: SPACING.lg },
  errorBox: {
    backgroundColor: '#FEF2F2', borderRadius: RADIUS.md,
    padding: SPACING.md, borderWidth: 1, borderColor: '#FCA5A5',
  },
  errorText: { color: COLORS.danger, fontSize: 14 },
  inputGroup: { gap: SPACING.xs },
  label: { ...TYPOGRAPHY.label, color: COLORS.gray[700], textTransform: 'uppercase' },
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
  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: { color: COLORS.primary[600], fontSize: 13 },
  loginBtn: {
    backgroundColor: COLORS.primary[600], borderRadius: RADIUS.lg,
    paddingVertical: 14, alignItems: 'center', marginTop: SPACING.sm, ...SHADOWS.md,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  biometricBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.gray[200],
    backgroundColor: COLORS.white, ...SHADOWS.sm,
  },
  biometricIcon: { fontSize: 20 },
  biometricText: { color: COLORS.gray[700], fontSize: 14, fontWeight: '500' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.sm },
  registerText: { color: COLORS.gray[500], fontSize: 14 },
  registerLink: { color: COLORS.primary[600], fontSize: 14, fontWeight: '600' },
});
