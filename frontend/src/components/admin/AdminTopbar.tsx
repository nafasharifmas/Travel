import React from 'react';
import { Menu, Plus, Search, Bell, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { AdminTab } from './AdminSidebar';
import { Button } from '@/components/ui/button';

interface AdminTopbarProps {
  activeTab: AdminTab;
  user?: { name: string; email: string } | null;
  onOpenMobileMenu: () => void;
  onAddPlace: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const VIEW_META: Record<AdminTab, { title: string; subtitle: string; cta?: string }> = {
  overview: {
    title: 'Dashboard Overview',
    subtitle: 'Real-time insights into your tourism platform',
  },
  places: {
    title: 'Places Management',
    subtitle: 'Manage catalogue entries, locations and media',
    cta: 'Add New Place',
  },
  categories: {
    title: 'Categories',
    subtitle: 'Organize destinations by themes and interests',
  },
  users: {
    title: 'User Management',
    subtitle: 'Manage accounts, roles and permissions',
  },
  itineraries: {
    title: 'Itineraries',
    subtitle: 'View and monitor user travel plans',
  },
  'data-quality': {
    title: 'Data Quality',
    subtitle: 'Monitor data integrity and validation',
  },
  audit: {
    title: 'Audit Trail',
    subtitle: 'Track all administrative activities',
  },
  'system-health': {
    title: 'System Health',
    subtitle: 'Monitor services and performance',
  },
  settings: {
    title: 'Platform Settings',
    subtitle: 'Configure your tourism platform',
  },
};

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  activeTab,
  user,
  onOpenMobileMenu,
  onAddPlace,
  isSidebarCollapsed = false,
  onToggleCollapse,
}) => {
  const meta = VIEW_META[activeTab];

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation"
          className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop sidebar collapse/expand toggle */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-cyan-600" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold text-slate-900 leading-tight truncate">{meta.title}</h1>
          <p className="hidden sm:block text-xs text-slate-500 truncate mt-0.5">{meta.subtitle}</p>
        </div>

        <div className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="search"
            placeholder="Search..."
            className="pl-9 pr-4 py-1.5 w-64 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
          />
        </div>

        <button
          type="button"
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>
        </button>

        {activeTab === 'places' && (
          <Button
            onClick={onAddPlace}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{meta.cta || 'Add New Place'}</span>
          </Button>
        )}

        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 text-white text-sm font-semibold flex items-center justify-center shadow-md">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="hidden xl:block leading-tight">
            <p className="text-sm font-medium text-slate-900 truncate max-w-[140px]">
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
