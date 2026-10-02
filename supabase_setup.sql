-- WINTER Prep Hub: Supabase Tables Setup
-- รันใน Supabase Dashboard → SQL Editor

-- 1. Users table
create table if not exists winter_users (
  username text primary key,
  joined_at timestamptz default now(),
  last_active timestamptz default now(),
  device_info text default ''
);

-- 1b. บัญชีผู้ใช้ (รหัสผ่าน + เซสชัน) — ตารางลับ: เปิด RLS และ "ไม่มีนโยบายเลย" + ถอนสิทธิ์ anon
--     = เบราว์เซอร์อ่าน/เขียนไม่ได้เด็ดขาด (รวมถึงผ่าน Realtime) เฉพาะฟังก์ชันเซิร์ฟเวอร์ (service role) เข้าถึงได้
--     รหัสผ่านเก็บแบบ scrypt ที่เซิร์ฟเวอร์ · รันซ้ำได้ปลอดภัย
create table if not exists winter_credentials (
  username text primary key,
  password_hash text not null,
  created_at timestamptz default now()
);
create table if not exists winter_sessions (
  token_hash text primary key,
  username text not null,
  created_at timestamptz default now(),
  expires_at timestamptz not null
);
alter table winter_credentials enable row level security;
alter table winter_sessions enable row level security;
revoke all on winter_credentials from anon, authenticated;
revoke all on winter_sessions from anon, authenticated;

-- ย้ายรหัสเดิมจากคอลัมน์ password_hash เก่าใน winter_users (ถ้ามี) เข้าตารางลับ แล้วลบคอลัมน์ทิ้ง (กันแฮชรั่วทางตารางสาธารณะ)
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'winter_users' and column_name = 'password_hash') then
    insert into winter_credentials (username, password_hash)
      select username, password_hash from winter_users where password_hash is not null
      on conflict (username) do nothing;
    alter table winter_users drop column password_hash;
  end if;
end
$$;

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
  device_info text default '',
  mouse_avatar text
);

-- รันซ้ำได้ปลอดภัย: โค้ดแอปบันทึกคอลัมน์ mouse_avatar ด้วย ถ้าไม่มีคอลัมน์นี้ การบันทึกโปรไฟล์/รูปจะล้มเหลวทั้งก้อน
alter table winter_profiles add column if not exists mouse_avatar text;

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

-- RLS Policies: allow all for anon (public app) — รันซ้ำได้ปลอดภัย
drop policy if exists "allow all" on winter_users;
create policy "allow all" on winter_users for all using (true) with check (true);
drop policy if exists "allow all" on winter_scores;
create policy "allow all" on winter_scores for all using (true) with check (true);
drop policy if exists "allow all" on winter_profiles;
create policy "allow all" on winter_profiles for all using (true) with check (true);
drop policy if exists "allow all" on winter_chat;
create policy "allow all" on winter_chat for all using (true) with check (true);
drop policy if exists "allow all" on winter_friends;
create policy "allow all" on winter_friends for all using (true) with check (true);
drop policy if exists "allow all" on winter_friend_requests;
create policy "allow all" on winter_friend_requests for all using (true) with check (true);

-- Enable Realtime for chat
do $$ begin alter publication supabase_realtime add table winter_chat; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table winter_users; exception when duplicate_object then null; end $$;
