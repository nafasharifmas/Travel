import React, { useState } from 'react';
import { ASSETS } from '../../data/assetsManifest';
import { RevealOnScroll } from '../common/RevealOnScroll';
import { Compass, Sparkles, ArrowRight, X, Check, MapPin } from 'lucide-react';

export const ExperienceSection: React.FC = () => {
  const [selectedExp, setSelectedExp] = useState<any | null>(null);

  return (
    <section id="experiences" className="py-24 px-4 sm:px-6 lg:px-8 bg-forest-950 text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-forest-800/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Section Title */}
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[11px] font-serif uppercase tracking-[0.25em] text-gold-400 font-bold flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Ways of Seeing
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-ivory-50 tracking-tight">
              Signature Experiences
            </h2>
            <p className="text-sm sm:text-base text-sand-300 font-sans font-light leading-relaxed">
              We design journeys around depth rather than distance. Four distinct philosophies for experiencing the natural and cultural architecture of our world.
            </p>
          </div>
        </RevealOnScroll>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ASSETS.experiences.map((exp, idx) => (
            <RevealOnScroll key={exp.id} direction="up" delayMs={100 * (idx + 1)}>
              <div
                onClick={() => setSelectedExp(exp)}
                className="group relative h-[420px] rounded-3xl overflow-hidden cursor-pointer border border-sand-400/15 bg-forest-900/40 p-6 flex flex-col justify-between transition-all duration-300 hover:border-gold-400/50 hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-45 group-hover:opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/70 to-forest-950/30" />
                </div>

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-forest-900/80 backdrop-blur-md text-[10px] font-mono tracking-widest uppercase text-gold-400 border border-gold-500/20">
                    {exp.badge}
                  </span>
                  <span className="text-xs font-serif text-sand-300">
                    0{idx + 1}
                  </span>
                </div>

                {/* Bottom Narrative */}
                <div className="relative z-10 space-y-2">
                  <span className="text-[10px] font-serif uppercase tracking-widest text-gold-300/80">
                    {exp.eyebrow}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-ivory-50 group-hover:text-gold-300 transition-colors">
                    {exp.title}
                  </h3>
                  <p className="text-xs text-sand-300 font-light line-clamp-3 leading-relaxed">
                    {exp.description}
                  </p>

                  <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-gold-400 group-hover:translate-x-1 transition-transform">
                    <span>Explore Experience</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      {/* Experience Detail Modal */}
      {selectedExp && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-in fade-in"
        >
          <div className="bg-charcoal-900 border border-sand-400/20 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-ivory-100 animate-in zoom-in-95">
            <div className="relative h-56">
              <img
                src={selectedExp.image}
                alt={selectedExp.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedExp(null)}
                aria-label="Close dialog"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-charcoal-950/80 backdrop-blur-sm text-sand-200 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6">
                <span className="px-3 py-1 rounded-full bg-gold-500 text-charcoal-950 font-bold text-[10px] uppercase tracking-wider">
                  {selectedExp.badge}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <span className="text-xs font-serif uppercase tracking-widest text-gold-400">
                {selectedExp.eyebrow}
              </span>
              <h3 className="text-2xl font-serif font-bold text-ivory-50">
                {selectedExp.title}
              </h3>
              <p className="text-sm text-sand-200 font-light leading-relaxed">
                {selectedExp.description}
              </p>

              <div className="p-4 bg-forest-900/50 rounded-2xl border border-forest-700/30 text-xs text-sand-300 space-y-1.5">
                <p className="font-bold text-gold-300">Expedition Notes:</p>
                <p className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  Small group departures limited to 8 travelers
                </p>
                <p className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  Tailored sequence order with localized host guides
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedExp(null)}
                  className="px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Close Overview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

