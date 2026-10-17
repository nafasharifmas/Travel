import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Place } from '../types';
import { api } from '../services/api';
import { useItinerary } from '../context/ItineraryContext';
import { MapCanvas } from '../components/discovery/MapCanvas';
import {
  DEFAULT_USER_LOCATION,
  calculateDistanceKm,
  estimateTravelTimeMinutes,
  formatDistance,
  EASTERN_PROVINCE_ORDER,
} from '../utils/geo';
import {
  MapPin,
  Clock,
  Phone,
  Plus,
  Check,
  ArrowLeft,
  Share2,
  Sparkles,
  Compass,
  AlertTriangle,
  Loader2,
  Navigation,
  Route as RouteIcon,
  LocateFixed,
  Calendar,
  Info,
} from 'lucide-react';

export const PlaceDetailPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const { addPlaceToPlan, isPlaceInPlan } = useItinerary();

  useEffect(() => {
    if (!idOrSlug) return;
    setLoading(true);
    setError(null);

    api
      .getPlaceDetail(idOrSlug)
      .then((res) => {
        setPlace(res.place);
        setActivePhotoIdx(0);
      })
      .catch((err) => {
        setError(err.message || 'Place not found or has been archived.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [idOrSlug]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center p-8 bg-ivory-100 text-charcoal-700">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-3" />
        <p className="text-base font-serif font-bold text-charcoal-900">
          Accessing Curated Destination Dossier...
        </p>
        <p className="text-xs text-sand-500 mt-1">Retrieving verified spatial coordinates and route trajectories</p>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen pt-28 px-4 bg-ivory-100">
        <div className="max-w-2xl mx-auto p-10 bg-white rounded-3xl border border-sand-300 text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-charcoal-950">
            Destination Dossier Unavailable
          </h2>
          <p className="text-sm text-charcoal-700 font-sans">
            {error || 'This sanctuary cannot be found or is currently archived from the discovery catalogue.'}
          </p>
          <div className="pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-charcoal-950 rounded-xl font-bold text-xs shadow-md hover:bg-gold-400"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Places Catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inPlan = isPlaceInPlan(place.id);
  const photos =
    place.media && place.media.length > 0
      ? place.media.map((m) => m.url)
      : [
          place.primary_photo ||
            'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
        ];

  const distanceKm =
    place.lat && place.lng
      ? calculateDistanceKm(
          DEFAULT_USER_LOCATION[0],
          DEFAULT_USER_LOCATION[1],
          place.lat,
          place.lng
        )
      : null;

  const travelTimeMins =
    distanceKm !== null ? estimateTravelTimeMinutes(distanceKm) : null;

  const stopNumber = place.slug ? EASTERN_PROVINCE_ORDER[place.slug] : undefined;

  return (
    <div className="min-h-screen bg-ivory-100 pt-20 pb-16">
      {/* Top Header Bar */}
      <section className="bg-charcoal-950 text-white border-b border-sand-400/15 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-xs font-bold text-sand-300 hover:text-white bg-charcoal-900 px-3.5 py-2 rounded-xl border border-sand-400/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-gold-400" />
            Back to Discovery Catalogue
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sand-300 hover:text-white bg-charcoal-900 px-3.5 py-2 rounded-xl border border-sand-400/20 shadow-sm transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-gold-400" />
              {copied ? 'Link Copied!' : 'Share Dossier'}
            </button>
          </div>
        </div>
      </section>

      {/* Main Dossier Surface */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Destination Header Panel */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-sand-200/90 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {stopNumber && (
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-charcoal-950 shadow-sm">
                Corridor Stop #{stopNumber}
              </span>
            )}

            {place.category && (
              <span
                className="px-3.5 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: place.category.color || '#d4af37' }}
              >
                {place.category.name}
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-xs text-charcoal-600 bg-sand-100 px-3 py-1 rounded-full font-medium">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              Verified Destination
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-charcoal-950 tracking-tight leading-tight">
                {place.name}
              </h1>
              {place.address && (
                <p className="flex items-center gap-2 text-xs sm:text-sm text-charcoal-700 font-sans font-medium">
                  <MapPin className="w-4 h-4 text-gold-600 shrink-0" />
                  {place.address}
                </p>
              )}
            </div>

            {/* Quick Action Button */}
            <div className="shrink-0 flex items-center gap-3">
              <button
                type="button"
                onClick={() => addPlaceToPlan(place)}
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold shadow-md transition-all hover:scale-102 ${
                  inPlan
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-gold-500 hover:bg-gold-400 text-charcoal-950'
                }`}
              >
                {inPlan ? (
                  <>
                    <Check className="w-4 h-4" />
                    Included in Day Plan
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add to Expedition Plan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Spatial Trajectory Banner */}
          {distanceKm !== null && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-sky-950 to-charcoal-900 border border-sky-800/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Navigation className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                    Spatial Route Measured from Maruthamunai Basecamp
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    <strong>{formatDistance(distanceKm)}</strong> directly from origin [7.439374, 81.817172]
                    {travelTimeMins && (
                      <span className="text-sand-300 font-normal">
                        {' '}· ~{travelTimeMins} min via coastal road / tuk-tuk
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-sky-200 border border-white/10">
                <RouteIcon className="w-3.5 h-3.5 text-sky-400" />
                Live Trajectory Active
              </div>
            </div>
          )}
        </div>

        {/* Photography Showcase Grid */}
        <div className="space-y-4">
          <div className="relative aspect-[16/9] lg:aspect-[21/9] rounded-3xl overflow-hidden shadow-xl border border-sand-200 bg-charcoal-950">
            <img
              src={photos[activePhotoIdx]}
              alt={`${place.name} preview ${activePhotoIdx + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          </div>

          {photos.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {photos.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative w-24 h-16 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    activePhotoIdx === idx
                      ? 'border-gold-500 ring-2 ring-gold-500/50 scale-102'
                      : 'border-sand-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Two-Column Deep Context: Left Narrative, Right Embedded Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Narrative Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200/90 shadow-sm space-y-5">
              <div className="border-b border-sand-100 pb-3">
                <span className="text-xs font-bold text-gold-700 uppercase tracking-widest">
                  Editorial Overview & Significance
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-charcoal-950 mt-1">
                  About this destination
                </h3>
              </div>

              <p className="text-sm sm:text-base text-charcoal-800 leading-relaxed font-sans">
                {place.description}
              </p>

              {/* Logistics & Practical Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-sand-100">
                {place.opening_hours && (
                  <div className="p-4 bg-sand-50/70 rounded-2xl border border-sand-200/80 space-y-1">
                    <span className="text-[11px] font-bold text-charcoal-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gold-600" />
                      Opening Hours & Best Light
                    </span>
                    <p className="text-xs font-semibold text-charcoal-900">
                      {place.opening_hours}
                    </p>
                  </div>
                )}

                {place.contact_info && (
                  <div className="p-4 bg-sand-50/70 rounded-2xl border border-sand-200/80 space-y-1">
                    <span className="text-[11px] font-bold text-charcoal-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gold-600" />
                      Contact & Tourism Society
                    </span>
                    <p className="text-xs font-semibold text-charcoal-900 break-words">
                      {place.contact_info}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Nearby Highlights Along This Corridor */}
            {place.nearby_suggestions && place.nearby_suggestions.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-charcoal-950 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-gold-600" />
                    Nearby Sanctuaries on this Corridor
                  </h3>
                  <Link
                    to="/explore"
                    className="text-xs font-bold text-gold-600 hover:text-gold-700"
                  >
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {place.nearby_suggestions.map((rec) => (
                    <Link
                      key={rec.id}
                      to={`/places/${rec.slug || rec.id}`}
                      className="group p-3 rounded-2xl border border-sand-200 hover:border-gold-500 transition-all bg-sand-50/60 hover:bg-white hover:shadow-md"
                    >
                      {rec.primary_photo && (
                        <div className="aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-sand-200">
                          <img
                            src={rec.primary_photo}
                            alt={rec.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <p className="text-xs font-bold text-charcoal-900 group-hover:text-gold-600 line-clamp-1">
                        {rec.name}
                      </p>
                      <span className="text-[10px] text-sand-600">{rec.category}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dedicated Spatial Route Map Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-sand-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <RouteIcon className="w-4 h-4 text-sky-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                    Live Route Trajectory
                  </h3>
                </div>
                <span className="text-xs font-mono text-sand-600">
                  {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                </span>
              </div>

              {/* Embedded Leaflet Route Map */}
              <div className="h-[420px] rounded-2xl overflow-hidden border border-sand-300 shadow-inner">
                <MapCanvas
                  places={[place]}
                  selectedPlace={place}
                  userLocation={DEFAULT_USER_LOCATION}
                  showRoute={true}
                  center={[place.lat, place.lng]}
                  zoom={12}
                  height="100%"
                />
              </div>

              <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-medium">
                <span>
                  <strong>Origin:</strong> Maruthamunai Basecamp (7.4394, 81.8172)
                </span>
                <span className="font-bold text-sky-800">
                  {formatDistance(distanceKm)} trajectory
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
