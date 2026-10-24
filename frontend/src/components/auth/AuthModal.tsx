import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useItinerary } from '../../context/ItineraryContext';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  /* ---------- UI-only state (redesign polish, no effect on the auth flow) ---------- */
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const panelRef = useRef<HTMLDivElement>(null);

  // Move focus into the dialog when it opens.
  useEffect(() => {
    if (isOpen) panelRef.current?.focus();
  }, [isOpen]);

  // Escape closes the dialog.
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const markTouched = (field: string) =>
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));

  /* ---------- Inline (advisory) validation — mirror of the existing handler rules ---------- */
  const nameError =
    mode === 'register' && touched.name && name.trim() === ''
      ? 'Please enter your full name.'
      : null;

  const emailError =
    touched.email && email.trim() === ''
      ? 'Please enter your email address.'
      : touched.email && !EMAIL_PATTERN.test(email.trim())
        ? 'Enter a valid email address.'
        : null;

  const passwordError =
    touched.password && password === '' ? 'Please enter your password.' : null;

  const confirmationError =
    mode === 'register' &&
    touched.passwordConfirmation &&
    passwordConfirmation !== '' &&
    passwordConfirmation !== password
      ? 'Passwords do not match.'
      : null;

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

  const modeButtonClass = (active: boolean) =>
    `inline-flex min-h-[44px] items-center justify-center rounded-pill px-4 text-sm font-semibold transition-all duration-200 ease-premium ${
      active ? 'bg-white text-ocean-600 shadow-card' : 'text-navy-500 hover:text-navy-800'
    }`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      aria-describedby="auth-modal-description"
      onMouseDown={(e) => {
        // Backdrop click closes; clicks inside the panel are ignored.
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm animate-fadeIn"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="thin-scroll relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-card border border-navy-200 bg-white shadow-card-hover outline-none"
      >
        {/* Close control */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign in dialog"
          className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full text-navy-500 transition-colors hover:bg-navy-100 hover:text-navy-900"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand header — logo sits on a white surface */}
        <div className="border-b border-navy-100 bg-[radial-gradient(circle_at_top_right,_rgba(46,196,182,0.18),_transparent_42%),linear-gradient(135deg,#fefdfb,#eef8f8)] px-6 pb-6 pt-7">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/80 bg-white p-1.5 shadow-card">
              <img src="/visitflow-mark.png" alt="Visitflow" className="h-full w-full object-contain" />
            </span>
            <span className="font-serif text-2xl font-bold text-navy-900 tracking-tight">Visitflow</span>
          </div>

          <span className="eyebrow mt-4">
            <Sparkles className="h-3.5 w-3.5" />
            Visitflow Passport
          </span>

          <h2 id="auth-modal-title" className="mt-2 font-serif text-h4 text-navy-900">
            {mode === 'login' ? 'Welcome Back Traveler' : 'Begin Your Discovery Journey'}
          </h2>
          <p id="auth-modal-description" className="mt-1.5 text-sm leading-relaxed text-navy-600">
            {mode === 'login'
              ? 'Sign in to access your saved day itineraries.'
              : 'Create an account to save and synchronize custom one-day plans.'}
          </p>
        </div>

        {/* Quick demo logins */}
        <div className="border-b border-navy-100 bg-ivory-100/70 px-6 py-4">
          <p className="field-label">Instant demo sign-in</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@visitflow.com', 'Admin123!')}
              className="chip min-h-[44px] border-gold-500/60 bg-gold-500/15 text-gold-700 hover:border-gold-500 hover:text-gold-700"
            >
              <Shield className="h-4 w-4 text-gold-600" />
              Admin (Full Control)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('alex@example.com', 'Password123!')}
              className="chip min-h-[44px]"
            >
              <UserIcon className="h-4 w-4 text-ocean-500" />
              Member (Traveler)
            </button>
          </div>
        </div>

        {/* Mode switcher */}
        <div className="px-6 pt-4">
          <div
            role="group"
            aria-label="Authentication mode"
            className="grid grid-cols-2 gap-1 rounded-pill bg-navy-100 p-1"
          >
            <button
              type="button"
              aria-pressed={mode === 'login'}
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={modeButtonClass(mode === 'login')}
            >
              Sign In
            </button>
            <button
              type="button"
              aria-pressed={mode === 'register'}
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={modeButtonClass(mode === 'register')}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <div
              id="auth-form-error"
              role="alert"
              className="flex items-start gap-2 rounded-btn border border-red-200 bg-red-50 p-3 text-xs text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label htmlFor="auth-name" className="field-label">
                Full name
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => markTouched('name')}
                  placeholder="e.g. Maya Lin"
                  aria-invalid={Boolean(nameError)}
                  aria-describedby={nameError ? 'auth-name-error' : undefined}
                  className="field pl-10"
                />
              </div>
              {nameError && (
                <p
                  id="auth-name-error"
                  role="alert"
                  className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {nameError}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="field-label">
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
              <input
                id="auth-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => markTouched('email')}
                placeholder="you@domain.com"
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? 'auth-email-error' : undefined}
                className="field pl-10"
              />
            </div>
            {emailError && (
              <p
                id="auth-email-error"
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="auth-password" className="field-label">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
              <input
                id="auth-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => markTouched('password')}
                placeholder="••••••••"
                aria-invalid={Boolean(passwordError)}
                aria-describedby={passwordError ? 'auth-password-error' : undefined}
                className="field pl-10 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-0 top-0 grid h-full w-11 place-items-center rounded-r-btn text-navy-500 transition-colors hover:text-ocean-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordError && (
              <p
                id="auth-password-error"
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {passwordError}
              </p>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="auth-password-confirmation" className="field-label">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
                <input
                  id="auth-password-confirmation"
                  name="password_confirmation"
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  onBlur={() => markTouched('passwordConfirmation')}
                  placeholder="••••••••"
                  aria-invalid={Boolean(confirmationError)}
                  aria-describedby={confirmationError ? 'auth-confirmation-error' : undefined}
                  className="field pl-10 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation((v) => !v)}
                  aria-label={showPasswordConfirmation ? 'Hide password' : 'Show password'}
                  aria-pressed={showPasswordConfirmation}
                  className="absolute right-0 top-0 grid h-full w-11 place-items-center rounded-r-btn text-navy-500 transition-colors hover:text-ocean-600"
                >
                  {showPasswordConfirmation ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmationError && (
                <p
                  id="auth-confirmation-error"
                  role="alert"
                  className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {confirmationError}
                </p>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-conversion mt-2 w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
