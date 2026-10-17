import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useItinerary } from '../../context/ItineraryContext';
import { AuthModal } from '../auth/AuthModal';
import {
  Compass,
  MapPin,
  Calendar,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Navigation,
  Sparkles,
  User as UserIcon,
  Compass as CompassIcon,
} from 'lucide-react';

export const SiteHeader: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { stops, setIsDrawerOpen } = useItinerary();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Scroll listener for translucent -> solid transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
    setIsMobileMenuOpen(false);
  };

  const isHome = location.pathname === '/';
  const isExplore = location.pathname === '/explore';
  const isItineraries = location.pathname === '/itineraries';
  const isAdminPage = location.pathname === '/admin';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || !isHome
            ? 'bg-charcoal-950/92 backdrop-blur-md border-b border-sand-400/15 py-3.5 shadow-2xl'
            : 'bg-gradient-to-b from-charcoal-950/85 via-charcoal-950/50 to-transparent py-4 sm:py-5 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6">
            {/* Brand Wordmark */}
            <Link
              to="/"
              className="flex items-center gap-3 group focus:outline-none rounded-lg shrink-0"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-charcoal-950 font-black shadow-md shadow-gold-500/20 group-hover:scale-105 transition-transform duration-300">
                <Compass className="w-5 h-5 text-charcoal-950" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-serif font-bold tracking-[0.25em] text-ivory-50 uppercase group-hover:text-gold-400 transition-colors">
                  Aether
                </span>
                <span className="text-[9px] tracking-[0.35em] text-sand-400 uppercase font-sans font-medium -mt-1 group-hover:text-sand-300 transition-colors">
                  Expeditions
                </span>
              </div>
            </Link>

            {/* Desktop Center Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-[12px] font-medium tracking-[0.14em] uppercase text-sand-300">
              {isHome ? (
                <>
                  <a
                    href="#destinations"
                    className="hover:text-gold-400 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold-400 hover:after:w-full after:transition-all"
                  >
                    Destinations
                  </a>
                  <a
                    href="#experiences"
                    className="hover:text-gold-400 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold-400 hover:after:w-full after:transition-all"
                  >
                    Experiences
                  </a>
                  <a
                    href="#how-it-works"
                    className="hover:text-gold-400 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold-400 hover:after:w-full after:transition-all"
                  >
                    How It Works
                  </a>
                  <a
                    href="#journal"
                    className="hover:text-gold-400 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold-400 hover:after:w-full after:transition-all"
                  >
                    Journal
                  </a>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className="hover:text-gold-400 transition-colors py-1"
                  >
                    Home
                  </Link>
                  <Link
                    to="/explore"
                    className={`hover:text-gold-400 transition-colors py-1 ${
                      isExplore ? 'text-gold-400 font-bold' : ''
                    }`}
                  >
                    Destinations
                  </Link>
                </>
              )}

              {/* Spatial Route Map Link */}
              <Link
                to="/explore"
                className={`flex items-center gap-1.5 transition-colors py-1 ${
                  isExplore
                    ? 'text-gold-400 font-bold'
                    : 'hover:text-gold-400'
                }`}
                title="Interactive spatial route map from 7.4394, 81.8172"
              >
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                <span>Route Map</span>
              </Link>
            </nav>

            {/* Desktop Right Action Cluster */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {/* Day Plan Trigger Button */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold-500/40 text-ivory-100 text-xs font-medium transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                title="Open Day Plan drawer"
              >
                <MapPin className="w-3.5 h-3.5 text-gold-400" />
                <span>Day Plan</span>
                {stops.length > 0 && (
                  <span className="w-4 h-4 text-[10px] font-black bg-gold-500 text-charcoal-950 rounded-full flex items-center justify-center shadow-sm">
                    {stops.length}
                  </span>
                )}
              </button>

              {/* Primary "Plan Your Trip" Action */}
              <button
                type="button"
                onClick={() => {
                  const searchEl = document.getElementById('travel-search');
                  if (searchEl && isHome) {
                    searchEl.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setIsDrawerOpen(true);
                  }
                }}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-charcoal-950 text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-gold-500/20 hover:scale-102 focus:outline-none active:scale-98"
              >
                Plan Your Trip
              </button>

              {/* User Profile / Auth Dropdown */}
              {isAuthenticated && user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sand-400/40 text-xs text-ivory-100 transition-colors focus:outline-none"
                    aria-label="Open user profile menu"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-400 to-amber-600 text-charcoal-950 font-bold text-xs flex items-center justify-center shadow-inner">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-sand-200 hidden xl:inline max-w-[90px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-sand-400 transition-transform duration-200 ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2.5 w-60 bg-charcoal-900 border border-sand-400/20 rounded-2xl shadow-2xl py-1.5 text-sand-200 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-sand-400/10">
                        <p className="text-[10px] font-bold tracking-wider uppercase text-sand-400">
                          Signed In
                        </p>
                        <p className="text-xs font-bold text-ivory-50 truncate mt-0.5">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-sand-400 truncate font-mono">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/itineraries"
                          onClick={() => setIsUserMenuOpen(false)}
                          className={`flex items-center justify-between px-4 py-2.5 text-xs font-medium hover:bg-white/5 hover:text-gold-400 transition-colors ${
                            isItineraries ? 'text-gold-400 bg-white/5' : ''
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <Calendar className="w-4 h-4 text-gold-400" />
                            My Saved Itineraries
                          </span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsDrawerOpen(true);
                          }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium hover:bg-white/5 hover:text-gold-400 text-left transition-colors"
                        >
                          <span className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-gold-400" />
                            Current Day Plan
                          </span>
                          {stops.length > 0 && (
                            <span className="text-[10px] font-bold bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full border border-gold-500/30">
                              {stops.length}
                            </span>
                          )}
                        </button>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gold-300 hover:text-gold-200 hover:bg-gold-500/10 transition-colors ${
                              isAdminPage ? 'bg-gold-500/15' : ''
                            }`}
                          >
                            <ShieldAlert className="w-4 h-4 text-gold-400" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-sand-400/10">
                        <button
                          type="button"
                          onClick={async () => {
                            setIsUserMenuOpen(false);
                            await logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 text-left transition-colors font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openAuth('login')}
                    className="text-xs font-bold text-sand-300 hover:text-ivory-50 transition-colors px-3 py-1.5"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuth('register')}
                    className="text-xs font-bold text-charcoal-950 bg-gold-400 hover:bg-gold-300 rounded-full px-3.5 py-1.5 shadow-sm transition-colors"
                  >
                    Join
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger & Day Plan Indicator */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="relative p-2 text-sand-200 hover:text-white"
                aria-label="View day plan"
              >
                <MapPin className="w-5 h-5 text-gold-400" />
                {stops.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-gold-500 text-charcoal-950 rounded-full flex items-center justify-center">
                    {stops.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-sand-200 hover:text-white focus:outline-none rounded-lg"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gold-400" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[60px] bg-charcoal-950/98 backdrop-blur-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-top-4 duration-200">
            <nav className="space-y-4 pt-2 text-base font-serif tracking-widest uppercase">
              {isHome ? (
                <>
                  <a
                    href="#destinations"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-ivory-100 hover:text-gold-400 py-2.5 border-b border-sand-400/10"
                  >
                    Destinations
                  </a>
                  <a
                    href="#experiences"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-ivory-100 hover:text-gold-400 py-2.5 border-b border-sand-400/10"
                  >
                    Experiences
                  </a>
                  <a
                    href="#how-it-works"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-ivory-100 hover:text-gold-400 py-2.5 border-b border-sand-400/10"
                  >
                    How It Works
                  </a>
                  <a
                    href="#journal"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-ivory-100 hover:text-gold-400 py-2.5 border-b border-sand-400/10"
                  >
                    Travel Journal
                  </a>
                </>
              ) : (
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-ivory-100 hover:text-gold-400 py-2.5 border-b border-sand-400/10"
                >
                  Home
                </Link>
              )}

              <Link
                to="/explore"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sky-400 font-sans py-2.5 border-b border-sand-400/10 flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Spatial Route Map & Explorer
              </Link>

              {isAuthenticated && (
                <Link
                  to="/itineraries"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-ivory-100 hover:text-gold-400 py-2.5 border-b border-sand-400/10"
                >
                  My Saved Itineraries
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gold-400 py-2.5 border-b border-sand-400/10"
                >
                  Admin Console
                </Link>
              )}
            </nav>

            <div className="pt-6 border-t border-sand-400/20 space-y-3 font-sans">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsDrawerOpen(true);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-gold-400 to-gold-500 text-charcoal-950 font-bold rounded-xl text-center text-xs uppercase tracking-wider shadow-lg"
              >
                Plan Your Trip
              </button>

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await logout();
                  }}
                  className="w-full py-2.5 text-center text-xs text-red-400 font-semibold"
                >
                  Sign Out ({user?.name})
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openAuth('login')}
                    className="flex-1 py-3 text-center text-xs font-bold text-ivory-100 bg-white/10 rounded-xl"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuth('register')}
                    className="flex-1 py-3 text-center text-xs font-bold text-charcoal-950 bg-gold-400 rounded-xl"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
};
