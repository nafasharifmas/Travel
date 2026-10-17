import React, { useState, useEffect } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { Category } from '../../types';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categorySlug: string | null) => void;
  resultsCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  categories,
  selectedCategory,
  onSelectCategory,
  resultsCount,
}) => {
  const [localSearch, setLocalSearch] = useState(value);

  // Debounced input handler (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localSearch);
    }, 250);

    return () => clearTimeout(timer);
  }, [localSearch, onChange]);

  useEffect(() => {
    setLocalSearch(value);
  }, [value]);

  return (
    <div className="w-full space-y-4">
      {/* Primary search bar */}
      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-stone-400">
          <Search className="w-5 h-5 text-amber-600" />
        </div>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search destinations, landmarks, ancient citadels or nature reserves..."
          aria-label="Search destinations by name or description"
          className="w-full pl-12 pr-12 py-3.5 bg-white border border-sand-300 rounded-2xl shadow-sm text-sm text-espresso-950 placeholder-stone-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500 transition-all font-medium"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => setLocalSearch('')}
            aria-label="Clear search"
            className="absolute right-4 p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-sand-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills Rail */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            selectedCategory === null
              ? 'bg-espresso-950 text-white shadow-sm'
              : 'bg-sand-100 text-stone-600 hover:bg-sand-200 border border-sand-200'
          }`}
        >
          All Places ({resultsCount})
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(isSelected ? null : cat.slug)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                isSelected
                  ? 'bg-amber-500 text-espresso-950 border-amber-500 shadow-sm font-bold'
                  : 'bg-white text-stone-700 hover:bg-sand-50 border-sand-200'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cat.color || '#f59e0b' }}
              />
              {cat.name}
              {cat.places_count !== undefined && (
                <span className="opacity-60 text-[10px]">({cat.places_count})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

