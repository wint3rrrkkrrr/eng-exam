-- =====================================================================
-- supabase_werewolf_setup.sql  —  ตารางของเกมแววูฟ (ขึ้นต้น ww_ ทั้งหมด)
-- ---------------------------------------------------------------------
-- วิธีใช้ (ผู้ใช้ทำเอง ตอนจบ M1/ก่อนเริ่ม M3):
--   1. เปิด Supabase → โปรเจกต์เดิมของเว็บ → เมนู SQL Editor → New query
--   2. วางไฟล์นี้ทั้งไฟล์ แล้วกด Run
--   3. รันซ้ำได้ปลอดภัย (ใช้ if not exists / drop policy if exists)
--
-- ไฟล์นี้ "ไม่แตะ" ตารางเดิม (cheese_* / winter_* / อื่นๆ) แม้แต่ตารางเดียว
--
-- หลักความปลอดภัย (อ่านก่อนแก้!):
--   • ตารางเปิด  = anon อ่านได้ เขียนไม่ได้ (เขียนผ่าน Netlify Function ที่ใช้ service role)
--   • ตารางลับ   = เปิด RLS แล้ว "ไม่มี policy" + ถอนสิทธิ์ anon/authenticated ทั้งหมด
--                  → เบราว์เซอร์อ่าน/เขียนไม่ได้เลย (service role ยังข้ามได้)
--   • ห้ามใส่คอลัมน์ role / rng_seed / password_hash ลงตารางเปิด
--   • ห้ามเปิด Realtime ให้ตารางลับ
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) ตารางเปิด (anon อ่านได้)
-- ---------------------------------------------------------------------

