import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface FooterLink {
  label: string;
  to: string;
}

const EXPLORE_LINKS: FooterLink[] = [
  { label: 'All Destinations', to: '/explore' },
  { label: 'Maruthamunai Beach', to: '/places/maruthamunai-beach' },
  { label: 'Kallady Beach', to: '/places/kallady-beach' },
  { label: 'Deegawapi Raja Maha Vihara', to: '/places/deegawapi-raja-maha-vihara' },
  { label: 'Kattankudy Heritage Museum', to: '/places/kattankudy-heritage-museum' },
];

const DISCOVER_LINKS: FooterLink[] = [
  { label: 'Featured Destinations', to: '/#destinations' },
  { label: 'Signature Experiences', to: '/#experiences' },
  { label: 'How Visitflow Works', to: '/#how-it-works' },
  { label: 'Travel Journal', to: '/#journal' },
  { label: 'Saved Itineraries', to: '/itineraries' },
];

export const SiteFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  const validate = (value: string) => {
    if (!value.trim()) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) {
      return 'Please enter a valid email address.';
    }
    return null;
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const message = validate(email);
    if (message) {
      setError(message);
      setStatus('error');
      return;
    }
    setError(null);
    setStatus('success');
    setEmail('');
  };

  return (
    <footer className="bg-navy-900 text-navy-300">
      <div className="container-page py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-4 space-y-5">
            <Link
              to="/"
              className="inline-flex items-center gap-3.5 group focus:outline-none"
              aria-label="Visitflow home"
            >
              <img
                src="/visitflow-mark.png"
                alt="Visitflow"
                className="h-10 w-auto rounded-xl object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
              />
              <span className="text-2xl font-bold tracking-tight text-white font-sans group-hover:text-turquoise-300 transition-colors">
                Visitflow
              </span>
            </Link>

            <p className="text-sm text-navy-300/90 leading-relaxed max-w-sm">
              A modern travel discovery platform for the places that stay with you. Real destinations,
              verified coordinates, and coherent routes you can actually follow.
            </p>

            <span className="inline-flex items-center gap-1.5 text-xs text-navy-400">
              <ShieldCheck className="w-4 h-4 text-turquoise-400" />
              Verified destination catalogue
            </span>
          </div>

          {/* Explore */}
          <nav className="md:col-span-2 space-y-3" aria-label="Explore destinations">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Explore</h2>
            <ul className="space-y-2.5 text-sm">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-navy-300/90 hover:text-turquoise-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Discover */}
          <nav className="md:col-span-2 space-y-3" aria-label="Discover">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Discover</h2>
            <ul className="space-y-2.5 text-sm">
              {DISCOVER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-navy-300/90 hover:text-turquoise-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter */}
          <div className="md:col-span-4 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Field Dispatches
            </h2>
            <p className="text-sm text-navy-300/90 leading-relaxed">
              Seasonal essays, newly mapped routes, and quiet travel photography — once a month.
            </p>

            {status === 'success' ? (
              <div className="flex items-center gap-2 p-3.5 rounded-btn bg-white/5 border border-turquoise-400/40 text-sm text-turquoise-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-turquoise-300" />
                <span>You're subscribed. Look out for the next dispatch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} noValidate className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                    <input
                      type="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') {
                          setStatus('idle');
                          setError(null);
                        }
                      }}
                      placeholder="you@example.com"
                      aria-label="Email address"
                      aria-invalid={status === 'error'}
                      className="w-full min-h-[44px] pl-10 pr-3 rounded-btn bg-white/5 border border-white/15 text-sm text-white placeholder-navy-400 focus:outline-none focus:border-turquoise-400 focus:ring-2 focus:ring-turquoise-400/25"
                    />
                  </div>
                  <button
                    type="submit"
                    aria-label="Subscribe to field dispatches"
                    className="grid place-items-center w-11 h-11 rounded-btn bg-turquoise-500 hover:bg-turquoise-400 text-navy-950 transition-colors shrink-0"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
                {status === 'error' && error && (
                  <p role="alert" className="flex items-center gap-1.5 text-xs text-red-300">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {error}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Legal + attribution */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-navy-400">
          <p>© {currentYear} Visitflow. All rights reserved.</p>

          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
            <span>
              Destination photography via{' '}
              <a
                href="https://commons.wikimedia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-turquoise-300 underline underline-offset-2 hover:text-turquoise-200"
              >
                Wikimedia Commons
              </a>
            </span>
            <span className="hidden sm:inline text-white/60">•</span>
            <span>
              Map data ©{' '}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="text-turquoise-300 underline underline-offset-2 hover:text-turquoise-200"
              >
                OpenStreetMap
              </a>{' '}
              contributors
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};
