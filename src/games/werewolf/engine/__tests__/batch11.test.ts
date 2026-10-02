// M6 แพ็กสุดท้าย: นักเลียนแบบ (ยืมความสามารถข้ามคืน) + ผู้ควบคุมเวลา (ปรับเวลาอภิปราย)
import { describe, expect, it } from 'vitest';
import { alive, makeGame, playDay, playNight } from './testUtils';
import { applyAction } from '../reducer';
import { buildView } from '../view';
import { pendingSlotFor } from '../night';

const act = (g: ReturnType<typeof makeGame>, a: Parameters<typeof applyAction>[1]) => {
  const r = applyAction(g.s, a);
  if (r.error) throw new Error(`${a.type}: ${r.error.code}`);
  g.s = r.state;
  g.events.push(...r.events);
};
const tryAct = (g: ReturnType<typeof makeGame>, a: Parameters<typeof applyAction>[1]) => {
  const r = applyAction(g.s, a);
  if (!r.error) { g.s = r.state; g.events.push(...r.events); }
  return r;
};
const skipDay = (g: ReturnType<typeof makeGame>) => playDay(g, {}, {});
const texts = (g: ReturnType<typeof makeGame>, id: string) => buildView(g.s, id)!.privateResults.map((r) => r.textTh).join('\n');

