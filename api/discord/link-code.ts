// Vercel Serverless Function: Discord Account Link Code Generator
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

  const body = req.body || {};
  const userId = body.userId || 'guest';
  const username = body.username || 'Coder';
  const code = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;

  return res.status(200).json({
    code,
    userId,
    username,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    used: false
  });
}

