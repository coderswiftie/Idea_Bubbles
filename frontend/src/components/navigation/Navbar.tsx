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
    <header className="fixed top-0 left-0 right-0 h-16 z-30 bg-white/80 backdrop-blur-xl border-b border-stone-200/60 shadow-[0_1px_12px_rgba(0,0,0,0.03)] px-4 md:px-7 flex items-center justify-between">
      {/* Brand Logo & Editorial Handwriting */}
      <div
        onClick={() => setActiveView('universe')}
        className="flex items-center gap-3 cursor-pointer group select-none"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-iridescent-pink/40 via-iridescent-lavender/40 to-iridescent-cyan/40 p-[1.5px] shadow-sm border border-white/80 transition-transform group-hover:scale-105">
          <div className="w-full h-full rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center">
            <span className="text-base font-bold text-iridescent-lavender group-hover:rotate-12 transition-transform">
              ✦
            </span>
          </div>
        </div>
        <div>
          <h1 className="font-handwriting text-3xl font-bold text-charcoal tracking-wide leading-none group-hover:text-stone-900 transition-colors">
            Idea Bubbles
          </h1>
          <p className="font-editorial italic text-xs text-stone-400 mt-0.5 hidden sm:block">
            a gentle universe of floating thoughts
          </p>
        </div>
      </div>

      {/* Main Navigation Capsule */}
      <nav className="flex items-center gap-0.5 bg-stone-100/80 border border-stone-200/70 rounded-full p-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]">
        <button
          onClick={() => setActiveView('universe')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeView === 'universe'
              ? 'bg-white text-charcoal shadow-sm border border-stone-200/60 font-semibold'
              : 'text-stone-500 hover:text-charcoal hover:bg-white/50'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-iridescent-lavender" />
          <span className="hidden sm:inline">Universe</span>
        </button>

        <button
          onClick={() => setActiveView('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeView === 'all'
              ? 'bg-white text-charcoal shadow-sm border border-stone-200/60 font-semibold'
              : 'text-stone-500 hover:text-charcoal hover:bg-white/50'
          }`}
        >
          <List className="w-3.5 h-3.5 text-iridescent-cyan" />
          <span className="hidden sm:inline">All Ideas</span>
        </button>

        <button
          onClick={() => setActiveView('categories')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeView === 'categories'
              ? 'bg-white text-charcoal shadow-sm border border-stone-200/60 font-semibold'
              : 'text-stone-500 hover:text-charcoal hover:bg-white/50'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5 text-iridescent-gold" />
          <span className="hidden sm:inline">Categories</span>
        </button>

        <button
          onClick={() => setActiveView('connections')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeView === 'connections'
              ? 'bg-white text-charcoal shadow-sm border border-stone-200/60 font-semibold'
              : 'text-stone-500 hover:text-charcoal hover:bg-white/50'
          }`}
        >
          <GitFork className="w-3.5 h-3.5 text-iridescent-mint" />
          <span className="hidden sm:inline">Connections</span>
        </button>

        <button
          onClick={() => setActiveView('rediscover')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeView === 'rediscover'
              ? 'bg-white text-charcoal shadow-sm border border-stone-200/60 font-semibold'
              : 'text-stone-500 hover:text-charcoal hover:bg-white/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-iridescent-pink" />
          <span className="hidden sm:inline">Rediscover</span>
        </button>
      </nav>

      {/* Right Controls (Search, Physics Toggle, Motion Toggle, User Profile) */}
      <div className="flex items-center gap-2">
        {/* Search Modal Trigger */}
        <button
          onClick={onOpenSearch}
          className="px-3 py-1.5 rounded-full bg-white/80 border border-stone-200/90 hover:border-stone-300 text-xs text-stone-600 hover:text-charcoal shadow-sm flex items-center gap-2 transition-all"
          title="Search ideas (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-stone-400" />
          <span className="hidden md:inline text-[11px] text-stone-500 font-sans">Search...</span>
          <kbd className="hidden md:inline text-[9px] bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded text-stone-500 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Physics Simulation Pause/Play Button (Only on universe canvas) */}
        {activeView === 'universe' && (
          <button
            onClick={() => setPhysicsPaused((prev) => !prev)}
            title={physicsPaused ? 'Resume float simulation' : 'Pause float simulation'}
            className="p-2 rounded-full bg-white/80 border border-stone-200 text-stone-500 hover:text-charcoal shadow-sm transition-colors"
          >
            {physicsPaused ? <Play className="w-3.5 h-3.5 text-iridescent-mint fill-current" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Reduced Motion Toggle */}
        <button
          onClick={() => setReducedMotion(!reducedMotion)}
          title={reducedMotion ? 'Enable smooth animations' : 'Reduce animation / motion'}
          className="p-2 rounded-full bg-white/80 border border-stone-200 text-stone-500 hover:text-charcoal shadow-sm transition-colors hidden sm:block"
        >
          {reducedMotion ? <EyeOff className="w-3.5 h-3.5 text-iridescent-gold" /> : <Eye className="w-3.5 h-3.5" />}
        </button>

        {/* User / Settings Profile */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/80 border border-stone-200 hover:border-stone-300 shadow-sm transition-all text-charcoal"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-iridescent-lavender/30 to-iridescent-pink/30 border border-stone-200 flex items-center justify-center text-[10px] font-bold text-charcoal">
            {user?.display_name ? user.display_name.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3 text-stone-500" />}
          </div>
          <span className="text-xs font-medium hidden lg:inline max-w-[100px] truncate text-stone-700">
            {user?.display_name || 'Guest'}
          </span>
        </button>
      </div>
    </header>
  );
};
