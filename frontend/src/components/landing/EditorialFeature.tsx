import React from 'react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../../data/assetsManifest';
import { RevealOnScroll } from '../common/RevealOnScroll';
import { ArrowRight, Navigation, Sparkles } from 'lucide-react';

export const EditorialFeature: React.FC = () => {
  const feat = ASSETS.editorial.feature;

  return (
    <section className="section-shell bg-white overflow-hidden">
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Immersive image */}
          <div className="lg:col-span-7 relative">
            <RevealOnScroll direction="right">
              <div className="relative rounded-media overflow-hidden shadow-card-hover aspect-[4/3] bg-navy-900 group">
                <img
                  src={feat.image}
                  alt={feat.alt}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/30 to-transparent" />
                <span className="absolute bottom-5 left-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium">
                  <Navigation className="w-3.5 h-3.5 text-turquoise-300" />
                  {feat.location}
                </span>
              </div>

              {/* Floating stat badge */}
              <div className="hidden sm:block absolute -bottom-6 -right-4 lg:-right-6 z-20 bg-navy-900 text-white p-5 rounded-card shadow-card-hover border border-white/10 max-w-[16rem]">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-turquoise-300 block mb-1.5">
                  Stewardship standard
                </span>
                <p className="text-sm leading-snug text-navy-100">{feat.stat}</p>
              </div>
            </RevealOnScroll>
          </div>

          {/* Narrative */}
          <div className="lg:col-span-5 space-y-5">
            <RevealOnScroll direction="left" delayMs={100}>
              <span className="eyebrow">
                <Sparkles className="w-3.5 h-3.5" />
                The philosophy
              </span>

              <h2 className="text-h2 mt-3">{feat.headline}</h2>

              <p className="text-lg font-serif italic text-ocean-600">{feat.subhead}</p>

              <p className="text-sm sm:text-base text-navy-600 leading-relaxed">{feat.body}</p>

              <div className="pt-2">
                <Link to="/explore" className="btn-primary">
                  Explore the corridor route
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};
