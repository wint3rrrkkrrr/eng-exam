import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { GAME_UI, UI } from '../text/th';
import { VEILED } from '../engine';
import type { Session } from '../net/werewolfClient';
import type { MyViewResponse } from '../shared/api';
import { useCountdown } from './useCountdown';
import { playGameSound } from '../shared/sound';
import { buzz } from '../shared/notify';
import { StatusPanel } from './StatusPanel';
import { EventsPanel } from './EventsPanel';
import { GameChatPanel } from './GameChatPanel';
import { PlayerCard, PlayerGrid } from './PlayerCard';
import { RoleInfoModal } from './InfoModals';
import { toggleSelection } from './selection';
import type { Selection } from './selection';
import { NightPhase } from './phases/NightPhase';
import {
  DefensePhase, DiscussionPhase, ExecutionPhase, GunnerShot, HunterShot, MorningPhase, NominationPhase, TimeLordControls, VotePhase,
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
  // นับถอยหลัง 5 วินาทีสุดท้ายมีเสียงติ๊ก + สั่น (วินาทีที่ 10 สั่นเตือนครั้งเดียว)
  useEffect(() => {
    if (left === null || view.phase === 'game_over') return;
    if (left > 0 && left <= 5) { playGameSound('timer_low'); buzz(40); }
    else if (left === 10) buzz([60, 40, 60]);
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps
  const nameOf = (id: string) => view.players.find((p) => p.playerId === id)?.displayName ?? '?';
  const hunterTurn = turn.actionKind === 'hunter_shot';
  const roleState = game.me.roleState as { heal?: number; poison?: number; gunnerShots?: number; timeUses?: number };
  const gunnerTurn = game.me.role === 'gunner' && game.me.isAlive && view.phase === 'discussion' && (roleState.gunnerShots ?? 0) > 0;
  const [roleInfo, setRoleInfo] = useState<string | null>(null);
  const [eventsOpen, setEventsOpen] = useState<null | 'public' | 'mine'>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSeen, setChatSeen] = useState(0);
  const chatTotal = view.chat.public.length + (Object.values(view.chat.private) as unknown[][]).reduce((n, l) => n + l.length, 0);
  useEffect(() => { if (chatOpen) setChatSeen(chatTotal); }, [chatOpen, chatTotal]);
  const unread = chatOpen ? 0 : Math.max(0, chatTotal - chatSeen);

  // ---- การเลือกผู้เล่นบนตารางหลัก (ล้างทุกครั้งที่เปลี่ยนเฟส/ช่อง/ตา)
  const [selected, setSelected] = useState<string[]>([]);
  const key = `${view.phase}|${game.nightSlot}|${game.dayNumber}|${turn.actionKind}|${turn.isMyTurn}|${gunnerTurn}`;
  useEffect(() => { setSelected([]); }, [key]);
  const witchExtra = turn.extra as { poisonTargets?: string[]; healTargets?: string[] } | undefined;
  const poisonTargets = Array.from(new Set([...(witchExtra?.healTargets ?? []), ...(witchExtra?.poisonTargets ?? [])]));
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

  // ---- ปุ่มลงมือ (ยืนยัน/โหวต/ยิง/ข้าม) ติดขอบล่างเสมอ: ไม่ต้องเลื่อนผ่านตารางผู้เล่นไปหาปุ่ม
  const alive = game.me.isAlive;
  const timeLord = game.me.role === 'time_lord' && alive && view.phase === 'discussion' && Number(roleState.timeUses ?? 0) > 0;
  const skipAvail = view.phase === 'discussion' && alive && !!game.skipDiscussion && !view.spectator;
  const actionable = hunterTurn || gunnerTurn || timeLord || skipAvail || (alive && turn.isMyTurn && ['night', 'nomination', 'vote'].includes(view.phase));
  const dockRef = useRef<HTMLDivElement>(null);
  const [dockH, setDockH] = useState(0);
  useEffect(() => {
    const el = dockRef.current;
    if (!el) { setDockH(0); return; }
    setDockH(el.offsetHeight);
    const ro = new ResizeObserver(() => setDockH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [actionable]);

  // ผลส่วนตัวล่าสุด (เช่น ผลส่อง) — โชว์สั้นๆ ไม่ให้พลาด · ที่เหลืออยู่ใน 📜 เหตุการณ์ → ของฉัน
  const mineLatest = game.privateResults.filter((r) => !(r.textTh.startsWith('💀') || r.textTh.startsWith('🔔'))).slice(-2);

  return (
    <div className="space-y-3" style={{ paddingBottom: (actionable ? dockH : 0) + 84 }}>
      {roleInfo && <RoleInfoModal roleId={roleInfo} onClose={() => setRoleInfo(null)} />}

      {/* แผงสถานะ: ช่วงไหน · ต้องทำอะไร · รออะไร · เมื่อกี้เกิดอะไรขึ้น */}
      <StatusPanel view={view} nameOf={nameOf} hunterTurn={hunterTurn} gunnerTurn={gunnerTurn} left={left} onOpenRole={() => setRoleInfo(game.me.role)} onOpenEvents={() => setEventsOpen('public')} />
      {eventsOpen && <EventsPanel view={view} nameOf={nameOf} initialTab={eventsOpen} onClose={() => setEventsOpen(null)} />}

      {/* เหตุการณ์สำคัญที่เกิดกับเรา (ตาย/ถูกเปลี่ยนฝ่าย) — ขึ้นเด่นเหนือส่วนอื่น เห็นเฉพาะเจ้าตัว */}
      {game.privateResults.filter((r) => r.textTh.startsWith('💀') || r.textTh.startsWith('🔔')).slice(-2).map((r, i) => (
        <div key={`alert${i}`} role="alert" className={`rounded-2xl border-2 px-3 py-2 text-sm font-bold ${r.textTh.startsWith('💀') ? 'border-red-500 bg-red-950/60 text-red-100' : 'border-amber-400 bg-amber-950/50 text-amber-100'}`}>
          {r.textTh}
        </div>
      ))}
      {mineLatest.length > 0 && (
        <button type="button" onClick={() => setEventsOpen('mine')} className="w-full text-left rounded-2xl border border-violet-500/40 bg-violet-950/40 px-3 py-2 cursor-pointer">
          <div className="flex items-center justify-between text-[11px] font-black text-violet-300"><span>🎭 {GAME_UI.results.title}</span><span className="underline">ดูทั้งหมด</span></div>
          {mineLatest.map((r, i) => <p key={i} className="text-sm font-semibold break-words">{r.textTh}</p>)}
        </button>
      )}

      {/* ตารางการ์ดผู้เล่น — แตะการ์ดเพื่อเลือกเป้าหมาย/โหวต · แตะไอคอนบทของคนตายเพื่อดูข้อมูลบท */}
      <section aria-label={UI.game.players}>
        <PlayerGrid count={view.players.filter((p) => !p.isSpectator).length}>
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

      {/* จบเกม: สรุปผลแสดงในหน้า (ไม่ใช่ปุ่มลงมือ) */}
      {view.phase === 'game_over' && content}

      {/* ปุ่มลงมือ: ติดขอบล่าง เห็นตลอด */}
      {actionable && (
        <div ref={dockRef} className="fixed bottom-0 inset-x-0 z-30 border-t border-slate-600/70 bg-[#0b1020]/96 backdrop-blur pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,.45)]">
          <div className="max-w-xl mx-auto px-3 py-2 space-y-2 max-h-[46vh] overflow-y-auto">
            {hunterTurn && <HunterShot {...props} />}
            {timeLord && <TimeLordControls {...props} uses={Number(roleState.timeUses)} />}
            {gunnerTurn && <GunnerShot {...props} shots={roleState.gunnerShots ?? 0} />}
            {view.phase !== 'game_over' && ['night', 'discussion', 'nomination', 'vote'].includes(view.phase) && content}
          </div>
        </div>
      )}

      {/* ปุ่มแชทลอย + ลิ้นชักแชท (แทนกล่องแชทยาวท้ายหน้า) */}
      <button
        type="button"
        onClick={() => setChatOpen(true)}
        aria-label={unread > 0 ? `เปิดแชท มี ${unread} ข้อความใหม่` : 'เปิดแชท'}
        style={{ bottom: (actionable ? dockH : 0) + 14 }}
        className="fixed right-3 z-40 min-h-14 px-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-xl shadow-violet-900/50 text-sm font-black inline-flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
      >
        <MessageCircle className="w-5 h-5" /> แชท
        {unread > 0 && <span className="min-w-6 h-6 px-1.5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">{unread > 99 ? '99+' : unread}</span>}
      </button>
      {chatOpen && (
        <div className="fixed inset-0 z-[66] bg-black/60 backdrop-blur-sm" onClick={() => setChatOpen(false)} role="dialog" aria-label="แชทในเกม">
          <div className="absolute bottom-0 inset-x-0 mx-auto max-w-xl h-[82vh] rounded-t-3xl border-t border-slate-600 bg-slate-950 p-3 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-1">
              <h2 className="font-black">💬 แชทในเกม</h2>
              <button onClick={() => setChatOpen(false)} aria-label="ปิดแชท" className="min-w-11 min-h-11 rounded-xl hover:bg-white/10 flex items-center justify-center cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 min-h-0"><GameChatPanel view={view} session={session} refresh={refresh} fill /></div>
          </div>
        </div>
      )}
    </div>
  );
};
