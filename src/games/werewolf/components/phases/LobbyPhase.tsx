import React, { useState } from 'react';
import { BookOpen, Check, Copy, Loader2, Play, Shirt, UserX } from 'lucide-react';
import { UI } from '../../text/th';
import { api } from '../../net/werewolfClient';
import type { Session } from '../../net/werewolfClient';
import { walletBody } from '../../net/wallet';
import type { WalletCreds } from '../../net/wallet';
import type { MyViewResponse } from '../../shared/api';
import { expandRoles } from '../../shared/lobby';
import { validateSetup } from '../../engine';
import { SettingsPanel } from '../SettingsPanel';
import { LobbyChat } from '../LobbyChat';
import { PlayerCard, PlayerGrid } from '../PlayerCard';
import { Wardrobe } from '../Wardrobe';
import { HowToPlay } from '../HowToPlay';

interface Props {
  view: MyViewResponse;
  session: Session;
  refresh: () => Promise<void>;
}

export const LobbyPhase: React.FC<Props> = ({ view, session, refresh }) => {
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wardrobe, setWardrobe] = useState(false);
  const [howTo, setHowTo] = useState(false);
  const isHost = view.me.isHost;

  const roleIds = expandRoles(view.lobby.roleCounts);
  const issues = validateSetup(roleIds, view.players.filter((p) => !p.isSpectator).length).filter((i) => i.level === 'error');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(view.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* เบราว์เซอร์ไม่อนุญาต — ผู้ใช้จดรหัสเอง */ }
  };

  const start = async () => {
    setStarting(true);
    setError(null);
    const r = await api('start-game', {}, session);
    setStarting(false);
    if (!r.ok) setError(r.errorTh);
    await refresh();
  };

  const bots = view.players.filter((p) => !p.isSpectator && p.displayName.startsWith('🤖'));
  const room = Math.max(0, view.lobby.maxPlayers - view.players.filter((p) => !p.isSpectator).length);
  const addBots = async (count: number) => {
    const r = await api('add-bots', { count }, session);
    if (!r.ok) setError(r.errorTh);
    await refresh();
  };
  const clearBots = async () => {
    for (const b of bots) await api('release-seat', { targetPlayerId: b.playerId }, session);
    await refresh();
  };

  const kick = async (playerId: string) => {
    const r = await api('release-seat', { targetPlayerId: playerId }, session);
    if (!r.ok) setError(r.errorTh);
    await refresh();
  };

  // ใส่อวตารจากกระเป๋าให้ที่นั่งของเราในห้อง (ทุกคนเห็นทันที)
  const syncAvatar = async (creds: WalletCreds) => {
    const r = await api('sync-avatar', walletBody(creds), session);
    if (!r.ok) setError(r.errorTh);
    await refresh();
  };

  return (
    <div className="space-y-4">
      {wardrobe && <Wardrobe onClose={() => setWardrobe(false)} onSaved={syncAvatar} />}
      {howTo && <HowToPlay onClose={() => setHowTo(false)} />}

      <section className="rounded-2xl border border-violet-500/30 bg-slate-950/60 p-4 text-center space-y-2">
        <div className="text-xs text-slate-400">{UI.roomCode}</div>
        <div className="flex items-center justify-center gap-3">
          <div className="text-4xl font-black tracking-[0.35em] text-slate-50 font-mono">{view.roomCode}</div>
          <button onClick={copy} aria-label={UI.copy} className="min-w-12 min-h-12 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer">
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-[11px] text-slate-500">{UI.lobby.shareHint}</p>
      </section>

      <section className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-black text-slate-200">{UI.lobby.players(view.players.length, view.lobby.maxPlayers)}</h2>
          <div className="flex gap-1.5">
            <button onClick={() => setHowTo(true)} className="min-h-12 px-3 rounded-xl bg-gradient-to-r from-sky-700 to-blue-800 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer">
              <BookOpen className="w-4 h-4" /> วิธีเล่น
            </button>
            <button onClick={() => setWardrobe(true)} className="min-h-12 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-violet-700 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer">
              <Shirt className="w-4 h-4" /> แต่งตัว / ร้านค้า
            </button>
          </div>
        </div>
        <PlayerGrid>
          {view.players.filter((p) => !p.isSpectator).map((p) => (
            <PlayerCard
              key={p.playerId}
              player={p}
              offline={!p.isConnected}
              isMe={p.playerId === view.me.playerId}
              topRight={isHost && !p.isHost ? (
                <button onClick={() => kick(p.playerId)} aria-label={`${UI.lobby.kick} ${p.displayName}`} className="w-7 h-7 rounded-full bg-black/55 text-red-300 hover:text-red-200 flex items-center justify-center cursor-pointer">
                  <UserX className="w-3.5 h-3.5" />
                </button>
              ) : null}
            />
          ))}
        </PlayerGrid>
        {isHost && (
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-2.5 space-y-2" aria-label="บอท">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-300">🤖 บอท <span className="font-semibold text-slate-500">(ไว้ทดสอบ/เติมคนให้ครบ · เล่นเองอัตโนมัติ)</span></span>
              {bots.length > 0 && <span className="text-[11px] font-bold text-violet-300">ตอนนี้ {bots.length} ตัว</span>}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 3, 5].map((n) => (
                <button key={n} onClick={() => addBots(n)} disabled={room < 1} className="min-h-11 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">+{n}</button>
              ))}
              <button onClick={() => addBots(Math.max(1, Math.min(room, Math.max(5, 8) - view.players.filter((p) => !p.isSpectator).length)))} disabled={room < 1 || view.players.filter((p) => !p.isSpectator).length >= 8} className="min-h-11 rounded-lg bg-violet-800/70 hover:bg-violet-700 text-xs font-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">ครบ 8 คน</button>
            </div>
            {bots.length > 0 && <button onClick={clearBots} className="w-full min-h-10 rounded-lg bg-red-950/50 hover:bg-red-900/50 text-xs font-bold text-red-200 cursor-pointer">ลบบอททั้งหมด</button>}
          </div>
        )}
      </section>

      <SettingsPanel view={view} session={session} refresh={refresh} />

      {isHost ? (
        <div className="space-y-2">
          {issues.length > 0 && (
            <ul className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-xs text-amber-200 space-y-1">
              {issues.map((i) => <li key={i.messageTh}>• {i.messageTh}</li>)}
            </ul>
          )}
          {error && <div role="alert" className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</div>}
          <button
            onClick={start}
            disabled={starting || issues.length > 0}
            className="w-full min-h-14 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-700 to-violet-700 hover:brightness-110 font-black text-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            {starting ? UI.lobby.starting : UI.lobby.start}
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700/60 bg-slate-950/50 px-4 py-4 text-center text-sm text-slate-400">{UI.lobby.waitHost}</div>
      )}

      <LobbyChat view={view} session={session} refresh={refresh} />
    </div>
  );
};
