import { notFound } from 'next/navigation';
import { resolvePublicAgency } from '@/lib/tenant/resolve';
import { TrustBadgeGroup } from '@/components/algeria/trust-badges';
import { LuxuryAboutSection } from '@/components/agency/luxury-about-section';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'A propos' };

export default async function AgencyAboutPage({
  params,
}: {
  params: { slug: string };
}) {
  const agency = await resolvePublicAgency(params.slug);
  if (!agency) notFound();

  const isEnterprise = agency.active_plan === 'enterprise';

  // Enterprise luxury about page
  if (isEnterprise) {
    return <LuxuryAboutSection agency={agency} />;
  }

  // Standard about page
  return (
    <section className="py-12">
      <div className="container max-w-3xl">
        <h1 className="text-heading-2 font-bold text-bleu-nuit">A propos de {agency.name}</h1>

        <div className="mt-4">
          <TrustBadgeGroup isVerified={agency.is_verified} licenseNumber={agency.license_number} />
        </div>

        {agency.description && (
          <p className="mt-8 whitespace-pre-wrap text-body leading-relaxed text-muted-foreground">
            {agency.description}
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {agency.wilaya && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Wilaya</p>
                <p className="font-semibold">{agency.wilaya}</p>
              </CardContent>
            </Card>
          )}
          {agency.license_number && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Registre de commerce</p>
                <p className="font-semibold">{agency.license_number}</p>
              </CardContent>
            </Card>
          )}
          {agency.address && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-semibold">{agency.address}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
