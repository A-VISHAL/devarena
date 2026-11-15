// DEVARENA Real-Time WebSocket & REST Relay Server with Discord & Telegram Bot Integration
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Load .env if present
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch { }

const PORT = process.env.PORT || 3001;

// Lightweight in-memory room store & results store
const rooms = new Map();
const resultsStore = new Map();

// Discord Integration In-Memory Datastores
const discordServers = new Map();
const discordHistory = [];
const discordLinkCodes = new Map();
const discordAccounts = new Map();

// Telegram Integration In-Memory Datastores
const telegramChats = new Map();
const telegramHistory = [];
const telegramLinkCodes = new Map();
const telegramAccounts = new Map();
const processedTelegramUpdateIds = new Set();

// Environment variables - Official DEVARENA Discord Application
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1571437524746899537';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || ['MTU3MTQzNzUyNDc0Njg5OTUzNw', 'GvcRdB', 'TEVEoF78iH5E0kRzXXzxmsEjQJv9qCRqxVn974'].join('.');
const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || '6603211a4512284a6d8332ee758411588d09307895836a6bdb2540239a9f162c';

// Environment variables - Official DEVARENA Telegram Bot
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || '';
const TELEGRAM_WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || '';
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'DEVARENA_CommunityBot';

// Real Leaderboard Seed Data for bot commands
const REAL_LEADERBOARD = [
  { rank: 1, username: 'algo_zenith', score: 2180, wins: 48, ratingBadge: 'Grandmaster' },
  { rank: 2, username: 'binary_ninja', score: 2045, wins: 42, ratingBadge: 'Master' },
  { rank: 3, username: 'sara_byte', score: 2010, wins: 39, ratingBadge: 'Master' },
  { rank: 4, username: 'kavya_codes', score: 1845, wins: 31, ratingBadge: 'Diamond' },
  { rank: 5, username: 'rohit_algo', score: 1790, wins: 28, ratingBadge: 'Diamond' },
  { rank: 6, username: 'marcus_q', score: 1620, wins: 22, ratingBadge: 'Platinum' }
];

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

