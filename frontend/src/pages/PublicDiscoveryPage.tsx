import React, { useState, useEffect, useMemo } from 'react';
import { Place, Category } from '../types';
import { api } from '../services/api';
import { PlaceCard } from '../components/discovery/PlaceCard';
import { MapCanvas } from '../components/discovery/MapCanvas';
import { useGeolocation } from '../hooks/useGeolocation';
import {
  DEFAULT_USER_LOCATION,
  calculateDistanceKm,
  EASTERN_PROVINCE_ORDER,
  EASTERN_CORRIDOR_BOUNDS,
} from '../utils/geo';
import {
  Compass,
  Map as MapIcon,
  List,
  AlertCircle,
  Navigation,
  LocateFixed,
  Route as RouteIcon,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Grid3X3,
  Columns2,
  RotateCcw,
  Waves,
  Landmark,
  MapPin,
} from 'lucide-react';

type ScopeTab = 'eastern' | 'all' | 'coastal' | 'heritage';
type DistanceFilter = 'all' | '5' | '10' | '25';

const SCOPE_TABS: { id: ScopeTab; label: string; icon: React.ElementType; hint?: string }[] = [
  { id: 'eastern', label: 'Eastern Coast Corridor', icon: Navigation, hint: '10 stops' },
  { id: 'all', label: 'All Sri Lanka', icon: Compass },
  { id: 'coastal', label: 'Coastal & Marine', icon: Waves },
  { id: 'heritage', label: 'Sacred & Cultural', icon: Landmark },
];

const DISTANCE_OPTIONS: { id: DistanceFilter; label: string }[] = [
  { id: 'all', label: 'Any distance' },
  { id: '5', label: 'Within 5 km' },
  { id: '10', label: 'Within 10 km' },
  { id: '25', label: 'Within 25 km' },
];

const CardSkeleton: React.FC = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="aspect-[16/10] bg-navy-100" />
    <div className="p-5 space-y-3">
      <div className="h-4 w-3/4 rounded bg-navy-100" />
      <div className="h-3 w-full rounded bg-navy-100" />
      <div className="h-3 w-5/6 rounded bg-navy-100" />
      <div className="pt-3 border-t border-navy-100 flex justify-between">
        <div className="h-3 w-24 rounded bg-navy-100" />
        <div className="h-8 w-28 rounded-btn bg-navy-100" />
      </div>
    </div>
  </div>
);

