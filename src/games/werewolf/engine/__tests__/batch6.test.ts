// M6 แพ็ก #6: มือปืน + ฝ่ายอิสระกลุ่มแรก (ตัวตลก · คนโง่เจ้าเล่ห์ · ผู้ทำนายอนาคต · กระจกสะท้อน)
import { describe, expect, it } from 'vitest';
import { alive, makeGame, playDay, playNight } from './testUtils';
import { applyAction } from '../reducer';
import { buildView } from '../view';

const act = (g: ReturnType<typeof makeGame>, a: Parameters<typeof applyAction>[1]) => {
  const r = applyAction(g.s, a);
  if (r.error) throw new Error(`${a.type}: ${r.error.code}`);
  g.s = r.state;
};

describe('มือปืน', () => {
  // p1 หมาป่า · p2 มือปืน · p3-p5 ชาวบ้าน
  const ROLES = ['werewolf', 'gunner', 'villager', 'villager', 'villager'];

  it('ยิงได้เฉพาะช่วงอภิปราย — ยิงไม่ได้ตอนกลางคืน', () => {
    const g = makeGame(ROLES);
    expect(g.s.phase).toBe('night');
    expect(applyAction(g.s, { type: 'gunner_shot', actorId: 'p2', targetId: 'p3' }).error?.code).toBe('wrong_phase');
  });

  it('ยิงสำเร็จ → เป้าหมายตายทันที เปิดเผยตัวเป็นมือปืน เสียนัด', () => {
    const g = makeGame(ROLES);
    playNight(g, {});
    act(g, { type: 'advance' }); // morning → discussion
    expect(g.s.phase).toBe('discussion');
    act(g, { type: 'gunner_shot', actorId: 'p2', targetId: 'p3' });
    expect(alive(g, 'p3')).toBe(false);
    expect(g.s.players.find((p) => p.id === 'p2')!.revealedRole).toBe('gunner');
    expect(g.s.players.find((p) => p.id === 'p2')!.roleState.gunnerShots).toBe(1);
  });

  it('มี 2 นัด — ยิงครบ 2 แล้วนัดที่ 3 ยิงไม่ได้ (no_ammo)', () => {
    const g = makeGame(ROLES);
    playNight(g, {});
    act(g, { type: 'advance' });
    act(g, { type: 'gunner_shot', actorId: 'p2', targetId: 'p3' });
    act(g, { type: 'gunner_shot', actorId: 'p2', targetId: 'p4' });
    expect(alive(g, 'p4')).toBe(false);
    expect(applyAction(g.s, { type: 'gunner_shot', actorId: 'p2', targetId: 'p5' }).error?.code).toBe('no_ammo');
  });

  it('ยิงตัวเองไม่ได้ · คนตายยิงไม่ได้', () => {
    const g = makeGame(ROLES);
    playNight(g, {});
    act(g, { type: 'advance' });
    expect(applyAction(g.s, { type: 'gunner_shot', actorId: 'p2', targetId: 'p2' }).error?.code).toBe('self_shot');
    expect(applyAction(g.s, { type: 'gunner_shot', actorId: 'p1', targetId: 'p3' }).error?.code).toBe('not_your_role');
  });
});

describe('ตัวตลก', () => {
  // p1 หมาป่า · p2 ตัวตลก · p3-p5 ชาวบ้าน
  const ROLES = ['werewolf', 'jester', 'villager', 'villager', 'villager'];

  it('ถูกโหวตประหาร → ชนะทันที เกมจบทันที และดึงผู้โหวตให้เขาตายตาม', () => {
    const g = makeGame(ROLES);
    playNight(g, {});
    playDay(g, { p1: 'p2', p3: 'p2' }, { p1: 'p2', p3: 'p2', p4: 'p2', p5: 'p2' });
    expect(alive(g, 'p2')).toBe(false);
    expect(g.s.phase).toBe('game_over');
    expect(g.s.winners![0].playerIds).toEqual(['p2']);
    const deadVoters = ['p1', 'p3', 'p4', 'p5'].filter((id) => !alive(g, id));
    expect(deadVoters.length).toBe(1); // หนึ่งในผู้โหวตตายตามไปด้วย
  });

  it('ตายด้วยสาเหตุอื่น (ถูกกัด) = ไม่ชนะ เกมเดินต่อ', () => {
    const g = makeGame(ROLES);
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p2'] } });
    expect(alive(g, 'p2')).toBe(false);
    expect(g.s.phase).not.toBe('game_over');
  });
});

describe('คนโง่เจ้าเล่ห์', () => {
  // p1 หมาป่า · p2 คนโง่เจ้าเล่ห์ · p3-p5 ชาวบ้าน
  const ROLES = ['werewolf', 'fool', 'villager', 'villager', 'villager'];

  it('ถูกโหวตประหาร → ตั้งธงชนะเฉพาะตัว แต่เกมไม่จบทันที', () => {
    const g = makeGame(ROLES);
    playNight(g, {});
    playDay(g, { p1: 'p2', p3: 'p2' }, { p1: 'p2', p3: 'p2', p4: 'p2', p5: 'p2' });
    expect(alive(g, 'p2')).toBe(false);
    expect(g.s.phase).not.toBe('game_over');
    expect(g.s.players.find((p) => p.id === 'p2')!.roleState.sideWinFool).toBe(true);
  });

  it('ชนะร่วมประกาศตอนเกมจบจริง (ไม่ต้องรอด)', () => {
    const g = makeGame(ROLES);
    playNight(g, {});
    playDay(g, { p1: 'p2', p3: 'p2' }, { p1: 'p2', p3: 'p2', p4: 'p2', p5: 'p2' });
    act(g, { type: 'advance' }); // execution → night
    // เดินต่อจนหมาป่าชนะ (ไม่มีใครกันไว้) — เหลือ p1(หมาป่า) vs p3,p4,p5(3 คน) ต้องฆ่าอีก 2 คน
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p3'] } });
    expect(g.s.phase).not.toBe('game_over');
    playDay(g, {}, {});
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p4'] } }); // เหลือ p1 vs p5 → จบ
    expect(g.s.phase).toBe('game_over');
    const ids = g.s.winners!.flatMap((w) => w.playerIds);
    expect(ids).toContain('p2'); // คนโง่เจ้าเล่ห์ติดอยู่ในรายชื่อผู้ชนะด้วย (side win)
    expect(g.s.winners!.find((w) => w.playerIds.includes('p2'))!.main).toBe(false);
  });
});

