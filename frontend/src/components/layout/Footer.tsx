import React from 'react';
import { Compass, Heart, MapPin, ShieldCheck, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1c1917] text-sand-300 border-t border-sand-200/10 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand column */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-espresso-950 flex items-center justify-center font-black">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-white font-black tracking-tight text-lg">
              VISITFLOW
            </span>
          </div>
          <p className="text-xs text-sand-400 max-w-sm leading-relaxed">
            Responsive local-tourist discovery and one-day itinerary planning platform.
            Curated verified destinations, real-time map spatial clustering, and sequence-ordered journey builder.
          </p>
          <div className="flex items-center gap-4 text-xs text-sand-400 pt-2">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              Verified Catalogue
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              Interactive Spatial Pins
            </span>
          </div>
        </div>

        {/* Quick Nav */}
        <div>
          <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
            Discovery Explorer
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="#catalogue" className="hover:text-amber-400 transition-colors">
                Cultural Heritage Citadels
              </a>
            </li>
            <li>
              <a href="#catalogue" className="hover:text-amber-400 transition-colors">
                Scenic Highlands & Tea Trails
              </a>
            </li>
            <li>
              <a href="#catalogue" className="hover:text-amber-400 transition-colors">
                Coastal & Reef Bays
              </a>
            </li>
            <li>
              <a href="#catalogue" className="hover:text-amber-400 transition-colors">
                Wildlife & Nature Sanctuaries
              </a>
            </li>
          </ul>
        </div>

        {/* FR-14 Attribution and Compliance */}
        <div>
          <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            Map Data & Attribution
          </h3>
          <p className="text-xs text-sand-400 leading-relaxed mb-2">
            Map tiles and spatial positioning powered by{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 underline hover:text-amber-300"
            >
              OpenStreetMap
            </a>{' '}
            under the Open Database License (ODbL).
          </p>
          <p className="text-[11px] text-stone-500">
            Tile usage respects standard caching policies and attribution boundaries (FR-14).
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-sand-400 gap-4">
        <p>© 2026 Visitflow Application. SRS Production Baseline v1.0.</p>
        <p className="flex items-center gap-1">
          Designed with <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> for purposeful discovery
        </p>
      </div>
    </footer>
  );
};

