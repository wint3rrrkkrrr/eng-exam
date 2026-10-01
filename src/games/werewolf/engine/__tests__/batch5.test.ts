// M6 แพ็ก #5: บทฝ่ายหมาป่าที่เหลือทั้งหมด (หมาป่าเดียวดาย · ผู้พยากรณ์ · ผู้หยั่งรู้ฝ่ายหมาป่า · อัลฟ่า · แพร่เชื้อ · ลูกหมาป่า)
import { describe, expect, it } from 'vitest';
import { alive, makeGame, playDay, playNight } from './testUtils';
import { applyAction } from '../reducer';
import { buildView } from '../view';

const results = (g: ReturnType<typeof makeGame>, id: string) => buildView(g.s, id)!.privateResults.map((r) => r.textTh);
const skipDay = (g: ReturnType<typeof makeGame>) => playDay(g, {}, {}); // ไม่มีใครเสนอชื่อ → ข้ามไปคืนถัดไปตรงๆ
const act = (g: ReturnType<typeof makeGame>, a: Parameters<typeof applyAction>[1]) => {
  const r = applyAction(g.s, a);
  if (r.error) throw new Error(`${a.type}: ${r.error.code}`);
  g.s = r.state;
};
const flushNight = (g: ReturnType<typeof makeGame>) => { while (g.s.phase === 'night') act(g, { type: 'advance', timedOut: true }); };

describe('หมาป่าเดียวดาย', () => {
  it('ฝ่ายหมาป่าชนะขณะมีหมาป่าตัวอื่นรอด → หมาป่าเดียวดายไม่อยู่ในรายชื่อผู้ชนะ', () => {
    // p1 หมาป่า · p2 หมาป่าเดียวดาย · p3-p5 ชาวบ้าน (5 คน 2 หมาป่า)
    const g = makeGame(['werewolf', 'lone_wolf', 'villager', 'villager', 'villager']);
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p3'] }, p2: { kind: 'wolf_bite', targets: ['p3'] } });
    expect(alive(g, 'p3')).toBe(false);
    expect(g.s.phase).toBe('game_over'); // เหลือ 2 หมาป่า vs 2 ชาวบ้าน → wolfWinOperator gte ชนะทันที
    const winnerIds = g.s.winners![0].playerIds;
    expect(winnerIds).toContain('p1');
    expect(winnerIds).not.toContain('p2'); // p2 คือหมาป่าเดียวดาย แพ้เพราะยังมี p1 รอด
  });

  it('เหลือหมาป่าเดียวดายตัวเดียวตอนชนะ → ได้เป็นผู้ชนะด้วย', () => {
    // p1 หมาป่าเดียวดาย · p2-p5 ชาวบ้าน — ฆ่าทีละคนจนเหลือ 1 ตัว vs 1 ชาวบ้าน แล้วชนะคนเดียว
    const g = makeGame(['lone_wolf', 'villager', 'villager', 'villager', 'villager']);
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p2'] } });
    skipDay(g);
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p3'] } });
    expect(g.s.phase).not.toBe('game_over'); // เหลือ p1 vs p4,p5 (1 vs 2) ยังไม่ชนะ
    skipDay(g);
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p4'] } });
    expect(g.s.phase).toBe('game_over'); // เหลือ p1 vs p5 (1 vs 1) → ชนะ
    expect(g.s.winners![0].playerIds).toContain('p1');
  });
});

describe('ผู้พยากรณ์ของหมาป่า', () => {
  // p1 หมาป่า · p2 ผู้พยากรณ์ · p3 ผู้หยั่งรู้ · p4-p5 ชาวบ้าน
  const ROLES = ['werewolf', 'sorcerer', 'seer', 'villager', 'villager'];

  it('ตรวจผู้หยั่งรู้ตัวจริง → true · ไม่ร่วมกัด (กัดสำเร็จแม้ p2 ไม่ร่วม)', () => {
    const g = makeGame(ROLES);
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p4'] }, p2: { kind: 'investigate_sorcerer', targets: ['p3'] } });
    expect(results(g, 'p2').some((t) => t.includes('เป็นผู้หยั่งรู้'))).toBe(true);
    expect(alive(g, 'p4')).toBe(false);
  });

  it('ตรวจคนที่ไม่ใช่ผู้หยั่งรู้ → false', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'investigate_sorcerer', targets: ['p4'] } });
    expect(results(g, 'p2').some((t) => t.includes('ไม่ใช่ผู้หยั่งรู้'))).toBe(true);
  });
});

