import React, { useState } from 'react';
import { ASSETS } from '../../data/assetsManifest';
import { RevealOnScroll } from '../common/RevealOnScroll';
import { BookOpen, Clock, ArrowRight, X, Calendar, Share2, Sparkles } from 'lucide-react';

export const JournalSection: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="journal" className="py-24 px-4 sm:px-6 lg:px-8 bg-sand-100/70 text-charcoal-950 border-t border-sand-300">
      <div className="max-w-7xl mx-auto space-y-14">
        {/* Header */}
        <RevealOnScroll direction="up">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-sand-300 pb-6">
            <div className="space-y-2">
              <span className="text-[11px] font-serif uppercase tracking-[0.25em] text-gold-600 font-bold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Dispatches & Field Notes
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-charcoal-950 tracking-tight">
                The Aether Journal
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md font-light leading-relaxed">
              Reflections on unhurried journeying, architectural history, and the quiet rhythms of coastal communities.
            </p>
          </div>
        </RevealOnScroll>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ASSETS.journal.map((art, idx) => (
            <RevealOnScroll key={art.id} direction="up" delayMs={100 * (idx + 1)}>
              <article
                onClick={() => setSelectedArticle(art)}
                className="group bg-white rounded-3xl overflow-hidden border border-sand-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer h-full hover:-translate-y-1"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-charcoal-900">
                    <img
                      src={art.image}
                      alt={art.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-charcoal-950/75 backdrop-blur-md text-[10px] font-serif uppercase tracking-wider text-gold-300 font-bold">
                        {art.topic}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-[11px] text-stone-500 font-mono">
                      <span>{art.date}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gold-600" />
                        {art.readTime}
                      </span>
                    </div>

                    <h3 className="text-xl font-serif font-bold text-charcoal-950 group-hover:text-gold-600 transition-colors leading-snug">
                      {art.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-stone-600 font-light line-clamp-3 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-sand-100 flex items-center justify-between text-xs font-bold text-charcoal-900 group-hover:text-gold-600 transition-colors">
                  <span>Read Dispatch</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-in fade-in"
        >
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-sand-300 shadow-2xl text-charcoal-950 animate-in zoom-in-95">
            <div className="relative aspect-[21/9] w-full">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                aria-label="Close article"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-charcoal-950/80 backdrop-blur-md text-white hover:bg-charcoal-950 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6">
                <span className="px-3.5 py-1 rounded-full bg-gold-500 text-charcoal-950 text-xs font-serif font-bold tracking-widest uppercase">
                  {selectedArticle.topic}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-10 space-y-6">
              <div className="flex items-center justify-between text-xs text-stone-500 font-mono border-b border-sand-200 pb-3">
                <div className="flex items-center gap-3">
                  <span>{selectedArticle.date}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gold-600" />
                    {selectedArticle.readTime}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1 text-gold-700 hover:text-gold-900"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied' : 'Share'}</span>
                </button>
              </div>

              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-charcoal-950 leading-tight">
                {selectedArticle.title}
              </h2>

              <div className="text-stone-700 text-sm sm:text-base leading-relaxed font-serif space-y-4 font-normal">
                <p className="first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-gold-700">
                  {selectedArticle.content}
                </p>
                <blockquote className="my-6 border-l-2 border-gold-500 pl-4 italic text-lg text-charcoal-900 font-serif">
                  "When you step off the congested circuits, the land begins to speak in its native cadence."
                </blockquote>
              </div>

              <div className="pt-6 border-t border-sand-200 flex items-center justify-between">
                <span className="text-xs text-stone-500 font-serif italic">
                  Aether Journal · Curated Field Dispatches
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="px-5 py-2.5 rounded-full bg-charcoal-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-charcoal-800"
                >
                  Done Reading
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

