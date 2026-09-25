import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

export const SUPABASE_URL: string =
  env.VITE_SUPABASE_URL ||
  env.SUPABASE_URL ||
  'https://rfkigpyehwcogmdnauik.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY: string =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.SUPABASE_ANON_KEY ||
  'sb_publishable_8O9V72MbNlgyRxLq9kGI7w_AScupRT2';

export const SUPABASE_JWKS_URL: string =
  env.VITE_SUPABASE_JWKS_URL ||
  env.SUPABASE_JWKS_URL ||
  'https://rfkigpyehwcogmdnauik.supabase.co/auth/v1/.well-known/jwks.json';

export const isSupabaseConfigured: boolean = Boolean(
  SUPABASE_URL &&
  SUPABASE_PUBLISHABLE_KEY &&
  SUPABASE_URL !== 'https://your-project.supabase.co' &&
  !SUPABASE_URL.includes('placeholder')
);

let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!clientInstance) {
    try {
      clientInstance = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return clientInstance;
};

// Health Check / Connection Test
export interface SupabaseHealthResult {
  connected: boolean;
  url: string;
  projectRef: string;
  tablesFound: string[];
  tablesMissing: string[];
  latencyMs?: number;
  message: string;
  errorDetails?: string;
}

export const checkSupabaseHealth = async (): Promise<SupabaseHealthResult> => {
  const client = getSupabase();
  const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0] || 'rwcwrstsxedipqteqyls';

  if (!client) {
    return {
      connected: false,
      url: SUPABASE_URL,
      projectRef,
      tablesFound: [],
      tablesMissing: ['profiles', 'voice_rooms', 'seller_transactions', 'gift_logs'],
      message: 'Supabase client is not configured or initialized.',
    };
  }

  const startTime = Date.now();
  const tablesToCheck = ['profiles', 'voice_rooms', 'seller_transactions', 'gift_logs'];
  const tablesFound: string[] = [];
  const tablesMissing: string[] = [];

  try {
    for (const table of tablesToCheck) {
      const { error } = await client.from(table).select('count', { count: 'exact', head: true });
      if (!error) {
        tablesFound.push(table);
      } else if (error.code === 'PGRST205') {
        // Table does not exist in schema cache
        tablesMissing.push(table);
      } else {
        // Table exists but RLS or permission
        tablesFound.push(table);
      }
    }

    const latencyMs = Date.now() - startTime;

    return {
      connected: true,
      url: SUPABASE_URL,
      projectRef,
      tablesFound,
      tablesMissing,
      latencyMs,
      message: tablesMissing.length === 0
        ? 'Connected! All Supabase database tables are active and ready.'
        : `Connected to Supabase endpoint! (${tablesMissing.length} tables pending SQL setup)`,
    };
  } catch (err: any) {
    return {
      connected: false,
      url: SUPABASE_URL,
      projectRef,
      tablesFound: [],
      tablesMissing: tablesToCheck,
      message: 'Failed to communicate with Supabase API.',
      errorDetails: err?.message || String(err),
    };
  }
};

// Sync helpers (Safe background fire-and-forget sync)
export const syncProfileToSupabase = async (profile: any): Promise<void> => {
  const client = getSupabase();
  if (!client) return;
  try {
    const payload = {
      id: profile.id,
      numeric_id: profile.numericId || profile.id,
      username: profile.username,
      display_name: profile.displayName,
      avatar: profile.avatar || null,
      role: profile.role || 'user',
      coins: profile.coins ?? 1000,
      diamonds: profile.diamonds ?? 0,
      is_seller: Boolean(profile.isSeller),
      seller_verified: Boolean(profile.sellerProfile?.isVerified),
      seller_discount_rate: profile.sellerProfile?.discountRate ?? 15,
      seller_rating: profile.sellerProfile?.rating ?? 5.0,
      seller_total_sales: profile.sellerProfile?.totalSales ?? 0,
      vip_tier: profile.vipTier || 'vip_0',
      level: profile.level ?? 1,
      bio: profile.bio || null,
      country: profile.country || 'Global',
      updated_at: new Date().toISOString(),
    };
    await client.from('profiles').upsert(payload, { onConflict: 'id' });
  } catch (err) {
    console.debug('Supabase profile sync notice (table may need creation):', err);
  }
};

export const syncRoomToSupabase = async (room: any): Promise<void> => {
  const client = getSupabase();
  if (!client) return;
  try {
    const payload = {
      id: room.id,
      title: room.title,
      category: room.category || 'Chat',
      cover_image: room.coverUrl || null,
      host_id: room.hostId || null,
      is_active: true,
      is_locked: Boolean(room.isLocked),
      speaker_count: room.micSeats?.filter((s: any) => s.user).length || 1,
      listener_count: room.listeners?.length || 0,
      room_diamonds: room.totalGiftsReceivedCoins || 0,
      announcement: room.announcement || null,
    };
    await client.from('voice_rooms').upsert(payload, { onConflict: 'id' });
  } catch (err) {
    console.debug('Supabase room sync notice:', err);
  }
};

