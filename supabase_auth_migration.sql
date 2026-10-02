-- สิ่งที่เพิ่มใหม่ (ระบบบัญชีฝั่งเซิร์ฟเวอร์ + ตัวจำกัดความถี่) — รันไฟล์นี้ไฟล์เดียวใน Supabase SQL Editor ได้เลย รันซ้ำได้ปลอดภัย
-- (ถ้าตั้งโปรเจกต์ใหม่ทั้งหมด ให้รัน supabase_setup.sql / supabase_cheese_game_setup.sql / supabase_werewolf_setup.sql แทน)

-- 1) บัญชีผู้ใช้: รหัสผ่านและเซสชันอยู่ในตารางลับ (เปิด RLS ไม่มีนโยบาย + ถอนสิทธิ์ anon = เบราว์เซอร์เข้าถึงไม่ได้เลย)
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

-- 2) ย้ายรหัสเดิมจากคอลัมน์เก่าใน winter_users (ถ้ามี) เข้าตารางลับ แล้วลบคอลัมน์ทิ้ง (กันแฮชรั่วทางตารางสาธารณะ/Realtime)
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

-- 3) คอลัมน์รูปโปรไฟล์ (ถ้ายังไม่มี) + กระเป๋าเงินผูกบัญชี
alter table winter_profiles add column if not exists mouse_avatar text;
alter table public.ww_wallets add column if not exists username text;
create unique index if not exists ww_wallets_username_key on public.ww_wallets (username) where username is not null;

-- 4) ตัวจำกัดความถี่ (rate limit) — เรียกได้เฉพาะ service role จากฟังก์ชันเซิร์ฟเวอร์
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
    delete from public.ww_rate_limits where window_start < now() - interval '1 day';
  end if;
  return h <= p_limit;
end
$$;
revoke all on function public.ww_rate_hit(text, int, int) from public, anon, authenticated;
