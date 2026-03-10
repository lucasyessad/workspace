'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PropertyImage } from '@/types';

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
        <Home className="h-16 w-16 text-muted-foreground/20" />
      </div>
    );
  }

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  return (
    <>
      {/* Grid gallery */}
      <div
        className={cn(
          'grid gap-2 rounded-xl overflow-hidden',
          images.length === 1 && 'grid-cols-1',
          images.length === 2 && 'grid-cols-2',
          images.length >= 3 && 'grid-cols-2 grid-rows-2'
        )}
      >
        {images.slice(0, 4).map((img, i) => (
          <button
            key={img.id}
            onClick={() => openLightbox(i)}
            className={cn(
              'relative overflow-hidden bg-muted cursor-pointer',
              images.length >= 3 && i === 0 && 'row-span-2',
              images.length === 1 ? 'aspect-video' : 'aspect-[4/3]'
            )}
          >
            {img.public_url ? (
              <img
                src={img.public_url}
                alt={img.alt_text || title}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Home className="h-8 w-8 text-muted-foreground/20" />
              </div>
            )}

            {/* Show count on last visible image */}
            {i === 3 && images.length > 4 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                <span className="text-lg font-bold">+{images.length - 4} photos</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setLightboxOpen(false)}>
          <button
            className="absolute right-4 top-4 text-white hover:text-white/80 cursor-pointer"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>

          <button
            className="absolute left-4 text-white hover:text-white/80 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
            }}
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <div className="max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            {images[lightboxIndex]?.public_url && (
              <img
                src={images[lightboxIndex].public_url!}
                alt={images[lightboxIndex].alt_text || title}
                className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
              />
            )}
          </div>

          <button
            className="absolute right-4 text-white hover:text-white/80 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev + 1) % images.length);
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="absolute bottom-4 text-sm text-white/60">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
