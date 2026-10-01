// จำลองด้วยบอท: ทุกเกมต้องจบ ไม่ค้าง ไม่มีแอคชันถูกปฏิเสธ มีผู้ชนะ (ฉบับย่อ — ฉบับ 500 เกมคือ `npm run sim`)
import { describe, expect, it } from 'vitest';
import { PRESET_SIZES, presetRoles, runSimulation } from './sim';
import { validateSetup } from '../settings';

describe('simulate (บอทเล่นกันเอง)', () => {
  it('ชุดบทพรีเซ็ตทุกขนาดผ่านการตรวจก่อนเริ่มเกม', () => {
    for (const n of PRESET_SIZES) {
      const errors = validateSetup(presetRoles(n), n).filter((i) => i.level === 'error');
      expect(errors, `ขนาด ${n}`).toEqual([]);
    }
  });

  it('จำลอง 15 เกมต่อขนาด → ไม่มีปัญหา', () => {
    const sum = runSimulation(PRESET_SIZES, 15, 'vitest');
    expect(sum.problems).toEqual([]);
    expect(sum.finished).toBe(sum.games);
    expect(sum.village + sum.wolf + sum.lovers + sum.solo + sum.draws).toBe(sum.games);
  }, 60000);
});
