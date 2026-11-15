// Vercel Serverless Function: Dispatch Test Challenge to Telegram Group
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const chatId = req.query.chatId || (req.body && req.body.chatId) || '-1001849204820';
  const body = req.body || {};
  const payload = body.payload || {};
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  let messageId = `tg_test_${Date.now()}`;
  let success = true;
  let error = null;

  if (botToken && chatId) {
    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: payload.text || '🏆 DEVARENA Test Verification Challenge',
          parse_mode: payload.parse_mode || 'HTML',
          reply_markup: payload.reply_markup
        })
      });
      const data = await tgRes.json();
      if (data.ok) {
        messageId = String(data.result?.message_id || messageId);
      } else {
        success = false;
        error = data.description;
      }
    } catch (e: any) {
      success = false;
      error = e.message;
    }
  }

  const record = {
    id: `tg_ch_test_${Date.now()}`,
    chatId: String(chatId),
    chatTitle: body.chatTitle || 'Telegram Group',
    challengeNumber: 99,
    problemId: body.problemId || 'two-sum',
    problemTitle: 'Two Sum (Test Verification)',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    slot: 'manual_test',
    scheduledAt: new Date().toISOString(),
    deliveredAt: success ? new Date().toISOString() : null,
    status: success ? 'sent' : 'failed',
    telegramMessageId: messageId,
    errorMessage: error || undefined
  };

  return res.status(200).json({ success, messageId, record, error });
}

