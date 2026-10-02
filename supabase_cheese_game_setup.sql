-- Cheese Thief (หนูชีสอยู่ไหน) — multiplayer room game tables
-- รันใน Supabase Dashboard → SQL Editor — รันซ้ำกี่รอบก็ได้ (ไม่ error ถ้ามีของอยู่แล้ว)

create table if not exists cheese_rooms (
  room_code text primary key,
  host_username text not null,
  phase text not null default 'lobby',           -- lobby | night | day | voting | ended
  current_hour int not null default 0,            -- 0 = ยังไม่เริ่ม, 1-6 = ช่วงกลางคืน
  cheese_location text not null default 'center', -- center | stolen
  accomplice_count int not null default 1,
  discussion_seconds int not null default 180,
  day_phase_ends_at timestamptz,
  vote_round int not null default 1,
  winner text,                                    -- mice | thief | null
  revealed_usernames text[] default '{}',         -- usernames whose role has been revealed
  created_at timestamptz default now()
);

-- ตั้งค่าห้องเพิ่มเติม (โค้ดเกมใช้ทุกตัว — ถ้าขาดจะสร้างห้องไม่ได้)
alter table cheese_rooms add column if not exists action_seconds int not null default 15;
alter table cheese_rooms add column if not exists night_hours int not null default 6;
alter table cheese_rooms add column if not exists allow_peek boolean not null default true;
alter table cheese_rooms add column if not exists anonymous_vote boolean not null default false;
alter table cheese_rooms add column if not exists show_timer boolean not null default true;
alter table cheese_rooms add column if not exists show_live_votes boolean not null default false;
alter table cheese_rooms add column if not exists max_players int not null default 20;
alter table cheese_rooms add column if not exists dawn_chat_seconds int not null default 30;

create table if not exists cheese_players (
  room_code text not null references cheese_rooms(room_code) on delete cascade,
  username text not null,
  avatar text default '',
  role text,               -- mouse | thief | accomplice (null until game starts)
  dice_hour int,           -- 1-6 (null until game starts)
  is_host boolean default false,
  is_kicked boolean default false,
  joined_at timestamptz default now(),
  primary key (room_code, username)
);
alter table cheese_players add column if not exists mouse_hat text;

create table if not exists cheese_votes (
  room_code text not null,
  round int not null default 1,
  voter text not null,
  target text not null,
  voted_at timestamptz default now(),
  primary key (room_code, round, voter)
);

create table if not exists cheese_chat (
  id text primary key default gen_random_uuid()::text,
  room_code text not null,
  sender text not null,
  avatar text default '',
  text text not null,
  channel text not null default 'main',  -- main | thief (ช่องลับโจร+สมุน)
  "timestamp" timestamptz default now()
);

create table if not exists cheese_night_log (
  room_code text not null,
  hour int not null,
  username text not null,
  role text not null,
  created_at timestamptz default now(),
  primary key (room_code, hour, username)
);

alter table cheese_rooms enable row level security;
alter table cheese_players enable row level security;
alter table cheese_votes enable row level security;
alter table cheese_chat enable row level security;
alter table cheese_night_log enable row level security;

drop policy if exists "allow all" on cheese_rooms;
drop policy if exists "allow all" on cheese_players;
drop policy if exists "allow all" on cheese_votes;
drop policy if exists "allow all" on cheese_chat;
drop policy if exists "allow all" on cheese_night_log;
create policy "allow all" on cheese_rooms for all using (true) with check (true);
create policy "allow all" on cheese_players for all using (true) with check (true);
create policy "allow all" on cheese_votes for all using (true) with check (true);
create policy "allow all" on cheese_chat for all using (true) with check (true);
create policy "allow all" on cheese_night_log for all using (true) with check (true);

-- เปิด realtime (ข้ามถ้าเพิ่มไปแล้ว)
do $$
declare t text;
begin
  foreach t in array array['cheese_rooms','cheese_players','cheese_votes','cheese_chat'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;
