import React from 'react';
import { Category } from '../../types';
import { SlidersHorizontal, ArrowUpDown, RotateCcw } from 'lucide-react';

interface FilterRailProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  onReset: () => void;
  activeCount: number;
}

export const FilterRail: React.FC<FilterRailProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sort,
  onSortChange,
  onReset,
  activeCount,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-sand-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
      {/* Category selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600 uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-amber-600" />
          Filter:
        </div>

        <select
          value={selectedCategory || ''}
          onChange={(e) => onSelectCategory(e.target.value ? e.target.value : null)}
          aria-label="Filter by Category"
          className="px-3 py-1.5 text-xs font-semibold bg-sand-50 border border-sand-300 rounded-xl text-stone-800 focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name} {c.places_count !== undefined ? `(${c.places_count})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Sorting & Reset */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600 uppercase tracking-wider">
          <ArrowUpDown className="w-3.5 h-3.5 text-amber-600" />
          Sort:
        </div>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort Places"
          className="px-3 py-1.5 text-xs font-semibold bg-sand-50 border border-sand-300 rounded-xl text-stone-800 focus:ring-2 focus:ring-amber-500"
        >
          <option value="default">Curated Order</option>
          <option value="name_asc">Name (A – Z)</option>
          <option value="name_desc">Name (Z – A)</option>
          <option value="latest">Recently Added</option>
        </select>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors font-semibold"
          >
            <RotateCcw className="w-3 h-3" />
            Reset ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
};

