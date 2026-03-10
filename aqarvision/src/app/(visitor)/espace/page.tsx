import Link from 'next/link';
import { Heart, Bell, MessageSquare, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Mon espace' };

export default async function VisitorHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single();

  const [{ count: favCount }, { count: alertCount }, { count: msgCount }] = await Promise.all([
    supabase.from('favorites').select('id', { count: 'exact', head: true }),
    supabase.from('saved_searches').select('id', { count: 'exact', head: true }),
    supabase.from('conversation_participants').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
  ]);

  const items = [
    { href: '/espace/favoris', label: 'Favoris', count: favCount ?? 0, icon: Heart, color: 'text-favorite' },
    { href: '/espace/alertes', label: 'Alertes', count: alertCount ?? 0, icon: Bell, color: 'text-or' },
    { href: '/espace/messages', label: 'Messages', count: msgCount ?? 0, icon: MessageSquare, color: 'text-info' },
    { href: '/recherche', label: 'Rechercher', count: null, icon: Search, color: 'text-success' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-3 font-bold text-bleu-nuit">
          Bonjour{profile?.full_name ? `, ${profile.full_name}` : ''} !
        </h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Retrouvez vos favoris, alertes et conversations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="cursor-pointer">
            <Card className="transition-shadow hover:shadow-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">{item.label}</p>
                  {item.count !== null && (
                    <p className="text-sm text-muted-foreground">{item.count} élément{item.count !== 1 ? 's' : ''}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
