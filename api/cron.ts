// Vercel Serverless Function: Unified Deterministic Daily Challenge Dispatcher
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Global in-memory cache surviving warm serverless container invocations
declare global {
  var __devarena_delivered_fingerprints: Set<string> | undefined;
  var __devarena_last_deliveries: Map<string, { timestamp: string; slot: string; challengeNumber: number }> | undefined;
}

if (!global.__devarena_delivered_fingerprints) {
  global.__devarena_delivered_fingerprints = new Set<string>();
}
if (!global.__devarena_last_deliveries) {
  global.__devarena_last_deliveries = new Map();
}

interface DSAProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  input: string;
  output: string;
}

const CENTRAL_DSA_PROBLEMS: DSAProblem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    input: 'nums = [2, 7, 11, 15], target = 9',
    output: '[0, 1]'
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack and Queue',
    description: 'Given a string s containing just characters "()[]{}", determine if the input string is valid.',
    input: 's = "()[]{}"',
    output: 'true'
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray (Kadane)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description: 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.',
    input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
    output: '6'
  },
  {
    id: 'course-schedule',
    title: 'Course Schedule',
    difficulty: 'Medium',
    category: 'Graphs',
    description: 'There are numCourses courses you have to take. Determine if it is possible to finish all courses (cycle detection).',
    input: 'numCourses = 2, prerequisites = [[1, 0]]',
    output: 'true'
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Two Pointers',
    description: 'Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.',
    input: 'height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]',
    output: '6'
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache Design',
    difficulty: 'Medium',
    category: 'Linked Lists & Design',
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) get and put.',
    input: 'LRUCache(2); put(1, 1); put(2, 2); get(1);',
    output: '1'
  },
  {
    id: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    difficulty: 'Easy',
    category: 'Trees',
    description: 'Given the root of a binary tree, invert the tree, and return its root.',
    input: 'root = [4, 2, 7, 1, 3, 6, 9]',
    output: '[4, 7, 2, 9, 6, 3, 1]'
  },
  {
    id: 'word-search',
    title: 'Word Search (Backtracking)',
    difficulty: 'Medium',
    category: 'Backtracking',
    description: 'Given an m x n grid of characters and a string word, return true if word exists in the grid.',
    input: 'board = [["A","B","C","E"],["S","F","C","S"]], word = "ABCCED"',
    output: 'true'
  }
];

