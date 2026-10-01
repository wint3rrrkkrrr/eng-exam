// ตัวช่วยจำลองเกมด้วยบอท: ชุดบทพรีเซ็ตตามจำนวนผู้เล่น (เฉพาะบทแพ็กหลักที่ทำเสร็จใน M2)
import { createGame } from '../state';
import { playBotGame } from '../bots';
import { hashSeed } from '../rng';
import { presetRoles } from '../presets';

export { presetRoles };
import type { GameState } from '../types';

export const PRESET_SIZES = [6, 8, 10, 15, 20, 25, 30];

export interface SimSummary {
  games: number;
  finished: number;
  village: number;
  wolf: number;
  lovers: number;
  solo: number;
  draws: number;
  maxDays: number;
  problems: string[];
}

export function runSimulation(sizes: number[], gamesPerSize: number, label = 'sim'): SimSummary {
  const sum: SimSummary = { games: 0, finished: 0, village: 0, wolf: 0, lovers: 0, solo: 0, draws: 0, maxDays: 0, problems: [] };
  for (const n of sizes) {
    for (let i = 0; i < gamesPerSize; i++) {
      const seed = `${label}-${n}-${i}`;
      const players = Array.from({ length: n }, (_, k) => ({ id: `p${k + 1}`, name: `ผู้เล่น${k + 1}`, seat: k + 1 }));
      const { state, errors } = createGame({ roomCode: 'SIM01', players, roleIds: presetRoles(n), seed });
      if (!state) {
        sum.problems.push(`${seed}: สร้างเกมไม่ได้ ${errors.map((e) => e.messageTh).join(',')}`);
        continue;
      }
      const res = playBotGame(state, hashSeed(seed + ':bots'));
      sum.games++;
      if (res.rejected.length > 0) sum.problems.push(`${seed}: บอทถูกปฏิเสธ ${res.rejected.slice(0, 3).join(' | ')}`);
      if (!res.finished) {
        sum.problems.push(`${seed}: เกมค้าง (phase=${res.state.phase}, day=${res.state.dayNumber})`);
        continue;
      }
      sum.finished++;
      sum.maxDays = Math.max(sum.maxDays, res.state.dayNumber);
      const w = (res.state as GameState).winners;
      if (!w || w.length === 0) sum.problems.push(`${seed}: จบเกมแต่ไม่มีผู้ชนะ`);
      else if (w[0].playerIds.length === 0) sum.draws++;
      else sum[w[0].team]++;
    }
  }
  return sum;
}
