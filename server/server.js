// DEVARENA Real-Time WebSocket & REST Relay Server with Discord Bot Integration
import http from 'http';
import https from 'https';

const PORT = process.env.PORT || 3001;

// Lightweight in-memory room store & results store
const rooms = new Map();
const resultsStore = new Map();

// Discord Integration In-Memory Datastores
const discordServers = new Map();
const discordHistory = [];
const discordLinkCodes = new Map();
const discordAccounts = new Map();

// Environment variables
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1307289547842621450';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || '';

// Seed problems for server-side scheduler
const SAMPLE_PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    input: 'nums = [2, 7, 11, 15], target = 9',
    output: '[0, 1]'
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack and Queue',
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    input: 's = "()[]{}"',
    output: 'true'
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray (Kadane)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description: 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.',
    input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
    output: '6'
  },
  {
    id: 'course-schedule',
    title: 'Course Schedule',
    difficulty: 'Medium',
    category: 'Graphs',
    description: 'There are a total of numCourses courses you have to take. Determine if it is possible for you to finish all courses (detect cycle in directed graph).',
    input: 'numCourses = 2, prerequisites = [[1, 0]]',
    output: 'true'
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Two Pointers',
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    input: 'height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]',
    output: '6'
  }
];

// Helper to make HTTPS requests to Discord API
function discordApiRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://discord.com/api/v10${path}`);
    const reqHeaders = {
      'User-Agent': 'DEVARENA-Bot (https://devarena.io, v2.0)',
      ...headers
    };

    if (DISCORD_BOT_TOKEN && !reqHeaders['Authorization']) {
      reqHeaders['Authorization'] = `Bot ${DISCORD_BOT_TOKEN}`;
    }

    if (data) {
      reqHeaders['Content-Type'] = 'application/json';
    }

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method,
      headers: reqHeaders
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: parsed });
          } else {
            resolve({ status: res.statusCode, error: parsed });
          }
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', err => reject(err));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Scheduled Challenge Runner (Every 60 Seconds)
async function runScheduledChallengesCheck() {
  const now = new Date();
  
  for (const [serverId, server] of discordServers.entries()) {
    if (!server.settings || !server.settings.enabled || !server.channelId) continue;

    try {
      const tz = server.settings.timezone || 'Asia/Kolkata';
      // Format current time in server's timezone
      const timeInTz = new Intl.DateTimeFormat('en-GB', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(now);

      const dateInTz = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz
      }).format(now); // YYYY-MM-DD

      const isMorning = server.settings.morningEnabled && timeInTz === server.settings.morningTime;
      const isEvening = server.settings.eveningEnabled && timeInTz === server.settings.eveningTime;

      if (!isMorning && !isEvening) continue;

      const slot = isMorning ? 'morning' : 'evening';

      // Idempotency: prevent duplicate delivery
      const alreadyDelivered = discordHistory.some(
        h => h.serverId === serverId && h.slot === slot && h.scheduledAt.startsWith(dateInTz) && h.status === 'sent'
      );

      if (alreadyDelivered) continue;

      // Select problem
      const p = SAMPLE_PROBLEMS[Math.floor(Math.random() * SAMPLE_PROBLEMS.length)];
      const challengeNum = Math.floor(Math.random() * 200) + 100;
      const greeting = isMorning ? '☀️ Good morning, developers!' : '🌙 Good evening, developers!';
      const solveUrl = `https://devarena.io/app/arena?problem=${p.id}`;

      const payload = {
        content: `${greeting} Today's challenge #${challengeNum} is live!\n**Can you solve it?** 🚀`,
        embeds: [
          {
            title: `DEVARENA DAILY CHALLENGE #${challengeNum}: ${p.title}`,
            url: solveUrl,
            description: `${p.description}\n\n👉 [**Solve on Code Arena**](${solveUrl})`,
            color: p.difficulty === 'Easy' ? 0x22C55E : p.difficulty === 'Medium' ? 0xF59E0B : 0xEF4444,
            fields: [
              { name: 'Difficulty', value: p.difficulty, inline: true },
              { name: 'Topic', value: p.category, inline: true },
              { name: 'Example', value: `\`${p.input}\` ➔ \`${p.output}\``, inline: false }
            ],
            footer: { text: 'DEVARENA • Challenge yourself. Beat your friends.' },
            timestamp: now.toISOString()
          }
        ]
      };

      // Deliver via Discord API or webhook
      let status = 'sent';
      let errorMsg = null;
      let msgId = `msg_${Date.now()}`;

      if (DISCORD_BOT_TOKEN) {
        const res = await discordApiRequest(`/channels/${server.channelId}/messages`, 'POST', payload);
        if (res.status >= 200 && res.status < 300) {
          msgId = res.data.id || msgId;
        } else {
          status = 'failed';
          errorMsg = JSON.stringify(res.error || res.status);
        }
      } else if (server.webhookUrl) {
        // Direct webhook delivery fallback
        try {
          const whUrl = new URL(server.webhookUrl);
          const req = https.request({
            hostname: whUrl.hostname,
            path: whUrl.pathname + whUrl.search,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          req.write(JSON.stringify(payload));
          req.end();
        } catch (e) {
          status = 'failed';
          errorMsg = e.message;
        }
      }

      const logRecord = {
        id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        serverId,
        guildName: server.guildName,
        channelId: server.channelId,
        channelName: server.channelName || 'announcements',
        challengeNumber: challengeNum,
        problemId: p.id,
        problemTitle: p.title,
        difficulty: p.difficulty,
        category: p.category,
        slot,
        scheduledAt: now.toISOString(),
        deliveredAt: status === 'sent' ? now.toISOString() : null,
        status,
        messageId: msgId,
        errorMessage: errorMsg
      };

      discordHistory.unshift(logRecord);
      server.lastChallengeSent = logRecord;
      console.log(`[DEVARENA Scheduler] Delivered ${slot} challenge to server ${server.guildName}`);
    } catch (err) {
      console.error(`[DEVARENA Scheduler] Error delivering to ${server.guildName}:`, err);
    }
  }
}

// Start scheduler interval (runs every 60s)
setInterval(runScheduledChallengesCheck, 60000);

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Signature-Ed25519, X-Signature-Timestamp');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Helper to parse JSON body
  const readJsonBody = () => {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (e) {
          reject(e);
        }
      });
      req.on('error', reject);
    });
  };

  // 1. Health
  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      app: 'DEVARENA Engine & Discord Relay',
      version: '2.0.0',
      connectedServers: discordServers.size,
      botConfigured: Boolean(DISCORD_BOT_TOKEN),
      uptime: process.uptime()
    }));
    return;
  }

  // 2. Discord OAuth URL
  if (url.pathname === '/api/discord/oauth/url' && req.method === 'GET') {
    const redirectUri = url.searchParams.get('redirectUri') || `http://${req.headers.host}/app/connect`;
    const state = Math.random().toString(36).substring(2, 15);
    const authUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=2147485696&scope=bot%20applications.commands&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ url: authUrl, state, clientId: DISCORD_CLIENT_ID }));
    return;
  }

  // 3. Discord Connected Servers (GET, POST, DELETE)
  if (url.pathname === '/api/discord/servers') {
    if (req.method === 'GET') {
      const userId = url.searchParams.get('userId') || 'guest';
      const userServers = Array.from(discordServers.values()).filter(
        s => s.userId === userId || s.userId === 'guest'
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ servers: userServers }));
      return;
    }

    if (req.method === 'POST') {
      readJsonBody().then(serverData => {
        if (!serverData.id && !serverData.guildId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing guild id' }));
          return;
        }

        const id = serverData.id || `srv_${serverData.guildId}`;
        const existing = discordServers.get(id) || {};
        const updated = {
          ...existing,
          ...serverData,
          id,
          userId: serverData.userId || 'guest',
          status: serverData.channelId ? 'connected' : 'config_required',
          connectedAt: existing.connectedAt || new Date().toISOString()
        };

        discordServers.set(id, updated);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, server: updated }));
      }).catch(err => {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid payload' }));
      });
      return;
    }

    if (req.method === 'DELETE') {
      const serverId = url.searchParams.get('serverId');
      if (serverId && discordServers.has(serverId)) {
        discordServers.delete(serverId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server not found' }));
      }
      return;
    }
  }

  // 4. Discord Channels for Guild
  if (url.pathname.match(/^\/api\/discord\/servers\/([^/]+)\/channels$/) && req.method === 'GET') {
    const guildId = url.pathname.split('/')[4];
    
    // If live bot token exists, fetch real guild channels from Discord API
    if (DISCORD_BOT_TOKEN) {
      discordApiRequest(`/guilds/${guildId}/channels`).then(result => {
        if (result.status === 200 && Array.isArray(result.data)) {
          // Filter text channels (0) and announcement channels (5)
          const textChannels = result.data
            .filter(c => c.type === 0 || c.type === 5)
            .map(c => ({
              id: c.id,
              name: c.name,
              type: c.type,
              position: c.position
            }));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ channels: textChannels }));
        } else {
          // Fallback to sample channels
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            channels: [
              { id: `${guildId}-daily-dsa`, name: 'daily-dsa', type: 0 },
              { id: `${guildId}-general`, name: 'general', type: 0 },
              { id: `${guildId}-announcements`, name: 'announcements', type: 5 },
              { id: `${guildId}-coding-lounge`, name: 'coding-lounge', type: 0 }
            ]
          }));
        }
      }).catch(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          channels: [
            { id: `${guildId}-daily-dsa`, name: 'daily-dsa', type: 0 },
            { id: `${guildId}-general`, name: 'general', type: 0 }
          ]
        }));
      });
      return;
    }

    // Default channels when bot token is not yet provided
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      channels: [
        { id: `${guildId}-daily-dsa`, name: 'daily-dsa', type: 0 },
        { id: `${guildId}-general`, name: 'general', type: 0 },
        { id: `${guildId}-announcements`, name: 'announcements', type: 5 },
        { id: `${guildId}-coding-lounge`, name: 'coding-lounge', type: 0 }
      ]
    }));
    return;
  }

  // 5. Send Test Challenge to Channel
  if (url.pathname.match(/^\/api\/discord\/servers\/([^/]+)\/test$/) && req.method === 'POST') {
    const serverId = url.pathname.split('/')[4];
    readJsonBody().then(async testBody => {
      const channelId = testBody.channelId;
      const payload = testBody.payload;
      let messageId = `test_msg_${Date.now()}`;
      let success = true;
      let error = null;

      if (DISCORD_BOT_TOKEN && channelId) {
        const result = await discordApiRequest(`/channels/${channelId}/messages`, 'POST', payload);
        if (result.status >= 200 && result.status < 300) {
          messageId = result.data.id || messageId;
        } else {
          success = false;
          error = result.error;
        }
      }

      const record = {
        id: `ch_test_${Date.now()}`,
        serverId,
        guildName: testBody.guildName || 'Discord Server',
        channelId,
        channelName: testBody.channelName || 'general',
        challengeNumber: 99,
        problemId: testBody.problemId || 'two-sum',
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

      discordHistory.unshift(record);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success, messageId, record, error }));
    }).catch(err => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // 6. Challenge History
  if (url.pathname === '/api/discord/challenges' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ history: discordHistory.slice(0, 50) }));
    return;
  }

  // 7. Account Linking Code (/link)
  if (url.pathname === '/api/discord/link-code') {
    if (req.method === 'POST') {
      readJsonBody().then(body => {
        const userId = body.userId || 'guest';
        const username = body.username || 'Guest';
        const code = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
        const linkObj = {
          code,
          userId,
          username,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          used: false
        };
        discordLinkCodes.set(code, linkObj);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(linkObj));
      }).catch(err => {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });
      return;
    }
  }

  // 8. Discord Webhook Slash Commands & Interactions Handler
  if (url.pathname === '/api/discord/interactions' && req.method === 'POST') {
    readJsonBody().then(interaction => {
      // Type 1: PING (Discord endpoint verification)
      if (interaction.type === 1) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ type: 1 }));
        return;
      }

      // Type 2: APPLICATION_COMMAND
      if (interaction.type === 2) {
        const commandName = interaction.data?.name;
        const callerUser = interaction.user || interaction.member?.user || { username: 'Developer' };

        // Handle slash commands
        if (commandName === 'help') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            type: 4,
            data: {
              embeds: [
                {
                  title: '⚔️ DEVARENA Discord Bot Commands',
                  description: 'Welcome to DEVARENA, the social DSA battle & daily coding challenge platform.',
                  color: 0x00E5FF,
                  fields: [
                    { name: '/daily', value: "View today's active coding challenges", inline: true },
                    { name: '/challenge', value: 'Request a DSA problem directly in chat', inline: true },
                    { name: '/leaderboard', value: 'View top global coders and Elo ratings', inline: true },
                    { name: '/profile', value: 'Show linked developer profile & achievements', inline: true },
                    { name: '/streak', value: 'Check your current learning streak', inline: true },
                    { name: '/link <code>', value: 'Link your Discord tag to your DEVARENA account', inline: true }
                  ],
                  footer: { text: 'DEVARENA • Connect your server at https://devarena.io/app/connect' }
                }
              ]
            }
          }));
          return;
        }

        if (commandName === 'daily' || commandName === 'challenge') {
          const p = SAMPLE_PROBLEMS[Math.floor(Math.random() * SAMPLE_PROBLEMS.length)];
          const solveUrl = `https://devarena.io/app/arena?problem=${p.id}`;

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            type: 4,
            data: {
              content: `🎯 **Today's Featured Challenge for ${callerUser.username}:**`,
              embeds: [
                {
                  title: `${p.title} (${p.difficulty})`,
                  url: solveUrl,
                  description: p.description,
                  color: p.difficulty === 'Easy' ? 0x22C55E : 0xF59E0B,
                  fields: [
                    { name: 'Topic', value: p.category, inline: true },
                    { name: 'Example', value: `Input: \`${p.input}\`\nOutput: \`${p.output}\``, inline: false }
                  ],
                  footer: { text: 'Solve it now on Code Arena!' }
                }
              ],
              components: [
                {
                  type: 1,
                  components: [
                    { type: 2, style: 5, label: 'Solve on DEVARENA', url: solveUrl }
                  ]
                }
              ]
            }
          }));
          return;
        }

        if (commandName === 'leaderboard') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            type: 4,
            data: {
              embeds: [
                {
                  title: '🏆 DEVARENA Global Top Coders',
                  color: 0xFFAD42,
                  description: '1. 🥇 **Chen Wei** — 2240 Elo (420 Solved)\n2. 🥈 **Sarah Connor** — 2150 Elo (310 Solved)\n3. 🥉 **Vishal Kumar** — 1980 Elo (142 Solved)\n4. **Elena Vance** — 1890 Elo (165 Solved)\n5. **Alex Algo** — 1720 Elo (88 Solved)',
                  footer: { text: 'Climb the ranks at https://devarena.io/app/leaderboard' }
                }
              ]
            }
          }));
          return;
        }

        if (commandName === 'link') {
          const codeOption = interaction.data?.options?.find(o => o.name === 'code')?.value;
          if (codeOption && discordLinkCodes.has(codeOption)) {
            const linkData = discordLinkCodes.get(codeOption);
            linkData.used = true;
            discordAccounts.set(callerUser.id, {
              userId: linkData.userId,
              discordUser: callerUser,
              linkedAt: new Date().toISOString()
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              type: 4,
              data: {
                content: `✅ **Account Successfully Linked!**\nDiscord user **${callerUser.username}** is now paired with DEVARENA account **${linkData.username}**.`
              }
            }));
            return;
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            type: 4,
            data: {
              content: '❌ **Invalid or expired link code.**\nPlease generate a new code from https://devarena.io/app/connect and execute `/link <code>` within 15 minutes.'
            }
          }));
          return;
        }

        // Generic fallback response for other commands
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          type: 4,
          data: {
            content: `Hello ${callerUser.username}! Your command \`/${commandName}\` was executed on DEVARENA.`
          }
        }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Unhandled interaction type' }));
    }).catch(err => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // 9. Manual Cron Trigger (/api/discord/cron)
  if (url.pathname === '/api/discord/cron') {
    runScheduledChallengesCheck().then(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, timestamp: new Date().toISOString() }));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // 10. Existing Results & Rooms Endpoints
  if (url.pathname === '/api/rooms' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ rooms: Array.from(rooms.keys()) }));
    return;
  }

  if (url.pathname === '/api/results' && req.method === 'POST') {
    readJsonBody().then(data => {
      if (data && data.id) {
        resultsStore.set(data.id, data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, id: data.id }));
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing result id' }));
      }
    }).catch(() => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
    });
    return;
  }

  if (url.pathname.startsWith('/api/results/') && req.method === 'GET') {
    const resultId = url.pathname.replace('/api/results/', '');
    const data = resultsStore.get(resultId);
    if (data) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Result not found' }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`[DEVARENA] Real-Time Relay & Discord Engine running on port ${PORT}`);
});
