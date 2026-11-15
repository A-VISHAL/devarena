// Vercel Serverless Function: Discord Channels for Guild
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const guildId = (req.query.guildId as string) || 'default';
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (botToken && guildId !== 'default') {
    try {
      const discordRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
        headers: {
          Authorization: `Bot ${botToken}`,
          'User-Agent': 'DEVARENA-Bot (https://devarena.io, v2.0)'
        }
      });
      if (discordRes.ok) {
        const channels = await discordRes.json();
        const textChannels = channels
          .filter((c: any) => c.type === 0 || c.type === 5)
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            position: c.position
          }));
        return res.status(200).json({ channels: textChannels });
      }
    } catch { }
  }

  return res.status(200).json({
    channels: [
      { id: `${guildId}-daily-dsa`, name: 'daily-dsa', type: 0 },
      { id: `${guildId}-general`, name: 'general', type: 0 },
      { id: `${guildId}-announcements`, name: 'announcements', type: 5 },
      { id: `${guildId}-coding-lounge`, name: 'coding-lounge', type: 0 }
    ]
  });
}