create table if not exists public.ww_rooms (
  room_code        text primary key check (room_code ~ '^[A-Z0-9]{5}$'),
  host_player_id   uuid,
  phase            text not null default 'lobby'
                   check (phase in ('lobby','role_reveal','night','dawn_resolve','morning',
                                    'discussion','nomination','defense','vote','execution','game_over')),
  day_number       int  not null default 0,
  night_slot       int  not null default 0,
  phase_ends_at    timestamptz,
  settings         jsonb not null default '{}'::jsonb,   -- ค่าตั้งค่า + ชุดบท (ข้อมูลที่ทุกคนในห้องเห็นได้)
  state_version    int  not null default 0,              -- ขยับทุกครั้งที่สถานะเปลี่ยน → สัญญาณให้ไคลเอนต์ไปขอมุมมองใหม่
  winners          jsonb,                                -- null ระหว่างเล่น | [{team:'village'|..., players:[...]}]
  is_locked        boolean not null default false,
  has_password     boolean not null default false,       -- บอกแค่ว่ามีรหัสผ่านไหม (แฮชอยู่ในตารางลับ)
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.ww_players (
  player_id      uuid primary key default gen_random_uuid(),
  room_code      text not null references public.ww_rooms(room_code) on delete cascade,
  display_name   text not null check (char_length(display_name) between 1 and 30),
  avatar         text,
  seat           int  not null,
  is_host        boolean not null default false,
  is_bot         boolean not null default false,
  is_alive       boolean not null default true,
  is_connected   boolean not null default true,
  last_seen_at   timestamptz not null default now(),
  can_vote       boolean not null default true,
  death_day      int,
  death_cause    text,
  revealed_role  text,       -- ★ เฉพาะบทที่ "เปิดเผยแล้วตามกติกา" เท่านั้น (ห้ามใส่บทที่ยังลับ)
  revealed_team  text,
  has_revealed_mayor boolean not null default false,   -- ผู้ใหญ่บ้านเลือกเปิดตัวแล้ว
  created_at     timestamptz not null default now(),
  unique (room_code, seat),
  unique (room_code, display_name)
);
-- ★ ไม่มีคอลัมน์ role ในตารางนี้โดยเจตนา (กฎเหล็กข้อ 4)

create table if not exists public.ww_chat_public (
  id            bigint generated always as identity primary key,
  room_code     text not null references public.ww_rooms(room_code) on delete cascade,
  player_id     uuid not null,
  display_name  text not null,
  avatar        text,
  text          text not null check (char_length(text) between 1 and 300),
  created_at    timestamptz not null default now()
);

-- บันทึกเกมฉบับที่เปิดเผยได้ (ประกาศเช้า ผลโหวต เหตุการณ์สาธารณะ)
create table if not exists public.ww_events (
  id             bigint generated always as identity primary key,
  room_code      text not null references public.ww_rooms(room_code) on delete cascade,
  day_number     int  not null,
  phase          text not null,
  kind           text not null,
  payload_public jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

-- การเสนอชื่อเป็นข้อมูลสาธารณะ (ทุกคนเห็นว่าใครเสนอใคร)
create table if not exists public.ww_nominations (
  room_code     text not null references public.ww_rooms(room_code) on delete cascade,
  day_number    int  not null,
  nominator_id  uuid not null,
  nominee_id    uuid not null,
  created_at    timestamptz not null default now(),
  primary key (room_code, day_number, nominator_id)
);

-- ---------------------------------------------------------------------
-- 2) ตารางลับ (anon อ่าน/เขียนไม่ได้เลย)
-- ---------------------------------------------------------------------

-- ข้อมูลลับระดับห้อง: เมล็ดสุ่ม (รู้แล้วคำนวณการแจกบทได้!) + แฮชรหัสผ่านห้อง
create table if not exists public.ww_room_secrets (
  room_code      text primary key references public.ww_rooms(room_code) on delete cascade,
  rng_seed       text not null,
  password_hash  text,
  engine_state   jsonb,           -- สถานะเต็มของเอนจิน (intents, loverPairs ฯลฯ) สำหรับฟังก์ชันเดินเกม
  updated_at     timestamptz not null default now()
);

-- บทลับ + สถานะส่วนตัวของผู้เล่นแต่ละคน
create table if not exists public.ww_secrets (
  player_id    uuid primary key references public.ww_players(player_id) on delete cascade,
  room_code    text not null references public.ww_rooms(room_code) on delete cascade,
  role_id      text not null,     -- ★ บทจริง
  shown_role_id text,             -- บทที่ผู้เล่น "เห็นเป็นของตัวเอง" (คนเมา = บทปลอม | null = ตรงกับจริง)
  start_team   text not null,
  team         text not null,
  win_with     text not null,
  role_state   jsonb not null default '{}'::jsonb,   -- ยาแม่มดเหลือ กระสุน ต้นแบบ บทที่ลอก เครื่องหมายน้ำมัน ฯลฯ
  statuses     jsonb not null default '[]'::jsonb,   -- infected / convertAt / dieAt / silenced ...
  lover_of     uuid
);

-- ตั๋วผู้เล่น: เก็บเฉพาะ "แฮช" ไม่เก็บตั๋วดิบ
create table if not exists public.ww_player_auth (
  player_id   uuid primary key references public.ww_players(player_id) on delete cascade,
  room_code   text not null references public.ww_rooms(room_code) on delete cascade,
  token_hash  text not null,
  created_at  timestamptz not null default now()
);

-- เจตนา (intent) ของแต่ละคืน — กันส่งซ้ำด้วย unique
create table if not exists public.ww_intents (
  id           bigint generated always as identity primary key,
  room_code    text not null references public.ww_rooms(room_code) on delete cascade,
  day_number   int  not null,
  night_slot   int  not null,
  actor_id     uuid not null,
  kind         text not null,
  target_ids   uuid[] not null default '{}',
  meta         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  unique (room_code, day_number, night_slot, actor_id, kind)
);

create table if not exists public.ww_votes (
  room_code   text not null references public.ww_rooms(room_code) on delete cascade,
  day_number  int  not null,
  round       int  not null default 1,
  voter_id    uuid not null,
  target_id   uuid,               -- null = งดออกเสียง
  created_at  timestamptz not null default now(),
  primary key (room_code, day_number, round, voter_id)
);

create table if not exists public.ww_chat_private (
  id           bigint generated always as identity primary key,
  room_code    text not null references public.ww_rooms(room_code) on delete cascade,
  channel      text not null check (channel in ('wolf','lovers','vampire','cult','dead')),
  player_id    uuid not null,
  display_name text not null,
  text         text not null check (char_length(text) between 1 and 300),
  created_at   timestamptz not null default now()
);

-- กระเป๋าเงินของผู้เล่น: เหรียญ + ของที่ซื้อ + อวตารที่ใส่ (ผูกกับอุปกรณ์ด้วยตั๋วกระเป๋า — เก็บเฉพาะแฮช)
-- ★ ตารางลับ: เบราว์เซอร์อ่าน/เขียนไม่ได้เลย ทุกอย่างผ่านฟังก์ชันเซิร์ฟเวอร์ (กันโกงเหรียญ)
create table if not exists public.ww_wallets (
  wallet_id     uuid primary key,
  token_hash    text not null,
  coins         int  not null default 0 check (coins >= 0),
  owned         jsonb not null default '[]'::jsonb,   -- รหัสของที่ซื้อแล้ว (ไม่รวมของฟรี)
  avatar        jsonb,                                 -- อวตารที่ใส่อยู่
  games_played  int  not null default 0,
  wins          int  not null default 0,
  created_at    timestamptz not null default now()
);

-- ผูกกระเป๋ากับบัญชีผู้ใช้ของเว็บ (ล็อกอินเครื่องไหนก็ได้กระเป๋าเดียวกัน) — รันซ้ำได้ปลอดภัย
alter table public.ww_wallets add column if not exists username text;
create unique index if not exists ww_wallets_username_key on public.ww_wallets (username) where username is not null;

-- ผูกที่นั่งในห้องกับกระเป๋า (ไว้จ่ายเหรียญตอนจบเกม)
alter table public.ww_player_auth add column if not exists wallet_id uuid;

-- บันทึกเหตุการณ์ลับทั้งหมด (ใครกัดใคร ผลของแต่ละขั้นในท่อ คำขอที่ถูกปฏิเสธ) — เลื่อนเป็นสาธารณะตอนจบเกม
create table if not exists public.ww_events_private (
  id          bigint generated always as identity primary key,
  room_code   text not null references public.ww_rooms(room_code) on delete cascade,
  day_number  int  not null,
  phase       text not null,
  step        text,                -- เช่น 'pipeline.04protect'
  kind        text not null,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3) ดัชนี
-- ---------------------------------------------------------------------
create index if not exists ww_players_room_idx      on public.ww_players (room_code);
create index if not exists ww_chat_public_room_idx  on public.ww_chat_public (room_code, id);
create index if not exists ww_events_room_idx       on public.ww_events (room_code, id);
create index if not exists ww_secrets_room_idx      on public.ww_secrets (room_code);
create index if not exists ww_intents_room_idx      on public.ww_intents (room_code, day_number, night_slot);
create index if not exists ww_chat_private_room_idx on public.ww_chat_private (room_code, channel, id);
create index if not exists ww_events_private_room_idx on public.ww_events_private (room_code, id);
create index if not exists ww_rooms_created_idx     on public.ww_rooms (created_at);

-- ---------------------------------------------------------------------
-- 4) RLS — ตารางเปิด: อ่านได้อย่างเดียว
-- ---------------------------------------------------------------------
alter table public.ww_rooms        enable row level security;
alter table public.ww_players      enable row level security;
alter table public.ww_chat_public  enable row level security;
alter table public.ww_events       enable row level security;
alter table public.ww_nominations  enable row level security;

