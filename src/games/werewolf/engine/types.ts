// engine/types.ts — ชนิดข้อมูลหลักของเครื่องยนต์กติกาแววูฟ
// ★ ห้าม import react / @supabase/supabase-js / motion ในโฟลเดอร์ engine/ (กฎเหล็กข้อ 7)

export type Team = 'village' | 'wolf' | 'vampire' | 'cult' | 'solo';
export type WinWith = 'village' | 'wolf' | 'vampire' | 'cult' | 'self' | 'follow';
export type RoleId = string;

export type Phase =
  | 'lobby'
  | 'role_reveal'
  | 'night'
  | 'morning'
  | 'discussion'
  | 'nomination'
  | 'defense'
  | 'vote'
  | 'execution'
  | 'game_over';

export type DeathCause = 'wolf' | 'poison' | 'vote' | 'hunter' | 'lover' | 'bodyguard' | 'disconnect' | 'vigilante' | 'guilt' | 'gunner' | 'jester' | 'solo_kill' | 'fire' | 'hunt_wolf' | 'chupacabra';

// ---------------------------------------------------------------- ตั้งค่า
export interface WerewolfSettings {
  firstNightKill: boolean; // หมาป่าฆ่าได้ตั้งแต่คืนแรกไหม
  wolfDisagree: 'none' | 'random'; // ฝูงเลือกไม่ตรงกัน: ไม่มีใครตาย / สุ่มจากที่เลือก
  doctorSelfProtect: boolean;
  doctorNoRepeat: boolean; // กันคนเดิมซ้ำสองคืนติดไม่ได้
  witchBothSameNight: boolean;
  witchSelfHeal: boolean;
  witchRefundOnProtected: boolean; // หมอกันไว้แล้วแม่มดชุบ → ได้ยาคืน
  cupidSelf: boolean;
  loversWin: boolean; // เงื่อนไขคู่รักข้ามฝ่าย
  hunterTimeoutRandom: boolean; // หมดเวลายังไม่ยิง: สุ่ม / ไม่ยิง
  revealOnDeath: 'vote' | 'role' | 'none' | 'team' | 'wolf'; // vote = เปิดบทเฉพาะผู้ตายตอนกลางวัน/โหวต (ตายกลางคืนไม่เปิด)
  tieRule: 'none' | 'revote' | 'random' | 'mayor';
  maxNominees: number;
  liveVotes: boolean; // เห็นคะแนนโหวตสดๆ ระหว่างโหวต (เปิด = ทุกคนเห็นว่าใครโหวตใครทันที)
  idiotSurvives: number; // คนโง่รอดจากการโหวตได้กี่ครั้ง
  princeSurvives: number;
  tannerEndsGame: boolean;
  wolfWinOperator: 'gte' | 'gt'; // หมาป่า ≥ หรือ > ผู้เล่นอื่น
  blockedNotice: boolean; // แจ้งผู้ถูกขัดขวาง (ใช้ตอน M6)
  disconnectMode: 'wait' | 'bot' | 'dead'; // ผู้เล่นหลุดกลางเกม: รอ / บอทเล่นแทน / ถือว่าตาย
  disconnectGraceSeconds: number; // หลุดนานเท่าไรจึงใช้ค่าด้านบน
}

// ---------------------------------------------------------------- บท
export type IntentKind =
  | 'wolf_bite'
  | 'protect_doctor'
  | 'protect_bodyguard'
  | 'protect_priest'
  | 'witch'
  | 'investigate_seer'
  | 'investigate_aura'
  | 'investigate_mystic'
  | 'investigate_pair'
  | 'investigate_group'
  | 'inspect_grave'
  | 'vigilante_shot'
  | 'investigate_sorcerer'
  | 'investigate_wolfseer'
  | 'alpha_convert'
  | 'infect'
  | 'wolf_bite_extra'
  | 'predict'
  | 'vampire_bite'
  | 'cult_recruit'
  | 'copy_role'
  | 'pick_model'
  | 'solo_kill'
  | 'oil_mark'
  | 'ignite'
  | 'hunt_wolf'
  | 'hunt_chupacabra'
  | 'cupid_pair'
  | 'swap'
  | 'block' // ผู้หยุดความสามารถ
  | 'hag_curse' // หญิงชรา: ห้ามโหวตวันถัดไป
  | 'skip';

