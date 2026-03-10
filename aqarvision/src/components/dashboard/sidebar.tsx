'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  Palette,
  UserPlus,
  CreditCard,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/actions';
import type { Agency, UserRole } from '@/types';
import { hasPermission } from '@/lib/permissions';

interface SidebarProps {
  agency: Agency;
  userRole: UserRole;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, permission: null },
  { href: '/dashboard/listings', label: 'Annonces', icon: Building2, permission: 'properties:read' as const },
  { href: '/dashboard/leads', label: 'Leads', icon: Users, permission: 'leads:read' as const },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare, permission: 'leads:read' as const },
  { href: '/dashboard/branding', label: 'Branding', icon: Palette, permission: 'branding:read' as const },
  { href: '/dashboard/team', label: 'Equipe', icon: UserPlus, permission: 'team:read' as const },
  { href: '/dashboard/subscription', label: 'Abonnement', icon: CreditCard, permission: 'subscription:read' as const },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings, permission: 'settings:read' as const },
];

export function DashboardSidebar({ agency, userRole }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        {agency.logo_url ? (
          <img src={agency.logo_url} alt={agency.name} className="h-8 w-8 rounded-md object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-bleu-nuit text-xs font-bold text-white">
            {agency.name.charAt(0)}
          </div>
        )}
        <span className="truncate text-sm font-semibold">{agency.name}</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          if (item.permission && !hasPermission(userRole, item.permission)) return null;

          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer',
                isActive
                  ? 'bg-bleu-nuit/5 text-bleu-nuit'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
