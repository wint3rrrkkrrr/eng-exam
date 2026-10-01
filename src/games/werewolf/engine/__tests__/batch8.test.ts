// M6 แพ็ก #8: บทพิเศษที่เหลือ — ผู้ลอกเลียนแบบ · เด็กป่าหลงทาง · มนุษย์ป่า
import { describe, expect, it } from 'vitest';
import { alive, makeGame, playDay, playNight } from './testUtils';
import { applyAction } from '../reducer';
import { currentSlot } from '../night';
import { buildView } from '../view';

const act = (g: ReturnType<typeof makeGame>, a: Parameters<typeof applyAction>[1]) => {
  const r = applyAction(g.s, a);
  if (r.error) throw new Error(`${a.type}: ${r.error.code}`);
  g.s = r.state;
};
const skipDay = (g: ReturnType<typeof makeGame>) => playDay(g, {}, {});

describe('ผู้ลอกเลียนแบบ', () => {
  // p1 ผู้ลอกเลียนแบบ · p2 แม่มด · p3 หมาป่า · p4-p6 ชาวบ้าน
  const ROLES = ['doppelganger', 'witch', 'werewolf', 'villager', 'villager', 'villager'];

  it('ลอกแม่มด → กลายเป็นแม่มดทันที ได้ยาครบชุดของตัวเอง และใช้ได้คืนนี้เลย', () => {
    const g = makeGame(ROLES);
    expect(currentSlot(g.s)!.slot).toBe(1);
    act(g, { type: 'night_action', actorId: 'p1', kind: 'copy_role', targets: ['p2'] });
    expect(g.s.players[0].roleId).toBe('witch');
    expect(g.s.players[0].team).toBe('village');
    expect(g.s.players[0].roleState.heal).toBe(1);
    expect(g.s.players[0].roleState.poison).toBe(1);
    act(g, { type: 'advance' });
    expect(currentSlot(g.s)!.slot).toBe(30); // หมาป่า (p3) — มาก่อนช่องแม่มด
    act(g, { type: 'night_action', actorId: 'p3', kind: 'skip' });
    act(g, { type: 'advance' });
    expect(currentSlot(g.s)!.slot).toBe(50); // ช่องแม่มด
    expect(currentSlot(g.s)!.actors).toEqual(expect.arrayContaining(['p1', 'p2']));
    act(g, { type: 'night_action', actorId: 'p1', kind: 'witch', meta: { heal: false, poisonId: 'p4' } });
    act(g, { type: 'night_action', actorId: 'p2', kind: 'witch', meta: { heal: false } }); // แม่มดตัวจริงก็ยังอยู่ในช่องเดียวกัน
    act(g, { type: 'advance' });
    expect(g.s.phase).toBe('morning');
    expect(alive(g, 'p4')).toBe(false); // p1 วางยาพิษสำเร็จในคืนเดียวกับที่ลอกบท
  });

  it('ลอกหมาป่า → กลายเป็นหมาป่าทันที ร่วมกัดคืนนี้ได้เลย', () => {
    const g = makeGame(['doppelganger', 'werewolf', 'villager', 'villager', 'villager', 'villager']);
    act(g, { type: 'night_action', actorId: 'p1', kind: 'copy_role', targets: ['p2'] });
    expect(g.s.players[0].team).toBe('wolf');
    act(g, { type: 'advance' });
    expect(currentSlot(g.s)!.slot).toBe(30);
    act(g, { type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p3'] });
    act(g, { type: 'night_action', actorId: 'p2', kind: 'wolf_bite', targets: ['p3'] });
    act(g, { type: 'advance' });
    expect(g.s.phase).toBe('morning');
    expect(alive(g, 'p3')).toBe(false);
  });

  it('ลอกบทที่มีความสามารถคืนแรก (เด็กป่า) → เลือกต้นแบบได้คืนนี้เลยที่ช่อง 3', () => {
    const g = makeGame(['doppelganger', 'wild_child', 'werewolf', 'villager', 'villager', 'villager']);
    act(g, { type: 'night_action', actorId: 'p1', kind: 'copy_role', targets: ['p2'] });
    expect(g.s.players[0].roleId).toBe('wild_child');
    act(g, { type: 'advance' });
    expect(currentSlot(g.s)!.slot).toBe(3);
    expect(currentSlot(g.s)!.actors).toEqual(expect.arrayContaining(['p1', 'p2']));
    act(g, { type: 'night_action', actorId: 'p1', kind: 'pick_model', targets: ['p4'] });
    act(g, { type: 'night_action', actorId: 'p2', kind: 'pick_model', targets: ['p5'] });
    act(g, { type: 'advance' }); // → ช่อง 30 (หมาป่า)
    act(g, { type: 'night_action', actorId: 'p3', kind: 'skip' });
    act(g, { type: 'advance' }); // จบคืน — ประมวลผล pick_model แล้ว
    expect(g.s.players[0].roleState.modelId).toBe('p4');
    expect(g.s.players[1].roleState.modelId).toBe('p5');
  });

  it('เลือกตัวเอง/คนตายไม่ได้', () => {
    const g = makeGame(ROLES);
    expect(applyAction(g.s, { type: 'night_action', actorId: 'p1', kind: 'copy_role', targets: ['p1'] }).error).toBeTruthy();
  });

  it('ได้ผลลับแจ้งว่าบทที่ลอกคืออะไร', () => {
    const g = makeGame(ROLES);
    act(g, { type: 'night_action', actorId: 'p1', kind: 'copy_role', targets: ['p2'] });
    const v = buildView(g.s, 'p1')!;
    expect(v.privateResults.some((r) => r.textTh.includes('แม่มด'))).toBe(true);
  });
});

describe('เด็กป่าหลงทาง', () => {
  // p1 หมาป่า · p2 เด็กป่าหลงทาง · p3-p6 ชาวบ้าน
  const ROLES = ['werewolf', 'wild_child', 'villager', 'villager', 'villager', 'villager'];

  it('ต้นแบบยังไม่ตาย → ยังเป็นฝ่ายหมู่บ้านตามปกติ', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'pick_model', targets: ['p3'] }, p1: { kind: 'wolf_bite', targets: ['p4'] } });
    expect(g.s.players.find((p) => p.id === 'p2')!.team).toBe('village');
  });

  it('ต้นแบบถูกกัดตาย → กลายเป็นหมาป่าทันที (คืนเดียวกัน ไม่ต้องรอข้ามคืน)', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'pick_model', targets: ['p3'] }, p1: { kind: 'wolf_bite', targets: ['p3'] } });
    expect(alive(g, 'p3')).toBe(false);
    const p2 = g.s.players.find((p) => p.id === 'p2')!;
    expect(p2.team).toBe('wolf');
    expect(p2.roleId).toBe('werewolf');
  });

  it('ต้นแบบตายจากโหวต → ก็แปลงเป็นหมาป่าเหมือนกัน', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'pick_model', targets: ['p3'] } });
    playDay(g, { p1: 'p3', p4: 'p3' }, { p1: 'p3', p2: 'p3', p4: 'p3', p5: 'p3', p6: 'p3' });
    expect(alive(g, 'p3')).toBe(false);
    expect(g.s.players.find((p) => p.id === 'p2')!.team).toBe('wolf');
  });

  it('แปลงแล้วร่วมกัดกับฝูงได้ทันทีในคืนถัดไป', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'pick_model', targets: ['p3'] }, p1: { kind: 'wolf_bite', targets: ['p3'] } });
    skipDay(g);
    act(g, { type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p4'] });
    act(g, { type: 'night_action', actorId: 'p2', kind: 'wolf_bite', targets: ['p4'] });
    act(g, { type: 'advance' });
    expect(alive(g, 'p4')).toBe(false);
    expect(g.s.phase).toBe('game_over'); // เหลือ 2 หมาป่า (p1,p2) vs 2 ชาวบ้าน (p5,p6) → ชนะพอดี
    expect(g.s.winners![0].team).toBe('wolf');
  });

  it('เลือกต้นแบบได้คืนแรกเท่านั้น (ใช้ครั้งเดียว)', () => {
    const g = makeGame(ROLES);
    expect(g.s.players.find((p) => p.id === 'p2')!.roleState.modelId).toBeNull();
  });
});

