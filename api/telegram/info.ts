// Vercel Serverless Function: Telegram Bot Info & Installation Link
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'DEVARENA_CommunityBot';
  const botConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN);

  return res.status(200).json({
    botName: 'DEVARENA',
    username: botUsername,
    botLink: `https://t.me/${botUsername}`,
    installUrl: `https://t.me/${botUsername}?startgroup=true`,
    botConfigured
  });
}

