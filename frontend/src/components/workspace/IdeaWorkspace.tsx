import React, { useState } from 'react';
import { X, Sparkles, FileText, CheckSquare, Link2, Paperclip, GitFork, Trash2, Archive, Loader2 } from 'lucide-react';
import { useIdeas } from '../../context/IdeaContext';
import { OverviewTab } from './OverviewTab';
import { NotesTab } from './NotesTab';
import { ReferencesTab } from './ReferencesTab';
import { TasksTab } from './TasksTab';
import { ConnectionsTab } from './ConnectionsTab';
import { AttachmentsTab } from './AttachmentsTab';
import { AIChatTab } from './AIChatTab';
import { api } from '../../services/api';

type TabKey = 'overview' | 'notes' | 'references' | 'tasks' | 'connections' | 'attachments' | 'ai';

export const IdeaWorkspace: React.FC = () => {
  const { selectedIdeaId, selectedIdeaDetail, selectIdea, refreshIdeas } = useIdeas();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  if (!selectedIdeaId) return null;

  const handleClose = () => {
    selectIdea(null);
  };

  const handleArchive = async () => {
    if (confirm('Archive this thought? It will be moved to your archive.')) {
      await api.deleteIdea(selectedIdeaId, false);
      selectIdea(null);
      refreshIdeas();
    }
  };

  const handleDeletePermanent = async () => {
    if (confirm('Permanently delete this thought and all its notes? This cannot be undone.')) {
      await api.deleteIdea(selectedIdeaId, true);
      selectIdea(null);
      refreshIdeas();
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[540px] md:w-[600px] z-40 bg-pearl/98 backdrop-blur-2xl border-l border-powder shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="p-4 px-6 border-b border-powder/70 flex items-center justify-between shrink-0 bg-pearl/90">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm border border-white"
            style={{ backgroundColor: selectedIdeaDetail?.category?.color_hex || '#C98FA4' }}
          />
          <h2 className="font-serif text-lg font-bold text-cocoa truncate">
            {selectedIdeaDetail?.title || 'Thought Journal'}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleArchive}
            title="Archive Thought"
            className="p-1.5 text-cocoa-muted hover:text-cocoa rounded-lg hover:bg-blush-100 transition-colors"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeletePermanent}
            title="Delete Permanently"
            className="p-1.5 text-cocoa-muted hover:text-rose-dark rounded-lg hover:bg-blush-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-powder mx-1" />
          <button
            onClick={handleClose}
            className="p-1.5 text-cocoa-muted hover:text-cocoa rounded-lg hover:bg-blush-100 transition-colors"
            title="Close Journal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-5 border-b border-powder/60 flex items-center gap-1 overflow-x-auto py-2 shrink-0 bg-ivory-50/70">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-pearl text-cocoa border border-powder shadow-sm font-semibold'
              : 'text-cocoa-muted hover:text-cocoa hover:bg-blush-100/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-rose" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'notes'
              ? 'bg-pearl text-cocoa border border-powder shadow-sm font-semibold'
              : 'text-cocoa-muted hover:text-cocoa hover:bg-blush-100/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-mauve" />
          <span>Notes</span>
          {selectedIdeaDetail && selectedIdeaDetail.notes.length > 0 && (
            <span className="text-[10px] bg-blush-200 px-1.5 py-0.2 rounded-full text-cocoa font-sans font-semibold">
              {selectedIdeaDetail.notes.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'tasks'
              ? 'bg-pearl text-cocoa border border-powder shadow-sm font-semibold'
              : 'text-cocoa-muted hover:text-cocoa hover:bg-blush-100/60'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-rose-dark" />
          <span>Tasks</span>
          {selectedIdeaDetail && selectedIdeaDetail.tasks.length > 0 && (
            <span className="text-[10px] bg-blush-200 px-1.5 py-0.2 rounded-full text-cocoa font-sans font-semibold">
              {selectedIdeaDetail.tasks.filter((t) => t.is_completed).length}/{selectedIdeaDetail.tasks.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('references')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'references'
              ? 'bg-pearl text-cocoa border border-powder shadow-sm font-semibold'
              : 'text-cocoa-muted hover:text-cocoa hover:bg-blush-100/60'
          }`}
        >
          <Link2 className="w-3.5 h-3.5 text-champagne-dark" />
          <span>References</span>
          {selectedIdeaDetail && selectedIdeaDetail.references.length > 0 && (
            <span className="text-[10px] bg-blush-200 px-1.5 py-0.2 rounded-full text-cocoa font-sans font-semibold">
              {selectedIdeaDetail.references.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('connections')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'connections'
              ? 'bg-pearl text-cocoa border border-powder shadow-sm font-semibold'
              : 'text-cocoa-muted hover:text-cocoa hover:bg-blush-100/60'
          }`}
        >
          <GitFork className="w-3.5 h-3.5 text-mauve" />
          <span>Connections</span>
        </button>

        <button
          onClick={() => setActiveTab('attachments')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'attachments'
              ? 'bg-pearl text-cocoa border border-powder shadow-sm font-semibold'
              : 'text-cocoa-muted hover:text-cocoa hover:bg-blush-100/60'
          }`}
        >
          <Paperclip className="w-3.5 h-3.5 text-cocoa-muted" />
          <span>Files</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'ai'
              ? 'bg-gradient-to-r from-blush via-powder to-champagne-light text-cocoa border border-powder shadow-sm'
              : 'text-rose-dark hover:bg-blush-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-dark" />
          <span>AI Studio</span>
        </button>
      </div>

      {/* Tab Body Content */}
      <div className="flex-1 overflow-y-auto p-6 journal-card-body">
        {!selectedIdeaDetail ? (
          <div className="flex items-center justify-center h-48 text-cocoa-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-rose" />
            <span className="text-xs font-editorial italic text-base">Opening thought journal page...</span>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab idea={selectedIdeaDetail} />}
            {activeTab === 'notes' && <NotesTab idea={selectedIdeaDetail} />}
            {activeTab === 'tasks' && <TasksTab idea={selectedIdeaDetail} />}
            {activeTab === 'references' && <ReferencesTab idea={selectedIdeaDetail} />}
            {activeTab === 'connections' && <ConnectionsTab idea={selectedIdeaDetail} />}
            {activeTab === 'attachments' && <AttachmentsTab idea={selectedIdeaDetail} />}
            {activeTab === 'ai' && <AIChatTab idea={selectedIdeaDetail} />}
          </>
        )}
      </div>
    </div>
  );
};
