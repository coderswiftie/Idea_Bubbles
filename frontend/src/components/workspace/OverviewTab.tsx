import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, Star, Tag, Folder } from 'lucide-react';
import { IdeaDetail, IdeaStatus } from '../../types';
import { useIdeas } from '../../context/IdeaContext';
import { api } from '../../services/api';

interface OverviewTabProps {
  idea: IdeaDetail;
}

const STATUS_CONFIG: Record<IdeaStatus, { label: string; color: string; bg: string }> = {
  SPARK: { label: 'Spark', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' },
  EXPLORING: { label: 'Exploring', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' },
  DEVELOPING: { label: 'Developing', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  ACTIVE_PROJECT: { label: 'Active Project', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  ARCHIVED: { label: 'Archived', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)' },
};

export const OverviewTab: React.FC<OverviewTabProps> = ({ idea }) => {
  const { categories, refreshSelectedIdea } = useIdeas();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(idea.title);
  const [tagInput, setTagInput] = useState('');

  const handleTitleBlur = async () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== idea.title) {
      await api.updateIdea(idea.id, { title: title.trim() });
      refreshSelectedIdea();
    }
  };

  const handleStatusChange = async (newStatus: IdeaStatus) => {
    await api.updateIdea(idea.id, { status: newStatus });
    refreshSelectedIdea();
  };

  const handleCategoryChange = async (catId: string) => {
    await api.updateIdea(idea.id, { category_id: catId || undefined });
    refreshSelectedIdea();
  };

  const handleImportanceChange = async (val: number) => {
    await api.updateIdea(idea.id, { importance: val });
    refreshSelectedIdea();
  };

  const handleAddTag = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const currentTags = idea.tags.map((t) => t.name);
      if (!currentTags.includes(tagInput.trim().toLowerCase())) {
        const updated = [...currentTags, tagInput.trim().toLowerCase()];
        await api.updateIdea(idea.id, { tags: updated });
        setTagInput('');
        refreshSelectedIdea();
      }
    }
  };

  const handleRemoveTag = async (tagName: string) => {
    const updated = idea.tags.map((t) => t.name).filter((t) => t !== tagName);
    await api.updateIdea(idea.id, { tags: updated });
    refreshSelectedIdea();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Idea Title
        </label>
        {isEditingTitle ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
            autoFocus
            className="w-full mt-1 bg-midnight-800 border border-cosmic-lavender rounded-lg px-3 py-1.5 text-lg font-bold text-ivory-100 focus:outline-none"
          />
        ) : (
          <h2
            onClick={() => setIsEditingTitle(true)}
            className="mt-1 text-xl font-bold text-ivory-100 cursor-pointer hover:text-cosmic-lavender transition-colors flex items-center justify-between group"
            title="Click to edit title"
          >
            <span>{idea.title}</span>
            <span className="text-xs font-normal text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to edit
            </span>
          </h2>
        )}
      </div>

      {/* Metadata Pill Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Status Dropdown */}
        <div className="bg-midnight-800/80 border border-midnight-700 rounded-xl p-2.5">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
            Status
          </label>
          <select
            value={idea.status}
            onChange={(e) => handleStatusChange(e.target.value as IdeaStatus)}
            className="w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
            style={{ color: STATUS_CONFIG[idea.status]?.color || '#F4F0E8' }}
          >
            {Object.keys(STATUS_CONFIG).map((s) => (
              <option key={s} value={s} className="bg-midnight-800 text-ivory-100">
                {STATUS_CONFIG[s as IdeaStatus].label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Dropdown */}
        <div className="bg-midnight-800/80 border border-midnight-700 rounded-xl p-2.5">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
            Category
          </label>
          <select
            value={idea.category_id || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full bg-transparent text-xs text-ivory-100 font-medium focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-midnight-800">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-midnight-800">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Stars */}
        <div className="bg-midnight-800/80 border border-midnight-700 rounded-xl p-2.5">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
            Importance
          </label>
          <div className="flex items-center gap-1 mt-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleImportanceChange(star)}
                className={`p-0.5 transition-colors ${
                  star <= idea.importance ? 'text-cosmic-amber' : 'text-slate-600'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Original Raw Thought (Preserved) */}
      <div className="bg-midnight-800/60 border border-midnight-700 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cosmic-cyan" />
          <span>Original Captured Spark</span>
        </div>
        <p className="text-sm text-ivory-100 leading-relaxed whitespace-pre-wrap selection:bg-cosmic-lavender/30">
          {idea.raw_thought}
        </p>
      </div>

      {/* AI Summary (if present) */}
      {idea.ai_summary && (
        <div className="bg-midnight-800/40 border border-cosmic-lavender/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-cosmic-lavender uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Synthesis</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {idea.ai_summary}
          </p>
        </div>
      )}

      {/* Tags Section */}
      <div>
        <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase block mb-2">
          Tags & Keywords
        </label>
        <div className="flex flex-wrap gap-1.5 items-center">
          {idea.tags.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-midnight-800 border border-midnight-700 text-ivory-200"
            >
              #{t.name}
              <button
                onClick={() => handleRemoveTag(t.name)}
                className="text-slate-500 hover:text-cosmic-coral transition-colors ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="+ tag (press Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="bg-transparent border border-midnight-700 rounded-lg px-2.5 py-1 text-xs text-ivory-100 placeholder-slate-500 focus:outline-none focus:border-cosmic-lavender"
          />
        </div>
      </div>

      {/* Timestamps */}
      <div className="pt-4 border-t border-midnight-700/60 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Captured {new Date(idea.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Active {new Date(idea.last_interacted_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
