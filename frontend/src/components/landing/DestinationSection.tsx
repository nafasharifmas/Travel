import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../../data/assetsManifest';
import { RevealOnScroll } from '../common/RevealOnScroll';
import { ArrowUpRight, MapPin, Clock } from 'lucide-react';

type Filter = 'all' | 'coastal' | 'heritage';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All Destinations' },
  { id: 'coastal', label: 'Coastal Sanctuaries' },
  { id: 'heritage', label: 'Sacred & Heritage' },
];

export const DestinationSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const destinationList = Object.values(ASSETS.destinations);
  const filtered = destinationList.filter(
    (d) => activeFilter === 'all' || (d.categories || []).includes(activeFilter)
  );

  const [lead, ...rest] = filtered;
  const stacked = rest.slice(0, 2);
  const row = rest.slice(2, 5);

  return (
    <section id="destinations" className="section-shell bg-white">
      <div className="container-page space-y-10">
        {/* Header */}
        <RevealOnScroll direction="up">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-navy-200 pb-8">
            <div className="space-y-3 max-w-2xl">
              <span className="eyebrow">
                <MapPin className="w-3.5 h-3.5" />
                The Eastern Corridor
              </span>
              <h2 className="text-h2">Ten stops. One shoreline.</h2>
              <p className="text-sm sm:text-base text-navy-500 leading-relaxed">
                Sunrise beaches, lagoon villages and centuries-old sanctuaries — real places with
                verified coordinates, mapped from your origin at Maruthamunai (7.4394, 81.8172).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter destinations">
              {FILTERS.map((f) => {
                const isActive = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id)}
                    aria-pressed={isActive}
                    className={`inline-flex items-center gap-1.5 min-h-[38px] px-4 rounded-pill border text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-ocean-500 text-white border-ocean-500 shadow-card hover:bg-ocean-600 hover:text-white'
                        : 'bg-white text-navy-700 border-navy-200 hover:border-ocean-400 hover:text-ocean-600'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </RevealOnScroll>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {lead && (
            <div className="md:col-span-7">
              <RevealOnScroll direction="up" delayMs={50} className="h-full">
                <Link
                  to={`/places/${lead.slug}`}
                  className="group relative block h-full min-h-[420px] sm:min-h-[500px] rounded-media overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 ease-premium"
                >
                  <img
                    src={lead.image}
                    alt={lead.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/20" />

                  <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                    <span className="px-3.5 py-1.5 rounded-pill bg-navy-950/75 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider border border-white/20">
                      Featured · {lead.tag}
                    </span>
                    <span className="grid place-items-center w-10 h-10 rounded-full bg-navy-950/70 backdrop-blur-md text-white border border-white/20 group-hover:bg-turquoise-500 group-hover:text-navy-950 group-hover:border-transparent transition-colors">
                      <ArrowUpRight className="w-5 h-5" />
                    </span>
                  </div>

                  <div className="absolute bottom-6 left-5 right-5 text-white space-y-2">
                    <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-navy-100">
                      <MapPin className="w-3.5 h-3.5 text-turquoise-300" />
                      {lead.region}
                    </p>
                    <h3 className="text-h3 font-bold text-white">{lead.title}</h3>
                    <p className="text-sm text-navy-100 line-clamp-2 max-w-xl leading-relaxed">
                      {lead.description}
                    </p>
                    <div className="pt-1 flex items-center gap-4 text-xs text-navy-100">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-turquoise-300" />
                        {lead.duration}
                      </span>
                      <span>Season · {lead.season}</span>
                    </div>
                  </div>
                </Link>
              </RevealOnScroll>
            </div>
          )}

          <div className="md:col-span-5 flex flex-col gap-6">
            {stacked.map((dest, idx) => (
              <RevealOnScroll key={dest.id} direction="up" delayMs={100 * (idx + 1)} className="flex-1">
                <Link
                  to={`/places/${dest.slug}`}
                  className="group relative block h-full min-h-[220px] rounded-media overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 ease-premium"
                >
                  <img
                    src={dest.image}
                    alt={dest.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/20" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-pill bg-navy-950/75 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider border border-white/20">
                      {dest.tag}
                    </span>
                    <span className="grid place-items-center w-8 h-8 rounded-full bg-navy-950/70 backdrop-blur-md text-white border border-white/20 group-hover:bg-turquoise-500 group-hover:text-navy-950 group-hover:border-transparent transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-navy-100">{dest.region}</p>
                    <h3 className="text-xl font-bold font-serif text-white">{dest.title}</h3>
                    <p className="text-xs text-navy-100 line-clamp-1">{dest.description}</p>
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>

          {row.map((dest, idx) => (
            <div key={dest.id} className="md:col-span-4">
              <RevealOnScroll direction="up" delayMs={120 * (idx + 1)}>
                <Link
                  to={`/places/${dest.slug}`}
                  className="group relative block h-[300px] rounded-media overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 ease-premium"
                >
                  <img
                    src={dest.image}
                    alt={dest.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/20" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-pill bg-navy-950/75 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider border border-white/20">
                      {dest.tag}
                    </span>
                    <span className="grid place-items-center w-8 h-8 rounded-full bg-navy-950/70 backdrop-blur-md text-white border border-white/20 group-hover:bg-turquoise-500 group-hover:text-navy-950 group-hover:border-transparent transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-navy-100">{dest.region}</p>
                    <h3 className="text-lg font-bold font-serif text-white">{dest.title}</h3>
                    <p className="text-xs text-navy-100 line-clamp-2">{dest.description}</p>
                  </div>
                </Link>
              </RevealOnScroll>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-2">
          <Link to="/explore" className="btn-secondary">
            View all mapped destinations
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
