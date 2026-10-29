import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { IdeaProvider, useIdeas } from './context/IdeaContext';
import { Navbar } from './components/navigation/Navbar';
import { UniverseView } from './components/views/UniverseView';
import { AllIdeasView } from './components/views/AllIdeasView';
import { CategoriesView } from './components/views/CategoriesView';
import { ConnectionsView } from './components/views/ConnectionsView';
import { RediscoverView } from './components/views/RediscoverView';
import { IdeaWorkspace } from './components/workspace/IdeaWorkspace';
import { SearchModal } from './components/common/SearchModal';
import { AuthModal } from './components/auth/AuthModal';

const MainLayout: React.FC = () => {
  const { activeView } = useIdeas();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="w-screen h-screen bg-ivory-50 text-charcoal font-sans flex flex-col overflow-hidden relative">
      {/* Top Navigation */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full h-full relative">
        {activeView === 'universe' && <UniverseView />}
        {activeView === 'all' && <AllIdeasView />}
        {activeView === 'categories' && <CategoriesView />}
        {activeView === 'connections' && <ConnectionsView />}
        {activeView === 'rediscover' && <RediscoverView />}
      </main>

      {/* Slide-in Idea Workspace Drawer */}
      <IdeaWorkspace />

      {/* Quick Search Dialog (Cmd+K) */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Authentication / User Profile Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <IdeaProvider>
        <MainLayout />
      </IdeaProvider>
    </AuthProvider>
  );
}

export default App;
