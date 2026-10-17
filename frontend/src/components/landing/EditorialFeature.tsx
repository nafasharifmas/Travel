import React from 'react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../../data/assetsManifest';
import { RevealOnScroll } from '../common/RevealOnScroll';
import { Compass, ArrowRight, MapPin, Sparkles, Navigation } from 'lucide-react';

export const EditorialFeature: React.FC = () => {
  const feat = ASSETS.editorial.feature;

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-sand-50 text-charcoal-950 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Layered Editorial Photography (7 Cols) */}
          <div className="lg:col-span-7 relative">
            <RevealOnScroll direction="right">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-sand-300 aspect-[4/3] bg-charcoal-900 group">
                <img
                  src={feat.image}
                  alt={feat.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 via-transparent to-transparent" />

                {/* Overlaid Location Badge */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                  <span className="flex items-center gap-1.5 text-xs font-mono tracking-wide text-sand-200 bg-charcoal-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-sand-400/20">
                    <Navigation className="w-3.5 h-3.5 text-sky-400" />
                    {feat.location}
                  </span>
                </div>
              </div>

              {/* Floating Decorative Accent Badge */}
              <div className="hidden sm:block absolute -bottom-6 -right-6 z-20 bg-charcoal-950 text-white p-6 rounded-2xl shadow-xl border border-gold-500/30 max-w-xs animate-float">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400 font-bold block mb-1">
                  Stewardship Standard
                </span>
                <p className="text-xs font-serif text-sand-200 leading-snug">
                  {feat.stat}
                </p>
              </div>
            </RevealOnScroll>
          </div>

          {/* Right Column: Editorial Narrative & CTA (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <RevealOnScroll direction="left" delayMs={100}>
              <span className="text-[11px] font-serif uppercase tracking-[0.25em] text-gold-600 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                The Philosophy
              </span>

              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-charcoal-950 tracking-tight leading-[1.15] mt-3">
                {feat.headline}
              </h2>

              <p className="text-sm font-serif italic text-stone-600 text-lg">
                "{feat.subhead}"
              </p>

              <p className="text-sm sm:text-base text-stone-700 font-sans font-light leading-relaxed">
                {feat.body}
              </p>

              {/* Action */}
              <div className="pt-4 flex items-center gap-4">
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-charcoal-950 hover:bg-charcoal-800 text-white text-xs font-bold tracking-widest uppercase transition-all shadow-md hover:scale-105"
                >
                  <span>Explore Corridor Route</span>
                  <ArrowRight className="w-4 h-4 text-gold-400" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};

