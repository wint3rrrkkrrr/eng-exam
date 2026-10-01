// engine/vote.ts — เสนอชื่อ → แก้ตัว → โหวต → ประหาร (RULES ข้อ 7)
import type { EngineError, GameAction, GameEvent, GameState } from './types';
import { getRole } from './roles';
import { pick } from './rng';
import { alivePlayers, err, ev, mustPlayer, player } from './state';
import { settleDeaths } from './deaths';
import { startNight } from './night';
import { appendSideWinners } from './win';

// ---------------------------------------------------------------- เสนอชื่อ
export function applyNominate(s: GameState, a: Extract<GameAction, { type: 'nominate' }>, events: GameEvent[]): EngineError | undefined {
  if (s.phase !== 'nomination') return err('wrong_phase', 'ตอนนี้ไม่ใช่ช่วงเสนอชื่อ');
  const actor = player(s, a.actorId);
  const target = player(s, a.targetId);
  if (!actor || !actor.alive) return err('dead', 'ผู้ที่ตายแล้วเสนอชื่อไม่ได้');
  if (!target || !target.alive) return err('bad_target', 'เสนอชื่อได้เฉพาะผู้ที่ยังมีชีวิต');
  if (target.id === actor.id) return err('self_nominate', 'เสนอชื่อตัวเองไม่ได้');
  if (s.nominations[actor.id]) return err('already_nominated', 'คุณเสนอชื่อไปแล้ว');
  s.nominations[actor.id] = target.id;
  s.nominationOrder.push(actor.id);
  events.push(ev(s, 'nominate', true, { nominatorId: actor.id, nomineeId: target.id }));
  return undefined;
}

export function nominationsDone(s: GameState): boolean {
  return alivePlayers(s).every((p) => s.nominations[p.id]);
}

/** สรุปผู้ถูกเสนอชื่อ → ไปแก้ตัว หรือไม่มีใครถูกเสนอ → ข้ามไปกลางคืน */
export function closeNominations(s: GameState, events: GameEvent[]): void {
  const count = new Map<string, number>();
  const first = new Map<string, number>();
  s.nominationOrder.forEach((nominator, i) => {
    const t = s.nominations[nominator];
    count.set(t, (count.get(t) ?? 0) + 1);
    if (!first.has(t)) first.set(t, i);
  });
  const ranked = Array.from(count.keys())
    .filter((id) => player(s, id)?.alive)
    .sort((x, y) => (count.get(y)! - count.get(x)!) || (first.get(x)! - first.get(y)!))
    .slice(0, Math.max(1, s.settings.maxNominees));

  if (ranked.length === 0) {
    events.push(ev(s, 'no_nominees', true, {}));
    s.lastExecution = { id: null, outcome: 'no_nominees' };
    startNight(s, events);
    return;
  }
  s.candidates = ranked;
  s.phase = 'defense';
  events.push(ev(s, 'nominees', true, { candidates: ranked, counts: Object.fromEntries(count) }));
}

export function startVote(s: GameState, events: GameEvent[]): void {
  s.phase = 'vote';
  s.votes = {};
  s.voteRound = 1;
  s.voteVeiled = s.veilNext;
  s.veilNext = false;
  events.push(ev(s, 'vote_start', true, { candidates: s.candidates }));
  // โหวตถูกบดบัง: ประกาศสาธารณะ (ไม่บอกว่าใครทำ)
  if (s.voteVeiled) events.push(ev(s, 'vote_veiled', true, {}));
}

// ---------------------------------------------------------------- โหวต
export function eligibleVoters(s: GameState): string[] {
  return alivePlayers(s).filter((p) => p.canVote).map((p) => p.id);
}

export function applyVote(s: GameState, a: Extract<GameAction, { type: 'vote' }>, events: GameEvent[]): EngineError | undefined {
  if (s.phase !== 'vote') return err('wrong_phase', 'ตอนนี้ไม่ใช่ช่วงโหวต');
  const actor = player(s, a.actorId);
  if (!actor || !actor.alive) return err('dead', 'ผู้ที่ตายแล้วโหวตไม่ได้');
  if (!actor.canVote) return err('cannot_vote', 'คุณไม่มีสิทธิ์โหวต');
  if (a.targetId !== null && !s.candidates.includes(a.targetId)) return err('bad_target', 'โหวตได้เฉพาะผู้ถูกเสนอชื่อ');
  if (a.actorId in s.votes) return err('already_voted', 'คุณโหวตไปแล้ว');
  s.votes[a.actorId] = a.targetId;
  events.push(ev(s, 'vote_cast', false, { voterId: a.actorId, targetId: a.targetId }));
  return undefined;
}

export function votesDone(s: GameState): boolean {
  return eligibleVoters(s).every((id) => id in s.votes);
}

/** นับคะแนน (ผู้ใหญ่บ้าน 2 · ผู้รักสันติ 0) */
export function tally(s: GameState): Record<string, number> {
  const t: Record<string, number> = {};
  for (const c of s.candidates) t[c] = 0;
  for (const [voter, target] of Object.entries(s.votes)) {
    if (!target) continue;
    const v = player(s, voter);
    if (!v) continue;
    t[target] = (t[target] ?? 0) + v.voteWeight;
  }
  return t;
}

