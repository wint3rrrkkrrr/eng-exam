import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { INFO_UI, RULE_LABELS, RULE_GROUPS, UI } from '../text/th';
import { DEFAULT_SETTINGS, ROLES } from '../engine';
import type { WerewolfSettings } from '../engine';
import type { MyViewResponse } from '../shared/api';
import { TIMER_LIMITS } from '../shared/lobby';
import type { LobbyTimers } from '../shared/lobby';
import { RoleIcon } from './avatar/RoleIcon';

const Overlay: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-label={title} onClick={onClose}>
    <div className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#101530] border border-violet-500/30 text-slate-100" onClick={(e) => e.stopPropagation()}>
      <div className="sticky top-0 z-10 bg-[#101530]/95 backdrop-blur px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <h2 className="text-base font-black">{title}</h2>
        <button onClick={onClose} aria-label={INFO_UI.close} className="min-w-12 min-h-12 -mr-2 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  </div>
);

/** รายละเอียดของบทหนึ่งบท: ทำอะไรได้ · เป้าหมาย · ชนะเมื่อ · ปฏิสัมพันธ์ */
export const RoleDetail: React.FC<{ roleId: string }> = ({ roleId }) => {
  const r = ROLES[roleId];
  if (!r) return <p className="text-sm text-slate-400">ไม่พบข้อมูลบทนี้</p>;
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-3">
        <span className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center p-1.5"><RoleIcon id={roleId} className="w-full h-full" /></span>
        <div>
          <div className="text-lg font-black">{r.nameTh}</div>
          <div className="text-xs text-violet-300">{INFO_UI.teams[r.startTeam] ?? r.startTeam} · {INFO_UI.wakes[r.wakes] ?? ''}</div>
        </div>
      </div>
      <section><h3 className="text-xs font-black text-violet-300">{INFO_UI.does}</h3><p className="text-slate-200">{r.descriptionTh}</p></section>
      <section><h3 className="text-xs font-black text-violet-300">{INFO_UI.goal}</h3><p className="text-slate-200">{r.goalTh}</p></section>
      <section><h3 className="text-xs font-black text-violet-300">{INFO_UI.win}</h3><p className="text-slate-200">{r.winTh}</p></section>
      {r.interactions.length > 0 && (
        <section>
          <h3 className="text-xs font-black text-violet-300">{INFO_UI.extra}</h3>
          <ul className="list-disc pl-5 space-y-0.5 text-slate-300">{r.interactions.map((x) => <li key={x}>{x}</li>)}</ul>
        </section>
      )}
    </div>
  );
};

/** ข้อมูลบทของผู้ตาย (แตะไอคอนบทบนการ์ด) */
export const RoleInfoModal: React.FC<{ roleId: string; onClose: () => void }> = ({ roleId, onClose }) => (
  <Overlay title={INFO_UI.roleInfo} onClose={onClose}><RoleDetail roleId={roleId} /></Overlay>
);

function ruleValueText(key: keyof WerewolfSettings, value: unknown): string {
  const meta = RULE_LABELS[key];
  if (typeof value === 'boolean') return value ? INFO_UI.on : INFO_UI.off;
  if (typeof value === 'string' && meta?.options) return meta.options[value] ?? value;
  return String(value);
}

/** ปุ่มซ้ายบน: ผู้เล่นทุกคนดูตั้งค่าห้อง + บททั้งหมดในเกมนี้ว่าทำอะไรได้บ้าง */
export const RoomInfoPanel: React.FC<{ view: MyViewResponse; onClose: () => void }> = ({ view, onClose }) => {
  const [tab, setTab] = useState<'roles' | 'settings'>('roles');
  const [open, setOpen] = useState<string | null>(null);
  const counts = (Object.entries(view.lobby.roleCounts) as [string, number][]).filter(([id]) => ROLES[id]);
  const total = counts.reduce((a, [, n]) => a + n, 0);
  const rules = { ...DEFAULT_SETTINGS, ...view.lobby.rules };

  return (
    <Overlay title={INFO_UI.roomInfoTitle} onClose={onClose}>
      <div className="flex gap-2" role="tablist">
        {([['roles', INFO_UI.tabRoles], ['settings', INFO_UI.tabSettings]] as const).map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`flex-1 min-h-12 rounded-xl text-sm font-bold cursor-pointer ${tab === k ? 'bg-violet-700' : 'bg-slate-800 text-slate-300'}`}>{label}</button>
        ))}
      </div>

      {tab === 'roles' ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">{INFO_UI.rolesTotal(total)} · {INFO_UI.tapHint}</p>
          {counts.map(([id, n]) => (
            <div key={id} className="rounded-xl bg-slate-900/70 border border-slate-700/60">
              <button onClick={() => setOpen(open === id ? null : id)} aria-expanded={open === id} className="w-full min-h-14 px-3 flex items-center gap-3 text-left cursor-pointer">
                <span className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center p-1 shrink-0"><RoleIcon id={id} className="w-full h-full" /></span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold">{ROLES[id].nameTh}</span>
                  <span className="block text-[11px] text-slate-400">{INFO_UI.teams[ROLES[id].startTeam] ?? ''}</span>
                </span>
                <span className="text-sm font-black text-amber-200">{INFO_UI.count(n)}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open === id ? 'rotate-180' : ''}`} />
              </button>
              {open === id && <div className="px-3 pb-3 border-t border-slate-800 pt-3"><RoleDetail roleId={id} /></div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">{INFO_UI.settingsHint}</p>
          <ul className="space-y-2">
            {(RULE_GROUPS.flatMap((g) => g.keys) as (keyof WerewolfSettings)[]).filter((k) => !(k === 'disconnectGraceSeconds' && rules.disconnectMode === 'wait')).map((k) => (
              <li key={k} className="rounded-xl bg-slate-900/70 px-3 py-2">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-bold">{RULE_LABELS[k].label}</span>
                  <span className="text-xs font-black text-amber-200 text-right max-w-[55%]">{ruleValueText(k, rules[k])}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{RULE_LABELS[k].help}</p>
              </li>
            ))}
          </ul>
          <section>
            <h3 className="text-xs font-black text-violet-300 mb-1">{INFO_UI.timers}</h3>
            <ul className="space-y-1 text-sm">
              {(Object.keys(TIMER_LIMITS) as (keyof LobbyTimers)[]).map((t) => (
                <li key={t} className="flex justify-between"><span className="text-slate-300">{UI.timerLabels[t].label}</span><span className="font-black">{view.lobby.timers[t]}</span></li>
              ))}
            </ul>
          </section>
          <section className="text-sm space-y-1">
            <div className="flex justify-between"><span className="text-slate-300">{INFO_UI.chatModeLabel}</span><span className="font-black">{UI.chatModes[view.lobby.chatMode]?.label}</span></div>
            <div className="flex justify-between"><span className="text-slate-300">{INFO_UI.maxPlayersLabel}</span><span className="font-black">{view.lobby.maxPlayers}</span></div>
            <div className="flex justify-between"><span className="text-slate-300">{UI.settings.allowSpectators}</span><span className="font-black">{view.lobby.allowSpectators ? INFO_UI.on : INFO_UI.off}</span></div>
          </section>
        </div>
      )}
    </Overlay>
  );
};
