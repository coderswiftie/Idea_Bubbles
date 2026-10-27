import React, { useState } from 'react';
import { GitFork, ArrowRight, Trash2, Plus, Sparkles } from 'lucide-react';
import { useIdeas } from '../../context/IdeaContext';
import { api } from '../../services/api';

export const ConnectionsView: React.FC = () => {
  const { connections, ideas, selectIdea, refreshConnections } = useIdeas();
  const [isConnecting, setIsConnecting] = useState(false);
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [relType, setRelType] = useState('synergy with');
  const [desc, setDesc] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId || sourceId === targetId) return;

    await api.createConnection(sourceId, {
      target_idea_id: targetId,
      relationship_type: relType,
      description: desc.trim() || undefined,
    });

    setSourceId('');
    setTargetId('');
    setDesc('');
    setIsConnecting(false);
    refreshConnections();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Disconnect these ideas?')) {
      await api.deleteConnection(id);
      refreshConnections();
    }
  };

  return (
    <div className="w-full min-h-screen pt-20 pb-16 px-4 md:px-8 max-w-4xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-ivory-100 flex items-center gap-2">
            <GitFork className="w-5 h-5 text-cosmic-mint" />
            <span>Idea Constellations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interconnected thoughts, thematic bridges, and collaborative synergies
          </p>
        </div>

        {!isConnecting && ideas.length >= 2 && (
          <button
            onClick={() => setIsConnecting(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cosmic-mint/20 border border-cosmic-mint/50 hover:bg-cosmic-mint/30 text-cosmic-mint flex items-center gap-1.5 transition-all shadow-glow-mint"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Two Ideas</span>
          </button>
        )}
      </div>

      {/* Connect Ideas Modal / Form */}
      {isConnecting && (
        <form onSubmit={handleCreate} className="glass-panel p-4 rounded-2xl mb-6 space-y-3">
          <h3 className="text-xs font-bold text-ivory-100 uppercase tracking-wider">
            Link Two Ideas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Source Idea
              </label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                required
                className="w-full bg-midnight-900 border border-midnight-700 rounded-xl p-2 text-xs text-ivory-100 focus:outline-none focus:border-cosmic-mint"
              >
                <option value="">-- Choose first idea --</option>
                {ideas.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Destination Idea
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                required
                className="w-full bg-midnight-900 border border-midnight-700 rounded-xl p-2 text-xs text-ivory-100 focus:outline-none focus:border-cosmic-mint"
              >
                <option value="">-- Choose second idea --</option>
                {ideas.filter((i) => i.id !== sourceId).map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Relationship Type
              </label>
              <select
                value={relType}
                onChange={(e) => setRelType(e.target.value)}
                className="w-full bg-midnight-900 border border-midnight-700 rounded-xl p-2 text-xs text-ivory-100 focus:outline-none focus:border-cosmic-mint"
              >
                <option value="synergy with">Synergy with</option>
                <option value="inspired by">Inspired by</option>
                <option value="subset of">Subset of</option>
                <option value="alternative to">Alternative to</option>
                <option value="cross-domain with">Cross-domain with</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Why are they linked?
              </label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Optional description of connection..."
                className="w-full bg-midnight-900 border border-midnight-700 rounded-xl p-2 text-xs text-ivory-100 placeholder-slate-500 focus:outline-none focus:border-cosmic-mint"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsConnecting(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-ivory-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!sourceId || !targetId}
              className="px-4 py-1.5 bg-cosmic-mint text-midnight-950 font-bold rounded-lg text-xs hover:bg-emerald-400 disabled:opacity-50"
            >
              Establish Link
            </button>
          </div>
        </form>
      )}

      {/* Connections List */}
      {connections.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-midnight-700">
          <GitFork className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-ivory-200">No connections formed yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Connect thoughts together to see relationships charted as cosmic pathways on the universe canvas.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {connections.map((conn) => {
            const sIdea = ideas.find((i) => i.id === conn.source_idea_id);
            const tIdea = ideas.find((i) => i.id === conn.target_idea_id);

            return (
              <div
                key={conn.id}
                className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group hover:border-midnight-600 transition-all"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {/* Source */}
                  <span
                    onClick={() => selectIdea(conn.source_idea_id)}
                    className="text-xs font-bold text-ivory-100 hover:text-cosmic-lavender cursor-pointer truncate max-w-[180px]"
                  >
                    {sIdea?.title || 'Idea 1'}
                  </span>

                  {/* Relationship bridge pill */}
                  <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-midnight-900 border border-midnight-700 text-[10px] text-cosmic-mint font-semibold uppercase tracking-wider">
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span>{conn.relationship_type || 'Related'}</span>
                  </div>

                  {/* Target */}
                  <span
                    onClick={() => selectIdea(conn.target_idea_id)}
                    className="text-xs font-bold text-ivory-100 hover:text-cosmic-cyan cursor-pointer truncate max-w-[180px]"
                  >
                    {tIdea?.title || 'Idea 2'}
                  </span>
                </div>

                {conn.description && (
                  <p className="text-xs text-slate-400 text-left sm:text-right flex-1 truncate">
                    {conn.description}
                  </p>
                )}

                <button
                  onClick={() => handleDelete(conn.id)}
                  className="p-1.5 text-slate-500 hover:text-cosmic-coral rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Sever connection"
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
