// DEVARENA CONNECT – Telegram Defaults, Bot Commands & Challenge Formatter
import { 
  TelegramChatSettings, 
  TelegramCommandInfo,
  TelegramChallengeRecord,
  TelegramChatIntegration
} from '../types/telegram';
import { CODING_PROBLEMS } from './problems';
import { CodingProblem } from '../types';

export const TELEGRAM_BOT_NAME = 'DEVARENA';
export const TELEGRAM_BOT_USERNAME = 'DEVARENA_CommunityBot';
export const TELEGRAM_BOT_LINK = 'https://t.me/DEVARENA_CommunityBot';
export const TELEGRAM_INSTALL_LINK = 'https://t.me/DEVARENA_CommunityBot?startgroup=true';

export const TELEGRAM_DEFAULT_SETTINGS: TelegramChatSettings = {
  enabled: true,
  timezone: 'Asia/Kolkata',
  morningEnabled: true,
  morningTime: '09:00',
  eveningEnabled: true,
  eveningTime: '18:00',
  difficulty: 'Mixed',
  topics: [
    'Arrays',
    'Strings',
    'Hashing',
    'Binary Search',
    'Linked Lists',
    'Trees',
    'Graphs',
    'Dynamic Programming',
    'Greedy',
    'Stack and Queue',
    'Backtracking'
  ]
};

export const TELEGRAM_COMMANDS: TelegramCommandInfo[] = [
  {
    name: 'start',
    syntax: '/start [code]',
    description: 'Welcome message, bot introduction and account linking entry point.',
    example: '/start or /start link_DEV-4921'
  },
  {
    name: 'help',
    syntax: '/help',
    description: 'Displays the complete command reference and guide for DEVARENA.',
    example: '/help'
  },
  {
    name: 'daily',
    syntax: '/daily',
    description: "Fetches today's morning (09:00) and evening (18:00) DSA challenges.",
    example: '/daily'
  },
  {
    name: 'challenge',
    syntax: '/challenge [topic] [difficulty]',
    description: 'Instantly dispatches an algorithm problem to solve with inline battle buttons.',
    example: '/challenge or /challenge Arrays Easy'
  },
  {
    name: 'leaderboard',
    syntax: '/leaderboard',
    description: 'Displays global top coders, Elo ratings, and win records on DEVARENA.',
    example: '/leaderboard'
  },
  {
    name: 'profile',
    syntax: '/profile',
    description: 'Inspects your linked DEVARENA developer profile, rating, and rank tier.',
    example: '/profile'
  },
  {
    name: 'streak',
    syntax: '/streak',
    description: 'Displays your consecutive daily problem-solving streak and activity count.',
    example: '/streak'
  },
  {
    name: 'link',
    syntax: '/link <code>',
    description: 'Securely pairs your Telegram user ID with your DEVARENA account.',
    example: '/link DEV-7429'
  },
  {
    name: 'stats',
    syntax: '/stats',
    description: 'Detailed coding metrics: 1v1 battle win rates, Elo rating, and DSA topic mastery.',
    example: '/stats'
  },
  {
    name: 'settings',
    syntax: '/settings',
    description: 'Shows and updates daily challenge schedule and topics (Group Admins only).',
    example: '/settings',
    adminOnly: true
  }
];

// Helper to choose a problem matching group settings and excluding recently sent
export const selectProblemForTelegramGroup = (
  settings: TelegramChatSettings,
  recentProblemIds: string[] = []
): CodingProblem => {
  let candidates = CODING_PROBLEMS;

  // Filter by difficulty if not mixed
  if (settings.difficulty !== 'Mixed') {
    candidates = candidates.filter(
      p => p.difficulty.toLowerCase() === settings.difficulty.toLowerCase()
    );
  }

  // Filter by topics if specified
  if (settings.topics && settings.topics.length > 0) {
    const topicKeywords = settings.topics.map(t => t.toLowerCase());
    const topicFiltered = candidates.filter(p => {
      const cat = p.category.toLowerCase();
      const relTopics = (p.relatedTopics || []).map(r => r.toLowerCase());
      return topicKeywords.some(kw => cat.includes(kw) || relTopics.some(rt => rt.includes(kw)));
    });
    if (topicFiltered.length > 0) {
      candidates = topicFiltered;
    }
  }

  // Exclude recently delivered problems
  const freshCandidates = candidates.filter(p => !recentProblemIds.includes(p.id));
  const pool = freshCandidates.length > 0 ? freshCandidates : candidates;

  return pool[Math.floor(Math.random() * pool.length)];
};