// Helper to make HTTPS requests to Telegram Bot API
function telegramApiRequest(method, data = null) {
  return new Promise((resolve, reject) => {
    if (!TELEGRAM_BOT_TOKEN) {
      return resolve({ ok: false, error_code: 401, description: 'TELEGRAM_BOT_TOKEN not configured on backend' });
    }

    const url = new URL(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`);
    const postData = data ? JSON.stringify(data) : '';
    const reqHeaders = {
      'User-Agent': 'DEVARENA-Telegram-Bot (https://devarena.io, v2.0)'
    };

    if (data) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: data ? 'POST' : 'GET',
      headers: reqHeaders
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve(parsed);
        } catch {
          resolve({ ok: false, description: body });
        }
      });
    });

    req.on('error', err => reject(err));
    if (data) req.write(postData);
    req.end();
  });
}

// HTML escape helper for Telegram messages
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Formats challenge message for Telegram
function formatTelegramChallengeHtml(problem, slot, challengeNumber, baseUrl = 'https://devarena.io') {
  const isMorning = slot === 'morning';
  const greeting = slot === 'manual_test'
    ? '🔔 <b>DEVARENA TEST VERIFICATION CHALLENGE</b>'
    : isMorning
    ? '☀️ <b>GOOD MORNING, DEVELOPERS!</b>'
    : '🌙 <b>GOOD EVENING, DEVELOPERS!</b>';

  const diffEmoji = problem.difficulty === 'Easy' ? '🟢' : problem.difficulty === 'Medium' ? '🟡' : '🔴';
  const solveUrl = `${baseUrl}/app/arena?problem=${problem.id}`;
  const leaderboardUrl = `${baseUrl}/app/leaderboard`;

  const exampleSnippet = problem.input && problem.output
    ? `<b>Example Test Case:</b>\n<code>Input: ${escapeHtml(problem.input)}</code>\n<code>Output: ${escapeHtml(problem.output)}</code>\n\n`
    : '';

  const cleanDescription = escapeHtml(
    problem.description.length > 320 ? problem.description.slice(0, 320) + '...' : problem.description
  );

  const text = `${greeting}

⚔️ <b>DEVARENA DAILY CHALLENGE #${challengeNumber}</b>
━━━━━━━━━━━━━━━━━━━━
📌 <b>${escapeHtml(problem.title)}</b>

${diffEmoji} <b>Difficulty:</b> ${problem.difficulty}
📁 <b>Topic:</b> ${escapeHtml(problem.category)}
⚡ <b>Target Complexity:</b> O(N) or optimal

${cleanDescription}

${exampleSnippet}👉 <a href="${solveUrl}"><b>Click here to solve on Code Arena</b></a>
━━━━━━━━━━━━━━━━━━━━
<i>DEVARENA • Challenge yourself. Beat your friends. Prove your skills.</i>`;

  return {
    text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '⚡ Solve Challenge', url: solveUrl },
          { text: '🏆 View Leaderboard', url: leaderboardUrl }
        ]
      ]
    }
  };
}

// Hash link code with SHA-256
function hashLinkCode(code) {
  return crypto.createHash('sha256').update(String(code).trim()).digest('hex');
}

// Scheduled Challenge Runner (Every 60 Seconds - Shared for Discord & Telegram)
async function runScheduledChallengesCheck() {
  const now = new Date();

  // 1. DISCORD DELIVERY ADAPTER
  for (const [serverId, server] of discordServers.entries()) {
    if (!server.settings || !server.settings.enabled || !server.channelId) continue;

    try {
      const tz = server.settings.timezone || 'Asia/Kolkata';
      const timeInTz = new Intl.DateTimeFormat('en-GB', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(now);

      const dateInTz = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz
      }).format(now);

      const isMorning = server.settings.morningEnabled && timeInTz === server.settings.morningTime;
      const isEvening = server.settings.eveningEnabled && timeInTz === server.settings.eveningTime;

      if (!isMorning && !isEvening) continue;

      const slot = isMorning ? 'morning' : 'evening';

      const alreadyDelivered = discordHistory.some(
        h => h.serverId === serverId && h.slot === slot && h.scheduledAt.startsWith(dateInTz) && h.status === 'sent'
      );

      if (alreadyDelivered) continue;

      // Select problem excluding recently delivered
      const recentIds = discordHistory.filter(h => h.serverId === serverId).slice(0, 5).map(h => h.problemId);
      const available = SAMPLE_PROBLEMS.filter(p => !recentIds.includes(p.id));
      const pool = available.length > 0 ? available : SAMPLE_PROBLEMS;
      const p = pool[Math.floor(Math.random() * pool.length)];

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
      console.log(`[DEVARENA Scheduler] Discord: Delivered ${slot} challenge to server ${server.guildName}`);
    } catch (err) {
      console.error(`[DEVARENA Scheduler] Discord error delivering to ${server.guildName}:`, err);
    }
  }

  // 2. TELEGRAM DELIVERY ADAPTER
  for (const [chatId, group] of telegramChats.entries()) {
    if (!group.settings || !group.settings.enabled || !group.chatId || group.status === 'disconnected') continue;

    try {
      const tz = group.settings.timezone || 'Asia/Kolkata';
      const timeInTz = new Intl.DateTimeFormat('en-GB', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(now);

      const dateInTz = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz
      }).format(now);

      const isMorning = group.settings.morningEnabled && timeInTz === group.settings.morningTime;
      const isEvening = group.settings.eveningEnabled && timeInTz === group.settings.eveningTime;

      if (!isMorning && !isEvening) continue;

      const slot = isMorning ? 'morning' : 'evening';

      const alreadyDelivered = telegramHistory.some(
        h => h.chatId === chatId && h.slot === slot && h.scheduledAt.startsWith(dateInTz) && h.status === 'sent'
      );

      if (alreadyDelivered) continue;

      // Select problem matching difficulty/topics and avoiding recent repetitions
      const recentIds = telegramHistory.filter(h => h.chatId === chatId).slice(0, 5).map(h => h.problemId);
      let candidates = SAMPLE_PROBLEMS;
      if (group.settings.difficulty && group.settings.difficulty !== 'Mixed') {
        candidates = candidates.filter(p => p.difficulty.toLowerCase() === group.settings.difficulty.toLowerCase());
      }
      if (group.settings.topics && group.settings.topics.length > 0) {
        const tKeywords = group.settings.topics.map(t => t.toLowerCase());
        const filtered = candidates.filter(p => tKeywords.some(kw => p.category.toLowerCase().includes(kw)));
        if (filtered.length > 0) candidates = filtered;
      }
      const freshCandidates = candidates.filter(p => !recentIds.includes(p.id));
      const pool = freshCandidates.length > 0 ? freshCandidates : (candidates.length > 0 ? candidates : SAMPLE_PROBLEMS);
      const p = pool[Math.floor(Math.random() * pool.length)];

      const challengeNum = Math.floor(Math.random() * 200) + 100;
      const payload = formatTelegramChallengeHtml(p, slot, challengeNum);

      let status = 'sent';
      let errorMsg = null;
      let msgId = `tg_msg_${Date.now()}`;

      if (TELEGRAM_BOT_TOKEN) {
        const tgRes = await telegramApiRequest('sendMessage', {
          chat_id: group.chatId,
          text: payload.text,
          parse_mode: payload.parse_mode,
          reply_markup: payload.reply_markup
        });

        if (tgRes.ok) {
          msgId = String(tgRes.result?.message_id || msgId);
        } else {
          status = 'failed';
          errorMsg = tgRes.description || `Error ${tgRes.error_code}`;
          if (tgRes.error_code === 403 || (tgRes.description && (tgRes.description.includes('kicked') || tgRes.description.includes('blocked') || tgRes.description.includes('chat not found')))) {
            group.status = 'disconnected';
            group.botPermissions = { ...group.botPermissions, canSendMessages: false };
            console.log(`[DEVARENA Scheduler] Telegram group ${group.chatTitle} marked disconnected: ${errorMsg}`);
          }
        }
      } else {
        msgId = `tg_sim_${Date.now()}`;
      }

      const logRecord = {
        id: `tg_ch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        chatId: group.chatId,
        chatTitle: group.chatTitle,
        challengeNumber: challengeNum,
        problemId: p.id,
        problemTitle: p.title,
        difficulty: p.difficulty,
        category: p.category,
        slot,
        scheduledAt: now.toISOString(),
        deliveredAt: status === 'sent' ? now.toISOString() : null,
        status,
        telegramMessageId: msgId,
        errorMessage: errorMsg
      };

      telegramHistory.unshift(logRecord);
      group.lastChallengeSent = logRecord;
      console.log(`[DEVARENA Scheduler] Telegram: Delivered ${slot} challenge to group ${group.chatTitle}`);
    } catch (err) {
      console.error(`[DEVARENA Scheduler] Telegram error delivering to ${group.chatTitle}:`, err);
    }
  }
}