describe('ผู้ทำนายอนาคต', () => {
  // p1 หมาป่า · p2 ผู้ทำนายอนาคต · p3-p5 ชาวบ้าน
  const ROLES = ['werewolf', 'nostradamus', 'villager', 'villager', 'villager'];

  it('ทายถูก (หมาป่าชนะ) → ชนะร่วม แม้ตัวเองตายไปแล้ว', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'predict', meta: { team: 'wolf' } }, p1: { kind: 'wolf_bite', targets: ['p2'] } });
    expect(alive(g, 'p2')).toBe(false);
    playDay(g, {}, {});
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p3'] } }); // 2 หมาป่า? ไม่ — 1 หมาป่า vs เหลือ 2 ชาวบ้าน ยังไม่จบ
    expect(g.s.phase).not.toBe('game_over');
    playDay(g, {}, {});
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p4'] } }); // เหลือ 1v1 → หมาป่าชนะ
    expect(g.s.phase).toBe('game_over');
    expect(g.s.winners![0].team).toBe('wolf');
    const ids = g.s.winners!.flatMap((w) => w.playerIds);
    expect(ids).toContain('p2');
  });

  it('ทายผิด → ไม่ติดในรายชื่อผู้ชนะ', () => {
    const g = makeGame(ROLES);
    playNight(g, { p2: { kind: 'predict', meta: { team: 'village' } }, p1: { kind: 'wolf_bite', targets: ['p3'] } });
    playDay(g, {}, {});
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p4'] } });
    playDay(g, {}, {});
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p5'] } }); // เหลือ p1(หมาป่า) vs p2 → จบ
    expect(g.s.phase).toBe('game_over');
    const ids = g.s.winners!.flatMap((w) => w.playerIds);
    expect(ids).not.toContain('p2');
  });

  it('ทายฝ่ายอื่นนอกเหนือ 3 ตัวเลือก → ถูกปฏิเสธ', () => {
    const g = makeGame(ROLES);
    const r = applyAction(g.s, { type: 'night_action', actorId: 'p2', kind: 'predict', meta: { team: 'solooo' } });
    expect(r.error).toBeTruthy();
  });
});

describe('กระจกสะท้อน', () => {
  // p1 ผู้หยั่งรู้ · p2 กระจกสะท้อน · p3 ผู้พิทักษ์ประชาชน · p4 หมาป่า · p5 ชาวบ้าน
  const ROLES = ['seer', 'mirror', 'vigilante', 'werewolf', 'villager'];

  it('ถูกผู้หยั่งรู้ตรวจ → ได้ข้อความ "ผลถูกสะท้อน" ไม่ใช่ข้อมูลจริง', () => {
    const g = makeGame(ROLES);
    playNight(g, { p1: { kind: 'investigate_seer', targets: ['p2'] } });
    const v = buildView(g.s, 'p1')!;
    expect(v.privateResults.some((r) => r.textTh.includes('ผลถูกสะท้อน'))).toBe(true);
    expect(v.privateResults.some((r) => r.textTh.includes('หมาป่า'))).toBe(false);
  });

  it('ถูกผู้พิทักษ์ประชาชนยิง → กระสุนสะท้อนกลับไปโดนผู้ยิงเอง', () => {
    const g = makeGame(ROLES);
    playNight(g, { p3: { kind: 'vigilante_shot', targets: ['p2'] } });
    expect(alive(g, 'p2')).toBe(true); // กระจกไม่โดน
    expect(alive(g, 'p3')).toBe(false); // ผู้ยิงโดนกระสุนตัวเองแทน
  });

  it('ยังถูกหมาป่ากัดตายได้ตามปกติ (การกัดไม่ถูกสะท้อน)', () => {
    const g = makeGame(ROLES);
    playNight(g, { p4: { kind: 'wolf_bite', targets: ['p2'] } });
    expect(alive(g, 'p2')).toBe(false);
  });

  it('รอดชีวิตจนเกมจบ → ติดอยู่ในรายชื่อผู้ชนะด้วย (side win)', () => {
    const g = makeGame(ROLES);
    playNight(g, { p4: { kind: 'wolf_bite', targets: ['p5'] } }); // ฆ่าชาวบ้าน ไม่ใช่กระจก
    expect(g.s.phase).not.toBe('game_over');
    playDay(g, {}, {});
    playNight(g, { p4: { kind: 'wolf_bite', targets: ['p1'] } });
    expect(g.s.phase).not.toBe('game_over'); // เหลือ p4(หมาป่า) vs p2,p3 (2 คน)
    playDay(g, {}, {});
    playNight(g, { p4: { kind: 'wolf_bite', targets: ['p3'] } }); // เหลือ p4 vs p2 → จบ
    expect(g.s.phase).toBe('game_over');
    const ids = g.s.winners!.flatMap((w) => w.playerIds);
    expect(ids).toContain('p2');
    expect(g.s.winners!.find((w) => w.playerIds.includes('p2'))!.main).toBe(false);
  });
});
