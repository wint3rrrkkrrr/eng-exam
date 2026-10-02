// engine/deaths.ts — ลูกโซ่หลังตาย (RULES ข้อ 6 ขั้น 8)
// คู่รักตายตาม → นายพรานยิง (เข้าคิว รอผู้เล่นเลือกเป้า) → ตรวจผู้ชนะเมื่อไม่มีใครค้างยิง
import type { DeathCause, EnginePlayer, GameEvent, GameState } from './types';
import { getRole } from './roles';
import { checkWinners } from './win';
import { ev, player } from './state';

/** สาเหตุที่ "บอกต่อสาธารณะ" — ไม่เผยว่าถูกกัดหรือถูกพิษ (กันเดาว่าแม่มดมีอยู่) */
export function publicCause(c: DeathCause): 'night' | 'vote' | 'hunter' | 'lover' | 'disconnect' | 'gunner' {
  if (c === 'jester') return 'vote';
  if (c === 'hunter' || c === 'lover' || c === 'vote' || c === 'disconnect' || c === 'gunner') return c; // มือปืนยิงต่อหน้าทุกคนตอนกลางวัน จึงบอกสาเหตุตรงๆ
  return 'night'; // หมาป่า/พิษ/ผู้คุ้มกัน/ผู้พิทักษ์ฯ/ความรู้สึกผิด/มือปืน/ฆาตกรเดี่ยว/ไฟ/นักล่าหมาป่า/ชูปาคาบรา — ปิดบังหมดว่าใครทำ
}

/** ตายตอนกลางวัน (โหวต + ลูกโซ่หลังโหวต) — ต่างจากตายกลางคืนที่ resume = 'morning' */
function isDayDeath(s: GameState, cause: DeathCause): boolean {
  return cause === 'vote' || s.resume === 'execution';
}

function reveal(s: GameState, p: EnginePlayer, cause: DeathCause): void {
  const mode = s.settings.revealOnDeath;
  // ถูกมือปืนยิง: ทุกคนต้องรู้ว่าคนที่โดนยิงเป็นบทอะไร (ยกเว้นตั้งค่า "ไม่เปิดเผยเลย")
  if (cause === 'gunner' && mode !== 'none') {
    p.revealedRole = p.roleId;
    p.revealedTeam = p.team;
    p.revealedIsWolf = p.team === 'wolf';
    return;
  }
  if (mode === 'vote') {
    // ตายกลางคืน (หมาป่า/พิษ/ผู้คุ้มกัน/ลูกโซ่ตอนเช้า) ไม่เปิดบท · ตายจากโหวตหรือลูกโซ่หลังโหวตเปิดบทเต็ม
    // ★ คนที่ตายตามคู่รักไม่เปิดบทเสมอ (บอกแค่ว่าเป็นคู่รักกัน)
    if (isDayDeath(s, cause) && cause !== 'lover') {
      p.revealedRole = p.roleId;
      p.revealedTeam = p.team;
      p.revealedIsWolf = p.team === 'wolf';
    }
  } else if (mode === 'role') {
    p.revealedRole = p.roleId;
    p.revealedTeam = p.team;
    p.revealedIsWolf = p.team === 'wolf';
  } else if (mode === 'team') {
    p.revealedTeam = p.team;
  } else if (mode === 'wolf') {
    p.revealedIsWolf = p.team === 'wolf';
  }
}

