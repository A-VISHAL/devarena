// Unified Scheduler Engine with Secret Verification and Deduplication
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDeterministicChallenge } from './mockData';

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

export interface DispatchOptions {
  platform?: 'all' | 'discord' | 'telegram';
}

export async function handleSchedulerRequest(
  req: VercelRequest,
  res: VercelResponse,
  options: DispatchOptions = {}
) {
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
    // Calculate Asia/Kolkata date and hour
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
    const hourStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: false
    }).format(now);
    const kolkataHour = parseInt(hourStr, 10);

    // Slot determination: Check query, body, or auto-detect by IST hour
    const requestedSlot = (req.query.slot as string) || req.body?.slot;
    const isForce = req.query.force === 'true' || req.body?.force === true;

    let slot: 'morning' | 'evening';
    if (requestedSlot === 'morning' || requestedSlot === 'evening') {
      slot = requestedSlot;
    } else {
      // 09:00 IST is morning (hours 5 - 13); 18:00 IST is evening (hours 14 - 23, 0 - 4)
      slot = (kolkataHour >= 5 && kolkataHour < 14) ? 'morning' : 'evening';
    }

    const challengeData = getDeterministicChallenge(slot, now);
    const fingerprint = `DEVARENA-${dateStr}-${slot.toUpperCase()}`;
    const targetPlatform = options.platform || (req.query.platform as any) || req.body?.platform || 'all';

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

    const discordToken = process.env.DISCORD_BOT_TOKEN;
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

👉 <a href="https://devarena.io/app/arena?problem=${p.id}">Solve on Code Arena</a>
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
                    { text: '⚡ Solve Challenge', url: `https://devarena.io/app/arena?problem=${p.id}` },
                    { text: '🏆 Leaderboard', url: 'https://devarena.io/app/connect' }
                  ]
                ]
              }
            })
          });
          if (tgRes.ok) {
            telegramDeliveredCount++;
          }
        } catch { }
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
            url: `https://devarena.io/app/arena?problem=${p.id}`
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
                url: `https://devarena.io/app/arena?problem=${p.id}`
              }
            ]
          }
        ]
      };

      for (const channelId of discordChannels) {
        try {
          // Channel-level deduplication: check last 10 messages from bot
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
        } catch { }
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

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

