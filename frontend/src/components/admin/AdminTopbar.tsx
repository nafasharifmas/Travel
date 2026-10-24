import React from 'react';
import { Menu, Plus, ShieldCheck } from 'lucide-react';
import type { AdminTab } from './AdminSidebar';

interface AdminTopbarProps {
  activeTab: AdminTab;
  user?: { name: string; email: string } | null;
  onOpenMobileMenu: () => void;
  onAddPlace: () => void;
}

const VIEW_META: Record<
  AdminTab,
  { title: string; subtitle: string; cta?: string }
> = {
  overview: {
    title: 'Dashboard Overview',
    subtitle: 'Catalogue health, compliance and recent administrative activity.',
  },
  places: {
    title: 'Places Catalogue',
    subtitle: 'Create, edit, archive and attach validated media to destinations.',
    cta: 'Add Place',
  },
  categories: {
    title: 'Category Taxonomy',
    subtitle: 'Discovery taxonomy powering public place filters.',
  },
  users: {
    title: 'User Accounts',
    subtitle: 'Profiles, role assignments and account status.',
  },
  itineraries: {
    title: 'Itinerary Administration',
    subtitle: 'Monitor saved itineraries across registered users.',
  },
  'data-quality': {
    title: 'Data Quality Center',
    subtitle: 'Identify missing fields, broken media, and data issues.',
  },
  audit: {
    title: 'Audit Trail',
    subtitle: 'Append-only history of every administrative mutation.',
  },
  'system-health': {
    title: 'System Health',
    subtitle: 'API, database, storage and operational status.',
  },
};

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  activeTab,
  user,
  onOpenMobileMenu,
  onAddPlace,
}) => {
  const meta = VIEW_META[activeTab];

  return (
    <header className="sticky top-0 z-30 bg-ivory-100/90 backdrop-blur border-b border-sand-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        {/* Mobile nav toggle */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation"
          className="lg:hidden p-2 -ml-2 rounded-xl text-stone-600 hover:bg-sand-200/70 hover:text-charcoal-950 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page title */}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-serif font-bold text-charcoal-950 leading-tight truncate">
            {meta.title}
          </h1>
          <p className="hidden sm:block text-[11px] text-stone-500 truncate">
            {meta.subtitle}
          </p>
        </div>

        {/* Session chip */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wide">
            Policy-scoped
          </span>
        </div>

        {/* Primary action */}
        <button
          type="button"
          onClick={onAddPlace}
          className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-charcoal-950 hover:bg-charcoal-800 text-ivory-50 text-xs font-bold tracking-wide transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span className="hidden sm:inline">{meta.cta || 'Add Place'}</span>
        </button>

        {/* Acting admin */}
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-sand-200">
          <div className="w-8 h-8 rounded-full bg-gold-500 text-charcoal-950 font-bold text-xs flex items-center justify-center">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="hidden xl:block leading-tight">
            <p className="text-xs font-bold text-charcoal-950 truncate max-w-[140px]">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-[10px] text-stone-500">Acting administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
