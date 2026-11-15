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
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/sound';
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

export const ConnectPage: React.FC = () => {
  const { user } = useApp();

  const [servers, setServers] = useState<DiscordServerIntegration[]>([]);
  const [history, setHistory] = useState<DiscordChallengeRecord[]>([]);
  const [overview, setOverview] = useState<DiscordOverviewStats>({
    status: 'not_connected',
    connectedServersCount: 0,
    totalChallengesDelivered: 0,
    totalMembersReached: 0,
    challengesToday: 0,
    lastDelivery: null,
    nextDelivery: null
  });

  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [serverChannels, setServerChannels] = useState<Record<string, DiscordChannel[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);
  const [testErrorMessage, setTestErrorMessage] = useState<string | null>(null);

  // Link code state
  const [linkCodeData, setLinkCodeData] = useState<DiscordLinkCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Manual connect modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [manualGuildName, setManualGuildName] = useState<string>('');
  const [manualWebhookUrl, setManualWebhookUrl] = useState<string>('');

  // 1. Initial Data Fetch & OAuth Return Handling
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);

      // Check if user just returned from Discord OAuth installation
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const guildId = urlParams.get('guild_id');
      const permissions = urlParams.get('permissions');

      if (guildId) {
        // User installed bot into a server!
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

        // Clean up URL query parameters without reloading
        window.history.replaceState({}, '', '/app/connect');
      }

      await refreshData();
      setIsLoading(false);
    };

    initData();
  }, [user.id]);

  const refreshData = async () => {
    const fetchedServers = await discordService.getConnectedServers(user.id || 'guest');
    const fetchedHistory = await discordService.getChallengeHistory(user.id || 'guest');
    const stats = await discordService.getOverviewStats(user.id || 'guest');

    setServers(fetchedServers);
    setHistory(fetchedHistory);
    setOverview(stats);

    if (fetchedServers.length > 0 && !selectedServerId) {
      setSelectedServerId(fetchedServers[0].id);
    }

    // Preload channels for all servers
    for (const s of fetchedServers) {
      const channels = await discordService.getGuildChannels(s.guildId);
      setServerChannels(prev => ({ ...prev, [s.guildId]: channels }));
    }

    // Load active link code if exists
    const activeCode = discordService.getActiveLinkCode();
    setLinkCodeData(activeCode);
  };

  // Active Selected Server
  const selectedServer = useMemo(() => {
    return servers.find(s => s.id === selectedServerId) || servers[0] || null;
  }, [servers, selectedServerId]);

  // 2. Open Official Discord OAuth2 Flow
  const handleConnectDiscord = () => {
    sound.click();
    const installUrl = discordService.getInstallationUrl();
    window.open(installUrl, '_blank', 'width=600,height=800');
  };

  // 3. Channel Selection
  const handleChannelChange = async (channelId: string) => {
    if (!selectedServer) return;
    sound.click();

    const channels = serverChannels[selectedServer.guildId] || [];
    const matched = channels.find(c => c.id === channelId);

    const updated: DiscordServerIntegration = {
      ...selectedServer,
      channelId,
      channelName: matched ? matched.name : channelId,
      status: 'connected'
    };

    await discordService.saveServer(updated);
    await refreshData();
  };

  // 4. Update Server Settings (Schedule, Topics, Difficulty, Timezone)
  const handleSettingChange = async <K extends keyof DiscordServerSettings>(
    key: K,
    value: DiscordServerSettings[K]
  ) => {
    if (!selectedServer) return;
    sound.click();

    const updatedSettings: DiscordServerSettings = {
      ...selectedServer.settings,
      [key]: value
    };

    const updatedServer: DiscordServerIntegration = {
      ...selectedServer,
      settings: updatedSettings
    };

    await discordService.saveServer(updatedServer);
    setServers(prev => prev.map(s => s.id === updatedServer.id ? updatedServer : s));
  };

  // Toggle Topic Filter
  const toggleTopic = (topic: string) => {
    if (!selectedServer) return;
    sound.click();
    const current = selectedServer.settings.topics || [];
    const next = current.includes(topic)
      ? current.filter(t => t !== topic)
      : [...current, topic];
    handleSettingChange('topics', next);
  };

  // 5. Send Test Challenge Message
  const handleSendTestMessage = async () => {
    if (!selectedServer) return;
    sound.click();
    setIsSendingTest(true);
    setTestSuccessMessage(null);
    setTestErrorMessage(null);

    try {
      const res = await discordService.sendTestChallenge(selectedServer);
      if (res.success) {
        sound.success();
        setTestSuccessMessage(`Successfully dispatched challenge to #${res.record.channelName}!`);
        await refreshData();
      } else {
        sound.defeat();
        setTestErrorMessage(res.error || 'Failed to deliver message. Check bot permissions.');
      }
    } catch (err: any) {
      sound.defeat();
      setTestErrorMessage(err.message || 'Error executing test challenge.');
    } finally {
      setIsSendingTest(false);
    }
  };

  // 6. Disconnect Server
  const handleDisconnectServer = async (serverId: string) => {
    sound.click();
    if (!confirm('Are you sure you want to disconnect this Discord server? Automatic challenges will be paused.')) {
      return;
    }

    await discordService.disconnectServer(serverId, user.id || 'guest');
    sound.defeat();
    await refreshData();
  };

  // 7. Manual Server Connect Modal Handler
  const handleManualConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.click();

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
    setIsManualModalOpen(false);
    setManualGuildName('');
    setManualWebhookUrl('');
    await refreshData();
  };

  // 8. Generate Link Code
  const handleGenerateLinkCode = () => {
    sound.click();
    const codeObj = discordService.generateLinkCode(user.id || 'guest', user.username || 'Coder');
    setLinkCodeData(codeObj);
  };

  const handleCopyLinkCode = () => {
    if (!linkCodeData) return;
    sound.click();
    navigator.clipboard.writeText(`/link code:${linkCodeData.code}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#101314] text-neutral-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        {/* Top Header Banner */}
        <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#5865F2]/15 via-[#00E5FF]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30 flex items-center gap-1.5">
                  <Plug className="w-3.5 h-3.5" /> OFFICIAL DISCORD INTEGRATION
                </span>
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border ${
                  overview.status === 'connected'
                    ? 'bg-[#B5FF4A]/10 text-[#B5FF4A] border-[#B5FF4A]/20'
                    : overview.status === 'config_required'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}>
                  {overview.status === 'connected' ? '● INTEGRATION ACTIVE' : overview.status === 'config_required' ? '▲ SETUP REQUIRED' : '○ NOT CONNECTED'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                DEVARENA Connect
              </h1>
              <p className="text-sm sm:text-base text-neutral-300 mt-2 leading-relaxed">
                Connect your Discord server to automatically deliver two curated daily coding challenges, verify developer milestones, and unlock interactive community slash commands.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={handleConnectDiscord}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs font-mono transition-all shadow-lg shadow-[#5865F2]/25 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                Add DEVARENA to Discord
              </button>

              <button
                onClick={() => setIsManualModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 text-xs font-mono transition-colors border border-neutral-700/50"
              >
                <Link2 className="w-4 h-4 text-[#00E5FF]" />
                Webhook / Custom
              </button>
            </div>
          </div>
        </div>

        {/* SECTION A: OVERVIEW METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 shadow-lg">
            <div className="text-[10px] uppercase font-mono font-bold text-neutral-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#00E5FF]" /> Connected Servers
            </div>
            <div className="text-2xl font-mono font-bold text-white mt-1.5">
              {overview.connectedServersCount}
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
              {overview.totalChallengesDelivered}
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
              {overview.totalMembersReached.toLocaleString()}
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
              {overview.challengesToday}
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
              {overview.lastDelivery ? overview.lastDelivery.problemTitle : 'None yet'}
            </div>
            <div className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">
              {overview.lastDelivery ? new Date(overview.lastDelivery.deliveredAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Awaiting schedule'}
            </div>
          </div>

          <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 shadow-lg">
            <div className="text-[10px] uppercase font-mono font-bold text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" /> Next Dispatch
            </div>
            <div className="text-xs font-mono font-bold text-[#00E5FF] mt-2 truncate">
              {overview.nextDelivery ? `${overview.nextDelivery.slot} (${overview.nextDelivery.time})` : 'Paused'}
            </div>
            <div className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">
              {overview.nextDelivery?.serverName || 'Configure schedule'}
            </div>
          </div>
        </div>

        {/* SECTION B & C: CONNECTED SERVERS & SERVER MANAGEMENT */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#00E5FF]" />
              <h2 className="text-base font-mono font-bold text-white uppercase tracking-wider">
                Connected Discord Servers ({servers.length})
              </h2>
            </div>

            <button
              onClick={refreshData}
              className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {servers.length === 0 ? (
            /* Empty State */
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
                  onClick={() => setIsManualModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 text-xs font-mono transition-colors border border-neutral-700"
                >
                  Connect via Webhook
                </button>
              </div>
            </div>
          ) : (
            /* Active Server Manager */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Server Roster (4 cols) */}
              <div className="lg:col-span-4 space-y-3">
                {servers.map(srv => {
                  const isSelected = selectedServer?.id === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => {
                        sound.click();
                        setSelectedServerId(srv.id);
                        setTestSuccessMessage(null);
                        setTestErrorMessage(null);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#252D30] border-[#00E5FF] shadow-lg shadow-[#00E5FF]/10'
                          : 'bg-[#1C2426] border-[#252D30] hover:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Server Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2] font-mono font-bold text-sm shrink-0">
                          {srv.guildName.slice(0, 2).toUpperCase()}
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
                        <span className={`w-2 h-2 rounded-full ${
                          srv.channelId ? 'bg-[#B5FF4A]' : 'bg-amber-400 animate-pulse'
                        }`} />
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

              {/* Right Column: Server Control Center (8 cols) */}
              {selectedServer && (
                <div className="lg:col-span-8 bg-[#1C2426] border border-[#252D30] rounded-2xl p-6 shadow-xl space-y-6">
                  {/* Server Header & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#252D30]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white font-mono">
                          {selectedServer.guildName}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#101314] text-neutral-400 border border-[#252D30]">
                          ID: {selectedServer.guildId}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Connected {new Date(selectedServer.connectedAt).toLocaleDateString()} • {selectedServer.memberCount} members
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSendTestMessage}
                        disabled={isSendingTest || !selectedServer.channelId}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#00E5FF] hover:brightness-110 text-black font-bold rounded-lg text-xs font-mono transition-all disabled:opacity-40"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {isSendingTest ? 'Sending...' : 'Send Test Challenge'}
                      </button>

                      <button
                        onClick={() => handleDisconnectServer(selectedServer.id)}
                        className="p-2 bg-[#252D30] hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 rounded-lg transition-colors border border-neutral-700/50"
                        title="Disconnect Server"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Test Feedback Alerts */}
                  {testSuccessMessage && (
                    <div className="bg-[#B5FF4A]/10 border border-[#B5FF4A]/30 rounded-xl p-3 flex items-center gap-2 text-xs font-mono text-[#B5FF4A] animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{testSuccessMessage}</span>
                    </div>
                  )}

                  {testErrorMessage && (
                    <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 flex items-center gap-2 text-xs font-mono text-rose-300 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{testErrorMessage}</span>
                    </div>
                  )}

                  {/* Channel Selector */}
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
                      value={selectedServer.channelId || ''}
                      onChange={e => handleChannelChange(e.target.value)}
                      className="w-full bg-[#1C2426] text-xs font-mono text-white px-3.5 py-2.5 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF] cursor-pointer"
                    >
                      <option value="" disabled>-- Select Announcement Channel --</option>
                      {(serverChannels[selectedServer.guildId] || []).map(ch => (
                        <option key={ch.id} value={ch.id}>
                          #{ch.name} {ch.type === 5 ? '(Announcement)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SECTION D: CHALLENGE AUTOMATION SETTINGS */}
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
                          checked={selectedServer.settings.enabled}
                          onChange={e => handleSettingChange('enabled', e.target.checked)}
                          className="accent-[#00E5FF] w-4 h-4 cursor-pointer"
                        />
                      </label>
                    </div>

                    {/* Schedule Times & Timezone */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Morning Slot */}
                      <div className="bg-[#101314] p-3.5 rounded-xl border border-[#252D30] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-white">☀️ Morning Slot</span>
                          <input
                            type="checkbox"
                            checked={selectedServer.settings.morningEnabled}
                            onChange={e => handleSettingChange('morningEnabled', e.target.checked)}
                            className="accent-[#00E5FF] w-3.5 h-3.5 cursor-pointer"
                          />
                        </div>
                        <input
                          type="time"
                          value={selectedServer.settings.morningTime}
                          onChange={e => handleSettingChange('morningTime', e.target.value)}
                          disabled={!selectedServer.settings.morningEnabled}
                          className="w-full bg-[#1C2426] text-xs font-mono text-white px-3 py-1.5 rounded border border-[#252D30] focus:outline-none focus:border-[#00E5FF] disabled:opacity-40"
                        />
                      </div>

                      {/* Evening Slot */}
                      <div className="bg-[#101314] p-3.5 rounded-xl border border-[#252D30] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-white">🌙 Evening Slot</span>
                          <input
                            type="checkbox"
                            checked={selectedServer.settings.eveningEnabled}
                            onChange={e => handleSettingChange('eveningEnabled', e.target.checked)}
                            className="accent-[#00E5FF] w-3.5 h-3.5 cursor-pointer"
                          />
                        </div>
                        <input
                          type="time"
                          value={selectedServer.settings.eveningTime}
                          onChange={e => handleSettingChange('eveningTime', e.target.value)}
                          disabled={!selectedServer.settings.eveningEnabled}
                          className="w-full bg-[#1C2426] text-xs font-mono text-white px-3 py-1.5 rounded border border-[#252D30] focus:outline-none focus:border-[#00E5FF] disabled:opacity-40"
                        />
                      </div>

                      {/* Timezone */}
                      <div className="bg-[#101314] p-3.5 rounded-xl border border-[#252D30] space-y-2">
                        <span className="text-xs font-mono font-bold text-white block">🌐 Timezone</span>
                        <select
                          value={selectedServer.settings.timezone}
                          onChange={e => handleSettingChange('timezone', e.target.value)}
                          className="w-full bg-[#1C2426] text-[11px] font-mono text-white px-2 py-1.5 rounded border border-[#252D30] focus:outline-none focus:border-[#00E5FF] cursor-pointer"
                        >
                          {TIMEZONES.map(tz => (
                            <option key={tz.value} value={tz.value}>{tz.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Difficulty Preference */}
                    <div className="bg-[#101314] p-3.5 rounded-xl border border-[#252D30] space-y-2">
                      <span className="text-xs font-mono font-bold text-white block">
                        Problem Difficulty Filtering
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(['Mixed', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
                          <button
                            key={diff}
                            onClick={() => handleSettingChange('difficulty', diff)}
                            className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors border ${
                              selectedServer.settings.difficulty === diff
                                ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] font-bold'
                                : 'bg-[#1C2426] border-[#252D30] text-neutral-400 hover:text-white'
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Topics Multi-Select */}
                    <div className="bg-[#101314] p-3.5 rounded-xl border border-[#252D30] space-y-2">
                      <span className="text-xs font-mono font-bold text-white block">
                        Included Topics ({selectedServer.settings.topics.length} Selected)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_TOPICS.map(topic => {
                          const isChecked = selectedServer.settings.topics.includes(topic);
                          return (
                            <button
                              key={topic}
                              onClick={() => toggleTopic(topic)}
                              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors border ${
                                isChecked
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

        {/* SECTION E: ACCOUNT LINKING (/link) */}
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
              onClick={handleGenerateLinkCode}
              className="px-4 py-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 text-xs font-mono rounded-lg transition-colors border border-neutral-700/50 flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFAD42]" />
              Generate Single-Use Link Code
            </button>
          </div>

          {linkCodeData && (
            <div className="bg-[#101314] rounded-xl p-4 border border-[#252D30] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400">Step 1: Execute this command in Discord</span>
                <div className="text-sm font-mono font-bold text-[#00E5FF] tracking-wider bg-[#1C2426] px-3 py-1.5 rounded-lg border border-neutral-700 inline-block">
                  /link code:{linkCodeData.code}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  Code expires in 15 minutes. Single-use only.
                </div>
              </div>

              <button
                onClick={handleCopyLinkCode}
                className="px-4 py-2 bg-[#00E5FF] text-black font-bold text-xs font-mono rounded-lg transition-all shadow-md shadow-[#00E5FF]/20 flex items-center gap-1.5 shrink-0"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied Command' : 'Copy Slash Command'}
              </button>
            </div>
          )}
        </div>

        {/* SECTION F: DISCORD SLASH COMMANDS GUIDE */}
        <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#FFAD42]" />
              Interactive Bot Slash Commands
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

        {/* SECTION G: CHALLENGE DELIVERY HISTORY */}
        <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#B5FF4A]" />
              Challenge Delivery History & Logs
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">
              Logged automated & manual dispatches
            </span>
          </div>

          {history.length === 0 ? (
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
                  {history.slice(0, 15).map(h => (
                    <tr key={h.id} className="hover:bg-[#252D30]/30 transition-colors">
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.status === 'sent'
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

      {/* Manual / Webhook Connect Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#252D30]">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#00E5FF]" /> Custom / Webhook Server
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualConnectSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-white block mb-1">
                  Server Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford ACM Coding Club"
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
                <span className="text-[10px] text-neutral-500 font-mono block mt-1">
                  Allows direct zero-bot instant challenge delivery testing.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 text-xs font-mono rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00E5FF] hover:brightness-110 text-black font-bold text-xs font-mono rounded-lg transition-all shadow-md shadow-[#00E5FF]/20"
                >
                  Save Integration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

