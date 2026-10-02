import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Info, Minus, Plus, Search } from 'lucide-react';
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

type TeamKey = 'village' | 'wolf' | 'solo' | 'vampire' | 'cult';
const GROUPS: { key: TeamKey; roles: typeof ROLE_LIST }[] = (['village', 'wolf', 'solo', 'vampire', 'cult'] as TeamKey[])
  .map((key) => ({ key, roles: ROLE_LIST.filter((r) => r.startTeam === key) }));
const ROLE_BY_ID = Object.fromEntries(ROLE_LIST.map((r) => [r.id, r]));
const TEAM_DOT: Record<TeamKey, string> = { village: 'bg-emerald-400', wolf: 'bg-red-500', solo: 'bg-amber-400', vampire: 'bg-fuchsia-500', cult: 'bg-indigo-400' };

type Tab = 'roles' | 'rules' | 'timers' | 'general';

const stepBtn = 'min-w-10 min-h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed';

/** สวิตช์เปิด/ปิด */
const Switch: React.FC<{ id: string; on: boolean; disabled: boolean; onChange: () => void; label: string }> = ({ id, on, disabled, onChange, label }) => (
  <button
    id={id}
    role="switch"
    aria-checked={on}
    aria-label={label}
    disabled={disabled}
    onClick={onChange}
    className={`relative w-12 h-7 rounded-full transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${on ? 'bg-violet-600' : 'bg-slate-700'}`}
  >
    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${on ? 'left-6' : 'left-1'}`} />
  </button>
);

/** ตัวปรับตัวเลขแบบ − n + */
const Stepper: React.FC<{ value: number; min: number; max: number; step?: number; disabled: boolean; onChange: (n: number) => void; label: string }> = ({ value, min, max, step = 1, disabled, onChange, label }) => (
  <div className="flex items-center gap-1 shrink-0">
    <button disabled={disabled || value <= min} onClick={() => onChange(Math.max(min, value - step))} aria-label={`ลด ${label}`} className={stepBtn}><Minus className="w-4 h-4" /></button>
    <span className="min-w-9 text-center font-black tabular-nums text-sm" aria-label={label}>{value}</span>
    <button disabled={disabled || value >= max} onClick={() => onChange(Math.min(max, value + step))} aria-label={`เพิ่ม ${label}`} className={stepBtn}><Plus className="w-4 h-4" /></button>
  </div>
);

/** แถวตั้งค่า: ชื่อ + ตัวควบคุม · คำอธิบายซ่อนไว้ แตะ (i) เพื่อดู */
const Row: React.FC<{ label: string; help?: string; control: React.ReactNode; htmlFor?: string }> = ({ label, help, control, htmlFor }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-slate-900/60 px-3 py-2">
      <div className="flex items-center gap-2 min-h-11">
        <label htmlFor={htmlFor} className="flex-1 text-sm font-bold leading-snug">{label}</label>
        {help && (
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={`คำอธิบาย ${label}`} className={`min-w-9 min-h-9 rounded-full flex items-center justify-center cursor-pointer ${open ? 'bg-violet-700 text-white' : 'text-slate-500 hover:text-slate-200'}`}>
            <Info className="w-4 h-4" />
          </button>
        )}
        {control}
      </div>
      {help && open && <p className="pb-1.5 text-xs text-slate-400 leading-relaxed">{help}</p>}
    </div>
  );
};

export const SettingsPanel: React.FC<Props> = ({ view, session, refresh }) => {
  const readOnly = !view.me.isHost;
  const [draft, setDraft] = useState<LobbySettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [presetVariant, setPresetVariant] = useState(0); // กดชุดบทซ้ำ = สลับชุดอื่น (เกมใหญ่ที่ที่นั่งไม่พอใส่ทุกบท)
  const [tab, setTab] = useState<Tab>('roles');
  const [openTeams, setOpenTeams] = useState<Record<string, boolean>>({});
  const [openInfo, setOpenInfo] = useState<string | null>(null); // บทที่กางคำอธิบาย
  const [openRuleGroup, setOpenRuleGroup] = useState<string | null>(RULE_GROUPS[0]?.key ?? null);
  const [roleQuery, setRoleQuery] = useState('');
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
  const matched = diff === 0 && roleIds.length > 0;

  const setCount = (id: string, n: number) => {
    const counts = { ...lobby.roleCounts };
    if (n <= 0) delete counts[id];
    else counts[id] = Math.min(30, n);
    change({ ...lobby, roleCounts: counts });
  };
  const setRule = <K extends keyof WerewolfSettings>(key: K, value: WerewolfSettings[K]) => change({ ...lobby, rules: { ...lobby.rules, [key]: value } });
  const ruleValue = <K extends keyof WerewolfSettings>(key: K): WerewolfSettings[K] => (lobby.rules[key] ?? DEFAULT_SETTINGS[key]) as WerewolfSettings[K];

  const selected = useMemo(
    () => (Object.entries(lobby.roleCounts) as [string, number][]).filter(([, n]) => n > 0).map(([id, n]) => ({ id, n, role: ROLE_BY_ID[id] })).filter((x) => x.role),
    [lobby.roleCounts],
  );
  const q = roleQuery.trim().toLowerCase();

  const tabBtn = (t: Tab, label: string, badge?: boolean) => (
    <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`relative flex-1 min-h-12 rounded-xl text-xs sm:text-sm font-black cursor-pointer ${tab === t ? 'bg-gradient-to-r from-violet-600 to-fuchsia-700 text-white shadow' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'}`}>
      {label}
      {badge && <span className="absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full bg-amber-400" aria-label="ต้องแก้ไข" />}
    </button>
  );

  return (
    <section className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-3 sm:p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-black text-slate-200">{readOnly ? UI.lobby.settingsReadonly : UI.lobby.settings}</h2>
        {readOnly && <span className="text-[11px] text-slate-500">ดูได้อย่างเดียว</span>}
      </div>

      <nav className="grid grid-cols-4 gap-1.5" role="tablist" aria-label="หมวดการตั้งค่า">
        {tabBtn('roles', '🎭 บทบาท', !matched)}
        {tabBtn('rules', '⚙️ กติกา')}
        {tabBtn('timers', '⏱️ เวลา')}
        {tabBtn('general', '💬 ทั่วไป')}
      </nav>

      {/* ================================================================ บทบาท */}
      {tab === 'roles' && (
        <div className="space-y-3">
          {/* สรุปจำนวน */}
          <div className={`rounded-2xl border px-4 py-3 ${matched ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-amber-950/30 border-amber-500/40'}`}>
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold text-slate-400">บทที่เลือก / ผู้เล่นในห้อง</div>
                <div className={`text-2xl font-black tabular-nums ${matched ? 'text-emerald-300' : 'text-amber-200'}`}>{roleIds.length} <span className="text-slate-500">/</span> {playerCount}</div>
              </div>
              <div className={`text-xs font-black text-right ${matched ? 'text-emerald-300' : 'text-amber-200'}`}>{matched ? UI.settings.match : UI.settings.mismatch(diff)}</div>
            </div>
            {balance.warningsTh.length > 0 && (
              <ul className="mt-2 space-y-0.5">{balance.warningsTh.map((w) => <li key={w} className="text-[11px] text-amber-300">⚠ {w}</li>)}</ul>
            )}
          </div>

          {!readOnly && (
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => { change({ ...lobby, roleCounts: countsFromRoles(presetRoles(Math.max(5, playerCount), presetVariant)) }); setPresetVariant((v) => v + 1); }} className="min-h-12 px-2 rounded-xl bg-violet-800/70 hover:bg-violet-700 text-xs font-black cursor-pointer leading-tight">✨ ชุดมาตรฐาน<br /><span className="font-semibold opacity-80">กดซ้ำ = สลับชุด</span></button>
              <button onClick={() => change({ ...lobby, roleCounts: fillWithVillagers(lobby.roleCounts, playerCount) })} className="min-h-12 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black cursor-pointer leading-tight">🧑‍🌾 เติมชาวบ้าน<br /><span className="font-semibold opacity-70">ให้ครบคน</span></button>
              <button onClick={() => change({ ...lobby, roleCounts: {} })} className="min-h-12 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black cursor-pointer leading-tight">🗑️ ล้างทั้งหมด</button>
            </div>
          )}

          {/* บทที่เลือกอยู่ */}
          {selected.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-black text-slate-400">บทที่เลือกอยู่ (แตะเพื่อลด)</div>
              <div className="flex flex-wrap gap-1.5">
                {selected.map(({ id, n, role }) => (
                  <button key={id} disabled={readOnly} onClick={() => setCount(id, n - 1)} aria-label={`ลด ${role.nameTh}`} className="min-h-9 pl-2.5 pr-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:cursor-default">
                    <span className={`w-2 h-2 rounded-full ${TEAM_DOT[role.startTeam as TeamKey] ?? 'bg-slate-500'}`} />
                    {role.nameTh}<span className="text-violet-300 font-black">×{n}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ค้นหา */}
          <label className="relative block">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={roleQuery} onChange={(e) => setRoleQuery(e.target.value)} placeholder="ค้นหาบท…" aria-label="ค้นหาบท" className="w-full min-h-12 pl-9 pr-3 rounded-xl bg-slate-900/80 border border-slate-700 text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-400" />
          </label>

          {/* รายการบทแยกฝ่าย (พับเก็บได้) */}
          {GROUPS.map((g) => {
            const list = q ? g.roles.filter((r) => r.nameTh.toLowerCase().includes(q) || r.descriptionTh.toLowerCase().includes(q)) : g.roles;
            if (q && list.length === 0) return null;
            const open = q ? true : !!openTeams[g.key];
            const picked = g.roles.reduce((s, r) => s + (lobby.roleCounts[r.id] ?? 0), 0);
            return (
              <div key={g.key} className="rounded-2xl border border-slate-800 overflow-hidden">
                <button onClick={() => setOpenTeams((o) => ({ ...o, [g.key]: !o[g.key] }))} aria-expanded={open} className="w-full min-h-12 px-3 flex items-center gap-2 bg-slate-900/70 hover:bg-slate-900 cursor-pointer text-left">
                  <span className={`w-2.5 h-2.5 rounded-full ${TEAM_DOT[g.key]}`} />
                  <span className="flex-1 text-sm font-black">{UI.settings.groups[g.key]}</span>
                  {picked > 0 && <span className="px-2 py-0.5 rounded-full bg-violet-700 text-[11px] font-black">เลือก {picked}</span>}
                  <span className="text-[11px] text-slate-500">{g.roles.length} บท</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <ul className="p-2 grid gap-1.5 sm:grid-cols-2">
                    {list.map((r) => {
                      const n = lobby.roleCounts[r.id] ?? 0;
                      const info = openInfo === r.id;
                      return (
                        <li key={r.id} className={`rounded-xl px-2.5 py-1.5 ${n > 0 ? 'bg-violet-950/50 ring-1 ring-violet-500/40' : 'bg-slate-900/60'}`}>
                          <div className="flex items-center gap-1.5 min-h-11">
                            <button onClick={() => setOpenInfo(info ? null : r.id)} aria-expanded={info} aria-label={`รายละเอียด ${r.nameTh}`} className="flex-1 min-w-0 text-left cursor-pointer">
                              <span className="block text-[13px] font-bold leading-tight line-clamp-2">{r.nameTh}</span>
                            </button>
                            <Stepper value={n} min={0} max={30} disabled={readOnly} onChange={(v) => setCount(r.id, v)} label={r.nameTh} />
                          </div>
                          {info && <p className="pb-1 text-xs text-slate-400 leading-relaxed">{r.descriptionTh}</p>}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================================================================ กติกา */}
      {tab === 'rules' && (
        <div className="space-y-2">
          <p className="text-[11px] text-slate-500 px-1">แตะ <Info className="inline w-3 h-3" /> ข้างข้อเพื่ออ่านคำอธิบาย · ค่าเริ่มต้นเหมาะกับการเล่นทั่วไป ไม่ต้องแก้ก็ได้</p>
          {RULE_GROUPS.map((grp) => {
            const open = openRuleGroup === grp.key;
            return (
              <div key={grp.key} className="rounded-2xl border border-slate-800 overflow-hidden">
                <button onClick={() => setOpenRuleGroup(open ? null : grp.key)} aria-expanded={open} className="w-full min-h-12 px-3 flex items-center gap-2 bg-slate-900/70 hover:bg-slate-900 cursor-pointer text-left">
                  <span className="flex-1 text-sm font-black">{grp.title}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="p-2 space-y-1.5">
                    {grp.keys.map((k) => {
                      const key = k as keyof WerewolfSettings;
                      if (key === 'disconnectGraceSeconds' && ruleValue('disconnectMode') === 'wait') return null; // ไม่เกี่ยวกับโหมดรอ
                      const meta = RULE_LABELS[key];
                      const def = DEFAULT_SETTINGS[key];
                      const enumValues = (RULE_ENUMS as Record<string, readonly string[]>)[key];
                      return (
                        <React.Fragment key={key}>
                          <Row
                            label={meta.label}
                            help={meta.help}
                            htmlFor={`rule-${key}`}
                            control={
                              typeof def === 'boolean' ? (
                                <Switch id={`rule-${key}`} on={ruleValue(key) as boolean} disabled={readOnly} onChange={() => setRule(key, !(ruleValue(key) as boolean) as never)} label={meta.label} />
                              ) : typeof def === 'number' ? (
                                <Stepper value={ruleValue(key) as number} min={meta.min ?? 1} max={meta.max ?? 9} step={meta.step ?? 1} disabled={readOnly} onChange={(v) => setRule(key, v as never)} label={meta.label} />
                              ) : null
                            }
                          />
                          {typeof def === 'string' && enumValues && meta.options && (
                            <select
                              id={`rule-${key}`}
                              value={ruleValue(key) as string}
                              disabled={readOnly}
                              onChange={(e) => setRule(key, e.target.value as never)}
                              aria-label={meta.label}
                              className="-mt-1 w-full min-h-12 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100"
                            >
                              {enumValues.map((v) => <option key={v} value={v}>{meta.options![v] ?? v}</option>)}
                            </select>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================================================================ เวลา */}
      {tab === 'timers' && (
        <div className="space-y-1.5">
          <p className="text-[11px] text-slate-500 px-1">เวลาแต่ละช่วงของเกม (หน่วยวินาที) — กด − / + ปรับทีละ 5</p>
          {(Object.keys(TIMER_LIMITS) as (keyof LobbyTimers)[]).map((k) => {
            const [lo, hi] = TIMER_LIMITS[k];
            const meta = UI.timerLabels[k];
            return (
              <Row
                key={k}
                label={meta.label}
                help={`${meta.help} (ช่วง ${lo}–${hi} วินาที)`}
                control={<Stepper value={lobby.timers[k]} min={lo} max={hi} step={5} disabled={readOnly} onChange={(v) => change({ ...lobby, timers: { ...lobby.timers, [k]: v } })} label={meta.label} />}
              />
            );
          })}
        </div>
      )}

      {/* ================================================================ ทั่วไป */}
      {tab === 'general' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <h3 className="text-xs font-black text-slate-400 px-1">{UI.settings.chatMode}</h3>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900/70 border border-slate-800" role="radiogroup" aria-label={UI.settings.chatMode}>
              {(['both', 'chat', 'voice'] as const).map((m) => (
                <button key={m} role="radio" aria-checked={lobby.chatMode === m} disabled={readOnly} onClick={() => change({ ...lobby, chatMode: m })} className={`min-h-12 px-1 rounded-lg text-xs font-black cursor-pointer disabled:cursor-default leading-tight ${lobby.chatMode === m ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                  {UI.chatModes[m].label}
                </button>
              ))}
            </div>
            <p className="px-1 text-[11px] text-slate-500">{UI.chatModes[lobby.chatMode].help}</p>
          </div>

          <Row label={UI.settings.maxPlayers} control={<Stepper value={lobby.maxPlayers} min={5} max={30} disabled={readOnly} onChange={(v) => change({ ...lobby, maxPlayers: v })} label={UI.settings.maxPlayers} />} />
          <Row
            label={UI.settings.allowSpectators}
            help={UI.settings.allowSpectatorsHelp}
            htmlFor="allowSpectators"
            control={<Switch id="allowSpectators" on={lobby.allowSpectators} disabled={readOnly} onChange={() => change({ ...lobby, allowSpectators: !lobby.allowSpectators })} label={UI.settings.allowSpectators} />}
          />
        </div>
      )}

      {error && <div role="alert" className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</div>}
    </section>
  );
};
