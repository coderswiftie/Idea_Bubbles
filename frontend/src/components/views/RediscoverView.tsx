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
    <div className="w-full min-h-screen pt-20 pb-16 px-4 md:px-8 max-w-4xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-ivory-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cosmic-coral" />
            <span>Rediscover Dormant Ideas</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            A gentle celestial observatory resurfacing forgotten thoughts when inspiration returns
          </p>
        </div>

        <button
          onClick={fetchRediscovery}
          disabled={loading}
          className="p-2 rounded-xl glass-panel text-slate-400 hover:text-ivory-100 transition-colors"
          title="Refresh recommendations"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-cosmic-coral" />
          <span className="text-xs">Observing idea constellations...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-midnight-700">
          <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-ivory-200">All ideas are fresh and active!</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            As your universe expands and thoughts rest over time, this portal will gently surface forgotten sparks for you.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const catColor = item.idea.category?.color_hex || '#8B5CF6';

            return (
              <div
                key={item.idea.id}
                className="glass-panel p-5 rounded-2xl border border-midnight-700 hover:border-cosmic-coral/40 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: catColor }}
                    />
                    <span className="text-xs font-semibold text-slate-400">
                      {item.idea.category?.name || 'Uncategorized'}
                    </span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs font-mono text-cosmic-coral">
                      {item.idea.status}
                    </span>
                  </div>

                  {/* Why it is surfaced banner */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cosmic-coral/10 border border-cosmic-coral/20 text-cosmic-coral text-[11px] font-medium">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{item.reason}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-ivory-100 group-hover:text-white mb-1.5">
                  {item.idea.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {item.idea.raw_thought}
                </p>

                {/* Suggested Action Bar */}
                <div className="pt-3 border-t border-midnight-700/60 flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400 italic text-[11px]">
                    Suggestion: {item.suggested_action}
                  </span>
                  <button
                    onClick={() => selectIdea(item.idea.id)}
                    className="px-3 py-1.5 rounded-lg bg-cosmic-coral/20 hover:bg-cosmic-coral/30 text-cosmic-coral border border-cosmic-coral/30 font-semibold flex items-center gap-1.5 transition-colors shrink-0"
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
