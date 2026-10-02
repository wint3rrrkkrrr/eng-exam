// engine/settings.ts — ค่าเริ่มต้น + ตรวจชุดบทก่อนเริ่มเกม
import type { RoleId, WerewolfSettings } from './types';
import { ROLES } from './roles';

// ค่าเริ่มต้นตาม RULES.md ข้อ 13 (เอกสารเจ้าของเว็บ + Q16 + Q21)
export const DEFAULT_SETTINGS: WerewolfSettings = {
  firstNightKill: true,
  wolfDisagree: 'random',
  doctorSelfProtect: true,
  doctorNoRepeat: true,
  witchBothSameNight: true,
  witchSelfHeal: true,
  witchRefundOnProtected: true,
  cupidSelf: true,
  loversWin: true,
  hunterTimeoutRandom: true,
  revealOnDeath: 'vote',
  tieRule: 'none',
  maxNominees: 3,
  liveVotes: true,
  idiotSurvives: 1,
  princeSurvives: 1,
  tannerEndsGame: true,
  wolfWinOperator: 'gte',
  blockedNotice: true,
  disconnectMode: 'wait',
  disconnectGraceSeconds: 60,
};

export function withDefaults(partial?: Partial<WerewolfSettings>): WerewolfSettings {
  return { ...DEFAULT_SETTINGS, ...(partial ?? {}) };
}

export interface SetupIssue {
  level: 'error' | 'warning';
  messageTh: string;
}

/** ตรวจก่อนเริ่มเกม (RULES ข้อ 3) — error = ห้ามเริ่ม, warning = เตือนเฉยๆ */
export function validateSetup(roleIds: RoleId[], playerCount: number): SetupIssue[] {
  const issues: SetupIssue[] = [];
  const err = (messageTh: string) => issues.push({ level: 'error', messageTh });

  if (playerCount < 5) err('ต้องมีผู้เล่นอย่างน้อย 5 คน');
  if (playerCount > 30) err('รองรับผู้เล่นได้สูงสุด 30 คน');
  if (roleIds.length !== playerCount) {
    err(`จำนวนบท (${roleIds.length}) ไม่เท่ากับจำนวนผู้เล่น (${playerCount})`);
  }

  const count: Record<string, number> = {};
  for (const id of roleIds) {
    const def = ROLES[id];
    if (!def) {
      err(`ไม่รู้จักบท "${id}"`);
      continue;
    }
    if (!def.winTh || def.winTh.trim() === '') {
      err(`บท "${def.nameTh}" ไม่มีเงื่อนไขชนะ — ห้ามใส่เข้าเกม`);
    }
    count[id] = (count[id] ?? 0) + 1;
  }

  if ((count['mason'] ?? 0) === 1) err('ช่างก่อสร้างต้องมีอย่างน้อย 2 คน');

  const wolves = roleIds.filter((id) => ROLES[id]?.startTeam === 'wolf').length;
  const vampires = roleIds.filter((id) => ROLES[id]?.startTeam === 'vampire').length;
  const cultists = roleIds.filter((id) => ROLES[id]?.startTeam === 'cult').length;
  if (wolves < 1 && vampires < 1 && cultists < 1) err('ต้องมีฝ่ายหมาป่า แวมไพร์ หรือลัทธิ อย่างน้อย 1 คน');
  if (wolves * 2 >= playerCount) err('ฝ่ายหมาป่าต้องน้อยกว่าครึ่งหนึ่งของผู้เล่น');

  return issues;
}
