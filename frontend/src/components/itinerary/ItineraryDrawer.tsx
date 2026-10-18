import React, { useEffect, useRef, useState } from 'react';
import { useItinerary } from '../../context/ItineraryContext';
import { useAuth } from '../../context/AuthContext';
import { SavePromptModal } from './SavePromptModal';
import {
  X,
  MapPin,
  Clock,
  ArrowUp,
  ArrowDown,
  Trash2,
  Save,
  Route,
  Sparkles,
} from 'lucide-react';

const DRAWER_TITLE_ID = 'itinerary-drawer-title';

/**
 * Presentation-only shell that owns the slide-in transition. It is mounted only
 * while the drawer is open, so the enter animation replays on every open and no
 * cross-render animation state leaks out of the drawer.
 */
const DrawerShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Flip to the "in" position on the next frame so the transition actually runs.
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Move focus into the panel when it opens.
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={DRAWER_TITLE_ID}
      className={`fixed inset-0 z-50 flex justify-end bg-navy-950/50 backdrop-blur-sm transition-opacity duration-300 ease-premium ${
        shown ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`flex h-full w-full max-w-md flex-col bg-white shadow-card-hover outline-none transition-transform duration-300 ease-premium ${
          shown ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export const ItineraryDrawer: React.FC = () => {
  const {
    stops,
    removeStop,
    updateStop,
    reorderStop,
    clearPlan,
    isDrawerOpen,
    setIsDrawerOpen,
  } = useItinerary();
  const { isAuthenticated } = useAuth();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Escape closes the drawer. The plan lives in ItineraryContext, so nothing is lost.
  // Deliberately no backdrop-click close: an accidental click must not interrupt editing.
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isDrawerOpen, setIsDrawerOpen]);

  if (!isDrawerOpen) return null;

  // Approximate duration calculation: ~2.5 hrs per stop + travel
  const estimatedHours = stops.length * 2.5;

  const iconButtonClass =
    'grid h-11 w-11 shrink-0 place-items-center rounded-full text-navy-500 transition-colors hover:bg-navy-100 hover:text-navy-800 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <>
      <DrawerShell>
        {/* Drawer header */}
        <header className="shrink-0 bg-navy-900 px-5 pb-4 pt-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <span className="eyebrow text-turquoise-300">
              <Route className="h-3.5 w-3.5" />
              One-Day Route Plan
            </span>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Close itinerary drawer"
              className="-mr-1.5 -mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-navy-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <h2 id={DRAWER_TITLE_ID} className="mt-2 font-serif text-h4 text-white">
            Day Journey Draft
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-navy-300">
            <span className="inline-flex items-center gap-1.5 font-semibold text-white">
              <MapPin className="h-4 w-4 text-turquoise-300" />
              {stops.length} {stops.length === 1 ? 'Stop' : 'Stops'} Selected
            </span>
            {stops.length > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-turquoise-300" />
                ~{estimatedHours} Hours Total
              </span>
            )}
          </div>
        </header>

        {/* Scrollable body */}
        <div
          className="thin-scroll flex-1 space-y-3 overflow-y-auto bg-ivory-100 p-4"
          aria-live="polite"
        >
          {stops.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-media border border-ocean-100 bg-ocean-50 text-ocean-500">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-base font-serif font-bold text-navy-900">
                Your day plan is empty
              </h3>
              <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-navy-500">
                Browse verified places in the catalogue and tap "Add to Plan" to assemble your
                coherent 1-day trip.
              </p>
            </div>
          ) : (
            stops.map((stop, index) => {
              const place = stop.place;
              return (
                <article
                  key={stop.place_id}
                  className="rounded-card border border-navy-200 bg-white p-3.5 shadow-card transition-all duration-300 ease-premium hover:border-ocean-200 hover:shadow-card-hover"
                >
                  {/* Sequence number, place name & controls */}
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ocean-500 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <h4 className="min-w-0 flex-1 truncate text-sm font-bold text-navy-900">
                      {place?.name || `Place #${stop.place_id}`}
                    </h4>

                    <div className="-mr-1.5 flex shrink-0 items-center">
                      <button
                        type="button"
                        onClick={() => reorderStop(index, 'up')}
                        disabled={index === 0}
                        aria-label={`Move ${place?.name} up`}
                        className={iconButtonClass}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => reorderStop(index, 'down')}
                        disabled={index === stops.length - 1}
                        aria-label={`Move ${place?.name} down`}
                        className={iconButtonClass}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStop(stop.place_id)}
                        aria-label={`Remove ${place?.name} from plan`}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail & planned time */}
                  <div className="mt-3 flex items-start gap-3">
                    {place?.primary_photo && (
                      <img
                        src={place.primary_photo}
                        alt={place.name}
                        loading="lazy"
                        className="h-16 w-16 shrink-0 rounded-media border border-navy-200 object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <label htmlFor={`stop-time-${stop.place_id}`} className="field-label">
                        Planned time
                      </label>
                      <div className="relative">
                        <Clock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
                        <input
                          id={`stop-time-${stop.place_id}`}
                          type="time"
                          value={stop.visit_time || ''}
                          onChange={(e) => updateStop(stop.place_id, undefined, e.target.value)}
                          placeholder="Planned time"
                          className="field pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Optional stop notes */}
                  <div className="mt-3">
                    <label htmlFor={`stop-notes-${stop.place_id}`} className="field-label">
                      Stop notes
                    </label>
                    <input
                      id={`stop-notes-${stop.place_id}`}
                      type="text"
                      value={stop.notes || ''}
                      onChange={(e) => updateStop(stop.place_id, e.target.value, undefined)}
                      placeholder="Optional stop notes (e.g. entrance ticket / best photo spot)"
                      className="field"
                    />
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Sticky footer actions */}
        <footer className="shrink-0 space-y-2.5 border-t border-navy-200 bg-white p-4">
          {!isAuthenticated && stops.length > 0 && (
            <div className="flex items-start gap-2.5 rounded-btn border border-sunset-200 bg-sunset-50 p-3 text-xs text-navy-700">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sunset-500" />
              <p>
                <strong className="font-bold text-navy-900">Guest Mode:</strong> Your draft is
                saved in this browser session. Sign in to permanently save and sync your trip.
              </p>
            </div>
          )}

          <button
            type="button"
            disabled={stops.length === 0}
            onClick={() => setIsSaveModalOpen(true)}
            className="btn-conversion w-full"
          >
            <Save className="h-4 w-4" />
            {isAuthenticated ? 'Save Itinerary' : 'Save & Preserve Plan'}
          </button>

          {stops.length > 0 && (
            <button
              type="button"
              onClick={clearPlan}
              className="btn-ghost w-full text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Clear Day Plan
            </button>
          )}
        </footer>
      </DrawerShell>

      <SavePromptModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />
    </>
  );
};
