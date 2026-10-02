import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, MessageCircle, Search, UserPlus, X } from 'lucide-react';
import { supabaseSim } from '../../utils/supabaseSim';
import type { FriendRequest, RegisteredUser } from '../../utils/supabaseSim';
import { Avatar, Glass, SectionTitle, isOnline, pill, timeAgo } from './ui';

type Tab = 'friends' | 'all' | 'requests';
type Sort = 'active' | 'name' | 'joined';
const PAGE = 30;

interface Props {
  username: string;
  isDark: boolean;
  onChat: (friend: string) => void;
  onTap?: () => void;
  /** แท็บที่เปิดเป็นอันแรก (หน้าแรกส่ง 'all' มาเมื่อกด "สมาชิกทั้งหมด") */
  initialTab?: Tab;
}

/** ผู้คนใน Winter Community: เพื่อนของฉัน · ค้นหาสมาชิก · คำขอเป็นเพื่อน (ข้อมูลจากระบบเพื่อนเดิมของเว็บ) */
export const PeopleSection: React.FC<Props> = ({ username, isDark, onChat, onTap, initialTab }) => {
  const [tab, setTab] = useState<Tab>(initialTab ?? 'friends');
  const [sort, setSort] = useState<Sort>('active');
  const [shown, setShown] = useState(PAGE);
  useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);
  useEffect(() => { setShown(PAGE); }, [tab, sort]);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [query, setQuery] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [u, f, r] = await Promise.all([supabaseSim.getRealUsers(), supabaseSim.getFriends(username), supabaseSim.getFriendRequests(username)]);
      setUsers(u);
      setFriends(f);
      setRequests(r);
    } finally {
      setLoading(false); // ออฟไลน์/ฐานข้อมูลล่ม ก็ไม่ค้างหน้าโหลด
    }
  }, [username]);

  useEffect(() => {
    void load();
    const id = setInterval(() => { if (!document.hidden) void load(); }, 8000);
    const onStore = () => void load();
    window.addEventListener('storage', onStore);
    return () => { clearInterval(id); window.removeEventListener('storage', onStore); };
  }, [load]);

  const byName = useMemo(() => new Map(users.map((u) => [u.username.toLowerCase(), u])), [users]);
  const isFriend = (n: string) => friends.some((f) => f.toLowerCase() === n.toLowerCase());
  const me = username.toLowerCase();

  const friendRows = useMemo(
    () => friends.map((n) => ({ name: n, last: byName.get(n.toLowerCase())?.last_active ?? null })).sort((a, b) => Number(isOnline(b.last)) - Number(isOnline(a.last)) || a.name.localeCompare(b.name)),
    [friends, byName],
  );
  const everyone = useMemo(() => {
    const q = query.trim().toLowerCase();
    const t = (iso: string) => { const n = Date.parse(iso); return Number.isFinite(n) ? n : 0; };
    return users
      .filter((u) => !q || u.username.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sort === 'name') return a.username.localeCompare(b.username, 'th');
        if (sort === 'joined') return t(b.joined_at) - t(a.joined_at);
        return Number(isOnline(b.last_active)) - Number(isOnline(a.last_active)) || t(b.last_active) - t(a.last_active);
      });
  }, [users, query, sort]);
  const onlineTotal = useMemo(() => users.filter((u) => isOnline(u.last_active)).length, [users]);

  const add = async (name: string) => {
    onTap?.();
    const r = await supabaseSim.sendFriendRequest(username, name);
    setMsg(r.message);
    setTimeout(() => setMsg(null), 3500);
  };
  const respond = async (id: string, accept: boolean) => {
    onTap?.();
    await supabaseSim.respondFriendRequest(id, accept);
    await load();
  };

  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const strong = isDark ? 'text-white' : 'text-slate-900';
  const row = `flex items-center gap-3 p-3 rounded-2xl ${isDark ? 'bg-white/[0.04] hover:bg-white/[0.07]' : 'bg-white/70 hover:bg-white'} transition-colors`;
  const iconBtn = 'min-w-10 min-h-10 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90';

  return (
    <div className="space-y-4">
      <SectionTitle isDark={isDark} icon="👥" title="ผู้คน" hint={`สมาชิกทั้งหมด ${users.length} คน · ออนไลน์ ${onlineTotal} คน · เพื่อนของคุณ ${friends.length} คน`} />

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        <button role="tab" aria-selected={tab === 'friends'} className={pill(isDark, tab === 'friends')} onClick={() => setTab('friends')}>💙 เพื่อนของฉัน</button>
        <button role="tab" aria-selected={tab === 'all'} className={pill(isDark, tab === 'all')} onClick={() => setTab('all')}>🌍 สมาชิกทั้งหมด ({users.length})</button>
        <button role="tab" aria-selected={tab === 'requests'} className={pill(isDark, tab === 'requests')} onClick={() => setTab('requests')}>
          📨 คำขอ{requests.length > 0 && <span className="ml-1.5 inline-flex min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[11px] items-center justify-center">{requests.length}</span>}
        </button>
      </div>

      {msg && <p role="status" className="rounded-2xl px-4 py-2.5 text-sm font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">{msg}</p>}

      <Glass isDark={isDark} className="p-3 sm:p-4 space-y-2">
        {loading && <p className={`text-sm text-center py-8 ${muted}`}>กำลังโหลด…</p>}

        {!loading && tab === 'friends' && (friendRows.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <div className="text-4xl">🫂</div>
            <p className={`font-bold ${strong}`}>ยังไม่มีเพื่อน</p>
            <p className={`text-sm ${muted}`}>ไปที่แท็บ "สมาชิกทั้งหมด" เพื่อเพิ่มเพื่อนคนแรกของคุณ</p>
            <button className={pill(isDark, true)} onClick={() => setTab('all')}>ดูสมาชิกทั้งหมด</button>
          </div>
        ) : friendRows.map((f) => (
          <div key={f.name} className={row}>
            <Avatar username={f.name} size={46} online={isOnline(f.last)} />
            <div className="min-w-0 flex-1">
              <div className={`font-black truncate ${strong}`}>{f.name}</div>
              <div className={`text-xs truncate ${muted}`}>{isOnline(f.last) ? '🟢 ออนไลน์อยู่' : `ใช้งานล่าสุด ${timeAgo(f.last)}`} · {supabaseSim.getProfile(f.name).bio}</div>
            </div>
            <button onClick={() => { onTap?.(); onChat(f.name); }} aria-label={`แชทกับ ${f.name}`} className={`${iconBtn} bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25`}>
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        )))}

        {!loading && tab === 'all' && (
          <>
            <div className="flex flex-col sm:flex-row gap-2">
              <label className={`flex-1 flex items-center gap-2 px-4 min-h-12 rounded-2xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-white border-slate-200'}`}>
                <Search className={`w-4 h-4 ${muted}`} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ค้นหาชื่อสมาชิก…"
                  aria-label="ค้นหาสมาชิก"
                  className={`flex-1 bg-transparent outline-none text-sm ${strong}`}
                />
              </label>
              <div className="flex gap-1.5" role="radiogroup" aria-label="เรียงตาม">
                {([['active', 'ใช้งานล่าสุด'], ['joined', 'สมัครล่าสุด'], ['name', 'ชื่อ ก–ฮ']] as const).map(([k, label]) => (
                  <button key={k} role="radio" aria-checked={sort === k} onClick={() => setSort(k)} className={pill(isDark, sort === k)}>{label}</button>
                ))}
              </div>
            </div>
            <p className={`text-xs px-1 ${muted}`}>พบ {everyone.length} คน{query ? ` จากคำค้น "${query}"` : ''}</p>
            {everyone.length === 0 && <p className={`text-sm text-center py-6 ${muted}`}>ไม่พบสมาชิกที่ตรงกับคำค้น</p>}
            {everyone.slice(0, shown).map((u) => {
              const mine = u.username.toLowerCase() === me;
              const prof = supabaseSim.getProfile(u.username);
              return (
                <div key={u.username} className={row}>
                  <Avatar username={u.username} size={50} online={isOnline(u.last_active)} />
                  <div className="min-w-0 flex-1">
                    <div className={`font-black truncate ${strong}`}>{u.username}{mine && <span className="ml-1.5 text-[11px] text-cyan-300">(คุณ)</span>}</div>
                    <div className={`text-xs truncate ${muted}`}>{prof.bio}</div>
                    <div className={`text-[11px] ${muted}`}>{isOnline(u.last_active) ? '🟢 ออนไลน์อยู่' : `ใช้งานล่าสุด ${timeAgo(u.last_active)}`} · เข้าร่วม {u.joined_at ? new Date(u.joined_at).toLocaleDateString('th-TH') : 'ไม่ทราบ'}</div>
                  </div>
                  {mine ? null : isFriend(u.username) ? (
                    <button onClick={() => { onTap?.(); onChat(u.username); }} aria-label={`แชทกับ ${u.username}`} className={`${iconBtn} bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25`}><MessageCircle className="w-4 h-4" /></button>
                  ) : (
                    <button onClick={() => add(u.username)} aria-label={`เพิ่มเพื่อน ${u.username}`} className={`${iconBtn} px-4 gap-1.5 text-xs font-black bg-gradient-to-r from-cyan-400 to-violet-500 text-white`}>
                      <UserPlus className="w-4 h-4" /> เพิ่ม
                    </button>
                  )}
                </div>
              );
            })}
            {shown < everyone.length && (
              <button onClick={() => setShown((n) => n + PAGE)} className={`w-full min-h-12 rounded-2xl text-sm font-black cursor-pointer ${isDark ? 'bg-white/5 hover:bg-white/10 text-slate-200' : 'bg-slate-900/5 hover:bg-slate-900/10 text-slate-700'}`}>
                แสดงเพิ่มอีก {Math.min(PAGE, everyone.length - shown)} คน (เหลือ {everyone.length - shown})
              </button>
            )}
          </>
        )}

        {!loading && tab === 'requests' && (requests.length === 0 ? (
          <p className={`text-sm text-center py-10 ${muted}`}>ไม่มีคำขอเป็นเพื่อนที่รออยู่ 📭</p>
        ) : requests.map((r) => (
          <div key={r.id} className={row}>
            <Avatar username={r.fromUsername} size={46} online={isOnline(byName.get(r.fromUsername.toLowerCase())?.last_active)} />
            <div className="min-w-0 flex-1">
              <div className={`font-black truncate ${strong}`}>{r.fromUsername}</div>
              <div className={`text-xs ${muted}`}>อยากเป็นเพื่อนกับคุณ · {timeAgo(r.timestamp)}</div>
            </div>
            <button onClick={() => respond(r.id, true)} aria-label="รับเป็นเพื่อน" className={`${iconBtn} bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30`}><Check className="w-4 h-4" /></button>
            <button onClick={() => respond(r.id, false)} aria-label="ปฏิเสธ" className={`${iconBtn} bg-rose-500/15 text-rose-300 hover:bg-rose-500/25`}><X className="w-4 h-4" /></button>
          </div>
        )))}
      </Glass>
    </div>
  );
};
