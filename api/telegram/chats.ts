// Vercel Serverless Function: Telegram Groups Management
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Return groups (client stores actual groups in localStorage in mock mode)
  if (req.method === 'GET') {
    return res.status(200).json({
      chats: [],
      mode: 'client_persistent_storage'
    });
  }

  // POST: Acknowledge group save / update
  if (req.method === 'POST') {
    const chatData = req.body || {};
    const id = chatData.id || `tg_${chatData.chatId || Date.now()}`;
    const updated = {
      ...chatData,
      id,
      status: 'connected',
      connectedAt: chatData.connectedAt || new Date().toISOString()
    };
    return res.status(200).json({ success: true, chat: updated });
  }

  // DELETE: Acknowledge group disconnect
  if (req.method === 'DELETE') {
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