describe('นักเลียนแบบ', () => {
  // p1 นักเลียนแบบ · p2 หมอ · p3 หมาป่า · p4 แม่มด · p5-p7 ชาวบ้าน
  const ROLES = ['copycat', 'doctor', 'werewolf', 'witch', 'villager', 'villager', 'villager'];

  it('ยืมหมอ: ยังไม่ได้ใช้คืนนี้ — คืนถัดไปกันคนได้ และกันการกัดสำเร็จ', () => {
    const g = makeGame(ROLES);
    // คืน 1: ยังไม่มีความสามารถของหมอ
    expect(tryAct(g, { type: 'night_action', actorId: 'p1', kind: 'protect_doctor', targets: ['p5'] }).error?.code).toBe('not_your_role'); // ยังไม่ได้ความสามารถที่ยืม
    playNight(g, { p1: { kind: 'borrow', targets: ['p2'] } });
    expect(texts(g, 'p1')).toContain('ยืมความสามารถของ "หมอ"');
    expect(g.s.players[0].roleState.borrowedRole).toBe('doctor');
    expect(g.s.players[0].team).toBe('solo'); // ไม่ได้ฝ่ายของบทที่ยืม
    skipDay(g);
    // คืน 2: มีช่องของหมอ (20) และช่องยืม (6)
    act(g, { type: 'night_action', actorId: 'p1', kind: 'protect_doctor', targets: ['p5'] });
    act(g, { type: 'night_action', actorId: 'p3', kind: 'wolf_bite', targets: ['p5'] });
    for (const id of ['p1', 'p2', 'p4']) if (pendingSlotFor(g.s, id)) act(g, { type: 'night_action', actorId: id, kind: 'skip' });
    act(g, { type: 'advance', timedOut: true });
    expect(alive(g, 'p5')).toBe(true);
  });

  it('ยืมแม่มด: ได้ยาของตัวเอง ใช้พิษได้ · สลับไปบทอื่นแล้วยืมกลับมา → ไม่ได้ยาเพิ่ม', () => {
    const g = makeGame(ROLES);
    playNight(g, { p1: { kind: 'borrow', targets: ['p4'] } });
    expect(g.s.players[0].roleState.poison).toBe(1);
    expect(g.s.players[0].roleState.heal).toBe(1);
    skipDay(g);
    // คืน 2: ใช้ยาพิษที่ยืมมา แล้วยืมบทอื่น (หมอ) แทน
    act(g, { type: 'night_action', actorId: 'p1', kind: 'witch', meta: { poisonId: 'p5' } });
    act(g, { type: 'night_action', actorId: 'p1', kind: 'borrow', targets: ['p2'] });
    for (const p of g.s.players) if (pendingSlotFor(g.s, p.id)) act(g, { type: 'night_action', actorId: p.id, kind: 'skip' });
    act(g, { type: 'advance', timedOut: true });
    expect(alive(g, 'p5')).toBe(false);
    expect(g.s.players[0].roleState.borrowedRole).toBe('doctor');
    expect(g.s.players[0].roleState.poison).toBeUndefined(); // ยาของแม่มดถูกเก็บไว้ ไม่ติดตัวขณะยืมหมอ
    skipDay(g);
    // คืน 3: ยืมแม่มดกลับมา → ได้ "จำนวนที่เหลือ" เดิม (พิษใช้ไปแล้ว = 0) ไม่ได้ยาใหม่
    act(g, { type: 'night_action', actorId: 'p1', kind: 'borrow', targets: ['p4'] });
    for (const p of g.s.players) if (pendingSlotFor(g.s, p.id)) act(g, { type: 'night_action', actorId: p.id, kind: 'skip' });
    act(g, { type: 'advance', timedOut: true });
    expect(g.s.players[0].roleState.borrowedRole).toBe('witch');
    expect(g.s.players[0].roleState.poison).toBe(0);
    expect(g.s.players[0].roleState.heal).toBe(1);
  });

  it('ยืมบทที่ยืมไม่ได้ (ชาวบ้าน) → ได้ข้อความว่าไม่มีให้ยืม และคงของเดิม', () => {
    const g = makeGame(ROLES);
    playNight(g, { p1: { kind: 'borrow', targets: ['p5'] } });
    expect(texts(g, 'p1')).toContain('ไม่มีความสามารถกลางคืนให้ยืม');
    expect(g.s.players[0].roleState.borrowedRole).toBeUndefined();
  });

  it('ยืมหมาป่า: ร่วมเลือกเหยื่อกับฝูงได้ในคืนถัดไป แต่ไม่ได้อยู่ฝ่ายหมาป่า', () => {
    const g = makeGame(ROLES);
    playNight(g, { p1: { kind: 'borrow', targets: ['p3'] } });
    expect(g.s.players[0].team).toBe('solo');
    skipDay(g);
    act(g, { type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p6'] });
    act(g, { type: 'night_action', actorId: 'p3', kind: 'wolf_bite', targets: ['p6'] });
    for (const id of g.s.players.map((p) => p.id)) if (pendingSlotFor(g.s, id)) act(g, { type: 'night_action', actorId: id, kind: 'skip' });
    act(g, { type: 'advance', timedOut: true });
    expect(alive(g, 'p6')).toBe(false);
  });

  it('ยืมบทใหม่ทุกคืนได้ — ของเก่าถูกแทนที่ · เลือกตัวเอง/คนตายไม่ได้', () => {
    const g = makeGame(ROLES);
    expect(tryAct(g, { type: 'night_action', actorId: 'p1', kind: 'borrow', targets: ['p1'] }).error?.code).toBe('bad_target');
    playNight(g, { p1: { kind: 'borrow', targets: ['p2'] } });
    skipDay(g);
    act(g, { type: 'night_action', actorId: 'p1', kind: 'borrow', targets: ['p4'] });
    for (const p of g.s.players) if (pendingSlotFor(g.s, p.id)) act(g, { type: 'night_action', actorId: p.id, kind: 'skip' });
    act(g, { type: 'advance', timedOut: true });
    expect(g.s.players[0].roleState.borrowedRole).toBe('witch');
    expect(g.s.players[0].roleState.heal).toBe(1);
  });

  it('รอดชีวิตจนเกมจบ = ชนะร่วม (ไม่ใช่ผู้ชนะหลัก)', () => {
    const g = makeGame(['copycat', 'werewolf', 'villager', 'villager', 'villager', 'villager']);
    playNight(g, { p2: { kind: 'wolf_bite', targets: ['p3'] } });
    skipDay(g);
    playNight(g, { p2: { kind: 'wolf_bite', targets: ['p4'] } });
    skipDay(g);
    for (let i = 0; i < 6 && g.s.phase !== 'game_over'; i++) {
      const victim = g.s.players.find((p) => p.alive && p.id !== 'p1' && p.id !== 'p2')!;
      if (g.s.phase === 'night') playNight(g, { p2: { kind: 'wolf_bite', targets: [victim.id] } });
      if ((g.s.phase as string) !== 'game_over') skipDay(g);
    }
    expect(g.s.phase).toBe('game_over');
    const w = g.s.winners!;
    expect(w.some((x) => x.team === 'solo' && x.playerIds.includes('p1') && !x.main)).toBe(true);
  });
});

describe('ผู้ควบคุมเวลา', () => {
  // p1 ผู้ควบคุมเวลา · p2 หมาป่า · p3-p6 ชาวบ้าน
  const ROLES = ['time_lord', 'werewolf', 'villager', 'villager', 'villager', 'villager'];

  it('ปรับเวลาได้ 2 ครั้งทั้งเกม (เพิ่ม/ลดผสมได้) ครั้งที่ 3 ถูกปฏิเสธ · ประกาศโดยไม่ระบุตัวผู้ปรับ', () => {
    const g = makeGame(ROLES);
    playNight(g, {});
    act(g, { type: 'advance' }); // → discussion
    expect(g.s.phase).toBe('discussion');
    act(g, { type: 'time_adjust', actorId: 'p1', direction: 'more' });
    expect(g.s.timeAdjust).toBe('more');
    g.s.timeAdjust = null; // เซิร์ฟเวอร์อ่านธงแล้วเคลียร์
    act(g, { type: 'time_adjust', actorId: 'p1', direction: 'less' });
    g.s.timeAdjust = null;
    expect(g.s.players[0].roleState.timeUses).toBe(0);
    expect(tryAct(g, { type: 'time_adjust', actorId: 'p1', direction: 'more' }).error?.code).toBe('no_uses');
    const evs = g.events.filter((e) => e.kind === 'time_adjusted');
    expect(evs).toHaveLength(2);
    expect(JSON.stringify(evs)).not.toContain('p1'); // ไม่เปิดเผยตัวผู้ปรับ
    expect(evs.every((e) => e.public)).toBe(true);
  });

  it('ปรับได้เฉพาะช่วงอภิปราย · เฉพาะผู้ควบคุมเวลา · ผู้ตายปรับไม่ได้', () => {
    const g = makeGame(ROLES);
    expect(tryAct(g, { type: 'time_adjust', actorId: 'p1', direction: 'more' }).error?.code).toBe('wrong_phase'); // กลางคืน
    playNight(g, {});
    act(g, { type: 'advance' });
    expect(tryAct(g, { type: 'time_adjust', actorId: 'p3', direction: 'more' }).error?.code).toBe('not_your_role');
    g.s.players[0].alive = false;
    expect(tryAct(g, { type: 'time_adjust', actorId: 'p1', direction: 'more' }).error?.code).toBe('dead');
  });
});
