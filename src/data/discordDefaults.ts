// DEVARENA CONNECT – Discord Defaults, Slash Commands & Embed Formatter
import { 
  DiscordServerSettings, 
  DiscordSlashCommandInfo,
  DiscordChallengeRecord,
  DiscordServerIntegration
} from '../types/discord';
import { CODING_PROBLEMS } from './problems';
import { CodingProblem } from '../types';

export const DISCORD_DEFAULT_SETTINGS: DiscordServerSettings = {
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

export const DISCORD_SLASH_COMMANDS: DiscordSlashCommandInfo[] = [
  {
    name: 'help',
    syntax: '/help',
    description: 'Displays all available DEVARENA commands, permissions, and guide.',
    example: '/help'
  },
  {
    name: 'daily',
    syntax: '/daily',
    description: "Fetches today's morning and evening coding challenges for your server.",
    example: '/daily'
  },
  {
    name: 'challenge',
    syntax: '/challenge [topic] [difficulty]',
    description: 'Instantly dispatches a practice algorithm challenge directly to the channel.',
    example: '/challenge topic:Dynamic Programming difficulty:Medium'
  },
  {
    name: 'leaderboard',
    syntax: '/leaderboard',
    description: 'Displays top DEVARENA competitive coders and highest Elo ratings.',
    example: '/leaderboard'
  },
  {
    name: 'profile',
    syntax: '/profile [@user]',
    description: 'Shows the linked DEVARENA developer profile, rank, and achievements.',
    example: '/profile'
  },
  {
    name: 'streak',
    syntax: '/streak',
    description: 'Inspects your consecutive daily coding streak and problem count.',
    example: '/streak'
  },
  {
    name: 'link',
    syntax: '/link <code>',
    description: 'Securely links your Discord user ID to your DEVARENA account.',
    example: '/link code:DEV-8392'
  },
  {
    name: 'stats',
    syntax: '/stats',
    description: 'Outputs 1v1 battle win rates, Elo rating, and category mastery.',
    example: '/stats'
  }
];

export const AVAILABLE_TOPICS = [
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
];

export const TIMEZONES = [
  { label: 'Asia/Kolkata (IST +5:30) - Default', value: 'Asia/Kolkata' },
  { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
  { label: 'America/New_York (EST/EDT -5/-4)', value: 'America/New_York' },
  { label: 'America/Los_Angeles (PST/PDT -8/-7)', value: 'America/Los_Angeles' },
  { label: 'Europe/London (GMT/BST +0/+1)', value: 'Europe/London' },
  { label: 'Europe/Berlin (CET/CEST +1/+2)', value: 'Europe/Berlin' },
  { label: 'Asia/Tokyo (JST +9:00)', value: 'Asia/Tokyo' },
  { label: 'Asia/Singapore (SGT +8:00)', value: 'Asia/Singapore' },
  { label: 'Australia/Sydney (AEST/AEDT +10/+11)', value: 'Australia/Sydney' }
];

// Helper to choose a problem matching server settings
export const selectProblemForServer = (
  settings: DiscordServerSettings,
  recentProblemIds: string[] = []
): CodingProblem => {
  let candidates = CODING_PROBLEMS;

  // Filter by difficulty if not mixed
  if (settings.difficulty !== 'Mixed') {
    candidates = candidates.filter(p => p.difficulty.toLowerCase() === settings.difficulty.toLowerCase());
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

// Formats a rich Discord Embed payload strictly according to Discord Bot API v10
export const formatDiscordChallengeEmbed = (
  problem: CodingProblem,
  slot: 'morning' | 'evening' | 'manual_test',
  challengeNumber: number = 142,
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : 'https://devarena-ten.vercel.app'
) => {
  const isMorning = slot === 'morning';
  const greeting = slot === 'manual_test'
    ? '🔔 DEVARENA Test Verification Challenge'
    : isMorning
    ? '☀️ Good morning, developers!'
    : '🌙 Good evening, developers!';

  const colorHex = problem.difficulty === 'Easy' 
    ? 0x22C55E 
    : problem.difficulty === 'Medium' 
    ? 0xF59E0B 
    : 0xEF4444;

  const diffEmoji = problem.difficulty === 'Easy' 
    ? '🟢' 
    : problem.difficulty === 'Medium' 
    ? '🟡' 
    : '🔴';

  const solveUrl = `${baseUrl}/app/arena?problem=${problem.id}`;
  const leaderboardUrl = `${baseUrl}/app/leaderboard`;

  const exampleSnippet = problem.examples && problem.examples[0]
    ? `**Input:** \`${problem.examples[0].input}\`\n**Output:** \`${problem.examples[0].output}\``
    : 'See problem description on platform.';

  return {
    content: `${greeting} Today's coding challenge **#${challengeNumber}** is live!\n**Can you solve it?** ⚔️`,
    embeds: [
      {
        title: `🏆 DEVARENA DAILY CHALLENGE #${challengeNumber}: ${problem.title}`,
        url: solveUrl,
        description: `${problem.description.slice(0, 320)}...\n\n👉 [**Click here to solve on Code Arena**](${solveUrl})`,
        color: colorHex,
        fields: [
          {
            name: 'Difficulty',
            value: `${diffEmoji} **${problem.difficulty}**`,
            inline: true
          },
          {
            name: 'Topic',
            value: `📁 **${problem.category}**`,
            inline: true
          },
          {
            name: 'Target Time Complexity',
            value: '⚡ **O(N)** or optimal',
            inline: true
          },
          {
            name: 'Example Test Case',
            value: exampleSnippet,
            inline: false
          }
        ],
        footer: {
          text: 'DEVARENA • Challenge yourself. Beat your friends. Prove your skills.',
          icon_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&h=64&fit=crop'
        },
        timestamp: new Date().toISOString()
      }
    ],
    components: [
      {
        type: 1, // ACTION_ROW
        components: [
          {
            type: 2, // BUTTON
            style: 5, // LINK
            label: 'Solve on DEVARENA',
            url: solveUrl
          },
          {
            type: 2, // BUTTON
            style: 5, // LINK
            label: 'View Leaderboard',
            url: leaderboardUrl
          }
        ]
      }
    ]
  };
};

export const MOCK_DISCORD_SERVERS: DiscordServerIntegration[] = [
  {
    id: 'srv_1564177053861810226',
    userId: 'guest',
    guildId: '1564177053861810226',
    guildName: "humpyhead's server",
    guildIcon: 'https://cdn.discordapp.com/icons/1564177053861810226/9088e6e75f8151434d704fe38b14a20c.png',
    memberCount: 28,
    channelId: '1566147418855055381',
    channelName: 'testing',
    status: 'connected',
    settings: { ...DISCORD_DEFAULT_SETTINGS },
    lastChallengeSent: {
      id: 'ch_1571474944934678609',
      serverId: 'srv_1564177053861810226',
      guildName: "humpyhead's server",
      channelId: '1566147418855055381',
      channelName: 'testing',
      challengeNumber: 142,
      problemId: 'two-sum',
      problemTitle: 'Two Sum',
      difficulty: 'Easy',
      category: 'Arrays & Hashing',
      slot: 'morning',
      scheduledAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      deliveredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'sent',
      messageId: '1571474944934678609'
    },
    connectedAt: new Date().toISOString(),
    isDemo: false
  }
];

export const MOCK_DISCORD_HISTORY: DiscordChallengeRecord[] = [
  {
    id: 'ch_mock_prev_1',
    serverId: 'srv_demo_preview',
    guildName: 'DEVARENA Devs (Demo Preview)',
    channelId: 'channel_demo_daily_dsa',
    channelName: 'daily-dsa',
    challengeNumber: 142,
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    slot: 'morning',
    scheduledAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    deliveredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'sent',
    messageId: 'msg_demo_001'
  },
  {
    id: 'ch_mock_prev_2',
    serverId: 'srv_demo_preview',
    guildName: 'DEVARENA Devs (Demo Preview)',
    channelId: 'channel_demo_daily_dsa',
    channelName: 'daily-dsa',
    challengeNumber: 141,
    problemId: 'maximum-subarray',
    problemTitle: 'Maximum Subarray (Kadane)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    slot: 'evening',
    scheduledAt: new Date(Date.now() - 86400000).toISOString(),
    deliveredAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'sent',
    messageId: 'msg_demo_002'
  }
];


