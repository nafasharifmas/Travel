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
import {
  MapPin,
  Plus,
  Check,
  Clock,
  Navigation,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  onSelectOnMap?: (place: Place) => void;
  isSelected?: boolean;
  onHover?: (place: Place | null) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onSelectOnMap,
  isSelected = false,
  onHover,
}) => {
  const { addPlaceToPlan, isPlaceInPlan } = useItinerary();
  const inPlan = isPlaceInPlan(place.id);

  const fallbackPhoto =
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80';

  // Distance from origin anchor (7.439374, 81.817172)
  const distanceKm =
    place.lat && place.lng
      ? calculateDistanceKm(
          DEFAULT_USER_LOCATION[0],
          DEFAULT_USER_LOCATION[1],
          place.lat,
          place.lng
        )
      : null;

  const travelTimeMinutes =
    distanceKm !== null ? estimateTravelTimeMinutes(distanceKm) : null;

  const stopNumber = place.slug ? EASTERN_PROVINCE_ORDER[place.slug] : undefined;

  return (
    <article
      onMouseEnter={() => onHover && onHover(place)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${
        isSelected
          ? 'border-gold-500 ring-2 ring-gold-500/50 shadow-xl shadow-gold-500/10 -translate-y-1'
          : 'border-sand-200/90 hover:border-gold-400/70 hover:shadow-lg hover:-translate-y-0.5'
      }`}
    >
      {/* Photograph Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-sand-100">
        <img
          src={place.primary_photo || fallbackPhoto}
          alt={place.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/85 via-charcoal-950/25 to-transparent opacity-90 transition-opacity group-hover:opacity-95" />

        {/* Top Badges Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
          <div className="flex flex-wrap items-center gap-1.5">
            {stopNumber && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-500 text-charcoal-950 shadow-md">
                Stop #{stopNumber}
              </span>
            )}

            {place.category && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white shadow-sm backdrop-blur-md"
                style={{
                  backgroundColor: place.category.color
                    ? `${place.category.color}e6`
                    : '#d4af37e6',
                }}
              >
                {place.category.name}
              </span>
            )}
          </div>

          {/* Quick Map Locator Pin */}
          {onSelectOnMap && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectOnMap(place);
              }}
              aria-label={`Locate ${place.name} on map`}
              title="Pin and draw route on interactive map"
              className="p-2 rounded-full bg-charcoal-900/80 hover:bg-gold-500 hover:text-charcoal-950 text-ivory-100 shadow-md backdrop-blur-sm transition-all duration-200 active:scale-90"
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Bottom Photograph Overlay: Distance & Address */}
        <div className="absolute bottom-2.5 left-3 right-3 text-white z-10 flex items-center justify-between gap-2">
          {distanceKm !== null ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-950/85 text-sky-200 border border-sky-400/30 backdrop-blur-sm">
              <Navigation className="w-3 h-3 text-sky-400" />
              {formatDistance(distanceKm)}
              {travelTimeMinutes && (
                <span className="text-sky-300 font-normal">· ~{travelTimeMinutes} min</span>
              )}
            </span>
          ) : (
            <span />
          )}

          {place.address && (
            <span className="text-[11px] text-sand-300 truncate max-w-[55%] flex items-center gap-1 font-medium">
              <MapPin className="w-3 h-3 text-gold-400 shrink-0" />
              <span className="truncate">{place.address}</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          <Link
            to={`/places/${place.slug || place.id}`}
            className="block text-lg font-serif font-bold text-charcoal-950 hover:text-gold-600 transition-colors line-clamp-1 leading-snug group-hover:text-gold-600"
          >
            {place.name}
          </Link>

          <p className="text-xs text-charcoal-700 mt-2 line-clamp-2 leading-relaxed font-sans">
            {place.description}
          </p>

          {place.opening_hours && (
            <div className="flex items-center gap-1.5 text-[11px] text-sand-600 mt-3 pt-2.5 border-t border-sand-100">
              <Clock className="w-3.5 h-3.5 text-gold-600 shrink-0" />
              <span className="truncate">{place.opening_hours}</span>
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-4 mt-3 border-t border-sand-100 flex items-center justify-between gap-3">
          <Link
            to={`/places/${place.slug || place.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal-800 hover:text-gold-600 transition-colors group/link"
          >
            Explore Dossier
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
          </Link>

          <button
            type="button"
            onClick={() => addPlaceToPlan(place)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              inPlan
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                : 'bg-gold-500 text-charcoal-950 hover:bg-gold-400 active:scale-95'
            }`}
          >
            {inPlan ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                In Day Plan
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Add to Plan
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
