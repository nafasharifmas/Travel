import React from 'react';
import { Menu, Plus } from 'lucide-react';
import type { AdminTab } from './AdminSidebar';
import { Button } from '@/components/ui/button';

interface AdminTopbarProps {
  activeTab: AdminTab;
  user?: { name: string; email: string } | null;
  onOpenMobileMenu: () => void;
  onAddPlace: () => void;
}

const VIEW_META: Record<AdminTab, { title: string; subtitle: string; cta?: string }> = {
  overview: {
    title: 'Operations overview',
    subtitle: 'Current catalogue, quality, and activity status',
  },
  places: {
    title: 'Places management',
    subtitle: 'Manage catalogue entries, locations and media',
    cta: 'Add New Place',
  },
  categories: {
    title: 'Categories',
    subtitle: 'Organize destinations by themes and interests',
  },
  users: {
    title: 'User management',
    subtitle: 'Manage accounts, roles and permissions',
  },
  itineraries: {
    title: 'Itineraries',
    subtitle: 'View and monitor user travel plans',
  },
  'data-quality': {
    title: 'Data quality',
    subtitle: 'Monitor data integrity and validation',
  },
  audit: {
    title: 'Audit trail',
    subtitle: 'Track all administrative activities',
  },
  'system-health': {
    title: 'System health',
    subtitle: 'Monitor services and performance',
  },
  settings: {
    title: 'Platform settings',
    subtitle: 'Configure your tourism platform',
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
    <header className="sticky top-0 z-30 border-b border-[#d7e5e1] bg-[#fffefa]/95 shadow-[0_1px_0_rgba(8,32,51,0.03)] backdrop-blur">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation"
          className="lg:hidden p-2 -ml-1 rounded-lg text-[#163a56] hover:bg-cyan-50 hover:text-[#082033] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 flex-1 border-l border-cyan-500 pl-3">
          <p className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-700">VisitFlow operations</p>
          <h1 className="text-lg font-semibold text-[#082033] leading-tight truncate">{meta.title}</h1>
          <p className="hidden md:block text-xs text-slate-500 truncate mt-0.5">{meta.subtitle}</p>
        </div>

        {activeTab === 'places' && (
          <Button
            onClick={onAddPlace}
            aria-label="Add new place"
            className="bg-[#0f766e] text-white shadow-sm hover:bg-[#0b625c] focus-visible:ring-cyan-600"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{meta.cta || 'Add New Place'}</span>
          </Button>
        )}

        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-[#d7e5e1]">
          <div className="w-9 h-9 rounded-full bg-[#163a56] text-white text-sm font-semibold flex items-center justify-center shadow-sm">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="hidden xl:block leading-tight">
            <p className="text-sm font-medium text-[#082033] truncate max-w-[140px]">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
