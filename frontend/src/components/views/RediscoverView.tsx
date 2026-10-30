import React, { useEffect, useState } from 'react';
import { Compass, Clock, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { RediscoverItem } from '../../types';
import { api } from '../../services/api';
import { useIdeas } from '../../context/IdeaContext';
import { CoquetteBow, PearlSparkle } from '../common/CoquetteBow';

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
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="font-brand text-5xl md:text-6xl font-normal text-cocoa lowercase leading-none">
          rediscover
        </h2>

        <button
          onClick={fetchRediscovery}
          disabled={loading}
          className="p-2 rounded-xl bg-pearl border border-powder/70 text-cocoa-muted hover:text-cocoa shadow-sm transition-colors"
          title="Refresh"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-cocoa-muted gap-2 font-sans text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-rose" />
          <span>loading ideas...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-pearl/60 border border-dashed border-powder/80 rounded-2xl">
          <p className="font-serif text-base font-medium text-cocoa">All thoughts are active</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const catColor = item.idea.category?.color_hex || '#C98FA4';

            return (
              <div
                key={item.idea.id}
                className="bg-pearl/90 border border-powder/70 p-5 rounded-2xl hover:border-rose/60 hover:shadow-[0_8px_30px_rgba(201,143,164,0.12)] transition-all group shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    {/* Soap Bubble Emblem */}
                    <div className="w-5 h-5 rounded-full aspect-square border border-white/90 shadow-sm relative overflow-hidden bg-gradient-to-tr from-blush via-powder to-champagne-light flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/90 absolute top-0.5 left-0.5" />
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                    </div>
                    <span className="text-xs font-semibold text-cocoa font-sans">
                      {item.idea.category?.name || 'Uncategorized'}
                    </span>
                    <span className="text-xs text-powder">•</span>
                    <span className="text-xs font-editorial italic text-cocoa-muted">
                      {item.idea.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>

                  {/* Why it is surfaced banner */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blush-200 border border-powder text-rose-dark text-xs font-medium font-sans">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.reason}</span>
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold text-cocoa group-hover:text-rose-dark mb-1.5">
                  {item.idea.title}
                </h3>
                <p className="text-xs text-cocoa-soft line-clamp-2 leading-relaxed mb-4 font-sans">
                  {item.idea.raw_thought}
                </p>

                {/* Suggested Action Bar */}
                <div className="pt-3 border-t border-powder/40 flex items-center justify-between gap-3 text-xs font-sans">
                  <span className="text-cocoa-muted italic text-[11px] font-editorial">
                    Suggestion: {item.suggested_action}
                  </span>
                  <button
                    onClick={() => selectIdea(item.idea.id)}
                    className="px-3 py-1 rounded-xl bg-pearl hover:bg-blush text-cocoa border border-powder/70 font-sans flex items-center gap-1.5 transition-colors shrink-0 shadow-sm text-xs lowercase"
                  >
                    <span>open</span>
                    <ArrowRight className="w-3 h-3 text-cocoa-muted" />
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
