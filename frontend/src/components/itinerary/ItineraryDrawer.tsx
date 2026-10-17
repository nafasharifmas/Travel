import React, { useState } from 'react';
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
  Calendar,
  Save,
  Route,
  Sparkles,
} from 'lucide-react';

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

  if (!isDrawerOpen) return null;

  // Approximate duration calculation: ~2.5 hrs per stop + travel
  const estimatedHours = stops.length * 2.5;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="One-day itinerary builder drawer"
        className="fixed inset-0 z-50 flex justify-end bg-espresso-950/50 backdrop-blur-sm transition-opacity"
      >
        <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between text-espresso-950 animate-in slide-in-from-right duration-250">
          {/* Drawer Header */}
          <div className="bg-[#1c1917] text-white p-5 border-b border-sand-200/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Route className="w-4 h-4" />
                One-Day Expedition Plan
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close itinerary drawer"
                className="p-1 text-sand-400 hover:text-white rounded-full hover:bg-white/10 transition-colors focus:ring-2 focus:ring-amber-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl font-bold font-sans">
              Day Journey Draft
            </h2>

            <div className="flex items-center gap-4 text-xs text-sand-300 mt-2">
              <span className="flex items-center gap-1 font-semibold text-white">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {stops.length} {stops.length === 1 ? 'Stop' : 'Stops'} Selected
              </span>
              {stops.length > 0 && (
                <span className="flex items-center gap-1 text-sand-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  ~{estimatedHours} Hours Total
                </span>
              )}
            </div>
          </div>

          {/* Stops List */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf8f5]"
            aria-live="polite"
          >
            {stops.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <div className="w-14 h-14 rounded-2xl bg-sand-200/60 flex items-center justify-center text-stone-400 mb-3">
                  <MapPin className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-base font-bold text-stone-800">
                  Your day plan is empty
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs leading-relaxed">
                  Browse verified places in the catalogue and tap "Add to Plan" to assemble your coherent 1-day trip.
                </p>
              </div>
            ) : (
              stops.map((stop, index) => {
                const place = stop.place;
                return (
                  <div
                    key={stop.place_id}
                    className="bg-white rounded-xl p-3.5 border border-sand-200 shadow-sm space-y-2.5 transition-all hover:border-amber-400"
                  >
                    {/* Header: Sequence Number & Controls */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-espresso-950 font-black text-xs flex items-center justify-center shadow-sm">
                          {index + 1}
                        </span>
                        <h4 className="text-xs font-bold text-stone-900 truncate max-w-[200px]">
                          {place?.name || `Place #${stop.place_id}`}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => reorderStop(index, 'up')}
                          disabled={index === 0}
                          aria-label={`Move ${place?.name} up`}
                          className="p-1 rounded text-stone-400 hover:text-stone-800 hover:bg-sand-100 disabled:opacity-20 transition-colors"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => reorderStop(index, 'down')}
                          disabled={index === stops.length - 1}
                          aria-label={`Move ${place?.name} down`}
                          className="p-1 rounded text-stone-400 hover:text-stone-800 hover:bg-sand-100 disabled:opacity-20 transition-colors"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStop(stop.place_id)}
                          aria-label={`Remove ${place?.name} from plan`}
                          className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail & Timing */}
                    <div className="flex items-center gap-3">
                      {place?.primary_photo && (
                        <img
                          src={place.primary_photo}
                          alt={place.name}
                          className="w-14 h-11 object-cover rounded-lg shrink-0 border border-sand-200"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                          <input
                            type="time"
                            value={stop.visit_time || ''}
                            onChange={(e) =>
                              updateStop(stop.place_id, undefined, e.target.value)
                            }
                            placeholder="Planned time"
                            aria-label={`Planned time for ${place?.name}`}
                            className="text-xs bg-sand-50 border border-sand-200 rounded px-2 py-1 text-stone-800 font-medium focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Optional Stop Notes */}
                    <div>
                      <input
                        type="text"
                        value={stop.notes || ''}
                        onChange={(e) =>
                          updateStop(stop.place_id, e.target.value, undefined)
                        }
                        placeholder="Optional stop notes (e.g. entrance ticket / best photo spot)"
                        aria-label={`Notes for ${place?.name}`}
                        className="w-full text-xs bg-sand-50/70 border border-sand-200 rounded-lg px-2.5 py-1.5 text-stone-700 placeholder-stone-400 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 bg-white border-t border-sand-200 space-y-2">
            {!isAuthenticated && stops.length > 0 && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900 mb-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Guest Mode:</strong> Your draft is saved in this browser session. Sign in to permanently save and sync your trip.
                </p>
              </div>
            )}

            <button
              type="button"
              disabled={stops.length === 0}
              onClick={() => setIsSaveModalOpen(true)}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-espresso-950 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
            >
              <Save className="w-4 h-4" />
              {isAuthenticated ? 'Save Itinerary' : 'Save & Preserve Plan'}
            </button>

            {stops.length > 0 && (
              <button
                type="button"
                onClick={clearPlan}
                className="w-full py-2 text-xs text-stone-500 hover:text-red-600 transition-colors font-semibold"
              >
                Clear Day Plan
              </button>
            )}
          </div>
        </div>
      </div>

      <SavePromptModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />
    </>
  );
};

