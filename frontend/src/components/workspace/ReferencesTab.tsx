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
          <h3 className="text-sm font-semibold text-ivory-100">References & Bookmarks</h3>
          <p className="text-xs text-slate-400">Save articles, research, inspiration, and web links</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-midnight-800 border border-midnight-700 hover:border-cosmic-lavender text-ivory-100 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Link</span>
          </button>
        )}
      </div>

      {/* Add Reference Form */}
      {isAdding && (
        <form onSubmit={handleAddReference} className="bg-midnight-800/80 border border-midnight-700 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2 bg-midnight-900 border border-midnight-700 rounded-lg px-2.5 py-1.5 focus-within:border-cosmic-lavender">
            <Link2 className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste website URL (e.g. https://arxiv.org/abs/...)"
              autoFocus
              className="w-full bg-transparent text-xs text-ivory-100 placeholder-slate-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-[11px] text-cosmic-coral">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setUrl('');
                setError('');
              }}
              className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-ivory-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-cosmic-lavender text-white hover:bg-purple-600 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>Fetch & Save</span>
            </button>
          </div>
        </form>
      )}

      {/* References List */}
      {idea.references.length === 0 && !isAdding ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-midnight-700">
          <Globe className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">No references saved</p>
          <p className="text-[11px] text-slate-500 mt-1">Bookmark inspiration, YouTube videos, GitHub repositories, or papers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {idea.references.map((ref) => (
            <div
              key={ref.id}
              className="bg-midnight-800/60 border border-midnight-700/80 rounded-xl p-3 flex gap-3 group hover:border-midnight-600 transition-all"
            >
              {ref.thumbnail_url && (
                <img
                  src={ref.thumbnail_url}
                  alt={ref.title || 'Thumbnail'}
                  className="w-20 h-16 object-cover rounded-lg border border-midnight-700 shrink-0"
                  onError={(e) => {
                    // Hide broken image
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-semibold tracking-wider text-cosmic-cyan uppercase bg-cosmic-cyan/10 px-2 py-0.5 rounded">
                    {ref.domain || 'Link'}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-ivory-100 rounded"
                      title="Open Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(ref.id)}
                      className="p-1 text-slate-400 hover:text-cosmic-coral rounded"
                      title="Delete Reference"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h4 className="text-xs font-semibold text-ivory-100 truncate mt-1">
                  {ref.title || ref.url}
                </h4>
                {ref.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                    {ref.description}
                  </p>
                )}
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-slate-500 hover:underline truncate block mt-1"
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
