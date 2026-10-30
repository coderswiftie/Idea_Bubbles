import React, { useState } from 'react';
import { GitFork, ArrowRight, Trash2, Plus } from 'lucide-react';
import { useIdeas } from '../../context/IdeaContext';
import { api } from '../../services/api';
import { CoquetteBow, PearlSparkle } from '../common/CoquetteBow';

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
    if (confirm('Disconnect these thoughts?')) {
      await api.deleteConnection(id);
      refreshConnections();
    }
  };

  return (
    <div className="w-full min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <CoquetteBow size={28} />
            <h2 className="font-brand text-4xl font-bold text-cocoa">
              Thought Constellations & Bridges
            </h2>
          </div>
          <p className="font-editorial italic text-cocoa-muted text-base mt-1">
            Interconnected thoughts, thematic bridges, and collaborative synergies
          </p>
        </div>

        {!isConnecting && ideas.length >= 2 && (
          <button
            onClick={() => setIsConnecting(true)}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-blush-200 text-cocoa border border-powder-dark hover:bg-blush-300 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="font-editorial italic text-sm">Connect Two Thoughts</span>
          </button>
        )}
      </div>

      {/* Connect Ideas Modal / Form */}
      {isConnecting && (
        <form onSubmit={handleCreate} className="bg-pearl/95 border border-powder/70 p-6 rounded-2xl mb-6 space-y-4 shadow-sm">
          <h3 className="font-brand text-2xl font-bold text-cocoa">
            Connect Two Thoughts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-cocoa-muted block mb-1 font-editorial italic text-sm">
                First Idea
              </label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                required
                className="w-full bg-ivory/80 border border-powder/70 rounded-xl p-2.5 text-xs text-cocoa focus:outline-none focus:border-rose font-sans cursor-pointer"
              >
                <option value="">-- Choose first thought --</option>
                {ideas.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-cocoa-muted block mb-1 font-editorial italic text-sm">
                Second Idea
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                required
                className="w-full bg-ivory/80 border border-powder/70 rounded-xl p-2.5 text-xs text-cocoa focus:outline-none focus:border-rose font-sans cursor-pointer"
              >
                <option value="">-- Choose second thought --</option>
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
              <label className="text-xs text-cocoa-muted block mb-1 font-editorial italic text-sm">
                Relationship
              </label>
              <select
                value={relType}
                onChange={(e) => setRelType(e.target.value)}
                className="w-full bg-ivory/80 border border-powder/70 rounded-xl p-2.5 text-xs text-cocoa focus:outline-none focus:border-rose font-sans cursor-pointer"
              >
                <option value="synergy with">Synergy with</option>
                <option value="inspired by">Inspired by</option>
                <option value="subset of">Subset of</option>
                <option value="alternative to">Alternative to</option>
                <option value="cross-domain with">Cross-domain with</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-cocoa-muted block mb-1 font-editorial italic text-sm">
                Connection note
              </label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Optional description of connection..."
                className="w-full bg-ivory/80 border border-powder/70 rounded-xl p-2.5 text-xs text-cocoa placeholder-cocoa-faint focus:outline-none focus:border-rose font-sans"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsConnecting(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs text-cocoa-muted hover:text-cocoa font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!sourceId || !targetId}
              className="px-4 py-1.5 bg-blush-200 hover:bg-blush-300 text-cocoa border border-powder-dark font-semibold rounded-xl text-xs hover:opacity-95 disabled:opacity-50 shadow-sm"
            >
              Establish Link
            </button>
          </div>
        </form>
      )}

      {/* Connections List */}
      {connections.length === 0 ? (
        <div className="text-center py-20 bg-pearl/60 border border-dashed border-powder/80 rounded-2xl">
          <PearlSparkle size={26} className="mx-auto mb-2 text-rose" />
          <p className="font-serif text-lg font-bold text-cocoa">No connections formed yet</p>
          <p className="font-editorial italic text-cocoa-muted mt-1 max-w-sm mx-auto text-sm">
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
                className="bg-pearl border border-powder/70 p-4.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group hover:border-rose/50 hover:shadow-sm transition-all shadow-xs"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {/* Source */}
                  <span
                    onClick={() => selectIdea(conn.source_idea_id)}
                    className="font-serif text-sm font-bold text-cocoa hover:text-rose-dark cursor-pointer truncate max-w-[180px]"
                  >
                    {sIdea?.title || 'Idea 1'}
                  </span>

                  {/* Relationship bridge pill */}
                  <div className="flex items-center gap-1.5 shrink-0 px-3 py-1 rounded-full bg-ivory/90 border border-powder text-xs text-cocoa font-medium font-sans shadow-xs">
                    <ArrowRight className="w-3 h-3 text-cocoa-muted" />
                    <span>{conn.relationship_type || 'Related'}</span>
                  </div>

                  {/* Target */}
                  <span
                    onClick={() => selectIdea(conn.target_idea_id)}
                    className="font-serif text-sm font-bold text-cocoa hover:text-rose-dark cursor-pointer truncate max-w-[180px]"
                  >
                    {tIdea?.title || 'Idea 2'}
                  </span>
                </div>

                {conn.description && (
                  <p className="text-xs text-cocoa-muted text-left sm:text-right flex-1 truncate font-sans">
                    {conn.description}
                  </p>
                )}

                <button
                  onClick={() => handleDelete(conn.id)}
                  className="p-1.5 text-cocoa-muted hover:text-rose-dark rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
