-- ==============================================================================
-- AuraVoice Live - Complete PostgreSQL / Supabase Database Schema (schema.sql)
-- Description: Social Voice Streaming, Multi-Seat Audio Party, Gifting & Economy
-- Target Database: PostgreSQL 14+ / Supabase
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. USERS & PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,                                      -- Auth UUID or custom string ID
  numeric_id TEXT UNIQUE NOT NULL,                          -- 6 to 8 digit display ID (e.g., '108420')
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT DEFAULT 'Living life on voice!',
  email TEXT,
  phone TEXT,
  country TEXT DEFAULT 'Global',
  country_flag TEXT DEFAULT '🌐',
  gender TEXT DEFAULT 'other' CHECK (gender IN ('male', 'female', 'other')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'host', 'moderator', 'admin', 'super_admin', 'seller', 'agent')),
  
  -- Virtual Economy Balances
  coins BIGINT DEFAULT 1000 CHECK (coins >= 0),             -- Recharge currency (spending & gifting)
  diamonds BIGINT DEFAULT 0 CHECK (diamonds >= 0),          -- Host revenue currency (convertible to cash)
  
  -- Progression & VIP
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  xp BIGINT DEFAULT 0 CHECK (xp >= 0),
  vip_tier TEXT DEFAULT 'vip_0' CHECK (vip_tier IN ('vip_0', 'vip_1', 'vip_2', 'vip_3', 'vip_4', 'vip_5')),
  vip_expires_at TIMESTAMPTZ,
  
  -- Social Metrics
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  visitors_count INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  
  -- Host & Talent Agency
  is_host BOOLEAN DEFAULT FALSE,
  host_status TEXT DEFAULT 'none' CHECK (host_status IN ('none', 'pending', 'approved', 'rejected', 'suspended')),
  host_level INTEGER DEFAULT 1,
  host_commission_rate NUMERIC(4,2) DEFAULT 0.70,           -- 70% share for host
  host_agency_id TEXT,                                      -- FK to host_agencies
  
  -- Authorized Coin Reseller Info
  is_seller BOOLEAN DEFAULT FALSE,
  seller_verified BOOLEAN DEFAULT FALSE,
  seller_level TEXT DEFAULT 'standard' CHECK (seller_level IN ('standard', 'gold', 'diamond', 'master')),
  seller_discount_rate INTEGER DEFAULT 15,                  -- % discount offered
  seller_rating NUMERIC(2,1) DEFAULT 5.0,
  seller_total_sales BIGINT DEFAULT 0,
  seller_contact_whatsapp TEXT,
  
  -- Dress-Up & Avatar Assets Equipped
  avatar_frame TEXT,
  equipped_ride TEXT,
  equipped_bubble TEXT,
  equipped_entry_effect TEXT,
  equipped_sound TEXT,
  
  -- CP (Couple / Relationship Partner)
  cp_partner_id TEXT,
  cp_level INTEGER DEFAULT 0,
  cp_days INTEGER DEFAULT 0,
  cp_ring_id TEXT,
  
  -- Moderation
  is_banned BOOLEAN DEFAULT FALSE,
  is_muted BOOLEAN DEFAULT FALSE,
  mute_remaining_hours INTEGER DEFAULT 0,
  fraud_score INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Indexes for lightning-fast user lookup
