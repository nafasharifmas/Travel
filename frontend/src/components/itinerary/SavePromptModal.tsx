import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useItinerary } from '../../context/ItineraryContext';
import { useNavigate } from 'react-router-dom';
import { X, Save, Sparkles, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface SavePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavePromptModal: React.FC<SavePromptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isAuthenticated, login, register } = useAuth();
  const { stops, syncPlanToAccount, isSyncing } = useItinerary();
  const navigate = useNavigate();

  const [title, setTitle] = useState('My One-Day Expedition');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auth toggle for guests
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  if (!isOpen) return null;

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-sand-200 overflow-hidden text-espresso-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#1c1917] text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close save dialog"
            className="absolute top-5 right-5 text-sand-400 hover:text-white p-1 rounded-full focus:ring-2 focus:ring-amber-500"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            {isAuthenticated ? 'Save Trip Plan' : 'Preserve Guest Itinerary'}
          </div>
          <h2 className="text-xl font-bold font-sans">
            {isAuthenticated ? 'Save to Personal Itineraries' : 'Create Account to Preserve Your Day Plan'}
          </h2>
          <p className="text-sand-300 text-xs mt-1 leading-relaxed">
            {isAuthenticated
              ? `Commit your ${stops.length}-stop plan to your personal portfolio with sequence orders and notes.`
              : 'Guest itineraries are temporary in this session. Sign in or register below to permanently sync this 1-day plan.'}
          </p>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-stone-900">
              Itinerary Preserved!
            </h3>
            <p className="text-xs text-stone-500">
              Redirecting you to your personal itineraries collection...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {error && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Plan Metadata */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Trip Plan Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ella Green Mountain Vista Expedition"
                  className="w-full px-3 py-2 text-sm bg-sand-50 border border-sand-300 rounded-lg text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    Planned Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-sand-50 border border-sand-300 rounded-lg text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    Stops Included
                  </label>
                  <div className="px-3 py-2 text-xs bg-sand-100/70 border border-sand-200 rounded-lg text-stone-800 font-bold">
                    {stops.length} Verified Destinations
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  General Notes & Logistics
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Start at dawn, rent mountain scooter, bring rain poncho."
                  className="w-full px-3 py-2 text-xs bg-sand-50 border border-sand-300 rounded-lg text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* If Guest: Auth Section */}
            {!isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-sand-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                    Account Required to Save
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                        authMode === 'login'
                          ? 'bg-amber-500 text-espresso-950'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                        authMode === 'register'
                          ? 'bg-amber-500 text-espresso-950'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Register
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {authMode === 'register' && (
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-sand-50 border border-sand-300 rounded-lg"
                    />
                  )}
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-sand-50 border border-sand-300 rounded-lg"
                  />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-sand-50 border border-sand-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSyncing}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-espresso-950 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4 hover:scale-[1.01]"
            >
              <Save className="w-4 h-4" />
              {isSyncing ? 'Preserving...' : 'Confirm & Save Day Plan'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

