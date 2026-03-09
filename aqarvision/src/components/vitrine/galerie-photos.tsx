"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
  Expand,
  Building2,
} from "lucide-react";

interface GaleriePhotosProps {
  photos: string[];
  titre: string;
  typeTransaction: string;
  statutDocument: string;
}

export function GaleriePhotos({
  photos,
  titre,
  typeTransaction,
  statutDocument,
}: GaleriePhotosProps) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const total = photos.length;

  const precedent = useCallback(() => {
    setIndex((i) => (i === 0 ? total - 1 : i - 1));
  }, [total]);

  const suivant = useCallback(() => {
    setIndex((i) => (i === total - 1 ? 0 : i + 1));
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") precedent();
      if (e.key === "ArrowRight") suivant();
      if (e.key === "Escape") setLightbox(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [precedent, suivant]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  if (total === 0) {
    return (
      <div className="aspect-[16/9] rounded-2xl bg-gray-100 flex items-center justify-center shadow-sm">
        <Building2 className="h-16 w-16 text-gray-300/20" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 animate-fade-in-up">
        {/* Photo principale */}
        <div
          className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 shadow-md group cursor-pointer"
          onClick={() => setLightbox(true)}
        >
          <img
            src={photos[index]}
            alt={`${titre} - ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-500"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-4 start-4 flex gap-2">
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-bleu-nuit/85 text-white backdrop-blur-sm">
              {typeTransaction}
            </span>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/85 text-white backdrop-blur-sm">
              {statutDocument}
            </span>
          </div>

          {/* Expand button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(true);
            }}
            className="absolute top-4 end-4 w-9 h-9 rounded-xl bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          >
            <Expand className="h-4 w-4" />
          </button>

          {/* Navigation arrows */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  precedent();
                }}
                className="absolute start-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-900 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  suivant();
                }}
                className="absolute end-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-900 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Counter */}
          {total > 1 && (
            <div className="absolute bottom-4 end-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
              <Camera className="h-3.5 w-3.5" />
              {index + 1} / {total}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {total > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 ${
                  i === index
                    ? "ring-2 ring-or ring-offset-2 ring-offset-blanc-casse"
                    : "opacity-60 hover:opacity-100 hover:ring-2 hover:ring-or/40 hover:ring-offset-1"
                }`}
              >
                <img
                  src={photo}
                  alt={`${titre} - ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ═══ Lightbox ═══ */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-5 start-1/2 -translate-x-1/2 text-white/60 text-sm font-medium z-10">
            {index + 1} / {total}
          </div>

          {/* Main image */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[index]}
              alt={`${titre} - ${index + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>

          {/* Navigation */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  precedent();
                }}
                className="absolute start-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  suivant();
                }}
                className="absolute end-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Thumbnail strip */}
          {total > 1 && (
            <div className="absolute bottom-4 start-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  className={`w-16 h-11 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${
                    i === index
                      ? "ring-2 ring-or opacity-100"
                      : "opacity-40 hover:opacity-80"
                  }`}
                >
                  <img
                    src={photo}
                    alt={`${titre} - ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
