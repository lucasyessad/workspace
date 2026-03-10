'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Menu, X } from 'lucide-react';
import { TrustBadgeGroup } from '@/components/algeria/trust-badges';
import type { Agency } from '@/types';

interface LuxuryLayoutProps {
  agency: Agency;
  children: React.ReactNode;
}

export function LuxuryLayout({ agency, children }: LuxuryLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = agency.theme_mode !== 'light';
  const secondaryColor = agency.secondary_color ?? '#b8963e';
  const fontClass = agency.font_style === 'modern' ? 'font-sans' : 'font-display';

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: `/agence/${agency.slug}/annonces`, label: 'Annonces' },
    { href: `/agence/${agency.slug}/a-propos`, label: 'A propos' },
    { href: `/agence/${agency.slug}/contact`, label: 'Contact' },
  ];

  return (
    <div className={`flex min-h-screen flex-col ${isDark ? 'bg-bleu-nuit text-white' : 'bg-white text-bleu-nuit'}`}>
      {/* Header */}
      <header
        className={`luxury-header-glass fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? isDark
              ? 'is-scrolled bg-bleu-nuit/90'
              : 'is-scrolled bg-white/90'
            : 'bg-transparent'
        }`}
      >
        <div className="container flex h-20 items-center justify-between">
          <Link href={`/agence/${agency.slug}`} className="flex items-center gap-3 cursor-pointer">
            {agency.logo_url ? (
              <img src={agency.logo_url} alt={agency.name} className="h-10 w-10 rounded-md object-cover" />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold text-white"
                style={{ backgroundColor: agency.primary_color }}
              >
                {agency.name.charAt(0)}
              </div>
            )}
            <span className={`${fontClass} text-lg font-semibold tracking-wide`}>
              {agency.name}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm uppercase tracking-widest transition-colors ${
                  isDark
                    ? 'text-white/70 hover:text-white'
                    : 'text-bleu-nuit/70 hover:text-bleu-nuit'
                } cursor-pointer`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className={`border-t md:hidden ${isDark ? 'border-white/10 bg-bleu-nuit/95' : 'border-bleu-nuit/10 bg-white/95'} backdrop-blur`}>
            <nav className="container flex flex-col gap-4 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm uppercase tracking-widest ${
                    isDark ? 'text-white/70' : 'text-bleu-nuit/70'
                  } cursor-pointer`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className={`${isDark ? 'bg-bleu-nuit border-t border-white/10' : 'bg-blanc-casse border-t border-bleu-nuit/10'}`}>
        <div
          className="h-0.5 w-full"
          style={{ backgroundColor: secondaryColor }}
        />
        <div className="container py-16">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <h3 className={`${fontClass} text-heading-4 font-semibold`}>
                {agency.name}
              </h3>
              {agency.slogan && (
                <p className={`mt-2 text-sm ${isDark ? 'text-white/50' : 'text-bleu-nuit/50'}`}>
                  {agency.slogan}
                </p>
              )}
              <div className="mt-4">
                <TrustBadgeGroup isVerified={agency.is_verified} licenseNumber={agency.license_number} />
              </div>
            </div>

            <div className={`space-y-3 text-sm ${isDark ? 'text-white/60' : 'text-bleu-nuit/60'}`}>
              {agency.phone && (
                <a href={`tel:${agency.phone}`} className="flex items-center gap-3 transition-colors hover:text-current cursor-pointer">
                  <Phone className="h-4 w-4" style={{ color: secondaryColor }} />
                  {agency.phone}
                </a>
              )}
              {agency.email && (
                <a href={`mailto:${agency.email}`} className="flex items-center gap-3 transition-colors hover:text-current cursor-pointer">
                  <Mail className="h-4 w-4" style={{ color: secondaryColor }} />
                  {agency.email}
                </a>
              )}
              {agency.address && (
                <p className="flex items-center gap-3">
                  <MapPin className="h-4 w-4" style={{ color: secondaryColor }} />
                  {agency.address}
                </p>
              )}
            </div>

            <div className={`text-sm ${isDark ? 'text-white/40' : 'text-bleu-nuit/40'}`}>
              <p>
                Propulse par{' '}
                <Link href="/" className="font-medium transition-colors hover:text-current cursor-pointer" style={{ color: secondaryColor }}>
                  AqarVision
                </Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
