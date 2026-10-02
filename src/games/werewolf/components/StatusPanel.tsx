import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import type { MyViewResponse } from '../shared/api';
import { GAME_UI, UI } from '../text/th';
import { FLOW, guidanceFor, phaseHelp, recentHighlights } from './guidance';
import type { Tone } from './guidance';

interface Props {
  view: MyViewResponse;
  nameOf: (id: string) => string;
  hunterTurn: boolean;
  gunnerTurn: boolean;
  /** วินาทีที่เหลือ (null = ไม่มีเวลา) */
  left: number | null;
  onOpenRole: () => void;
  onOpenEvents: () => void;
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
 * แผงสถานะบนสุดของหน้าเล่น — ตอบ 4 คำถามเสมอ: ตอนนี้อยู่ช่วงไหน · ถึงตาฉันไหม/ต้องกดอะไร · รออะไรอยู่ · เมื่อกี้เกิดอะไรขึ้น
 * (แทนแถบเฟส+ผู้บรรยายเดิมที่เป็นแค่ชื่อเฟสกับข้อความสั้นๆ)
 */
export const StatusPanel: React.FC<Props> = ({ view, nameOf, hunterTurn, gunnerTurn, left, onOpenRole, onOpenEvents }) => {
  const [showHelp, setShowHelp] = useState(false);
  const game = view.game!;
  const g = guidanceFor({ view, nameOf, hunterTurn, gunnerTurn });
  const style = TONE_STYLE[g.tone];
  const idx = FLOW.findIndex((f) => f.phase === view.phase);
  const urgent = left !== null && left <= 10 && view.phase !== 'game_over';
  // ตอนต้องลงมือ (action) โฟกัสที่สิ่งที่ต้องทำ ไม่แสดงเหตุการณ์ล่าสุดให้รก — ดูได้ที่ปุ่ม 📜
  const highlights = g.lines || g.tone === 'action' ? [] : recentHighlights(view.log, nameOf, 2);
  const rs = game.me.roleState as { heal?: number; poison?: number };

  return (
    <section className="space-y-2.5" aria-label="สถานะเกม">
      {/* ขั้นตอนของวัน */}
      <div className="rounded-2xl border border-slate-700/60 bg-black/30 px-2.5 py-2">
        <div className="flex items-center justify-between gap-2 px-1 pb-1.5">
          <div className="text-xs font-black text-slate-200">{UI.phases[view.phase] ?? view.phase} <span className="font-semibold text-slate-400">· วันที่ {game.dayNumber}</span></div>
          <div className="flex gap-1.5">
          <button type="button" onClick={onOpenEvents} aria-haspopup="dialog" className="min-h-9 px-2.5 rounded-full text-[11px] font-black inline-flex items-center gap-1 cursor-pointer bg-pink-700 hover:bg-pink-600 text-white">📜 เหตุการณ์</button>
          <button type="button" onClick={() => setShowHelp((v) => !v)} aria-expanded={showHelp} className={`min-h-9 px-2.5 rounded-full text-[11px] font-black inline-flex items-center gap-1 cursor-pointer ${showHelp ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            <HelpCircle className="w-3.5 h-3.5" /> ช่วงนี้คืออะไร
          </button>
          </div>
        </div>
        <ol className="grid grid-cols-7 gap-1" aria-label="ขั้นตอนของวัน">
          {FLOW.map((f, i) => {
            const cur = i === idx;
            return (
              <li key={f.phase} aria-current={cur ? 'step' : undefined} aria-label={f.label} title={f.label} className={`rounded-lg py-1 text-center transition-all ${cur ? 'bg-violet-700 ring-2 ring-violet-300' : i < idx ? 'bg-slate-800/70 opacity-60' : 'bg-slate-900/60'}`}>
                <div className="text-base leading-none">{f.icon}</div>
              </li>
            );
          })}
        </ol>
        {showHelp && <p className="mt-2 rounded-lg bg-slate-900/80 px-3 py-2 text-xs text-slate-300 leading-relaxed">{phaseHelp(view.phase) || 'เกมกำลังดำเนินอยู่'}</p>}
      </div>

      {/* สิ่งที่ต้องรู้/ต้องทำตอนนี้ */}
      <div role="status" aria-live="polite" className={`rounded-2xl border-2 p-3 ${style.box}`}>
        <div className="flex items-start gap-3">
          <div className="text-3xl leading-none shrink-0" aria-hidden>{g.icon}</div>
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className={`text-base sm:text-lg font-black leading-snug ${style.accent}`}>{g.title}</h2>
            {g.body && <p className="text-[13px] text-slate-200/90 leading-snug">{g.body}</p>}
          </div>
          {left !== null && view.phase !== 'game_over' && (
            <div className={`shrink-0 w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 ${urgent ? 'border-red-400 bg-red-900/70 text-red-100 animate-pulse' : 'border-white/30 bg-black/35 text-slate-100'}`} aria-label={`เหลือเวลา ${left} วินาที`}>
              <span className="text-xl font-black tabular-nums leading-none">{left}</span>
              <span className="text-[9px] font-bold opacity-80">วินาที</span>
            </div>
          )}
        </div>

        {g.progress && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1"><span>{g.progress.label}</span><span className="tabular-nums">{g.progress.done}/{g.progress.total}</span></div>
            <div className="h-2.5 rounded-full bg-black/40 overflow-hidden" role="progressbar" aria-valuenow={g.progress.done} aria-valuemin={0} aria-valuemax={g.progress.total}>
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-500" style={{ width: `${g.progress.total ? Math.min(100, (g.progress.done / g.progress.total) * 100) : 0}%` }} />
            </div>
          </div>
        )}

        {g.lines && g.lines.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {g.lines.map((l, i) => <li key={i} className="rounded-xl bg-black/30 px-3 py-2 text-sm font-bold">{l}</li>)}
          </ul>
        )}

        {/* บทของฉัน */}
        {!view.spectator && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <button type="button" onClick={onOpenRole} className="min-h-10 px-3 rounded-xl bg-black/30 hover:bg-black/45 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
              🎭 <b className="text-white">{game.me.roleNameTh}</b> <span className="text-slate-400">· แตะดูความสามารถ</span>
            </button>
            {game.me.role === 'witch' && <span className="text-[11px] font-bold text-amber-300">{GAME_UI.potions(Number(rs.heal ?? 0), Number(rs.poison ?? 0))}</span>}
            {game.lover && <span className="text-[11px] font-bold text-pink-300">💘 {nameOf(game.lover)}</span>}
          </div>
        )}
      </div>

      {/* เมื่อกี้เกิดอะไรขึ้น */}
      {highlights.length > 0 && (
        <div className="rounded-2xl border border-slate-700/60 bg-black/25 px-3 py-2.5 space-y-1">
          <div className="text-[11px] font-black text-slate-400">📜 เหตุการณ์ล่าสุด</div>
          {highlights.map((l, i) => <p key={i} className="text-sm font-semibold text-pink-200 break-words">{l}</p>)}
        </div>
      )}
    </section>
  );
};
