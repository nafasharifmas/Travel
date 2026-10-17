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
  formatDistance,
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
  CheckCircle2,
  AlertCircle,
  Archive,
  Compass,
  Loader2,
  Navigation,
  Route as RouteIcon,
  LocateFixed,
  Eye,
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
      <div className="min-h-screen pt-28 px-4 bg-ivory-100">
        <div className="max-w-xl mx-auto my-12 p-10 bg-white rounded-3xl border border-sand-300 shadow-sm text-center space-y-4">
          <Calendar className="w-12 h-12 text-gold-600 mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-charcoal-950">
            Personal Expedition Portfolio
          </h2>
          <p className="text-sm text-charcoal-700 leading-relaxed font-sans">
            Please authenticate to access and curate your private single-day travel itineraries and spatial route sequences.
          </p>
          <div className="pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold text-xs rounded-xl shadow-md"
            >
              <Compass className="w-4 h-4" />
              Explore Destination Catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-100 pt-20 pb-16">
      {/* Header Banner */}
      <section className="bg-charcoal-950 text-white border-b border-sand-400/15 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">
              Private Expedition Portfolio
            </span>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-ivory-50 tracking-tight mt-1">
              My Saved Itineraries
            </h1>
            <p className="text-xs sm:text-sm text-sand-300 mt-1 font-sans">
              Curated one-day trip sequences belonging to <strong>{user?.name}</strong>.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold text-xs rounded-xl shadow-md transition-transform hover:scale-102 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add More Destinations
          </Link>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Saved Itineraries List (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-charcoal-600 uppercase tracking-wider">
                Expeditions ({itineraries.length})
              </h3>
            </div>

            {loading ? (
              <div className="py-16 text-center text-charcoal-600">
                <Loader2 className="w-7 h-7 animate-spin mx-auto text-gold-500 mb-2" />
                <p className="text-xs font-semibold">Loading your itineraries...</p>
              </div>
            ) : itineraries.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-sand-200 text-center space-y-3 shadow-sm">
                <Compass className="w-10 h-10 text-sand-400 mx-auto" />
                <h4 className="text-sm font-bold text-charcoal-900 font-serif">
                  No Saved Itineraries Yet
                </h4>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Start by adding destinations from the catalogue to build your first day trip.
                </p>
                <Link
                  to="/explore"
                  className="inline-block text-xs text-gold-600 font-bold hover:underline"
                >
                  Explore Destinations →
                </Link>
              </div>
            ) : (
              itineraries.map((itin) => {
                const isSelected = selectedItinerary?.id === itin.id;
                return (
                  <div
                    key={itin.id}
                    onClick={() => loadDetail(itin.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-white border-gold-500 ring-2 ring-gold-500/40 shadow-lg -translate-y-0.5'
                        : 'bg-white/80 hover:bg-white border-sand-200 hover:border-gold-400/60 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm sm:text-base font-serif font-bold text-charcoal-950 truncate max-w-[210px]">
                        {itin.title}
                      </h4>
                      <span className="text-[10px] font-black uppercase text-gold-700 bg-gold-500/15 border border-gold-500/30 px-2 py-0.5 rounded-full shrink-0">
                        {itin.items_count} Stops
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-charcoal-600 mt-2.5 pt-2 border-t border-sand-100">
                      {itin.start_date && (
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gold-600" />
                          {itin.start_date}
                        </span>
                      )}
                      <span>Saved {new Date(itin.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Selected Itinerary Inspector (8 cols) */}
          <div className="lg:col-span-8">
            {selectedItinerary ? (
              <div className="bg-white rounded-3xl border border-sand-200/90 p-6 sm:p-10 shadow-sm space-y-6">
                {isEditing ? (
                  /* Edit Mode Form */
                  <form onSubmit={handleSaveEdit} className="space-y-6">
                    <div className="flex items-center justify-between border-b border-sand-100 pb-4">
                      <div>
                        <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">
                          Editing Mode
                        </span>
                        <h3 className="text-lg font-serif font-bold text-charcoal-950">
                          Configure Route & Sequence
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="text-xs text-charcoal-600 hover:text-charcoal-900 font-semibold px-3 py-1.5 rounded-xl border border-sand-200 bg-sand-50"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                          Expedition Title
                        </label>
                        <input
                          type="text"
                          required
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm bg-sand-50/70 border border-sand-300 rounded-xl focus:bg-white focus:border-gold-500 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                            Target Date
                          </label>
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full px-4 py-2.5 text-xs bg-sand-50/70 border border-sand-300 rounded-xl focus:bg-white focus:border-gold-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                          Logistics & Traveler Notes
                        </label>
                        <textarea
                          rows={2}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="e.g. Dawn departure to catch sunrise at Maruthamunai; lunch in Kalmunai..."
                          className="w-full px-4 py-2.5 text-xs bg-sand-50/70 border border-sand-300 rounded-xl focus:bg-white focus:border-gold-500"
                        />
                      </div>
                    </div>

                    {/* Ordered Sequence Manager */}
                    <div className="space-y-3 pt-4 border-t border-sand-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
                        Reorder Stops & Add Timing
                      </h4>

                      {editStops.map((stop, idx) => {
                        const place = stop.place;
                        return (
                          <div
                            key={stop.place_id}
                            className="p-4 bg-sand-50/70 rounded-2xl border border-sand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-full bg-gold-500 text-charcoal-950 font-black text-xs flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <div>
                                <p className="text-xs font-bold text-charcoal-900 font-serif">
                                  {place?.name || `Place #${stop.place_id}`}
                                </p>
                                <input
                                  type="text"
                                  value={stop.notes || ''}
                                  placeholder="Add stop note..."
                                  onChange={(e) => {
                                    const next = [...editStops];
                                    next[idx].notes = e.target.value;
                                    setEditStops(next);
                                  }}
                                  className="text-xs px-2.5 py-1 mt-1 bg-white border border-sand-200 rounded-lg text-charcoal-900 w-full sm:w-64"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <input
                                type="time"
                                value={stop.visit_time || ''}
                                onChange={(e) => {
                                  const next = [...editStops];
                                  next[idx].visit_time = e.target.value;
                                  setEditStops(next);
                                }}
                                className="text-xs px-2 py-1 bg-white border border-sand-200 rounded-lg"
                              />
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveStop(idx, 'up')}
                                className="p-1.5 text-charcoal-600 hover:text-charcoal-900 disabled:opacity-20 hover:bg-white rounded-lg transition-colors"
                                title="Move stop up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === editStops.length - 1}
                                onClick={() => handleMoveStop(idx, 'down')}
                                className="p-1.5 text-charcoal-600 hover:text-charcoal-900 disabled:opacity-20 hover:bg-white rounded-lg transition-colors"
                                title="Move stop down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveStop(stop.place_id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-1"
                                title="Remove stop"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-sand-100">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-xs font-bold text-charcoal-600 bg-sand-100 hover:bg-sand-200 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 text-xs font-bold text-charcoal-950 bg-gold-500 hover:bg-gold-400 rounded-xl shadow-md flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {saving ? 'Updating...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Read View */
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-sand-100 pb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-500/15 border border-gold-500/30 text-gold-700">
                            Single-Day Expedition
                          </span>
                          {selectedItinerary.start_date && (
                            <span className="text-xs text-charcoal-600 flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-gold-600" />
                              {selectedItinerary.start_date}
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-950">
                          {selectedItinerary.title}
                        </h2>
                        {selectedItinerary.notes && (
                          <p className="text-xs text-charcoal-700 mt-2 bg-sand-50 p-3 rounded-2xl border border-sand-200/80 max-w-xl font-sans italic">
                            "{selectedItinerary.notes}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={startEdit}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sand-100 hover:bg-sand-200 text-charcoal-900 text-xs font-bold transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-gold-700" />
                          Edit Plan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(selectedItinerary.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Route Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-sand-50/70 border border-sand-200">
                        <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider">
                          Stops Count
                        </span>
                        <p className="text-lg font-serif font-bold text-charcoal-950 mt-0.5">
                          {selectedItinerary.items?.length || 0} Places
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-sand-50/70 border border-sand-200">
                        <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider">
                          Route Length
                        </span>
                        <p className="text-lg font-serif font-bold text-charcoal-950 mt-0.5">
                          ~{totalKm} km
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-sand-50/70 border border-sand-200">
                        <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider">
                          Est. Transit
                        </span>
                        <p className="text-lg font-serif font-bold text-charcoal-950 mt-0.5">
                          ~{estTimeMinutes} min
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200">
                        <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                          Origin Basecamp
                        </span>
                        <p className="text-xs font-mono font-bold text-sky-950 mt-1 truncate">
                          7.4394, 81.8172
                        </p>
                      </div>
                    </div>

                    {/* Interactive Embedded Sequence Map */}
                    {itineraryPlaces.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <RouteIcon className="w-4 h-4 text-sky-600" />
                            Live Route Trajectory Sequence
                          </span>
                          <span className="text-[11px] font-normal text-sand-600 lowercase">
                            Origin [7.4394, 81.8172] → {itineraryPlaces.length} Stops
                          </span>
                        </div>

                        <div className="h-[320px] rounded-2xl overflow-hidden border border-sand-300 shadow-sm">
                          <MapCanvas
                            places={itineraryPlaces}
                            userLocation={DEFAULT_USER_LOCATION}
                            showRoute={true}
                            height="100%"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step-by-Step Chronological Timeline */}
                    <div className="space-y-4 pt-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-600">
                        Chronological Stop Milestones
                      </h3>

                      <div className="relative pl-6 space-y-5 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-sand-300">
                        {/* Origin Anchor Step */}
                        <div className="relative flex items-center gap-3">
                          <div className="absolute -left-6 w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                            📍
                          </div>
                          <div className="text-xs font-semibold text-charcoal-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
                            <strong>Origin Basecamp:</strong> Maruthamunai / Kalmunai [7.439374, 81.817172]
                          </div>
                        </div>

                        {selectedItinerary.items && selectedItinerary.items.length > 0 ? (
                          selectedItinerary.items.map((item, idx) => {
                            const place = item.place;
                            const isArchived = place ? place.is_archived : true;
                            return (
                              <div
                                key={item.id || idx}
                                className={`relative p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                                  isArchived
                                    ? 'bg-amber-50/40 border-amber-200'
                                    : 'bg-sand-50/60 border-sand-200'
                                }`}
                              >
                                <div className="absolute -left-6 w-6 h-6 rounded-full bg-gold-500 text-charcoal-950 font-black text-xs flex items-center justify-center shadow-sm">
                                  {idx + 1}
                                </div>

                                <div className="flex items-center gap-3">
                                  {place?.primary_photo && (
                                    <img
                                      src={place.primary_photo}
                                      alt={place.name}
                                      className="w-16 h-14 object-cover rounded-xl shrink-0 border border-sand-200"
                                    />
                                  )}

                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Link
                                        to={`/places/${place?.slug || place?.id}`}
                                        className="text-sm font-serif font-bold text-charcoal-950 hover:text-gold-600 transition-colors"
                                      >
                                        {place?.name || 'Historic Sanctuary'}
                                      </Link>
                                      {isArchived && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                                          <Archive className="w-2.5 h-2.5" />
                                          Archived
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-charcoal-600 mt-0.5 font-sans">
                                      {place?.address || 'Verified Destination'}
                                    </p>
                                    {item.notes && (
                                      <p className="text-xs text-gold-800 font-medium mt-1">
                                        Note: {item.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {item.visit_time && (
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-800 bg-white px-3 py-1.5 rounded-xl border border-sand-200 shrink-0">
                                    <Clock className="w-3.5 h-3.5 text-gold-600" />
                                    {item.visit_time}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-charcoal-600">No stops in this trip plan yet.</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-sand-200 p-16 text-center text-charcoal-600 space-y-2">
                <Calendar className="w-12 h-12 text-sand-400 mx-auto mb-2" />
                <h4 className="text-base font-serif font-bold text-charcoal-900">
                  Select an Expedition
                </h4>
                <p className="text-xs text-charcoal-600">
                  Select an itinerary on the left to inspect its trajectory, map stops, and sequence.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
