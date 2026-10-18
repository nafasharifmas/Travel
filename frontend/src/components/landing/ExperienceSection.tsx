import React, { useState } from 'react';
import { ASSETS } from '../../data/assetsManifest';
import { RevealOnScroll } from '../common/RevealOnScroll';
import { Sparkles, ArrowRight, X, Check, Landmark, Mountain, Waves, Bird } from 'lucide-react';

type Experience = (typeof ASSETS.experiences)[number];

const ICONS: Record<string, React.ElementType> = {
  'slow-cultural': Landmark,
  'alpine-wilderness': Mountain,
  'coastal-lagoon': Waves,
  'wildlife-ecology': Bird,
};

export const ExperienceSection: React.FC = () => {
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);

  return (
    <section id="experiences" className="section-shell relative bg-navy-950 text-white overflow-hidden">
      {/* Ambient depth */}
      <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-ocean-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] bg-turquoise-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container-page space-y-12 relative z-10">
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="eyebrow justify-center text-turquoise-300">
              <Sparkles className="w-3.5 h-3.5" />
              Ways of seeing
            </span>
            <h2 className="text-h2 text-white">Signature Experiences</h2>
            <p className="text-sm sm:text-base text-navy-200 leading-relaxed">
              We design journeys around depth rather than distance — four distinct philosophies for
              experiencing the natural and cultural architecture of a place.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ASSETS.experiences.map((exp, idx) => {
            const Icon = ICONS[exp.id] ?? Sparkles;
            return (
              <RevealOnScroll key={exp.id} direction="up" delayMs={100 * (idx + 1)} className="h-full">
                <button
                  type="button"
                  onClick={() => setSelectedExp(exp)}
                  className="group relative block w-full h-full min-h-[380px] rounded-media overflow-hidden text-left border border-white/10 hover:border-turquoise-400/50 transition-all duration-300 ease-premium hover:-translate-y-1 shadow-card"
                >
                  <img
                    src={exp.image}
                    alt={exp.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Stronger overlay to keep text AA-readable */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/80 to-navy-950/35" />

                  <div className="relative z-10 flex flex-col justify-between h-full p-6">
                    <div className="flex items-center justify-between">
                      <span className="grid place-items-center w-11 h-11 rounded-2xl bg-navy-950/65 backdrop-blur-md border border-white/20 text-turquoise-300">
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="text-xs font-semibold text-navy-100 px-2.5 py-1 rounded-pill bg-navy-950/75 border border-white/15">
                        {exp.badge}
                      </span>
                    </div>

                    <div className="space-y-2 mt-6">
                      <span className="text-[11px] uppercase tracking-[0.16em] text-turquoise-300 font-semibold">
                        {exp.eyebrow}
                      </span>
                      <h3 className="text-xl font-bold font-serif text-white leading-snug">
                        {exp.title}
                      </h3>
                      <p className="text-xs text-navy-200 line-clamp-3 leading-relaxed">
                        {exp.description}
                      </p>
                      <span className="inline-flex items-center gap-1.5 pt-2 text-xs font-semibold text-turquoise-300 group-hover:gap-2.5 transition-all">
                        Explore experience
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>

      {/* Experience detail modal */}
      {selectedExp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedExp.title}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedExp(null)}
        >
          <div
            className="bg-white rounded-media w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-card-hover text-navy-900 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-52">
              <img src={selectedExp.image} alt={selectedExp.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
              <button
                type="button"
                onClick={() => setSelectedExp(null)}
                aria-label="Close dialog"
                className="absolute top-4 right-4 grid place-items-center w-10 h-10 rounded-full bg-white/90 text-navy-800 hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-4 left-6 px-3 py-1 rounded-pill bg-turquoise-500 text-navy-950 text-[10px] font-bold uppercase tracking-wider">
                {selectedExp.badge}
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <span className="eyebrow">{selectedExp.eyebrow}</span>
              <h3 className="text-h3">{selectedExp.title}</h3>
              <p className="text-sm text-navy-600 leading-relaxed">{selectedExp.description}</p>

              <div className="p-4 rounded-card bg-ocean-50 border border-ocean-100 space-y-2 text-sm text-navy-700">
                <p className="font-semibold text-ocean-600">How Visitflow maps it</p>
                <p className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-ocean-500 shrink-0 mt-0.5" />
                  Every stop carries verified coordinates you can route between.
                </p>
                <p className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-ocean-500 shrink-0 mt-0.5" />
                  Sequence your day plan, then save or reopen it any time.
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button type="button" onClick={() => setSelectedExp(null)} className="btn-primary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
