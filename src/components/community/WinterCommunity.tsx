// components/community/WinterCommunity.tsx — หน้าแรกใหม่ของเว็บ: "Winter Community" ศูนย์รวมเกมและสังคมของกลุ่มเรา
// โครง: แถบเมนูซ้าย (เดสก์ท็อป) / แถบล่าง (มือถือ) · หน้าแรก · เกม · ผู้คน · แชท · อันดับ
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, LogOut, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import logoImage from '../../assets/images/winter_exam_logo_1789496745669.jpg';
import { supabaseSim } from '../../utils/supabaseSim';
import type { RegisteredUser } from '../../utils/supabaseSim';
import { AmbientParticles } from '../AmbientParticles';
import { Avatar, Glass, SectionTitle, isOnline } from './ui';
import { PeopleSection } from './PeopleSection';
import { ChatSection } from './ChatSection';
import { RankingSection } from './RankingSection';

export interface SubjectBrief { id: string; name: string; description: string; totalQuestions: number; icon: string }

interface Props {
  username: string;
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  subjects: SubjectBrief[];
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onStartExam: () => void;
  onOpenCheese: () => void;
  onOpenWerewolf: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  onTap: () => void;
}

type Section = 'home' | 'games' | 'people' | 'chat' | 'ranking';
const NAV: { id: Section; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: 'หน้าแรก' },
  { id: 'games', icon: '🎮', label: 'เกม' },
  { id: 'people', icon: '👥', label: 'ผู้คน' },
  { id: 'chat', icon: '💬', label: 'แชท' },
  { id: 'ranking', icon: '🏆', label: 'อันดับ' },
];

interface GameCard {
  id: 'werewolf' | 'cheese' | 'exam';
  emoji: string;
  name: string;
  tagline: string;
  points: string[];
  tags: string[];
  gradient: string;
  cta: string;
}
const GAMES: GameCard[] = [
  {
    id: 'werewolf', emoji: '🐺', name: 'แววูฟ', tagline: 'เกมหมาป่าออนไลน์ เล่นกับเพื่อนแบบเรียลไทม์',
    points: ['บทบาทมากกว่า 30 บท ตั้งชุดบทเองได้', 'กลางคืนทุกคนทำพร้อมกัน ไม่ต้องรอตา', 'ร้านค้า กาชา แต่งอวตารกว่า 7,000 ชิ้น', 'เลเวล อันดับ และเพื่อนในเกม'],
    tags: ['5–30 คน', 'ออนไลน์', 'ภาษาไทย'], gradient: 'from-indigo-600 via-violet-600 to-rose-600', cta: 'เข้าห้องเล่นเลย',
  },
  {
    id: 'cheese', emoji: '🐭', name: 'หนูชีส', tagline: 'วิ่งเก็บชีส หนีกับดัก ท้าอันดับกับเพื่อน',
    points: ['เล่นสั้นๆ สนุกได้ทุกที่', 'แข่งคะแนนกับสมาชิกในชุมชน'],
    tags: ['เล่นคนเดียว', 'ทำคะแนน'], gradient: 'from-amber-500 via-orange-500 to-rose-500', cta: 'เล่นเกมหนูชีส',
  },
  {
    id: 'exam', emoji: '📚', name: 'คลังข้อสอบ', tagline: 'ซ้อมข้อสอบ 6 วิชา พร้อมเฉลยละเอียดภาษาไทย',
    points: ['โจทย์กว่า 1,200 ข้อ สุ่มได้ไม่ซ้ำ', 'อันดับคะแนนสะสมของชุมชน'],
    tags: ['6 วิชา', 'มีเฉลย'], gradient: 'from-cyan-500 via-sky-500 to-blue-600', cta: 'เริ่มทำข้อสอบ',
  },
];

