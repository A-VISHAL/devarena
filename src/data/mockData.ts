import { Achievement, CommunityPost, LeaderboardEntry, UserProfile } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_battle',
    title: 'First Blood',
    description: 'Enter the Code Arena and complete your first 1v1 live battle.',
    icon: 'Swords',
    category: 'coding'
  },
  {
    id: 'first_victory',
    title: 'Arena Champion',
    description: 'Defeat an opponent in a live coding duel with all test cases passed.',
    icon: 'Trophy',
    category: 'coding'
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Solve and submit a correct coding battle solution in under 3 minutes.',
    icon: 'Zap',
    category: 'coding'
  },
  {
    id: 'puzzle_master',
    title: 'Daily Virtuoso',
    description: 'Complete the daily word puzzle on your first or second try.',
    icon: 'Brain',
    category: 'casual'
  },
  {
    id: 'streak_5',
    title: 'On Fire',
    description: 'Achieve and maintain a 5-day consecutive active streak.',
    icon: 'Flame',
    category: 'casual'
  },
  {
    id: 'reaction_pro',
    title: 'Neural Reflexes',
    description: 'Score under 220ms in the Reaction Challenge.',
    icon: 'Activity',
    category: 'casual'
  },
  {
    id: 'math_wizard',
    title: 'Mental Calculator',
    description: 'Score 12 or more correct answers in Quick Math sprint.',
    icon: 'Calculator',
    category: 'casual'
  },
  {
    id: 'challenger',
    title: 'Social Challenger',
    description: 'Create and share a private challenge room with a friend.',
    icon: 'Share2',
    category: 'social'
  }
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: {
      id: 'usr-kavya',
      username: 'kavya_codes',
      displayName: 'Kavya Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 1845
    },
    type: 'battle_victory',
    title: 'Clutched a 1v1 battle on Container With Most Water! 🔥',
    content: 'Just had an intense duel against @alex_dev. Both of us finished with O(N) two pointers, but submitted 14 seconds earlier. The test cases caught my boundary condition initially, quick debug won it!',
    metadata: {
      gameName: '1v1 Code Battle',
      problemTitle: 'Container With Most Water',
      opponentName: 'alex_dev',
      score: '+26 Elo'
    },
    likesCount: 24,
    likedBy: [],
    comments: [
      {
        id: 'c1',
        author: {
          username: 'alex_dev',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        },
        text: 'GG! Your two-pointer shrink condition was super clean. Need a rematch tomorrow!',
        timestamp: '15m ago'
      },
      {
        id: 'c2',
        author: {
          username: 'rohit_algo',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
        },
        text: 'Two-pointer greedy height check is such a satisfying pattern when it clicks.',
        timestamp: '8m ago'
      }
    ],
    createdAt: '25m ago'
  },
  {
    id: 'post-2',
    author: {
      id: 'usr-marcus',
      username: 'marcus_q',
      displayName: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      rating: 1620
    },
    type: 'puzzle_streak',
    title: 'Day 12 streak on Word Puzzle! 🟩🟩🟩🟩🟩',
    content: 'Today’s daily puzzle had a tricky double letter! Solved it on row 4 without burning unnecessary vowels. Who else got it today?',
    metadata: {
      gameName: 'Daily Word Puzzle',
      score: '4/6 Attempts • Streak 12'
    },
    likesCount: 18,
    likedBy: [],
    comments: [
      {
        id: 'c3',
        author: {
          username: 'elena_v',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
        },
        text: 'Got it in 3! Started with STARE and got 3 yellow letters immediately.',
        timestamp: '1h ago'
      }
    ],
    createdAt: '2h ago'
  },
  {
    id: 'post-3',
    author: {
      id: 'usr-sara',
      username: 'sara_byte',
      displayName: 'Sara Al-Mansoor',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      rating: 2010
    },
    type: 'achievement_unlocked',
    title: 'Unlocked [Neural Reflexes] & [Arena Champion]! ⚡',
    content: 'Tested my reaction speed after practicing dynamic programming and clocked 188ms on the Reaction Challenge. Love how DEVARENA balances hardcore coding with brain warmups!',
    metadata: {
      badgeName: 'Neural Reflexes',
      score: '188 ms'
    },
    likesCount: 42,
    likedBy: [],
    comments: [],
    createdAt: '4h ago'
  }
];

