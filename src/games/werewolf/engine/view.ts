// engine/view.ts — ★ "มุมมองของฉัน": กรองข้อมูลให้ผู้เล่นแต่ละคนเห็นเฉพาะสิ่งที่ควรเห็น
// ใช้โดย netlify/functions/ww-my-view ตอน M3 · มีเทสต์ views.leak.test.ts คุมไม่ให้ความลับรั่ว
import type { GameState, IntentKind, PrivateResult, RoleId, Team } from './types';
import { getRole } from './roles';
import { actedKey, canVeil, currentSlot, legalTargets, witchOptions } from './night';
import { publicCause } from './deaths';
import { player } from './state';
import { TH } from '../text/th';

/** ค่าแทน "โหวตแล้วแต่ถูกบดบัง" ในกระดานโหวตสด */
export const VEILED = '__veiled__';

export interface PublicPlayerView {
  playerId: string;
  displayName: string;
  seat: number;
  isAlive: boolean;
  canVote: boolean;
  revealedRole: RoleId | null; // ★ null เสมอถ้ายังไม่เข้าเงื่อนไขเปิดเผย
  revealedTeam: Team | null;
  revealedIsWolf: boolean | null;
  deathCause: 'night' | 'vote' | 'hunter' | 'lover' | 'disconnect' | null;
}

export interface MyTurn {
  isMyTurn: boolean;
  actionKind: IntentKind | 'hunter_shot' | 'nominate' | 'vote' | null;
  promptTh: string | null;
  selectableTargets: string[];
  targetCount: number; // ต้องเลือกกี่คน (หน้าจอใช้กำหนดจำนวนที่แตะเลือกได้)
  extra?: Record<string, unknown>; // เช่น ตัวเลือกยาของแม่มด
}

export interface MyView {
  phase: GameState['phase'];
  dayNumber: number;
  nightSlot: number | null;
  narrationTh: string;
  me: {
    playerId: string;
    role: RoleId;
    roleNameTh: string;
    descriptionTh: string;
    team: Team;
    isAlive: boolean;
    canVote: boolean;
    roleState: Record<string, unknown>;
  };
  allies: { playerId: string; role: RoleId }[];
  lover: string | null;
  myTurn: MyTurn;
  privateResults: { day: number; textTh: string }[];
  publicPlayers: PublicPlayerView[];
  nominations: Record<string, string>;
  candidates: string[];
  myVote: string | null | undefined;
  /** คะแนนโหวตสด (voter → target) — มีเฉพาะตอนโหวตและเปิดตัวเลือก liveVotes · ไม่เช่นนั้น null */
  liveVotes: Record<string, string | null> | null;
  /** โหวตรอบนี้ถูกหมาป่าบดบังหรือไม่ (ถ้าใช่ liveVotes จะบอกแค่ว่าใครโหวตแล้ว ไม่บอกว่าโหวตใคร) */
  voteVeiled: boolean;
  lastExecution: GameState['lastExecution'];
  gameOver: null | {
    winners: GameState['winners'];
    allRoles: { playerId: string; role: RoleId; team: Team }[];
  };
}

const NO_TURN: MyTurn = { isMyTurn: false, actionKind: null, promptTh: null, selectableTargets: [], targetCount: 0 };

function nameOf(s: GameState, id: string): string {
  return player(s, id)?.name ?? '?';
}

