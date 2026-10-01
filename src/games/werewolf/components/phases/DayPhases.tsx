// หน้ากลางวันทั้งหมด: เช้า · อภิปราย · เสนอชื่อ · แก้ตัว · โหวต · ผลการโหวต · นายพรานยิง
// ★ การเลือกผู้เล่น (เสนอชื่อ/โหวต/ยิง) ทำบน "ตารางการ์ดผู้เล่นหลัก" — ที่นี่มีแค่ข้อความและปุ่มยืนยัน (ไม่บังจอ)
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { GAME_UI, INFO_UI } from '../../text/th';
import { api } from '../../net/werewolfClient';
import type { Session } from '../../net/werewolfClient';
import type { MyViewResponse } from '../../shared/api';
import type { Selection } from '../selection';
import { currentGameEvents, formatEvent } from '../eventLog';

interface Props {
  view: MyViewResponse;
  session: Session;
  refresh: () => Promise<void>;
  selection: Selection;
}

const nameFor = (view: MyViewResponse) => (id: string) => view.players.find((p) => p.playerId === id)?.displayName ?? '?';

function useSend(session: Session, refresh: () => Promise<void>, selection: Selection) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const send = async (body: Record<string, unknown>, route = 'action') => {
    setBusy(true);
    setError(null);
    const r = await api(route, body, session);
    setBusy(false);
    if (!r.ok) setError(r.errorTh);
    selection.setSelected([]);
    await refresh();
  };
  return { busy, error, send };
}

const Box: React.FC<{ title: string; hint?: string; children?: React.ReactNode }> = ({ title, hint, children }) => (
  <section className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-3 space-y-2">
    <div className="flex items-baseline justify-between gap-2">
      <h2 className="text-base font-black">{title}</h2>
    </div>
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
    {children}
  </section>
);

const bigButton = 'w-full min-h-14 rounded-xl bg-gradient-to-r from-red-700 to-violet-700 hover:brightness-110 font-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2';

// ---------------------------------------------------------------- นายพรานยิง (ใช้ได้ทุกเฟส — แม้ตายแล้ว)
export const HunterShot: React.FC<Props> = ({ view, session, refresh, selection }) => {
  const { busy, error, send } = useSend(session, refresh, selection);
  return (
    <section className="rounded-2xl border-2 border-red-500/60 bg-red-950/30 p-3 space-y-2">
      <h2 className="text-base font-black text-red-200">🔫 {GAME_UI.hunter.title}</h2>
      <p className="text-xs text-slate-300">{GAME_UI.hunter.hint} · {INFO_UI.selectHint}</p>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button disabled={busy || selection.selected.length !== 1} onClick={() => send({ type: 'hunter_shot', targetId: selection.selected[0] })} className={bigButton}>
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} ยิง!
      </button>
      <span className="hidden">{view.phase}</span>
    </section>
  );
};

// ---------------------------------------------------------------- มือปืน (ใช้ได้เฉพาะช่วงอภิปราย — กดได้ทันทีไม่ต้องรอคิว)
export const GunnerShot: React.FC<Props & { shots: number }> = ({ session, refresh, selection, shots }) => {
  const { busy, error, send } = useSend(session, refresh, selection);
  return (
    <section className="rounded-2xl border-2 border-amber-500/60 bg-amber-950/30 p-3 space-y-2">
      <h2 className="text-base font-black text-amber-200">🔫 {GAME_UI.gunner.title(shots)}</h2>
      <p className="text-xs text-slate-300">{GAME_UI.gunner.hint} · {INFO_UI.selectHint}</p>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button disabled={busy || selection.selected.length !== 1} onClick={() => send({ type: 'gunner_shot', targetId: selection.selected[0] })} className={bigButton}>
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} ยิง!
      </button>
    </section>
  );
};

// ---------------------------------------------------------------- เช้า
export const MorningPhase: React.FC<Props> = ({ view }) => {
  const nameOf = nameFor(view);
  const events = currentGameEvents(view.log);
  const lastMorning = [...events].reverse().find((e) => e.kind === 'morning');
  const lines = lastMorning ? formatEvent(lastMorning, { nameOf }) : [];
  return (
    <Box title={GAME_UI.morning.title} hint={GAME_UI.morning.hint}>
      {lines.length === 0 ? <p className="text-sm text-slate-400">…</p> : lines.map((l) => <p key={l} className="text-sm font-bold">{l}</p>)}
    </Box>
  );
};

// ---------------------------------------------------------------- อภิปราย
export const DiscussionPhase: React.FC<Props> = ({ view }) => (
  <Box title={GAME_UI.discussion.title} hint={view.lobby.chatMode === 'voice' ? GAME_UI.discussion.voiceHint : GAME_UI.discussion.hint} />
);