describe('มนุษย์ป่า', () => {
  // p1 หมาป่า · p2 มนุษย์ป่า · p3-p6 ชาวบ้าน — ใช้กลไกเดียวกับเด็กป่า
  const ROLES = ['werewolf', 'sasquatch', 'villager', 'villager', 'villager', 'villager'];

  it('ต้นแบบตาย → กลายเป็นหมาป่าทันที', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'pick_model', targets: ['p3'] }, p1: { kind: 'wolf_bite', targets: ['p3'] } });
    expect(g.s.players.find((p) => p.id === 'p2')!.team).toBe('wolf');
  });

  it('เด็กป่าและมนุษย์ป่าเลือกต้นแบบคนละคนได้ในเกมเดียวกัน', () => {
    const g = makeGame(['werewolf', 'wild_child', 'sasquatch', 'villager', 'villager', 'villager']);
    playNight(g, {
      p2: { kind: 'pick_model', targets: ['p4'] },
      p3: { kind: 'pick_model', targets: ['p5'] },
      p1: { kind: 'wolf_bite', targets: ['p6'] },
    });
    expect(g.s.players.find((p) => p.id === 'p2')!.roleState.modelId).toBe('p4');
    expect(g.s.players.find((p) => p.id === 'p3')!.roleState.modelId).toBe('p5');
  });
});
