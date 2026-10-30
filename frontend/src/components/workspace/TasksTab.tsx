import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { IdeaDetail } from '../../types';
import { api } from '../../services/api';
import { useIdeas } from '../../context/IdeaContext';
import { PearlSparkle } from '../common/CoquetteBow';

interface TasksTabProps {
  idea: IdeaDetail;
}

export const TasksTab: React.FC<TasksTabProps> = ({ idea }) => {
  const { refreshSelectedIdea } = useIdeas();
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const totalTasks = idea.tasks.length;
  const completedTasks = idea.tasks.filter((t) => t.is_completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await api.addTask(idea.id, newTitle.trim(), idea.tasks.length);
    setNewTitle('');
    setIsAdding(false);
    refreshSelectedIdea();
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    await api.updateTask(idea.id, taskId, { is_completed: !currentStatus });
    refreshSelectedIdea();
  };

  const handleDeleteTask = async (taskId: string) => {
    await api.deleteTask(idea.id, taskId);
    refreshSelectedIdea();
  };

  const handleConvertToProject = async () => {
    await api.updateIdea(idea.id, { status: 'ACTIVE_PROJECT' });
    refreshSelectedIdea();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header with Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-brand text-4xl font-normal text-cocoa lowercase leading-none">tasks</h3>
            <p className="text-xs text-cocoa-muted font-sans mt-1">
              {completedTasks} of {totalTasks} completed ({progressPercent}%)
            </p>
          </div>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-3 py-1 rounded-full text-xs font-sans text-cocoa-muted hover:text-cocoa border border-powder/70 hover:border-cocoa-muted/50 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>new task</span>
            </button>
          )}
        </div>

        {totalTasks > 0 && (
          <div className="w-full bg-powder/30 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-rose h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Convert to Active Project Banner */}
      {idea.status !== 'ACTIVE_PROJECT' && totalTasks >= 2 && (
        <div className="bg-blush-50 border border-powder/60 rounded-2xl p-3 flex items-center justify-between gap-3">
          <p className="text-xs text-cocoa font-sans">
            Convert this idea into an active project.
          </p>
          <button
            onClick={handleConvertToProject}
            className="px-3 py-1 text-xs border border-powder/80 rounded-full text-cocoa hover:border-cocoa-muted font-sans transition-colors"
          >
            activate
          </button>
        </div>
      )}

      {/* Add Task Form */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="flex items-center gap-2 bg-pearl/95 border border-powder/70 rounded-2xl p-3 shadow-sm">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Next step or task..."
            autoFocus
            className="flex-1 bg-transparent text-xs text-cocoa placeholder-cocoa-faint focus:outline-none px-2 font-sans"
          />
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewTitle('');
            }}
            className="px-2.5 py-1 text-xs text-cocoa-muted hover:text-cocoa font-sans"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="px-4 py-1.5 bg-blush-200 hover:bg-blush-300 text-cocoa border border-powder-dark rounded-xl text-xs font-semibold disabled:opacity-50 shadow-sm"
          >
            Add
          </button>
        </form>
      )}

      {/* Task List */}
      {idea.tasks.length === 0 && !isAdding ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-powder/80 bg-pearl/60">
          <p className="text-xs font-sans text-cocoa-muted">No tasks defined</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {idea.tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all group ${
                task.is_completed
                  ? 'bg-ivory-50/80 border-powder/40 text-cocoa-muted'
                  : 'bg-pearl border-powder/70 text-cocoa shadow-xs hover:border-rose/50'
              }`}
            >
              <div
                onClick={() => handleToggleTask(task.id, task.is_completed)}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                {task.is_completed ? (
                  <CheckCircle2 className="w-4 h-4 text-rose shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-powder-dark hover:text-rose shrink-0 transition-colors" />
                )}
                <span
                  className={`text-xs select-none truncate font-sans ${
                    task.is_completed ? 'line-through text-cocoa-muted' : 'text-cocoa font-medium'
                  }`}
                >
                  {task.title}
                </span>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-1 text-cocoa-muted hover:text-rose-dark rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
