import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, Star, Tag, Folder } from 'lucide-react';
import { IdeaDetail, IdeaStatus } from '../../types';
import { useIdeas } from '../../context/IdeaContext';
import { api } from '../../services/api';

interface OverviewTabProps {
  idea: IdeaDetail;
}

const STATUS_CONFIG: Record<IdeaStatus, { label: string; color: string; bg: string }> = {
  SPARK: { label: 'Spark', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
  EXPLORING: { label: 'Exploring', color: '#0EA5E9', bg: 'rgba(14, 165, 233, 0.1)' },
  DEVELOPING: { label: 'Developing', color: '#D97706', bg: 'rgba(217, 119, 6, 0.1)' },
  ACTIVE_PROJECT: { label: 'Active Project', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
  ARCHIVED: { label: 'Archived', color: '#78716C', bg: 'rgba(120, 113, 108, 0.1)' },
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
        <label className="font-editorial italic text-stone-400 text-sm">
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
            className="w-full mt-1 bg-white border border-iridescent-lavender rounded-xl px-3.5 py-2 font-serif text-2xl font-bold text-charcoal focus:outline-none shadow-sm"
          />
        ) : (
          <h2
            onClick={() => setIsEditingTitle(true)}
            className="mt-1 font-serif text-2xl font-bold text-charcoal cursor-pointer hover:text-stone-700 transition-colors flex items-center justify-between group"
            title="Click to edit title"
          >
            <span>{idea.title}</span>
            <span className="text-xs font-normal text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity font-editorial italic">
              Click to edit
            </span>
          </h2>
        )}
      </div>

      {/* Metadata Pill Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Status Dropdown */}
        <div className="bg-white/80 border border-stone-200/80 rounded-2xl p-3 shadow-sm">
          <label className="text-xs text-stone-400 block mb-1 font-editorial italic">
            Status
          </label>
          <select
            value={idea.status}
            onChange={(e) => handleStatusChange(e.target.value as IdeaStatus)}
            className="w-full bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            style={{ color: STATUS_CONFIG[idea.status]?.color || '#242220' }}
          >
            {Object.keys(STATUS_CONFIG).map((s) => (
              <option key={s} value={s} className="bg-white text-charcoal">
                {STATUS_CONFIG[s as IdeaStatus].label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Dropdown */}
        <div className="bg-white/80 border border-stone-200/80 rounded-2xl p-3 shadow-sm">
          <label className="text-xs text-stone-400 block mb-1 font-editorial italic">
            Category
          </label>
          <select
            value={idea.category_id || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full bg-transparent text-xs text-charcoal font-semibold focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-white">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Stars */}
        <div className="bg-white/80 border border-stone-200/80 rounded-2xl p-3 shadow-sm">
          <label className="text-xs text-stone-400 block mb-1 font-editorial italic">
            Importance
          </label>
          <div className="flex items-center gap-1 mt-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleImportanceChange(star)}
                className={`p-0.5 transition-colors ${
                  star <= idea.importance ? 'text-iridescent-gold' : 'text-stone-300'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Original Raw Thought (Personal Journal Deckled Card) */}
      <div className="bg-white/90 border border-stone-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-stone-600">
          <Sparkles className="w-3.5 h-3.5 text-iridescent-cyan" />
          <span className="font-editorial italic text-base">Original Captured Spark</span>
        </div>
        <p className="text-sm text-charcoal leading-relaxed whitespace-pre-wrap font-sans">
          {idea.raw_thought}
        </p>
      </div>

      {/* AI Summary (if present) */}
      {idea.ai_summary && (
        <div className="bg-iridescent-lavender/10 border border-iridescent-lavender/25 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-charcoal">
            <Sparkles className="w-3.5 h-3.5 text-iridescent-lavender" />
            <span className="font-editorial italic text-base">AI Synthesis & Perspective</span>
          </div>
          <p className="text-sm text-stone-700 leading-relaxed font-sans">
            {idea.ai_summary}
          </p>
        </div>
      )}

      {/* Tags Section */}
      <div>
        <label className="font-editorial italic text-stone-400 text-sm block mb-2">
          Tags & Themes
        </label>
        <div className="flex flex-wrap gap-1.5 items-center">
          {idea.tags.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-white border border-stone-200 text-stone-700 shadow-sm font-medium"
            >
              #{t.name}
              <button
                onClick={() => handleRemoveTag(t.name)}
                className="text-stone-400 hover:text-iridescent-pink transition-colors ml-0.5"
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
            className="bg-white border border-stone-200 rounded-full px-3 py-1 text-xs text-charcoal placeholder-stone-400 focus:outline-none focus:border-iridescent-lavender shadow-sm font-sans"
          />
        </div>
      </div>

      {/* Timestamps */}
      <div className="pt-4 border-t border-stone-200/70 flex items-center justify-between text-xs text-stone-400 font-sans">
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
