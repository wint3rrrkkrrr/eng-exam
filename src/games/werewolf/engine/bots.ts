// engine/bots.ts — บอทสุ่มเล่นได้ทุกบท: ใช้ทดสอบ (simulate) และเล่นแทนคนหลุดเกม (M5)
import type { GameAction, GameState } from './types';
import { getRole } from './roles';
import { nextRand, pick, shuffle } from './rng';
import { abilityUsable, actingDef, legalTargets, pendingSlotFor, witchOptions } from './night';
import { advance } from './reducer';
import { applyAction } from './reducer';
import { player } from './state';
import { eligibleVoters } from './vote';

type Rng = { rngState: number };

/** แอคชันของบอทสำหรับ "ช่องปัจจุบัน" — ถ้าบทมีหลายความสามารถ ใช้ตัวที่ตรงกับช่องนี้ */
export function botNightAction(s: GameState, id: string, rng: Rng, slotNum?: number): GameAction {
  const me = player(s, id)!;
  const def = actingDef(me);
  const ab = slotNum != null
    ? def.abilities.find((x) => (x.nightSlot ?? def.nightSlot) === slotNum)
    : def.abilities[0];
  if (!ab || !abilityUsable(me, ab)) return { type: 'night_action', actorId: id, kind: 'skip' };

  if (ab.kind === 'witch') {
    const o = witchOptions(s, me);
    const healId = o.canHeal && nextRand(rng) < 0.4 ? pick(rng, o.healTargets) : undefined;
    const poisonId = o.poisonTargets.length > 0 && nextRand(rng) < 0.25 ? pick(rng, o.poisonTargets) : undefined;
    return { type: 'night_action', actorId: id, kind: 'witch', meta: { healId, poisonId } };
  }
  if (ab.kind === 'predict') {
    const team = pick(rng, ['village', 'wolf', 'solo'] as const)!;
    return { type: 'night_action', actorId: id, kind: 'predict', meta: { team } };
  }
  const legal = legalTargets(s, me, ab.kind);
  if (legal.length < ab.targets) return { type: 'night_action', actorId: id, kind: 'skip' };
  const targets = shuffle(rng, legal).slice(0, ab.targets);
  return { type: 'night_action', actorId: id, kind: ab.kind, targets };
}

export interface BotGameResult {
  state: GameState;
  steps: number;
  finished: boolean;
  rejected: string[]; // เหตุผลที่แอคชันของบอทถูกปฏิเสธ (ควรว่างเสมอ — ถ้าไม่ว่าง = บั๊ก)
}

/**
 * แอคชันของบอทที่จะเล่น "แทนผู้เล่นคนเดียว" ณ ตอนนี้ (ใช้กับผู้เล่นที่หลุดการเชื่อมต่อ) — คืน null ถ้าคนนี้ไม่มีอะไรต้องทำ
 * ไม่ใช้ Math.random/เวลา: สุ่มจาก rng ที่ส่งมา
 */
export function botActionFor(s: GameState, id: string, rng: Rng): GameAction | null {
  const me = player(s, id);
  if (!me) return null;
  if (s.pendingHunters[0] === id) {
    const t = pick(rng, s.players.filter((p) => p.alive && p.id !== id).map((p) => p.id));
    return t ? { type: 'hunter_shot', actorId: id, targetId: t } : null;
  }
  if (!me.alive) return null;
  switch (s.phase) {
    case 'role_reveal':
      return me.ready ? null : { type: 'ready', actorId: id };
    case 'night': {
      const slot = pendingSlotFor(s, id);
      return slot ? botNightAction(s, id, rng, slot.slot) : null;
    }
    case 'nomination': {
      if (s.nominations[id]) return null;
      const t = pick(rng, s.players.filter((x) => x.alive && x.id !== id).map((x) => x.id));
      return t ? { type: 'nominate', actorId: id, targetId: t } : null;
    }
    case 'vote': {
      if (!eligibleVoters(s).includes(id) || id in s.votes) return null;
      return { type: 'vote', actorId: id, targetId: nextRand(rng) < 0.3 ? null : pick(rng, s.candidates) ?? null };
    }
    default:
      return null;
  }
}

/** เล่นจนจบด้วยบอทล้วน — ไม่มี Math.random/เวลา: ผลขึ้นกับ seed ล้วน */
export function playBotGame(initial: GameState, botSeed: number, maxSteps = 5000): BotGameResult {
  let s = initial;
  const rng: Rng = { rngState: botSeed >>> 0 };
  const rejected: string[] = [];
  let steps = 0;

  const apply = (a: GameAction) => {
    const r = applyAction(s, a);
    if (r.error) rejected.push(`${a.type}: ${r.error.code}`);
    else s = r.state;
  };
  const adv = (timedOut: boolean) => apply({ type: 'advance', timedOut });

  while (s.phase !== 'game_over' && steps++ < maxSteps) {
    if (s.pendingHunters.length > 0) {
      const hid = s.pendingHunters[0];
      const targets = s.players.filter((p) => p.alive && p.id !== hid).map((p) => p.id);
      const t = pick(rng, targets);
      if (t) apply({ type: 'hunter_shot', actorId: hid, targetId: t });
      else adv(true);
      continue;
    }
    switch (s.phase) {
      case 'role_reveal':
        for (const p of s.players) apply({ type: 'ready', actorId: p.id });
        adv(false);
        break;
      case 'night': {
        // กลางคืนทำพร้อมกัน: ทุกคนส่งแอคชันครบทุกความสามารถที่ค้างอยู่ แล้วจึงจบคืน
        let guardN = 0;
        let progressed = true;
        while (progressed && s.phase === 'night' && guardN++ < 50) {
          progressed = false;
          for (const p of s.players) {
            const slot = pendingSlotFor(s, p.id);
            if (!slot) continue;
            const before = s.night!.acted[`${p.id}@${slot.slot}`];
            apply(botNightAction(s, p.id, rng, slot.slot));
            if (s.night && s.night.acted[`${p.id}@${slot.slot}`] !== before) progressed = true;
          }
        }
        adv(false);
        break;
      }
      case 'nomination':
        for (const p of s.players.filter((x) => x.alive)) {
          const targets = s.players.filter((x) => x.alive && x.id !== p.id).map((x) => x.id);
          const t = pick(rng, targets);
          if (t) apply({ type: 'nominate', actorId: p.id, targetId: t });
        }
        adv(false);
        break;
      case 'vote':
        for (const id of eligibleVoters(s)) {
          const abstain = nextRand(rng) < 0.15;
          apply({ type: 'vote', actorId: id, targetId: abstain ? null : pick(rng, s.candidates) ?? null });
        }
        adv(false);
        break;
      case 'discussion':
      case 'defense':
        adv(true);
        break;
      default:
        adv(false);
    }
  }
  return { state: s, steps, finished: s.phase === 'game_over', rejected };
}

// (ส่งออก advance ไว้ให้เทสต์เรียกตรงๆ ได้)
export { advance };
