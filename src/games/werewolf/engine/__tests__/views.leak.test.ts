// ★ ความลับต้องไม่รั่ว: "มุมมองของฉัน" ของผู้เล่นทุกคน ในทุกช่วงของเกม ต้องไม่มีความลับของคนอื่น
import { describe, expect, it } from 'vitest';
import { act, makeGame, mustAct, playNight, type Game } from './testUtils';
import { buildView, type MyView } from '../view';
import { pendingSlotFor } from '../night';

// 14 คน: หมาป่า 3 · ช่างก่อสร้าง 2 · บทพิเศษหลากหลาย
const ROLES = [
  'werewolf', 'werewolf', 'werewolf', 'seer', 'doctor', 'bodyguard', 'witch', 'hunter',
  'cupid', 'mason', 'mason', 'tanner', 'mayor', 'villager',
];

function checkAllViews(g: Game) {
  const wolfIds = g.s.players.filter((p) => p.team === 'wolf').map((p) => p.id);
  const masonIds = g.s.players.filter((p) => p.roleId === 'mason').map((p) => p.id);

  for (const viewer of g.s.players) {
    const v = buildView(g.s, viewer.id)!;
    const json = JSON.stringify(v);

    // 1) บทของฉันถูกต้อง
    expect(v.me.role).toBe(viewer.roleId);

    // 2) เพื่อนร่วมฝ่ายต้องเป็นฝ่ายเดียวกันจริง (หมาป่า↔หมาป่า · ช่างก่อสร้าง↔ช่างก่อสร้าง) เท่านั้น
    for (const ally of v.allies) {
      const legit =
        (wolfIds.includes(viewer.id) && wolfIds.includes(ally.playerId)) ||
        (masonIds.includes(viewer.id) && masonIds.includes(ally.playerId));
      expect(legit, `${viewer.id} เห็น ${ally.playerId} เป็นพวก ทั้งที่ไม่ควร`).toBe(true);
    }

    // 3) บทของผู้เล่นอื่นเปิดเผยได้เฉพาะคนที่ตาย (ตามค่าตั้งค่า "เปิดบทเมื่อตาย")
    for (const pp of v.publicPlayers) {
      const real = g.s.players.find((p) => p.id === pp.playerId)!;
      if (pp.revealedRole !== null) {
        expect(real.alive && real.roleId !== 'prince' && real.roleId !== 'village_idiot', `${pp.playerId} ยังไม่ควรถูกเปิดบท`).toBe(false);
        expect(pp.revealedRole).toBe(real.roleId);
      }
    }

    // 4) ข้อมูลที่ไม่ควรโผล่ในมุมมองใครเลย
    for (const forbidden of ['"intents"', '"rngState"', '"seed"', '"wolfVotes"', '"wolfTarget"', '"privateLog"', '"loverPairs"']) {
      expect(json.includes(forbidden), `พบ ${forbidden} ในมุมมองของ ${viewer.id}`).toBe(false);
    }

    // 5) เหยื่อของฝูงเห็นได้เฉพาะแม่มดในตาของแม่มดเท่านั้น
    if (viewer.roleId !== 'witch') expect(json.includes('"victimId"')).toBe(false);

    // 6) ผลลับของคนอื่น/สถานะบทของคนอื่นต้องไม่ปน
    if (viewer.roleId !== 'witch') expect(json.includes('"poison"')).toBe(false);
    if (v.gameOver === null) expect(json.includes('"allRoles"')).toBe(false);
  }
}

describe('มุมมองผู้เล่น (views.leak)', () => {
  it('ไม่รั่วในทุกช่องของคืนแรก ตลอดจนเช้า/กลางวัน/โหวต', () => {
    const g = makeGame(ROLES);
    checkAllViews(g); // ต้นคืนที่ 1

    // กลางคืนทำพร้อมกัน: ทุกคนส่งแอคชันของตัวเองทีละคน ตรวจมุมมองทุกคนทุกก้าว
    let guard = 0;
    while (g.s.phase === 'night' && guard++ < 80) {
      checkAllViews(g);
      let acted = false;
      for (const p of g.s.players) {
        if (!pendingSlotFor(g.s, p.id)) continue;
        const v = buildView(g.s, p.id)!;
        if (v.myTurn.isMyTurn && v.myTurn.actionKind === 'cupid_pair') {
          mustAct(g, { type: 'night_action', actorId: p.id, kind: 'cupid_pair', targets: v.myTurn.selectableTargets.slice(0, 2) });
        } else if (v.myTurn.isMyTurn && v.myTurn.actionKind && p.roleId !== 'witch') {
          mustAct(g, { type: 'night_action', actorId: p.id, kind: v.myTurn.actionKind as never, targets: v.myTurn.selectableTargets.slice(0, 1) });
        } else {
          mustAct(g, { type: 'night_action', actorId: p.id, kind: 'skip' });
        }
        acted = true;
        checkAllViews(g);
      }
      mustAct(g, { type: 'advance', timedOut: !acted });
    }
    checkAllViews(g); // เช้า

    mustAct(g, { type: 'advance' });
    checkAllViews(g); // อภิปราย
    mustAct(g, { type: 'advance', timedOut: true });
    for (const p of g.s.players.filter((x) => x.alive)) {
      const t = g.s.players.find((x) => x.alive && x.id !== p.id && x.id !== 'p14')!;
      act(g, { type: 'nominate', actorId: p.id, targetId: t.id });
    }
    checkAllViews(g); // เสนอชื่อ
    mustAct(g, { type: 'advance', timedOut: true });
    checkAllViews(g); // แก้ตัว
  });

  it('หมาป่าเห็นหมาป่าด้วยกัน (ไม่เห็นบทอื่น) · ช่างก่อสร้างเห็นกันเอง · ชาวบ้านไม่เห็นใครเลย', () => {
    const g = makeGame(ROLES);
    expect(buildView(g.s, 'p1')!.allies.map((a) => a.playerId).sort()).toEqual(['p2', 'p3']);
    expect(buildView(g.s, 'p10')!.allies.map((a) => a.playerId)).toEqual(['p11']);
    expect(buildView(g.s, 'p14')!.allies).toEqual([]);
    expect(buildView(g.s, 'p4')!.allies).toEqual([]);
  });

  it('เกมจบแล้วจึงเปิดบททุกคน (และไม่เปิดก่อนหน้านั้น)', () => {
    const R = ['werewolf', 'villager', 'villager', 'villager', 'villager', 'villager', 'witch'];
    const g = makeGame(R);
    expect(buildView(g.s, 'p2')!.gameOver).toBeNull();
    // แม่มดวางยาหมาป่า → หมาป่าตายหมด → เกมจบ
    playNight(g, { p7: { kind: 'witch', meta: { poisonId: 'p1' } } });
    expect(g.s.phase).toBe('game_over');
    const over = buildView(g.s, 'p2')!.gameOver!;
    expect(over.allRoles).toHaveLength(7);
    expect(over.winners![0].team).toBe('village');
  });

  it('ผู้ตายยังเห็นข้อมูลเท่าเดิม ไม่เห็นบทของคนที่ยังรอด', () => {
    const R = ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'witch', 'seer', 'villager'];
    const g = makeGame(R);
    playNight(g, { p1: { kind: 'wolf_bite', targets: ['p3'] }, p2: { kind: 'wolf_bite', targets: ['p3'] } });
    const v = buildView(g.s, 'p3')!;
    expect(v.me.isAlive).toBe(false);
    const other = v.publicPlayers.find((p) => p.playerId === 'p7')!;
    expect(other.revealedRole).toBeNull();
    expect(v.allies).toEqual([]);
  });
});
