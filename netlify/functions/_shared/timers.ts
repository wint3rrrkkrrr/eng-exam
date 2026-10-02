// _shared/timers.ts — เวลาของแต่ละเฟส (ฝั่งเซิร์ฟเวอร์เท่านั้น — เอนจินไม่รู้จักเวลา)
import type { GameState } from '../../../src/games/werewolf/engine';
import type { LobbyTimers } from '../../../src/games/werewolf/shared/lobby';

export const HUNTER_SECONDS = 30;
export const MORNING_SECONDS = 8;
export const EXECUTION_SECONDS = 8;
// ช่องกลางคืน "ทุกช่อง" (มีคนเล่นหรือว่าง) ต้องกินเวลาขั้นต่ำช่วงเดียวกัน → กันเดาจากเวลา (GAME_SPEC 4.1)
export const NIGHT_MIN_MS: [number, number] = [8000, 12000];

export interface Timing {
  endsAt: number | null;
  minUntil: number | null;
}

/** คำนวณเวลาหมดเฟส/เวลาขั้นต่ำของ "สถานะปัจจุบัน" — เรียกหลังทุกการเปลี่ยนเฟส */
export function computeTiming(g: GameState, t: LobbyTimers, now: number, rand: (lo: number, hi: number) => number): Timing {
  if (g.phase === 'game_over') return { endsAt: null, minUntil: null };
  if (g.pendingHunters.length > 0) return { endsAt: now + HUNTER_SECONDS * 1000, minUntil: null };

  switch (g.phase) {
    case 'role_reveal':
      return { endsAt: now + t.roleRevealSeconds * 1000, minUntil: null };
    case 'night': {
      // กลางคืนเฟสเดียว ทุกบททำพร้อมกัน: ต้องกินเวลาขั้นต่ำเสมอ (กันเดาจากความเร็วว่ามีใครมีบทกลางคืนบ้าง)
      const min = now + rand(NIGHT_MIN_MS[0], NIGHT_MIN_MS[1]);
      return { endsAt: now + t.nightActionSeconds * 1000, minUntil: min };
    }
    case 'morning':
      return { endsAt: now + MORNING_SECONDS * 1000, minUntil: null };
    case 'discussion':
      return { endsAt: now + t.discussionSeconds * 1000, minUntil: null };
    case 'nomination':
      return { endsAt: now + t.nominationSeconds * 1000, minUntil: null };
    case 'defense':
      return { endsAt: now + t.defenseSeconds * 1000 * Math.max(1, g.candidates.length), minUntil: null };
    case 'vote':
      return { endsAt: now + t.voteSeconds * 1000, minUntil: null };
    case 'execution':
      return { endsAt: now + EXECUTION_SECONDS * 1000, minUntil: null };
    default:
      return { endsAt: null, minUntil: null };
  }
}

/** ลายเซ็นสถานะ — ใช้ดูว่า advance เดินจริงไหม */
export function signature(g: GameState): string {
  return [
    g.phase, g.dayNumber, g.night ? 'N' : '-', g.pendingHunters.length, g.voteRound, g.winners ? 'W' : '-',
    g.candidates.length,
  ].join('|');
}
