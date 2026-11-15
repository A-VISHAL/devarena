-- =========================================================================
-- DEVARENA CONNECT – Discord Bot Integration & Challenge Scheduler Schema
-- =========================================================================

-- 1. Discord Accounts (Links Discord identity to DEVARENA user)
CREATE TABLE IF NOT EXISTS discord_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  discord_user_id TEXT NOT NULL UNIQUE,
  discord_username TEXT NOT NULL,
  discord_discriminator TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discord_accounts_user_id ON discord_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_discord_accounts_discord_user_id ON discord_accounts(discord_user_id);

-- 2. Discord Servers (Guilds connected to DEVARENA)
CREATE TABLE IF NOT EXISTS discord_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  guild_name TEXT NOT NULL,
  icon TEXT,
  member_count INTEGER DEFAULT 0,
  channel_id TEXT,
  channel_name TEXT,
  webhook_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_guild_per_user UNIQUE (user_id, guild_id)
);

CREATE INDEX IF NOT EXISTS idx_discord_servers_user_id ON discord_servers(user_id);
CREATE INDEX IF NOT EXISTS idx_discord_servers_guild_id ON discord_servers(guild_id);
CREATE INDEX IF NOT EXISTS idx_discord_servers_is_active ON discord_servers(is_active);

-- 3. Discord Server Settings (Challenge schedule, topics, difficulty)
CREATE TABLE IF NOT EXISTS discord_server_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES discord_servers(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  morning_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  morning_time TEXT NOT NULL DEFAULT '09:00',
  evening_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  evening_time TEXT NOT NULL DEFAULT '18:00',
  difficulty TEXT NOT NULL DEFAULT 'Mixed' CHECK (difficulty IN ('Mixed', 'Easy', 'Medium', 'Hard')),
  topics TEXT[] NOT NULL DEFAULT ARRAY['Arrays', 'Strings', 'Hashing', 'Trees', 'Graphs', 'Dynamic Programming']::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_settings_per_server UNIQUE (server_id)
);

CREATE INDEX IF NOT EXISTS idx_discord_server_settings_server_id ON discord_server_settings(server_id);
CREATE INDEX IF NOT EXISTS idx_discord_server_settings_enabled ON discord_server_settings(enabled);

-- 4. Discord Challenges (History & idempotency log of delivered challenges)
CREATE TABLE IF NOT EXISTS discord_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES discord_servers(id) ON DELETE CASCADE,
  challenge_number INTEGER NOT NULL,
  problem_id TEXT NOT NULL,
  problem_title TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  category TEXT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('morning', 'evening', 'manual_test')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('sent', 'pending', 'failed')),
  discord_message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discord_challenges_server_id ON discord_challenges(server_id);
CREATE INDEX IF NOT EXISTS idx_discord_challenges_scheduled_at ON discord_challenges(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_discord_challenges_status ON discord_challenges(status);

-- 5. Discord Link Codes (Temporary verification codes for /link command)
CREATE TABLE IF NOT EXISTS discord_link_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  code_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discord_link_codes_user_id ON discord_link_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_discord_link_codes_code_hash ON discord_link_codes(code_hash);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE discord_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discord_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE discord_server_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE discord_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE discord_link_codes ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Users can only read and manage their own connected accounts & servers
CREATE POLICY "Users can manage their own discord accounts"
  ON discord_accounts
  FOR ALL
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can manage their own discord servers"
  ON discord_servers
  FOR ALL
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can manage their own server settings"
  ON discord_server_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM discord_servers s
      WHERE s.id = discord_server_settings.server_id
      AND s.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can view challenge history of their servers"
  ON discord_challenges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM discord_servers s
      WHERE s.id = discord_challenges.server_id
      AND s.user_id = auth.uid()::TEXT
    )
  );

