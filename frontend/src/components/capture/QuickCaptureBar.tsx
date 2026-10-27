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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-30">
      <form
        onSubmit={handleSubmit}
        className="glass-panel-elevated rounded-2xl p-2.5 shadow-2xl transition-all border border-midnight-700/80 focus-within:border-cosmic-lavender/50 focus-within:shadow-glow-lavender"
      >
        <div className="flex items-center gap-2">
          {/* Subtle Sparkle icon */}
          <div className="pl-2 text-cosmic-lavender">
            <Sparkles className="w-4 h-4 animate-pulse-slow" />
          </div>

          {/* Main Input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Capture a spark, URL, or thought... (Press Enter to release)"
            className="flex-1 bg-transparent text-sm text-ivory-100 placeholder-slate-400 focus:outline-none px-2 py-1.5"
          />

          {/* Voice Dictation Button */}
          <VoiceRecorder onTranscript={handleVoiceTranscript} />

          {/* Toggle Options (Category & Priority) */}
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            title="Configure category and importance"
            className={`p-2 rounded-lg transition-all ${
              showOptions || selectedCatId || importance !== 3
                ? 'text-cosmic-lavender bg-midnight-700'
                : 'text-ivory-300 hover:text-ivory-100 hover:bg-midnight-700'
            }`}
          >
            <Folder className="w-4 h-4" />
          </button>

          {/* Send / Release Bubble Button */}
          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              text.trim() && !isSubmitting
                ? 'bg-cosmic-lavender hover:bg-purple-600 text-white shadow-glow-lavender cursor-pointer'
                : 'bg-midnight-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Spark</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Collapsible Options Tray */}
        {showOptions && (
          <div className="mt-3 pt-3 border-t border-midnight-700/60 flex flex-wrap items-center justify-between gap-3 text-xs text-ivory-200 px-2 animate-in fade-in duration-150">
            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Category:</span>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="bg-midnight-800 border border-midnight-700 rounded-lg px-2.5 py-1 text-xs text-ivory-100 focus:outline-none focus:border-cosmic-lavender"
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
              <span className="text-slate-400 mr-1">Priority:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setImportance(star)}
                  className={`p-0.5 transition-colors ${
                    star <= importance ? 'text-cosmic-amber' : 'text-slate-600'
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
