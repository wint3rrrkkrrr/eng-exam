// engine/reducer.ts — ★ ฟังก์ชันหลักเดียว: applyAction(state, action) → { state, events, error? }
// บริสุทธิ์ (pure): ไม่แก้ state เดิม ไม่แตะเน็ตเวิร์ก/เวลา/Math.random — สุ่มด้วย rngState ใน state
import type { ApplyResult, EngineError, GameAction, GameEvent, GameState } from './types';
import { clone, err, ev, player, skipNeeded } from './state';
import { advanceNight, applyNightAction, startNight } from './night';
import { afterPending } from './pipeline';
import { checkEnd, settleDeaths } from './deaths';
import { pick } from './rng';
import {
  applyNominate, applyVote, closeNominations, nominationsDone, resolveVote, startVote, votesDone,
} from './vote';

function fail(state: GameState, error: EngineError): ApplyResult {
  // คืน state เดิมไม่เปลี่ยน (ผู้เรียกบันทึกคำขอที่ถูกปฏิเสธลง ww_events_private เอง)
  return { state, events: [], error };
}

export function applyAction(input: GameState, action: GameAction): ApplyResult {
  if (input.phase === 'game_over') return fail(input, err('game_over', 'เกมจบแล้ว'));
  const s = clone(input);
  const events: GameEvent[] = [];
  let error: EngineError | undefined;

  switch (action.type) {
    case 'ready': {
      const p = player(s, action.actorId);
      if (s.phase !== 'role_reveal') error = err('wrong_phase', 'ตอนนี้ไม่ใช่ช่วงดูบท');
      else if (!p) error = err('no_player', 'ไม่พบผู้เล่น');
      else p.ready = true;
      break;
    }
    case 'night_action':
      error = applyNightAction(s, action, events);
      break;
    case 'nominate':
      error = applyNominate(s, action, events);
      break;
    case 'vote':
      error = applyVote(s, action, events);
      break;
    case 'hunter_shot':
      error = applyHunterShot(s, action.actorId, action.targetId, events);
      break;
    case 'advance':
      advance(s, action.timedOut === true, events);
      break;
    case 'disconnect_dead': {
      const p = player(s, action.actorId);
      if (!p) error = err('no_player', 'ไม่พบผู้เล่น');
      else if (!p.alive) error = err('already_dead', 'ผู้เล่นตายแล้ว');
      else {
        settleDeaths(s, [{ id: p.id, cause: 'disconnect' }], events);
        afterPending(s, events);
      }
      break;
    }
    case 'skip_discussion':
      error = applySkipDiscussion(s, action.actorId, events);
      break;
    case 'time_adjust':
      error = applyTimeAdjust(s, action.actorId, action.direction, events);
      break;
    case 'gunner_shot':
      error = applyGunnerShot(s, action.actorId, action.targetId, events);
      break;
  }

  if (error) return fail(input, error);
  return { state: s, events };
}

// ---------------------------------------------------------------- โหวตข้ามการพูดคุย
function applySkipDiscussion(s: GameState, actorId: string, events: GameEvent[]): EngineError | undefined {
  if (s.phase !== 'discussion') return err('wrong_phase', 'โหวตข้ามการพูดคุยได้เฉพาะช่วงอภิปราย');
  const actor = player(s, actorId);
  if (!actor || !actor.alive) return err('dead', 'ผู้ที่ตายแล้วโหวตข้ามไม่ได้');
  if (s.pendingHunters.length > 0) return err('wrong_phase', 'ตอนนี้ต้องรอนายพรานยิงก่อน');
  if (s.skipVotes.includes(actorId)) s.skipVotes = s.skipVotes.filter((id) => id !== actorId); // กดซ้ำ = ถอนโหวต
  else s.skipVotes.push(actorId);
  if (s.skipVotes.length >= skipNeeded(s)) {
    s.phase = 'nomination';
    s.skipVotes = [];
    events.push(ev(s, 'discussion_skipped', true, {}));
    events.push(ev(s, 'nomination_start', true, {}));
  }
  return undefined;
}

// ---------------------------------------------------------------- ผู้ควบคุมเวลา: เพิ่ม/ลดเวลาอภิปราย (ธงให้เซิร์ฟเวอร์ปรับเวลาจริง)
function applyTimeAdjust(s: GameState, actorId: string, direction: 'more' | 'less', events: GameEvent[]): EngineError | undefined {
  if (s.phase !== 'discussion') return err('wrong_phase', 'ปรับเวลาได้เฉพาะช่วงอภิปราย');
  if (direction !== 'more' && direction !== 'less') return err('bad_direction', 'เลือกเพิ่มหรือลดเวลาเท่านั้น');
  const actor = player(s, actorId);
  if (!actor || !actor.alive) return err('dead', 'ผู้ที่ตายแล้วปรับเวลาไม่ได้');
  if (actor.roleId !== 'time_lord') return err('not_your_role', 'คุณไม่ใช่ผู้ควบคุมเวลา');
  if (Number(actor.roleState.timeUses) <= 0) return err('no_uses', 'คุณใช้สิทธิ์ปรับเวลาครบแล้ว');
  actor.roleState.timeUses = Number(actor.roleState.timeUses) - 1;
  s.timeAdjust = direction;
  events.push(ev(s, 'time_adjusted', true, { direction })); // ประกาศให้ทุกคนรู้ว่าเวลาถูกปรับ แต่ไม่ระบุตัวผู้ปรับ
  return undefined;
}

