import Link from 'next/link';
import { getAllAgencies } from '@/lib/queries';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/formatters';
import { SUBSCRIPTION_PLAN_LABELS } from '@/lib/constants';

export const metadata = { title: 'Admin - Agences' };

export default async function AdminAgenciesPage() {
  const result = await getAllAgencies();

  return (
    <div className="space-y-6">
      <h1 className="text-heading-3 font-bold">Agences</h1>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nom</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Wilaya</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Créée le</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((agency) => (
              <tr key={agency.id} className="border-b transition-colors hover:bg-muted/20">
                <td className="px-4 py-3">
                  <Link href={`/admin/agencies/${agency.id}`} className="font-medium hover:underline cursor-pointer">
                    {agency.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{agency.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{agency.wilaya ?? '-'}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{SUBSCRIPTION_PLAN_LABELS[agency.active_plan]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={agency.subscription_status === 'active' ? 'success' : 'warning'}>
                    {agency.subscription_status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(agency.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
