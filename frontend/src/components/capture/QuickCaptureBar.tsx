import React, { useState } from 'react';
import { Send, Sparkles, Star, Tag, Folder } from 'lucide-react';
import { useIdeas } from '../../context/IdeaContext';
import { VoiceRecorder } from '../common/VoiceRecorder';

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
        className="relative p-[1.5px] rounded-full bg-gradient-to-r from-iridescent-pink/40 via-iridescent-lavender/40 to-iridescent-cyan/40 shadow-[0_12px_45px_rgba(70,60,50,0.08)] transition-all focus-within:shadow-[0_16px_50px_rgba(180,160,240,0.22)]"
      >
        <div className="bg-white/95 backdrop-blur-2xl rounded-full px-3 py-2 flex items-center gap-2 border border-white/80">
          {/* Subtle Sparkle icon */}
          <div className="pl-2 text-iridescent-lavender flex items-center justify-center">
            <Sparkles className="w-4 h-4 animate-pulse-slow" />
          </div>

          {/* Main Input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Whisper a spark, quote, or fleeting thought..."
            className="flex-1 bg-transparent text-sm text-charcoal placeholder-stone-400 font-sans focus:outline-none px-2 py-1.5"
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
                ? 'text-iridescent-lavender bg-iridescent-lavender/10'
                : 'text-stone-400 hover:text-charcoal hover:bg-stone-100'
            }`}
          >
            <Folder className="w-4 h-4" />
          </button>

          {/* Send / Release Bubble Button */}
          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              text.trim() && !isSubmitting
                ? 'bg-gradient-to-r from-iridescent-lavender via-iridescent-pink/70 to-iridescent-cyan text-charcoal-900 shadow-sm hover:opacity-95 cursor-pointer font-semibold'
                : 'bg-stone-100/80 text-stone-400 cursor-not-allowed'
            }`}
          >
            <span className="font-editorial italic text-sm">Release</span>
            <Send className="w-3 h-3 text-stone-600" />
          </button>
        </div>

        {/* Collapsible Options Tray */}
        {showOptions && (
          <div className="mt-2 p-3 bg-white/95 backdrop-blur-xl rounded-2xl border border-stone-200/70 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 px-4 animate-in fade-in duration-150">
            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-stone-400 font-editorial italic text-sm">Folder:</span>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-charcoal focus:outline-none focus:border-iridescent-lavender shadow-sm cursor-pointer"
              >
                <option value="">Auto-detect / None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Importance Rating (1-5 stars) */}
            <div className="flex items-center gap-1">
              <span className="text-stone-400 font-editorial italic text-sm mr-1">Importance:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setImportance(star)}
                  className={`p-0.5 transition-colors ${
                    star <= importance ? 'text-iridescent-gold' : 'text-stone-300'
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
