import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Globe, Heart, ShieldCheck, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const SiteFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-charcoal-950 text-sand-300 border-t border-sand-400/15 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Info (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold-500 text-charcoal-950 flex items-center justify-center font-black">
                <Compass className="w-5 h-5 text-charcoal-950" />
              </div>
              <span className="text-xl font-serif font-bold tracking-[0.15em] text-ivory-50 uppercase">
                Aether Expeditions
              </span>
            </div>

            <p className="text-xs text-sand-400 leading-relaxed font-light max-w-sm">
              Thoughtfully curated journeys for places that stay with you long after you return. Combining digital editorial storytelling with real-time spatial route discovery.
            </p>

            <div className="flex items-center gap-4 text-xs text-sand-400 pt-1">
              <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                Verified Catalogue
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                7.4394° N, 81.8172° E Anchor
              </span>
            </div>
          </div>

          {/* Quick Nav Links (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-serif uppercase tracking-widest text-gold-400 font-bold">
              Destinations
            </h4>
            <ul className="space-y-2 text-xs font-light">
              <li>
                <Link to="/explore" className="hover:text-gold-300 transition-colors">
                  Dolomites, Italy
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-gold-300 transition-colors">
                  Kyoto, Japan
                </Link>
              </li>
              <li>
                <Link to="/places/maruthamunai-beach" className="hover:text-gold-300 transition-colors">
                  Eastern Shore (0.5 km)
                </Link>
              </li>
              <li>
                <Link to="/places/sigiriya-ancient-rock-citadel" className="hover:text-gold-300 transition-colors">
                  Sigiriya Ancient Citadel
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-gold-300 transition-colors font-medium text-gold-400">
                  All Mapped Places →
                </Link>
              </li>
            </ul>
          </div>

          {/* Experiences & Journal (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-serif uppercase tracking-widest text-gold-400 font-bold">
              Journal & Notes
            </h4>
            <ul className="space-y-2 text-xs font-light">
              <li>
                <a href="#journal" className="hover:text-gold-300 transition-colors">
                  The Quiet Side of Kyoto
                </a>
              </li>
              <li>
                <a href="#journal" className="hover:text-gold-300 transition-colors">
                  High Alta Via Dolomiti
                </a>
              </li>
              <li>
                <a href="#journal" className="hover:text-gold-300 transition-colors">
                  Eastern Shoreline Solitude
                </a>
              </li>
              <li>
                <Link to="/itineraries" className="hover:text-gold-300 transition-colors">
                  Personal Day Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Demo (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-serif uppercase tracking-widest text-gold-400 font-bold">
              Field Dispatches Newsletter
            </h4>
            <p className="text-xs text-sand-400 leading-relaxed font-light">
              Receive seasonal essays, newly mapped routes, and quiet travel photography once a month.
            </p>

            {subscribed ? (
              <div className="p-3 bg-forest-900/60 border border-gold-500/30 rounded-2xl flex items-center gap-2 text-xs text-gold-300">
                <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Thank you. You will receive our next seasonal dispatch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-2.5 bg-charcoal-900 border border-sand-400/20 rounded-full text-xs text-ivory-100 placeholder-stone-500 focus:outline-none focus:border-gold-500 font-sans"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to dispatches"
                  className="px-4 py-2.5 rounded-full bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FR-14 Attribution & Copyright Line */}
        <div className="pt-8 border-t border-sand-400/10 flex flex-col sm:flex-row items-center justify-between text-xs text-sand-400 gap-4">
          <p>
            © {currentYear} Aether Expeditions · Built on Visitflow Production Baseline.
          </p>

          <p className="text-[11px] text-stone-500 flex items-center gap-1">
            Spatial data &copy;{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 underline hover:text-gold-300"
            >
              OpenStreetMap
            </a>{' '}
            contributors (FR-14 compliance)
          </p>

          <p className="flex items-center gap-1 text-[11px]">
            Designed with <Heart className="w-3 h-3 text-gold-500 fill-gold-500" /> for purposeful discovery
          </p>
        </div>
      </div>
    </footer>
  );
};

