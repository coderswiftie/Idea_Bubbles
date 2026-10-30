import React, { useState } from 'react';
import { Send, Star, Folder } from 'lucide-react';
import { useIdeas } from '../../context/IdeaContext';
import { VoiceRecorder } from '../common/VoiceRecorder';
import { CoquetteBow, PearlSparkle } from '../common/CoquetteBow';

export const QuickCaptureBar: React.FC = () => {
  const { quickCapture, categories } = useIdeas();
  const [text, setText] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [importance, setImportance] = useState<number>(3);
  const [showOptions, setShowOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    const raw = text.trim();
    setText('');
    setIsSubmitting(true);

    try {
      await quickCapture(raw, selectedCatId || undefined, importance);
      // Reset expanded options on submission
      setShowOptions(false);
    } catch {
      // Error handled by context or toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  };

  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-30">
      <form
        onSubmit={handleSubmit}
        className="relative p-[1.5px] rounded-full bg-gradient-to-r from-powder via-rose-light to-champagne shadow-[0_12px_40px_rgba(201,143,164,0.18)] transition-all focus-within:shadow-[0_16px_50px_rgba(201,143,164,0.30)]"
      >
        <div className="bg-pearl/95 backdrop-blur-2xl rounded-full px-3 py-2 flex items-center gap-2 border border-white/90">
          {/* Dainty Bow Motif */}
          <div className="pl-2 flex items-center justify-center">
            <CoquetteBow size={20} className="filter drop-shadow-sm" />
          </div>

          {/* Main Input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="A little thought worth keeping, darling..."
            className="flex-1 bg-transparent text-sm text-cocoa placeholder-cocoa-faint font-sans focus:outline-none px-2 py-1.5"
          />

          {/* Voice Dictation Button */}
          <VoiceRecorder onTranscript={handleVoiceTranscript} />

          {/* Toggle Options (Category & Priority) */}
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            title="Configure category and importance"
            className={`p-2 rounded-full transition-all ${
              showOptions || selectedCatId || importance !== 3
                ? 'text-rose-dark bg-blush-200'
                : 'text-cocoa-muted hover:text-cocoa hover:bg-blush-100/60'
            }`}
          >
            <Folder className="w-4 h-4" />
          </button>

          {/* Send / Release Bubble Button */}
          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className={`px-4 py-2 rounded-full text-xs transition-all flex items-center gap-1.5 ${
              text.trim() && !isSubmitting
                ? 'bg-gradient-to-r from-blush-200 via-powder to-champagne-light text-cocoa border border-powder shadow-sm hover:opacity-95 cursor-pointer font-semibold'
                : 'bg-ivory-100 text-cocoa-faint cursor-not-allowed border border-powder/30'
            }`}
          >
            <span className="font-editorial italic text-sm text-cocoa">Preserve Thought</span>
            <Send className="w-3 h-3 text-cocoa-muted" />
          </button>
        </div>

        {/* Collapsible Options Tray */}
        {showOptions && (
          <div className="mt-2 p-3 bg-pearl/95 backdrop-blur-xl rounded-2xl border border-powder/70 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs text-cocoa-soft px-4 animate-in fade-in duration-150">
            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-cocoa-muted font-editorial italic text-sm">Collection:</span>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="bg-pearl border border-powder/70 rounded-lg px-2.5 py-1 text-xs text-cocoa focus:outline-none focus:border-rose shadow-sm cursor-pointer"
              >
                <option value="">Auto-detect / Gentle Flow</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Importance Rating (1-5 stars) */}
            <div className="flex items-center gap-1">
              <span className="text-cocoa-muted font-editorial italic text-sm mr-1">Preciousness:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setImportance(star)}
                  className={`p-0.5 transition-colors ${
                    star <= importance ? 'text-champagne-dark' : 'text-powder/40'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
