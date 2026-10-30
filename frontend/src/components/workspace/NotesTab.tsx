import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, FileText } from 'lucide-react';
import { IdeaDetail, Note } from '../../types';
import { api } from '../../services/api';
import { useIdeas } from '../../context/IdeaContext';
import { PearlSparkle } from '../common/CoquetteBow';

interface NotesTabProps {
  idea: IdeaDetail;
}

export const NotesTab: React.FC<NotesTabProps> = ({ idea }) => {
  const { refreshSelectedIdea } = useIdeas();
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    await api.addNote(idea.id, newNoteContent.trim());
    setNewNoteContent('');
    setIsAdding(false);
    refreshSelectedIdea();
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editContent.trim()) return;
    await api.updateNote(idea.id, noteId, editContent.trim());
    setEditingNoteId(null);
    refreshSelectedIdea();
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Delete this note?')) {
      await api.deleteNote(idea.id, noteId);
      refreshSelectedIdea();
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-brand text-3xl font-bold text-cocoa">Progress Notes</h3>
          <p className="font-editorial italic text-cocoa-muted text-sm">Preserve developing thoughts and creative insights</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-blush-200 hover:bg-blush-300 text-cocoa border border-powder-dark flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="font-editorial italic text-sm">Add Note</span>
          </button>
        )}
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <form onSubmit={handleAddNote} className="bg-pearl/95 border border-powder/70 rounded-2xl p-4 space-y-3 shadow-sm">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Write a note (Markdown formatting supported)..."
            rows={3}
            autoFocus
            className="w-full bg-ivory/80 border border-powder/70 rounded-xl p-3 text-xs text-cocoa placeholder-cocoa-faint focus:outline-none focus:border-rose resize-y font-sans"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewNoteContent('');
              }}
              className="px-3 py-1.5 rounded-lg text-xs text-cocoa-muted hover:text-cocoa font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newNoteContent.trim()}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blush-200 hover:bg-blush-300 text-cocoa border border-powder-dark disabled:opacity-50 shadow-sm"
            >
              Save Note
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      {idea.notes.length === 0 && !isAdding ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-powder/80 bg-pearl/60">
          <PearlSparkle size={24} className="mx-auto mb-2 text-rose" />
          <p className="text-xs font-medium text-cocoa font-sans">No notes yet</p>
          <p className="text-[11px] text-cocoa-muted mt-1 font-editorial italic text-sm">Capture findings, inspirations, or passages as you explore.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {idea.notes.map((note) => (
            <div
              key={note.id}
              className="bg-pearl border border-powder/70 rounded-2xl p-4 group hover:border-rose/50 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-cocoa-muted font-sans">
                  {new Date(note.created_at).toLocaleDateString()} at{' '}
                  {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleStartEdit(note)}
                    className="p-1 text-cocoa-muted hover:text-cocoa rounded hover:bg-blush-100"
                    title="Edit Note"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 text-cocoa-muted hover:text-rose-dark rounded hover:bg-blush-100"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {editingNoteId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full bg-ivory/80 border border-rose rounded-xl p-2.5 text-xs text-cocoa focus:outline-none font-sans"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="px-2.5 py-1 text-xs text-cocoa-muted hover:text-cocoa font-sans"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(note.id)}
                      className="px-3 py-1 text-xs bg-blush-200 text-cocoa border border-powder-dark rounded-lg font-semibold flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3 h-3" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-cocoa leading-relaxed whitespace-pre-wrap font-sans">
                  {note.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
