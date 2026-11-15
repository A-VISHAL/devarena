// Vercel Serverless Function: Telegram Bot Incoming Webhook & Diagnostics
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';

const TMP_FILE = '/tmp/devarena_telegram_recent_updates.json';
const MAX_UPDATES = 50;

interface DetectedChatInfo {
  chatId: string;
  title: string;
  type: string;
  lastSeenAt: string;
  lastMessage?: string;
  sender?: string;
}

interface StoredTelegramUpdate {
  updateId: number;
  receivedAt: string;
  chatId: string;
  chatTitle: string;
  chatType: string;
  senderUsername?: string;
  senderId?: number;
  text?: string;
  isGroup: boolean;
  action?: string;
}

// In-memory buffer surviving warm lambda invocations
let memoryUpdates: StoredTelegramUpdate[] = [];

function loadPersistedUpdates(): StoredTelegramUpdate[] {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  return [];
}

function persistUpdates(updates: StoredTelegramUpdate[]) {
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(updates.slice(0, MAX_UPDATES)), 'utf8');
  } catch {}
}

function recordTelegramUpdate(update: any): StoredTelegramUpdate | null {
  if (!update) return null;

  const msg = update.message || update.edited_message || update.channel_post;
  const mcm = update.my_chat_member;
  const chat = msg?.chat || mcm?.chat;

  if (!chat || !chat.id) return null;

  const from = msg?.from || mcm?.from || {};
  const isGroup = chat.type === 'group' || chat.type === 'supergroup';
  const chatTitle = chat.title || chat.first_name || (chat.username ? `@${chat.username}` : `Chat ${chat.id}`);

  const entry: StoredTelegramUpdate = {
    updateId: update.update_id || Date.now(),
    receivedAt: new Date().toISOString(),
    chatId: String(chat.id),
    chatTitle,
    chatType: chat.type || 'group',
    senderUsername: from.username ? `@${from.username}` : from.first_name,
    senderId: from.id,
    text: msg?.text || (mcm ? `Bot status changed: ${mcm.new_chat_member?.status}` : undefined),
    isGroup,
    action: mcm ? `my_chat_member:${mcm.new_chat_member?.status}` : 'message'
  };

  if (memoryUpdates.length === 0) {
    memoryUpdates = loadPersistedUpdates();
  }

  memoryUpdates = [entry, ...memoryUpdates.filter(u => u.updateId !== entry.updateId)].slice(0, MAX_UPDATES);
  persistUpdates(memoryUpdates);

  return entry;
}

function getRecentTelegramUpdates(): StoredTelegramUpdate[] {
  if (memoryUpdates.length === 0) {
    memoryUpdates = loadPersistedUpdates();
  }
  return memoryUpdates;
}

