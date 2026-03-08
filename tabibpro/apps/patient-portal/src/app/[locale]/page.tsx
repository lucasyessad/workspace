// ============================================================
// TabibPro — Portail Patient — Dashboard Accueil
// Greeting, prochain RDV, résumé santé, ordonnances, messages
// ============================================================

import Link from 'next/link';

function formatDateFr(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTimeFr(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function getTodayFr(): string {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Icons SVG inline
function IconCalendar({ className = '' }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconFile({ className = '' }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function IconMessage({ className = '' }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconDownload({ className = '' }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconSyringe({ className = '' }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 2 4 4" />
      <path d="m17 7 3-3" />
      <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" />
      <path d="m9 11 4 4" />
      <path d="m5 19-3 3" />
      <path d="m14 4 6 6" />
    </svg>
  );
}

export default function DashboardPage() {
  const today = getTodayFr();
  const prochainRdv = {
    date: '2026-03-15T10:30:00',
    medecin: 'Dr. Meziane Ahmed',
    specialite: 'Médecin Généraliste',
    motif: 'Contrôle tension',
    adresse: '12 Rue Didouche Mourad, Alger',
  };

  const ordonnances = [
    {
      id: 'ORD-001',
      date: '2026-02-10',
      medecin: 'Dr. Meziane Ahmed',
      nbMedicaments: 3,
      type: 'Chronique',
    },
    {
      id: 'ORD-002',
      date: '2026-01-22',
      medecin: 'Dr. Boudiaf Sara',
      nbMedicaments: 2,
      type: 'Standard',
    },
  ];

  const messages = [
    {
      id: '1',
      expediteur: 'Dr. Meziane Ahmed',
      apercu: 'Parfait ! Continuez le traitement et revenez me voir dans 3 semaines.',
      date: '04 mars 2026',
      nonLu: false,
    },
    {
      id: '2',
      expediteur: 'Dr. Boudiaf Sara',
      apercu: 'Bonjour M. Benali, vos résultats d\'analyse sont disponibles.',
      date: '28 fév. 2026',
      nonLu: true,
    },
  ];

  const nonLusCount = messages.filter((m) => m.nonLu).length;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Bonjour Karim 👋
        </h1>
        <p className="text-gray-500 text-sm mt-0.5 capitalize">{today}</p>
      </div>

      {/* Prochain RDV */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-emerald-600 px-4 py-3 flex items-center gap-2">
          <IconCalendar className="text-white" />
          <h2 className="text-white font-semibold text-sm">Prochain rendez-vous</h2>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="font-semibold text-gray-800">{prochainRdv.medecin}</p>
              <p className="text-sm text-gray-500">{prochainRdv.specialite}</p>
              <div className="flex items-center gap-1.5 text-emerald-700 text-sm font-medium">
                <IconCalendar className="w-4 h-4" />
                <span>{formatDateFr(prochainRdv.date)} — {formatTimeFr(prochainRdv.date)}</span>
              </div>
              <p className="text-sm text-gray-600">Motif : <span className="font-medium">{prochainRdv.motif}</span></p>
              <p className="text-xs text-gray-400">{prochainRdv.adresse}</p>
            </div>
          </div>
          <Link
            href="/fr/mes-rdv"
            className="mt-4 inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Voir détails
          </Link>
        </div>
      </div>

      {/* Résumé santé */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Résumé santé</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Groupe sanguin</p>
            <span className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-1 text-sm font-bold">
              A+
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Allergies</p>
            <div className="flex flex-wrap gap-1.5">
              {['Pénicilline', 'AINS'].map((allergie) => (
                <span
                  key={allergie}
                  className="bg-red-100 text-red-700 border border-red-200 rounded-full px-2.5 py-0.5 text-xs font-medium"
                >
                  ⚠ {allergie}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dernières ordonnances */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <IconFile className="text-emerald-600" />
            Mes dernières ordonnances
          </h2>
          <Link href="/fr/mes-ordonnances" className="text-emerald-600 text-sm hover:underline">
            Voir tout
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ordonnances.map((ord) => (
            <div key={ord.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs text-gray-400 font-mono">{ord.id}</p>
                  <p className="text-sm font-semibold text-gray-800">{ord.medecin}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  ord.type === 'Chronique'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {ord.type}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {new Date(ord.date).toLocaleDateString('fr-FR')} — {ord.nbMedicaments} médicament{ord.nbMedicaments > 1 ? 's' : ''}
              </p>
              <button className="mt-3 w-full flex items-center justify-center gap-1.5 border border-emerald-200 text-emerald-700 rounded-xl py-1.5 text-xs font-medium hover:bg-emerald-50 transition-colors">
                <IconDownload />
                Télécharger PDF
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <IconMessage className="text-emerald-600" />
            Mes messages
            {nonLusCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {nonLusCount}
              </span>
            )}
          </h2>
          <Link href="/fr/messagerie" className="text-emerald-600 text-sm hover:underline">
            Voir tout
          </Link>
        </div>
        <div className="space-y-2">
          {messages.map((msg) => (
            <Link
              key={msg.id}
              href="/fr/messagerie"
              className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:border-emerald-200 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                  {msg.expediteur.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium ${msg.nonLu ? 'text-gray-900' : 'text-gray-600'}`}>
                      {msg.expediteur}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-gray-400">{msg.date}</span>
                      {msg.nonLu && (
                        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{msg.apercu}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Prochaine vaccination */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
          <IconSyringe className="text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">Ma prochaine vaccination</p>
          <p className="text-sm text-amber-700">ROR — dans 2 mois</p>
        </div>
      </div>

      {/* Bouton urgence flottant (mobile uniquement) */}
      <a
        href="tel:15"
        className="md:hidden fixed bottom-20 right-4 z-50 bg-red-600 text-white rounded-full px-4 py-3 shadow-lg flex items-center gap-2 font-bold text-sm hover:bg-red-700 transition-colors"
        aria-label="Urgences médicales — appeler le 15"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        Urgence : 15
      </a>
    </div>
  );
}
