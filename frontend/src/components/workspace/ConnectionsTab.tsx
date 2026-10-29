import React, { useState } from 'react';
import { Plus, Trash2, GitFork, ArrowRight, Sparkles } from 'lucide-react';
import { IdeaDetail } from '../../types';
import { api } from '../../services/api';
import { useIdeas } from '../../context/IdeaContext';

interface ConnectionsTabProps {
  idea: IdeaDetail;
}

export const ConnectionsTab: React.FC<ConnectionsTabProps> = ({ idea }) => {
  const { ideas, selectIdea, refreshSelectedIdea, refreshConnections } = useIdeas();
  const [isAdding, setIsAdding] = useState(false);
  const [targetId, setTargetId] = useState('');
  const [relationType, setRelationType] = useState('synergy with');
  const [description, setDescription] = useState('');

  // Available target ideas (excluding this idea)
  const candidateIdeas = ideas.filter((i) => i.id !== idea.id);

  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;

    await api.createConnection(idea.id, {
      target_idea_id: targetId,
      relationship_type: relationType,
      description: description.trim() || undefined,
    });

    setTargetId('');
    setDescription('');
    setIsAdding(false);
    refreshSelectedIdea();
    refreshConnections();
  };

  const handleDeleteConnection = async (connId: string) => {
    if (confirm('Sever this idea connection?')) {
      await api.deleteConnection(connId);
      refreshSelectedIdea();
      refreshConnections();
    }
  };

  const allConnections = [
    ...idea.outgoing_connections.map((c) => ({ ...c, isOutgoing: true })),
    ...idea.incoming_connections.map((c) => ({ ...c, isOutgoing: false })),
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-base font-bold text-charcoal">Idea Connections</h3>
          <p className="text-xs text-stone-400 font-sans">Discover thematic bridges and synergy across thoughts</p>
        </div>
        {!isAdding && candidateIdeas.length > 0 && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-stone-200 hover:border-stone-300 text-charcoal hover:bg-stone-50 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-iridescent-lavender" />
            <span>Connect Idea</span>
          </button>
        )}
      </div>

      {/* Add Connection Form */}
      {isAdding && (
        <form onSubmit={handleAddConnection} className="bg-white border border-stone-200/90 rounded-2xl p-4 space-y-3 shadow-sm">
          <div>
            <label className="text-xs text-stone-400 block mb-1 font-editorial italic">
              Connect to idea
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              required
              className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-iridescent-lavender font-sans cursor-pointer"
            >
              <option value="">-- Choose an idea to connect --</option>
              {candidateIdeas.map((cand) => (
                <option key={cand.id} value={cand.id}>
                  {cand.title} ({cand.category?.name || 'Uncategorized'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-stone-400 block mb-1 font-editorial italic">
                Relationship
              </label>
              <select
                value={relationType}
                onChange={(e) => setRelationType(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-iridescent-lavender font-sans cursor-pointer"
              >
                <option value="synergy with">Synergy with</option>
                <option value="inspired by">Inspired by</option>
                <option value="subset of">Subset of</option>
                <option value="alternative to">Alternative to</option>
                <option value="related">Related to</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-400 block mb-1 font-editorial italic">
                Connection note
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Shared tech, theme, or concept..."
                className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl p-2.5 text-xs text-charcoal placeholder-stone-400 focus:outline-none focus:border-iridescent-lavender font-sans"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-stone-500 hover:text-charcoal"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!targetId}
              className="px-4 py-1.5 bg-gradient-to-r from-iridescent-lavender to-iridescent-cyan text-white rounded-xl text-xs font-semibold hover:opacity-95 disabled:opacity-50 shadow-sm"
            >
              Form Connection
            </button>
          </div>
        </form>
      )}

      {/* Connections List */}
      {allConnections.length === 0 && !isAdding ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-stone-200 bg-white/50">
          <GitFork className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-stone-600">No connections yet</p>
          <p className="text-[11px] text-stone-400 mt-1">Connect this idea to related thoughts to draw constellations on the canvas.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {allConnections.map((conn) => {
            const otherIdea = conn.isOutgoing ? conn.target_idea : conn.source_idea;
            const otherId = conn.isOutgoing ? conn.target_idea_id : conn.source_idea_id;
            const fallbackIdea = ideas.find((i) => i.id === otherId);
            const otherTitle = otherIdea?.title || fallbackIdea?.title || 'Connected Idea';

            return (
              <div
                key={conn.id}
                className="bg-white border border-stone-200/80 rounded-2xl p-4 flex items-center justify-between group hover:border-stone-300 transition-all shadow-sm"
              >
                <div
                  onClick={() => selectIdea(otherId)}
                  className="cursor-pointer flex-1 min-w-0 pr-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-stone-600 bg-iridescent-lavender/15 px-2.5 py-0.5 rounded-full font-sans">
                      {conn.relationship_type || 'Related'}
                    </span>
                    <span className="text-[11px] text-stone-400 font-sans">
                      {conn.isOutgoing ? 'outgoing' : 'incoming'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-charcoal group-hover:text-stone-900 flex items-center gap-1.5 transition-colors truncate">
                    <span>{otherTitle}</span>
                    <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                  </h4>
                  {conn.description && (
                    <p className="text-[11px] text-stone-500 mt-0.5 truncate font-sans">
                      {conn.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteConnection(conn.id)}
                  className="p-1.5 text-stone-400 hover:text-iridescent-pink rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove connection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
