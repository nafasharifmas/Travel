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
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'places'
  | 'categories'
  | 'users'
  | 'itineraries'
  | 'data-quality'
  | 'audit'
  | 'system-health'
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelect: (tab: AdminTab) => void;
  counts: { places: number; categories: number; users: number };
  user?: { name: string; email: string } | null;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
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
    items: [{ key: 'settings', label: 'Settings', icon: Settings }],
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
  collapsed = false,
  onToggleCollapse,
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
      <div
        className={`border-b border-white/10 shrink-0 flex items-center transition-all duration-300 ${
          collapsed ? 'py-4 px-2 justify-center' : 'px-5 py-4 justify-between'
        }`}
      >
        <Link
          to="/"
          className={`flex items-center group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 transition-all ${
            collapsed ? 'justify-center' : 'gap-3'
          }`}
          title="VisitFlow Home"
        >
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-400/40 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none gap-0.5 whitespace-nowrap overflow-hidden">
              <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                VisitFlow
              </span>
              <span className="text-[9px] font-semibold tracking-[0.28em] text-cyan-300/70 uppercase">
                Admin Console
              </span>
            </div>
          )}
        </Link>

        {/* Sidebar Collapse/Expand Toggle Icon button in header */}
        {!collapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-cyan-200" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 sidebar-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {collapsed ? (
              <div className="w-6 h-px bg-white/10 mx-auto my-3" title={section.label} />
            ) : (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                {section.label}
              </p>
            )}
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
                      title={collapsed ? `${item.label}${count !== undefined ? ` (${count})` : ''}` : undefined}
                      className={`group w-full flex items-center ${
                        collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2'
                      } rounded-xl text-sm transition-all duration-200 text-left relative overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-white font-medium shadow-lg shadow-cyan-500/10'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <div
                          className={`absolute left-0 top-1/2 -translate-y-1/2 ${
                            collapsed ? 'w-1 h-5' : 'w-1 h-6'
                          } bg-gradient-to-b from-cyan-400 to-teal-400 rounded-r-full`}
                        />
                      )}
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-cyan-300' : 'text-white/40 group-hover:text-white/70'
                        }`}
                      />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!collapsed && count !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full tabular-nums ${
                            isActive
                              ? 'bg-cyan-400/20 text-cyan-200'
                              : 'bg-white/5 text-white/50'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                      {collapsed && count !== undefined && count > 0 && (
                        <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className={`border-t border-white/10 shrink-0 transition-all duration-300 ${
          collapsed ? 'py-3 px-2 flex flex-col items-center gap-3' : 'px-3 py-4 space-y-2'
        }`}
      >
        {collapsed ? (
          <>
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 text-white text-sm font-semibold flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20 cursor-default"
              title={`${user?.name || 'Administrator'} (${user?.email || ''})`}
            >
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Sign out"
              aria-label="Sign out"
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 text-white text-sm font-semibold flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-xs text-white/50 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-white/70 hover:bg-white/5 hover:text-white transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View site
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-white/70 hover:bg-white/5 hover:text-white transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      <aside
        className={`hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col bg-gradient-to-b from-[#0a1525] via-[#0b1a2e] to-[#07111f] border-r border-white/10 shadow-2xl transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Floating docked collapse/expand toggle on sidebar edge */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex items-center justify-center absolute -right-3 top-5 z-50 w-6 h-6 rounded-full bg-[#0b1a2e] border border-white/20 text-white/70 hover:text-white hover:border-cyan-400 hover:bg-cyan-500/20 shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        )}
        {body}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] flex flex-col bg-gradient-to-b from-[#0a1525] via-[#0b1a2e] to-[#07111f] border-r border-white/10 shadow-2xl">
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation"
              className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
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
