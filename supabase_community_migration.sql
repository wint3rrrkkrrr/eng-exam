-- Winter Community + แววูฟ: ตารางความก้าวหน้า (เลเวล/XP/สถิติ) และรายงานผู้เล่น
-- รันไฟล์นี้ไฟล์เดียวใน Supabase SQL Editor ได้เลย รันซ้ำได้ปลอดภัย (ไม่มีการเปลี่ยนตารางเดิม)

-- 1) ความก้าวหน้าของผู้เล่นตามชื่อบัญชี — เปิด RLS ไม่มีนโยบาย + ถอนสิทธิ์ anon = เบราว์เซอร์เขียน/แก้ XP เองไม่ได้
create table if not exists public.ww_progress (
  username   text primary key,
  xp         int  not null default 0,
  wins       int  not null default 0,
  games      int  not null default 0,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists ww_progress_xp_idx on public.ww_progress (xp desc);
alter table public.ww_progress enable row level security;
revoke all on public.ww_progress from anon, authenticated;

-- 2) รายงานผู้เล่น — ผู้ดูแลอ่านผ่านหน้า Admin (เซิร์ฟเวอร์เท่านั้น)
create table if not exists public.ww_reports (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  reporter_name     text not null,
  reporter_username text,
  target_name       text not null,
  room_code         text not null,
  reason            text not null,
  detail            text not null default '',
  status            text not null default 'open',
  note              text not null default ''
);
create index if not exists ww_reports_status_idx on public.ww_reports (status, created_at desc);
alter table public.ww_reports enable row level security;
revoke all on public.ww_reports from anon, authenticated;
