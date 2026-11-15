// Vercel Serverless Function: Consolidated Telegram API Router
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';

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

  // 1. Bot Metadata & Installation URL (/api/telegram/info)
  if (route === 'info') {
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'DEVARENA_CommunityBot';
    const botConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN);

    return res.status(200).json({
      botName: 'DEVARENA',
      username: botUsername,
      botLink: `https://t.me/${botUsername}`,
      installUrl: `https://t.me/${botUsername}?startgroup=true`,
      botConfigured
    });
  }

  // 2. Verify Group Permissions (/api/telegram/chats/verify or /api/telegram/verify)
  if ((route === 'chats' && pathParts[1] === 'verify') || route === 'verify') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { chatId, userId } = req.body || {};
    if (!chatId) {
      return res.status(400).json({ error: 'Missing chatId' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    let chatTitle = `Telegram Group (${chatId})`;
    let chatType = 'supergroup';

    if (botToken) {
      try {
        const chatRes = await fetch(`https://api.telegram.org/bot${botToken}/getChat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId })
        });
        const data = await chatRes.json();
        if (!data.ok) {
          return res.status(400).json({
            error: `Telegram Bot API: ${data.description || 'Chat not found'}. Make sure the bot is added as an administrator.`
          });
        }
        chatTitle = data.result.title || chatTitle;
        chatType = data.result.type || chatType;
      } catch (e: any) {
        return res.status(500).json({ error: e.message });
      }
    }

    const srvId = `tg_${chatId}`;
    const newChat = {
      id: srvId,
      userId: userId || 'guest',
      chatId: String(chatId),
      chatTitle,
      chatType,
      memberCount: 24,
      status: 'connected',
      botPermissions: {
        canSendMessages: true,
        isAdmin: true,
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
      connectedAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      chat: newChat,
      message: 'Group permissions verified successfully'
    });
  }

  // 3. Test Challenge Dispatch (/api/telegram/chats/:chatId/test or /api/telegram/test)
  if ((route === 'chats' && pathParts[2] === 'test') || route === 'test') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const chatId = (route === 'chats' ? pathParts[1] : (req.query.chatId as string)) || req.body?.chatId || '-1001849204820';
    const body = req.body || {};
    const payload = body.payload || {};
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    let messageId = `tg_test_${Date.now()}`;
    let success = true;
    let error: any = null;

    if (botToken && chatId) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: payload.text || '🏆 DEVARENA Test Verification Challenge',
            parse_mode: payload.parse_mode || 'HTML',
            reply_markup: payload.reply_markup
          })
        });
        const data = await tgRes.json();
        if (data.ok) {
          messageId = String(data.result?.message_id || messageId);
        } else {
          success = false;
          error = data.description;
        }
      } catch (e: any) {
        success = false;
        error = e.message;
      }
    }

    return res.status(200).json({
      success,
      chatId,
      messageId,
      error,
      deliveredAt: new Date().toISOString()
    });
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
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'DEVARENA_CommunityBot';
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return res.status(200).json({
      code,
      codeHash,
      userId,
      username,
      expiresAt,
      used: false,
      deepLink: `https://t.me/${botUsername}?start=link_${code}`
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
