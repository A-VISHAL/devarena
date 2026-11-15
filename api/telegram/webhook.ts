// Vercel Serverless Function: Telegram Bot Incoming Webhook
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { recordDetectedChat } from './router';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Verify Secret Token Header if configured on the server
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || process.env.TELEGRAM_SECRET_TOKEN;
  if (webhookSecret) {
    const incomingSecret = req.headers['x-telegram-bot-api-secret-token'];
    if (incomingSecret && incomingSecret !== webhookSecret) {
      return res.status(401).json({ error: 'Unauthorized: Invalid secret token' });
    }
  }

  try {
    const update = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const host = req.headers.host;
    const BASE_URL = process.env.VITE_APP_URL || (host && !host.includes('localhost') ? `https://${host}` : 'https://devarena-ten.vercel.app');
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'DEVARENA_CommunityBot';

    // Helper to send messages back to Telegram
    const sendTelegramMessage = async (chatId: number | string, text: string, replyMarkup?: any) => {
      if (!botToken) {
        console.error('[Telegram Webhook] TELEGRAM_BOT_TOKEN not configured on backend.');
        return;
      }
      try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            reply_markup: replyMarkup
          })
        });
        const data = await res.json();
        if (!data.ok) {
          console.error('[Telegram Webhook] Telegram API rejected message:', data.description);
        }
      } catch (err) {
        console.error('[Telegram Webhook] Send message error:', err);
      }
    };

    // 2. Process my_chat_member updates (Bot added/removed in group)
    if (update?.my_chat_member) {
      const mcm = update.my_chat_member;
      const chat = mcm.chat;
      const newStatus = mcm.new_chat_member?.status;

      // Track detected chat
      if (chat?.id) {
        recordDetectedChat({ id: chat.id, title: chat.title, type: chat.type });
      }

      if (newStatus === 'member' || newStatus === 'administrator') {
        await sendTelegramMessage(
          chat.id,
          `👋 <b>DEVARENA Bot Connected to ${escapeHtml(chat.title || 'this group')}!</b>\n\n` +
          `📍 <b>Group Chat ID:</b> <code>${chat.id}</code>\n\n` +
          `☀️ <b>Morning Dispatch:</b> 09:00 IST\n` +
          `🌙 <b>Evening Dispatch:</b> 18:00 IST\n\n` +
          `⚙️ <b>Next Step:</b> Copy this Group Chat ID (<code>${chat.id}</code>) and enter it in the DEVARENA Connect Dashboard to verify and activate automated challenge delivery!`,
          {
            inline_keyboard: [
              [{ text: '⚡ Open DEVARENA Connect', url: `${BASE_URL}/app/connect` }]
            ]
          }
        );
      }
      return res.status(200).json({ ok: true });
    }

    // 3. Process incoming messages & commands
    if (update?.message?.text) {
      const msg = update.message;
      const chat = msg.chat;
      const from = msg.from || { first_name: 'Developer' };
      let text = msg.text.trim();

      // Track detected chat
      if (chat?.id) {
        recordDetectedChat({ id: chat.id, title: chat.title, type: chat.type, text });
      }

      text = text.replace(new RegExp(`@${botUsername}`, 'i'), '');

      const parts = text.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const arg = parts.slice(1).join(' ').trim();
      const isGroup = chat.type === 'group' || chat.type === 'supergroup';

      // Group ID query command (/id or /chatid or /info)
      if (cmd === '/id' || cmd === '/chatid' || cmd === '/info') {
        await sendTelegramMessage(
          chat.id,
          `📍 <b>DEVARENA Chat Identification</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `• <b>Chat ID:</b> <code>${chat.id}</code>\n` +
          `• <b>Title:</b> <b>${escapeHtml(chat.title || chat.first_name || 'Chat')}</b>\n` +
          `• <b>Type:</b> <code>${chat.type}</code>\n\n` +
          `📋 <b>How to Connect:</b>\n` +
          `Copy your Chat ID (<code>${chat.id}</code>) and click below to verify it in the DEVARENA Connect Dashboard.`,
          {
            inline_keyboard: [
              [{ text: '⚡ Verify in DEVARENA Connect', url: `${BASE_URL}/app/connect` }]
            ]
          }
        );
        return res.status(200).json({ ok: true });
      }

      if (cmd === '/start') {
        if (arg.startsWith('link_')) {
          await sendTelegramMessage(
            chat.id,
            `✅ <b>Account Link Verification Initiated!</b>\n\n` +
            `Code <code>${escapeHtml(arg.replace('link_', ''))}</code> received for user <b>@${escapeHtml(from.username || from.first_name)}</b>.\n\n` +
            `Head to <a href="${BASE_URL}/app/connect">DEVARENA Connect</a> to confirm status.`
          );
          return res.status(200).json({ ok: true });
        }

        const groupNote = isGroup
          ? `\n\n📍 <b>Group Chat ID:</b> <code>${chat.id}</code>\n<i>Enter this ID in DEVARENA Connect to link this group!</i>`
          : '';

        await sendTelegramMessage(
          chat.id,
          `⚔️ <b>Welcome to DEVARENA!</b>\n\n` +
          `The ultimate competitive DSA battleground & algorithmic community.\n\n` +
          `🚀 <b>What DEVARENA Bot does:</b>\n` +
          `• Delivers two curated daily DSA challenges (9:00 AM & 6:00 PM IST)\n` +
          `• Instant problem practice with <code>/challenge</code>\n` +
          `• Global Elo ratings with <code>/leaderboard</code>\n` +
          `• Developer profile & streak synchronization${groupNote}\n\n` +
          `<b>Quick Commands:</b>\n` +
          `/id — Get this chat's ID\n` +
          `/daily — View today's challenges\n` +
          `/challenge — Request a DSA problem\n` +
          `/leaderboard — View top coders\n` +
          `/profile — Your developer stats\n` +
          `/streak — Your coding streak\n` +
          `/help — Full command guide`,
          {
            inline_keyboard: [
              [
                { text: '➕ Add to Group', url: `https://t.me/${botUsername}?startgroup=true` },
                { text: '🌐 Open DEVARENA', url: `${BASE_URL}/app/connect` }
              ]
            ]
          }
        );
        return res.status(200).json({ ok: true });
      }

      if (cmd === '/help') {
        await sendTelegramMessage(
          chat.id,
          `📖 <b>DEVARENA Bot Commands & Guide</b>\n\n` +
          `• <code>/id</code> — Display this group/chat's numeric Chat ID\n` +
          `• <code>/daily</code> — Show today's morning (09:00) and evening (18:00) challenges\n` +
          `• <code>/challenge</code> — Fetch a coding challenge to solve\n` +
          `• <code>/leaderboard</code> — Display global Elo rankings and top coders\n` +
          `• <code>/profile</code> — View your connected developer profile\n` +
          `• <code>/streak</code> — Check your current daily coding streak\n` +
          `• <code>/stats</code> — View 1v1 battle win rate and category mastery\n` +
          `• <code>/link &lt;code&gt;</code> — Link Telegram identity to your DEVARENA account\n` +
          `• <code>/settings</code> — Group configuration (Group Admins only)`,
          {
            inline_keyboard: [
              [{ text: '⚔️ Enter Code Arena', url: `${BASE_URL}/app/arena` }]
            ]
          }
        );
        return res.status(200).json({ ok: true });
      }

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

      if (cmd === '/profile') {
        await sendTelegramMessage(
          chat.id,
          `👤 <b>DEVARENA Developer Profile</b>\n━━━━━━━━━━━━━━━━━━━━\n• <b>Developer:</b> ${escapeHtml(from.username || from.first_name)}\n• <b>Rating:</b> 1980 Elo (Master)\n• <b>Problems Solved:</b> 142\n• <b>Active Streak:</b> 🔥 12 days\n\n━━━━━━━━━━━━━━━━━━━━`,
          {
            inline_keyboard: [
              [{ text: '⚡ View On Platform', url: `${BASE_URL}/app/profile` }]
            ]
          }
        );
        return res.status(200).json({ ok: true });
      }

      if (cmd === '/streak') {
        await sendTelegramMessage(
          chat.id,
          `🔥 <b>DEVARENA CODING STREAK</b>\n━━━━━━━━━━━━━━━━━━━━\nDeveloper: <b>${escapeHtml(from.username || from.first_name)}</b>\nStreak: <b>12 Consecutive Days!</b>\nMonthly Solved: <b>38 challenges</b>\nStatus: <b>Active & Protected</b>`
        );
        return res.status(200).json({ ok: true });
      }

      if (cmd === '/stats') {
        await sendTelegramMessage(
          chat.id,
          `📊 <b>DEVARENA CODING STATISTICS</b>\n━━━━━━━━━━━━━━━━━━━━\n• <b>1v1 Arena Battles:</b> 48\n• <b>Wins:</b> 42 (87.5% Win Rate)\n• <b>Global Elo:</b> 2045 (Master Tier)\n• <b>Arrays & Hashing:</b> 94% Mastery\n• <b>Trees & Graphs:</b> 82% Mastery`
        );
        return res.status(200).json({ ok: true });
      }

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
    return res.status(500).json({ error: err.message });
  }
}
