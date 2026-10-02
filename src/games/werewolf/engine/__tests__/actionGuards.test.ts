// ★ ป้องกันการโกง: ส่งแอคชันของบทที่ไม่ได้ถือ / ผิดเฟส / ผิดตา / ซ้ำ / เป้าหมายผิด → ต้องถูกปฏิเสธ และสถานะไม่เปลี่ยน
import { describe, expect, it } from 'vitest';
import { act, makeGame, mustAct, playNight } from './testUtils';
import { applyAction } from '../reducer';

// p1,p2 หมาป่า · p3 หมอ · p4 ผู้หยั่งรู้ · p5 แม่มด · p6 ชาวบ้าน · p7 นายพราน · p8 ชาวบ้าน · p9 ผู้จับคู่รัก
const ROLES = ['werewolf', 'werewolf', 'doctor', 'seer', 'witch', 'villager', 'hunter', 'villager', 'cupid'];

describe('การปฏิเสธแอคชันกลางคืน', () => {
  it('ชาวบ้านส่งคำสั่งกัด → not_your_role (หรือยังไม่ถึงตา) และไม่มีผลต่อเกม', () => {
    const g = makeGame(ROLES);
    const before = JSON.stringify(g.s);
    const r = act(g, { type: 'night_action', actorId: 'p6', kind: 'wolf_bite', targets: ['p3'] });
    expect(r.error).toBeDefined();
    expect(['not_your_turn', 'not_your_role']).toContain(r.error!.code);
    expect(JSON.stringify(g.s)).toBe(before);
  });

  it('กลางคืนทำพร้อมกัน: หมาป่ากัดได้ทันที แต่กัดหมาป่าด้วยกันไม่ได้ → bad_target', () => {
    const g = makeGame(ROLES);
    expect(act(g, { type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p2'] }).error?.code).toBe('bad_target');
    expect(act(g, { type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p6'] }).error).toBeUndefined();
  });

  it('ส่งแอคชันของบทอื่นในตาตัวเอง → not_your_role', () => {
    const g = makeGame(ROLES);
    mustAct(g, { type: 'night_action', actorId: 'p9', kind: 'cupid_pair', targets: ['p6', 'p8'] });
    mustAct(g, { type: 'advance' }); // → หมอ
    expect(act(g, { type: 'night_action', actorId: 'p3', kind: 'wolf_bite', targets: ['p6'] }).error?.code).toBe('not_your_role');
  });

  it('ส่งซ้ำในคืนเดียวกัน → already_acted', () => {
    const g = makeGame(ROLES);
    mustAct(g, { type: 'night_action', actorId: 'p9', kind: 'cupid_pair', targets: ['p6', 'p8'] });
    expect(act(g, { type: 'night_action', actorId: 'p9', kind: 'cupid_pair', targets: ['p4', 'p5'] }).error?.code).toBe('already_acted');
    expect(g.s.loverPairs).toEqual([['p6', 'p8']]);
  });

  it('ผู้ตายใช้ความสามารถไม่ได้', () => {
    const g = makeGame(ROLES);
    g.s.players[8].alive = false;
    expect(act(g, { type: 'night_action', actorId: 'p9', kind: 'cupid_pair', targets: ['p6', 'p8'] }).error?.code).toBe('dead');
  });

  it('เป้าหมายผิด: คนตาย · คนไม่มีอยู่ · จำนวนไม่ครบ', () => {
    const g = makeGame(ROLES);
    playNight(g, {}); // ผ่านคืน 1
    mustAct(g, { type: 'advance' });
    g.s.players[5].alive = false; // p6 ตาย
    mustAct(g, { type: 'advance', timedOut: true });
    mustAct(g, { type: 'advance', timedOut: true }); // → คืน 2
    expect(g.s.phase).toBe('night');
    // ช่องแรกคืน 2 = หมอ (p3)
    expect(act(g, { type: 'night_action', actorId: 'p3', kind: 'protect_doctor', targets: ['p6'] }).error?.code).toBe('bad_target');
    expect(act(g, { type: 'night_action', actorId: 'p3', kind: 'protect_doctor', targets: ['p99'] }).error?.code).toBe('bad_target');
    expect(act(g, { type: 'night_action', actorId: 'p3', kind: 'protect_doctor', targets: [] }).error?.code).toBe('bad_target_count');
  });

  it('แม่มดชุบตัวเองไม่ได้เมื่อปิดตั้งค่า / ยาชุบหมดแล้ว / วางยาพิษตัวเอง → ปฏิเสธ', () => {
    const g = makeGame(ROLES, { witchSelfHeal: false });
    expect(act(g, { type: 'night_action', actorId: 'p5', kind: 'witch', meta: { healId: 'p5' } }).error?.code).toBe('bad_heal');
    expect(act(g, { type: 'night_action', actorId: 'p5', kind: 'witch', meta: { poisonId: 'p5' } }).error?.code).toBe('bad_poison');
    g.s.players[4].roleState.heal = 0;
    expect(act(g, { type: 'night_action', actorId: 'p5', kind: 'witch', meta: { healId: 'p6' } }).error?.code).toBe('no_heal');
  });

  it('ยาพิษใช้ได้ครั้งเดียว: คืนถัดไปวางยาอีกไม่ได้', () => {
    const g = makeGame(ROLES);
    playNight(g, { p5: { kind: 'witch', meta: { poisonId: 'p6' } } });
    mustAct(g, { type: 'advance' });
    mustAct(g, { type: 'advance', timedOut: true });
    mustAct(g, { type: 'advance', timedOut: true });
    expect(g.s.phase).toBe('night');
    expect(act(g, { type: 'night_action', actorId: 'p5', kind: 'witch', meta: { poisonId: 'p8' } }).error?.code).toBe('bad_poison');
  });
});

describe('การปฏิเสธเฟสอื่น', () => {
  it('โหวต/เสนอชื่อ/ยิงในกลางคืน → wrong_phase / no_shot', () => {
    const g = makeGame(ROLES);
    expect(act(g, { type: 'vote', actorId: 'p6', targetId: null }).error?.code).toBe('wrong_phase');
    expect(act(g, { type: 'nominate', actorId: 'p6', targetId: 'p8' }).error?.code).toBe('wrong_phase');
    expect(act(g, { type: 'hunter_shot', actorId: 'p7', targetId: 'p6' }).error?.code).toBe('no_shot');
  });

  it('คนที่ไม่ใช่นายพรานยิงไม่ได้ · ยิงตัวเอง/ผู้ตายไม่ได้', () => {
    const g = makeGame(ROLES);
    playNight(g, { p5: { kind: 'witch', meta: { poisonId: 'p7' } } });
    expect(g.s.pendingHunters).toEqual(['p7']);
    expect(act(g, { type: 'hunter_shot', actorId: 'p6', targetId: 'p1' }).error?.code).toBe('not_your_turn');
    expect(act(g, { type: 'hunter_shot', actorId: 'p7', targetId: 'p7' }).error?.code).toBe('bad_target');
    g.s.players[0].alive = false;
    expect(act(g, { type: 'hunter_shot', actorId: 'p7', targetId: 'p1' }).error?.code).toBe('bad_target');
  });

  it('ขณะรอนายพรานยิง ไปต่อเฟสไม่ได้ (advance ไม่ทำให้เฟสเปลี่ยน)', () => {
    const g = makeGame(ROLES);
    playNight(g, { p5: { kind: 'witch', meta: { poisonId: 'p7' } } });
    const phase = g.s.phase;
    mustAct(g, { type: 'advance' });
    expect(g.s.phase).toBe(phase);
    expect(g.s.pendingHunters).toEqual(['p7']);
  });

  it('เกมจบแล้วไม่รับแอคชันใดๆ', () => {
    const R = ['werewolf', 'villager', 'villager', 'villager', 'villager', 'villager', 'witch'];
    const g = makeGame(R);
    playNight(g, { p7: { kind: 'witch', meta: { poisonId: 'p1' } } });
    expect(g.s.phase).toBe('game_over');
    expect(applyAction(g.s, { type: 'advance' }).error?.code).toBe('game_over');
  });
});

describe('การไม่แก้สถานะเดิม (pure)', () => {
  it('applyAction ไม่แก้ state ที่ส่งเข้าไป', () => {
    const g = makeGame(ROLES);
    const snapshot = JSON.stringify(g.s);
    applyAction(g.s, { type: 'night_action', actorId: 'p9', kind: 'cupid_pair', targets: ['p6', 'p8'] });
    expect(JSON.stringify(g.s)).toBe(snapshot);
  });
});
