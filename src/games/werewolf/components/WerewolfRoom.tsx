import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Info, Loader2, LogOut, WifiOff } from 'lucide-react';
import { UI } from '../text/th';
import { api, clearSession, subscribeRoom } from '../net/werewolfClient';
import type { Session } from '../net/werewolfClient';
import type { MyViewResponse } from '../shared/api';
import { LobbyPhase } from './phases/LobbyPhase';
import { RoleRevealPhase } from './phases/RoleRevealPhase';
import { GameScreen } from './GameScreen';
import { PhaseBackdrop } from './PhaseBackdrop';
import { NightContext, isNightPhase } from './avatar/TimeContext';
import { RoomInfoPanel } from './InfoModals';
import { SpectatorScreen } from './SpectatorScreen';

interface Props {
  session: Session;
  onLeave: (message?: string) => void;
}

const POLL_MS = 2500; // ดึง "มุมมองของฉัน" ซ้ำ (สำรองเผื่อสัญญาณเรียลไทม์หลุด/ไม่มี Supabase)
const POLL_FAST_MS = 1000; // ช่วงเสนอชื่อ/แก้ตัว/โหวต: กระดานสดต้องเคลื่อนไหวเร็ว
const LIVE_PHASES = ['nomination', 'defense', 'vote'];
const TICK_MS = 3000; // เรียก tick เดินเวลา — เซิร์ฟเวอร์ตัดสินเองว่าถึงเวลาจริงไหม

export const WerewolfRoom: React.FC<Props> = ({ session, onLeave }) => {
  const [view, setView] = useState<MyViewResponse | null>(null);
  const [offline, setOffline] = useState(false);
  const clockOffset = useRef(0); // เวลาเซิร์ฟเวอร์ − เวลาเครื่อง
  const phaseRef = useRef<string>('lobby');
  const versionRef = useRef<number>(-1);
  const busy = useRef(false);
  const [showInfo, setShowInfo] = useState(false);
  const livePhase = view?.phase ?? 'lobby';

  const leave = useCallback((msg?: string) => {
    clearSession(session.roomCode);
    onLeave(msg);
  }, [session.roomCode, onLeave]);

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const r = await api<MyViewResponse>('my-view', {}, session);
    busy.current = false;
    if (r.ok) {
      setOffline(false);
      clockOffset.current = Date.parse(r.data.serverNow) - Date.now();
      phaseRef.current = r.data.phase;
      // อัปเดตหน้าจอเมื่อมีอะไรเปลี่ยน (state_version ขยับ) หรือยังไม่มีข้อมูล — กันหน้ากระตุก
      setView((prev) => (prev && prev.stateVersion === r.data.stateVersion && JSON.stringify(prev.chat) === JSON.stringify(r.data.chat) && prev.endsAt === r.data.endsAt && JSON.stringify(prev.players) === JSON.stringify(r.data.players) ? prev : r.data));
      versionRef.current = r.data.stateVersion;
    } else if (r.status === 401 || r.status === 404) {
      leave(UI.errors.kicked);
    } else {
      setOffline(true);
    }
  }, [session, leave]);

  // ดึงข้อมูลตอนเข้า + ดึงซ้ำเป็นระยะ (ถี่ขึ้นตอนเสนอชื่อ/โหวต) + เรียลไทม์ (ถ้ามี)
  useEffect(() => {
    void refresh();
    const poll = setInterval(() => {
      if (document.hidden) return; // แท็บอยู่เบื้องหลัง ไม่ต้องดึงถี่
      void refresh();
    }, LIVE_PHASES.includes(livePhase) ? POLL_FAST_MS : POLL_MS);
    const unsub = subscribeRoom(session.roomCode, () => void refresh());
    const onVisible = () => { if (!document.hidden) void refresh(); }; // กลับมาที่แท็บนี้ → ดึงข้อมูลทันที
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisible);
      unsub();
    };
  }, [refresh, session.roomCode, livePhase]);

  // เดินเวลา: ใครเรียกก็ได้ (เซิร์ฟเวอร์กันเรียกซ้ำเอง)
  useEffect(() => {
    const id = setInterval(async () => {
      const p = phaseRef.current;
      if (p === 'lobby' || p === 'game_over') return;
      const r = await api<{ advanced: boolean }>('tick', {}, session);
      if (r.ok && r.data.advanced) void refresh();
    }, TICK_MS);
    return () => clearInterval(id);
  }, [session, refresh]);

  if (!view) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1020] text-slate-300">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> {UI.loading}
      </div>
    );
  }

  const serverNow = () => Date.now() + clockOffset.current;

  let body: React.ReactNode;
  if (view.spectator && view.phase !== 'lobby') {
    body = <SpectatorScreen view={view} session={session} refresh={refresh} serverNow={serverNow} />;
  } else if (view.phase === 'lobby') {
    body = <LobbyPhase view={view} session={session} refresh={refresh} />;
  } else if (view.phase === 'role_reveal' && view.game) {
    body = <RoleRevealPhase view={view} session={session} refresh={refresh} serverNow={serverNow} />;
  } else {
    body = <GameScreen view={view} session={session} refresh={refresh} serverNow={serverNow} />;
  }

  return (
    <NightContext.Provider value={isNightPhase(view.phase)}>
    <div className="min-h-screen relative text-slate-100">
      <PhaseBackdrop phase={view.phase} />
      {showInfo && <RoomInfoPanel view={view} onClose={() => setShowInfo(false)} />}
      <div className="relative z-10 max-w-xl mx-auto px-4 py-4 space-y-4">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* ปุ่มซ้ายบน: ทุกคนดูตั้งค่าห้อง + บทในเกมนี้ว่าทำอะไรได้บ้าง */}
            <button onClick={() => setShowInfo(true)} aria-label="ข้อมูลห้อง ตั้งค่า และบทในเกม" className="min-w-12 min-h-12 -ml-2 rounded-xl flex items-center justify-center bg-black/30 hover:bg-black/50 text-slate-100 cursor-pointer">
              <Info className="w-5 h-5" />
            </button>
            <div className="text-xs text-slate-200 truncate">
              {UI.title} · <span className="font-mono text-white">{view.roomCode}</span> · {UI.phases[view.phase] ?? view.phase}
            </div>
          </div>
          <button onClick={() => leave()} className="inline-flex items-center gap-1.5 min-h-12 px-3 text-xs text-slate-200 hover:text-red-300 cursor-pointer">
            <LogOut className="w-4 h-4" /> {UI.leaveRoom}
          </button>
        </header>
        {offline && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-950/50 border border-amber-500/30 px-3 py-2 text-xs text-amber-200">
            <WifiOff className="w-4 h-4" /> {UI.connectionLost}
          </div>
        )}
        {body}
      </div>
    </div>
    </NightContext.Provider>
  );
};
