import React from 'react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../../data/assetsManifest';
import { RevealOnScroll } from '../common/RevealOnScroll';
import { useItinerary } from '../../context/ItineraryContext';
import { Navigation, Sparkles } from 'lucide-react';

export const FinalCallToAction: React.FC = () => {
  const { setIsDrawerOpen } = useItinerary();

  return (
    <section className="relative section-shell bg-navy-950 text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={ASSETS.cta.image}
          alt={ASSETS.cta.alt}
          loading="lazy"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/70 to-navy-950/95" />
      </div>

      <div className="relative z-10 container-page text-center max-w-3xl mx-auto space-y-6">
        <RevealOnScroll direction="up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white/10 border border-white/20 text-white text-[11px] font-semibold tracking-[0.2em] uppercase backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-turquoise-300" />
            Start your journey
          </span>

          <h2 className="text-h2 text-white mt-5">Your next story starts somewhere.</h2>

          <p className="text-base text-navy-100 max-w-xl mx-auto leading-relaxed">
            Discover destinations that feel made for you — handcrafted routes, real coordinates,
            zero guesswork.
          </p>

          <div className="pt-5 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="btn-conversion w-full sm:w-auto px-8"
            >
              Plan Your Trip
            </button>

            <Link to="/explore" className="btn-on-dark w-full sm:w-auto px-8">
              <Navigation className="w-4 h-4 text-turquoise-300" />
              <span>Explore Interactive Route Map</span>
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};
