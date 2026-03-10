import Link from 'next/link';
import { Shield, Building2, LogOut } from 'lucide-react';
import { requirePlatformAdmin } from '@/lib/auth/guard';
import { logout } from '@/lib/actions';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePlatformAdmin();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-64 flex-col border-r bg-white">
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <Shield className="h-5 w-5 text-destructive" />
          <span className="text-sm font-bold">Admin Plateforme</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            Vue d'ensemble
          </Link>
          <Link
            href="/admin/agencies"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <Building2 className="h-4 w-4" />
            Agences
          </Link>
        </nav>
        <div className="border-t p-3">
          <form action={logout}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-muted/30 p-6">{children}</main>
    </div>
  );
}
