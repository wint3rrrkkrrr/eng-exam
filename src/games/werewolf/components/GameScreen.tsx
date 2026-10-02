import React, { useEffect, useRef, useState } from 'react';

import { GAME_UI, UI } from '../text/th';
import { VEILED } from '../engine';
import type { Session } from '../net/werewolfClient';
import type { MyViewResponse } from '../shared/api';
import { useCountdown } from './useCountdown';
import { playGameSound } from '../shared/sound';
import { buzz } from '../shared/notify';
import { StatusPanel } from './StatusPanel';
import { EventsPanel } from './EventsPanel';
import { AvatarZoom } from './AvatarZoom';
import { useFitColumns } from './useFitColumns';
import { isNightPhase } from './avatar/TimeContext';
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
  // แท็บล่าง 3 อัน: เกม / แชท / เหตุการณ์ — แต่ละแท็บเต็มหน้า ไม่ต้องเลื่อนหาอะไร
  const [zoomId, setZoomId] = useState<string | null>(null); // ดูตัวละครใหญ่ๆ
  const [tab, setTab] = useState<'game' | 'chat' | 'events'>('game');
  const [eventsTab, setEventsTab] = useState<'public' | 'mine'>('public');
  const chatTotal = view.chat.public.length + (Object.values(view.chat.private) as unknown[][]).reduce((n, l) => n + l.length, 0);
  const eventsTotal = view.log.length;
  const [chatSeen, setChatSeen] = useState(chatTotal);
  const [eventsSeen, setEventsSeen] = useState(eventsTotal);
  useEffect(() => { if (tab === 'chat') setChatSeen(chatTotal); }, [tab, chatTotal]);
  useEffect(() => { if (tab === 'events') setEventsSeen(eventsTotal); }, [tab, eventsTotal]);
  const unread = tab === 'chat' ? 0 : Math.max(0, chatTotal - chatSeen);
  const newEvents = tab === 'events' ? 0 : Math.max(0, eventsTotal - eventsSeen);

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

  // ---- ปุ่มลงมือ (ยืนยัน/โหวต/ยิง/ข้าม) ติดขอบล่างเหนือแถบแท็บเสมอ: ไม่ต้องเลื่อนไปหา
  const alive = game.me.isAlive;
  const timeLord = game.me.role === 'time_lord' && alive && view.phase === 'discussion' && Number(roleState.timeUses ?? 0) > 0;
  const skipAvail = view.phase === 'discussion' && alive && !!game.skipDiscussion && !view.spectator;
  const needsMe = hunterTurn || gunnerTurn || (alive && turn.isMyTurn && ['night', 'nomination', 'vote'].includes(view.phase));
  const actionable = hunterTurn || gunnerTurn || timeLord || skipAvail || needsMe;
  const dockRef = useRef<HTMLDivElement>(null);
  const [dockH, setDockH] = useState(0);
  const showDock = actionable && tab === 'game';
  useEffect(() => {
    const el = dockRef.current;
    if (!el) { setDockH(0); return; }
    setDockH(el.offsetHeight);
    const ro = new ResizeObserver(() => setDockH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [showDock]);

  // ถึงตาเรา (หรือต้องยิง) → พากลับแท็บเกมอัตโนมัติ ไม่ให้พลาดตัวเองตอนอ่านแชทอยู่
  const wasNeedsMe = useRef(false);
  useEffect(() => { if (needsMe && !wasNeedsMe.current) setTab('game'); wasNeedsMe.current = needsMe; }, [needsMe]);

  // ผลส่วนตัวล่าสุด (เช่น ผลส่อง) — โชว์สั้นๆ ไม่ให้พลาด · ที่เหลืออยู่แท็บ เหตุการณ์ → ของฉัน
  const mineLatest = game.privateResults.filter((r) => !(r.textTh.startsWith('💀') || r.textTh.startsWith('🔔'))).slice(-2);

  // แถบ "บทของคุณ" ติดเหนือแถบแท็บ (เป็นข้อความชื่อบท แตะดูความสามารถ)
  const roleRef = useRef<HTMLDivElement>(null);
  const [roleH, setRoleH] = useState(0);
  const showRoleBar = tab === 'game' && !view.spectator;
  useEffect(() => {
    const el = roleRef.current;
    if (!el) { setRoleH(0); return; }
    setRoleH(el.offsetHeight);
    const ro = new ResizeObserver(() => setRoleH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [showRoleBar]);

  // ความสูงจริงของแถบแท็บ (วัดเอง — รวมพื้นที่ปลอดภัยของเครื่อง ไม่เดาเป็น rem)
  const navRef = useRef<HTMLElement>(null);
  const [navH, setNavH] = useState(65);
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    setNavH(el.offsetHeight);
    const ro = new ResizeObserver(() => setNavH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const TABBAR = `${navH}px`;
  // ตารางผู้เล่น: เลือกคอลัมน์ให้ทุกคนพอดีจอ (หักแถบแท็บ + ปุ่มลงมือที่ติดล่าง)
  const playerCount = view.players.filter((p) => !p.isSpectator).length;
  const fit = useFitColumns<HTMLElement>(playerCount, navH + roleH + (showDock ? dockH : 0) + 12);
  const tabBtn = (key: 'game' | 'chat' | 'events', icon: string, label: string, badge?: React.ReactNode) => (
    <button
      key={key}
      type="button"
      role="tab"
      aria-selected={tab === key}
      onClick={() => setTab(key)}
      className={`relative flex flex-col items-center justify-center gap-0.5 min-h-16 cursor-pointer transition-colors ${tab === key ? 'text-white bg-violet-700/40' : 'text-slate-400 hover:text-slate-200'}`}
    >
      <span className="text-2xl leading-none">{icon}</span>
      <span className="text-xs font-black">{label}</span>
      {badge}
    </button>
  );

  return (
    <>
      {roleInfo && <RoleInfoModal roleId={roleInfo} onClose={() => setRoleInfo(null)} />}
      {zoomId && (() => {
        const zp = view.players.find((p) => p.playerId === zoomId);
        return zp ? <AvatarZoom player={zp} isMe={zp.playerId === view.me.playerId} night={isNightPhase(view.phase)} onClose={() => setZoomId(null)} /> : null;
      })()}

      {/* ===== แท็บ เกม ===== */}
      {tab === 'game' && (
        <div className="space-y-3" style={{ paddingBottom: (showDock ? dockH : 0) + roleH + navH + 12 }}>
          <StatusPanel view={view} nameOf={nameOf} hunterTurn={hunterTurn} gunnerTurn={gunnerTurn} left={left} />

          {/* เหตุการณ์สำคัญที่เกิดกับเรา (ตาย/ถูกเปลี่ยนฝ่าย) */}
          {game.privateResults.filter((r) => r.textTh.startsWith('💀') || r.textTh.startsWith('🔔')).slice(-2).map((r, i) => (
            <div key={`alert${i}`} role="alert" className={`rounded-2xl border-2 px-3 py-2 text-sm font-bold ${r.textTh.startsWith('💀') ? 'border-red-500 bg-red-950/60 text-red-100' : 'border-amber-400 bg-amber-950/50 text-amber-100'}`}>
              {r.textTh}
            </div>
          ))}
          {mineLatest.length > 0 && (
            <button type="button" onClick={() => { setEventsTab('mine'); setTab('events'); }} className="w-full text-left rounded-2xl border border-violet-500/40 bg-violet-950/40 px-3 py-2 cursor-pointer">
              <div className="flex items-center justify-between text-[11px] font-black text-violet-300"><span>🎭 {GAME_UI.results.title}</span><span className="underline">ดูทั้งหมด</span></div>
              {mineLatest.map((r, i) => <p key={i} className="text-sm font-semibold break-words">{r.textTh}</p>)}
            </button>
          )}

          {/* ตารางการ์ดผู้เล่น — แตะการ์ดเพื่อเลือกเป้าหมาย/โหวต · แตะไอคอนบทของคนตายเพื่อดูข้อมูลบท */}
          <section ref={fit.ref} aria-label={UI.game.players}>
            <PlayerGrid count={playerCount} cols={fit.cols}>
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
                    onZoom={() => setZoomId(p.playerId)}
                  />
                );
              })}
            </PlayerGrid>
          </section>

          {/* จบเกม: สรุปผลแสดงในหน้า (ไม่ใช่ปุ่มลงมือ) */}
          {view.phase === 'game_over' && content}
        </div>
      )}

      {/* ===== แท็บ แชท (เต็มหน้า) ===== */}
      {tab === 'chat' && (
        <div className="fixed inset-x-0 top-0 z-20 bg-[#0b1020] px-3 pt-3 pb-2 flex flex-col gap-2" style={{ bottom: TABBAR }}>
          <div className="max-w-xl w-full mx-auto flex-1 min-h-0 flex flex-col gap-2">
            <h2 className="px-1 font-black">💬 แชทในเกม</h2>
            <div className="flex-1 min-h-0"><GameChatPanel view={view} session={session} refresh={refresh} fill /></div>
          </div>
        </div>
      )}

      {/* ===== แท็บ เหตุการณ์ (เต็มหน้า) ===== */}
      {tab === 'events' && (
        <div className="fixed inset-x-0 top-0 z-20 bg-[#0b1020]" style={{ bottom: TABBAR }}>
          <div className="max-w-xl mx-auto h-full">
            <EventsPanel key={eventsTab} view={view} nameOf={nameOf} initialTab={eventsTab} inline onClose={() => setTab('game')} />
          </div>
        </div>
      )}

      {/* ปุ่มลงมือ: ติดเหนือแถบแท็บ เห็นตลอดในแท็บเกม */}
      {showDock && (
        <div ref={dockRef} className="fixed inset-x-0 z-30 border-t border-slate-600/70 bg-[#0b1020]/97 backdrop-blur shadow-[0_-8px_24px_rgba(0,0,0,.45)]" style={{ bottom: navH + roleH }}>
          <div className="max-w-xl mx-auto px-3 py-2 space-y-2 max-h-[42vh] overflow-y-auto">
            {hunterTurn && <HunterShot {...props} />}
            {timeLord && <TimeLordControls {...props} uses={Number(roleState.timeUses)} />}
            {gunnerTurn && <GunnerShot {...props} shots={roleState.gunnerShots ?? 0} />}
            {view.phase !== 'game_over' && ['night', 'discussion', 'nomination', 'vote'].includes(view.phase) && content}
          </div>
        </div>
      )}

      {/* บทของคุณ: ข้อความชื่อบทอยู่เหนือแถบแท็บ */}
      {showRoleBar && (
        <div ref={roleRef} className="fixed inset-x-0 z-30 border-t border-slate-700/70 bg-[#0e1426]/97 backdrop-blur" style={{ bottom: navH }}>
          <button type="button" onClick={() => setRoleInfo(game.me.role)} aria-label={`ดูข้อมูลบท ${game.me.roleNameTh}`} className="w-full max-w-xl mx-auto min-h-11 px-4 flex items-center gap-2 text-left cursor-pointer">
            <span className="text-slate-400 text-sm">บทของคุณ:</span>
            <b className="text-white text-base">{game.me.roleNameTh}</b>
            {game.me.role === 'witch' && <span className="text-[11px] font-bold text-amber-300">{GAME_UI.potions(Number(roleState.heal ?? 0), Number(roleState.poison ?? 0))}</span>}
            {game.lover && <span className="text-[11px] font-bold text-pink-300">💘 {nameOf(game.lover)}</span>}
            <span className="ml-auto text-[11px] text-slate-500 underline">ดูความสามารถ</span>
          </button>
        </div>
      )}

      {/* แถบแท็บล่าง */}
      <nav ref={navRef} role="tablist" aria-label="เมนูหน้าเล่น" className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-600/70 bg-[#0a0f1f]/98 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-xl mx-auto grid grid-cols-3">
          {tabBtn('game', '🎮', 'เกม', needsMe && tab !== 'game' ? <span className="absolute top-1.5 right-[22%] px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black animate-pulse">ถึงตาคุณ!</span> : null)}
          {tabBtn('chat', '💬', 'แชท', unread > 0 ? <span className="absolute top-1.5 right-[28%] min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center">{unread > 99 ? '99+' : unread}</span> : null)}
          {tabBtn('events', '📜', 'เหตุการณ์', newEvents > 0 ? <span className="absolute top-2 right-[30%] w-3 h-3 rounded-full bg-pink-400" aria-label="มีเหตุการณ์ใหม่" /> : null)}
        </div>
      </nav>
    </>
  );
};
