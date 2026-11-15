// Vercel Serverless Function: Consolidated Telegram API Router & Verification
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';
import * as fs from 'fs';

const TMP_FILE = '/tmp/devarena_telegram_recent_updates.json';

interface DetectedChatInfo {
  chatId: string;
  title: string;
  type: string;
  lastSeenAt: string;
  lastMessage?: string;
  sender?: string;
}

interface StoredTelegramUpdate {
  updateId: number;
  receivedAt: string;
  chatId: string;
  chatTitle: string;
  chatType: string;
  senderUsername?: string;
  senderId?: number;
  text?: string;
  isGroup: boolean;
  action?: string;
}

function loadPersistedUpdates(): StoredTelegramUpdate[] {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  return [];
}

function getDetectedTelegramGroups(): DetectedChatInfo[] {
  const all = loadPersistedUpdates();
  const map = new Map<string, DetectedChatInfo>();

  for (const u of all) {
    if (!map.has(u.chatId)) {
      map.set(u.chatId, {
        chatId: u.chatId,
        title: u.chatTitle,
        type: u.chatType,
        lastSeenAt: u.receivedAt,
        lastMessage: u.text,
        sender: u.senderUsername
      });
    }
  }

  return Array.from(map.values());
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract subpath from rewrite query or direct url
  const rawSubpath = (req.query.subpath as string) || '';
  const urlPath = req.url?.split('?')[0].replace(/^\/api\/telegram\/?/, '') || '';
  const subpath = rawSubpath || urlPath;
  const pathParts = subpath.split('/').filter(Boolean);

  const route = pathParts[0] || '';
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const expectedBotUsername = process.env.TELEGRAM_BOT_USERNAME || 'DEVARENA_CommunityBot';

  // 1. Bot Metadata & getMe Verification (/api/telegram/info)
  if (route === 'info') {
    let botId: number | null = null;
    let username = expectedBotUsername;
    let botName = 'DEVARENA';
    let canJoinGroups = true;
    let canReadAllGroupMessages = false;
    let verifiedBot = false;

    if (botToken) {
      try {
        const meRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
        const meData = await meRes.json();
        if (meData.ok && meData.result) {
          botId = meData.result.id;
          username = meData.result.username || username;
          botName = meData.result.first_name || botName;
          canJoinGroups = meData.result.can_join_groups ?? true;
          canReadAllGroupMessages = meData.result.can_read_all_group_messages ?? false;
          verifiedBot = (meData.result.username?.toLowerCase() === expectedBotUsername.toLowerCase());
        }
      } catch (err: any) {
        console.error('[Telegram Router] getMe error:', err.message);
      }
    }

    return res.status(200).json({
      botName,
      username,
      botId,
      canJoinGroups,
      canReadAllGroupMessages,
      verifiedBot,
      botLink: `https://t.me/${username}`,
      installUrl: `https://t.me/${username}?startgroup=true`,
      botConfigured: Boolean(botToken)
    });
  }

  // 1b. Recently Detected Groups & Diagnostics (/api/telegram/chats/detected or /api/telegram/diagnostic)
  if ((route === 'chats' && pathParts[1] === 'detected') || route === 'detected' || route === 'diagnostic') {
    let botIdentity: any = null;
    let webhookInfo: any = null;

    if (botToken) {
      try {
        const [meRes, whRes] = await Promise.all([
          fetch(`https://api.telegram.org/bot${botToken}/getMe`).then(r => r.json()).catch(e => ({ ok: false, description: e.message })),
          fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`).then(r => r.json()).catch(e => ({ ok: false, description: e.message }))
        ]);
        if (meRes.ok) botIdentity = meRes.result;
        if (whRes.ok) webhookInfo = whRes.result;
      } catch {}
    }

    const detectedGroups = getDetectedTelegramGroups();
    const recentUpdates = loadPersistedUpdates();

    return res.status(200).json({
      success: true,
      botConfigured: Boolean(botToken),
      botIdentity,
      webhookInfo,
      detectedChats: detectedGroups,
      recentUpdates: recentUpdates.slice(0, 20)
    });
  }

  // 2. Verify Group Permissions via Telegram Bot API (/api/telegram/chats/verify or /api/telegram/verify)
  if ((route === 'chats' && pathParts[1] === 'verify') || route === 'verify') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { chatId, userId } = req.body || {};
    if (!chatId) {
      return res.status(400).json({ error: 'Missing chatId in request body.' });
    }

    if (!botToken) {
      return res.status(500).json({
        error: 'TELEGRAM_BOT_TOKEN is not configured on the backend. Add TELEGRAM_BOT_TOKEN in Vercel environment variables.'
      });
    }

    let cleanChatId = String(chatId).trim();

    try {
      // Step A: Call Telegram Bot API getChat
      let chatRes = await fetch(`https://api.telegram.org/bot${botToken}/getChat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: cleanChatId })
      });
      let data = await chatRes.json();

      // Check if group was migrated to supergroup
      if (!data.ok && data.parameters?.migrate_to_chat_id) {
        cleanChatId = String(data.parameters.migrate_to_chat_id);
        chatRes = await fetch(`https://api.telegram.org/bot${botToken}/getChat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: cleanChatId })
        });
        data = await chatRes.json();
      }

      if (!data.ok) {
        const desc = data.description || 'Chat not found';
        let userFriendlyError = `Telegram API Error: ${desc}`;

        if (desc.toLowerCase().includes('chat not found')) {
          userFriendlyError = `Telegram API: Chat not found for ID "${cleanChatId}". Please verify: 1) @${expectedBotUsername} is added to the group as administrator, 2) Send /id in the group to get the exact numeric chat ID (including the minus sign, e.g. -100...), 3) Check the Webhook & Diagnostics panel for auto-detected IDs.`;
        } else if (desc.toLowerCase().includes('kicked') || desc.toLowerCase().includes('left')) {
          userFriendlyError = `Telegram API: The bot has left or was kicked from this chat. Please add @${expectedBotUsername} back to the group.`;
        }

        return res.status(400).json({
          error: userFriendlyError,
          rawError: desc,
          chatId: cleanChatId
        });
      }

      const chatInfo = data.result;
      const chatTitle = chatInfo.title || chatInfo.first_name || `Telegram Group (${cleanChatId})`;
      const chatType = chatInfo.type || 'group';

      // Step B: Query real member count
      let memberCount = 1;
      try {
        const countRes = await fetch(`https://api.telegram.org/bot${botToken}/getChatMemberCount`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: cleanChatId })
        });
        const countData = await countRes.json();
        if (countData.ok && typeof countData.result === 'number') {
          memberCount = countData.result;
        }
      } catch {}

      // Step C: Verify Bot Membership and Permissions via getChatMember
      let canSendMessages = true;
      let isAdmin = false;
      try {
        const botIdStr = botToken.split(':')[0];
        const botIdNum = Number(botIdStr);
        if (botIdNum) {
          const memberRes = await fetch(`https://api.telegram.org/bot${botToken}/getChatMember`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: cleanChatId, user_id: botIdNum })
          });
          const memberData = await memberRes.json();
          if (memberData.ok && memberData.result) {
            const memberStatus = memberData.result.status;
            if (memberStatus === 'left' || memberStatus === 'kicked') {
              return res.status(400).json({
                error: `Telegram API: The bot has left or was removed from this chat. Add @${expectedBotUsername} back to the group.`
              });
            }
            isAdmin = memberStatus === 'administrator' || memberStatus === 'creator';
            canSendMessages = memberStatus !== 'restricted' || memberData.result.can_send_messages !== false;
          }
        }
      } catch {}

      const srvId = `tg_${cleanChatId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const newChat = {
        id: srvId,
        userId: userId || 'guest',
        chatId: cleanChatId,
        chatTitle,
        chatType,
        memberCount,
        status: 'connected',
        botPermissions: {
          canSendMessages,
          isAdmin,
          canInviteUsers: true
        },
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
        chat: newChat,
        message: 'Telegram group verified successfully'
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Network error verifying group' });
    }
  }

  // 3. Test Challenge Dispatch (/api/telegram/chats/:chatId/test or /api/telegram/test)
  if ((route === 'chats' && pathParts[2] === 'test') || route === 'test') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const chatId = (route === 'chats' ? pathParts[1] : (req.query.chatId as string)) || req.body?.chatId;
    if (!chatId) {
      return res.status(400).json({ success: false, error: 'Missing chatId' });
    }

    if (!botToken) {
      return res.status(500).json({
        success: false,
        error: 'TELEGRAM_BOT_TOKEN not configured on backend. Add TELEGRAM_BOT_TOKEN in Vercel environment variables.'
      });
    }

    const body = req.body || {};
    const payload = body.payload || {};

    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: payload.text || '🏆 <b>DEVARENA Test Verification Challenge</b>\n\nDaily automated algorithm challenges are now active for this group!',
          parse_mode: payload.parse_mode || 'HTML',
          reply_markup: payload.reply_markup
        })
      });
      const data = await tgRes.json();
      if (!data.ok) {
        return res.status(400).json({
          success: false,
          chatId,
          error: `Telegram API: ${data.description || 'Failed to send test message'}`
        });
      }

      return res.status(200).json({
        success: true,
        chatId,
        messageId: String(data.result?.message_id || Date.now()),
        deliveredAt: new Date().toISOString()
      });
    } catch (e: any) {
      return res.status(500).json({
        success: false,
        chatId,
        error: e.message || 'Failed to dispatch test message'
      });
    }
  }

  // 3b. Setup Webhook (/api/telegram/setup-webhook)
  if (route === 'setup-webhook') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!botToken) {
      return res.status(500).json({
        ok: false,
        error: 'TELEGRAM_BOT_TOKEN is required. Please set it in Vercel environment variables.'
      });
    }

    const host = req.headers.host;
    const defaultUrl = (host && !host.includes('localhost'))
      ? `https://${host}/api/telegram/webhook`
      : 'https://devarena-ten.vercel.app/api/telegram/webhook';
    const targetUrl = req.body?.webhookUrl || defaultUrl;
    const secretToken = req.body?.secretToken || process.env.TELEGRAM_WEBHOOK_SECRET || process.env.TELEGRAM_SECRET_TOKEN || 'devarena_secret_token_2026';

    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          secret_token: secretToken,
          allowed_updates: ['message', 'edited_message', 'channel_post', 'my_chat_member']
        })
      });
      const data = await tgRes.json();
      return res.status(200).json({
        ...data,
        targetUrl
      });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  // 3c. Get Webhook Status (/api/telegram/webhook-status)
  if (route === 'webhook-status') {
    if (!botToken) {
      return res.status(200).json({
        ok: false,
        configured: false,
        error: 'TELEGRAM_BOT_TOKEN not configured on server'
      });
    }

    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
      const data = await tgRes.json();
      return res.status(200).json({
        configured: true,
        ...data
      });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  // 4. Connected Groups Management (/api/telegram/chats)
  if (route === 'chats') {
    if (req.method === 'GET') {
      return res.status(200).json({
        chats: [],
        mode: 'client_persistent_storage'
      });
    }

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

    if (req.method === 'DELETE') {
      return res.status(200).json({ success: true });
    }
  }

  // 5. Challenge Delivery History (/api/telegram/challenges)
  if (route === 'challenges') {
    return res.status(200).json({ history: [] });
  }

  // 6. Account Link Code Generator (/api/telegram/link-code)
  if (route === 'link-code') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = req.body || {};
    const userId = body.userId || 'guest';
    const username = body.username || 'Coder';
    const code = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return res.status(200).json({
      code,
      codeHash,
      userId,
      username,
      expiresAt,
      used: false,
      deepLink: `https://t.me/${expectedBotUsername}?start=link_${code}`
    });
  }

  // 7. Linked Account Status (/api/telegram/account)
  if (route === 'account') {
    if (req.method === 'GET') {
      return res.status(200).json({ linked: false, account: null });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      return res.status(200).json({ success: true, linked: true, user: body });
    }

    if (req.method === 'DELETE') {
      return res.status(200).json({ success: true });
    }
  }

  return res.status(404).json({ error: 'Not found', route: subpath });
}
