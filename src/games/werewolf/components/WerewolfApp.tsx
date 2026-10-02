import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, DoorOpen, Gift, Loader2, PlusCircle, Shirt, Sparkles } from 'lucide-react';
import { UI } from '../text/th';
import { api, loadSession, saveSession } from '../net/werewolfClient';
import type { Session } from '../net/werewolfClient';
import type { AuthResponse } from '../shared/api';
import type { AvatarConfig } from '../shared/avatar';
import { ensureWallet, loadWallet, savedAccount, walletBody } from '../net/wallet';
import { WerewolfRoom } from './WerewolfRoom';
import { Wardrobe } from './Wardrobe';
import type { WardrobeTab } from './Wardrobe';
import { AvatarArt } from './avatar/AvatarArt';
import { HowToPlay } from './HowToPlay';
import { AvatarLab } from './AvatarLab';
import { SoundControls } from './SoundControls';
import { setMusic } from '../shared/sound';

// ดาวบนท้องฟ้าหน้าเมนู [x%, y%, ขนาด px] — ตำแหน่งคงที่ (ไม่สุ่มทุกครั้งที่วาด)
const STARS: [number, number, number][] = Array.from({ length: 56 }, (_, i) => [(i * 37 + 11) % 100, (i * 53 + 7) % 92, 1 + (i % 4) * 0.6]);

interface Props {
  username: string;
  isDark: boolean; // เกมนี้ใช้ธีมกลางคืนของตัวเองเสมอ (ไม่ขึ้นกับโหมดสว่าง/มืดของเว็บ)
  onBack: () => void;
}

