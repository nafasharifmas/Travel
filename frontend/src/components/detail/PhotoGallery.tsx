import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

interface PhotoGalleryProps {
  /** Real photograph URLs sourced from the destination record. */
  photos: string[];
  /** Currently displayed photo index (owned by the parent page). */
  activeIndex: number;
  /** Notifies the parent which photo should be active. */
  onSelect: (index: number) => void;
  /** Destination name, used for accessible labels. */
  placeName: string;
}

/**
 * Accessible, keyboard-operable photograph gallery.
 *
 * Controlled component: the active index state lives in the parent page so the
 * existing `activePhotoIdx` logic remains untouched. This component only adds
 * semantics (region / carousel roles, arrow-key navigation), graceful image
 * fallbacks and premium presentation.
 */
export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  activeIndex,
  onSelect,
  placeName,
}) => {
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const total = photos.length;

  if (total === 0) {
    return (
      <div className="h-[240px] sm:h-[300px] lg:h-[400px] w-full rounded-media grid place-items-center bg-navy-100 border border-navy-200 overflow-hidden">
        <div className="text-center space-y-2 text-navy-500 px-6">
          <ImageOff className="w-8 h-8 mx-auto" aria-hidden="true" />
          <p className="text-sm font-medium">No photographs listed for this destination.</p>
        </div>
      </div>
    );
  }

  // Defensive clamp: keeps the gallery valid even if the index ever drifts.
  const safeIndex = activeIndex >= 0 && activeIndex < total ? activeIndex : 0;

  const go = (next: number) => onSelect(((next % total) + total) % total);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (total < 2) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(safeIndex + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(safeIndex - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      go(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      go(total - 1);
    }
  };

  const mainFailed = failed[safeIndex];
  const currentUrl = photos[safeIndex];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`${placeName} photograph gallery`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="space-y-4 rounded-media"
    >
      {/* Primary stage */}
      <div className="relative h-[240px] sm:h-[300px] lg:h-[400px] w-full rounded-media overflow-hidden bg-navy-900 border border-navy-800/40 shadow-card">
        {mainFailed ? (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-navy-800 to-navy-950 px-6 text-center">
            <div className="space-y-2 text-navy-200">
              <ImageOff className="w-9 h-9 mx-auto" aria-hidden="true" />
              <p className="text-sm font-semibold text-white">Photograph unavailable</p>
              <p className="text-xs text-navy-300">
                This image could not be loaded. Choose another from the strip below.
              </p>
            </div>
          </div>
        ) : (
          <img
            key={currentUrl}
            src={currentUrl}
            alt={`${placeName} — photograph ${safeIndex + 1} of ${total}`}
            loading={safeIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setFailed((prev) => ({ ...prev, [safeIndex]: true }))}
            className="w-full h-full object-cover animate-fadeIn"
          />
        )}

        {/* Legibility scrim for the overlay chrome */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-navy-950/10 pointer-events-none"
          aria-hidden="true"
        />

        {total > 1 && (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-pill bg-navy-950/70 backdrop-blur-md text-white text-xs font-semibold border border-white/15">
            {safeIndex + 1} / {total}
          </span>
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(safeIndex - 1)}
              aria-label="Show previous photograph"
              className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center w-11 h-11 rounded-full bg-navy-950/60 hover:bg-navy-900 text-white border border-white/20 backdrop-blur-md transition-colors duration-200 ease-premium focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => go(safeIndex + 1)}
              aria-label="Show next photograph"
              className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-11 h-11 rounded-full bg-navy-950/60 hover:bg-navy-900 text-white border border-white/20 backdrop-blur-md transition-colors duration-200 ease-premium focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail selector */}
      {total > 1 && (
        <ul
          aria-label={`${placeName} photograph thumbnails`}
          className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none"
        >
          {photos.map((url, idx) => {
            const isActive = idx === safeIndex;
            const thumbFailed = failed[idx];

            return (
              <li key={`${url}-${idx}`} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onSelect(idx)}
                  aria-label={`Show photograph ${idx + 1} of ${total}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`block w-20 h-14 rounded-btn overflow-hidden border-2 transition-all duration-200 ease-premium focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2 ${
                    isActive
                      ? 'border-turquoise-500 ring-2 ring-turquoise-500/40'
                      : 'border-transparent opacity-70 hover:opacity-100 hover:border-ocean-300'
                  }`}
                >
                  {thumbFailed ? (
                    <span className="grid place-items-center w-full h-full bg-navy-100 text-navy-500">
                      <ImageOff className="w-4 h-4" aria-hidden="true" />
                    </span>
                  ) : (
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={() => setFailed((prev) => ({ ...prev, [idx]: true }))}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
