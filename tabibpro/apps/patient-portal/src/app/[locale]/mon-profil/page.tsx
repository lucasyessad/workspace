// ============================================================
// TabibPro — Mon Profil (portail patient)
// Informations personnelles, sécurité, préférences
// ============================================================

'use client';

import { useState } from 'react';

type SectionProfil = 'identite' | 'contact' | 'securite' | 'preferences';

const WILAYAS_SAMPLE = [
  '01 - Adrar', '16 - Alger', '25 - Constantine', '31 - Oran',
  '06 - Béjaïa', '09 - Blida', '15 - Tizi Ouzou', '19 - Sétif',
];

export default function MonProfilPage() {
  const [section, setSection] = useState<SectionProfil>('identite');
  const [saved, setSaved] = useState(false);

  const [identite, setIdentite] = useState({
    prenom: 'Karim',
    nom: 'Benali',
    dateNaissance: '1990-06-15',
    sexe: 'M',
    groupeSanguin: 'O+',
    nationalite: 'Algérienne',
    numeroCnas: '0X1234567890',
    carteChifa: '12345678901234567890',
  });

  const [contact, setContact] = useState({
    telephone: '0661 23 45 67',
    telephoneSecours: '0550 98 76 54',
    email: 'karim.benali@email.dz',
    adresse: '15 rue des Orangers',
    wilaya: '16 - Alger',
    commune: 'Bab El Oued',
    codePostal: '16001',
  });

  const [preferences, setPreferences] = useState({
    langue: 'fr',
    notifSMS: true,
    notifEmail: false,
    rappelRDV: true,
    partageConfrere: true,
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const SECTIONS: { key: SectionProfil; label: string; icon: string }[] = [
    { key: 'identite', label: 'Identité', icon: '👤' },
    { key: 'contact', label: 'Coordonnées', icon: '📍' },
    { key: 'securite', label: 'Sécurité', icon: '🔒' },
    { key: 'preferences', label: 'Préférences', icon: '⚙️' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* En-tête profil */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-3xl font-bold">
              {identite.prenom.charAt(0)}{identite.nom.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-emerald-700 transition-colors">
              ✎
            </button>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {identite.prenom} {identite.nom}
            </h1>
            <p className="text-sm text-gray-500">
              {new Date(identite.dateNaissance).toLocaleDateString('fr-DZ', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                CNAS
              </span>
              <span className="text-xs text-gray-400 font-mono">{identite.numeroCnas}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets sections */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl overflow-hidden">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2 ${
              section === s.key
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{s.icon}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
          ✅ Modifications enregistrées
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-6 space-y-5">
        {/* Identité */}
        {section === 'identite' && (
          <>
            <h2 className="font-semibold text-gray-900">Informations personnelles</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={identite.prenom}
                  onChange={(e) => setIdentite({ ...identite, prenom: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de famille</label>
                <input
                  type="text"
                  value={identite.nom}
                  onChange={(e) => setIdentite({ ...identite, nom: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                <input
                  type="date"
                  value={identite.dateNaissance}
                  onChange={(e) => setIdentite({ ...identite, dateNaissance: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
                <div className="flex gap-4 pt-2">
                  {[{ val: 'M', label: 'Masculin' }, { val: 'F', label: 'Féminin' }].map((s) => (
                    <label key={s.val} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={s.val}
                        checked={identite.sexe === s.val}
                        onChange={() => setIdentite({ ...identite, sexe: s.val })}
                        className="text-emerald-600"
                      />
                      <span className="text-sm text-gray-700">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Groupe sanguin</label>
                <select
                  value={identite.groupeSanguin}
                  onChange={(e) => setIdentite({ ...identite, groupeSanguin: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Inconnu'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                <input
                  type="text"
                  value={identite.nationalite}
                  onChange={(e) => setIdentite({ ...identite, nationalite: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Couverture sociale</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">N° CNAS / Carte Chifa</label>
                  <input
                    type="text"
                    value={identite.numeroCnas}
                    onChange={(e) => setIdentite({ ...identite, numeroCnas: e.target.value })}
                    placeholder="0X1234567890"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code carte Chifa (20 chiffres)</label>
                  <input
                    type="text"
                    value={identite.carteChifa}
                    onChange={(e) => setIdentite({ ...identite, carteChifa: e.target.value })}
                    maxLength={20}
                    placeholder="12345678901234567890"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Coordonnées */}
        {section === 'contact' && (
          <>
            <h2 className="font-semibold text-gray-900">Coordonnées et adresse</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone principal</label>
                  <input
                    type="tel"
                    value={contact.telephone}
                    onChange={(e) => setContact({ ...contact, telephone: e.target.value })}
                    placeholder="0661 XX XX XX"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone de secours</label>
                  <input
                    type="tel"
                    value={contact.telephoneSecours}
                    onChange={(e) => setContact({ ...contact, telephoneSecours: e.target.value })}
                    placeholder="0550 XX XX XX"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={contact.adresse}
                  onChange={(e) => setContact({ ...contact, adresse: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wilaya</label>
                  <select
                    value={contact.wilaya}
                    onChange={(e) => setContact({ ...contact, wilaya: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {WILAYAS_SAMPLE.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
                  <input
                    type="text"
                    value={contact.commune}
                    onChange={(e) => setContact({ ...contact, commune: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sécurité */}
        {section === 'securite' && (
          <>
            <h2 className="font-semibold text-gray-900">Sécurité du compte</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Téléphone lié</p>
                <p className="text-sm text-gray-600">{contact.telephone}</p>
                <button type="button" className="mt-2 text-xs text-emerald-600 hover:underline">Modifier →</button>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Changer le mot de passe</h3>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Mot de passe actuel"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="password"
                    placeholder="Confirmer le nouveau mot de passe"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-emerald-800 mb-1">
                  Connexion par SMS (OTP)
                </p>
                <p className="text-xs text-emerald-600">
                  Recommandé — Connexion rapide et sécurisée par code SMS à chaque fois.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full font-medium">
                    ✅ Activée
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <p className="font-semibold mb-1">🔒 Vos droits — Loi 18-07</p>
                <p className="text-xs text-amber-600">
                  Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données médicales à tout moment.
                  Contactez votre médecin ou écrivez à dpo@tabibpro.dz
                </p>
              </div>
            </div>
          </>
        )}

        {/* Préférences */}
        {section === 'preferences' && (
          <>
            <h2 className="font-semibold text-gray-900">Préférences et notifications</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Langue de l&apos;interface</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'fr', label: 'Français' },
                    { val: 'ar', label: 'العربية' },
                    { val: 'ber', label: 'ⵜⴰⵎⴰⵣⵉⵖⵜ' },
                    { val: 'en', label: 'English' },
                  ].map((l) => (
                    <button
                      key={l.val}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, langue: l.val })}
                      className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                        preferences.langue === l.val
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                {[
                  { key: 'notifSMS', label: 'Rappels RDV par SMS', desc: '24h avant chaque rendez-vous' },
                  { key: 'notifEmail', label: 'Notifications par email', desc: 'Résumés de consultation, ordonnances' },
                  { key: 'rappelRDV', label: 'Rappel renouvellement ordonnances', desc: '7 jours avant expiration' },
                  { key: 'partageConfrere', label: 'Autoriser partage entre confrères', desc: 'Votre médecin peut partager votre dossier avec ses confrères' },
                ].map((n) => (
                  <div key={n.key} className="flex items-start justify-between gap-4 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{n.label}</p>
                      <p className="text-xs text-gray-400">{n.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreferences({ ...preferences, [n.key]: !preferences[n.key as keyof typeof preferences] })}
                      className={`flex-shrink-0 relative w-11 h-6 rounded-full transition-colors ${
                        preferences[n.key as keyof typeof preferences] ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        preferences[n.key as keyof typeof preferences] ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
