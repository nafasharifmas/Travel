import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useItinerary } from '../../context/ItineraryContext';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Save,
  Sparkles,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

interface SavePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SavePromptModal: React.FC<SavePromptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isAuthenticated, login, register } = useAuth();
  const { stops, syncPlanToAccount, isSyncing } = useItinerary();
  const navigate = useNavigate();

  const [title, setTitle] = useState('My One-Day Route');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auth toggle for guests
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  /* ---------- UI-only state (redesign polish, no effect on the save flow) ---------- */
  const [showAuthPassword, setShowAuthPassword] = useState(false);
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

  /* ---------- Inline (advisory) validation ---------- */
  const titleError =
    touched.title && title.trim() === '' ? 'Please give your day plan a title.' : null;

  const authNameError =
    !isAuthenticated && authMode === 'register' && touched.authName && authName.trim() === ''
      ? 'Please enter your full name.'
      : null;

  const authEmailError = !isAuthenticated && touched.authEmail
    ? authEmail.trim() === ''
      ? 'Please enter your email address.'
      : !EMAIL_PATTERN.test(authEmail.trim())
        ? 'Enter a valid email address.'
        : null
    : null;

  const authPasswordError =
    !isAuthenticated && touched.authPassword && authPassword === ''
      ? 'Please enter your password.'
      : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!isAuthenticated) {
        if (authMode === 'login') {
          await login(authEmail, authPassword);
        } else {
          await register(authName, authEmail, authPassword, authPassword);
        }
      }

      await syncPlanToAccount(title, date, notes);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        navigate('/itineraries');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to save itinerary.');
    }
  };

  const authModeButtonClass = (active: boolean) =>
    `inline-flex min-h-[44px] items-center justify-center rounded-pill px-4 text-xs font-semibold transition-all duration-200 ease-premium ${
      active ? 'bg-white text-ocean-600 shadow-card' : 'text-navy-500 hover:text-navy-800'
    }`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-modal-title"
      aria-describedby="save-modal-description"
      onMouseDown={(e) => {
        // Backdrop click closes; clicks inside the panel are ignored.
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm animate-fadeIn"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="thin-scroll relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-card border border-navy-200 bg-white shadow-card-hover outline-none"
      >
        {/* Header */}
        <header className="relative bg-navy-900 px-6 pb-5 pt-6 text-white">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close save dialog"
            className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full text-navy-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <span className="eyebrow text-turquoise-300">
            <Sparkles className="h-3.5 w-3.5" />
            {isAuthenticated ? 'Save Trip Plan' : 'Preserve Guest Itinerary'}
          </span>
          <h2
            id="save-modal-title"
            className="mt-2 pr-10 font-serif text-h4 text-white"
          >
            {isAuthenticated
              ? 'Save to Personal Itineraries'
              : 'Create Account to Preserve Your Day Plan'}
          </h2>
          <p id="save-modal-description" className="mt-2 text-sm leading-relaxed text-navy-300">
            {isAuthenticated
              ? `Commit your ${stops.length}-stop plan to your personal portfolio with sequence orders and notes.`
              : 'Guest itineraries are temporary in this session. Sign in or register below to permanently sync this 1-day plan.'}
          </p>
        </header>

        {success ? (
          <div className="space-y-3 p-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-turquoise-200 bg-turquoise-50 text-turquoise-500 animate-fadeIn">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-lg font-bold text-navy-900">Itinerary Preserved!</h3>
            <p className="text-sm text-navy-500">
              Redirecting you to your personal itineraries collection...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5 p-6">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-btn border border-red-200 bg-red-50 p-3 text-xs text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Plan metadata */}
            <div className="space-y-4">
              <div>
                <label htmlFor="save-title" className="field-label">
                  Trip plan title
                </label>
                <input
                  id="save-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => markTouched('title')}
                  placeholder="e.g. Kalmunai Sunrise Shoreline Route"
                  aria-invalid={Boolean(titleError)}
                  aria-describedby={titleError ? 'save-title-error' : undefined}
                  className="field"
                />
                {titleError && (
                  <p
                    id="save-title-error"
                    role="alert"
                    className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {titleError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="save-date" className="field-label">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-ocean-500" />
                      Planned date
                    </span>
                  </label>
                  <input
                    id="save-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="field"
                  />
                </div>

                <div>
                  <span className="field-label">
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-ocean-500" />
                      Stops included
                    </span>
                  </span>
                  <div
                    className="field flex items-center bg-navy-50 font-bold text-navy-900"
                    aria-live="polite"
                  >
                    {stops.length} Verified Destinations
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="save-notes" className="field-label">
                  General notes &amp; logistics
                </label>
                <textarea
                  id="save-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Start at dawn, rent mountain scooter, bring rain poncho."
                  className="field resize-y"
                />
              </div>
            </div>

            {/* Guest authentication section */}
            {!isAuthenticated && (
              <fieldset className="space-y-4 rounded-card border border-navy-200 bg-ivory-100 p-4">
                <legend className="px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-navy-500">
                  Account required to save
                </legend>

                <div
                  role="group"
                  aria-label="Account access mode"
                  className="grid grid-cols-2 gap-1 rounded-pill bg-navy-100 p-1"
                >
                  <button
                    type="button"
                    aria-pressed={authMode === 'login'}
                    onClick={() => setAuthMode('login')}
                    className={authModeButtonClass(authMode === 'login')}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    aria-pressed={authMode === 'register'}
                    onClick={() => setAuthMode('register')}
                    className={authModeButtonClass(authMode === 'register')}
                  >
                    Register
                  </button>
                </div>

                <div className="space-y-3">
                  {authMode === 'register' && (
                    <div>
                      <label htmlFor="save-auth-name" className="field-label">
                        Full name
                      </label>
                      <input
                        id="save-auth-name"
                        type="text"
                        autoComplete="name"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        onBlur={() => markTouched('authName')}
                        placeholder="Your full name"
                        aria-invalid={Boolean(authNameError)}
                        aria-describedby={authNameError ? 'save-auth-name-error' : undefined}
                        className="field"
                      />
                      {authNameError && (
                        <p
                          id="save-auth-name-error"
                          role="alert"
                          className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
                        >
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {authNameError}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label htmlFor="save-auth-email" className="field-label">
                      Email address
                    </label>
                    <input
                      id="save-auth-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      onBlur={() => markTouched('authEmail')}
                      placeholder="you@domain.com"
                      aria-invalid={Boolean(authEmailError)}
                      aria-describedby={authEmailError ? 'save-auth-email-error' : undefined}
                      className="field"
                    />
                    {authEmailError && (
                      <p
                        id="save-auth-email-error"
                        role="alert"
                        className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {authEmailError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="save-auth-password" className="field-label">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="save-auth-password"
                        type={showAuthPassword ? 'text' : 'password'}
                        autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        onBlur={() => markTouched('authPassword')}
                        placeholder="••••••••"
                        aria-invalid={Boolean(authPasswordError)}
                        aria-describedby={authPasswordError ? 'save-auth-password-error' : undefined}
                        className="field pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAuthPassword((v) => !v)}
                        aria-label={showAuthPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showAuthPassword}
                        className="absolute right-0 top-0 grid h-full w-11 place-items-center rounded-r-btn text-navy-500 transition-colors hover:text-ocean-600"
                      >
                        {showAuthPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {authPasswordError && (
                      <p
                        id="save-auth-password-error"
                        role="alert"
                        className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {authPasswordError}
                      </p>
                    )}
                  </div>
                </div>
              </fieldset>
            )}

            <button
              type="submit"
              disabled={isSyncing}
              className="btn-conversion w-full"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preserving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Confirm &amp; Save Day Plan
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