// ---------------------------------------------------------------- เสนอชื่อ
export const NominationPhase: React.FC<Props> = ({ view, session, refresh, selection }) => {
  const game = view.game!;
  const turn = game.myTurn;
  const { busy, error, send } = useSend(session, refresh, selection);
  const total = view.players.filter((p) => p.isAlive).length;
  const done = Object.keys(game.nominations).length;

  return (
    <Box title={GAME_UI.nomination.title} hint={GAME_UI.nomination.progress(done, total)}>
      {!game.me.isAlive ? (
        <p className="text-sm text-slate-400">{GAME_UI.nomination.dead}</p>
      ) : turn.isMyTurn ? (
        <>
          <p className="text-xs text-slate-300">{GAME_UI.nomination.hint} · {INFO_UI.selectHint}</p>
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          <button disabled={busy || selection.selected.length !== 1} onClick={() => send({ targetId: selection.selected[0] }, 'nominate')} className={bigButton}>
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} {INFO_UI.nominateConfirm}
          </button>
        </>
      ) : (
        <p className="text-sm text-emerald-300">{GAME_UI.nomination.done}</p>
      )}
    </Box>
  );
};

// ---------------------------------------------------------------- แก้ตัว
export const DefensePhase: React.FC<Props> = ({ view }) => {
  const nameOf = nameFor(view);
  const game = view.game!;
  return (
    <Box title={GAME_UI.defense.title} hint={`${GAME_UI.defense.hint} — ผู้ถูกเสนอชื่อ: ${game.candidates.map(nameOf).join(', ')}`} />
  );
};

// ---------------------------------------------------------------- โหวต: แตะการ์ดผู้ถูกเสนอชื่อบนตารางหลัก แล้วกดยืนยัน หรืองดออกเสียง
export const VotePhase: React.FC<Props> = ({ view, session, refresh, selection }) => {
  const game = view.game!;
  const turn = game.myTurn;
  const nameOf = nameFor(view);
  const { busy, error, send } = useSend(session, refresh, selection);
  const voted = game.myVote !== undefined;
  const live = game.liveVotes;
  const cast = live ? Object.keys(live).length : null;
  const eligible = view.players.filter((p) => p.isAlive && p.canVote).length;

  return (
    <Box title={GAME_UI.vote.title} hint={cast !== null ? GAME_UI.vote.progress(cast, eligible) : GAME_UI.vote.hint}>
      {game.voteVeiled && (
        <div role="status" className="rounded-xl border border-red-500/50 bg-red-950/40 px-3 py-2 space-y-0.5">
          <div className="text-sm font-black text-red-200">{GAME_UI.vote.veiledTitle}</div>
          <p className="text-[11px] text-slate-300">{GAME_UI.vote.veiledBody}</p>
        </div>
      )}
      {!game.me.isAlive || !game.me.canVote ? (
        <p className="text-sm text-slate-400">{GAME_UI.vote.cannot}</p>
      ) : turn.isMyTurn ? (
        <>
          <p className="text-xs text-slate-300">{GAME_UI.vote.hint} · {INFO_UI.selectHint}</p>
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          <div className="flex gap-2">
            <button disabled={busy || selection.selected.length !== 1} onClick={() => send({ type: 'vote', targetId: selection.selected[0] })} className={`${bigButton} flex-1`}>
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} {INFO_UI.voteConfirm}
            </button>
            <button disabled={busy} onClick={() => send({ type: 'vote', targetId: null })} className="min-h-14 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold cursor-pointer disabled:opacity-50">
              {GAME_UI.vote.abstain}
            </button>
          </div>
        </>
      ) : voted ? (
        <p className="text-sm text-emerald-300">{GAME_UI.vote.done(game.myVote ? nameOf(game.myVote) : null)} · {GAME_UI.vote.waiting}</p>
      ) : (
        <p className="text-sm text-slate-400">{GAME_UI.vote.waiting}</p>
      )}
    </Box>
  );
};

// ---------------------------------------------------------------- ผลการโหวต
export const ExecutionPhase: React.FC<Props> = ({ view }) => {
  const nameOf = nameFor(view);
  const events = currentGameEvents(view.log);
  // เอาเหตุการณ์ตั้งแต่ "ผลโหวต" ล่าสุดเป็นต้นไป
  let from = 0;
  events.forEach((e, i) => { if (e.kind === 'vote_result') from = i; });
  const lines = events.slice(from).flatMap((e) => formatEvent(e, { nameOf }));
  return (
    <Box title={GAME_UI.execution.title}>
      {lines.length === 0 ? <p className="text-sm text-slate-400">…</p> : lines.map((l, i) => <p key={i} className="text-sm font-semibold">{l}</p>)}
    </Box>
  );
};
