// ตัวช่วยเขียนเทสต์: สร้างเกมที่กำหนดบทตายตัว + เดินคืน/วัน
import { applyAction } from '../reducer';
import { createGame } from '../state';
import { pendingSlotFor } from '../night';
import type { GameAction, GameEvent, GameState, WerewolfSettings } from '../types';

export interface Game {
  s: GameState;
  events: GameEvent[];
}

/** ผู้เล่น p1..pn ได้บทตามลำดับที่ส่งมา (ไม่สุ่ม) ผ่านช่วงดูบทแล้ว อยู่ที่ต้นคืนที่ 1 */
export function makeGame(roles: string[], settings: Partial<WerewolfSettings> = {}, seed = 'test'): Game {
  const players = roles.map((_, i) => ({ id: `p${i + 1}`, name: `ผู้เล่น${i + 1}`, seat: i + 1 }));
  const { state, errors } = createGame({
    roomCode: 'TEST1', players, roleIds: roles, seed, settings, fixedAssignment: true,
  });
  if (!state) throw new Error('สร้างเกมไม่ได้: ' + errors.map((e) => e.messageTh).join(' | '));
  const g: Game = { s: state, events: [] };
  for (const p of players) act(g, { type: 'ready', actorId: p.id });
  act(g, { type: 'advance' });
  return g;
}

export function act(g: Game, a: GameAction) {
  const r = applyAction(g.s, a);
  if (!r.error) {
    g.s = r.state;
    g.events.push(...r.events);
  }
  return r;
}

export function mustAct(g: Game, a: GameAction): void {
  const r = act(g, a);
  if (r.error) throw new Error(`แอคชันถูกปฏิเสธ (${r.error.code}): ${r.error.messageTh}`);
}

/**
 * เล่นหนึ่งคืนตามแผน plan[playerId] = แอคชันกลางคืน (kind/targets/meta)
 * ผู้เล่นที่ไม่อยู่ในแผน = ข้าม · จบแล้วเฟสจะเป็น morning (หรือ game_over)
 */
export function playNight(
  g: Game,
  plan: Record<string, { kind: Extract<GameAction, { type: 'night_action' }>['kind']; targets?: string[]; meta?: Record<string, unknown> }>,
): void {
  if (g.s.phase !== 'night') throw new Error('ไม่ได้อยู่ในช่วงกลางคืน: ' + g.s.phase);
  // กลางคืนทำพร้อมกัน: ทุกคนที่มีอะไรต้องทำส่งแอคชันของตัวเอง (ไม่อยู่ในแผน = ข้าม) แล้วจบคืน
  let guard = 0;
  while (g.s.phase === 'night' && guard++ < 100) {
    let acted = false;
    for (const p of g.s.players) {
      const slot = pendingSlotFor(g.s, p.id);
      if (!slot) continue;
      const plan1 = plan[p.id];
      mustAct(g, plan1
        ? { type: 'night_action', actorId: p.id, kind: plan1.kind, targets: plan1.targets, meta: plan1.meta }
        : { type: 'night_action', actorId: p.id, kind: 'skip' });
      acted = true;
    }
    mustAct(g, { type: 'advance', timedOut: !acted });
  }
}

export function dead(g: Game): string[] {
  return g.s.players.filter((p) => !p.alive).map((p) => p.id);
}

export function alive(g: Game, id: string): boolean {
  return g.s.players.find((p) => p.id === id)!.alive;
}

/** ผ่านช่วงเช้า→อภิปราย→เสนอชื่อ ตามที่กำหนด แล้วโหวต (votes[voter] = target|null) */
export function playDay(g: Game, nominations: Record<string, string>, votes: Record<string, string | null>): void {
  if (g.s.phase === 'morning') mustAct(g, { type: 'advance' }); // → discussion
  mustAct(g, { type: 'advance', timedOut: true }); // → nomination
  for (const [nominator, nominee] of Object.entries(nominations)) {
    mustAct(g, { type: 'nominate', actorId: nominator, targetId: nominee });
  }
  mustAct(g, { type: 'advance', timedOut: true }); // → defense หรือข้ามไปคืน
  if (g.s.phase === 'defense') {
    mustAct(g, { type: 'advance', timedOut: true }); // → vote
    for (const [voter, target] of Object.entries(votes)) {
      mustAct(g, { type: 'vote', actorId: voter, targetId: target });
    }
    mustAct(g, { type: 'advance', timedOut: true }); // → ผลโหวต (execution หรือ revote)
  }
}
