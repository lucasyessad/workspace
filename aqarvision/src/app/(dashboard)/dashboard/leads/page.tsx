import { requirePermission } from '@/lib/auth/guard';
import { getAgencyLeads } from '@/lib/queries';
import { EmptyState } from '@/components/ui/empty-state';
import { LeadStatusChip } from '@/components/dashboard/lead-status-chip';
import { formatRelativeDate, formatPhone } from '@/lib/formatters';

export const metadata = { title: 'Leads' };

export default async function LeadsPage() {
  const tenant = await requirePermission('leads:read');
  const result = await getAgencyLeads(tenant.agency.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-3 font-bold">Leads</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          {result.total} contact{result.total !== 1 ? 's' : ''}
        </p>
      </div>

      {result.data.length === 0 ? (
        <EmptyState
          title="Aucun lead"
          description="Les leads apparaîtront ici lorsque des visiteurs vous contacteront via votre site."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nom</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Téléphone</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bien</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((lead) => (
                <tr key={lead.id} className="border-b transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{lead.full_name}</p>
                    {lead.email && <p className="text-xs text-muted-foreground">{lead.email}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatPhone(lead.phone)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {lead.property?.title ?? '-'}
                  </td>
                  <td className="px-4 py-3">
                    <LeadStatusChip status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatRelativeDate(lead.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
