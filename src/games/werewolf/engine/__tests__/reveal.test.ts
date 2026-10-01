// เปิดเผยบทเมื่อตาย: ค่าเริ่มต้น = เปิดเฉพาะคนที่ถูกโหวตตาย · ตายกลางคืน (หมาป่า/พิษ/ฯลฯ) ไม่เปิดบท
import { describe, expect, it } from 'vitest';
import { makeGame, mustAct, playDay, playNight } from './testUtils';
import { buildView } from '../view';

// p1,p2 หมาป่า · p3 แม่มด · p4 นายพราน · p5 ผู้จับคู่รัก · p6-p9 ชาวบ้าน
const ROLES = ['werewolf', 'werewolf', 'witch', 'hunter', 'cupid', 'villager', 'villager', 'villager', 'villager'];
const player = (g: ReturnType<typeof makeGame>, id: string) => g.s.players.find((p) => p.id === id)!;

describe('เปิดเผยบทเมื่อตาย (ค่าเริ่มต้น: เฉพาะโหวต)', () => {
  it('ตายจากหมาป่ากลางคืน → ไม่เปิดบท (ทั้งในข้อมูลผู้เล่นและประกาศเช้า)', () => {
    const g = makeGame(ROLES);
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p6'] }, p2: { kind: 'wolf_bite', targets: ['p6'] } });
    expect(player(g, 'p6').alive).toBe(false);
    expect(player(g, 'p6').revealedRole).toBeNull();
    const morning = g.events.find((e) => e.kind === 'morning')!;
    expect((morning.data.deaths as { revealedRole: unknown }[])[0].revealedRole).toBeNull();
    expect(buildView(g.s, 'p7')!.publicPlayers.find((p) => p.playerId === 'p6')!.revealedRole).toBeNull();
  });

  it('ตายจากพิษแม่มด → ไม่เปิดบท', () => {
    const g = makeGame(ROLES);
    playNight(g, { p3: { kind: 'witch', meta: { poisonId: 'p7' } } });
    expect(player(g, 'p7').revealedRole).toBeNull();
  });

  it('ตายตามคู่รักกลางคืน → ไม่เปิดบท', () => {
    const g = makeGame(ROLES);
    playNight(g, {
      p5: { kind: 'cupid_pair', targets: ['p6', 'p7'] },
      p1: { kind: 'wolf_bite', targets: ['p6'] },
      p2: { kind: 'wolf_bite', targets: ['p6'] },
    });
    expect(player(g, 'p7').alive).toBe(false);
    expect(player(g, 'p7').revealedRole).toBeNull();
  });

  it('ถูกโหวตตาย → เปิดบท (ทุกคนเห็น)', () => {
    const g = makeGame(ROLES);
    playNight(g, {});
    playDay(g, { p1: 'p8', p2: 'p8' }, { p1: 'p8', p2: 'p8', p6: 'p8' });
    expect(player(g, 'p8').alive).toBe(false);
    expect(player(g, 'p8').revealedRole).toBe('villager');
    expect(buildView(g.s, 'p6')!.publicPlayers.find((p) => p.playerId === 'p8')!.revealedRole).toBe('villager');
  });

  it('ตายตามคู่รักหลังโหวต (ลูกโซ่ตอนกลางวัน) → เปิดบทด้วย', () => {
    const g = makeGame(ROLES);
    playNight(g, { p5: { kind: 'cupid_pair', targets: ['p8', 'p9'] } });
    playDay(g, { p1: 'p8', p2: 'p8' }, { p1: 'p8', p2: 'p8', p6: 'p8' });
    expect(player(g, 'p9').alive).toBe(false);
    expect(player(g, 'p9').revealedRole).toBe('villager');
  });

  it('นายพรานตายกลางคืนแล้วยิง → คนที่ถูกยิงตอนเช้าไม่เปิดบท', () => {
    const g = makeGame(ROLES);
    playNight(g, { p3: { kind: 'witch', meta: { poisonId: 'p4' } } });
    expect(g.s.pendingHunters).toEqual(['p4']);
    mustAct(g, { type: 'hunter_shot', actorId: 'p4', targetId: 'p6' });
    expect(player(g, 'p6').alive).toBe(false);
    expect(player(g, 'p6').revealedRole).toBeNull();
  });

  it('ตัวเลือก "เปิดบทเต็มทุกกรณี" (role) → ตายกลางคืนก็เปิด · "ไม่เปิดเผย" (none) → โหวตก็ไม่เปิด', () => {
    const all = makeGame(ROLES, { revealOnDeath: 'role' });
    playNight(all, { p1: { kind: 'wolf_bite', targets: ['p6'] }, p2: { kind: 'wolf_bite', targets: ['p6'] } });
    expect(player(all, 'p6').revealedRole).toBe('villager');

    const none = makeGame(ROLES, { revealOnDeath: 'none' });
    playNight(none, {});
    playDay(none, { p1: 'p8', p2: 'p8' }, { p1: 'p8', p2: 'p8', p6: 'p8' });
    expect(player(none, 'p8').alive).toBe(false);
    expect(player(none, 'p8').revealedRole).toBeNull();
  });

  it('จบเกมแล้วเปิดบททุกคนเสมอ (ผ่าน allRoles)', () => {
    const g = makeGame(['werewolf', 'villager', 'villager', 'villager', 'villager', 'villager', 'witch']);
    playNight(g, { p7: { kind: 'witch', meta: { poisonId: 'p1' } } });
    expect(g.s.phase).toBe('game_over');
    expect(buildView(g.s, 'p2')!.gameOver!.allRoles.find((r) => r.playerId === 'p1')!.role).toBe('werewolf');
  });
});
