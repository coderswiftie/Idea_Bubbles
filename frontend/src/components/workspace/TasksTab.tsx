import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Rocket } from 'lucide-react';
import { IdeaDetail } from '../../types';
import { api } from '../../services/api';
import { useIdeas } from '../../context/IdeaContext';

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
            <h3 className="text-sm font-semibold text-ivory-100">Milestones & Tasks</h3>
            <p className="text-xs text-slate-400">
              {completedTasks} of {totalTasks} completed ({progressPercent}%)
            </p>
          </div>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-midnight-800 border border-midnight-700 hover:border-cosmic-lavender text-ivory-100 hover:text-white flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          )}
        </div>

        {totalTasks > 0 && (
          <div className="w-full bg-midnight-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cosmic-mint h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Convert to Active Project Banner */}
      {idea.status !== 'ACTIVE_PROJECT' && totalTasks >= 2 && (
        <div className="bg-midnight-800/80 border border-cosmic-mint/30 rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Rocket className="w-4 h-4 text-cosmic-mint shrink-0" />
            <p className="text-xs text-ivory-200">
              Ready to take this further? Convert this idea into an <strong>Active Project</strong>.
            </p>
          </div>
          <button
            onClick={handleConvertToProject}
            className="px-3 py-1 bg-cosmic-mint/20 hover:bg-cosmic-mint/30 text-cosmic-mint border border-cosmic-mint/40 rounded-lg text-xs font-semibold shrink-0 transition-colors"
          >
            Activate
          </button>
        </div>
      )}

      {/* Add Task Form */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="flex items-center gap-2 bg-midnight-800/90 border border-midnight-700 rounded-xl p-2.5">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What is the next step or milestone?..."
            autoFocus
            className="flex-1 bg-transparent text-xs text-ivory-100 placeholder-slate-500 focus:outline-none px-2"
          />
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewTitle('');
            }}
            className="px-2 py-1 text-xs text-slate-400 hover:text-ivory-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="px-3 py-1 bg-cosmic-lavender text-white rounded-lg text-xs font-medium hover:bg-purple-600 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}

      {/* Task List */}
      {idea.tasks.length === 0 && !isAdding ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-midnight-700">
          <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">No tasks defined</p>
          <p className="text-[11px] text-slate-500 mt-1">Break your idea into small, exciting experiments or checklist items.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {idea.tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${
                task.is_completed
                  ? 'bg-midnight-800/30 border-midnight-700/40 text-slate-400'
                  : 'bg-midnight-800/70 border-midnight-700/80 text-ivory-100'
              }`}
            >
              <div
                onClick={() => handleToggleTask(task.id, task.is_completed)}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                {task.is_completed ? (
                  <CheckCircle2 className="w-4 h-4 text-cosmic-mint shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 hover:text-cosmic-lavender shrink-0 transition-colors" />
                )}
                <span
                  className={`text-xs select-none truncate ${
                    task.is_completed ? 'line-through text-slate-500' : ''
                  }`}
                >
                  {task.title}
                </span>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-1 text-slate-500 hover:text-cosmic-coral rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
