// _shared/store.ts — ชั้นเก็บข้อมูล (interface) ของเกมแววูฟฝั่งเซิร์ฟเวอร์
// มี 2 แบบ: memoryStore (ทดสอบ/รันในเครื่อง) กับ supabaseStore (ใช้จริง) — ตรรกะเกมอยู่ที่ handlers.ts ไม่ผูกกับที่เก็บ
import type { GameState } from '../../../src/games/werewolf/engine';
import type { RewardBreakdown } from '../../../src/games/werewolf/shared/avatar';

export interface RoomRow {
  room_code: string;
  host_player_id: string | null;
  phase: string;
  day_number: number;
  night_slot: number;
  phase_ends_at: string | null;
  settings: Record<string, unknown>;
  state_version: number;
  winners: unknown;
  is_locked: boolean;
  has_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlayerRow {
  player_id: string;
  room_code: string;
  display_name: string;
  avatar: string | null;
  seat: number;
  is_host: boolean;
  is_bot: boolean;
  is_alive: boolean;
  is_connected: boolean;
  last_seen_at: string;
  can_vote: boolean;
  death_day: number | null;
  death_cause: string | null;
  revealed_role: string | null;
  revealed_team: string | null;
  is_spectator?: boolean; // ผู้ชม (เข้าห้องหลังเริ่มเกม) — ไม่อยู่ในเอนจิน ไม่มีบท
}

/** สถานะฝั่งเซิร์ฟเวอร์ที่เก็บใน ww_room_secrets.engine_state */
export interface ServerState {
  game: GameState;
  /** ก่อนถึงเวลานี้ห้ามเดินเฟส (หน่วงเวลาช่องกลางคืนให้เท่ากัน — กัน timing tell) */
  minUntil: number | null;
  /** เหรียญที่แต่ละคนได้จากเกมที่จบแล้ว (เฉพาะคนที่มีกระเป๋า) */
  rewards?: Record<string, RewardBreakdown>;
}

export interface RoomSecrets {
  rng_seed: string;
  password_hash: string | null;
  engine_state: ServerState | null;
}

export interface PlayerPatch {
  player_id: string;
  is_alive: boolean;
  can_vote: boolean;
  death_day: number | null;
  death_cause: string | null;
  revealed_role: string | null;
  revealed_team: string | null;
}

export interface EventRow {
  day_number: number;
  phase: string;
  kind: string;
  payload: Record<string, unknown>;
}

export interface Commit {
  roomCode: string;
  expectVersion: number;
  room: Partial<Pick<RoomRow, 'phase' | 'day_number' | 'night_slot' | 'phase_ends_at' | 'winners' | 'is_locked'>>;
  engine: ServerState | null;
  players: PlayerPatch[];
  eventsPublic: EventRow[];
  eventsPrivate: EventRow[];
}

export interface PublicEventRecord extends EventRow {
  id: number;
  created_at: string;
}

/** กระเป๋าเงินของผู้เล่น (ผูกกับอุปกรณ์ด้วยตั๋วกระเป๋า ไม่เกี่ยวกับห้อง) — เหรียญ/ของที่ซื้อ/อวตารที่ใส่ */
export interface ReportInput {
  reporter_name: string;
  reporter_username: string | null;
  target_name: string;
  room_code: string;
  reason: string;
  detail: string;
}
export interface ReportRow extends ReportInput {
  id: string;
  created_at: string;
  status: string;
  note: string;
}

export interface WalletRow {
  wallet_id: string;
  coins: number;
  owned: string[];
  avatar: Record<string, string> | null;
  games_played: number;
  wins: number;
  username?: string | null; // ผูกกับบัญชีผู้ใช้ของเว็บ (ใช้ข้ามเครื่อง) · null = กระเป๋าของเครื่องนี้เท่านั้น
}

// (โปรเจกต์ไม่เปิด strict จึงใช้รูปแบบเดียว: ตรวจ ok ก่อนแล้วค่อยอ่าน wallet/reason)
export interface SpinResult {
  ok: boolean;
  duplicate?: boolean;
  reason?: 'poor' | 'none';
}

export interface BuyResult {
  ok: boolean;
  wallet?: WalletRow;
  reason?: 'poor' | 'owned' | 'none';
}

export interface ChatRecord {
  id: number;
  player_id: string;
  display_name: string;
  text: string;
  created_at: string;
}

export interface WwStore {
  getRoom(code: string): Promise<RoomRow | null>;
  getRoomSecrets(code: string): Promise<RoomSecrets | null>;
  /** false ถ้ารหัสห้องซ้ำ */
  createRoom(room: RoomRow, secrets: { rng_seed: string; password_hash: string | null }, host: PlayerRow, hostTokenHash: string): Promise<boolean>;
  listPlayers(code: string): Promise<PlayerRow[]>;
  addPlayer(p: PlayerRow, tokenHash: string): Promise<void>;
  deletePlayer(playerId: string): Promise<void>;
  getAuth(playerId: string): Promise<{ token_hash: string; room_code: string } | null>;
  setAuth(playerId: string, roomCode: string, tokenHash: string): Promise<void>;
  deleteAuth(playerId: string): Promise<void>;
  touchPlayer(playerId: string, atIso: string): Promise<void>;
  setSpectator(playerId: string, flag: boolean): Promise<void>;
  /** แก้ค่าตั้งค่าห้องตอนอยู่ล็อบบี้ (ขยับ state_version ให้ทุกเครื่องรู้) */
  updateLobbySettings(code: string, settings: Record<string, unknown>): Promise<void>;
  /** บันทึกสถานะเกมแบบ "เขียนรวดเดียว" — คืน false ถ้า state_version ไม่ตรง (มีคนเขียนตัดหน้า) */
  commit(c: Commit): Promise<boolean>;
  logPrivate(code: string, e: EventRow): Promise<void>;
  // ---- กระเป๋าเงิน (ทุกอย่างตัดสินที่เซิร์ฟเวอร์ — ซื้อ/ให้เหรียญเป็น atomic กันซื้อซ้อน)
  createWallet(walletId: string, tokenHash: string, coins: number): Promise<void>;
  getWalletTokenHash(walletId: string): Promise<string | null>;
  getWallet(walletId: string): Promise<WalletRow | null>;
  getWalletByUsername(username: string): Promise<WalletRow | null>;
  /**
   * รวมกระเป๋าเก่าของเครื่อง (ยังไม่ผูกบัญชี) เข้ากระเป๋าของบัญชี: เหรียญ/สถิติบวกกัน · ของรวมกัน · อวตารใช้ของบัญชี (ถ้าว่างใช้ของเครื่อง)
   * กระเป๋าเก่าถูก "ปิด" (ศูนย์เหรียญ ไม่มีของ ติดป้าย merged:) กันรวมซ้ำ/ใช้ซ้ำ — คืน false ถ้ามีคนผูก/รวมกระเป๋านี้ไปก่อนแล้ว
   */
  walletAbsorb(intoId: string, fromId: string): Promise<boolean>;
  /** ผูกกระเป๋ากับบัญชี + ตั้งตั๋วของกระเป๋าให้ตรงกับบัญชี (ล็อกอินเครื่องไหนก็ใช้กระเป๋าเดียวกัน) */
  bindWalletToAccount(walletId: string, username: string, tokenHash: string): Promise<void>;
  // ---- บัญชีผู้ใช้ของเว็บ (ตาราง winter_credentials/winter_sessions — เบราว์เซอร์อ่าน/เขียนไม่ได้เลย)
  /** แฮชรหัสผ่านที่เก็บไว้ (null = ยังไม่มีบัญชีนี้/ยังไม่เคยตั้งรหัส) */
  getCredential(username: string): Promise<string | null>;
  /** สร้างรหัสผ่านใหม่ — คืน false ถ้ามีอยู่แล้ว (กันสองคนแย่งตั้งรหัสชื่อเดียวกันพร้อมกัน) */
  createCredential(username: string, hash: string): Promise<boolean>;
  updateCredential(username: string, hash: string): Promise<void>;
  /** ให้แน่ใจว่ามีแถวผู้ใช้ใน winter_users (ตารางสาธารณะของหน้าอันดับ/แชท) */
  ensureUser(username: string): Promise<void>;
  createSession(tokenHash: string, username: string, expiresAtIso: string): Promise<void>;
  getSession(tokenHash: string): Promise<{ username: string; expires_at: string } | null>;
  /** ออกจากระบบ: ยกเลิกเซสชันนี้ */
  deleteSession(tokenHash: string): Promise<void>;
  /** ยกเลิกเซสชันทั้งหมดของบัญชี ยกเว้นอันที่ระบุ (ใช้ตอนเปลี่ยนรหัสผ่าน = เตะเครื่องอื่นออก) */
  deleteSessionsExcept(username: string, keepTokenHash: string): Promise<void>;
  /** มีบัญชีชื่อนี้อยู่แล้วหรือไม่ (ไม่สนตัวพิมพ์ใหญ่/เล็ก) */
  credentialExistsIgnoreCase(username: string): Promise<boolean>;
  // ---- ความก้าวหน้า (ตาราง ww_progress ผูกกับชื่อบัญชี) · เพื่อน · รายงาน
  /** ข้อมูลความก้าวหน้าดิบของบัญชี (null = ยังไม่เคยเล่น) — ให้ normalizeProgress แปลงก่อนใช้ */
  getProgress(username: string): Promise<unknown | null>;
  saveProgress(username: string, progress: { xp: number; stats: { games: number; wins: number } }): Promise<void>;
  /** อันดับตาม XP (มากไปน้อย) */
  listTopProgress(limit: number): Promise<{ username: string; xp: number; wins: number; games: number }[]>;
  /** มีกี่คนที่ XP มากกว่าค่านี้ (ใช้หาอันดับ = ค่านี้ + 1) */
  countProgressAbove(xp: number): Promise<number>;
  /** เพิ่มเหรียญให้กระเป๋า (ไม่นับเป็นเกมที่เล่น) */
  walletAddCoins(walletId: string, amount: number): Promise<void>;
  /** รายชื่อเพื่อนของบัญชี (จากตาราง winter_friends ของเว็บหลัก) */
  getFriendNames(username: string): Promise<string[]>;
  /** เวลาใช้งานล่าสุดของแต่ละชื่อ (ISO) จาก winter_users */
  getLastActive(usernames: string[]): Promise<Record<string, string>>;
  insertReport(r: ReportInput): Promise<void>;
  listReports(status: string, limit: number): Promise<ReportRow[]>;
  resolveReport(id: string, status: string, note: string): Promise<boolean>;
  /** นับคำขอในหน้าต่างเวลา — คืน true ถ้ายังไม่เกินลิมิต (atomic) */
  rateHit(key: string, limit: number, windowSeconds: number): Promise<boolean>;
  walletBuy(walletId: string, itemId: string, price: number): Promise<BuyResult>;
  walletCredit(walletId: string, amount: number, won: boolean): Promise<WalletRow | null>;
  /** ซื้อหลายชิ้นรวดเดียว (แพ็กเกจคอลเลกชัน): หักเหรียญรวมครั้งเดียว + ใส่ของที่ยังไม่มีทั้งหมด หรือไม่ทำอะไรเลย */
  walletBuyMany(walletId: string, itemIds: string[], price: number): Promise<BuyResult>;
  /** หมุนกาชา: หักเหรียญ + ใส่ของ (หรือคืนเหรียญถ้าซ้ำ) ใน transaction เดียว — item ถูกเลือกโดยเซิร์ฟเวอร์ */
  walletSpin(walletId: string, cost: number, itemId: string, refund: number): Promise<SpinResult>;
  /** ให้ของหลายชิ้น (แลกโค้ด) — ข้ามชิ้นที่มีแล้ว คืนจำนวนที่เพิ่มจริง */
  walletGrant(walletId: string, itemIds: string[]): Promise<number | null>;
  walletSetAvatar(walletId: string, avatar: Record<string, string>): Promise<void>;
  /** ผูกที่นั่งในห้องกับกระเป๋า (ไว้จ่ายเหรียญตอนจบเกม) */
  setPlayerWallet(playerId: string, walletId: string | null): Promise<void>;
  /** playerId → walletId ของคนในห้องที่มีกระเป๋า */
  getRoomWallets(code: string): Promise<Record<string, string>>;
  setPlayerAvatar(playerId: string, avatarJson: string): Promise<void>;
  /** เล่นอีกครั้ง: เปลี่ยนเมล็ดสุ่มใหม่ + ล้างบันทึกเหตุการณ์/แชทลับ/เจตนา/คะแนนโหวตของเกมที่แล้ว (แชทสาธารณะคงไว้) */
  resetForNewGame(code: string, newSeed: string): Promise<void>;
  listEvents(code: string, limit: number): Promise<PublicEventRecord[]>;
  insertChatPublic(code: string, p: { player_id: string; display_name: string; text: string }): Promise<void>;
  listChatPublic(code: string, limit: number): Promise<ChatRecord[]>;
  insertChatPrivate(code: string, channel: string, p: { player_id: string; display_name: string; text: string }): Promise<void>;
  listChatPrivate(code: string, channel: string, limit: number): Promise<ChatRecord[]>;
}