export const CASUAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: 'u1', username: 'hyper_reflex', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', score: 9850, secondaryScore: '182ms avg', ratingBadge: 'Master' },
  { rank: 2, userId: 'u2', username: 'puzzle_queen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', score: 9420, secondaryScore: '24-day streak', ratingBadge: 'Diamond' },
  { rank: 3, userId: 'u3', username: 'quick_thinker', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', score: 8990, secondaryScore: '19 Quick Math', ratingBadge: 'Diamond' },
  { rank: 4, userId: 'u4', username: 'logic_craft', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', score: 8410, secondaryScore: '18-day streak', ratingBadge: 'Platinum' },
  { rank: 5, userId: 'u5', username: 'neuro_blast', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', score: 7920, secondaryScore: '195ms avg', ratingBadge: 'Platinum' },
  { rank: 6, userId: 'u6', username: 'pattern_guru', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80', score: 7540, secondaryScore: '15-day streak', ratingBadge: 'Gold' }
];

export const DEVELOPER_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: 'd1', username: 'algo_zenith', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', score: 2180, secondaryScore: '48 Wins (88%)', ratingBadge: 'Grandmaster' },
  { rank: 2, userId: 'd2', username: 'binary_ninja', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', score: 2045, secondaryScore: '42 Wins (82%)', ratingBadge: 'Master' },
  { rank: 3, userId: 'd3', username: 'sara_byte', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', score: 2010, secondaryScore: '39 Wins (79%)', ratingBadge: 'Master' },
  { rank: 4, userId: 'd4', username: 'kavya_codes', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', score: 1845, secondaryScore: '31 Wins (74%)', ratingBadge: 'Diamond' },
  { rank: 5, userId: 'd5', username: 'rohit_algo', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', score: 1790, secondaryScore: '28 Wins (71%)', ratingBadge: 'Diamond' },
  { rank: 6, userId: 'd6', username: 'marcus_q', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80', score: 1620, secondaryScore: '22 Wins (65%)', ratingBadge: 'Platinum' }
];

export function createDefaultGuest(): UserProfile {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const avatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80'
  ];

  return {
    id: `guest-${Date.now()}-${randomSuffix}`,
    username: `Player_${randomSuffix}`,
    displayName: `Guest #${randomSuffix}`,
    avatar: avatars[Math.floor(Math.random() * avatars.length)],
    isGuest: true,
    bio: 'Casual gamer and developer exploring DEVARENA.',
    skills: ['JavaScript', 'Problem Solving', 'Data Structures'],
    languages: ['JavaScript', 'TypeScript', 'Python'],
    rating: 1200,
    casualRating: 1000,
    streak: 3,
    lastActiveDate: new Date().toISOString(),
    battlesTotal: 4,
    battlesWon: 3,
    battlesLost: 1,
    problemsSolved: ['two-sum', 'valid-parentheses'],
    achievements: ['first_battle', 'reaction_pro'],
    unlockedCards: ['speed_thinker', 'daily_challenger', 'first_blood', 'perfect_submission'],
    pinnedCardIds: ['first_blood', 'perfect_submission'],
    topicProgress: {
      'arrays': 65,
      'stacks-queues': 50,
      'two-pointers': 40,
      'sliding-window': 20
    },
    recentBattles: [
      {
        id: 'bat-rec-1',
        opponentName: 'alex_dev',
        opponentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        opponentRating: 1220,
        problemTitle: 'Two Sum',
        result: 'won',
        ratingChange: 24,
        timeSpentSec: 142,
        testsPassed: '5/5',
        timestamp: 'Yesterday'
      },
      {
        id: 'bat-rec-2',
        opponentName: 'sara_byte',
        opponentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
        opponentRating: 1280,
        problemTitle: 'Valid Parentheses',
        result: 'won',
        ratingChange: 28,
        timeSpentSec: 180,
        testsPassed: '6/6',
        timestamp: '2 days ago'
      }
    ],
    recentlyPlayedGames: ['zip', 'word-puzzle', 'quick-math'],
    savedGames: ['zip', 'logic-sprint'],
    personalBests: {
      'zip': { bestScore: 650, bestTimeSec: 84, challengeNumber: 42, date: 'Today' },
      'word-puzzle': { bestScore: 500, bestTimeSec: 125, challengeNumber: 184, date: 'Yesterday' },
      'reaction-challenge': { bestScore: 198, bestTimeSec: 0, date: '2 days ago' },
      'quick-math': { bestScore: 14, bestTimeSec: 60, date: '3 days ago' },
      'memory-grid': { bestScore: 480, bestTimeSec: 90, date: '4 days ago' }
    },
    gameHistory: [
      {
        id: 'gh-1',
        gameId: 'zip',
        gameTitle: 'Zip #42',
        challengeNumber: 42,
        score: 650,
        timeTakenSec: 84,
        moves: 18,
        won: true,
        timestamp: 'Today, 2:15 PM'
      },
      {
        id: 'gh-2',
        gameId: 'word-puzzle',
        gameTitle: 'Word Puzzle #184',
        challengeNumber: 184,
        score: 500,
        timeTakenSec: 125,
        moves: 4,
        won: true,
        timestamp: 'Yesterday'
      },
      {
        id: 'gh-3',
        gameId: 'quick-math',
        gameTitle: 'Quick Math Sprint',
        score: 14,
        timeTakenSec: 60,
        accuracy: 93,
        won: true,
        timestamp: '3 days ago'
      }
    ],
    challenges: [
      {
        id: 'ch-1',
        fromUser: 'kavya_codes',
        fromAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        gameId: 'multiplayer-math',
        gameTitle: 'Quick Math 1v1 Clash',
        timestamp: '20m ago',
        scoreToBeat: '18 pts'
      },
      {
        id: 'ch-2',
        fromUser: 'marcus_q',
        fromAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
        gameId: 'zip',
        gameTitle: 'Zip #42',
        timestamp: '1h ago',
        scoreToBeat: '72s Solve'
      }
    ],
    createdAt: new Date().toISOString()
  };
}

