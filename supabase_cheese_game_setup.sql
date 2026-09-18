-- Cheese Thief (หนูชีสอยู่ไหน) — multiplayer room game tables
-- รันใน Supabase Dashboard → SQL Editor (ต่อจาก supabase_setup.sql)

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

create policy "allow all" on cheese_rooms for all using (true) with check (true);
create policy "allow all" on cheese_players for all using (true) with check (true);
create policy "allow all" on cheese_votes for all using (true) with check (true);
create policy "allow all" on cheese_chat for all using (true) with check (true);
create policy "allow all" on cheese_night_log for all using (true) with check (true);

alter publication supabase_realtime add table cheese_rooms;
alter publication supabase_realtime add table cheese_players;
alter publication supabase_realtime add table cheese_votes;
alter publication supabase_realtime add table cheese_chat;
