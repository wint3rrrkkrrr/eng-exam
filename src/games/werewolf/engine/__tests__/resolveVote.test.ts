// เสนอชื่อ + โหวต: เสมอทั้ง 4 แบบ · ผู้ใหญ่บ้าน 2 · ผู้รักสันติ 0 · คนโง่ · เจ้าชาย · คนฟอก
import { describe, expect, it } from 'vitest';
import { act, alive, makeGame, mustAct, playDay, playNight } from './testUtils';

// p1,p2 หมาป่า · p3 ชาวบ้าน · p4 ชาวบ้าน · p5 ชาวบ้าน · p6 ชาวบ้าน · p7 ชาวบ้าน · p8 ชาวบ้าน · p9 ชาวบ้าน
const PLAIN = ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager'];

function day1(roles: string[], settings = {}) {
  const g = makeGame(roles, settings);
  playNight(g, {});
  return g;
}

describe('เสนอชื่อ', () => {
  it('เสนอตัวเองไม่ได้ · เสนอซ้ำไม่ได้ · เสนอผิดช่วงไม่ได้', () => {
    const g = day1(PLAIN);
    expect(act(g, { type: 'nominate', actorId: 'p3', targetId: 'p4' }).error?.code).toBe('wrong_phase');
    mustAct(g, { type: 'advance' });
    mustAct(g, { type: 'advance', timedOut: true });
    expect(g.s.phase).toBe('nomination');
    expect(act(g, { type: 'nominate', actorId: 'p3', targetId: 'p3' }).error?.code).toBe('self_nominate');
    mustAct(g, { type: 'nominate', actorId: 'p3', targetId: 'p4' });
    expect(act(g, { type: 'nominate', actorId: 'p3', targetId: 'p5' }).error?.code).toBe('already_nominated');
  });

  it('ผู้ถูกเสนอสูงสุด 3 คน เรียงตามจำนวนเสนอ แล้วตามเวลา', () => {
    const g = day1(PLAIN);
    playDay(g, { p1: 'p3', p2: 'p4', p5: 'p6', p6: 'p7', p7: 'p3', p8: 'p3', p9: 'p4' }, {});
    // ไม่ได้โหวต → ไม่มีใครตาย แต่ต้องมี candidates ครบ 3
    expect(g.events.find((e) => e.kind === 'nominees')!.data.candidates).toEqual(['p3', 'p4', 'p6']);
  });

  it('ไม่มีใครถูกเสนอ → ข้ามโหวตไปกลางคืนถัดไปทันที', () => {
    const g = day1(PLAIN);
    playDay(g, {}, {});
    expect(g.s.phase).toBe('night');
    expect(g.s.dayNumber).toBe(2);
  });
});

