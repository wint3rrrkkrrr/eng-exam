// นายพราน: ตายทุกสาเหตุยิงได้ · ลูกโซ่ · ยิงหมาป่าตัวสุดท้าย → ชนะทันที
import { describe, expect, it } from 'vitest';
import { act, alive, makeGame, mustAct, playDay, playNight } from './testUtils';
import { buildView } from '../view';

// p1,p2 หมาป่า · p3 นายพราน · p4 ชาวบ้าน · p5 ชาวบ้าน · p6 ชาวบ้าน · p7 แม่มด · p8 ผู้จับคู่รัก
const ROLES = ['werewolf', 'werewolf', 'hunter', 'villager', 'villager', 'villager', 'witch', 'cupid'];

describe('นายพราน — ตายแล้วต้องยิง', () => {
  it('ถูกกัดตาย → เกมรอให้ยิงก่อนประกาศเช้า → ยิงหมาป่า p1', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p1: { kind: 'wolf_bite', targets: ['p3'] },
      p2: { kind: 'wolf_bite', targets: ['p3'] },
    });
    expect(alive(g, 'p3')).toBe(false);
    expect(g.s.pendingHunters).toEqual(['p3']);
    expect(g.events.some((e) => e.kind === 'morning')).toBe(false); // ยังไม่ประกาศเช้า

    const view = buildView(g.s, 'p3')!;
    expect(view.myTurn.actionKind).toBe('hunter_shot');
    expect(view.myTurn.selectableTargets).not.toContain('p3');

    mustAct(g, { type: 'hunter_shot', actorId: 'p3', targetId: 'p1' });
    expect(alive(g, 'p1')).toBe(false);
    expect(g.s.pendingHunters).toEqual([]);
    const morning = g.events.find((e) => e.kind === 'morning')!;
    expect((morning.data.deaths as unknown[]).length).toBe(2);
    expect(g.s.phase).toBe('morning');
  });

  it('ตายจากพิษแม่มด → ยิงได้', () => {
    const g = makeGame(ROLES);
    playNight(g, { p7: { kind: 'witch', meta: { poisonId: 'p3' } } });
    expect(g.s.pendingHunters).toEqual(['p3']);
  });

  it('ตายตามคู่รัก → ยิงได้', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p8: { kind: 'cupid_pair', targets: ['p3', 'p4'] },
      p1: { kind: 'wolf_bite', targets: ['p4'] },
      p2: { kind: 'wolf_bite', targets: ['p4'] },
    });
    expect(alive(g, 'p3')).toBe(false);
    expect(g.s.pendingHunters).toEqual(['p3']);
  });

  it('ตายจากการโหวต → ยิงได้', () => {
    const g = makeGame(ROLES);
    playNight(g, {});
    playDay(g, { p1: 'p3', p2: 'p3' }, { p1: 'p3', p2: 'p3', p4: 'p3', p5: 'p3' });
    expect(alive(g, 'p3')).toBe(false);
    expect(g.s.pendingHunters).toEqual(['p3']);
    mustAct(g, { type: 'hunter_shot', actorId: 'p3', targetId: 'p1' });
    expect(alive(g, 'p1')).toBe(false);
    // เล่นต่อได้: execution → คืนถัดไป
    mustAct(g, { type: 'advance' });
    expect(g.s.phase).toBe('night');
  });

  it('หมดเวลายังไม่ยิง → สุ่ม (ค่าเริ่มต้น) · ผลคงที่ด้วย seed เดิม', () => {
    const run = () => {
      const g = makeGame(ROLES, {}, 'seed-A');
      playNight(g, { p7: { kind: 'witch', meta: { poisonId: 'p3' } } });
      mustAct(g, { type: 'advance', timedOut: true });
      return g.s.players.filter((p) => !p.alive).map((p) => p.id).join(',');
    };
    const first = run();
    expect(first.split(',').length).toBe(2);
    expect(run()).toBe(first);
  });

  it('หมดเวลา + ตั้งค่า "ไม่ยิง" → ข้าม', () => {
    const g = makeGame(ROLES, { hunterTimeoutRandom: false });
    playNight(g, { p7: { kind: 'witch', meta: { poisonId: 'p3' } } });
    mustAct(g, { type: 'advance', timedOut: true });
    expect(g.s.pendingHunters).toEqual([]);
    expect(g.s.players.filter((p) => !p.alive)).toHaveLength(1);
    expect(g.events.some((e) => e.kind === 'hunter_skipped')).toBe(true);
  });

  it('ยิงคู่รัก → อีกคนตายตาม (ลูกโซ่)', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p8: { kind: 'cupid_pair', targets: ['p4', 'p5'] },
      p7: { kind: 'witch', meta: { poisonId: 'p3' } },
    });
    mustAct(g, { type: 'hunter_shot', actorId: 'p3', targetId: 'p4' });
    expect(alive(g, 'p4')).toBe(false);
    expect(alive(g, 'p5')).toBe(false);
  });

  it('ยิงนายพรานอีกคน → นายพรานคนนั้นต้องยิงต่อ', () => {
    const R = ['werewolf', 'werewolf', 'hunter', 'hunter', 'villager', 'villager', 'villager', 'witch'];
    const g = makeGame(R);
    playNight(g, { p8: { kind: 'witch', meta: { poisonId: 'p3' } } });
    expect(g.s.pendingHunters).toEqual(['p3']);
    mustAct(g, { type: 'hunter_shot', actorId: 'p3', targetId: 'p4' });
    expect(g.s.pendingHunters).toEqual(['p4']);
    expect(g.events.some((e) => e.kind === 'morning')).toBe(false);
    mustAct(g, { type: 'hunter_shot', actorId: 'p4', targetId: 'p2' });
    expect(g.s.pendingHunters).toEqual([]);
    expect(alive(g, 'p2')).toBe(false);
    expect(g.events.some((e) => e.kind === 'morning')).toBe(true);
  });

  it('นายพรานตายพร้อมกันสองคน (พิษ+ถูกกัด) → ยิงทีละคนตามลำดับ', () => {
    const R = ['werewolf', 'werewolf', 'hunter', 'hunter', 'villager', 'villager', 'villager', 'witch'];
    const g = makeGame(R);
    playNight(g, {
      p1: { kind: 'wolf_bite', targets: ['p3'] },
      p2: { kind: 'wolf_bite', targets: ['p3'] },
      p8: { kind: 'witch', meta: { poisonId: 'p4' } },
    });
    expect(g.s.pendingHunters).toEqual(['p3', 'p4']);
    expect(act(g, { type: 'hunter_shot', actorId: 'p4', targetId: 'p5' }).error?.code).toBe('not_your_turn');
  });

  it('ยิงหมาป่าตัวสุดท้าย → ชาวบ้านชนะทันที', () => {
    const R = ['werewolf', 'hunter', 'villager', 'villager', 'villager', 'witch', 'villager'];
    const g = makeGame(R);
    playNight(g, { p6: { kind: 'witch', meta: { poisonId: 'p2' } } });
    expect(g.s.winners).toBeNull(); // ยังรอนายพรานยิง
    mustAct(g, { type: 'hunter_shot', actorId: 'p2', targetId: 'p1' });
    expect(g.s.phase).toBe('game_over');
    expect(g.s.winners![0].team).toBe('village');
  });

  it('เกมไม่จบก่อนนายพรานยิง แม้จำนวนหมาป่าเท่ากับที่เหลือ', () => {
    // หมาป่า 2 · นายพราน 1 · ชาวบ้าน 2 · แม่มด 1 → ถ้านายพรานตาย เหลือ 2 หมาป่า vs 3 → ยังไม่จบ
    const R = ['werewolf', 'werewolf', 'hunter', 'villager', 'villager', 'witch', 'villager'];
    const g = makeGame(R);
    playNight(g, { p6: { kind: 'witch', meta: { poisonId: 'p3' } } });
    expect(g.s.phase).toBe('morning');
    expect(g.s.pendingHunters).toEqual(['p3']);
  });
});
