/**
 * Haversine distance formula between two lat/lng coordinates in kilometers.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  rounded = true
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return rounded ? Math.round(d * 10) / 10 : d;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Standard user coordinate anchor (Maruthamunai / Kalmunai corridor, Eastern Province)
 */
export const DEFAULT_USER_LOCATION: [number, number] = [7.439374, 81.817172];

/**
 * Bounds tightly covering the 10 Eastern Province destinations (from Deegawapi in the south to Kallady in the north)
 */
export const EASTERN_CORRIDOR_BOUNDS: [[number, number], [number, number]] = [
  [7.18, 81.62], // SW corner (south of Deegawapi)
  [7.75, 81.88], // NE corner (north of Kallady Beach)
];

/**
 * Realistic travel time estimation for Eastern Province coastal roads & tuk-tuks
 * Average 30-36 km/h plus a 2-minute baseline traffic/staging buffer.
 */
export function estimateTravelTimeMinutes(distanceKm: number): number {
  if (distanceKm <= 0.6) return 2;
  const minutes = Math.round((distanceKm / 32) * 60) + 2;
  return Math.max(3, minutes);
}

/**
 * Human-readable distance formatter
 */
export function formatDistance(distanceKm: number | null | undefined): string {
  if (distanceKm === null || distanceKm === undefined) return '';
  if (distanceKm < 1) return `~${(distanceKm * 1000).toFixed(0)} m`;
  return `~${distanceKm.toFixed(1)} km`;
}

/**
 * Sequential Eastern Province stop order mapping by place name / slug
 */
export const EASTERN_PROVINCE_ORDER: Record<string, number> = {
  'maruthamunai-beach': 1,
  'kalmunai-beach-beach-mosque': 2,
  'muhyideen-grand-jumuah-masjid': 3,
  'koddaikallar-village-lagoon': 4,
  'palamunai-beach': 5,
  'nintavur-beach-coastal-park': 6,
  'suyampulinga-pillayar-temple': 7,
  'kattankudy-heritage-museum': 8,
  'kallady-beach': 9,
  'deegawapi-raja-maha-vihara': 10,
};

