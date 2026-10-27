import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, FolderTree, Tag } from 'lucide-react';
import { useIdeas } from '../../context/IdeaContext';
import { api } from '../../services/api';

const COLOR_PRESETS = [
  '#F43F5E', // Coral
  '#38BDF8', // Sky
  '#8B5CF6', // Lavender
  '#2DD4BF', // Mint/Cyan
  '#FBBF24', // Amber
  '#FB7185', // Rose
  '#818CF8', // Indigo
  '#94A3B8', // Slate
];

export const CategoriesView: React.FC = () => {
  const { categories, refreshCategories, refreshIdeas } = useIdeas();
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#8B5CF6');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    await api.createCategory({
      name: newCatName.trim(),
      color_hex: newCatColor,
    });
    setNewCatName('');
    setIsAdding(false);
    refreshCategories();
    refreshIdeas();
  };

  const handleStartEdit = (cat: any) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color_hex);
  };

  const handleSaveEdit = async (catId: string) => {
    if (!editName.trim()) return;
    await api.updateCategory(catId, {
      name: editName.trim(),
      color_hex: editColor,
    });
    setEditingCatId(null);
    refreshCategories();
    refreshIdeas();
  };

  const handleDelete = async (catId: string) => {
    if (confirm('Delete this category? Ideas assigned to it will become uncategorized.')) {
      await api.deleteCategory(catId);
      refreshCategories();
      refreshIdeas();
    }
  };

  return (
    <div className="w-full min-h-screen pt-20 pb-16 px-4 md:px-8 max-w-4xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-ivory-100 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-cosmic-amber" />
            <span>Idea Categories</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize and color-code the celestial clusters in your idea universe
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cosmic-lavender hover:bg-purple-600 text-white flex items-center gap-1.5 transition-all shadow-glow-lavender"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Category</span>
          </button>
        )}
      </div>

      {/* Add Category Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="glass-panel p-4 rounded-2xl mb-6 space-y-3">
          <h3 className="text-xs font-bold text-ivory-100 uppercase tracking-wider">
            Create Custom Category
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category name (e.g. Creative Writing, Robotics)..."
              autoFocus
              className="w-full bg-midnight-900 border border-midnight-700 rounded-xl px-3 py-2 text-xs text-ivory-100 placeholder-slate-500 focus:outline-none focus:border-cosmic-lavender"
            />
            {/* Color Presets */}
            <div className="flex items-center gap-1.5 shrink-0">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewCatColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    newCatColor === color ? 'scale-125 border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-ivory-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="px-4 py-1.5 bg-cosmic-lavender text-white rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              Create Category
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="glass-panel p-4 rounded-2xl flex items-center justify-between group hover:border-slate-600 transition-all"
          >
            {editingCatId === cat.id ? (
              <div className="flex-1 flex items-center gap-2 mr-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-midnight-900 border border-cosmic-lavender rounded-lg px-2 py-1 text-xs text-ivory-100 focus:outline-none"
                />
                <div className="flex items-center gap-1 shrink-0">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditColor(c)}
                      className={`w-4 h-4 rounded-full border ${
                        editColor === c ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => handleSaveEdit(cat.id)}
                  className="p-1.5 bg-cosmic-lavender text-white rounded hover:bg-purple-600"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: cat.color_hex }}
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-ivory-100 truncate">
                    {cat.name}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {cat.idea_count || 0} {cat.idea_count === 1 ? 'idea' : 'ideas'}
                  </p>
                </div>
              </div>
            )}

            {editingCatId !== cat.id && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleStartEdit(cat)}
                  className="p-1.5 text-slate-400 hover:text-ivory-100 rounded-lg hover:bg-midnight-800"
                  title="Edit category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 text-slate-400 hover:text-cosmic-coral rounded-lg hover:bg-midnight-800"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
