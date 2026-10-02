// components/community/ui.tsx — ส่วนประกอบพื้นฐานของ Winter Community (การ์ดกระจก · อวตาร · จุดออนไลน์ · เวลาแบบ "x นาทีที่แล้ว")
import React from 'react';
import { supabaseSim } from '../../utils/supabaseSim';

export const ONLINE_WINDOW_MS = 5 * 60_000;

export function isOnline(lastActiveIso: string | null | undefined, now = Date.now()): boolean {
  if (!lastActiveIso) return false;
  const t = Date.parse(lastActiveIso);
  return Number.isFinite(t) && now - t < ONLINE_WINDOW_MS;
}

export function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return 'ไม่ทราบ';
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return 'ไม่ทราบ';
  const s = Math.max(0, Math.floor((now - t) / 1000));
  if (s < 60) return 'เมื่อสักครู่';
  if (s < 3600) return `${Math.floor(s / 60)} นาทีที่แล้ว`;
  if (s < 86400) return `${Math.floor(s / 3600)} ชั่วโมงที่แล้ว`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} วันที่แล้ว`;
  return new Date(t).toLocaleDateString('th-TH');
}

/** การ์ดกระจกฝ้า — พื้นผิวหลักของทั้งหน้า */
export const Glass: React.FC<{ isDark: boolean; className?: string; children: React.ReactNode; as?: 'div' | 'section' }> = ({ isDark, className = '', children, as: Tag = 'div' }) => (
  <Tag className={`rounded-[28px] border backdrop-blur-xl ${isDark ? 'bg-white/[0.045] border-white/10 shadow-[0_8px_40px_rgba(0,0,0,.35)]' : 'bg-white/75 border-white shadow-[0_8px_30px_rgba(80,110,160,.14)]'} ${className}`}>
    {children}
  </Tag>
);

export const Avatar: React.FC<{ username: string; size?: number; online?: boolean; ring?: boolean }> = ({ username, size = 40, online, ring }) => {
  const p = supabaseSim.getProfile(username);
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <img
        src={p.avatar}
        alt={username}
        referrerPolicy="no-referrer"
        className={`w-full h-full rounded-full object-cover ${ring ? 'ring-2 ring-cyan-300/80' : ''}`}
      />
      {online !== undefined && (
        <span
          aria-label={online ? 'ออนไลน์' : 'ออฟไลน์'}
          className={`absolute bottom-0 right-0 rounded-full border-2 ${online ? 'bg-emerald-400 border-emerald-900' : 'bg-slate-500 border-slate-900'}`}
          style={{ width: Math.max(10, size * 0.26), height: Math.max(10, size * 0.26) }}
        />
      )}
    </span>
  );
};

export const SectionTitle: React.FC<{ isDark: boolean; icon?: string; title: string; hint?: string; right?: React.ReactNode }> = ({ isDark, icon, title, hint, right }) => (
  <div className="flex items-end justify-between gap-3 px-1">
    <div>
      <h2 className={`text-lg sm:text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{icon && <span className="mr-1.5">{icon}</span>}{title}</h2>
      {hint && <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{hint}</p>}
    </div>
    {right}
  </div>
);

export const pill = (isDark: boolean, active: boolean): string =>
  `px-4 min-h-10 rounded-full text-xs sm:text-sm font-black whitespace-nowrap cursor-pointer transition-all ${
    active
      ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-white shadow-lg shadow-cyan-500/20'
      : isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-900/5 text-slate-600 hover:bg-slate-900/10'
  }`;
