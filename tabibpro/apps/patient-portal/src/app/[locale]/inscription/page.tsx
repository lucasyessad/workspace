// ============================================================
// TabibPro — Portail Patient — Inscription
// Inscription par TÉLÉPHONE (prioritaire en Algérie)
// Email optionnel — Consentement Loi 18-07
// ============================================================

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { PHONE_REGEX_DZ } from '@tabibpro/shared';

// ---- Validation ----
const inscriptionSchema = z
  .object({
    telephoneMobile: z
      .string()
      .regex(PHONE_REGEX_DZ, 'Numéro de téléphone algérien invalide'),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    motDePasse: z.string().min(8, 'Minimum 8 caractères'),
    confirmationMotDePasse: z.string(),
    nomFr: z.string().min(2, 'Minimum 2 caractères'),
    prenomFr: z.string().min(2, 'Minimum 2 caractères'),
    dateNaissance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide'),
    sexe: z.enum(['M', 'F']),
    consentementDonnees: z.literal(true, {
      errorMap: () => ({ message: 'Le consentement est obligatoire' }),
    }),
  })
  .refine((data) => data.motDePasse === data.confirmationMotDePasse, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmationMotDePasse'],
  });

type InscriptionForm = z.infer<typeof inscriptionSchema>;

// ---- Étapes de l'inscription ----
type Step = 'phone' | 'otp' | 'details' | 'consent';

export default function InscriptionPage() {
  const t = useTranslations('Patient.Inscription');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [step, setStep] = useState<Step>('phone');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const form = useForm<InscriptionForm>({
    resolver: zodResolver(inscriptionSchema),
    defaultValues: { sexe: 'M', consentementDonnees: undefined },
  });

  const onSubmit = async (data: InscriptionForm) => {
    // TODO: Appel API inscription
    console.log('Inscription:', data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white text-2xl font-bold mb-4">
            M
          </div>
          <h1 className="text-2xl font-bold text-foreground">TabibPro</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('title')}
          </p>
        </div>

        {/* Carte inscription */}
        <div className="bg-card rounded-2xl shadow-xl p-6 border border-border">

          {/* Étape 1 : Téléphone */}
          {step === 'phone' && (
            <div className="space-y-4">
              <h2 className="font-semibold">{t('step_phone')}</h2>
              <p className="text-sm text-muted-foreground">{t('phone_description')}</p>

              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="phone">
                  {t('phone_label')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-muted-foreground text-sm">
                    🇩🇿 +213
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    className="w-full rounded-lg border border-input bg-background ps-20 pe-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0XX XX XX XX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    dir="ltr"
                  />
                  <Phone className="absolute inset-y-0 end-3 my-auto h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('phone_hint')}
                </p>
              </div>

              {/* Email optionnel */}
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                  {t('email_label')}
                  <span className="text-muted-foreground font-normal ms-1">
                    ({t('optional')})
                  </span>
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="votre@email.com"
                  dir="ltr"
                />
              </div>

              <button
                onClick={() => setStep('otp')}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-600 text-white py-2.5 text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                {t('send_otp')}
                <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}

          {/* Étape 2 : Code OTP */}
          {step === 'otp' && (
            <div className="space-y-4">
              <h2 className="font-semibold">{t('step_otp')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('otp_sent_to')} <strong dir="ltr">{phoneNumber}</strong>
              </p>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t('otp_label')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-lg border border-input bg-background px-3 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  dir="ltr"
                />
              </div>

              <button
                onClick={() => setStep('details')}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-600 text-white py-2.5 text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                {t('verify_otp')}
              </button>

              <button
                onClick={() => setStep('phone')}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('change_phone')}
              </button>
            </div>
          )}

          {/* Étape 3 : Informations personnelles */}
          {step === 'details' && (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <h2 className="font-semibold">{t('step_details')}</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {t('nom')} *
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    {...form.register('nomFr')}
                  />
                  {form.formState.errors.nomFr && (
                    <p className="text-xs text-destructive mt-1">
                      {form.formState.errors.nomFr.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {t('prenom')} *
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    {...form.register('prenomFr')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t('date_naissance')} *
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  {...form.register('dateNaissance')}
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('sexe')} *</label>
                <div className="flex gap-3">
                  {(['M', 'F'] as const).map((s) => (
                    <label
                      key={s}
                      className="flex flex-1 items-center gap-2 rounded-lg border border-input p-3 cursor-pointer hover:border-primary-300 transition-colors"
                    >
                      <input
                        type="radio"
                        value={s}
                        {...form.register('sexe')}
                        className="text-primary-600"
                      />
                      <span className="text-sm">{s === 'M' ? t('masculin') : t('feminin')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t('mot_de_passe')} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pe-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    {...form.register('motDePasse')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 end-3 flex items-center text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.motDePasse && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.motDePasse.message}
                  </p>
                )}
              </div>

              {/* Consentement Loi 18-07 */}
              <div className="rounded-lg bg-muted p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded text-primary-600"
                    {...form.register('consentementDonnees')}
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    {t('consent_text')}
                    {' '}
                    <Link
                      href={`/${locale}/confidentialite`}
                      className="text-primary-600 hover:underline"
                      target="_blank"
                    >
                      {t('consent_link')}
                    </Link>
                    {' — '}
                    <span className="font-medium">{t('consent_law')}</span>
                  </span>
                </label>
                {form.formState.errors.consentementDonnees && (
                  <p className="text-xs text-destructive mt-1 ms-7">
                    {form.formState.errors.consentementDonnees.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-primary-600 text-white py-2.5 text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                {t('create_account')}
              </button>
            </form>
          )}

          {/* Lien connexion */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            {t('already_account')}{' '}
            <Link
              href={`/${locale}/connexion`}
              className="text-primary-600 font-medium hover:underline"
            >
              {t('login_link')}
            </Link>
          </p>
        </div>

        {/* Sélecteur de langue */}
        <div className="flex justify-center gap-4 mt-6 text-sm text-muted-foreground">
          {[
            { code: 'fr', label: 'Français' },
            { code: 'ar', label: 'العربية' },
            { code: 'ber', label: 'ⵜⴰⵎⴰⵣⵉⵖⵜ' },
            { code: 'en', label: 'English' },
          ].map((l) => (
            <Link
              key={l.code}
              href={`/${l.code}/inscription`}
              className={`hover:text-foreground transition-colors ${locale === l.code ? 'text-foreground font-medium' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
