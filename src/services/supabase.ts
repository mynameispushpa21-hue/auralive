import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!clientInstance) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return clientInstance;
};

// SQL Schema Reference for the user
export const SUPABASE_SQL_SCHEMA = `-- AuraVoice Database Schema for Supabase SQL Editor
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
  host_id text references public.profiles(id) on delete cascade,
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
  seller_id text references public.profiles(id),
  recipient_id text references public.profiles(id),
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
  room_id text references public.voice_rooms(id) on delete set null,
  sender_id text references public.profiles(id),
  receiver_id text references public.profiles(id),
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

-- 7. Public Read & Authenticated Write Policies
create policy "Allow public read on profiles" on public.profiles for select using (true);
create policy "Allow public read on voice_rooms" on public.voice_rooms for select using (true);
create policy "Allow public read on transactions" on public.seller_transactions for select using (true);
create policy "Allow public insert on transactions" on public.seller_transactions for insert with check (true);
create policy "Allow public read on gifts" on public.gift_logs for select using (true);
create policy "Allow public insert on gifts" on public.gift_logs for insert with check (true);
`;
