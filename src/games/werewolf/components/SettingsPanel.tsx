import React, { useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { RULE_LABELS, RULE_GROUPS, UI } from '../text/th';
import { api } from '../net/werewolfClient';
import type { Session } from '../net/werewolfClient';
import type { MyViewResponse } from '../shared/api';
import {
  RULE_ENUMS, TIMER_LIMITS, countsFromRoles, expandRoles, fillWithVillagers,
} from '../shared/lobby';
import type { LobbySettings, LobbyTimers } from '../shared/lobby';
import { DEFAULT_SETTINGS, ROLE_LIST, analyzeBalance, presetRoles } from '../engine';
import type { WerewolfSettings } from '../engine';

interface Props {
  view: MyViewResponse;
  session: Session;
  refresh: () => Promise<void>;
}

const GROUPS: { key: 'village' | 'wolf' | 'solo' | 'vampire' | 'cult'; roles: typeof ROLE_LIST }[] = [
  { key: 'village', roles: ROLE_LIST.filter((r) => r.startTeam === 'village') },
  { key: 'wolf', roles: ROLE_LIST.filter((r) => r.startTeam === 'wolf') },
  { key: 'solo', roles: ROLE_LIST.filter((r) => r.startTeam === 'solo') },
  { key: 'vampire', roles: ROLE_LIST.filter((r) => r.startTeam === 'vampire') },
  { key: 'cult', roles: ROLE_LIST.filter((r) => r.startTeam === 'cult') },
];

export const SettingsPanel: React.FC<Props> = ({ view, session, refresh }) => {
  const readOnly = !view.me.isHost;
  const [draft, setDraft] = useState<LobbySettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [presetVariant, setPresetVariant] = useState(0); // กดชุดบทซ้ำ = สลับชุดอื่น (เกมใหญ่ที่ที่นั่งไม่พอใส่ทุกบท)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lobby = draft ?? view.lobby;
  const playerCount = view.players.length;

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // บันทึกขึ้นเซิร์ฟเวอร์แบบหน่วงเล็กน้อย (กดรัวๆ ไม่ยิงทุกครั้ง)
  const change = (next: LobbySettings) => {
    if (readOnly) return;
    setDraft(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const r = await api('update-settings', { settings: next }, session);
      setError(r.ok ? null : r.errorTh);
      setDraft(null);
      await refresh();
    }, 350);
  };

  const roleIds = expandRoles(lobby.roleCounts);
  const diff = roleIds.length - playerCount;
  const balance = analyzeBalance(roleIds, playerCount);

  const setCount = (id: string, n: number) => {
    const counts = { ...lobby.roleCounts };
    if (n <= 0) delete counts[id];
    else counts[id] = Math.min(30, n);
    change({ ...lobby, roleCounts: counts });
  };

  const setRule = <K extends keyof WerewolfSettings>(key: K, value: WerewolfSettings[K]) =>
    change({ ...lobby, rules: { ...lobby.rules, [key]: value } });

  const ruleValue = <K extends keyof WerewolfSettings>(key: K): WerewolfSettings[K] =>
    (lobby.rules[key] ?? DEFAULT_SETTINGS[key]) as WerewolfSettings[K];

  const btn = 'min-w-12 min-h-12 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed';

  return (
    <section className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4 space-y-4">
      <h2 className="text-sm font-black text-slate-200">{readOnly ? UI.lobby.settingsReadonly : UI.lobby.settings}</h2>

      {/* ---------- บทบาท */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-xs font-black text-violet-300">{UI.settings.roles}</h3>
          {!readOnly && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => { change({ ...lobby, roleCounts: countsFromRoles(presetRoles(Math.max(5, playerCount), presetVariant)) }); setPresetVariant((v) => v + 1); }} className="min-h-12 px-3 rounded-xl bg-violet-800/60 hover:bg-violet-700 text-xs font-bold cursor-pointer">{UI.settings.preset}</button>
              <button onClick={() => change({ ...lobby, roleCounts: fillWithVillagers(lobby.roleCounts, playerCount) })} className="min-h-12 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold cursor-pointer">{UI.settings.fill}</button>
              <button onClick={() => change({ ...lobby, roleCounts: {} })} className="min-h-12 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold cursor-pointer">{UI.settings.clear}</button>
            </div>
          )}
        </div>

        <div className={`rounded-xl px-3 py-2 text-xs font-bold ${diff === 0 && roleIds.length > 0 ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-amber-950/30 text-amber-200 border border-amber-500/30'}`}>
          {UI.settings.total(roleIds.length, playerCount)} · {diff === 0 && roleIds.length > 0 ? UI.settings.match : UI.settings.mismatch(diff)}
        </div>
        {balance.warningsTh.map((w) => <p key={w} className="text-xs text-amber-300">{w}</p>)}

        {GROUPS.map((g) => (
          <div key={g.key} className="space-y-2">
            <div className="text-[11px] font-black text-slate-500">{UI.settings.groups[g.key]}</div>
            {g.roles.map((r) => {
              const n = lobby.roleCounts[r.id] ?? 0;
              return (
                <div key={r.id} className="flex items-center gap-2 rounded-xl bg-slate-900/60 px-3 py-1">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{r.nameTh}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-2">{r.descriptionTh}</div>
                  </div>
                  <button disabled={readOnly || n <= 0} onClick={() => setCount(r.id, n - 1)} aria-label={`ลด ${r.nameTh}`} className={btn}><Minus className="w-4 h-4" /></button>
                  <span className="w-6 text-center font-black tabular-nums">{n}</span>
                  <button disabled={readOnly} onClick={() => setCount(r.id, n + 1)} aria-label={`เพิ่ม ${r.nameTh}`} className={btn}><Plus className="w-4 h-4" /></button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ---------- กติกา */}
      <details className="space-y-3" open>
        <summary className="text-xs font-black text-violet-300 cursor-pointer min-h-12 flex items-center">{UI.settings.rules}</summary>
        <div className="space-y-5 pt-2">
          {RULE_GROUPS.map((grp) => (
            <div key={grp.key} className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 border-b border-slate-800 pb-1">{grp.title}</h4>
          {grp.keys.map((k) => {
            const key = k as keyof WerewolfSettings;
            if (key === 'disconnectGraceSeconds' && ruleValue('disconnectMode') === 'wait') return null; // ไม่เกี่ยวกับโหมดรอ
            const meta = RULE_LABELS[key];
            const step = meta.step ?? 1;
            const def = DEFAULT_SETTINGS[key];
            const enumValues = (RULE_ENUMS as Record<string, readonly string[]>)[key];
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor={`rule-${key}`} className="text-sm font-bold flex-1">{meta.label}</label>
                  {typeof def === 'boolean' && (
                    <button
                      id={`rule-${key}`}
                      role="switch"
                      aria-checked={ruleValue(key) as boolean}
                      disabled={readOnly}
                      onClick={() => setRule(key, !(ruleValue(key) as boolean) as never)}
                      className={`relative w-14 h-8 rounded-full transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed ${ruleValue(key) ? 'bg-violet-600' : 'bg-slate-700'}`}
                    >
                      <span className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${ruleValue(key) ? 'left-7' : 'left-1'}`} />
                    </button>
                  )}
                  {typeof def === 'number' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button disabled={readOnly || (ruleValue(key) as number) <= (meta.min ?? 1)} onClick={() => setRule(key, Math.max(meta.min ?? 1, (ruleValue(key) as number) - step) as never)} className={btn} aria-label="ลด"><Minus className="w-4 h-4" /></button>
                      <span id={`rule-${key}`} className="min-w-8 text-center font-black tabular-nums">{ruleValue(key) as number}</span>
                      <button disabled={readOnly || (ruleValue(key) as number) >= (meta.max ?? 9)} onClick={() => setRule(key, Math.min(meta.max ?? 9, (ruleValue(key) as number) + step) as never)} className={btn} aria-label="เพิ่ม"><Plus className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                {typeof def === 'string' && enumValues && meta.options && (
                  <select
                    id={`rule-${key}`}
                    value={ruleValue(key) as string}
                    disabled={readOnly}
                    onChange={(e) => setRule(key, e.target.value as never)}
                    className="w-full min-h-12 px-3 rounded-xl bg-slate-900 border border-slate-700 text-base text-slate-100"
                  >
                    {enumValues.map((v) => <option key={v} value={v}>{meta.options![v] ?? v}</option>)}
                  </select>
                )}
                <p className="text-[11px] text-slate-500">{meta.help}</p>
              </div>
            );
          })}
            </div>
          ))}
        </div>
      </details>

      {/* ---------- เวลา */}
      <details className="space-y-3">
        <summary className="text-xs font-black text-violet-300 cursor-pointer min-h-12 flex items-center">{UI.settings.timers}</summary>
        <div className="space-y-3 pt-2">
          {(Object.keys(TIMER_LIMITS) as (keyof LobbyTimers)[]).map((k) => {
            const [lo, hi] = TIMER_LIMITS[k];
            const meta = UI.timerLabels[k];
            return (
              <div key={k} className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor={`timer-${k}`} className="text-sm font-bold flex-1">{meta.label}</label>
                  <input
                    id={`timer-${k}`}
                    type="number"
                    inputMode="numeric"
                    min={lo}
                    max={hi}
                    disabled={readOnly}
                    value={lobby.timers[k]}
                    onChange={(e) => change({ ...lobby, timers: { ...lobby.timers, [k]: Number(e.target.value) || lo } })}
                    className="w-24 min-h-12 px-3 rounded-xl bg-slate-900 border border-slate-700 text-base text-center text-slate-100"
                  />
                </div>
                <p className="text-[11px] text-slate-500">{meta.help} (ช่วง {lo}–{hi})</p>
              </div>
            );
          })}
        </div>
      </details>

      {/* ---------- โหมดคุย + จำนวนผู้เล่น */}
      <div className="space-y-2">
        <h3 className="text-xs font-black text-violet-300">{UI.settings.chatMode}</h3>
        {(['both', 'chat', 'voice'] as const).map((m) => (
          <label key={m} className={`flex items-start gap-3 rounded-xl px-3 py-2 border cursor-pointer ${lobby.chatMode === m ? 'border-violet-400 bg-violet-950/40' : 'border-slate-700/60'}`}>
            <input type="radio" name="chatMode" disabled={readOnly} checked={lobby.chatMode === m} onChange={() => change({ ...lobby, chatMode: m })} className="mt-1.5" />
            <span>
              <span className="block text-sm font-bold">{UI.chatModes[m].label}</span>
              <span className="block text-[11px] text-slate-500">{UI.chatModes[m].help}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <label htmlFor="maxPlayers" className="text-sm font-bold flex-1">{UI.settings.maxPlayers}</label>
        <input
          id="maxPlayers"
          type="number"
          inputMode="numeric"
          min={5}
          max={30}
          disabled={readOnly}
          value={lobby.maxPlayers}
          onChange={(e) => change({ ...lobby, maxPlayers: Math.min(30, Math.max(5, Number(e.target.value) || 5)) })}
          className="w-24 min-h-12 px-3 rounded-xl bg-slate-900 border border-slate-700 text-base text-center text-slate-100"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="allowSpectators" className="text-sm font-bold flex-1">{UI.settings.allowSpectators}</label>
          <button
            id="allowSpectators"
            role="switch"
            aria-checked={lobby.allowSpectators}
            disabled={readOnly}
            onClick={() => change({ ...lobby, allowSpectators: !lobby.allowSpectators })}
            className={`relative w-14 h-8 rounded-full transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed ${lobby.allowSpectators ? 'bg-violet-600' : 'bg-slate-700'}`}
          >
            <span className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${lobby.allowSpectators ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        <p className="text-[11px] text-slate-500">{UI.settings.allowSpectatorsHelp}</p>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</div>}
    </section>
  );
};