CREATE INDEX IF NOT EXISTS idx_profiles_numeric_id ON public.profiles(numeric_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_seller ON public.profiles(is_seller);
CREATE INDEX IF NOT EXISTS idx_profiles_is_host ON public.profiles(is_host);


-- ==============================================================================
-- 3. VOICE PARTY ROOMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.voice_rooms (
  id TEXT PRIMARY KEY,                                      -- Room UUID or alphanumeric ID
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Chat' CHECK (category IN ('Popular', 'PK', 'Gaming', 'Music', 'Dating', 'Party', 'Chat', 'Nearby')),
  cover_image TEXT,
  background_wallpaper TEXT,
  host_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_password TEXT,                                       -- Nullable (if password-locked)
  is_locked BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Capacity & Layout
  seat_count INTEGER DEFAULT 8 CHECK (seat_count IN (4, 8, 9, 12, 16)),
  speaker_count INTEGER DEFAULT 1,
  listener_count INTEGER DEFAULT 0,
  room_diamonds BIGINT DEFAULT 0,                           -- Total diamonds gifted in this session
  
  announcement TEXT DEFAULT 'Welcome to AuraVoice Live! Respect community rules and enjoy the vibe.',
  welcome_message TEXT,
  tags TEXT[] DEFAULT ARRAY['Chill', 'Music'],
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_voice_rooms_host_id ON public.voice_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_voice_rooms_category ON public.voice_rooms(category);
CREATE INDEX IF NOT EXISTS idx_voice_rooms_is_active ON public.voice_rooms(is_active);


-- ==============================================================================
-- 4. ROOM SEATS (MIC GRID)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.room_seats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES public.voice_rooms(id) ON DELETE CASCADE,
  seat_index INTEGER NOT NULL CHECK (seat_index >= 0 AND seat_index < 16),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_muted BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  UNIQUE (room_id, seat_index)
);


-- ==============================================================================
-- 5. VIRTUAL GIFTS CATALOG TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gifts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Classic' CHECK (category IN ('Classic', 'Romantic', 'Luxury', 'Effects', 'Lucky', 'Exclusive')),
  coin_price BIGINT NOT NULL CHECK (coin_price > 0),
  diamond_reward BIGINT NOT NULL CHECK (diamond_reward >= 0),
  icon TEXT NOT NULL,
  animation_type TEXT DEFAULT 'css' CHECK (animation_type IN ('css', 'svga', 'lottie', 'particles', '3d')),
  animation_file TEXT,
  sound_effect TEXT,
  is_lucky BOOLEAN DEFAULT FALSE,
  lucky_max_multiplier INTEGER DEFAULT 1,                   -- e.g. 500 for up to 500x lucky wins
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);


-- ==============================================================================
-- 6. GIFT TRANSACTIONS & AUDIT LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gift_logs (
  id TEXT PRIMARY KEY,                                      -- e.g. 'gift_tx_123456'
  room_id TEXT REFERENCES public.voice_rooms(id) ON DELETE SET NULL,
  sender_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  gift_id TEXT NOT NULL,
  gift_name TEXT NOT NULL,
  gift_icon TEXT,
  coin_cost BIGINT NOT NULL,
  diamond_earned BIGINT NOT NULL,
  combo_count INTEGER DEFAULT 1,
  is_lucky_win BOOLEAN DEFAULT FALSE,
  lucky_multiplier INTEGER DEFAULT 1,
  lucky_win_coins BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_gift_logs_sender ON public.gift_logs(sender_id);
CREATE INDEX IF NOT EXISTS idx_gift_logs_receiver ON public.gift_logs(receiver_id);
CREATE INDEX IF NOT EXISTS idx_gift_logs_room ON public.gift_logs(room_id);
CREATE INDEX IF NOT EXISTS idx_gift_logs_created_at ON public.gift_logs(created_at DESC);


-- ==============================================================================
-- 7. COIN RESELLER & MERCHANT TRANSACTIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.seller_transactions (
  id TEXT PRIMARY KEY,
  tx_hash TEXT UNIQUE NOT NULL,
  seller_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_numeric_id TEXT NOT NULL,
  recipient_username TEXT NOT NULL,
  coin_amount BIGINT NOT NULL CHECK (coin_amount > 0),
  official_price_usd NUMERIC(10,2) NOT NULL,
  discounted_price_usd NUMERIC(10,2) NOT NULL,
  discount_rate INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'whatsapp', 'telegram', 'easypaisa', 'jazzcash', 'crypto_usdt', 'binance_pay', 'paypal', 'other')),
  status TEXT DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_seller_tx_seller ON public.seller_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_tx_recipient ON public.seller_transactions(recipient_id);


-- ==============================================================================
-- 8. TALENT AGENCIES & HOST NETWORK
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.host_agencies (
  id TEXT PRIMARY KEY,                                      -- e.g. 'AG_7788'
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  commission_rate NUMERIC(4,2) DEFAULT 0.15,               -- 15% agency commission cut
  total_hosts INTEGER DEFAULT 0,
  total_diamonds_generated BIGINT DEFAULT 0,
  total_revenue_usd NUMERIC(12,2) DEFAULT 0.00,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.agency_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id TEXT NOT NULL REFERENCES public.host_agencies(id) ON DELETE CASCADE,
  host_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'terminated')),
  joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  UNIQUE (agency_id, host_id)
);


