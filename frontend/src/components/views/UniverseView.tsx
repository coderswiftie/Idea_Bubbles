import React from 'react';
import { UniverseCanvas } from '../canvas/UniverseCanvas';
import { QuickCaptureBar } from '../capture/QuickCaptureBar';
import { useIdeas } from '../../context/IdeaContext';

export const UniverseView: React.FC = () => {
  const { categories, filterCategory, setFilterCategory } = useIdeas();

  return (
    <div className="relative w-full h-screen overflow-hidden pt-16">
      {/* Subtle Category Filter */}
      {categories.length > 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 overflow-x-auto max-w-[95%] px-3 py-1 scrollbar-none">
          <button
            onClick={() => setFilterCategory(null)}
            className={`text-xs transition-colors font-sans lowercase py-0.5 ${
              filterCategory === null
                ? 'text-cocoa font-semibold border-b border-rose'
                : 'text-cocoa-muted/70 hover:text-cocoa'
            }`}
          >
            all
          </button>
          {categories.map((cat) => {
            const isSel = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(isSel ? null : cat.id)}
                className={`text-xs transition-colors flex items-center gap-1.5 font-sans lowercase py-0.5 ${
                  isSel
                    ? 'text-cocoa font-semibold border-b border-rose'
                    : 'text-cocoa-muted/70 hover:text-cocoa'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color_hex }}
                />
                <span>{cat.name.toLowerCase()}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Interactive Physics Canvas */}
      <UniverseCanvas />

      {/* Persistent Quick Capture Bar */}
      <QuickCaptureBar />
    </div>
  );
};
