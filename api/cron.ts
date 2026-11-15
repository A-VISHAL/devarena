// Vercel Serverless Function: Deterministic Daily Challenge Dispatcher
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDeterministicChallenge } from './_lib/mockData';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized cron invocation' });
  }

  try {
    const now = new Date();
    // 03:00 - 08:00 UTC = Morning in Asia/Kolkata (08:30 - 13:30 IST)
    const currentHourUtc = now.getUTCHours();
    const slot = currentHourUtc < 8 ? 'morning' : 'evening';
    const challengeData = getDeterministicChallenge(slot, now);

    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChats = (process.env.TELEGRAM_BROADCAST_CHATS || '').split(',').map(s => s.trim()).filter(Boolean);

    const discordToken = process.env.DISCORD_BOT_TOKEN;
    const discordChannels = (process.env.DISCORD_BROADCAST_CHANNELS || '').split(',').map(s => s.trim()).filter(Boolean);

    let telegramDeliveredCount = 0;
    let discordDeliveredCount = 0;

    // Live Telegram broadcast if configured
    if (telegramToken && telegramChats.length > 0) {
      const p = challengeData.problem;
      const text = `⚔️ <b>DEVARENA DAILY CHALLENGE #${challengeData.challengeNumber}</b>\n━━━━━━━━━━━━━━━━━━━━\n📌 <b>${p.title}</b> (${p.difficulty})\n📁 <b>Topic:</b> ${p.category}\n\n${p.description}\n\n👉 <a href="https://devarena.io/app/arena?problem=${p.id}">Solve on Code Arena</a>`;
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
                  [{ text: '⚡ Solve Challenge', url: `https://devarena.io/app/arena?problem=${p.id}` }]
                ]
              }
            })
          });
          if (tgRes.ok) telegramDeliveredCount++;
        } catch { }
      }
    }

    // Live Discord broadcast if configured
    if (discordToken && discordChannels.length > 0) {
      const p = challengeData.problem;
      const payload = {
        content: `⚔️ **DEVARENA DAILY CHALLENGE #${challengeData.challengeNumber}: ${p.title}**\n${p.description}\n👉 https://devarena.io/app/arena?problem=${p.id}`
      };
      for (const channelId of discordChannels) {
        try {
          const dRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bot ${discordToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          if (dRes.ok) discordDeliveredCount++;
        } catch { }
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: now.toISOString(),
      slot,
      challenge: challengeData,
      mode: telegramDeliveredCount > 0 || discordDeliveredCount > 0 ? 'live_broadcast' : 'deterministic_preview',
      broadcastResults: {
        telegramDeliveredCount,
        discordDeliveredCount
      },
      message: 'DEVARENA deterministic challenge cron executed successfully.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