export function settleDeaths(
  s: GameState,
  deaths: { id: string; cause: DeathCause }[],
  events: GameEvent[],
): void {
  const queue = deaths.slice();
  let guard = 0;
  while (queue.length > 0 && guard++ < 200) {
    const d = queue.shift()!;
    const p = player(s, d.id);
    if (!p || !p.alive) continue; // ตายครั้งเดียว ไม่นับซ้ำ

    p.alive = false;
    p.canVote = false;
    p.deathDay = s.dayNumber;
    p.deathCause = d.cause;
    reveal(s, p, d.cause);
    if (d.cause !== 'disconnect') s.tonightDeaths.push({ id: p.id, cause: d.cause }); // คนหลุดประกาศทันที ไม่รวมในสรุปตอนเช้า

    events.push(ev(s, 'death', true, {
      playerId: p.id,
      cause: publicCause(d.cause),
      partnerId: d.cause === 'lover' ? p.loverOf : null,
      revealedRole: p.revealedRole,
      revealedTeam: p.revealedTeam,
      revealedIsWolf: p.revealedIsWolf,
    }));
    events.push(ev(s, 'death_detail', false, { playerId: p.id, roleId: p.roleId, cause: d.cause }));
    // บอกผู้ตายเองเสมอว่า "คุณตายแล้ว" และตายเพราะอะไร (เฉพาะเจ้าตัว — คนอื่นเห็นแค่สาเหตุแบบกำกวมตามเดิม)
    (s.privateLog[p.id] ??= []).push({ kind: 'you_died', day: s.dayNumber, cause: d.cause });

    // คู่รักตายตาม
    if (p.loverOf) {
      const lover = player(s, p.loverOf);
      if (lover && lover.alive) queue.push({ id: lover.id, cause: 'lover' });
    }
    // นายพราน: เข้าคิวยิง (บทที่ onActorDeath ขึ้นต้นด้วย "ยิง" — ตอนนี้มีบทเดียว)
    if (getRole(p.roleId).wakes === 'on-death') s.pendingHunters.push(p.id);

    // ลูกหมาป่าตาย → ฝูงฆ่าได้ 2 คนในคืนถัดไป
    if (p.roleId === 'wolf_cub') s.packExtraKill = true;

    // เด็กป่าหลงทาง / มนุษย์ป่า: ถ้าต้นแบบของใครตายพอดี เขากลายเป็นหมาป่าทันที (ย้อนกลับไม่ได้)
    for (const watcher of s.players) {
      if (!watcher.alive || watcher.id === p.id) continue;
      if ((watcher.roleId === 'wild_child' || watcher.roleId === 'sasquatch') && watcher.roleState.modelId === p.id) {
        watcher.roleId = 'werewolf'; // ย้อนกลับไม่ได้ — ได้ความสามารถกัดเต็มตัวตั้งแต่คืนถัดไป (ไม่ใช่แค่เปลี่ยนฝ่าย)
        watcher.team = 'wolf';
        watcher.winWith = 'wolf';
        events.push(ev(s, 'converted', false, { playerId: watcher.id, to: 'werewolf', reason: 'model_died' }));
        (s.privateLog[watcher.id] ??= []).push({ kind: 'converted', day: s.dayNumber, toRole: 'werewolf', byRole: null });
      }
    }

    // ศิษย์ผู้หยั่งรู้: ผู้หยั่งรู้ตาย → เลื่อนขั้นเป็นผู้หยั่งรู้ (ใช้ได้ตั้งแต่คืนถัดไป)
    if (p.roleId === 'seer') {
      const heir = s.players.find((x) => x.alive && x.roleId === 'apprentice_seer');
      if (heir) {
        heir.roleId = 'seer';
        (s.privateLog[heir.id] ??= []).push({ kind: 'promoted', day: s.dayNumber, roleId: 'seer' });
        events.push(ev(s, 'apprentice_promoted', false, { playerId: heir.id }));
      }
    }
  }
  checkEnd(s, events);
}

/** ตรวจผู้ชนะเมื่อไม่มีนายพรานค้างยิง (ยิงแล้วค่อยตัดสิน — RULES ข้อ 4) */
export function checkEnd(s: GameState, events: GameEvent[]): void {
  if (s.winners || s.pendingHunters.length > 0) return;
  const w = checkWinners(s);
  if (w) {
    s.winners = w;
    s.phase = 'game_over';
    s.gameOverReason = w[0].reasonTh;
    events.push(ev(s, 'game_over', true, { winners: w }));
  }
}
