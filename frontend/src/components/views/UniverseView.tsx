import React from 'react';
import { UniverseCanvas } from '../canvas/UniverseCanvas';
import { QuickCaptureBar } from '../capture/QuickCaptureBar';
import { useIdeas } from '../../context/IdeaContext';

export const UniverseView: React.FC = () => {
  const { categories, filterCategory, setFilterCategory } = useIdeas();

  return (
    <div className="relative w-full h-screen overflow-hidden pt-16">
      {/* Floating Category Filter Pills (Top-Center) */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 overflow-x-auto max-w-[95%] px-4 py-1.5 bg-white/70 backdrop-blur-xl border border-stone-200/60 shadow-[0_4px_25px_rgba(70,60,50,0.04)] rounded-full scrollbar-none">
        <button
          onClick={() => setFilterCategory(null)}
          className={`px-3.5 py-1 rounded-full text-xs transition-all shrink-0 font-sans ${
            filterCategory === null
              ? 'bg-charcoal text-white shadow-sm font-medium'
              : 'text-stone-500 hover:text-charcoal hover:bg-stone-100/70'
          }`}
        >
          All Thoughts
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id === filterCategory ? null : cat.id)}
            className={`px-3.5 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 shrink-0 font-sans ${
              filterCategory === cat.id
                ? 'bg-white text-charcoal border border-stone-300 font-medium shadow-sm'
                : 'text-stone-500 hover:text-charcoal hover:bg-white/60'
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

      {/* Gentle Artistic Journal Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <p className="font-handwriting text-3xl md:text-4xl text-stone-400/20 text-center max-w-lg px-6 leading-relaxed">
          thoughts drift like gentle soap bubbles in the morning light
        </p>
      </div>

      {/* Interactive Physics Canvas */}
      <UniverseCanvas />

      {/* Persistent Quick Capture Bar */}
      <QuickCaptureBar />
    </div>
  );
};
