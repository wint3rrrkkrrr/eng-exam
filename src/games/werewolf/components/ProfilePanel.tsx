import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { ROLES } from '../engine';
import type { ProgressView, RoleStat } from '../shared/progress';
import { getGameFriends, getLeaderboard, getMyProgress } from '../net/community';
import type { FriendRow, LeaderboardRow } from '../net/community';

type Tab = 'me' | 'rank' | 'friends';
const TEAM_TH: Record<string, string> = { village: 'ชาวบ้าน', wolf: 'หมาป่า', lovers: 'คู่รัก', solo: 'ฝ่ายอิสระ', vampire: 'แวมไพร์', cult: 'ลัทธิ' };
const MEDAL = ['🥇', '🥈', '🥉'];

const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
    <div className="text-xl font-black text-white tabular-nums">{value}</div>
    <div className="text-[11px] text-slate-400 font-bold">{label}</div>
  </div>
);

/** โปรไฟล์ผู้เล่นแววูฟ: เลเวล/XP/สถิติ · อันดับ · เพื่อน (ใช้ข้อมูลบัญชีเดียวกับ Winter Community) */
export const ProfilePanel: React.FC<{ username: string; onClose: () => void }> = ({ username, onClose }) => {
  const [tab, setTab] = useState<Tab>('me');
  const [me, setMe] = useState<ProgressView | null>(null);
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [friends, setFriends] = useState<FriendRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void getMyProgress().then((r) => { if (!alive) return; if (r.ok) setMe(r.data); else setErr(r.errorTh); });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    let alive = true;
    if (tab === 'rank' && rows === null) void getLeaderboard().then((r) => { if (alive && r.ok) setRows(r.data.rows); });
    if (tab === 'friends' && friends === null) void getGameFriends().then((r) => { if (alive) setFriends(r.ok ? r.data.rows : []); });
    return () => { alive = false; };
  }, [tab, rows, friends]);

  const tabBtn = (t: Tab, label: string) => (
    <button role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`flex-1 min-h-11 rounded-xl text-sm font-black cursor-pointer ${tab === t ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>{label}</button>
  );
  const roleRows = me ? (Object.entries(me.stats.byRole) as [string, RoleStat][]).sort((a, b) => b[1].g - a[1].g).slice(0, 6) : [];
  const pct = me ? Math.min(100, Math.round((me.xpInto / Math.max(1, me.xpNeed)) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-[80] bg-[#070b1a] text-slate-100 overflow-y-auto" role="dialog" aria-label="โปรไฟล์ผู้เล่น">
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">🏅 โปรไฟล์ผู้เล่น</h2>
          <button onClick={onClose} aria-label="ปิด" className="min-w-12 min-h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex gap-2" role="tablist">{tabBtn('me', '📊 ของฉัน')}{tabBtn('rank', '🏆 อันดับ')}{tabBtn('friends', '💙 เพื่อน')}</div>

        {tab === 'me' && (
          err ? <p className="text-sm text-red-300 text-center py-10">{err}</p>
          : !me ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          : (
            <div className="space-y-4">
              <div className="rounded-3xl bg-gradient-to-br from-violet-700/60 to-indigo-900/60 border border-violet-300/20 p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-violet-200 font-bold">{me.title}</div>
                    <div className="text-xl font-black truncate">{username}</div>
                  </div>
                  <div className="shrink-0 w-16 h-16 rounded-full bg-amber-400 text-zinc-900 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-[10px] font-black leading-none">LEVEL</span><span className="text-2xl font-black leading-none">{me.level}</span>
                  </div>
                </div>
                <div>
                  <div className="h-3 rounded-full bg-black/30 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="ความคืบหน้าไปเลเวลถัดไป">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] text-violet-100 font-bold tabular-nums">
                    <span>{me.xpInto} / {me.xpNeed} XP</span><span>อีก {Math.max(0, me.xpNeed - me.xpInto)} XP ถึงเลเวล {me.level + 1}</span>
                  </div>
                </div>
                <div className="text-xs text-violet-100">อันดับ: <b>{me.rank ? `#${me.rank}` : 'ยังไม่มี (เล่นให้จบ 1 เกมก่อน)'}</b> · XP รวม {me.xp.toLocaleString()}</div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Stat label="เล่นแล้ว" value={me.stats.games} />
                <Stat label="ชนะ" value={me.stats.wins} />
                <Stat label="อัตราชนะ" value={`${me.stats.winRate}%`} />
                <Stat label="รอดจนจบ" value={me.stats.survived} />
                <Stat label="ชนะติดต่อกัน" value={me.stats.streak} />
                <Stat label="สถิติสูงสุด" value={me.stats.bestStreak} />
              </div>

              {Object.keys(me.stats.byTeam).length > 0 && (
                <section className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
                  <h3 className="text-sm font-black">ผลงานแยกฝ่าย</h3>
                  {(Object.entries(me.stats.byTeam) as [string, RoleStat][]).map(([t, s]) => (
                    <div key={t} className="flex items-center gap-3 text-sm">
                      <span className="w-24 shrink-0 font-bold">{TEAM_TH[t] ?? t}</span>
                      <div className="flex-1 h-2 rounded-full bg-black/30 overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${Math.round((s.w / Math.max(1, s.g)) * 100)}%` }} /></div>
                      <span className="w-16 text-right text-xs text-slate-300 tabular-nums">{s.w}/{s.g}</span>
                    </div>
                  ))}
                </section>
              )}
              {roleRows.length > 0 && (
                <section className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
                  <h3 className="text-sm font-black">บทที่เล่นบ่อย</h3>
                  {roleRows.map(([r, s]) => (
                    <div key={r} className="flex justify-between text-sm"><span className="font-bold">{ROLES[r]?.nameTh ?? r}</span><span className="text-xs text-slate-300 tabular-nums">เล่น {s.g} · ชนะ {s.w}</span></div>
                  ))}
                </section>
              )}
              <p className="text-[11px] text-slate-500 text-center">ได้ XP ทุกครั้งที่เล่นจบ: เล่น +30 · ชนะ +40 · รอดชีวิต +15 · ขึ้นเลเวลได้เหรียญโบนัส</p>
            </div>
          )
        )}

        {tab === 'rank' && (
          rows === null ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          : rows.length === 0 ? <p className="text-sm text-slate-400 text-center py-10">ยังไม่มีอันดับ — เล่นให้จบเกมแรกเลย!</p>
          : (
            <ol className="space-y-2">
              {rows.map((r) => (
                <li key={r.username} className={`flex items-center gap-3 p-3 rounded-2xl ${r.username.toLowerCase() === username.toLowerCase() ? 'bg-violet-600/30 ring-1 ring-violet-300/40' : 'bg-white/5'}`}>
                  <span className="w-8 text-center font-black">{MEDAL[r.rank - 1] ?? r.rank}</span>
                  <div className="min-w-0 flex-1"><div className="font-black truncate">{r.username}</div><div className="text-[11px] text-slate-400 truncate">{r.title}</div></div>
                  <div className="text-right shrink-0"><div className="font-black text-amber-300">Lv.{r.level}</div><div className="text-[11px] text-slate-400 tabular-nums">ชนะ {r.wins}/{r.games}</div></div>
                </li>
              ))}
            </ol>
          )
        )}

        {tab === 'friends' && (
          friends === null ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          : friends.length === 0 ? <p className="text-sm text-slate-400 text-center py-10">ยังไม่มีเพื่อน — เพิ่มเพื่อนได้ที่หน้า Winter Community → ผู้คน</p>
          : (
            <ul className="space-y-2">
              {friends.map((f) => (
                <li key={f.username} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${f.online ? 'bg-emerald-400' : 'bg-slate-600'}`} aria-label={f.online ? 'ออนไลน์' : 'ออฟไลน์'} />
                  <div className="min-w-0 flex-1"><div className="font-black truncate">{f.username}</div><div className="text-[11px] text-slate-400">{f.online ? 'ออนไลน์อยู่ตอนนี้' : 'ออฟไลน์'}</div></div>
                  <span className="font-black text-amber-300 text-sm">Lv.{f.level}</span>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
};
