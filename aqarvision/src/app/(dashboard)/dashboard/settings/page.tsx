import { requirePermission } from '@/lib/auth/guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Paramètres' };

export default async function SettingsPage() {
  const tenant = await requirePermission('settings:read');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-3 font-bold">Paramètres</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Configuration de votre agence.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'agence</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Slug</dt>
              <dd className="font-medium">{tenant.agency.slug}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Wilaya</dt>
              <dd className="font-medium">{tenant.agency.wilaya ?? '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">N° Registre de commerce</dt>
              <dd className="font-medium">{tenant.agency.license_number ?? '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Vérifiée</dt>
              <dd className="font-medium">{tenant.agency.is_verified ? 'Oui' : 'Non'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
