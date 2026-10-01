// ท่อประมวลผลกลางคืน: หมอ/ผู้คุ้มกัน/แม่มด × การกัดของหมาป่า (RULES ข้อ 6 + ตาราง 11.2)
import { describe, expect, it } from 'vitest';
import { act, alive, makeGame, mustAct, playNight } from './testUtils';
import { buildView } from '../view';

// p1 หมาป่า · p2 หมอ · p3 แม่มด · p4-p5 ชาวบ้าน · p6 ผู้หยั่งรู้ · p7 ชาวบ้าน
const ROLES = ['werewolf', 'doctor', 'witch', 'villager', 'villager', 'seer', 'villager'];

describe('หมอ × หมาป่า', () => {
  it('หมาป่ากัด p4 โดยไม่มีใครกัน → p4 ตาย และสาเหตุสาธารณะไม่เผยว่าถูกกัด', () => {
    const g = makeGame(ROLES);
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p4'] } });
    expect(alive(g, 'p4')).toBe(false);
    expect(g.s.phase).toBe('morning');
    const view = buildView(g.s, 'p5')!;
    expect(view.publicPlayers.find((p) => p.playerId === 'p4')!.deathCause).toBe('night');
  });

  it('หมอกัน p4 → p4 รอด', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p1: { kind: 'wolf_bite', targets: ['p4'] },
      p2: { kind: 'protect_doctor', targets: ['p4'] },
    });
    expect(alive(g, 'p4')).toBe(true);
    const morning = g.events.find((e) => e.kind === 'morning')!;
    expect(morning.data.nobodyDied).toBe(true);
  });

  it('หมอกัน p4 + แม่มดชุบ p4 → p4 รอด และแม่มดได้ยาชุบคืน (ค่าเริ่มต้น)', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p1: { kind: 'wolf_bite', targets: ['p4'] },
      p2: { kind: 'protect_doctor', targets: ['p4'] },
      p3: { kind: 'witch', meta: { heal: true } },
    });
    expect(alive(g, 'p4')).toBe(true);
    expect(g.s.players[2].roleState.heal).toBe(1);
  });

  it('ตั้งค่า "เสียยาไปเลย" → หมอกันแล้วแม่มดชุบ ยาหมด', () => {
    const g = makeGame(ROLES, { witchRefundOnProtected: false });
    playNight(g, {
      p1: { kind: 'wolf_bite', targets: ['p4'] },
      p2: { kind: 'protect_doctor', targets: ['p4'] },
      p3: { kind: 'witch', meta: { heal: true } },
    });
    expect(g.s.players[2].roleState.heal).toBe(0);
  });

  it('แม่มดชุบ p4 (ไม่มีใครกัน) → p4 รอด ยาชุบหมด', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p1: { kind: 'wolf_bite', targets: ['p4'] },
      p3: { kind: 'witch', meta: { heal: true } },
    });
    expect(alive(g, 'p4')).toBe(true);
    expect(g.s.players[2].roleState.heal).toBe(0);
  });

  it('หมาป่ากัด p4 + แม่มดวางยา p4 → p4 ตาย (ครั้งเดียว) สาเหตุจริงคือถูกกัด', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p1: { kind: 'wolf_bite', targets: ['p4'] },
      p3: { kind: 'witch', meta: { poisonId: 'p4' } },
    });
    expect(alive(g, 'p4')).toBe(false);
    expect(g.s.players[3].deathCause).toBe('wolf');
    expect(g.events.filter((e) => e.kind === 'death' && e.data.playerId === 'p4')).toHaveLength(1);
    expect(g.s.players[2].roleState.poison).toBe(0);
  });

  it('หมอกัน p4 + แม่มดวางยา p4 → p4 ตาย (หมอกันพิษไม่ได้)', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p2: { kind: 'protect_doctor', targets: ['p4'] },
      p3: { kind: 'witch', meta: { poisonId: 'p4' } },
    });
    expect(alive(g, 'p4')).toBe(false);
    expect(g.s.players[3].deathCause).toBe('poison');
  });

  it('แม่มดใช้ยาชุบ+พิษในคืนเดียวได้ (ค่าเริ่มต้น) / ปิดสวิตช์แล้วใช้ไม่ได้', () => {
    const on = makeGame(ROLES);
    playNight(on, {
      p1: { kind: 'wolf_bite', targets: ['p4'] },
      p3: { kind: 'witch', meta: { heal: true, poisonId: 'p5' } },
    });
    expect(alive(on, 'p4')).toBe(true);
    expect(alive(on, 'p5')).toBe(false);

    const off = makeGame(ROLES, { witchBothSameNight: false });
    expect(() =>
      playNight(off, {
        p1: { kind: 'wolf_bite', targets: ['p4'] },
        p3: { kind: 'witch', meta: { heal: true, poisonId: 'p5' } },
      }),
    ).toThrow(/both_potions/);
  });

  it('แม่มดเห็นเหยื่อของฝูง แต่คนอื่นไม่เห็น', () => {
    const g = makeGame(ROLES);
    // เดินถึงช่องแม่มด (50): ช่อง 20 หมอ, 30 หมาป่า, 40 ผู้หยั่งรู้
    mustAct(g, { type: 'advance' }); // ช่อง 2? ไม่มีคิวปิด — ช่องแรกคือหมอ
    const roleSlot = (id: string) => buildView(g.s, id)!.myTurn;
    expect(roleSlot('p2').isMyTurn).toBe(true); // หมอ
    mustAct(g, { type: 'night_action', actorId: 'p2', kind: 'skip' });
    mustAct(g, { type: 'advance' });
    mustAct(g, { type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p4'] });
    mustAct(g, { type: 'advance' }); // ปิดช่องหมาป่า
    mustAct(g, { type: 'night_action', actorId: 'p6', kind: 'investigate_seer', targets: ['p1'] });
    mustAct(g, { type: 'advance' });
    const witchTurn = roleSlot('p3');
    expect(witchTurn.isMyTurn).toBe(true);
    expect(witchTurn.extra?.victimId).toBe('p4');
    expect(JSON.stringify(buildView(g.s, 'p5'))).not.toContain('"victimId"');
    expect(JSON.stringify(buildView(g.s, 'p6'))).not.toContain('"victimId"');
  });
});

