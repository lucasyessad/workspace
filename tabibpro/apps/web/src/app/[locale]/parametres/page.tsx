// ============================================================
// TabibPro — Paramètres du cabinet
// Configuration médecin, cabinet, sécurité, notifications
// ============================================================

'use client';

import { useState } from 'react';

type SectionParametres = 'profil' | 'cabinet' | 'horaires' | 'notifications' | 'securite';

const WILAYAS_SAMPLE = [
  '01 - Adrar', '16 - Alger', '25 - Constantine', '31 - Oran',
  '06 - Béjaïa', '09 - Blida', '15 - Tizi Ouzou', '19 - Sétif',
];

const SPECIALITES = [
  'Médecine générale', 'Cardiologie', 'Pneumologie', 'Neurologie',
  'Gastro-entérologie', 'Endocrinologie', 'Rhumatologie', 'Dermatologie',
  'Pédiatrie', 'Gynécologie-Obstétrique', 'Ophtalmologie', 'ORL',
  'Chirurgie générale', 'Urologie', 'Orthopédie', 'Psychiatrie',
];

const JOURS_ALGERIE = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi'];

export default function ParametresPage() {
  const [section, setSection] = useState<SectionParametres>('profil');
  const [saved, setSaved] = useState(false);

  const [profil, setProfil] = useState({
    nom: 'Dr. Ahmed Benaissa',
    email: 'dr.benaissa@tabibpro.dz',
    telephone: '0555 12 34 56',
    specialite: 'Médecine générale',
    numeroOrdre: 'MG-16-00234',
    inami: '',
    avatar: '',
  });

  const [cabinet, setCabinet] = useState({
    nomCabinet: 'Cabinet Médical Dr. Benaissa',
    adresse: '14 rue Didouche Mourad',
    wilaya: '16 - Alger',
    commune: 'Alger Centre',
    codePostal: '16000',
    telephone: '021 XX XX XX',
    site: '',
  });

  const [horaires, setHoraires] = useState({
    Dimanche: { actif: true, debut: '08:00', fin: '18:00' },
    Lundi: { actif: true, debut: '08:00', fin: '18:00' },
    Mardi: { actif: true, debut: '08:00', fin: '18:00' },
    Mercredi: { actif: true, debut: '08:00', fin: '13:00' },
    Jeudi: { actif: true, debut: '08:00', fin: '18:00' },
  });

  const [notifs, setNotifs] = useState({
    rdvEmail: true,
    rdvSMS: false,
    stockAlerte: true,
    rdvRappel24h: true,
    messagerie: true,
    rapport: false,
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const SECTIONS: { key: SectionParametres; label: string; icon: string }[] = [
    { key: 'profil', label: 'Profil médecin', icon: '👤' },
    { key: 'cabinet', label: 'Cabinet', icon: '🏥' },
    { key: 'horaires', label: 'Horaires', icon: '🕐' },
    { key: 'notifications', label: 'Notifications', icon: '🔔' },
    { key: 'securite', label: 'Sécurité', icon: '🔒' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-sm text-gray-500 mt-1">Configuration du cabinet et du compte</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar navigation */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  section === s.key
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          {saved && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 font-medium">
              ✅ Modifications enregistrées avec succès
            </div>
          )}

          <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Profil */}
            {section === 'profil' && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
                  Informations professionnelles
                </h2>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
                    {profil.nom.charAt(3)}
                  </div>
                  <button type="button" className="text-sm text-blue-600 hover:underline">
                    Changer la photo
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: 'Nom complet', key: 'nom', type: 'text' },
                    { label: 'Email professionnel', key: 'email', type: 'email' },
                    { label: 'Téléphone mobile', key: 'telephone', type: 'tel' },
                    { label: 'N° Ordre national des médecins', key: 'numeroOrdre', type: 'text' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                      <input
                        type={f.type}
                        value={profil[f.key as keyof typeof profil]}
                        onChange={(e) => setProfil({ ...profil, [f.key]: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
                    <select
                      value={profil.specialite}
                      onChange={(e) => setProfil({ ...profil, specialite: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {SPECIALITES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Cabinet */}
            {section === 'cabinet' && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
                  Informations du cabinet
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du cabinet</label>
                    <input
                      type="text"
                      value={cabinet.nomCabinet}
                      onChange={(e) => setCabinet({ ...cabinet, nomCabinet: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input
                      type="text"
                      value={cabinet.adresse}
                      onChange={(e) => setCabinet({ ...cabinet, adresse: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wilaya</label>
                    <select
                      value={cabinet.wilaya}
                      onChange={(e) => setCabinet({ ...cabinet, wilaya: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      value={cabinet.commune}
                      onChange={(e) => setCabinet({ ...cabinet, commune: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone fixe</label>
                    <input
                      type="tel"
                      value={cabinet.telephone}
                      onChange={(e) => setCabinet({ ...cabinet, telephone: e.target.value })}
                      placeholder="021 XX XX XX"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                    <input
                      type="url"
                      value={cabinet.site}
                      onChange={(e) => setCabinet({ ...cabinet, site: e.target.value })}
                      placeholder="https://"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Horaires */}
            {section === 'horaires' && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
                  Horaires d&apos;ouverture
                </h2>
                <p className="text-sm text-gray-500">Jours ouvrables en Algérie : Dimanche → Jeudi</p>
                <div className="space-y-3">
                  {JOURS_ALGERIE.map((jour) => {
                    const h = horaires[jour as keyof typeof horaires];
                    return (
                      <div key={jour} className="flex items-center gap-4 py-3 border-b border-gray-50">
                        <div className="w-28">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={h.actif}
                              onChange={(e) => setHoraires({ ...horaires, [jour]: { ...h, actif: e.target.checked } })}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className={`text-sm font-medium ${h.actif ? 'text-gray-900' : 'text-gray-400'}`}>
                              {jour}
                            </span>
                          </label>
                        </div>
                        {h.actif ? (
                          <div className="flex items-center gap-3">
                            <input
                              type="time"
                              value={h.debut}
                              onChange={(e) => setHoraires({ ...horaires, [jour]: { ...h, debut: e.target.value } })}
                              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-400 text-sm">→</span>
                            <input
                              type="time"
                              value={h.fin}
                              onChange={(e) => setHoraires({ ...horaires, [jour]: { ...h, fin: e.target.value } })}
                              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Fermé</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notifications */}
            {section === 'notifications' && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
                  Préférences de notifications
                </h2>
                <div className="space-y-4">
                  {[
                    { key: 'rdvEmail', label: 'Confirmation RDV par email', desc: 'Envoi automatique au patient lors de la prise de RDV' },
                    { key: 'rdvSMS', label: 'Confirmation RDV par SMS', desc: 'Nécessite un abonnement SMS (Algérie Télécom)' },
                    { key: 'rdvRappel24h', label: 'Rappel de RDV 24h avant', desc: 'Notification au patient la veille du rendez-vous' },
                    { key: 'stockAlerte', label: 'Alertes rupture de stock', desc: 'Notification quand un médicament est en rupture ou bientôt périmé' },
                    { key: 'messagerie', label: 'Nouveaux messages', desc: 'Notification lors d\'un nouveau message d\'un patient ou confrère' },
                    { key: 'rapport', label: 'Rapport mensuel automatique', desc: 'Envoi du rapport d\'activité mensuel par email' },
                  ].map((n) => (
                    <div key={n.key} className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{n.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key as keyof typeof notifs] })}
                        className={`flex-shrink-0 relative w-11 h-6 rounded-full transition-colors ${
                          notifs[n.key as keyof typeof notifs] ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          notifs[n.key as keyof typeof notifs] ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sécurité */}
            {section === 'securite' && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
                  Sécurité et confidentialité
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-sm"
                    />
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 mt-4">
                    <p className="text-sm font-medium text-blue-800 mb-2">Authentification à deux facteurs (2FA)</p>
                    <p className="text-xs text-blue-600 mb-3">
                      Protégez votre compte avec un code envoyé sur votre téléphone à chaque connexion.
                    </p>
                    <button type="button" className="text-sm text-blue-700 font-medium border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                      Activer la 2FA
                    </button>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-amber-800">
                      🔒 Conformité Loi 18-07 (protection des données personnelles)
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Toutes les données médicales sont chiffrées et stockées en Algérie. Accès journalisé.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
