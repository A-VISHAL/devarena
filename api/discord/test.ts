// Vercel Serverless Function: Dispatch Test Challenge to Discord
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

  const serverId = (req.query.serverId as string) || 'default';
  const body = req.body || {};
  const channelId = body.channelId;
  const payload = body.payload;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  let messageId = `msg_test_${Date.now()}`;
  let success = true;
  let error = null;

  if (botToken && channelId) {
    try {
      const resDiscord = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'DEVARENA-Bot (https://devarena.io, v2.0)'
        },
        body: JSON.stringify(payload)
      });
      if (resDiscord.ok) {
        const data = await resDiscord.json();
        messageId = data.id || messageId;
      } else {
        success = false;
        error = await resDiscord.json().catch(() => ({}));
      }
    } catch (e: any) {
      success = false;
      error = e.message;
    }
  }

  const record = {
    id: `ch_test_${Date.now()}`,
    serverId,
    guildName: body.guildName || 'Discord Server',
    channelId,
    channelName: body.channelName || 'general',
    challengeNumber: 99,
    problemId: body.problemId || 'two-sum',
    problemTitle: 'Two Sum (Test)',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    slot: 'manual_test',
    scheduledAt: new Date().toISOString(),
    deliveredAt: success ? new Date().toISOString() : null,
    status: success ? 'sent' : 'failed',
    messageId,
    errorMessage: error ? JSON.stringify(error) : undefined
  };

  return res.status(200).json({ success, messageId, record, error });
}

