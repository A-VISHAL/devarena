// DEVARENA CONNECT – Telegram Bot & Group Integration Types

export type TelegramConnectionStatus = 
  | 'not_connected' 
  | 'pending' 
  | 'connected' 
  | 'config_required' 
  | 'error';

export interface TelegramChatSettings {
  enabled: boolean;
  timezone: string; // e.g. 'Asia/Kolkata'
  morningEnabled: boolean;
  morningTime: string; // e.g. '09:00'
  eveningEnabled: boolean;
  eveningTime: string; // e.g. '18:00'
  difficulty: 'Mixed' | 'Easy' | 'Medium' | 'Hard';
  topics: string[];
}

export interface TelegramChallengeRecord {
  id: string;
  chatId: string;
  chatTitle: string;
  challengeNumber: number;
  problemId: string;
  problemTitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  slot: 'morning' | 'evening' | 'manual_test';
  scheduledAt: string;
  deliveredAt: string | null;
  status: 'sent' | 'pending' | 'failed';
  telegramMessageId?: string;
  errorMessage?: string;
}

export interface TelegramBotPermissions {
  canSendMessages: boolean;
  isAdmin: boolean;
  canInviteUsers?: boolean;
}

export interface TelegramChatIntegration {
  id: string;
  userId: string;
  chatId: string;
  chatTitle: string;
  chatType: 'group' | 'supergroup' | 'channel';
  memberCount: number;
  status: TelegramConnectionStatus;
  botPermissions: TelegramBotPermissions;
  settings: TelegramChatSettings;
  lastChallengeSent: TelegramChallengeRecord | null;
  connectedAt: string;
  addedByUserId?: string;
  addedByUsername?: string;
  isDemo?: boolean; // Mock demo preview flag
}

export interface TelegramLinkCode {
  code: string;
  userId: string;
  username: string;
  expiresAt: string;
  used: boolean;
  deepLink: string;
}

export interface TelegramLinkedUser {
  telegramUserId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  linkedAt: string;
}

export interface TelegramOverviewStats {
  status: TelegramConnectionStatus;
  connectedGroupsCount: number;
  totalChallengesDelivered: number;
  totalMembersReached: number;
  challengesToday: number;
  lastDelivery: TelegramChallengeRecord | null;
  nextDelivery: {
    time: string;
    slot: 'Morning' | 'Evening';
    groupName: string;
  } | null;
}

export interface TelegramCommandInfo {
  name: string;
  syntax: string;
  description: string;
  example: string;
  adminOnly?: boolean;
}

export interface TelegramWebhookStatus {
  ok?: boolean;
  configured?: boolean;
  url?: string;
  hasCustomCertificate?: boolean;
  pendingUpdateCount?: number;
  lastErrorDate?: number;
  lastErrorMessage?: string;
  maxConnections?: number;
  ipAddress?: string;
}

