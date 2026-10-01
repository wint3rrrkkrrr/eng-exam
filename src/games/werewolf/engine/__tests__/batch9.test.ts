// M6 แพ็ก #9: ฝ่ายอิสระที่เหลือ (ฆาตกรเดี่ยว · นักวางเพลิง · นักล่าหมาป่าเดี่ยว · ชูปาคาบรา)
import { describe, expect, it } from 'vitest';
import { alive, makeGame, playDay, playNight } from './testUtils';
import { applyAction } from '../reducer';
import { legalTargets } from '../night';
import { buildView } from '../view';

const act = (g: ReturnType<typeof makeGame>, a: Parameters<typeof applyAction>[1]) => {
  const r = applyAction(g.s, a);
  if (r.error) throw new Error(`${a.type}: ${r.error.code}`);
  g.s = r.state;
};
const skipDay = (g: ReturnType<typeof makeGame>) => playDay(g, {}, {});

describe('ฆาตกรเดี่ยว', () => {
  // p1 หมาป่า · p2 ฆาตกรเดี่ยว · p3 หมอ · p4 ผู้คุ้มกัน · p5-p6 ชาวบ้าน
  const ROLES = ['werewolf', 'serial_killer', 'doctor', 'bodyguard', 'villager', 'villager'];

  it('หมอกันไม่ได้ — เป้าหมายตายแม้ถูกหมอเลือกป้องกัน', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'solo_kill', targets: ['p5'] }, p3: { kind: 'protect_doctor', targets: ['p5'] } });
    expect(alive(g, 'p5')).toBe(false);
  });

  it('ผู้คุ้มกันกันได้ — ตายแทน', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'solo_kill', targets: ['p5'] }, p4: { kind: 'protect_bodyguard', targets: ['p5'] } });
    expect(alive(g, 'p5')).toBe(true);
    expect(alive(g, 'p4')).toBe(false);
  });

  it('ถูกหมาป่ากัดตายได้ตามปกติ (ไม่มีภูมิคุ้มกันพิเศษ)', () => {
    const g = makeGame(ROLES);
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p2'] } });
    expect(alive(g, 'p2')).toBe(false);
  });

  it('ชนะเมื่อเหลือคนสุดท้าย (เหลือ 2 คนยังไม่ชนะ — แม้อีกคนเป็นหมาป่า)', () => {
    // ตั้ง wolfWinOperator เป็น gt กันไม่ให้หมาป่าชนะอัตโนมัติตอนเหลือ 1v1 (ให้ฆาตกรเดี่ยวมีโอกาสฆ่าต่อจนเหลือคนเดียว)
    const g = makeGame(['serial_killer', 'werewolf', 'villager', 'villager', 'villager'], { wolfWinOperator: 'gt' });
    playNight(g, { p1: { kind: 'solo_kill', targets: ['p3'] } });
    expect(g.s.phase).not.toBe('game_over');
    skipDay(g);
    playNight(g, { p1: { kind: 'solo_kill', targets: ['p4'] } });
    expect(g.s.phase).not.toBe('game_over');
    skipDay(g);
    playNight(g, { p1: { kind: 'solo_kill', targets: ['p5'] } });
    expect(g.s.phase).not.toBe('game_over'); // เหลือ 2 คน (p1, p2) ยังไม่ชนะ
    skipDay(g);
    playNight(g, { p1: { kind: 'solo_kill', targets: ['p2'] } });
    expect(g.s.phase).toBe('game_over');
    expect(g.s.winners![0].team).toBe('solo');
    expect(g.s.winners![0].playerIds).toEqual(['p1']);
  });
});

