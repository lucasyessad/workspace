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

  const isEnterprise = agency.active_plan === 'enterprise';
  const isDark = isEnterprise && agency.theme_mode !== 'light';
  const secondaryColor = agency.secondary_color ?? '#b8963e';
  const fontClass = isEnterprise && agency.font_style !== 'modern' ? 'font-display' : '';

  // Enterprise luxury contact page
  if (isEnterprise) {
    return (
      <section className={`py-24 ${isDark ? '' : ''}`}>
        <div className="container max-w-4xl">
          <div className="text-center">
            <p
              className="text-caption uppercase tracking-[0.3em]"
              style={{ color: secondaryColor }}
            >
              Prenez contact
            </p>
            <h1 className={`mt-3 ${fontClass} text-heading-1 font-bold ${isDark ? 'text-white' : 'text-bleu-nuit'}`}>
              Contactez-nous
            </h1>
            <div className="mx-auto mt-4 flex justify-center">
              <div className="h-0.5 w-16" style={{ backgroundColor: secondaryColor }} />
            </div>
            <p className={`mt-4 text-body ${isDark ? 'text-white/60' : 'text-bleu-nuit/60'}`}>
              N&apos;hesitez pas a nous contacter pour toute demande d&apos;information.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              {agency.phone && (
                <div className={`flex items-center gap-4 p-6 ${isDark ? 'bg-white/5' : 'bg-blanc-casse'} rounded-sm`}>
                  <Phone className="h-5 w-5" style={{ color: secondaryColor }} />
                  <div>
                    <p className={`text-xs uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-bleu-nuit/40'}`}>Telephone</p>
                    <a
                      href={`tel:${agency.phone}`}
                      className={`font-semibold hover:underline cursor-pointer ${isDark ? 'text-white' : 'text-bleu-nuit'}`}
                    >
                      {agency.phone}
                    </a>
                  </div>
                </div>
              )}
              {agency.email && (
                <div className={`flex items-center gap-4 p-6 ${isDark ? 'bg-white/5' : 'bg-blanc-casse'} rounded-sm`}>
                  <Mail className="h-5 w-5" style={{ color: secondaryColor }} />
                  <div>
                    <p className={`text-xs uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-bleu-nuit/40'}`}>Email</p>
                    <a
                      href={`mailto:${agency.email}`}
                      className={`font-semibold hover:underline cursor-pointer ${isDark ? 'text-white' : 'text-bleu-nuit'}`}
                    >
                      {agency.email}
                    </a>
                  </div>
                </div>
              )}
              {agency.address && (
                <div className={`flex items-center gap-4 p-6 ${isDark ? 'bg-white/5' : 'bg-blanc-casse'} rounded-sm`}>
                  <MapPin className="h-5 w-5" style={{ color: secondaryColor }} />
                  <div>
                    <p className={`text-xs uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-bleu-nuit/40'}`}>Adresse</p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-bleu-nuit'}`}>
                      {agency.address}
                    </p>
                  </div>
                </div>
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

  // Standard contact page
  return (
    <section className="py-12">
      <div className="container max-w-4xl">
        <h1 className="text-heading-2 font-bold text-bleu-nuit">Contactez {agency.name}</h1>
        <p className="mt-2 text-body text-muted-foreground">
          N&apos;hesitez pas a nous contacter pour toute demande d&apos;information.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            {agency.phone && (
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <Phone className="h-5 w-5 text-or" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telephone</p>
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
