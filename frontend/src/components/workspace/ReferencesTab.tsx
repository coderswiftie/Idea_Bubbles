import React, { useState } from 'react';
import { Plus, Trash2, ExternalLink, Globe, Link2, Loader2 } from 'lucide-react';
import { IdeaDetail } from '../../types';
import { api } from '../../services/api';
import { useIdeas } from '../../context/IdeaContext';

interface ReferencesTabProps {
  idea: IdeaDetail;
}

export const ReferencesTab: React.FC<ReferencesTabProps> = ({ idea }) => {
  const { refreshSelectedIdea } = useIdeas();
  const [url, setUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.addReference(idea.id, targetUrl);
      setUrl('');
      setIsAdding(false);
      refreshSelectedIdea();
    } catch (err: any) {
      setError(err.message || 'Failed to add reference.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (refId: string) => {
    if (confirm('Delete this reference?')) {
      await api.deleteReference(idea.id, refId);
      refreshSelectedIdea();
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-base font-bold text-charcoal">References & Bookmarks</h3>
          <p className="text-xs text-stone-400 font-sans">Save articles, inspiration, and web research</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-stone-200 hover:border-stone-300 text-charcoal hover:bg-stone-50 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-iridescent-gold" />
            <span>Add Link</span>
          </button>
        )}
      </div>

      {/* Add Reference Form */}
      {isAdding && (
        <form onSubmit={handleAddReference} className="bg-white border border-stone-200/90 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 bg-[#FAF8F5] border border-stone-200 rounded-xl px-3 py-2 focus-within:border-iridescent-lavender">
            <Link2 className="w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste website URL (e.g. https://arxiv.org/abs/...)"
              autoFocus
              className="w-full bg-transparent text-xs text-charcoal placeholder-stone-400 focus:outline-none font-sans"
            />
          </div>
          {error && <p className="text-[11px] text-iridescent-pink">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setUrl('');
                setError('');
              }}
              className="px-3 py-1.5 rounded-lg text-xs text-stone-500 hover:text-charcoal"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-iridescent-lavender to-iridescent-cyan text-white hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>Fetch & Save</span>
            </button>
          </div>
        </form>
      )}

      {/* References List */}
      {idea.references.length === 0 && !isAdding ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-stone-200 bg-white/50">
          <Globe className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-stone-600">No references saved</p>
          <p className="text-[11px] text-stone-400 mt-1">Bookmark inspiration, papers, websites, or YouTube videos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {idea.references.map((ref) => (
            <div
              key={ref.id}
              className="bg-white border border-stone-200/80 rounded-2xl p-4 flex gap-3 group hover:border-stone-300 transition-all shadow-sm"
            >
              {ref.thumbnail_url && (
                <img
                  src={ref.thumbnail_url}
                  alt={ref.title || 'Thumbnail'}
                  className="w-20 h-16 object-cover rounded-xl border border-stone-200 shrink-0"
                  onError={(e) => {
                    // Hide broken image
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-stone-600 bg-iridescent-lavender/15 px-2.5 py-0.5 rounded-full font-sans">
                    {ref.domain || 'Link'}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-stone-400 hover:text-charcoal rounded"
                      title="Open Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(ref.id)}
                      className="p-1 text-stone-400 hover:text-iridescent-pink rounded"
                      title="Delete Reference"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-charcoal truncate mt-1">
                  {ref.title || ref.url}
                </h4>
                {ref.description && (
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 font-sans leading-relaxed">
                    {ref.description}
                  </p>
                )}
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-stone-400 hover:underline truncate block mt-1"
                >
                  {ref.url}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