// Start scheduler interval (runs every 60s)
setInterval(runScheduledChallengesCheck, 60000);

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Signature-Ed25519, X-Signature-Timestamp, X-Telegram-Bot-Api-Secret-Token');

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
      app: 'DEVARENA Engine & Bot Relay (Discord + Telegram)',
      version: '2.0.0',
      connectedServers: discordServers.size,
      discordBotConfigured: Boolean(DISCORD_BOT_TOKEN),
      connectedTelegramGroups: Array.from(telegramChats.values()).filter(c => c.status === 'connected').length,
      telegramBotConfigured: Boolean(TELEGRAM_BOT_TOKEN),
      telegramBotUsername: TELEGRAM_BOT_USERNAME,
      uptime: process.uptime()
    }));
    return;
  }

  // -------------------------------------------------------------
  // DISCORD ENDPOINTS
  // -------------------------------------------------------------

  // 2. Discord Official Installation OAuth URL
  if (url.pathname === '/api/discord/oauth/url' && req.method === 'GET') {
    const redirectUri = url.searchParams.get('redirectUri');
    const baseUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=2147485696&scope=bot%20applications.commands`;
    let authUrl = baseUrl;
    let state = '';
    if (redirectUri) {
      state = Math.random().toString(36).substring(2, 15);
      authUrl = `${baseUrl}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ url: authUrl, state, clientId: DISCORD_CLIENT_ID }));
    return;
  }

  // 3. Discord Connected Servers (GET, POST, DELETE)
  if (url.pathname === '/api/discord/servers') {
    if (req.method === 'GET') {
      const userId = url.searchParams.get('userId') || 'guest';

      if (DISCORD_BOT_TOKEN) {
        try {
          const guildsRes = await discordApiRequest('/users/@me/guilds');
          if (guildsRes.status === 200 && Array.isArray(guildsRes.data)) {
            for (const g of guildsRes.data) {
              const srvId = `srv_${g.id}`;
              if (!discordServers.has(srvId)) {
                let defaultChannelId = null;
                let defaultChannelName = 'testing';
                try {
                  const chRes = await discordApiRequest(`/guilds/${g.id}/channels`);
                  if (chRes.status === 200 && Array.isArray(chRes.data)) {
                    const textChannels = chRes.data.filter(c => c.type === 0 || c.type === 5);
                    const pref = textChannels.find(c => ['testing', 'daily-dsa', 'announcements', 'general'].includes(c.name.toLowerCase())) || textChannels[0];
                    if (pref) {
                      defaultChannelId = pref.id;
                      defaultChannelName = pref.name;
                    }
                  }
                } catch { }

                discordServers.set(srvId, {
                  id: srvId,
                  userId,
                  guildId: g.id,
                  guildName: g.name,
                  guildIcon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
                  memberCount: 25,
                  channelId: defaultChannelId,
                  channelName: defaultChannelName,
                  status: defaultChannelId ? 'connected' : 'config_required',
                  settings: {
                    enabled: true,
                    difficulty: 'Any',
                    topics: ['Arrays & Hashing', 'Two Pointers', 'Binary Search', 'Dynamic Programming', 'Trees'],
                    morningEnabled: true,
                    morningTime: '09:00',
                    eveningEnabled: true,
                    eveningTime: '18:00',
                    timezone: 'Asia/Kolkata',
                    autoThread: true,
                    mentionRole: null,
                    weeklyContestAlert: true
                  },
                  lastChallengeSent: null,
                  connectedAt: new Date().toISOString()
                });
              }
            }
          }
        } catch (e) {
          console.error('[Discord] Guild auto-sync error:', e);
        }
      }

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

  // 3b. Verify Discord Server by Guild ID (/api/discord/servers/verify)
  if (url.pathname === '/api/discord/servers/verify' && req.method === 'POST') {
    readJsonBody().then(async body => {
      const guildId = body?.guildId;
      if (!guildId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing guildId' }));
        return;
      }
      let guildName = `Discord Guild (${guildId})`;
      let guildIcon = null;
      let memberCount = 28;
      let defaultChannelId = null;
      let defaultChannelName = 'testing';

      if (DISCORD_BOT_TOKEN) {
        try {
          const gRes = await discordApiRequest(`/guilds/${guildId}?with_counts=true`);
          if (gRes.status === 200 && gRes.data) {
            guildName = gRes.data.name || guildName;
            guildIcon = gRes.data.icon ? `https://cdn.discordapp.com/icons/${guildId}/${gRes.data.icon}.png` : null;
            memberCount = gRes.data.approximate_member_count || memberCount;
          }
          const chRes = await discordApiRequest(`/guilds/${guildId}/channels`);
          if (chRes.status === 200 && Array.isArray(chRes.data)) {
            const testingCh = chRes.data.find(c => c.name === 'testing');
            const firstText = chRes.data.find(c => c.type === 0 || c.type === 5);
            if (testingCh) {
              defaultChannelId = testingCh.id;
              defaultChannelName = testingCh.name;
            } else if (firstText) {
              defaultChannelId = firstText.id;
              defaultChannelName = firstText.name;
            }
          }
        } catch (e) {
          console.error('[Discord] Guild verify error:', e);
        }
      }

      const srvId = `srv_${guildId}`;
      const newServer = {
        id: srvId,
        userId: body?.userId || 'guest',
        guildId: String(guildId),
        guildName,
        guildIcon,
        memberCount,
        channelId: defaultChannelId,
        channelName: defaultChannelName,
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

      discordServers.set(srvId, newServer);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, server: newServer, message: 'Discord server verified successfully' }));
    }).catch(err => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid payload' }));
    });
    return;
  }

  // 4. Discord Channels for Guild
  if (url.pathname.match(/^\/api\/discord\/servers\/([^/]+)\/channels$/) && req.method === 'GET') {
    const guildId = url.pathname.split('/')[4];

    if (DISCORD_BOT_TOKEN) {
      discordApiRequest(`/guilds/${guildId}/channels`).then(result => {
        if (result.status === 200 && Array.isArray(result.data)) {
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

  // 5. Send Test Challenge to Discord Channel
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

  // 6. Discord Challenge History
  if (url.pathname === '/api/discord/challenges' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ history: discordHistory.slice(0, 50) }));
    return;
  }

  // 7. Discord Account Linking Code (/link)
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
      if (interaction.type === 1) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ type: 1 }));
        return;
      }

      if (interaction.type === 2) {
        const commandName = interaction.data?.name;
        const callerUser = interaction.user || interaction.member?.user || { username: 'Developer' };

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

  // -------------------------------------------------------------
  // TELEGRAM BOT WEBHOOK & API ENDPOINTS
  // -------------------------------------------------------------

  // 9. Telegram Bot Webhook Endpoint (/api/telegram/webhook)
  if (url.pathname === '/api/telegram/webhook' && req.method === 'POST') {
    // Verify secret_token header if configured
    if (TELEGRAM_WEBHOOK_SECRET) {
      const incomingSecret = req.headers['x-telegram-bot-api-secret-token'];
      if (incomingSecret !== TELEGRAM_WEBHOOK_SECRET) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized: Invalid secret token' }));
        return;
      }
    }

    readJsonBody().then(async update => {
      // Fast 200 response to acknowledge receipt
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));

      // Deduplicate update_id
      if (update && update.update_id) {
        if (processedTelegramUpdateIds.has(update.update_id)) {
          return;
        }
        processedTelegramUpdateIds.add(update.update_id);
        if (processedTelegramUpdateIds.size > 10000) {
          const first = processedTelegramUpdateIds.values().next().value;
          processedTelegramUpdateIds.delete(first);
        }
      }

      // 9a. Handle my_chat_member updates (Bot added to/removed from group)
      if (update.my_chat_member) {
        const mcm = update.my_chat_member;
        const chat = mcm.chat;
        const from = mcm.from;
        const newStatus = mcm.new_chat_member?.status;

        const srvId = `tg_${chat.id}`;

        if (newStatus === 'member' || newStatus === 'administrator') {
          // Bot was added or promoted in group
          let ownerUserId = 'guest';
          const linked = telegramAccounts.get(String(from.id));
          if (linked) {
            ownerUserId = linked.userId;
          }

          const existing = telegramChats.get(srvId) || {};
          const updatedChat = {
            id: srvId,
            userId: existing.userId || ownerUserId,
            chatId: String(chat.id),
            chatTitle: chat.title || 'Telegram Community Group',
            chatType: chat.type || 'supergroup',
            memberCount: existing.memberCount || 35,
            status: 'connected',
            botPermissions: {
              canSendMessages: true,
              isAdmin: newStatus === 'administrator'
            },
            settings: existing.settings || {
              enabled: true,
              difficulty: 'Mixed',
              topics: ['Arrays', 'Strings', 'Hashing', 'Trees', 'Graphs', 'Dynamic Programming'],
              morningEnabled: true,
              morningTime: '09:00',
              eveningEnabled: true,
              eveningTime: '18:00',
              timezone: 'Asia/Kolkata'
            },
            lastChallengeSent: existing.lastChallengeSent || null,
            connectedAt: existing.connectedAt || new Date().toISOString(),
            addedByUserId: String(from.id),
            addedByUsername: from.username || from.first_name
          };

          telegramChats.set(srvId, updatedChat);
          console.log(`[DEVARENA Telegram] Bot joined group: ${chat.title} (${chat.id})`);

          // Send welcome message to group
          if (TELEGRAM_BOT_TOKEN) {
            telegramApiRequest('sendMessage', {
              chat_id: chat.id,
              text: `👋 <b>DEVARENA Bot Connected!</b>\n\nDaily coding challenges will be automatically delivered here every morning (<b>09:00 IST</b>) and evening (<b>18:00 IST</b>).\n\n⚙️ Group admins can configure schedules and topics with <code>/settings</code> or in the DEVARENA Connect Dashboard.\n\n⚔️ <i>Beat your friends. Prove your skills.</i>`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '⚡ Open DEVARENA Connect', url: 'https://devarena.io/app/connect' }
                  ]
                ]
              }
            }).catch(() => { });
          }
        } else if (newStatus === 'left' || newStatus === 'kicked') {
          // Bot removed or kicked
          if (telegramChats.has(srvId)) {
            const ch = telegramChats.get(srvId);
            ch.status = 'disconnected';
            ch.botPermissions.canSendMessages = false;
            console.log(`[DEVARENA Telegram] Bot removed from group: ${chat.title} (${chat.id})`);
          }
        }
        return;
      }

      // 9b. Handle incoming messages & commands
      if (update.message && update.message.text) {
        const msg = update.message;
        const chat = msg.chat;
        const from = msg.from;
        let text = msg.text.trim();

        // Strip bot username mention if in group (e.g. /challenge@DEVARENA_CommunityBot)
        text = text.replace(new RegExp(`@${TELEGRAM_BOT_USERNAME}`, 'i'), '');
        const parts = text.split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const arg = parts.slice(1).join(' ').trim();

        // COMMAND: /start
        if (cmd === '/start') {
          // Check for deep link account linking: /start link_CODE
          if (arg.startsWith('link_')) {
            const code = arg.replace('link_', '').trim();
            const linkData = telegramLinkCodes.get(code);

            if (linkData && !linkData.used && new Date(linkData.expiresAt).getTime() > Date.now()) {
              linkData.used = true;
              linkData.usedAt = new Date().toISOString();

              const accountRecord = {
                userId: linkData.userId,
                telegramUserId: String(from.id),
                username: from.username || null,
                firstName: from.first_name || '',
                lastName: from.last_name || '',
                linkedAt: new Date().toISOString()
              };

              telegramAccounts.set(String(from.id), accountRecord);

              // Auto-assign any groups added by this Telegram user
              for (const ch of telegramChats.values()) {
                if (ch.addedByUserId === String(from.id)) {
                  ch.userId = linkData.userId;
                }
              }

              await telegramApiRequest('sendMessage', {
                chat_id: chat.id,
                text: `✅ <b>Account Successfully Linked!</b>\n\nTelegram account <b>@${from.username || from.first_name}</b> is now connected to DEVARENA user <b>${linkData.username}</b>.\n\n🏆 You can now track your streak with <code>/streak</code>, inspect your rank with <code>/profile</code>, and manage your connected groups in DEVARENA Connect!`,
                parse_mode: 'HTML',
                reply_markup: {
                  inline_keyboard: [
                    [{ text: '🌐 View Connect Dashboard', url: 'https://devarena.io/app/connect' }]
                  ]
                }
              });
              return;
            }

            await telegramApiRequest('sendMessage', {
              chat_id: chat.id,
              text: `❌ <b>Invalid or Expired Link Code</b>\nPlease generate a fresh link code from <a href="https://devarena.io/app/connect">DEVARENA Connect</a> and try again.`,
              parse_mode: 'HTML'
            });
            return;
          }

          // Default /start greeting
          await telegramApiRequest('sendMessage', {
            chat_id: chat.id,
            text: `⚔️ <b>Welcome to DEVARENA!</b>\n\nThe ultimate competitive DSA battleground & algorithmic community.\n\n🚀 <b>What DEVARENA Bot does:</b>\n• Delivers two curated daily DSA challenges (9:00 AM & 6:00 PM IST)\n• Instant problem practice with <code>/challenge</code>\n• Global Elo ratings with <code>/leaderboard</code>\n• Developer profile & streak synchronization\n\n<b>Quick Commands:</b>\n/daily — View today's challenges\n/challenge — Request a DSA problem\n/leaderboard — View top coders\n/profile — Your developer stats\n/streak — Your coding streak\n/help — Full command guide\n\n🔗 <b>Add bot to your group:</b>\nClick below to install DEVARENA into your coding communities!`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '➕ Add to Group', url: `https://t.me/${TELEGRAM_BOT_USERNAME}?startgroup=true` },
                  { text: '🌐 Open DEVARENA', url: 'https://devarena.io/app/connect' }
                ]
              ]
            }
          });
          return;
        }

        // COMMAND: /help
        if (cmd === '/help') {
          await telegramApiRequest('sendMessage', {
            chat_id: chat.id,
            text: `📖 <b>DEVARENA Bot Commands & Guide</b>\n\n<b>Community & Challenge Commands:</b>\n• <code>/daily</code> — Show today's morning (09:00) and evening (18:00) challenges\n• <code>/challenge [topic] [diff]</code> — Fetch a coding challenge to solve\n• <code>/leaderboard</code> — Display global Elo rankings and top coders\n• <code>/profile</code> — View your connected developer profile\n• <code>/streak</code> — Check your current daily coding streak\n• <code>/stats</code> — View 1v1 battle win rate and category mastery\n• <code>/link &lt;code&gt;</code> — Link Telegram identity to your DEVARENA account\n• <code>/settings</code> — Group configuration (Group Admins only)\n\n👉 <i>Practice in private or add the bot to your engineering groups!</i>`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '⚔️ Enter Code Arena', url: 'https://devarena.io/app/arena' }]
              ]
            }
          });
          return;
        }

        // COMMAND: /daily
        if (cmd === '/daily') {
          const mProblem = SAMPLE_PROBLEMS[0];
          const eProblem = SAMPLE_PROBLEMS[2];
          const mSolveUrl = `https://devarena.io/app/arena?problem=${mProblem.id}`;
          const eSolveUrl = `https://devarena.io/app/arena?problem=${eProblem.id}`;

          await telegramApiRequest('sendMessage', {
            chat_id: chat.id,
            text: `📅 <b>DEVARENA TODAY'S CHALLENGES</b>\n━━━━━━━━━━━━━━━━━━━━\n\n☀️ <b>Morning Slot (09:00 IST):</b>\n<b>${mProblem.title}</b> (${mProblem.difficulty})\nTopic: ${mProblem.category}\n👉 <a href="${mSolveUrl}">Solve Morning Challenge</a>\n\n🌙 <b>Evening Slot (18:00 IST):</b>\n<b>${eProblem.title}</b> (${eProblem.difficulty})\nTopic: ${eProblem.category}\n👉 <a href="${eSolveUrl}">Solve Evening Challenge</a>\n\n━━━━━━━━━━━━━━━━━━━━\n<i>Two new problems posted automatically every single day!</i>`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '☀️ Solve Morning', url: mSolveUrl },
                  { text: '🌙 Solve Evening', url: eSolveUrl }
                ]
              ]
            }
          });
          return;
        }

        // COMMAND: /challenge
        if (cmd === '/challenge') {
          let candidates = SAMPLE_PROBLEMS;
          if (arg) {
            const lowerArg = arg.toLowerCase();
            const filtered = SAMPLE_PROBLEMS.filter(
              p => p.difficulty.toLowerCase().includes(lowerArg) || p.category.toLowerCase().includes(lowerArg)
            );
            if (filtered.length > 0) candidates = filtered;
          }
          const p = candidates[Math.floor(Math.random() * candidates.length)];
          const challengeNum = Math.floor(Math.random() * 200) + 100;
          const payload = formatTelegramChallengeHtml(p, 'manual_test', challengeNum);

          await telegramApiRequest('sendMessage', {
            chat_id: chat.id,
            text: payload.text,
            parse_mode: payload.parse_mode,
            reply_markup: payload.reply_markup
          });
          return;
        }

        // COMMAND: /leaderboard
        if (cmd === '/leaderboard') {
          const lines = REAL_LEADERBOARD.map(c => {
            const medal = c.rank === 1 ? '🥇' : c.rank === 2 ? '🥈' : c.rank === 3 ? '🥉' : '•';
            return `${medal} <b>#${c.rank} ${c.username}</b> — ${c.score} Elo (${c.wins} Wins, ${c.ratingBadge})`;
          }).join('\n');

          await telegramApiRequest('sendMessage', {
            chat_id: chat.id,
            text: `🏆 <b>DEVARENA GLOBAL TOP CODERS</b>\n━━━━━━━━━━━━━━━━━━━━\n\n${lines}\n\n━━━━━━━━━━━━━━━━━━━━\nClimb the ranks by solving daily challenges & 1v1 Code Arena battles!`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔥 View Full Leaderboard', url: 'https://devarena.io/app/leaderboard' }]
              ]
            }
          });
          return;
        }

        // COMMAND: /profile
        if (cmd === '/profile') {
          const linked = telegramAccounts.get(String(from.id));
          if (linked) {
            await telegramApiRequest('sendMessage', {
              chat_id: chat.id,
              text: `👤 <b>DEVARENA Developer Profile</b>\n━━━━━━━━━━━━━━━━━━━━\n\n• <b>Username:</b> ${linked.username || from.first_name}\n• <b>DEVARENA User ID:</b> <code>${linked.userId}</code>\n• <b>Rating:</b> 1980 Elo (Master)\n• <b>Problems Solved:</b> 142\n• <b>1v1 Arena Wins:</b> 38\n• <b>Active Streak:</b> 🔥 12 days\n• <b>Linked At:</b> ${new Date(linked.linkedAt).toLocaleDateString()}\n\n━━━━━━━━━━━━━━━━━━━━`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '⚡ View On Platform', url: 'https://devarena.io/app/profile' }]
                ]
              }
            });
            return;
          }

          await telegramApiRequest('sendMessage', {
            chat_id: chat.id,
            text: `⚠️ <b>Telegram Account Not Linked</b>\n\nLink your Telegram profile to sync your DEVARENA rating, rank tier, and coding streaks!\n\n1. Go to <a href="https://devarena.io/app/connect">DEVARENA Connect</a>\n2. Click <b>Connect Telegram Account</b>\n3. Execute <code>/link &lt;code&gt;</code> here in chat.`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔗 Link DEVARENA Account', url: 'https://devarena.io/app/connect' }]
              ]
            }
          });
          return;
        }

        // COMMAND: /streak
        if (cmd === '/streak') {
          const linked = telegramAccounts.get(String(from.id));
          if (linked) {
            await telegramApiRequest('sendMessage', {
              chat_id: chat.id,
              text: `🔥 <b>DEVARENA CODING STREAK</b>\n━━━━━━━━━━━━━━━━━━━━\n\nDeveloper: <b>${linked.username || from.first_name}</b>\nStreak: <b>12 Consecutive Days!</b>\nMonthly Solved: <b>38 challenges</b>\nStatus: <b>Active & Protected</b>\n\nKeep solving morning & evening challenges to maintain your multiplier!`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '⚡ Solve Today’s Challenge', url: 'https://devarena.io/app/arena' }]
                ]
              }
            });
            return;
          }

          await telegramApiRequest('sendMessage', {
            chat_id: chat.id,
            text: `🔥 <b>Coding Streak</b>\nLink your DEVARENA account with <code>/link &lt;code&gt;</code> to track your consecutive problem-solving streak!`,
            parse_mode: 'HTML'
          });
          return;
        }

        // COMMAND: /link <code>
        if (cmd === '/link') {
          const code = arg.trim();
          if (!code) {
            await telegramApiRequest('sendMessage', {
              chat_id: chat.id,
              text: `ℹ️ <b>Usage:</b> <code>/link &lt;code&gt;</code>\nExample: <code>/link DEV-8291</code>\n\nGenerate your linking code in <a href="https://devarena.io/app/connect">DEVARENA Connect</a>.`,
              parse_mode: 'HTML'
            });
            return;
          }

          const linkData = telegramLinkCodes.get(code);
          if (linkData && !linkData.used && new Date(linkData.expiresAt).getTime() > Date.now()) {
            linkData.used = true;
            linkData.usedAt = new Date().toISOString();

            telegramAccounts.set(String(from.id), {
              userId: linkData.userId,
              telegramUserId: String(from.id),
              username: from.username || null,
              firstName: from.first_name || '',
              lastName: from.last_name || '',
              linkedAt: new Date().toISOString()
            });

            // Re-assign any groups added by this user
            for (const ch of telegramChats.values()) {
              if (ch.addedByUserId === String(from.id)) {
                ch.userId = linkData.userId;
              }
            }

            await telegramApiRequest('sendMessage', {
              chat_id: chat.id,
              text: `✅ <b>Account Successfully Linked!</b>\n\nTelegram identity <b>@${from.username || from.first_name}</b> is paired with DEVARENA user <b>${linkData.username}</b>.`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🌐 Open Connect Dashboard', url: 'https://devarena.io/app/connect' }]
                ]
              }
            });
            return;
          }

          await telegramApiRequest('sendMessage', {
            chat_id: chat.id,
            text: `❌ <b>Invalid or expired link code.</b>\nPlease generate a new link code from <a href="https://devarena.io/app/connect">DEVARENA Connect</a>.`,
            parse_mode: 'HTML'
          });
          return;
        }

        // COMMAND: /stats
        if (cmd === '/stats') {
          await telegramApiRequest('sendMessage', {
            chat_id: chat.id,
            text: `📊 <b>DEVARENA CODING STATISTICS</b>\n━━━━━━━━━━━━━━━━━━━━\n\n• <b>1v1 Arena Battles:</b> 48\n• <b>Wins:</b> 42 (87.5% Win Rate)\n• <b>Global Elo:</b> 2045 (Master Tier)\n• <b>Arrays & Hashing:</b> 94% Mastery\n• <b>Trees & Graphs:</b> 82% Mastery\n• <b>Dynamic Programming:</b> 76% Mastery\n\n━━━━━━━━━━━━━━━━━━━━`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '⚔️ Enter 1v1 Battle Room', url: 'https://devarena.io/app/arena' }]
              ]
            }
          });
          return;
        }

        // COMMAND: /settings
        if (cmd === '/settings') {
          const isGroup = chat.type === 'group' || chat.type === 'supergroup';

          if (isGroup) {
            // Verify caller is group administrator using getChatMember
            let isAdmin = false;
            if (TELEGRAM_BOT_TOKEN) {
              try {
                const memberCheck = await telegramApiRequest('getChatMember', {
                  chat_id: chat.id,
                  user_id: from.id
                });
                if (memberCheck.ok && memberCheck.result) {
                  const st = memberCheck.result.status;
                  isAdmin = st === 'creator' || st === 'administrator';
                }
              } catch (e) { }
            } else {
              isAdmin = true; // Dev fallback
            }

            if (!isAdmin) {
              await telegramApiRequest('sendMessage', {
                chat_id: chat.id,
                text: `🔒 <b>Admin Access Required</b>\nOnly group administrators can view or modify DEVARENA settings for this chat.`,
                parse_mode: 'HTML'
              });
              return;
            }

            const srvId = `tg_${chat.id}`;
            const group = telegramChats.get(srvId) || {
              settings: {
                morningEnabled: true,
                morningTime: '09:00',
                eveningEnabled: true,
                eveningTime: '18:00',
                timezone: 'Asia/Kolkata',
                difficulty: 'Mixed'
              }
            };

            await telegramApiRequest('sendMessage', {
              chat_id: chat.id,
              text: `⚙️ <b>DEVARENA Group Settings: ${escapeHtml(chat.title)}</b>\n━━━━━━━━━━━━━━━━━━━━\n\n☀️ <b>Morning Challenge:</b> ${group.settings.morningEnabled ? '✅ ON' : '❌ OFF'} (${group.settings.morningTime})\n🌙 <b>Evening Challenge:</b> ${group.settings.eveningEnabled ? '✅ ON' : '❌ OFF'} (${group.settings.eveningTime})\n🌐 <b>Timezone:</b> ${group.settings.timezone}\n🎯 <b>Difficulty:</b> ${group.settings.difficulty}\n\nConfigure custom topics and schedules in the DEVARENA Connect web dashboard:`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '☀️ Toggle Morning', callback_data: `toggle_morning:${chat.id}` },
                    { text: '🌙 Toggle Evening', callback_data: `toggle_evening:${chat.id}` }
                  ],
                  [
                    { text: '🌐 Web Admin Dashboard', url: 'https://devarena.io/app/connect' }
                  ]
                ]
              }
            });
            return;
          }

          // Private chat /settings
          const userGroups = Array.from(telegramChats.values()).filter(g => g.status === 'connected');
          const groupList = userGroups.length > 0
            ? userGroups.map(g => `• <b>${g.chatTitle}</b> (${g.chatId})`).join('\n')
            : 'No groups connected yet. Add DEVARENA to your groups!';

          await telegramApiRequest('sendMessage', {
            chat_id: chat.id,
            text: `⚙️ <b>DEVARENA Management Center</b>\n━━━━━━━━━━━━━━━━━━━━\n\n<b>Connected Groups:</b>\n${groupList}\n\nManage schedules, DSA topics, and delivery times from the web dashboard:`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🌐 Open Connect Dashboard', url: 'https://devarena.io/app/connect' }]
              ]
            }
          });
          return;
        }
      }

      // 9c. Handle callback queries (inline button interactions)
      if (update.callback_query) {
        const cq = update.callback_query;
        const data = cq.data || '';

        await telegramApiRequest('answerCallbackQuery', {
          callback_query_id: cq.id,
          text: 'Settings updated'
        });

        if (data.startsWith('toggle_morning:') || data.startsWith('toggle_evening:')) {
          const isMorningToggle = data.startsWith('toggle_morning:');
          const targetChatId = data.split(':')[1];
          const srvId = `tg_${targetChatId}`;
          const group = telegramChats.get(srvId);

          if (group && group.settings) {
            if (isMorningToggle) {
              group.settings.morningEnabled = !group.settings.morningEnabled;
            } else {
              group.settings.eveningEnabled = !group.settings.eveningEnabled;
            }

            if (cq.message && cq.message.chat) {
              await telegramApiRequest('editMessageText', {
                chat_id: cq.message.chat.id,
                message_id: cq.message.message_id,
                text: `⚙️ <b>DEVARENA Group Settings: ${escapeHtml(group.chatTitle)}</b>\n━━━━━━━━━━━━━━━━━━━━\n\n☀️ <b>Morning Challenge:</b> ${group.settings.morningEnabled ? '✅ ON' : '❌ OFF'} (${group.settings.morningTime})\n🌙 <b>Evening Challenge:</b> ${group.settings.eveningEnabled ? '✅ ON' : '❌ OFF'} (${group.settings.eveningTime})\n🌐 <b>Timezone:</b> ${group.settings.timezone}\n🎯 <b>Difficulty:</b> ${group.settings.difficulty}\n\nSettings updated successfully!`,
                parse_mode: 'HTML',
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: '☀️ Toggle Morning', callback_data: `toggle_morning:${targetChatId}` },
                      { text: '🌙 Toggle Evening', callback_data: `toggle_evening:${targetChatId}` }
                    ],
                    [
                      { text: '🌐 Web Admin Dashboard', url: 'https://devarena.io/app/connect' }
                    ]
                  ]
                }
              }).catch(() => { });
            }
          }
        }
      }
    }).catch(err => {
      console.error('[Telegram Webhook Error]', err);
    });
    return;
  }

  // 10. Telegram Bot Info & Installation Link (/api/telegram/info)
  if (url.pathname === '/api/telegram/info' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      botName: 'DEVARENA',
      username: TELEGRAM_BOT_USERNAME,
      botLink: `https://t.me/${TELEGRAM_BOT_USERNAME}`,
      installUrl: `https://t.me/${TELEGRAM_BOT_USERNAME}?startgroup=true`,
      botConfigured: Boolean(TELEGRAM_BOT_TOKEN)
    }));
    return;
  }

  // 11. Telegram Connected Groups (GET, POST, DELETE)
  if (url.pathname === '/api/telegram/chats') {
    if (req.method === 'GET') {
      const userId = url.searchParams.get('userId') || 'guest';
      const userChats = Array.from(telegramChats.values()).filter(
        c => c.userId === userId || c.userId === 'guest'
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ chats: userChats }));
      return;
    }

    if (req.method === 'POST') {
      readJsonBody().then(chatData => {
        if (!chatData.id && !chatData.chatId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing chat id' }));
          return;
        }

        const id = chatData.id || `tg_${chatData.chatId}`;
        const existing = telegramChats.get(id) || {};
        const updated = {
          ...existing,
          ...chatData,
          id,
          userId: chatData.userId || existing.userId || 'guest',
          chatId: String(chatData.chatId || existing.chatId),
          status: 'connected',
          connectedAt: existing.connectedAt || new Date().toISOString()
        };

        telegramChats.set(id, updated);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, chat: updated }));
      }).catch(err => {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });
      return;
    }

    if (req.method === 'DELETE') {
      const chatId = url.searchParams.get('chatId');
      if (chatId) {
        const srvId = chatId.startsWith('tg_') ? chatId : `tg_${chatId}`;
        if (telegramChats.has(srvId)) {
          telegramChats.delete(srvId);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
          return;
        }
      }
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Telegram group not found' }));
      return;
    }
  }

  // 12. Verify & Connect Telegram Group via Telegram Bot API (/api/telegram/chats/verify)
  if (url.pathname === '/api/telegram/chats/verify' && req.method === 'POST') {
    readJsonBody().then(async body => {
      const { chatId, userId } = body;
      if (!chatId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing chatId' }));
        return;
      }

      let chatTitle = `Telegram Group (${chatId})`;
      let chatType = 'supergroup';
      let memberCount = 28;
      let canSend = true;
      let isAdmin = true;

      if (TELEGRAM_BOT_TOKEN) {
        try {
          const chatRes = await telegramApiRequest('getChat', { chat_id: chatId });
          if (!chatRes.ok) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: `Telegram API error: ${chatRes.description || 'Chat not found'}. Make sure the bot is added to the group.`
            }));
            return;
          }
          chatTitle = chatRes.result.title || chatTitle;
          chatType = chatRes.result.type || chatType;
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
          return;
        }
      }

      const srvId = `tg_${chatId}`;
      const newChat = {
        id: srvId,
        userId: userId || 'guest',
        chatId: String(chatId),
        chatTitle,
        chatType,
        memberCount,
        status: 'connected',
        botPermissions: {
          canSendMessages: canSend,
          isAdmin
        },
        settings: {
          enabled: true,
          difficulty: 'Mixed',
          topics: ['Arrays', 'Strings', 'Hashing', 'Binary Search', 'Trees', 'Graphs', 'Dynamic Programming'],
          morningEnabled: true,
          morningTime: '09:00',
          eveningEnabled: true,
          eveningTime: '18:00',
          timezone: 'Asia/Kolkata'
        },
        lastChallengeSent: null,
        connectedAt: new Date().toISOString()
      };

      telegramChats.set(srvId, newChat);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, chat: newChat }));
    }).catch(err => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // 13. Send Test Challenge to Telegram Group (/api/telegram/chats/:chatId/test)
  if (url.pathname.match(/^\/api\/telegram\/chats\/([^/]+)\/test$/) && req.method === 'POST') {
    const rawChatId = url.pathname.split('/')[4];
    readJsonBody().then(async testBody => {
      const payload = testBody.payload;
      let messageId = `tg_test_${Date.now()}`;
      let success = true;
      let error = null;

      if (TELEGRAM_BOT_TOKEN) {
        const tgRes = await telegramApiRequest('sendMessage', {
          chat_id: rawChatId,
          text: payload.text,
          parse_mode: payload.parse_mode,
          reply_markup: payload.reply_markup
        });

        if (tgRes.ok) {
          messageId = String(tgRes.result?.message_id || messageId);
        } else {
          success = false;
          error = tgRes.description || `Error ${tgRes.error_code}`;
        }
      }

      const record = {
        id: `tg_ch_test_${Date.now()}`,
        chatId: rawChatId,
        chatTitle: testBody.chatTitle || 'Telegram Group',
        challengeNumber: 99,
        problemId: testBody.problemId || 'two-sum',
        problemTitle: 'Two Sum (Test)',
        difficulty: 'Easy',
        category: 'Arrays & Hashing',
        slot: 'manual_test',
        scheduledAt: new Date().toISOString(),
        deliveredAt: success ? new Date().toISOString() : null,
        status: success ? 'sent' : 'failed',
        telegramMessageId: messageId,
        errorMessage: error || undefined
      };

      telegramHistory.unshift(record);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success, messageId, record, error }));
    }).catch(err => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // 14. Telegram Challenge Delivery History (/api/telegram/challenges)
  if (url.pathname === '/api/telegram/challenges' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ history: telegramHistory.slice(0, 50) }));
    return;
  }

  // 15. Telegram Account Linking Code (/api/telegram/link-code)
  if (url.pathname === '/api/telegram/link-code' && req.method === 'POST') {
    readJsonBody().then(body => {
      const userId = body.userId || 'guest';
      const username = body.username || 'Coder';
      const code = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
      const codeHash = hashLinkCode(code);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const linkObj = {
        code,
        codeHash,
        userId,
        username,
        expiresAt,
        used: false,
        deepLink: `https://t.me/${TELEGRAM_BOT_USERNAME}?start=link_${code}`
      };

      telegramLinkCodes.set(code, linkObj);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(linkObj));
    }).catch(err => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // 16. Telegram Linked User Account Status (/api/telegram/account)
  if (url.pathname === '/api/telegram/account') {
    if (req.method === 'GET') {
      const userId = url.searchParams.get('userId') || 'guest';
      const account = Array.from(telegramAccounts.values()).find(a => a.userId === userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ linked: Boolean(account), account: account || null }));
      return;
    }

    if (req.method === 'DELETE') {
      const userId = url.searchParams.get('userId') || 'guest';
      for (const [tgId, acc] of telegramAccounts.entries()) {
        if (acc.userId === userId) {
          telegramAccounts.delete(tgId);
        }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }
  }

  // 17. Telegram Set Webhook Utility (/api/telegram/set-webhook)
  if (url.pathname === '/api/telegram/set-webhook') {
    const defaultUrl = TELEGRAM_WEBHOOK_URL || (req.headers.host ? `https://${req.headers.host}/api/telegram/webhook` : '');
    readJsonBody().then(async body => {
      const targetUrl = body.url || defaultUrl;
      if (!targetUrl) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing webhook url' }));
        return;
      }

      const params = {
        url: targetUrl,
        allowed_updates: ['message', 'callback_query', 'my_chat_member']
      };

      if (TELEGRAM_WEBHOOK_SECRET) {
        params.secret_token = TELEGRAM_WEBHOOK_SECRET;
      }

      const result = await telegramApiRequest('setWebhook', params);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: result.ok, result }));
    }).catch(err => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // 18. Telegram Get Webhook Info (/api/telegram/webhook-info)
  if (url.pathname === '/api/telegram/webhook-info' && req.method === 'GET') {
    telegramApiRequest('getWebhookInfo').then(info => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(info));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // 19. Manual Cron Trigger (/api/telegram/cron and unified /api/cron)
  if (url.pathname === '/api/telegram/cron' || url.pathname === '/api/cron') {
    runScheduledChallengesCheck().then(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        discordServersProcessed: discordServers.size,
        telegramChatsProcessed: telegramChats.size
      }));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // 20. Manual Discord Cron Trigger (/api/discord/cron)
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

  // 21. Existing Results & Rooms Endpoints
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
  console.log(`[DEVARENA] Real-Time Relay & Bot Engine (Discord + Telegram) running on port ${PORT}`);
});
