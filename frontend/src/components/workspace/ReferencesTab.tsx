import React, { useState } from 'react';
import { Plus, Trash2, ExternalLink, Globe, Link2, Loader2 } from 'lucide-react';
import { IdeaDetail } from '../../types';
import { api } from '../../services/api';
import { useIdeas } from '../../context/IdeaContext';
import { PearlSparkle } from '../common/CoquetteBow';

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
          <h3 className="font-brand text-3xl font-bold text-cocoa">References & Clippings</h3>
          <p className="font-editorial italic text-cocoa-muted text-sm">Save articles, moodboards, and delicate inspirations</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-blush-200 hover:bg-blush-300 text-cocoa border border-powder-dark flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="font-editorial italic text-sm">Add Link</span>
          </button>
        )}
      </div>

      {/* Add Reference Form */}
      {isAdding && (
        <form onSubmit={handleAddReference} className="bg-pearl/95 border border-powder/70 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 bg-ivory/80 border border-powder/70 rounded-xl px-3 py-2 focus-within:border-rose">
            <Link2 className="w-4 h-4 text-cocoa-muted" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste website URL (e.g. https://...)"
              autoFocus
              className="w-full bg-transparent text-xs text-cocoa placeholder-cocoa-faint focus:outline-none font-sans"
            />
          </div>
          {error && <p className="text-[11px] text-rose-dark">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setUrl('');
                setError('');
              }}
              className="px-3 py-1.5 rounded-lg text-xs text-cocoa-muted hover:text-cocoa font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blush-200 hover:bg-blush-300 text-cocoa border border-powder-dark disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              {isLoading && <Loader2 className="w-3 h-3 animate-spin text-rose" />}
              <span>Fetch & Save</span>
            </button>
          </div>
        </form>
      )}

      {/* References List */}
      {idea.references.length === 0 && !isAdding ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-powder/80 bg-pearl/60">
          <PearlSparkle size={24} className="mx-auto mb-2 text-rose" />
          <p className="text-xs font-medium text-cocoa font-sans">No references saved</p>
          <p className="text-[11px] text-cocoa-muted mt-1 font-editorial italic text-sm">Bookmark inspiration, papers, websites, or YouTube clips.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {idea.references.map((ref) => (
            <div
              key={ref.id}
              className="bg-pearl border border-powder/70 rounded-2xl p-4 flex gap-3 group hover:border-rose/50 transition-all shadow-xs"
            >
              {ref.thumbnail_url && (
                <img
                  src={ref.thumbnail_url}
                  alt={ref.title || 'Thumbnail'}
                  className="w-20 h-16 object-cover rounded-xl border border-powder shrink-0"
                  onError={(e) => {
                    // Hide broken image
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-cocoa bg-blush-200 border border-powder/60 px-2.5 py-0.5 rounded-full font-sans">
                    {ref.domain || 'Link'}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-cocoa-muted hover:text-cocoa rounded hover:bg-blush-100"
                      title="Open Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(ref.id)}
                      className="p-1 text-cocoa-muted hover:text-rose-dark rounded hover:bg-blush-100"
                      title="Delete Reference"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-cocoa truncate mt-1">
                  {ref.title || ref.url}
                </h4>
                {ref.description && (
                  <p className="text-[11px] text-cocoa-soft line-clamp-2 mt-0.5 font-sans leading-relaxed">
                    {ref.description}
                  </p>
                )}
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-cocoa-muted hover:underline truncate block mt-1"
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
