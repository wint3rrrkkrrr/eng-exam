import React, { useEffect, useState } from 'react';
import { GAME_UI, TH, UI } from '../text/th';
import { VEILED } from '../engine';
import type { Session } from '../net/werewolfClient';
import type { MyViewResponse } from '../shared/api';
import { useCountdown } from './useCountdown';
import { Narrator } from './Narrator';
import { GameChatPanel } from './GameChatPanel';
import { PlayerCard, PlayerGrid } from './PlayerCard';
import { RoleInfoModal } from './InfoModals';
import { toggleSelection } from './selection';
import type { Selection } from './selection';
import { NightPhase } from './phases/NightPhase';
import {
  DefensePhase, DiscussionPhase, ExecutionPhase, GunnerShot, HunterShot, MorningPhase, NominationPhase, VotePhase,
} from './phases/DayPhases';
import { GameOverPhase } from './phases/GameOverPhase';

interface Props {
  view: MyViewResponse;
  session: Session;
  refresh: () => Promise<void>;
  serverNow: () => number;
}

// หน้าจอเล่นจริงทุกเฟสหลังดูบทเสร็จ — แถบเฟส+เวลา → ตารางการ์ดผู้เล่น (แตะเลือกเป้าหมาย/โหวตที่นี่) → แผงปุ่มยืนยันเล็กๆ → แชท
export const GameScreen: React.FC<Props> = ({ view, session, refresh, serverNow }) => {
  const game = view.game!;
  const turn = game.myTurn;
  const left = useCountdown(view.endsAt, serverNow);
  const nameOf = (id: string) => view.players.find((p) => p.playerId === id)?.displayName ?? '?';
  const hunterTurn = turn.actionKind === 'hunter_shot';
  const roleState = game.me.roleState as { heal?: number; poison?: number; gunnerShots?: number };
  const gunnerTurn = game.me.role === 'gunner' && game.me.isAlive && view.phase === 'discussion' && (roleState.gunnerShots ?? 0) > 0;
  const [roleInfo, setRoleInfo] = useState<string | null>(null);

  // ---- การเลือกผู้เล่นบนตารางหลัก (ล้างทุกครั้งที่เปลี่ยนเฟส/ช่อง/ตา)
  const [selected, setSelected] = useState<string[]>([]);
  const key = `${view.phase}|${game.nightSlot}|${game.dayNumber}|${turn.actionKind}|${turn.isMyTurn}|${gunnerTurn}`;
  useEffect(() => { setSelected([]); }, [key]);
  const poisonTargets = (turn.extra as { poisonTargets?: string[] } | undefined)?.poisonTargets ?? [];
  const gunnerTargets = view.players.filter((p) => p.isAlive && p.playerId !== game.me.playerId).map((p) => p.playerId);
  const selectable: string[] = gunnerTurn ? gunnerTargets : !turn.isMyTurn ? [] : turn.actionKind === 'witch' ? poisonTargets : turn.selectableTargets;
  const selection: Selection = { selected, setSelected, selectable, max: gunnerTurn ? 1 : Math.max(1, turn.targetCount || 1) };

  // ---- ป้ายบนการ์ด: เลขจำนวนเสนอชื่อ/คะแนนโหวต + ป้ายล่าง "→ ชื่อที่โหวต" ตรงชื่อผู้โหวต
  const liveVotes = game.liveVotes;
  const badgeOf = (id: string): number | null => {
    if (view.phase === 'nomination') return Object.values(game.nominations).filter((t) => t === id).length;
    if (view.phase === 'vote' && liveVotes) return Object.values(liveVotes).filter((t) => t === id).length;
    return null;
  };
  const chipOf = (p: MyViewResponse['players'][number]): { text: string; tone: string } | null => {
    if (view.phase === 'vote' && liveVotes && p.isAlive && p.canVote) {
      if (!(p.playerId in liveVotes)) return { text: GAME_UI.vote.chipWaiting, tone: 'text-slate-300' };
      const t = liveVotes[p.playerId];
      if (t === VEILED) return { text: GAME_UI.vote.chipHidden, tone: 'text-red-300' };
      if (t === null) return { text: GAME_UI.vote.chipAbstain, tone: 'text-slate-200' };
      return { text: GAME_UI.vote.chipVoted(nameOf(t)), tone: 'text-amber-300' };
    }
    if ((view.phase === 'defense' || view.phase === 'vote') && game.candidates.includes(p.playerId)) return { text: '⚖️ ผู้ถูกเสนอชื่อ', tone: 'text-red-200' };
    return null;
  };

  const props = { view, session, refresh, selection };
  let content: React.ReactNode;
  switch (view.phase) {
    case 'night': content = <NightPhase {...props} />; break;
    case 'morning': content = <MorningPhase {...props} />; break;
    case 'discussion': content = <DiscussionPhase {...props} />; break;
    case 'nomination': content = <NominationPhase {...props} />; break;
    case 'defense': content = <DefensePhase {...props} />; break;
    case 'vote': content = <VotePhase {...props} />; break;
    case 'execution': content = <ExecutionPhase {...props} />; break;
    case 'game_over': content = <GameOverPhase view={view} session={session} refresh={refresh} />; break;
    default: content = null;
  }

  return (
    <div className="space-y-3">
      {roleInfo && <RoleInfoModal roleId={roleInfo} onClose={() => setRoleInfo(null)} />}

      {/* แถบเฟส + เวลา */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-black">{UI.phases[view.phase] ?? view.phase}</div>
          <div className="text-xs text-slate-300">{GAME_UI.day(game.dayNumber)}</div>
        </div>
        {left !== null && view.phase !== 'game_over' && (
          <div className={`rounded-full px-4 py-2 text-sm font-black tabular-nums ${left <= 10 ? 'bg-red-900/70 text-red-100' : 'bg-black/35 text-slate-100'}`} aria-label="เวลาที่เหลือ">
            ⏳ {GAME_UI.secondsLeft(left)}
          </div>
        )}
      </div>

      <Narrator phase={view.phase} text={game.narrationTh} />

      {/* ตารางการ์ดผู้เล่น 4 คอลัมน์ — แตะการ์ดเพื่อเลือกเป้าหมาย/โหวต · แตะไอคอนบทของคนตายเพื่อดูข้อมูลบท */}
      <section aria-label={UI.game.players}>
        <PlayerGrid>
          {view.players.filter((p) => !p.isSpectator).map((p) => {
            const canPick = selectable.includes(p.playerId);
            return (
              <PlayerCard
                key={p.playerId}
                player={p}
                isMe={p.playerId === view.me.playerId}
                selectable={canPick}
                selected={selected.includes(p.playerId)}
                dimmed={selectable.length > 0 && !canPick}
                onClick={canPick ? () => toggleSelection(selection, p.playerId) : undefined}
                badge={badgeOf(p.playerId)}
                chip={chipOf(p)}
                offline={!p.isConnected && p.isAlive}
                onRoleClick={setRoleInfo}
              />
            );
          })}
        </PlayerGrid>
      </section>

      {hunterTurn && <HunterShot {...props} />}
      {gunnerTurn && <GunnerShot {...props} shots={roleState.gunnerShots ?? 0} />}

      {content}

      {game.privateResults.length > 0 && (
        <section className="rounded-2xl border border-violet-500/30 bg-violet-950/30 p-3 space-y-1">
          <h3 className="text-xs font-black text-violet-300">{GAME_UI.results.title}</h3>
          {game.privateResults.map((r, i) => <p key={i} className="text-sm">{r.textTh}</p>)}
        </section>
      )}

      <section className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-3 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <button onClick={() => setRoleInfo(game.me.role)} className="text-base font-black underline decoration-dotted underline-offset-4 cursor-pointer min-h-8" aria-label={`ดูข้อมูลบท ${game.me.roleNameTh}`}>
              {GAME_UI.yourRole}: {game.me.roleNameTh}
            </button>
            <span className="text-xs text-violet-300">{TH.team[game.me.team] ?? game.me.team}</span>
            <span className={`text-xs ${game.me.isAlive ? 'text-emerald-300' : 'text-red-300'}`}>{game.me.isAlive ? GAME_UI.alive : GAME_UI.dead}</span>
          </div>
        </div>
        {game.me.role === 'witch' && <p className="text-xs text-amber-300">{GAME_UI.potions(Number(roleState.heal ?? 0), Number(roleState.poison ?? 0))}</p>}
        {game.lover && <p className="text-xs text-pink-300">💘 {nameOf(game.lover)}</p>}
        {!game.me.isAlive && <p className="text-xs text-slate-400 pt-1">{GAME_UI.spectator}</p>}
      </section>

      <GameChatPanel view={view} session={session} refresh={refresh} />
    </div>
  );
};
