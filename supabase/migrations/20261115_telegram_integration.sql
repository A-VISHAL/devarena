-- =========================================================================
-- DEVARENA CONNECT – Telegram Bot Integration & Challenge Scheduler Schema
-- =========================================================================

-- 1. Telegram Accounts (Links Telegram User Identity to DEVARENA User Account)
CREATE TABLE IF NOT EXISTS telegram_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  telegram_user_id TEXT NOT NULL UNIQUE,
  telegram_username TEXT,
  first_name TEXT,
  last_name TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_accounts_user_id ON telegram_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_accounts_tg_user_id ON telegram_accounts(telegram_user_id);

-- 2. Telegram Chats (Groups, Supergroups & Channels connected to DEVARENA)
CREATE TABLE IF NOT EXISTS telegram_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  chat_title TEXT NOT NULL,
  chat_type TEXT NOT NULL DEFAULT 'supergroup' CHECK (chat_type IN ('group', 'supergroup', 'channel')),
  added_by_telegram_user_id TEXT,
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  bot_status TEXT NOT NULL DEFAULT 'member' CHECK (bot_status IN ('administrator', 'member', 'restricted', 'kicked', 'left')),
  can_post_messages BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_telegram_chat_per_user UNIQUE (user_id, chat_id)
);

CREATE INDEX IF NOT EXISTS idx_telegram_chats_user_id ON telegram_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_chats_chat_id ON telegram_chats(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_chats_is_active ON telegram_chats(is_active);

-- 3. Telegram Chat Settings (Two daily challenge slots, timezone, topics, difficulty)
CREATE TABLE IF NOT EXISTS telegram_chat_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES telegram_chats(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  morning_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  morning_time TEXT NOT NULL DEFAULT '09:00',
  evening_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  evening_time TEXT NOT NULL DEFAULT '18:00',
  difficulty TEXT NOT NULL DEFAULT 'Mixed' CHECK (difficulty IN ('Mixed', 'Easy', 'Medium', 'Hard')),
  topics TEXT[] NOT NULL DEFAULT ARRAY['Arrays', 'Strings', 'Hashing', 'Binary Search', 'Trees', 'Graphs', 'Dynamic Programming']::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_settings_per_telegram_chat UNIQUE (chat_id)
);

CREATE INDEX IF NOT EXISTS idx_telegram_chat_settings_chat_id ON telegram_chat_settings(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_chat_settings_enabled ON telegram_chat_settings(enabled);

-- 4. Telegram Delivery History (Idempotency, status logs and error handling)
CREATE TABLE IF NOT EXISTS telegram_delivery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES telegram_chats(id) ON DELETE CASCADE,
  challenge_number INTEGER NOT NULL,
  problem_id TEXT NOT NULL,
  problem_title TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  category TEXT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('morning', 'evening', 'manual_test')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('sent', 'pending', 'failed')),
  telegram_message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_delivery_history_chat_id ON telegram_delivery_history(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_delivery_history_scheduled_at ON telegram_delivery_history(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_telegram_delivery_history_status ON telegram_delivery_history(status);

-- 5. Telegram Link Codes (Single-use hashed codes for /link command & deep linking)
CREATE TABLE IF NOT EXISTS telegram_link_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  code_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_link_codes_user_id ON telegram_link_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_link_codes_code_hash ON telegram_link_codes(code_hash);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE telegram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_chat_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_delivery_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- 7. Row Level Security Policies
-- Users can only read and manage their own connected accounts & chats
CREATE POLICY "Users can manage their own telegram accounts"
  ON telegram_accounts
  FOR ALL
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can manage their own telegram chats"
  ON telegram_chats
  FOR ALL
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can manage their own telegram chat settings"
  ON telegram_chat_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM telegram_chats c
      WHERE c.id = telegram_chat_settings.chat_id
      AND c.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can view challenge history of their telegram chats"
  ON telegram_delivery_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM telegram_chats c
      WHERE c.id = telegram_delivery_history.chat_id
      AND c.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can manage their own telegram link codes"
  ON telegram_link_codes
  FOR ALL
  USING (auth.uid()::TEXT = user_id);

