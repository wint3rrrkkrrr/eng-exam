// คู่รัก: จับคู่คืนแรก · ตายตามทุกกรณี · ไม่วนซ้ำ (RULES ข้อ 6 ขั้น 8)
import { describe, expect, it } from 'vitest';
import { act, alive, makeGame, mustAct, playNight } from './testUtils';
import { buildView } from '../view';

// p1 หมาป่า · p2 ผู้จับคู่รัก · p3 ผู้หยั่งรู้ · p4,p5,p6 ชาวบ้าน · p7 แม่มด · p8 หมอ
const ROLES = ['werewolf', 'cupid', 'seer', 'villager', 'villager', 'villager', 'witch', 'doctor'];

describe('ผู้จับคู่รัก', () => {
  it('จับคู่ p4,p5 → ทั้งคู่ได้ข้อความรู้ว่าอีกฝ่ายคือใคร (ไม่รู้บท)', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'cupid_pair', targets: ['p4', 'p5'] } });
    const v4 = buildView(g.s, 'p4')!;
    expect(v4.lover).toBe('p5');
    expect(v4.privateResults[0].textTh).toContain('ผู้เล่น5');
    expect(JSON.stringify(v4)).not.toContain('"role":"cupid"');
    expect(buildView(g.s, 'p6')!.lover).toBeNull();
  });

  it('p4 ถูกหมาป่ากัด → p4 และ p5 ตายทั้งคู่ (ตายครั้งเดียวต่อคน)', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p2: { kind: 'cupid_pair', targets: ['p4', 'p5'] },
      p1: { kind: 'wolf_bite', targets: ['p4'] },
    });
    expect(alive(g, 'p4')).toBe(false);
    expect(alive(g, 'p5')).toBe(false);
    expect(g.s.players[4].deathCause).toBe('lover');
    expect(g.events.filter((e) => e.kind === 'death')).toHaveLength(2);
  });

  it('p4 ถูกกัด + แม่มดวางยา p5 (คู่รักกัน) → ตายสองคน ไม่วนซ้ำ', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p2: { kind: 'cupid_pair', targets: ['p4', 'p5'] },
      p1: { kind: 'wolf_bite', targets: ['p4'] },
      p7: { kind: 'witch', meta: { poisonId: 'p5' } },
    });
    expect(g.events.filter((e) => e.kind === 'death')).toHaveLength(2);
  });

  it('หมอกัน p4 ที่ถูกกัด → ไม่มีใครตาย คู่รักปลอดภัย', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p2: { kind: 'cupid_pair', targets: ['p4', 'p5'] },
      p1: { kind: 'wolf_bite', targets: ['p4'] },
      p8: { kind: 'protect_doctor', targets: ['p4'] },
    });
    expect(g.s.players.filter((p) => !p.alive)).toHaveLength(0);
  });

  it('เลือกตัวเองเป็นคู่รักได้ (ค่าเริ่มต้น) / ปิดสวิตช์แล้วไม่ได้', () => {
    const on = makeGame(ROLES);
    expect(act(on, { type: 'night_action', actorId: 'p2', kind: 'cupid_pair', targets: ['p2', 'p4'] }).error).toBeUndefined();
    const off = makeGame(ROLES, { cupidSelf: false });
    expect(act(off, { type: 'night_action', actorId: 'p2', kind: 'cupid_pair', targets: ['p2', 'p4'] }).error?.code).toBe('bad_target');
  });

  it('เลือกคนเดียวกันซ้ำ หรือเลือกไม่ครบสองคน → ปฏิเสธ', () => {
    const g = makeGame(ROLES);
    expect(act(g, { type: 'night_action', actorId: 'p2', kind: 'cupid_pair', targets: ['p4', 'p4'] }).error?.code).toBe('dup_target');
    expect(act(g, { type: 'night_action', actorId: 'p2', kind: 'cupid_pair', targets: ['p4'] }).error?.code).toBe('bad_target_count');
  });

  it('คิวปิดทำงานเฉพาะคืนแรก — คืนที่ 2 ไม่มีช่องคิวปิด', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'cupid_pair', targets: ['p4', 'p5'] } });
    mustAct(g, { type: 'advance' }); // discussion
    mustAct(g, { type: 'advance', timedOut: true });
    mustAct(g, { type: 'advance', timedOut: true }); // ไม่มีใครเสนอ → คืนที่ 2
    expect(g.s.dayNumber).toBe(2);
    expect(g.s.night!.slots.some((s) => s.roleIds.includes('cupid'))).toBe(false);
  });
});
