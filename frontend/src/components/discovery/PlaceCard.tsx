import React from 'react';
import { Link } from 'react-router-dom';
import { Place } from '../../types';
import { useItinerary } from '../../context/ItineraryContext';
import {
  DEFAULT_USER_LOCATION,
  calculateDistanceKm,
  estimateTravelTimeMinutes,
  formatDistance,
  EASTERN_PROVINCE_ORDER,
} from '../../utils/geo';
import { MapPin, Plus, Check, Clock, Navigation, Compass, ArrowRight } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  onSelectOnMap?: (place: Place) => void;
  isSelected?: boolean;
  onHover?: (place: Place | null) => void;
  /** Real coordinates to measure from. Falls back to the verified origin anchor. */
  userLocation?: [number, number];
}

/** Neutral placeholder used only when a destination has no photograph on record. */
const PLACEHOLDER_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0B1F33"/>
          <stop offset="100%" stop-color="#075985"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#g)"/>
      <text x="400" y="255" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#7FCBEB">Visitflow</text>
      <text x="400" y="292" text-anchor="middle" font-family="Inter, sans-serif" font-size="17" fill="#CBD5E1">Photograph on record</text>
    </svg>`
  );

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onSelectOnMap,
  isSelected = false,
  onHover,
  userLocation = DEFAULT_USER_LOCATION,
}) => {
  const { addPlaceToPlan, isPlaceInPlan } = useItinerary();
  const inPlan = isPlaceInPlan(place.id);

  const hasCoordinates = Boolean(place.lat && place.lng);

  // Distance measured from the active origin (verified anchor unless geolocation is granted).
  const distanceKm = hasCoordinates
    ? calculateDistanceKm(userLocation[0], userLocation[1], place.lat, place.lng)
    : null;

  const travelTimeMinutes = distanceKm !== null ? estimateTravelTimeMinutes(distanceKm) : null;

  const stopNumber = place.slug ? EASTERN_PROVINCE_ORDER[place.slug] : undefined;

  return (
    <article
      onMouseEnter={() => onHover && onHover(place)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`group relative flex flex-col bg-white rounded-card overflow-hidden border transition-all duration-300 ease-premium ${
        isSelected
          ? 'border-turquoise-500 ring-2 ring-turquoise-500/40 shadow-card-hover -translate-y-0.5'
          : 'border-navy-200 hover:border-ocean-200 hover:shadow-card-hover hover:-translate-y-0.5'
      }`}
    >
      {/* Photograph */}
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
        <img
          src={place.primary_photo || PLACEHOLDER_PHOTO}
          alt={place.name}
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src !== PLACEHOLDER_PHOTO) img.src = PLACEHOLDER_PHOTO;
          }}
          className="w-full h-full object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/25 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {stopNumber && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-pill text-[10px] font-black tracking-wider uppercase bg-ocean-500 text-white shadow-card">
                Stop #{stopNumber}
              </span>
            )}

            {place.category && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[11px] font-semibold text-white bg-navy-950/75 backdrop-blur-md border border-white/15 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: place.category.color || '#00BFC4' }}
                  aria-hidden="true"
                />
                <span className="truncate">{place.category.name}</span>
              </span>
            )}
          </div>

          {onSelectOnMap && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectOnMap(place);
              }}
              aria-label={`Show ${place.name} on the route map`}
              title="Show on route map"
              className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-navy-950/75 hover:bg-turquoise-500 hover:text-navy-950 text-white backdrop-blur-md border border-white/15 transition-colors"
            >
              <Compass className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Distance / address strip */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2 text-white">
          {distanceKm !== null ? (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[11px] font-bold bg-navy-950/70 backdrop-blur-md border border-turquoise-400/30"
              title="Straight-line distance from your origin, with an estimated travel time"
            >
              <Navigation className="w-3 h-3 text-turquoise-300" />
              {formatDistance(distanceKm)}
              {travelTimeMinutes !== null && (
                <span className="font-normal text-turquoise-200">· ~{travelTimeMinutes} min est.</span>
              )}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[11px] font-medium bg-navy-950/70 backdrop-blur-md border border-white/15">
              <MapPin className="w-3 h-3 text-turquoise-300" />
              Coordinates on record
            </span>
          )}

          {place.address && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-navy-100 truncate max-w-[50%]">
              <MapPin className="w-3 h-3 text-turquoise-300 shrink-0" />
              <span className="truncate">{place.address}</span>
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <Link
            to={`/places/${place.slug || place.id}`}
            className="block font-serif text-lg font-bold text-navy-900 leading-snug line-clamp-2 hover:text-ocean-600 transition-colors"
          >
            {place.name}
          </Link>

          {place.description && (
            <p className="text-sm text-navy-500 leading-relaxed line-clamp-2">{place.description}</p>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-navy-500 pt-0.5">
            <Clock className="w-3.5 h-3.5 text-ocean-500 shrink-0" />
            <span className="truncate">
              {place.opening_hours ? `Hours: ${place.opening_hours}` : 'Opening hours not listed'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-navy-100 flex items-center justify-between gap-3">
          <Link
            to={`/places/${place.slug || place.id}`}
            className="inline-flex items-center gap-1 min-h-[44px] text-xs font-semibold text-ocean-600 hover:text-ocean-500 transition-colors group/link"
          >
            Explore Details
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
          </Link>

          <button
            type="button"
            onClick={() => addPlaceToPlan(place)}
            aria-pressed={inPlan}
            className={`inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-btn text-xs font-bold transition-all duration-200 ease-premium active:scale-95 ${
              inPlan
                ? 'bg-turquoise-50 text-turquoise-700 border border-turquoise-300'
                : 'bg-sunset-400 text-navy-950 hover:bg-sunset-500 shadow-card'
            }`}
          >
            {inPlan ? (
              <>
                <Check className="w-3.5 h-3.5" />
                In Trip
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Add to Trip
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
