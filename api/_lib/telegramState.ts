// Shared Telegram Bot State & Incoming Updates Storage for Serverless Functions
import * as fs from 'fs';
import * as path from 'path';

const TMP_FILE = '/tmp/devarena_telegram_recent_updates.json';
const MAX_UPDATES = 50;

export interface DetectedChatInfo {
  chatId: string;
  title: string;
  type: string;
  lastSeenAt: string;
  lastMessage?: string;
  sender?: string;
}

export interface StoredTelegramUpdate {
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

// In-memory buffer
let memoryUpdates: StoredTelegramUpdate[] = [];

// Load from /tmp if available
function loadPersistedUpdates(): StoredTelegramUpdate[] {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch { }
  return [];
}

// Save to /tmp
function persistUpdates(updates: StoredTelegramUpdate[]) {
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(updates.slice(0, MAX_UPDATES)), 'utf8');
  } catch { }
}

export function recordTelegramUpdate(update: any): StoredTelegramUpdate | null {
  if (!update) return null;

  const msg = update.message || update.edited_message || update.channel_post;
  const mcm = update.my_chat_member;
  const chat = msg?.chat || mcm?.chat;

  if (!chat || !chat.id) return null;

  const from = msg?.from || mcm?.from || {};
  const isGroup = chat.type === 'group' || chat.type === 'supergroup';
  const chatTitle = chat.title || chat.first_name || (chat.username ? `@${chat.username}` : `Chat ${chat.id}`);

  const entry: StoredTelegramUpdate = {
    updateId: update.update_id || Date.now(),
    receivedAt: new Date().toISOString(),
    chatId: String(chat.id),
    chatTitle,
    chatType: chat.type || 'group',
    senderUsername: from.username ? `@${from.username}` : from.first_name,
    senderId: from.id,
    text: msg?.text || (mcm ? `Bot status changed: ${mcm.new_chat_member?.status}` : undefined),
    isGroup,
    action: mcm ? `my_chat_member:${mcm.new_chat_member?.status}` : 'message'
  };

  // Merge with memory buffer & file buffer
  if (memoryUpdates.length === 0) {
    memoryUpdates = loadPersistedUpdates();
  }

  // Prepend and deduplicate by updateId
  memoryUpdates = [entry, ...memoryUpdates.filter(u => u.updateId !== entry.updateId)].slice(0, MAX_UPDATES);
  persistUpdates(memoryUpdates);

  return entry;
}

export function getRecentTelegramUpdates(): StoredTelegramUpdate[] {
  if (memoryUpdates.length === 0) {
    memoryUpdates = loadPersistedUpdates();
  }
  return memoryUpdates;
}

export function getDetectedTelegramGroups(): DetectedChatInfo[] {
  const all = getRecentTelegramUpdates();
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

