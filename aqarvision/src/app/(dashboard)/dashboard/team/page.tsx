import { requirePermission } from '@/lib/auth/guard';
import { getAgencyTeam } from '@/lib/queries';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS } from '@/lib/permissions';

export const metadata = { title: 'Équipe' };

export default async function TeamPage() {
  const tenant = await requirePermission('team:read');
  const members = await getAgencyTeam(tenant.agency.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-3 font-bold">Équipe</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          {members.length} membre{members.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bleu-nuit text-sm font-bold text-white">
                  {member.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{member.full_name}</p>
                  <Badge variant="outline" className="mt-1">
                    {ROLE_LABELS[member.role]}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Statut: {member.status === 'active' ? 'Actif' : member.status}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
