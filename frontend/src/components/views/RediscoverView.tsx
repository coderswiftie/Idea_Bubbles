import React, { useEffect, useState } from 'react';
import { Sparkles, Compass, Clock, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { RediscoverItem } from '../../types';
import { api } from '../../services/api';
import { useIdeas } from '../../context/IdeaContext';

export const RediscoverView: React.FC = () => {
  const { selectIdea } = useIdeas();
  const [items, setItems] = useState<RediscoverItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRediscovery = async () => {
    setLoading(true);
    try {
      const data = await api.getRediscoverIdeas();
      setItems(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRediscovery();
  }, []);

  return (
    <div className="w-full min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-handwriting text-3xl font-bold text-charcoal flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-iridescent-pink" />
            <span>Rediscover Dormant Ideas</span>
          </h2>
          <p className="font-editorial italic text-stone-400 text-sm mt-0.5">
            A gentle celestial observatory resurfacing forgotten thoughts when inspiration returns
          </p>
        </div>

        <button
          onClick={fetchRediscovery}
          disabled={loading}
          className="p-2.5 rounded-full bg-white/90 border border-stone-200 text-stone-400 hover:text-charcoal shadow-sm transition-colors"
          title="Refresh recommendations"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-stone-400 gap-2 font-sans">
          <Loader2 className="w-5 h-5 animate-spin text-iridescent-pink" />
          <span className="text-xs font-editorial italic text-sm">Observing idea constellations...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white/60 border border-dashed border-stone-200 rounded-2xl">
          <Compass className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="font-serif text-base font-semibold text-charcoal">All thoughts are fresh and active</p>
          <p className="font-editorial italic text-stone-400 mt-1 max-w-sm mx-auto text-sm">
            As your universe expands and thoughts rest over time, this portal will gently surface forgotten sparks for you.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const catColor = item.idea.category?.color_hex || '#B8A5E8';

            return (
              <div
                key={item.idea.id}
                className="bg-white/90 border border-stone-200/80 p-5 rounded-2xl hover:border-stone-300 hover:shadow-[0_8px_30px_rgba(70,60,50,0.06)] transition-all group shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    {/* Soap Bubble Emblem */}
                    <div className="w-5 h-5 rounded-full aspect-square border border-white/90 shadow-sm relative overflow-hidden bg-gradient-to-tr from-iridescent-pink/30 via-iridescent-cyan/30 to-iridescent-lavender/30 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/90 absolute top-0.5 left-0.5" />
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                    </div>
                    <span className="text-xs font-medium text-stone-700 font-sans">
                      {item.idea.category?.name || 'Uncategorized'}
                    </span>
                    <span className="text-xs text-stone-300">•</span>
                    <span className="text-xs font-editorial italic text-stone-500">
                      {item.idea.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>

                  {/* Why it is surfaced banner */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium font-sans">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.reason}</span>
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold text-charcoal group-hover:text-stone-900 mb-1.5">
                  {item.idea.title}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4 font-sans">
                  {item.idea.raw_thought}
                </p>

                {/* Suggested Action Bar */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3 text-xs font-sans">
                  <span className="text-stone-400 italic text-[11px]">
                    Suggestion: {item.suggested_action}
                  </span>
                  <button
                    onClick={() => selectIdea(item.idea.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                  >
                    <span>Nurture Spark</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
