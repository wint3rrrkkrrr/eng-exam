// M6 แพ็ก #7: ทีมอิสระ (แวมไพร์ · ผู้นำลัทธิ + สมาชิกลัทธิ)
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
const flushNight = (g: ReturnType<typeof makeGame>) => { while (g.s.phase === 'night') act(g, { type: 'advance', timedOut: true }); };

describe('แวมไพร์', () => {
  // p1 แวมไพร์ · p2 หมอ · p3 ผู้คุ้มกัน · p4-p6 ชาวบ้าน
  const ROLES = ['vampire', 'doctor', 'bodyguard', 'villager', 'villager', 'villager'];

  it('กัดแล้วไม่ตาย แต่แปลงเป็นแวมไพร์ตอนจบคืนถัดไป (ไม่ใช่คืนนี้)', () => {
    const g = makeGame(ROLES);
    playNight(g, { p1: { kind: 'vampire_bite', targets: ['p4'] } });
    expect(alive(g, 'p4')).toBe(true);
    expect(g.s.players.find((p) => p.id === 'p4')!.team).toBe('village');
    const v = buildView(g.s, 'p4')!;
    expect(v.privateResults.some((r) => r.textTh.includes('แวมไพร์กัด'))).toBe(true);
    skipDay(g);
    flushNight(g);
    expect(g.s.players.find((p) => p.id === 'p4')!.team).toBe('vampire');
    expect(g.s.players.find((p) => p.id === 'p4')!.roleId).toBe('vampire');
  });

  it('หมอกันได้ → ไม่ถูกแปลง', () => {
    const g = makeGame(ROLES);
    playNight(g, { p1: { kind: 'vampire_bite', targets: ['p4'] }, p2: { kind: 'protect_doctor', targets: ['p4'] } });
    skipDay(g);
    flushNight(g);
    expect(g.s.players.find((p) => p.id === 'p4')!.team).toBe('village');
  });

  it('ผู้คุ้มกันกันได้ (และไม่ต้องตายแทน — ไม่ใช่การโจมตีที่ฆ่า)', () => {
    const g = makeGame(ROLES);
    playNight(g, { p1: { kind: 'vampire_bite', targets: ['p4'] }, p3: { kind: 'protect_bodyguard', targets: ['p4'] } });
    skipDay(g);
    flushNight(g);
    expect(g.s.players.find((p) => p.id === 'p4')!.team).toBe('village');
    expect(alive(g, 'p3')).toBe(true);
  });

  it('แม่มดชุบไม่ได้ — ไม่มีเหยื่อฝูงหมาป่าให้ชุบคืนที่แวมไพร์กัด (ถูกปฏิเสธ no_heal)', () => {
    const g = makeGame(['vampire', 'witch', 'villager', 'villager', 'villager']);
    act(g, { type: 'night_action', actorId: 'p1', kind: 'vampire_bite', targets: ['p3'] });
    act(g, { type: 'advance' }); // ไปช่องแม่มด
    const r = applyAction(g.s, { type: 'night_action', actorId: 'p2', kind: 'witch', meta: { heal: true } });
    expect(r.error?.code).toBe('no_heal');
  });

  it('ผู้ที่ถูกแปลงแล้วกัดต่อได้ทันที (ขยายฝูงเอง) และชนะได้เมื่อแวมไพร์ ≥ ผู้เล่นอื่นที่รอด', () => {
    const g = makeGame(['vampire', 'villager', 'villager', 'villager', 'villager']);
    playNight(g, { p1: { kind: 'vampire_bite', targets: ['p2'] } }); // คืน 1
    skipDay(g);
    playNight(g, { p1: { kind: 'vampire_bite', targets: ['p3'] } }); // คืน 2 — จบคืนนี้ p2 แปลงแล้ว
    expect(g.s.players.find((p) => p.id === 'p2')!.team).toBe('vampire');
    expect(g.s.phase).not.toBe('game_over'); // 2 แวมไพร์ vs 3 คนอื่น
    skipDay(g);
    playNight(g, { p1: { kind: 'vampire_bite', targets: ['p4'] }, p2: { kind: 'vampire_bite', targets: ['p4'] } }); // คืน 3 — จบคืนนี้ p3 แปลงแล้ว
    expect(g.s.phase).toBe('game_over'); // 3 แวมไพร์ (p1,p2,p3) vs 2 คนอื่น (p4,p5)
    expect(g.s.winners![0].team).toBe('vampire');
    expect(g.s.winners![0].playerIds.sort()).toEqual(['p1', 'p2', 'p3']);
  });

  it('เลือกกัดตัวเองไม่ได้', () => {
    const g = makeGame(['vampire', 'villager', 'villager', 'villager', 'villager']);
    expect(legalTargets(g.s, g.s.players[0], 'vampire_bite')).not.toContain('p1');
  });
});

describe('ผู้นำลัทธิ', () => {
  // p1 หมาป่า · p2 ผู้นำลัทธิ · p3-p6 ชาวบ้าน (6 คน)
  const ROLES = ['werewolf', 'cult_leader', 'villager', 'villager', 'villager', 'villager'];

  it('ชักชวนสำเร็จ → เป็นสมาชิกลัทธิทันทีตอนจบคืนนั้น (ไม่ต้องรอข้ามคืน)', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'cult_recruit', targets: ['p3'] } });
    expect(g.s.players.find((p) => p.id === 'p3')!.team).toBe('cult');
    expect(g.s.players.find((p) => p.id === 'p3')!.roleId).toBe('cult_member');
  });

  it('ชักชวนหมาป่าไม่ได้ (เฉพาะฝ่ายหมู่บ้าน)', () => {
    const g = makeGame(ROLES);
    const r = applyAction(g.s, { type: 'night_action', actorId: 'p2', kind: 'cult_recruit', targets: ['p1'] });
    expect(r.error).toBeTruthy();
  });

  it('สมาชิกลัทธิไม่มีความสามารถชักชวนต่อ', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'cult_recruit', targets: ['p3'] } });
    skipDay(g);
    const r = applyAction(g.s, { type: 'night_action', actorId: 'p3', kind: 'cult_recruit', targets: ['p4'] });
    expect(r.error).toBeTruthy();
  });

  it('ชนะเมื่อจำนวนสมาชิกลัทธิ (รวมหัวหน้า) ≥ ผู้เล่นอื่นที่รอด', () => {
    const g = makeGame(['cult_leader', 'villager', 'villager', 'villager', 'villager']);
    playNight(g, { p1: { kind: 'cult_recruit', targets: ['p2'] } }); // คืน 1 — 2 ลัทธิ vs 3 คนอื่น
    expect(g.s.phase).not.toBe('game_over');
    skipDay(g);
    playNight(g, { p1: { kind: 'cult_recruit', targets: ['p3'] } }); // คืน 2 — 3 ลัทธิ vs 2 คนอื่น
    expect(g.s.phase).toBe('game_over');
    expect(g.s.winners![0].team).toBe('cult');
    expect(g.s.winners![0].playerIds.sort()).toEqual(['p1', 'p2', 'p3']);
  });
});
