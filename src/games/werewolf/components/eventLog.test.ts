// ตัวแปลบันทึกเหตุการณ์สาธารณะ → ข้อความไทย (ไม่ซ้ำ ไม่รั่วความลับ)
import { describe, expect, it } from 'vitest';
import { currentGameEvents, formatEvent } from './eventLog';
import type { PublicLogEvent } from '../shared/api';

const names: Record<string, string> = { a: 'ส้ม', b: 'มิ้น', c: 'ฟ้า' };
const ctx = { nameOf: (id: string) => names[id] ?? '?' };
let seq = 0;
const ev = (kind: string, data: Record<string, unknown> = {}, phase = 'discussion'): PublicLogEvent => ({ id: ++seq, at: '2026-01-01T00:00:00Z', day: 1, phase, kind, data });

describe('formatEvent', () => {
  it('เช้า: ไม่มีผู้ตาย / มีผู้ตายพร้อมบทที่เปิดเผย', () => {
    expect(formatEvent(ev('morning', { deaths: [], nobodyDied: true }), ctx)[0]).toContain('ไม่มีผู้เสียชีวิต');
    const lines = formatEvent(ev('morning', { deaths: [{ playerId: 'a', revealedRole: 'seer' }, { playerId: 'b', revealedRole: null }] }), ctx);
    expect(lines).toEqual(['☀️ เมื่อคืน ส้ม เสียชีวิต (บท: ผู้หยั่งรู้)', '☀️ เมื่อคืน มิ้น เสียชีวิต']);
  });

  it('ตายเพราะหลุดการเชื่อมต่อ: ประกาศทันทีแม้เป็นช่วงกลางคืน', () => {
    const lines = formatEvent(ev('death', { playerId: 'c', cause: 'disconnect' }, 'night'), ctx);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('ฟ้า');
    expect(lines[0]).toContain('ขาดการเชื่อมต่อ');
  });

  it('ไม่ซ้ำ: ผู้ตายกลางคืน/เช้าอยู่ในสรุป "morning" แล้ว event "death" ของช่วงนั้นต้องไม่แสดงซ้ำ', () => {
    expect(formatEvent(ev('death', { playerId: 'a', cause: 'night' }, 'night'), ctx)).toEqual([]);
    expect(formatEvent(ev('death', { playerId: 'a', cause: 'hunter' }, 'morning'), ctx)).toEqual([]);
  });

  it('ตายจากโหวตแสดงครั้งเดียว (จาก death) ส่วน execution แบบ executed ไม่แสดงซ้ำ', () => {
    expect(formatEvent(ev('death', { playerId: 'a', cause: 'vote', revealedRole: 'hunter' }, 'execution'), ctx)).toEqual(['⚖️ หมู่บ้านโหวตกำจัด ส้ม (บท: นายพราน)']);
    expect(formatEvent(ev('execution', { playerId: 'a', outcome: 'executed' }), ctx)).toEqual([]);
  });

  it('คนตายตามคู่รัก/ถูกยิง (กลางวัน) แสดงสาเหตุ', () => {
    expect(formatEvent(ev('death', { playerId: 'b', cause: 'lover' }, 'execution'), ctx)[0]).toContain('ตายตามคู่รัก');
  });

  it('ผลโหวต: นับคะแนน + ใครโหวตใคร + งดออกเสียง', () => {
    const l = formatEvent(ev('vote_result', { tally: { a: 2, b: 1 }, votes: { b: 'a', c: 'a', a: 'b', x: null } }, 'vote'), { nameOf: (id) => names[id] ?? id });
    expect(l[0]).toContain('ส้ม 2 (มิ้น, ฟ้า)');
    expect(l[0]).toContain('มิ้น 1 (ส้ม)');
    expect(l[0]).toContain('งดออกเสียง: x');
  });

  it('เจ้าชาย/คนโง่รอดโหวต · เสมอ · ไม่มีใครโหวต', () => {
    expect(formatEvent(ev('execution', { playerId: 'a', outcome: 'prince_survived' }), ctx)[0]).toContain('เจ้าชาย');
    expect(formatEvent(ev('execution', { playerId: 'a', outcome: 'idiot_survived' }), ctx)[0]).toContain('คนโง่');
    expect(formatEvent(ev('execution', { playerId: null, outcome: 'tie' }), ctx)[0]).toContain('เสมอ');
    expect(formatEvent(ev('execution', { playerId: null, outcome: 'no_votes' }), ctx)[0]).toContain('ไม่มีใครโหวต');
  });

  it('เสนอชื่อ · ผู้ถูกเสนอ · นายพรานยิง · จบเกม', () => {
    expect(formatEvent(ev('nominate', { nominatorId: 'a', nomineeId: 'b' }), ctx)).toEqual(['🗳️ ส้ม เสนอชื่อ มิ้น']);
    expect(formatEvent(ev('nominees', { candidates: ['a', 'b'] }), ctx)).toEqual(['ผู้ถูกเสนอชื่อ: ส้ม, มิ้น']);
    expect(formatEvent(ev('hunter_shot', { hunterId: 'a', targetId: 'c' }), ctx)).toEqual(['🔫 นายพราน ส้ม ยิง ฟ้า']);
    expect(formatEvent(ev('game_over', { winners: [{ reasonTh: 'หมาป่าทุกตัวถูกกำจัดแล้ว' }] }), ctx)[0]).toContain('หมาป่าทุกตัวถูกกำจัดแล้ว');
  });

  it('โหวตถูกหมาป่าบดบัง: ประกาศ + ผลโหวตไม่มีชื่อผู้โหวต', () => {
    expect(formatEvent(ev('vote_veiled', {}, 'vote'), ctx)[0]).toContain('ถูกหมาป่าแทรกแซง');
    const l = formatEvent(ev('vote_result', { tally: { a: 3, b: 1 }, veiled: true }, 'vote'), ctx)[0];
    expect(l).toContain('ส้ม 3');
    expect(l).toContain('มิ้น 1');
    expect(l).toContain('ไม่เปิดเผยผู้โหวต');
  });

  it('เหตุการณ์ที่ไม่ต้องโชว์ (เริ่มเฟส/เริ่มเกม) → ไม่มีข้อความ', () => {
    for (const k of ['game_start', 'discussion_start', 'nomination_start', 'vote_start']) expect(formatEvent(ev(k), ctx)).toEqual([]);
  });
});

describe('currentGameEvents', () => {
  it('ตัดเหตุการณ์ของเกมรอบก่อนทิ้ง (เริ่มนับที่ game_start ล่าสุด)', () => {
    const log = [ev('night_start'), ev('game_start'), ev('night_start'), ev('game_start'), ev('morning')];
    const cur = currentGameEvents(log);
    expect(cur.map((e) => e.kind)).toEqual(['game_start', 'morning']);
  });
  it('ไม่มี game_start → คืนทั้งหมด', () => {
    const log = [ev('night_start'), ev('morning')];
    expect(currentGameEvents(log)).toHaveLength(2);
  });
});
