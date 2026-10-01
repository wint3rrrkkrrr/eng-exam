// M6 แพ็ก #3: นักบวช + สายสืบสวนที่ไม่เผยบทจริง (รัศมี · ลึกลับ · นักสืบ · นักสืบสวน · ผู้ดูแลสุสาน)
import { describe, expect, it } from 'vitest';
import { alive, makeGame, mustAct, playDay, playNight } from './testUtils';
import { applyAction } from '../reducer';
import { abilityCategoryOf, auraOf } from '../pipeline';
import { legalTargets } from '../night';
import { buildView } from '../view';

const results = (g: ReturnType<typeof makeGame>, id: string) => buildView(g.s, id)!.privateResults.map((r) => r.textTh);

describe('นักบวช', () => {
  // p1 หมาป่า · p2 นักบวช · p3 แม่มด · p4-p6 ชาวบ้าน
  const ROLES = ['werewolf', 'priest', 'witch', 'villager', 'villager', 'villager'];

  it('กันการกัดของหมาป่าได้', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p1: { kind: 'wolf_bite', targets: ['p4'] },
      p2: { kind: 'protect_priest', targets: ['p4'] },
    });
    expect(alive(g, 'p4')).toBe(true);
  });

  it('ไม่กัน → เหยื่อตาย (เปรียบเทียบ)', () => {
    const g = makeGame(ROLES);
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p4'] } });
    expect(alive(g, 'p4')).toBe(false);
  });

  it('พิษแม่มดทะลุการคุ้มครองของนักบวช', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p1: { kind: 'wolf_bite', targets: ['p5'] },
      p2: { kind: 'protect_priest', targets: ['p4'] },
      p3: { kind: 'witch', meta: { heal: false, poisonId: 'p4' } },
    });
    expect(alive(g, 'p4')).toBe(false); // พิษทะลุ
    expect(alive(g, 'p5')).toBe(false); // ไม่ได้กัน
  });

  it('คุ้มครองตัวเองได้ · ห้ามคนเดิมสองคืนติดกัน (เสมอ ไม่มีตัวเลือกปิด)', () => {
    const g = makeGame(ROLES);
    expect(legalTargets(g.s, g.s.players[1], 'protect_priest')).toContain('p2');
    playNight(g, { p2: { kind: 'protect_priest', targets: ['p4'] } });
    playDay(g, {}, {});
    expect(g.s.phase).toBe('night');
    expect(legalTargets(g.s, g.s.players[1], 'protect_priest')).not.toContain('p4');
  });
});

describe('ผู้หยั่งรู้รัศมี', () => {
  // p1 หมาป่า · p2 ผู้หยั่งรู้รัศมี · p3 คนฟอก (อิสระ) · p4 มนุษย์หมาป่าลวงตาไม่มีในชุดนี้ · p5-p6 ชาวบ้าน
  const ROLES = ['werewolf', 'aura_seer', 'tanner', 'villager', 'villager', 'villager'];

  it('เห็นหมาป่าเป็น "ร้าย" · ชาวบ้านเป็น "ดี" · ฝ่ายอิสระเป็น "อิสระ"', () => {
    const g = makeGame(ROLES);
    expect(auraOf(g.s, 'p1')).toBe('evil');
    expect(auraOf(g.s, 'p5')).toBe('good');
    expect(auraOf(g.s, 'p3')).toBe('neutral');
  });

  it('ได้ข้อความผลลับตอนเช้า และไม่บอกชื่อบทจริง', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'investigate_aura', targets: ['p1'] } });
    const lines = results(g, 'p2');
    expect(lines.some((t) => t.includes('ร้าย'))).toBe(true);
    expect(lines.some((t) => t.includes('มนุษย์หมาป่า'))).toBe(false); // ไม่เผยบท
  });

  it('ถูกขัดขวาง → ไม่ได้ผล', () => {
    const g = makeGame(['werewolf', 'aura_seer', 'roleblocker', 'villager', 'villager', 'villager']);
    playNight(g, {
      p3: { kind: 'block', targets: ['p2'] },
      p2: { kind: 'investigate_aura', targets: ['p1'] },
    });
    expect(results(g, 'p2').some((t) => t.includes('รัศมี'))).toBe(false);
  });
});

describe('ผู้หยั่งรู้ลึกลับ', () => {
  const ROLES = ['werewolf', 'mystic_seer', 'doctor', 'seer', 'villager', 'roleblocker'];

  it('จัดประเภทความสามารถถูกต้อง: ฆ่า/ป้องกัน/สืบสวน/ขัดขวาง/ไม่มี', () => {
    const g = makeGame(ROLES);
    expect(abilityCategoryOf(g.s, 'p1')).toBe('kill'); // หมาป่า
    expect(abilityCategoryOf(g.s, 'p3')).toBe('protect'); // หมอ
    expect(abilityCategoryOf(g.s, 'p4')).toBe('investigate'); // ผู้หยั่งรู้
    expect(abilityCategoryOf(g.s, 'p5')).toBe('none'); // ชาวบ้าน
    expect(abilityCategoryOf(g.s, 'p6')).toBe('block'); // ผู้หยุดความสามารถ
  });

  it('ผลลับบอกประเภท ไม่บอกบทและไม่บอกฝ่าย', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'investigate_mystic', targets: ['p1'] } });
    const lines = results(g, 'p2');
    expect(lines.some((t) => t.includes('ฆ่า'))).toBe(true);
    expect(lines.some((t) => t.includes('มนุษย์หมาป่า'))).toBe(false);
  });
});

