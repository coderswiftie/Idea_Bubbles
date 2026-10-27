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
          <h3 className="text-sm font-semibold text-ivory-100">Files & Attachments</h3>
          <p className="text-xs text-slate-400">Attach sketches, mockups, PDFs, and notes</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-midnight-800 border border-midnight-700 hover:border-cosmic-lavender text-ivory-100 hover:text-white flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          <span>Upload File</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf,text/plain,text/markdown"
      />

      {error && <p className="text-xs text-cosmic-coral">{error}</p>}

      {/* Attachment Grid */}
      {idea.attachments.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="text-center py-12 px-4 rounded-xl border border-dashed border-midnight-700 cursor-pointer hover:border-cosmic-lavender/50 transition-colors"
        >
          <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Drop files or click to upload</p>
          <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, WebP, PDF, Markdown up to 15MB</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {idea.attachments.map((att) => {
            const isImage = att.mime_type.startsWith('image/');
            const fileUrl = `http://localhost:8000/uploads/${att.file_path.split('/').pop()}`;

            return (
              <div
                key={att.id}
                className="bg-midnight-800/60 border border-midnight-700/80 rounded-xl p-3 flex items-center gap-3 group hover:border-midnight-600 transition-all"
              >
                {isImage ? (
                  <img
                    src={fileUrl}
                    alt={att.file_name}
                    className="w-12 h-12 rounded-lg object-cover bg-midnight-900 border border-midnight-700 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-midnight-900 border border-midnight-700 flex items-center justify-center shrink-0 text-slate-400">
                    <File className="w-5 h-5" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-ivory-100 hover:text-cosmic-lavender truncate block"
                  >
                    {att.file_name}
                  </a>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {formatFileSize(att.file_size)} • {new Date(att.created_at).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(att.id)}
                  className="p-1.5 text-slate-500 hover:text-cosmic-coral rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
