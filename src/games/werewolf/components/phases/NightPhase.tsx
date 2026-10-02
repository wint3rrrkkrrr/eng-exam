import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { GAME_UI, INFO_UI } from '../../text/th';
import { api } from '../../net/werewolfClient';
import { playGameSound } from '../../shared/sound';
import type { Session } from '../../net/werewolfClient';
import type { MyViewResponse } from '../../shared/api';
import type { Selection } from '../selection';

interface Props {
  view: MyViewResponse;
  session: Session;
  refresh: () => Promise<void>;
  selection: Selection; // เลือกเป้าหมายบนตารางการ์ดผู้เล่นหลัก (แตะการ์ดด้านบน)
}

// กลางคืน: ถึงตาของฉัน → แตะการ์ดผู้เล่นด้านบนเพื่อเลือก แล้วกดยืนยันที่นี่ · ไม่ใช่ตา → หน้าจอ "หลับตา" เหมือนกันทุกคน (กัน timing tell)
export const NightPhase: React.FC<Props> = ({ view, session, refresh, selection }) => {
  const game = view.game!;
  const turn = game.myTurn;
  const [healId, setHealId] = useState<string | null>(null);
  const [poisonId, setPoisonId] = useState<string | null>(null);
  const [veil, setVeil] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHealId(null);
    setPoisonId(null);
    setVeil(false);
    setError(null);
  }, [turn.actionKind, game.nightSlot, game.dayNumber]);

  const nameOf = (id: string | null | undefined) => view.players.find((p) => p.playerId === id)?.displayName ?? '?';

  const send = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    const r = await api('action', { type: 'night_action', ...body }, session);
    setBusy(false);
    if (!r.ok) setError(r.errorTh);
    else playGameSound('confirm');
    selection.setSelected([]);
    await refresh();
  };

  const wolves = game.allies.map((a) => nameOf(a.playerId));
  const packVoteLines = game.packVotes ? (Object.entries(game.packVotes) as [string, string][]).map(([v, t]) => `${nameOf(v)} → ${nameOf(t)}`) : [];
  const packVotesBox = packVoteLines.length > 0 ? (
    <div className="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm">
      <div className="text-xs text-red-300 mb-1">{GAME_UI.night.packVotesTitle}</div>
      {packVoteLines.map((l) => <div key={l} className="font-bold">{l}</div>)}
    </div>
  ) : null;

  if (!game.me.isAlive) {
    return <p className="rounded-xl border border-slate-700/60 bg-slate-950/50 px-4 py-4 text-sm text-slate-400">{GAME_UI.spectator}</p>;
  }

  if (!turn.isMyTurn) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 px-4 py-6 text-center space-y-2">
          <div className="text-4xl">😴</div>
          <p className="text-sm text-slate-400">{GAME_UI.night.asleep}</p>
        </div>
        {packVotesBox}
        {(game.me.team === 'wolf' || game.me.team === 'vampire' || game.me.team === 'cult') && wolves.length > 0 && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm">
            <div className="text-xs text-red-300 mb-1">{GAME_UI.night.wolvesTitle}</div>
            <div className="font-bold">{wolves.join(', ')}</div>
            <p className="text-[11px] text-slate-400 mt-1">{GAME_UI.night.wolfHint}</p>
          </div>
        )}
      </div>
    );
  }

  const kind = turn.actionKind;
  const need = Math.max(1, turn.targetCount || 1);
  const confirmBtn = 'w-full min-h-14 rounded-xl bg-gradient-to-r from-red-700 to-violet-700 font-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2';
  const skipBtn = (
    <button disabled={busy} onClick={() => send({ kind: 'skip' })} className="w-full min-h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold disabled:opacity-50 cursor-pointer">
      {GAME_UI.skip}
    </button>
  );

  // ---- ผู้ทำนายอนาคต: ทายฝ่ายผู้ชนะ (ไม่เลือกคนบนการ์ด)
  if (kind === 'predict') {
    const opts: { team: 'village' | 'wolf' | 'solo'; label: string }[] = [
      { team: 'village', label: 'ฝ่ายหมู่บ้าน' },
      { team: 'wolf', label: 'ฝ่ายหมาป่า' },
      { team: 'solo', label: 'ฝ่ายอิสระ' },
    ];
    return (
      <div className="space-y-2.5">
        <p className="text-sm font-bold">{turn.promptTh}</p>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        {opts.map((o) => (
          <button
            key={o.team}
            disabled={busy}
            onClick={() => send({ kind: 'predict', meta: { team: o.team } })}
            className="w-full min-h-14 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold disabled:opacity-50 cursor-pointer"
          >
            {o.label}
          </button>
        ))}
      </div>
    );
  }

  // ---- แม่มด: แตะการ์ดแล้วกด "ชุบ" หรือ "วางยาพิษ" (ทุกคนลงมือพร้อมกัน — ไม่รู้ว่าใครโดนกัด)
  if (kind === 'witch') {
    const extra = (turn.extra ?? {}) as { canHeal: boolean; healTargets: string[]; poisonTargets: string[] };
    const picked = selection.selected[0] ?? null;
    const btn = (on: boolean, tone: string) => `w-full min-h-12 rounded-xl border text-sm font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${on ? tone : 'border-slate-700 bg-slate-900/60'}`;
    return (
      <div className="space-y-2.5">
        <p className="text-sm font-bold">{turn.promptTh}</p>
        <p className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-xs text-amber-100">{GAME_UI.night.witchHint}</p>
        {extra.canHeal && (
          <button
            disabled={!picked || !extra.healTargets.includes(picked)}
            onClick={() => setHealId(healId === picked ? null : picked)}
            aria-pressed={healId !== null}
            className={btn(healId !== null, 'border-emerald-400 bg-emerald-950/50')}
          >
            🧪 {healId ? `${GAME_UI.night.witchHealOn(nameOf(healId))} ✓ (แตะอีกครั้งเพื่อยกเลิก)` : GAME_UI.night.witchHealPick}
          </button>
        )}
        {extra.poisonTargets.length > 0 && (
          <button
            disabled={!picked || !extra.poisonTargets.includes(picked)}
            onClick={() => setPoisonId(poisonId === picked ? null : picked)}
            aria-pressed={poisonId !== null}
            className={btn(poisonId !== null, 'border-red-400 bg-red-950/50')}
          >
            ☠️ {poisonId ? `วางยาพิษ ${nameOf(poisonId)} ✓ (แตะอีกครั้งเพื่อยกเลิก)` : GAME_UI.night.witchPickPoison}
          </button>
        )}
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button disabled={busy} onClick={() => send({ kind: 'witch', meta: { healId, poisonId } })} className={confirmBtn}>
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          {healId || poisonId ? GAME_UI.confirm : GAME_UI.night.witchDone}
        </button>
      </div>
    );
  }

  // ---- บทอื่นๆ: แตะการ์ดด้านบนเลือก 1–2 คน
  return (
    <div className="space-y-2.5">
      <p className="text-sm font-bold">{turn.promptTh}</p>
      <p className="text-xs text-slate-400">{turn.selectableTargets.length === 0 ? INFO_UI.noneSelectable : need >= 2 ? GAME_UI.night.pickTwo : GAME_UI.night.pickOne}</p>
      {(game.me.team === 'wolf' || game.me.team === 'vampire' || game.me.team === 'cult') && wolves.length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 px-3 py-2 text-xs">
          <span className="text-red-300">{GAME_UI.night.wolvesTitle}: </span><span className="font-bold">{wolves.join(', ')}</span>
          <p className="text-[11px] text-slate-400 mt-0.5">{GAME_UI.night.wolfHint}</p>
        </div>
      )}
      {packVotesBox}
      {(turn.extra as { canVeil?: boolean } | undefined)?.canVeil && (
        <div className="space-y-1">
          <button onClick={() => setVeil((v) => !v)} aria-pressed={veil} className={`w-full min-h-12 rounded-xl border text-sm font-bold cursor-pointer ${veil ? 'border-red-400 bg-red-950/50' : 'border-slate-700 bg-slate-900/60'}`}>
            🐺 {GAME_UI.night.veil}{veil ? ' ✓' : ''}
          </button>
          <p className="text-[11px] text-slate-500">{GAME_UI.night.veilHelp}</p>
        </div>
      )}
      {kind === 'oil_mark' && (() => {
        const marked = ((turn.extra as { marked?: string[] } | undefined)?.marked ?? []);
        return (
          <div className="rounded-xl border border-orange-500/30 bg-orange-950/20 px-3 py-2 space-y-2">
            <p className="text-xs text-slate-300">{GAME_UI.night.arsonMarked(marked.map((id) => nameOf(id)))}</p>
            <button
              disabled={busy || marked.length === 0}
              onClick={() => send({ kind: 'ignite' })}
              className="w-full min-h-12 rounded-xl bg-gradient-to-r from-orange-600 to-red-700 font-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              🔥 {GAME_UI.night.arsonIgnite}
            </button>
          </div>
        );
      })()}
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button
        disabled={busy || selection.selected.length !== need}
        onClick={() => send({ kind, targets: selection.selected, meta: veil ? { veil: true } : undefined })}
        className={confirmBtn}
      >
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        {GAME_UI.confirm}
      </button>
      {skipBtn}
    </div>
  );
};
