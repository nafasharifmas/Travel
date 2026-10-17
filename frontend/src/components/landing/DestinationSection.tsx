import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../../data/assetsManifest';
import { RevealOnScroll } from '../common/RevealOnScroll';
import { ArrowUpRight, MapPin, Sparkles, Clock } from 'lucide-react';

export const DestinationSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'coastal' | 'heritage'>('all');

  const destinationList = Object.values(ASSETS.destinations);

  const filtered = destinationList.filter((d) => {
    if (activeFilter === 'all') return true;
    return (d.categories || []).includes(activeFilter);
  });

  return (
    <section id="destinations" className="py-24 px-4 sm:px-6 lg:px-8 bg-ivory-100 text-charcoal-950">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <RevealOnScroll direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-sand-300 pb-8">
            <div className="space-y-3 max-w-2xl">
              <span className="text-[11px] font-serif uppercase tracking-[0.25em] text-gold-600 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                The Eastern Corridor
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-charcoal-950 tracking-tight leading-tight">
                Ten stops. One shoreline.
              </h2>
              <p className="text-sm sm:text-base text-stone-600 font-sans font-light leading-relaxed">
                Sunrise beaches, lagoon villages, and centuries-old sanctuaries — all within 25 km of your origin at Maruthamunai (7.4394, 81.8172). Real places, measured distances, no crowds.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
                  activeFilter === 'all'
                    ? 'bg-charcoal-950 text-white shadow-md'
                    : 'bg-sand-200/60 text-stone-700 hover:bg-sand-200'
                }`}
              >
                All Destinations
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('coastal')}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
                  activeFilter === 'coastal'
                    ? 'bg-charcoal-950 text-white shadow-md'
                    : 'bg-sand-200/60 text-stone-700 hover:bg-sand-200'
                }`}
              >
                Coastal Sanctuaries
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('heritage')}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
                  activeFilter === 'heritage'
                    ? 'bg-charcoal-950 text-white shadow-md'
                    : 'bg-sand-200/60 text-stone-700 hover:bg-sand-200'
                }`}
              >
                Sacred & Heritage
              </button>
            </div>
          </div>
        </RevealOnScroll>

        {/* Asymmetrical Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Lead Card (7 Cols on Desktop) */}
          {filtered[0] && (
            <div className="md:col-span-7 flex flex-col">
              <RevealOnScroll direction="up" delayMs={50} className="h-full">
                <Link
                  to={`/places/${filtered[0].slug}`}
                  className="group relative h-full min-h-[460px] sm:min-h-[520px] rounded-3xl overflow-hidden block shadow-xl transition-all duration-300 hover:shadow-2xl"
                >
                  <img
                    src={filtered[0].image}
                    alt={filtered[0].title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                    <span className="px-3.5 py-1.5 rounded-full bg-charcoal-950/70 text-gold-300 backdrop-blur-md text-[11px] font-serif font-bold uppercase tracking-wider border border-gold-500/30">
                      Featured Destination · {filtered[0].tag}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-gold-500 group-hover:text-charcoal-950 transition-colors">
                      <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  {/* Bottom Editorial Content */}
                  <div className="absolute bottom-8 left-6 right-6 text-white space-y-2">
                    <p className="text-xs text-sand-300 font-sans tracking-widest uppercase flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gold-400" />
                      {filtered[0].region}
                    </p>
                    <h3 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-ivory-50 group-hover:text-gold-300 transition-colors">
                      {filtered[0].title}
                    </h3>
                    <p className="text-xs sm:text-sm text-sand-200 line-clamp-2 max-w-xl font-light leading-relaxed">
                      {filtered[0].description}
                    </p>

                    <div className="pt-3 flex items-center gap-4 text-xs text-sand-300 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gold-400" />
                        {filtered[0].duration}
                      </span>
                      <span>Season: {filtered[0].season}</span>
                    </div>
                  </div>
                </Link>
              </RevealOnScroll>
            </div>
          )}

          {/* Right Side Stacked Cards (5 Cols on Desktop) */}
          <div className="md:col-span-5 flex flex-col gap-8 justify-between">
            {filtered.slice(1, 3).map((dest, idx) => (
              <RevealOnScroll key={dest.id} direction="up" delayMs={100 * (idx + 1)} className="flex-1">
                <Link
                  to={`/places/${dest.slug}`}
                  className="group relative h-full min-h-[240px] rounded-3xl overflow-hidden block shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  <img
                    src={dest.image}
                    alt={dest.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-charcoal-950/70 text-gold-300 backdrop-blur-md text-[10px] font-serif font-bold uppercase tracking-wider border border-gold-500/20">
                      {dest.tag}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-gold-500 group-hover:text-charcoal-950 transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                    <p className="text-[11px] text-sand-300 tracking-wider uppercase">
                      {dest.region}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-ivory-50 group-hover:text-gold-300 transition-colors">
                      {dest.title}
                    </h3>
                    <p className="text-xs text-sand-200 line-clamp-1 font-light">
                      {dest.description}
                    </p>
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>

          {/* Bottom Row Additional Cards (Full 12 cols in 3-card grid) */}
          {filtered.slice(3, 6).map((dest, idx) => (
            <div key={dest.id} className="md:col-span-4">
              <RevealOnScroll direction="up" delayMs={150 * (idx + 1)}>
                <Link
                  to={`/places/${dest.slug}`}
                  className="group relative h-[320px] rounded-3xl overflow-hidden block shadow-md transition-all duration-300 hover:shadow-xl"
                >
                  <img
                    src={dest.image}
                    alt={dest.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/30 to-transparent" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-charcoal-950/70 text-gold-300 backdrop-blur-md text-[10px] font-serif font-bold uppercase tracking-wider">
                      {dest.tag}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-gold-500 group-hover:text-charcoal-950 transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                    <p className="text-[11px] text-sand-300 tracking-wider uppercase">
                      {dest.region}
                    </p>
                    <h3 className="text-xl font-serif font-bold text-ivory-50 group-hover:text-gold-300 transition-colors">
                      {dest.title}
                    </h3>
                    <p className="text-xs text-sand-200 line-clamp-2 font-light">
                      {dest.description}
                    </p>
                  </div>
                </Link>
              </RevealOnScroll>
            </div>
          ))}

          {/* Photography attribution (Wikimedia Commons licensing) */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 pt-4 border-t border-sand-200 text-[10px] text-sand-500">
            {filtered.map((dest) =>
              dest.creditUrl ? (
                <a
                  key={dest.id}
                  href={dest.creditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-600 transition-colors underline decoration-sand-300 underline-offset-2"
                >
                  {dest.title} · Wikimedia Commons
                </a>
              ) : null
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

