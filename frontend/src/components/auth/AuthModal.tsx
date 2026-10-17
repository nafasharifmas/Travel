import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useItinerary } from '../../context/ItineraryContext';
import { X, Lock, Mail, User as UserIcon, Shield, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { login, register } = useAuth();
  const { stops, syncPlanToAccount } = useItinerary();

  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (password !== passwordConfirmation) {
          throw new Error('Passwords do not match.');
        }
        await register(name, email, password, passwordConfirmation);
      }

      // If guest had stops built, offer auto-sync
      if (stops.length > 0) {
        try {
          await syncPlanToAccount();
        } catch (syncErr) {
          console.warn('Sync failed:', syncErr);
        }
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setMode('login');
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/60 backdrop-blur-sm transition-opacity"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-sand-200 overflow-hidden text-espresso-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#1c1917] text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 text-sand-400 hover:text-white transition-colors p-1 rounded-full focus:ring-2 focus:ring-amber-500"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            Visitflow Passport
          </div>
          <h2 className="text-xl font-bold font-sans">
            {mode === 'login' ? 'Welcome Back Traveler' : 'Begin Your Discovery Journey'}
          </h2>
          <p className="text-sand-300 text-sm mt-1">
            {mode === 'login'
              ? 'Sign in to access your saved day itineraries.'
              : 'Create an account to save and synchronize custom one-day plans.'}
          </p>
        </div>

        {/* Quick Demo Logins Pill Box */}
        <div className="bg-sand-50 p-4 border-b border-sand-200">
          <p className="text-xs text-stone-500 font-medium mb-2 uppercase tracking-wide">
            Instant Demo Sign-in
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@visitflow.com', 'Admin123!')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              Admin (Full Control)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('alex@example.com', 'Password123!')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-stone-200 text-stone-800 hover:bg-stone-300 border border-stone-300 transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5 text-stone-600" />
              Member (Traveler)
            </button>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-sand-200 bg-sand-100/50">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
              mode === 'login'
                ? 'bg-white text-espresso-950 border-b-2 border-amber-500 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
              mode === 'register'
                ? 'bg-white text-espresso-950 border-b-2 border-amber-500 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-sand-50/50 border border-sand-300 rounded-lg focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500 text-stone-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-sand-50/50 border border-sand-300 rounded-lg focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500 text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-sand-50/50 border border-sand-300 rounded-lg focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500 text-stone-900"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-sand-50/50 border border-sand-300 rounded-lg focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500 text-stone-900"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-espresso-950 font-bold rounded-lg shadow-md transition-colors disabled:opacity-50 mt-2 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

