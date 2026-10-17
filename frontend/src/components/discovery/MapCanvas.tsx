import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Place } from '../../types';
import { useItinerary } from '../../context/ItineraryContext';
import {
  DEFAULT_USER_LOCATION,
  calculateDistanceKm,
  estimateTravelTimeMinutes,
  formatDistance,
  EASTERN_PROVINCE_ORDER,
  EASTERN_CORRIDOR_BOUNDS,
} from '../../utils/geo';
import {
  Navigation,
  Compass,
  Route as RouteIcon,
  LocateFixed,
  Maximize2,
  Plus,
  Check,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const { stops, addPlaceToPlan, isPlaceInPlan } = useItinerary();

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
              background: rgba(14, 165, 233, 0.35);
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              position: absolute;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: rgba(2, 132, 199, 0.25);
            "></div>
            <div style="
              width: 26px;
              height: 26px;
              border-radius: 50%;
              background: #0284c7;
              border: 3px solid #ffffff;
              box-shadow: 0 4px 14px rgba(2, 132, 199, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 13px;
              font-weight: bold;
              z-index: 10;
            ">
              📍
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
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #0284c7;"></span>
            <strong style="color: #0284c7; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              Origin Anchor
            </strong>
          </div>
          <p style="margin: 0; font-size: 13px; font-weight: bold; color: #0f0e0d;">
            Maruthamunai Basecamp
          </p>
          <span style="color: #64748b; font-size: 10px; font-family: monospace; display: block; margin-top: 2px;">
            [${userLocation[0].toFixed(6)}, ${userLocation[1].toFixed(6)}]
          </span>
          <p style="margin: 4px 0 0 0; color: #475569; font-size: 11px;">
            All spatial route trajectories and distance milestones originate here.
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
      const markerColor = place.category?.color || '#d4af37';
      const stopNumber = place.slug ? EASTERN_PROVINCE_ORDER[place.slug] : undefined;
      const distFromUser = userLocation
        ? calculateDistanceKm(userLocation[0], userLocation[1], place.lat, place.lng)
        : null;
      const travelMins = distFromUser !== null ? estimateTravelTimeMinutes(distFromUser) : null;

      const pinLabel = stopNumber ? `#${stopNumber}` : '✦';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            position: relative;
            background-color: ${isSelected ? '#0f0e0d' : markerColor};
            border: 3px solid ${isSelected ? '#e5c158' : '#ffffff'};
            width: ${isSelected ? '38px' : '32px'};
            height: ${isSelected ? '38px' : '32px'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(0,0,0, ${isSelected ? '0.6' : '0.35'});
            color: #ffffff;
            font-size: ${stopNumber ? '11px' : '13px'};
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
          ? `<span style="display: inline-flex; align-items: center; gap: 3px; background-color: #082f49; color: #7dd3fc; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700;">
              📍 ~${distFromUser} km (${travelMins} min)
             </span>`
          : '';

      const popupHtml = `
        <div style="font-family: inherit; width: 230px; padding: 2px;">
          <div style="position: relative; width: 100%; height: 110px; border-radius: 8px; overflow: hidden; margin-bottom: 8px;">
            <img 
              src="${place.primary_photo || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80'}" 
              alt="${place.name}" 
              style="width: 100%; height: 100%; object-fit: cover;" 
            />
            <div style="position: absolute; top: 6px; left: 6px;">
              ${stopNumber ? `<span style="background: #f59e0b; color: #0f0e0d; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 900; text-transform: uppercase;">Stop #${stopNumber}</span>` : ''}
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; color: ${markerColor}; text-transform: uppercase; letter-spacing: 0.5px;">
              ${place.category?.name || 'Destination'}
            </span>
            ${distBadge}
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #0f0e0d; line-height: 1.25;">
            ${place.name}
          </h4>
          <p style="font-size: 11px; color: #5c5652; margin: 0 0 10px 0; line-height: 1.35;">
            ${(place.description || '').slice(0, 75)}...
          </p>
          <div style="display: flex; gap: 6px;">
            <a href="/places/${place.slug || place.id}" style="
              flex: 1;
              text-align: center;
              padding: 6px 10px;
              background-color: #f7f3ec;
              color: #0f0e0d;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 700;
              text-decoration: none;
              border: 1px solid #ebe3d5;
            ">Explore Dossier</a>
            <button id="map-add-btn-${place.id}" style="
              flex: 1;
              padding: 6px 10px;
              background-color: #d4af37;
              color: #0f0e0d;
              border: none;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 800;
              cursor: pointer;
            ">+ Add to Plan</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectPlace) {
          onSelectPlace(place);
        }
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`map-add-btn-${place.id}`);
        if (btn) {
          btn.onclick = () => {
            addPlaceToPlan(place);
            marker.closePopup();
          };
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

        targetName = `${stops.length} Stops in Expedition Plan`;
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

        // Core cyan/sky route polyline
        const line = L.polyline(routeCoords, {
          color: '#0284c7',
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
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-sand-300 shadow-xl bg-sand-100 flex flex-col"
      style={{ height }}
    >
      {/* Map Header Overlay: Coordinates & Quick Actions */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-charcoal-900/90 text-ivory-50 text-xs font-semibold shadow-lg backdrop-blur-md border border-sand-400/20">
          <LocateFixed className="w-3.5 h-3.5 text-sky-400" />
          <span>7.4394° N, 81.8172° E</span>
          <button
            type="button"
            onClick={handleRecenterOrigin}
            className="ml-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 underline"
            title="Recenter on your anchor coordinates"
          >
            Origin
          </button>
        </div>

        <button
          type="button"
          onClick={handleFitEasternCorridor}
          className="pointer-events-auto hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-charcoal-950 text-xs font-bold shadow-md backdrop-blur-md border border-sand-300 transition-colors"
          title="Zoom to the 10 Eastern Province stops"
        >
          <Compass className="w-3.5 h-3.5 text-amber-600" />
          Eastern Corridor
        </button>

        <button
          type="button"
          onClick={() => setIsRouteActive(!isRouteActive)}
          className={`pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md backdrop-blur-md border transition-all ${
            isRouteActive
              ? 'bg-sky-600 text-white border-sky-500'
              : 'bg-white/95 text-charcoal-800 border-sand-300 hover:bg-white'
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
        <div className="absolute bottom-3 left-3 right-3 z-[1000] p-3.5 bg-charcoal-950/95 text-white rounded-2xl shadow-2xl backdrop-blur-md border border-sand-400/20 flex items-center justify-between gap-3 animate-fadeInUp">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={selectedPlace.primary_photo || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=150&q=80'}
              alt={selectedPlace.name}
              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-sand-400/30"
            />
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  Selected Destination
                </span>
                {routeInfo && (
                  <span className="text-[10px] text-sky-300 font-bold">
                    · {routeInfo.distanceKm} km from origin (~{routeInfo.travelMinutes} min)
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white truncate font-serif">
                {selectedPlace.name}
              </h4>
              <p className="text-[11px] text-sand-300 truncate">
                {selectedPlace.address || 'Eastern Province, Sri Lanka'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/places/${selectedPlace.slug || selectedPlace.id}`}
              className="p-2 bg-sand-100 hover:bg-white text-charcoal-950 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dossier</span>
            </Link>

            <button
              type="button"
              onClick={() => addPlaceToPlan(selectedPlace)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                isPlaceInPlan(selectedPlace.id)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gold-500 text-charcoal-950 hover:bg-gold-400'
              }`}
            >
              {isPlaceInPlan(selectedPlace.id) ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">In Plan</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : routeInfo ? (
        <div className="absolute bottom-3 left-3 z-[1000] px-3.5 py-2 bg-charcoal-900/90 text-white rounded-xl shadow-lg backdrop-blur-md border border-sand-400/20 text-xs flex items-center gap-2 pointer-events-none">
          <RouteIcon className="w-4 h-4 text-sky-400" />
          <span>
            Active Route: <strong>{routeInfo.distanceKm} km</strong> (~{routeInfo.travelMinutes} mins via coastal corridor)
          </span>
        </div>
      ) : null}
    </div>
  );
};
