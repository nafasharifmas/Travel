import React from 'react';
import { Menu, Plus } from 'lucide-react';
import type { AdminTab } from './AdminSidebar';

interface AdminTopbarProps {
  activeTab: AdminTab;
  user?: { name: string; email: string } | null;
  onOpenMobileMenu: () => void;
  onAddPlace: () => void;
}

const VIEW_META: Record<AdminTab, { title: string; subtitle: string; cta?: string }> = {
  overview: {
    title: 'Overview',
    subtitle: 'Catalogue health and recent activity',
  },
  places: {
    title: 'Places',
    subtitle: 'Manage catalogue entries and media',
    cta: 'New place',
  },
  categories: {
    title: 'Categories',
    subtitle: 'Taxonomy for discovery filters',
  },
  users: {
    title: 'Users',
    subtitle: 'Accounts and permissions',
  },
  itineraries: {
    title: 'Itineraries',
    subtitle: 'Saved trips across users',
  },
  'data-quality': {
    title: 'Data quality',
    subtitle: 'Issues and consistency checks',
  },
  audit: {
    title: 'Audit trail',
    subtitle: 'Administrative activity log',
  },
  'system-health': {
    title: 'System health',
    subtitle: 'Service and storage status',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Platform configuration',
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-sand-200">
      <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation"
          className="lg:hidden p-1.5 -ml-1 rounded-md text-stone-600 hover:bg-sand-50 hover:text-charcoal-950 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="text-base font-semibold text-charcoal-950 leading-tight truncate">{meta.title}</h1>
          <p className="hidden sm:block text-xs text-stone-500 truncate">{meta.subtitle}</p>
        </div>

        {activeTab === 'places' && (
          <button
            type="button"
            onClick={onAddPlace}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-950 hover:bg-charcoal-900 text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{meta.cta || 'New place'}</span>
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-sand-200">
          <div className="w-7 h-7 rounded-full bg-sand-100 text-charcoal-950 text-xs font-medium flex items-center justify-center">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="hidden xl:block leading-tight">
            <p className="text-xs font-medium text-charcoal-950 truncate max-w-[140px]">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-[11px] text-stone-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
