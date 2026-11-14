import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
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
import { CardsCollection } from './pages/CardsCollection';
import { PublicResultPage } from './pages/PublicResultPage';
import { VictoryCardUnlockModal } from './components/cards/VictoryCardUnlockModal';
import { CardDetailModal } from './components/cards/CardDetailModal';
import { CardShareStudioModal } from './components/cards/CardShareStudioModal';
import { CollectibleCard } from './types/cards';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    currentView, 
    user,
    newlyUnlockedCard, 
    closeVictoryCardModal,
    setActiveTab 
  } = useApp();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [inspectCard, setInspectCard] = useState<CollectibleCard | null>(null);
  const [shareCard, setShareCard] = useState<CollectibleCard | null>(null);

  // If public visitor is on marketing landing page
  if (currentView === 'landing') {
    return <Landing />;
  }

  // If visitor is on public challenge result share page
  if (currentView === 'result') {
    return <PublicResultPage />;
  }

  return (
    <AppLayout onOpenAccountModal={() => setIsAccountModalOpen(true)}>
      {activeTab === 'home' && <Home />}
      {activeTab === 'play' && <Play />}
      {activeTab === 'arena' && <CodeArena />}
      {activeTab === 'cards' && <CardsCollection />}
      {activeTab === 'learn' && <Learn />}
      {activeTab === 'community' && <Community />}
      {activeTab === 'leaderboard' && <Leaderboard />}
      {activeTab === 'profile' && <Profile />}

      {/* Modals */}
      <ShareCardModal />
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />

      {/* Victory Card Unlock Celebration Modal */}
      <VictoryCardUnlockModal
        card={newlyUnlockedCard}
        onClose={closeVictoryCardModal}
        onInspect={(c) => {
          closeVictoryCardModal();
          setInspectCard(c);
        }}
        onShare={(c) => {
          closeVictoryCardModal();
          setShareCard(c);
        }}
      />

      {/* Card Detail Modal */}
      <CardDetailModal
        card={inspectCard}
        onClose={() => setInspectCard(null)}
        onShare={(c) => {
          setInspectCard(null);
          setShareCard(c);
        }}
      />

      {/* Victory Studio Card Share Modal */}
      <CardShareStudioModal
        card={shareCard}
        user={user}
        onClose={() => setShareCard(null)}
      />
    </AppLayout>
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