// Formats rich Telegram HTML message strictly according to Telegram Bot API
export const formatTelegramChallengePayload = (
  problem: CodingProblem,
  slot: 'morning' | 'evening' | 'manual_test',
  challengeNumber: number = 142,
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : 'https://devarena-ten.vercel.app'
) => {
  const isMorning = slot === 'morning';
  const headerIcon = slot === 'manual_test'
    ? '🔔'
    : isMorning
    ? '☀️'
    : '🌙';

  const greeting = slot === 'manual_test'
    ? '<b>DEVARENA TEST VERIFICATION CHALLENGE</b>'
    : isMorning
    ? '<b>☀️ GOOD MORNING, DEVELOPERS!</b>'
    : '<b>🌙 GOOD EVENING, DEVELOPERS!</b>';

  const diffEmoji = problem.difficulty === 'Easy' 
    ? '🟢' 
    : problem.difficulty === 'Medium' 
    ? '🟡' 
    : '🔴';

  const solveUrl = `${baseUrl}/app/arena?problem=${problem.id}`;
  const leaderboardUrl = `${baseUrl}/app/leaderboard`;

  const exampleSnippet = problem.examples && problem.examples[0]
    ? `<b>Example Test Case:</b>\n<code>Input: ${escapeHtml(problem.examples[0].input)}</code>\n<code>Output: ${escapeHtml(problem.examples[0].output)}</code>`
    : '';

  const cleanDescription = escapeHtml(
    problem.description.length > 320
      ? problem.description.slice(0, 320) + '...'
      : problem.description
  );

  const text = `${headerIcon} ${greeting}

⚔️ <b>DEVARENA DAILY CHALLENGE #${challengeNumber}</b>
━━━━━━━━━━━━━━━━━━━━
📌 <b>${escapeHtml(problem.title)}</b>

${diffEmoji} <b>Difficulty:</b> ${problem.difficulty}
📁 <b>Topic:</b> ${escapeHtml(problem.category)}
⚡ <b>Target Complexity:</b> O(N) or optimal

${cleanDescription}

${exampleSnippet}

👉 <a href="${solveUrl}"><b>Click here to solve on Code Arena</b></a>
━━━━━━━━━━━━━━━━━━━━
<i>DEVARENA • Challenge yourself. Beat your friends. Prove your skills.</i>`;

  return {
    text,
    parse_mode: 'HTML' as const,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '⚡ Solve Challenge',
            url: solveUrl
          },
          {
            text: '🏆 View Leaderboard',
            url: leaderboardUrl
          }
        ]
      ]
    }
  };
};

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const MOCK_TELEGRAM_GROUPS: TelegramChatIntegration[] = [
  {
    id: 'tg_demo_preview',
    userId: 'guest',
    chatId: '-1001928374829',
    chatTitle: 'DEVARENA Community (Demo Preview)',
    chatType: 'supergroup',
    memberCount: 315,
    status: 'connected',
    botPermissions: {
      canSendMessages: true,
      isAdmin: true,
      canInviteUsers: true
    },
    settings: { ...TELEGRAM_DEFAULT_SETTINGS },
    lastChallengeSent: {
      id: 'tg_ch_mock_prev_1',
      chatId: '-1001928374829',
      chatTitle: 'DEVARENA Community (Demo Preview)',
      challengeNumber: 142,
      problemId: 'two-sum',
      problemTitle: 'Two Sum',
      difficulty: 'Easy',
      category: 'Arrays & Hashing',
      slot: 'morning',
      scheduledAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      deliveredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'sent',
      telegramMessageId: 'tg_msg_demo_001'
    },
    connectedAt: new Date().toISOString(),
    addedByUsername: 'DevArenaBot',
    isDemo: true
  }
];

export const MOCK_TELEGRAM_HISTORY: TelegramChallengeRecord[] = [
  {
    id: 'tg_ch_mock_prev_1',
    chatId: '-1001928374829',
    chatTitle: 'DEVARENA Community (Demo Preview)',
    challengeNumber: 142,
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    slot: 'morning',
    scheduledAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    deliveredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'sent',
    telegramMessageId: 'tg_msg_demo_001'
  },
  {
    id: 'tg_ch_mock_prev_2',
    chatId: '-1001928374829',
    chatTitle: 'DEVARENA Community (Demo Preview)',
    challengeNumber: 141,
    problemId: 'maximum-subarray',
    problemTitle: 'Maximum Subarray (Kadane)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    slot: 'evening',
    scheduledAt: new Date(Date.now() - 86400000).toISOString(),
    deliveredAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'sent',
    telegramMessageId: 'tg_msg_demo_002'
  }
];


