import React from 'react';
import { ASSETS } from '../../data/assetsManifest';
import { Navigation, ArrowDown } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onDiscoverClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onDiscoverClick,
}) => {
  return (
    <section className="relative min-h-[600px] lg:min-h-[680px] flex items-center justify-center overflow-hidden bg-navy-950 text-white">
      {/* Cinematic destination photograph */}
      <div className="absolute inset-0 z-0">
        <video
          src={ASSETS.hero.image}
          aria-label={ASSETS.hero.alt}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-center scale-105"
        />
      </div>

      {/* Verified origin anchor */}
      <div className="absolute top-24 lg:top-28 right-4 sm:right-8 z-20 hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-navy-950/45 backdrop-blur-md border border-white/15 text-[11px] text-navy-100 tracking-wide">
        <Navigation className="w-3.5 h-3.5 text-turquoise-400" />
        <span>Origin · 7.4394° N, 81.8172° E</span>
      </div>

      {/* Hero content */}
      <div className="relative z-10 container-page text-center pt-28 pb-24 lg:pt-32 lg:pb-28 flex flex-col items-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white/10 border border-white/20 text-white text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-6 backdrop-blur-sm animate-fadeInUp">
          The Eastern Corridor, mapped properly
        </span>

        <h1 className="text-hero font-serif font-bold text-white max-w-4xl animate-fadeInUp [animation-delay:80ms]">
          Find your way to somewhere{' '}
          <span className="italic font-normal text-turquoise-300">extraordinary</span>.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-navy-100 max-w-2xl leading-relaxed animate-fadeInUp [animation-delay:160ms]">
          Real destinations with verified coordinates, unhurried routes and living culture —
          all measured from where you actually are.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto animate-fadeInUp [animation-delay:240ms]">
          <button type="button" onClick={onExploreClick} className="btn-primary w-full sm:w-auto px-8">
            Explore Destinations
          </button>
          <button type="button" onClick={onDiscoverClick} className="btn-on-dark w-full sm:w-auto px-8">
            Discover Our Journeys
          </button>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-navy-200">
        <span className="text-[10px] tracking-[0.25em] uppercase">Scroll to explore</span>
        <ArrowDown className="w-4 h-4 animate-bounce" />
      </div>
    </section>
  );
};
