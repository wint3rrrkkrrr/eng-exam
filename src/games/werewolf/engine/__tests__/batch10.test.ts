// กลางคืนเฟสเดียว ทุกบททำพร้อมกัน + แจ้งผู้ตาย/ผู้ถูกเปลี่ยนฝ่ายเป็นการส่วนตัว
import { describe, expect, it } from 'vitest';
import { alive, makeGame, playDay, playNight } from './testUtils';
import { applyAction } from '../reducer';
import { buildView } from '../view';
import { pendingSlotFor } from '../night';

const act = (g: ReturnType<typeof makeGame>, a: Parameters<typeof applyAction>[1]) => {
  const r = applyAction(g.s, a);
  if (r.error) throw new Error(`${a.type}: ${r.error.code}`);
  g.s = r.state;
};
const skipDay = (g: ReturnType<typeof makeGame>) => playDay(g, {}, {});
const flushNight = (g: ReturnType<typeof makeGame>) => { while (g.s.phase === 'night') act(g, { type: 'advance', timedOut: true }); };
const texts = (g: ReturnType<typeof makeGame>, id: string) => buildView(g.s, id)!.privateResults.map((r) => r.textTh).join('\n');

describe('กลางคืนเฟสเดียว ทำพร้อมกัน', () => {
  // p1,p2 หมาป่า · p3 หมอ · p4 ผู้หยั่งรู้ · p5 แม่มด · p6-p7 ชาวบ้าน
  const ROLES = ['werewolf', 'werewolf', 'doctor', 'seer', 'witch', 'villager', 'villager'];

  it('ทุกบทที่มีความสามารถมีตาของตัวเองพร้อมกันตั้งแต่ต้นคืน (ไม่ต้องรอคิว)', () => {
    const g = makeGame(ROLES);
    for (const id of ['p1', 'p2', 'p3', 'p4', 'p5']) {
      expect(buildView(g.s, id)!.myTurn.isMyTurn, id).toBe(true);
    }
    expect(buildView(g.s, 'p6')!.myTurn.isMyTurn).toBe(false);
  });

  it('ส่งแอคชันสลับลำดับอะไรก็ได้ — คืนไม่จบจนกว่าทุกคนส่งครบ แล้วจบทีเดียว', () => {
    const g = makeGame(ROLES);
    act(g, { type: 'night_action', actorId: 'p5', kind: 'skip' });
    act(g, { type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p6'] });
    act(g, { type: 'advance' });
    expect(g.s.phase).toBe('night');
    act(g, { type: 'night_action', actorId: 'p4', kind: 'investigate_seer', targets: ['p2'] });
    act(g, { type: 'night_action', actorId: 'p2', kind: 'wolf_bite', targets: ['p6'] });
    act(g, { type: 'night_action', actorId: 'p3', kind: 'protect_doctor', targets: ['p7'] });
    act(g, { type: 'advance' });
    expect(g.s.phase).toBe('morning');
    expect(alive(g, 'p6')).toBe(false);
  });

  it('คืนหมดเวลา: คนที่ไม่ส่ง = ข้าม แล้วประมวลผลเท่าที่ส่งมา', () => {
    const g = makeGame(ROLES);
    act(g, { type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p6'] });
    act(g, { type: 'night_action', actorId: 'p2', kind: 'wolf_bite', targets: ['p6'] });
    act(g, { type: 'advance', timedOut: true });
    expect(g.s.phase).toBe('morning');
    expect(alive(g, 'p6')).toBe(false);
  });

  it('คนที่ตายกลางคืน (หลุดการเชื่อมต่อ) ไม่ต้องรอ — ที่เหลือกดครบก็จบคืนได้เลย', () => {
    const g = makeGame(ROLES);
    act(g, { type: 'disconnect_dead', actorId: 'p4' }); // ผู้หยั่งรู้หลุด
    for (const id of ['p1', 'p2']) act(g, { type: 'night_action', actorId: id, kind: 'wolf_bite', targets: ['p6'] });
    act(g, { type: 'night_action', actorId: 'p3', kind: 'skip' });
    act(g, { type: 'night_action', actorId: 'p5', kind: 'skip' });
    act(g, { type: 'advance' }); // ไม่ใช่ timedOut
    expect(g.s.phase).toBe('morning');
  });

  it('คนที่ไม่มีอะไรต้องทำ (ชาวบ้าน) ส่งแอคชันกลางคืนไม่ได้', () => {
    const g = makeGame(ROLES);
    expect(applyAction(g.s, { type: 'night_action', actorId: 'p6', kind: 'skip' }).error?.code).toBe('not_your_turn');
    expect(pendingSlotFor(g.s, 'p6')).toBeNull();
  });

  it('แม่มดไม่รู้ว่าใครโดนกัด — ช่วยผิดคนยายังอยู่ ช่วยถูกคนรอดและยาหมด', () => {
    const wrong = makeGame(ROLES);
    playNight(wrong, { p1: { kind: 'wolf_bite', targets: ['p6'] }, p2: { kind: 'wolf_bite', targets: ['p6'] }, p5: { kind: 'witch', meta: { healId: 'p7' } } });
    expect(alive(wrong, 'p6')).toBe(false);
    expect(wrong.s.players[4].roleState.heal).toBe(1); // เดาผิด ไม่เสียยา

    const right = makeGame(ROLES);
    playNight(right, { p1: { kind: 'wolf_bite', targets: ['p6'] }, p2: { kind: 'wolf_bite', targets: ['p6'] }, p5: { kind: 'witch', meta: { healId: 'p6' } } });
    expect(alive(right, 'p6')).toBe(true);
    expect(right.s.players[4].roleState.heal).toBe(0);
  });
});

describe('เสียงของฝูงหมาป่า', () => {
  it('สมาชิกฝูงเห็นว่าเพื่อนในฝูงเลือกกัดใคร — คนนอกฝูงไม่เห็นเลย', () => {
    const g = makeGame(['werewolf', 'werewolf', 'seer', 'villager', 'villager', 'villager']);
    act(g, { type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p4'] });
    expect(buildView(g.s, 'p2')!.packVotes).toEqual({ p1: 'p4' });
    expect(buildView(g.s, 'p1')!.packVotes).toEqual({ p1: 'p4' });
    expect(buildView(g.s, 'p3')!.packVotes).toBeNull();
    expect(buildView(g.s, 'p4')!.packVotes).toBeNull();
  });
});

describe('แจ้งเฉพาะตัวผู้ที่โดน', () => {
  it('ผู้ตายได้รับแจ้งว่าตายและตายเพราะอะไร — คนอื่นไม่เห็นข้อความนั้น', () => {
    const g = makeGame(['werewolf', 'villager', 'villager', 'villager', 'villager', 'villager']);
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p4'] } });
    expect(texts(g, 'p4')).toContain('คุณตายแล้ว');
    expect(texts(g, 'p4')).toContain('หมาป่า');
    for (const id of ['p1', 'p2', 'p3', 'p5', 'p6']) expect(texts(g, id)).not.toContain('คุณตายแล้ว');
  });

  it('ถูกโหวตตาย → ผู้ตายได้รับแจ้งด้วย', () => {
    const g = makeGame(['werewolf', 'villager', 'villager', 'villager', 'villager', 'villager']);
    playNight(g, {});
    playDay(g, { p2: 'p3', p4: 'p3', p5: 'p3' }, { p1: 'p3', p2: 'p3', p4: 'p3', p5: 'p3', p6: 'p3', p3: null });
    expect(alive(g, 'p3')).toBe(false);
    expect(texts(g, 'p3')).toContain('โหวตกำจัด');
  });

  it('แวมไพร์กัด: แจ้งตอนถูกกัด และตอนกลายเป็นแวมไพร์บอกว่าเพราะ "แวมไพร์" — เฉพาะผู้ถูกกัด', () => {
    const g = makeGame(['vampire', 'villager', 'villager', 'villager', 'villager', 'villager']);
    playNight(g, { p1: { kind: 'vampire_bite', targets: ['p4'] } });
    expect(texts(g, 'p4')).toContain('แวมไพร์กัด');
    skipDay(g);
    flushNight(g);
    const t = texts(g, 'p4');
    expect(t).toContain('เปลี่ยนฝ่ายสำเร็จ');
    expect(t).toContain('แวมไพร์');
    expect(texts(g, 'p2')).not.toContain('เปลี่ยนฝ่าย');
    expect(texts(g, 'p5')).not.toContain('เปลี่ยนฝ่าย');
  });

  it('ผู้นำลัทธิชักชวน: ผู้ถูกชวนได้รับแจ้งว่าใครชวน', () => {
    const g = makeGame(['cult_leader', 'werewolf', 'villager', 'villager', 'villager', 'villager']);
    playNight(g, { p1: { kind: 'cult_recruit', targets: ['p4'] } });
    expect(texts(g, 'p4')).toContain('ผู้นำลัทธิ');
    expect(texts(g, 'p5')).not.toContain('ชักชวน');
  });

  it('เด็กป่าหลงทาง: ต้นแบบตาย → ได้แจ้งว่ากลายเป็นหมาป่าเพราะต้นแบบตาย', () => {
    const g = makeGame(['wild_child', 'werewolf', 'villager', 'villager', 'villager', 'villager']);
    playNight(g, { p1: { kind: 'pick_model', targets: ['p3'] } });
    skipDay(g);
    playNight(g, { p2: { kind: 'wolf_bite', targets: ['p3'] } });
    expect(alive(g, 'p3')).toBe(false);
    expect(g.s.players[0].roleId).toBe('werewolf');
    expect(texts(g, 'p1')).toContain('ต้นแบบของคุณตายแล้ว');
  });
});
