import React, { useState, useRef } from 'react';
import { Upload, Trash2, File, Image as ImageIcon, Loader2 } from 'lucide-react';
import { IdeaDetail } from '../../types';
import { api } from '../../services/api';
import { useIdeas } from '../../context/IdeaContext';
import { PearlSparkle } from '../common/CoquetteBow';

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
      <div className="flex items-center justify-between pb-1">
        <div>
          <h3 className="font-brand text-4xl font-normal text-cocoa lowercase leading-none">attachments</h3>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-3 py-1 rounded-full text-xs font-sans text-cocoa-muted hover:text-cocoa border border-powder/70 hover:border-cocoa-muted/50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose" /> : <Upload className="w-3.5 h-3.5 text-cocoa-muted" />}
          <span>upload</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf,text/plain,text/markdown"
      />

      {error && <p className="text-xs text-rose">{error}</p>}

      {/* Attachment Grid */}
      {idea.attachments.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="text-center py-12 px-4 rounded-2xl border border-dashed border-powder/80 bg-pearl/60 cursor-pointer hover:border-cocoa-muted/40 transition-colors"
        >
          <p className="text-xs font-sans text-cocoa-muted">No attachments yet</p>
          <p className="text-[11px] text-cocoa-faint font-sans mt-1">Click to upload files</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {idea.attachments.map((att) => {
            const isImage = att.mime_type.startsWith('image/');
            const fileUrl = `http://localhost:8000/uploads/${att.file_path.split('/').pop()}`;

            return (
              <div
                key={att.id}
                className="bg-pearl border border-powder/80 rounded-2xl p-3 flex items-center gap-3 group hover:border-rose/50 transition-all shadow-sm"
              >
                {isImage ? (
                  <img
                    src={fileUrl}
                    alt={att.file_name}
                    className="w-12 h-12 rounded-xl object-cover bg-blush/30 border border-powder shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blush/30 border border-powder flex items-center justify-center shrink-0 text-mauve">
                    <File className="w-5 h-5" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-cocoa hover:text-rose truncate block font-sans"
                  >
                    {att.file_name}
                  </a>
                  <p className="text-[10px] text-mauve mt-0.5 font-sans">
                    {formatFileSize(att.file_size)} • {new Date(att.created_at).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(att.id)}
                  className="p-1.5 text-mauve hover:text-rose rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