describe('นับคะแนน', () => {
  it('คะแนนสูงสุดถูกกำจัด', () => {
    const g = day1(PLAIN);
    playDay(g, { p1: 'p3', p2: 'p4' }, { p1: 'p3', p2: 'p3', p5: 'p3', p6: 'p4' });
    expect(alive(g, 'p3')).toBe(false);
    expect(g.s.lastExecution).toEqual({ id: 'p3', outcome: 'executed' });
  });

  it('ทุกคนงดออกเสียง → ไม่มีใครตาย', () => {
    const g = day1(PLAIN);
    playDay(g, { p1: 'p3' }, { p1: null, p2: null });
    expect(g.s.lastExecution?.outcome).toBe('no_votes');
    expect(g.s.players.filter((p) => !p.alive)).toHaveLength(0);
  });

  it('โหวตได้เฉพาะผู้ถูกเสนอชื่อ · โหวตซ้ำไม่ได้ · คนตายโหวตไม่ได้', () => {
    const g = day1(PLAIN);
    mustAct(g, { type: 'advance' });
    mustAct(g, { type: 'advance', timedOut: true });
    mustAct(g, { type: 'nominate', actorId: 'p1', targetId: 'p3' });
    mustAct(g, { type: 'advance', timedOut: true });
    mustAct(g, { type: 'advance', timedOut: true });
    expect(g.s.phase).toBe('vote');
    expect(act(g, { type: 'vote', actorId: 'p4', targetId: 'p5' }).error?.code).toBe('bad_target');
    mustAct(g, { type: 'vote', actorId: 'p4', targetId: 'p3' });
    expect(act(g, { type: 'vote', actorId: 'p4', targetId: 'p3' }).error?.code).toBe('already_voted');
  });

  it('ผู้ใหญ่บ้านนับ 2 คะแนน · ผู้รักสันตินับ 0', () => {
    const R = ['werewolf', 'werewolf', 'mayor', 'pacifist', 'villager', 'villager', 'villager', 'villager', 'villager'];
    const g = day1(R);
    // p3 (ผู้ใหญ่บ้าน) โหวต p5 = 2 · p4 (ผู้รักสันติ) โหวต p6 = 0 · p7 โหวต p6 = 1 · p8 โหวต p6 = 1 ... p6 = 2, p5 = 2 → เสมอ
    playDay(g, { p1: 'p5', p2: 'p6' }, { p3: 'p5', p4: 'p6', p7: 'p6' });
    // p5 = 2 (ผู้ใหญ่บ้าน) · p6 = 0 + 1 = 1 → p5 ถูกกำจัด
    expect(alive(g, 'p5')).toBe(false);
    expect(alive(g, 'p6')).toBe(true);
  });

  it('ผู้รักสันติโหวตเดี่ยวๆ ไม่ทำให้ใครถูกกำจัด', () => {
    const R = ['werewolf', 'werewolf', 'pacifist', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager'];
    const g = day1(R);
    playDay(g, { p1: 'p4' }, { p3: 'p4' });
    expect(g.s.lastExecution?.outcome).toBe('no_votes');
  });
});

describe('เสียงเสมอ', () => {
  const votes = { p3: 'p4', p5: 'p6' }; // p4 = 1, p6 = 1 → เสมอ
  const noms = { p1: 'p4', p2: 'p6' };

  it('none (ค่าเริ่มต้น) → ไม่มีใครตาย', () => {
    const g = day1(PLAIN);
    playDay(g, noms, votes);
    expect(g.s.lastExecution?.outcome).toBe('tie');
    expect(g.s.players.filter((p) => !p.alive)).toHaveLength(0);
  });

  it('random → ตายหนึ่งคนจากผู้ที่เสมอ · ผลคงที่ด้วย seed เดิม', () => {
    const run = () => {
      const g = makeGame(PLAIN, { tieRule: 'random' }, 'tie-seed');
      playNight(g, {});
      playDay(g, noms, votes);
      return g.s.players.filter((p) => !p.alive).map((p) => p.id);
    };
    const r = run();
    expect(r).toHaveLength(1);
    expect(['p4', 'p6']).toContain(r[0]);
    expect(run()).toEqual(r);
  });

  it('revote → รอบสองเฉพาะผู้ที่เสมอ · ถ้ายังเสมอ = ไม่มีใครตาย', () => {
    const g = makeGame(PLAIN, { tieRule: 'revote' });
    playNight(g, {});
    playDay(g, noms, votes);
    expect(g.s.phase).toBe('vote');
    expect(g.s.voteRound).toBe(2);
    expect(g.s.candidates.sort()).toEqual(['p4', 'p6']);
    mustAct(g, { type: 'vote', actorId: 'p3', targetId: 'p4' });
    mustAct(g, { type: 'vote', actorId: 'p5', targetId: 'p6' });
    mustAct(g, { type: 'advance', timedOut: true });
    expect(g.s.lastExecution?.outcome).toBe('tie');
    expect(g.s.players.filter((p) => !p.alive)).toHaveLength(0);
  });

  it('revote รอบสองได้ผู้ชนะชัด → ถูกกำจัด', () => {
    const g = makeGame(PLAIN, { tieRule: 'revote' });
    playNight(g, {});
    playDay(g, noms, votes);
    mustAct(g, { type: 'vote', actorId: 'p3', targetId: 'p4' });
    mustAct(g, { type: 'vote', actorId: 'p5', targetId: 'p4' });
    mustAct(g, { type: 'vote', actorId: 'p7', targetId: 'p6' });
    mustAct(g, { type: 'advance', timedOut: true });
    expect(alive(g, 'p4')).toBe(false);
  });

  it('mayor → ผู้ใหญ่บ้านเลือกคนไหนในผู้ที่เสมอ คนนั้นตาย', () => {
    const R = ['werewolf', 'werewolf', 'mayor', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager'];
    const g = makeGame(R, { tieRule: 'mayor' });
    playNight(g, {});
    // ผู้ใหญ่บ้านนับ 2: p3→p4 (2) · p5→p6, p7→p6 (2) → เสมอ 2–2 → ผู้ใหญ่บ้านโหวต p4 → p4 ตาย
    playDay(g, noms, { p3: 'p4', p5: 'p6', p7: 'p6' });
    expect(alive(g, 'p4')).toBe(false);
    expect(alive(g, 'p6')).toBe(true);
  });
});

describe('คนโง่ประจำหมู่บ้าน / เจ้าชาย', () => {
  it('คนโง่ถูกโหวตครั้งแรก → ไม่ตาย เปิดบท เสียสิทธิ์โหวต · ครั้งที่สอง → ตาย', () => {
    const R = ['werewolf', 'werewolf', 'village_idiot', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager'];
    const g = day1(R);
    playDay(g, { p1: 'p3' }, { p1: 'p3', p2: 'p3', p4: 'p3' });
    expect(alive(g, 'p3')).toBe(true);
    expect(g.s.players[2].canVote).toBe(false);
    expect(g.s.players[2].revealedRole).toBe('village_idiot');
    expect(g.s.lastExecution?.outcome).toBe('idiot_survived');

    // วันถัดไป: คนโง่โหวตไม่ได้
    mustAct(g, { type: 'advance' }); // → คืนที่ 2
    playNight(g, {});
    mustAct(g, { type: 'advance' });
    mustAct(g, { type: 'advance', timedOut: true });
    mustAct(g, { type: 'nominate', actorId: 'p1', targetId: 'p3' });
    mustAct(g, { type: 'advance', timedOut: true });
    mustAct(g, { type: 'advance', timedOut: true });
    expect(act(g, { type: 'vote', actorId: 'p3', targetId: 'p3' }).error?.code).toBe('cannot_vote');
    mustAct(g, { type: 'vote', actorId: 'p1', targetId: 'p3' });
    mustAct(g, { type: 'advance', timedOut: true });
    expect(alive(g, 'p3')).toBe(false);
  });

  it('คนโง่ถูกกัด → ตายปกติ (รอดได้เฉพาะจากการโหวต)', () => {
    const R = ['werewolf', 'werewolf', 'village_idiot', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager'];
    const g = makeGame(R);
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p3'] }, p2: { kind: 'wolf_bite', targets: ['p3'] } });
    expect(alive(g, 'p3')).toBe(false);
  });

  it('เจ้าชายถูกโหวตครั้งแรกไม่ตาย ยังโหวตได้', () => {
    const R = ['werewolf', 'werewolf', 'prince', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager'];
    const g = day1(R);
    playDay(g, { p1: 'p3' }, { p1: 'p3', p2: 'p3' });
    expect(alive(g, 'p3')).toBe(true);
    expect(g.s.players[2].canVote).toBe(true);
    expect(g.s.players[2].revealedRole).toBe('prince');
    expect(g.s.lastExecution?.outcome).toBe('prince_survived');
  });
});

describe('คนฟอก', () => {
  const R = ['werewolf', 'werewolf', 'tanner', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager'];

  it('ถูกโหวตประหาร → คนฟอกชนะ เกมจบทันที', () => {
    const g = day1(R);
    playDay(g, { p1: 'p3' }, { p1: 'p3', p4: 'p3' });
    expect(g.s.phase).toBe('game_over');
    expect(g.s.winners![0]).toMatchObject({ team: 'solo', playerIds: ['p3'] });
  });

  it('ตั้งค่า "คนฟอกชนะแล้วเกมไม่จบ" → เกมเดินต่อ', () => {
    const g = makeGame(R, { tannerEndsGame: false });
    playNight(g, {});
    playDay(g, { p1: 'p3' }, { p1: 'p3', p4: 'p3' });
    expect(g.s.phase).toBe('execution');
    expect(alive(g, 'p3')).toBe(false);
  });

  it('ถูกหมาป่ากัดตาย → ไม่ชนะ', () => {
    const g = makeGame(R);
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p3'] }, p2: { kind: 'wolf_bite', targets: ['p3'] } });
    expect(alive(g, 'p3')).toBe(false);
    expect(g.s.winners).toBeNull();
  });
});
