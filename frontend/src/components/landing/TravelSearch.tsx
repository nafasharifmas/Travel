import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Users, MapPin, AlertCircle } from 'lucide-react';

interface TravelSearchProps {
  onSearchSubmit?: (query: {
    destination: string;
    dates: { start: string; end: string };
    travelers: number;
  }) => void;
}

/** Real Eastern Corridor stops (category tags only — no invented distances). */
const CURATED_SUGGESTIONS = [
  { name: 'Maruthamunai Beach', region: 'Kalmunai · Eastern Shore', tag: 'Coastal' },
  { name: 'Kalmunai Beach & Beach Mosque', region: 'Kalmunai · Eastern Shore', tag: 'Coastal' },
  { name: 'Kallady Beach', region: 'Batticaloa · Eastern Shore', tag: 'Coastal' },
  { name: 'Nintavur Beach & Coastal Park', region: 'Ampara · Eastern Shore', tag: 'Coastal' },
  { name: 'Deegawapi Raja Maha Vihara', region: 'Ampara · Eastern Province', tag: 'Heritage' },
  { name: 'Kattankudy Heritage Museum', region: 'Batticaloa · Eastern Province', tag: 'Heritage' },
];

export const TravelSearch: React.FC<TravelSearchProps> = ({ onSearchSubmit }) => {
  const navigate = useNavigate();

  const [destination, setDestination] = useState('');
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0]
  );
  const [travelers, setTravelers] = useState(2);
  const [isTravelerOpen, setIsTravelerOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const suggestRef = useRef<HTMLDivElement>(null);
  const travelerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setIsSuggestOpen(false);
      }
      if (travelerRef.current && !travelerRef.current.contains(e.target as Node)) {
        setIsTravelerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuggestions = CURATED_SUGGESTIONS.filter(
    (s) =>
      s.name.toLowerCase().includes(destination.toLowerCase()) ||
      s.region.toLowerCase().includes(destination.toLowerCase())
  );

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setValidationError(null);
    if (endDate && val > endDate) setEndDate(val);
  };

  const handleEndDateChange = (val: string) => {
    if (val < startDate) {
      setValidationError('Return date must be after the departure date.');
      return;
    }
    setValidationError(null);
    setEndDate(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setValidationError('Choose or type a destination to start exploring.');
      return;
    }
    if (endDate < startDate) {
      setValidationError('Please provide valid travel dates.');
      return;
    }

    setValidationError(null);
    onSearchSubmit?.({ destination, dates: { start: startDate, end: endDate }, travelers });

    const destEl = document.getElementById('destinations');
    if (destEl) {
      destEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/explore');
    }
  };

  return (
    <div id="travel-search" className="relative z-30 container-page -mt-10 sm:-mt-12">
      <div className="bg-white rounded-media p-4 sm:p-5 shadow-card-hover border border-navy-200">
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          {validationError && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3 rounded-btn bg-red-50 border border-red-200 text-red-700 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Destination */}
            <div ref={suggestRef} className="md:col-span-5 relative">
              <label htmlFor="search-destination" className="field-label">
                Where to
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ocean-500 pointer-events-none" />
                <input
                  id="search-destination"
                  type="text"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setIsSuggestOpen(true);
                    setValidationError(null);
                  }}
                  onFocus={() => setIsSuggestOpen(true)}
                  autoComplete="off"
                  placeholder="e.g. Maruthamunai, Kallady, Deegawapi…"
                  className="field pl-10 font-medium"
                />
              </div>

              {isSuggestOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-card shadow-card-hover border border-navy-200 py-1.5 z-50 max-h-64 overflow-y-auto thin-scroll">
                  <p className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-navy-500 border-b border-navy-100">
                    Eastern Corridor destinations
                  </p>
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          setDestination(item.name);
                          setIsSuggestOpen(false);
                          setValidationError(null);
                        }}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-ocean-50 transition-colors group"
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-navy-900 truncate group-hover:text-ocean-600">
                            {item.name}
                          </span>
                          <span className="block text-[11px] text-navy-500 truncate">{item.region}</span>
                        </span>
                        <span className="shrink-0 text-[10px] font-bold text-ocean-600 bg-ocean-50 px-2 py-0.5 rounded-pill">
                          {item.tag}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="p-4 text-center text-xs text-navy-500">
                      No matching destinations in the catalogue.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="md:col-span-4 grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="search-start" className="field-label flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-ocean-500" />
                  Departure
                </label>
                <input
                  id="search-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="field text-xs font-medium"
                />
              </div>
              <div>
                <label htmlFor="search-end" className="field-label flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-ocean-500" />
                  Return
                </label>
                <input
                  id="search-end"
                  type="date"
                  min={startDate}
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="field text-xs font-medium"
                />
              </div>
            </div>

            {/* Travelers + submit */}
            <div className="md:col-span-3 flex items-end gap-2.5">
              <div ref={travelerRef} className="relative flex-1">
                <span className="field-label">Travelers</span>
                <button
                  type="button"
                  onClick={() => setIsTravelerOpen((v) => !v)}
                  aria-haspopup="dialog"
                  aria-expanded={isTravelerOpen}
                  className="field flex items-center justify-between gap-2 text-left"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users className="w-4 h-4 text-ocean-500" />
                    {travelers} {travelers === 1 ? 'traveler' : 'travelers'}
                  </span>
                  <span className="text-navy-500 text-xs">{isTravelerOpen ? '▲' : '▼'}</span>
                </button>

                {isTravelerOpen && (
                  <div
                    role="dialog"
                    aria-label="Traveler count"
                    className="absolute bottom-full mb-2 left-0 w-60 bg-white rounded-card shadow-card-hover border border-navy-200 p-4 z-50"
                  >
                    <p className="text-sm font-semibold text-navy-900">Travelers</p>
                    <p className="text-[11px] text-navy-500 mb-3">Ages 12 and above</p>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        aria-label="Remove a traveler"
                        disabled={travelers <= 1}
                        onClick={() => setTravelers((p) => Math.max(1, p - 1))}
                        className="grid place-items-center w-10 h-10 rounded-full border border-navy-200 text-navy-700 font-bold hover:bg-navy-50 disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="text-lg font-bold text-navy-900">{travelers}</span>
                      <button
                        type="button"
                        aria-label="Add a traveler"
                        disabled={travelers >= 12}
                        onClick={() => setTravelers((p) => Math.min(12, p + 1))}
                        className="grid place-items-center w-10 h-10 rounded-full border border-navy-200 text-navy-700 font-bold hover:bg-navy-50 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" aria-label="Search journeys" className="btn-primary px-5 shrink-0 h-11 min-h-[44px]">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
