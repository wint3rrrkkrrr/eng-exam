// หมาป่าผู้บดบัง: สั่งบดบังโหวต → ไม่มีใครเห็นว่าใครโหวตใคร (คะแนนยังนับ) + ประกาศ "โหวตนี้ถูกหมาป่าแทรกแซง"
import { describe, expect, it } from 'vitest';
import { act, makeGame, mustAct, playNight, type Game } from './testUtils';
import { buildView, VEILED } from '../view';

// p1 หมาป่าผู้บดบัง · p2 หมาป่า · p3..p9 ชาวบ้าน
const ROLES = ['veil_wolf', 'werewolf', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager'];

const bite = (veil: boolean) => ({
  p1: { kind: 'wolf_bite' as const, targets: ['p9'], meta: veil ? { veil: true } : undefined },
  p2: { kind: 'wolf_bite' as const, targets: ['p9'] },
});

function dayToVote(g: Game, a = 'p4', b = 'p6'): void {
  mustAct(g, { type: 'advance' }); // discussion
  mustAct(g, { type: 'advance', timedOut: true }); // nomination
  mustAct(g, { type: 'nominate', actorId: 'p3', targetId: a });
  mustAct(g, { type: 'nominate', actorId: 'p5', targetId: b });
  mustAct(g, { type: 'advance', timedOut: true }); // defense
  mustAct(g, { type: 'advance', timedOut: true }); // vote
  expect(g.s.phase).toBe('vote');
}

describe('บดบังโหวต', () => {
  it('ไม่สั่งบดบัง → โหวตเปิดตามปกติ ไม่มีประกาศ', () => {
    const g = makeGame(ROLES);
    playNight(g, bite(false));
    dayToVote(g);
    expect(g.s.voteVeiled).toBe(false);
    expect(g.events.some((e) => e.kind === 'vote_veiled')).toBe(false);
    mustAct(g, { type: 'vote', actorId: 'p3', targetId: 'p4' });
    expect(buildView(g.s, 'p7')!.liveVotes).toEqual({ p3: 'p4' });
  });

  it('สั่งบดบังคืนนี้ → โหวตวันถัดไปถูกบดบัง + ประกาศสาธารณะ (ไม่บอกว่าใครทำ)', () => {
    const g = makeGame(ROLES);
    playNight(g, bite(true));
    expect(g.s.veilNext).toBe(true);
    expect(g.s.players[0].roleState.veilLeft).toBe(0); // ใช้ไป 1 ครั้ง
    dayToVote(g);
    expect(g.s.voteVeiled).toBe(true);
    const ann = g.events.find((e) => e.kind === 'vote_veiled')!;
    expect(ann.public).toBe(true);
    expect(JSON.stringify(ann)).not.toContain('p1'); // ไม่เผยตัวผู้ทำ
    expect(g.events.some((e) => e.kind === 'veil_set' && !e.public)).toBe(true); // เก็บเป็นบันทึกลับ
  });

  it('ระหว่างโหวตที่ถูกบดบัง: เห็นแค่ว่าใครโหวตแล้ว ไม่เห็นว่าโหวตใคร (ยกเว้นของตัวเอง)', () => {
    const g = makeGame(ROLES);
    playNight(g, bite(true));
    dayToVote(g);
    mustAct(g, { type: 'vote', actorId: 'p7', targetId: 'p4' });
    mustAct(g, { type: 'vote', actorId: 'p8', targetId: null });

    const other = buildView(g.s, 'p3')!;
    expect(other.voteVeiled).toBe(true);
    expect(other.liveVotes).toEqual({ p7: VEILED, p8: VEILED });
    expect(JSON.stringify(other)).not.toContain('"p7":"p4"');

    const mine = buildView(g.s, 'p7')!;
    expect(mine.liveVotes).toEqual({ p7: 'p4', p8: VEILED }); // ของตัวเองเห็นเสมอ
    expect(mine.myVote).toBe('p4');
  });

  it('ผลโหวตสาธารณะมีแต่คะแนนรวม ไม่มีรายชื่อผู้โหวต · คะแนนยังนับตามปกติ · ผู้ถูกโหวตออกยังตายตามผล', () => {
    const g = makeGame(ROLES);
    playNight(g, bite(true));
    dayToVote(g);
    for (const v of ['p3', 'p5', 'p7']) mustAct(g, { type: 'vote', actorId: v, targetId: 'p4' });
    mustAct(g, { type: 'vote', actorId: 'p8', targetId: 'p6' });
    mustAct(g, { type: 'advance', timedOut: true });

    const result = g.events.find((e) => e.kind === 'vote_result')!;
    expect(result.public).toBe(true);
    expect(result.data.veiled).toBe(true);
    expect(result.data.tally).toEqual({ p4: 3, p6: 1 });
    expect(result.data.votes).toBeUndefined();
    const detail = g.events.find((e) => e.kind === 'vote_result_detail')!;
    expect(detail.public).toBe(false);
    expect(detail.data.votes).toMatchObject({ p3: 'p4', p8: 'p6' });
    expect(g.s.players.find((p) => p.id === 'p4')!.alive).toBe(false);
  });

  it('บดบังมีผลแค่โหวตเดียว: โหวตครั้งถัดไปกลับเปิดตามปกติ', () => {
    const g = makeGame(ROLES);
    playNight(g, bite(true));
    dayToVote(g);
    mustAct(g, { type: 'vote', actorId: 'p3', targetId: 'p4' });
    mustAct(g, { type: 'advance', timedOut: true }); // → execution
    mustAct(g, { type: 'advance' }); // → คืนที่ 2
    expect(g.s.voteVeiled).toBe(false);
    playNight(g, {});
    dayToVote(g, 'p7', 'p8'); // วันที่ 2 (p4 ถูกโหวตออกไปแล้ว)
    expect(g.s.voteVeiled).toBe(false);
    mustAct(g, { type: 'vote', actorId: 'p3', targetId: 'p7' });
    expect(buildView(g.s, 'p5')!.liveVotes).toEqual({ p3: 'p7' });
  });

  it('ใช้ได้ 1 ครั้งต่อเกม: คืนถัดไปสั่งบดบังอีกไม่ได้ และปุ่มบดบังหายจากมุมมอง', () => {
    const g = makeGame(ROLES);
    expect(buildView(g.s, 'p1')!.myTurn.extra).toEqual({ canVeil: true });
    playNight(g, bite(true));
    mustAct(g, { type: 'advance' });
    mustAct(g, { type: 'advance', timedOut: true });
    mustAct(g, { type: 'advance', timedOut: true }); // ไม่มีใครเสนอ → คืนที่ 2
    expect(g.s.phase).toBe('night');
    expect(buildView(g.s, 'p1')!.myTurn.extra).toBeUndefined();
    const r = act(g, { type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p8'], meta: { veil: true } });
    expect(r.error?.code).toBe('no_veil');
  });

  it('หมาป่าธรรมดา/ชาวบ้านสั่งบดบังไม่ได้ และไม่เห็นปุ่มบดบัง', () => {
    const g = makeGame(ROLES);
    expect(buildView(g.s, 'p2')!.myTurn.extra).toBeUndefined();
    const r = act(g, { type: 'night_action', actorId: 'p2', kind: 'wolf_bite', targets: ['p9'], meta: { veil: true } });
    expect(r.error?.code).toBe('no_veil');
    expect(g.s.veilNext).toBe(false);
  });

  it('หมาป่าผู้บดบังร่วมกัดกับฝูงได้ตามปกติ (ฝูงเลือกตรงกัน → เหยื่อตาย)', () => {
    const g = makeGame(ROLES);
    playNight(g, bite(true));
    expect(g.s.players.find((p) => p.id === 'p9')!.alive).toBe(false);
  });

  it('ปิดกระดานสด (liveVotes=false) + บดบัง → ไม่ส่งอะไรเพิ่มเกินของตัวเอง', () => {
    const g = makeGame(ROLES, { liveVotes: false });
    playNight(g, bite(true));
    dayToVote(g);
    mustAct(g, { type: 'vote', actorId: 'p3', targetId: 'p4' });
    expect(buildView(g.s, 'p7')!.liveVotes).toBeNull();
    expect(buildView(g.s, 'p7')!.voteVeiled).toBe(true); // ยังรู้ว่าถูกบดบัง (ประกาศสาธารณะ)
  });
});