export const syncTransactionToSupabase = async (tx: any): Promise<void> => {
  const client = getSupabase();
  if (!client) return;
  try {
    const payload = {
      id: tx.id,
      tx_hash: tx.txHash || tx.id,
      seller_id: tx.sellerId || null,
      recipient_id: tx.recipientId || null,
      recipient_numeric_id: tx.recipientNumericId || '',
      recipient_username: tx.recipientUsername || '',
      coin_amount: tx.coinAmount || 0,
      official_price_usd: tx.officialPriceUsd || 0,
      discounted_price_usd: tx.discountedPriceUsd || 0,
      discount_rate: tx.discountRate || 0,
      payment_method: tx.paymentMethod || 'bank_transfer',
      status: tx.status || 'COMPLETED',
      notes: tx.notes || null,
    };
    await client.from('seller_transactions').upsert(payload, { onConflict: 'id' });
  } catch (err) {
    console.debug('Supabase transaction sync notice:', err);
  }
};

export const syncGiftLogToSupabase = async (giftData: any): Promise<void> => {
  const client = getSupabase();
  if (!client) return;
  try {
    const payload = {
      id: giftData.id || `gift_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      room_id: giftData.roomId || null,
      sender_id: giftData.senderId || null,
      receiver_id: giftData.receiverId || null,
      gift_id: giftData.giftId || '',
      gift_name: giftData.giftName || '',
      gift_icon: giftData.giftIcon || null,
      coin_cost: giftData.coinCost || 0,
      combo_count: giftData.comboCount || 1,
    };
    await client.from('gift_logs').insert(payload);
  } catch (err) {
    console.debug('Supabase gift log sync notice:', err);
  }
};

// SQL Schema Reference for the user to execute in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- AuraVoice Database Schema for Supabase
-- Target Project URL: https://rwcwrstsxedipqteqyls.supabase.co
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Profiles / Users Table
create table if not exists public.profiles (
  id text primary key,
  numeric_id text unique not null,
  username text unique not null,
  display_name text not null,
  avatar text,
  role text default 'user', -- 'user' | 'creator' | 'seller' | 'agent' | 'admin'
  coins bigint default 1000,
  diamonds bigint default 0,
  is_seller boolean default false,
  seller_verified boolean default false,
  seller_discount_rate integer default 15,
  seller_rating numeric(2,1) default 5.0,
  seller_total_sales bigint default 0,
  vip_tier text default 'vip_0',
  level integer default 1,
  bio text,
  country text default 'Global',
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Live Voice Rooms Table
create table if not exists public.voice_rooms (
  id text primary key,
  title text not null,
  category text not null default 'Chat',
  cover_image text,
  host_id text,
  is_active boolean default true,
  is_locked boolean default false,
  speaker_count integer default 1,
  listener_count integer default 0,
  room_diamonds bigint default 0,
  announcement text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Coin Reseller & Wallet Transactions
create table if not exists public.seller_transactions (
  id text primary key,
  tx_hash text unique not null,
  seller_id text,
  recipient_id text,
  recipient_numeric_id text not null,
  recipient_username text not null,
  coin_amount bigint not null,
  official_price_usd numeric(10,2) not null,
  discounted_price_usd numeric(10,2) not null,
  discount_rate integer not null,
  payment_method text default 'bank_transfer',
  status text default 'COMPLETED', -- 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Gift History Ledger
create table if not exists public.gift_logs (
  id text primary key,
  room_id text,
  sender_id text,
  receiver_id text,
  gift_id text not null,
  gift_name text not null,
  gift_icon text,
  coin_cost bigint not null,
  combo_count integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.voice_rooms enable row level security;
alter table public.seller_transactions enable row level security;
alter table public.gift_logs enable row level security;

-- 7. Public Read & Insert/Update Policies (Permissive for Applet Client)
drop policy if exists "Allow public read on profiles" on public.profiles;
create policy "Allow public read on profiles" on public.profiles for select using (true);

drop policy if exists "Allow public write on profiles" on public.profiles;
create policy "Allow public write on profiles" on public.profiles for insert with check (true);

drop policy if exists "Allow public update on profiles" on public.profiles;
create policy "Allow public update on profiles" on public.profiles for update using (true);

drop policy if exists "Allow public read on voice_rooms" on public.voice_rooms;
create policy "Allow public read on voice_rooms" on public.voice_rooms for select using (true);

drop policy if exists "Allow public write on voice_rooms" on public.voice_rooms;
create policy "Allow public write on voice_rooms" on public.voice_rooms for insert with check (true);

drop policy if exists "Allow public update on voice_rooms" on public.voice_rooms;
create policy "Allow public update on voice_rooms" on public.voice_rooms for update using (true);

drop policy if exists "Allow public read on transactions" on public.seller_transactions;
create policy "Allow public read on transactions" on public.seller_transactions for select using (true);

drop policy if exists "Allow public insert on transactions" on public.seller_transactions;
create policy "Allow public insert on transactions" on public.seller_transactions for insert with check (true);

drop policy if exists "Allow public read on gifts" on public.gift_logs;
create policy "Allow public read on gifts" on public.gift_logs for select using (true);

drop policy if exists "Allow public insert on gifts" on public.gift_logs;
create policy "Allow public insert on gifts" on public.gift_logs for insert with check (true);
`;