describe('หมอ — กฎการเลือกเป้าหมาย', () => {
  it('กันคนเดิมซ้ำสองคืนติดไม่ได้ (ค่าเริ่มต้น)', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'protect_doctor', targets: ['p4'] } });
    expect(g.s.phase).toBe('morning');
    mustAct(g, { type: 'advance' }); // discussion
    mustAct(g, { type: 'advance', timedOut: true }); // nomination
    mustAct(g, { type: 'advance', timedOut: true }); // ไม่มีใครเสนอ → คืนที่ 2
    expect(g.s.phase).toBe('night');
    mustAct(g, { type: 'advance' }); // เข้าช่องหมอ
    const r = act(g, { type: 'night_action', actorId: 'p2', kind: 'protect_doctor', targets: ['p4'] });
    expect(r.error?.code).toBe('bad_target');
    expect(act(g, { type: 'night_action', actorId: 'p2', kind: 'protect_doctor', targets: ['p5'] }).error).toBeUndefined();
  });

  it('กันตัวเองได้ (ค่าเริ่มต้น) / ปิดสวิตช์แล้วกันไม่ได้', () => {
    const g1 = makeGame(ROLES);
    mustAct(g1, { type: 'advance' });
    expect(act(g1, { type: 'night_action', actorId: 'p2', kind: 'protect_doctor', targets: ['p2'] }).error).toBeUndefined();

    const g2 = makeGame(ROLES, { doctorSelfProtect: false });
    mustAct(g2, { type: 'advance' });
    expect(act(g2, { type: 'night_action', actorId: 'p2', kind: 'protect_doctor', targets: ['p2'] }).error?.code).toBe('bad_target');
  });
});

describe('ผู้คุ้มกัน', () => {
  // p1 หมาป่า · p2 ผู้คุ้มกัน · p3 หมอ · p4.. ชาวบ้าน
  const BG = ['werewolf', 'bodyguard', 'doctor', 'villager', 'villager', 'villager', 'villager'];

  it('คุ้ม p4 ที่ถูกกัด → p4 รอด ผู้คุ้มกันตายแทน', () => {
    const g = makeGame(BG);
    playNight(g, {
      p1: { kind: 'wolf_bite', targets: ['p4'] },
      p2: { kind: 'protect_bodyguard', targets: ['p4'] },
    });
    expect(alive(g, 'p4')).toBe(true);
    expect(alive(g, 'p2')).toBe(false);
    expect(g.s.players[1].deathCause).toBe('bodyguard');
  });

  it('หมอกันก่อนผู้คุ้มกัน → ไม่มีใครตาย', () => {
    const g = makeGame(BG);
    playNight(g, {
      p1: { kind: 'wolf_bite', targets: ['p4'] },
      p2: { kind: 'protect_bodyguard', targets: ['p4'] },
      p3: { kind: 'protect_doctor', targets: ['p4'] },
    });
    expect(alive(g, 'p4')).toBe(true);
    expect(alive(g, 'p2')).toBe(true);
  });

  it('คุ้มตัวเองไม่ได้', () => {
    const g = makeGame(BG);
    mustAct(g, { type: 'advance' }); // หมอ (ช่อง 20)
    mustAct(g, { type: 'night_action', actorId: 'p3', kind: 'skip' });
    mustAct(g, { type: 'advance' }); // ผู้คุ้มกัน (ช่อง 21)
    expect(act(g, { type: 'night_action', actorId: 'p2', kind: 'protect_bodyguard', targets: ['p2'] }).error?.code).toBe('bad_target');
  });
});

describe('คืนแรก', () => {
  it('ตั้งค่า "คืนแรกฆ่าไม่ได้" → หมาป่ากัดคืนแรกไม่มีผล', () => {
    const g = makeGame(ROLES, { firstNightKill: false });
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p4'] } });
    expect(alive(g, 'p4')).toBe(true);
  });

  it('ฝูงเลือกไม่ตรงกัน → ไม่มีใครตาย (ค่าเริ่มต้น) / สุ่ม (ตั้งค่า)', () => {
    const W = ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager'];
    const none = makeGame(W);
    playNight(none, { p1: { kind: 'wolf_bite', targets: ['p3'] }, p2: { kind: 'wolf_bite', targets: ['p4'] } });
    expect(none.s.players.filter((p) => !p.alive)).toHaveLength(0);

    const rnd = makeGame(W, { wolfDisagree: 'random' });
    playNight(rnd, { p1: { kind: 'wolf_bite', targets: ['p3'] }, p2: { kind: 'wolf_bite', targets: ['p4'] } });
    expect(rnd.s.players.filter((p) => !p.alive)).toHaveLength(1);
  });

  it('หมาป่ากัดหมาป่าด้วยกันไม่ได้', () => {
    const W = ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager'];
    const g = makeGame(W);
    mustAct(g, { type: 'advance' }); // ช่องหมาป่า (ไม่มีหมอ/คิวปิดในชุดนี้ → ช่องแรกคือหมาป่า)
    expect(act(g, { type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p2'] }).error?.code).toBe('bad_target');
  });
});
