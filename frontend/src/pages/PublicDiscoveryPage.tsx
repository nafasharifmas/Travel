import React, { useState, useEffect, useMemo } from 'react';
import { Place, Category } from '../types';
import { api } from '../services/api';
import { PlaceCard } from '../components/discovery/PlaceCard';
import { MapCanvas } from '../components/discovery/MapCanvas';
import {
  DEFAULT_USER_LOCATION,
  calculateDistanceKm,
  EASTERN_PROVINCE_ORDER,
} from '../utils/geo';
import {
  Compass,
  Sparkles,
  Map,
  List,
  AlertCircle,
  Loader2,
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
} from 'lucide-react';

export const PublicDiscoveryPage: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort, setSort] = useState('distance_asc'); // Default: closest to user location!
  const [selectedPlaceForMap, setSelectedPlaceForMap] = useState<Place | null>(null);
  const [hoveredPlace, setHoveredPlace] = useState<Place | null>(null);

  // Scope Tab: 'eastern' (the 10 core destinations within 25 km), 'all' (all 23), 'heritage', 'coastal'
  const [scopeTab, setScopeTab] = useState<'eastern' | 'all' | 'heritage' | 'coastal'>('eastern');

  // Desktop view mode: 'split' | 'cards' | 'map'
  const [desktopView, setDesktopView] = useState<'split' | 'cards' | 'map'>('split');

  // Mobile layout switcher: 'cards' | 'map'
  const [mobileTab, setMobileTab] = useState<'cards' | 'map'>('cards');

  // Load initial categories
  useEffect(() => {
    api
      .getCategories()
      .then((res) => setCategories(res.categories))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Fetch places
  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .getPlaces({
        search: search || undefined,
        category: selectedCategory || undefined,
      })
      .then((res) => {
        let fetched = res.places;
        setPlaces(fetched);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch places catalogue.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search, selectedCategory]);

  // Filter and sort places in memory based on scopeTab and sort options
  const displayedPlaces = useMemo(() => {
    let list = [...places];

    // Filter by Scope Tab
    if (scopeTab === 'eastern') {
      // The 10 Eastern Province places within 25 km of 7.439374, 81.817172
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

    // Sort places
    if (sort === 'distance_asc') {
      list.sort((a, b) => {
        const dA = calculateDistanceKm(
          DEFAULT_USER_LOCATION[0],
          DEFAULT_USER_LOCATION[1],
          a.lat,
          a.lng
        );
        const dB = calculateDistanceKm(
          DEFAULT_USER_LOCATION[0],
          DEFAULT_USER_LOCATION[1],
          b.lat,
          b.lng
        );
        return dA - dB;
      });
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
  }, [places, scopeTab, sort]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    setSort('distance_asc');
    setScopeTab('eastern');
    setSelectedPlaceForMap(null);
  };

  const activeFiltersCount =
    (search ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (sort !== 'distance_asc' ? 1 : 0) +
    (scopeTab !== 'eastern' ? 1 : 0);

  return (
    <div className="min-h-screen bg-ivory-100 pt-20">
      {/* Editorial Header Section */}
      <section className="bg-charcoal-950 text-white border-b border-sand-400/15 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-5">
          {/* Eyebrow and Origin Telemetry Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Spatial Trajectory & Route Discovery
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/80 border border-sky-400/40 text-sky-200 text-xs font-bold shadow-sm">
              <LocateFixed className="w-4 h-4 text-sky-400" />
              <span>
                Anchor: <strong>7.439374, 81.817172</strong> (Maruthamunai / Kalmunai)
              </span>
            </div>
          </div>

          <div className="max-w-3xl space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ivory-50 tracking-tight leading-[1.15]">
              Explore the <span className="text-gold-400">Eastern Corridor</span> & Beyond
            </h1>
            <p className="text-sand-300 text-xs sm:text-sm leading-relaxed font-sans max-w-2xl">
              Immerse yourself in verified coastal sanctuaries, sacred temples, and historic trade museums. All spatial trajectories and travel times are measured continuously from your coordinates at <strong>7.439374, 81.817172</strong>.
            </p>
          </div>

          {/* Curated Scope Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setScopeTab('eastern')}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                scopeTab === 'eastern'
                  ? 'bg-gold-500 text-charcoal-950 shadow-md font-black'
                  : 'bg-charcoal-900 text-sand-300 hover:bg-charcoal-850 hover:text-white border border-sand-400/15'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-sky-400" />
              Eastern Coast Corridor (&lt;25 km)
              <span className="px-1.5 py-0.5 rounded-md bg-charcoal-950/40 text-[10px]">
                10 Stops
              </span>
            </button>

            <button
              type="button"
              onClick={() => setScopeTab('all')}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                scopeTab === 'all'
                  ? 'bg-gold-500 text-charcoal-950 shadow-md font-black'
                  : 'bg-charcoal-900 text-sand-300 hover:bg-charcoal-850 hover:text-white border border-sand-400/15'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              All Sri Lanka
              <span className="px-1.5 py-0.5 rounded-md bg-charcoal-950/40 text-[10px]">
                23 Places
              </span>
            </button>

            <button
              type="button"
              onClick={() => setScopeTab('coastal')}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                scopeTab === 'coastal'
                  ? 'bg-gold-500 text-charcoal-950 shadow-md font-black'
                  : 'bg-charcoal-900 text-sand-300 hover:bg-charcoal-850 hover:text-white border border-sand-400/15'
              }`}
            >
              🌊 Coastal & Marine
            </button>

            <button
              type="button"
              onClick={() => setScopeTab('heritage')}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                scopeTab === 'heritage'
                  ? 'bg-gold-500 text-charcoal-950 shadow-md font-black'
                  : 'bg-charcoal-900 text-sand-300 hover:bg-charcoal-850 hover:text-white border border-sand-400/15'
              }`}
            >
              🏛️ Sacred & Cultural
            </button>
          </div>
        </div>
      </section>

      {/* Control Surface: Search, Categories & View Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="bg-white rounded-2xl p-4 border border-sand-200/90 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-sand-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations, beaches, lagoons, temples or museums..."
              className="w-full pl-10 pr-9 py-2.5 bg-sand-50/80 border border-sand-200 rounded-xl text-xs sm:text-sm text-charcoal-950 placeholder-sand-500 focus:bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-sand-500 hover:text-charcoal-950"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown & Proximity Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-charcoal-700 font-semibold">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gold-600" />
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="px-3 py-2 bg-sand-50 border border-sand-200 rounded-xl text-xs font-semibold text-charcoal-900 focus:ring-1 focus:ring-gold-500"
              >
                <option value="">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name} {c.places_count !== undefined ? `(${c.places_count})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-charcoal-700 font-semibold">
              <ArrowUpDown className="w-3.5 h-3.5 text-gold-600" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2 bg-sand-50 border border-sand-200 rounded-xl text-xs font-semibold text-charcoal-900 focus:ring-1 focus:ring-gold-500"
              >
                <option value="distance_asc">Proximity (Nearest to 7.4394, 81.8172)</option>
                <option value="stop_order">Corridor Sequence (#1 to #10)</option>
                <option value="name_asc">Name (A – Z)</option>
              </select>
            </div>

            {/* Desktop View Switcher */}
            <div className="hidden lg:flex items-center gap-1 bg-sand-100 p-1 rounded-xl border border-sand-200">
              <button
                type="button"
                onClick={() => setDesktopView('split')}
                title="Split screen (Cards & Map)"
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  desktopView === 'split'
                    ? 'bg-white text-charcoal-950 shadow-sm'
                    : 'text-charcoal-700 hover:text-charcoal-950'
                }`}
              >
                <Columns2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDesktopView('cards')}
                title="Cards grid only"
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  desktopView === 'cards'
                    ? 'bg-white text-charcoal-950 shadow-sm'
                    : 'text-charcoal-700 hover:text-charcoal-950'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDesktopView('map')}
                title="Interactive map only"
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  desktopView === 'map'
                    ? 'bg-white text-charcoal-950 shadow-sm'
                    : 'text-charcoal-700 hover:text-charcoal-950'
                }`}
              >
                <Map className="w-4 h-4" />
              </button>
            </div>

            {/* Reset Filters Button */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden items-center justify-between mt-3 bg-white p-2 rounded-xl border border-sand-200 shadow-sm">
          <span className="text-xs font-bold text-charcoal-800 pl-2">
            {displayedPlaces.length} Destinations
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMobileTab('cards')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                mobileTab === 'cards'
                  ? 'bg-gold-500 text-charcoal-950 shadow-sm'
                  : 'text-charcoal-700 hover:bg-sand-100'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('map')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                mobileTab === 'map'
                  ? 'bg-gold-500 text-charcoal-950 shadow-sm'
                  : 'text-charcoal-700 hover:bg-sand-100'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              Live Route Map
            </button>
          </div>
        </div>
      </div>

      {/* Main Discovery Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center text-charcoal-600">
            <Loader2 className="w-9 h-9 text-gold-500 animate-spin mb-3" />
            <p className="text-sm font-serif font-bold text-charcoal-900">
              Measuring spatial coordinates and routes...
            </p>
            <p className="text-xs text-sand-500 mt-1">
              Calculating distances from 7.439374, 81.817172
            </p>
          </div>
        ) : error ? (
          <div className="my-10 p-8 bg-red-50 border border-red-200 rounded-3xl text-center text-red-900 max-w-2xl mx-auto space-y-3">
            <AlertCircle className="w-9 h-9 text-red-600 mx-auto" />
            <h3 className="text-base font-bold">Failed to load destination catalogue</h3>
            <p className="text-xs text-red-700">{error}</p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : displayedPlaces.length === 0 ? (
          <div className="my-12 py-16 text-center bg-white rounded-3xl border border-sand-200 p-8 max-w-xl mx-auto shadow-sm space-y-3">
            <Compass className="w-12 h-12 text-sand-400 mx-auto" />
            <h3 className="text-lg font-serif font-bold text-charcoal-950">
              No destinations match your criteria
            </h3>
            <p className="text-xs text-charcoal-600 max-w-sm mx-auto">
              Try adjusting your search keywords, broadening your category selection, or switching back to the Eastern Coast Corridor.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 px-5 py-2.5 bg-gold-500 text-charcoal-950 rounded-xl text-xs font-bold shadow-md hover:bg-gold-400"
            >
              View 10 Eastern Coast Stops
            </button>
          </div>
        ) : (
          /* View Mode Render: Split, Cards Only, or Map Only */
          <div
            className={`grid gap-6 items-start ${
              desktopView === 'split'
                ? 'grid-cols-1 lg:grid-cols-12'
                : 'grid-cols-1'
            }`}
          >
            {/* Left Cards Feed Column */}
            <div
              className={`space-y-4 ${
                desktopView === 'split'
                  ? 'lg:col-span-7'
                  : desktopView === 'cards'
                  ? 'col-span-1'
                  : 'hidden'
              } ${mobileTab === 'map' ? 'hidden lg:block' : 'block'}`}
            >
              {/* Counter and proximity indicator */}
              <div className="flex items-center justify-between text-xs text-charcoal-600 font-medium px-1">
                <span>
                  Showing <strong>{displayedPlaces.length}</strong> destinations · Measured from{' '}
                  <span className="font-semibold text-charcoal-900">7.4394, 81.8172</span>
                </span>

                {scopeTab === 'eastern' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Navigation className="w-3 h-3 text-amber-600" />
                    Eastern Province Strip
                  </span>
                )}
              </div>

              {/* Cards Grid */}
              <div
                className={`grid gap-5 ${
                  desktopView === 'cards'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1 sm:grid-cols-2'
                }`}
              >
                {displayedPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    isSelected={
                      selectedPlaceForMap?.id === place.id ||
                      hoveredPlace?.id === place.id
                    }
                    onHover={setHoveredPlace}
                    onSelectOnMap={(p) => {
                      setSelectedPlaceForMap(p);
                      if (window.innerWidth < 1024) {
                        setMobileTab('map');
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Right Sticky Map Canvas Column */}
            <div
              className={`${
                desktopView === 'split'
                  ? 'lg:col-span-5 lg:sticky lg:top-24 h-[480px] lg:h-[calc(100vh-120px)]'
                  : desktopView === 'map'
                  ? 'col-span-1 h-[78vh]'
                  : 'hidden'
              } ${mobileTab === 'cards' ? 'hidden lg:block' : 'block'}`}
            >
              <MapCanvas
                places={displayedPlaces}
                selectedPlace={selectedPlaceForMap || hoveredPlace}
                onSelectPlace={(p) => setSelectedPlaceForMap(p)}
                userLocation={DEFAULT_USER_LOCATION}
                showRoute={true}
                height="100%"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
