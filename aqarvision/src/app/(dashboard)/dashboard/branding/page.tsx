import { requirePermission } from '@/lib/auth/guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandingForm } from './form';

export const metadata = { title: 'Branding' };

export default async function BrandingPage() {
  const tenant = await requirePermission('branding:read');
  const isEnterprise = tenant.agency.active_plan === 'enterprise';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-3 font-bold">Branding</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Personnalisez l&apos;identite visuelle de votre agence.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations de l&apos;agence</CardTitle>
          </CardHeader>
          <CardContent>
            <BrandingForm agency={tenant.agency} canEdit={true} isEnterprise={isEnterprise} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apercu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-6" style={{ borderColor: tenant.agency.primary_color }}>
              <div className="flex items-center gap-3">
                {tenant.agency.logo_url ? (
                  <img src={tenant.agency.logo_url} alt="" className="h-12 w-12 rounded-md object-cover" />
                ) : (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-md text-lg font-bold text-white"
                    style={{ backgroundColor: tenant.agency.primary_color }}
                  >
                    {tenant.agency.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{tenant.agency.name}</h3>
                  {tenant.agency.slogan && (
                    <p className="text-sm text-muted-foreground">{tenant.agency.slogan}</p>
                  )}
                </div>
              </div>

              {/* Enterprise preview */}
              {isEnterprise && tenant.agency.cover_image_url && (
                <div className="mt-4 overflow-hidden rounded-lg">
                  <img
                    src={tenant.agency.cover_image_url}
                    alt="Apercu couverture"
                    className="h-24 w-full object-cover"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
