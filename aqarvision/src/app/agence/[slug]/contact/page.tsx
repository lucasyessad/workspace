import { notFound } from 'next/navigation';
import { Phone, Mail, MapPin } from 'lucide-react';
import { resolvePublicAgency } from '@/lib/tenant/resolve';
import { LeadContactPanel } from '@/components/real-estate/lead-contact-panel';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Contact' };

export default async function AgencyContactPage({
  params,
}: {
  params: { slug: string };
}) {
  const agency = await resolvePublicAgency(params.slug);
  if (!agency) notFound();

  return (
    <section className="py-12">
      <div className="container max-w-4xl">
        <h1 className="text-heading-2 font-bold text-bleu-nuit">Contactez {agency.name}</h1>
        <p className="mt-2 text-body text-muted-foreground">
          N'hésitez pas à nous contacter pour toute demande d'information.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            {agency.phone && (
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <Phone className="h-5 w-5 text-or" />
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <a href={`tel:${agency.phone}`} className="font-semibold hover:underline cursor-pointer">{agency.phone}</a>
                  </div>
                </CardContent>
              </Card>
            )}
            {agency.email && (
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <Mail className="h-5 w-5 text-or" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href={`mailto:${agency.email}`} className="font-semibold hover:underline cursor-pointer">{agency.email}</a>
                  </div>
                </CardContent>
              </Card>
            )}
            {agency.address && (
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <MapPin className="h-5 w-5 text-or" />
                  <div>
                    <p className="text-sm text-muted-foreground">Adresse</p>
                    <p className="font-semibold">{agency.address}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <LeadContactPanel
            agency={agency}
            agencyId={agency.id}
          />
        </div>
      </div>
    </section>
  );
}
