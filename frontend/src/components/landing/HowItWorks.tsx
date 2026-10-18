import React from 'react';
import { RevealOnScroll } from '../common/RevealOnScroll';
import { Compass, SlidersHorizontal, Route, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    step: '01',
    title: 'Discover',
    tagline: 'Real places, verified coordinates',
    description:
      'Browse a verified catalogue of destinations, each mapped with real geographic coordinates you can trust.',
    icon: Compass,
  },
  {
    step: '02',
    title: 'Personalize',
    tagline: 'Sequence your own route',
    description:
      'Add stops to your trip plan, reorder them into a coherent day, and keep notes for each place.',
    icon: SlidersHorizontal,
  },
  {
    step: '03',
    title: 'Explore',
    tagline: 'Follow the route on the map',
    description:
      'See every stop mapped with distances, then save your itinerary and reopen it on any device.',
    icon: Route,
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="section-shell bg-ivory-200/60 border-y border-navy-200">
      <div className="container-page space-y-12">
        <RevealOnScroll direction="up">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="eyebrow justify-center">
              <Sparkles className="w-3.5 h-3.5" />
              The planning experience
            </span>
            <h2 className="text-h2">How Visitflow Works</h2>
            <p className="text-sm sm:text-base text-navy-600 leading-relaxed">
              Three clear steps from first curiosity to your departure morning.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <RevealOnScroll key={item.step} direction="up" delayMs={120 * (idx + 1)} className="h-full">
                <div className="card card-hover h-full p-7 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <span aria-hidden="true" className="text-3xl font-serif font-bold text-navy-400">{item.step}</span>
                    <span className="grid place-items-center w-12 h-12 rounded-2xl bg-ocean-50 text-ocean-600 border border-ocean-100">
                      <Icon className="w-6 h-6" />
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ocean-600">
                      {item.tagline}
                    </span>
                    <h3 className="text-h3">{item.title}</h3>
                  </div>

                  <p className="text-sm text-navy-600 leading-relaxed flex-1">{item.description}</p>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Link to="/explore" className="btn-primary">
            Start planning
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