-- ==============================================================================
-- 9. HOST WITHDRAWALS / CASHOUT LEDGER
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  diamonds_spent BIGINT NOT NULL CHECK (diamonds_spent > 0),
  usd_amount NUMERIC(10,2) NOT NULL CHECK (usd_amount > 0),
  payout_method TEXT NOT NULL CHECK (payout_method IN ('bank_transfer', 'crypto_usdt', 'paypal', 'easypaisa', 'jazzcash', 'bkash', 'paytm')),
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED')),
  admin_notes TEXT,
  rejection_reason TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);


-- ==============================================================================
-- 10. STORE DRESS-UP ITEMS & USER BACKPACK (INVENTORY)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.store_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('frames', 'rides', 'sounds', 'waves', 'bubbles', 'badges', 'effects', 'thrones')),
  description TEXT,
  icon TEXT NOT NULL,
  preview_class TEXT,
  badge_tag TEXT CHECK (badge_tag IN ('HOT', 'NEW', 'EXCLUSIVE', 'VIP', 'POPULAR')),
  rarity TEXT DEFAULT 'Rare' CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary', 'Mythic')),
  price_7_days BIGINT NOT NULL,
  price_30_days BIGINT NOT NULL,
  price_permanent BIGINT NOT NULL,
  required_vip TEXT DEFAULT 'vip_0',
  is_active BOOLEAN DEFAULT TRUE,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.backpack_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES public.store_items(id) ON DELETE CASCADE,
  item_category TEXT NOT NULL,
  is_equipped BOOLEAN DEFAULT FALSE,
  is_permanent BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_backpack_user ON public.backpack_items(user_id);


-- ==============================================================================
-- 11. SOCIAL: DIRECT MESSAGES & IN-ROOM CHAT
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_dm_conversation ON public.direct_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_dm_created_at ON public.direct_messages(created_at DESC);

CREATE TABLE IF NOT EXISTS public.room_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES public.voice_rooms(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  sender_vip TEXT,
  content TEXT NOT NULL,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_room_messages_room ON public.room_messages(room_id, created_at DESC);


-- ==============================================================================
-- 12. IN-APP ARCADE & MINI-GAMES LOG
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mini_game_bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('fruit_roulette', 'pirate_wheel', 'dice_roll', 'teen_patti')),
  bet_amount BIGINT NOT NULL CHECK (bet_amount > 0),
  won_amount BIGINT DEFAULT 0,
  multiplier NUMERIC(6,2) DEFAULT 0,
  is_win BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mini_game_user ON public.mini_game_bets(user_id);


-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backpack_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mini_game_bets ENABLE ROW LEVEL SECURITY;

-- Permissive Client Access Rules (for Web Applet)
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public profiles write" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public profiles update" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public voice_rooms read" ON public.voice_rooms FOR SELECT USING (true);
CREATE POLICY "Public voice_rooms write" ON public.voice_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Public voice_rooms update" ON public.voice_rooms FOR UPDATE USING (true);

CREATE POLICY "Public room_seats read" ON public.room_seats FOR SELECT USING (true);
CREATE POLICY "Public room_seats write" ON public.room_seats FOR ALL USING (true);

CREATE POLICY "Public gifts read" ON public.gifts FOR SELECT USING (true);
CREATE POLICY "Public gift_logs read" ON public.gift_logs FOR SELECT USING (true);
CREATE POLICY "Public gift_logs write" ON public.gift_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Public seller_transactions read" ON public.seller_transactions FOR SELECT USING (true);
CREATE POLICY "Public seller_transactions write" ON public.seller_transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public withdrawals read" ON public.withdrawals FOR SELECT USING (true);
CREATE POLICY "Public withdrawals write" ON public.withdrawals FOR INSERT WITH CHECK (true);

CREATE POLICY "Public store_items read" ON public.store_items FOR SELECT USING (true);
CREATE POLICY "Public backpack read" ON public.backpack_items FOR SELECT USING (true);
CREATE POLICY "Public backpack write" ON public.backpack_items FOR ALL USING (true);

