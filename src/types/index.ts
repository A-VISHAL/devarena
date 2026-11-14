export type NavigationTab = 'home' | 'play' | 'arena' | 'learn' | 'community' | 'leaderboard' | 'profile';

export type AppView = 'landing' | 'app';

export type GameCategory = 'daily' | 'brain' | 'logic' | 'multiplayer';

export type CasualGameId = 
  | 'zip'
  | 'word-puzzle' 
  | 'odd-one-out' 
  | 'pattern-master' 
  | 'memory-grid' 
  | 'reaction-challenge' 
  | 'quick-math' 
  | 'logic-sprint'
  | 'multiplayer-math'
  | 'multiplayer-reaction';

export interface GameHistoryEntry {
  id: string;
  gameId: CasualGameId;
  gameTitle: string;
  challengeNumber?: number;
  score: number;
  timeTakenSec?: number;
  moves?: number;
  accuracy?: number;
  won: boolean;
  timestamp: string;
}

export interface PersonalBestRecord {
  bestScore: number;
  bestTimeSec?: number;
  challengeNumber?: number;
  date: string;
}

export interface GameResultData {
  gameId: CasualGameId;
  gameTitle: string;
  challengeNumber?: number;
  score: number;
  timeTakenSec: number;
  moves?: number;
  accuracy?: number;
  won: boolean;
  isNewPersonalBest?: boolean;
  streak: number;
  headline: string;
  customStats: { label: string; value: string }[];
  shareSummary?: string;
}

export interface FriendChallenge {
  id: string;
  fromUser: string;
  fromAvatar: string;
  gameId: CasualGameId;
  gameTitle: string;
  timestamp: string;
  scoreToBeat?: string | number;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isGuest: boolean;
  bio: string;
  githubUrl?: string;
  socialUrl?: string;
  skills: string[];
  languages: string[];
  rating: number; // Elo for coding battles
  casualRating: number;
  streak: number;
  lastActiveDate: string;
  battlesTotal: number;
  battlesWon: number;
  battlesLost: number;
  problemsSolved: string[]; // Problem IDs
  achievements: string[]; // Achievement IDs
  topicProgress: Record<string, number>; // topicId -> percent (0-100)
  recentBattles: BattleRecord[];
  gameHistory?: GameHistoryEntry[];
  personalBests?: Record<string, PersonalBestRecord>;
  savedGames?: CasualGameId[];
  challenges?: FriendChallenge[];
  recentlyPlayedGames?: CasualGameId[];
  createdAt: string;
}

export interface BattleRecord {
  id: string;
  opponentName: string;
  opponentAvatar: string;
  opponentRating: number;
  problemTitle: string;
  result: 'won' | 'lost' | 'draw';
  ratingChange: number;
  timeSpentSec: number;
  testsPassed: string; // e.g. "5/5"
  timestamp: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: {
    javascript: string;
    typescript: string;
    python: string;
  };
  functionName: string;
  testCases: {
    input: any[];
    expected: any;
    isHidden?: boolean;
  }[];
}

export interface BattleParticipant {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  isReady: boolean;
  status: 'idle' | 'typing' | 'running' | 'submitted';
  code: string;
  language: 'javascript' | 'typescript' | 'python';
  submissionTime?: number; // timestamp ms
  testsPassed: number;
  totalTests: number;
  hasPassedAll: boolean;
}

export interface BattleRoom {
  id: string;
  code: string;
  problem: CodingProblem;
  timeLimitSec: number;
  status: 'waiting' | 'countdown' | 'in_progress' | 'completed';
  startedAt?: number;
  player1: BattleParticipant;
  player2?: BattleParticipant;
  winnerId?: string | 'draw';
  winnerReason?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'casual' | 'coding' | 'social';
  unlockedAt?: string;
}

export interface CommunityPost {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    rating: number;
  };
  type: 'battle_victory' | 'puzzle_streak' | 'achievement_unlocked' | 'project_share' | 'discussion';
  title: string;
  content: string;
  metadata?: {
    gameName?: string;
    score?: number | string;
    opponentName?: string;
    problemTitle?: string;
    badgeName?: string;
  };
  likesCount: number;
  likedBy: string[]; // user IDs
  comments: {
    id: string;
    author: {
      username: string;
      avatar: string;
    };
    text: string;
    timestamp: string;
  }[];
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  score: number;
  secondaryScore?: string;
  ratingBadge?: string;
  isCurrentUser?: boolean;
}

export interface DSATopic {
  id: string;
  title: string;
  icon: string;
  description: string;
  conceptNotes: string[];
  timeComplexity: string;
  spaceComplexity: string;
  commonPatterns: string[];
  problemIds: string[];
}

