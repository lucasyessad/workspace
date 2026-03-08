// ============================================================
// TabibPro Mobile — Écran d'accueil
// Choix du mode : Patient ou Professionnel
// ============================================================

import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '@/store/auth.store';
import { useI18n } from '@/i18n/use-i18n';
import { COLORS } from '@/lib/theme';

export default function WelcomeScreen() {
  const { session } = useAuthStore();
  const { t, locale, setLocale } = useI18n();

  // Rediriger si déjà connecté
  if (session?.role === 'PATIENT') {
    router.replace('/patient/(tabs)/accueil');
    return null;
  }
  if (session?.role && session.role !== 'PATIENT') {
    router.replace('/pro/(tabs)/dashboard');
    return null;
  }

  return (
    <LinearGradient
      colors={[COLORS.primary[700], COLORS.primary[500], COLORS.primary[400]]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* Logo */}
      <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>T</Text>
        </View>
        <Text style={styles.appName}>TabibPro</Text>
        <Text style={styles.tagline}>طبيب برو — Votre santé, notre priorité</Text>
      </Animated.View>

      {/* Boutons de mode */}
      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.buttonsContainer}>
        <Text style={styles.choiceLabel}>{t('welcome.choose_mode')}</Text>

        {/* Mode Patient */}
        <TouchableOpacity
          style={styles.modeCard}
          onPress={() => router.push('/(auth)/patient-login')}
          activeOpacity={0.85}
        >
          <View style={styles.modeIcon}>
            <Text style={styles.modeIconText}>👤</Text>
          </View>
          <View style={styles.modeInfo}>
            <Text style={styles.modeTitle}>{t('welcome.patient_mode')}</Text>
            <Text style={styles.modeDesc}>{t('welcome.patient_desc')}</Text>
          </View>
          <Text style={styles.modeArrow}>›</Text>
        </TouchableOpacity>

        {/* Mode Professionnel */}
        <TouchableOpacity
          style={[styles.modeCard, styles.modeCardPro]}
          onPress={() => router.push('/(auth)/pro-login')}
          activeOpacity={0.85}
        >
          <View style={[styles.modeIcon, styles.modeIconPro]}>
            <Text style={styles.modeIconText}>👨‍⚕️</Text>
          </View>
          <View style={styles.modeInfo}>
            <Text style={[styles.modeTitle, styles.modeTitlePro]}>
              {t('welcome.pro_mode')}
            </Text>
            <Text style={[styles.modeDesc, styles.modeDescPro]}>
              {t('welcome.pro_desc')}
            </Text>
          </View>
          <Text style={[styles.modeArrow, styles.modeArrowPro]}>›</Text>
        </TouchableOpacity>

        {/* Sélecteur de langue */}
        <View style={styles.langRow}>
          {(['fr', 'ar', 'ber', 'en'] as const).map((l) => (
            <TouchableOpacity
              key={l}
              onPress={() => setLocale(l)}
              style={[styles.langBtn, locale === l && styles.langBtnActive]}
            >
              <Text style={[styles.langText, locale === l && styles.langTextActive]}>
                {l === 'fr' ? '🇫🇷 FR' : l === 'ar' ? '🇩🇿 عر' : l === 'ber' ? 'ⵣ ⵜⵎⵣ' : '🇬🇧 EN'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Footer */}
      <Animated.Text
        entering={FadeInDown.delay(500)}
        style={styles.footer}
      >
        TabibPro © 2026 — tabibpro.dz
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 12,
  },
  choiceLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modeCardPro: {
    backgroundColor: COLORS.primary[900],
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeIconPro: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  modeIconText: {
    fontSize: 24,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  modeTitlePro: {
    color: '#fff',
  },
  modeDesc: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  modeDescPro: {
    color: 'rgba(255,255,255,0.7)',
  },
  modeArrow: {
    fontSize: 24,
    color: COLORS.primary[400],
    fontWeight: '300',
  },
  modeArrowPro: {
    color: 'rgba(255,255,255,0.6)',
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  langBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  langText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  langTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
});
