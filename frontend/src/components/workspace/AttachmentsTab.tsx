import React, { useState, useRef } from 'react';
import { Upload, Trash2, File, Image as ImageIcon, Loader2 } from 'lucide-react';
import { IdeaDetail } from '../../types';
import { api } from '../../services/api';
import { useIdeas } from '../../context/IdeaContext';

interface AttachmentsTabProps {
  idea: IdeaDetail;
}

export const AttachmentsTab: React.FC<AttachmentsTabProps> = ({ idea }) => {
  const { refreshSelectedIdea } = useIdeas();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      await api.uploadAttachment(idea.id, file);
      refreshSelectedIdea();
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (attId: string) => {
    if (confirm('Delete this attachment?')) {
      await api.deleteAttachment(idea.id, attId);
      refreshSelectedIdea();
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-handwriting text-2xl font-bold text-charcoal">Files & Attachments</h3>
          <p className="font-editorial italic text-stone-400 text-sm">Attach sketches, mockups, PDFs, and notes</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white border border-stone-200 hover:border-stone-300 text-charcoal hover:bg-stone-50 flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-iridescent-lavender" />}
          <span className="font-editorial italic text-sm">Upload File</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf,text/plain,text/markdown"
      />

      {error && <p className="text-xs text-iridescent-pink">{error}</p>}

      {/* Attachment Grid */}
      {idea.attachments.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="text-center py-12 px-4 rounded-2xl border border-dashed border-stone-200 bg-white/50 cursor-pointer hover:border-iridescent-lavender/50 transition-colors"
        >
          <ImageIcon className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-stone-600">Drop files or click to upload</p>
          <p className="text-[11px] text-stone-400 mt-1">PNG, JPG, WebP, PDF, Markdown up to 15MB</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {idea.attachments.map((att) => {
            const isImage = att.mime_type.startsWith('image/');
            const fileUrl = `http://localhost:8000/uploads/${att.file_path.split('/').pop()}`;

            return (
              <div
                key={att.id}
                className="bg-white border border-stone-200/80 rounded-2xl p-3 flex items-center gap-3 group hover:border-stone-300 transition-all shadow-sm"
              >
                {isImage ? (
                  <img
                    src={fileUrl}
                    alt={att.file_name}
                    className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center shrink-0 text-stone-400">
                    <File className="w-5 h-5" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-charcoal hover:text-stone-900 truncate block font-sans"
                  >
                    {att.file_name}
                  </a>
                  <p className="text-[10px] text-stone-400 mt-0.5 font-sans">
                    {formatFileSize(att.file_size)} • {new Date(att.created_at).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(att.id)}
                  className="p-1.5 text-stone-400 hover:text-iridescent-pink rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
