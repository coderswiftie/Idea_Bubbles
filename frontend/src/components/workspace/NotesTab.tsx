import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, FileText } from 'lucide-react';
import { IdeaDetail, Note } from '../../types';
import { api } from '../../services/api';
import { useIdeas } from '../../context/IdeaContext';

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
          <h3 className="text-sm font-semibold text-ivory-100">Progress Notes</h3>
          <p className="text-xs text-slate-400">Preserve developing thoughts and insights</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-midnight-800 border border-midnight-700 hover:border-cosmic-lavender text-ivory-100 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Note</span>
          </button>
        )}
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <form onSubmit={handleAddNote} className="bg-midnight-800/80 border border-midnight-700 rounded-xl p-3 space-y-2">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Write a note (Markdown formatting supported)..."
            rows={3}
            autoFocus
            className="w-full bg-midnight-900 border border-midnight-700 rounded-lg p-2.5 text-xs text-ivory-100 placeholder-slate-500 focus:outline-none focus:border-cosmic-lavender resize-y"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewNoteContent('');
              }}
              className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-ivory-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newNoteContent.trim()}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-cosmic-lavender text-white hover:bg-purple-600 disabled:opacity-50"
            >
              Save Note
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      {idea.notes.length === 0 && !isAdding ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-midnight-700">
          <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">No notes yet</p>
          <p className="text-[11px] text-slate-500 mt-1">Capture findings, code snippets, or thoughts as you explore.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {idea.notes.map((note) => (
            <div
              key={note.id}
              className="bg-midnight-800/60 border border-midnight-700/80 rounded-xl p-3.5 group hover:border-midnight-600 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500">
                  {new Date(note.created_at).toLocaleDateString()} at{' '}
                  {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleStartEdit(note)}
                    className="p-1 text-slate-400 hover:text-ivory-100 rounded"
                    title="Edit Note"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 text-slate-400 hover:text-cosmic-coral rounded"
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
                    className="w-full bg-midnight-900 border border-cosmic-lavender rounded-lg p-2 text-xs text-ivory-100 focus:outline-none"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="px-2 py-0.5 text-xs text-slate-400 hover:text-ivory-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(note.id)}
                      className="px-2.5 py-0.5 text-xs bg-cosmic-lavender text-white rounded font-medium flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-ivory-100 leading-relaxed whitespace-pre-wrap">
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