CREATE POLICY "Public messages read" ON public.direct_messages FOR SELECT USING (true);
CREATE POLICY "Public messages write" ON public.direct_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Public room_messages read" ON public.room_messages FOR SELECT USING (true);
CREATE POLICY "Public room_messages write" ON public.room_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Public games read" ON public.mini_game_bets FOR SELECT USING (true);
CREATE POLICY "Public games write" ON public.mini_game_bets FOR INSERT WITH CHECK (true);


-- ==============================================================================
-- 14. INITIAL SEED DATA (POPULAR GIFTS & STORE ITEMS)
-- ==============================================================================
INSERT INTO public.gifts (id, name, category, coin_price, diamond_reward, icon, animation_type, is_lucky, lucky_max_multiplier)
VALUES
  ('gift_rose', 'Red Rose', 'Classic', 10, 7, '🌹', 'css', false, 1),
  ('gift_chocolate', 'Box of Chocolates', 'Classic', 50, 35, '🍫', 'css', false, 1),
  ('gift_kiss', 'Romantic Kiss', 'Romantic', 99, 70, '💋', 'css', false, 1),
  ('gift_teddy', 'Cute Teddy', 'Romantic', 299, 210, '🧸', 'particles', false, 1),
  ('gift_perfume', 'Luxury Perfume', 'Luxury', 520, 364, '✨', 'particles', false, 1),
  ('gift_ring', 'Diamond Ring', 'Romantic', 1314, 920, '💍', 'particles', false, 1),
  ('gift_sports_car', 'Super Sports Car', 'Luxury', 5000, 3500, '🏎️', 'svga', false, 1),
  ('gift_rocket', 'Galaxy Rocket', 'Effects', 9999, 7000, '🚀', 'svga', false, 1),
  ('gift_dragon', 'Golden Dragon', 'Exclusive', 19999, 14000, '🐉', '3d', false, 1),
  ('gift_castle', 'Royal Castle', 'Exclusive', 50000, 35000, '🏰', '3d', false, 1),
  ('gift_lucky_wheel', 'Lucky Spin Bag', 'Lucky', 100, 70, '🎰', 'particles', true, 500),
  ('gift_lucky_pot', 'Leprechaun Gold Pot', 'Lucky', 500, 350, '🏺', 'particles', true, 1000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.store_items (id, name, category, description, icon, badge_tag, rarity, price_7_days, price_30_days, price_permanent)
VALUES
  ('frame_fire_dragon', 'Fire Dragon Avatar Frame', 'frames', 'Blazing dragon aura surrounding your profile', '🐲', 'HOT', 'Legendary', 1500, 5000, 15000),
  ('frame_royal_gold', 'Royal Gold Crown Frame', 'frames', 'Gleaming 24K gold frame with royal jewels', '👑', 'VIP', 'Epic', 1000, 3500, 10000),
  ('frame_cyber_neon', 'Cyberpunk Neon Hex Frame', 'frames', 'Futuristic glowing neon cyan hex grid', '⚡', 'NEW', 'Rare', 800, 2500, 7500),
  ('ride_lamborghini', 'Golden Aventador Supercar', 'rides', 'Arrive in live rooms with roaring V12 engine sounds', '🏎️', 'HOT', 'Mythic', 5000, 16000, 50000),
  ('ride_magic_carpet', 'Arabian Magic Carpet', 'rides', 'Float gracefully into voice parties on starry clouds', '🧞', 'POPULAR', 'Epic', 2500, 8000, 25000),
  ('ride_phoenix_wings', 'Phoenix Fire Wings', 'rides', 'Spread burning mystical wings on every stage entrance', '🔥', 'EXCLUSIVE', 'Legendary', 4000, 13000, 40000)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 15. EMAIL OTP & VERIFICATION SYSTEM (For New User Registration)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  purpose TEXT DEFAULT 'signup' CHECK (purpose IN ('signup', 'login', 'reset_password')),
  attempts INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_email_otps_email ON public.email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_expires ON public.email_otps(expires_at);

ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public email_otps read" ON public.email_otps FOR SELECT USING (true);
CREATE POLICY "Public email_otps write" ON public.email_otps FOR INSERT WITH CHECK (true);
CREATE POLICY "Public email_otps update" ON public.email_otps FOR UPDATE USING (true);

-- Schema setup complete.
