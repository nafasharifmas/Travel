import { useCallback, useState } from 'react';
import { DEFAULT_USER_LOCATION } from '../utils/geo';

export type GeolocationStatus =
  | 'idle'
  | 'locating'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'error';

interface UseGeolocationResult {
  status: GeolocationStatus;
  /** Active coordinates — real device location when granted, otherwise the verified anchor. */
  coordinates: [number, number];
  isUsingDeviceLocation: boolean;
  error: string | null;
  requestLocation: () => void;
  resetToAnchor: () => void;
}

/**
 * Real browser geolocation with a guaranteed fallback to the verified origin anchor
 * (7.439374, 81.817172 — Maruthamunai / Kalmunai).
 *
 * The permission prompt is never triggered on page load: the app keeps working with
 * the anchor coordinates until the visitor explicitly opts in. A denial, timeout or
 * unsupported browser all fall back to the anchor so no view ever breaks.
 */
export function useGeolocation(): UseGeolocationResult {
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [coordinates, setCoordinates] = useState<[number, number]>(DEFAULT_USER_LOCATION);
  const [isUsingDeviceLocation, setIsUsingDeviceLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unavailable');
      setError('This browser does not support location services.');
      setCoordinates(DEFAULT_USER_LOCATION);
      setIsUsingDeviceLocation(false);
      return;
    }

    setStatus('locating');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates([position.coords.latitude, position.coords.longitude]);
        setIsUsingDeviceLocation(true);
        setStatus('granted');
        setError(null);
      },
      (geoError) => {
        setCoordinates(DEFAULT_USER_LOCATION);
        setIsUsingDeviceLocation(false);
        setStatus(geoError.code === 1 ? 'denied' : 'error');
        setError(
          geoError.code === 1
            ? 'Location permission was denied — showing distances from the Maruthamunai anchor.'
            : 'Could not determine your location — showing distances from the Maruthamunai anchor.'
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const resetToAnchor = useCallback(() => {
    setCoordinates(DEFAULT_USER_LOCATION);
    setIsUsingDeviceLocation(false);
    setStatus('idle');
    setError(null);
  }, []);

  return { status, coordinates, isUsingDeviceLocation, error, requestLocation, resetToAnchor };
}
