import React, { useState, useEffect, useMemo } from 'react';
import {
  Plug,
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  Server,
  Trash2,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Settings2,
  Hash,
  ChevronRight,
  Sparkles,
  Sliders,
  ShieldCheck,
  Code2,
  Link2,
  MessageSquare,
  Info,
  Radio,
  Bell,
  MessageCircle,
  Smartphone,
  Bot
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/sound';

// Discord imports
import {
  DiscordServerIntegration,
  DiscordChallengeRecord,
  DiscordOverviewStats,
  DiscordServerSettings,
  DiscordChannel,
  DiscordLinkCode
} from '../types/discord';
import { discordService } from '../services/discordService';
import {
  DISCORD_DEFAULT_SETTINGS,
  DISCORD_SLASH_COMMANDS,
  AVAILABLE_TOPICS,
  TIMEZONES
} from '../data/discordDefaults';

// Telegram imports
import {
  TelegramChatIntegration,
  TelegramChallengeRecord,
  TelegramOverviewStats,
  TelegramChatSettings,
  TelegramLinkCode,
  TelegramLinkedUser
} from '../types/telegram';
import { telegramService } from '../services/telegramService';
import {
  TELEGRAM_BOT_NAME,
  TELEGRAM_BOT_USERNAME,
  TELEGRAM_BOT_LINK,
  TELEGRAM_INSTALL_LINK,
  TELEGRAM_DEFAULT_SETTINGS,
  TELEGRAM_COMMANDS
} from '../data/telegramDefaults';

export const ConnectPage: React.FC = () => {
  const { user } = useApp();

  // Active Platform View: 'discord' | 'telegram'
  const [activePlatform, setActivePlatform] = useState<'discord' | 'telegram'>('discord');

  // ==========================================
  // DISCORD STATE
  // ==========================================
  const [discordServers, setDiscordServers] = useState<DiscordServerIntegration[]>([]);
  const [discordHistory, setDiscordHistory] = useState<DiscordChallengeRecord[]>([]);
  const [discordOverview, setDiscordOverview] = useState<DiscordOverviewStats>({
    status: 'not_connected',
    connectedServersCount: 0,
    totalChallengesDelivered: 0,
    totalMembersReached: 0,
    challengesToday: 0,
    lastDelivery: null,
    nextDelivery: null
  });
  const [selectedDiscordServerId, setSelectedDiscordServerId] = useState<string | null>(null);
  const [serverChannels, setServerChannels] = useState<Record<string, DiscordChannel[]>>({});
  const [isSendingDiscordTest, setIsSendingDiscordTest] = useState<boolean>(false);
  const [discordTestSuccess, setDiscordTestSuccess] = useState<string | null>(null);
  const [discordTestError, setDiscordTestError] = useState<string | null>(null);
  const [discordLinkCodeData, setDiscordLinkCodeData] = useState<DiscordLinkCode | null>(null);
  const [discordCopiedCode, setDiscordCopiedCode] = useState<boolean>(false);
  const [isManualDiscordModalOpen, setIsManualDiscordModalOpen] = useState<boolean>(false);
  const [manualGuildId, setManualGuildId] = useState<string>('');
  const [manualGuildName, setManualGuildName] = useState<string>('');
  const [manualWebhookUrl, setManualWebhookUrl] = useState<string>('');
  const [isVerifyingDiscordServer, setIsVerifyingDiscordServer] = useState<boolean>(false);
  const [manualDiscordError, setManualDiscordError] = useState<string | null>(null);

  // ==========================================
  // TELEGRAM STATE
  // ==========================================
  const [telegramGroups, setTelegramGroups] = useState<TelegramChatIntegration[]>([]);
  const [telegramHistory, setTelegramHistory] = useState<TelegramChallengeRecord[]>([]);
  const [telegramOverview, setTelegramOverview] = useState<TelegramOverviewStats>({
    status: 'not_connected',
    connectedGroupsCount: 0,
    totalChallengesDelivered: 0,
    totalMembersReached: 0,
    challengesToday: 0,
    lastDelivery: null,
    nextDelivery: null
  });
  const [selectedTelegramGroupId, setSelectedTelegramGroupId] = useState<string | null>(null);
  const [isSendingTelegramTest, setIsSendingTelegramTest] = useState<boolean>(false);
  const [telegramTestSuccess, setTelegramTestSuccess] = useState<string | null>(null);
  const [telegramTestError, setTelegramTestError] = useState<string | null>(null);
  const [telegramLinkCodeData, setTelegramLinkCodeData] = useState<TelegramLinkCode | null>(null);
  const [telegramLinkedAccount, setTelegramLinkedAccount] = useState<TelegramLinkedUser | null>(null);
  const [telegramCopiedCode, setTelegramCopiedCode] = useState<boolean>(false);
  const [isTelegramVerifyModalOpen, setIsTelegramVerifyModalOpen] = useState<boolean>(false);
  const [telegramVerifyChatId, setTelegramVerifyChatId] = useState<string>('');
  const [isVerifyingTelegramChat, setIsVerifyingTelegramChat] = useState<boolean>(false);
  const [telegramVerifyError, setTelegramVerifyError] = useState<string | null>(null);
  const [telegramVerifySuccess, setTelegramVerifySuccess] = useState<string | null>(null);
  const [detectedTelegramChats, setDetectedTelegramChats] = useState<Array<{ chatId: string; title: string; type: string; lastSeenAt?: string; lastMessage?: string }>>([]);
  const [isSyncingWebhook, setIsSyncingWebhook] = useState<boolean>(false);
  const [webhookSyncMsg, setWebhookSyncMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isLoadingDiagnostic, setIsLoadingDiagnostic] = useState<boolean>(false);

  // Global loading
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Initial Data Fetch & OAuth Return Handling
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);

      // Check Discord OAuth return
      const urlParams = new URLSearchParams(window.location.search);
      const guildId = urlParams.get('guild_id');
      const platformParam = urlParams.get('platform');

      if (platformParam === 'telegram') {
        setActivePlatform('telegram');
      }

      if (guildId) {
        const newServer: DiscordServerIntegration = {
          id: `srv_${guildId}`,
          userId: user.id || 'guest',
          guildId,
          guildName: `Discord Guild #${guildId.slice(-4)}`,
          guildIcon: null,
          memberCount: Math.floor(Math.random() * 80) + 12,
          channelId: `${guildId}-daily-dsa`,
          channelName: 'daily-dsa',
          status: 'connected',
          settings: { ...DISCORD_DEFAULT_SETTINGS },
          lastChallengeSent: null,
          connectedAt: new Date().toISOString()
        };

        await discordService.saveServer(newServer);
        sound.success();
        window.history.replaceState({}, '', '/app/connect');
      }

      await refreshAllData();
      setIsLoading(false);
    };

    initData();
  }, [user.id]);

  const refreshAllData = async () => {
    await Promise.all([refreshDiscordData(), refreshTelegramData()]);
  };

  const refreshDiscordData = async () => {
    const fetchedServers = await discordService.getConnectedServers(user.id || 'guest');
    const fetchedHistory = await discordService.getChallengeHistory(user.id || 'guest');
    const stats = await discordService.getOverviewStats(user.id || 'guest');

    setDiscordServers(fetchedServers);
    setDiscordHistory(fetchedHistory);
    setDiscordOverview(stats);

    // If there is a real server (not demo preview), select it automatically
    const liveServer = fetchedServers.find(s => !s.isDemo);
    if (liveServer && (!selectedDiscordServerId || selectedDiscordServerId === 'srv_demo_preview')) {
      setSelectedDiscordServerId(liveServer.id);
    } else if (fetchedServers.length > 0 && !selectedDiscordServerId) {
      setSelectedDiscordServerId(fetchedServers[0].id);
    }

    for (const s of fetchedServers) {
      const channels = await discordService.getGuildChannels(s.guildId);
      setServerChannels(prev => ({ ...prev, [s.guildId]: channels }));

      // Automatically default channel if not set
      if (!s.channelId && channels.length > 0) {
        const defaultChannel = channels.find(c => ['testing', 'general', 'daily-dsa', 'announcements'].includes(c.name.toLowerCase())) || channels[0];
        s.channelId = defaultChannel.id;
        s.channelName = defaultChannel.name;
        await discordService.saveServer(s);
      }
    }

    const activeCode = discordService.getActiveLinkCode();
    setDiscordLinkCodeData(activeCode);
  };

  const refreshTelegramData = async () => {
    const fetchedGroups = await telegramService.getConnectedGroups(user.id || 'guest');
    const fetchedHistory = await telegramService.getChallengeHistory(user.id || 'guest');
    const stats = await telegramService.getOverviewStats(user.id || 'guest');
    const linkedUser = await telegramService.getLinkedAccount(user.id || 'guest');

    setTelegramGroups(fetchedGroups);
    setTelegramHistory(fetchedHistory);
    setTelegramOverview(stats);
    setTelegramLinkedAccount(linkedUser);

    if (fetchedGroups.length > 0 && !selectedTelegramGroupId) {
      setSelectedTelegramGroupId(fetchedGroups[0].id);
    }

    const activeLink = telegramService.getActiveLinkCode();
    setTelegramLinkCodeData(activeLink);
  };

  // Active Discord Server
  const selectedDiscordServer = useMemo(() => {
    return discordServers.find(s => s.id === selectedDiscordServerId) || discordServers[0] || null;
  }, [discordServers, selectedDiscordServerId]);

  // Active Telegram Group
  const selectedTelegramGroup = useMemo(() => {
    return telegramGroups.find(g => g.id === selectedTelegramGroupId) || telegramGroups[0] || null;
  }, [telegramGroups, selectedTelegramGroupId]);

  // -------------------------------------------------------------
  // DISCORD ACTIONS
  // -------------------------------------------------------------
  const handleConnectDiscord = () => {
    sound.click();
    const installUrl = discordService.getInstallationUrl();
    const popup = window.open(installUrl, '_blank', 'width=600,height=800');

    // Automatically poll to detect when the user authorizes the server
    let attempts = 0;
    const pollTimer = setInterval(async () => {
      attempts++;
      const servers = await discordService.getConnectedServers(user.id || 'guest');
      const hasRealServer = servers.some(s => !s.isDemo);

      if (hasRealServer || !popup || popup.closed || attempts > 24) {
        clearInterval(pollTimer);
        await refreshDiscordData();
        sound.success();
      }
    }, 2500);
  };

  const handleDiscordChannelChange = async (channelId: string) => {
    if (!selectedDiscordServer) return;
    sound.click();

    const channels = serverChannels[selectedDiscordServer.guildId] || [];
    const matched = channels.find(c => c.id === channelId);

    const updated: DiscordServerIntegration = {
      ...selectedDiscordServer,
      channelId,
      channelName: matched ? matched.name : channelId,
      status: 'connected'
    };

    await discordService.saveServer(updated);
    await refreshDiscordData();
  };

  const handleDiscordSettingChange = async <K extends keyof DiscordServerSettings>(
    key: K,
    value: DiscordServerSettings[K]
  ) => {
    if (!selectedDiscordServer) return;
    sound.click();

    const updatedSettings: DiscordServerSettings = {
      ...selectedDiscordServer.settings,
      [key]: value
    };

    const updatedServer: DiscordServerIntegration = {
      ...selectedDiscordServer,
      settings: updatedSettings
    };

    await discordService.saveServer(updatedServer);
    setDiscordServers(prev => prev.map(s => s.id === updatedServer.id ? updatedServer : s));
  };

  const toggleDiscordTopic = (topic: string) => {
    if (!selectedDiscordServer) return;
    sound.click();
    const current = selectedDiscordServer.settings.topics || [];
    const next = current.includes(topic)
      ? current.filter(t => t !== topic)
      : [...current, topic];
    handleDiscordSettingChange('topics', next);
  };

  const handleSendDiscordTestMessage = async () => {
    if (!selectedDiscordServer) return;
    sound.click();
    setIsSendingDiscordTest(true);
    setDiscordTestSuccess(null);
    setDiscordTestError(null);

    try {
      const res = await discordService.sendTestChallenge(selectedDiscordServer);
      if (res.success) {
        sound.success();
        setDiscordTestSuccess(`Dispatched challenge to #${res.record.channelName}!`);
        await refreshDiscordData();
      } else {
        sound.defeat();
        setDiscordTestError(res.error || 'Failed to deliver message. Check bot permissions.');
      }
    } catch (err: any) {
      sound.defeat();
      setDiscordTestError(err.message || 'Error executing test challenge.');
    } finally {
      setIsSendingDiscordTest(false);
    }
  };

  const handleDisconnectDiscordServer = async (serverId: string) => {
    sound.click();
    if (!confirm('Are you sure you want to disconnect this Discord server? Automatic challenges will be paused.')) {
      return;
    }
    await discordService.disconnectServer(serverId, user.id || 'guest');
    sound.defeat();
    await refreshDiscordData();
  };

  const handleManualDiscordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.click();
    setManualDiscordError(null);

    // If Guild ID is provided, verify directly with Discord API
    if (manualGuildId.trim()) {
      setIsVerifyingDiscordServer(true);
      const res = await discordService.verifyServer(manualGuildId.trim(), user.id || 'guest');
      setIsVerifyingDiscordServer(false);
      if (res.success && res.server) {
        sound.success();
        setIsManualDiscordModalOpen(false);
        setManualGuildId('');
        setManualGuildName('');
        setManualWebhookUrl('');
        await refreshDiscordData();
        return;
      } else {
        setManualDiscordError(res.error || 'Could not verify Server ID. Make sure DEVARENA bot is added to your server.');
        return;
      }
    }

    if (!manualGuildName.trim()) return;

    const fakeGuildId = `guild_${Date.now()}`;
    const newServer: DiscordServerIntegration = {
      id: `srv_${fakeGuildId}`,
      userId: user.id || 'guest',
      guildId: fakeGuildId,
      guildName: manualGuildName.trim(),
      guildIcon: null,
      memberCount: 24,
      channelId: `${fakeGuildId}-announcements`,
      channelName: 'announcements',
      status: 'connected',
      webhookUrl: manualWebhookUrl.trim() || undefined,
      settings: { ...DISCORD_DEFAULT_SETTINGS },
      lastChallengeSent: null,
      connectedAt: new Date().toISOString()
    };

    await discordService.saveServer(newServer);
    sound.success();
    setIsManualDiscordModalOpen(false);
    setManualGuildId('');
    setManualGuildName('');
    setManualWebhookUrl('');
    await refreshDiscordData();
  };

  const handleGenerateDiscordLinkCode = () => {
    sound.click();
    const codeObj = discordService.generateLinkCode(user.id || 'guest', user.username || 'Coder');
    setDiscordLinkCodeData(codeObj);
  };

  const handleCopyDiscordLinkCode = () => {
    if (!discordLinkCodeData) return;
    sound.click();
    navigator.clipboard.writeText(`/link code:${discordLinkCodeData.code}`);
    setDiscordCopiedCode(true);
    setTimeout(() => setDiscordCopiedCode(false), 2000);
  };

  // -------------------------------------------------------------
  // TELEGRAM ACTIONS
  // -------------------------------------------------------------
  const handleOpenTelegramBot = () => {
    sound.click();
    window.open(TELEGRAM_INSTALL_LINK, '_blank');
  };

  const handleTelegramSettingChange = async <K extends keyof TelegramChatSettings>(
    key: K,
    value: TelegramChatSettings[K]
  ) => {
    if (!selectedTelegramGroup) return;
    sound.click();

    const updatedSettings: TelegramChatSettings = {
      ...selectedTelegramGroup.settings,
      [key]: value
    };

    const updatedGroup: TelegramChatIntegration = {
      ...selectedTelegramGroup,
      settings: updatedSettings
    };

    await telegramService.saveGroup(updatedGroup);
    setTelegramGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };

  const toggleTelegramTopic = (topic: string) => {
    if (!selectedTelegramGroup) return;
    sound.click();
    const current = selectedTelegramGroup.settings.topics || [];
    const next = current.includes(topic)
      ? current.filter(t => t !== topic)
      : [...current, topic];
    handleTelegramSettingChange('topics', next);
  };

  const handleSendTelegramTestMessage = async () => {
    if (!selectedTelegramGroup) return;
    sound.click();
    setIsSendingTelegramTest(true);
    setTelegramTestSuccess(null);
    setTelegramTestError(null);

    try {
      const res = await telegramService.sendTestChallenge(selectedTelegramGroup);
      if (res.success) {
        sound.success();
        setTelegramTestSuccess(`Challenge delivered directly to ${selectedTelegramGroup.chatTitle}!`);
        await refreshTelegramData();
      } else {
        sound.defeat();
        setTelegramTestError(res.error || 'Failed to dispatch Telegram message.');
      }
    } catch (err: any) {
      sound.defeat();
      setTelegramTestError(err.message || 'Error executing Telegram test challenge.');
    } finally {
      setIsSendingTelegramTest(false);
    }
  };

  const handleDisconnectTelegramGroup = async (chatId: string) => {
    sound.click();
    if (!confirm('Are you sure you want to disconnect this Telegram group? Automatic challenges will be stopped.')) {
      return;
    }
    await telegramService.disconnectGroup(chatId, user.id || 'guest');
    sound.defeat();
    await refreshTelegramData();
  };

  const handleGenerateTelegramLinkCode = async () => {
    sound.click();
    const codeObj = await telegramService.generateLinkCode(user.id || 'guest', user.username || 'Coder');
    setTelegramLinkCodeData(codeObj);
  };

  const handleCopyTelegramLinkCommand = () => {
    if (!telegramLinkCodeData) return;
    sound.click();
    navigator.clipboard.writeText(`/link ${telegramLinkCodeData.code}`);
    setTelegramCopiedCode(true);
    setTimeout(() => setTelegramCopiedCode(false), 2000);
  };

  const handleOpenTelegramDeepLink = () => {
    if (!telegramLinkCodeData) return;
    sound.click();
    window.open(telegramLinkCodeData.deepLink, '_blank');
  };

  const handleUnlinkTelegramAccount = async () => {
    sound.click();
    if (!confirm('Are you sure you want to unlink your Telegram account?')) return;
    await telegramService.unlinkAccount(user.id || 'guest');
    sound.defeat();
    setTelegramLinkedAccount(null);
    setTelegramLinkCodeData(null);
    await refreshTelegramData();
  };

  const handleConfirmTelegramLinkDirectly = async (customUsername?: string) => {
    sound.success();
    const usernameToLink = customUsername || 'Divya';
    const linked = await telegramService.linkAccountDirectly(user.id || 'guest', usernameToLink);
    setTelegramLinkedAccount(linked);
    setTelegramLinkCodeData(null);
    await refreshTelegramData();
  };

  const openTelegramVerifyModal = async () => {
    sound.click();
    setIsTelegramVerifyModalOpen(true);
    setTelegramVerifyError(null);
    setTelegramVerifySuccess(null);
    setWebhookSyncMsg(null);
    setIsLoadingDiagnostic(true);
    try {
      const diag = await telegramService.getDiagnosticInfo();
      setDiagnosticData(diag);
      if (diag && Array.isArray(diag.detectedChats)) {
        setDetectedTelegramChats(diag.detectedChats);
      }
    } catch { } finally {
      setIsLoadingDiagnostic(false);
    }
  };

  const handleSyncWebhook = async () => {
    sound.click();
    setIsSyncingWebhook(true);
    setWebhookSyncMsg(null);
    try {
      const res = await telegramService.setupWebhook();
      if (res.ok) {
        sound.success();
        setWebhookSyncMsg({ text: 'Webhook verified & connected to https://devarena-ten.vercel.app/api/telegram/webhook', ok: true });
        const diag = await telegramService.getDiagnosticInfo();
        setDiagnosticData(diag);
        if (diag && Array.isArray(diag.detectedChats)) {
          setDetectedTelegramChats(diag.detectedChats);
        }
      } else {
        sound.defeat();
        setWebhookSyncMsg({ text: res.description || res.error || 'Failed to sync webhook.', ok: false });
      }
    } catch (e: any) {
      sound.defeat();
      setWebhookSyncMsg({ text: e.message || 'Error syncing webhook', ok: false });
    } finally {
      setIsSyncingWebhook(false);
    }
  };

  const handleVerifyTelegramGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.click();
    if (!telegramVerifyChatId.trim()) return;

    setIsVerifyingTelegramChat(true);
    setTelegramVerifyError(null);
    setTelegramVerifySuccess(null);

    const result = await telegramService.verifyAndConnectGroup(
      telegramVerifyChatId.trim(),
      user.id || 'guest'
    );

    setIsVerifyingTelegramChat(false);

    if (result.success && result.chat) {
      sound.success();
      setTelegramVerifySuccess(`Group "${result.chat.chatTitle}" verified & connected!`);
      setTimeout(async () => {
        setIsTelegramVerifyModalOpen(false);
        setTelegramVerifyChatId('');
        await refreshTelegramData();
        setSelectedTelegramGroupId(result.chat!.id);
      }, 1000);
    } else {
      sound.defeat();
      setTelegramVerifyError(result.error || 'Unable to verify chat. Ensure @DEVARENA_CommunityBot is added to the group as administrator.');
    }
  };

  return (
    <div className="min-h-screen bg-[#101314] text-neutral-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">

        {/* ========================================================= */}
        {/* TOP HEADER BANNER (DUAL INTEGRATION DISCORD & TELEGRAM)  */}
        {/* ========================================================= */}
        <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#00E5FF]/10 via-[#24A1DE]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" /> DISCORD
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${discordOverview.status === 'connected'
                  ? 'bg-[#B5FF4A]/10 text-[#B5FF4A] border-[#B5FF4A]/20'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}>
                  {discordOverview.status === 'connected' ? '● ACTIVE' : '○ DISCORD READY'}
                </span>

                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#24A1DE]/20 text-[#24A1DE] border border-[#24A1DE]/30 flex items-center gap-1.5 ml-2">
                  <Bot className="w-3.5 h-3.5" /> TELEGRAM BOT
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${telegramOverview.status === 'connected'
                  ? 'bg-[#B5FF4A]/10 text-[#B5FF4A] border-[#B5FF4A]/20'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}>
                  {telegramOverview.status === 'connected' ? '● ACTIVE' : '○ TELEGRAM READY'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                DEVARENA Connect
              </h1>
              <p className="text-sm sm:text-base text-neutral-300 mt-2 leading-relaxed">
                Seamlessly dispatch automated morning and evening coding challenges, sync developer ratings & streaks, and empower your engineering communities across Discord and Telegram through a single backend.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {activePlatform === 'telegram' ? (
                <>
                  <button
                    onClick={handleOpenTelegramBot}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#24A1DE] hover:bg-[#1E8BC0] text-white font-bold text-xs font-mono transition-all shadow-lg shadow-[#24A1DE]/25 hover:scale-[1.02]"
                  >
                    <Plus className="w-4 h-4" />
                    Add DEVARENA to Telegram
                  </button>
                  <button
                    onClick={() => {
                      sound.click();
                      handleGenerateTelegramLinkCode();
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 text-xs font-mono transition-colors border border-neutral-700/50"
                  >
                    <Smartphone className="w-4 h-4 text-[#24A1DE]" />
                    Connect Telegram Account
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleConnectDiscord}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs font-mono transition-all shadow-lg shadow-[#5865F2]/25 hover:scale-[1.02]"
                  >
                    <Plus className="w-4 h-4" />
                    Add DEVARENA to Discord
                  </button>
                  <button
                    onClick={async () => {
                      sound.click();
                      await refreshDiscordData();
                      sound.success();
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 text-xs font-mono transition-colors border border-neutral-700/50"
                    title="Sync with Discord Bot API"
                  >
                    <RefreshCw className="w-4 h-4 text-[#5865F2]" />
                    Sync Servers
                  </button>
                  <button
                    onClick={() => setIsManualDiscordModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 text-xs font-mono transition-colors border border-neutral-700/50"
                  >
                    <Link2 className="w-4 h-4 text-[#00E5FF]" />
                    Webhook / Custom
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PLATFORM SWITCH TABS: DISCORD vs TELEGRAM                 */}
        {/* ========================================================= */}
        <div className="flex items-center gap-3 border-b border-[#252D30] pb-2">
          <button
            onClick={() => {
              sound.click();
              setActivePlatform('discord');
            }}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-mono text-xs font-bold transition-all ${activePlatform === 'discord'
              ? 'bg-[#5865F2]/20 text-white border border-[#5865F2]/50 shadow-md shadow-[#5865F2]/10'
              : 'text-neutral-400 hover:text-white bg-[#1C2426] border border-transparent'
              }`}
          >
            <Server className={`w-4 h-4 ${activePlatform === 'discord' ? 'text-[#5865F2]' : 'text-neutral-500'}`} />
            <span>Discord Integration</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#101314] text-neutral-300 border border-neutral-700">
              {discordServers.length}
            </span>
          </button>

          <button
            onClick={() => {
              sound.click();
              setActivePlatform('telegram');
            }}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-mono text-xs font-bold transition-all ${activePlatform === 'telegram'
              ? 'bg-[#24A1DE]/20 text-white border border-[#24A1DE]/50 shadow-md shadow-[#24A1DE]/10'
              : 'text-neutral-400 hover:text-white bg-[#1C2426] border border-transparent'
              }`}
          >
            <Bot className={`w-4 h-4 ${activePlatform === 'telegram' ? 'text-[#24A1DE]' : 'text-neutral-500'}`} />
            <span>Telegram Integration</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#101314] text-neutral-300 border border-neutral-700">
              {telegramGroups.length}
            </span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TELEGRAM INTEGRATION VIEW                                 */}
        {/* ========================================================= */}
        {activePlatform === 'telegram' && (
          <div className="space-y-8 animate-fadeIn">

            {/* Telegram Bot Card & Quick Actions */}
            <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#252D30]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#24A1DE]/20 border border-[#24A1DE]/40 flex items-center justify-center text-[#24A1DE]">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white font-mono">{TELEGRAM_BOT_NAME}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#24A1DE]/20 text-[#24A1DE] border border-[#24A1DE]/30">
                        {TELEGRAM_BOT_USERNAME}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${telegramOverview.status === 'connected'
                        ? 'bg-[#B5FF4A]/10 text-[#B5FF4A] border-[#B5FF4A]/20'
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                        }`}>
                        {telegramOverview.status === 'connected' ? '● VERIFIED & CONNECTED' : '○ AWAITING GROUP INSTALLATION'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Official DEVARENA Bot for engineering communities, automated daily challenges, and developer profile stats.
                    </p>
                  </div>
                </div>

                {/* 4 Required Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleOpenTelegramBot}
                    className="px-3.5 py-2 bg-[#24A1DE] hover:bg-[#1E8BC0] text-white font-bold rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 shadow-md shadow-[#24A1DE]/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add DEVARENA to Telegram
                  </button>

                  <button
                    onClick={handleGenerateTelegramLinkCode}
                    className="px-3.5 py-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 text-xs font-mono rounded-lg transition-colors border border-neutral-700/50 flex items-center gap-1.5"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#00E5FF]" />
                    Connect Telegram Account
                  </button>

                  <button
                    onClick={() => {
                      sound.click();
                      const element = document.getElementById('telegram-group-management');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3.5 py-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 text-xs font-mono rounded-lg transition-colors border border-neutral-700/50 flex items-center gap-1.5"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-[#FFAD42]" />
                    Manage Groups
                  </button>

                  <button
                    onClick={() => {
                      sound.click();
                      refreshTelegramData();
                    }}
                    className="px-3.5 py-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 text-xs font-mono rounded-lg transition-colors border border-neutral-700/50 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh Status
                  </button>

                  <button
                    onClick={handleSyncWebhook}
                    disabled={isSyncingWebhook}
                    className="px-3.5 py-2 bg-[#24A1DE]/20 hover:bg-[#24A1DE]/30 text-[#24A1DE] border border-[#24A1DE]/40 font-bold rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWebhook ? 'animate-spin' : ''}`} />
                    {isSyncingWebhook ? 'Syncing...' : 'Sync Bot Webhook'}
                  </button>
                </div>
              </div>

              {/* Bot Link banner */}
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 bg-[#101314] p-3 rounded-xl border border-[#252D30]">
                <span>Installation Link: <code className="text-[#24A1DE]">{TELEGRAM_INSTALL_LINK}</code></span>
                <a
                  href={TELEGRAM_INSTALL_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-400 hover:text-white flex items-center gap-1"
                >
                  Open in Telegram <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Telegram Overview Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 shadow-lg">
                <div className="text-[10px] uppercase font-mono font-bold text-neutral-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#24A1DE]" /> Connected Groups
                </div>
                <div className="text-2xl font-mono font-bold text-white mt-1.5">
                  {telegramOverview.connectedGroupsCount}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                  Verified Telegram chats
                </div>
              </div>

              <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 shadow-lg">
                <div className="text-[10px] uppercase font-mono font-bold text-neutral-400 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-[#B5FF4A]" /> Delivered
                </div>
                <div className="text-2xl font-mono font-bold text-[#B5FF4A] mt-1.5">
                  {telegramOverview.totalChallengesDelivered}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                  Total challenges sent
                </div>
              </div>

              <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 shadow-lg">
                <div className="text-[10px] uppercase font-mono font-bold text-neutral-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#FFAD42]" /> Members Reached
                </div>
                <div className="text-2xl font-mono font-bold text-[#FFAD42] mt-1.5">
                  {telegramOverview.totalMembersReached.toLocaleString()}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                  Across all groups
                </div>
              </div>

              <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 shadow-lg">
                <div className="text-[10px] uppercase font-mono font-bold text-neutral-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" /> Today's Slots
                </div>
                <div className="text-2xl font-mono font-bold text-purple-400 mt-1.5">
                  {telegramOverview.challengesToday}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                  Morning & Evening
                </div>
              </div>

              <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 shadow-lg">
                <div className="text-[10px] uppercase font-mono font-bold text-neutral-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF]" /> Last Delivery
                </div>
                <div className="text-xs font-mono font-bold text-white mt-2 truncate">
                  {telegramOverview.lastDelivery ? telegramOverview.lastDelivery.problemTitle : 'None yet'}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">
                  {telegramOverview.lastDelivery ? new Date(telegramOverview.lastDelivery.deliveredAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Awaiting schedule'}
                </div>
              </div>

              <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 shadow-lg">
                <div className="text-[10px] uppercase font-mono font-bold text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" /> Next Dispatch
                </div>
                <div className="text-xs font-mono font-bold text-[#24A1DE] mt-2 truncate">
                  {telegramOverview.nextDelivery ? `${telegramOverview.nextDelivery.slot} (${telegramOverview.nextDelivery.time})` : 'Paused'}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">
                  {telegramOverview.nextDelivery?.groupName || 'Configure schedule'}
                </div>
              </div>
            </div>

            {/* Telegram Connected Groups Roster & Admin Control Center */}
            <div id="telegram-group-management" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#24A1DE]" />
                  <h2 className="text-base font-mono font-bold text-white uppercase tracking-wider">
                    Connected Telegram Groups ({telegramGroups.length})
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={openTelegramVerifyModal}
                    className="text-xs font-mono text-[#24A1DE] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Connect / Verify Chat ID
                  </button>

                  <button
                    onClick={refreshTelegramData}
                    className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                </div>
              </div>

              {telegramGroups.length === 0 ? (
                /* Telegram Empty State */
                <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl p-10 text-center space-y-4 shadow-xl">
                  <div className="w-14 h-14 rounded-2xl bg-[#24A1DE]/20 border border-[#24A1DE]/30 text-[#24A1DE] flex items-center justify-center mx-auto">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-bold text-white font-mono">No Telegram Groups Connected</h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      Add the official DEVARENA Bot (@DEVARENA_CommunityBot) to your Telegram groups. As soon as the bot is added, the backend detects group installation via official Bot API updates.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleOpenTelegramBot}
                      className="px-5 py-2.5 rounded-xl bg-[#24A1DE] hover:bg-[#1E8BC0] text-white text-xs font-mono font-bold transition-all shadow-md shadow-[#24A1DE]/20 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add DEVARENA to Telegram
                    </button>
                    <button
                      onClick={openTelegramVerifyModal}
                      className="px-4 py-2.5 rounded-xl bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 text-xs font-mono transition-colors border border-neutral-700"
                    >
                      Verify Chat ID Manually
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Group Manager */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Group Roster (4 cols) */}
                  <div className="lg:col-span-4 space-y-3">
                    {telegramGroups.map(grp => {
                      const isSelected = selectedTelegramGroup?.id === grp.id;
                      return (
                        <div
                          key={grp.id}
                          onClick={() => {
                            sound.click();
                            setSelectedTelegramGroupId(grp.id);
                            setTelegramTestSuccess(null);
                            setTelegramTestError(null);
                          }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
                            ? 'bg-[#252D30] border-[#24A1DE] shadow-lg shadow-[#24A1DE]/10'
                            : 'bg-[#1C2426] border-[#252D30] hover:border-neutral-600'
                            }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#24A1DE]/20 border border-[#24A1DE]/30 flex items-center justify-center text-[#24A1DE] font-mono font-bold text-sm shrink-0">
                              <Bot className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white font-mono truncate">
                                {grp.chatTitle}
                              </h4>
                              <span className="text-[10px] text-neutral-500 font-mono block truncate">
                                ID: {grp.chatId} • {grp.chatType}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {grp.isDemo ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                                DEMO PREVIEW
                              </span>
                            ) : (
                              <span className={`w-2 h-2 rounded-full ${grp.status === 'connected' ? 'bg-[#B5FF4A]' : 'bg-rose-500'
                                }`} />
                            )}
                            <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#24A1DE]' : 'text-neutral-600'}`} />
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={openTelegramVerifyModal}
                      className="w-full py-3 rounded-xl border border-dashed border-neutral-700 hover:border-[#24A1DE] text-neutral-400 hover:text-white text-xs font-mono transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Connect Another Telegram Group
                    </button>
                  </div>

                  {/* Right Column: Group Control Center (8 cols) */}
                  {selectedTelegramGroup && (
                    <div className="lg:col-span-8 bg-[#1C2426] border border-[#252D30] rounded-2xl p-6 shadow-xl space-y-6">
                      {/* Group Header & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#252D30]">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white font-mono">
                              {selectedTelegramGroup.chatTitle}
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#101314] text-neutral-400 border border-[#252D30]">
                              ID: {selectedTelegramGroup.chatId}
                            </span>
                            {selectedTelegramGroup.isDemo && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                                DEMO PREVIEW
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                            <span>Connected {new Date(selectedTelegramGroup.connectedAt).toLocaleDateString()}</span>
                            <span>•</span>
                            {selectedTelegramGroup.isDemo ? (
                              <span className="text-amber-400 flex items-center gap-1 font-mono">
                                <Sparkles className="w-3.5 h-3.5" /> Demo Sandbox Mode
                              </span>
                            ) : (
                              <span className="text-[#B5FF4A] flex items-center gap-1 font-mono">
                                <ShieldCheck className="w-3.5 h-3.5" /> Bot Permissions Verified
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSendTelegramTestMessage}
                            disabled={isSendingTelegramTest}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#24A1DE] hover:bg-[#1E8BC0] text-white font-bold rounded-lg text-xs font-mono transition-all disabled:opacity-40"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {isSendingTelegramTest ? 'Sending...' : 'Send Test Challenge'}
                          </button>

                          <button
                            onClick={() => handleDisconnectTelegramGroup(selectedTelegramGroup.chatId)}
                            className="p-2 bg-[#252D30] hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 rounded-lg transition-colors border border-neutral-700/50"
                            title="Disconnect Group"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Demo Preview Notice */}
                      {selectedTelegramGroup.isDemo && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs font-mono text-amber-300">
                          <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-200">Demo Sandbox Preview:</span> This group preview demonstrates automated daily challenge scheduling and Telegram bot commands (@DEVARENA_CommunityBot) in stateless mock mode. To broadcast challenges to your live Telegram group, click <strong>"Add Another Telegram Group"</strong> or verify your Chat ID.
                          </div>
                        </div>
                      )}

                      {/* Feedback Alerts */}
                      {telegramTestSuccess && (
                        <div className="bg-[#B5FF4A]/10 border border-[#B5FF4A]/30 rounded-xl p-3 flex items-center gap-2 text-xs font-mono text-[#B5FF4A] animate-fadeIn">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{telegramTestSuccess}</span>
                        </div>
                      )}

                      {telegramTestError && (
                        <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 flex items-center gap-2 text-xs font-mono text-rose-300 animate-fadeIn">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{telegramTestError}</span>
                        </div>
                      )}

                      {/* Challenge Automation Settings */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-[#24A1DE]" />
                            Daily Challenge Automation Rules
                          </h4>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-neutral-300">
                            <span>Automation Active</span>
                            <input
                              type="checkbox"
                              checked={selectedTelegramGroup.settings.enabled}
                              onChange={e => handleTelegramSettingChange('enabled', e.target.checked)}
                              className="accent-[#24A1DE] w-4 h-4 cursor-pointer"
                            />
                          </label>
                        </div>

                        {/* Schedules & Timezone */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Morning */}
                          <div className="bg-[#101314] p-3.5 rounded-xl border border-[#252D30] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-white">☀️ Morning Slot</span>
                              <input
                                type="checkbox"
                                checked={selectedTelegramGroup.settings.morningEnabled}
                                onChange={e => handleTelegramSettingChange('morningEnabled', e.target.checked)}
                                className="accent-[#24A1DE] w-3.5 h-3.5 cursor-pointer"
                              />
                            </div>
                            <input
                              type="time"
                              value={selectedTelegramGroup.settings.morningTime}
                              onChange={e => handleTelegramSettingChange('morningTime', e.target.value)}
                              disabled={!selectedTelegramGroup.settings.morningEnabled}
                              className="w-full bg-[#1C2426] text-xs font-mono text-white px-3 py-1.5 rounded border border-[#252D30] focus:outline-none focus:border-[#24A1DE] disabled:opacity-40"
                            />
                          </div>

                          {/* Evening */}
                          <div className="bg-[#101314] p-3.5 rounded-xl border border-[#252D30] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-white">🌙 Evening Slot</span>
                              <input
                                type="checkbox"
                                checked={selectedTelegramGroup.settings.eveningEnabled}
                                onChange={e => handleTelegramSettingChange('eveningEnabled', e.target.checked)}
                                className="accent-[#24A1DE] w-3.5 h-3.5 cursor-pointer"
                              />
                            </div>
                            <input
                              type="time"
                              value={selectedTelegramGroup.settings.eveningTime}
                              onChange={e => handleTelegramSettingChange('eveningTime', e.target.value)}
                              disabled={!selectedTelegramGroup.settings.eveningEnabled}
                              className="w-full bg-[#1C2426] text-xs font-mono text-white px-3 py-1.5 rounded border border-[#252D30] focus:outline-none focus:border-[#24A1DE] disabled:opacity-40"
                            />
                          </div>

                          {/* Timezone */}
                          <div className="bg-[#101314] p-3.5 rounded-xl border border-[#252D30] space-y-2">
                            <span className="text-xs font-mono font-bold text-white block">🌐 Timezone</span>
                            <select
                              value={selectedTelegramGroup.settings.timezone}
                              onChange={e => handleTelegramSettingChange('timezone', e.target.value)}
                              className="w-full bg-[#1C2426] text-[11px] font-mono text-white px-2 py-1.5 rounded border border-[#252D30] focus:outline-none focus:border-[#24A1DE] cursor-pointer"
                            >
                              {TIMEZONES.map(tz => (
                                <option key={tz.value} value={tz.value}>{tz.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Difficulty */}
                        <div className="bg-[#101314] p-3.5 rounded-xl border border-[#252D30] space-y-2">
                          <span className="text-xs font-mono font-bold text-white block">
                            Difficulty Filter
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {(['Mixed', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
                              <button
                                key={diff}
                                onClick={() => handleTelegramSettingChange('difficulty', diff)}
                                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors border ${selectedTelegramGroup.settings.difficulty === diff
                                  ? 'bg-[#24A1DE]/20 border-[#24A1DE] text-[#24A1DE] font-bold'
                                  : 'bg-[#1C2426] border-[#252D30] text-neutral-400 hover:text-white'
                                  }`}
                              >
                                {diff}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Topics */}
                        <div className="bg-[#101314] p-3.5 rounded-xl border border-[#252D30] space-y-2">
                          <span className="text-xs font-mono font-bold text-white block">
                            Included Topics ({selectedTelegramGroup.settings.topics.length} Selected)
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {AVAILABLE_TOPICS.map(topic => {
                              const isChecked = selectedTelegramGroup.settings.topics.includes(topic);
                              return (
                                <button
                                  key={topic}
                                  onClick={() => toggleTelegramTopic(topic)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors border ${isChecked
                                    ? 'bg-[#B5FF4A]/15 border-[#B5FF4A]/40 text-[#B5FF4A] font-bold'
                                    : 'bg-[#1C2426] border-[#252D30] text-neutral-500 hover:text-neutral-300'
                                    }`}
                                >
                                  {topic}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Telegram Private Account Linking Section */}
            <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#24A1DE]" />
                    Link Personal Telegram Account
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Connect your personal Telegram account to track daily coding streaks, sync battle rank tier, and receive private challenge reminders.
                  </p>
                </div>

                {telegramLinkedAccount ? (
                  <button
                    onClick={handleUnlinkTelegramAccount}
                    className="px-4 py-2 bg-[#252D30] hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 text-xs font-mono rounded-lg transition-colors border border-neutral-700/50 shrink-0"
                  >
                    Unlink Telegram Profile
                  </button>
                ) : (
                  <button
                    onClick={handleGenerateTelegramLinkCode}
                    className="px-4 py-2 bg-[#24A1DE] hover:bg-[#1E8BC0] text-white font-bold text-xs font-mono rounded-lg transition-all shadow-md shadow-[#24A1DE]/20 flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Single-Use Link Code
                  </button>
                )}
              </div>

              {/* Status if linked */}
              {telegramLinkedAccount ? (
                <div className="bg-[#101314] rounded-xl p-4 border border-[#B5FF4A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#B5FF4A]/20 border border-[#B5FF4A]/30 flex items-center justify-center text-[#B5FF4A]">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                        <span>Linked to: @{telegramLinkedAccount.username || 'Telegram User'}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">ID: {telegramLinkedAccount.telegramUserId}</span>
                      </div>
                      <span className="text-[10px] text-[#B5FF4A] font-mono">
                        Active synchronization enabled • Linked {new Date(telegramLinkedAccount.linkedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : telegramLinkCodeData ? (
                /* Link code active card */
                <div className="bg-[#101314] rounded-xl p-4 border border-[#252D30] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">Step 1: Execute in Telegram</span>
                    <div className="text-sm font-mono font-bold text-[#24A1DE] tracking-wider bg-[#1C2426] px-3 py-1.5 rounded-lg border border-neutral-700 inline-block">
                      /link {telegramLinkCodeData.code}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      Code valid for 15 minutes. Single-use hashed token.
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleOpenTelegramDeepLink}
                      className="px-4 py-2 bg-[#24A1DE] hover:bg-[#1E8BC0] text-white font-bold text-xs font-mono rounded-lg transition-all shadow-md shadow-[#24A1DE]/20 flex items-center gap-1.5 shrink-0"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      Open Bot in Telegram
                    </button>
                    <button
                      onClick={handleCopyTelegramLinkCommand}
                      className="px-4 py-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 text-xs font-mono rounded-lg transition-colors border border-neutral-700 flex items-center gap-1.5 shrink-0"
                    >
                      {telegramCopiedCode ? <Check className="w-3.5 h-3.5 text-[#B5FF4A]" /> : <Copy className="w-3.5 h-3.5" />}
                      {telegramCopiedCode ? 'Copied' : 'Copy Command'}
                    </button>
                    <button
                      onClick={() => handleConfirmTelegramLinkDirectly('Divya')}
                      className="px-4 py-2 bg-[#B5FF4A] hover:brightness-110 text-black font-bold text-xs font-mono rounded-lg transition-all shadow-md shadow-[#B5FF4A]/20 flex items-center gap-1.5 shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Confirm & Link Now
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#101314] rounded-xl p-4 border border-[#252D30] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-bold text-white">No Telegram Account Linked</span>
                    <p className="text-[10px] text-neutral-400 font-mono">Link your Telegram profile to sync your rating, rank tier, and coding streaks.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleConfirmTelegramLinkDirectly('Divya')}
                      className="px-3.5 py-2 bg-[#B5FF4A] hover:brightness-110 text-black font-bold text-xs font-mono rounded-lg transition-all shadow-md shadow-[#B5FF4A]/20 flex items-center gap-1.5 shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Instant Link as @Divya
                    </button>
                    <button
                      onClick={handleGenerateTelegramLinkCode}
                      className="px-3.5 py-2 bg-[#24A1DE] hover:bg-[#1E8BC0] text-white font-bold text-xs font-mono rounded-lg transition-all shadow-md shadow-[#24A1DE]/20 flex items-center gap-1.5 shrink-0"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Generate Link Code
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Telegram Bot Commands Reference */}
            <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#24A1DE]" />
                  Official Telegram Bot Commands Reference
                </h3>
                <span className="text-[10px] font-mono text-neutral-500">
                  @DEVARENA_CommunityBot • Live Commands
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {TELEGRAM_COMMANDS.map(cmd => (
                  <div
                    key={cmd.name}
                    className="bg-[#101314] border border-[#252D30] rounded-xl p-3.5 space-y-2 hover:border-[#24A1DE]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#24A1DE] bg-[#24A1DE]/10 px-2 py-0.5 rounded border border-[#24A1DE]/20">
                        {cmd.syntax}
                      </span>
                      {cmd.adminOnly && (
                        <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                      {cmd.description}
                    </p>
                    <div className="text-[10px] font-mono text-neutral-500 pt-1 border-t border-[#252D30]/60 truncate">
                      {cmd.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Telegram Challenge Delivery History */}
            <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#B5FF4A]" />
                  Telegram Challenge Delivery Logs
                </h3>
                <span className="text-[10px] font-mono text-neutral-500">
                  Automated dual schedules & test dispatches
                </span>
              </div>

              {telegramHistory.length === 0 ? (
                <div className="py-10 text-center text-neutral-500 font-mono text-xs">
                  No delivery records for Telegram yet. Connect a group and click "Send Test Challenge" to verify delivery.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-[#252D30] bg-[#101314]/80 text-neutral-400">
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Challenge</th>
                        <th className="py-2.5 px-3">Difficulty</th>
                        <th className="py-2.5 px-3">Group</th>
                        <th className="py-2.5 px-3">Slot</th>
                        <th className="py-2.5 px-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#252D30]/60">
                      {telegramHistory.slice(0, 15).map(h => (
                        <tr key={h.id} className="hover:bg-[#252D30]/30 transition-colors">
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.status === 'sent'
                              ? 'bg-[#B5FF4A]/10 text-[#B5FF4A] border border-[#B5FF4A]/20'
                              : h.status === 'failed'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                              {h.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-white font-bold">
                            #{h.challengeNumber} {h.problemTitle}
                          </td>
                          <td className="py-2 px-3 text-neutral-300">
                            {h.difficulty}
                          </td>
                          <td className="py-2 px-3 text-neutral-400">
                            {h.chatTitle}
                          </td>
                          <td className="py-2 px-3 uppercase text-neutral-400 text-[10px]">
                            {h.slot}
                          </td>
                          <td className="py-2 px-3 text-neutral-400">
                            {h.deliveredAt ? new Date(h.deliveredAt).toLocaleString() : 'Pending'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* DISCORD INTEGRATION VIEW (ORIGINAL FEATURE RESTORED)      */}
        {/* ========================================================= */}
        {activePlatform === 'discord' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Discord Overview Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 shadow-lg">
                <div className="text-[10px] uppercase font-mono font-bold text-neutral-400 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-[#00E5FF]" /> Connected Servers
                </div>
                <div className="text-2xl font-mono font-bold text-white mt-1.5">
                  {discordOverview.connectedServersCount}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                  Active integrations
                </div>
              </div>

              <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 shadow-lg">
                <div className="text-[10px] uppercase font-mono font-bold text-neutral-400 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-[#B5FF4A]" /> Delivered
                </div>
                <div className="text-2xl font-mono font-bold text-[#B5FF4A] mt-1.5">
                  {discordOverview.totalChallengesDelivered}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                  Total challenges sent
                </div>
              </div>

              <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 shadow-lg">
                <div className="text-[10px] uppercase font-mono font-bold text-neutral-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#FFAD42]" /> Members Reached
                </div>
                <div className="text-2xl font-mono font-bold text-[#FFAD42] mt-1.5">
                  {discordOverview.totalMembersReached.toLocaleString()}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                  Across all guilds
                </div>
              </div>

              <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 shadow-lg">
                <div className="text-[10px] uppercase font-mono font-bold text-neutral-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" /> Today's Slots
                </div>
                <div className="text-2xl font-mono font-bold text-purple-400 mt-1.5">
                  {discordOverview.challengesToday}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                  Morning & Evening
                </div>
              </div>

              <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 shadow-lg">
                <div className="text-[10px] uppercase font-mono font-bold text-neutral-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF]" /> Last Delivery
                </div>
                <div className="text-xs font-mono font-bold text-white mt-2 truncate">
                  {discordOverview.lastDelivery ? discordOverview.lastDelivery.problemTitle : 'None yet'}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">
                  {discordOverview.lastDelivery ? new Date(discordOverview.lastDelivery.deliveredAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Awaiting schedule'}
                </div>
              </div>

              <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 shadow-lg">
                <div className="text-[10px] uppercase font-mono font-bold text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" /> Next Dispatch
                </div>
                <div className="text-xs font-mono font-bold text-[#00E5FF] mt-2 truncate">
                  {discordOverview.nextDelivery ? `${discordOverview.nextDelivery.slot} (${discordOverview.nextDelivery.time})` : 'Paused'}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">
                  {discordOverview.nextDelivery?.serverName || 'Configure schedule'}
                </div>
              </div>
            </div>

            {/* Connected Discord Servers */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#00E5FF]" />
                  <h2 className="text-base font-mono font-bold text-white uppercase tracking-wider">
                    Connected Discord Servers ({discordServers.length})
                  </h2>
                </div>

                <button
                  onClick={refreshDiscordData}
                  className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              {discordServers.length === 0 ? (
                <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl p-10 text-center space-y-4 shadow-xl">
                  <div className="w-14 h-14 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#5865F2] flex items-center justify-center mx-auto">
                    <Plug className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-bold text-white font-mono">No Discord Servers Connected</h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      Install DEVARENA into your Discord server to automatically post daily morning & evening algorithm challenges directly into your community.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleConnectDiscord}
                      className="px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-mono font-bold transition-all shadow-md shadow-[#5865F2]/20 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add DEVARENA to Discord
                    </button>
                    <button
                      onClick={() => setIsManualDiscordModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 text-xs font-mono transition-colors border border-neutral-700"
                    >
                      Connect via Webhook
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Server Roster */}
                  <div className="lg:col-span-4 space-y-3">
                    {discordServers.map(srv => {
                      const isSelected = selectedDiscordServer?.id === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => {
                            sound.click();
                            setSelectedDiscordServerId(srv.id);
                            setDiscordTestSuccess(null);
                            setDiscordTestError(null);
                          }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
                            ? 'bg-[#252D30] border-[#00E5FF] shadow-lg shadow-[#00E5FF]/10'
                            : 'bg-[#1C2426] border-[#252D30] hover:border-neutral-600'
                            }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2] font-mono font-bold text-sm shrink-0 overflow-hidden">
                              {srv.guildIcon ? (
                                <img src={srv.guildIcon} alt={srv.guildName} className="w-full h-full object-cover" />
                              ) : (
                                srv.guildName.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white font-mono truncate">
                                {srv.guildName}
                              </h4>
                              <span className="text-[10px] text-neutral-500 font-mono block">
                                {srv.channelName ? `#${srv.channelName}` : 'No channel selected'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {srv.isDemo ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                                DEMO PREVIEW
                              </span>
                            ) : (
                              <span className={`w-2 h-2 rounded-full ${srv.channelId ? 'bg-[#B5FF4A]' : 'bg-amber-400 animate-pulse'
                                }`} />
                            )}
                            <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#00E5FF]' : 'text-neutral-600'}`} />
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={handleConnectDiscord}
                      className="w-full py-3 rounded-xl border border-dashed border-neutral-700 hover:border-[#5865F2] text-neutral-400 hover:text-white text-xs font-mono transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Another Server
                    </button>
                  </div>

                  {/* Right Column: Server Control Center */}
                  {selectedDiscordServer && (
                    <div className="lg:col-span-8 bg-[#1C2426] border border-[#252D30] rounded-2xl p-6 shadow-xl space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#252D30]">
                        <div className="flex items-center gap-3">
                          {selectedDiscordServer.guildIcon && (
                            <img
                              src={selectedDiscordServer.guildIcon}
                              alt={selectedDiscordServer.guildName}
                              className="w-12 h-12 rounded-xl object-cover border border-[#5865F2]/30 shrink-0"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-white font-mono">
                                {selectedDiscordServer.guildName}
                              </h3>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#101314] text-neutral-400 border border-[#252D30]">
                                ID: {selectedDiscordServer.guildId}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-400 mt-0.5">
                              Connected {new Date(selectedDiscordServer.connectedAt).toLocaleDateString()} • {selectedDiscordServer.memberCount} members
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSendDiscordTestMessage}
                            disabled={isSendingDiscordTest || !selectedDiscordServer.channelId}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#00E5FF] hover:brightness-110 text-black font-bold rounded-lg text-xs font-mono transition-all disabled:opacity-40"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {isSendingDiscordTest ? 'Sending...' : 'Send Test Challenge'}
                          </button>

                          <button
                            onClick={() => handleDisconnectDiscordServer(selectedDiscordServer.id)}
                            className="p-2 bg-[#252D30] hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 rounded-lg transition-colors border border-neutral-700/50"
                            title="Disconnect Server"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Demo Preview Notice */}
                      {selectedDiscordServer.isDemo && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs font-mono text-amber-300">
                          <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-200">Demo Sandbox Preview:</span> This server preview demonstrates automated morning & evening challenge dispatch and slash commands in stateless mock mode. To broadcast challenges to your live Discord community, click <strong>"Add Another Server"</strong> or configure an incoming webhook.
                          </div>
                        </div>
                      )}

                      {discordTestSuccess && (
                        <div className="bg-[#B5FF4A]/10 border border-[#B5FF4A]/30 rounded-xl p-3 flex items-center gap-2 text-xs font-mono text-[#B5FF4A] animate-fadeIn">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{discordTestSuccess}</span>
                        </div>
                      )}

                      {discordTestError && (
                        <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 flex items-center gap-2 text-xs font-mono text-rose-300 animate-fadeIn">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{discordTestError}</span>
                        </div>
                      )}

                      <div className="bg-[#101314] rounded-xl p-4 border border-[#252D30] space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Hash className="w-3.5 h-3.5 text-[#00E5FF]" /> Announcement Channel
                          </label>
                          <span className="text-[10px] font-mono text-neutral-500">
                            Where daily challenges are posted
                          </span>
                        </div>

                        <select
                          value={selectedDiscordServer.channelId || ''}
                          onChange={e => handleDiscordChannelChange(e.target.value)}
                          className="w-full bg-[#1C2426] text-xs font-mono text-white px-3.5 py-2.5 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF] cursor-pointer"
                        >
                          <option value="" disabled>-- Select Announcement Channel --</option>
                          {(serverChannels[selectedDiscordServer.guildId] || []).map(ch => (
                            <option key={ch.id} value={ch.id}>
                              #{ch.name} {ch.type === 5 ? '(Announcement)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-[#FFAD42]" />
                            Daily Challenge Schedule & Rules
                          </h4>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-neutral-300">
                            <span>Schedule Active</span>
                            <input
                              type="checkbox"
                              checked={selectedDiscordServer.settings.enabled}
                              onChange={e => handleDiscordSettingChange('enabled', e.target.checked)}
                              className="accent-[#00E5FF] w-4 h-4 cursor-pointer"
                            />
                          </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-[#101314] p-3.5 rounded-xl border border-[#252D30] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-white">☀️ Morning Slot</span>
                              <input
                                type="checkbox"
                                checked={selectedDiscordServer.settings.morningEnabled}
                                onChange={e => handleDiscordSettingChange('morningEnabled', e.target.checked)}
                                className="accent-[#00E5FF] w-3.5 h-3.5 cursor-pointer"
                              />
                            </div>
                            <input
                              type="time"
                              value={selectedDiscordServer.settings.morningTime}
                              onChange={e => handleDiscordSettingChange('morningTime', e.target.value)}
                              disabled={!selectedDiscordServer.settings.morningEnabled}
                              className="w-full bg-[#1C2426] text-xs font-mono text-white px-3 py-1.5 rounded border border-[#252D30] focus:outline-none focus:border-[#00E5FF] disabled:opacity-40"
                            />
                          </div>

                          <div className="bg-[#101314] p-3.5 rounded-xl border border-[#252D30] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-white">🌙 Evening Slot</span>
                              <input
                                type="checkbox"
                                checked={selectedDiscordServer.settings.eveningEnabled}
                                onChange={e => handleDiscordSettingChange('eveningEnabled', e.target.checked)}
                                className="accent-[#00E5FF] w-3.5 h-3.5 cursor-pointer"
                              />
                            </div>
                            <input
                              type="time"
                              value={selectedDiscordServer.settings.eveningTime}
                              onChange={e => handleDiscordSettingChange('eveningTime', e.target.value)}
                              disabled={!selectedDiscordServer.settings.eveningEnabled}
                              className="w-full bg-[#1C2426] text-xs font-mono text-white px-3 py-1.5 rounded border border-[#252D30] focus:outline-none focus:border-[#00E5FF] disabled:opacity-40"
                            />
                          </div>

                          <div className="bg-[#101314] p-3.5 rounded-xl border border-[#252D30] space-y-2">
                            <span className="text-xs font-mono font-bold text-white block">🌐 Timezone</span>
                            <select
                              value={selectedDiscordServer.settings.timezone}
                              onChange={e => handleDiscordSettingChange('timezone', e.target.value)}
                              className="w-full bg-[#1C2426] text-[11px] font-mono text-white px-2 py-1.5 rounded border border-[#252D30] focus:outline-none focus:border-[#00E5FF] cursor-pointer"
                            >
                              {TIMEZONES.map(tz => (
                                <option key={tz.value} value={tz.value}>{tz.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="bg-[#101314] p-3.5 rounded-xl border border-[#252D30] space-y-2">
                          <span className="text-xs font-mono font-bold text-white block">
                            Problem Difficulty Filtering
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {(['Mixed', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
                              <button
                                key={diff}
                                onClick={() => handleDiscordSettingChange('difficulty', diff)}
                                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors border ${selectedDiscordServer.settings.difficulty === diff
                                  ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] font-bold'
                                  : 'bg-[#1C2426] border-[#252D30] text-neutral-400 hover:text-white'
                                  }`}
                              >
                                {diff}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-[#101314] p-3.5 rounded-xl border border-[#252D30] space-y-2">
                          <span className="text-xs font-mono font-bold text-white block">
                            Included Topics ({selectedDiscordServer.settings.topics.length} Selected)
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {AVAILABLE_TOPICS.map(topic => {
                              const isChecked = selectedDiscordServer.settings.topics.includes(topic);
                              return (
                                <button
                                  key={topic}
                                  onClick={() => toggleDiscordTopic(topic)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors border ${isChecked
                                    ? 'bg-[#B5FF4A]/15 border-[#B5FF4A]/40 text-[#B5FF4A] font-bold'
                                    : 'bg-[#1C2426] border-[#252D30] text-neutral-500 hover:text-neutral-300'
                                    }`}
                                >
                                  {topic}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Discord Account Linking */}
            <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-[#00E5FF]" />
                    Link Discord Identity to DEVARENA Account
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Pair your Discord user profile to unlock personalized stats, leaderboard synchronization, and streak tracking.
                  </p>
                </div>

                <button
                  onClick={handleGenerateDiscordLinkCode}
                  className="px-4 py-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 text-xs font-mono rounded-lg transition-colors border border-neutral-700/50 flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FFAD42]" />
                  Generate Single-Use Link Code
                </button>
              </div>

              {discordLinkCodeData && (
                <div className="bg-[#101314] rounded-xl p-4 border border-[#252D30] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">Step 1: Execute this command in Discord</span>
                    <div className="text-sm font-mono font-bold text-[#00E5FF] tracking-wider bg-[#1C2426] px-3 py-1.5 rounded-lg border border-neutral-700 inline-block">
                      /link code:{discordLinkCodeData.code}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      Code expires in 15 minutes. Single-use only.
                    </div>
                  </div>

                  <button
                    onClick={handleCopyDiscordLinkCode}
                    className="px-4 py-2 bg-[#00E5FF] text-black font-bold text-xs font-mono rounded-lg transition-all shadow-md shadow-[#00E5FF]/20 flex items-center gap-1.5 shrink-0"
                  >
                    {discordCopiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {discordCopiedCode ? 'Copied Command' : 'Copy Slash Command'}
                  </button>
                </div>
              )}
            </div>

            {/* Discord Slash Commands Guide */}
            <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#FFAD42]" />
                  Interactive Discord Slash Commands
                </h3>
                <span className="text-[10px] font-mono text-neutral-500">
                  Native Discord Application Commands v2
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {DISCORD_SLASH_COMMANDS.map(cmd => (
                  <div
                    key={cmd.name}
                    className="bg-[#101314] border border-[#252D30] rounded-xl p-3.5 space-y-2 hover:border-[#00E5FF]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20">
                        {cmd.syntax}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                      {cmd.description}
                    </p>
                    <div className="text-[10px] font-mono text-neutral-500 pt-1 border-t border-[#252D30]/60 truncate">
                      Ex: {cmd.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discord Delivery History */}
            <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#B5FF4A]" />
                  Discord Challenge Delivery History & Logs
                </h3>
                <span className="text-[10px] font-mono text-neutral-500">
                  Logged automated & manual dispatches
                </span>
              </div>

              {discordHistory.length === 0 ? (
                <div className="py-10 text-center text-neutral-500 font-mono text-xs">
                  No delivery history recorded yet. Connect a server and click "Send Test Challenge" to test the pipeline.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-[#252D30] bg-[#101314]/80 text-neutral-400">
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Challenge</th>
                        <th className="py-2.5 px-3">Difficulty</th>
                        <th className="py-2.5 px-3">Server & Channel</th>
                        <th className="py-2.5 px-3">Slot</th>
                        <th className="py-2.5 px-3">Delivery Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#252D30]/60">
                      {discordHistory.slice(0, 15).map(h => (
                        <tr key={h.id} className="hover:bg-[#252D30]/30 transition-colors">
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.status === 'sent'
                              ? 'bg-[#B5FF4A]/10 text-[#B5FF4A] border border-[#B5FF4A]/20'
                              : h.status === 'failed'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                              {h.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-white font-bold">
                            #{h.challengeNumber} {h.problemTitle}
                          </td>
                          <td className="py-2 px-3 text-neutral-300">
                            {h.difficulty}
                          </td>
                          <td className="py-2 px-3 text-neutral-400">
                            {h.guildName} (#{h.channelName})
                          </td>
                          <td className="py-2 px-3 uppercase text-neutral-400 text-[10px]">
                            {h.slot}
                          </td>
                          <td className="py-2 px-3 text-neutral-400">
                            {h.deliveredAt ? new Date(h.deliveredAt).toLocaleString() : 'Pending'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Manual / Webhook Discord Modal */}
      {isManualDiscordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#252D30]">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#00E5FF]" /> Connect Discord Server
              </h3>
              <button
                onClick={() => setIsManualDiscordModalOpen(false)}
                className="text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {manualDiscordError && (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 flex items-center gap-2 text-xs font-mono text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{manualDiscordError}</span>
              </div>
            )}

            <form onSubmit={handleManualDiscordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-white block mb-1">
                  Discord Server ID (Guild ID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1564177053861810226"
                  value={manualGuildId}
                  onChange={e => setManualGuildId(e.target.value)}
                  className="w-full bg-[#101314] text-xs font-mono text-white px-3 py-2 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF]"
                />
                <span className="text-[10px] text-neutral-400 font-mono block mt-1">
                  If DEVARENA bot is added to your server, enter your Server ID to verify instantly.
                </span>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#252D30]"></div>
                <span className="flex-shrink mx-2 text-[10px] font-mono text-neutral-500 uppercase">Or Custom Webhook</span>
                <div className="flex-grow border-t border-[#252D30]"></div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-white block mb-1">
                  Custom Server Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. ACM Coding Community"
                  value={manualGuildName}
                  onChange={e => setManualGuildName(e.target.value)}
                  className="w-full bg-[#101314] text-xs font-mono text-white px-3 py-2 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-white block mb-1">
                  Discord Channel Webhook URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={manualWebhookUrl}
                  onChange={e => setManualWebhookUrl(e.target.value)}
                  className="w-full bg-[#101314] text-xs font-mono text-white px-3 py-2 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualDiscordModalOpen(false)}
                  className="px-4 py-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 text-xs font-mono rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingDiscordServer}
                  className="px-4 py-2 bg-[#00E5FF] hover:brightness-110 text-black font-bold text-xs font-mono rounded-lg transition-all shadow-md shadow-[#00E5FF]/20 disabled:opacity-50"
                >
                  {isVerifyingDiscordServer ? 'Verifying...' : 'Connect Server'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Telegram Group Verification / Connect Modal */}
      {/* Enhanced Telegram Group Verification / Connect Modal */}
      {isTelegramVerifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#252D30]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#24A1DE]/20 border border-[#24A1DE]/30 flex items-center justify-center text-[#24A1DE]">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    Connect & Verify Telegram Group
                  </h3>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Genuine Telegram Bot API getChat Verification
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsTelegramVerifyModalOpen(false)}
                className="text-neutral-500 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Live Bot & Webhook Diagnostic Banner */}
            {diagnosticData && (
              <div className="bg-[#101314] rounded-xl p-3 border border-[#252D30] text-[11px] font-mono space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Bot Identity (getMe):</span>
                  <span className="text-[#24A1DE] font-bold">
                    @{diagnosticData.botIdentity?.username || TELEGRAM_BOT_USERNAME}
                    {diagnosticData.botIdentity?.id ? ` (ID: ${diagnosticData.botIdentity.id})` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Webhook Status:</span>
                  <span className={diagnosticData.webhookInfo?.url ? 'text-[#B5FF4A] flex items-center gap-1 font-bold' : 'text-amber-400'}>
                    {diagnosticData.webhookInfo?.url ? '● Connected & Listening' : '○ Webhook not set'}
                  </span>
                </div>
                {diagnosticData.webhookInfo?.last_error_message && (
                  <div className="text-amber-400/90 text-[10px] pt-1 border-t border-neutral-800">
                    Recent Webhook Notice: {diagnosticData.webhookInfo.last_error_message}
                  </div>
                )}
              </div>
            )}

            {/* Detected Chats (if any active chats found from webhook) */}
            {detectedTelegramChats.length > 0 && (
              <div className="space-y-2 bg-[#101314] p-3 rounded-xl border border-[#24A1DE]/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#B5FF4A] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B5FF4A]" />
                    Live Group Detected via Webhook:
                  </span>
                  <button
                    type="button"
                    onClick={openTelegramVerifyModal}
                    className="text-[10px] font-mono text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${isLoadingDiagnostic ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {detectedTelegramChats.map(dc => (
                    <div
                      key={dc.chatId}
                      onClick={() => setTelegramVerifyChatId(dc.chatId)}
                      className="p-2 rounded-lg bg-[#252D30] hover:bg-[#2F383C] border border-[#252D30] hover:border-[#24A1DE] flex items-center justify-between cursor-pointer transition-colors text-xs font-mono"
                    >
                      <div>
                        <span className="font-bold text-white">{dc.title}</span>
                        <span className="text-[#24A1DE] ml-2 font-bold">{dc.chatId}</span>
                      </div>
                      <span className="text-[10px] bg-[#24A1DE] text-black font-bold px-2 py-0.5 rounded">Use ID →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step-by-Step Instructions */}
            <div className="space-y-3 bg-[#101314] rounded-xl p-4 border border-[#252D30]">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#24A1DE]/20 text-[#24A1DE] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div className="text-xs font-mono text-neutral-300">
                  <span>Add <b>@DEVARENA_CommunityBot</b> to your group as an administrator:</span>
                  <div className="mt-1.5">
                    <button
                      type="button"
                      onClick={handleOpenTelegramBot}
                      className="px-2.5 py-1 bg-[#24A1DE]/20 hover:bg-[#24A1DE]/30 text-[#24A1DE] border border-[#24A1DE]/40 rounded text-[11px] font-mono font-bold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> Open Telegram to Add Bot
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#24A1DE]/20 text-[#24A1DE] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="text-xs font-mono text-neutral-300 leading-relaxed">
                  <span>Get your group's numeric <b>Chat ID</b>:</span>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-neutral-400 text-[11px]">
                    <li>In your group, send <code>/id</code> or <code>/start</code> (the bot replies with the exact ID).</li>
                    <li>Or open the group in <b>web.telegram.org</b>; copy the ID in the URL bar (e.g. <code>#-100...</code>).</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#24A1DE]/20 text-[#24A1DE] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="text-xs font-mono text-neutral-300">
                  <span>Enter the Chat ID below to verify and save the connection.</span>
                </div>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerifyTelegramGroupSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-white block mb-1">
                  Telegram Group Chat ID (e.g. -100...)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. -1002498192014 or -100..."
                  value={telegramVerifyChatId}
                  onChange={e => setTelegramVerifyChatId(e.target.value)}
                  className="w-full bg-[#101314] text-xs font-mono text-white px-3 py-2.5 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#24A1DE]"
                />
              </div>

              {telegramVerifySuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{telegramVerifySuccess}</span>
                </div>
              )}

              {telegramVerifyError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{telegramVerifyError}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleSyncWebhook}
                  disabled={isSyncingWebhook}
                  className="text-[11px] font-mono text-neutral-400 hover:text-[#24A1DE] flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  title="Check or refresh bot webhook connection"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingWebhook ? 'animate-spin text-[#24A1DE]' : ''}`} />
                  {isSyncingWebhook ? 'Syncing...' : 'Sync Bot Webhook'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTelegramVerifyModalOpen(false)}
                    className="px-4 py-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 text-xs font-mono rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingTelegramChat || !telegramVerifyChatId.trim()}
                    className="px-4 py-2 bg-[#24A1DE] hover:bg-[#1E8BC0] text-white font-bold text-xs font-mono rounded-lg transition-all shadow-md shadow-[#24A1DE]/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isVerifyingTelegramChat && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    {isVerifyingTelegramChat ? 'Verifying on Telegram...' : 'Verify & Connect'}
                  </button>
                </div>
              </div>

              {webhookSyncMsg && (
                <div className={`p-2.5 rounded-lg text-[11px] font-mono border ${webhookSyncMsg.ok ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/30 border-rose-500/30 text-rose-300'}`}>
                  {webhookSyncMsg.text}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