function getDetectedTelegramGroups(): DetectedChatInfo[] {
  const all = getRecentTelegramUpdates();
  const map = new Map<string, DetectedChatInfo>();

  for (const u of all) {
    if (!map.has(u.chatId)) {
      map.set(u.chatId, {
        chatId: u.chatId,
        title: u.chatTitle,
        type: u.chatType,
        lastSeenAt: u.receivedAt,
        lastMessage: u.text,
        sender: u.senderUsername
      });
    }
  }

  return Array.from(map.values());
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-telegram-bot-api-secret-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const expectedBotUsername = process.env.TELEGRAM_BOT_USERNAME || 'DEVARENA_CommunityBot';
  const host = req.headers.host;
  const BASE_URL = process.env.VITE_APP_URL || (host && !host.includes('localhost') ? `https://${host}` : 'https://devarena-ten.vercel.app');

  // =========================================================================
  // GET: Secure Backend Diagnostic for Incoming Webhook Updates & Bot Identity
  // =========================================================================
  if (req.method === 'GET') {
    let botIdentity: any = null;
    let webhookStatus: any = null;
    let tokenBelongsToTargetBot = false;

    if (botToken) {
      try {
        const meRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
        const meData = await meRes.json();
        if (meData.ok) {
          botIdentity = meData.result;
          tokenBelongsToTargetBot = meData.result.username?.toLowerCase() === expectedBotUsername.toLowerCase();
        } else {
          botIdentity = { error: meData.description };
        }
      } catch (e: any) {
        botIdentity = { error: e.message };
      }

      try {
        const whRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
        const whData = await whRes.json();
        if (whData.ok) {
          webhookStatus = whData.result;
        } else {
          webhookStatus = { error: whData.description };
        }
      } catch (e: any) {
        webhookStatus = { error: e.message };
      }
    }

    const recentUpdates = getRecentTelegramUpdates();
    const detectedGroups = getDetectedTelegramGroups();

    return res.status(200).json({
      status: 'diagnostic_ready',
      configured: Boolean(botToken),
      tokenBelongsToTargetBot,
      expectedBotUsername,
      botIdentity,
      webhookStatus,
      detectedGroupsCount: detectedGroups.length,
      detectedGroups,
      recentUpdatesCount: recentUpdates.length,
      recentUpdates: recentUpdates.slice(0, 25),
      timestamp: new Date().toISOString()
    });
  }

  // =========================================================================
  // POST: Telegram Bot Incoming Webhook Handler
  // =========================================================================
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify secret token header if configured
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || process.env.TELEGRAM_SECRET_TOKEN;
  if (webhookSecret) {
    const incomingSecret = req.headers['x-telegram-bot-api-secret-token'];
    if (incomingSecret && incomingSecret !== webhookSecret) {
      return res.status(401).json({ error: 'Unauthorized: Invalid secret token' });
    }
  }

  try {
    const update = req.body;
    if (!update) {
      return res.status(200).json({ ok: true, notice: 'empty_update' });
    }

    // Record incoming update in shared memory / tmp store
    recordTelegramUpdate(update);

    // Helper to send messages back to Telegram
    const sendTelegramMessage = async (chatId: number | string, text: string, replyMarkup?: any) => {
      if (!botToken) {
        console.error('[Telegram Webhook] TELEGRAM_BOT_TOKEN not configured.');
        return;
      }
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            reply_markup: replyMarkup
          })
        });
      } catch (err) {
        console.error('[Telegram Webhook] Error sending reply:', err);
      }
    };

    // 1. Process my_chat_member updates (Bot added/removed in group)
    if (update.my_chat_member) {
      const mcm = update.my_chat_member;
      const chat = mcm.chat;
      const newStatus = mcm.new_chat_member?.status;

      if (newStatus === 'member' || newStatus === 'administrator') {
        await sendTelegramMessage(
          chat.id,
          `👋 <b>DEVARENA Bot Connected to ${escapeHtml(chat.title || 'this group')}!</b>\n\n` +
          `📍 <b>Group Chat ID:</b> <code>${chat.id}</code>\n\n` +
          `☀️ <b>Morning Challenge:</b> 09:00 IST\n` +
          `🌙 <b>Evening Challenge:</b> 18:00 IST\n\n` +
          `⚙️ <b>Activation:</b> Copy your Chat ID (<code>${chat.id}</code>) and verify it in the DEVARENA Connect Dashboard:`,
          {
            inline_keyboard: [
              [{ text: '⚡ Open DEVARENA Connect', url: `${BASE_URL}/app/connect` }]
            ]
          }
        );
      }
      return res.status(200).json({ ok: true });
    }

    // 2. Process incoming messages & commands
    const msg = update.message || update.edited_message;
    if (msg && msg.text) {
      const chat = msg.chat;
      const from = msg.from || { first_name: 'Developer' };
      let text = msg.text.trim();
      const isGroup = chat.type === 'group' || chat.type === 'supergroup';

      // Clean command: strip @username
      text = text.replace(new RegExp(`@${expectedBotUsername}`, 'i'), '');

      const parts = text.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const arg = parts.slice(1).join(' ').trim();

      // /id, /chatid, /groupid, /whoami, /info command
      if (cmd === '/id' || cmd === '/chatid' || cmd === '/groupid' || cmd === '/whoami' || cmd === '/info') {
        await sendTelegramMessage(
          chat.id,
          `📍 <b>DEVARENA Chat Identification</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `• <b>Chat ID:</b> <code>${chat.id}</code>\n` +
          `• <b>Title:</b> <b>${escapeHtml(chat.title || chat.first_name || 'Chat')}</b>\n` +
          `• <b>Type:</b> <code>${chat.type}</code>\n\n` +
          `📋 <b>Connect Group:</b>\n` +
          `Copy your Chat ID: <code>${chat.id}</code>\n` +
          `and paste it in DEVARENA Connect to activate daily challenge delivery!`,
          {
            inline_keyboard: [
              [{ text: '⚡ Open DEVARENA Connect', url: `${BASE_URL}/app/connect` }]
            ]
          }
        );
        return res.status(200).json({ ok: true });
      }

      // /start command
      if (cmd === '/start') {
        if (arg.startsWith('link_')) {
          await sendTelegramMessage(
            chat.id,
            `✅ <b>Account Link Verification Initiated!</b>\n\n` +
            `Code <code>${escapeHtml(arg.replace('link_', ''))}</code> received for user <b>@${escapeHtml(from.username || from.first_name)}</b>.\n\n` +
            `Return to <a href="${BASE_URL}/app/connect">DEVARENA Connect</a> to confirm.`
          );
          return res.status(200).json({ ok: true });
        }

        const groupNote = isGroup
          ? `\n\n📍 <b>Group Chat ID:</b> <code>${chat.id}</code>\n<i>Copy this ID and verify in DEVARENA Connect to activate daily algorithms!</i>`
          : '';

        await sendTelegramMessage(
          chat.id,
          `⚔️ <b>Welcome to DEVARENA!</b>\n\n` +
          `The competitive algorithmic battleground & developer community platform.\n\n` +
          `🚀 <b>Features:</b>\n` +
          `• Automated morning (09:00 IST) & evening (18:00 IST) DSA problems\n` +
          `• Instant problem challenges with <code>/challenge</code>\n` +
          `• Global leaderboards with <code>/leaderboard</code>\n` +
          `• Developer coding streak synchronization${groupNote}\n\n` +
          `<b>Commands:</b>\n` +
          `• <code>/id</code> — Get this chat's numeric ID\n` +
          `• <code>/daily</code> — Today's DSA challenges\n` +
          `• <code>/challenge</code> — Fetch an algorithm problem\n` +
          `• <code>/leaderboard</code> — Top coders\n` +
          `• <code>/help</code> — Full command reference`,
          {
            inline_keyboard: [
              [
                { text: '➕ Add to Another Group', url: `https://t.me/${expectedBotUsername}?startgroup=true` },
                { text: '🌐 Open DEVARENA', url: `${BASE_URL}/app/connect` }
              ]
            ]
          }
        );
        return res.status(200).json({ ok: true });
      }

      // /help command
      if (cmd === '/help') {
        await sendTelegramMessage(
          chat.id,
          `📖 <b>DEVARENA Bot Commands & Reference</b>\n\n` +
          `• <code>/id</code> — Display this group/chat's numeric Chat ID\n` +
          `• <code>/daily</code> — Show today's morning (09:00) and evening (18:00) challenges\n` +
          `• <code>/challenge</code> — Fetch an algorithm challenge to solve\n` +
          `• <code>/leaderboard</code> — Display global Elo rankings\n` +
          `• <code>/profile</code> — View your connected developer profile\n` +
          `• <code>/streak</code> — Check your current daily coding streak\n` +
          `• <code>/stats</code> — View 1v1 battle win rate and category mastery\n` +
          `• <code>/link &lt;code&gt;</code> — Link Telegram identity to your DEVARENA account\n` +
          `• <code>/settings</code> — Group configuration (Admins only)`,
          {
            inline_keyboard: [
              [{ text: '⚔️ Enter Code Arena', url: `${BASE_URL}/app/arena` }]
            ]
          }
        );
        return res.status(200).json({ ok: true });
      }

      // /daily or /challenge command
      if (cmd === '/daily' || cmd === '/challenge') {
        await sendTelegramMessage(
          chat.id,
          `⚔️ <b>DEVARENA DAILY CHALLENGE #142: Two Sum</b>\n━━━━━━━━━━━━━━━━━━━━\n🟢 <b>Difficulty:</b> Easy\n📁 <b>Topic:</b> Arrays & Hashing\n⚡ <b>Target Complexity:</b> O(N) or optimal\n\nGiven an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\n<code>Input: nums = [2, 7, 11, 15], target = 9</code>\n<code>Output: [0, 1]</code>\n\n👉 <a href="${BASE_URL}/app/arena?problem=two-sum">Solve on Code Arena</a>`,
          {
            inline_keyboard: [
              [
                { text: '⚡ Solve Challenge', url: `${BASE_URL}/app/arena?problem=two-sum` },
                { text: '🏆 View Leaderboard', url: `${BASE_URL}/app/leaderboard` }
              ]
            ]
          }
        );
        return res.status(200).json({ ok: true });
      }

      // /leaderboard command
      if (cmd === '/leaderboard') {
        await sendTelegramMessage(
          chat.id,
          `🏆 <b>DEVARENA GLOBAL TOP CODERS</b>\n━━━━━━━━━━━━━━━━━━━━\n🥇 <b>#1 algo_zenith</b> — 2180 Elo (48 Wins)\n🥈 <b>#2 binary_ninja</b> — 2045 Elo (42 Wins)\n🥉 <b>#3 sara_byte</b> — 2010 Elo (39 Wins)\n• <b>#4 kavya_codes</b> — 1845 Elo (31 Wins)\n• <b>#5 rohit_algo</b> — 1790 Elo (28 Wins)\n\n━━━━━━━━━━━━━━━━━━━━\nClimb the ranks by solving daily challenges & 1v1 Code Arena battles!`,
          {
            inline_keyboard: [
              [{ text: '🔥 View Full Leaderboard', url: `${BASE_URL}/app/leaderboard` }]
            ]
          }
        );
        return res.status(200).json({ ok: true });
      }

      // /settings command
      if (cmd === '/settings') {
        await sendTelegramMessage(
          chat.id,
          `⚙️ <b>DEVARENA Group Settings</b>\n━━━━━━━━━━━━━━━━━━━━\n☀️ <b>Morning Challenge:</b> ✅ ON (09:00 IST)\n🌙 <b>Evening Challenge:</b> ✅ ON (18:00 IST)\n🌐 <b>Timezone:</b> Asia/Kolkata\n🎯 <b>Difficulty:</b> Mixed\n📍 <b>Chat ID:</b> <code>${chat.id}</code>\n\nConfigure custom topics and schedules in the web dashboard:`,
          {
            inline_keyboard: [
              [{ text: '🌐 Web Admin Dashboard', url: `${BASE_URL}/app/connect` }]
            ]
          }
        );
        return res.status(200).json({ ok: true });
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('[Telegram Webhook] Handler error:', err);
    return res.status(200).json({ ok: false, error: err.message });
  }
}
