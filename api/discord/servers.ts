// Vercel Serverless Function: Discord Connected Servers
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ servers: [] });
  }

  if (req.method === 'POST') {
    const serverData = req.body || {};
    const id = serverData.id || `srv_${serverData.guildId || Date.now()}`;
    const updated = {
      ...serverData,
      id,
      status: serverData.channelId ? 'connected' : 'config_required',
      connectedAt: serverData.connectedAt || new Date().toISOString()
    };
    return res.status(200).json({ success: true, server: updated });
  }

  if (req.method === 'DELETE') {
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