drop policy if exists "ww_rooms_read"       on public.ww_rooms;
drop policy if exists "ww_players_read"     on public.ww_players;
drop policy if exists "ww_chat_public_read" on public.ww_chat_public;
drop policy if exists "ww_events_read"      on public.ww_events;
drop policy if exists "ww_nominations_read" on public.ww_nominations;

create policy "ww_rooms_read"       on public.ww_rooms        for select using (true);
create policy "ww_players_read"     on public.ww_players      for select using (true);
create policy "ww_chat_public_read" on public.ww_chat_public  for select using (true);
create policy "ww_events_read"      on public.ww_events       for select using (true);
create policy "ww_nominations_read" on public.ww_nominations  for select using (true);
-- ★ ไม่มี policy สำหรับ insert / update / delete = anon เขียนไม่ได้เลย

revoke insert, update, delete, truncate on
  public.ww_rooms, public.ww_players, public.ww_chat_public, public.ww_events, public.ww_nominations
  from anon, authenticated;
grant select on
  public.ww_rooms, public.ww_players, public.ww_chat_public, public.ww_events, public.ww_nominations
  to anon, authenticated;

-- ---------------------------------------------------------------------
-- 5) RLS — ตารางลับ: เปิด RLS ไม่สร้าง policy + ถอนสิทธิ์ทั้งหมด
-- ---------------------------------------------------------------------
alter table public.ww_room_secrets   enable row level security;
alter table public.ww_secrets        enable row level security;
alter table public.ww_player_auth    enable row level security;
alter table public.ww_intents        enable row level security;
alter table public.ww_votes          enable row level security;
alter table public.ww_chat_private   enable row level security;
alter table public.ww_events_private enable row level security;
alter table public.ww_wallets        enable row level security;
-- ★ จงใจไม่สร้าง policy ใดๆ

