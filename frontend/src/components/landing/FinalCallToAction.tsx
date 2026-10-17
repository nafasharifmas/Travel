import React from 'react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../../data/assetsManifest';
import { RevealOnScroll } from '../common/RevealOnScroll';
import { useItinerary } from '../../context/ItineraryContext';
import { Compass, Navigation, ArrowRight, Sparkles } from 'lucide-react';

export const FinalCallToAction: React.FC = () => {
  const { setIsDrawerOpen } = useItinerary();

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-charcoal-950 text-white overflow-hidden">
      {/* Background Photography with atmospheric overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={ASSETS.cta.image}
          alt={ASSETS.cta.alt}
          loading="lazy"
          className="w-full h-full object-cover scale-105 opacity-40 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/70 to-charcoal-950/90" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        <RevealOnScroll direction="up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-[11px] font-serif tracking-[0.25em] uppercase mb-2 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Begin Your Expedition
          </div>

          <h2 className="text-4xl sm:text-6xl font-serif font-bold text-ivory-50 tracking-tight leading-[1.1]">
            Your next story starts somewhere.
          </h2>

          <p className="text-base sm:text-lg text-sand-200 font-sans font-light max-w-xl mx-auto leading-relaxed">
            Discover a journey that feels like it was made for you. Handcrafted itineraries, real coordinates, zero guesswork.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-sans font-bold text-xs tracking-widest uppercase transition-all shadow-xl shadow-gold-500/20 hover:scale-105 active:scale-95"
            >
              Start Planning Your Journey
            </button>

            <Link
              to="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 text-ivory-100 border border-sand-400/20 font-sans font-semibold text-xs tracking-widest uppercase transition-all hover:scale-105"
            >
              <Navigation className="w-4 h-4 text-sky-400" />
              <span>Explore Interactive Route Map</span>
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

