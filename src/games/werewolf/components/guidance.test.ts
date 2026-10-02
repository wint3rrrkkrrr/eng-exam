import { describe, expect, it } from 'vitest';
import type { MyViewResponse } from '../shared/api';
import { FLOW, guidanceFor, phaseHelp, recentHighlights } from './guidance';

const names: Record<string, string> = { a: 'เอ', b: 'บี', c: 'ซี', me: 'ฉัน' };
const nameOf = (id: string) => names[id] ?? '?';

function mk(phase: string, over: Record<string, unknown> = {}, gameOver: Record<string, unknown> = {}): MyViewResponse {
  return {
    phase, spectator: false, log: [],
    players: [
      { playerId: 'me', isAlive: true, canVote: true, isSpectator: false },
      { playerId: 'a', isAlive: true, canVote: true, isSpectator: false },
      { playerId: 'b', isAlive: true, canVote: true, isSpectator: false },
    ],
    game: {
      dayNumber: 1, nominations: {}, candidates: [], liveVotes: null, skipDiscussion: null, myVote: undefined,
      me: { playerId: 'me', isAlive: true, canVote: true, roleNameTh: 'ชาวบ้าน' },
      myTurn: { isMyTurn: false, actionKind: null, promptTh: null, selectableTargets: [], targetCount: 0 },
      ...gameOver,
    },
    ...over,
  } as unknown as MyViewResponse;
}
const g = (v: MyViewResponse, hunter = false, gunner = false) => guidanceFor({ view: v, nameOf, hunterTurn: hunter, gunnerTurn: gunner });
const myTurn = { isMyTurn: true, actionKind: 'vote', promptTh: 'เลือกเหยื่อ', selectableTargets: ['a'], targetCount: 1 };

describe('คำแนะนำ "ตอนนี้ต้องทำอะไร"', () => {
  it('กลางคืน: ถึงตา = action บอกให้แตะการ์ด · ไม่ถึงตา = wait บอกว่าไม่มีอะไรต้องทำ', () => {
    const turn = g(mk('night', {}, { myTurn }));
    expect(turn.tone).toBe('action');
    expect(turn.title).toContain('เลือกเหยื่อ');
    const idle = g(mk('night'));
    expect(idle.tone).toBe('wait');
    expect(idle.title).toContain('ไม่มีอะไรต้องทำ');
  });

  it('เสนอชื่อ: ถึงตา → action + ความคืบหน้า · เสนอแล้ว → wait', () => {
    const t = g(mk('nomination', {}, { myTurn: { ...myTurn, actionKind: 'nominate' }, nominations: { a: 'b' } }));
    expect(t.tone).toBe('action');
    expect(t.progress).toEqual({ done: 1, total: 3, label: 'เสนอชื่อแล้ว' });
    expect(g(mk('nomination', {}, { nominations: { a: 'b', me: 'a' } })).tone).toBe('wait');
  });

  it('แก้ตัว: ถ้าเราถูกเสนอชื่อ → danger ให้แก้ตัว · ไม่ใช่ → info ระบุชื่อผู้แก้ตัว', () => {
    const mine = g(mk('defense', {}, { candidates: ['me', 'a'] }));
    expect(mine.tone).toBe('danger');
    expect(mine.title).toContain('แก้ตัว');
    const other = g(mk('defense', {}, { candidates: ['a', 'b'] }));
    expect(other.tone).toBe('info');
    expect(other.title).toContain('เอ');
  });

  it('โหวต: ถึงตา → action · โหวตแล้ว → wait พร้อมจำนวนที่โหวต · โหวตไม่ได้ → บอกชัด', () => {
    expect(g(mk('vote', {}, { myTurn })).tone).toBe('action');
    const done = g(mk('vote', {}, { liveVotes: { a: 'b', me: 'a' } }));
    expect(done.tone).toBe('wait');
    expect(done.progress).toMatchObject({ done: 2, total: 3 });
    const mute = g(mk('vote', {}, { me: { playerId: 'me', isAlive: true, canVote: false, roleNameTh: 'x' } }));
    expect(mute.title).toContain('โหวตไม่ได้');
  });

  it('อภิปราย: บอกให้พิมพ์คุยและโหวตข้ามได้ · มือปืนมีข้อความเพิ่ม', () => {
    const d = g(mk('discussion', {}, { skipDiscussion: { votes: 1, needed: 2, mine: false } }), false, true);
    expect(d.body).toContain('โหวตข้าม');
    expect(d.body).toContain('1/2');
    expect(d.body).toContain('มือปืน');
  });

  it('ตายแล้ว / นายพรานต้องยิง / ผู้ชม / จบเกม มีข้อความเฉพาะ และนายพรานมาก่อนทุกอย่าง', () => {
    const dead = mk('vote', {}, { me: { playerId: 'me', isAlive: false, canVote: false, roleNameTh: 'x' } });
    expect(g(dead).tone).toBe('dead');
    expect(g(dead, true).tone).toBe('danger'); // ตายแต่ต้องยิง
    expect(g(dead, true).title).toContain('นายพราน');
    expect(g(mk('vote', { spectator: true })).title).toContain('ผู้ชม');
    expect(g(mk('game_over')).tone).toBe('win');
  });

  it('ทุกเฟสที่ผู้เล่นเห็นมีคำอธิบายในแถบขั้นตอน', () => {
    for (const f of FLOW) expect(phaseHelp(f.phase).length, f.phase).toBeGreaterThan(10);
    expect(recentHighlights([], nameOf)).toEqual([]);
  });
});
