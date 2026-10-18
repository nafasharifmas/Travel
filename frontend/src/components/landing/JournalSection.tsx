import React, { useState } from 'react';
import { ASSETS } from '../../data/assetsManifest';
import { RevealOnScroll } from '../common/RevealOnScroll';
import { BookOpen, Clock, ArrowRight, X, Share2 } from 'lucide-react';

type Article = (typeof ASSETS.journal)[number];

export const JournalSection: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="journal" className="section-shell bg-ivory-200/60 border-y border-navy-200">
      <div className="container-page space-y-10">
        <RevealOnScroll direction="up">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-navy-200 pb-6">
            <div className="space-y-2">
              <span className="eyebrow">
                <BookOpen className="w-3.5 h-3.5" />
                Dispatches &amp; field notes
              </span>
              <h2 className="text-h2">The Visitflow Journal</h2>
            </div>
            <p className="text-sm text-navy-600 max-w-md leading-relaxed">
              Reflections on unhurried travel, coastal heritage and the quiet rhythms of the places we map.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ASSETS.journal.map((art, idx) => (
            <RevealOnScroll key={art.id} direction="up" delayMs={100 * (idx + 1)} className="h-full">
              <article className="card card-hover h-full flex flex-col overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSelectedArticle(art)}
                  className="text-left flex flex-col h-full group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
                    <img
                      src={art.image}
                      alt={art.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-pill bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-ocean-600">
                      {art.topic}
                    </span>
                  </div>

                  <div className="p-5 space-y-2.5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2.5 text-[11px] text-navy-500">
                      <span>{art.date}</span>
                      <span className="w-1 h-1 rounded-full bg-navy-300" />
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-ocean-500" />
                        {art.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-serif text-navy-900 group-hover:text-ocean-600 transition-colors leading-snug">
                      {art.title}
                    </h3>

                    <p className="text-sm text-navy-500 line-clamp-3 leading-relaxed flex-1">
                      {art.summary}
                    </p>

                    <span className="inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-ocean-600 group-hover:gap-2.5 transition-all">
                      Read story
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      {/* Reader modal */}
      {selectedArticle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedArticle.title}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-white rounded-media w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-card-hover text-navy-900 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[21/9] w-full">
              <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                aria-label="Close article"
                className="absolute top-4 right-4 grid place-items-center w-10 h-10 rounded-full bg-white/90 text-navy-800 hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-4 left-6 px-3 py-1 rounded-pill bg-turquoise-500 text-navy-950 text-[10px] font-bold uppercase tracking-wider">
                {selectedArticle.topic}
              </span>
            </div>

            <div className="p-6 sm:p-9 space-y-5">
              <div className="flex items-center justify-between text-xs text-navy-500 border-b border-navy-100 pb-3">
                <div className="flex items-center gap-3">
                  <span>{selectedArticle.date}</span>
                  <span className="w-1 h-1 rounded-full bg-navy-300" />
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-ocean-500" />
                    {selectedArticle.readTime}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1.5 font-semibold text-ocean-600 hover:text-ocean-500"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copied ? 'Copied' : 'Share'}
                </button>
              </div>

              <h2 className="text-h3">{selectedArticle.title}</h2>

              <div className="text-navy-600 text-sm sm:text-base leading-relaxed font-serif space-y-4">
                <p className="first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-ocean-600 first-letter:leading-[0.85]">
                  {selectedArticle.content}
                </p>
              </div>

              <div className="pt-5 border-t border-navy-100 flex items-center justify-between">
                <span className="text-xs text-navy-500">Visitflow Journal</span>
                <button type="button" onClick={() => setSelectedArticle(null)} className="btn-primary btn-sm">
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
