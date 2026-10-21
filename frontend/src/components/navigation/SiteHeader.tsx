import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useItinerary } from '../../context/ItineraryContext';
import { AuthModal } from '../auth/AuthModal';
import { ThemeToggleButton } from '../common/ThemeToggleButton';
import {
  Calendar,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Route,
  MapPin,
  User as UserIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  /** Hash target when already on the landing page. */
  hash: string;
  /** Absolute path fallback for every other route. */
  to: string;
  /** Route prefix that should mark this item active. */
  match?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', hash: '', to: '/', match: '/' },
  { label: 'Destinations', hash: '#destinations', to: '/explore', match: '/explore' },
  { label: 'Experiences', hash: '#experiences', to: '/#experiences' },
  { label: 'How It Works', hash: '#how-it-works', to: '/#how-it-works' },
  { label: 'Journal', hash: '#journal', to: '/#journal' },
];

export const SiteHeader: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { stops, setIsDrawerOpen } = useItinerary();
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === '/';

  // Scroll detection: seamless transparent on hero, frosted glass when scrolled
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scrollspy for active landing page section
  useEffect(() => {
    if (!isHome) {
      setActiveSection('');
      return;
    }
    const sectionIds = ['journal', 'how-it-works', 'experiences', 'destinations'];
    const handleSectionScroll = () => {
      const scrollPosition = window.scrollY + 160;
      let matched = '';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPosition) {
          matched = id;
          break;
        }
      }
      setActiveSection(matched);
    };

    handleSectionScroll();
    window.addEventListener('scroll', handleSectionScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleSectionScroll);
  }, [isHome]);

  // Support direct hash scrolling across route changes
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    }
  }, [location.hash, location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key closes menus
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setIsMobileMenuOpen(false);
      setIsUserMenuOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Reset drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (item: NavItem) => {
    setIsMobileMenuOpen(false);
    if (item.hash && isHome) {
      const el = document.getElementById(item.hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(item.to);
  };

  const isNavActive = (item: NavItem) => {
    if (isHome) {
      if (item.hash) {
        return activeSection === item.hash.slice(1);
      }
      return !activeSection && item.match === '/';
    }
    return Boolean(item.match && location.pathname.startsWith(item.match));
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 liquid-glass-header transition-all duration-300 ease-premium ${
          isScrolled ? 'is-scrolled py-2' : 'py-3 lg:py-4'
        } ${!isHome ? 'bg-white/95 backdrop-blur-md border-b border-navy-100 shadow-sm' : ''}`}
      >
        <div className="container-page">
          <div className="flex min-h-14 sm:min-h-16 items-center justify-between gap-4">
            
            {/* Zone 1: Left Brand Block */}
            <div className="flex min-w-0 shrink-0 items-center lg:min-w-[220px]">
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: isHome ? 'smooth' : 'auto' })}
                className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise-400 rounded-xl py-1"
                aria-label="Visitflow home"
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-turquoise-500/20 to-ocean-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <img
                    src="/visitflow-emblem.png"
                    alt="Visitflow emblem"
                    className="relative h-8 sm:h-9 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="whitespace-nowrap text-[10px] sm:text-[11px] font-sans font-extrabold tracking-[0.22em] uppercase text-ocean-700">
                    Visitflow
                  </span>
                </div>
              </Link>
            </div>

            {/* Zone 2: Redesigned Hero Nav (Clean, Refined Editorial Typography) */}
            <nav className="hidden flex-1 justify-center lg:flex items-center gap-6 xl:gap-8" aria-label="Primary">
              {NAV_ITEMS.map((item) => {
                const active = isNavActive(item);
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative py-1.5 text-[13px] font-medium tracking-wide transition-colors duration-200 group ${
                      active ? 'text-ocean-600 font-semibold' : 'text-navy-900 hover:text-ocean-600'
                    }`}
                  >
                    <span>{item.label}</span>
                    {/* Delicate active glow indicator */}
                    <span
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-turquoise-400 to-ocean-400 transition-all duration-300 ${
                        active
                          ? 'w-5 shadow-[0_0_8px_rgba(0,191,196,0.8)] opacity-100'
                          : 'w-0 opacity-0 group-hover:w-3 group-hover:opacity-60'
                      }`}
                    />
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Right Controls & Actions (Plan Your Trip Removed) */}
            <div className="hidden min-w-[220px] justify-end md:flex items-center gap-2.5 shrink-0">
              {/* Theme Toggle */}
              <ThemeToggleButton className="shrink-0" />

              {/* My Trip Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="liquid-glass-pill relative inline-flex items-center gap-2 h-10 px-4 rounded-full text-navy-900 text-xs font-semibold"
                title="Open your trip plan"
              >
                <MapPin className="w-4 h-4 text-turquoise-300" />
                <span>My Trip</span>
                {stops.length > 0 && (
                  <span className="grid place-items-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-ocean-500 text-white rounded-full shadow-sm">
                    {stops.length}
                  </span>
                )}
              </button>

              {/* User Account / Sign In */}
              {isAuthenticated && user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                    className="liquid-glass-pill flex items-center gap-2 pl-1.5 pr-3 h-10 rounded-full"
                  >
                    <span className="grid place-items-center w-7 h-7 rounded-full bg-gradient-to-r from-ocean-500 to-turquoise-500 text-white text-xs font-bold shadow-inner">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden xl:inline max-w-[80px] truncate text-xs font-bold text-navy-900">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-white/80 transition-transform ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2.5 w-64 bg-navy-950/95 dark:bg-navy-900 border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 backdrop-blur-xl animate-fade-in text-white"
                    >
                      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                          Signed in
                        </p>
                        <p className="text-sm font-semibold text-white truncate mt-0.5">
                          {user.name}
                        </p>
                        <p className="text-xs text-white/60 truncate">{user.email}</p>
                      </div>

                      <div className="py-1.5">
                        <Link
                          to="/itineraries"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-turquoise-300 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-turquoise-400" />
                          My Saved Itineraries
                        </Link>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsDrawerOpen(true);
                          }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-turquoise-300 transition-colors"
                        >
                          <span className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-turquoise-400" />
                            Current Trip Plan
                          </span>
                          {stops.length > 0 && (
                            <span className="text-[10px] font-bold text-turquoise-300 bg-white/10 px-2 py-0.5 rounded-full">
                              {stops.length}
                            </span>
                          )}
                        </button>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            role="menuitem"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-turquoise-300 hover:bg-white/10 transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-white/10 py-1.5">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={async () => {
                            setIsUserMenuOpen(false);
                            await logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="liquid-glass-pill flex items-center h-10 px-4 rounded-full text-xs font-semibold text-navy-900 hover:text-navy-950"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Action Controls */}
            <div className="flex md:hidden items-center gap-1.5">
              <ThemeToggleButton className="shrink-0" />

              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="liquid-glass-btn-round relative grid place-items-center w-10 h-10 rounded-full"
                aria-label="Open trip plan"
              >
                <MapPin className="w-4 h-4 text-turquoise-300" />
                {stops.length > 0 && (
                  <span className="absolute -top-1 -right-1 grid place-items-center min-w-[18px] h-4.5 px-1 text-[10px] font-bold bg-ocean-500 text-white rounded-full shadow-sm">
                    {stops.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="liquid-glass-btn-round grid place-items-center w-10 h-10 rounded-full"
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div
          id="mobile-nav"
          inert={!isMobileMenuOpen}
          aria-hidden={!isMobileMenuOpen}
          className={`md:hidden overflow-hidden bg-navy-950/98 backdrop-blur-2xl border-t border-white/10 text-white transition-[max-height] duration-300 ease-premium ${
            isMobileMenuOpen ? 'max-h-[90vh]' : 'max-h-0'
          }`}
        >
          <div className="container-page py-5 flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(item);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center justify-between py-3 px-3 rounded-xl border border-white/5 text-base font-medium transition-all ${
                    active
                      ? 'bg-white/10 text-white font-bold border-turquoise-400/30'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{item.label}</span>
                  {active && <span className="w-2 h-2 rounded-full bg-turquoise-400 shadow-[0_0_8px_#38bdf8]" />}
                </button>
              );
            })}

            <Link
              to="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-3 px-3 rounded-xl border border-white/5 text-base font-medium text-white/80 hover:text-white hover:bg-white/5"
            >
              <Route className="w-4 h-4 text-turquoise-400" />
              <span>Route Discovery Map</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/itineraries"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 py-3 px-3 rounded-xl border border-white/5 text-base font-medium text-white/80 hover:text-white hover:bg-white/5"
              >
                <Calendar className="w-4 h-4 text-turquoise-400" />
                <span>My Saved Itineraries</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 py-3 px-3 rounded-xl border border-turquoise-500/30 bg-turquoise-500/10 text-base font-semibold text-turquoise-300"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Console</span>
              </Link>
            )}

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl">
                  <span className="flex items-center gap-2 text-sm text-white/80">
                    <UserIcon className="w-4 h-4 text-turquoise-400" />
                    {user?.name}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      await logout();
                    }}
                    className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-sm font-bold text-white transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
};

export default SiteHeader;
