import React from 'react';
import { RevealOnScroll } from '../common/RevealOnScroll';
import { Compass, Calendar, MapPin, Sparkles, Navigation, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Discover',
      tagline: 'Curated Places & Real Coordinates',
      description:
        'Explore verified destinations and cultural sanctuaries mapped with real geographic coordinates from your exact anchor location.',
      icon: Compass,
    },
    {
      step: '02',
      title: 'Personalize',
      tagline: 'Sequence-Ordered Stops & Notes',
      description:
        'Assemble your coherent one-day journey draft. Set planned visit times, add custom notes, and drag-to-reorder your route sequence.',
      icon: Calendar,
    },
    {
      step: '03',
      title: 'Set Out',
      tagline: 'Live Route Maps & Saved Portfolio',
      description:
        'Navigate with synchronized Leaflet spatial maps, direct kilometer distances, and ownership-protected itineraries on any device.',
      icon: Navigation,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-ivory-100 text-charcoal-950 border-t border-sand-300">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <RevealOnScroll direction="up">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-serif uppercase tracking-[0.25em] text-gold-600 font-bold flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              The Planning Experience
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-charcoal-950 tracking-tight">
              How Aether Works
            </h2>
            <p className="text-sm sm:text-base text-stone-600 font-sans font-light leading-relaxed">
              Three seamless steps from initial curiosity to your departure morning.
            </p>
          </div>
        </RevealOnScroll>

        {/* Steps Progression Grid */}
        <div className="relative">
          {/* Desktop Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-24 right-24 h-0.5 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 -translate-y-12 z-0 opacity-40" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <RevealOnScroll key={item.step} direction="up" delayMs={120 * (idx + 1)}>
                  <div className="bg-white rounded-3xl p-8 border border-sand-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 space-y-5 h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Step Number & Icon */}
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-serif font-black text-gold-600/90 tracking-tight">
                          {item.step}
                        </span>
                        <div className="w-12 h-12 rounded-2xl bg-sand-100 flex items-center justify-center text-charcoal-950 shadow-inner">
                          <Icon className="w-6 h-6 text-gold-600" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-sand-500">
                          {item.tagline}
                        </span>
                        <h3 className="text-2xl font-serif font-bold text-charcoal-950">
                          {item.title}
                        </h3>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-600 font-sans font-light leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-sand-100 flex items-center gap-2 text-xs font-bold text-charcoal-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Ready in session</span>
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

