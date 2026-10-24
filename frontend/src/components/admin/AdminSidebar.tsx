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
  ShieldCheck,
  CalendarDays,
  Activity,
  FileCheck,
  BarChart3,
} from 'lucide-react';

export type AdminTab = 'overview' | 'places' | 'categories' | 'users' | 'itineraries' | 'data-quality' | 'audit' | 'system-health';

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
    label: 'OVERVIEW',
    items: [
      { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'audit', label: 'Audit Trail', icon: History },
    ],
  },
  {
    label: 'CATALOGUE MANAGEMENT',
    items: [
      { key: 'places', label: 'All Places', icon: MapPin },
      { key: 'categories', label: 'Categories', icon: FolderTree },
    ],
  },
  {
    label: 'TOURIST MANAGEMENT',
    items: [
      { key: 'users', label: 'Registered Users', icon: Users },
      { key: 'itineraries', label: 'Itineraries', icon: CalendarDays },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { key: 'data-quality', label: 'Data Quality', icon: FileCheck },
      { key: 'system-health', label: 'System Health', icon: Activity },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { key: 'overview', label: 'Settings', icon: BarChart3 },
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
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-white/[0.08] shrink-0 bg-white/[0.02]">
        <Link
          to="/"
          className="flex items-center gap-3 group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise-400"
          title="Visitflow Home"
        >
          <div className="flex flex-col leading-none gap-1">
            <span className="inline-flex w-fit rounded-lg bg-white px-2 py-1 shadow-card">
              <img src="/visitflow-logo.png" alt="Visitflow" className="h-5 w-auto object-contain" />
            </span>
            <span className="text-[9px] font-extrabold tracking-[0.25em] text-turquoise-400 uppercase mt-0.5">
              Admin Console
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation with Custom Sleek Scrollbar */}
      <nav className="flex-1 overflow-y-auto px-3 py-3.5 space-y-4 sidebar-scrollbar overscroll-contain">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-navy-200/50">
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
                      className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left group ${
                        isActive
                          ? 'bg-gradient-to-r from-ocean-500/25 to-turquoise-500/10 text-turquoise-300 ring-1 ring-turquoise-400/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                          : 'text-sand-300/80 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-gradient-to-b from-turquoise-400 to-ocean-400 shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
                      )}
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-turquoise-400'
                            : 'text-sand-400/70 group-hover:text-sand-200'
                        }`}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {count !== undefined && (
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full transition-colors ${
                            isActive
                              ? 'bg-turquoise-400 text-navy-950 shadow-sm'
                              : 'bg-white/[0.08] text-sand-300'
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
      <div className="px-4 py-3.5 border-t border-white/[0.08] space-y-2.5 bg-[#061322]/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/25">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
            Policy-scoped session
          </span>
        </div>

        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-ocean-600 to-turquoise-400 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-sand-400/80 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-sand-200 bg-white/[0.06] hover:bg-white/[0.12] hover:text-white transition-colors"
          >
            <ExternalLink className="w-3 h-3 text-turquoise-400" />
            View Site
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-colors"
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
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-gradient-to-b from-[#091B2F] via-charcoal-950 to-[#071526] border-r border-white/[0.08] shadow-2xl">
        {body}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] flex flex-col bg-gradient-to-b from-[#091B2F] via-charcoal-950 to-[#071526] border-r border-white/[0.12] shadow-2xl">
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation"
              className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-sand-400 hover:text-white hover:bg-white/10 transition-colors"
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