export const WerewolfApp: React.FC<Props> = ({ username, onBack }) => {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [name, setName] = useState(username || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [busy, setBusy] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wardrobe, setWardrobe] = useState(false);
  const [shopTab, setShopTab] = useState<WardrobeTab>('wardrobe');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [summary, setSummary] = useState<{ coins: number; avatar: AvatarConfig } | null>(null);
  const [howTo, setHowTo] = useState(false);
  const [canSpectate, setCanSpectate] = useState(false);
  useEffect(() => { if (!session) setMusic('menu'); }, [session]); // เพลงหน้าแรก/ร้านค้า (ในห้องใช้เพลงตามเฟส)

  // ล็อกอินด้วยบัญชีเว็บแล้ว → ดึงกระเป๋า/ตู้เสื้อผ้าของ "บัญชี" มาไว้ในเครื่องนี้ก่อนเข้าห้อง (เปลี่ยนเครื่องก็ได้ของเดิม)
  const refreshSummary = async () => {
    const r = await ensureWallet();
    if (r.ok) setSummary({ coins: r.data.wallet.coins, avatar: r.data.wallet.avatar });
  };
  useEffect(() => {
    void refreshSummary();
  }, []);

  const openShop = (tab: WardrobeTab) => {
    setShopTab(tab);
    setWardrobe(true);
  };

  if (import.meta.env.DEV && typeof location !== 'undefined' && location.search.includes('avatarlab')) return <AvatarLab />;

  if (session) {
    return (
      <WerewolfRoom
        session={session}
        onLeave={(msg) => {
          setSession(null);
          setError(msg ?? null);
        }}
      />
    );
  }

  const enter = (auth: AuthResponse) => {
    const s: Session = { roomCode: auth.roomCode, playerId: auth.playerId, token: auth.token };
    saveSession(s);
    setSession(s);
  };

  const create = async () => {
    if (!name.trim()) return setError(UI.errors.needName);
    setBusy('create');
    setError(null);
    if (savedAccount()) await ensureWallet();
    const r = await api<AuthResponse>('create-room', { displayName: name, password: password || undefined, ...walletBody(loadWallet()) });
    setBusy(null);
    if (!r.ok) return setError(r.errorTh);
    enter(r.data);
  };

  const join = async (spectate = false) => {
    if (!name.trim()) return setError(UI.errors.needName);
    if (code.trim().length !== 5) return setError(UI.errors.needCode);
    setBusy('join');
    setError(null);
    setCanSpectate(false);
    if (savedAccount()) await ensureWallet();
    const r = await api<AuthResponse>('join-room', { roomCode: code, displayName: name, password: joinPassword || undefined, spectate: spectate || undefined, ...walletBody(loadWallet()) });
    setBusy(null);
    if (!r.ok) {
      setCanSpectate(r.code === 'locked_can_spectate');
      return setError(r.code === 'locked_can_spectate' ? UI.spectate.offer : r.errorTh);
    }
    enter(r.data);
  };

  const input = 'w-full min-h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-fuchsia-300/70 focus:bg-white/10 text-base transition-colors';
  const tiles: { key: string; label: string; icon: React.ReactNode; grad: string; onClick: () => void }[] = [
    { key: 'how', label: 'วิธีเล่น', icon: <BookOpen className="w-6 h-6" />, grad: 'from-sky-500/80 to-blue-700/80', onClick: () => setHowTo(true) },
    { key: 'wardrobe', label: 'ตู้เสื้อผ้า', icon: <Shirt className="w-6 h-6" />, grad: 'from-pink-500/80 to-fuchsia-700/80', onClick: () => openShop('wardrobe') },
    { key: 'gacha', label: 'กาชา', icon: <Sparkles className="w-6 h-6" />, grad: 'from-amber-400/80 to-orange-600/80', onClick: () => openShop('gacha') },
    { key: 'redeem', label: 'แลกโค้ด', icon: <Gift className="w-6 h-6" />, grad: 'from-emerald-400/80 to-teal-600/80', onClick: () => openShop('redeem') },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060a1c] text-slate-100">
      <style>{`
        @keyframes ww-twinkle { 0%,100% { opacity:.15; transform:scale(.7) } 50% { opacity:1; transform:scale(1.2) } }
        @keyframes ww-float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
        @keyframes ww-glow { 0%,100% { filter:drop-shadow(0 0 18px rgba(255,214,120,.45)) } 50% { filter:drop-shadow(0 0 34px rgba(255,214,120,.8)) } }
        @keyframes ww-shine { 0% { background-position:0% 50% } 100% { background-position:200% 50% } }
        @keyframes ww-rise { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }
        .ww-rise { animation: ww-rise .6s ease both }
        @media (prefers-reduced-motion: reduce) { .ww-anim, .ww-rise { animation:none !important } }
      `}</style>

      {/* ท้องฟ้ากลางคืน */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(124,58,237,.45),transparent_55%),radial-gradient(ellipse_at_85%_60%,rgba(219,39,119,.22),transparent_50%),radial-gradient(ellipse_at_10%_80%,rgba(37,99,235,.25),transparent_50%)]" />
        {STARS.map((s, i) => (
          <span key={i} className="ww-anim absolute rounded-full bg-white" style={{ left: `${s[0]}%`, top: `${s[1]}%`, width: s[2], height: s[2], animation: `ww-twinkle ${2 + (i % 5) * 0.7}s ease-in-out ${(i % 7) * 0.4}s infinite` }} />
        ))}
      </div>

      {wardrobe && <Wardrobe initialTab={shopTab} onClose={() => { setWardrobe(false); void refreshSummary(); }} />}
      {howTo && <HowToPlay onClose={() => setHowTo(false)} />}

      <div className="relative max-w-md mx-auto px-4 pt-4 pb-10 space-y-5">
        <div className="flex items-center justify-between gap-2">
          <button onClick={onBack} className="inline-flex items-center gap-2 min-h-12 text-sm text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> {UI.back}
          </button>
          {summary && (
            <button onClick={() => openShop('wardrobe')} className="inline-flex items-center gap-2 min-h-12 pl-1 pr-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur cursor-pointer" aria-label="ร้านค้าและตู้เสื้อผ้า">
              <span className="w-9 h-9 rounded-full overflow-hidden border-2 border-amber-300/80 bg-sky-300 shrink-0"><AvatarArt config={summary.avatar} className="w-full h-full" still /></span>
              <span className="text-left leading-tight">
                <span className="block text-[11px] font-bold text-slate-200 max-w-[7rem] truncate">{name || username}</span>
                <span className="block text-xs font-black text-amber-300 tabular-nums">🪙 {summary.coins.toLocaleString()}</span>
              </span>
            </button>
          )}
        </div>

        <SoundControls className="absolute top-2 right-2 z-20" />

        {/* พระจันทร์ + หมาป่าหอน */}
        <header className="relative text-center pt-2 ww-rise">
          <div className="ww-anim relative mx-auto w-44 h-44" style={{ animation: 'ww-float 6s ease-in-out infinite' }}>
            <svg viewBox="0 0 200 200" className="w-full h-full ww-anim" style={{ animation: 'ww-glow 4s ease-in-out infinite' }} aria-hidden>
              <defs>
                <radialGradient id="wwMoon" cx=".38" cy=".35" r=".8"><stop offset="0" stopColor="#fffbe6" /><stop offset=".6" stopColor="#ffe9a8" /><stop offset="1" stopColor="#f2c14e" /></radialGradient>
                <linearGradient id="wwHill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a1440" /><stop offset="1" stopColor="#0a0820" /></linearGradient>
              </defs>
              <circle cx="100" cy="92" r="72" fill="url(#wwMoon)" />
              <g fill="#e4c46a" opacity=".5"><circle cx="72" cy="70" r="9" /><circle cx="122" cy="108" r="12" /><circle cx="88" cy="118" r="6" /><circle cx="130" cy="66" r="5" /></g>
              {/* หมาป่าหอนเงาดำ */}
              <g fill="#0a0820">
                {/* ตัว: ท้ายตัว → หลัง → คอเงยขึ้น → ปากชี้ฟ้า → ใต้คาง → อก → ขาหน้า */}
                <path d="M88 160 C84 146 88 132 96 122 C100 116 100 110 102 104 C104 96 108 90 112 84 L128 58 L136 50 C139 52 140 56 138 59 L128 84 C126 92 124 98 124 106 C128 114 132 126 134 142 C135 150 134 156 132 160 Z" />
                {/* หู */}
                <path d="M106 82 L104 64 L116 76 Z" />
                {/* หาง */}
                <path d="M90 154 C78 154 68 146 62 132 C70 142 80 144 92 140 Z" />
              </g>
              <path d="M0 160 Q50 140 100 154 Q150 138 200 158 V200 H0 Z" fill="url(#wwHill)" />
              <path d="M70 160 L66 142 M130 156 L134 140 M100 156 V138" stroke="#0a0820" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="mt-1 pb-2 text-5xl leading-[1.45] font-black tracking-wide bg-clip-text text-transparent bg-[linear-gradient(90deg,#fde68a,#f9a8d4,#a5b4fc,#fde68a)] ww-anim" style={{ backgroundSize: '200% 100%', animation: 'ww-shine 6s linear infinite' }}>{UI.title}</h1>
          <p className="mt-1 text-sm text-slate-300">{UI.subtitle}</p>
        </header>

        {/* ปุ่มลัด */}
        <div className="grid grid-cols-4 gap-2 ww-rise" style={{ animationDelay: '.1s' }}>
          {tiles.map((t) => (
            <button key={t.key} onClick={t.onClick} className={`min-h-20 rounded-2xl bg-gradient-to-b ${t.grad} border border-white/20 shadow-lg shadow-black/30 flex flex-col items-center justify-center gap-1 text-[11px] font-black hover:brightness-110 active:scale-95 transition cursor-pointer`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* สร้าง / เข้าห้อง */}
        <section className="rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-4 space-y-4 shadow-2xl shadow-black/40 ww-rise" style={{ animationDelay: '.2s' }}>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-black/30" role="tablist" aria-label="สร้างหรือเข้าห้อง">
            {([['create', 'สร้างห้องใหม่', PlusCircle], ['join', 'เข้าห้องเพื่อน', DoorOpen]] as const).map(([k, label, Icon]) => (
              <button key={k} role="tab" aria-selected={mode === k} onClick={() => { setMode(k); setError(null); }}
                className={`min-h-12 rounded-xl text-sm font-black inline-flex items-center justify-center gap-2 cursor-pointer transition-colors ${mode === k ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-300">{UI.yourName}</span>
            <input className={input} value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
          </label>

          {mode === 'create' ? (
            <>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-300">{UI.setPassword}</span>
                <input className={input} value={password} maxLength={50} onChange={(e) => setPassword(e.target.value)} />
              </label>
              <button
                onClick={create}
                disabled={busy !== null}
                className="w-full min-h-14 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 hover:brightness-110 font-black text-lg shadow-lg shadow-fuchsia-900/40 disabled:opacity-60 cursor-pointer"
              >
                {busy === 'create' ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                {UI.createRoom}
              </button>
            </>
          ) : (
            <>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-300">{UI.roomCode}</span>
                <input
                  className={`${input} text-center text-3xl font-black tracking-[0.45em] uppercase`}
                  value={code}
                  maxLength={5}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="XXXXX"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-300">{UI.roomPassword}</span>
                <input className={input} value={joinPassword} maxLength={50} onChange={(e) => setJoinPassword(e.target.value)} />
              </label>
              <button
                onClick={() => join()}
                disabled={busy !== null}
                className="w-full min-h-14 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:brightness-110 font-black text-lg shadow-lg shadow-indigo-900/40 disabled:opacity-60 cursor-pointer"
              >
                {busy === 'join' ? <Loader2 className="w-5 h-5 animate-spin" /> : <DoorOpen className="w-5 h-5" />}
                {UI.joinRoom}
              </button>
            </>
          )}
        </section>

        {canSpectate && (
          <button onClick={() => join(true)} disabled={busy !== null} className="w-full min-h-12 rounded-xl bg-sky-800 hover:bg-sky-700 font-bold cursor-pointer disabled:opacity-60">{UI.spectate.button}</button>
        )}
        {error && <div role="alert" className="rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-200">{error}</div>}
        <p className="text-center text-[11px] text-slate-500">ชวนเพื่อน 5–30 คน · รหัสห้อง 5 ตัวอักษร</p>
      </div>
    </div>
  );
};
