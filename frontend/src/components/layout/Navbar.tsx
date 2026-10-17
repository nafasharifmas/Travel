import React, { useState } from 'react';
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
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { stops, setIsDrawerOpen } = useItinerary();
  const location = useLocation();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#1c1917]/95 backdrop-blur-md border-b border-sand-200/10 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="flex items-center gap-2.5 text-white group focus:ring-2 focus:ring-amber-500 rounded-lg p-1"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-espresso-950 font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  <Compass className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight font-sans text-white group-hover:text-amber-400 transition-colors">
                    VISITFLOW
                  </span>
                  <span className="text-[10px] text-sand-400 uppercase tracking-widest -mt-1 font-semibold">
                    Expedition Guide
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive('/')
                      ? 'bg-white/10 text-amber-400 shadow-inner'
                      : 'text-sand-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Explore Places
                </Link>

                {isAuthenticated && (
                  <Link
                    to="/itineraries"
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive('/itineraries')
                        ? 'bg-white/10 text-amber-400 shadow-inner'
                        : 'text-sand-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-amber-400" />
                    My Itineraries
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-amber-500 text-espresso-950 font-bold shadow-md shadow-amber-500/20'
                        : 'text-amber-300 hover:text-amber-200 hover:bg-white/5'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Admin Console
                  </Link>
                )}
              </nav>
            </div>

            {/* Right surface actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Day Itinerary Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="relative inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-sand-200 hover:text-white text-sm font-medium transition-all shadow-sm focus:ring-2 focus:ring-amber-500"
              >
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Day Plan</span>
                {stops.length > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-amber-500 text-espresso-950 rounded-full animate-bounce">
                    {stops.length}
                  </span>
                )}
              </button>

              {/* User State */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left focus:ring-2 focus:ring-amber-500"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:block text-xs">
                      <p className="font-semibold text-white leading-tight">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-amber-400 capitalize">
                        {user.role}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-sand-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl py-1 border border-sand-200 text-stone-800 z-50 animate-in fade-in slide-in-from-top-2"
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-sand-100">
                        <p className="text-xs text-stone-500">Signed in as</p>
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        to="/itineraries"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium hover:bg-sand-50 transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-amber-600" />
                        Saved Itineraries
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-50/50 hover:bg-amber-100/70 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-amber-600" />
                          Admin Console
                        </Link>
                      )}

                      <button
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left border-t border-sand-100 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAuth('login')}
                    className="px-3.5 py-2 text-xs font-bold text-sand-200 hover:text-white transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuth('register')}
                    className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-espresso-950 rounded-xl shadow-md transition-all hover:scale-105"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="relative p-2 text-sand-300 hover:text-white"
                aria-label="View day plan"
              >
                <MapPin className="w-5 h-5 text-amber-400" />
                {stops.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-amber-500 text-espresso-950 rounded-full flex items-center justify-center">
                    {stops.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-sand-300 hover:text-white rounded-lg focus:ring-2 focus:ring-amber-500"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#1c1917] px-4 pt-3 pb-5 space-y-2">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-sand-200 hover:text-white hover:bg-white/5"
            >
              Explore Places
            </Link>

            {isAuthenticated && (
              <Link
                to="/itineraries"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-sand-200 hover:text-white hover:bg-white/5"
              >
                My Itineraries
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-bold text-amber-400 hover:bg-white/5"
              >
                Admin Console
              </Link>
            )}

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {isAuthenticated ? (
                <button
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await logout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 font-medium"
                >
                  Sign Out ({user?.name})
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => openAuth('login')}
                    className="flex-1 py-2 text-center text-xs font-bold text-sand-200 bg-white/10 rounded-lg"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuth('register')}
                    className="flex-1 py-2 text-center text-xs font-bold text-espresso-950 bg-amber-500 rounded-lg"
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

