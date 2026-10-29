import React, { useState } from 'react';
import { Search, Filter, Star, FileText, CheckSquare, Sparkles, ArrowUpDown } from 'lucide-react';
import { useIdeas } from '../../context/IdeaContext';
import { IdeaStatus } from '../../types';

export const AllIdeasView: React.FC = () => {
  const { ideas, categories, selectIdea, filterCategory, setFilterCategory } = useIdeas();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'last_interacted_at' | 'created_at' | 'importance' | 'title'>('last_interacted_at');
  const [includeArchived, setIncludeArchived] = useState(false);

  // Filter ideas
  const filteredIdeas = ideas
    .filter((idea) => {
      if (!includeArchived && idea.is_archived) return false;
      if (filterCategory && idea.category_id !== filterCategory) return false;
      if (statusFilter && idea.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = idea.title.toLowerCase().includes(q);
        const matchesRaw = idea.raw_thought.toLowerCase().includes(q);
        const matchesSummary = idea.ai_summary?.toLowerCase().includes(q) || false;
        const matchesTags = idea.tags.some((t) => t.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesRaw && !matchesSummary && !matchesTags) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'importance') return (b.importance || 0) - (a.importance || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'created_at') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(b.last_interacted_at).getTime() - new Date(a.last_interacted_at).getTime();
    });

  return (
    <div className="w-full min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto overflow-y-auto">
      {/* View Header */}
      <div className="mb-6">
        <h2 className="font-handwriting text-3xl font-bold text-charcoal flex items-center gap-2.5">
          <span>Journal of Ideas</span>
          <span className="font-editorial italic text-stone-400 font-normal text-base">
            ({filteredIdeas.length} {filteredIdeas.length === 1 ? 'thought' : 'thoughts'})
          </span>
        </h2>
        <p className="font-editorial italic text-stone-400 text-sm mt-0.5">
          A living, quiet archive of all captured sparks and projects
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white/80 backdrop-blur-xl border border-stone-200/80 p-3.5 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-1.5 min-w-[220px] flex-1 sm:flex-initial focus-within:border-iridescent-lavender">
          <Search className="w-3.5 h-3.5 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search journal..."
            className="w-full bg-transparent text-charcoal placeholder-stone-400 focus:outline-none font-sans"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <select
            value={filterCategory || ''}
            onChange={(e) => setFilterCategory(e.target.value || null)}
            className="bg-white border border-stone-200 text-stone-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-iridescent-lavender shadow-sm cursor-pointer font-sans"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-stone-200 text-stone-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-iridescent-lavender shadow-sm cursor-pointer font-sans"
          >
            <option value="">All Statuses</option>
            <option value="SPARK">Spark</option>
            <option value="EXPLORING">Exploring</option>
            <option value="DEVELOPING">Developing</option>
            <option value="ACTIVE_PROJECT">Active Project</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-stone-200 text-stone-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-iridescent-lavender shadow-sm cursor-pointer font-sans"
          >
            <option value="last_interacted_at">Recent Activity</option>
            <option value="created_at">Created Date</option>
            <option value="importance">Priority</option>
            <option value="title">Title (A-Z)</option>
          </select>

          {/* Include Archived toggle */}
          <label className="flex items-center gap-1.5 text-stone-500 cursor-pointer ml-1 select-none font-sans">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              className="rounded border-stone-300 text-iridescent-lavender focus:ring-0"
            />
            <span>Archived</span>
          </label>
        </div>
      </div>

      {/* Ideas Card / Grid List */}
      {filteredIdeas.length === 0 ? (
        <div className="text-center py-20 bg-white/60 border border-dashed border-stone-200 rounded-2xl">
          <Sparkles className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-charcoal">No matching thoughts found</p>
          <p className="text-xs text-stone-400 mt-1 font-sans">Try adjusting your filters or whisper a new spark below.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => {
            const catColor = idea.category?.color_hex || '#B8A5E8';
            return (
              <div
                key={idea.id}
                onClick={() => selectIdea(idea.id)}
                className="bg-white/90 border border-stone-200/80 p-5 rounded-2xl hover:border-stone-300 hover:shadow-[0_8px_30px_rgba(70,60,50,0.06)] cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  {/* Category Pill and Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {/* Delicate circular soap-bubble preview badge (strictly 1:1 circle) */}
                      <div className="w-5 h-5 rounded-full aspect-square border border-white/90 shadow-sm relative overflow-hidden bg-gradient-to-tr from-iridescent-pink/30 via-iridescent-cyan/30 to-iridescent-lavender/30 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/90 absolute top-0.5 left-0.5" />
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                      </div>
                      <span className="text-xs font-medium text-stone-700 font-sans">
                        {idea.category?.name || 'Uncategorized'}
                      </span>
                    </div>
                    <span className="text-xs font-editorial italic text-stone-400">
                      {idea.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-lg font-bold text-charcoal group-hover:text-stone-900 line-clamp-1 mb-1.5">
                    {idea.title}
                  </h3>

                  {/* Raw thought snippet */}
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-sans">
                    {idea.raw_thought}
                  </p>
                </div>

                {/* Footer with stats and priority */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400 font-sans">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]" title="Notes">
                      <FileText className="w-3 h-3 text-stone-400" />
                      {idea.notes_count || 0}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]" title="Tasks">
                      <CheckSquare className="w-3 h-3 text-stone-400" />
                      {idea.completed_tasks_count || 0}/{idea.tasks_count || 0}
                    </span>
                  </div>

                  {/* Priority stars */}
                  <div className="flex items-center gap-0.5 text-iridescent-gold">
                    {Array.from({ length: idea.importance || 3 }).map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
