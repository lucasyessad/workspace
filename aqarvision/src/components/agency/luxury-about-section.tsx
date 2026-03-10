'use client';

import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import type { Agency } from '@/types';

interface LuxuryAboutSectionProps {
  agency: Agency;
}

export function LuxuryAboutSection({ agency }: LuxuryAboutSectionProps) {
  const containerRef = useScrollReveal();
  const isDark = agency.theme_mode !== 'light';
  const secondaryColor = agency.secondary_color ?? '#b8963e';
  const fontClass = agency.font_style === 'modern' ? 'font-sans' : 'font-display';

  if (!agency.description) return null;

  const hasStats = agency.stats_years || agency.stats_properties_sold || agency.stats_clients;

  return (
    <section
      ref={containerRef}
      className={`py-24 ${isDark ? 'bg-white/[0.02]' : 'bg-blanc-casse'}`}
    >
      <div className="container max-w-4xl">
        {/* Section header */}
        <div className="luxury-scroll-reveal text-center">
          <p
            className="text-caption uppercase tracking-[0.3em]"
            style={{ color: secondaryColor }}
          >
            Notre histoire
          </p>
          <h2 className={`mt-3 ${fontClass} text-heading-1 font-bold ${isDark ? 'text-white' : 'text-bleu-nuit'}`}>
            A propos
          </h2>
          <div className="mx-auto mt-4 flex justify-center">
            <div className="h-0.5 w-16" style={{ backgroundColor: secondaryColor }} />
          </div>
        </div>

        {/* Description */}
        <div className="luxury-scroll-reveal mt-12 text-center">
          <p className={`whitespace-pre-wrap text-body-lg leading-relaxed ${
            isDark ? 'text-white/70' : 'text-bleu-nuit/70'
          } ${agency.font_style === 'classic' ? 'font-display' : ''}`}>
            {agency.description}
          </p>
        </div>

        {/* Stats */}
        {hasStats && (
          <div className={`luxury-scroll-reveal mt-16 grid gap-8 text-center sm:grid-cols-3`}>
            {agency.stats_years && (
              <div className={`${isDark ? 'border-white/10' : 'border-bleu-nuit/10'}`}>
                <p
                  className={`${fontClass} text-display font-bold`}
                  style={{ color: secondaryColor }}
                >
                  {agency.stats_years}+
                </p>
                <p className={`mt-2 text-sm uppercase tracking-widest ${isDark ? 'text-white/50' : 'text-bleu-nuit/50'}`}>
                  Annees d&apos;experience
                </p>
              </div>
            )}
            {agency.stats_properties_sold && (
              <div>
                <p
                  className={`${fontClass} text-display font-bold`}
                  style={{ color: secondaryColor }}
                >
                  {agency.stats_properties_sold.toLocaleString('fr-FR')}+
                </p>
                <p className={`mt-2 text-sm uppercase tracking-widest ${isDark ? 'text-white/50' : 'text-bleu-nuit/50'}`}>
                  Biens vendus
                </p>
              </div>
            )}
            {agency.stats_clients && (
              <div>
                <p
                  className={`${fontClass} text-display font-bold`}
                  style={{ color: secondaryColor }}
                >
                  {agency.stats_clients.toLocaleString('fr-FR')}+
                </p>
                <p className={`mt-2 text-sm uppercase tracking-widest ${isDark ? 'text-white/50' : 'text-bleu-nuit/50'}`}>
                  Clients satisfaits
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info cards */}
        <div className="luxury-scroll-reveal mt-16 grid gap-6 sm:grid-cols-3">
          {agency.wilaya && (
            <div className={`p-6 text-center ${isDark ? 'bg-white/5' : 'bg-white'} rounded-sm`}>
              <p className={`text-xs uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-bleu-nuit/40'}`}>
                Wilaya
              </p>
              <p className={`mt-2 font-semibold ${isDark ? 'text-white' : 'text-bleu-nuit'}`}>
                {agency.wilaya}
              </p>
            </div>
          )}
          {agency.license_number && (
            <div className={`p-6 text-center ${isDark ? 'bg-white/5' : 'bg-white'} rounded-sm`}>
              <p className={`text-xs uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-bleu-nuit/40'}`}>
                Registre de commerce
              </p>
              <p className={`mt-2 font-semibold ${isDark ? 'text-white' : 'text-bleu-nuit'}`}>
                {agency.license_number}
              </p>
            </div>
          )}
          {agency.address && (
            <div className={`p-6 text-center ${isDark ? 'bg-white/5' : 'bg-white'} rounded-sm`}>
              <p className={`text-xs uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-bleu-nuit/40'}`}>
                Adresse
              </p>
              <p className={`mt-2 font-semibold ${isDark ? 'text-white' : 'text-bleu-nuit'}`}>
                {agency.address}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
