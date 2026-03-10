import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { resolvePublicAgency } from '@/lib/tenant/resolve';
import { TrustBadgeGroup } from '@/components/algeria/trust-badges';
import { LuxuryLayout } from '@/components/agency/luxury-layout';

export default async function AgencySiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const agency = await resolvePublicAgency(params.slug);
  if (!agency) notFound();

  const isEnterprise = agency.active_plan === 'enterprise';

  // Enterprise agencies get the luxury layout
  if (isEnterprise) {
    return <LuxuryLayout agency={agency}>{children}</LuxuryLayout>;
  }

  // Standard layout for Starter/Pro
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href={`/agence/${agency.slug}`} className="flex items-center gap-3 cursor-pointer">
            {agency.logo_url ? (
              <img src={agency.logo_url} alt={agency.name} className="h-8 w-8 rounded-md object-cover" />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold text-white"
                style={{ backgroundColor: agency.primary_color }}
              >
                {agency.name.charAt(0)}
              </div>
            )}
            <span className="font-semibold">{agency.name}</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href={`/agence/${agency.slug}/annonces`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
              Annonces
            </Link>
            <Link href={`/agence/${agency.slug}/a-propos`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
              A propos
            </Link>
            <Link href={`/agence/${agency.slug}/contact`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/30 py-8">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="font-semibold">{agency.name}</h3>
              {agency.slogan && <p className="mt-1 text-sm text-muted-foreground">{agency.slogan}</p>}
              <div className="mt-3">
                <TrustBadgeGroup isVerified={agency.is_verified} licenseNumber={agency.license_number} />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {agency.phone && (
                <a href={`tel:${agency.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer">
                  <Phone className="h-4 w-4" />{agency.phone}
                </a>
              )}
              {agency.email && (
                <a href={`mailto:${agency.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer">
                  <Mail className="h-4 w-4" />{agency.email}
                </a>
              )}
              {agency.address && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />{agency.address}
                </p>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Propulse par <Link href="/" className="font-medium text-bleu-nuit hover:underline cursor-pointer">AqarVision</Link></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
