// M6 แพ็ก #2: หมาป่าผู้หยุดความสามารถ (ตื่น 2 ช่อง) + ผู้สลับชะตา (ขั้น 2 ของท่อ)
import { describe, expect, it } from 'vitest';
import { alive, makeGame, mustAct, playNight } from './testUtils';
import { applyAction } from '../reducer';
import { currentSlot } from '../night';
import { buildView } from '../view';

// p1 หมาป่าผู้หยุดความสามารถ · p2 หมาป่า · p3 ผู้หยั่งรู้ · p4 แม่มด · p5-p7 ชาวบ้าน (ช่อง 11 → 30 → 40 → 50 ติดกันไม่มีบทอื่นคั่น)
const WB = ['wolf_blocker', 'werewolf', 'seer', 'witch', 'villager', 'villager', 'villager'];

describe('หมาป่าผู้หยุดความสามารถ', () => {
  it('ตื่น 2 ช่อง: ช่อง 11 (block) มาก่อนช่อง 30 (กัด) เสมอ', () => {
    const g = makeGame(WB);
    expect(currentSlot(g.s)!.slot).toBe(11);
    expect(currentSlot(g.s)!.actors).toContain('p1');
    mustAct(g, { type: 'night_action', actorId: 'p1', kind: 'block', targets: ['p3'] });
    mustAct(g, { type: 'advance' });
    expect(currentSlot(g.s)!.slot).toBe(30);
    expect(currentSlot(g.s)!.actors).toEqual(expect.arrayContaining(['p1', 'p2']));
  });

  it('ส่ง kind ที่ไม่ตรงกับช่องปัจจุบันถูกปฏิเสธ (wrong_slot)', () => {
    const g = makeGame(WB);
    expect(currentSlot(g.s)!.slot).toBe(11);
    const r = applyAction(g.s, { type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p6'] });
    expect(r.error?.code).toBe('wrong_slot');
  });

  it('ขัดขวางผู้หยั่งรู้ที่ช่อง 11 + ร่วมกัด p5 ที่ช่อง 30 → ผู้หยั่งรู้ไม่ได้ผล และ p5 ตาย', () => {
    const g = makeGame(WB);
    let s = g.s;
    const act = (a: Parameters<typeof applyAction>[1]) => { const r = applyAction(s, a); if (r.error) throw new Error(r.error.code); s = r.state; };
    act({ type: 'night_action', actorId: 'p1', kind: 'block', targets: ['p3'] });
    act({ type: 'advance' });
    expect(currentSlot(s)!.slot).toBe(30);
    act({ type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p5'] });
    act({ type: 'night_action', actorId: 'p2', kind: 'wolf_bite', targets: ['p5'] });
    act({ type: 'advance' });
    expect(currentSlot(s)!.slot).toBe(40); // ผู้หยั่งรู้
    act({ type: 'night_action', actorId: 'p3', kind: 'investigate_seer', targets: ['p2'] });
    act({ type: 'advance' });
    expect(currentSlot(s)!.slot).toBe(50); // แม่มด
    act({ type: 'night_action', actorId: 'p4', kind: 'witch' });
    act({ type: 'advance' });
    expect(s.phase).toBe('morning');
    expect(s.players.find((p) => p.id === 'p5')!.alive).toBe(false);
    const v = buildView(s, 'p3')!;
    expect(v.privateResults.some((r) => r.textTh.includes('ขัดขวาง'))).toBe(true);
    expect(v.privateResults.some((r) => r.textTh.includes('เป็นหมาป่า'))).toBe(false);
  });

  it('ไม่กดขัดใคร แต่ร่วมกัดฝูง → เหยื่อตายตามปกติ (ตื่นสองช่องไม่พังอะไร)', () => {
    const g = makeGame(WB);
    let s = g.s;
    const act = (a: Parameters<typeof applyAction>[1]) => { const r = applyAction(s, a); if (r.error) throw new Error(r.error.code); s = r.state; };
    act({ type: 'night_action', actorId: 'p1', kind: 'skip' });
    act({ type: 'advance' });
    expect(currentSlot(s)!.slot).toBe(30);
    act({ type: 'night_action', actorId: 'p1', kind: 'wolf_bite', targets: ['p7'] });
    act({ type: 'night_action', actorId: 'p2', kind: 'wolf_bite', targets: ['p7'] });
    act({ type: 'advance' });
    while (s.phase === 'night') act({ type: 'advance', timedOut: true });
    expect(s.players.find((p) => p.id === 'p7')!.alive).toBe(false);
  });

  it('p1 ถูกขัดขวางเองที่ช่อง 10 (โดยผู้หยุดความสามารถธรรมดา) → ขัดใครไม่ได้ และเสียงกัดของตัวเองไม่นับ', () => {
    const g = makeGame(['roleblocker', 'wolf_blocker', 'werewolf', 'villager', 'villager', 'villager']);
    let s = g.s;
    const act = (a: Parameters<typeof applyAction>[1]) => { const r = applyAction(s, a); if (r.error) throw new Error(r.error.code); s = r.state; };
    expect(currentSlot(s)!.slot).toBe(10);
    act({ type: 'night_action', actorId: 'p1', kind: 'block', targets: ['p2'] }); // roleblocker บล็อก wolf_blocker
    act({ type: 'advance' });
    expect(currentSlot(s)!.slot).toBe(11);
    act({ type: 'night_action', actorId: 'p2', kind: 'block', targets: ['p4'] }); // ถูกบล็อกแล้ว ส่งได้แต่ไม่มีผล
    act({ type: 'advance' });
    expect(currentSlot(s)!.slot).toBe(30);
    act({ type: 'night_action', actorId: 'p2', kind: 'wolf_bite', targets: ['p4'] });
    act({ type: 'night_action', actorId: 'p3', kind: 'wolf_bite', targets: ['p5'] });
    act({ type: 'advance' });
    expect(s.phase).toBe('morning');
    // p2 ถูกขัด → เสียงของ p2 ไม่นับ เหลือ p3 เสียงเดียว → p5 ตาย ไม่ใช่ p4
    expect(s.players.find((p) => p.id === 'p5')!.alive).toBe(false);
    expect(s.players.find((p) => p.id === 'p4')!.alive).toBe(true);
  });

  it('เลือกตัวเอง/2 คน/คนตายในความสามารถ block → ถูกปฏิเสธ', () => {
    const g = makeGame(WB);
    expect(applyAction(g.s, { type: 'night_action', actorId: 'p1', kind: 'block', targets: ['p1'] }).error).toBeTruthy();
    expect(applyAction(g.s, { type: 'night_action', actorId: 'p1', kind: 'block', targets: ['p3', 'p4'] }).error).toBeTruthy();
  });
});

// p1 ผู้สลับชะตา · p2 หมาป่า · p3 หมอ · p4-p5 ชาวบ้าน · p6 ผู้หยั่งรู้
const SW = ['swapper', 'werewolf', 'doctor', 'villager', 'villager', 'seer'];

/** เดินช่องกลางคืนโดยทุกคน "ข้าม" จนถึงช่องของผู้สลับชะตา (60) — ใช้ทดสอบช่องกติกาของ swap เพียวๆ */
function toSwapSlot(g: ReturnType<typeof makeGame>): void {
  let s = g.s;
  let guard = 0;
  while (currentSlot(s)!.slot !== 60 && guard++ < 20) {
    const slot = currentSlot(s)!;
    for (const id of slot.actors) {
      const r = applyAction(s, { type: 'night_action', actorId: id, kind: 'skip' });
      if (!r.error) s = r.state;
    }
    const r = applyAction(s, { type: 'advance' });
    if (!r.error) s = r.state;
  }
  g.s = s;
}

describe('ผู้สลับชะตา', () => {
  it('หมาป่าเลือกฆ่า A + หมอกัน B + สลับ A,B → A รอด (ไม่ถูกโจมตีแล้ว) · B ถูกกัด', () => {
    const g = makeGame(SW);
    playNight(g, {
      p2: { kind: 'wolf_bite', targets: ['p4'] },
      p3: { kind: 'protect_doctor', targets: ['p5'] },
      p1: { kind: 'swap', targets: ['p4', 'p5'] },
    });
    expect(alive(g, 'p4')).toBe(true);
    expect(alive(g, 'p5')).toBe(false);
  });

  it('ไม่สลับ (ไม่ใช้ความสามารถ) → ผลปกติ เปรียบเทียบ', () => {
    const g = makeGame(SW);
    playNight(g, {
      p2: { kind: 'wolf_bite', targets: ['p4'] },
      p3: { kind: 'protect_doctor', targets: ['p5'] },
    });
    expect(alive(g, 'p4')).toBe(false);
    expect(alive(g, 'p5')).toBe(true);
  });

  it('สลับเป้าหมายการตรวจของผู้หยั่งรู้ได้เหมือนกัน', () => {
    const g = makeGame(SW);
    playNight(g, {
      p6: { kind: 'investigate_seer', targets: ['p4'] },
      p1: { kind: 'swap', targets: ['p4', 'p2'] }, // สลับเป้าหมายจาก p4 → p2 (หมาป่าตัวจริง)
    });
    const v = buildView(g.s, 'p6')!;
    expect(v.privateResults.some((r) => r.textTh.includes('เป็นหมาป่า'))).toBe(true);
  });

  it('ไม่สลับบท/ฝ่าย — คนที่ถูกสลับเป้าหมายยังเป็นบทเดิมของตัวเอง', () => {
    const g = makeGame(SW);
    playNight(g, {
      p2: { kind: 'wolf_bite', targets: ['p4'] },
      p1: { kind: 'swap', targets: ['p4', 'p5'] },
    });
    expect(g.s.players.find((p) => p.id === 'p4')!.roleId).toBe('villager');
    expect(g.s.players.find((p) => p.id === 'p5')!.roleId).toBe('villager');
  });

  it('ผู้สลับชะตาถูกขัดขวาง (ผู้หยุดความสามารถ) → ไม่มีการสลับเกิดขึ้น', () => {
    const g = makeGame(['roleblocker', 'swapper', 'werewolf', 'doctor', 'villager', 'villager']);
    playNight(g, {
      p1: { kind: 'block', targets: ['p2'] },
      p2: { kind: 'swap', targets: ['p5', 'p6'] },
      p3: { kind: 'wolf_bite', targets: ['p5'] },
      p4: { kind: 'protect_doctor', targets: ['p6'] },
    });
    expect(alive(g, 'p5')).toBe(false); // ไม่ถูกสลับ → ตายตามปกติ
    expect(alive(g, 'p6')).toBe(true);
  });

  it('เลือกตัวเองได้ (canTargetSelf) · เลือกคนตาย/ซ้ำ/คนเดียวไม่ได้', () => {
    const g = makeGame(SW);
    toSwapSlot(g);
    expect(applyAction(g.s, { type: 'night_action', actorId: 'p1', kind: 'swap', targets: ['p1', 'p4'] }).error).toBeFalsy();

    const g2 = makeGame(SW);
    toSwapSlot(g2);
    expect(applyAction(g2.s, { type: 'night_action', actorId: 'p1', kind: 'swap', targets: ['p4', 'p4'] }).error).toBeTruthy();
    expect(applyAction(g2.s, { type: 'night_action', actorId: 'p1', kind: 'swap', targets: ['p4'] }).error).toBeTruthy();
  });

  it('สลับเป้าหมายของหญิงชรา (ห้ามโหวต) ได้เช่นกัน', () => {
    const g = makeGame(['swapper', 'old_hag', 'werewolf', 'villager', 'villager']);
    playNight(g, {
      p2: { kind: 'hag_curse', targets: ['p3'] },
      p1: { kind: 'swap', targets: ['p3', 'p4'] },
    });
    expect(g.s.players.find((p) => p.id === 'p3')!.canVote).toBe(true);
    expect(g.s.players.find((p) => p.id === 'p4')!.canVote).toBe(false);
  });
});
