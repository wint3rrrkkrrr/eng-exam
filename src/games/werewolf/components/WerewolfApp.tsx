import React, { useState } from 'react';
import { ArrowLeft, BookOpen, DoorOpen, Loader2, PlusCircle, Shirt } from 'lucide-react';
import { UI } from '../text/th';
import { api, loadSession, saveSession } from '../net/werewolfClient';
import type { Session } from '../net/werewolfClient';
import type { AuthResponse } from '../shared/api';
import { loadWallet, walletBody } from '../net/wallet';
import { WerewolfRoom } from './WerewolfRoom';
import { Wardrobe } from './Wardrobe';
import { HowToPlay } from './HowToPlay';

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
  const [howTo, setHowTo] = useState(false);
  const [canSpectate, setCanSpectate] = useState(false);

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
    const r = await api<AuthResponse>('join-room', { roomCode: code, displayName: name, password: joinPassword || undefined, spectate: spectate || undefined, ...walletBody(loadWallet()) });
    setBusy(null);
    if (!r.ok) {
      setCanSpectate(r.code === 'locked_can_spectate');
      return setError(r.code === 'locked_can_spectate' ? UI.spectate.offer : r.errorTh);
    }
    enter(r.data);
  };

  const input = 'w-full min-h-12 px-4 rounded-xl bg-slate-900/80 border border-violet-500/30 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400 text-base';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1020] via-[#141033] to-[#1d0d1b] text-slate-100">
      {wardrobe && <Wardrobe onClose={() => setWardrobe(false)} />}
      {howTo && <HowToPlay onClose={() => setHowTo(false)} />}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <button onClick={onBack} className="inline-flex items-center gap-2 min-h-12 text-sm text-slate-400 hover:text-slate-200 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> {UI.back}
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="text-6xl">🐺🌕</div>
          <h1 className="text-3xl font-black tracking-wide text-slate-50">{UI.title}</h1>
          <p className="text-sm text-slate-400">{UI.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setHowTo(true)}
            className="min-h-14 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-700 to-blue-800 hover:brightness-110 font-black cursor-pointer"
          >
            <BookOpen className="w-5 h-5" /> วิธีเล่น
          </button>
          <button
            onClick={() => setWardrobe(true)}
            className="min-h-14 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-violet-700 hover:brightness-110 font-black cursor-pointer"
          >
            <Shirt className="w-5 h-5" /> ตู้เสื้อผ้า
          </button>
        </div>

        <div className="space-y-4 rounded-2xl border border-violet-500/20 bg-slate-950/50 p-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-300">{UI.yourName}</span>
            <input className={input} value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-300">{UI.setPassword}</span>
            <input className={input} value={password} maxLength={50} onChange={(e) => setPassword(e.target.value)} />
          </label>

          <button
            onClick={create}
            disabled={busy !== null}
            className="w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-red-700 hover:brightness-110 font-black disabled:opacity-60 cursor-pointer"
          >
            {busy === 'create' ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
            {UI.createRoom}
          </button>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-300">{UI.roomCode}</span>
            <input
              className={`${input} text-center text-2xl font-black tracking-[0.4em] uppercase`}
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
            className="w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold disabled:opacity-60 cursor-pointer"
          >
            {busy === 'join' ? <Loader2 className="w-5 h-5 animate-spin" /> : <DoorOpen className="w-5 h-5" />}
            {UI.joinRoom}
          </button>
        </div>

        {canSpectate && (
          <button onClick={() => join(true)} disabled={busy !== null} className="w-full min-h-12 rounded-xl bg-sky-800 hover:bg-sky-700 font-bold cursor-pointer disabled:opacity-60">{UI.spectate.button}</button>
        )}
        {error && <div role="alert" className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</div>}
      </div>
    </div>
  );
};
