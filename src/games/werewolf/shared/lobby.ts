// shared/lobby.ts — ค่าตั้งค่าห้อง (ใช้ร่วมกันทั้งเบราว์เซอร์และฟังก์ชันเซิร์ฟเวอร์)
// เซิร์ฟเวอร์ "ทำความสะอาด" (sanitize) ค่าทุกครั้งก่อนบันทึก — ไม่เชื่อค่าจากเบราว์เซอร์
import { DEFAULT_SETTINGS, ROLES } from '../engine';
import type { WerewolfSettings } from '../engine';

export type ChatMode = 'chat' | 'voice' | 'both';

export interface LobbyTimers {
  roleRevealSeconds: number;
  nightActionSeconds: number;
  discussionSeconds: number;
  nominationSeconds: number;
  defenseSeconds: number;
  voteSeconds: number;
}

export interface LobbySettings {
  roleCounts: Record<string, number>; // บท → จำนวน
  rules: Partial<WerewolfSettings>; // ตัวเลือกกติกา (ที่ต่างจากค่าเริ่มต้น)
  timers: LobbyTimers;
  chatMode: ChatMode;
  maxPlayers: number;
  allowSpectators: boolean; // อนุญาตให้คนเข้ามาดูเกมที่เริ่มไปแล้ว
}

export const DEFAULT_TIMERS: LobbyTimers = {
  roleRevealSeconds: 60,
  nightActionSeconds: 30,
  discussionSeconds: 180,
  nominationSeconds: 30,
  defenseSeconds: 30,
  voteSeconds: 45,
};

export const TIMER_LIMITS: Record<keyof LobbyTimers, [number, number]> = {
  roleRevealSeconds: [15, 180],
  nightActionSeconds: [10, 120],
  discussionSeconds: [30, 900],
  nominationSeconds: [10, 120],
  defenseSeconds: [10, 120],
  voteSeconds: [10, 180],
};

export const DEFAULT_LOBBY: LobbySettings = {
  roleCounts: {},
  rules: {},
  timers: { ...DEFAULT_TIMERS },
  chatMode: 'both',
  maxPlayers: 30,
  allowSpectators: true,
};

// ตัวเลือกแบบเลือกค่า — ใช้ตรวจว่าค่าที่ส่งมาถูกต้อง และใช้สร้างหน้าตั้งค่า
export const RULE_ENUMS = {
  wolfDisagree: ['none', 'random'],
  revealOnDeath: ['vote', 'role', 'team', 'wolf', 'none'],
  tieRule: ['none', 'revote', 'random', 'mayor'],
  wolfWinOperator: ['gte', 'gt'],
  disconnectMode: ['wait', 'bot', 'dead'],
} as const;

export const RULE_NUMBER_LIMITS: Partial<Record<keyof WerewolfSettings, [number, number]>> = {
  maxNominees: [1, 5],
  idiotSurvives: [1, 3],
  princeSurvives: [1, 3],
  disconnectGraceSeconds: [15, 300],
};

function clampInt(v: unknown, [lo, hi]: [number, number], fallback: number): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(hi, Math.max(lo, Math.round(n)));
}

export function sanitizeRules(input: unknown): Partial<WerewolfSettings> {
  const out: Record<string, unknown> = {};
  if (!input || typeof input !== 'object') return out;
  const src = input as Record<string, unknown>;
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof WerewolfSettings)[]) {
    if (!(key in src)) continue;
    const def = DEFAULT_SETTINGS[key];
    const v = src[key];
    if (typeof def === 'boolean') {
      if (typeof v === 'boolean') out[key] = v;
    } else if (typeof def === 'number') {
      const lim = RULE_NUMBER_LIMITS[key];
      if (lim) out[key] = clampInt(v, lim, def);
    } else if (typeof def === 'string') {
      const allowed = (RULE_ENUMS as Record<string, readonly string[]>)[key];
      if (allowed && typeof v === 'string' && allowed.includes(v)) out[key] = v;
    }
  }
  return out as Partial<WerewolfSettings>;
}

export function sanitizeLobby(input: unknown, base: LobbySettings = DEFAULT_LOBBY): LobbySettings {
  const src = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const next: LobbySettings = {
    roleCounts: { ...base.roleCounts },
    rules: { ...base.rules },
    timers: { ...base.timers },
    chatMode: base.chatMode,
    maxPlayers: base.maxPlayers,
    allowSpectators: base.allowSpectators ?? true,
  };

  if (src.roleCounts && typeof src.roleCounts === 'object') {
    const counts: Record<string, number> = {};
    for (const [id, n] of Object.entries(src.roleCounts as Record<string, unknown>)) {
      if (!ROLES[id]) continue; // ไม่รู้จักบท — ทิ้ง
      const c = clampInt(n, [0, 30], 0);
      if (c > 0) counts[id] = c;
    }
    next.roleCounts = counts;
  }
  if ('rules' in src) next.rules = sanitizeRules(src.rules);
  if (src.timers && typeof src.timers === 'object') {
    const t = src.timers as Record<string, unknown>;
    for (const k of Object.keys(TIMER_LIMITS) as (keyof LobbyTimers)[]) {
      if (k in t) next.timers[k] = clampInt(t[k], TIMER_LIMITS[k], base.timers[k]);
    }
  }
  if (src.chatMode === 'chat' || src.chatMode === 'voice' || src.chatMode === 'both') next.chatMode = src.chatMode;
  if (typeof src.allowSpectators === 'boolean') next.allowSpectators = src.allowSpectators;
  if ('maxPlayers' in src) next.maxPlayers = clampInt(src.maxPlayers, [5, 30], base.maxPlayers);
  return next;
}

/** { werewolf: 2, seer: 1 } → ['werewolf','werewolf','seer'] */
export function expandRoles(counts: Record<string, number>): string[] {
  const out: string[] = [];
  for (const [id, n] of Object.entries(counts)) for (let i = 0; i < n; i++) out.push(id);
  return out;
}

export function countsFromRoles(roles: string[]): Record<string, number> {
  const c: Record<string, number> = {};
  for (const r of roles) c[r] = (c[r] ?? 0) + 1;
  return c;
}

/** เติมชาวบ้านให้จำนวนบทเท่าจำนวนผู้เล่น (ถ้าบทพิเศษน้อยกว่า) — ใช้ปุ่ม "เติมชาวบ้านให้ครบ" */
export function fillWithVillagers(counts: Record<string, number>, playerCount: number): Record<string, number> {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total >= playerCount) return { ...counts };
  return { ...counts, villager: (counts.villager ?? 0) + (playerCount - total) };
}
