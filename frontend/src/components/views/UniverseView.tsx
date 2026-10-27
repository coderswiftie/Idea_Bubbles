import React from 'react';
import { UniverseCanvas } from '../canvas/UniverseCanvas';
import { QuickCaptureBar } from '../capture/QuickCaptureBar';
import { useIdeas } from '../../context/IdeaContext';

export const UniverseView: React.FC = () => {
  const { categories, filterCategory, setFilterCategory } = useIdeas();

  return (
    <div className="relative w-full h-screen overflow-hidden pt-14">
      {/* Floating Category Filter Pills (Top-Center) */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 overflow-x-auto max-w-[95%] px-3 py-1.5 glass-panel rounded-full scrollbar-none">
        <button
          onClick={() => setFilterCategory(null)}
          className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 ${
            filterCategory === null
              ? 'bg-cosmic-lavender text-white shadow-glow-lavender'
              : 'text-slate-400 hover:text-ivory-100 hover:bg-midnight-800'
          }`}
        >
          All Stars
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id === filterCategory ? null : cat.id)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              filterCategory === cat.id
                ? 'bg-midnight-800 text-ivory-100 border border-slate-500 shadow-sm'
                : 'text-slate-400 hover:text-ivory-100 hover:bg-midnight-800/60'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: cat.color_hex }}
            />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Interactive Physics Canvas */}
      <UniverseCanvas />

      {/* Persistent Quick Capture Bar */}
      <QuickCaptureBar />
    </div>
  );
};