revoke all on
  public.ww_room_secrets, public.ww_secrets, public.ww_player_auth, public.ww_intents,
  public.ww_votes, public.ww_chat_private, public.ww_events_private, public.ww_wallets
  from anon, authenticated;

-- ---------------------------------------------------------------------
-- 6) Realtime — เปิดเฉพาะตารางเปิดเท่านั้น (ห้ามเปิดตารางลับ)
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['ww_rooms','ww_players','ww_chat_public','ww_events','ww_nominations'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 7) ล้างห้องเก่า (ไม่บังคับ) — เรียกจากฟังก์ชันเซิร์ฟเวอร์หรือ cron
--    ลบห้องที่ไม่มีความเคลื่อนไหวเกิน 24 ชั่วโมง (cascade ลบลูกทั้งหมด)
-- ---------------------------------------------------------------------
create or replace function public.ww_cleanup_stale_rooms()
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  delete from public.ww_rooms where updated_at < now() - interval '24 hours';
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.ww_cleanup_stale_rooms() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 7b) บันทึกสถานะเกม "รวดเดียว" (atomic) — ใช้โดยฟังก์ชันเซิร์ฟเวอร์ (service role) เท่านั้น
--     ตรวจ state_version ก่อน ถ้าไม่ตรง (มีคนเขียนตัดหน้า) คืน false ไม่เขียนอะไรเลย
--     เขียน 4 อย่างใน transaction เดียว: ห้อง + สถานะเอนจิน + ผู้เล่น + เหตุการณ์
-- ---------------------------------------------------------------------
create or replace function public.ww_commit_state(
  p_room_code       text,
  p_expect_version  int,
  p_room            jsonb,
  p_engine          jsonb,
  p_players         jsonb,
  p_events_public   jsonb,
  p_events_private  jsonb
) returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.ww_rooms set
    phase         = coalesce(p_room->>'phase', phase),
    day_number    = coalesce((p_room->>'day_number')::int, day_number),
    night_slot    = coalesce((p_room->>'night_slot')::int, night_slot),
    phase_ends_at = case when p_room ? 'phase_ends_at' then (p_room->>'phase_ends_at')::timestamptz else phase_ends_at end,
    winners       = case when p_room ? 'winners' then p_room->'winners' else winners end,
    is_locked     = coalesce((p_room->>'is_locked')::boolean, is_locked),
    state_version = state_version + 1,
    updated_at    = now()
  where room_code = p_room_code and state_version = p_expect_version;

  if not found then
    return false;
  end if;

  update public.ww_room_secrets
     set engine_state = p_engine, updated_at = now()
   where room_code = p_room_code;

  update public.ww_players p set
    is_alive      = (x->>'is_alive')::boolean,
    can_vote      = (x->>'can_vote')::boolean,
    death_day     = (x->>'death_day')::int,
    death_cause   = x->>'death_cause',
    revealed_role = x->>'revealed_role',
    revealed_team = x->>'revealed_team'
  from jsonb_array_elements(coalesce(p_players, '[]'::jsonb)) x
  where p.player_id = (x->>'player_id')::uuid and p.room_code = p_room_code;

  insert into public.ww_events (room_code, day_number, phase, kind, payload_public)
  select p_room_code, (e->>'day_number')::int, e->>'phase', e->>'kind', coalesce(e->'payload_public', '{}'::jsonb)
  from jsonb_array_elements(coalesce(p_events_public, '[]'::jsonb)) e;

  insert into public.ww_events_private (room_code, day_number, phase, kind, payload)
  select p_room_code, (e->>'day_number')::int, e->>'phase', e->>'kind', coalesce(e->'payload', '{}'::jsonb)
  from jsonb_array_elements(coalesce(p_events_private, '[]'::jsonb)) e;

  return true;