export function resolveVote(s: GameState, events: GameEvent[]): void {
  const t = tally(s);
  const max = Math.max(0, ...Object.values(t));
  const open = Object.fromEntries(Object.entries(s.votes));
  if (s.voteVeiled) {
    // บดบัง: ผลสาธารณะมีแค่คะแนนรวม ไม่บอกว่าใครโหวตใคร (รายละเอียดเก็บในบันทึกลับ)
    events.push(ev(s, 'vote_result', true, { tally: t, round: s.voteRound, veiled: true }));
    events.push(ev(s, 'vote_result_detail', false, { votes: open, round: s.voteRound }));
  } else {
    events.push(ev(s, 'vote_result', true, { tally: t, votes: open, round: s.voteRound }));
  }

  if (max === 0) return finishNoExecution(s, events, 'no_votes');
  const tops = Object.keys(t).filter((id) => t[id] === max);
  if (tops.length === 1) return execute(s, tops[0], events);

  // ---- เสียงเสมอ
  switch (s.settings.tieRule) {
    case 'random': return execute(s, pick(s, tops)!, events);
    case 'mayor': {
      const mayor = alivePlayers(s).find((p) => p.roleId === 'mayor');
      const choice = mayor ? s.votes[mayor.id] : null;
      if (choice && tops.includes(choice)) return execute(s, choice, events);
      return finishNoExecution(s, events, 'tie');
    }
    case 'revote':
      if (s.voteRound === 1) {
        s.candidates = tops;
        s.votes = {};
        s.voteRound = 2;
        events.push(ev(s, 'revote', true, { candidates: tops }));
        return;
      }
      return finishNoExecution(s, events, 'tie');
    default:
      return finishNoExecution(s, events, 'tie');
  }
}

function finishNoExecution(s: GameState, events: GameEvent[], outcome: string): void {
  s.phase = 'execution';
  s.lastExecution = { id: null, outcome };
  events.push(ev(s, 'execution', true, { playerId: null, outcome }));
}

// ---------------------------------------------------------------- ประหาร
export function execute(s: GameState, id: string, events: GameEvent[]): void {
  const p = mustPlayer(s, id);
  s.phase = 'execution';
  s.resume = 'execution';

  // เจ้าชาย / คนโง่ประจำหมู่บ้าน: รอดจากการโหวตได้ตามจำนวนครั้ง
  if (p.roleId === 'prince' && Number(p.roleState.survived) < s.settings.princeSurvives) {
    p.roleState.survived = Number(p.roleState.survived) + 1;
    p.revealedRole = p.roleId;
    s.lastExecution = { id, outcome: 'prince_survived' };
    events.push(ev(s, 'execution', true, { playerId: id, outcome: 'prince_survived', revealedRole: 'prince' }));
    s.resume = null;
    return;
  }
  if (p.roleId === 'village_idiot' && Number(p.roleState.survived) < s.settings.idiotSurvives) {
    p.roleState.survived = Number(p.roleState.survived) + 1;
    p.canVote = false;
    p.roleState.hagMuted = false; // เสียสิทธิ์ถาวรแล้ว ไม่คืนตอนพ้นวัน
    p.revealedRole = p.roleId;
    s.lastExecution = { id, outcome: 'idiot_survived' };
    events.push(ev(s, 'execution', true, { playerId: id, outcome: 'idiot_survived', revealedRole: 'village_idiot' }));
    s.resume = null;
    return;
  }

  s.lastExecution = { id, outcome: 'executed' };
  events.push(ev(s, 'execution', true, { playerId: id, outcome: 'executed' }));
  settleDeaths(s, [{ id, cause: 'vote' }], events);

  // คนฟอกถูกโหวตประหาร → ชนะ (ลำดับ 2 ตาม RULES 8.2: รองจากคู่รัก ซึ่งต้องเหลือสองคนพอดี จึงไม่ชนผ่านกรณีนี้)
  // (ถ้ามีผู้ชนะ "คู่รัก" พร้อมกัน คู่รักชนะก่อน — คนฟอกเหนือหมาป่า/หมู่บ้าน)
  if (p.roleId === 'tanner' && s.settings.tannerEndsGame && !s.winners?.some((w) => w.team === 'lovers')) {
    s.pendingHunters = [];
    s.winners = appendSideWinners(s, [{ team: 'solo', playerIds: [p.id], reasonTh: 'คนฟอกถูกโหวตประหารสำเร็จ', main: true }]);
    s.phase = 'game_over';
    s.gameOverReason = 'คนฟอกถูกโหวตประหารสำเร็จ';
    events.push(ev(s, 'game_over', true, { winners: s.winners }));
  }

  // ตัวตลกถูกโหวตประหาร → ชนะทันที + เกมจบทันที + ดึงผู้โหวตให้เขา 1 คนตายตาม
  if (p.roleId === 'jester' && !s.winners?.some((w) => w.team === 'lovers')) {
    s.pendingHunters = [];
    const voters = Object.entries(s.votes).filter(([, t]) => t === id).map(([v]) => v).filter((v) => player(s, v)?.alive);
    const revenge = voters.length > 0 ? pick(s, voters) : null;
    if (revenge) settleDeaths(s, [{ id: revenge, cause: 'jester' }], events);
    s.winners = appendSideWinners(s, [{ team: 'solo', playerIds: [p.id], reasonTh: 'ตัวตลกถูกโหวตประหารสำเร็จ', main: true }]);
    s.phase = 'game_over';
    s.gameOverReason = 'ตัวตลกถูกโหวตประหารสำเร็จ';
    events.push(ev(s, 'game_over', true, { winners: s.winners }));
  }

  // คนโง่เจ้าเล่ห์ถูกโหวตประหาร → ชนะเฉพาะตัว แต่เกมเดินต่อ (ประกาศร่วมกับผู้ชนะหลักตอนจบเกมจริง)
  if (p.roleId === 'fool') p.roleState.sideWinFool = true;

  if (s.pendingHunters.length === 0) s.resume = null;
}

export function roleName(id: string): string {
  return getRole(id).nameTh;
}
