import React from 'react';
import {
  Compass,
  List,
  FolderTree,
  GitFork,
  Sparkles,
  Search,
  Pause,
  Play,
  Eye,
  EyeOff,
  User as UserIcon,
} from 'lucide-react';
import { useIdeas } from '../../context/IdeaContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onOpenAuth }) => {
  const {
    activeView,
    setActiveView,
    physicsPaused,
    setPhysicsPaused,
    reducedMotion,
    setReducedMotion,
    aiStatus,
  } = useIdeas();
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-30 glass-panel border-b border-midnight-700/80 px-4 md:px-6 flex items-center justify-between">
      {/* Brand Logo */}
      <div
        onClick={() => setActiveView('universe')}
        className="flex items-center gap-2.5 cursor-pointer group select-none"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cosmic-lavender to-cosmic-cyan p-[1px] shadow-glow-lavender">
          <div className="w-full h-full rounded-full bg-midnight-950 flex items-center justify-center">
            <span className="text-xs font-black text-ivory-100 group-hover:scale-110 transition-transform">
              ✦
            </span>
          </div>
        </div>
        <div>
          <h1 className="text-xs font-black tracking-widest uppercase text-ivory-100 group-hover:text-white">
            Idea Bubbles
          </h1>
          <p className="text-[9px] text-slate-400 font-mono tracking-tight hidden sm:block">
            Personal AI Universe
          </p>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex items-center gap-1 bg-midnight-950/60 border border-midnight-700/80 rounded-xl p-1">
        <button
          onClick={() => setActiveView('universe')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeView === 'universe'
              ? 'bg-midnight-800 text-ivory-100 border border-midnight-700 shadow-sm'
              : 'text-slate-400 hover:text-ivory-100'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-cosmic-lavender" />
          <span className="hidden sm:inline">Universe</span>
        </button>

        <button
          onClick={() => setActiveView('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeView === 'all'
              ? 'bg-midnight-800 text-ivory-100 border border-midnight-700 shadow-sm'
              : 'text-slate-400 hover:text-ivory-100'
          }`}
        >
          <List className="w-3.5 h-3.5 text-cosmic-cyan" />
          <span className="hidden sm:inline">All Ideas</span>
        </button>

        <button
          onClick={() => setActiveView('categories')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeView === 'categories'
              ? 'bg-midnight-800 text-ivory-100 border border-midnight-700 shadow-sm'
              : 'text-slate-400 hover:text-ivory-100'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5 text-cosmic-amber" />
          <span className="hidden sm:inline">Categories</span>
        </button>

        <button
          onClick={() => setActiveView('connections')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeView === 'connections'
              ? 'bg-midnight-800 text-ivory-100 border border-midnight-700 shadow-sm'
              : 'text-slate-400 hover:text-ivory-100'
          }`}
        >
          <GitFork className="w-3.5 h-3.5 text-cosmic-mint" />
          <span className="hidden sm:inline">Connections</span>
        </button>

        <button
          onClick={() => setActiveView('rediscover')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeView === 'rediscover'
              ? 'bg-midnight-800 text-ivory-100 border border-midnight-700 shadow-sm'
              : 'text-slate-400 hover:text-ivory-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cosmic-coral" />
          <span className="hidden sm:inline">Rediscover</span>
        </button>
      </nav>

      {/* Right Controls (Search, Physics Toggle, User Profile) */}
      <div className="flex items-center gap-2">
        {/* Search Modal Trigger */}
        <button
          onClick={onOpenSearch}
          className="px-2.5 py-1.5 rounded-lg bg-midnight-950/60 border border-midnight-700/80 hover:border-cosmic-lavender text-xs text-slate-300 hover:text-ivory-100 flex items-center gap-2 transition-all"
          title="Search ideas (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline text-[11px] text-slate-400">Search...</span>
          <kbd className="hidden md:inline text-[9px] bg-midnight-800 border border-midnight-700 px-1 py-0.5 rounded text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Physics Simulation Pause/Play Button (Only on universe canvas) */}
        {activeView === 'universe' && (
          <button
            onClick={() => setPhysicsPaused((prev) => !prev)}
            title={physicsPaused ? 'Resume float simulation' : 'Pause float simulation'}
            className="p-2 rounded-lg bg-midnight-950/60 border border-midnight-700/80 text-slate-400 hover:text-ivory-100 transition-colors"
          >
            {physicsPaused ? <Play className="w-3.5 h-3.5 text-cosmic-mint" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Reduced Motion Toggle */}
        <button
          onClick={() => setReducedMotion(!reducedMotion)}
          title={reducedMotion ? 'Enable smooth animations' : 'Reduce animation / motion'}
          className="p-2 rounded-lg bg-midnight-950/60 border border-midnight-700/80 text-slate-400 hover:text-ivory-100 transition-colors hidden sm:block"
        >
          {reducedMotion ? <EyeOff className="w-3.5 h-3.5 text-cosmic-amber" /> : <Eye className="w-3.5 h-3.5" />}
        </button>

        {/* User / Settings Profile */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 p-1.5 rounded-lg bg-midnight-950/60 border border-midnight-700/80 hover:border-midnight-600 transition-colors text-ivory-200"
        >
          <div className="w-5 h-5 rounded-full bg-cosmic-lavender/30 border border-cosmic-lavender/50 flex items-center justify-center text-[10px] font-bold text-cosmic-lavender">
            {user?.display_name ? user.display_name.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3" />}
          </div>
          <span className="text-xs hidden lg:inline max-w-[100px] truncate">
            {user?.display_name || 'Guest'}
          </span>
        </button>
      </div>
    </header>
  );
};
