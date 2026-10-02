import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { MyViewResponse } from '../shared/api';
import { currentGameEvents, formatEvent } from './eventLog';

type Tab = 'public' | 'mine';

interface Props {
  view: MyViewResponse;
  nameOf: (id: string) => string;
  onClose: () => void;
}

interface DayGroup { day: number; lines: string[] }

/** รวมบรรทัดตามวัน (วันเรียงจากล่าสุดขึ้นก่อน · ในวันเรียงตามเวลา) */
function groupByDay(items: { day: number; text: string }[]): DayGroup[] {
  const map = new Map<number, string[]>();
  for (const it of items) map.set(it.day, [...(map.get(it.day) ?? []), it.text]);
  return [...map.entries()].sort((a, b) => b[0] - a[0]).map(([day, lines]) => ({ day, lines }));
}

/** ประวัติเหตุการณ์ของเกมนี้: "สาธารณะ" = ทุกคนเห็นเหมือนกัน · "ของฉัน" = เฉพาะที่เกี่ยวกับบทของเรา (ผลส่อง คู่รัก ถูกเปลี่ยนฝ่าย ฯลฯ) */
export const EventsPanel: React.FC<Props> = ({ view, nameOf, onClose }) => {
  const [tab, setTab] = useState<Tab>('public');

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  const pub = useMemo(
    () => groupByDay(currentGameEvents(view.log).flatMap((e) => formatEvent(e, { nameOf }).map((text) => ({ day: e.day, text })))),
    [view.log, nameOf],
  );
  const mine = useMemo(() => groupByDay((view.game?.privateResults ?? []).map((r) => ({ day: r.day, text: r.textTh }))), [view.game?.privateResults]);
  const groups = tab === 'public' ? pub : mine;
  const count = (gs: DayGroup[]) => gs.reduce((s, g) => s + g.lines.length, 0);

  const tabBtn = (t: Tab, label: string, n: number) => (
    <button role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`flex-1 min-h-12 rounded-xl text-sm font-black cursor-pointer ${tab === t ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
      {label} <span className="ml-1 text-[11px] opacity-80">({n})</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center" role="dialog" aria-label="เหตุการณ์ในเกม" onClick={onClose}>
      <div className="w-full max-w-md max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-slate-950 border border-slate-700 text-slate-100" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-lg font-black">📜 เหตุการณ์ในเกม</h2>
          <button onClick={onClose} aria-label="ปิด" className="min-w-11 min-h-11 rounded-xl hover:bg-white/10 flex items-center justify-center cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-4 grid grid-cols-2 gap-2" role="tablist" aria-label="ประเภทเหตุการณ์">
          {tabBtn('public', '🌐 สาธารณะ', count(pub))}
          {tabBtn('mine', '🎭 ของฉัน', count(mine))}
        </div>
        <p className="px-4 pt-2 text-[11px] text-slate-400">
          {tab === 'public' ? 'ทุกคนในเกมเห็นเหมือนกัน — ใครตาย ผลโหวต การเสนอชื่อ' : 'เห็นแค่คุณคนเดียว — ผลความสามารถของบท การถูกเปลี่ยนฝ่าย คู่รัก ฯลฯ'}
        </p>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {groups.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-10">{tab === 'public' ? 'ยังไม่มีเหตุการณ์' : 'ยังไม่มีเหตุการณ์ที่เกี่ยวกับบทของคุณ'}</p>
          )}
          {groups.map((g) => (
            <section key={g.day} aria-label={`วันที่ ${g.day}`}>
              <h3 className="sticky top-0 bg-slate-950 py-1 text-xs font-black text-violet-300">วันที่ {g.day}</h3>
              <ul className="space-y-1.5">
                {g.lines.map((l, i) => (
                  <li key={i} className={`rounded-xl px-3 py-2 text-sm leading-snug break-words ${tab === 'public' ? 'bg-slate-900 text-pink-100' : 'bg-violet-950/50 text-violet-100'}`}>{l}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
