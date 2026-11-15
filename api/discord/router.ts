// Vercel Serverless Function: Consolidated Discord API Router
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract subpath from rewrite query or direct url
  const rawSubpath = (req.query.subpath as string) || '';
  const urlPath = req.url?.split('?')[0].replace(/^\/api\/discord\/?/, '') || '';
  const subpath = rawSubpath || urlPath;
  const pathParts = subpath.split('/').filter(Boolean);

  const route = pathParts[0] || '';

  // 1. OAuth installation URL generator (/api/discord/oauth or /api/discord/oauth/url)
  if (route === 'oauth') {
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

  // 2. Guild Channels (/api/discord/servers/:guildId/channels or /api/discord/channels)
  if ((route === 'servers' && pathParts[2] === 'channels') || route === 'channels') {
    const guildId = (route === 'servers' ? pathParts[1] : (req.query.guildId as string)) || 'default';
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

  // 3. Test Challenge Dispatch (/api/discord/servers/:serverId/test or /api/discord/test)
  if ((route === 'servers' && pathParts[2] === 'test') || route === 'test') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const serverId = (route === 'servers' ? pathParts[1] : (req.query.serverId as string)) || 'default';
    const body = req.body || {};
    const channelId = body.channelId;
    const payload = body.payload;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    let messageId = `msg_test_${Date.now()}`;
    let success = true;
    let error: any = null;

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

    return res.status(200).json({
      success,
      serverId,
      messageId,
      error,
      deliveredAt: new Date().toISOString()
    });
  }

  // 4. Verify Server by Guild ID (/api/discord/servers/verify or /api/discord/verify)
  if ((route === 'servers' && pathParts[1] === 'verify') || route === 'verify') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const guildId = req.body?.guildId || req.query.guildId;
    if (!guildId) {
      return res.status(400).json({ error: 'Missing guildId' });
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;
    let guildName = `Discord Guild (${guildId})`;
    let guildIcon: string | null = null;
    let memberCount = 25;

    if (botToken) {
      try {
        const gRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
          headers: {
            Authorization: `Bot ${botToken}`,
            'User-Agent': 'DEVARENA-Bot (https://devarena.io, v2.0)'
          }
        });
        if (gRes.ok) {
          const gData = await gRes.json();
          guildName = gData.name || guildName;
          guildIcon = gData.icon ? `https://cdn.discordapp.com/icons/${guildId}/${gData.icon}.png` : null;
          memberCount = gData.approximate_member_count || memberCount;
        }
      } catch { }
    }

    const newServer = {
      id: `srv_${guildId}`,
      userId: req.body?.userId || 'guest',
      guildId: String(guildId),
      guildName,
      guildIcon,
      memberCount,
      channelId: null,
      channelName: null,
      status: 'connected',
      settings: {
        enabled: true,
        timezone: 'Asia/Kolkata',
        morningEnabled: true,
        morningTime: '09:00',
        eveningEnabled: true,
        eveningTime: '18:00',
        difficulty: 'Mixed',
        topics: ['Arrays', 'Strings', 'Dynamic Programming', 'Trees']
      },
      lastChallengeSent: null,
      connectedAt: new Date().toISOString(),
      isDemo: false
    };

    return res.status(200).json({
      success: true,
      server: newServer,
      message: 'Discord server verified successfully'
    });
  }

  // 5. Connected Servers CRUD (/api/discord/servers)
  if (route === 'servers') {
    if (req.method === 'GET') {
      const botToken = process.env.DISCORD_BOT_TOKEN;
      let liveServers: any[] = [];

      // Query live guilds that DEVARENA bot is installed in
      if (botToken) {
        try {
          const guildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: {
              Authorization: `Bot ${botToken}`,
              'User-Agent': 'DEVARENA-Bot (https://devarena.io, v2.0)'
            }
          });
          if (guildsRes.ok) {
            const guilds = await guildsRes.json();
            if (Array.isArray(guilds)) {
              liveServers = guilds.map((g: any) => ({
                id: `srv_${g.id}`,
                userId: (req.query.userId as string) || 'guest',
                guildId: g.id,
                guildName: g.name,
                guildIcon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
                memberCount: 28,
                channelId: null,
                channelName: null,
                status: 'connected',
                settings: {
                  enabled: true,
                  timezone: 'Asia/Kolkata',
                  morningEnabled: true,
                  morningTime: '09:00',
                  eveningEnabled: true,
                  eveningTime: '18:00',
                  difficulty: 'Mixed',
                  topics: ['Arrays', 'Strings', 'Dynamic Programming', 'Trees']
                },
                lastChallengeSent: null,
                connectedAt: new Date().toISOString(),
                isDemo: false
              }));
            }
          }
        } catch (e) {
          console.error('Error fetching Discord bot guilds:', e);
        }
      }

      return res.status(200).json({ servers: liveServers });
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
  }

  // 6. Challenge History (/api/discord/challenges)
  if (route === 'challenges') {
    return res.status(200).json({ history: [] });
  }

  // 7. Account Link Code Generator (/api/discord/link-code)
  if (route === 'link-code') {
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

  return res.status(404).json({ error: 'Not found', route: subpath });
}
