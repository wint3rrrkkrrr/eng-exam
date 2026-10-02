import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import type { MyViewResponse } from '../shared/api';
import { GAME_UI, UI } from '../text/th';
import { FLOW, guidanceFor, phaseHelp } from './guidance';
import type { Tone } from './guidance';

interface Props {
  view: MyViewResponse;
  nameOf: (id: string) => string;
  hunterTurn: boolean;
  gunnerTurn: boolean;
  /** วินาทีที่เหลือ (null = ไม่มีเวลา) */
  left: number | null;
}

const TONE_STYLE: Record<Tone, { box: string; accent: string }> = {
  action: { box: 'border-amber-400 bg-gradient-to-br from-amber-900/50 to-orange-950/60 shadow-lg shadow-amber-900/30', accent: 'text-amber-200' },
  wait: { box: 'border-emerald-500/50 bg-emerald-950/40', accent: 'text-emerald-200' },
  info: { box: 'border-sky-500/40 bg-sky-950/40', accent: 'text-sky-100' },
  dead: { box: 'border-slate-500/50 bg-slate-900/70', accent: 'text-slate-200' },
  danger: { box: 'border-red-500/60 bg-red-950/50', accent: 'text-red-100' },
  win: { box: 'border-emerald-400 bg-gradient-to-br from-emerald-900/60 to-teal-950/60', accent: 'text-emerald-100' },
};

/**
 * การ์ดเดียวบอกทุกอย่าง: ไอคอน + "ตอนนี้ต้องทำอะไร" + เวลา (+ ความคืบหน้า/ผลลัพธ์ถ้ามี)
 * รายละเอียดอื่น (ขั้นตอนของวัน คำอธิบายช่วงนี้) ซ่อนไว้หลังปุ่ม ? — ประวัติเหตุการณ์อยู่ที่แท็บ "เหตุการณ์"
 */
export const StatusPanel: React.FC<Props> = ({ view, nameOf, hunterTurn, gunnerTurn, left }) => {
  const [showHelp, setShowHelp] = useState(false);
  const game = view.game!;
  const g = guidanceFor({ view, nameOf, hunterTurn, gunnerTurn });
  const style = TONE_STYLE[g.tone];
  const idx = FLOW.findIndex((f) => f.phase === view.phase);
  const rs = game.me.roleState as { heal?: number; poison?: number };
  const urgent = left !== null && left <= 10 && view.phase !== 'game_over';

  return (
    <section aria-label="สถานะเกม" className={`rounded-2xl border-2 px-2.5 py-2 ${style.box}`}>
      <div role="status" aria-live="polite" className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 className={`text-[15px] font-black leading-snug line-clamp-2 ${style.accent}`}><span aria-hidden>{g.icon} </span>{g.title}</h2>
          {g.body && <p className="mt-0.5 text-[11px] text-slate-200/80 leading-snug line-clamp-2">{g.body}</p>}
          {(game.me.role === 'witch' || game.lover) && (
            <p className="mt-0.5 text-[11px] font-bold">
              {game.me.role === 'witch' && <span className="text-amber-300">{GAME_UI.potions(Number(rs.heal ?? 0), Number(rs.poison ?? 0))}</span>}
              {game.lover && <span className="ml-2 text-pink-300">💘 {nameOf(game.lover)}</span>}
            </p>
          )}
        </div>
        <button type="button" onClick={() => setShowHelp((v) => !v)} aria-expanded={showHelp} aria-label="ช่วงนี้คืออะไร" className={`shrink-0 min-w-8 min-h-8 rounded-full flex items-center justify-center cursor-pointer ${showHelp ? 'bg-violet-700 text-white' : 'bg-black/30 text-slate-300 hover:bg-black/45'}`}>
          <HelpCircle className="w-4 h-4" />
        </button>
        {left !== null && view.phase !== 'game_over' && (
          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${urgent ? 'border-red-400 bg-red-900/70 text-red-100 animate-pulse' : 'border-white/30 bg-black/35 text-slate-100'}`} aria-label={`เหลือเวลา ${left} วินาที`}>
            <span className="text-sm font-black tabular-nums leading-none">{left}</span>
          </div>
        )}
      </div>

      {g.progress && (
        <div className="mt-2">
          <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1"><span>{g.progress.label}</span><span className="tabular-nums">{g.progress.done}/{g.progress.total}</span></div>
          <div className="h-2 rounded-full bg-black/40 overflow-hidden" role="progressbar" aria-valuenow={g.progress.done} aria-valuemin={0} aria-valuemax={g.progress.total}>
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-500" style={{ width: `${g.progress.total ? Math.min(100, (g.progress.done / g.progress.total) * 100) : 0}%` }} />
          </div>
        </div>
      )}

      {g.lines && g.lines.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {g.lines.map((l, i) => <li key={i} className="rounded-xl bg-black/30 px-3 py-1.5 text-sm font-bold break-words">{l}</li>)}
        </ul>
      )}

      {showHelp && (
        <div className="mt-2 rounded-xl bg-slate-950/80 p-3 space-y-2">
          <p className="text-xs text-slate-300 leading-relaxed"><b>{UI.phases[view.phase] ?? view.phase} · วันที่ {game.dayNumber}:</b> {phaseHelp(view.phase) || 'เกมกำลังดำเนินอยู่'}</p>
          <ol className="grid grid-cols-7 gap-1" aria-label="ขั้นตอนของวัน">
            {FLOW.map((f, i) => (
              <li key={f.phase} aria-current={i === idx ? 'step' : undefined} className={`rounded-lg py-1 text-center ${i === idx ? 'bg-violet-700 ring-2 ring-violet-300' : i < idx ? 'bg-slate-800/70 opacity-60' : 'bg-slate-900/60'}`}>
                <div className="text-base leading-none">{f.icon}</div>
                <div className="mt-0.5 text-[9px] font-bold text-slate-300 leading-tight">{f.label}</div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
};
