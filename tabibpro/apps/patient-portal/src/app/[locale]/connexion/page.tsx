// ============================================================
// TabibPro — Connexion Portail Patient
// Authentification sécurisée pour les patients
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';

type ModeConnexion = 'email' | 'telephone';

export default function ConnexionPage() {
  const [mode, setMode] = useState<ModeConnexion>('telephone');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [etape, setEtape] = useState<'identifiants' | 'otp'>('identifiants');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [chargement, setChargement] = useState(false);

  function handleSubmitIdentifiants(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setTimeout(() => {
      setChargement(false);
      setEtape('otp');
    }, 1000);
  }

  function handleOtpChange(index: number, valeur: string) {
    if (!/^\d*$/.test(valeur)) return;
    const nouveau = [...otp];
    nouveau[index] = valeur.slice(-1);
    setOtp(nouveau);
    if (valeur && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setTimeout(() => {
      setChargement(false);
      // TODO: rediriger vers le portail après authentification
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* En-tête */}
        <div className="bg-emerald-600 px-8 py-6 text-center">
          <div className="text-4xl mb-2">🏥</div>
          <h1 className="text-xl font-bold text-white">TabibPro</h1>
          <p className="text-emerald-100 text-sm mt-1">Portail Patient</p>
        </div>

        <div className="px-8 py-8">
          {etape === 'identifiants' ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Connexion</h2>
              <p className="text-sm text-gray-500 mb-6">Accédez à votre espace santé personnel</p>

              {/* Sélecteur mode */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setMode('telephone')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'telephone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Téléphone
                </button>
                <button
                  type="button"
                  onClick={() => setMode('email')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Email
                </button>
              </div>

              <form onSubmit={handleSubmitIdentifiants} className="space-y-4">
                {mode === 'telephone' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de téléphone
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm text-gray-600 flex-shrink-0">
                        🇩🇿 +213
                      </div>
                      <input
                        type="tel"
                        required
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        placeholder="0555 XX XX XX"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Un code OTP vous sera envoyé par SMS</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse email
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.dz"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe
                      </label>
                      <input
                        type="password"
                        required
                        value={motDePasse}
                        onChange={(e) => setMotDePasse(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="text-right mt-1">
                        <button type="button" className="text-xs text-emerald-600 hover:underline">
                          Mot de passe oublié ?
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={chargement}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {chargement ? 'Connexion…' : mode === 'telephone' ? 'Recevoir le code SMS' : 'Se connecter'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Pas encore de compte ?{' '}
                  <Link href="./inscription" className="text-emerald-600 font-medium hover:underline">
                    S&apos;inscrire
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setEtape('identifiants')}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
              >
                ← Retour
              </button>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Vérification</h2>
              <p className="text-sm text-gray-500 mb-6">
                Entrez le code à 6 chiffres envoyé au{' '}
                <strong>{telephone || email}</strong>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-center gap-3">
                  {otp.map((chiffre, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={chiffre}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={chargement || otp.some((c) => !c)}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {chargement ? 'Vérification…' : 'Valider'}
                </button>

                <div className="text-center">
                  <button type="button" className="text-sm text-emerald-600 hover:underline">
                    Renvoyer le code (30s)
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <div className="px-8 pb-6 text-center">
          <p className="text-xs text-gray-400">
            🔒 Connexion sécurisée — Données médicales protégées conformément à la Loi 18-07
          </p>
        </div>
      </div>
    </div>
  );
}