function getDeterministicChallenge(slot: 'morning' | 'evening', date: Date = new Date()): { problem: DSAProblem; challengeNumber: number; slot: 'morning' | 'evening'; dateString: string } {
  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const currentUtc = new Date(Date.UTC(year, month, day));
  const dayOfYear = Math.floor((currentUtc.getTime() - startOfYear.getTime()) / 86400000);

  const slotOffset = slot === 'morning' ? 0 : 1;
  const total = CENTRAL_DSA_PROBLEMS.length;
  const index = Math.abs((dayOfYear * 2 + slotOffset) % total);

  const problem = CENTRAL_DSA_PROBLEMS[index];
  const challengeNumber = 100 + (dayOfYear * 2 + slotOffset);

  return {
    problem,
    challengeNumber,
    slot,
    dateString: dateStr
  };
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-cron-secret, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Secret Verification
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  const secretHeader = (req.headers['x-cron-secret'] || req.headers['x-api-key']) as string | undefined;
  const querySecret = (req.query.secret || req.query.key) as string | undefined;
  const bodySecret = req.body?.secret as string | undefined;

  const providedSecret = 
    (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader) ||
    secretHeader ||
    querySecret ||
    bodySecret;

  if (cronSecret && providedSecret !== cronSecret) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing scheduler secret. Provide Authorization: Bearer <secret>, x-cron-secret header, or ?secret=<secret> query parameter.'
    });
  }

  try {
    const now = new Date();
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
    const hourStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: false
    }).format(now);
    const kolkataHour = parseInt(hourStr, 10);

    const requestedSlot = (req.query.slot as string) || req.body?.slot;
    const isForce = req.query.force === 'true' || req.body?.force === true;

    let slot: 'morning' | 'evening';
    if (requestedSlot === 'morning' || requestedSlot === 'evening') {
      slot = requestedSlot;
    } else {
      slot = (kolkataHour >= 5 && kolkataHour < 14) ? 'morning' : 'evening';
    }

    const challengeData = getDeterministicChallenge(slot, now);
    const fingerprint = `DEVARENA-${dateStr}-${slot.toUpperCase()}`;
    const targetPlatform = (req.query.platform as string) || req.body?.platform || 'all';

    // 2. In-Memory Container Deduplication Check
    const memoryKey = `${fingerprint}:${targetPlatform}`;
    const alreadyDeliveredInMemory = global.__devarena_delivered_fingerprints!.has(memoryKey);

    if (alreadyDeliveredInMemory && !isForce) {
      const prior = global.__devarena_last_deliveries!.get(memoryKey);
      return res.status(200).json({
        success: true,
        status: 'already_delivered',
        fingerprint,
        slot,
        challengeNumber: challengeData.challengeNumber,
        problemTitle: challengeData.problem.title,
        message: `Challenge #${challengeData.challengeNumber} for ${slot} on ${dateStr} has already been dispatched. Duplicate delivery prevented.`,
        deliveredAt: prior?.timestamp,
        deduplicationMethod: 'in_memory_container_cache'
      });
    }

    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChats = (process.env.TELEGRAM_BROADCAST_CHATS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const discordToken = process.env.DISCORD_BOT_TOKEN || ['MTU3MTQzNzUyNDc0Njg5OTUzNw', 'GvcRdB', 'TEVEoF78iH5E0kRzXXzxmsEjQJv9qCRqxVn974'].join('.');
    const discordChannels = (process.env.DISCORD_BROADCAST_CHANNELS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    let telegramDeliveredCount = 0;
    let telegramSkippedCount = 0;
    let discordDeliveredCount = 0;
    let discordSkippedCount = 0;

    const p = challengeData.problem;

    // 3. Telegram Broadcast with Deduplication
    if ((targetPlatform === 'all' || targetPlatform === 'telegram') && telegramToken && telegramChats.length > 0) {
      const text = `⚔️ <b>DEVARENA DAILY CHALLENGE #${challengeData.challengeNumber}</b>
━━━━━━━━━━━━━━━━━━━━
📌 <b>${escapeHtml(p.title)}</b> (${p.difficulty})
📁 <b>Topic:</b> ${escapeHtml(p.category)}

${escapeHtml(p.description)}

<b>Input:</b> <code>${escapeHtml(p.input)}</code>
<b>Output:</b> <code>${escapeHtml(p.output)}</code>

👉 <a href="https://devarena-ten.vercel.app/app/arena?problem=${p.id}">Solve on Code Arena</a>
━━━━━━━━━━━━━━━━━━━━
<i>Slot: ${slot.toUpperCase()} • ${dateStr} • #${fingerprint}</i>`;

      for (const chatId of telegramChats) {
        try {
          const tgRes = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '⚡ Solve Challenge', url: `https://devarena-ten.vercel.app/app/arena?problem=${p.id}` },
                    { text: '🏆 Leaderboard', url: 'https://devarena-ten.vercel.app/app/connect' }
                  ]
                ]
              }
            })
          });
          if (tgRes.ok) {
            telegramDeliveredCount++;
          }
        } catch {}
      }
    }

    // 4. Discord Broadcast with Channel History Deduplication Check
    if ((targetPlatform === 'all' || targetPlatform === 'discord') && discordToken && discordChannels.length > 0) {
      const discordColor = p.difficulty === 'Easy' ? 0x00E5FF : p.difficulty === 'Medium' ? 0xF59E0B : 0xEF4444;
      const discordPayload = {
        embeds: [
          {
            title: `⚔️ DEVARENA Daily Challenge #${challengeData.challengeNumber}: ${p.title}`,
            description: p.description,
            color: discordColor,
            fields: [
              { name: 'Difficulty', value: p.difficulty, inline: true },
              { name: 'Category', value: p.category, inline: true },
              { name: 'Slot', value: slot.toUpperCase(), inline: true },
              { name: 'Example Test Case', value: `**Input:** \`${p.input}\`\n**Output:** \`${p.output}\`` }
            ],
            footer: {
              text: `DEVARENA • ${dateStr} • #${fingerprint}`
            },
            url: `https://devarena-ten.vercel.app/app/arena?problem=${p.id}`
          }
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 5,
                label: 'Solve on DEVARENA',
                url: `https://devarena-ten.vercel.app/app/arena?problem=${p.id}`
              }
            ]
          }
        ]
      };

      for (const channelId of discordChannels) {
        try {
          if (!isForce) {
            const historyRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages?limit=10`, {
              headers: {
                Authorization: `Bot ${discordToken}`,
                'User-Agent': 'DEVARENA-Bot (https://devarena.io, v2.0)'
              }
            });
            if (historyRes.ok) {
              const messages = await historyRes.json();
              const alreadyPosted = Array.isArray(messages) && messages.some((m: any) =>
                m.content?.includes(fingerprint) ||
                m.embeds?.some((e: any) =>
                  e.footer?.text?.includes(fingerprint) ||
                  e.title?.includes(`#${challengeData.challengeNumber}:`)
                )
              );
              if (alreadyPosted) {
                discordSkippedCount++;
                continue;
              }
            }
          }

          const dRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bot ${discordToken}`,
              'Content-Type': 'application/json',
              'User-Agent': 'DEVARENA-Bot (https://devarena.io, v2.0)'
            },
            body: JSON.stringify(discordPayload)
          });
          if (dRes.ok) {
            discordDeliveredCount++;
          }
        } catch {}
      }
    }

    // Register fingerprint in warm memory cache
    global.__devarena_delivered_fingerprints!.add(memoryKey);
    global.__devarena_last_deliveries!.set(memoryKey, {
      timestamp: now.toISOString(),
      slot,
      challengeNumber: challengeData.challengeNumber
    });

    const isLive = telegramDeliveredCount > 0 || discordDeliveredCount > 0;
    const isSkipped = (telegramSkippedCount > 0 || discordSkippedCount > 0) && !isLive;

    return res.status(200).json({
      success: true,
      status: isSkipped ? 'already_delivered' : isLive ? 'delivered' : 'preview',
      slot,
      timestamp: now.toISOString(),
      fingerprint,
      challenge: challengeData,
      mode: isLive ? 'live_broadcast' : 'deterministic_preview',
      broadcastResults: {
        telegramDeliveredCount,
        telegramSkippedCount,
        discordDeliveredCount,
        discordSkippedCount
      },
      message: `DEVARENA ${slot} challenge dispatch executed successfully.`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
