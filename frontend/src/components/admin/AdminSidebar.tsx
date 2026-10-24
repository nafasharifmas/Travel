import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  FolderTree,
  Users,
  History,
  LogOut,
  ExternalLink,
  X,
  CalendarDays,
  Activity,
  FileCheck,
  Settings,
} from 'lucide-react';

export type AdminTab = 'overview' | 'places' | 'categories' | 'users' | 'itineraries' | 'data-quality' | 'audit' | 'system-health' | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelect: (tab: AdminTab) => void;
  counts: { places: number; categories: number; users: number };
  user?: { name: string; email: string } | null;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

interface NavItem {
  key: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

const NAV_SECTIONS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Overview',
    items: [
      { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'audit', label: 'Audit trail', icon: History },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { key: 'places', label: 'Places', icon: MapPin },
      { key: 'categories', label: 'Categories', icon: FolderTree },
    ],
  },
  {
    label: 'People',
    items: [
      { key: 'users', label: 'Users', icon: Users },
      { key: 'itineraries', label: 'Itineraries', icon: CalendarDays },
    ],
  },
  {
    label: 'Operations',
    items: [
      { key: 'data-quality', label: 'Data quality', icon: FileCheck },
      { key: 'system-health', label: 'System health', icon: Activity },
    ],
  },
  {
    label: 'System',
    items: [
      { key: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelect,
  counts,
  user,
  mobileOpen,
  onCloseMobile,
  onLogout,
}) => {
  const countFor = (tab: AdminTab) => {
    if (tab === 'places') return counts.places;
    if (tab === 'categories') return counts.categories;
    if (tab === 'users') return counts.users;
    return undefined;
  };

  const handleSelect = (tab: AdminTab) => {
    onSelect(tab);
    onCloseMobile();
  };

  const body = (
    <>
      <div className="px-5 py-4 border-b border-sand-200 shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2.5 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500/40"
          title="Visitflow Home"
        >
          <div className="flex flex-col leading-none gap-0.5">
            <span className="inline-flex w-fit rounded-md bg-white">
              <img src="/visitflow-logo.png" alt="Visitflow" className="h-5 w-auto object-contain" />
            </span>
            <span className="text-[9px] font-semibold tracking-[0.24em] text-stone-500 uppercase">
              Admin
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5 thin-scroll overscroll-contain">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-2 mb-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-stone-400">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                const count = countFor(item.key);
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.key)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors text-left ${
                        isActive
                          ? 'bg-sand-100 text-charcoal-950 font-medium'
                          : 'text-stone-600 hover:bg-sand-50 hover:text-charcoal-950'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-ocean-600' : 'text-stone-400'
                        }`}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {count !== undefined && (
                        <span
                          className={`text-[11px] tabular-nums ${
                            isActive ? 'text-stone-600' : 'text-stone-400'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-sand-200 shrink-0 space-y-2">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-7 h-7 rounded-full bg-sand-100 text-charcoal-950 text-xs font-medium flex items-center justify-center shrink-0">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-charcoal-950 truncate">{user?.name || 'Administrator'}</p>
            <p className="text-xs text-stone-500 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-stone-600 hover:bg-sand-50 hover:text-charcoal-950 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View site
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-stone-600 hover:bg-sand-50 hover:text-charcoal-950 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-60 flex-col bg-white border-r border-sand-200">
        {body}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-charcoal-950/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] flex flex-col bg-white border-r border-sand-200 shadow-lg">
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation"
              className="absolute top-3 right-3 z-10 p-1.5 rounded-md text-stone-500 hover:text-charcoal-950 hover:bg-sand-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {body}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
