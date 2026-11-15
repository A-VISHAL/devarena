// Vercel Serverless Function: Telegram Account Link Code Generator
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';

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

  const body = req.body || {};
  const userId = body.userId || 'guest';
  const username = body.username || 'Coder';
  const code = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'DEVARENA_CommunityBot';
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  return res.status(200).json({
    code,
    codeHash,
    userId,
    username,
    expiresAt,
    used: false,
    deepLink: `https://t.me/${botUsername}?start=link_${code}`
  });
}