export interface AbilityDef {
  kind: IntentKind;
  nightSlot?: number; // ช่องตื่นของความสามารถนี้โดยเฉพาะ (ไม่ระบุ = ใช้ RoleDef.nightSlot) — ใช้กับบทที่ตื่น 2 ช่อง เช่น หมาป่าผู้หยุดความสามารถ
  targets: number; // จำนวนเป้าหมาย (0 = ไม่ต้องเลือก เช่น แม่มดส่งผ่าน meta)
  canTargetSelf: boolean;
  canTargetDead: boolean;
  noRepeatNights?: number;
  uses?: number | 'unlimited';
}

// ทุกบทต้องมีครบ (กติกาเจ้าของเว็บข้อ 22) — เทสต์ roles.completeness ตรวจให้
export interface RoleDef {
  id: RoleId;
  nameTh: string;
  descriptionTh: string;
  kind: 'normal' | 'special' | 'neutral';
  startTeam: Team;
  winWith: WinWith;
  winTh: string; // เงื่อนไขชนะ (ภาษาไทย) — ห้ามว่าง
  goalTh: string; // เป้าหมาย
  balanceScore: number;
  nightSlot: number | null; // ช่องตื่น (RULES ข้อ 5) — null = ไม่ตื่น
  wakes: 'every-night' | 'first-night' | 'passive' | 'on-death' | 'day';
  autoAck?: boolean; // ตื่นแต่ไม่ต้องเลือกอะไร (เช่น ช่างก่อสร้าง)
  abilities: AbilityDef[];
  priority: number; // ลำดับในท่อประมวลผล (เลขน้อย = ก่อน)
  onBlocked: 'cancel-keep-uses' | 'cancel-use-up' | 'n/a';
  onTargetDeath: 'fizzle-keep-uses' | 'fizzle-use-up' | 'n/a';
  onActorDeath: string; // ผลเมื่อผู้ใช้ตาย
  interactions: string[]; // ปฏิสัมพันธ์กับบทอื่น
  seenAsWolf?: boolean; // ผู้หยั่งรู้ "หมาป่าหรือไม่" เห็นเป็นหมาป่า (หมาป่า/ลวงตา)
  voteWeight?: number; // ค่าเริ่มต้น 1
  initRoleState?: () => Record<string, unknown>;
}

// ---------------------------------------------------------------- ผู้เล่น/สถานะ
export interface EnginePlayer {
  id: string;
  seat: number;
  name: string;
  roleId: RoleId;
  startTeam: Team;
  team: Team;
  winWith: WinWith;
  alive: boolean;
  canVote: boolean;
  voteWeight: number;
  roleState: Record<string, unknown>;
  loverOf: string | null;
  deathDay: number | null;
  deathCause: DeathCause | null;
  // สิ่งที่ "เปิดเผยต่อสาธารณะแล้ว" ตามกติกา (ตั้งตอนตายหรือถูกประกาศ)
  revealedRole: RoleId | null;
  revealedTeam: Team | null;
  revealedIsWolf: boolean | null;
  ready: boolean; // กด "พร้อม" ตอนดูบท
}

export interface Intent {
  actorId: string; // 'wolves' สำหรับฝูงหมาป่า
  roleId: RoleId;
  slot: number;
  kind: IntentKind;
  targets: string[];
  meta: Record<string, unknown>;
  cancelled?: boolean;
}

export interface NightSlot {
  slot: number;
  roleIds: RoleId[];
  actors: string[]; // ผู้เล่นที่ยังรอดและต้องทำงานช่องนี้
  idle: boolean; // ไม่มีใครรอด/ไม่มีบทนี้ — ต้องหน่วงเวลาเท่าช่องจริง (กัน timing tell)
  auto: boolean; // ไม่ต้องเลือกอะไร
}

export interface NightState {
  slots: NightSlot[];
  idx: number;
  intents: Intent[];
  wolfVotes: Record<string, string | null>;
  acted: Record<string, boolean>;
  wolfTarget: string | null; // เหยื่อที่ฝูงเลือก (แม่มดเห็น)
  veilBy: string[]; // หมาป่าผู้บดบังที่สั่งบดบังโหวตวันถัดไปคืนนี้
}

