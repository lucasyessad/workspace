import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Heart, Bell, MessageSquare, User, Home } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/espace', label: 'Accueil', icon: Home },
  { href: '/espace/favoris', label: 'Favoris', icon: Heart },
  { href: '/espace/alertes', label: 'Alertes', icon: Bell },
  { href: '/espace/messages', label: 'Messages', icon: MessageSquare },
  { href: '/espace/profil', label: 'Profil', icon: User },
];

export default async function VisitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-blanc-casse">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="text-lg font-bold text-bleu-nuit cursor-pointer">
            AqarVision
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/recherche" className="text-sm font-medium text-or hover:underline cursor-pointer">
            Rechercher
          </Link>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white md:hidden">
        <div className="flex justify-around py-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-bleu-nuit cursor-pointer"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="container py-6 pb-20 md:pb-6">
        {children}
      </main>
    </div>
  );
}
