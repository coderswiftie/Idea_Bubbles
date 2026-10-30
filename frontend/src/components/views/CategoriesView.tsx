import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, FolderTree } from 'lucide-react';
import { useIdeas } from '../../context/IdeaContext';
import { api } from '../../services/api';
import { CoquetteBow } from '../common/CoquetteBow';

const COLOR_PRESETS = [
  '#EFCBD5', // Powder pink
  '#C98FA4', // Muted rose
  '#B6E8EE', // Luminous soft cyan
  '#E9D8B9', // Champagne gold
  '#D2F0E2', // Soft mint
  '#9D7B8A', // Muted mauve
  '#F8E5E9', // Soft blush
  '#ECE3D4', // Warm ivory
];

export const CategoriesView: React.FC = () => {
  const { categories, refreshCategories, refreshIdeas } = useIdeas();
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#EFCBD5');
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
    if (confirm('Delete this collection? Ideas assigned to it will become uncategorized.')) {
      await api.deleteCategory(catId);
      refreshCategories();
      refreshIdeas();
    }
  };

  return (
    <div className="w-full min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="font-brand text-5xl md:text-6xl font-normal text-cocoa lowercase leading-none">
          collections
        </h2>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-sans bg-pearl border border-powder/70 text-cocoa hover:border-rose/60 flex items-center gap-1.5 transition-colors shadow-sm lowercase"
          >
            <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>new collection</span>
          </button>
        )}
      </div>

      {/* Add Category Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="bg-pearl/95 border border-powder/70 p-5 rounded-2xl mb-6 space-y-3 shadow-sm">
          <h3 className="font-brand text-3xl font-normal text-cocoa lowercase">
            new collection
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Collection name..."
              autoFocus
              className="w-full bg-ivory/80 border border-powder/70 rounded-xl px-3.5 py-2 text-xs text-cocoa placeholder-cocoa-faint focus:outline-none focus:border-rose font-sans"
            />
            {/* Color Presets */}
            <div className="flex items-center gap-1.5 shrink-0">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewCatColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    newCatColor === color ? 'scale-125 border-cocoa shadow-sm' : 'border-white/80'
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
              className="px-3.5 py-1.5 rounded-lg text-xs text-cocoa-muted hover:text-cocoa font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="px-4 py-1.5 bg-blush-200 hover:bg-blush-300 text-cocoa border border-powder-dark rounded-xl text-xs font-semibold disabled:opacity-50 shadow-sm"
            >
              Save Collection
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-pearl border border-powder/70 p-4.5 rounded-2xl flex items-center justify-between group hover:border-rose/50 hover:shadow-sm transition-all shadow-xs"
          >
            {editingCatId === cat.id ? (
              <div className="flex-1 flex items-center gap-2 mr-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-ivory/80 border border-powder rounded-xl px-2.5 py-1 text-xs text-cocoa focus:outline-none font-sans"
                />
                <div className="flex items-center gap-1 shrink-0">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditColor(c)}
                      className={`w-4 h-4 rounded-full border ${
                        editColor === c ? 'border-cocoa' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => handleSaveEdit(cat.id)}
                  className="p-1.5 bg-blush-200 text-cocoa border border-powder rounded-lg hover:bg-blush-300 shadow-sm"
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
                  <h4 className="text-xs font-bold text-cocoa truncate font-sans">
                    {cat.name}
                  </h4>
                  <p className="text-[10px] text-cocoa-muted font-sans">
                    {cat.idea_count || 0} {cat.idea_count === 1 ? 'thought' : 'thoughts'}
                  </p>
                </div>
              </div>
            )}

            {editingCatId !== cat.id && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleStartEdit(cat)}
                  className="p-1.5 text-cocoa-muted hover:text-cocoa rounded-lg hover:bg-blush-100"
                  title="Edit collection"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 text-cocoa-muted hover:text-rose-dark rounded-lg hover:bg-blush-100"
                  title="Delete collection"
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
