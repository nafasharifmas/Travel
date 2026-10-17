import React from 'react';
import { ASSETS } from '../../data/assetsManifest';
import { Compass, ArrowDown, MapPin, Sparkles, Navigation } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onDiscoverClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onDiscoverClick,
}) => {
  return (
    <section className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-charcoal-950 text-white">
      {/* Cinematic Full-Bleed Background with Ken Burns motion */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={ASSETS.hero.image}
          alt={ASSETS.hero.alt}
          fetchPriority="high"
          className="w-full h-full object-cover object-center scale-105 animate-kenburns opacity-70 filter brightness-[0.82] contrast-[1.05]"
        />
        {/* Layered Atmospheric Vignette Overlays for flawless contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-charcoal-950/70" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-charcoal-950/30 to-charcoal-950/80" />
      </div>

      {/* Floating Geographic Coordinates Anchor Badge */}
      <div className="absolute top-28 sm:top-24 right-4 sm:right-8 z-20 hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-charcoal-950/60 backdrop-blur-md border border-sand-400/20 text-[11px] text-sand-200 tracking-wide font-mono animate-in fade-in duration-700">
        <Navigation className="w-3.5 h-3.5 text-sky-400" />
        <span>Origin Anchor: 7.4394° N, 81.8172° E</span>
      </div>

      {/* Hero Content Staggered Composition */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16 flex flex-col items-center">
        {/* Eyebrow Label */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-[11px] sm:text-xs font-serif tracking-[0.25em] uppercase mb-6 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          The World, More Intimately
        </div>

        {/* Editorial Serif Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-ivory-50 tracking-tight leading-[1.08] max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          Find your way to somewhere{' '}
          <span className="italic font-normal text-gold-300">extraordinary</span>.
        </h1>

        {/* Concise Supporting Copy */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-sand-200 max-w-2xl font-sans font-light leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-900">
          Thoughtfully curated journeys for the places that stay with you long after you return. Unhurried routes, living culture, and wild horizons.
        </p>

        {/* Action Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <button
            type="button"
            onClick={onExploreClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-sans font-bold text-xs tracking-widest uppercase transition-all shadow-lg shadow-gold-500/25 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-gold-400"
          >
            Explore Destinations
          </button>

          <button
            type="button"
            onClick={onDiscoverClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-charcoal-900/80 hover:bg-charcoal-900 text-ivory-100 border border-sand-400/30 hover:border-gold-400/60 font-sans font-medium text-xs tracking-widest uppercase transition-all backdrop-blur-sm hover:scale-105 active:scale-95 focus:ring-2 focus:ring-gold-400"
          >
            Discover Your Journey
          </button>
        </div>
      </div>

      {/* Subtle Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
        <span className="text-[10px] tracking-[0.25em] text-sand-300 uppercase font-sans">
          Scroll to explore
        </span>
        <div className="w-5 h-8 rounded-full border border-sand-400/30 flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-gold-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

