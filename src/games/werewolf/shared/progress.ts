// shared/progress.ts — ความก้าวหน้าของผู้เล่น: เลเวล/XP · สถิติ (ฟังก์ชันล้วน ใช้ทั้งเซิร์ฟเวอร์และเบราว์เซอร์)
// ผู้ตัดสินคือเซิร์ฟเวอร์เสมอ (คำนวณตอนเกมจบ) — ตัวเลขทั้งหมดปรับได้ที่ไฟล์นี้ที่เดียว

export const XP_REWARD = { play: 30, win: 40, survive: 15 } as const;
/** เมื่อขึ้นถึงเลเวล L ได้เหรียญโบนัส = L × ค่านี้ */
export const LEVEL_COIN = 30;

// ---------------------------------------------------------------- เลเวล
/** XP สะสมที่ต้องมีเพื่อถึงเลเวล L (เลเวล 1 = 0) — แต่ละขั้นยากขึ้นเรื่อยๆ: ขั้น k→k+1 ใช้ 100 + 40(k−1) */
export function xpForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level)) - 1;
  return 100 * n + 20 * n * (n - 1);
}
export function levelFromXp(xp: number): number {
  let l = 1;
  while (xpForLevel(l + 1) <= xp) l++;
  return l;
}
const TITLES: [number, string][] = [
  [1, '🐑 ลูกแกะหลงทาง'], [3, '👤 ชาวบ้านหน้าใหม่'], [6, '🔍 นักสืบสมัครเล่น'], [10, '🏹 นักล่าหมาป่า'],
  [15, '🛡️ ผู้พิทักษ์หมู่บ้าน'], [25, '🌕 ตำนานแห่งแววูฟ'], [40, '👑 ราชาแววูฟ'],
];
export const titleForLevel = (level: number): string => [...TITLES].reverse().find(([l]) => level >= l)![1];

// ---------------------------------------------------------------- ข้อมูลที่เก็บ
export interface RoleStat { g: number; w: number }
export interface Stats {
  games: number;
  wins: number;
  survived: number;
  streak: number; // ชนะติดต่อกันตอนนี้
  bestStreak: number;
  byRole: Record<string, RoleStat>;
  byTeam: Record<string, RoleStat>;
}
export interface Progress {
  xp: number;
  stats: Stats;
}
export const emptyStats = (): Stats => ({ games: 0, wins: 0, survived: 0, streak: 0, bestStreak: 0, byRole: {}, byTeam: {} });
export const emptyProgress = (): Progress => ({ xp: 0, stats: emptyStats() });

/** แปลงข้อมูลดิบจากฐานข้อมูล (jsonb อาจว่าง/ขาดบางช่อง) ให้เป็น Progress ที่ใช้ได้เสมอ */
export function normalizeProgress(raw: unknown): Progress {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Partial<Progress>;
  const s = (o.stats && typeof o.stats === 'object' ? o.stats : {}) as Partial<Stats>;
  return {
    xp: Number.isFinite(o.xp) ? Math.max(0, Math.floor(o.xp as number)) : 0,
    stats: {
      games: Number(s.games) || 0, wins: Number(s.wins) || 0, survived: Number(s.survived) || 0,
      streak: Number(s.streak) || 0, bestStreak: Number(s.bestStreak) || 0,
      byRole: s.byRole && typeof s.byRole === 'object' ? s.byRole : {},
      byTeam: s.byTeam && typeof s.byTeam === 'object' ? s.byTeam : {},
    },
  };
}

// ---------------------------------------------------------------- ผลของเกมหนึ่งรอบ (ต่อผู้เล่น)
export interface GameResult {
  won: boolean;
  survived: boolean;
  role: string; // บทตอนจบเกม
  team: string; // village | wolf | lovers | solo | vampire | cult
}

export interface GameGain {
  xp: number;
  levelBefore: number;
  levelAfter: number;
  /** เหรียญโบนัสที่ต้องจ่ายเพิ่มจากการขึ้นเลเวล */
  bonusCoins: number;
}

function bumpStat(map: Record<string, RoleStat>, key: string, won: boolean): void {
  const cur = map[key] ?? { g: 0, w: 0 };
  map[key] = { g: cur.g + 1, w: cur.w + (won ? 1 : 0) };
}

/** บันทึกผลเกมหนึ่งรอบ (เรียกครั้งเดียวต่อเกมต่อผู้เล่น) — คืนความก้าวหน้าใหม่ + สรุปที่ได้ */
export function applyGameResult(prev: Progress, r: GameResult): { progress: Progress; gain: GameGain } {
  const p: Progress = JSON.parse(JSON.stringify(prev));
  const s = p.stats;
  s.games++;
  if (r.won) { s.wins++; s.streak++; s.bestStreak = Math.max(s.bestStreak, s.streak); } else s.streak = 0;
  if (r.survived) s.survived++;
  bumpStat(s.byRole, r.role, r.won);
  bumpStat(s.byTeam, r.team, r.won);

  const xp = XP_REWARD.play + (r.won ? XP_REWARD.win : 0) + (r.survived ? XP_REWARD.survive : 0);
  const levelBefore = levelFromXp(p.xp);
  p.xp += xp;
  const levelAfter = levelFromXp(p.xp);
  let bonusCoins = 0;
  for (let l = levelBefore + 1; l <= levelAfter; l++) bonusCoins += l * LEVEL_COIN;
  return { progress: p, gain: { xp, levelBefore, levelAfter, bonusCoins } };
}

// ---------------------------------------------------------------- มุมมองสำหรับหน้าจอ
export interface ProgressView {
  username: string;
  level: number;
  title: string;
  xp: number;
  xpInto: number; // XP ที่สะสมในเลเวลนี้
  xpNeed: number; // XP ที่ต้องใช้เพื่อไปเลเวลถัดไป
  stats: Stats & { winRate: number };
  rank: number | null; // อันดับตาม XP (ถ้ารู้)
}

export function progressView(username: string, p: Progress, rank: number | null = null): ProgressView {
  const level = levelFromXp(p.xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    username, level, title: titleForLevel(level), xp: p.xp, xpInto: p.xp - base, xpNeed: next - base,
    stats: { ...p.stats, winRate: p.stats.games > 0 ? Math.round((p.stats.wins / p.stats.games) * 100) : 0 },
    rank,
  };
}