describe('นักวางเพลิง', () => {
  // p1 หมาป่า · p2 นักวางเพลิง · p3 หมอ · p4 ผู้คุ้มกัน · p5 นักบวช · p6 แม่มด
  const ROLES = ['werewolf', 'arsonist', 'doctor', 'bodyguard', 'priest', 'witch'];

  it('ชโลมน้ำมันหลายคนสะสมไว้ก่อน แล้วจุดทีเดียวเผาทุกคนที่ชโลม', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'oil_mark', targets: ['p5'] } });
    expect(g.s.players.find((p) => p.id === 'p2')!.roleState.marked).toEqual(['p5']);
    skipDay(g);
    playNight(g, { p2: { kind: 'oil_mark', targets: ['p6'] } });
    expect(g.s.players.find((p) => p.id === 'p2')!.roleState.marked).toEqual(['p5', 'p6']);
    skipDay(g);
    playNight(g, {
      p2: { kind: 'ignite' },
      p3: { kind: 'protect_doctor', targets: ['p5'] },
      p4: { kind: 'protect_bodyguard', targets: ['p6'] },
    });
    expect(alive(g, 'p5')).toBe(false);
    expect(alive(g, 'p6')).toBe(false); // ไฟทะลุทั้งหมอและผู้คุ้มกัน
    expect(g.s.players.find((p) => p.id === 'p2')!.roleState.marked).toEqual([]); // ใช้แล้วเคลียร์
  });

  it('ไฟทะลุนักบวชด้วย', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'oil_mark', targets: ['p1'] } });
    skipDay(g);
    playNight(g, { p2: { kind: 'ignite' }, p5: { kind: 'protect_priest', targets: ['p1'] } });
    expect(alive(g, 'p1')).toBe(false);
  });

  it('ชโลมตัวเองได้', () => {
    const g = makeGame(ROLES);
    expect(legalTargets(g.s, g.s.players[1], 'oil_mark')).toContain('p2');
  });

  it('ยังไม่ชโลมใคร → จุดไฟแล้วไม่มีใครตาย', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'ignite' } });
    expect(g.s.players.every((p) => p.alive)).toBe(true);
  });
});

describe('นักล่าหมาป่าเดี่ยว', () => {
  // p1 หมาป่า · p2 นักล่าหมาป่าเดี่ยว · p3-p5 ชาวบ้าน
  const ROLES = ['werewolf', 'lone_wolf_hunter', 'villager', 'villager', 'villager'];

  it('ยังมีหมาป่าเหลือ → ฆ่าได้เฉพาะหมาป่า', () => {
    const g = makeGame(ROLES);
    expect(legalTargets(g.s, g.s.players[1], 'hunt_wolf')).toEqual(['p1']);
    const r = applyAction(g.s, { type: 'night_action', actorId: 'p2', kind: 'hunt_wolf', targets: ['p3'] });
    expect(r.error).toBeTruthy();
  });

  it('ฆ่าหมาป่าสำเร็จ', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'hunt_wolf', targets: ['p1'] } });
    expect(alive(g, 'p1')).toBe(false);
  });

  it('หมาป่าหมดแล้ว → ฆ่าใครก็ได้ (ตรวจกติกาการเลือกเป้าหมายโดยตรง ไม่ผ่านการจบเกม)', () => {
    const g = makeGame(ROLES);
    g.s.players[0].alive = false; // จำลองว่าหมาป่าตายแล้ว โดยไม่ผ่าน settleDeaths (กันไม่ให้เกมจบก่อนเวลา)
    expect(legalTargets(g.s, g.s.players[1], 'hunt_wolf')).toEqual(expect.arrayContaining(['p3', 'p4', 'p5']));
  });
});

describe('ชูปาคาบรา', () => {
  // p1 หมาป่า · p2 ชูปาคาบรา · p3-p5 ชาวบ้าน
  const ROLES = ['werewolf', 'chupacabra', 'villager', 'villager', 'villager'];

  it('เลือกถูก (เป็นหมาป่า) → หมาป่าตาย', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'hunt_chupacabra', targets: ['p1'] } });
    expect(alive(g, 'p1')).toBe(false);
  });

  it('เลือกผิด → ไม่มีอะไรเกิดขึ้น ไม่มีผลลัพธ์ให้รู้', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'hunt_chupacabra', targets: ['p3'] } });
    expect(g.s.players.every((p) => p.alive)).toBe(true);
    const v = buildView(g.s, 'p2')!;
    expect(v.privateResults).toEqual([]);
  });

  it('หมาป่าหมด + ชูปาคาบรายังรอด → ชนะแยก (ประกาศคู่กับผู้ชนะหลัก)', () => {
    const g = makeGame(['werewolf', 'chupacabra', 'villager', 'villager', 'villager']);
    playNight(g, { p2: { kind: 'hunt_chupacabra', targets: ['p1'] } });
    expect(alive(g, 'p1')).toBe(false);
    expect(g.s.phase).toBe('game_over'); // หมาป่าหมด → หมู่บ้านชนะหลัก
    const ids = g.s.winners!.flatMap((w) => w.playerIds);
    expect(ids).toContain('p2');
    expect(g.s.winners!.find((w) => w.playerIds.includes('p2'))!.main).toBe(false);
  });

  it('หมาป่ายังไม่ตายหมด → ไม่ได้ชนะแยก', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'hunt_chupacabra', targets: ['p3'] } }); // เลือกผิด หมาป่ายังอยู่
    expect(g.s.phase).not.toBe('game_over');
  });
});
