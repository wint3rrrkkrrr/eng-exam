// M6 แพ็ก #1: ผู้หยุดความสามารถ + หญิงชรา (RULES ข้อ 6 ขั้น 1 · ตาราง 10.1)
import { describe, expect, it } from 'vitest';
import { alive, makeGame, mustAct, playDay, playNight } from './testUtils';
import { applyAction } from '../reducer';
import { buildView } from '../view';

// p1 หมาป่า · p2 หมาป่า · p3 ผู้หยุดความสามารถ · p4 ผู้หยั่งรู้ · p5 หมอ · p6 แม่มด · p7 หญิงชรา · p8 ชาวบ้าน · p9 ชาวบ้าน
const ROLES = ['werewolf', 'werewolf', 'roleblocker', 'seer', 'doctor', 'witch', 'old_hag', 'villager', 'villager'];

const wolvesBite = (t: string) => ({
  p1: { kind: 'wolf_bite' as const, targets: [t] },
  p2: { kind: 'wolf_bite' as const, targets: [t] },
});

describe('ผู้หยุดความสามารถ', () => {
  it('หยุดผู้หยั่งรู้ → ไม่ได้ผลตรวจ และได้รับแจ้ง "ถูกขัดขวาง"', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p3: { kind: 'block', targets: ['p4'] },
      p4: { kind: 'investigate_seer', targets: ['p1'] },
    });
    const v = buildView(g.s, 'p4')!;
    expect(v.privateResults.some((r) => r.textTh.includes('ขัดขวาง'))).toBe(true);
    expect(v.privateResults.some((r) => r.textTh.includes('หมาป่า'))).toBe(false);
  });

  it('ไม่หยุด → ผู้หยั่งรู้ได้ผลตรวจตามปกติ (เปรียบเทียบ)', () => {
    const g = makeGame(ROLES);
    playNight(g, { p4: { kind: 'investigate_seer', targets: ['p1'] } });
    expect(buildView(g.s, 'p4')!.privateResults.some((r) => r.textTh.includes('เป็นหมาป่า'))).toBe(true);
  });

  it('หยุดหมอ → หมอกันไม่สำเร็จ เหยื่อตาย · ไม่ตัดจำนวนครั้ง', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      ...wolvesBite('p8'),
      p3: { kind: 'block', targets: ['p5'] },
      p5: { kind: 'protect_doctor', targets: ['p8'] },
    });
    expect(alive(g, 'p8')).toBe(false);
  });

  it('หยุดแม่มด → ชุบไม่ได้ และยาไม่หมด', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      ...wolvesBite('p8'),
      p3: { kind: 'block', targets: ['p6'] },
      p6: { kind: 'witch', meta: { heal: true } },
    });
    expect(alive(g, 'p8')).toBe(false);
    expect(g.s.players[5].roleState.heal).toBe(1);
  });

  it('หยุดหมาป่าตัวเดียวในฝูง → เสียงของมันไม่นับ ตัวที่เหลือกัดต่อได้', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p1: { kind: 'wolf_bite', targets: ['p9'] },
      p2: { kind: 'wolf_bite', targets: ['p9'] },
      p3: { kind: 'block', targets: ['p1'] },
    });
    expect(alive(g, 'p9')).toBe(false); // p2 เสียงเดียว ไม่ขัดแย้งกับใคร
  });

  it('หยุดหมาป่าที่เลือกคนละคนกับเพื่อน → ฝูงเหลือเสียงเดียวที่ตรงกัน เหยื่อตาย', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p1: { kind: 'wolf_bite', targets: ['p8'] },
      p2: { kind: 'wolf_bite', targets: ['p9'] },
      p3: { kind: 'block', targets: ['p1'] },
    });
    expect(alive(g, 'p9')).toBe(false);
    expect(alive(g, 'p8')).toBe(true);
  });

  it('หยุดหมาป่าครบทั้งฝูง → ไม่มีใครถูกกัด', () => {
    const g = makeGame(['werewolf', 'roleblocker', 'villager', 'villager', 'villager', 'seer']);
    playNight(g, {
      p1: { kind: 'wolf_bite', targets: ['p3'] },
      p2: { kind: 'block', targets: ['p1'] },
    });
    expect(g.s.players.every((p) => p.alive)).toBe(true);
  });

  it('ผู้หยุดความสามารถถูกหยุดเอง (โดยผู้หยุดอีกคนช่องเดียวกัน) → ทำงานตามเลขช่อง', () => {
    // สองคนอยู่ช่องเดียวกัน: ลำดับตาม slot เท่ากัน → คนแรกใน intents ได้ทำก่อน คนที่ถูกหยุดแล้วหยุดใครไม่ได้
    const g = makeGame(['werewolf', 'roleblocker', 'roleblocker', 'seer', 'villager', 'villager']);
    playNight(g, {
      p2: { kind: 'block', targets: ['p3'] },
      p3: { kind: 'block', targets: ['p4'] },
      p4: { kind: 'investigate_seer', targets: ['p1'] },
    });
    // p2 หยุด p3 ก่อน → p3 หยุด p4 ไม่ได้ → ผู้หยั่งรู้ตรวจสำเร็จ
    expect(buildView(g.s, 'p4')!.privateResults.some((r) => r.textTh.includes('เป็นหมาป่า'))).toBe(true);
    expect(buildView(g.s, 'p3')!.privateResults.some((r) => r.textTh.includes('ขัดขวาง'))).toBe(true);
  });

  it('ปิดการแจ้งเตือนในตั้งค่า → ผู้ถูกหยุดไม่ได้รับแจ้ง', () => {
    const g = makeGame(ROLES, { blockedNotice: false });
    playNight(g, { p3: { kind: 'block', targets: ['p4'] }, p4: { kind: 'investigate_seer', targets: ['p1'] } });
    expect(buildView(g.s, 'p4')!.privateResults).toEqual([]);
  });

  it('หยุดหมาป่าผู้บดบัง → ไม่บดบังโหวต และไม่เสียสิทธิ์', () => {
    const g = makeGame(['veil_wolf', 'roleblocker', 'villager', 'villager', 'villager', 'villager', 'seer']);
    playNight(g, {
      p1: { kind: 'wolf_bite', targets: ['p3'], meta: { veil: true } },
      p2: { kind: 'block', targets: ['p1'] },
    });
    expect(g.s.veilNext).toBe(false);
    expect(g.s.players[0].roleState.veilLeft).toBe(1);
  });

  it('เป้าหมายตายก่อนประมวลผลไม่ทำให้พัง · ผู้หยุดตายแล้วเลือกไม่ได้', () => {
    const g = makeGame(ROLES);
    playNight(g, { ...wolvesBite('p3'), p3: { kind: 'block', targets: ['p4'] } });
    // p3 ถูกกัดตายคืนแรก แต่การหยุดยังเกิดคืนเดียวกัน (เจตนาถูกเก็บก่อนประมวลผล)
    expect(alive(g, 'p3')).toBe(false);
    mustAct(g, { type: 'advance' });
    const r = applyAction(g.s, { type: 'night_action', actorId: 'p3', kind: 'block', targets: ['p4'] });
    expect(r.error).toBeTruthy();
  });

  it('เลือกตัวเอง/คนตาย/2 คน → ถูกปฏิเสธ', () => {
    const g = makeGame(ROLES);
    for (const targets of [['p3'], ['p4', 'p5'], []]) {
      expect(applyAction(g.s, { type: 'night_action', actorId: 'p3', kind: 'block', targets }).error, JSON.stringify(targets)).toBeTruthy();
    }
  });
});

