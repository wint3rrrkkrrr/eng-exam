// engine/state.ts — สร้างเกม + ตัวช่วยอ่านสถานะ
import type {
  EngineError, EnginePlayer, GameEvent, GameState, Phase, RoleId, WerewolfSettings,
} from './types';
import { getRole } from './roles';
import { hashSeed, shuffle } from './rng';
import { validateSetup, withDefaults } from './settings';

export interface NewPlayer {
  id: string;
  name: string;
  seat: number;
}

export interface CreateGameOptions {
  roomCode: string;
  players: NewPlayer[];
  roleIds: RoleId[];
  seed: string;
  settings?: Partial<WerewolfSettings>;
  /** ★ ใช้ในเทสต์เท่านั้น: กำหนดบทตามลำดับผู้เล่นโดยไม่สุ่ม */
  fixedAssignment?: boolean;
}

export function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

export function ev(
  s: GameState,
  kind: string,
  isPublic: boolean,
  data: Record<string, unknown> = {},
  phase: Phase = s.phase,
): GameEvent {
  return { kind, day: s.dayNumber, phase, public: isPublic, data };
}

export function createGame(opts: CreateGameOptions): { state: GameState | null; errors: EngineError[] } {
  const issues = validateSetup(opts.roleIds, opts.players.length);
  const errors: EngineError[] = issues
    .filter((i) => i.level === 'error')
    .map((i) => ({ code: 'setup', messageTh: i.messageTh }));
  if (errors.length > 0) return { state: null, errors };

  const rng = { rngState: hashSeed(opts.seed) };
  const order = opts.fixedAssignment ? opts.roleIds.slice() : shuffle(rng, opts.roleIds);

  const players: EnginePlayer[] = opts.players
    .slice()
    .sort((a, b) => a.seat - b.seat)
    .map((p, i) => {
      const def = getRole(order[i]);
      return {
        id: p.id,
        seat: p.seat,
        name: p.name,
        roleId: def.id,
        startTeam: def.startTeam,
        team: def.startTeam,
        winWith: def.winWith,
        alive: true,
        canVote: true,
        voteWeight: def.voteWeight ?? 1,
        roleState: def.initRoleState ? def.initRoleState() : {},
        loverOf: null,
        deathDay: null,
        deathCause: null,
        revealedRole: null,
        revealedTeam: null,
        revealedIsWolf: null,
        ready: false,
      };
    });

  const state: GameState = {
    v: 1,
    roomCode: opts.roomCode,
    phase: 'role_reveal',
    dayNumber: 0,
    settings: withDefaults(opts.settings),
    players,
    night: null,
    loverPairs: [],
    nominations: {},
    nominationOrder: [],
    candidates: [],
    votes: {},
    voteRound: 1,
    pendingHunters: [],
    resume: null,
    tonightDeaths: [],
    lastExecution: null,
    delayed: [],
    packExtraKill: false,
    timeAdjust: null,
    veilNext: false,
    voteVeiled: false,
    privateLog: {},
    winners: null,
    gameOverReason: null,
    rngState: rng.rngState,
    seed: opts.seed,
  };
  return { state, errors: [] };
}

// ---------------------------------------------------------------- ตัวช่วยอ่าน
export function player(s: GameState, id: string): EnginePlayer | undefined {
  return s.players.find((p) => p.id === id);
}

export function mustPlayer(s: GameState, id: string): EnginePlayer {
  const p = player(s, id);
  if (!p) throw new Error(`ไม่พบผู้เล่น ${id}`);
  return p;
}

export function alivePlayers(s: GameState): EnginePlayer[] {
  return s.players.filter((p) => p.alive);
}

export function playersWithRole(s: GameState, roleId: RoleId, aliveOnly = true): EnginePlayer[] {
  return s.players.filter((p) => p.roleId === roleId && (!aliveOnly || p.alive));
}

export function err(code: string, messageTh: string): EngineError {
  return { code, messageTh };
}
