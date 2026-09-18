-- WINTER Prep Hub: Supabase Tables Setup
-- รันใน Supabase Dashboard → SQL Editor

-- 1. Users table
create table if not exists winter_users (
  username text primary key,
  joined_at timestamptz default now(),
  last_active timestamptz default now(),
  device_info text default ''
);

-- 2. Scores table
create table if not exists winter_scores (
  id text primary key default gen_random_uuid()::text,
  username text not null,
  subject_id text not null,
  subject_name text not null,
  score int default 0,
  max_questions int default 0,
  streak int default 0,
  created_at timestamptz default now(),
  device_info text default ''
);

-- 3. Profiles table
create table if not exists winter_profiles (
  username text primary key,
  avatar text default '',
  bio text default '',
  joined_at timestamptz default now(),
  last_active timestamptz default now(),
  device_info text default ''
);

-- 4. Chat messages table
create table if not exists winter_chat (
  id text primary key default gen_random_uuid()::text,
  sender text not null,
  recipient text,
  text text not null,
  timestamp timestamptz default now(),
  is_global boolean default true,
  avatar text default ''
);

-- 5. Friends table
create table if not exists winter_friends (
  username text not null,
  friend_username text not null,
  primary key (username, friend_username)
);

-- 6. Friend requests table
create table if not exists winter_friend_requests (
  id text primary key default gen_random_uuid()::text,
  from_username text not null,
  to_username text not null,
  timestamp timestamptz default now(),
  status text default 'pending'
);

-- Enable Row Level Security (อนุญาต anon อ่าน/เขียนได้)
alter table winter_users enable row level security;
alter table winter_scores enable row level security;
alter table winter_profiles enable row level security;
alter table winter_chat enable row level security;
alter table winter_friends enable row level security;
alter table winter_friend_requests enable row level security;

-- RLS Policies: allow all for anon (public app)
create policy "allow all" on winter_users for all using (true) with check (true);
create policy "allow all" on winter_scores for all using (true) with check (true);
create policy "allow all" on winter_profiles for all using (true) with check (true);
create policy "allow all" on winter_chat for all using (true) with check (true);
create policy "allow all" on winter_friends for all using (true) with check (true);
create policy "allow all" on winter_friend_requests for all using (true) with check (true);

-- Enable Realtime for chat
alter publication supabase_realtime add table winter_chat;
alter publication supabase_realtime add table winter_users;
