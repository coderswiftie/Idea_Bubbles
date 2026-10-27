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
          <h3 className="text-sm font-semibold text-ivory-100">Idea Connections</h3>
          <p className="text-xs text-slate-400">Discover thematic bridges and synergy across thoughts</p>
        </div>
        {!isAdding && candidateIdeas.length > 0 && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-midnight-800 border border-midnight-700 hover:border-cosmic-lavender text-ivory-100 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Idea</span>
          </button>
        )}
      </div>

      {/* Add Connection Form */}
      {isAdding && (
        <form onSubmit={handleAddConnection} className="bg-midnight-800/80 border border-midnight-700 rounded-xl p-3.5 space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
              Select Destination Idea
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              required
              className="w-full bg-midnight-900 border border-midnight-700 rounded-lg p-2 text-xs text-ivory-100 focus:outline-none focus:border-cosmic-lavender"
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
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Relationship
              </label>
              <select
                value={relationType}
                onChange={(e) => setRelationType(e.target.value)}
                className="w-full bg-midnight-900 border border-midnight-700 rounded-lg p-2 text-xs text-ivory-100 focus:outline-none focus:border-cosmic-lavender"
              >
                <option value="synergy with">Synergy with</option>
                <option value="inspired by">Inspired by</option>
                <option value="subset of">Subset of</option>
                <option value="alternative to">Alternative to</option>
                <option value="related">Related to</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Why are they connected?
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Shared tech, theme, or concept..."
                className="w-full bg-midnight-900 border border-midnight-700 rounded-lg p-2 text-xs text-ivory-100 placeholder-slate-500 focus:outline-none focus:border-cosmic-lavender"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-ivory-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!targetId}
              className="px-3 py-1 bg-cosmic-lavender text-white rounded-lg text-xs font-medium hover:bg-purple-600 disabled:opacity-50"
            >
              Form Connection
            </button>
          </div>
        </form>
      )}

      {/* Connections List */}
      {allConnections.length === 0 && !isAdding ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-midnight-700">
          <GitFork className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">No connections yet</p>
          <p className="text-[11px] text-slate-500 mt-1">Connect this idea to related thoughts to draw constellations on the canvas.</p>
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
                className="bg-midnight-800/60 border border-midnight-700/80 rounded-xl p-3 flex items-center justify-between group hover:border-midnight-600 transition-all"
              >
                <div
                  onClick={() => selectIdea(otherId)}
                  className="cursor-pointer flex-1 min-w-0 pr-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold text-cosmic-lavender uppercase tracking-wider bg-cosmic-lavender/10 px-2 py-0.5 rounded">
                      {conn.relationship_type || 'Related'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {conn.isOutgoing ? 'outgoing' : 'incoming'}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-ivory-100 group-hover:text-cosmic-lavender flex items-center gap-1.5 transition-colors truncate">
                    <span>{otherTitle}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                  </h4>
                  {conn.description && (
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {conn.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteConnection(conn.id)}
                  className="p-1.5 text-slate-500 hover:text-cosmic-coral rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