function formatResult(s: GameState, r: PrivateResult): { day: number; textTh: string } {
  switch (r.kind) {
    case 'seer':
      return { day: r.day, textTh: TH.result.seer(nameOf(s, r.targetId), r.isWolf, r.day) };
    case 'lover':
      return { day: r.day, textTh: TH.result.lover(nameOf(s, r.loverId)) };
    case 'muted':
      return { day: r.day, textTh: TH.result.muted };
    case 'promoted':
      return { day: r.day, textTh: TH.result.promoted };
    case 'cursed':
      return { day: r.day, textTh: TH.result.cursed };
    case 'tough':
      return { day: r.day, textTh: TH.result.tough };
    case 'infected':
      return { day: r.day, textTh: TH.result.infected };
    case 'mirrored':
      return { day: r.day, textTh: TH.result.mirrored };
    case 'vampire_bitten':
      return { day: r.day, textTh: TH.result.vampireBitten };
    case 'cult_recruited':
      return { day: r.day, textTh: TH.result.cultRecruited };
    case 'copied':
      return { day: r.day, textTh: TH.result.copied(getRole(r.roleId).nameTh) };
    case 'sorcerer_check':
      return { day: r.day, textTh: TH.result.sorcererCheck(nameOf(s, r.targetId), r.isSeer, r.day) };
    case 'wolfseer_check':
      return { day: r.day, textTh: TH.result.wolfseerCheck(nameOf(s, r.targetId), getRole(r.roleId).nameTh, r.team, r.day) };
    case 'aura':
      return { day: r.day, textTh: TH.result.aura(nameOf(s, r.targetId), r.aura, r.day) };
    case 'mystic':
      return { day: r.day, textTh: TH.result.mystic(nameOf(s, r.targetId), r.category, r.day) };
    case 'detective':
      return { day: r.day, textTh: TH.result.detective(nameOf(s, r.targetIds[0]), nameOf(s, r.targetIds[1]), r.sameTeam, r.day) };
    case 'investigator':
      return { day: r.day, textTh: TH.result.investigator(r.targetIds.map((id) => nameOf(s, id)), r.hasWolf, r.day) };
    case 'grave':
      return { day: r.day, textTh: TH.result.grave(nameOf(s, r.targetId), getRole(r.roleId).nameTh, r.team, r.day) };
    default:
      return { day: r.day, textTh: 'ความสามารถของคุณถูกขัดขวาง' };
  }
}

