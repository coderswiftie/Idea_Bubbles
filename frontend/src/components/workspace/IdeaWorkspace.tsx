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
      <div className="px-6 border-b border-powder/50 flex items-center gap-5 overflow-x-auto py-2 shrink-0 bg-pearl/60">
        {[
          { key: 'overview', label: 'overview' },
          { key: 'notes', label: 'notes', count: selectedIdeaDetail?.notes.length },
          { key: 'tasks', label: 'tasks', count: selectedIdeaDetail?.tasks.length },
          { key: 'references', label: 'references', count: selectedIdeaDetail?.references.length },
          { key: 'connections', label: 'connections' },
          { key: 'attachments', label: 'attachments', count: selectedIdeaDetail?.attachments.length },
          { key: 'ai', label: 'studio' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`relative py-1.5 text-xs font-sans tracking-wide transition-colors shrink-0 flex items-center gap-1.5 lowercase ${
                isActive
                  ? 'text-cocoa font-medium'
                  : 'text-cocoa-muted/70 hover:text-cocoa'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className="text-[10px] text-mauve">({tab.count})</span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-rose/80 rounded-full animate-in fade-in duration-200" />
              )}
            </button>
          );
        })}
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