end
$$;

-- ★ ห้าม anon/ผู้ใช้ทั่วไปเรียกฟังก์ชันนี้ได้ (เรียกได้เฉพาะ service role จากฟังก์ชันเซิร์ฟเวอร์)
revoke all on function public.ww_commit_state(text, int, jsonb, jsonb, jsonb, jsonb, jsonb) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 7c) ซื้อของ / ให้เหรียญ แบบ atomic (เรียกได้เฉพาะ service role จากฟังก์ชันเซิร์ฟเวอร์)
--     ซื้อ: ล็อกแถวกระเป๋า ตรวจเหรียญพอ + ยังไม่มีของ → หักเหรียญ+เพิ่มของ ใน transaction เดียว (กันกดซื้อซ้อน)
-- ---------------------------------------------------------------------
create or replace function public.ww_wallet_buy(p_wallet uuid, p_item text, p_price int)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare w public.ww_wallets%rowtype;
begin
  select * into w from public.ww_wallets where wallet_id = p_wallet for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'none'); end if;
  if w.owned ? p_item then return jsonb_build_object('ok', false, 'reason', 'owned'); end if;
  if w.coins < p_price then return jsonb_build_object('ok', false, 'reason', 'poor'); end if;
  update public.ww_wallets
     set coins = coins - p_price, owned = owned || to_jsonb(p_item)
   where wallet_id = p_wallet;
  return jsonb_build_object('ok', true);
end
$$;

create or replace function public.ww_wallet_credit(p_wallet uuid, p_amount int, p_won boolean)
returns int language plpgsql security invoker set search_path = public as $$
declare c int;
begin
  update public.ww_wallets
     set coins = coins + greatest(p_amount, 0), games_played = games_played + 1,
         wins = wins + (case when p_won then 1 else 0 end)
   where wallet_id = p_wallet
   returning coins into c;
  return c;
end
$$;