export const WinterCommunity: React.FC<Props> = ({
  username, theme, soundEnabled, subjects, onToggleTheme, onToggleSound, onStartExam, onOpenCheese, onOpenWerewolf, onOpenProfile, onLogout, onTap,
}) => {
  const isDark = theme === 'dark';
  const [section, setSection] = useState<Section>('home');
  const [chatWith, setChatWith] = useState<string | null>(null);
  const [peopleTab, setPeopleTab] = useState<'friends' | 'all' | 'requests'>('friends');
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [requestCount, setRequestCount] = useState(0);
  const [, setTick] = useState(0);

  // ข้อมูลภาพรวมชุมชน (ใช้ทั้งหน้าแรกและป้ายแจ้งเตือนบนเมนู)
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [u, f, r] = await Promise.all([supabaseSim.getRealUsers(), supabaseSim.getFriends(username), supabaseSim.getFriendRequests(username)]);
      if (!alive) return;
      setUsers(u); setFriends(f); setRequestCount(r.length);
    };
    void load();
    const id = setInterval(() => { if (!document.hidden) void load(); }, 15000);
    const onStore = () => { setTick((t) => t + 1); void load(); }; // โปรไฟล์/แชทเปลี่ยน → วาดใหม่
    window.addEventListener('storage', onStore);
    return () => { alive = false; clearInterval(id); window.removeEventListener('storage', onStore); };
  }, [username]);

  const me = username.toLowerCase();
  const online = useMemo(() => users.filter((u) => isOnline(u.last_active) && u.username.toLowerCase() !== me), [users, me]);
  const profile = supabaseSim.getProfile(username);

  const go = (s: Section, ptab: 'friends' | 'all' | 'requests' = 'friends') => { onTap(); if (s === 'people') setPeopleTab(ptab); setSection(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const play = (id: GameCard['id']) => { onTap(); if (id === 'werewolf') onOpenWerewolf(); else if (id === 'cheese') onOpenCheese(); else onStartExam(); };

  const strong = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const iconBtn = `min-w-10 min-h-10 sm:min-w-11 sm:min-h-11 rounded-2xl border flex items-center justify-center cursor-pointer transition-colors ${isDark ? 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10' : 'bg-white/80 border-white text-slate-700 hover:bg-white shadow-sm'}`;

  // ---------------------------------------------------------------- หน้าแรก
  const home = (
    <div className="space-y-6">
      <Glass isDark={isDark} className="relative overflow-hidden p-5 sm:p-8">
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-gradient-to-br from-cyan-400/30 to-violet-500/30 blur-3xl pointer-events-none" aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <button onClick={onOpenProfile} aria-label="แก้ไขโปรไฟล์" className="self-start cursor-pointer"><Avatar username={username} size={84} ring online /></button>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-xs font-black tracking-widest text-cyan-400">WINTER COMMUNITY</p>
            <h1 className={`text-2xl sm:text-4xl font-black leading-tight ${strong}`}>สวัสดี {username} 👋</h1>
            <p className={`text-sm ${muted}`}>{profile.bio}</p>
            <div className="flex flex-wrap gap-2 pt-2 text-xs font-black">
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400">🟢 ออนไลน์ {online.length + 1} คน</span>
              <span className="px-3 py-1.5 rounded-full bg-cyan-500/15 text-cyan-400">💙 เพื่อน {friends.length} คน</span>
              <button onClick={() => go('people', 'all')} className="px-3 py-1.5 rounded-full bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 cursor-pointer">👥 สมาชิก {users.length} คน ›</button>
            </div>
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <button onClick={() => play('werewolf')} className="group inline-flex items-center gap-2 px-6 min-h-12 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-rose-500 shadow-lg shadow-violet-500/25 hover:scale-[1.03] active:scale-95 transition-transform cursor-pointer">
            🐺 เล่นแววูฟ <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={() => go('chat')} className={`inline-flex items-center gap-2 px-6 min-h-12 rounded-2xl font-black text-sm cursor-pointer active:scale-95 transition-transform ${isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-slate-900/90 text-white hover:bg-slate-800'}`}>
            💬 ไปแชทกับเพื่อน
          </button>
        </div>
      </Glass>

      <section className="space-y-3">
        <SectionTitle isDark={isDark} icon="🟢" title="ออนไลน์ตอนนี้" hint={online.length ? 'แตะที่ชื่อเพื่อดูในหน้าผู้คน' : 'ตอนนี้ยังไม่มีคนอื่นออนไลน์'} right={<button onClick={() => go('people', 'all')} className="text-xs font-black text-cyan-400 hover:underline cursor-pointer">ดูสมาชิกทั้งหมด</button>} />
        <Glass isDark={isDark} className="p-4">
          {online.length === 0 ? (
            <p className={`text-sm text-center py-3 ${muted}`}>ชวนเพื่อนเข้ามาคุยกัน แล้วจะเห็นชื่อที่นี่ ✨</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-1">
              {online.slice(0, 20).map((u) => (
                <button key={u.username} onClick={() => go('people', 'all')} className="shrink-0 w-16 text-center space-y-1.5 cursor-pointer">
                  <Avatar username={u.username} size={56} online />
                  <div className={`text-[11px] font-bold truncate ${strong}`}>{u.username}</div>
                </button>
              ))}
            </div>
          )}
        </Glass>
      </section>

      <section className="space-y-3">
        <SectionTitle isDark={isDark} icon="✨" title="เกมแนะนำ" right={<button onClick={() => go('games')} className="text-xs font-black text-cyan-400 hover:underline cursor-pointer">ดูทั้งหมด</button>} />
        <GameFeature game={GAMES[0]} onPlay={() => play('werewolf')} />
        <div className="grid sm:grid-cols-2 gap-4">
          {GAMES.slice(1).map((g) => <GameMini key={g.id} game={g} isDark={isDark} onPlay={() => play(g.id)} />)}
        </div>
      </section>
    </div>
  );

  // ---------------------------------------------------------------- เกม
  const games = (
    <div className="space-y-6">
      <SectionTitle isDark={isDark} icon="🎮" title="เกมทั้งหมด" hint="เลือกเกมที่อยากเล่นกับเพื่อน" />
      <GameFeature game={GAMES[0]} onPlay={() => play('werewolf')} />
      <div className="grid sm:grid-cols-2 gap-4">
        {GAMES.slice(1).map((g) => <GameMini key={g.id} game={g} isDark={isDark} onPlay={() => play(g.id)} />)}
      </div>
      <SectionTitle isDark={isDark} icon="📚" title="วิชาในคลังข้อสอบ" hint="กดการ์ดเพื่อเลือกวิชาและเริ่มทำ" />
      <div className="grid sm:grid-cols-2 gap-3">
        {subjects.map((s) => (
          <button key={s.id} onClick={() => play('exam')} className="text-left cursor-pointer">
            <Glass isDark={isDark} className="p-4 flex gap-3 hover:scale-[1.01] transition-transform h-full">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5" /></div>
              <div className="min-w-0">
                <div className="flex items-center gap-2"><h3 className={`font-black text-sm ${strong}`}>{s.name}</h3><span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400">{s.totalQuestions} ข้อ</span></div>
                <p className={`text-xs mt-0.5 line-clamp-2 ${muted}`}>{s.description}</p>
              </div>
            </Glass>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen relative overflow-x-clip font-sans ${isDark ? 'bg-[#060a16] text-slate-100' : 'bg-gradient-to-b from-sky-50 via-white to-indigo-50 text-slate-900'}`}>
      {/* แสงเหนือ (aurora) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className={`absolute -top-40 left-1/4 w-[44rem] h-[44rem] rounded-full blur-[120px] ${isDark ? 'bg-cyan-500/15' : 'bg-cyan-300/30'}`} />
        <div className={`absolute top-1/3 -right-40 w-[40rem] h-[40rem] rounded-full blur-[120px] ${isDark ? 'bg-violet-600/20' : 'bg-violet-300/30'}`} />
        <div className={`absolute bottom-0 -left-40 w-[36rem] h-[36rem] rounded-full blur-[120px] ${isDark ? 'bg-rose-500/10' : 'bg-rose-200/30'}`} />
      </div>
      <AmbientParticles isDark={isDark} />

      {/* แถบบน */}
      <header className="sticky top-0 z-30 backdrop-blur-xl">
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 border-b ${isDark ? 'border-white/10 bg-[#060a16]/70' : 'border-slate-200/70 bg-white/70'}`}>
          <button onClick={() => go('home')} className="flex items-center gap-2.5 cursor-pointer" aria-label="Winter Community หน้าแรก">
            <img src={logoImage} alt="" className="w-9 h-9 rounded-2xl object-cover border border-white/20" referrerPolicy="no-referrer" />
            <span className="leading-tight text-left min-w-0">
              <span className="block font-black tracking-tight whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300">Winter Community</span>
              <span className={`hidden sm:block text-[10px] font-bold ${muted}`}>เกม · เพื่อน · ข้อสอบ</span>
            </span>
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button onClick={onToggleSound} aria-label={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'} className={`${iconBtn} hidden sm:flex`}>{soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}</button>
            <button onClick={onToggleTheme} aria-label={isDark ? 'โหมดสว่าง' : 'โหมดมืด'} className={iconBtn}>{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
            <button onClick={onOpenProfile} aria-label="โปรไฟล์ของฉัน" className="cursor-pointer"><Avatar username={username} size={36} ring /></button>
            <button onClick={onLogout} aria-label="ออกจากระบบ" className={iconBtn}><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-8">
        {/* เมนูซ้าย (เดสก์ท็อป) */}
        <nav aria-label="เมนูหลัก" className="hidden md:flex flex-col gap-2 w-52 shrink-0 sticky top-24 self-start">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              aria-current={section === n.id ? 'page' : undefined}
              className={`flex items-center gap-3 px-4 min-h-12 rounded-2xl font-black text-sm text-left cursor-pointer transition-all ${
                section === n.id
                  ? 'bg-gradient-to-r from-cyan-400/90 to-violet-500/90 text-white shadow-lg shadow-cyan-500/20'
                  : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-white/80'
              }`}
            >
              <span className="text-lg">{n.icon}</span>{n.label}
              {n.id === 'people' && requestCount > 0 && <span className="ml-auto min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[11px] flex items-center justify-center">{requestCount}</span>}
            </button>
          ))}
          <button onClick={() => { onTap(); onStartExam(); }} className={`mt-3 flex items-center gap-3 px-4 min-h-12 rounded-2xl font-black text-sm cursor-pointer border ${isDark ? 'border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10' : 'border-cyan-500/40 text-cyan-700 hover:bg-cyan-50'}`}>
            <span className="text-lg">📚</span>ทำข้อสอบ
          </button>
        </nav>

        <main className="flex-1 min-w-0 pb-28 md:pb-10">
          {section === 'home' && home}
          {section === 'games' && games}
          {section === 'people' && <PeopleSection username={username} isDark={isDark} onTap={onTap} initialTab={peopleTab} onChat={(f) => { setChatWith(f); setSection('chat'); window.scrollTo({ top: 0 }); }} />}
          {section === 'chat' && <ChatSection username={username} isDark={isDark} initialFriend={chatWith} onTap={onTap} />}
          {section === 'ranking' && <RankingSection username={username} isDark={isDark} onTap={onTap} />}
          <p className={`mt-10 text-center text-[11px] font-bold ${muted}`}>สร้างสรรค์โดย WINTER ❄️ · Winter Community</p>
        </main>
      </div>

      {/* แถบล่าง (มือถือ) */}
      <nav aria-label="เมนูหลัก" className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-xl pb-[env(safe-area-inset-bottom)] ${isDark ? 'bg-[#060a16]/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
        <div className="grid grid-cols-5">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => go(n.id)} aria-current={section === n.id ? 'page' : undefined} className={`relative flex flex-col items-center justify-center gap-0.5 min-h-16 text-[11px] font-black cursor-pointer ${section === n.id ? 'text-cyan-400' : muted}`}>
              <span className={`text-xl transition-transform ${section === n.id ? 'scale-110' : ''}`}>{n.icon}</span>{n.label}
              {n.id === 'people' && requestCount > 0 && <span className="absolute top-2 right-[28%] min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">{requestCount}</span>}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

// ---------------------------------------------------------------- การ์ดเกม
const GameFeature: React.FC<{ game: GameCard; onPlay: () => void }> = ({ game, onPlay }) => (
  <div className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${game.gradient} p-6 sm:p-8 text-white shadow-2xl`}>
    <div className="absolute -right-6 -top-6 text-[9rem] sm:text-[12rem] opacity-20 select-none pointer-events-none leading-none" aria-hidden>{game.emoji}</div>
    <div className="relative max-w-xl space-y-3">
      <div className="flex flex-wrap gap-2">{game.tags.map((t) => <span key={t} className="px-3 py-1 rounded-full bg-black/25 text-[11px] font-black">{t}</span>)}</div>
      <h3 className="text-3xl sm:text-4xl font-black">{game.emoji} {game.name}</h3>
      <p className="text-sm sm:text-base font-semibold text-white/90">{game.tagline}</p>
      <ul className="space-y-1.5 text-sm font-bold text-white/90">{game.points.map((p) => <li key={p}>✔ {p}</li>)}</ul>
      <button onClick={onPlay} className="group inline-flex items-center gap-2 mt-2 px-6 min-h-12 rounded-2xl bg-white text-slate-900 font-black text-sm shadow-lg hover:scale-[1.03] active:scale-95 transition-transform cursor-pointer">
        {game.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
);

const GameMini: React.FC<{ game: GameCard; isDark: boolean; onPlay: () => void }> = ({ game, isDark, onPlay }) => (
  <button onClick={onPlay} className="text-left cursor-pointer group">
    <div className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${game.gradient} p-5 text-white shadow-xl h-full group-hover:scale-[1.015] transition-transform`}>
      <div className="absolute -right-3 -top-3 text-8xl opacity-20 select-none leading-none" aria-hidden>{game.emoji}</div>
      <div className="relative space-y-2">
        <div className="flex flex-wrap gap-1.5">{game.tags.map((t) => <span key={t} className="px-2.5 py-0.5 rounded-full bg-black/25 text-[10px] font-black">{t}</span>)}</div>
        <h3 className="text-xl font-black">{game.emoji} {game.name}</h3>
        <p className="text-xs font-semibold text-white/90">{game.tagline}</p>
        <span className="inline-flex items-center gap-1.5 pt-1 text-xs font-black">{game.cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
      </div>
    </div>
  </button>
);
