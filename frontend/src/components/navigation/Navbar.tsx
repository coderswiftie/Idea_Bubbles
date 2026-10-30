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
import { CoquetteBow, PearlSparkle } from '../common/CoquetteBow';

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
  } = useIdeas();
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-30 bg-pearl/85 backdrop-blur-xl border-b border-blush-300/60 shadow-[0_2px_16px_rgba(201,143,164,0.08)] px-4 md:px-7 flex items-center justify-between">
      {/* Brand Logo & Editorial Handwriting */}
      <div
        onClick={() => setActiveView('universe')}
        className="flex items-center gap-3 cursor-pointer group select-none"
      >
        <div className="flex items-center justify-center transition-transform group-hover:scale-105">
          <CoquetteBow size={30} className="filter drop-shadow-sm" />
        </div>
        <div>
          <h1 className="font-brand text-3xl font-bold text-cocoa tracking-wide leading-none group-hover:text-rose-dark transition-colors">
            Idea Bubbles
          </h1>
          <p className="font-editorial italic text-xs text-cocoa-muted mt-0.5 hidden sm:block">
            a gentle archive of fleeting thoughts
          </p>
        </div>
      </div>

      {/* Main Navigation Capsule */}
      <nav className="flex items-center gap-0.5 bg-ivory-100/90 border border-powder/60 rounded-full p-1 shadow-[inset_0_1px_3px_rgba(73,54,59,0.03)]">
        <button
          onClick={() => setActiveView('universe')}
          className={`px-3.5 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 ${
            activeView === 'universe'
              ? 'bg-pearl text-cocoa shadow-sm border border-powder font-semibold'
              : 'text-cocoa-muted hover:text-cocoa hover:bg-blush-100/60 font-medium'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-rose" />
          <span className="hidden sm:inline">Universe</span>
        </button>

        <button
          onClick={() => setActiveView('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 ${
            activeView === 'all'
              ? 'bg-pearl text-cocoa shadow-sm border border-powder font-semibold'
              : 'text-cocoa-muted hover:text-cocoa hover:bg-blush-100/60 font-medium'
          }`}
        >
          <List className="w-3.5 h-3.5 text-mauve" />
          <span className="hidden sm:inline">All Ideas</span>
        </button>

        <button
          onClick={() => setActiveView('categories')}
          className={`px-3.5 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 ${
            activeView === 'categories'
              ? 'bg-pearl text-cocoa shadow-sm border border-powder font-semibold'
              : 'text-cocoa-muted hover:text-cocoa hover:bg-blush-100/60 font-medium'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5 text-champagne-dark" />
          <span className="hidden sm:inline">Categories</span>
        </button>

        <button
          onClick={() => setActiveView('connections')}
          className={`px-3.5 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 ${
            activeView === 'connections'
              ? 'bg-pearl text-cocoa shadow-sm border border-powder font-semibold'
              : 'text-cocoa-muted hover:text-cocoa hover:bg-blush-100/60 font-medium'
          }`}
        >
          <GitFork className="w-3.5 h-3.5 text-rose-dark" />
          <span className="hidden sm:inline">Connections</span>
        </button>

        <button
          onClick={() => setActiveView('rediscover')}
          className={`px-3.5 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 ${
            activeView === 'rediscover'
              ? 'bg-pearl text-cocoa shadow-sm border border-powder font-semibold'
              : 'text-cocoa-muted hover:text-cocoa hover:bg-blush-100/60 font-medium'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-powder-dark" />
          <span className="hidden sm:inline">Rediscover</span>
        </button>
      </nav>

      {/* Right Controls (Search, Physics Toggle, Motion Toggle, User Profile) */}
      <div className="flex items-center gap-2">
        {/* Search Modal Trigger */}
        <button
          onClick={onOpenSearch}
          className="px-3 py-1.5 rounded-full bg-pearl/90 border border-powder/70 hover:border-rose/50 text-xs text-cocoa-soft hover:text-cocoa shadow-sm flex items-center gap-2 transition-all"
          title="Search ideas (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-cocoa-muted" />
          <span className="hidden md:inline text-[11px] text-cocoa-muted font-sans">Search ideas...</span>
          <kbd className="hidden md:inline text-[9px] bg-ivory border border-powder/60 px-1.5 py-0.5 rounded text-cocoa-muted font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Physics Simulation Pause/Play Button (Only on universe canvas) */}
        {activeView === 'universe' && (
          <button
            onClick={() => setPhysicsPaused((prev) => !prev)}
            title={physicsPaused ? 'Resume float simulation' : 'Pause float simulation'}
            className="p-2 rounded-full bg-pearl/90 border border-powder/70 hover:border-rose/50 text-cocoa-muted hover:text-cocoa shadow-sm transition-colors"
          >
            {physicsPaused ? <Play className="w-3.5 h-3.5 text-rose fill-current" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Reduced Motion Toggle */}
        <button
          onClick={() => setReducedMotion(!reducedMotion)}
          title={reducedMotion ? 'Enable smooth animations' : 'Reduce animation / motion'}
          className="p-2 rounded-full bg-pearl/90 border border-powder/70 hover:border-rose/50 text-cocoa-muted hover:text-cocoa shadow-sm transition-colors hidden sm:block"
        >
          {reducedMotion ? <EyeOff className="w-3.5 h-3.5 text-champagne-dark" /> : <Eye className="w-3.5 h-3.5" />}
        </button>

        {/* User / Settings Profile */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-pearl/90 border border-powder/70 hover:border-rose/50 shadow-sm transition-all text-cocoa"
        >
          <div className="w-6 h-6 rounded-full bg-blush-200 border border-powder flex items-center justify-center text-[10px] font-bold text-cocoa">
            {user?.display_name ? user.display_name.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3 text-cocoa-muted" />}
          </div>
          <span className="text-xs font-medium hidden lg:inline max-w-[100px] truncate text-cocoa">
            {user?.display_name || 'Guest'}
          </span>
        </button>
      </div>
    </header>
  );
};
