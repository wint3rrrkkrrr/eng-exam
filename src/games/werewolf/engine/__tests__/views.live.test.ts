// กระดานโหวตสด: ระหว่างโหวต ทุกคนเห็นว่าใครโหวตใคร "ทันที" (เมื่อเปิดตัวเลือก liveVotes) · ปิดแล้วเห็นแค่ของตัวเอง
import { describe, expect, it } from 'vitest';
import { makeGame, mustAct, playNight, type Game } from './testUtils';
import { buildView } from '../view';

const ROLES = ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager', 'villager'];

function toVotePhase(settings = {}): Game {
  const g = makeGame(ROLES, settings);
  playNight(g, {});
  mustAct(g, { type: 'advance' }); // discussion
  mustAct(g, { type: 'advance', timedOut: true }); // nomination
  mustAct(g, { type: 'nominate', actorId: 'p1', targetId: 'p3' });
  mustAct(g, { type: 'nominate', actorId: 'p2', targetId: 'p4' });
  mustAct(g, { type: 'advance', timedOut: true }); // defense
  mustAct(g, { type: 'advance', timedOut: true }); // vote
  expect(g.s.phase).toBe('vote');
  return g;
}

describe('คะแนนโหวตสด (liveVotes)', () => {
  it('เปิด (ค่าเริ่มต้น): ทุกคนเห็นใครโหวตใครทันที แม้ตัวเองยังไม่โหวต', () => {
    const g = toVotePhase();
    expect(buildView(g.s, 'p5')!.liveVotes).toEqual({});
    mustAct(g, { type: 'vote', actorId: 'p1', targetId: 'p3' });
    mustAct(g, { type: 'vote', actorId: 'p6', targetId: null });
    for (const viewer of ['p5', 'p7', 'p1']) {
      expect(buildView(g.s, viewer)!.liveVotes).toEqual({ p1: 'p3', p6: null });
    }
  });

  it('ปิด: ได้แค่โหวตของตัวเอง ไม่เห็นของคนอื่น', () => {
    const g = toVotePhase({ liveVotes: false });
    mustAct(g, { type: 'vote', actorId: 'p6', targetId: 'p4' }); // p6 ไม่ได้เป็นผู้เสนอชื่อ จึงไม่ปนกับข้อมูลเสนอชื่อที่เปิดเผยอยู่แล้ว
    const other = buildView(g.s, 'p5')!;
    expect(other.liveVotes).toBeNull();
    expect(JSON.stringify(other)).not.toContain('"p6":"p4"');
    expect(buildView(g.s, 'p6')!.myVote).toBe('p4');
  });

  it('นอกช่วงโหวต → ไม่มีกระดาน (null) แม้เปิดตัวเลือก', () => {
    const g = makeGame(ROLES);
    expect(buildView(g.s, 'p3')!.liveVotes).toBeNull();
    const day = toVotePhase();
    mustAct(day, { type: 'advance', timedOut: true }); // → ผลโหวต
    expect(day.s.phase).toBe('execution');
    expect(buildView(day.s, 'p3')!.liveVotes).toBeNull();
  });

  it('เห็นเฉพาะ "ใครโหวตใคร" ไม่รั่วบท/ฝ่ายของผู้โหวต', () => {
    const g = toVotePhase();
    mustAct(g, { type: 'vote', actorId: 'p1', targetId: 'p3' }); // p1 หมาป่า
    const json = JSON.stringify(buildView(g.s, 'p5'));
    expect(json).not.toContain('"role":"werewolf"');
  });
});
