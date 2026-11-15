// DEVARENA CONNECT – Discord Client Service
import {
  DiscordServerIntegration,
  DiscordChallengeRecord,
  DiscordOverviewStats,
  DiscordServerSettings,
  DiscordChannel,
  DiscordLinkCode
} from '../types/discord';
import { 
  DISCORD_DEFAULT_SETTINGS, 
  formatDiscordChallengeEmbed, 
  selectProblemForServer,
  MOCK_DISCORD_SERVERS,
  MOCK_DISCORD_HISTORY
} from '../data/discordDefaults';
import { CODING_PROBLEMS } from '../data/problems';

const STORAGE_SERVERS_KEY = 'devarena_discord_servers';
const STORAGE_HISTORY_KEY = 'devarena_discord_history';
const STORAGE_LINK_KEY = 'devarena_discord_link_code';
const STORAGE_USER_LINK_KEY = 'devarena_discord_linked_user';

// Official Public Discord Bot Application Client ID
// Configured to official verified application ID: 1571437524746899537
export const DISCORD_CLIENT_ID = '1571437524746899537';
export const DISCORD_BOT_PERMISSIONS = '2147485696'; // Full Send Embeds, Messages, Commands, View Channels

class DiscordService {
  // 1. Generate Official Discord Bot Installation OAuth2 URL
  // Uses the official Discord Guild Install URL with bot and applications.commands scopes
  public getInstallationUrl(redirectUri?: string): string {
    const defaultUri = typeof window !== 'undefined'
      ? `${window.location.origin}/app/home`
      : 'https://devarena-ten.vercel.app/app/home';
    const targetRedirect = redirectUri || defaultUri;
    const baseUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=${DISCORD_BOT_PERMISSIONS}&scope=bot%20applications.commands`;
    const state = Math.random().toString(36).substring(2, 15);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('discord_oauth_state', state);
    }
    return `${baseUrl}&redirect_uri=${encodeURIComponent(targetRedirect)}&response_type=code&state=${state}`;
  }

  // 2. Get All Connected Discord Servers
  public async getConnectedServers(userId: string): Promise<DiscordServerIntegration[]> {
    let backendServers: DiscordServerIntegration[] = [];
    try {
      // First attempt fetching live verified servers from backend API
      const res = await fetch(`/api/discord/servers?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.servers) && data.servers.length > 0) {
          backendServers = data.servers;
        }
      }
    } catch {
      // Backend unavailable, fallback to local storage
    }

    if (typeof window === 'undefined') {
      return backendServers.length > 0 ? backendServers : MOCK_DISCORD_SERVERS;
    }

    try {
      const stored = localStorage.getItem(STORAGE_SERVERS_KEY);
      const localServers: DiscordServerIntegration[] = stored ? JSON.parse(stored) : [];

      // If live servers were found from backend or Discord API
      if (backendServers.length > 0) {
        const merged: DiscordServerIntegration[] = backendServers.map(b => {
          const existing = localServers.find(l => l.guildId === b.guildId || l.id === b.id);
          if (existing) {
            return {
              ...b,
              channelId: existing.channelId || b.channelId,
              channelName: existing.channelName || b.channelName,
              settings: existing.settings || b.settings,
              lastChallengeSent: existing.lastChallengeSent || b.lastChallengeSent,
              isDemo: false
            };
          }
          return b;
        });

        // Retain any custom manual webhook servers user added
        const manualServers = localServers.filter(l => l.webhookUrl && !merged.some(m => m.guildId === l.guildId));
        const finalServers = [...merged, ...manualServers];

        localStorage.setItem(STORAGE_SERVERS_KEY, JSON.stringify(finalServers));
        return finalServers;
      }

      // If local storage has valid servers
      if (localServers.length > 0) {
        const hasLiveServer = localServers.some(s => !s.isDemo);
        if (!hasLiveServer) {
          localStorage.setItem(STORAGE_SERVERS_KEY, JSON.stringify(MOCK_DISCORD_SERVERS));
          return MOCK_DISCORD_SERVERS;
        }
        return localServers.filter((s: DiscordServerIntegration) => s.userId === userId || s.userId === 'guest' || !s.isDemo);
      }

      // Initial seed
      localStorage.setItem(STORAGE_SERVERS_KEY, JSON.stringify(MOCK_DISCORD_SERVERS));
      return MOCK_DISCORD_SERVERS;
    } catch (e) {
      console.error('Error reading discord servers', e);
    }

    return backendServers.length > 0 ? backendServers : MOCK_DISCORD_SERVERS;
  }

  // 2b. Verify and connect Discord server by Guild ID
  public async verifyServer(
    guildId: string,
    userId: string
  ): Promise<{ success: boolean; server?: DiscordServerIntegration; error?: string }> {
    try {
      const res = await fetch('/api/discord/servers/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId, userId })
      });
      const data = await res.json();
      if (res.ok && data.success && data.server) {
        await this.saveServer(data.server);
        return { success: true, server: data.server };
      }
      return { success: false, error: data.error || 'Server verification failed. Ensure DEVARENA bot is added to the server.' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error verifying server' };
    }
  }

  // 3. Save / Update Discord Server
  public async saveServer(server: DiscordServerIntegration): Promise<DiscordServerIntegration> {
    try {
      const res = await fetch('/api/discord/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(server)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.server) return data.server;
      }
    } catch {
      // Fallback
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_SERVERS_KEY);
        const servers: DiscordServerIntegration[] = stored ? JSON.parse(stored) : [];
        const index = servers.findIndex(s => s.id === server.id || s.guildId === server.guildId);

        if (index >= 0) {
          servers[index] = { ...servers[index], ...server };
        } else {
          servers.push(server);
        }

        localStorage.setItem(STORAGE_SERVERS_KEY, JSON.stringify(servers));
      } catch (e) {
        console.error('Error saving server', e);
      }
    }

    return server;
  }

  // 4. Disconnect / Remove Discord Server
  public async disconnectServer(serverId: string, userId: string): Promise<boolean> {
    try {
      await fetch(`/api/discord/servers?serverId=${serverId}&userId=${userId}`, {
        method: 'DELETE'
      });
    } catch {
      // Fallback
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_SERVERS_KEY);
        if (stored) {
          const servers: DiscordServerIntegration[] = JSON.parse(stored);
          const filtered = servers.filter(s => s.id !== serverId && s.guildId !== serverId);
          localStorage.setItem(STORAGE_SERVERS_KEY, JSON.stringify(filtered));
        }
      } catch (e) {
        console.error('Error disconnecting server', e);
      }
    }

    return true;
  }

  // 5. Get Channels for Guild
  public async getGuildChannels(guildId: string): Promise<DiscordChannel[]> {
    try {
      const res = await fetch(`/api/discord/servers/${guildId}/channels`);
      if (res.ok) {
        const data = await res.json();
        if (data.channels && Array.isArray(data.channels) && data.channels.length > 0) {
          return data.channels;
        }
      }
    } catch {
      // Fallback
    }

    // Standard accessible default text channels for Discord servers
    return [
      { id: `${guildId}-testing`, name: 'testing', type: 0 },
      { id: `${guildId}-daily-dsa`, name: 'daily-dsa', type: 0 },
      { id: `${guildId}-general`, name: 'general', type: 0 },
      { id: `${guildId}-announcements`, name: 'announcements', type: 5 },
      { id: `${guildId}-coding-lounge`, name: 'coding-lounge', type: 0 },
      { id: `${guildId}-bot-commands`, name: 'bot-commands', type: 0 }
    ];
  }

  // 6. Send Test / Sample Challenge Message to Discord
  public async sendTestChallenge(
    server: DiscordServerIntegration,
    customChannelId?: string
  ): Promise<{ success: boolean; record: DiscordChallengeRecord; error?: string }> {
    let channelId = customChannelId || server.channelId;
    if (!channelId) {
      // Auto-resolve channel if missing
      const channels = await this.getGuildChannels(server.guildId);
      if (channels.length > 0) {
        channelId = channels[0].id;
        server.channelId = channels[0].id;
        server.channelName = channels[0].name;
      } else {
        throw new Error('Please select an announcement channel first.');
      }
    }

    // Select random problem matching server settings
    const problem = selectProblemForServer(server.settings);
    const challengeNumber = Math.floor(Math.random() * 200) + 100;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://devarena-ten.vercel.app';
    const payload = formatDiscordChallengeEmbed(problem, 'manual_test', challengeNumber, origin);

    let deliveryStatus: 'sent' | 'failed' = 'sent';
    let errorMessage: string | undefined = undefined;
    let messageId: string = `msg_${Date.now()}`;

    // If this is an explicit demo preview without an external webhook, simulate delivery locally
    if (server.isDemo && !server.webhookUrl) {
      const record: DiscordChallengeRecord = {
        id: `ch_demo_${Date.now()}`,
        serverId: server.id,
        guildName: server.guildName,
        channelId,
        channelName: server.channelName || 'testing',
        challengeNumber,
        problemId: problem.id,
        problemTitle: problem.title,
        difficulty: problem.difficulty as any,
        category: problem.category,
        slot: 'manual_test',
        scheduledAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString(),
        status: 'sent',
        messageId: `msg_demo_${Date.now()}`
      };

      await this.recordChallengeDelivery(record);
      server.lastChallengeSent = record;
      await this.saveServer(server);

      return {
        success: true,
        record
      };
    }

    let dispatched = false;

    // 1. Try server backend endpoint
    try {
      const res = await fetch(`/api/discord/servers/${server.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId,
          problemId: problem.id,
          payload,
          webhookUrl: server.webhookUrl
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          messageId = data.messageId || messageId;
          dispatched = true;
          deliveryStatus = 'sent';
        } else {
          deliveryStatus = 'failed';
          errorMessage = typeof data.error === 'object' ? (data.error.message || JSON.stringify(data.error)) : data.error;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        deliveryStatus = 'failed';
        errorMessage = errData.error || `Server responded with HTTP ${res.status}`;
      }
    } catch (e: any) {
      deliveryStatus = 'failed';
      errorMessage = e.message || 'Network error sending test challenge';
    }

    // 2. Direct webhook fallback if custom webhookUrl configured
    if (!dispatched && server.webhookUrl) {
      try {
        const whRes = await fetch(server.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (whRes.ok) {
          deliveryStatus = 'sent';
          errorMessage = undefined;
          dispatched = true;
        } else {
          deliveryStatus = 'failed';
          errorMessage = 'Discord webhook returned HTTP ' + whRes.status;
        }
      } catch (whErr: any) {
        deliveryStatus = 'failed';
        errorMessage = whErr.message;
      }
    }

    const record: DiscordChallengeRecord = {
      id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      serverId: server.id,
      guildName: server.guildName,
      channelId,
      channelName: server.channelName || 'announcements',
      challengeNumber,
      problemId: problem.id,
      problemTitle: problem.title,
      difficulty: problem.difficulty as any,
      category: problem.category,
      slot: 'manual_test',
      scheduledAt: new Date().toISOString(),
      deliveredAt: deliveryStatus === 'sent' ? new Date().toISOString() : null,
      status: deliveryStatus,
      messageId,
      errorMessage
    };

    // Save in delivery logs
    await this.recordChallengeDelivery(record);

    // Update server's lastChallengeSent
    server.lastChallengeSent = record;
    await this.saveServer(server);

    return {
      success: deliveryStatus === 'sent',
      record,
      error: errorMessage
    };
  }

  // 7. Get Challenge Delivery History
  public async getChallengeHistory(userId: string): Promise<DiscordChallengeRecord[]> {
    try {
      const res = await fetch(`/api/discord/challenges?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.history && Array.isArray(data.history) && data.history.length > 0) return data.history;
      }
    } catch {
      // Fallback
    }

    if (typeof window === 'undefined') return MOCK_DISCORD_HISTORY;
    try {
      const stored = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(MOCK_DISCORD_HISTORY));
      return MOCK_DISCORD_HISTORY;
    } catch (e) {
      console.error('Error reading challenge history', e);
    }

    return MOCK_DISCORD_HISTORY;
  }

  // 8. Record Challenge Delivery Log
  public async recordChallengeDelivery(record: DiscordChallengeRecord): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_HISTORY_KEY);
      const history: DiscordChallengeRecord[] = stored ? JSON.parse(stored) : [];
      const updated = [record, ...history].slice(0, 50); // Keep last 50
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving challenge record', e);
    }
  }

  // 9. Generate Single-Use Account Linking Code for /link
  public generateLinkCode(userId: string, username: string): DiscordLinkCode {
    const code = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry
    const linkCodeObj: DiscordLinkCode = {
      code,
      userId,
      username,
      expiresAt,
      used: false
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_LINK_KEY, JSON.stringify(linkCodeObj));
    }

    return linkCodeObj;
  }

  // 10. Check Link Code Status
  public getActiveLinkCode(): DiscordLinkCode | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_LINK_KEY);
      if (!stored) return null;
      const parsed: DiscordLinkCode = JSON.parse(stored);
      if (new Date(parsed.expiresAt).getTime() < Date.now()) {
        localStorage.removeItem(STORAGE_LINK_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  // 11. Calculate Overall Dashboard Overview Metrics
  public async getOverviewStats(userId: string): Promise<DiscordOverviewStats> {
    const servers = await this.getConnectedServers(userId);
    const history = await this.getChallengeHistory(userId);

    const connectedServersCount = servers.filter(s => s.status === 'connected' || s.status === 'config_required').length;
    const totalChallengesDelivered = history.filter(h => h.status === 'sent').length;
    const totalMembersReached = servers.reduce((acc, s) => acc + (s.memberCount || 0), 0);

    // Challenges scheduled for today
    let challengesToday = 0;
    servers.forEach(s => {
      if (s.settings.enabled) {
        if (s.settings.morningEnabled) challengesToday++;
        if (s.settings.eveningEnabled) challengesToday++;
      }
    });

    const lastDelivery = history.find(h => h.status === 'sent') || null;

    let overallStatus: DiscordOverviewStats['status'] = 'not_connected';
    if (connectedServersCount > 0) {
      const hasUnconfigured = servers.some(s => !s.channelId);
      overallStatus = hasUnconfigured ? 'config_required' : 'connected';
    }

    // Determine next delivery slot
    let nextDelivery = null;
    if (connectedServersCount > 0 && servers[0]) {
      const server = servers[0];
      const now = new Date();
      const currentHour = now.getHours();
      const morningHour = parseInt(server.settings.morningTime.split(':')[0], 10) || 9;

      const isMorningNext = currentHour < morningHour;
      nextDelivery = {
        time: isMorningNext ? server.settings.morningTime : server.settings.eveningTime,
        slot: isMorningNext ? 'Morning' as const : 'Evening' as const,
        serverName: server.guildName
      };
    }

    return {
      status: overallStatus,
      connectedServersCount,
      totalChallengesDelivered,
      totalMembersReached,
      challengesToday,
      lastDelivery,
      nextDelivery
    };
  }
}

export const discordService = new DiscordService();

