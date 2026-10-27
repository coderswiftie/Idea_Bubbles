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
    <div className="w-full min-h-screen pt-20 pb-16 px-4 md:px-8 max-w-6xl mx-auto overflow-y-auto">
      {/* View Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-ivory-100 flex items-center gap-2">
          <span>All Ideas</span>
          <span className="text-xs font-mono text-slate-500 font-normal">
            ({filteredIdeas.length} {filteredIdeas.length === 1 ? 'idea' : 'ideas'})
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Comprehensive catalog view of all captured thoughts and projects
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="glass-panel p-3.5 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="flex items-center gap-2 bg-midnight-900 border border-midnight-700 rounded-xl px-3 py-1.5 min-w-[220px] flex-1 sm:flex-initial focus-within:border-cosmic-lavender">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter ideas..."
            className="w-full bg-transparent text-ivory-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <select
            value={filterCategory || ''}
            onChange={(e) => setFilterCategory(e.target.value || null)}
            className="bg-midnight-900 border border-midnight-700 text-ivory-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cosmic-lavender"
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
            className="bg-midnight-900 border border-midnight-700 text-ivory-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cosmic-lavender"
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
            className="bg-midnight-900 border border-midnight-700 text-ivory-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cosmic-lavender"
          >
            <option value="last_interacted_at">Recent Activity</option>
            <option value="created_at">Created Date</option>
            <option value="importance">Priority</option>
            <option value="title">Title (A-Z)</option>
          </select>

          {/* Include Archived toggle */}
          <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer ml-1 select-none">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              className="rounded bg-midnight-900 border-midnight-700 text-cosmic-lavender focus:ring-0"
            />
            <span>Archived</span>
          </label>
        </div>
      </div>

      {/* Ideas Card / Grid List */}
      {filteredIdeas.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-midnight-700">
          <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-ivory-200">No matching ideas found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or capture a new spark.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredIdeas.map((idea) => {
            const catColor = idea.category?.color_hex || '#8B5CF6';
            return (
              <div
                key={idea.id}
                onClick={() => selectIdea(idea.id)}
                className="glass-panel p-4 rounded-2xl hover:border-cosmic-lavender/40 hover:shadow-glow-lavender/30 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Category Pill and Status */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${catColor}20`,
                        color: catColor,
                        border: `1px solid ${catColor}40`,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                      {idea.category?.name || 'Uncategorized'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {idea.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-ivory-100 group-hover:text-white line-clamp-1 mb-1.5">
                    {idea.title}
                  </h3>

                  {/* Raw thought snippet */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {idea.raw_thought}
                  </p>
                </div>

                {/* Footer with stats and priority */}
                <div className="mt-4 pt-3 border-t border-midnight-700/60 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]" title="Notes">
                      <FileText className="w-3 h-3" />
                      {idea.notes_count || 0}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]" title="Tasks">
                      <CheckSquare className="w-3 h-3" />
                      {idea.completed_tasks_count || 0}/{idea.tasks_count || 0}
                    </span>
                  </div>

                  {/* Priority stars */}
                  <div className="flex items-center gap-0.5 text-cosmic-amber">
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
