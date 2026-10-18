import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Place } from '../types';
import { api } from '../services/api';
import { useItinerary } from '../context/ItineraryContext';
import { MapCanvas } from '../components/discovery/MapCanvas';
import { PhotoGallery } from '../components/detail/PhotoGallery';
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
  Info,
  Images,
  ShieldCheck,
  ArrowRight,
  ListChecks,
  ChevronRight,
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
      <div className="min-h-screen bg-ivory-100">
        <div className="container-page pt-20 lg:pt-24 pb-16">
          <div
            role="status"
            aria-live="polite"
            className="card max-w-2xl mx-auto p-10 flex flex-col items-center justify-center text-center gap-3 animate-fadeIn"
          >
            <Loader2 className="w-9 h-9 text-ocean-500 animate-spin" aria-hidden="true" />
            <p className="text-h4">Loading destination details…</p>
            <p className="text-sm text-navy-500">
              Retrieving verified coordinates and route information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-ivory-100">
        <div className="container-page pt-20 lg:pt-24 pb-16">
          <div className="card max-w-2xl mx-auto p-8 sm:p-10 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-sunset-500 mx-auto" aria-hidden="true" />
            <h2 className="text-h3">Destination unavailable</h2>
            <p className="text-sm text-navy-500 leading-relaxed">
              {error ||
                'This destination cannot be found or is currently archived from the discovery catalogue.'}
            </p>
            <div className="pt-2 flex justify-center">
              <Link to="/explore" className="btn-primary">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Back to destinations
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inPlan = isPlaceInPlan(place.id);
  const placeholderPhoto =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0B1F33"/><stop offset="100%" stop-color="#075985"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><text x="600" y="390" text-anchor="middle" font-family="Georgia, serif" font-size="46" fill="#7FCBEB">Visitflow</text><text x="600" y="446" text-anchor="middle" font-family="Inter, sans-serif" font-size="24" fill="#CBD5E1">Photograph on record</text></svg>`
    );

  const photos =
    place.media && place.media.length > 0
      ? place.media.map((m) => m.url)
      : [place.primary_photo || placeholderPhoto];

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

  const hasCoordinates = typeof place.lat === 'number' && typeof place.lng === 'number';
  const coordinatesLabel = hasCoordinates
    ? `${place.lat.toFixed(5)}, ${place.lng.toFixed(5)}`
    : 'Coordinates not listed';

  const mediaCount = place.media && place.media.length > 0 ? place.media.length : null;

  const originLabel = `Maruthamunai Basecamp (${DEFAULT_USER_LOCATION[0].toFixed(
    4
  )}, ${DEFAULT_USER_LOCATION[1].toFixed(4)})`;

  return (
    <div className="min-h-screen bg-ivory-100 pb-16 sm:pb-20">
      {/* ---------------- Hero band (clears the fixed 76px header) ---------------- */}
      <section className="relative overflow-hidden bg-navy-900 text-white pt-20 lg:pt-24 pb-10 sm:pb-14">
        <img
          src={photos[0]}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-65"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-navy-900/55 via-navy-900/68 to-navy-950/82 pointer-events-none"
          aria-hidden="true"
        />
        <div className="container-page relative space-y-7">
          {/* Breadcrumb + utility actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/70">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="w-3.5 h-3.5" />
                </li>
                <li>
                  <Link to="/explore" className="hover:text-white transition-colors">
                    Destinations
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="w-3.5 h-3.5" />
                </li>
                <li aria-current="page" className="text-white font-semibold truncate max-w-[60vw] sm:max-w-xs">
                  {place.name}
                </li>
              </ol>
            </nav>

            <div className="flex items-center gap-2">
              <Link to="/explore" className="btn-on-dark btn-sm min-h-[44px]">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Back
              </Link>
              <button
                type="button"
                onClick={handleShare}
                aria-label={copied ? 'Link copied to clipboard' : 'Copy link to this destination'}
                className="btn-on-dark btn-sm min-h-[44px]"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
                {copied ? 'Link Copied!' : 'Share'}
              </button>
            </div>
          </div>

          {/* Title block */}
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {stopNumber && (
                <span className="chip bg-sunset-400 border-sunset-400 text-navy-950 font-bold hover:bg-sunset-400 hover:border-sunset-400 hover:text-navy-950">
                  <RouteIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  Corridor stop #{stopNumber}
                </span>
              )}

              {place.category && (
                <span
                  className="chip text-white border-transparent hover:text-white hover:border-transparent"
                  style={{ backgroundColor: place.category.color || '#006DAA' }}
                >
                  {place.category.name}
                </span>
              )}

              <span className="chip bg-white/10 border-white/20 text-white hover:bg-white/10 hover:border-white/20 hover:text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-turquoise-300" aria-hidden="true" />
                Verified destination
              </span>
            </div>

            <h1 className="text-h1 text-white">{place.name}</h1>

            {place.address && (
              <p className="flex items-start gap-2 text-sm text-navy-100">
                <MapPin className="w-4 h-4 text-turquoise-300 mt-0.5 shrink-0" aria-hidden="true" />
                <span className="break-words">{place.address}</span>
              </p>
            )}
          </div>

          {/* Add-to-trip action */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => addPlaceToPlan(place)}
              aria-pressed={inPlan}
              className={
                inPlan
                  ? 'btn bg-emerald-500 text-white shadow-card hover:bg-emerald-600 focus-visible:ring-emerald-500'
                  : 'btn-conversion'
              }
            >
              {inPlan ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Included in your trip plan
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Add to trip plan
                </>
              )}
            </button>
            <span className="text-xs text-navy-100">
              {stopNumber
                ? `Stop ${stopNumber} on the Eastern Corridor route`
                : 'Build a route around this destination'}
            </span>
          </div>
        </div>
      </section>

    

        {/* Two-column context: narrative left, location right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start pt-2 sm:pt-4">
          {/* Narrative column */}
          <div className="lg:col-span-7 min-w-0 space-y-8">
            {/* Overview */}
            <section className="card p-6 sm:p-8 space-y-5">
              <div className="space-y-1">
                <span className="eyebrow">
                  <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                  Destination overview
                </span>
                <h2 className="text-h3">About this destination</h2>
              </div>
              <p className="text-sm sm:text-base text-navy-600 leading-relaxed max-w-prose">
                {place.description || 'No description has been published for this destination yet.'}
              </p>
            </section>

            {/* Location & verified information */}
            <section className="card p-6 sm:p-8 space-y-5">
              <div className="space-y-1">
                <span className="eyebrow">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  Location & verified information
                </span>
                <h2 className="text-h3">Where and when to visit</h2>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="min-w-0">
                  <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-navy-500">
                    <MapPin className="w-3.5 h-3.5 text-ocean-500" aria-hidden="true" />
                    Address
                  </dt>
                  <dd className="mt-1.5 text-sm text-navy-900 break-words">
                    {place.address || 'Address not listed'}
                  </dd>
                </div>

                <div className="min-w-0">
                  <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-navy-500">
                    <LocateFixed className="w-3.5 h-3.5 text-ocean-500" aria-hidden="true" />
                    Coordinates
                  </dt>
                  <dd className="mt-1.5 text-sm text-navy-900 font-mono break-words">
                    {coordinatesLabel}
                  </dd>
                </div>

                <div className="min-w-0">
                  <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-navy-500">
                    <Clock className="w-3.5 h-3.5 text-ocean-500" aria-hidden="true" />
                    Opening hours
                  </dt>
                  <dd className="mt-1.5 text-sm text-navy-900 break-words">
                    {place.opening_hours || 'Hours not listed'}
                  </dd>
                </div>

                <div className="min-w-0">
                  <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-navy-500">
                    <Phone className="w-3.5 h-3.5 text-ocean-500" aria-hidden="true" />
                    Contact
                  </dt>
                  <dd className="mt-1.5 text-sm text-navy-900 break-words">
                    {place.contact_info || 'Contact not listed'}
                  </dd>
                </div>
              </dl>

              <p className="flex items-start gap-2 rounded-btn bg-ocean-50 border border-ocean-100 p-3.5 text-xs text-navy-600 leading-relaxed">
                <Info className="w-4 h-4 text-ocean-500 mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  Details shown here are taken directly from the verified destination record. Where
                  a field is empty we show it as not listed rather than guess.
                </span>
              </p>
            </section>

            {/* Highlights */}
            <section className="card p-6 sm:p-8 space-y-5">
              <div className="space-y-1">
                <span className="eyebrow">
                  <ListChecks className="w-3.5 h-3.5" aria-hidden="true" />
                  Highlights
                </span>
                <h2 className="text-h3">At a glance</h2>
              </div>

              <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <li className="rounded-card bg-navy-50 border border-navy-200 p-4 space-y-1">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-500">
                    <Compass className="w-3.5 h-3.5 text-ocean-500" aria-hidden="true" />
                    Category
                  </p>
                  <p className="text-sm font-semibold text-navy-900">
                    {place.category?.name || 'Not listed'}
                  </p>
                </li>

                <li className="rounded-card bg-navy-50 border border-navy-200 p-4 space-y-1">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-500">
                    <RouteIcon className="w-3.5 h-3.5 text-ocean-500" aria-hidden="true" />
                    Corridor stop
                  </p>
                  <p className="text-sm font-semibold text-navy-900">
                    {stopNumber ? `#${stopNumber}` : 'Not on the route'}
                  </p>
                </li>

                <li className="rounded-card bg-navy-50 border border-navy-200 p-4 space-y-1">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-500">
                    <Images className="w-3.5 h-3.5 text-ocean-500" aria-hidden="true" />
                    Photographs
                  </p>
                  <p className="text-sm font-semibold text-navy-900">
                    {mediaCount ? `${mediaCount} in gallery` : 'Not listed'}
                  </p>
                </li>

                <li className="rounded-card bg-turquoise-50 border border-turquoise-200 p-4 space-y-1">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-turquoise-700">
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    Status
                  </p>
                  <p className="text-sm font-semibold text-navy-900">Verified record</p>
                </li>
              </ul>

              {/* Nearby attractions & related destinations */}
              <div className="pt-2 space-y-4 border-t border-navy-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-h4">Nearby attractions</h3>
                    <p className="text-xs text-navy-500">
                      Related destinations from the same collection.
                    </p>
                  </div>
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-1 min-h-[44px] text-xs font-bold text-ocean-600 hover:text-ocean-700 transition-colors"
                  >
                    View all destinations
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>

                {place.nearby_suggestions && place.nearby_suggestions.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {place.nearby_suggestions.map((rec) => (
                      <li key={rec.id}>
                        <Link
                          to={`/places/${rec.slug || rec.id}`}
                          className="card card-hover group block h-full p-3"
                        >
                          <div className="aspect-[4/3] rounded-btn overflow-hidden mb-3 bg-navy-100">
                            {rec.primary_photo ? (
                              <img
                                src={rec.primary_photo}
                                alt={rec.name}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover transition-transform duration-500 ease-premium group-hover:scale-105"
                              />
                            ) : (
                              <span className="grid place-items-center w-full h-full text-navy-500">
                                <Images className="w-6 h-6" aria-hidden="true" />
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-navy-900 group-hover:text-ocean-600 line-clamp-1 transition-colors">
                            {rec.name}
                          </p>
                          <p className="text-xs text-navy-500">{rec.category || 'Destination'}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-card bg-navy-50 border border-dashed border-navy-200 p-6 text-center space-y-1">
                    <p className="text-sm font-semibold text-navy-800">
                      No nearby attractions listed yet
                    </p>
                    <p className="text-xs text-navy-500">
                      Browse the full catalogue to keep planning your corridor route.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Spatial column: interactive map + travel information */}
          <div className="lg:col-span-5 min-w-0 space-y-8">
            {/* Interactive map */}
            <section className="card p-5 space-y-4" aria-label="Interactive map">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <span className="eyebrow">
                  <RouteIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  Interactive map
                </span>
                <span className="text-xs font-mono text-navy-500">{coordinatesLabel}</span>
              </div>

              <div className="h-[380px] sm:h-[440px] lg:h-[480px] rounded-card overflow-hidden border border-navy-200 bg-navy-100">
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

              <p className="flex items-start gap-2 text-xs text-navy-500 px-1">
                <Info className="w-4 h-4 text-ocean-500 mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  Route line drawn from the Maruthamunai basecamp. Map data © OpenStreetMap
                  contributors.
                </span>
              </p>
            </section>

            {/* Travel information */}
            <section className="card p-6 sm:p-7 space-y-5">
              <div className="space-y-1">
                <span className="eyebrow">
                  <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                  Travel information
                </span>
                <h2 className="text-h3">Getting there</h2>
              </div>

              {distanceKm !== null ? (
                <dl className="grid grid-cols-2 gap-3">
                  <div className="rounded-card bg-navy-50 border border-navy-200 p-4 space-y-1">
                    <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-500">
                      <Navigation className="w-3.5 h-3.5 text-ocean-500" aria-hidden="true" />
                      Distance
                    </dt>
                    <dd className="text-sm font-semibold text-navy-900">
                      {formatDistance(distanceKm)}
                    </dd>
                  </div>

                  <div className="rounded-card bg-navy-50 border border-navy-200 p-4 space-y-1">
                    <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-500">
                      <Clock className="w-3.5 h-3.5 text-ocean-500" aria-hidden="true" />
                      Driving time
                    </dt>
                    <dd className="text-sm font-semibold text-navy-900">
                      {travelTimeMins ? `~${travelTimeMins} min` : 'Not available'}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="rounded-card bg-navy-50 border border-navy-200 p-4 text-sm text-navy-600">
                  Travel information unavailable — coordinates are not listed for this
                  destination.
                </p>
              )}

              <div className="flex items-start gap-3 rounded-card bg-navy-50 border border-navy-200 p-4">
                <span className="grid place-items-center w-10 h-10 rounded-btn bg-ocean-500 text-white shrink-0">
                  <LocateFixed className="w-5 h-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                    Journey origin
                  </p>
                  <p className="text-sm font-semibold text-navy-900 break-words">{originLabel}</p>
                </div>
              </div>

              <p className="flex items-start gap-2 text-xs text-navy-500 leading-relaxed">
                <Info className="w-4 h-4 text-ocean-500 mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  Distances are measured point-to-point from the origin above; driving times are
                  estimates based on coastal-road travel and should be treated as approximate.
                </span>
              </p>
            </section>

            {/* Related destinations call to action */}
            <section className="card p-6 sm:p-7 bg-navy-900 text-white space-y-3">
              <span className="eyebrow text-turquoise-300">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Keep exploring
              </span>
              <h2 className="text-h4 text-white">Related destinations</h2>
              <p className="text-sm text-navy-100 leading-relaxed">
                Discover the rest of the Eastern Corridor and beyond, all mapped from the same
                origin.
              </p>
              <div className="pt-1">
                <Link to="/explore" className="btn-conversion">
                  Explore all destinations
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
  );
};
