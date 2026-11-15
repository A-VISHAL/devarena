export type NavigationTab = 'home' | 'play' | 'arena' | 'dsa-sheets' | 'cards' | 'learn' | 'community' | 'connect' | 'leaderboard' | 'profile' | 'settings' | 'tools';

export * from './cards';
import { DiscordLinkedUser } from './discord';
export * from './discord';

export type AppView = 'landing' | 'app' | 'result';

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
  email?: string;
  headline?: string;
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
  unlockedCards?: string[]; // Collectible Card IDs
  pinnedCardIds?: string[]; // Showcase Card IDs pinned to profile
  discordUser?: DiscordLinkedUser;
  followersCount?: number;
  followingCount?: number;
  following?: string[]; // followed usernames
  savedPostIds?: string[];
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

export interface AppSettings {
  // Appearance
  theme: 'dark' | 'dim' | 'midnight';
  accentColor: 'orange' | 'cyan' | 'emerald' | 'lime';
  layoutDensity: 'comfortable' | 'compact';

  // Notifications
  battleInvites: boolean;
  friendActivity: boolean;
  dailyReminders: boolean;
  achievementAlerts: boolean;

  // Privacy
  profileVisibility: 'public' | 'friends' | 'private';
  onlineStatus: 'online' | 'invisible';
  activityVisibility: 'public' | 'concealed';

  // Gameplay
  soundEffects: boolean;
  reducedMotion: boolean;
  matchmakingPref: 'open' | 'ranked_only' | 'casual_only';

  // Editor Preferences
  defaultLanguage: 'javascript' | 'typescript' | 'python' | 'java' | 'cpp';
  fontSize: number;
  tabSize: number;
  wordWrap: 'on' | 'off';
  editorTheme: 'vs-dark' | 'hc-black';
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: 'orange',
  layoutDensity: 'comfortable',
  battleInvites: true,
  friendActivity: true,
  dailyReminders: true,
  achievementAlerts: true,
  profileVisibility: 'public',
  onlineStatus: 'online',
  activityVisibility: 'public',
  soundEffects: true,
  reducedMotion: false,
  matchmakingPref: 'open',
  defaultLanguage: 'javascript',
  fontSize: 14,
  tabSize: 2,
  wordWrap: 'on',
  editorTheme: 'vs-dark'
};

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
    java?: string;
    cpp?: string;
  };
  functionName: string;
  testCases: {
    input: any[];
    expected: any;
    isHidden?: boolean;
  }[];
  acceptanceRate?: string;
  hints?: string[];
  relatedTopics?: string[];
  companies?: string[];
  inputFormat?: string;
  outputFormat?: string;
  similarProblems?: string[];
  leetcodeNumber?: number;
}

export interface CustomTestCase {
  id: string;
  input: string; // raw input or JSON string representation
  expectedOutput?: string;
}

export type SheetId =
  | 'blind-75'
  | 'neetcode-150'
  | 'grind-75'
  | 'striver-a2z'
  | 'top-interview-150'
  | 'important-50'
  | 'arrays-strings-50'
  | 'company-wise';

export interface DsaSheetItem {
  id: string; // problem id matching CodingProblem.id
  sheetProblemNumber: number | string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  subtopic?: string;
  externalLink?: string;
  notes?: string;
  acceptanceRate?: string;
  hasPlaygroundSupport?: boolean;
}

export interface DsaSheetDef {
  id: SheetId;
  name: string;
  shortDescription: string;
  category: 'curated' | 'company' | 'topic';
  totalQuestions: number;
  topicsCovered: string[];
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  questions: DsaSheetItem[];
  badge?: string;
  authorOrSource?: string;
  estimatedHours?: string;
}

export interface CompanySheetQuestion extends DsaSheetItem {
  frequency: 'Very High' | 'High' | 'Medium';
  isCommunityContributed?: boolean;
  isVerifiedHistorical?: boolean;
  lastReportedYear?: string;
}

export interface CompanySheetDef {
  id: string; // e.g. "google", "amazon"
  name: string;
  logoText: string;
  brandColor: string;
  description: string;
  questionsCount: number;
  difficultyBreakdown: { easy: number; medium: number; hard: number };
  topTopics: string[];
  questions: CompanySheetQuestion[];
}

export type SupportedLanguage = 'python' | 'javascript' | 'typescript' | 'cpp' | 'java';

export interface BattleParticipant {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  isReady: boolean;
  status: 'idle' | 'typing' | 'running' | 'submitted';
  code: string;
  language: SupportedLanguage;
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
    headline?: string;
    avatar: string;
    rating: number;
  };
  type: 'battle_victory' | 'puzzle_streak' | 'achievement_unlocked' | 'project_share' | 'discussion';
  title: string;
  content: string;
  tags?: string[];
  projectUrl?: string;
  githubUrl?: string;
  collectibleCardId?: string; // links to CollectibleCard
  metadata?: {
    gameName?: string;
    score?: number | string;
    opponentName?: string;
    problemTitle?: string;
    badgeName?: string;
  };
  likesCount: number;
  likedBy: string[]; // user IDs
  repostsCount?: number;
  repostedBy?: string[];
  comments: {
    id: string;
    author: {
      username: string;
      displayName?: string;
      avatar: string;
      headline?: string;
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

export interface ShareCardData {
  title: string;
  gameOrBattle: string;
  scoreOrResult: string;
  subtitle?: string;
  ratingChange?: number;
  badge?: string;
  customStats?: { label: string; value: string }[];
  shareId?: string;
  gameId?: CasualGameId | 'arena';
  gameTitle?: string;
  score?: number | string;
  roundsOrMoves?: string;
  streak?: number;
  timeTakenSec?: number;
  isBattle?: boolean;
  problemTitle?: string;
  opponentName?: string;
  battleResult?: 'Win' | 'Loss' | 'Draw' | 'Victory' | 'Defeat';
  executionTime?: string;
  testCasesPassed?: string;
  timestamp?: number;
}

export interface PublicSharedResult {
  id: string;
  title: string;
  gameOrBattle: string;
  scoreOrResult: string;
  subtitle?: string;
  ratingChange?: number;
  badge?: string;
  customStats?: { label: string; value: string }[];
  gameId?: CasualGameId | 'arena';
  gameTitle?: string;
  score?: number | string;
  roundsOrMoves?: string;
  streak?: number;
  timeTakenSec?: number;
  isBattle?: boolean;
  problemTitle?: string;
  opponentName?: string;
  battleResult?: 'Win' | 'Loss' | 'Draw' | 'Victory' | 'Defeat';
  executionTime?: string;
  testCasesPassed?: string;
  createdAt: string;
  player: {
    id: string;
    username: string;
    displayName: string;
    headline?: string;
    avatar: string;
    rating: number;
    streak: number;
  };
}


