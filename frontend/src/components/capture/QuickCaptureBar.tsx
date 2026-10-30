import React, { useState, useRef } from 'react';
import { ArrowUp, Star, Folder, Paperclip, X } from 'lucide-react';
import { useIdeas } from '../../context/IdeaContext';
import { VoiceRecorder } from '../common/VoiceRecorder';
import { api } from '../../services/api';

export const QuickCaptureBar: React.FC = () => {
  const { quickCapture, categories } = useIdeas();
  const [text, setText] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [importance, setImportance] = useState<number>(3);
  const [showOptions, setShowOptions] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    const raw = text.trim();
    const fileToUpload = attachedFile;
    setText('');
    setAttachedFile(null);
    setIsSubmitting(true);

    try {
      const newIdea = await quickCapture(raw, selectedCatId || undefined, importance);
      if (fileToUpload && newIdea?.id) {
        await api.uploadAttachment(newIdea.id, fileToUpload);
      }
      setShowOptions(false);
    } catch {
      // Error handled by context or toast
    } finally {
      setIsSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 w-[92%] max-w-xl z-30">
      {/* Collapsible Options Tray (Above Bar) */}
      {showOptions && (
        <div className="mb-2 p-3 bg-pearl/95 backdrop-blur-xl rounded-2xl border border-powder/70 shadow-[0_8px_30px_rgba(73,54,59,0.08)] flex flex-wrap items-center justify-between gap-3 text-xs text-cocoa-soft px-4 animate-in fade-in duration-150">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-cocoa-muted font-sans text-xs">collection:</span>
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="bg-pearl border border-powder/70 rounded-xl px-2.5 py-1 text-xs text-cocoa focus:outline-none focus:border-rose shadow-sm cursor-pointer font-sans"
            >
              <option value="">auto-detect</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Importance Rating (1-5 stars) */}
          <div className="flex items-center gap-1.5">
            <span className="text-cocoa-muted font-sans text-xs mr-0.5">priority:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setImportance(star)}
                className={`p-0.5 transition-colors ${
                  star <= importance ? 'text-champagne-dark' : 'text-powder/50'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Understated Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="bg-pearl/95 backdrop-blur-xl border border-powder/70 rounded-2xl p-2 px-3.5 shadow-[0_8px_30px_rgba(73,54,59,0.06)] flex items-center gap-2 transition-all focus-within:border-rose/70 focus-within:shadow-[0_8px_35px_rgba(201,143,164,0.12)]"
      >
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf,text/plain,text/markdown"
        />

        {/* Attached File Indicator */}
        {attachedFile && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blush border border-powder rounded-lg text-xs text-cocoa max-w-[120px] shrink-0">
            <span className="truncate text-[11px] font-sans">{attachedFile.name}</span>
            <button
              type="button"
              onClick={() => {
                setAttachedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-cocoa-muted hover:text-rose"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Text Input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Capture an idea..."
          className="flex-1 bg-transparent text-sm text-cocoa placeholder-cocoa-faint font-sans focus:outline-none px-1 py-1"
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach file"
          className={`p-1.5 rounded-lg transition-colors ${
            attachedFile ? 'text-rose' : 'text-cocoa-muted hover:text-cocoa'
          }`}
        >
          <Paperclip className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>

        {/* Voice Dictation */}
        <VoiceRecorder onTranscript={handleVoiceTranscript} />

        {/* Collection & Priority Options Toggle */}
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          title="Configure collection and priority"
          className={`p-1.5 rounded-lg transition-colors ${
            showOptions || selectedCatId || importance !== 3
              ? 'text-rose'
              : 'text-cocoa-muted hover:text-cocoa'
          }`}
        >
          <Folder className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>

        {/* Save Button */}
        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          className="px-3 py-1.5 rounded-xl bg-cocoa text-pearl text-xs font-sans tracking-wide hover:bg-cocoa-soft disabled:opacity-30 transition-all flex items-center gap-1.5 cursor-pointer ml-1"
        >
          <span>save</span>
          <ArrowUp className="w-3 h-3 stroke-[2]" />
        </button>
      </form>
    </div>
  );
};
