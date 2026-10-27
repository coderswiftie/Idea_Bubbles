import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Idea } from '../../types';
import { api } from '../../services/api';
import { useIdeas } from '../../context/IdeaContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { selectIdea } = useIdeas();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : inputRef.current?.focus();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const matches = await api.search(query.trim());
        setResults(matches);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (id: string) => {
    selectIdea(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-midnight-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-midnight-900 border border-midnight-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-midnight-700/80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ideas, raw thoughts, notes, tags..."
            className="flex-1 bg-transparent text-sm text-ivory-100 placeholder-slate-500 focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-cosmic-lavender" />}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-midnight-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() && !loading && results.length === 0 && (
            <div className="text-center py-10 px-4 text-xs text-slate-400">
              No ideas matching "{query}"
            </div>
          )}

          {results.map((idea) => (
            <div
              key={idea.id}
              onClick={() => handleSelect(idea.id)}
              className="p-3 rounded-xl hover:bg-midnight-800/80 border border-transparent hover:border-midnight-700 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: idea.category?.color_hex || '#8B5CF6' }}
                  />
                  <span className="text-[10px] text-slate-400">
                    {idea.category?.name || 'Uncategorized'}
                  </span>
                  <span className="text-[10px] text-slate-500">•</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {idea.status}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-ivory-100 group-hover:text-cosmic-lavender transition-colors truncate">
                  {idea.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {idea.raw_thought}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cosmic-lavender transition-colors shrink-0" />
            </div>
          ))}

          {!query.trim() && (
            <div className="text-center py-8 text-xs text-slate-500">
              Type keywords from titles, notes, or tags to locate ideas instantly.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