export type PrivateResult =
  | { kind: 'seer'; day: number; targetId: string; isWolf: boolean }
  | { kind: 'lover'; day: number; loverId: string }
  | { kind: 'blocked'; day: number }
  | { kind: 'muted'; day: number }
  | { kind: 'promoted'; day: number; roleId: RoleId }
  | { kind: 'cursed'; day: number }
  | { kind: 'tough'; day: number }
  | { kind: 'sorcerer_check'; day: number; targetId: string; isSeer: boolean }
  | { kind: 'wolfseer_check'; day: number; targetId: string; roleId: RoleId; team: Team }
  | { kind: 'infected'; day: number }
  | { kind: 'mirrored'; day: number }
  | { kind: 'vampire_bitten'; day: number }
  | { kind: 'cult_recruited'; day: number }
  | { kind: 'copied'; day: number; roleId: RoleId }
  | { kind: 'aura'; day: number; targetId: string; aura: 'good' | 'evil' | 'neutral' }
  | { kind: 'mystic'; day: number; targetId: string; category: AbilityCategory }
  | { kind: 'detective'; day: number; targetIds: [string, string]; sameTeam: boolean }
  | { kind: 'investigator'; day: number; targetIds: string[]; hasWolf: boolean }
  | { kind: 'grave'; day: number; targetId: string; roleId: RoleId; team: Team };

/** ประเภทความสามารถที่ผู้หยั่งรู้ลึกลับเห็น (🔸A16) */
export type AbilityCategory = 'kill' | 'protect' | 'investigate' | 'block' | 'convert' | 'none';

export interface Winner {
  team: 'village' | 'wolf' | 'lovers' | 'solo' | 'vampire' | 'cult';
  playerIds: string[];
  reasonTh: string;
  main: boolean; // ผู้ชนะหลัก (ทำให้เกมจบ)
}

export interface DelayedEffect {
  kind: 'die' | 'convert_wolf' | 'convert_vampire';
  targetId: string;
  onDay: number; // จะเกิดผลตอนจบคืนของวันที่นี้
  cause?: DeathCause;
}

export interface GameState {
  v: 1;
  roomCode: string;
  phase: Phase;
  dayNumber: number;
  settings: WerewolfSettings;
  players: EnginePlayer[];
  night: NightState | null;
  loverPairs: [string, string][];
  nominations: Record<string, string>; // ผู้เสนอ → ผู้ถูกเสนอ
  nominationOrder: string[]; // ผู้เสนอเรียงตามเวลา
  candidates: string[]; // ผู้ถูกเสนอชื่อที่เข้าโหวต
  votes: Record<string, string | null>;
  voteRound: number;
  pendingHunters: string[];
  resume: 'morning' | 'execution' | null;
  tonightDeaths: { id: string; cause: DeathCause }[];
  lastExecution: { id: string | null; outcome: string } | null;
  privateLog: Record<string, PrivateResult[]>;
  /** ผลที่จะเกิด "ตอนจบคืนถัดไป" (คนถึก · ชาวบ้านต้องคำสาป · ความรู้สึกผิดของผู้พิทักษ์ประชาชน) */
  delayed: DelayedEffect[];
  /** ลูกหมาป่าตายแล้ว → ฝูงฆ่าได้ 2 คนในคืนถัดไป (ใช้แล้วเคลียร์) */
  packExtraKill: boolean;
  veilNext: boolean; // คืนนี้มีหมาป่าสั่งบดบัง → โหวตวันถัดไปจะซ่อนว่าใครโหวตใคร
  voteVeiled: boolean; // โหวตรอบนี้ถูกบดบังอยู่หรือไม่
  winners: Winner[] | null;
  gameOverReason: string | null;
  rngState: number;
  seed: string;
}

// ---------------------------------------------------------------- แอคชัน/ผลลัพธ์
export type GameAction =
  | { type: 'ready'; actorId: string }
  | { type: 'night_action'; actorId: string; kind: IntentKind; targets?: string[]; meta?: Record<string, unknown> }
  | { type: 'nominate'; actorId: string; targetId: string }
  | { type: 'vote'; actorId: string; targetId: string | null }
  | { type: 'hunter_shot'; actorId: string; targetId: string }
  | { type: 'disconnect_dead'; actorId: string } // เซิร์ฟเวอร์สั่งเมื่อหลุดเกินเวลาและตั้งค่า 'ถือว่าตาย'
  | { type: 'gunner_shot'; actorId: string; targetId: string } // มือปืน: ยิงได้ตอนช่วงอภิปราย (กลางวัน)
  | { type: 'advance'; timedOut?: boolean };

export interface GameEvent {
  kind: string;
  day: number;
  phase: Phase;
  public: boolean; // true = เปิดเผยได้ (ลง ww_events) / false = ลับ (ลง ww_events_private)
  data: Record<string, unknown>;
}

export interface EngineError {
  code: string;
  messageTh: string;
}

export interface ApplyResult {
  state: GameState;
  events: GameEvent[];
  error?: EngineError;
}
