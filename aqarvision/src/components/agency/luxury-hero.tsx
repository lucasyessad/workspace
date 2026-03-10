'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Agency } from '@/types';

interface LuxuryHeroProps {
  agency: Agency;
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 2000;
          const start = performance.now();

          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString('fr-FR')}{suffix}
    </span>
  );
}

function getVideoEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}&controls=0&showinfo=0&modestbranding=1&rel=0`;
  }
  // Direct MP4
  if (url.endsWith('.mp4') || url.endsWith('.webm')) {
    return url;
  }
  return null;
}

export function LuxuryHero({ agency }: LuxuryHeroProps) {
  const isDark = agency.theme_mode !== 'light';
  const secondaryColor = agency.secondary_color ?? '#b8963e';
  const heroStyle = agency.hero_style ?? 'cover';
  const fontClass = agency.font_style === 'modern' ? 'font-sans' : 'font-display';

  const hasStats = agency.stats_years || agency.stats_properties_sold || agency.stats_clients;

  const hasCover = heroStyle === 'cover' && agency.cover_image_url;
  const hasVideo = heroStyle === 'video' && agency.hero_video_url;
  const videoUrl = hasVideo ? getVideoEmbedUrl(agency.hero_video_url!) : null;
  const isDirectVideo = videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm'));

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background */}
      {hasCover && (
        <img
          src={agency.cover_image_url!}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {hasVideo && videoUrl && (
        isDirectVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={videoUrl} type={videoUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
          </video>
        ) : (
          <iframe
            src={videoUrl}
            className="absolute inset-0 h-full w-full scale-150 border-0"
            allow="autoplay; encrypted-media"
            title="Hero video"
          />
        )
      )}

      {/* Color background fallback */}
      {!hasCover && !hasVideo && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: agency.primary_color }}
        />
      )}

      {/* Overlay gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, rgba(12,27,42,0.7) 0%, rgba(12,27,42,0.85) 60%, rgba(12,27,42,0.95) 100%)'
            : 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0.9) 100%)',
        }}
      />

      {/* Content */}
      <div className="container relative z-10 text-center">
        {/* Logo */}
        {agency.logo_url && (
          <div className="luxury-animate-scale-in mx-auto mb-8">
            <img
              src={agency.logo_url}
              alt={agency.name}
              className="mx-auto h-20 w-20 rounded-xl object-cover shadow-float"
            />
          </div>
        )}

        {/* Agency name */}
        <h1
          className={`luxury-animate-fade-in-up ${fontClass} ${
            isDark ? 'text-white' : 'text-bleu-nuit'
          } text-display-xl tracking-tight sm:text-display`}
        >
          {agency.name}
        </h1>

        {/* Decorative line */}
        <div className="mx-auto mt-4 flex justify-center">
          <div
            className="luxury-animate-line-grow h-0.5"
            style={{ backgroundColor: secondaryColor }}
          />
        </div>

        {/* Tagline or slogan */}
        {(agency.tagline || agency.slogan) && (
          <p
            className={`luxury-animate-fade-in-delayed mx-auto mt-6 max-w-xl text-body-lg ${
              isDark ? 'text-white/70' : 'text-bleu-nuit/70'
            } ${agency.font_style === 'classic' ? 'font-display italic' : ''}`}
          >
            {agency.tagline ?? agency.slogan}
          </p>
        )}

        {/* CTA */}
        <div className="luxury-animate-fade-in-delayed-2 mt-10">
          <Button
            size="lg"
            className="rounded-none px-10 py-6 text-sm uppercase tracking-widest transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: secondaryColor,
              color: isDark ? '#fff' : '#0c1b2a',
            }}
            asChild
          >
            <Link href={`/agence/${agency.slug}/annonces`}>
              Decouvrir nos biens
            </Link>
          </Button>
        </div>

        {/* Stats */}
        {hasStats && (
          <div className={`luxury-animate-fade-in-delayed-3 mx-auto mt-16 flex max-w-lg justify-center divide-x ${
            isDark ? 'divide-white/20' : 'divide-bleu-nuit/20'
          }`}>
            {agency.stats_years && (
              <div className="px-8 text-center">
                <p className={`${fontClass} text-heading-2 font-bold ${isDark ? 'text-white' : 'text-bleu-nuit'}`}>
                  <AnimatedCounter target={agency.stats_years} suffix="+" />
                </p>
                <p className={`mt-1 text-caption uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-bleu-nuit/50'}`}>
                  Annees
                </p>
              </div>
            )}
            {agency.stats_properties_sold && (
              <div className="px-8 text-center">
                <p className={`${fontClass} text-heading-2 font-bold ${isDark ? 'text-white' : 'text-bleu-nuit'}`}>
                  <AnimatedCounter target={agency.stats_properties_sold} suffix="+" />
                </p>
                <p className={`mt-1 text-caption uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-bleu-nuit/50'}`}>
                  Biens
                </p>
              </div>
            )}
            {agency.stats_clients && (
              <div className="px-8 text-center">
                <p className={`${fontClass} text-heading-2 font-bold ${isDark ? 'text-white' : 'text-bleu-nuit'}`}>
                  <AnimatedCounter target={agency.stats_clients} suffix="+" />
                </p>
                <p className={`mt-1 text-caption uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-bleu-nuit/50'}`}>
                  Clients
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 luxury-animate-scroll-bounce ${
        isDark ? 'text-white/40' : 'text-bleu-nuit/40'
      }`}>
        <ChevronDown className="h-6 w-6" />
      </div>
    </section>
  );
}
