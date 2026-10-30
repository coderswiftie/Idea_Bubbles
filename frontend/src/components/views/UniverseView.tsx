import React from 'react';
import { UniverseCanvas } from '../canvas/UniverseCanvas';
import { QuickCaptureBar } from '../capture/QuickCaptureBar';
import { useIdeas } from '../../context/IdeaContext';

export const UniverseView: React.FC = () => {
  const { categories, filterCategory, setFilterCategory } = useIdeas();

  return (
    <div className="relative w-full h-screen overflow-hidden pt-16">
      {/* Floating Category Filter Pills (Top-Center) */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 overflow-x-auto max-w-[95%] px-4 py-1.5 bg-pearl/80 backdrop-blur-xl border border-powder/60 shadow-[0_4px_25px_rgba(201,143,164,0.08)] rounded-full scrollbar-none">
        <button
          onClick={() => setFilterCategory(null)}
          className={`px-3.5 py-1 rounded-full text-xs transition-all shrink-0 font-sans ${
            filterCategory === null
              ? 'bg-cocoa text-pearl shadow-sm font-medium'
              : 'text-cocoa-muted hover:text-cocoa hover:bg-blush-100/70'
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
                ? 'bg-pearl text-cocoa border border-powder font-medium shadow-sm'
                : 'text-cocoa-muted hover:text-cocoa hover:bg-pearl/60'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: cat.color_hex }}
            />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Gentle Artistic Journal Watermark */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0 gap-2">
        <p className="font-editorial italic text-2xl md:text-3xl text-cocoa-light/25 text-center max-w-lg px-6 leading-relaxed">
          thoughts drift like delicate soap bubbles in the morning light
        </p>
        <span className="font-brand text-xl text-rose/30">
          a gentle archive of fleeting sparks
        </span>
      </div>

      {/* Interactive Physics Canvas */}
      <UniverseCanvas />

      {/* Persistent Quick Capture Bar */}
      <QuickCaptureBar />
    </div>
  );
};
