'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import type { Agency, Property } from '@/types';

interface LuxuryPropertiesSectionProps {
  agency: Agency;
  properties: Property[];
  total: number;
}

export function LuxuryPropertiesSection({ agency, properties, total }: LuxuryPropertiesSectionProps) {
  const containerRef = useScrollReveal();
  const isDark = agency.theme_mode !== 'light';
  const secondaryColor = agency.secondary_color ?? '#b8963e';
  const fontClass = agency.font_style === 'modern' ? 'font-sans' : 'font-display';

  if (properties.length === 0) return null;

  return (
    <section
      ref={containerRef}
      className={`py-24 ${isDark ? 'bg-bleu-nuit' : 'bg-white'}`}
    >
      <div className="container">
        {/* Section header */}
        <div className="luxury-scroll-reveal text-center">
          <p
            className="text-caption uppercase tracking-[0.3em]"
            style={{ color: secondaryColor }}
          >
            Portfolio
          </p>
          <h2 className={`mt-3 ${fontClass} text-heading-1 font-bold ${isDark ? 'text-white' : 'text-bleu-nuit'}`}>
            Nos biens
          </h2>
          <div className="mx-auto mt-4 flex justify-center">
            <div className="h-0.5 w-16" style={{ backgroundColor: secondaryColor }} />
          </div>
        </div>

        {/* Properties grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, i) => (
              <Link
                key={property.id}
                href={`/agence/${agency.slug}/annonces/${property.slug}`}
                className={`luxury-scroll-reveal luxury-property-card group block cursor-pointer`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Image placeholder */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className={`flex h-full w-full items-center justify-center ${isDark ? 'bg-white/5' : 'bg-bleu-nuit/5'}`}>
                    <span className={`text-sm ${isDark ? 'text-white/30' : 'text-bleu-nuit/30'}`}>
                      {property.property_type}
                    </span>
                  </div>
                  {/* Price overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-lg font-bold text-white">
                      {property.price.toLocaleString('fr-FR')} {property.currency}
                    </p>
                  </div>
                  {/* Transaction type badge */}
                  <div
                    className="absolute left-4 top-4 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    {property.transaction_type === 'sale' ? 'Vente' : property.transaction_type === 'rent' ? 'Location' : 'Vacances'}
                  </div>
                </div>

                {/* Info */}
                <div className={`p-4 ${isDark ? 'bg-white/5' : 'bg-blanc-casse'}`}>
                  <h3 className={`${fontClass} font-semibold ${isDark ? 'text-white' : 'text-bleu-nuit'} group-hover:underline`}>
                    {property.title}
                  </h3>
                  <p className={`mt-1 text-sm ${isDark ? 'text-white/50' : 'text-bleu-nuit/50'}`}>
                    {property.wilaya}{property.commune ? `, ${property.commune}` : ''}
                    {property.surface ? ` — ${property.surface} m²` : ''}
                  </p>
                </div>
              </Link>
          ))}
        </div>

        {/* View all button */}
        {total > properties.length && (
          <div className="luxury-scroll-reveal mt-12 text-center">
            <Button
              variant="outline"
              size="lg"
              className={`rounded-none px-10 uppercase tracking-widest ${
                isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-bleu-nuit/20 text-bleu-nuit hover:bg-bleu-nuit/5'
              }`}
              asChild
            >
              <Link href={`/agence/${agency.slug}/annonces`}>
                Voir les {total} biens
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