describe('นักสืบ', () => {
  // p1 หมาป่า · p2 หมาป่า · p3 นักสืบ · p4-p6 ชาวบ้าน
  const ROLES = ['werewolf', 'werewolf', 'detective', 'villager', 'villager', 'villager'];

  it('หมาป่า 2 ตัว → "ฝ่ายเดียวกัน"', () => {
    const g = makeGame(ROLES);
    playNight(g, { p3: { kind: 'investigate_pair', targets: ['p1', 'p2'] }, p1: { kind: 'wolf_bite', targets: ['p4'] }, p2: { kind: 'wolf_bite', targets: ['p4'] } });
    expect(results(g, 'p3').some((t) => t.includes('อยู่ฝ่ายเดียวกัน'))).toBe(true);
  });

  it('หมาป่ากับชาวบ้าน → "คนละฝ่าย" และไม่บอกว่าใครเป็นฝ่ายไหน', () => {
    const g = makeGame(ROLES);
    playNight(g, { p3: { kind: 'investigate_pair', targets: ['p1', 'p5'] }, p1: { kind: 'wolf_bite', targets: ['p4'] }, p2: { kind: 'wolf_bite', targets: ['p4'] } });
    const lines = results(g, 'p3');
    expect(lines.some((t) => t.includes('คนละฝ่าย'))).toBe(true);
    expect(lines.some((t) => t.includes('ฝ่ายหมาป่า'))).toBe(false);
  });

  it('ต้องเลือก 2 คน (เลือกคนเดียวถูกปฏิเสธ)', () => {
    const g = makeGame(ROLES);
    expect(applyAction(g.s, { type: 'night_action', actorId: 'p3', kind: 'investigate_pair', targets: ['p1'] }).error).toBeTruthy();
  });
});

describe('นักสืบสวน', () => {
  const ROLES = ['werewolf', 'investigator', 'villager', 'villager', 'villager', 'villager'];

  it('กลุ่มที่มีหมาป่า → "มีหมาป่าอยู่ในกลุ่มนี้" · กลุ่มที่ไม่มี → "ไม่มี" (ไม่บอกว่าเป็นใคร)', () => {
    const g1 = makeGame(ROLES);
    playNight(g1, { p2: { kind: 'investigate_group', targets: ['p1', 'p3'] }, p1: { kind: 'wolf_bite', targets: ['p4'] } });
    expect(results(g1, 'p2').some((t) => t.includes('มีหมาป่าอยู่ในกลุ่มนี้'))).toBe(true);

    const g2 = makeGame(ROLES);
    playNight(g2, { p2: { kind: 'investigate_group', targets: ['p3', 'p4'] }, p1: { kind: 'wolf_bite', targets: ['p5'] } });
    expect(results(g2, 'p2').some((t) => t.includes('ไม่มีหมาป่าในกลุ่มนี้'))).toBe(true);
  });
});

describe('ผู้ดูแลสุสาน', () => {
  // p1 หมาป่า · p2 ผู้ดูแลสุสาน · p3 ผู้หยั่งรู้ · p4-p6 ชาวบ้าน
  const ROLES = ['werewolf', 'gravekeeper', 'seer', 'villager', 'villager', 'villager'];

  it('คืนแรกยังไม่มีศพ → ไม่มีเป้าหมายให้เลือก', () => {
    const g = makeGame(ROLES);
    expect(legalTargets(g.s, g.s.players[1], 'inspect_grave')).toEqual([]);
  });

  it('คืนถัดไปอ่านศพได้ และเห็นบทจริงแม้ห้องตั้งค่าไม่เปิดเผยบทตอนตาย', () => {
    const g = makeGame(ROLES, { revealOnDeath: 'none' });
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p3'] } }); // ผู้หยั่งรู้ตาย
    expect(alive(g, 'p3')).toBe(false);
    expect(g.s.players[2].revealedRole).toBeNull(); // สาธารณะไม่รู้บท
    playDay(g, {}, {});
    expect(g.s.phase).toBe('night');
    expect(legalTargets(g.s, g.s.players[1], 'inspect_grave')).toContain('p3');
    playNight(g, { p2: { kind: 'inspect_grave', targets: ['p3'] }, p1: { kind: 'wolf_bite', targets: ['p4'] } });
    const lines = results(g, 'p2');
    expect(lines.some((t) => t.includes('ผู้หยั่งรู้'))).toBe(true);
    expect(lines.some((t) => t.includes('ฝ่ายหมู่บ้าน'))).toBe(true);
  });

  it('เลือกคนเป็นไม่ได้', () => {
    const g = makeGame(ROLES);
    expect(applyAction(g.s, { type: 'night_action', actorId: 'p2', kind: 'inspect_grave', targets: ['p4'] }).error).toBeTruthy();
  });
});

describe('ความลับไม่รั่วผ่านมุมมอง', () => {
  it('ผลสืบสวนของบทหนึ่ง ไม่ปรากฏในมุมมองของคนอื่น', () => {
    const g = makeGame(['werewolf', 'aura_seer', 'detective', 'villager', 'villager', 'villager']);
    playNight(g, {
      p2: { kind: 'investigate_aura', targets: ['p1'] },
      p3: { kind: 'investigate_pair', targets: ['p1', 'p4'] },
      p1: { kind: 'wolf_bite', targets: ['p5'] },
    });
    expect(results(g, 'p2').some((t) => t.includes('รัศมี'))).toBe(true);
    expect(results(g, 'p3').some((t) => t.includes('รัศมี'))).toBe(false);
    expect(results(g, 'p4')).toEqual([]);
  });
});