describe('หญิงชรา', () => {
  it('ผู้ถูกเลือกโหวตไม่ได้ในวันถัดไป · ได้รับแจ้ง · ยังเสนอชื่อ/ถูกโหวตได้', () => {
    const g = makeGame(ROLES);
    playNight(g, { p7: { kind: 'hag_curse', targets: ['p8'] } });
    const v = buildView(g.s, 'p8')!;
    expect(v.privateResults.some((r) => r.textTh.includes('ห้ามคุณโหวต'))).toBe(true);
    expect(v.me.canVote).toBe(false);
    // วันนั้น: p8 เสนอชื่อได้ แต่โหวตไม่ได้
    mustAct(g, { type: 'advance' });
    mustAct(g, { type: 'advance', timedOut: true });
    mustAct(g, { type: 'nominate', actorId: 'p8', targetId: 'p1' });
    mustAct(g, { type: 'nominate', actorId: 'p4', targetId: 'p1' });
    mustAct(g, { type: 'advance', timedOut: true });
    expect(g.s.phase).toBe('defense');
    mustAct(g, { type: 'advance', timedOut: true });
    expect(g.s.phase).toBe('vote');
    expect(applyAction(g.s, { type: 'vote', actorId: 'p8', targetId: 'p1' }).error?.code).toBe('cannot_vote');
    mustAct(g, { type: 'vote', actorId: 'p4', targetId: 'p1' });
  });

  it('คืนถัดไปสิทธิ์โหวตกลับมา (มีผลวันเดียว)', () => {
    const g = makeGame(ROLES);
    playNight(g, { p7: { kind: 'hag_curse', targets: ['p8'] } });
    playDay(g, {}, {}); // ไม่มีใครเสนอ → ข้ามไปคืน
    expect(g.s.phase).toBe('night');
    expect(g.s.players[7].canVote).toBe(true);
  });

  it('ผู้หยุดความสามารถหยุดหญิงชรา → ไม่มีใครถูกห้ามโหวต', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p3: { kind: 'block', targets: ['p7'] },
      p7: { kind: 'hag_curse', targets: ['p8'] },
    });
    expect(g.s.players[7].canVote).toBe(true);
    expect(buildView(g.s, 'p7')!.privateResults.some((r) => r.textTh.includes('ขัดขวาง'))).toBe(true);
  });

  it('คนโง่ที่เสียสิทธิ์โหวตถาวรไม่ได้สิทธิ์คืนหลังถูกห้ามโหวต', () => {
    const g = makeGame(['werewolf', 'old_hag', 'village_idiot', 'villager', 'villager', 'villager']);
    playNight(g, { p2: { kind: 'hag_curse', targets: ['p3'] } });
    expect(g.s.players[2].canVote).toBe(false);
    // คนโง่ถูกโหวตรอดในวันนั้น
    mustAct(g, { type: 'advance' });
    mustAct(g, { type: 'advance', timedOut: true });
    mustAct(g, { type: 'nominate', actorId: 'p1', targetId: 'p3' });
    mustAct(g, { type: 'advance', timedOut: true });
    mustAct(g, { type: 'advance', timedOut: true });
    for (const id of ['p1', 'p2', 'p4', 'p5', 'p6']) mustAct(g, { type: 'vote', actorId: id, targetId: 'p3' });
    mustAct(g, { type: 'advance', timedOut: true });
    expect(alive(g, 'p3')).toBe(true);
    while (g.s.phase !== 'night') mustAct(g, { type: 'advance', timedOut: true });
    expect(g.s.players[2].canVote).toBe(false); // ยังโหวตไม่ได้ตลอดเกม
  });

  it('เป้าหมายตายคืนนั้นก่อนรุ่งเช้า → ไม่เป็นไร (ไม่ฟื้นสิทธิ์ ไม่พัง)', () => {
    const g = makeGame(ROLES);
    playNight(g, { ...wolvesBite('p8'), p7: { kind: 'hag_curse', targets: ['p8'] } });
    expect(alive(g, 'p8')).toBe(false);
  });

  it('คะแนนโหวตไม่รวมคนที่ถูกห้าม · โหวตครบเมื่อทุกคนที่มีสิทธิ์โหวตแล้ว', () => {
    const g = makeGame(['werewolf', 'old_hag', 'villager', 'villager', 'villager']);
    playNight(g, { p2: { kind: 'hag_curse', targets: ['p3'] } });
    mustAct(g, { type: 'advance' });
    mustAct(g, { type: 'advance', timedOut: true });
    mustAct(g, { type: 'nominate', actorId: 'p4', targetId: 'p1' });
    mustAct(g, { type: 'advance', timedOut: true });
    mustAct(g, { type: 'advance', timedOut: true });
    expect(g.s.phase).toBe('vote');
    for (const id of ['p1', 'p2', 'p4', 'p5']) mustAct(g, { type: 'vote', actorId: id, targetId: 'p1' });
    mustAct(g, { type: 'advance' }); // ครบโดยไม่ต้องรอ p3
    expect(g.s.phase).not.toBe('vote');
  });
});
