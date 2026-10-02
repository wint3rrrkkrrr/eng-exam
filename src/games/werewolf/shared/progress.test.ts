import { describe, expect, it } from 'vitest';
import { LEVEL_COIN, applyGameResult, emptyProgress, levelFromXp, normalizeProgress, progressView, xpForLevel } from './progress';

const win = { won: true, survived: true, role: 'werewolf', team: 'wolf' };
const lose = { won: false, survived: false, role: 'villager', team: 'village' };

describe('เลเวล/XP', () => {
  it('xpForLevel เพิ่มขึ้นเรื่อยๆ และ levelFromXp กลับค่าได้ถูกต้องทุกเลเวล', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(240);
    for (let l = 1; l <= 60; l++) {
      expect(levelFromXp(xpForLevel(l))).toBe(l);
      expect(levelFromXp(xpForLevel(l + 1) - 1)).toBe(l);
      expect(xpForLevel(l + 1)).toBeGreaterThan(xpForLevel(l));
    }
  });
});

describe('บันทึกผลเกม', () => {
  it('ชนะ+รอด ได้ XP เต็ม · สถิติ/สตรีค/ตามบท/ตามฝ่ายถูกต้อง · แพ้แล้วสตรีคขาด', () => {
    let p = emptyProgress();
    const r1 = applyGameResult(p, win);
    expect(r1.gain.xp).toBe(30 + 40 + 15);
    p = r1.progress;
    expect(p.stats).toMatchObject({ games: 1, wins: 1, survived: 1, streak: 1, bestStreak: 1 });
    expect(p.stats.byRole.werewolf).toEqual({ g: 1, w: 1 });
    expect(p.stats.byTeam.wolf).toEqual({ g: 1, w: 1 });
    p = applyGameResult(p, win).progress;
    p = applyGameResult(p, lose).progress;
    expect(p.stats).toMatchObject({ games: 3, wins: 2, streak: 0, bestStreak: 2 });
    expect(applyGameResult(p, lose).gain.xp).toBe(30);
  });

  it('ไม่แก้ข้อมูลเดิม (immutable) · ขึ้นเลเวลได้โบนัสเหรียญ = เลเวล × ค่าคงที่ ทุกเลเวลที่ข้าม', () => {
    const p = { ...emptyProgress(), xp: 99 };
    const r = applyGameResult(p, lose); // +30 XP → 129 → เลเวล 2
    expect(p.xp).toBe(99);
    expect(r.gain.levelBefore).toBe(1);
    expect(r.gain.levelAfter).toBe(2);
    expect(r.gain.bonusCoins).toBe(2 * LEVEL_COIN);
    const big = applyGameResult({ ...emptyProgress(), xp: 0 }, win); // 85 XP ยังเลเวล 1
    expect(big.gain.bonusCoins).toBe(0);
    const jump = applyGameResult({ ...emptyProgress(), xp: xpForLevel(5) - 1 }, lose); // ข้ามขึ้นเลเวล 5
    expect(jump.gain.levelAfter).toBe(5);
    expect(jump.gain.bonusCoins).toBe(5 * LEVEL_COIN);
  });

  it('มุมมอง: ค่า XP ในเลเวล/ที่ต้องใช้ และอัตราชนะ', () => {
    const v = progressView('x', { ...applyGameResult(emptyProgress(), win).progress, xp: 150 }, 3);
    expect(v.level).toBe(2);
    expect(v.xpInto).toBe(50);
    expect(v.xpNeed).toBe(140);
    expect(v.stats.winRate).toBe(100);
    expect(v.rank).toBe(3);
  });
});

describe('normalizeProgress', () => {
  it('ข้อมูลว่าง/พัง → ค่าเริ่มต้นที่ใช้ได้', () => {
    for (const bad of [null, undefined, 5, 'x', [], { xp: 'abc', stats: 3 }]) {
      const p = normalizeProgress(bad);
      expect(p.xp).toBe(0);
      expect(p.stats.games).toBe(0);
    }
  });
});