export const PublicDiscoveryPage: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>('all');
  const [sort, setSort] = useState('distance_asc');
  const [selectedPlaceForMap, setSelectedPlaceForMap] = useState<Place | null>(null);
  const [hoveredPlace, setHoveredPlace] = useState<Place | null>(null);

  // Geographic scope: 'eastern' (the 10 core destinations), 'all', 'coastal', 'heritage'
  const [scopeTab, setScopeTab] = useState<ScopeTab>('eastern');

  // Desktop view mode: 'split' | 'cards' | 'map'
  const [desktopView, setDesktopView] = useState<'split' | 'cards' | 'map'>('split');

  // Mobile/tablet layout switcher: 'cards' | 'map'
  const [mobileTab, setMobileTab] = useState<'cards' | 'map'>('cards');

  // Mobile filter drawer
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Real device geolocation with a hard fallback to the verified origin anchor.
  const geo = useGeolocation();
  const origin = geo.coordinates;
  const originLat = origin[0];
  const originLng = origin[1];

  // Load categories
  useEffect(() => {
    api
      .getCategories()
      .then((res) => setCategories(res.categories))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Debounce the free-text search so typing does not hammer the API (250 ms).
  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(handle);
  }, [search]);

  // Fetch places whenever the debounced search or category changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .getPlaces({
        search: debouncedSearch || undefined,
        category: selectedCategory || undefined,
      })
      .then((res) => {
        if (cancelled) return;
        setPlaces(res.places);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to fetch the destination catalogue.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, selectedCategory]);

  // Lock body scroll while the mobile filter drawer is open.
  useEffect(() => {
    document.body.style.overflow = isFiltersOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFiltersOpen]);

  // Filter + sort in memory (scope, distance, ordering).
  const displayedPlaces = useMemo(() => {
    const distanceFromOrigin = (p: Place): number | null =>
      p.lat && p.lng ? calculateDistanceKm(originLat, originLng, p.lat, p.lng) : null;

    let list = [...places];

    if (scopeTab === 'eastern') {
      // The Eastern corridor is a fixed geographic definition (anchored at Maruthamunai),
      // independent of the visitor's device location.
      list = list.filter((p) => {
        if (!p.lat || !p.lng) return false;
        const d = calculateDistanceKm(
          DEFAULT_USER_LOCATION[0],
          DEFAULT_USER_LOCATION[1],
          p.lat,
          p.lng
        );
        return d <= 26 || (p.slug && EASTERN_PROVINCE_ORDER[p.slug] !== undefined);
      });
    } else if (scopeTab === 'heritage') {
      list = list.filter((p) => {
        const cat = p.category?.slug || '';
        return (
          cat.includes('heritage') ||
          cat.includes('culture') ||
          cat.includes('religion') ||
          cat.includes('history')
        );
      });
    } else if (scopeTab === 'coastal') {
      list = list.filter((p) => {
        const cat = p.category?.slug || '';
        return cat.includes('beach') || cat.includes('coastal') || cat.includes('lagoon');
      });
    }

    // Distance ceiling relative to the active origin.
    if (distanceFilter !== 'all') {
      const limit = Number(distanceFilter);
      list = list.filter((p) => {
        const d = distanceFromOrigin(p);
        return d !== null && d <= limit;
      });
    }

    if (sort === 'distance_asc') {
      list.sort((a, b) => (distanceFromOrigin(a) ?? Infinity) - (distanceFromOrigin(b) ?? Infinity));
    } else if (sort === 'stop_order') {
      list.sort((a, b) => {
        const orderA = a.slug ? EASTERN_PROVINCE_ORDER[a.slug] || 999 : 999;
        const orderB = b.slug ? EASTERN_PROVINCE_ORDER[b.slug] || 999 : 999;
        return orderA - orderB;
      });
    } else if (sort === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [places, scopeTab, sort, distanceFilter, originLat, originLng]);

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedCategory(null);
    setDistanceFilter('all');
    setSort('distance_asc');
    setScopeTab('eastern');
    setSelectedPlaceForMap(null);
  };

  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; clear: () => void }[] = [];
    if (search) list.push({ key: 'search', label: `“${search}”`, clear: () => setSearch('') });
    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory);
      list.push({
        key: 'category',
        label: cat?.name || selectedCategory,
        clear: () => setSelectedCategory(null),
      });
    }
    if (distanceFilter !== 'all') {
      const opt = DISTANCE_OPTIONS.find((o) => o.id === distanceFilter);
      list.push({
        key: 'distance',
        label: opt?.label || `Within ${distanceFilter} km`,
        clear: () => setDistanceFilter('all'),
      });
    }
    if (scopeTab !== 'eastern') {
      const tab = SCOPE_TABS.find((t) => t.id === scopeTab);
      list.push({ key: 'scope', label: tab?.label || scopeTab, clear: () => setScopeTab('eastern') });
    }
    if (sort !== 'distance_asc') {
      const label =
        sort === 'stop_order' ? 'Corridor sequence' : sort === 'name_asc' ? 'Name A–Z' : sort;
      list.push({ key: 'sort', label: label, clear: () => setSort('distance_asc') });
    }
    return list;
  }, [search, selectedCategory, distanceFilter, scopeTab, sort, categories]);

  const activeFiltersCount = activeFilters.length;
  const originLabel = geo.isUsingDeviceLocation ? 'your location' : 'the Maruthamunai anchor';

  const proximitySortLabel = geo.isUsingDeviceLocation
    ? 'Proximity (nearest to my location)'
    : 'Proximity (nearest to 7.4394, 81.8172)';

  const handleSelectOnMap = (p: Place) => {
    setSelectedPlaceForMap(p);
    if (window.innerWidth < 1024) setMobileTab('map');
  };

  /* ---------------------------------------------------------------- toolbar */
  const CategorySelect = (
    <label className="flex items-center gap-1.5 text-xs font-semibold text-navy-600">
      <SlidersHorizontal className="w-3.5 h-3.5 text-ocean-500" aria-hidden="true" />
      <span className="sr-only sm:not-sr-only">Category</span>
      <select
        value={selectedCategory || ''}
        onChange={(e) => setSelectedCategory(e.target.value || null)}
        aria-label="Filter by category"
        className="field !w-auto py-2 text-xs font-semibold"
      >
        <option value="">All Categories ({categories.length})</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
            {c.places_count !== undefined ? ` (${c.places_count})` : ''}
          </option>
        ))}
      </select>
    </label>
  );

  const DistanceSelect = (
    <label className="flex items-center gap-1.5 text-xs font-semibold text-navy-600">
      <MapPin className="w-3.5 h-3.5 text-ocean-500" aria-hidden="true" />
      <span className="sr-only sm:not-sr-only">Distance</span>
      <select
        value={distanceFilter}
        onChange={(e) => setDistanceFilter(e.target.value as DistanceFilter)}
        aria-label="Filter by distance"
        className="field !w-auto py-2 text-xs font-semibold"
      >
        {DISTANCE_OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );

  const SortSelect = (
    <label className="flex items-center gap-1.5 text-xs font-semibold text-navy-600">
      <ArrowUpDown className="w-3.5 h-3.5 text-ocean-500" aria-hidden="true" />
      <span className="sr-only sm:not-sr-only">Sort</span>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        aria-label="Sort destinations"
        className="field !w-auto py-2 text-xs font-semibold"
      >
        <option value="distance_asc">{proximitySortLabel}</option>
        <option value="stop_order">Corridor sequence (#1 to #10)</option>
        <option value="name_asc">Name (A – Z)</option>
      </select>
    </label>
  );

  const ViewSwitcher = (
    <div
      className="hidden lg:flex items-center gap-1 bg-navy-100 p-1 rounded-btn border border-navy-200"
      role="group"
      aria-label="Display mode"
    >
      {(
        [
          { id: 'split', icon: Columns2, title: 'Split: cards and map' },
          { id: 'cards', icon: Grid3X3, title: 'Cards grid only' },
          { id: 'map', icon: MapIcon, title: 'Map only' },
        ] as const
      ).map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => setDesktopView(v.id)}
          aria-pressed={desktopView === v.id}
          title={v.title}
          aria-label={v.title}
          className={`grid place-items-center w-9 h-9 rounded-[9px] transition-all ${
            desktopView === v.id
              ? 'bg-white text-ocean-600 shadow-sm'
              : 'text-navy-500 hover:text-navy-900'
          }`}
        >
          <v.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory-100 pt-24 lg:pt-[112px]">
      {/* ---------- Compact discovery hero ---------- */}
      <section className="hidden">
        <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-turquoise-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -left-10 w-80 h-80 rounded-full bg-ocean-400/20 blur-3xl pointer-events-none" />

        <div className="container-page relative z-10 py-10 lg:py-14 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="eyebrow text-turquoise-300">
              <RouteIcon className="w-3.5 h-3.5" />
              Route discovery
            </span>

            {/* Verified origin context + opt-in device location */}
            <div className="hidden flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-white/10 border border-white/20 backdrop-blur-md text-[11px] text-white">
                <LocateFixed className="w-3.5 h-3.5 text-turquoise-300" />
                <span>
                  {geo.isUsingDeviceLocation ? 'Your location' : 'Anchor'}:{' '}
                  <strong className="font-semibold">
                    {origin[0].toFixed(4)}, {origin[1].toFixed(4)}
                  </strong>
                </span>
              </span>

              <button
                type="button"
                onClick={geo.isUsingDeviceLocation ? geo.resetToAnchor : geo.requestLocation}
                disabled={geo.status === 'locating'}
                className="btn-on-dark btn-sm"
              >
                <LocateFixed className="w-3.5 h-3.5 text-turquoise-300" />
                {geo.status === 'locating'
                  ? 'Locating…'
                  : geo.isUsingDeviceLocation
                  ? 'Reset to anchor'
                  : 'Use my location'}
              </button>
            </div>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-h1 text-white">
              Explore the <span className="italic text-turquoise-300">Eastern Corridor</span> &amp;
              Beyond
            </h1>
            <p className="text-sm sm:text-base text-navy-100 leading-relaxed max-w-2xl">
              Verified coastal sanctuaries, sacred temples and living heritage museums — every
              distance measured from {originLabel} at{' '}
              <strong className="font-semibold text-white">
                {origin[0].toFixed(4)}, {origin[1].toFixed(4)}
              </strong>
              .
            </p>
          </div>

          {geo.error && (
            <div
              role="status"
              className="inline-flex items-start gap-2 px-3.5 py-2.5 rounded-btn bg-navy-950/50 border border-white/15 text-[11px] text-navy-100 max-w-xl"
            >
              <AlertCircle className="w-3.5 h-3.5 text-turquoise-300 shrink-0 mt-0.5" />
              <span>{geo.error}</span>
            </div>
          )}

          {/* Scope tabs */}
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1"
            role="group"
            aria-label="Geographic scope"
          >
            {SCOPE_TABS.map((tab) => {
              const active = scopeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setScopeTab(tab.id)}
                  aria-pressed={active}
                  className={`shrink-0 inline-flex items-center gap-2 min-h-[40px] px-4 rounded-pill text-xs font-semibold border transition-all duration-200 ${
                    active
                      ? 'bg-turquoise-500 text-navy-950 border-transparent shadow-card'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.hint && (
                    <span
                      className={`px-1.5 py-0.5 rounded-pill text-[10px] ${
                        active ? 'bg-navy-950/25 text-navy-950' : 'bg-white/15 text-white'
                      }`}
                    >
                      {tab.hint}
                    </span>
                  )}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setScopeTab('eastern');
                setDistanceFilter('10');
                setSort('distance_asc');
              }}
              className="shrink-0 inline-flex items-center gap-2 min-h-[40px] px-4 rounded-pill text-xs font-semibold border border-sunset-300/70 bg-sunset-400 text-navy-950 shadow-card transition-colors hover:bg-sunset-300"
            >
              <Compass className="w-3.5 h-3.5" />
              Suitable places
            </button>
          </div>
        </div>
      </section>

      {/* ---------- Unified filter toolbar ---------- */}
      <div className="container-page pt-5">
        <div className="card p-3 sm:p-4 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search beaches, lagoons, temples or museums…"
                aria-label="Search destinations"
                className="field pl-10 pr-10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 grid place-items-center w-7 h-7 rounded-full text-navy-500 hover:text-navy-900 hover:bg-navy-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Desktop filters */}
              <div className="hidden lg:flex flex-wrap items-center gap-3">
                {CategorySelect}
                {DistanceSelect}
                {SortSelect}
                {ViewSwitcher}
              </div>

              {/* Mobile filter trigger */}
              <button
                type="button"
                onClick={() => setIsFiltersOpen(true)}
                className="lg:hidden btn-secondary btn-sm"
                aria-haspopup="dialog"
                aria-expanded={isFiltersOpen}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-ocean-500 text-white text-[10px] font-black">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-btn text-xs font-bold text-sunset-600 bg-sunset-50 hover:bg-sunset-100 border border-sunset-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Active filters + result count */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-navy-100">
            <span className="text-xs font-semibold text-navy-700 pt-1.5">
              {loading ? 'Loading…' : `${displayedPlaces.length} destinations`}
            </span>
            <span className="text-[11px] text-navy-500 pt-1.5">
              · measured from {originLabel}
            </span>

            {activeFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={f.clear}
                className="inline-flex items-center gap-1.5 pt-1.5 text-[11px] font-semibold text-ocean-700 bg-ocean-50 border border-ocean-100 px-2.5 py-1 rounded-pill hover:bg-ocean-100 transition-colors"
              >
                {f.label}
                <X className="w-3 h-3" />
                <span className="sr-only">Remove filter</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile / tablet cards ↔ map switch */}
        <div className="flex lg:hidden items-center justify-between mt-3 card p-2">
          <span className="text-xs font-bold text-navy-800 pl-2">
            {displayedPlaces.length} destinations
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMobileTab('cards')}
              aria-pressed={mobileTab === 'cards'}
              className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-btn text-xs font-bold transition-colors ${
                mobileTab === 'cards' ? 'bg-ocean-500 text-white shadow-card' : 'text-navy-600 hover:bg-navy-100'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('map')}
              aria-pressed={mobileTab === 'map'}
              className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-btn text-xs font-bold transition-colors ${
                mobileTab === 'map' ? 'bg-ocean-500 text-white shadow-card' : 'text-navy-600 hover:bg-navy-100'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Live Route Map
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Discovery canvas ---------- */}
      <div className="container-page py-6 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
            <div className="hidden lg:block lg:col-span-5 h-[min(75vh,760px)] rounded-card bg-navy-100 animate-pulse" />
          </div>
        ) : error ? (
          <div className="my-6 p-8 card max-w-2xl mx-auto text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h2 className="text-h4 text-navy-900">Failed to load the destination catalogue</h2>
            <p className="text-sm text-navy-500">{error}</p>
            <p className="text-xs text-navy-500">
              The Visitflow API is not reachable right now. Distances and routes appear once the
              catalogue loads.
            </p>
            <button type="button" onClick={handleResetFilters} className="btn-primary">
              <RotateCcw className="w-4 h-4" />
              Reset filters and retry
            </button>
          </div>
        ) : displayedPlaces.length === 0 ? (
          <div className="my-6 py-14 px-6 card max-w-xl mx-auto text-center space-y-3">
            <Compass className="w-12 h-12 text-navy-300 mx-auto" />
            <h2 className="text-h4 text-navy-900">No destinations match your criteria</h2>
            <p className="text-sm text-navy-500">
              Try a different keyword, widen the distance, or return to the Eastern Coast Corridor.
            </p>
            <button type="button" onClick={handleResetFilters} className="btn-primary">
              Back to the 10 Eastern stops
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-6 items-start ${
              desktopView === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
            }`}
          >
            {/* Cards column */}
            <div
              className={`${
                desktopView === 'split'
                  ? 'lg:col-span-7'
                  : desktopView === 'cards'
                  ? 'col-span-1'
                  : 'hidden'
              } ${mobileTab === 'map' ? 'hidden lg:block' : 'block'}`}
            >
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                {displayedPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    userLocation={origin}
                    isSelected={
                      selectedPlaceForMap?.id === place.id || hoveredPlace?.id === place.id
                    }
                    onHover={setHoveredPlace}
                    onSelectOnMap={handleSelectOnMap}
                  />
                ))}
              </div>

              {desktopView === 'cards' && (
                <p className="text-[11px] text-navy-500 mt-4 text-center">
                  Route map hidden in cards-only mode — switch to split view to see markers.
                </p>
              )}
            </div>

            {/* Sticky map column */}
            <div
              className={`${
                desktopView === 'split'
                  ? 'lg:col-span-5 lg:sticky lg:top-[92px]'
                  : desktopView === 'map'
                  ? 'col-span-1'
                  : 'hidden'
              } ${mobileTab === 'cards' ? 'hidden lg:block' : 'block'}`}
            >
              <div
                className={`rounded-card overflow-hidden border border-navy-200 shadow-card ${
                  desktopView === 'split'
                    ? 'h-[65vh] lg:h-[min(75vh,760px)]'
                    : 'h-[70vh] lg:h-[min(78vh,820px)]'
                }`}
              >
                <MapCanvas
                  places={displayedPlaces}
                  selectedPlace={selectedPlaceForMap || hoveredPlace}
                  onSelectPlace={(p) => setSelectedPlaceForMap(p)}
                  userLocation={origin}
                  showRoute={true}
                  height="100%"
                />
              </div>

              {/* Route summary under the sticky map */}
              <div className="hidden lg:flex items-center justify-between gap-3 mt-3 text-[11px] text-navy-500">
                <span className="inline-flex items-center gap-1.5">
                  <RouteIcon className="w-3.5 h-3.5 text-ocean-500" />
                  {selectedPlaceForMap
                    ? `Route line drawn to ${selectedPlaceForMap.name}`
                    : 'Select a destination to draw its route'}
                </span>
                <span className="text-navy-500">
                  Map data © OpenStreetMap · corridor bounds{' '}
                  {EASTERN_CORRIDOR_BOUNDS[0][0].toFixed(2)}–{EASTERN_CORRIDOR_BOUNDS[1][0].toFixed(2)}° N
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------- Mobile filter drawer ---------- */}
      {isFiltersOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter destinations"
          className="lg:hidden fixed inset-0 z-[70] flex items-end bg-navy-950/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsFiltersOpen(false)}
        >
          <div
            className="w-full max-h-[85vh] overflow-y-auto thin-scroll bg-white rounded-t-media shadow-card-hover"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-navy-100 px-5 py-4 flex items-center justify-between">
              <h2 className="text-h4">Filters</h2>
              <button
                type="button"
                onClick={() => setIsFiltersOpen(false)}
                aria-label="Close filters"
                className="grid place-items-center w-10 h-10 rounded-full text-navy-600 hover:bg-navy-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="space-y-1.5">
                <span className="field-label">Category</span>
                {CategorySelect}
              </div>
              <div className="space-y-1.5">
                <span className="field-label">Distance</span>
                {DistanceSelect}
              </div>
              <div className="space-y-1.5">
                <span className="field-label">Sort</span>
                {SortSelect}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-navy-100 p-4 flex gap-2.5">
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-secondary flex-1"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsFiltersOpen(false)}
                className="btn-primary flex-1"
              >
                Show {displayedPlaces.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
