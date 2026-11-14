import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  NavigationTab, 
  AppView,
  CasualGameId, 
  CommunityPost, 
  BattleRecord,
  GameResultData,
  GameHistoryEntry
} from '../types';
import { CollectibleCard } from '../types/cards';
import { BASE_COLLECTIBLE_CARDS } from '../data/collectibleCards';
import { createDefaultGuest, INITIAL_COMMUNITY_POSTS, ACHIEVEMENTS } from '../data/mockData';
import { sound } from '../utils/sound';

interface ShareCardData {
  title: string;
  gameOrBattle: string;
  scoreOrResult: string;
  subtitle?: string;
  ratingChange?: number;
  badge?: string;
  customStats?: { label: string; value: string }[];
}

interface AppContextType {
  user: UserProfile;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  navigateToApp: (tab?: NavigationTab, gameId?: CasualGameId) => void;
  navigateToLanding: () => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  activeGame: CasualGameId | null;
  setActiveGame: (game: CasualGameId | null) => void;
  activeBattleId: string | null;
  setActiveBattleId: (id: string | null) => void;
  activeMultiplayerCode: string | null;
  setActiveMultiplayerCode: (code: string | null) => void;
  posts: CommunityPost[];
  addPost: (post: Omit<CommunityPost, 'id' | 'likesCount' | 'likedBy' | 'comments' | 'createdAt'>) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  upgradeGuestToAccount: (username: string, displayName: string) => void;
  updateUserProfile: (partial: Partial<UserProfile>) => void;
  recordCasualGameResult: (gameId: CasualGameId, score: number, meta?: any) => void;
  recordCasualGameCompletion: (result: GameResultData) => void;
  gameResultData: GameResultData | null;
  setGameResultData: (data: GameResultData | null) => void;
  toggleSaveGame: (gameId: CasualGameId) => void;
  recordCodingBattleResult: (
    result: 'won' | 'lost' | 'draw',
    opponentName: string,
    opponentRating: number,
    problemTitle: string,
    testsPassed: string,
    timeSpentSec: number
  ) => { newRating: number; ratingDelta: number };
  recordProblemSolved: (problemId: string, topicId?: string) => void;
  isSoundMuted: boolean;
  toggleSound: () => void;
  shareCardData: ShareCardData | null;
  openShareModal: (data: ShareCardData) => void;
  closeShareModal: () => void;
  completedDailyChallenge: boolean;
  newlyUnlockedCard: CollectibleCard | null;
  closeVictoryCardModal: () => void;
  unlockCard: (cardId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. User state
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('devarena_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading saved user', e);
    }
    return createDefaultGuest();
  });

  // 1.5 View state (landing vs app dashboard)
  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const pathname = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      if (
        pathname.startsWith('/app') || 
        urlParams.get('view') === 'app' ||
        urlParams.has('battle') ||
        urlParams.has('room') ||
        urlParams.has('game') ||
        urlParams.has('tab')
      ) {
        return 'app';
      }
    } catch (e) {
      // ignore
    }
    return 'landing';
  });

  const navigateToApp = (tab?: NavigationTab, gameId?: CasualGameId) => {
    setCurrentView('app');
    if (tab) {
      setActiveTabState(tab);
    }
    if (gameId) {
      setActiveGame(gameId);
    }
    try {
      const targetUrl = tab ? `/app/${tab}` : '/app';
      window.history.pushState({ view: 'app', tab }, '', targetUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      // ignore
    }
  };

  const navigateToLanding = () => {
    setCurrentView('landing');
    try {
      window.history.pushState({ view: 'landing' }, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      // ignore
    }
  };

  // 2. Navigation & active state
  const [activeTab, setActiveTabState] = useState<NavigationTab>('home');
  const [activeGame, setActiveGame] = useState<CasualGameId | null>(null);
  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);
  const [activeMultiplayerCode, setActiveMultiplayerCode] = useState<string | null>(null);
  const [completedDailyChallenge, setCompletedDailyChallenge] = useState<boolean>(() => {
    return localStorage.getItem(`devarena_daily_${new Date().toDateString()}`) === 'true';
  });

  // 3. Sound
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(sound.getMuted());

  // 4. Community posts
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    try {
      const saved = localStorage.getItem('devarena_community_posts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_COMMUNITY_POSTS;
  });

  // 5. Share modal & game result modal
  const [shareCardData, setShareCardData] = useState<ShareCardData | null>(null);
  const [gameResultData, setGameResultData] = useState<GameResultData | null>(null);
  const [newlyUnlockedCard, setNewlyUnlockedCard] = useState<CollectibleCard | null>(null);

  const closeVictoryCardModal = () => {
    setNewlyUnlockedCard(null);
  };

  const unlockCard = (cardId: string) => {
    const cardDef = BASE_COLLECTIBLE_CARDS.find(c => c.id === cardId);
    if (!cardDef) return;

    setUser(prev => {
      const currentCards = prev.unlockedCards || ['speed_thinker', 'daily_challenger', 'first_blood', 'perfect_submission'];
      if (currentCards.includes(cardId)) return prev;

      setNewlyUnlockedCard({ ...cardDef, unlocked: true, unlockedAt: 'Just now' });
      return {
        ...prev,
        unlockedCards: [...currentCards, cardId]
      };
    });
  };

  // Check URL params for direct room links and path routes
  useEffect(() => {
    try {
      const pathname = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      const battleParam = urlParams.get('battle');
      const roomParam = urlParams.get('room');
      const tabParam = urlParams.get('tab') as NavigationTab;
      const gameParam = urlParams.get('game') as CasualGameId;

      if (pathname.startsWith('/app')) {
        setCurrentView('app');
        const parts = pathname.split('/').filter(Boolean);
        if (parts[1] && ['home', 'play', 'arena', 'cards', 'learn', 'community', 'leaderboard', 'profile'].includes(parts[1])) {
          setActiveTabState(parts[1] as NavigationTab);
        }
      }

      if (battleParam) {
        setCurrentView('app');
        setActiveBattleId(battleParam);
        setActiveTabState('arena');
      } else if (roomParam) {
        setCurrentView('app');
        setActiveMultiplayerCode(roomParam);
        setActiveGame('multiplayer-math');
        setActiveTabState('play');
      } else if (gameParam) {
        setCurrentView('app');
        setActiveGame(gameParam);
        setActiveTabState('play');
      } else if (tabParam) {
        setCurrentView('app');
        setActiveTabState(tabParam);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Handle browser back and forward navigation
  useEffect(() => {
    const handlePopState = () => {
      try {
        const pathname = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        if (
          pathname.startsWith('/app') || 
          urlParams.get('view') === 'app' ||
          urlParams.has('battle') ||
          urlParams.has('room') ||
          urlParams.has('game') ||
          urlParams.has('tab')
        ) {
          setCurrentView('app');
          const parts = pathname.split('/').filter(Boolean);
          if (parts[1] && ['home', 'play', 'arena', 'cards', 'learn', 'community', 'leaderboard', 'profile'].includes(parts[1])) {
            setActiveTabState(parts[1] as NavigationTab);
          }
        } else {
          setCurrentView('landing');
        }
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Persist user changes
  useEffect(() => {
    try {
      localStorage.setItem('devarena_user_profile', JSON.stringify(user));
    } catch (e) {
      console.warn('Could not save user profile', e);
    }
  }, [user]);

  // Persist posts
  useEffect(() => {
    try {
      localStorage.setItem('devarena_community_posts', JSON.stringify(posts));
    } catch (e) {
      // ignore
    }
  }, [posts]);

  const setActiveTab = (tab: NavigationTab) => {
    sound.playClick();
    setActiveTabState(tab);
    // If switching tabs away from game/battle, reset if appropriate
    if (tab !== 'play') setActiveGame(null);
    if (tab !== 'arena') setActiveBattleId(null);
    try {
      window.history.pushState({ view: 'app', tab }, '', `/app/${tab}`);
    } catch (e) {
      // ignore
    }
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsSoundMuted(muted);
  };

  const openShareModal = (data: ShareCardData) => {
    sound.playClick();
    setShareCardData(data);
  };

  const closeShareModal = () => {
    setShareCardData(null);
  };

  const upgradeGuestToAccount = (username: string, displayName: string) => {
    sound.playVictory();
    setUser(prev => ({
      ...prev,
      username: username.trim().toLowerCase().replace(/\s+/g, '_'),
      displayName: displayName.trim(),
      isGuest: false,
      achievements: Array.from(new Set([...prev.achievements, 'challenger']))
    }));
  };

  const updateUserProfile = (partial: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...partial }));
  };

  const toggleSaveGame = (gameId: CasualGameId) => {
    sound.playClick();
    setUser(prev => {
      const saved = prev.savedGames || [];
      const isSaved = saved.includes(gameId);
      const newSaved = isSaved ? saved.filter(g => g !== gameId) : [...saved, gameId];
      return { ...prev, savedGames: newSaved };
    });
  };

  const recordCasualGameCompletion = (result: GameResultData) => {
    setGameResultData(result);
    setUser(prev => {
      const recent = prev.recentlyPlayedGames || [];
      const updatedRecent = [result.gameId, ...recent.filter(g => g !== result.gameId)].slice(0, 8);
      
      const pBests = { ...(prev.personalBests || {}) };
      const currentBest = pBests[result.gameId];
      const isNewBest = !currentBest || result.score > currentBest.bestScore;

      if (isNewBest) {
        pBests[result.gameId] = {
          bestScore: Math.max(result.score, currentBest?.bestScore || 0),
          bestTimeSec: result.timeTakenSec > 0 ? (currentBest?.bestTimeSec ? Math.min(result.timeTakenSec, currentBest.bestTimeSec) : result.timeTakenSec) : currentBest?.bestTimeSec,
          challengeNumber: result.challengeNumber,
          date: 'Today'
        };
      }

      const historyEntry: GameHistoryEntry = {
        id: `gh-${Date.now()}`,
        gameId: result.gameId,
        gameTitle: result.gameTitle,
        challengeNumber: result.challengeNumber,
        score: result.score,
        timeTakenSec: result.timeTakenSec,
        moves: result.moves,
        accuracy: result.accuracy,
        won: result.won,
        timestamp: 'Just now'
      };

      const history = [historyEntry, ...(prev.gameHistory || [])].slice(0, 20);

      const newAchievements = [...prev.achievements];
      const newUnlockedCards = [...(prev.unlockedCards || ['speed_thinker', 'daily_challenger', 'first_blood', 'perfect_submission'])];
      let newlyFoundCardId: string | null = null;
      let newCasualRating = prev.casualRating + Math.max(5, Math.floor(result.score / 50));

      if (result.gameId === 'zip' && result.won) {
        if (!newAchievements.includes('puzzle_master')) newAchievements.push('puzzle_master');
        if (!newUnlockedCards.includes('logic_architect')) {
          newUnlockedCards.push('logic_architect');
          newlyFoundCardId = 'logic_architect';
        }
      }
      if (result.gameId === 'word-puzzle' && result.won) {
        if (!newAchievements.includes('puzzle_master')) newAchievements.push('puzzle_master');
        if (!newUnlockedCards.includes('daily_challenger')) {
          newUnlockedCards.push('daily_challenger');
          newlyFoundCardId = 'daily_challenger';
        }
        setCompletedDailyChallenge(true);
        localStorage.setItem(`devarena_daily_${new Date().toDateString()}`, 'true');
      }
      if (result.gameId === 'reaction-challenge' && result.score < 200) {
        if (!newAchievements.includes('reaction_pro')) newAchievements.push('reaction_pro');
        if (!newUnlockedCards.includes('speed_thinker')) {
          newUnlockedCards.push('speed_thinker');
          newlyFoundCardId = 'speed_thinker';
        }
      }
      if (result.gameId === 'quick-math' && result.score >= 14) {
        if (!newAchievements.includes('math_wizard')) newAchievements.push('math_wizard');
        if (!newUnlockedCards.includes('mental_calculator')) {
          newUnlockedCards.push('mental_calculator');
          newlyFoundCardId = 'mental_calculator';
        }
      }
      if (result.gameId === 'memory-grid' && result.score >= 450) {
        if (!newUnlockedCards.includes('mind_master')) {
          newUnlockedCards.push('mind_master');
          newlyFoundCardId = 'mind_master';
        }
      }
      if (prev.streak + 1 >= 5) {
        if (!newUnlockedCards.includes('puzzle_streak')) {
          newUnlockedCards.push('puzzle_streak');
          newlyFoundCardId = 'puzzle_streak';
        }
      }

      if (newlyFoundCardId) {
        const found = BASE_COLLECTIBLE_CARDS.find(c => c.id === newlyFoundCardId);
        if (found) {
          setNewlyUnlockedCard({ ...found, unlocked: true, unlockedAt: 'Just now' });
        }
      }

      return {
        ...prev,
        casualRating: newCasualRating,
        achievements: newAchievements,
        unlockedCards: newUnlockedCards,
        recentlyPlayedGames: updatedRecent,
        personalBests: pBests,
        gameHistory: history
      };
    });
  };

  const recordCasualGameResult = (gameId: CasualGameId, score: number, meta?: any) => {
    setUser(prev => {
      const recent = prev.recentlyPlayedGames || [];
      const updatedRecent = [gameId, ...recent.filter(g => g !== gameId)].slice(0, 8);
      const newAchievements = [...prev.achievements];
      let newCasualRating = prev.casualRating + Math.max(5, Math.floor(score / 50));

      if (gameId === 'reaction-challenge' && score < 220) {
        if (!newAchievements.includes('reaction_pro')) newAchievements.push('reaction_pro');
      }
      if (gameId === 'word-puzzle' && meta?.won) {
        if (!newAchievements.includes('puzzle_master')) newAchievements.push('puzzle_master');
        setCompletedDailyChallenge(true);
        localStorage.setItem(`devarena_daily_${new Date().toDateString()}`, 'true');
      }
      if (gameId === 'quick-math' && score >= 12) {
        if (!newAchievements.includes('math_wizard')) newAchievements.push('math_wizard');
      }

      return {
        ...prev,
        casualRating: newCasualRating,
        achievements: newAchievements,
        recentlyPlayedGames: updatedRecent
      };
    });
  };

  const recordCodingBattleResult = (
    result: 'won' | 'lost' | 'draw',
    opponentName: string,
    opponentRating: number,
    problemTitle: string,
    testsPassed: string,
    timeSpentSec: number
  ) => {
    let ratingDelta = 0;
    if (result === 'won') {
      ratingDelta = Math.max(16, Math.min(36, 25 + Math.round((opponentRating - user.rating) * 0.1)));
    } else if (result === 'lost') {
      ratingDelta = -Math.max(10, Math.min(28, 16 - Math.round((opponentRating - user.rating) * 0.05)));
    } else {
      ratingDelta = 4;
    }

    const newRating = Math.max(800, user.rating + ratingDelta);

    const record: BattleRecord = {
      id: `battle-${Date.now()}`,
      opponentName,
      opponentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      opponentRating,
      problemTitle,
      result,
      ratingChange: ratingDelta,
      timeSpentSec,
      testsPassed,
      timestamp: 'Just now'
    };

    setUser(prev => {
      const newAchievements = [...prev.achievements];
      const newUnlockedCards = [...(prev.unlockedCards || ['speed_thinker', 'daily_challenger', 'first_blood', 'perfect_submission'])];
      let newlyFoundCardId: string | null = null;

      if (!newAchievements.includes('first_battle')) newAchievements.push('first_battle');
      if (result === 'won') {
        if (!newAchievements.includes('first_victory')) newAchievements.push('first_victory');
        if (!newUnlockedCards.includes('first_blood')) {
          newUnlockedCards.push('first_blood');
          newlyFoundCardId = 'first_blood';
        }
        if (testsPassed.includes('5/5') || testsPassed.includes('6/6')) {
          if (!newUnlockedCards.includes('perfect_submission')) {
            newUnlockedCards.push('perfect_submission');
            newlyFoundCardId = 'perfect_submission';
          }
        }
        if ((prev.battlesWon + 1) >= 3 && prev.battlesLost === 0) {
          if (!newUnlockedCards.includes('unstoppable')) {
            newUnlockedCards.push('unstoppable');
            newlyFoundCardId = 'unstoppable';
          }
        }
        if (newRating >= 1250) {
          if (!newUnlockedCards.includes('arena_champion')) {
            newUnlockedCards.push('arena_champion');
            newlyFoundCardId = 'arena_champion';
          }
        }
      }
      if (result === 'won' && timeSpentSec < 180 && !newAchievements.includes('speed_demon')) newAchievements.push('speed_demon');

      if (newlyFoundCardId) {
        const found = BASE_COLLECTIBLE_CARDS.find(c => c.id === newlyFoundCardId);
        if (found) {
          setNewlyUnlockedCard({ ...found, unlocked: true, unlockedAt: 'Just now' });
        }
      }

      return {
        ...prev,
        rating: newRating,
        battlesTotal: prev.battlesTotal + 1,
        battlesWon: result === 'won' ? prev.battlesWon + 1 : prev.battlesWon,
        battlesLost: result === 'lost' ? prev.battlesLost + 1 : prev.battlesLost,
        achievements: newAchievements,
        unlockedCards: newUnlockedCards,
        recentBattles: [record, ...prev.recentBattles.slice(0, 9)]
      };
    });

    return { newRating, ratingDelta };
  };

  const recordProblemSolved = (problemId: string, topicId?: string) => {
    setUser(prev => {
      const alreadySolved = prev.problemsSolved.includes(problemId);
      const newSolved = alreadySolved ? prev.problemsSolved : [...prev.problemsSolved, problemId];
      
      const newTopicProgress = { ...prev.topicProgress };
      if (topicId) {
        newTopicProgress[topicId] = Math.min(100, (newTopicProgress[topicId] || 0) + 35);
      }

      return {
        ...prev,
        problemsSolved: newSolved,
        topicProgress: newTopicProgress
      };
    });
  };

  const addPost = (newPostData: Omit<CommunityPost, 'id' | 'likesCount' | 'likedBy' | 'comments' | 'createdAt'>) => {
    const newPost: CommunityPost = {
      ...newPostData,
      id: `post-${Date.now()}`,
      likesCount: 0,
      likedBy: [],
      comments: [],
      createdAt: 'Just now'
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const likePost = (postId: string) => {
    sound.playClick();
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const alreadyLiked = p.likedBy.includes(user.id);
      return {
        ...p,
        likesCount: alreadyLiked ? p.likesCount - 1 : p.likesCount + 1,
        likedBy: alreadyLiked ? p.likedBy.filter(id => id !== user.id) : [...p.likedBy, user.id]
      };
    }));
  };

  const addComment = (postId: string, text: string) => {
    if (!text.trim()) return;
    sound.playClick();
    const newComment = {
      id: `c-${Date.now()}`,
      author: {
        username: user.username,
        avatar: user.avatar
      },
      text: text.trim(),
      timestamp: 'Just now'
    };

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: [...p.comments, newComment]
      };
    }));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        currentView,
        setCurrentView,
        navigateToApp,
        navigateToLanding,
        activeTab,
        setActiveTab,
        activeGame,
        setActiveGame,
        activeBattleId,
        setActiveBattleId,
        activeMultiplayerCode,
        setActiveMultiplayerCode,
        posts,
        addPost,
        likePost,
        addComment,
        upgradeGuestToAccount,
        updateUserProfile,
        recordCasualGameResult,
        recordCasualGameCompletion,
        gameResultData,
        setGameResultData,
        toggleSaveGame,
        recordCodingBattleResult,
        recordProblemSolved,
        isSoundMuted,
        toggleSound,
        shareCardData,
        openShareModal,
        closeShareModal,
        completedDailyChallenge,
        newlyUnlockedCard,
        closeVictoryCardModal,
        unlockCard
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

