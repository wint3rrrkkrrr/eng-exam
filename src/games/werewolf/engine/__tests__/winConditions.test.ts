// เงื่อนไขชนะ + ลำดับความสำคัญเมื่อหลายฝ่ายชนะพร้อมกัน (RULES ข้อ 8.2 · Q9)
import { describe, expect, it } from 'vitest';
import { makeGame } from './testUtils';
import { checkWinners } from '../win';
import type { GameState } from '../types';

function setup(roles: string[], aliveIds: string[], settings = {}): GameState {
  const g = makeGame(roles, settings);
  for (const p of g.s.players) p.alive = aliveIds.includes(p.id);
  return g.s;
}

const R = ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager', 'villager', 'cupid'];

describe('ชาวบ้าน / หมาป่า', () => {
  it('หมาป่าทุกตัวตาย → ชาวบ้านชนะ', () => {
    const s = setup(R, ['p3', 'p4', 'p5']);
    expect(checkWinners(s)![0].team).toBe('village');
  });

  it('จำนวนหมาป่า = ฝ่ายอื่น (≥) → หมาป่าชนะ · ค่า ">" ต้องมากกว่าจึงชนะ', () => {
    expect(checkWinners(setup(R, ['p1', 'p3']))![0].team).toBe('wolf');
    expect(checkWinners(setup(R, ['p1', 'p3'], { wolfWinOperator: 'gt' }))).toBeNull();
    expect(checkWinners(setup(R, ['p1', 'p3', 'p4'], { wolfWinOperator: 'gt' }))).toBeNull();
    expect(checkWinners(setup(R, ['p1', 'p2', 'p3'], { wolfWinOperator: 'gt' }))![0].team).toBe('wolf');
  });

  it('หมาป่ายังน้อยกว่า → เกมไม่จบ', () => {
    expect(checkWinners(setup(R, ['p1', 'p3', 'p4', 'p5']))).toBeNull();
  });

  it('ทุกคนตายหมด → เสมอ (ไม่มีผู้เล่นที่ชนะ)', () => {
    const w = checkWinners(setup(R, []))!;
    expect(w[0].playerIds).toEqual([]);
  });
});

describe('คู่รักข้ามฝ่าย', () => {
  it('หมาป่า 1 + ชาวบ้าน 1 ที่เป็นคู่รักกัน → "คู่รัก" ชนะ ไม่ใช่หมาป่า (เงื่อนไขแคบกว่าชนะ)', () => {
    const s = setup(R, ['p1', 'p3']);
    s.loverPairs = [['p1', 'p3']];
    const w = checkWinners(s)!;
    expect(w[0].team).toBe('lovers');
    expect(w[0].playerIds).toEqual(['p1', 'p3']);
  });

  it('คู่รักฝ่ายเดียวกัน → ไม่ใช่เงื่อนไขคู่รัก (ใช้เงื่อนไขของฝ่ายตามปกติ)', () => {
    const s = setup(R, ['p3', 'p4']);
    s.loverPairs = [['p3', 'p4']];
    expect(checkWinners(s)![0].team).toBe('village');
  });

  it('ปิดสวิตช์ loversWin → หมาป่าชนะตามปกติ', () => {
    const s = setup(R, ['p1', 'p3'], { loversWin: false });
    s.loverPairs = [['p1', 'p3']];
    expect(checkWinners(s)![0].team).toBe('wolf');
  });

  it('เหลือคู่รัก 2 คน + คนอื่นอีก → เกมยังไม่จบ (ต้องเหลือสองคนนั้นเท่านั้น)', () => {
    const s = setup(R, ['p1', 'p3', 'p4']);
    s.loverPairs = [['p1', 'p3']];
    expect(checkWinners(s)).toBeNull();
  });
});
