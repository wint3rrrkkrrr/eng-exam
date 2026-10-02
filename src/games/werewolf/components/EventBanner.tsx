import React, { useEffect, useRef, useState } from 'react';
import type { MyViewResponse, PublicLogEvent } from '../shared/api';
import { currentGameEvents, formatEvent } from './eventLog';
import { buzz, notifyIfHidden } from '../shared/notify';

export interface Banner {
  id: number;
  title: string;
  lines: string[];
  tone: 'night' | 'day' | 'vote' | 'danger' | 'win';
}

const PHASE_BANNER: Record<string, { title: string; tone: Banner['tone'] } | undefined> = {
  night: { title: '🌙 ค่ำคืนมาเยือนแล้ว — ทุกคนหลับตา', tone: 'night' },
  morning: { title: '☀️ เช้าวันใหม่', tone: 'day' },
  discussion: { title: '💬 เริ่มอภิปราย', tone: 'day' },
  nomination: { title: '🗳️ เสนอชื่อคนที่คุณสงสัย', tone: 'vote' },
  defense: { title: '🛡️ ช่วงแก้ตัว', tone: 'vote' },
  vote: { title: '🗳️ ถึงเวลาโหวต — เลือกคนที่คุณสงสัยที่สุด', tone: 'vote' },
  execution: { title: '⚖️ ผลการโหวต', tone: 'danger' },
  game_over: { title: '🏆 จบเกม', tone: 'win' },
};

// เหตุการณ์สาธารณะที่ "เปลี่ยนเกม" — เอาข้อความมาแสดงในแบนเนอร์ (เหตุการณ์รองอยู่ในแชทอย่างเดียว)
const IMPORTANT = new Set(['morning', 'death', 'execution', 'hunter_shot', 'gunner_shot', 'game_over', 'discussion_skipped']);

const TONE: Record<Banner['tone'], string> = {
  night: 'from-indigo-950 to-slate-950 border-indigo-400/60 text-indigo-50',
  day: 'from-amber-500 to-orange-600 border-amber-200/80 text-white',
  vote: 'from-violet-800 to-fuchsia-900 border-violet-300/70 text-white',
  danger: 'from-red-900 to-rose-950 border-red-300/70 text-red-50',
  win: 'from-emerald-600 to-teal-800 border-emerald-200/80 text-white',
};

/**
 * ตัวสร้างแบนเนอร์: เปลี่ยนเฟส → ขึ้นชื่อเฟส + เหตุการณ์สำคัญที่เพิ่งเกิด (ใครตาย/ผลโหวต/ผู้ชนะ)
 * ไม่ขึ้นตอนเพิ่งเข้าห้อง · เหตุการณ์ที่เกิดกลางเฟส (เช่น มือปืนยิง) ขึ้นเป็นแบนเนอร์สีแดงแยก
 */
export function useBanner(view: MyViewResponse | null, nameOf: (id: string) => string): Banner | null {
  const [banner, setBanner] = useState<Banner | null>(null);
  const lastPhase = useRef<string | null>(null);
  const lastEventId = useRef<number | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    if (!view) return;
    const events = currentGameEvents(view.log);
    const maxId = events.reduce((m, e) => Math.max(m, e.id), 0);
    const prevPhase = lastPhase.current;
    const prevId = lastEventId.current;
    lastPhase.current = view.phase;
    lastEventId.current = maxId;
    if (prevPhase === null || prevId === null) return; // เพิ่งเข้าห้อง — ไม่ขึ้นของเก่า

    const fresh = events.filter((e: PublicLogEvent) => e.id > prevId && IMPORTANT.has(e.kind));
    // ตัดคำนำที่ซ้ำกับหัวแบนเนอร์ (เช่น "☀️ เช้าวันใหม่ — ") ให้เหลือเฉพาะเนื้อหา
    const lines = fresh.flatMap((e) => formatEvent(e, { nameOf })).map((l) => l.replace(/^☀️ เช้าวันใหม่ — /, '☀️ '));
    const phaseChanged = prevPhase !== view.phase;
    const def = PHASE_BANNER[view.phase];

    if (phaseChanged && def && view.phase !== 'lobby') {
      const b: Banner = { id: ++seq.current, title: def.title, lines, tone: lines.some((l) => l.startsWith('💀') || l.includes('เสียชีวิต')) && view.phase === 'morning' ? 'danger' : def.tone };
      setBanner(b);
      notifyIfHidden('แววูฟ', [b.title, ...lines].join('\n'), 'ww-phase');
      if (view.phase === 'morning' && lines.length > 0) buzz([60, 40, 60]);
    } else if (lines.length > 0) {
      setBanner({ id: ++seq.current, title: '📢 เหตุการณ์', lines, tone: 'danger' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view?.phase, view?.log]);

  return banner;
}

/** แบนเนอร์เต็มความกว้างกลางจอ — หายเอง ~2.8 วินาที หรือแตะเพื่อปิด · ผู้ใช้ตั้ง "ลดการเคลื่อนไหว" จะไม่มีแอนิเมชัน */
export const EventBanner: React.FC<{ banner: Banner | null }> = ({ banner }) => {
  const [shown, setShown] = useState<Banner | null>(null);

  useEffect(() => {
    if (!banner) return;
    setShown(banner);
    const t = window.setTimeout(() => setShown((cur) => (cur && cur.id === banner.id ? null : cur)), 2800 + Math.min(banner.lines.length, 4) * 600);
    return () => window.clearTimeout(t);
  }, [banner]);

  if (!shown) return null;
  return (
    <div className="fixed inset-x-0 top-1/4 z-[60] flex justify-center px-4 pointer-events-none" role="status" aria-live="assertive">
      <button
        onClick={() => setShown(null)}
        className={`pointer-events-auto w-full max-w-md rounded-3xl border-2 bg-gradient-to-b ${TONE[shown.tone]} px-5 py-5 text-center shadow-2xl cursor-pointer ww-banner`}
      >
        <style>{`@keyframes ww-banner-in { from { opacity:0; transform:translateY(-14px) scale(.96) } to { opacity:1; transform:none } } .ww-banner { animation: ww-banner-in .35s ease both } @media (prefers-reduced-motion: reduce) { .ww-banner { animation:none } }`}</style>
        <div className="text-xl font-black leading-snug">{shown.title}</div>
        {shown.lines.map((l, i) => <div key={i} className="mt-2 text-base font-bold leading-snug opacity-95">{l}</div>)}
      </button>
    </div>
  );
};
