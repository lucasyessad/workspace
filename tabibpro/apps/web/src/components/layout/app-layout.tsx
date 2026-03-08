// ============================================================
// TabibPro — Layout Application Professionnelle
// Sidebar + Header avec sélecteur de langue + connectivité
// Support RTL natif (arabe)
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  FileText,
  Package,
  MessageSquare,
  CreditCard,
  Syringe,
  BarChart2,
  Settings,
  Bell,
  Mail,
  Bot,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConnectivityBadge } from './connectivity-badge';
import { LocaleSwitcher } from './locale-switcher';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/patients', labelKey: 'nav.patients', icon: Users },
  { href: '/rdv', labelKey: 'nav.rdv', icon: Calendar },
  { href: '/consultations', labelKey: 'nav.consultations', icon: ClipboardList },
  { href: '/ordonnances', labelKey: 'nav.ordonnances', icon: FileText },
  { href: '/stock', labelKey: 'nav.stock', icon: Package },
  { href: '/messagerie', labelKey: 'nav.messagerie', icon: MessageSquare },
  { href: '/facturation', labelKey: 'nav.facturation', icon: CreditCard },
  { href: '/vaccinations', labelKey: 'nav.vaccinations', icon: Syringe },
  { href: '/rapports', labelKey: 'nav.rapports', icon: BarChart2 },
  { href: '/parametres', labelKey: 'nav.parametres', icon: Settings },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations();
  const pathname = usePathname();
  const isRTL = locale === 'ar';

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ---- Sidebar ---- */}
      <aside
        className={cn(
          'flex flex-col border-border bg-card transition-all duration-200',
          isRTL ? 'border-l' : 'border-r',
          sidebarCollapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center px-4">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-bold">
              M
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm font-semibold"
                >
                  TabibPro
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const href = `/${locale}${item.href}`;
            const isActive = pathname.startsWith(href);

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  'flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm transition-colors',
                  'hover:bg-muted hover:text-foreground',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 truncate"
                    >
                      {t(item.labelKey)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Collapse button */}
        <div className="border-t border-border p-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex w-full items-center justify-center p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isRTL ? (
              sidebarCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            ) : (
              sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      {/* ---- Zone principale ---- */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4">

          {/* Recherche globale */}
          <div className="flex-1">
            <button
              className={cn(
                'flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground',
                'hover:border-primary-300 hover:bg-background transition-colors',
                'w-full max-w-xs'
              )}
              aria-label="Recherche globale (Cmd+K)"
            >
              <span>🔍</span>
              <span className="flex-1 text-start">Rechercher... (⌘K)</span>
            </button>
          </div>

          {/* Actions header */}
          <div className="flex items-center gap-2">
            {/* Connectivité */}
            <ConnectivityBadge />

            {/* Sélecteur de langue */}
            <LocaleSwitcher />

            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            {/* Email pro */}
            <button
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Messages email"
            >
              <Mail className="h-4 w-4" />
            </button>

            {/* Panneau IA */}
            <button
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                aiPanelOpen
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-muted text-muted-foreground hover:bg-primary-50 hover:text-primary-700'
              )}
              aria-label="Assistant IA médical"
            >
              <Bot className="h-4 w-4" />
              <span>IA</span>
            </button>

            {/* Avatar médecin */}
            <button className="flex items-center gap-2 rounded-lg p-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
              <div className="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700">
                Dr
              </div>
            </button>
          </div>
        </header>

        {/* Contenu principal + Panneau IA */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

          {/* Panneau IA latéral */}
          <AnimatePresence>
            {aiPanelOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'overflow-hidden border-border bg-card',
                  isRTL ? 'border-r' : 'border-l'
                )}
              >
                <div className="h-full w-[380px]">
                  {/* PanneauIA component */}
                  <div className="flex h-full flex-col p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary-600" />
                        <h2 className="font-semibold text-sm">Assistant IA Médical</h2>
                      </div>
                    </div>
                    <div className="flex-1 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground mb-2">Fonctions disponibles :</p>
                      <ul className="space-y-1.5">
                        <li>🔬 Aide au diagnostic</li>
                        <li>💊 Interactions médicamenteuses</li>
                        <li>📚 Recherche littérature médicale</li>
                        <li>📋 Analyse résultats de laboratoire</li>
                        <li>🩺 Protocoles maladies chroniques</li>
                        <li>✍️ Aide à la rédaction médicale</li>
                        <li>🎤 Dictée médicale (FR/AR/Darija)</li>
                        <li>🗣️ Traducteur darija algérien</li>
                      </ul>
                      <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-2 text-amber-700">
                        ⚠️ Mode passif — L&apos;IA suggère, le médecin décide.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
