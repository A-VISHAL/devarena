import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { ShareCardModal } from './components/common/ShareCardModal';
import { AccountModal } from './components/common/AccountModal';

// Pages
import { Landing } from './pages/Landing';
import { Home } from './pages/Home';
import { Play } from './pages/Play';
import { CodeArena } from './pages/CodeArena';
import { Learn } from './pages/Learn';
import { Community } from './pages/Community';
import { Leaderboard } from './pages/Leaderboard';
import { Profile } from './pages/Profile';

const AppContent: React.FC = () => {
  const { activeTab, currentView } = useApp();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // If public visitor is on marketing landing page
  if (currentView === 'landing') {
    return <Landing />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-arena-bg pb-16 md:pb-8">
      {/* Top Navbar */}
      <Navbar onOpenAccountModal={() => setIsAccountModalOpen(true)} />

      {/* Main Content View */}
      <main className="flex-1">
        {activeTab === 'home' && <Home />}
        {activeTab === 'play' && <Play />}
        {activeTab === 'arena' && <CodeArena />}
        {activeTab === 'learn' && <Learn />}
        {activeTab === 'community' && <Community />}
        {activeTab === 'leaderboard' && <Leaderboard />}
        {activeTab === 'profile' && <Profile />}
      </main>

      {/* Mobile Bottom Dock */}
      <MobileNav />

      {/* Modals */}
      <ShareCardModal />
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;

