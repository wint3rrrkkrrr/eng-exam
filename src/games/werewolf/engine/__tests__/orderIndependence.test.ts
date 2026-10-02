// กลางคืนทำพร้อมกัน → ผลของคืนต้อง "ไม่ขึ้นกับลำดับที่ผู้เล่นกดส่ง" (ใครกดก่อน/หลังต้องไม่ได้เปรียบ)
import { describe, expect, it } from 'vitest';
import { createGame } from '../state';
import { applyAction } from '../reducer';
import { botNightAction } from '../bots';
import { hashSeed } from '../rng';
import { presetRoles } from '../presets';
import { pendingSlotFor } from '../night';
import { advance } from '../reducer';
import type { GameAction, GameState } from '../types';

type NightAct = Extract<GameAction, { type: 'night_action' }>;

/** JSON ที่เรียงคีย์คงที่ (ลำดับคีย์ในอ็อบเจ็กต์ขึ้นกับว่าใครถูกบันทึกก่อน ซึ่งไม่ใช่ความต่างของผล) */
function stable(x: unknown): string {
  return JSON.stringify(x, (_k, v) => (v && typeof v === 'object' && !Array.isArray(v)
    ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
    : v));
}

function snapshot(s: GameState): string {
  return stable({
    players: s.players.map((p) => [p.id, p.alive, p.roleId, p.team, p.canVote, p.roleState]),
    // ข้อความแจ้งส่วนตัว: เทียบเป็นชุด (ลำดับข้อความที่เกิดจากแอคชันทันที เช่น ลอกบท/คู่รัก ขึ้นกับลำดับกด แต่ไม่ใช่ความต่างของผล)
    log: Object.fromEntries(Object.entries(s.privateLog).map(([id, list]) => [id, list.map((r) => stable(r)).sort()])),
    delayed: s.delayed,
    phase: s.phase,
    pending: s.pendingHunters,
    winners: s.winners,
  });
}

/** ใช้แอคชันทั้งหมดกับ state ตามลำดับที่กำหนด (ที่ถูกปฏิเสธเพราะยังไม่ถึงตา เช่น ผู้ลอกเลียนแบบ ให้ลองใหม่รอบถัดไป) */
function replay(start: GameState, acts: NightAct[]): GameState {
  let s = start;
  let rest = acts.slice();
  for (let pass = 0; pass < 6 && rest.length > 0; pass++) {
    const next: NightAct[] = [];
    for (const a of rest) {
      const r = applyAction(s, a);
      if (r.error) next.push(a);
      else s = r.state;
    }
    if (next.length === rest.length) break;
    rest = next;
  }
  const r = applyAction(s, { type: 'advance', timedOut: true });
  return r.error ? s : r.state;
}

describe('ผลของคืนไม่ขึ้นกับลำดับที่กดส่ง', () => {
  for (const n of [8, 12, 20, 30]) {
    it(`${n} คน: ส่งตามลำดับ p1→pn เทียบกับสลับลำดับ — ผลเหมือนกันทุกคืน`, () => {
      const diffs: string[] = [];
      for (let i = 0; i < 20; i++) {
        const seed = `ord-${n}-${i}`;
        const players = Array.from({ length: n }, (_, k) => ({ id: `p${k + 1}`, name: `P${k + 1}`, seat: k + 1 }));
        const { state } = createGame({ roomCode: 'ORD01', players, roleIds: presetRoles(n), seed });
        let s: GameState = state!;
        const rng = { rngState: hashSeed(seed + ':b') >>> 0 };
        // ข้ามช่วงดูบท
        for (const p of s.players) s = applyAction(s, { type: 'ready', actorId: p.id }).state;
        s = applyAction(s, { type: 'advance', timedOut: true }).state;

        for (let night = 0; night < 6 && s.phase === 'night'; night++) {
          // สร้างชุดแอคชันของทุกคนจากสถานะต้นคืน (บอท) โดยไล่ส่งเข้า state จริงทีละคนเพื่อให้ได้ชุดที่ถูกกติกา
          const acts: NightAct[] = [];
          let probe = s;
          for (let guard = 0; guard < 6; guard++) {
            let progressed = false;
            for (const p of probe.players) {
              const slot = pendingSlotFor(probe, p.id);
              if (!slot) continue;
              const a = botNightAction(probe, p.id, rng, slot.slot) as NightAct;
              const r = applyAction(probe, a);
              if (r.error) continue;
              probe = r.state;
              acts.push(a);
              progressed = true;
            }
            if (!progressed) break;
          }
          const fwd = replay(s, acts);
          const rev = replay(s, acts.slice().reverse());
          const shuf = replay(s, acts.map((a, k) => [hashSeed(seed + night + k), a] as const).sort((x, y) => x[0] - y[0]).map((x) => x[1]));
          if (snapshot(fwd) !== snapshot(rev)) diffs.push(`${seed} คืน ${night}: ลำดับกลับด้านให้ผลต่างกัน`);
          if (snapshot(fwd) !== snapshot(shuf)) diffs.push(`${seed} คืน ${night}: ลำดับสลับให้ผลต่างกัน`);

          // เดินเกมต่อด้วยผลของลำดับปกติ จนถึงคืนถัดไป (ใช้บอทเล่นกลางวัน/โหวตแบบง่าย: ข้ามด้วยหมดเวลา)
          s = fwd;
          let g = 0;
          while (s.phase !== 'night' && s.phase !== 'game_over' && g++ < 30) {
            const nom = s.phase === 'nomination';
            void nom;
            const r = applyAction(s, { type: 'advance', timedOut: true });
            if (r.error) break;
            s = r.state;
          }
          if (s.phase === 'game_over') break;
        }
        void advance;
      }
      expect(diffs).toEqual([]);
    });
  }
});
