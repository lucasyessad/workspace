// ============================================================
// TabibPro — Portail Patient — Layout Global
// Header + Navigation (sidebar desktop / bottom mobile)
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'TabibPro Patient',
  description: 'Votre portail de santé personnel',
};

// SVG icons inline
function IconHome() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconPrescription() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

function IconMessage() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

// 6 items max pour la bottom nav mobile (overflow masqué sur petits écrans)
const navItems = [
  { href: '/fr', label: 'Accueil', icon: <IconHome /> },
  { href: '/fr/rdv', label: 'Prendre RDV', icon: <IconPlus /> },
  { href: '/fr/mes-rdv', label: 'Mes RDV', icon: <IconCalendar /> },
  { href: '/fr/dossier', label: 'Mon dossier', icon: <IconFolder /> },
  { href: '/fr/mes-ordonnances', label: 'Ordonnances', icon: <IconPrescription /> },
  { href: '/fr/messagerie', label: 'Messagerie', icon: <IconMessage /> },
];

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="bg-emerald-600 text-white shadow-md sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-sm">T</span>
              </div>
              <span className="font-bold text-lg tracking-tight">TabibPro</span>
              <span className="hidden sm:inline text-emerald-200 text-sm ml-1">Patient</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/fr/mon-profil" className="flex items-center gap-2 hover:bg-emerald-700 rounded-lg px-2 py-1 transition-colors">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-bold">
                  KB
                </div>
                <span className="hidden sm:block text-sm font-medium">Karim Benali</span>
              </Link>
              <button className="flex items-center gap-1 hover:bg-emerald-700 rounded-lg px-2 py-1.5 transition-colors text-emerald-100 hover:text-white text-sm">
                <IconLogout />
                <span className="hidden sm:block">Déconnexion</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex max-w-6xl mx-auto">
          {/* Sidebar desktop */}
          <aside className="hidden md:flex flex-col w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] pt-6 px-3 bg-white border-r border-gray-100">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-sm font-medium"
                >
                  <span className="text-current">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pb-6">
              <Link
                href="/fr/mon-profil"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors text-sm"
              >
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold">
                  KB
                </div>
                <div>
                  <p className="font-medium text-gray-700">Karim Benali</p>
                  <p className="text-xs text-gray-400">Mon profil</p>
                </div>
              </Link>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
            {children}
          </main>
        </div>

        {/* Bottom navigation mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-pb">
          <div className="flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center gap-0.5 py-2 text-gray-500 hover:text-emerald-600 transition-colors"
              >
                <span>{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </body>
    </html>
  );
}
