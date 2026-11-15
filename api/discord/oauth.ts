// Vercel Serverless Function: Discord OAuth Installation URL
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const clientId = process.env.DISCORD_CLIENT_ID || '1571437524746899537';
  const redirectUri = req.query.redirectUri as string;
  const baseUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=2147485696&scope=bot%20applications.commands`;

  let authUrl = baseUrl;
  let state = '';
  if (redirectUri) {
    state = Math.random().toString(36).substring(2, 15);
    authUrl = `${baseUrl}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
  }

  return res.status(200).json({ url: authUrl, state, clientId });
}

