// DEVARENA CONNECT – Discord Bot & Server Integration Types

export type DiscordConnectionStatus = 
  | 'not_connected' 
  | 'pending' 
  | 'connected' 
  | 'config_required' 
  | 'error';

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
  permissions?: string;
  memberCount?: number;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number; // 0 = GUILD_TEXT, 5 = GUILD_ANNOUNCEMENT
  position?: number;
  parentId?: string | null;
}

export interface DiscordServerSettings {
  enabled: boolean;
  timezone: string; // e.g. 'Asia/Kolkata'
  morningEnabled: boolean;
  morningTime: string; // e.g. '09:00'
  eveningEnabled: boolean;
  eveningTime: string; // e.g. '18:00'
  difficulty: 'Mixed' | 'Easy' | 'Medium' | 'Hard';
  topics: string[];
}

export interface DiscordChallengeRecord {
  id: string;
  serverId: string;
  guildName: string;
  channelId: string;
  channelName: string;
  challengeNumber: number;
  problemId: string;
  problemTitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  slot: 'morning' | 'evening' | 'manual_test';
  scheduledAt: string;
  deliveredAt: string | null;
  status: 'sent' | 'pending' | 'failed';
  messageId?: string;
  errorMessage?: string;
}

export interface DiscordServerIntegration {
  id: string;
  userId: string;
  guildId: string;
  guildName: string;
  guildIcon: string | null;
  memberCount: number;
  channelId: string | null;
  channelName: string | null;
  status: DiscordConnectionStatus;
  settings: DiscordServerSettings;
  lastChallengeSent: DiscordChallengeRecord | null;
  connectedAt: string;
  webhookUrl?: string; // Optional direct incoming webhook for instant deliveries
}

export interface DiscordLinkCode {
  code: string;
  userId: string;
  username: string;
  expiresAt: string;
  used: boolean;
}

export interface DiscordLinkedUser {
  discordUserId: string;
  username: string;
  discriminator?: string;
  avatar?: string;
  linkedAt: string;
}

export interface DiscordOverviewStats {
  status: DiscordConnectionStatus;
  connectedServersCount: number;
  totalChallengesDelivered: number;
  totalMembersReached: number;
  challengesToday: number;
  lastDelivery: DiscordChallengeRecord | null;
  nextDelivery: {
    time: string;
    slot: 'Morning' | 'Evening';
    serverName: string;
  } | null;
}

export interface DiscordSlashCommandInfo {
  name: string;
  syntax: string;
  description: string;
  example: string;
  adminOnly?: boolean;
}

