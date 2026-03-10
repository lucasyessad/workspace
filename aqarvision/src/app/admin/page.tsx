import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Admin - Vue d\'ensemble' };

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [agencies, users, properties] = await Promise.all([
    supabase.from('agencies').select('id', { count: 'exact', head: true }),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('properties').select('id', { count: 'exact', head: true }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-heading-3 font-bold">Administration plateforme</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-muted-foreground">Agences</p>
          <p className="text-3xl font-bold">{agencies.count ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-muted-foreground">Utilisateurs</p>
          <p className="text-3xl font-bold">{users.count ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-muted-foreground">Annonces</p>
          <p className="text-3xl font-bold">{properties.count ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
