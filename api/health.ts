// Vercel Serverless Function: Health Check Endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const discordConfigured = Boolean(process.env.DISCORD_BOT_TOKEN);
  const telegramConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN);

  return res.status(200).json({
    status: 'healthy',
    app: 'DEVARENA Production Serverless Engine',
    version: '2.0.0',
    mode: 'serverless_stateless',
    database: 'none_mock_centralized',
    discordBotConfigured: discordConfigured,
    telegramBotConfigured: telegramConfigured,
    telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME || 'DEVARENA_CommunityBot',
    timestamp: new Date().toISOString()
  });
}

