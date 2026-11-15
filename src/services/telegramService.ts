// DEVARENA CONNECT – Telegram Client Service
import {
  TelegramChatIntegration,
  TelegramChallengeRecord,
  TelegramOverviewStats,
  TelegramChatSettings,
  TelegramLinkCode,
  TelegramLinkedUser,
  TelegramWebhookStatus
} from '../types/telegram';
import { 
  TELEGRAM_BOT_USERNAME,
  TELEGRAM_INSTALL_LINK,
  TELEGRAM_DEFAULT_SETTINGS,
  formatTelegramChallengePayload,
  selectProblemForTelegramGroup,
  MOCK_TELEGRAM_GROUPS,
  MOCK_TELEGRAM_HISTORY
} from '../data/telegramDefaults';

const STORAGE_CHATS_KEY = 'devarena_telegram_chats';
const STORAGE_HISTORY_KEY = 'devarena_telegram_history';
const STORAGE_LINK_KEY = 'devarena_telegram_link_code';
const STORAGE_USER_LINK_KEY = 'devarena_telegram_linked_user';

class TelegramService {
  // 1. Get Official Bot Group Installation Link
  public getInstallationUrl(): string {
    return TELEGRAM_INSTALL_LINK;
  }

  // 2. Get All Connected Telegram Groups for User
  public async getConnectedGroups(userId: string): Promise<TelegramChatIntegration[]> {
    try {
      const res = await fetch(`/api/telegram/chats?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.chats) && data.chats.length > 0) {
          return data.chats;
        }
      }
    } catch {
      // Fallback to local storage
    }

    if (typeof window === 'undefined') return MOCK_TELEGRAM_GROUPS;
    try {
      const stored = localStorage.getItem(STORAGE_CHATS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Purge invalid mock chat -1002498192014 and tg_lukizerk
          const cleaned = parsed.filter((c: TelegramChatIntegration) => 
            c.chatId !== '-1002498192014' && c.id !== 'tg_lukizerk'
          );
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(cleaned));
          }
          const hasLiveGroup = cleaned.some((c: TelegramChatIntegration) => !c.isDemo && c.chatId !== '-1001928374829');
          if (!hasLiveGroup) {
            // Keep demo preview available if no verified live groups
            return MOCK_TELEGRAM_GROUPS;
          }
          return cleaned.filter((c: TelegramChatIntegration) => c.userId === userId || c.userId === 'guest' || c.isDemo);
        }
      }
      // Seed with centralized mock preview groups on initial load
      localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(MOCK_TELEGRAM_GROUPS));
      return MOCK_TELEGRAM_GROUPS;
    } catch (e) {
      console.error('Error reading telegram chats', e);
    }

    return MOCK_TELEGRAM_GROUPS;
  }

  // 3. Save / Update Telegram Group Integration
  public async saveGroup(group: TelegramChatIntegration): Promise<TelegramChatIntegration> {
    try {
      const res = await fetch('/api/telegram/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(group)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.chat) return data.chat;
      }
    } catch {
      // Fallback
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_CHATS_KEY);
        const chats: TelegramChatIntegration[] = stored ? JSON.parse(stored) : [];
        const index = chats.findIndex(c => c.id === group.id || c.chatId === group.chatId);

        if (index >= 0) {
          chats[index] = { ...chats[index], ...group };
        } else {
          chats.push(group);
        }

        localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(chats));
      } catch (e) {
        console.error('Error saving telegram group', e);
      }
    }

    return group;
  }

  // 4. Disconnect / Remove Telegram Group
  public async disconnectGroup(chatId: string, userId: string): Promise<boolean> {
    try {
      await fetch(`/api/telegram/chats?chatId=${encodeURIComponent(chatId)}&userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      });
    } catch {
      // Fallback
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_CHATS_KEY);
        if (stored) {
          const chats: TelegramChatIntegration[] = JSON.parse(stored);
          const filtered = chats.filter(c => c.id !== chatId && c.chatId !== chatId);
          localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(filtered));
        }
      } catch (e) {
        console.error('Error disconnecting telegram group', e);
      }
    }

    return true;
  }

  // 5. Verify & Connect Telegram Group via Telegram Bot API
  public async verifyAndConnectGroup(
    chatId: string,
    userId: string
  ): Promise<{ success: boolean; chat?: TelegramChatIntegration; error?: string }> {
    try {
      const cleanChatId = chatId.trim();
      const res = await fetch('/api/telegram/chats/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: cleanChatId, userId })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.chat) {
        await this.saveGroup(data.chat);
        return { success: true, chat: data.chat };
      }

      return {
        success: false,
        error: data.error || 'Failed to verify group. Ensure @DEVARENA_CommunityBot is added as administrator.'
      };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error verifying group' };
    }
  }

  // 6. Send Test Challenge Message to Telegram Group
  public async sendTestChallenge(
    group: TelegramChatIntegration
  ): Promise<{ success: boolean; record: TelegramChallengeRecord; error?: string }> {
    if (!group.chatId) {
      throw new Error('Invalid Telegram Chat ID.');
    }

    const problem = selectProblemForTelegramGroup(group.settings);
    const challengeNumber = Math.floor(Math.random() * 200) + 100;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://devarena-ten.vercel.app';
    const payload = formatTelegramChallengePayload(problem, 'manual_test', challengeNumber, origin);

    let deliveryStatus: 'sent' | 'failed' = 'sent';
    let errorMessage: string | undefined = undefined;
    let messageId: string = `tg_msg_${Date.now()}`;

    // If this is a demo preview group, simulate test delivery cleanly
    if (group.isDemo) {
      const record: TelegramChallengeRecord = {
        id: `tg_ch_demo_${Date.now()}`,
        chatId: group.chatId,
        chatTitle: group.chatTitle,
        challengeNumber,
        problemId: problem.id,
        problemTitle: problem.title,
        difficulty: problem.difficulty as any,
        category: problem.category,
        slot: 'manual_test',
        scheduledAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString(),
        status: 'sent',
        telegramMessageId: `tg_msg_demo_${Date.now()}`
      };

      await this.recordChallengeDelivery(record);
      group.lastChallengeSent = record;
      await this.saveGroup(group);

      return {
        success: true,
        record
      };
    }

    try {
      const res = await fetch(`/api/telegram/chats/${encodeURIComponent(group.chatId)}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          payload,
          chatTitle: group.chatTitle
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        messageId = String(data.messageId || messageId);
        deliveryStatus = 'sent';
      } else {
        deliveryStatus = 'failed';
        errorMessage = data.error || `Telegram API rejected message (HTTP ${res.status})`;
      }
    } catch (e: any) {
      deliveryStatus = 'failed';
      errorMessage = e.message;
    }

    const record: TelegramChallengeRecord = {
      id: `tg_ch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      chatId: group.chatId,
      chatTitle: group.chatTitle,
      challengeNumber,
      problemId: problem.id,
      problemTitle: problem.title,
      difficulty: problem.difficulty as any,
      category: problem.category,
      slot: 'manual_test',
      scheduledAt: new Date().toISOString(),
      deliveredAt: deliveryStatus === 'sent' ? new Date().toISOString() : null,
      status: deliveryStatus,
      telegramMessageId: messageId,
      errorMessage
    };

    // Save in delivery logs
    await this.recordChallengeDelivery(record);

    // Update group's lastChallengeSent
    group.lastChallengeSent = record;
    await this.saveGroup(group);

    return {
      success: deliveryStatus === 'sent',
      record,
      error: errorMessage
    };
  }

  // 6b. Get Recently Detected Groups
  public async getDetectedChats(): Promise<Array<{ chatId: string; title: string; type: string; detectedAt: string }>> {
    try {
      const res = await fetch('/api/telegram/chats/detected');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.detectedChats)) {
          return data.detectedChats;
        }
      }
    } catch { }
    return [];
  }

  // 6c. Setup Webhook (One-Click)
  public async setupWebhook(): Promise<{ ok: boolean; targetUrl?: string; error?: string; description?: string }> {
    try {
      const res = await fetch('/api/telegram/setup-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      return await res.json();
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }

  // 6d. Get Webhook Status
  public async getWebhookStatus(): Promise<TelegramWebhookStatus> {
    try {
      const res = await fetch('/api/telegram/webhook-status');
      if (res.ok) {
        return await res.json();
      }
    } catch { }
    return { configured: false, ok: false };
  }

  // 6e. Get Real-time Telegram Diagnostic Info & Incoming Updates
  public async getDiagnosticInfo(): Promise<{
    success: boolean;
    botConfigured: boolean;
    botIdentity?: any;
    webhookInfo?: any;
    detectedChats?: any[];
    recentUpdates?: any[];
    error?: string;
  }> {
    try {
      const res = await fetch('/api/telegram/diagnostic');
      if (res.ok) {
        return await res.json();
      }
      return { success: false, botConfigured: false, error: `Diagnostic HTTP ${res.status}` };
    } catch (e: any) {
      return { success: false, botConfigured: false, error: e.message };
    }
  }

  // 7. Get Challenge Delivery History
  public async getChallengeHistory(userId: string): Promise<TelegramChallengeRecord[]> {
    try {
      const res = await fetch(`/api/telegram/challenges?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.history && Array.isArray(data.history) && data.history.length > 0) return data.history;
      }
    } catch {
      // Fallback
    }

    if (typeof window === 'undefined') return MOCK_TELEGRAM_HISTORY;
    try {
      const stored = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(MOCK_TELEGRAM_HISTORY));
      return MOCK_TELEGRAM_HISTORY;
    } catch (e) {
      console.error('Error reading telegram challenge history', e);
    }

    return MOCK_TELEGRAM_HISTORY;
  }

  // 8. Record Challenge Delivery Log
  public async recordChallengeDelivery(record: TelegramChallengeRecord): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_HISTORY_KEY);
      const history: TelegramChallengeRecord[] = stored ? JSON.parse(stored) : [];
      const updated = [record, ...history].slice(0, 50);
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving telegram challenge record', e);
    }
  }

  // 9. Generate Single-Use Link Code for /link and Deep Link
  public async generateLinkCode(userId: string, username: string): Promise<TelegramLinkCode> {
    const fallbackCode = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const deepLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=link_${fallbackCode}`;

    let resultObj: TelegramLinkCode = {
      code: fallbackCode,
      userId,
      username,
      expiresAt,
      used: false,
      deepLink
    };

    try {
      const res = await fetch('/api/telegram/link-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.code) {
          resultObj = {
            ...data,
            deepLink: `https://t.me/${TELEGRAM_BOT_USERNAME}?start=link_${data.code}`
          };
        }
      }
    } catch {
      // Fallback
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_LINK_KEY, JSON.stringify(resultObj));
    }

    return resultObj;
  }

  // 10. Check Active Link Code Status
  public getActiveLinkCode(): TelegramLinkCode | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_LINK_KEY);
      if (!stored) return null;
      const parsed: TelegramLinkCode = JSON.parse(stored);
      if (new Date(parsed.expiresAt).getTime() < Date.now()) {
        localStorage.removeItem(STORAGE_LINK_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  // 11. Get Linked Telegram User Profile
  public async getLinkedAccount(userId: string): Promise<TelegramLinkedUser | null> {
    try {
      const res = await fetch(`/api/telegram/account?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.linked && data.account) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_USER_LINK_KEY, JSON.stringify(data.account));
          }
          return data.account;
        } else if (data && !data.linked) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_USER_LINK_KEY);
          }
          return null;
        }
      }
    } catch {
      // Fallback
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_USER_LINK_KEY);
        if (stored) return JSON.parse(stored);
      } catch { }
    }

    return null;
  }

  // 11b. Manually link Telegram account directly (e.g. for user Divya)
  public async linkAccountDirectly(
    userId: string,
    username: string = 'Divya',
    telegramUserId: string = '5990548158'
  ): Promise<TelegramLinkedUser> {
    const cleanUsername = username.replace(/^@/, '').trim() || 'Divya';
    const linkedUser: TelegramLinkedUser = {
      telegramUserId,
      username: cleanUsername,
      firstName: cleanUsername,
      linkedAt: new Date().toISOString()
    };

    try {
      await fetch('/api/telegram/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linkedUser)
      });
    } catch { }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_USER_LINK_KEY, JSON.stringify(linkedUser));
      localStorage.removeItem(STORAGE_LINK_KEY);
    }

    return linkedUser;
  }

  // 12. Unlink Telegram User Account
  public async unlinkAccount(userId: string): Promise<boolean> {
    try {
      await fetch(`/api/telegram/account?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      });
    } catch { }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_USER_LINK_KEY);
      localStorage.removeItem(STORAGE_LINK_KEY);
    }

    return true;
  }

  // 13. Calculate Overall Dashboard Overview Metrics for Telegram
  public async getOverviewStats(userId: string): Promise<TelegramOverviewStats> {
    const groups = await this.getConnectedGroups(userId);
    const history = await this.getChallengeHistory(userId);

    const connectedGroupsCount = groups.filter(g => g.status === 'connected' || g.status === 'config_required').length;
    const totalChallengesDelivered = history.filter(h => h.status === 'sent').length;
    const totalMembersReached = groups.reduce((acc, g) => acc + (g.memberCount || 0), 0);

    let challengesToday = 0;
    groups.forEach(g => {
      if (g.settings.enabled) {
        if (g.settings.morningEnabled) challengesToday++;
        if (g.settings.eveningEnabled) challengesToday++;
      }
    });

    const lastDelivery = history.find(h => h.status === 'sent') || null;

    let overallStatus: TelegramOverviewStats['status'] = 'not_connected';
    if (connectedGroupsCount > 0) {
      overallStatus = 'connected';
    }

    // Determine next delivery slot
    let nextDelivery = null;
    if (connectedGroupsCount > 0 && groups[0]) {
      const group = groups[0];
      const now = new Date();
      const currentHour = now.getHours();
      const morningHour = parseInt(group.settings.morningTime.split(':')[0], 10) || 9;

      const isMorningNext = currentHour < morningHour;
      nextDelivery = {
        time: isMorningNext ? group.settings.morningTime : group.settings.eveningTime,
        slot: isMorningNext ? 'Morning' as const : 'Evening' as const,
        groupName: group.chatTitle
      };
    }

    return {
      status: overallStatus,
      connectedGroupsCount,
      totalChallengesDelivered,
      totalMembersReached,
      challengesToday,
      lastDelivery,
      nextDelivery
    };
  }
}

export const telegramService = new TelegramService();