revoke all on function public.ww_wallet_buy(uuid, text, int) from public, anon, authenticated;
revoke all on function public.ww_wallet_credit(uuid, int, boolean) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 7c-2) กาชา + แลกโค้ด (เหมือน supabase_gacha_migration.sql — เก็บไว้ที่นี่เพื่อตั้งโปรเจกต์ใหม่ครั้งเดียวจบ)
-- ---------------------------------------------------------------------
create or replace function public.ww_wallet_spin(p_wallet uuid, p_cost int, p_item text, p_refund int)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare w public.ww_wallets%rowtype;
begin
  select * into w from public.ww_wallets where wallet_id = p_wallet for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'none'); end if;
  if w.coins < p_cost then return jsonb_build_object('ok', false, 'reason', 'poor'); end if;
  if w.owned ? p_item then
    update public.ww_wallets set coins = coins - p_cost + greatest(p_refund, 0) where wallet_id = p_wallet;
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;
  update public.ww_wallets set coins = coins - p_cost, owned = owned || to_jsonb(p_item) where wallet_id = p_wallet;
  return jsonb_build_object('ok', true, 'duplicate', false);
end
$$;

create or replace function public.ww_wallet_grant(p_wallet uuid, p_items text[])
returns int language plpgsql security invoker set search_path = public as $$
declare w public.ww_wallets%rowtype; it text; added int := 0; cur jsonb;
begin
  select * into w from public.ww_wallets where wallet_id = p_wallet for update;
  if not found then return null; end if;
  cur := w.owned;
  foreach it in array p_items loop
    if not (cur ? it) then cur := cur || to_jsonb(it); added := added + 1; end if;
  end loop;
  update public.ww_wallets set owned = cur where wallet_id = p_wallet;
  return added;
end
$$;

revoke all on function public.ww_wallet_spin(uuid, int, text, int) from public, anon, authenticated;
revoke all on function public.ww_wallet_grant(uuid, text[]) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 7d) ตัวจำกัดความถี่ (rate limit) — นับคำขอต่อหน้าต่างเวลาแบบ atomic (เรียกได้เฉพาะ service role จากฟังก์ชันเซิร์ฟเวอร์)
-- ---------------------------------------------------------------------
create table if not exists public.ww_rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  hits         int not null default 0
);
alter table public.ww_rate_limits enable row level security;
revoke all on public.ww_rate_limits from anon, authenticated;

create or replace function public.ww_rate_hit(p_key text, p_limit int, p_window int)
returns boolean language plpgsql security invoker set search_path = public as $$
declare h int;
begin
  insert into public.ww_rate_limits as r (key, window_start, hits) values (p_key, now(), 1)
  on conflict (key) do update set
    window_start = case when r.window_start < now() - make_interval(secs => p_window) then now() else r.window_start end,
    hits = case when r.window_start < now() - make_interval(secs => p_window) then 1 else r.hits + 1 end
  returning r.hits into h;
  if random() < 0.01 then
    delete from public.ww_rate_limits where window_start < now() - interval '1 day'; -- เก็บกวาดแถวเก่าเป็นครั้งคราว
  end if;
  return h <= p_limit;
end
$$;
revoke all on function public.ww_rate_hit(text, int, int) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 8) เทสต์ความปลอดภัย (รันหลัง setup เสร็จ ด้วยสิทธิ์ anon — ต้องได้ผลตามที่เขียน)
--    ใน SQL Editor:  set role anon;  แล้วรัน:
--      select * from public.ww_secrets;        -- ต้อง error: permission denied
--      select * from public.ww_player_auth;    -- ต้อง error: permission denied
--      select * from public.ww_room_secrets;   -- ต้อง error: permission denied
--      select * from public.ww_wallets;        -- ต้อง error: permission denied (เหรียญห้ามอ่านจากเบราว์เซอร์)
--      select public.ww_commit_state('X',0,'{}',null,null,null,null);  -- ต้อง error: permission denied
--      insert into public.ww_rooms(room_code) values ('TEST1');  -- ต้อง error
--    เสร็จแล้วรัน:  reset role;
-- ---------------------------------------------------------------------

-- ============================================================
-- M5: โหมดผู้ชม (เข้าห้องหลังเริ่มเกม) — รันซ้ำได้ปลอดภัย
-- ============================================================
alter table public.ww_players add column if not exists is_spectator boolean not null default false;
