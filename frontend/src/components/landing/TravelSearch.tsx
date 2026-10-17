import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Check,
} from 'lucide-react';

interface TravelSearchProps {
  onSearchSubmit?: (query: {
    destination: string;
    dates: { start: string; end: string };
    travelers: number;
  }) => void;
}

const CURATED_SUGGESTIONS = [
  { name: 'Maruthamunai Beach', region: 'Eastern Shore, Sri Lanka', tag: 'Near You (0.5 km)' },
  { name: 'Kalmunai Beach & Mosque', region: 'Eastern Shore, Sri Lanka', tag: 'Near You (3.8 km)' },
  { name: 'Koddaikallar Lagoon', region: 'Eastern Shore, Sri Lanka', tag: 'Near You (5.5 km)' },
  { name: 'Dolomites', region: 'South Tyrol, Italy', tag: 'Alpine Sanctuary' },
  { name: 'Kyoto', region: 'Kansai, Japan', tag: 'Cultural Immersion' },
  { name: 'Sigiriya Rock Citadel', region: 'Cultural Triangle, Sri Lanka', tag: 'Ancient Wonder' },
  { name: 'Patagonia', region: 'Magallanes, Chile', tag: 'Wild Frontier' },
  { name: 'Bali (Ubud & Sidemen)', region: 'Indonesia', tag: 'Slow Living' },
];

export const TravelSearch: React.FC<TravelSearchProps> = ({ onSearchSubmit }) => {
  const navigate = useNavigate();

  // Search state
  const [destination, setDestination] = useState('');
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0]
  );
  const [travelers, setTravelers] = useState(2);
  const [isTravelerPopoverOpen, setIsTravelerPopoverOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const suggestRef = useRef<HTMLDivElement>(null);
  const travelerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setIsSuggestOpen(false);
      }
      if (travelerRef.current && !travelerRef.current.contains(e.target as Node)) {
        setIsTravelerPopoverOpen(false);
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
    if (endDate && val > endDate) {
      setEndDate(val);
    }
  };

  const handleEndDateChange = (val: string) => {
    if (val < startDate) {
      setValidationError('Return date must be after departure date.');
      return;
    }
    setValidationError(null);
    setEndDate(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setValidationError('Please select or enter a destination to explore.');
      return;
    }
    if (endDate < startDate) {
      setValidationError('Please provide valid journey travel dates.');
      return;
    }

    setValidationError(null);

    if (onSearchSubmit) {
      onSearchSubmit({
        destination,
        dates: { start: startDate, end: endDate },
        travelers,
      });
    }

    // Scroll smoothly to destinations section or navigate to explore
    const destEl = document.getElementById('destinations');
    if (destEl) {
      destEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/explore');
    }
  };

  return (
    <div
      id="travel-search"
      className="relative z-30 max-w-5xl mx-auto -mt-10 sm:-mt-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-sand-300 text-charcoal-950 transition-all hover:shadow-gold-500/5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 4-Field Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Field 1: Destination Autocomplete (5 cols) */}
            <div ref={suggestRef} className="md:col-span-5 relative">
              <label className="block text-[10px] font-bold text-sand-500 uppercase tracking-widest mb-1">
                Where to
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gold-600" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setIsSuggestOpen(true);
                    setValidationError(null);
                  }}
                  onFocus={() => setIsSuggestOpen(true)}
                  placeholder="e.g. Dolomites, Kyoto, Maruthamunai..."
                  aria-label="Destination"
                  className="w-full pl-10 pr-4 py-3 bg-sand-50/70 border border-sand-200 rounded-2xl text-xs sm:text-sm font-semibold text-charcoal-950 placeholder-stone-400 focus:bg-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500 transition-all"
                />
              </div>

              {/* Suggestions Dropdown */}
              {isSuggestOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-sand-200 py-2 z-50 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-sand-500 uppercase tracking-wider border-b border-sand-100">
                    Curated Destinations
                  </div>
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setDestination(item.name);
                          setIsSuggestOpen(false);
                          setValidationError(null);
                        }}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-sand-50 flex items-center justify-between text-xs transition-colors group"
                      >
                        <div>
                          <p className="font-bold text-charcoal-950 group-hover:text-gold-600">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-stone-500">{item.region}</p>
                        </div>
                        <span className="text-[10px] font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded-full">
                          {item.tag}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-stone-500">
                      No matching destinations found in catalogue.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Field 2: Dates (4 cols) */}
            <div className="md:col-span-4 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-sand-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gold-600" />
                  Departure
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-2.5 py-3 bg-sand-50/70 border border-sand-200 rounded-2xl text-xs font-semibold text-charcoal-950 focus:bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-sand-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gold-600" />
                  Return
                </label>
                <input
                  type="date"
                  min={startDate}
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full px-2.5 py-3 bg-sand-50/70 border border-sand-200 rounded-2xl text-xs font-semibold text-charcoal-950 focus:bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                />
              </div>
            </div>

            {/* Field 3: Travelers Counter & Search Action (3 cols) */}
            <div className="md:col-span-3 flex items-center gap-2 pt-1 md:pt-0">
              {/* Travelers Popover Trigger */}
              <div ref={travelerRef} className="relative flex-1">
                <label className="block text-[10px] font-bold text-sand-500 uppercase tracking-widest mb-1">
                  Travelers
                </label>
                <button
                  type="button"
                  onClick={() => setIsTravelerPopoverOpen(!isTravelerPopoverOpen)}
                  className="w-full px-3 py-3 bg-sand-50/70 border border-sand-200 rounded-2xl text-xs font-bold text-charcoal-950 flex items-center justify-between hover:bg-white transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gold-600" />
                    {travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}
                  </span>
                </button>

                {isTravelerPopoverOpen && (
                  <div className="absolute top-full left-0 w-56 mt-2 bg-white rounded-2xl shadow-xl border border-sand-200 p-4 z-50 animate-in fade-in">
                    <p className="text-xs font-bold text-charcoal-950 mb-1">
                      Adult Explorers
                    </p>
                    <p className="text-[11px] text-stone-500 mb-3">
                      Ages 12 and above
                    </p>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        disabled={travelers <= 1}
                        onClick={() => setTravelers((prev) => Math.max(1, prev - 1))}
                        className="w-8 h-8 rounded-full border border-sand-300 flex items-center justify-center font-bold text-stone-700 hover:bg-sand-100 disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-charcoal-950">
                        {travelers}
                      </span>
                      <button
                        type="button"
                        disabled={travelers >= 12}
                        onClick={() => setTravelers((prev) => Math.min(12, prev + 1))}
                        className="w-8 h-8 rounded-full border border-sand-300 flex items-center justify-center font-bold text-stone-700 hover:bg-sand-100 disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 md:pt-4">
                <button
                  type="submit"
                  aria-label="Search curated journeys"
                  className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-gold-500 hover:bg-gold-400 text-charcoal-950 flex items-center justify-center shadow-lg shadow-gold-500/25 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <Search className="w-5 h-5 font-bold" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