describe('ผู้หยั่งรู้ฝ่ายหมาป่า', () => {
  // p1 ผู้หยั่งรู้ฝ่ายหมาป่า · p2 ผู้หยั่งรู้ (หมู่บ้าน) · p3-p5 ชาวบ้าน
  const ROLES = ['wolf_seer', 'seer', 'villager', 'villager', 'villager'];

  it('ตื่น 2 ช่อง (30 กัด → 32 ตรวจ) ร่วมกัดได้ด้วย', () => {
    const g = makeGame(ROLES);
    act(g, { type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p3'] });
    act(g, { type: 'advance' }); // → ช่อง 32
    act(g, { type: 'night_action', actorId: 'p1', kind: 'investigate_wolfseer', targets: ['p2'] });
    flushNight(g); // เดินช่อง 32 → 40 (ผู้หยั่งรู้) จนจบคืน
    expect(alive(g, 'p3')).toBe(false);
  });

  it('ตรวจบทจริงของเป้าหมายได้เต็มๆ', () => {
    const g = makeGame(ROLES);
    act(g, { type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p3'] });
    act(g, { type: 'advance' });
    act(g, { type: 'night_action', actorId: 'p1', kind: 'investigate_wolfseer', targets: ['p2'] });
    flushNight(g);
    const v = buildView(g.s, 'p1')!;
    expect(v.privateResults.some((r) => r.textTh.includes('ผู้หยั่งรู้'))).toBe(true);
  });
});

describe('หมาป่าอัลฟ่า', () => {
  // p1 หมาป่าอัลฟ่า · p2-p5 ชาวบ้าน
  const ROLES = ['alpha_wolf', 'villager', 'villager', 'villager', 'villager'];

  it('เปลี่ยนเป้าหมายเป็นหมาป่าตอนจบคืนถัดไป ไม่ใช่คืนนี้ทันที', () => {
    const g = makeGame(ROLES);
    act(g, { type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p5'] });
    act(g, { type: 'advance' });
    act(g, { type: 'night_action', actorId: 'p1', kind: 'alpha_convert', targets: ['p2'] });
    flushNight(g);
    expect(g.s.phase).toBe('morning');
    expect(g.s.players.find((p) => p.id === 'p2')!.team).toBe('village'); // ยังไม่แปลงคืนนี้
    skipDay(g);
    expect(g.s.phase).toBe('night');
    flushNight(g);
    expect(g.s.players.find((p) => p.id === 'p2')!.team).toBe('wolf');
    expect(g.s.players.find((p) => p.id === 'p2')!.roleId).toBe('werewolf');
  });

  it('ใช้ได้ครั้งเดียวตลอดเกม (ค่าเริ่มต้น alphaUsed=false)', () => {
    const g = makeGame(ROLES);
    expect(g.s.players[0].roleState.alphaUsed).toBe(false);
  });

  it('เลือกตัวเองไม่ได้ (เป็นหมาป่าอยู่แล้ว ไม่ใช่ฝ่ายหมู่บ้าน)', () => {
    const g = makeGame(ROLES);
    const r = applyAction(g.s, { type: 'night_action', actorId: 'p1', kind: 'alpha_convert', targets: ['p1'] });
    expect(r.error).toBeTruthy();
  });
});

describe('หมาป่าแพร่เชื้อ', () => {
  // p1 หมาป่าแพร่เชื้อ · p2 หมาป่า · p3-p6 ชาวบ้าน (6 คน 2 หมาป่า)
  const ROLES = ['infectious_wolf', 'werewolf', 'villager', 'villager', 'villager', 'villager'];

  it('เลือกแพร่เชื้อ → คืนนั้นไม่มีใครตาย แม้อีกตัวจะโหวตกัดคนอื่น', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p1: { kind: 'infect', targets: ['p3'] },
      p2: { kind: 'wolf_bite', targets: ['p4'] },
    });
    expect(g.s.players.every((p) => p.alive)).toBe(true);
    expect(results(g, 'p3').some((t) => t.includes('แพร่เชื้อ'))).toBe(true);
  });

  it('ผู้ติดเชื้อยังไม่เปลี่ยนฝ่ายทันที — แปลงตอนจบคืนที่ 2 ถัดจากคืนที่ติดเชื้อ', () => {
    const g = makeGame(ROLES);
    playNight(g, { p1: { kind: 'infect', targets: ['p3'] } }); // จบคืนที่ 1 (ติดเชื้อ)
    expect(g.s.players.find((p) => p.id === 'p3')!.team).toBe('village');
    skipDay(g);
    flushNight(g); // จบคืนที่ 2 — ยังไม่แปลง
    expect(g.s.players.find((p) => p.id === 'p3')!.team).toBe('village');
    skipDay(g);
    flushNight(g); // จบคืนที่ 3 (2 คืนถัดจากคืนที่ 1) — แปลงแล้ว
    expect(g.s.players.find((p) => p.id === 'p3')!.team).toBe('wolf');
  });

  it('ใช้ได้ครั้งเดียวตลอดเกม (ค่าเริ่มต้น infectUsed=false)', () => {
    const g = makeGame(ROLES);
    expect(g.s.players[0].roleState.infectUsed).toBe(false);
  });
});

describe('ลูกหมาป่า', () => {
  // p1 ลูกหมาป่า · p2 หมาป่า · p3-p7 ชาวบ้าน (7 คน 2 หมาป่า — มีพื้นที่ให้ตายได้หลายรอบก่อนเกมจบ)
  const ROLES = ['wolf_cub', 'werewolf', 'villager', 'villager', 'villager', 'villager', 'villager'];

  it('ลูกหมาป่าตายจากโหวต → คืนถัดไปฝูงฆ่าได้ 2 คน (ถ้ามีเสียงที่สอง)', () => {
    const g = makeGame(ROLES);
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p3'] }, p2: { kind: 'wolf_bite', targets: ['p3'] } });
    expect(alive(g, 'p3')).toBe(false);
    playDay(g, { p4: 'p1', p5: 'p1' }, { p2: 'p1', p4: 'p1', p5: 'p1', p6: 'p1', p7: 'p1' });
    expect(g.s.players.find((p) => p.id === 'p1')!.alive).toBe(false);
    expect(g.s.packExtraKill).toBe(true);
    expect(g.s.phase).toBe('execution');
    act(g, { type: 'advance' }); // execution → night
    expect(g.s.phase).toBe('night');
    act(g, { type: 'night_action', actorId: 'p2', kind: 'wolf_bite', targets: ['p4'] });
    flushNight(g);
    expect(g.s.phase).toBe('morning');
    expect(g.s.players.find((p) => p.id === 'p4')!.alive).toBe(false); // ตายจากเป้าหมายเดียว (ไม่มีหมาป่าอีกตัวเสนอเป้าที่สอง)
    expect(g.s.packExtraKill).toBe(false); // ใช้แล้วเคลียร์
  });
});