// ---------------------------------------------------------------- มือปืน: ยิงได้เองตอนช่วงอภิปราย (ทะลุทุกการป้องกัน)
function applyGunnerShot(s: GameState, actorId: string, targetId: string, events: GameEvent[]): EngineError | undefined {
  if (s.phase !== 'discussion') return err('wrong_phase', 'ยิงได้เฉพาะช่วงอภิปรายตอนกลางวัน');
  const actor = player(s, actorId);
  if (!actor || !actor.alive) return err('dead', 'ผู้ที่ตายแล้วยิงไม่ได้');
  if (actor.roleId !== 'gunner') return err('not_your_role', 'คุณไม่ใช่มือปืน');
  if (Number(actor.roleState.gunnerShots) <= 0) return err('no_ammo', 'คุณใช้กระสุนหมดแล้ว');
  const target = player(s, targetId);
  if (!target || !target.alive) return err('bad_target', 'ยิงได้เฉพาะผู้ที่ยังมีชีวิต');
  if (target.id === actorId) return err('self_shot', 'ยิงตัวเองไม่ได้');
  actor.roleState.gunnerShots = Number(actor.roleState.gunnerShots) - 1;
  actor.revealedRole = 'gunner';
  actor.revealedTeam = actor.team;
  events.push(ev(s, 'gunner_shot', true, { actorId, targetId }));
  settleDeaths(s, [{ id: targetId, cause: 'gunner' }], events);
  afterPending(s, events);
  return undefined;
}

// ---------------------------------------------------------------- นายพรานยิง
function applyHunterShot(s: GameState, actorId: string, targetId: string, events: GameEvent[]): EngineError | undefined {
  if (s.pendingHunters.length === 0) return err('no_shot', 'ตอนนี้ไม่มีใครต้องยิง');
  if (s.pendingHunters[0] !== actorId) return err('not_your_turn', 'ยังไม่ถึงตาคุณยิง');
  const target = player(s, targetId);
  if (!target || !target.alive) return err('bad_target', 'ยิงได้เฉพาะผู้ที่ยังมีชีวิต');
  if (target.id === actorId) return err('self_shot', 'ยิงตัวเองไม่ได้');
  s.pendingHunters.shift();
  events.push(ev(s, 'hunter_shot', true, { hunterId: actorId, targetId }));
  settleDeaths(s, [{ id: targetId, cause: 'hunter' }], events);
  afterPending(s, events);
  return undefined;
}

function timeoutHunterShot(s: GameState, events: GameEvent[]): void {
  const hunterId = s.pendingHunters[0];
  const targets = s.players.filter((p) => p.alive && p.id !== hunterId).map((p) => p.id);
  if (s.settings.hunterTimeoutRandom && targets.length > 0) {
    applyHunterShot(s, hunterId, pick(s, targets)!, events);
  } else {
    s.pendingHunters.shift();
    events.push(ev(s, 'hunter_skipped', true, { hunterId }));
    checkEnd(s, events);
    afterPending(s, events);
  }
}

// ---------------------------------------------------------------- เดินเฟส
function resetDay(s: GameState): void {
  s.nominations = {};
  s.nominationOrder = [];
  s.candidates = [];
  s.votes = {};
  s.voteRound = 1;
  s.skipVotes = [];
}

/**
 * เดินเฟสถัดไป — ผู้เรียก (server tick) เป็นคนตัดสินเวลา:
 *  timedOut=false: เดินเฉพาะเมื่อ "ครบแล้ว" (ทุกคนส่งแอคชันแล้ว)
 *  timedOut=true : หมดเวลา เดินต่อแม้ยังไม่ครบ (คนที่ไม่ส่ง = ข้าม/งดออกเสียง)
 */
export function advance(s: GameState, timedOut: boolean, events: GameEvent[]): void {
  // นายพรานค้างยิง: ต้องรอ (หรือสุ่มเมื่อหมดเวลา) ก่อนเดินต่อ
  if (s.pendingHunters.length > 0) {
    if (timedOut) timeoutHunterShot(s, events);
    return;
  }

  switch (s.phase) {
    case 'role_reveal':
      if (timedOut || s.players.every((p) => p.ready)) startNight(s, events);
      return;
    case 'night':
      advanceNight(s, timedOut, events);
      return;
    case 'morning':
      s.phase = 'discussion';
      resetDay(s);
      events.push(ev(s, 'discussion_start', true, {}));
      return;
    case 'discussion':
      if (!timedOut) return;
      s.phase = 'nomination';
      events.push(ev(s, 'nomination_start', true, {}));
      return;
    case 'nomination':
      if (timedOut || nominationsDone(s)) closeNominations(s, events);
      return;
    case 'defense':
      if (!timedOut) return;
      startVote(s, events);
      return;
    case 'vote':
      if (timedOut || votesDone(s)) resolveVote(s, events);
      return;
    case 'execution':
      startNight(s, events);
      return;
    default:
      return;
  }
}
