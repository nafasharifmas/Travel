import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  MapPin,
  FolderTree,
  Users,
  History,
  LogOut,
  ExternalLink,
  X,
  ShieldCheck,
} from 'lucide-react';

export type AdminTab = 'overview' | 'places' | 'categories' | 'users' | 'audit';

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
    label: 'Workspace',
    items: [
      { key: 'overview', label: 'Overview', icon: LayoutDashboard },
      { key: 'audit', label: 'Audit Trail', icon: History },
    ],
  },
  {
    label: 'Records',
    items: [
      { key: 'places', label: 'Places', icon: MapPin },
      { key: 'categories', label: 'Categories', icon: FolderTree },
      { key: 'users', label: 'Users', icon: Users },
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
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-sand-400/10">
        <Link
          to="/"
          className="flex items-center gap-3 group rounded-lg focus-visible:ring-2 focus-visible:ring-gold-500"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-md shadow-gold-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-charcoal-950" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-serif font-bold tracking-[0.2em] text-ivory-50 uppercase group-hover:text-gold-400 transition-colors">
              Aether
            </span>
            <span className="text-[9px] tracking-[0.25em] text-sand-400 uppercase mt-1">
              Admin Console
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sand-500">
              {section.label}
            </p>
            <ul className="space-y-1">
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
                      className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                        isActive
                          ? 'bg-gold-500/10 text-gold-300 ring-1 ring-gold-500/25'
                          : 'text-sand-300 hover:bg-white/[0.05] hover:text-ivory-100'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-gold-500" />
                      )}
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-gold-400' : 'text-sand-500'
                        }`}
                      />
                      <span className="flex-1">{item.label}</span>
                      {count !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-gold-500 text-charcoal-950'
                              : 'bg-white/[0.07] text-sand-400'
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

      {/* Session / account footer */}
      <div className="px-4 py-4 border-t border-sand-400/10 space-y-3">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wide">
            Policy-scoped session
          </span>
        </div>

        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-gold-500 text-charcoal-950 font-bold text-xs flex items-center justify-center shrink-0">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ivory-100 truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-sand-500 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-semibold text-sand-300 bg-white/[0.05] hover:bg-white/[0.1] hover:text-ivory-100 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View Site
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-semibold text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-charcoal-950 border-r border-sand-400/10">
        {body}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-charcoal-950/70 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] flex flex-col bg-charcoal-950 border-r border-sand-400/15 shadow-2xl">
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation"
              className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-sand-400 hover:text-ivory-100 hover:bg-white/10"
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
