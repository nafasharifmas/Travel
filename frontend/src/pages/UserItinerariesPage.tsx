import React, { useState, useEffect, useMemo } from 'react';
import { Itinerary, ItineraryStop, Place } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { MapCanvas } from '../components/discovery/MapCanvas';
import {
  DEFAULT_USER_LOCATION,
  calculateDistanceKm,
  estimateTravelTimeMinutes,
} from '../utils/geo';
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Edit3,
  Plus,
  ArrowUp,
  ArrowDown,
  Save,
  Archive,
  Compass,
  Loader2,
  Route as RouteIcon,
  LocateFixed,
  AlertCircle,
} from 'lucide-react';

export const UserItinerariesPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStops, setEditStops] = useState<ItineraryStop[]>([]);
  const [placeOptions, setPlaceOptions] = useState<Place[]>([]);
  const [showPlacePicker, setShowPlacePicker] = useState(false);
  const [loadingPlaceOptions, setLoadingPlaceOptions] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchItineraries = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.getItineraries();
      setItineraries(res.itineraries);
      if (res.itineraries.length > 0 && !selectedItinerary) {
        loadDetail(res.itineraries[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load itineraries.');
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id: number) => {
    try {
      const res = await api.getItineraryDetail(id);
      setSelectedItinerary(res.itinerary);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load itinerary details.');
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, [isAuthenticated]);

  const startEdit = () => {
    if (!selectedItinerary) return;
    setEditTitle(selectedItinerary.title);
    setEditDate(selectedItinerary.start_date || '');
    setEditNotes(selectedItinerary.notes || '');
    setEditStops(selectedItinerary.items ? [...selectedItinerary.items] : []);
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItinerary) return;
    setSaving(true);
    try {
      const res = await api.updateItinerary(selectedItinerary.id, {
        title: editTitle,
        start_date: editDate || undefined,
        notes: editNotes,
        items: editStops.map((s, idx) => ({
          place_id: s.place_id,
          sequence_order: idx + 1,
          visit_time: s.visit_time,
          notes: s.notes,
        })),
      });

      setSelectedItinerary(res.itinerary);
      setIsEditing(false);
      fetchItineraries();
    } catch (err: any) {
      alert(err.message || 'Failed to update itinerary.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this trip itinerary?')) return;
    try {
      await api.deleteItinerary(id);
      setSelectedItinerary(null);
      fetchItineraries();
    } catch (err: any) {
      alert(err.message || 'Failed to delete itinerary.');
    }
  };

  const handleMoveStop = (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= editStops.length) return;
    const next = [...editStops];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setEditStops(next.map((s, i) => ({ ...s, sequence_order: i + 1 })));
  };

  const handleRemoveStop = (placeId: number) => {
    setEditStops(editStops.filter((s) => s.place_id !== placeId));
  };

  const handleOpenPlacePicker = async () => {
    setShowPlacePicker((open) => !open);
    if (placeOptions.length > 0) return;

    setLoadingPlaceOptions(true);
    try {
      const response = await api.getPlaces({ sort: 'name' });
      setPlaceOptions(response.places);
    } catch (err: any) {
      alert(err.message || 'Failed to load places.');
    } finally {
      setLoadingPlaceOptions(false);
    }
  };

  const handleAddPlaceToCurrentPlan = (place: Place) => {
    if (editStops.some((stop) => stop.place_id === place.id)) return;

    setEditStops((current) => [
      ...current,
      {
        place_id: place.id,
        day_no: 1,
        sequence_order: current.length + 1,
        place,
      },
    ]);
  };

  // Compute itinerary cumulative route distance and stops places
  const { itineraryPlaces, totalKm, estTimeMinutes } = useMemo(() => {
    if (!selectedItinerary || !selectedItinerary.items) {
      return { itineraryPlaces: [], totalKm: 0, estTimeMinutes: 0 };
    }

    const places: Place[] = [];
    let prevLat = DEFAULT_USER_LOCATION[0];
    let prevLng = DEFAULT_USER_LOCATION[1];
    let km = 0;

    selectedItinerary.items.forEach((item) => {
      if (item.place) {
        places.push(item.place);
        if (item.place.lat && item.place.lng) {
          km += calculateDistanceKm(prevLat, prevLng, item.place.lat, item.place.lng);
          prevLat = item.place.lat;
          prevLng = item.place.lng;
        }
      }
    });

    return {
      itineraryPlaces: places,
      totalKm: Math.round(km * 10) / 10,
      estTimeMinutes: estimateTravelTimeMinutes(km),
    };
  }, [selectedItinerary]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-100 pt-20 pb-20 lg:pt-24">
        <div className="container-page">
          <div className="card mx-auto max-w-xl rounded-media animate-fadeIn p-8 text-center sm:p-12">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-pill bg-ocean-50 text-ocean-600 ring-1 ring-ocean-200">
              <Calendar className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="mt-6 flex justify-center">
              <p className="eyebrow">Sign in required</p>
            </div>
            <h1 className="mt-2 text-h3 font-bold text-navy-900">Your saved routes</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-navy-600">
              Sign in to build, reorder and save one-day Visitflow routes across the Eastern
              Province corridor.
            </p>
            <div className="mt-7 flex justify-center">
              <Link to="/explore" className="btn-primary">
                <Compass className="h-4 w-4" aria-hidden="true" />
                Explore destinations
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-100 pt-20 pb-16 lg:pt-24">
      {/* Page hero — offsets the fixed 76px header */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-ocean-500/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-turquoise-500/15 blur-3xl"
        />
        <div className="container-page relative py-8 sm:py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex justify-start">
                <p className="eyebrow text-turquoise-300">
                  <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
                  Route planning workspace
                </p>
              </div>
              <h1 className="mt-2 text-h2 font-bold text-white sm:text-h1">
                My saved itineraries
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-navy-200">
                One-day Visitflow routes saved to{' '}
                <strong className="font-semibold text-white">{user?.name}</strong>. Reorder stops,
                read the route line and review straight-line travel estimates in one place.
              </p>
            </div>

            <Link to="/explore" className="btn-conversion shrink-0 self-start sm:self-auto">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Plan a new route
            </Link>
          </div>
        </div>
      </section>

      {/* Workspace */}
      <div className="container-page py-8 lg:py-10">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* LEFT — saved itinerary list */}
          <aside
            aria-label="Saved itineraries"
            className="lg:col-span-4 lg:sticky lg:top-24"
          >
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-navy-100 px-4 py-3.5">
                <h2 className="text-sm font-bold text-navy-900">Saved routes</h2>
                <span className="inline-flex items-center rounded-pill bg-ocean-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  {itineraries.length}
                </span>
              </div>

              <div className="p-3">
                {loading ? (
                  <div role="status" className="flex flex-col items-center gap-3 py-14 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-ocean-500" aria-hidden="true" />
                    <p className="text-xs font-semibold text-navy-500">
                      Loading your saved routes…
                    </p>
                  </div>
                ) : itineraries.length === 0 && error ? (
                  <div
                    role="alert"
                    className="flex flex-col items-center gap-2 rounded-card border border-red-200 bg-red-50 px-5 py-8 text-center"
                  >
                    <AlertCircle className="h-7 w-7 text-red-500" aria-hidden="true" />
                    <p className="text-sm font-bold text-red-800">We couldn’t load your routes</p>
                    <p className="text-xs leading-relaxed text-red-700">{error}</p>
                    <button
                      type="button"
                      onClick={fetchItineraries}
                      className="btn-secondary btn-sm mt-2"
                    >
                      Try again
                    </button>
                  </div>
                ) : itineraries.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-navy-200 bg-navy-50/60 px-6 py-10 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-pill bg-white text-navy-500 ring-1 ring-navy-200">
                      <Compass className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-base font-bold text-navy-900">No saved routes yet</h3>
                    <p className="max-w-xs text-xs leading-relaxed text-navy-500">
                      Add destinations from the catalogue to build your first one-day Visitflow
                      route.
                    </p>
                    <Link to="/explore" className="btn-secondary btn-sm mt-1">
                      Explore destinations
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-2.5 lg:max-h-[calc(100vh-15rem)] lg:overflow-y-auto lg:pr-1 thin-scroll">
                    {itineraries.map((itin) => {
                      const isSelected = selectedItinerary?.id === itin.id;
                      return (
                        <li key={itin.id}>
                          <button
                            type="button"
                            onClick={() => loadDetail(itin.id)}
                            aria-current={isSelected ? 'true' : undefined}
                            className={`group flex w-full flex-col gap-3 rounded-card border p-4 text-left transition-all duration-300 ease-premium ${
                              isSelected
                                ? 'border-ocean-500 bg-ocean-50/70 shadow-card-hover'
                                : 'border-navy-200 bg-white hover:-translate-y-0.5 hover:border-ocean-300 hover:shadow-card'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <span
                                  className={`block truncate font-serif text-base font-bold ${
                                    isSelected ? 'text-ocean-600' : 'text-navy-900'
                                  }`}
                                >
                                  {itin.title}
                                </span>
                                <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-navy-500">
                                  {itin.start_date && (
                                    <span className="inline-flex items-center gap-1">
                                      <Calendar
                                        className="h-3.5 w-3.5 text-ocean-500"
                                        aria-hidden="true"
                                      />
                                      {itin.start_date}
                                    </span>
                                  )}
                                  <span>Saved {new Date(itin.created_at).toLocaleDateString()}</span>
                                </span>
                              </div>

                              <span
                                className={`inline-flex shrink-0 items-center gap-1 rounded-pill px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                                  isSelected
                                    ? 'bg-ocean-500 text-white'
                                    : 'bg-navy-100 text-navy-600 group-hover:bg-ocean-50 group-hover:text-ocean-600'
                                }`}
                              >
                                <MapPin className="h-3 w-3" aria-hidden="true" />
                                {itin.items_count} {itin.items_count === 1 ? 'stop' : 'stops'}
                              </span>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {!loading && error && itineraries.length > 0 && (
              <div
                role="alert"
                className="mt-3 flex items-start gap-2 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
          </aside>

          {/* RIGHT — selected itinerary inspector */}
          <section aria-label="Selected itinerary" className="lg:col-span-8">
            {selectedItinerary ? (
              isEditing ? (
                /* Edit mode */
                <form
                  onSubmit={handleSaveEdit}
                  className="rounded-media border border-navy-200 bg-white p-5 shadow-card sm:p-7"
                >
                  <header className="flex flex-col gap-3 border-b border-navy-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="eyebrow">Editing mode</p>
                      <h2 className="mt-1 text-h4 font-bold text-navy-900">
                        Reorder stops &amp; update details
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary btn-sm self-start"
                    >
                      Cancel
                    </button>
                  </header>

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="itinerary-title" className="field-label">
                        Route title
                      </label>
                      <input
                        id="itinerary-title"
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="field"
                      />
                    </div>

                    <div className="sm:col-span-2 sm:max-w-xs">
                      <label htmlFor="itinerary-date" className="field-label">
                        Travel date
                      </label>
                      <input
                        id="itinerary-date"
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="field"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="itinerary-notes" className="field-label">
                        Traveller notes
                      </label>
                      <textarea
                        id="itinerary-notes"
                        rows={3}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="e.g. Dawn departure to catch sunrise at Maruthamunai; lunch in Kalmunai…"
                        className="field resize-y"
                      />
                    </div>
                  </div>

                  {/* Ordered stop manager */}
                  <div className="mt-7 border-t border-navy-100 pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-sm font-bold text-navy-900">Stops in order</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-navy-500">
                          {editStops.length} {editStops.length === 1 ? 'stop' : 'stops'}
                        </span>
                        <button
                          type="button"
                          onClick={handleOpenPlacePicker}
                          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-btn border border-ocean-200 bg-ocean-50 px-3 text-xs font-bold text-ocean-700 transition-colors hover:border-ocean-400 hover:bg-ocean-100"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          Add places
                        </button>
                      </div>
                    </div>

                    {showPlacePicker && (
                      <div className="mt-3 rounded-card border border-ocean-200 bg-ocean-50/60 p-3">
                        <p className="mb-2 text-xs font-bold text-navy-800">Add to this plan</p>
                        {loadingPlaceOptions ? (
                          <p className="text-xs text-navy-500">Loading destinations…</p>
                        ) : (
                          <div className="grid max-h-44 gap-2 overflow-y-auto sm:grid-cols-2">
                            {placeOptions
                              .filter((place) => !editStops.some((stop) => stop.place_id === place.id))
                              .map((place) => (
                                <button
                                  key={place.id}
                                  type="button"
                                  onClick={() => handleAddPlaceToCurrentPlan(place)}
                                  className="flex items-center gap-2 rounded-btn border border-white bg-white p-2 text-left text-xs font-semibold text-navy-800 transition-colors hover:border-ocean-400 hover:text-ocean-700"
                                >
                                  <Plus className="h-3.5 w-3.5 shrink-0 text-ocean-500" aria-hidden="true" />
                                  <span className="truncate">{place.name}</span>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    {editStops.length === 0 ? (
                      <p className="mt-3 rounded-card border border-dashed border-navy-200 bg-navy-50/60 px-4 py-6 text-center text-xs text-navy-500">
                        This route has no stops yet. Add destinations from the catalogue to build it
                        out.
                      </p>
                    ) : (
                      <ol className="mt-3 space-y-3">
                        {editStops.map((stop, idx) => {
                          const place = stop.place;
                          const label = place?.name || `Place #${stop.place_id}`;
                          return (
                            <li
                              key={stop.place_id}
                              className="flex flex-col gap-3 rounded-card border border-navy-200 bg-navy-50/60 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex min-w-0 flex-1 items-start gap-3">
                                <span
                                  className="grid h-7 w-7 shrink-0 place-items-center rounded-pill bg-ocean-500 text-xs font-bold text-white"
                                  aria-hidden="true"
                                >
                                  {idx + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-serif text-sm font-bold text-navy-900">
                                    {label}
                                  </p>
                                  <label htmlFor={`stop-note-${stop.place_id}`} className="sr-only">
                                    Note for {label}
                                  </label>
                                  <input
                                    id={`stop-note-${stop.place_id}`}
                                    type="text"
                                    value={stop.notes || ''}
                                    placeholder="Add a note for this stop…"
                                    onChange={(e) => {
                                      const next = [...editStops];
                                      next[idx].notes = e.target.value;
                                      setEditStops(next);
                                    }}
                                    className="field mt-1.5"
                                  />
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto">
                                <label htmlFor={`stop-time-${stop.place_id}`} className="sr-only">
                                  Visit time for {label}
                                </label>
                                <input
                                  id={`stop-time-${stop.place_id}`}
                                  type="time"
                                  value={stop.visit_time || ''}
                                  onChange={(e) => {
                                    const next = [...editStops];
                                    next[idx].visit_time = e.target.value;
                                    setEditStops(next);
                                  }}
                                  className="field w-auto"
                                />
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveStop(idx, 'up')}
                                  aria-label={`Move ${label} up`}
                                  className="grid h-9 w-9 place-items-center rounded-btn border border-navy-200 bg-white text-navy-600 transition-colors hover:border-ocean-400 hover:text-ocean-600 disabled:pointer-events-none disabled:opacity-40"
                                >
                                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === editStops.length - 1}
                                  onClick={() => handleMoveStop(idx, 'down')}
                                  aria-label={`Move ${label} down`}
                                  className="grid h-9 w-9 place-items-center rounded-btn border border-navy-200 bg-white text-navy-600 transition-colors hover:border-ocean-400 hover:text-ocean-600 disabled:pointer-events-none disabled:opacity-40"
                                >
                                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStop(stop.place_id)}
                                  aria-label={`Remove ${label}`}
                                  className="grid h-9 w-9 place-items-center rounded-btn border border-red-200 bg-white text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>

                  <div className="mt-7 flex flex-col-reverse gap-3 border-t border-navy-100 pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" disabled={saving} className="btn-primary">
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Save className="h-4 w-4" aria-hidden="true" />
                      )}
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Read view */
                <div className="space-y-6 animate-fadeIn">
                  {/* Detail header */}
                  <header className="rounded-media border border-navy-200 bg-white p-5 shadow-card sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-pill bg-turquoise-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-turquoise-700 ring-1 ring-turquoise-200">
                            <RouteIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            One-day route
                          </span>
                          {selectedItinerary.start_date && (
                            <span className="inline-flex items-center gap-1.5 rounded-pill bg-navy-50 px-3 py-1 text-[11px] font-semibold text-navy-600 ring-1 ring-navy-200">
                              <Calendar className="h-3.5 w-3.5 text-ocean-500" aria-hidden="true" />
                              {selectedItinerary.start_date}
                            </span>
                          )}
                        </div>

                        <h2 className="mt-3 text-h3 font-bold text-navy-900">
                          {selectedItinerary.title}
                        </h2>

                        {selectedItinerary.notes && (
                          <p className="mt-3 max-w-2xl rounded-card border-l-4 border-ocean-200 bg-ocean-50/60 px-4 py-3 text-sm italic leading-relaxed text-navy-600">
                            {selectedItinerary.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2 self-start">
                        <button type="button" onClick={startEdit} className="btn-secondary btn-sm">
                          <Edit3 className="h-4 w-4" aria-hidden="true" />
                          Edit route
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(selectedItinerary.id)}
                          className="btn btn-sm border border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </header>

                  {/* Route metrics */}
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="card p-4">
                      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-500">
                        Stops
                      </dt>
                      <dd className="mt-1 font-serif text-xl font-bold text-navy-900">
                        {selectedItinerary.items?.length || 0}
                      </dd>
                      <p className="mt-0.5 text-[10px] text-navy-500">places in this route</p>
                    </div>

                    <div className="card p-4">
                      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-500">
                        Straight-line distance
                      </dt>
                      <dd className="mt-1 font-serif text-xl font-bold text-navy-900">
                        ~{totalKm} km
                      </dd>
                      <p className="mt-0.5 text-[10px] text-navy-500">Haversine estimate</p>
                    </div>

                    <div className="card p-4">
                      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-500">
                        Est. travel time
                      </dt>
                      <dd className="mt-1 font-serif text-xl font-bold text-navy-900">
                        ~{estTimeMinutes} min
                      </dd>
                      <p className="mt-0.5 text-[10px] text-navy-500">Rounded drive-time estimate</p>
                    </div>

                    <div className="card border-ocean-200 bg-ocean-50/60 p-4">
                      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-ocean-700">
                        Route origin
                      </dt>
                      <dd className="mt-1 flex items-center gap-1.5 font-mono text-xs font-bold text-ocean-700">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        7.4394, 81.8172
                      </dd>
                      <p className="mt-0.5 text-[10px] text-ocean-600/80">Maruthamunai basecamp</p>
                    </div>
                  </dl>

                  {/* Map + timeline split */}
                  <section
                    aria-label="Route map and stop timeline"
                    className="grid grid-cols-1 gap-6 xl:grid-cols-5 xl:items-start"
                  >
                    {/* Map */}
                    <div className="order-1 xl:col-span-3 xl:sticky xl:top-24">
                      <div className="card overflow-hidden rounded-media">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-100 px-4 py-3">
                          <h3 className="inline-flex items-center gap-2 text-sm font-bold text-navy-900">
                            <RouteIcon className="h-4 w-4 text-ocean-500" aria-hidden="true" />
                            Route map
                          </h3>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-navy-500">
                            <LocateFixed
                              className="h-3.5 w-3.5 text-ocean-500"
                              aria-hidden="true"
                            />
                            Origin 7.4394, 81.8172 → {itineraryPlaces.length}{' '}
                            {itineraryPlaces.length === 1 ? 'stop' : 'stops'}
                          </span>
                        </div>

                        {itineraryPlaces.length > 0 ? (
                          <div className="h-[320px] sm:h-[400px] xl:h-[calc(100vh-15rem)] xl:min-h-[420px]">
                            <MapCanvas
                              places={itineraryPlaces}
                              userLocation={DEFAULT_USER_LOCATION}
                              showRoute={true}
                              height="100%"
                            />
                          </div>
                        ) : (
                          <div className="flex h-[260px] flex-col items-center justify-center gap-2 px-6 text-center sm:h-[320px]">
                            <span className="grid h-12 w-12 place-items-center rounded-pill bg-navy-50 text-navy-500 ring-1 ring-navy-200">
                              <MapPin className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <p className="text-sm font-bold text-navy-800">No mapped stops yet</p>
                            <p className="max-w-xs text-xs leading-relaxed text-navy-500">
                              Stops without coordinates can’t be plotted. Add destinations with a
                              location to see the route line.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="order-2 xl:col-span-2">
                      <div className="card rounded-media p-4 sm:p-5">
                        <h3 className="inline-flex items-center gap-2 text-sm font-bold text-navy-900">
                          <Clock className="h-4 w-4 text-ocean-500" aria-hidden="true" />
                          Stop-by-stop timeline
                        </h3>

                        <ol className="relative mt-5 space-y-3 pl-9">
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-2 left-[22px] w-0.5 rounded-full bg-navy-200"
                          />

                          {/* Origin anchor */}
                          <li className="relative">
                            <span
                              className="absolute -left-[26px] top-0.5 grid h-6 w-6 place-items-center rounded-pill bg-ocean-500 text-white ring-4 ring-white"
                              aria-hidden="true"
                            >
                              <LocateFixed className="h-3 w-3" />
                            </span>
                            <div className="rounded-card border border-ocean-200 bg-ocean-50/70 px-3.5 py-2.5">
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ocean-600">
                                Origin
                              </p>
                              <p className="mt-0.5 text-xs font-semibold text-navy-800">
                                Maruthamunai / Kalmunai basecamp
                              </p>
                              <p className="mt-0.5 font-mono text-[10px] text-navy-500">
                                7.439374, 81.817172
                              </p>
                            </div>
                          </li>

                          {selectedItinerary.items && selectedItinerary.items.length > 0 ? (
                            selectedItinerary.items.map((item, idx) => {
                              const place = item.place;
                              const isArchived = place ? place.is_archived : true;
                              return (
                                <li key={item.id || idx} className="relative">
                                  <span
                                    className={`absolute -left-[26px] top-0.5 grid h-6 w-6 place-items-center rounded-pill text-[10px] font-bold text-white ring-4 ring-white ${
                                      isArchived ? 'bg-sunset-400' : 'bg-turquoise-500'
                                    }`}
                                    aria-hidden="true"
                                  >
                                    {idx + 1}
                                  </span>

                                  <div
                                    className={`rounded-card border p-3.5 transition-colors ${
                                      isArchived
                                        ? 'border-sunset-200 bg-sunset-50/70'
                                        : 'border-navy-200 bg-white hover:border-ocean-300'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      {place?.primary_photo && (
                                        <img
                                          src={place.primary_photo}
                                          alt=""
                                          loading="lazy"
                                          className="h-14 w-16 shrink-0 rounded-btn object-cover ring-1 ring-navy-200"
                                        />
                                      )}

                                      <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <Link
                                            to={`/places/${place?.slug || place?.id}`}
                                            className="font-serif text-sm font-bold text-navy-900 transition-colors hover:text-ocean-600"
                                          >
                                            {place?.name || 'Unnamed stop'}
                                          </Link>
                                          {isArchived && (
                                            <span className="inline-flex items-center gap-1 rounded-pill bg-sunset-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sunset-700">
                                              <Archive className="h-3 w-3" aria-hidden="true" />
                                              Archived
                                            </span>
                                          )}
                                        </div>

                                        <p className="mt-0.5 text-xs text-navy-500">
                                          {place?.address || 'Address unavailable'}
                                        </p>

                                        {item.notes && (
                                          <p className="mt-1.5 rounded-btn bg-navy-50 px-2.5 py-1.5 text-xs leading-relaxed text-navy-600">
                                            <span className="font-semibold text-navy-700">
                                              Note:
                                            </span>{' '}
                                            {item.notes}
                                          </p>
                                        )}

                                        {item.visit_time && (
                                          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-pill bg-white px-2.5 py-1 text-[11px] font-bold text-navy-700 ring-1 ring-navy-200">
                                            <Clock
                                              className="h-3.5 w-3.5 text-ocean-500"
                                              aria-hidden="true"
                                            />
                                            {item.visit_time}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })
                          ) : (
                            <li className="relative">
                              <span
                                className="absolute -left-[26px] top-0.5 grid h-6 w-6 place-items-center rounded-pill bg-navy-200 ring-4 ring-white"
                                aria-hidden="true"
                              />
                              <p className="text-xs text-navy-500">No stops in this route yet.</p>
                            </li>
                          )}
                        </ol>
                      </div>
                    </div>
                  </section>
                </div>
              )
            ) : (
              <div className="card flex flex-col items-center gap-3 rounded-media px-6 py-16 text-center sm:py-20">
                <span className="grid h-14 w-14 place-items-center rounded-pill bg-ocean-50 text-ocean-500 ring-1 ring-ocean-200">
                  <RouteIcon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="text-h4 font-bold text-navy-900">Select a route to begin</h2>
                <p className="max-w-sm text-sm leading-relaxed text-navy-500">
                  Pick a saved itinerary on the left to inspect its stops, route line and travel
                  estimates.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
