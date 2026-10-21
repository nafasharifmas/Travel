import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Place } from '../../types';
import { useItinerary } from '../../context/ItineraryContext';
import {
  DEFAULT_USER_LOCATION,
  calculateDistanceKm,
  estimateTravelTimeMinutes,
  EASTERN_PROVINCE_ORDER,
  EASTERN_CORRIDOR_BOUNDS,
} from '../../utils/geo';
import { Compass, Route as RouteIcon, LocateFixed, ExternalLink, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Neutral placeholder when a destination has no photograph on record. */
const MAP_FALLBACK_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" fill="#075985"/><text x="80" y="86" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="#7FCBEB">VF</text></svg>`
  );

/** Relative luminance of a hex or rgb() colour (WCAG 2.x). */
const relativeLuminance = (color: string): number => {
  const value = color.trim();
  let r = 0;
  let g = 0;
  let b = 0;
  const rgbMatch = value.match(/rgba?\(([^)]+)\)/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map((p) => parseFloat(p));
    r = parts[0] || 0;
    g = parts[1] || 0;
    b = parts[2] || 0;
  } else {
    const h = value.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    if (!/^[0-9a-fA-F]{6}$/.test(full)) return 0;
    r = parseInt(full.slice(0, 2), 16);
    g = parseInt(full.slice(2, 4), 16);
    b = parseInt(full.slice(4, 6), 16);
  }
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

/**
 * Picks readable label ink for a marker whose fill is an arbitrary category
 * colour supplied by the API, so stop labels stay WCAG-AA on any fill.
 */
const readableInkOn = (background: string): string =>
  relativeLuminance(background) > 0.21 ? '#0B1F33' : '#ffffff';

