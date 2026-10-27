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
    if (confirm('Archive this idea? It will be moved to your archive.')) {
      await api.deleteIdea(selectedIdeaId, false);
      selectIdea(null);
      refreshIdeas();
    }
  };

  const handleDeletePermanent = async () => {
    if (confirm('Permanently delete this idea and all its notes? This cannot be undone.')) {
      await api.deleteIdea(selectedIdeaId, true);
      selectIdea(null);
      refreshIdeas();
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[540px] md:w-[600px] z-40 bg-midnight-950/95 border-l border-midnight-700/80 shadow-2xl backdrop-blur-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="p-4 border-b border-midnight-700/80 flex items-center justify-between shrink-0 bg-midnight-900/60">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: selectedIdeaDetail?.category?.color_hex || '#8B5CF6' }}
          />
          <h2 className="text-sm font-bold text-ivory-100 truncate">
            {selectedIdeaDetail?.title || 'Idea Workspace'}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleArchive}
            title="Archive Idea"
            className="p-1.5 text-slate-400 hover:text-ivory-100 rounded-lg hover:bg-midnight-800 transition-colors"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeletePermanent}
            title="Delete Permanently"
            className="p-1.5 text-slate-400 hover:text-cosmic-coral rounded-lg hover:bg-midnight-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-midnight-700 mx-1" />
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-midnight-800 transition-colors"
            title="Close Workspace"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-4 border-b border-midnight-700/60 flex items-center gap-1 overflow-x-auto py-2 shrink-0 bg-midnight-900/40">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-midnight-800 text-ivory-100 border border-midnight-700 shadow-sm'
              : 'text-slate-400 hover:text-ivory-200 hover:bg-midnight-850'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cosmic-cyan" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'notes'
              ? 'bg-midnight-800 text-ivory-100 border border-midnight-700 shadow-sm'
              : 'text-slate-400 hover:text-ivory-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-cosmic-sky" />
          <span>Notes</span>
          {selectedIdeaDetail && selectedIdeaDetail.notes.length > 0 && (
            <span className="text-[10px] bg-midnight-900 px-1.5 py-0.2 rounded-full text-slate-300">
              {selectedIdeaDetail.notes.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'tasks'
              ? 'bg-midnight-800 text-ivory-100 border border-midnight-700 shadow-sm'
              : 'text-slate-400 hover:text-ivory-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-cosmic-mint" />
          <span>Tasks</span>
          {selectedIdeaDetail && selectedIdeaDetail.tasks.length > 0 && (
            <span className="text-[10px] bg-midnight-900 px-1.5 py-0.2 rounded-full text-slate-300">
              {selectedIdeaDetail.tasks.filter((t) => t.is_completed).length}/{selectedIdeaDetail.tasks.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('references')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'references'
              ? 'bg-midnight-800 text-ivory-100 border border-midnight-700 shadow-sm'
              : 'text-slate-400 hover:text-ivory-200'
          }`}
        >
          <Link2 className="w-3.5 h-3.5 text-cosmic-amber" />
          <span>References</span>
          {selectedIdeaDetail && selectedIdeaDetail.references.length > 0 && (
            <span className="text-[10px] bg-midnight-900 px-1.5 py-0.2 rounded-full text-slate-300">
              {selectedIdeaDetail.references.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('connections')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'connections'
              ? 'bg-midnight-800 text-ivory-100 border border-midnight-700 shadow-sm'
              : 'text-slate-400 hover:text-ivory-200'
          }`}
        >
          <GitFork className="w-3.5 h-3.5 text-cosmic-indigo" />
          <span>Connections</span>
        </button>

        <button
          onClick={() => setActiveTab('attachments')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'attachments'
              ? 'bg-midnight-800 text-ivory-100 border border-midnight-700 shadow-sm'
              : 'text-slate-400 hover:text-ivory-200'
          }`}
        >
          <Paperclip className="w-3.5 h-3.5 text-slate-400" />
          <span>Files</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'ai'
              ? 'bg-cosmic-lavender text-white shadow-glow-lavender'
              : 'text-cosmic-lavender hover:bg-cosmic-lavender/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Studio</span>
        </button>
      </div>

      {/* Tab Body Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {!selectedIdeaDetail ? (
          <div className="flex items-center justify-center h-48 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-cosmic-lavender" />
            <span className="text-xs">Loading idea universe...</span>
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
