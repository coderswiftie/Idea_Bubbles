import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, FolderTree, Tag } from 'lucide-react';
import { useIdeas } from '../../context/IdeaContext';
import { api } from '../../services/api';

const COLOR_PRESETS = [
  '#F472B6', // Blush pink
  '#38BDF8', // Pale cyan
  '#A78BFA', // Subtle lavender
  '#34D399', // Mint
  '#FBBF24', // Champagne / Gold
  '#FB7185', // Rose
  '#818CF8', // Periwinkle
  '#A8A29E', // Warm stone
];

export const CategoriesView: React.FC = () => {
  const { categories, refreshCategories, refreshIdeas } = useIdeas();
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#A78BFA');
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
    <div className="w-full min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-handwriting text-3xl font-bold text-charcoal flex items-center gap-2.5">
            <FolderTree className="w-5 h-5 text-iridescent-gold" />
            <span>Idea Categories</span>
          </h2>
          <p className="font-editorial italic text-stone-400 text-sm mt-0.5">
            Organize and color-tint the clusters in your thought universe
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 rounded-full text-xs font-medium bg-gradient-to-r from-iridescent-lavender via-iridescent-pink/70 to-iridescent-cyan text-charcoal flex items-center gap-1.5 transition-all shadow-sm hover:opacity-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="font-editorial italic text-sm">New Category</span>
          </button>
        )}
      </div>

      {/* Add Category Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white/90 border border-stone-200/90 p-5 rounded-2xl mb-6 space-y-3 shadow-sm">
          <h3 className="font-handwriting text-2xl font-bold text-charcoal">
            Create Custom Category
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category name (e.g. Creative Writing, Robotics)..."
              autoFocus
              className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-charcoal placeholder-stone-400 focus:outline-none focus:border-iridescent-lavender font-sans"
            />
            {/* Color Presets */}
            <div className="flex items-center gap-1.5 shrink-0">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewCatColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    newCatColor === color ? 'scale-125 border-stone-600 shadow-sm' : 'border-transparent'
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
              className="px-3.5 py-1.5 rounded-lg text-xs text-stone-500 hover:text-charcoal"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="px-4 py-1.5 bg-gradient-to-r from-iridescent-lavender to-iridescent-cyan text-white rounded-xl text-xs font-semibold disabled:opacity-50 shadow-sm"
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
            className="bg-white border border-stone-200/80 p-4.5 rounded-2xl flex items-center justify-between group hover:border-stone-300 transition-all shadow-sm"
          >
            {editingCatId === cat.id ? (
              <div className="flex-1 flex items-center gap-2 mr-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-iridescent-lavender rounded-xl px-2.5 py-1 text-xs text-charcoal focus:outline-none font-sans"
                />
                <div className="flex items-center gap-1 shrink-0">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditColor(c)}
                      className={`w-4 h-4 rounded-full border ${
                        editColor === c ? 'border-stone-700' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => handleSaveEdit(cat.id)}
                  className="p-1.5 bg-gradient-to-r from-iridescent-lavender to-iridescent-cyan text-white rounded-lg hover:opacity-90 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-4 h-4 rounded-full shrink-0 shadow-sm border border-black/10"
                  style={{ backgroundColor: cat.color_hex }}
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-charcoal truncate font-sans">
                    {cat.name}
                  </h4>
                  <p className="text-[10px] text-stone-400 font-sans">
                    {cat.idea_count || 0} {cat.idea_count === 1 ? 'thought' : 'thoughts'}
                  </p>
                </div>
              </div>
            )}

            {editingCatId !== cat.id && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleStartEdit(cat)}
                  className="p-1.5 text-stone-400 hover:text-charcoal rounded-lg hover:bg-stone-100"
                  title="Edit category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 text-stone-400 hover:text-iridescent-pink rounded-lg hover:bg-stone-100"
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