interface MapCanvasProps {
  places: Place[];
  selectedPlace?: Place | null;
  onSelectPlace?: (place: Place) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  interactive?: boolean;
  userLocation?: [number, number];
  showRoute?: boolean;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  center = DEFAULT_USER_LOCATION,
  zoom = 11,
  height = '100%',
  interactive = true,
  userLocation = DEFAULT_USER_LOCATION,
  showRoute = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<number, L.Marker>>(new Map());
  const { stops } = useItinerary();

  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    travelMinutes: number;
    destinationName: string;
    pointsCount: number;
  } | null>(null);

  const [isRouteActive, setIsRouteActive] = useState(showRoute);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = userLocation || center;
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoom,
        minZoom: 8,
        maxZoom: 18,
        zoomControl: false, // We'll position zoom control neatly on bottom-right
        scrollWheelZoom: interactive,
      });

      // Position zoom control cleanly in top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // FR-14: Required OpenStreetMap tile layer and attribution
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const routeLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      routeLayerRef.current = routeLayer;
      markersLayerRef.current = markersLayer;

      // Invalidate size once DOM layout stabilizes
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render Markers and Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !markersLayer || !routeLayer) return;

    markersLayer.clearLayers();
    routeLayer.clearLayers();
    markersMapRef.current.clear();

    const bounds = L.latLngBounds([]);

    // 2.1 Add User Location Marker ("You Are Here / Origin Anchor")
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: rgba(0, 191, 196, 0.35);
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              position: absolute;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: rgba(0, 109, 170, 0.25);
            "></div>
            <div style="
              width: 26px;
              height: 26px;
              border-radius: 50%;
              background: #006DAA;
              border: 3px solid #ffffff;
              box-shadow: 0 4px 14px rgba(11, 31, 51, 0.55);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10;
            ">
              <span style="display: block; width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></span>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22],
      });

      const userMarker = L.marker([userLocation[0], userLocation[1]], {
        icon: userIcon,
        zIndexOffset: 1200,
      });

      userMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 4px; min-width: 180px;">
          <div style="display: flex; items-center; gap: 4px; margin-bottom: 2px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #006DAA;"></span>
            <strong style="color: #075985; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              Origin Anchor
            </strong>
          </div>
          <p style="margin: 0; font-size: 13px; font-weight: bold; color: #102A43;">
            Maruthamunai Basecamp
          </p>
          <span style="color: #64748b; font-size: 10px; font-family: monospace; display: block; margin-top: 2px;">
            [${userLocation[0].toFixed(6)}, ${userLocation[1].toFixed(6)}]
          </span>
          <p style="margin: 4px 0 0 0; color: #475569; font-size: 11px;">
            Every route and distance on this map is measured from here.
          </p>
        </div>
      `);

      markersLayer.addLayer(userMarker);
      bounds.extend([userLocation[0], userLocation[1]]);
    }

    // 2.2 Add Place Markers
    places.forEach((place) => {
      if (!place.lat || !place.lng) return;

      const isSelected = selectedPlace?.id === place.id;
      const markerColor = place.category?.color || '#006DAA';
      const stopNumber = place.slug ? EASTERN_PROVINCE_ORDER[place.slug] : undefined;
      const distFromUser = userLocation
        ? calculateDistanceKm(userLocation[0], userLocation[1], place.lat, place.lng)
        : null;
      const travelMins = distFromUser !== null ? estimateTravelTimeMinutes(distFromUser) : null;

      const pinLabel = stopNumber ? `#${stopNumber}` : '•';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            position: relative;
            background-color: ${isSelected ? '#102A43' : markerColor};
            border: 3px solid ${isSelected ? '#00BFC4' : '#ffffff'};
            width: ${isSelected ? '38px' : '32px'};
            height: ${isSelected ? '38px' : '32px'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(11,31,51, ${isSelected ? '0.55' : '0.35'});
            color: ${isSelected ? '#ffffff' : readableInkOn(markerColor)};
            font-size: ${stopNumber ? '12px' : '14px'};
            font-weight: 800;
            cursor: pointer;
            transition: all 0.25s ease-out;
            ${isSelected ? 'transform: scale(1.15);' : ''}
          ">
            ${pinLabel}
          </div>
        `,
        iconSize: [isSelected ? 38 : 32, isSelected ? 38 : 32],
        iconAnchor: [isSelected ? 19 : 16, isSelected ? 38 : 32],
        popupAnchor: [0, isSelected ? -38 : -32],
      });

      const marker = L.marker([place.lat, place.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 500,
      });

      const distBadge =
        distFromUser !== null
          ? `<span style="display: inline-flex; align-items: center; gap: 3px; background-color: #0B1F33; color: #7FCBEB; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700;">
              ~${distFromUser} km · ~${travelMins} min est.
             </span>`
          : '';

      const popupHtml = `
        <div style="font-family: inherit; width: 230px; padding: 2px;">
          <div style="position: relative; width: 100%; height: 110px; border-radius: 10px; overflow: hidden; margin-bottom: 8px; background:#0B1F33;">
            <img 
              src="${place.primary_photo || MAP_FALLBACK_PHOTO}" 
              alt="${place.name}" 
              style="width: 100%; height: 100%; object-fit: cover;" 
            />
            <div style="position: absolute; top: 6px; left: 6px;">
              ${stopNumber ? `<span style="background: #006DAA; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 900; text-transform: uppercase;">Stop #${stopNumber}</span>` : ''}
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; color: #0A4763; text-transform: uppercase; letter-spacing: 0.5px;">
              ${place.category?.name || 'Destination'}
            </span>
            ${distBadge}
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #102A43; line-height: 1.25;">
            ${place.name}
          </h4>
          <p style="font-size: 11px; color: #475569; margin: 0 0 10px 0; line-height: 1.35;">
            ${(place.description || '').slice(0, 75)}...
          </p>
          <div style="display: flex; gap: 6px;">
            <a href="/places/${place.slug || place.id}" style="
              flex: 1;
              text-align: center;
              padding: 7px 10px;
              background-color: #F1F5F9;
              color: #102A43;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 700;
              text-decoration: none;
              border: 1px solid #E2E8F0;
            ">Explore Details</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectPlace) {
          onSelectPlace(place);
        }
      });

      markersLayer.addLayer(marker);
      markersMapRef.current.set(place.id, marker);

      // Only extend bounds if places belong to close proximity to prevent island-wide zoom-out
      if (places.length <= 12 || (distFromUser !== null && distFromUser < 40)) {
        bounds.extend([place.lat, place.lng]);
      }
    });

    // 2.3 Draw Route Polyline
    if (isRouteActive && userLocation) {
      let routeCoords: [number, number][] = [];
      let totalDist = 0;
      let targetName = '';

      // Priority A: If Day Plan has stops, draw sequential path
      if (stops.length > 0) {
        routeCoords.push([userLocation[0], userLocation[1]]);
        let prevLat = userLocation[0];
        let prevLng = userLocation[1];

        stops.forEach((stop) => {
          if (stop.place?.lat && stop.place?.lng) {
            routeCoords.push([stop.place.lat, stop.place.lng]);
            totalDist += calculateDistanceKm(prevLat, prevLng, stop.place.lat, stop.place.lng);
            prevLat = stop.place.lat;
            prevLng = stop.place.lng;
          }
        });

        targetName = `${stops.length} stops on this route`;
      }
      // Priority B: If a place is selected, draw direct route from origin to that place
      else if (selectedPlace && selectedPlace.lat && selectedPlace.lng) {
        routeCoords = [
          [userLocation[0], userLocation[1]],
          [selectedPlace.lat, selectedPlace.lng],
        ];
        totalDist = calculateDistanceKm(
          userLocation[0],
          userLocation[1],
          selectedPlace.lat,
          selectedPlace.lng
        );
        targetName = selectedPlace.name;
      }
      // Priority C: Connect the 3 nearest destinations to demonstrate corridor
      else if (places.length > 0) {
        const sorted = [...places]
          .filter((p) => p.lat && p.lng)
          .sort((a, b) => {
            const dA = calculateDistanceKm(userLocation[0], userLocation[1], a.lat, a.lng);
            const dB = calculateDistanceKm(userLocation[0], userLocation[1], b.lat, b.lng);
            return dA - dB;
          });

        const nearest = sorted.slice(0, 3);
        routeCoords = [[userLocation[0], userLocation[1]]];
        let prevLat = userLocation[0];
        let prevLng = userLocation[1];

        nearest.forEach((p) => {
          routeCoords.push([p.lat, p.lng]);
          totalDist += calculateDistanceKm(prevLat, prevLng, p.lat, p.lng);
          prevLat = p.lat;
          prevLng = p.lng;
        });

        targetName = `Nearest 3 Eastern Corridor stops`;
      }

      if (routeCoords.length >= 2) {
        // Polyline depth glow casing
        const casing = L.polyline(routeCoords, {
          color: '#ffffff',
          weight: 7,
          opacity: 0.9,
          lineJoin: 'round',
        });
        routeLayer.addLayer(casing);

        // Core ocean route polyline
        const line = L.polyline(routeCoords, {
          color: '#006DAA',
          weight: 4.5,
          opacity: 0.95,
          dashArray: '8, 8',
          lineCap: 'round',
        });
        routeLayer.addLayer(line);

        setRouteInfo({
          distanceKm: Math.round(totalDist * 10) / 10,
          travelMinutes: estimateTravelTimeMinutes(totalDist),
          destinationName: targetName,
          pointsCount: routeCoords.length,
        });

        routeCoords.forEach((c) => bounds.extend(c));
      } else {
        setRouteInfo(null);
      }
    } else {
      setRouteInfo(null);
    }

    // 2.4 Intelligent auto-fit: If bounds are strictly regional, fit with padding; otherwise clamp to Eastern Province
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    } else if (userLocation) {
      map.setView(userLocation, 11.5);
    }
  }, [places, userLocation, stops, isRouteActive]);

  // 3. React smoothly to selectedPlace changes
  useEffect(() => {
    if (!selectedPlace || !mapInstanceRef.current || !selectedPlace.lat || !selectedPlace.lng) return;

    const map = mapInstanceRef.current;
    map.flyTo([selectedPlace.lat, selectedPlace.lng], 13.5, {
      duration: 1.2,
      easeLinearity: 0.25,
    });

    const marker = markersMapRef.current.get(selectedPlace.id);
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
        // Keep the selected-place popup below the fixed site header instead of
        // letting Leaflet position it against the top edge of the map.
        map.panBy([0, 96], { animate: true, duration: 0.35 });
      }, 500);
    }
  }, [selectedPlace]);

  // Floating Control Handlers
  const handleRecenterOrigin = useCallback(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    mapInstanceRef.current.flyTo(userLocation, 13.5, { duration: 1.2 });
  }, [userLocation]);

  const handleFitEasternCorridor = useCallback(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.fitBounds(EASTERN_CORRIDOR_BOUNDS, {
      padding: [40, 40],
      maxZoom: 12,
    });
  }, []);

  const handleFitAllDestinations = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([]);
    if (userLocation) bounds.extend(userLocation);
    places.forEach((p) => {
      if (p.lat && p.lng) bounds.extend([p.lat, p.lng]);
    });
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [places, userLocation]);

  return (
    <div
      className="relative z-0 isolate w-full rounded-card overflow-hidden border border-navy-200 shadow-card bg-navy-100 flex flex-col"
      style={{ height }}
    >
      {/* Map Header Overlay: Coordinates & Quick Actions */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-btn bg-navy-950/85 text-white text-xs font-semibold shadow-card backdrop-blur-md border border-white/15">
          <LocateFixed className="w-3.5 h-3.5 text-turquoise-300" />
          <span>
            {userLocation[0].toFixed(4)}° N, {userLocation[1].toFixed(4)}° E
          </span>
          <button
            type="button"
            onClick={handleRecenterOrigin}
            className="ml-1 text-[11px] font-bold text-turquoise-300 hover:text-turquoise-200 underline"
            title="Recenter on your origin coordinates"
          >
            Origin
          </button>
        </div>

        <button
          type="button"
          onClick={handleFitEasternCorridor}
          className="pointer-events-auto hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-white/95 hover:bg-white text-navy-900 text-xs font-bold shadow-md backdrop-blur-md border border-navy-200 transition-colors"
          title="Zoom to the 10 Eastern Province stops"
        >
          <Compass className="w-3.5 h-3.5 text-ocean-500" />
          Eastern Corridor
        </button>

        <button
          type="button"
          onClick={handleFitAllDestinations}
          className="pointer-events-auto hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-white/95 hover:bg-white text-navy-900 text-xs font-bold shadow-md backdrop-blur-md border border-navy-200 transition-colors"
          title="Fit the map to every destination currently shown"
        >
          <Maximize2 className="w-3.5 h-3.5 text-ocean-500" />
          Fit all
        </button>

        <button
          type="button"
          onClick={() => setIsRouteActive(!isRouteActive)}
          className={`pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-bold shadow-md backdrop-blur-md border transition-all ${
            isRouteActive
              ? 'bg-ocean-500 text-white border-ocean-500'
              : 'bg-white/95 text-navy-700 border-navy-200 hover:bg-white'
          }`}
          title="Toggle trajectory lines"
        >
          <RouteIcon className="w-3.5 h-3.5" />
          {isRouteActive ? 'Route Line On' : 'Route Off'}
        </button>
      </div>

      {/* Primary Leaflet Container */}
      <div ref={mapContainerRef} className="w-full flex-1 z-0" />

      {/* Floating Bottom Info Strip / Selected Place Preview */}
      {selectedPlace ? (
        <div className="absolute bottom-3 left-3 right-3 z-10 p-3.5 bg-navy-950/90 text-white rounded-card shadow-card-hover backdrop-blur-md border border-white/15 flex items-center justify-between gap-3 animate-fadeInUp">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={selectedPlace.primary_photo || MAP_FALLBACK_PHOTO}
              alt={selectedPlace.name}
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== MAP_FALLBACK_PHOTO) img.src = MAP_FALLBACK_PHOTO;
              }}
              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/15"
            />
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-turquoise-300 tracking-wider">
                  Selected Destination
                </span>
                {routeInfo && (
                  <span className="text-[10px] text-turquoise-200 font-bold">
                    · {routeInfo.distanceKm} km from origin (~{routeInfo.travelMinutes} min)
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white truncate font-serif">
                {selectedPlace.name}
              </h4>
              <p className="text-[11px] text-navy-200 truncate">
                {selectedPlace.address || 'Eastern Province, Sri Lanka'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/places/${selectedPlace.slug || selectedPlace.id}`}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-btn text-xs font-bold flex items-center gap-1 shadow-sm transition-colors border border-white/15"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Details</span>
            </Link>

          </div>
        </div>
      ) : routeInfo ? (
        <div className="absolute bottom-3 left-3 z-[1000] px-3.5 py-2 bg-navy-950/85 text-white rounded-btn shadow-card backdrop-blur-md border border-white/15 text-xs flex items-center gap-2 pointer-events-none">
          <RouteIcon className="w-4 h-4 text-turquoise-300" />
          <span>
            Active route: <strong>{routeInfo.distanceKm} km</strong> (~{routeInfo.travelMinutes} min
            estimated)
          </span>
        </div>
      ) : null}
    </div>
  );
};
