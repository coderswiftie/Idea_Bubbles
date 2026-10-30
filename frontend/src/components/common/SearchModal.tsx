import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { Idea } from '../../types';
import { api } from '../../services/api';
import { useIdeas } from '../../context/IdeaContext';
import { PearlSparkle, CoquetteBow } from './CoquetteBow';

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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-cocoa/30 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-pearl/98 backdrop-blur-2xl border border-powder rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-powder">
          <Search className="w-4 h-4 text-rose" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search thoughts, raw sparks, keepsakes, and notes..."
            className="flex-1 bg-transparent text-sm text-cocoa placeholder:text-mauve/70 focus:outline-none font-sans"
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-rose" />}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-mauve hover:text-cocoa hover:bg-blush transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {query.trim() && !loading && results.length === 0 && (
            <div className="text-center py-10 px-4 text-xs font-editorial italic text-mauve">
              No thoughts matching "{query}"
            </div>
          )}

          {results.map((idea) => (
            <div
              key={idea.id}
              onClick={() => handleSelect(idea.id)}
              className="p-3.5 rounded-2xl hover:bg-blush/40 border border-transparent hover:border-powder cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded-full aspect-square border border-white/90 shadow-sm relative overflow-hidden bg-gradient-to-tr from-powder via-blush to-champagne/40 flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: idea.category?.color_hex || '#C98FA4' }} />
                  </div>
                  <span className="text-xs text-mauve font-sans">
                    {idea.category?.name || 'Uncategorized'}
                  </span>
                  <span className="text-xs text-powder">•</span>
                  <span className="text-xs font-editorial italic text-mauve">
                    {idea.status.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
                <h4 className="font-serif text-base font-bold text-cocoa group-hover:text-rose transition-colors truncate">
                  {idea.title}
                </h4>
                <p className="text-xs text-mauve truncate mt-0.5 font-sans">
                  {idea.raw_thought}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-powder group-hover:text-rose transition-colors shrink-0" />
            </div>
          ))}

          {!query.trim() && (
            <div className="text-center py-8 text-xs font-editorial italic text-mauve">
              <div className="flex justify-center mb-1.5 opacity-60">
                <CoquetteBow className="w-7 h-5 text-rose" />
              </div>
              Type keywords from titles, thoughts, or reflections to locate ideas instantly.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
