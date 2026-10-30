import React from 'react';
import { Search, Pause, Play } from 'lucide-react';
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
  } = useIdeas();
  const { user } = useAuth();

  const navItems: { id: 'universe' | 'all' | 'categories' | 'connections' | 'rediscover'; label: string }[] = [
    { id: 'universe', label: 'universe' },
    { id: 'all', label: 'journal' },
    { id: 'categories', label: 'collections' },
    { id: 'connections', label: 'connections' },
    { id: 'rediscover', label: 'rediscover' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-30 bg-pearl/75 backdrop-blur-md px-6 md:px-12 flex items-center justify-between border-b border-powder/30">
      {/* Brand Logo with Cursive Lettering */}
      <div
        onClick={() => setActiveView('universe')}
        className="cursor-pointer group select-none flex items-center"
      >
        <span className="font-brand text-3xl md:text-4xl text-cocoa hover:text-rose transition-colors leading-none tracking-wide">
          Idea Bubbles
        </span>
      </div>

      {/* Editorial Navigation: Pure Text Links with Subtle Underline */}
      <nav className="flex items-center gap-5 sm:gap-8 md:gap-10">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`relative py-1 text-xs sm:text-sm font-sans tracking-wider transition-colors lowercase ${
                isActive
                  ? 'text-cocoa font-medium'
                  : 'text-cocoa-muted/70 hover:text-cocoa'
              }`}
            >
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-rose/80 rounded-full animate-in fade-in duration-200" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Understated Editorial Controls */}
      <div className="flex items-center gap-4 sm:gap-6 text-xs text-cocoa-muted font-sans tracking-wider">
        {/* Search */}
        <button
          onClick={onOpenSearch}
          className="hover:text-cocoa transition-colors flex items-center gap-1.5"
          title="Search ideas (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 stroke-[1.5]" />
          <span className="hidden sm:inline lowercase">search</span>
        </button>

        {/* Physics Simulation Toggle (Universe canvas) */}
        {activeView === 'universe' && (
          <button
            onClick={() => setPhysicsPaused(!physicsPaused)}
            title={physicsPaused ? 'Resume floating' : 'Pause floating'}
            className="hover:text-cocoa transition-colors p-1"
          >
            {physicsPaused ? (
              <Play className="w-3.5 h-3.5 stroke-[1.5]" />
            ) : (
              <Pause className="w-3.5 h-3.5 stroke-[1.5]" />
            )}
          </button>
        )}

        {/* Profile / Account */}
        <button
          onClick={onOpenAuth}
          className="hover:text-cocoa transition-colors lowercase"
        >
          {user && user.email !== 'explorer@ideabubbles.universe'
            ? user.display_name?.toLowerCase() || 'account'
            : 'account'}
        </button>
      </div>
    </header>
  );
};
