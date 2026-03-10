import { Building2, Users, TrendingUp, FileText } from 'lucide-react';
import { requireAuth } from '@/lib/auth/guard';
import { getPropertiesStats } from '@/lib/queries/properties';
import { getLeadsStats } from '@/lib/queries/leads';
import { KPICard } from '@/components/dashboard/kpi-card';

export const metadata = { title: 'Tableau de bord' };

export default async function DashboardPage() {
  const tenant = await requireAuth();
  const [propStats, leadStats] = await Promise.all([
    getPropertiesStats(tenant.agency.id),
    getLeadsStats(tenant.agency.id),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-heading-3 font-bold">Tableau de bord</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Bienvenue, {tenant.profile.full_name}. Voici un aperçu de votre agence.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Annonces publiées"
          value={propStats.published}
          icon={<Building2 className="h-5 w-5" />}
        />
        <KPICard
          title="Brouillons"
          value={propStats.draft}
          icon={<FileText className="h-5 w-5" />}
        />
        <KPICard
          title="Nouveaux leads"
          value={leadStats.new}
          icon={<Users className="h-5 w-5" />}
        />
        <KPICard
          title="Leads convertis"
          value={leadStats.converted}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}