export function buildView(s: GameState, viewerId: string): MyView | null {
  const me = player(s, viewerId);
  if (!me) return null;
  const def = getRole(me.roleId);

  // ---- เพื่อนร่วมฝ่าย (ตามกติกาที่อนุญาตเท่านั้น) — รู้จักกันตั้งแต่คืนแรก
  const allies: MyView['allies'] = [];
  if (s.dayNumber >= 1) {
    if (me.team === 'wolf') {
      for (const p of s.players) if (p.id !== me.id && p.team === 'wolf') allies.push({ playerId: p.id, role: p.roleId });
    }
    if (me.roleId === 'mason') {
      for (const p of s.players) if (p.id !== me.id && p.roleId === 'mason') allies.push({ playerId: p.id, role: 'mason' });
    }
    if (me.team === 'vampire') {
      for (const p of s.players) if (p.id !== me.id && p.team === 'vampire') allies.push({ playerId: p.id, role: p.roleId });
    }
    if (me.team === 'cult') {
      for (const p of s.players) if (p.id !== me.id && p.team === 'cult') allies.push({ playerId: p.id, role: p.roleId });
    }
  }

  // ---- ตาของฉัน
  let myTurn: MyTurn = NO_TURN;
  if (s.pendingHunters[0] === me.id) {
    // นายพรานตายแล้วแต่ยังต้องยิง (กรณีเดียวที่ผู้ตายมีตาเล่น)
    myTurn = {
      isMyTurn: true, actionKind: 'hunter_shot', promptTh: TH.prompt.hunter_shot, targetCount: 1,
      selectableTargets: s.players.filter((p) => p.alive && p.id !== me.id).map((p) => p.id),
    };
  } else if (me.alive && s.phase === 'night' && s.night) {
    const slot = currentSlot(s);
    if (slot && slot.actors.includes(me.id) && !slot.auto && !s.night.acted[actedKey(me.id, slot.slot)]) {
      const ab = def.abilities.find((x) => (x.nightSlot ?? def.nightSlot) === slot.slot);
      if (ab) {
        myTurn = {
          isMyTurn: true,
          actionKind: ab.kind,
          promptTh: TH.prompt[ab.kind] ?? null,
          targetCount: ab.targets,
          selectableTargets: ab.kind === 'witch' ? [] : legalTargets(s, me, ab.kind),
        };
        if (ab.kind === 'witch') {
          const o = witchOptions(s, me);
          // แม่มดเห็นเหยื่อของฝูง (กติกาอนุญาตเฉพาะแม่มด)
          myTurn.extra = { victimId: o.victimId, canHeal: o.canHeal, poisonTargets: o.poisonTargets };
        }
        if (ab.kind === 'wolf_bite' && canVeil(me)) myTurn.extra = { canVeil: true };
        if (ab.kind === 'oil_mark') myTurn.extra = { marked: Array.isArray(me.roleState.marked) ? me.roleState.marked : [] };
      }
    }
  } else if (me.alive && s.phase === 'nomination' && !s.nominations[me.id]) {
    myTurn = {
      isMyTurn: true, actionKind: 'nominate', promptTh: TH.prompt.nominate, targetCount: 1,
      selectableTargets: s.players.filter((p) => p.alive && p.id !== me.id).map((p) => p.id),
    };
  } else if (me.alive && me.canVote && s.phase === 'vote' && !(me.id in s.votes)) {
    myTurn = { isMyTurn: true, actionKind: 'vote', promptTh: TH.prompt.vote, targetCount: 1, selectableTargets: s.candidates.slice() };
  }

  // ---- บรรยาย (เหมือนกันทุกคน — ไม่เผยว่าช่องนี้ว่างหรือมีคน)
  let narrationTh = '';
  if (s.phase === 'night' && s.night) {
    const slot = currentSlot(s);
    narrationTh = slot ? TH.narration.wake(getRole(slot.roleIds[0]).nameTh) : TH.narration.nightStart;
  } else if (s.phase === 'morning') narrationTh = TH.narration.morning;
  else if (s.phase === 'discussion') narrationTh = TH.narration.discussion;
  else if (s.phase === 'nomination') narrationTh = TH.narration.nomination;
  else if (s.phase === 'vote') narrationTh = TH.narration.vote;
  else if (s.phase === 'game_over') narrationTh = TH.narration.gameOver;

  const publicPlayers: PublicPlayerView[] = s.players.map((p) => ({
    playerId: p.id,
    displayName: p.name,
    seat: p.seat,
    isAlive: p.alive,
    canVote: p.canVote,
    revealedRole: p.revealedRole,
    revealedTeam: p.revealedTeam,
    revealedIsWolf: p.revealedIsWolf,
    deathCause: p.deathCause ? publicCause(p.deathCause) : null,
  }));

  const over = s.phase === 'game_over';

  return {
    phase: s.phase,
    dayNumber: s.dayNumber,
    nightSlot: s.phase === 'night' ? currentSlot(s)?.slot ?? null : null,
    narrationTh,
    me: {
      playerId: me.id,
      role: me.roleId,
      roleNameTh: def.nameTh,
      descriptionTh: def.descriptionTh,
      team: me.team,
      isAlive: me.alive,
      canVote: me.canVote,
      roleState: { ...me.roleState },
    },
    allies,
    lover: me.loverOf,
    myTurn,
    privateResults: (s.privateLog[me.id] ?? []).map((r) => formatResult(s, r)),
    publicPlayers,
    nominations: { ...s.nominations },
    candidates: s.candidates.slice(),
    myVote: s.phase === 'vote' ? s.votes[me.id] : undefined,
    liveVotes: s.phase === 'vote' && s.settings.liveVotes
      ? (s.voteVeiled
        ? Object.fromEntries(Object.keys(s.votes).map((id) => [id, id === me.id ? s.votes[id] : VEILED]))
        : { ...s.votes })
      : null,
    voteVeiled: s.phase === 'vote' && s.voteVeiled,
    lastExecution: s.lastExecution,
    gameOver: over
      ? {
          winners: s.winners,
          allRoles: s.players.map((p) => ({ playerId: p.id, role: p.roleId, team: p.team })),
        }
      : null,
  };
}
