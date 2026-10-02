// _shared/handlers.ts — ★ ผู้ตัดสิน: ตรรกะของทุก endpoint /api/ww/*
// ไม่ผูกกับ Netlify หรือ Supabase (รับ WwStore เข้ามา) → ทดสอบได้ด้วย MemoryStore
// กฎเหล็ก: เบราว์เซอร์ส่งได้แค่ "ความตั้งใจ" · actorId มาจากตั๋วที่ตรวจแล้วเสมอ ไม่เชื่อค่าในตัวคำขอ
import {
  applyAction, botActionFor, buildView, createGame, hashSeed, validateSetup, withDefaults,
} from '../../../src/games/werewolf/engine';
import type { GameAction, GameEvent, GameState } from '../../../src/games/werewolf/engine';
import { publicCause } from '../../../src/games/werewolf/engine/deaths';
import {
  DEFAULT_LOBBY, TIME_ADJUST_SECONDS, expandRoles, sanitizeLobby,
} from '../../../src/games/werewolf/shared/lobby';
import type { LobbySettings } from '../../../src/games/werewolf/shared/lobby';
import type {
  ActionRequest, AuthResponse, ChatLine, ChatRequest, GachaResponse, GachaResult, LobbyPlayer, MyViewResponse, RedeemResponse, WalletCreated, WalletView,
} from '../../../src/games/werewolf/shared/api';
import {
  ITEM_BY_ID, STARTING_COINS, gachaPool, itemRarity, computeReward, randomFreeAvatar, sanitizeAvatar, serializeAvatar,
} from '../../../src/games/werewolf/shared/avatar';
import type { AvatarConfig, AvatarItem, Rarity, RewardBreakdown } from '../../../src/games/werewolf/shared/avatar';
import { DUPLICATE_REFUND_PCT, SPIN_COUNTS, WHEEL_BY_ID, setItemIds } from '../../../src/games/werewolf/shared/avatarExtra';
import { randomInt } from 'node:crypto';
import { setForCode } from './redeemCodes';
import {
  checkPassword, hashPassword, hashToken, isLegacySha256, legacySha256, newId, newRoomCode, newSeed, newToken, randBetween, safeEqual, walletTokenFor,
} from './crypto';
import type {
  ChatRecord, Commit, EventRow, PlayerPatch, PlayerRow, RoomRow, ServerState, WalletRow, WwStore,
} from './store';
import { computeTiming, signature } from './timers';
import { applyGameResult, levelFromXp, normalizeProgress, progressView, titleForLevel } from '../../../src/games/werewolf/shared/progress';

export interface Ctx {
  store: WwStore;
  now: () => number;
  rand?: (lo: number, hi: number) => number;
  /** ความลับของเซิร์ฟเวอร์ (ไว้คำนวณตั๋วกระเป๋าของบัญชี) — ไม่ระบุ = ค่าสำหรับทดสอบ */
  secret?: string;
  /** เปิดตัวจำกัดความถี่ (rate limit) — เปิดเฉพาะตอนใช้ Supabase จริง */
  rateLimit?: boolean;
}

const DEV_SECRET = 'ww-dev-secret-not-for-production';
const SESSION_DAYS = 60;

export interface HandlerResult {
  status: number;
  body: unknown;
}

const ok = (body: unknown): HandlerResult => ({ status: 200, body });
const fail = (status: number, errorTh: string, code?: string): HandlerResult => ({ status, body: { errorTh, code } });

export type Headers = Record<string, string | undefined>;

const MAX_COMMIT_RETRIES = 4;
const CHAT_MAX = 300;

// ---------------------------------------------------------------- ตัวช่วย
function cleanName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  // eslint-disable-next-line no-control-regex
  const s = raw.replace(/[\u0000-\u001f\u007f]/g, '').trim().replace(/\s+/g, ' ');
  if (s.length < 1 || s.length > 30) return null;
  return s;
}

function cleanAvatar(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length === 0) return null;
  // รับเฉพาะอีโมจิ/ข้อความสั้น หรือ data URI ขนาดเล็ก (กันยัดข้อมูลก้อนใหญ่ลงตารางสาธารณะ)
  return raw.length <= 2000 ? raw : null;
}

function cleanCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim().toUpperCase();
  return /^[A-Z0-9]{5}$/.test(s) ? s : null;
}

function lobbyOf(room: RoomRow): LobbySettings {
  return sanitizeLobby(room.settings, DEFAULT_LOBBY);
}

const PRESENCE_MS = 15_000; // ไม่ส่งสัญญาณ (โพลทุก ~2.5 วิ) เกินนี้ = หลุด
const MAX_SPECTATORS = 12;

function isOnline(p: PlayerRow, nowMs: number): boolean {
  return p.is_bot || nowMs - Date.parse(p.last_seen_at) < PRESENCE_MS;
}

function toLobbyPlayer(p: PlayerRow, nowMs: number): LobbyPlayer {
  return {
    playerId: p.player_id,
    displayName: p.display_name,
    avatar: p.avatar,
    seat: p.seat,
    isHost: p.is_host,
    isAlive: p.is_alive,
    isConnected: isOnline(p, nowMs),
    isSpectator: p.is_spectator === true,
    canVote: p.can_vote,
    revealedRole: p.revealed_role,
    deathCause: p.death_cause,
  };
}

function toChatLine(c: ChatRecord): ChatLine {
  return { id: c.id, playerId: c.player_id, displayName: c.display_name, text: c.text, createdAt: c.created_at };
}

function eventRows(events: GameEvent[]): { pub: EventRow[]; priv: EventRow[] } {
  const pub: EventRow[] = [];
  const priv: EventRow[] = [];
  for (const e of events) {
    const row = { day_number: e.day, phase: e.phase, kind: e.kind, payload: e.data };
    (e.public ? pub : priv).push(row);
  }
  return { pub, priv };
}

/** ข้อมูลผู้เล่นฝั่งเปิดเผย: สาเหตุตายเป็นแบบ "บอกได้" เท่านั้น */
function playerPatches(g: GameState): PlayerPatch[] {
  return g.players.map((p) => ({
    player_id: p.id,
    is_alive: p.alive,
    can_vote: p.canVote,
    death_day: p.deathDay,
    death_cause: p.deathCause ? publicCause(p.deathCause) : null,
    revealed_role: p.revealedRole,
    revealed_team: p.revealedTeam,
  }));
}

// ---------------------------------------------------------------- ยืนยันตัวตน (ตั๋ว)
interface AuthOk {
  room: RoomRow;
  player: PlayerRow;
  players: PlayerRow[];
}

async function authenticate(ctx: Ctx, headers: Headers, roomCodeRaw: unknown): Promise<AuthOk | HandlerResult> {
  const code = cleanCode(roomCodeRaw);
  const playerId = headers['x-ww-player-id'];
  const token = headers['x-ww-token'];
  if (!code) return fail(400, 'รหัสห้องไม่ถูกต้อง', 'bad_code');
  if (!playerId || !token) return fail(401, 'ไม่พบตั๋วผู้เล่น กรุณาเข้าห้องใหม่', 'no_ticket');

  const auth = await ctx.store.getAuth(playerId);
  // เทียบแฮชเสมอแม้ไม่พบตั๋ว เพื่อไม่ให้เวลาตอบบอกว่า "ผู้เล่นนี้มีอยู่จริง"
  const expected = auth?.token_hash ?? '0'.repeat(64);
  const same = safeEqual(hashToken(token), expected);
  if (!auth || !same || auth.room_code !== code) return fail(401, 'ตั๋วผู้เล่นไม่ถูกต้อง กรุณาเข้าห้องใหม่', 'bad_ticket');

  const room = await ctx.store.getRoom(code);
  if (!room) return fail(404, 'ไม่พบห้องนี้', 'no_room');
  const players = await ctx.store.listPlayers(code);
  const player = players.find((p) => p.player_id === playerId);
  if (!player) return fail(401, 'คุณไม่ได้อยู่ในห้องนี้แล้ว', 'not_in_room');
  return { room, player, players };
}

const isFail = (x: AuthOk | HandlerResult): x is HandlerResult => 'status' in x;

// ---------------------------------------------------------------- กระเป๋าเงิน + อวตาร
function walletView(w: WalletRow): WalletView {
  return {
    walletId: w.wallet_id,
    coins: w.coins,
    owned: w.owned,
    avatar: sanitizeAvatar(w.avatar, w.owned),
    gamesPlayed: w.games_played,
    wins: w.wins,
  };
}

/** ตรวจตั๋วกระเป๋า (เทียบแฮช) — ผิด/ไม่มี → null (ถือเป็นผู้เล่นไม่มีกระเป๋า ไม่ใช่ข้อผิดพลาด) */
async function checkWallet(ctx: Ctx, id: unknown, token: unknown): Promise<WalletRow | null> {
  if (typeof id !== 'string' || typeof token !== 'string' || !id || !token) return null;
  const hash = await ctx.store.getWalletTokenHash(id);
  if (!hash || !safeEqual(hashToken(token), hash)) return null;
  return ctx.store.getWallet(id);
}

async function walletFromHeaders(ctx: Ctx, headers: Headers): Promise<WalletRow | HandlerResult> {
  const w = await checkWallet(ctx, headers['x-ww-wallet-id'], headers['x-ww-wallet-token']);
  return w ?? fail(401, 'ไม่พบกระเป๋าของคุณ กรุณาเปิดตู้เสื้อผ้าใหม่', 'bad_wallet');
}
const isWalletFail = (x: WalletRow | HandlerResult): x is HandlerResult => 'status' in x;

export async function walletCreate(ctx: Ctx): Promise<HandlerResult> {
  const walletId = newId();
  const token = newToken();
  await ctx.store.createWallet(walletId, hashToken(token), STARTING_COINS);
  const w = (await ctx.store.getWallet(walletId))!;
  const res: WalletCreated = { walletId, token, wallet: walletView(w) };
  return ok(res);
}

/**
 * ล็อกอินกระเป๋าด้วยบัญชีเว็บ (ชื่อ + แฮชรหัสผ่าน) → กระเป๋า/ของที่ซื้อ/อวตารเดียวกันทุกเครื่อง
 * ตั๋วกระเป๋าของบัญชี = แฮชรหัสผ่าน (เซิร์ฟเวอร์เก็บแฮชซ้อนอีกชั้น) · กระเป๋าของเครื่องที่ยังไม่ผูกบัญชีจะถูกย้ายมาผูกให้ครั้งแรก
 */
export async function walletLogin(ctx: Ctx, body: Record<string, unknown>): Promise<HandlerResult> {
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const sessionToken = typeof body.sessionToken === 'string' ? body.sessionToken : '';
  if (!username || username.length > 40 || sessionToken.length < 20 || sessionToken.length > 200) return fail(400, 'ข้อมูลล็อกอินไม่ถูกต้อง', 'bad_login');
  const sess = await ctx.store.getSession(hashToken(sessionToken));
  if (!sess || sess.username !== username || Date.parse(sess.expires_at) < ctx.now()) return fail(401, 'เซสชันหมดอายุ กรุณาล็อกอินใหม่', 'bad_session');

  const secret = ctx.secret ?? DEV_SECRET;
  let w = await ctx.store.getWalletByUsername(username);
  const device = await checkWallet(ctx, body.walletId, body.walletToken);
  if (w && device && !device.username && device.wallet_id !== w.wallet_id) {
    // บัญชีมีกระเป๋าแล้ว (เช่น เปิดจากอีกเครื่องไปก่อน) แต่เครื่องนี้ยังมีกระเป๋าเก่าที่ยังไม่ผูก → รวมเข้าด้วยกัน ไม่ทิ้งของ/เหรียญเก่า
    if (await ctx.store.walletAbsorb(w.wallet_id, device.wallet_id)) w = (await ctx.store.getWalletByUsername(username)) ?? w;
  }
  if (!w) {
    if (device && !device.username) {
      // ย้ายกระเป๋าเดิมของเครื่องนี้มาเป็นของบัญชี (ตั๋วใหม่คำนวณจากความลับของเซิร์ฟเวอร์)
      await ctx.store.bindWalletToAccount(device.wallet_id, username, hashToken(walletTokenFor(secret, device.wallet_id)));
    } else {
      const id = newId();
      const t = walletTokenFor(secret, id);
      await ctx.store.createWallet(id, hashToken(t), STARTING_COINS);
      await ctx.store.bindWalletToAccount(id, username, hashToken(t));
    }
    w = (await ctx.store.getWalletByUsername(username))!;
  }
  const res: WalletCreated = { walletId: w.wallet_id, token: walletTokenFor(secret, w.wallet_id), wallet: walletView(w) };
  return ok(res);
}

const COMMON_PASSWORDS = new Set([
  '12345678', '123456789', '1234567890', 'password', 'password1', 'qwertyui', 'qwerty123', '11111111', '00000000', 'abcd1234', 'iloveyou', '88888888', '123123123',
]);

/** นโยบายรหัสผ่านของบัญชีใหม่/เปลี่ยนรหัส: ยาว 8–100 · ไม่ซ้ำชื่อผู้ใช้ · ไม่ใช่รหัสยอดฮิต · ไม่ใช่ตัวอักษรตัวเดียวซ้ำทั้งรหัส (บัญชีเก่าที่รหัสสั้นยังล็อกอินได้ตามเดิม) */
export function passwordProblem(password: string, username: string): string | null {
  if (password.length < 8) return 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร';
  if (password.length > 100) return 'รหัสผ่านยาวเกินไป (ไม่เกิน 100 ตัวอักษร)';
  if (password.toLowerCase() === username.toLowerCase()) return 'รหัสผ่านต้องไม่เหมือนชื่อผู้ใช้';
  if (COMMON_PASSWORDS.has(password.toLowerCase()) || /^(.)\1+$/.test(password)) return 'รหัสผ่านนี้เดาง่ายเกินไป ลองตั้งใหม่';
  return null;
}

/**
 * บัญชีเว็บ (ตรวจรหัสที่เซิร์ฟเวอร์ทั้งหมด) — body.mode:
 *  'register' = สมัครใหม่ (ชื่อซ้ำ → 409 · ต้องผ่านนโยบายรหัสผ่าน · ชื่อเก่าที่ยังไม่เคยตั้งรหัสก็ใช้สมัครเพื่อ "รับสิทธิ์ชื่อ" ได้)
 *  'login'    = เข้าสู่ระบบเท่านั้น (ไม่มีบัญชี → 404 ไม่สร้างบัญชีให้เองเด็ดขาด กันพิมพ์ชื่อผิดแล้วได้บัญชีใหม่)
 *  ไม่ระบุ    = แบบเดิม (ล็อกอิน/สมัครรวมกัน) เก็บไว้ให้เบราว์เซอร์รุ่นเก่าที่ยังเปิดค้างใช้ได้
 * รหัสเก็บแบบ scrypt ในตาราง winter_credentials (เบราว์เซอร์อ่านไม่ได้) · ผลลัพธ์คือ session token ไม่ใช่รหัสผ่านหรือแฮช
 */
export async function authLogin(ctx: Ctx, body: Record<string, unknown>): Promise<HandlerResult> {
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const mode = body.mode === 'register' || body.mode === 'login' ? body.mode : 'legacy';
  if (username.length < 2 || username.length > 20) return fail(400, 'ชื่อต้องยาว 2–20 ตัวอักษร', 'bad_name');
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f<>]/.test(username)) return fail(400, 'ชื่อมีอักขระที่ใช้ไม่ได้', 'bad_name');
  if (password.length < (mode === 'register' ? 8 : 4) || password.length > 100) {
    return fail(400, mode === 'register' ? 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร' : 'กรอกรหัสผ่านให้ถูกต้อง', 'bad_password_format');
  }
  if (ctx.rateLimit && !(await ctx.store.rateHit(`login:${username.toLowerCase()}`, 8, 60))) {
    return fail(429, 'ลองรหัสผ่านถี่เกินไป รอสักครู่แล้วลองใหม่', 'rate_limited');
  }

  let created = false;
  const stored = await ctx.store.getCredential(username);
  if (mode === 'register') {
    const problem = passwordProblem(password, username);
    if (problem) return fail(400, problem, 'weak_password');
    if (stored !== null || (await ctx.store.credentialExistsIgnoreCase(username))) return fail(409, 'ชื่อนี้ถูกใช้แล้ว ลองชื่ออื่น (ไม่สนตัวพิมพ์ใหญ่-เล็ก)', 'name_taken');
    created = await ctx.store.createCredential(username, hashPassword(password));
    if (!created) return fail(409, 'ชื่อนี้ถูกใช้แล้ว ลองชื่ออื่น', 'name_taken');
    await ctx.store.ensureUser(username);
  } else if (stored === null) {
    if (mode === 'login') {
      if (await ctx.store.credentialExistsIgnoreCase(username)) return fail(404, 'ไม่พบชื่อนี้ — มีชื่อที่คล้ายกันแต่ตัวพิมพ์ใหญ่-เล็กต่างกัน ลองพิมพ์ให้ตรงกับตอนสมัคร', 'no_account');
      return fail(404, 'ยังไม่มีบัญชีชื่อนี้ — ไปที่แท็บ "สมัครสมาชิก" ก่อน', 'no_account');
    }
    created = await ctx.store.createCredential(username, hashPassword(password));
    if (!created) return fail(409, 'มีคนตั้งรหัสชื่อนี้พร้อมกัน ลองใหม่อีกครั้ง', 'conflict'); // ชนกันพอดี
    await ctx.store.ensureUser(username);
  } else if (isLegacySha256(stored)) {
    if (!safeEqual(legacySha256(password), stored)) return fail(401, 'รหัสผ่านไม่ถูกต้อง', 'wrong_password');
    await ctx.store.updateCredential(username, hashPassword(password)); // อัปเกรดแฮชเก่าเป็น scrypt
  } else if (!checkPassword(password, stored)) {
    return fail(401, 'รหัสผ่านไม่ถูกต้อง', 'wrong_password');
  }

  const token = newToken();
  const expires = new Date(ctx.now() + SESSION_DAYS * 86_400_000).toISOString();
  await ctx.store.createSession(hashToken(token), username, expires);
  return ok({ username, token, created });
}

async function sessionUser(ctx: Ctx, body: Record<string, unknown>): Promise<{ username: string; tokenHash: string } | null> {
  const token = typeof body.sessionToken === 'string' ? body.sessionToken : '';
  if (token.length < 20 || token.length > 200) return null;
  const tokenHash = hashToken(token);
  const s = await ctx.store.getSession(tokenHash);
  if (!s || Date.parse(s.expires_at) < ctx.now()) return null;
  return { username: s.username, tokenHash };
}

/** ออกจากระบบจริง: ยกเลิกเซสชันฝั่งเซิร์ฟเวอร์ (โทเค็นที่ค้างอยู่ในเครื่องใช้ต่อไม่ได้) · ไม่มีเซสชัน → 401 (ฝั่งเบราว์เซอร์ไม่ต้องสนใจผล) */
export async function authLogout(ctx: Ctx, body: Record<string, unknown>): Promise<HandlerResult> {
  const me = await sessionUser(ctx, body);
  if (!me) return fail(401, 'ไม่ได้ล็อกอินอยู่', 'bad_session');
  await ctx.store.deleteSession(me.tokenHash);
  return ok({ ok: true });
}

/** เปลี่ยนรหัสผ่าน: ต้องล็อกอินอยู่ + รู้รหัสเดิม · สำเร็จแล้วเครื่องอื่นทุกเครื่องถูกออกจากระบบ (เครื่องนี้ยังอยู่) */
export async function authPassword(ctx: Ctx, body: Record<string, unknown>): Promise<HandlerResult> {
  const me = await sessionUser(ctx, body);
  if (!me) return fail(401, 'เซสชันหมดอายุ กรุณาล็อกอินใหม่', 'bad_session');
  const oldPassword = typeof body.oldPassword === 'string' ? body.oldPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
  if (ctx.rateLimit && !(await ctx.store.rateHit(`pw:${me.username.toLowerCase()}`, 6, 60))) {
    return fail(429, 'ลองถี่เกินไป รอสักครู่แล้วลองใหม่', 'rate_limited');
  }
  const stored = await ctx.store.getCredential(me.username);
  const okOld = stored !== null && (isLegacySha256(stored) ? safeEqual(legacySha256(oldPassword), stored) : checkPassword(oldPassword, stored));
  if (!okOld) return fail(401, 'รหัสผ่านเดิมไม่ถูกต้อง', 'wrong_password');
  const problem = passwordProblem(newPassword, me.username);
  if (problem) return fail(400, problem, 'weak_password');
  if (newPassword === oldPassword) return fail(400, 'รหัสผ่านใหม่ต้องไม่ซ้ำรหัสเดิม', 'same_password');
  await ctx.store.updateCredential(me.username, hashPassword(newPassword));
  await ctx.store.deleteSessionsExcept(me.username, me.tokenHash);
  return ok({ ok: true });
}

/** แอดมินรีเซ็ตรหัสให้คนที่ลืม: ต้องล็อกอินด้วยบัญชีแอดมิน (ต้องตั้งตัวแปร WW_ADMINS คั่นด้วย , เช่น win · ไม่ตั้ง = ปิดฟีเจอร์ — กันคนสมัครชื่อแอดมินแล้วได้สิทธิ์) · เซสชันเดิมของผู้ถูกรีเซ็ตถูกยกเลิกทั้งหมด */
export async function authAdminReset(ctx: Ctx, body: Record<string, unknown>): Promise<HandlerResult> {
  const me = await sessionUser(ctx, body);
  if (!me) return fail(401, 'เซสชันหมดอายุ กรุณาล็อกอินใหม่', 'bad_session');
  if (!isAdminName(me.username)) return fail(403, 'เฉพาะแอดมินเท่านั้น (เซิร์ฟเวอร์ต้องตั้ง WW_ADMINS)', 'not_admin');
  const target = typeof body.target === 'string' ? body.target.trim() : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
  if (target.length < 2 || target.length > 20) return fail(400, 'ชื่อผู้ใช้ไม่ถูกต้อง', 'bad_name');
  const problem = passwordProblem(newPassword, target);
  if (problem) return fail(400, problem, 'weak_password');
  if ((await ctx.store.getCredential(target)) === null) return fail(404, 'ไม่พบบัญชีชื่อนี้', 'no_account');
  await ctx.store.updateCredential(target, hashPassword(newPassword));
  await ctx.store.deleteSessionsExcept(target, '');
  return ok({ ok: true });
}


// ---------------------------------------------------------------- ความก้าวหน้า · อันดับ · เพื่อน · รายงาน
const isAdminName = (username: string): boolean =>
  (process.env.WW_ADMINS ?? '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean).includes(username.toLowerCase());

/** ความก้าวหน้าของฉัน (เลเวล/XP/สถิติ/อันดับ) */
export async function progressGet(ctx: Ctx, body: Record<string, unknown>): Promise<HandlerResult> {
  const me = await sessionUser(ctx, body);
  if (!me) return fail(401, 'เซสชันหมดอายุ กรุณาล็อกอินใหม่', 'bad_session');
  const p = normalizeProgress(await ctx.store.getProgress(me.username));
  const rank = p.stats.games > 0 ? (await ctx.store.countProgressAbove(p.xp)) + 1 : null;
  return ok(progressView(me.username, p, rank));
}

export interface LeaderboardRow { rank: number; username: string; level: number; title: string; xp: number; wins: number; games: number }
/** ตารางอันดับผู้เล่นตาม XP (เปิดดูได้ทุกคน ไม่ต้องล็อกอิน) */
export async function leaderboard(ctx: Ctx): Promise<HandlerResult> {
  const top = await ctx.store.listTopProgress(20);
  const rows: LeaderboardRow[] = top.map((r, i) => {
    const level = levelFromXp(r.xp);
    return { rank: i + 1, username: r.username, level, title: titleForLevel(level), xp: r.xp, wins: r.wins, games: r.games };
  });
  return ok({ rows });
}

export interface FriendRow { username: string; level: number; title: string; lastActive: string | null; online: boolean }
const ONLINE_WINDOW_MS = 5 * 60_000;
/** เพื่อนของฉัน (จากระบบเพื่อนของเว็บหลัก) พร้อมเลเวลและสถานะออนไลน์คร่าวๆ (ใช้งานภายใน 5 นาที) */
export async function friendsList(ctx: Ctx, body: Record<string, unknown>): Promise<HandlerResult> {
  const me = await sessionUser(ctx, body);
  if (!me) return fail(401, 'เซสชันหมดอายุ กรุณาล็อกอินใหม่', 'bad_session');
  const names = await ctx.store.getFriendNames(me.username);
  const active = await ctx.store.getLastActive(names);
  const rows: FriendRow[] = [];
  for (const username of names) {
    const p = normalizeProgress(await ctx.store.getProgress(username));
    const level = levelFromXp(p.xp);
    const last = active[username] ?? null;
    rows.push({ username, level, title: titleForLevel(level), lastActive: last, online: last !== null && ctx.now() - Date.parse(last) < ONLINE_WINDOW_MS });
  }
  rows.sort((a, b) => Number(b.online) - Number(a.online) || b.level - a.level || a.username.localeCompare(b.username));
  return ok({ rows });
}

export const REPORT_REASONS = ['abuse', 'spam', 'cheat', 'leak', 'afk', 'other'] as const;
/** รายงานผู้เล่นในห้อง (ผู้รายงานต้องอยู่ในห้องเดียวกัน) — ผู้ดูแลเปิดอ่านได้ที่หน้า Admin */
export async function reportSubmit(ctx: Ctx, headers: Headers, body: Record<string, unknown>): Promise<HandlerResult> {
  const a = await authenticate(ctx, headers, body.roomCode);
  if (isFail(a)) return a;
  const targetId = typeof body.targetPlayerId === 'string' ? body.targetPlayerId : '';
  const reason = typeof body.reason === 'string' ? body.reason : '';
  const detail = typeof body.detail === 'string' ? body.detail.trim().slice(0, 200) : '';
  if (!(REPORT_REASONS as readonly string[]).includes(reason)) return fail(400, 'เลือกเหตุผลที่รายงาน', 'bad_reason');
  const target = a.players.find((p) => p.player_id === targetId);
  if (!target) return fail(404, 'ไม่พบผู้เล่นที่ถูกรายงานในห้องนี้', 'no_target');
  if (target.player_id === a.player.player_id) return fail(400, 'รายงานตัวเองไม่ได้', 'self_report');
  if (ctx.rateLimit && !(await ctx.store.rateHit(`report:${a.player.player_id}`, 5, 600))) return fail(429, 'รายงานถี่เกินไป รอสักครู่', 'rate_limited');
  await ctx.store.insertReport({ reporter_name: a.player.display_name, reporter_username: null, target_name: target.display_name, room_code: a.room.room_code, reason, detail });
  return ok({ ok: true });
}

export async function reportList(ctx: Ctx, body: Record<string, unknown>): Promise<HandlerResult> {
  const me = await sessionUser(ctx, body);
  if (!me) return fail(401, 'เซสชันหมดอายุ กรุณาล็อกอินใหม่', 'bad_session');
  if (!isAdminName(me.username)) return fail(403, 'เฉพาะแอดมินเท่านั้น (เซิร์ฟเวอร์ต้องตั้ง WW_ADMINS)', 'not_admin');
  const status = typeof body.status === 'string' && ['open', 'resolved', 'dismissed', 'all'].includes(body.status) ? body.status : 'open';
  return ok({ rows: await ctx.store.listReports(status, 100) });
}

export async function reportResolve(ctx: Ctx, body: Record<string, unknown>): Promise<HandlerResult> {
  const me = await sessionUser(ctx, body);
  if (!me) return fail(401, 'เซสชันหมดอายุ กรุณาล็อกอินใหม่', 'bad_session');
  if (!isAdminName(me.username)) return fail(403, 'เฉพาะแอดมินเท่านั้น (เซิร์ฟเวอร์ต้องตั้ง WW_ADMINS)', 'not_admin');
  const status = body.status === 'dismissed' ? 'dismissed' : 'resolved';
  const note = typeof body.note === 'string' ? body.note.slice(0, 200) : '';
  const id = typeof body.id === 'string' ? body.id : '';
  if (!id || !(await ctx.store.resolveReport(id, status, note))) return fail(404, 'ไม่พบรายงานนี้', 'no_report');
  return ok({ ok: true });
}

export async function walletGet(ctx: Ctx, headers: Headers): Promise<HandlerResult> {
  const w = await walletFromHeaders(ctx, headers);
  if (isWalletFail(w)) return w;
  return ok(walletView(w));
}

export async function shopBuy(ctx: Ctx, headers: Headers, body: Record<string, unknown>): Promise<HandlerResult> {
  const w = await walletFromHeaders(ctx, headers);
  if (isWalletFail(w)) return w;
  const item = typeof body.itemId === 'string' ? ITEM_BY_ID[body.itemId] : undefined;
  if (!item) return fail(404, 'ไม่พบสินค้านี้', 'no_item');
  if (item.exclusive) return fail(403, 'ของชิ้นนี้ได้จากโค้ดพิเศษเท่านั้น', 'exclusive');
  if (item.price <= 0) return fail(400, 'ของชิ้นนี้ฟรีอยู่แล้ว', 'free');
  const r = await ctx.store.walletBuy(w.wallet_id, item.id, item.price); // ★ ราคามาจากแคตตาล็อกฝั่งเซิร์ฟเวอร์ ไม่เชื่อราคาจากเบราว์เซอร์
  if (!r.ok) {
    if (r.reason === 'poor') return fail(402, 'เหรียญไม่พอ', 'poor');
    if (r.reason === 'owned') return fail(409, 'คุณมีของชิ้นนี้แล้ว', 'owned');
    return fail(404, 'ไม่พบกระเป๋า', 'bad_wallet');
  }
  return ok(walletView(r.wallet));
}

/** หมุนวงล้อกาชา: เซิร์ฟเวอร์สุ่มระดับ (ตามอัตราวงล้อ) แล้วสุ่มของในระดับนั้น · ซ้ำ = คืนเหรียญบางส่วน · ทุกอย่างเป็น atomic */
export async function gachaSpin(ctx: Ctx, headers: Headers, body: Record<string, unknown>): Promise<HandlerResult> {
  const w = await walletFromHeaders(ctx, headers);
  if (isWalletFail(w)) return w;
  const wheel = typeof body.wheel === 'string' ? WHEEL_BY_ID[body.wheel] : undefined;
  if (!wheel) return fail(404, 'ไม่พบวงล้อนี้', 'no_wheel');
  const count = Number(body.count ?? 1);
  if (!(SPIN_COUNTS as readonly number[]).includes(count)) return fail(400, 'หมุนได้ครั้งละ 1 หรือ 10 ครั้ง', 'bad_count');

  const pool = gachaPool();
  const byRarity: Record<Rarity, AvatarItem[]> = { common: [], rare: [], epic: [], legendary: [] };
  for (const it of pool) byRarity[itemRarity(it)].push(it);

  const results: GachaResult[] = [];
  for (let i = 0; i < count; i++) {
    const rarity = rollRarity(wheel.rates, byRarity);
    const list = byRarity[rarity];
    const item = list[randomInt(list.length)];
    const refund = Math.floor((item.price * DUPLICATE_REFUND_PCT) / 100);
    const r = await ctx.store.walletSpin(w.wallet_id, wheel.cost, item.id, refund);
    if (!r.ok) {
      if (results.length === 0) return fail(r.reason === 'poor' ? 402 : 404, r.reason === 'poor' ? 'เหรียญไม่พอ' : 'ไม่พบกระเป๋า', r.reason === 'poor' ? 'poor' : 'bad_wallet');
      break; // เหรียญหมดกลางทาง (หมุน ×10) — ส่งผลที่หมุนไปแล้ว
    }
    results.push({ itemId: item.id, rarity, duplicate: r.duplicate === true, refund: r.duplicate ? refund : 0 });
  }
  const fresh = (await ctx.store.getWallet(w.wallet_id))!;
  const res: GachaResponse = { wheel: wheel.id, results, wallet: walletView(fresh) };
  return ok(res);
}

/** เลือกระดับตามน้ำหนักของวงล้อ (ข้ามระดับที่ไม่มีของในกอง) */
function rollRarity(rates: Record<Rarity, number>, byRarity: Record<Rarity, AvatarItem[]>): Rarity {
  const order: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
  const usable = order.filter((r) => rates[r] > 0 && byRarity[r].length > 0);
  const total = usable.reduce((s, r) => s + rates[r], 0);
  let x = (randomInt(1_000_000) / 1_000_000) * total;
  for (const r of usable) {
    x -= rates[r];
    if (x < 0) return r;
  }
  return usable[usable.length - 1];
}

/** แลกโค้ดเซ็ตพิเศษ: โค้ดตรวจด้วยแฮชที่เซิร์ฟเวอร์ · ได้ของทั้งเซ็ตเข้ากระเป๋า · เซ็ตเดียวกันแลกซ้ำไม่ได้ */
export async function redeemCode(ctx: Ctx, headers: Headers, body: Record<string, unknown>): Promise<HandlerResult> {
  const w = await walletFromHeaders(ctx, headers);
  if (isWalletFail(w)) return w;
  const raw = typeof body.code === 'string' ? body.code : '';
  if (raw.length < 4 || raw.length > 60) return fail(400, 'กรอกโค้ดให้ถูกต้อง', 'bad_code_format');
  const setId = setForCode(raw);
  if (!setId) return fail(404, 'โค้ดนี้ไม่ถูกต้องหรือหมดอายุ', 'bad_code');
  const items = setItemIds(setId);
  const have = new Set(w.owned);
  if (items.every((id) => have.has(id))) return fail(409, 'คุณแลกโค้ดนี้ไปแล้ว', 'already_redeemed');
  const added = await ctx.store.walletGrant(w.wallet_id, items);
  if (added === null) return fail(404, 'ไม่พบกระเป๋า', 'bad_wallet');
  const fresh = (await ctx.store.getWallet(w.wallet_id))!;
  const res: RedeemResponse = { setId, itemIds: items, added, wallet: walletView(fresh) };
  return ok(res);
}

export async function avatarSave(ctx: Ctx, headers: Headers, body: Record<string, unknown>): Promise<HandlerResult> {
  const w = await walletFromHeaders(ctx, headers);
  if (isWalletFail(w)) return w;
  const clean = sanitizeAvatar(body.avatar, w.owned); // ช่องที่ไม่ได้เป็นเจ้าของ → ถูกแทนด้วยค่าเริ่มต้น
  await ctx.store.walletSetAvatar(w.wallet_id, clean);
  const fresh = (await ctx.store.getWallet(w.wallet_id))!;
  return ok(walletView(fresh));
}

/** ใช้อวตารของกระเป๋ากับที่นั่งในห้อง (ล็อบบี้เท่านั้น) */
export async function syncAvatar(ctx: Ctx, headers: Headers, body: Record<string, unknown>): Promise<HandlerResult> {
  const a = await authenticate(ctx, headers, body.roomCode);
  if (isFail(a)) return a;
  if (a.room.phase !== 'lobby') return fail(409, 'เปลี่ยนอวตารได้เฉพาะตอนอยู่ล็อบบี้', 'not_lobby');
  const w = await checkWallet(ctx, body.walletId, body.walletToken);
  if (!w) return fail(401, 'ไม่พบกระเป๋าของคุณ', 'bad_wallet');
  const avatar = sanitizeAvatar(w.avatar, w.owned);
  await ctx.store.setPlayerAvatar(a.player.player_id, serializeAvatar(avatar));
  await ctx.store.setPlayerWallet(a.player.player_id, w.wallet_id);
  await ctx.store.updateLobbySettings(a.room.room_code, a.room.settings); // ให้ทุกเครื่องเห็นอวตารใหม่
  return ok({ ok: true });
}

/** อวตารที่จะใช้ตอนเข้าห้อง: ถ้ามีกระเป๋าที่ตั๋วถูกต้อง ใช้ของกระเป๋า · ไม่มี → สุ่มจากของฟรีตามรหัสผู้เล่น */
async function avatarForJoin(ctx: Ctx, body: Record<string, unknown>, playerId: string): Promise<{ json: string; walletId: string | null }> {
  const w = await checkWallet(ctx, body.walletId, body.walletToken);
  if (w) return { json: serializeAvatar(sanitizeAvatar(w.avatar, w.owned)), walletId: w.wallet_id };
  return { json: serializeAvatar(randomFreeAvatar(playerId)), walletId: null };
}

// ---------------------------------------------------------------- สร้าง/เข้าห้อง
export async function createRoom(ctx: Ctx, body: Record<string, unknown>): Promise<HandlerResult> {
  const name = cleanName(body.displayName);
  if (!name) return fail(400, 'กรุณาใส่ชื่อเล่น 1–30 ตัวอักษร', 'bad_name');
  const password = typeof body.password === 'string' && body.password.length > 0 ? body.password.slice(0, 50) : null;

  const nowIso = new Date(ctx.now()).toISOString();
  const playerId = newId();
  const token = newToken();
  const av = await avatarForJoin(ctx, body, playerId);
  const host: PlayerRow = {
    player_id: playerId, room_code: '', display_name: name, avatar: av.json, seat: 1,
    is_host: true, is_bot: false, is_alive: true, is_connected: true, last_seen_at: nowIso,
    can_vote: true, death_day: null, death_cause: null, revealed_role: null, revealed_team: null,
  };

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = newRoomCode();
    const room: RoomRow = {
      room_code: code, host_player_id: playerId, phase: 'lobby', day_number: 0, night_slot: 0,
      phase_ends_at: null, settings: DEFAULT_LOBBY as unknown as Record<string, unknown>, state_version: 0,
      winners: null, is_locked: false, has_password: password !== null, created_at: nowIso, updated_at: nowIso,
    };
    const created = await ctx.store.createRoom(
      room,
      { rng_seed: newSeed(), password_hash: password ? hashPassword(password) : null },
      { ...host, room_code: code },
      hashToken(token),
    );
    if (created) {
      if (av.walletId) await ctx.store.setPlayerWallet(playerId, av.walletId);
      const res: AuthResponse = { roomCode: code, playerId, token };
      return ok(res);
    }
  }
  return fail(503, 'สร้างห้องไม่สำเร็จ ลองใหม่อีกครั้ง', 'code_collision');
}

export async function joinRoom(ctx: Ctx, body: Record<string, unknown>): Promise<HandlerResult> {
  const code = cleanCode(body.roomCode);
  const name = cleanName(body.displayName);
  if (!code) return fail(400, 'รหัสห้องต้องเป็นตัวอักษร/ตัวเลข 5 ตัว', 'bad_code');
  if (!name) return fail(400, 'กรุณาใส่ชื่อเล่น 1–30 ตัวอักษร', 'bad_name');

  const room = await ctx.store.getRoom(code);
  if (!room) return fail(404, 'ไม่พบห้องนี้', 'no_room');

  if (room.has_password) {
    const secrets = await ctx.store.getRoomSecrets(code);
    const pw = typeof body.password === 'string' ? body.password : '';
    if (!secrets?.password_hash || !checkPassword(pw, secrets.password_hash)) {
      return fail(403, 'รหัสผ่านห้องไม่ถูกต้อง', 'bad_password');
    }
  }

  const players = await ctx.store.listPlayers(code);
  const sameName = players.find((p) => p.display_name.toLowerCase() === name.toLowerCase());

  // กลับเข้ามาที่นั่งเดิม: ชื่อตรงกับที่นั่งที่เจ้าของห้อง "ปล่อยคืน" แล้ว (ตั๋วถูกยกเลิก) — Q12
  if (sameName) {
    const auth = await ctx.store.getAuth(sameName.player_id);
    if (auth) return fail(409, 'ชื่อนี้มีคนใช้ในห้องแล้ว', 'name_taken');
    const token = newToken();
    await ctx.store.setAuth(sameName.player_id, code, hashToken(token));
    await ctx.store.touchPlayer(sameName.player_id, new Date(ctx.now()).toISOString());
    const back = await checkWallet(ctx, body.walletId, body.walletToken);
    if (back) await ctx.store.setPlayerWallet(sameName.player_id, back.wallet_id);
    const res: AuthResponse = { roomCode: code, playerId: sameName.player_id, token };
    return ok(res);
  }

  const lobby = lobbyOf(room);
  const started = room.is_locked || room.phase !== 'lobby';
  if (started) {
    if (!lobby.allowSpectators) return fail(403, 'เกมเริ่มไปแล้ว และห้องนี้ไม่เปิดให้เข้าชม', 'locked');
    if (body.spectate !== true) return fail(403, 'เกมเริ่มไปแล้ว — เข้าห้องเป็น "ผู้ชม" ได้', 'locked_can_spectate');
    if (players.filter((p) => p.is_spectator).length >= MAX_SPECTATORS) return fail(403, 'ที่นั่งผู้ชมเต็มแล้ว', 'spectators_full');
    const sid = newId();
    const stoken = newToken();
    await ctx.store.addPlayer({
      player_id: sid, room_code: code, display_name: name, avatar: null, seat: players.reduce((m, p) => Math.max(m, p.seat), 0) + 1,
      is_host: false, is_bot: false, is_alive: false, is_connected: true, last_seen_at: new Date(ctx.now()).toISOString(),
      can_vote: false, death_day: null, death_cause: null, revealed_role: null, revealed_team: null, is_spectator: true,
    }, hashToken(stoken));
    await ctx.store.updateLobbySettings(code, room.settings);
    const sres: AuthResponse = { roomCode: code, playerId: sid, token: stoken };
    return ok(sres);
  }
  if (players.length >= lobby.maxPlayers) return fail(403, 'ห้องเต็มแล้ว', 'full');

  const playerId = newId();
  const token = newToken();
  const av = await avatarForJoin(ctx, body, playerId);
  const seat = (players.reduce((m, p) => Math.max(m, p.seat), 0)) + 1;
  await ctx.store.addPlayer({
    player_id: playerId, room_code: code, display_name: name, avatar: av.json, seat,
    is_host: false, is_bot: false, is_alive: true, is_connected: true,
    last_seen_at: new Date(ctx.now()).toISOString(), can_vote: true, death_day: null, death_cause: null,
    revealed_role: null, revealed_team: null,
  }, hashToken(token));
  if (av.walletId) await ctx.store.setPlayerWallet(playerId, av.walletId);
  await ctx.store.updateLobbySettings(code, room.settings); // ขยับ state_version ให้ทุกเครื่องเห็นคนเข้าใหม่
  const res: AuthResponse = { roomCode: code, playerId, token };
  return ok(res);
}

// ---------------------------------------------------------------- ล็อบบี้: ตั้งค่า / เริ่มเกม / ปล่อยที่นั่ง
export async function updateSettings(ctx: Ctx, headers: Headers, body: Record<string, unknown>): Promise<HandlerResult> {
  const a = await authenticate(ctx, headers, body.roomCode);
  if (isFail(a)) return a;
  if (!a.player.is_host) return fail(403, 'เฉพาะเจ้าของห้องเท่านั้นที่ตั้งค่าได้', 'not_host');
  if (a.room.phase !== 'lobby') return fail(409, 'เริ่มเกมแล้ว แก้ตั้งค่าไม่ได้', 'not_lobby');
  const next = sanitizeLobby(body.settings, lobbyOf(a.room));
  await ctx.store.updateLobbySettings(a.room.room_code, next as unknown as Record<string, unknown>);
  return ok({ ok: true, lobby: next });
}

export async function releaseSeat(ctx: Ctx, headers: Headers, body: Record<string, unknown>): Promise<HandlerResult> {
  const a = await authenticate(ctx, headers, body.roomCode);
  if (isFail(a)) return a;
  if (!a.player.is_host) return fail(403, 'เฉพาะเจ้าของห้องเท่านั้น', 'not_host');
  const targetId = typeof body.targetPlayerId === 'string' ? body.targetPlayerId : '';
  const target = a.players.find((p) => p.player_id === targetId);
  if (!target) return fail(404, 'ไม่พบผู้เล่นคนนี้', 'no_target');
  if (target.player_id === a.player.player_id) return fail(400, 'ปล่อยที่นั่งตัวเองไม่ได้', 'self');

  await ctx.store.logPrivate(a.room.room_code, {
    day_number: a.room.day_number, phase: a.room.phase, kind: 'release_seat',
    payload: { by: a.player.player_id, target: target.player_id },
  });
  if (a.room.phase === 'lobby') {
    await ctx.store.deletePlayer(target.player_id); // ล็อบบี้: เชิญออก
  } else {
    await ctx.store.deleteAuth(target.player_id); // ระหว่างเกม: ยกเลิกตั๋ว ให้เข้ามารับที่นั่งเดิมด้วยชื่อเดิม
  }
  await ctx.store.updateLobbySettings(a.room.room_code, a.room.settings);
  return ok({ ok: true });
}

export async function startGame(ctx: Ctx, headers: Headers, body: Record<string, unknown>): Promise<HandlerResult> {
  const a = await authenticate(ctx, headers, body.roomCode);
  if (isFail(a)) return a;
  if (!a.player.is_host) return fail(403, 'เฉพาะเจ้าของห้องเท่านั้นที่เริ่มเกมได้', 'not_host');
  if (a.room.phase !== 'lobby') return fail(409, 'เกมเริ่มไปแล้ว', 'not_lobby');

  const lobby = lobbyOf(a.room);
  const roleIds = expandRoles(lobby.roleCounts);
  const issues = validateSetup(roleIds, a.players.filter((p) => !p.is_spectator).length).filter((i) => i.level === 'error');
  if (issues.length > 0) {
    return { status: 422, body: { errorTh: issues[0].messageTh, code: 'bad_setup', issuesTh: issues.map((i) => i.messageTh) } };
  }
  const secrets = await ctx.store.getRoomSecrets(a.room.room_code);
  if (!secrets) return fail(500, 'ข้อมูลห้องเสียหาย', 'no_secrets');

  const { state, errors } = createGame({
    roomCode: a.room.room_code,
    players: a.players.filter((p) => !p.is_spectator).map((p) => ({ id: p.player_id, name: p.display_name, seat: p.seat })),
    roleIds,
    seed: secrets.rng_seed,
    settings: withDefaults(lobby.rules),
  });
  if (!state) return fail(422, errors[0]?.messageTh ?? 'เริ่มเกมไม่ได้', 'bad_setup');

  const now = ctx.now();
  const timing = computeTiming(state, lobby.timers, now, ctx.rand ?? randBetween);
  const server: ServerState = { game: state, minUntil: timing.minUntil };
  const commit: Commit = {
    roomCode: a.room.room_code,
    expectVersion: a.room.state_version,
    room: { phase: state.phase, day_number: 0, night_slot: 0, phase_ends_at: timing.endsAt ? new Date(timing.endsAt).toISOString() : null, winners: null, is_locked: true },
    engine: server,
    players: playerPatches(state),
    eventsPublic: [{ day_number: 0, phase: 'role_reveal', kind: 'game_start', payload: { roleCounts: lobby.roleCounts, playerCount: a.players.length } }],
    eventsPrivate: [{ day_number: 0, phase: 'role_reveal', kind: 'roles_assigned', payload: { assignment: Object.fromEntries(state.players.map((p) => [p.id, p.roleId])) } }],
  };
  if (!(await ctx.store.commit(commit))) return fail(409, 'ห้องมีการเปลี่ยนแปลง ลองกดเริ่มอีกครั้ง', 'conflict');
  return ok({ ok: true });
}

// ---------------------------------------------------------------- เล่นอีกครั้ง (เจ้าของห้อง · หลังเกมจบ) — กลับล็อบบี้ คงค่าตั้งค่าเดิม
export async function playAgain(ctx: Ctx, headers: Headers, body: Record<string, unknown>): Promise<HandlerResult> {
  const a = await authenticate(ctx, headers, body.roomCode);
  if (isFail(a)) return a;
  if (!a.player.is_host) return fail(403, 'เฉพาะเจ้าของห้องเท่านั้นที่เริ่มรอบใหม่ได้', 'not_host');
  if (a.room.phase !== 'game_over') return fail(409, 'เกมยังไม่จบ', 'not_over');

  await ctx.store.resetForNewGame(a.room.room_code, newSeed());
  for (const p of a.players) if (p.is_spectator) await ctx.store.setSpectator(p.player_id, false);
  const committed = await ctx.store.commit({
    roomCode: a.room.room_code,
    expectVersion: a.room.state_version,
    room: { phase: 'lobby', day_number: 0, night_slot: 0, phase_ends_at: null, winners: null, is_locked: false },
    engine: null,
    players: a.players.map((p) => ({
      player_id: p.player_id, is_alive: true, can_vote: true, death_day: null, death_cause: null, revealed_role: null, revealed_team: null,
    })),
    eventsPublic: [],
    eventsPrivate: [],
  });
  if (!committed) return fail(409, 'ห้องมีการเปลี่ยนแปลง ลองกดอีกครั้ง', 'conflict');
  return ok({ ok: true });
}

// ---------------------------------------------------------------- สถานะฝั่งเซิร์ฟเวอร์ + บันทึก
async function loadServerState(ctx: Ctx, code: string): Promise<{ room: RoomRow; st: ServerState } | null> {
  const room = await ctx.store.getRoom(code);
  const secrets = await ctx.store.getRoomSecrets(code);
  if (!room || !secrets?.engine_state) return null;
  return { room, st: secrets.engine_state };
}

/** เหรียญของแต่ละคนในเกมที่เพิ่งจบ (เฉพาะคนที่มีกระเป๋า) */
async function computeRewards(ctx: Ctx, code: string, g: GameState): Promise<Record<string, RewardBreakdown>> {
  const wallets = await ctx.store.getRoomWallets(code);
  const winners = new Set(g.winners?.filter((w) => w.main).flatMap((w) => w.playerIds) ?? []);
  const out: Record<string, RewardBreakdown> = {};
  for (const playerId of Object.keys(wallets)) {
    const p = g.players.find((x) => x.id === playerId);
    if (!p) continue;
    out[playerId] = computeReward(winners.has(playerId), p.alive);
  }
  return out;
}

/** เกมจบ: บันทึก XP/สถิติให้ผู้เล่นที่ผูกกระเป๋ากับบัญชี (เลเวลอัปได้เหรียญโบนัส) — ความผิดพลาดตรงนี้ต้องไม่ทำให้เกมจบพัง */
async function recordProgress(ctx: Ctx, g: GameState, wallets: Record<string, string>, winnerIds: Set<string>): Promise<void> {
  for (const [playerId, walletId] of Object.entries(wallets)) {
    try {
      const w = await ctx.store.getWallet(walletId);
      const username = w?.username;
      const p = g.players.find((x) => x.id === playerId);
      if (!username || username.startsWith('merged:') || !p) continue;
      const prev = normalizeProgress(await ctx.store.getProgress(username));
      const { progress, gain } = applyGameResult(prev, { won: winnerIds.has(playerId), survived: p.alive, role: p.roleId, team: p.team });
      await ctx.store.saveProgress(username, progress);
      if (gain.bonusCoins > 0) await ctx.store.walletAddCoins(walletId, gain.bonusCoins);
    } catch (e) {
      console.error('[ww:progress]', e);
    }
  }
}

async function saveState(
  ctx: Ctx, room: RoomRow, prev: ServerState, next: GameState, events: GameEvent[], lobby: LobbySettings,
): Promise<boolean> {
  const justEnded = next.phase === 'game_over' && prev.game.phase !== 'game_over';
  const rewards = justEnded ? await computeRewards(ctx, room.room_code, next) : prev.rewards;
  const now = ctx.now();
  // ผู้ควบคุมเวลา: อ่านธงแล้วเคลียร์ก่อนบันทึก (ปรับเฉพาะเวลาหมดเฟสของเฟสปัจจุบัน)
  const timeAdjust = next.timeAdjust;
  if (timeAdjust) next = { ...next, timeAdjust: null };
  const timing = computeTiming(next, lobby.timers, now, ctx.rand ?? randBetween);
  const rows = eventRows(events);
  const phaseChanged = signature(prev.game) !== signature(next);
  // เวลาหมดเฟสเปลี่ยนเฉพาะเมื่อเฟส/ช่องเปลี่ยนจริง (แอคชันธรรมดาไม่ต่อเวลา)
  let endsAt = phaseChanged ? timing.endsAt : (room.phase_ends_at ? Date.parse(room.phase_ends_at) : timing.endsAt);
  if (timeAdjust && endsAt !== null) {
    const delta = (timeAdjust === 'more' ? 1 : -1) * TIME_ADJUST_SECONDS * 1000;
    endsAt = Math.max(now + 10_000, endsAt + delta); // ลดแล้วต้องเหลืออย่างน้อย 10 วินาที
  }
  const minUntil = phaseChanged ? timing.minUntil : prev.minUntil;
  const committed = await ctx.store.commit({
    roomCode: room.room_code,
    expectVersion: room.state_version,
    room: {
      phase: next.phase,
      day_number: next.dayNumber,
      night_slot: 0,
      phase_ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      winners: next.winners,
      is_locked: true,
    },
    engine: { game: next, minUntil, rewards },
    players: playerPatches(next),
    eventsPublic: rows.pub,
    eventsPrivate: rows.priv,
  });
  // จ่ายเหรียญหลัง commit สำเร็จ (CAS ทำให้มีผู้ชนะเพียงคนเดียว → จ่ายครั้งเดียว ไม่ซ้ำ)
  if (committed && justEnded && rewards) {
    const wallets = await ctx.store.getRoomWallets(room.room_code);
    const winnerIds = new Set(next.winners?.filter((w) => w.main).flatMap((w) => w.playerIds) ?? []);
    for (const [playerId, r] of Object.entries(rewards)) {
      if (wallets[playerId]) await ctx.store.walletCredit(wallets[playerId], r.total, winnerIds.has(playerId));
    }
    await recordProgress(ctx, next, wallets, winnerIds);
  }
  return committed;
}

// ---------------------------------------------------------------- ส่งแอคชัน (กลางคืน/เสนอชื่อ/โหวต/ยิง/พร้อม)
const ACTION_TYPES = new Set(['ready', 'night_action', 'nominate', 'vote', 'hunter_shot', 'gunner_shot', 'time_adjust', 'skip_discussion']);

export async function action(ctx: Ctx, headers: Headers, body: Record<string, unknown>, forceType?: ActionRequest['type']): Promise<HandlerResult> {
  const a = await authenticate(ctx, headers, body.roomCode);
  if (isFail(a)) return a;
  const type = forceType ?? (body.type as string);
  if (typeof type !== 'string' || !ACTION_TYPES.has(type)) return fail(400, 'ชนิดคำสั่งไม่ถูกต้อง', 'bad_type');
  const actorId = a.player.player_id; // ★ มาจากตั๋วเสมอ

  for (let attempt = 0; attempt < MAX_COMMIT_RETRIES; attempt++) {
    const loaded = await loadServerState(ctx, a.room.room_code);
    if (!loaded) return fail(409, 'เกมยังไม่เริ่ม', 'not_started');
    const { room, st } = loaded;

    let ga: GameAction;
    const targets = Array.isArray(body.targets) ? (body.targets as unknown[]).filter((x): x is string => typeof x === 'string') : undefined;
    const meta = body.meta && typeof body.meta === 'object' ? (body.meta as Record<string, unknown>) : undefined;
    switch (type) {
      case 'ready': ga = { type: 'ready', actorId }; break;
      case 'night_action': ga = { type: 'night_action', actorId, kind: String(body.kind) as never, targets, meta }; break;
      case 'nominate': ga = { type: 'nominate', actorId, targetId: String(body.targetId) }; break;
      case 'vote': ga = { type: 'vote', actorId, targetId: body.targetId === null || body.targetId === undefined ? null : String(body.targetId) }; break;
      case 'skip_discussion': ga = { type: 'skip_discussion', actorId }; break;
      case 'time_adjust': ga = { type: 'time_adjust', actorId, direction: body.direction === 'less' ? 'less' : 'more' }; break;
      case 'gunner_shot': ga = { type: 'gunner_shot', actorId, targetId: String(body.targetId) }; break;
      default: ga = { type: 'hunter_shot', actorId, targetId: String(body.targetId) };
    }

    const result = applyAction(st.game, ga);
    if (result.error) {
      await ctx.store.logPrivate(room.room_code, {
        day_number: st.game.dayNumber, phase: st.game.phase, kind: 'rejected',
        payload: { playerId: actorId, type, code: result.error.code },
      });
      return fail(403, result.error.messageTh, result.error.code);
    }
    // ★ เมื่อทุกคนกด "พร้อม" ให้เริ่มคืนแรกทันที (ไม่ต้องรอตัวจับเวลา)
    let next = result.state;
    let events = result.events;
    if (type === 'ready' && next.players.every((p) => p.ready)) {
      const adv = applyAction(next, { type: 'advance' });
      if (!adv.error) { next = adv.state; events = events.concat(adv.events); }
    }
    const saved = await saveState(ctx, room, st, next, events, lobbyOf(room));
    if (saved) return ok({ ok: true });
  }
  return fail(409, 'ระบบกำลังยุ่ง ลองส่งอีกครั้ง', 'conflict');
}

// ---------------------------------------------------------------- ผู้เล่นหลุดกลางเกม (ตั้งค่า disconnectMode)
interface PresenceResult { state: GameState; events: GameEvent[]; changed: boolean }

/** หลุดเกินเวลาที่ตั้ง → ตาม disconnectMode: wait = ไม่ทำอะไร · dead = ถือว่าตาย · bot = บอทเล่นแทนเฉพาะสิ่งที่ค้างอยู่ (กลับมาแล้วเล่นเองได้ทันที) */
export function applyPresence(g: GameState, players: PlayerRow[], nowMs: number): PresenceResult {
  const mode = g.settings.disconnectMode ?? 'wait';
  const out: PresenceResult = { state: g, events: [], changed: false };
  if (mode === 'wait' || g.phase === 'game_over') return out;
  const graceMs = (g.settings.disconnectGraceSeconds ?? 60) * 1000;
  // วนหลายรอบ: คนหลุดที่เป็นนายพรานถูกฆ่าแล้วต้องยิงต่อ (ยิงสุ่มแทน) ก่อนเกมจะตัดสินผู้ชนะได้
  for (let pass = 0; pass < 3; pass++) {
  let progressed = false;
  for (const row of players) {
    if (row.is_spectator || row.is_bot) continue;
    if (nowMs - Date.parse(row.last_seen_at) < graceMs) continue;
    const ep = out.state.players.find((p) => p.id === row.player_id);
    if (!ep) continue;
    let act: GameAction | null = null;
    if (mode === 'dead' && out.state.pendingHunters[0] !== ep.id) {
      if (ep.alive) act = { type: 'disconnect_dead', actorId: ep.id };
    } else {
      const rng = { rngState: hashSeed(`${out.state.seed}:${out.state.dayNumber}:${out.state.phase}:${ep.id}`) };
      act = botActionFor(out.state, ep.id, rng);
    }
    if (!act) continue;
    const r = applyAction(out.state, act);
    if (r.error) continue;
    out.state = r.state;
    out.events = out.events.concat(r.events);
    out.changed = true;
    progressed = true;
    if (out.state.phase === 'game_over') return out;
  }
  if (!progressed) break;
  }
  return out;
}

// ---------------------------------------------------------------- tick: เดินเวลา (ใครเรียกก็ได้ เซิร์ฟเวอร์ตรวจเองว่าถึงเวลาจริงไหม)
export async function tick(ctx: Ctx, headers: Headers, body: Record<string, unknown>): Promise<HandlerResult> {
  const a = await authenticate(ctx, headers, body.roomCode);
  if (isFail(a)) return a;
  await ctx.store.touchPlayer(a.player.player_id, new Date(ctx.now()).toISOString());

  for (let attempt = 0; attempt < MAX_COMMIT_RETRIES; attempt++) {
    const loaded = await loadServerState(ctx, a.room.room_code);
    if (!loaded) return ok({ advanced: false });
    const { room, st } = loaded;
    const g = st.game;
    if (g.phase === 'game_over') return ok({ advanced: false });

    const now = ctx.now();
    if (st.minUntil !== null && now < st.minUntil) return ok({ advanced: false }); // ยังไม่ถึงเวลาขั้นต่ำของช่อง
    const endsAt = room.phase_ends_at ? Date.parse(room.phase_ends_at) : null;
    const timedOut = endsAt !== null && now >= endsAt;

    const sw = applyPresence(g, await ctx.store.listPlayers(room.room_code), now);
    const r = applyAction(sw.state, { type: 'advance', timedOut });
    let next: GameState;
    let events: GameEvent[];
    if (r.error) {
      if (!sw.changed) return ok({ advanced: false });
      next = sw.state; events = sw.events;
    } else {
      next = r.state; events = sw.events.concat(r.events);
    }
    const moved = sw.changed || events.length > 0 || signature(next) !== signature(g);
    if (!moved) return ok({ advanced: false });

    const saved = await saveState(ctx, room, st, next, events, lobbyOf(room));
    if (saved) return ok({ advanced: true });
    // ชนกับคนอื่น (state_version ไม่ตรง) → โหลดใหม่แล้วดูอีกครั้ง — ใครชนะก็เดินแค่รอบเดียว (idempotent)
  }
  return ok({ advanced: false });
}

// ---------------------------------------------------------------- แชท
const PRIVATE_CHANNELS = ['wolf', 'vampire', 'cult', 'lovers', 'dead'] as const;
// ช่องลับของ "พวกเดียวกัน" คุยได้เฉพาะตอนกลางคืน — กลางวันห้ามวางแผนกัน (ช่องผู้ตายคุยได้ตลอด)
const NIGHT_ONLY_CHANNELS = ['wolf', 'vampire', 'cult', 'lovers'];

function channelsReadable(g: GameState | null, playerId: string): string[] {
  if (!g) return [];
  const me = g.players.find((p) => p.id === playerId);
  if (!me) return [];
  const out: string[] = [];
  if (!me.alive) out.push('dead');
  if (me.alive && me.team === 'wolf') out.push('wolf');
  if (me.alive && me.team === 'vampire') out.push('vampire');
  if (me.alive && me.team === 'cult') out.push('cult');
  if (me.alive && me.loverOf) out.push('lovers');
  return out;
}

/** ช่องลับที่ "พิมพ์ได้ตอนนี้" (อ่านย้อนหลังได้เสมอ) */
function channelsWritable(g: GameState | null, playerId: string): string[] {
  return channelsReadable(g, playerId).filter((c) => !NIGHT_ONLY_CHANNELS.includes(c) || g?.phase === 'night');
}

function canWritePublic(room: RoomRow, g: GameState | null, playerId: string, lobby: LobbySettings): boolean {
  if (room.phase === 'lobby' || room.phase === 'game_over') return true;
  if (lobby.chatMode === 'voice') return false;
  const me = g?.players.find((p) => p.id === playerId);
  if (!me || !me.alive) return false;
  return g!.phase !== 'night' && g!.phase !== 'role_reveal';
}

export async function chat(ctx: Ctx, headers: Headers, body: Record<string, unknown>): Promise<HandlerResult> {
  const a = await authenticate(ctx, headers, body.roomCode);
  if (isFail(a)) return a;
  const channel = body.channel as ChatRequest['channel'];
  const text = typeof body.text === 'string' ? body.text.replace(/[\u0000-\u001f\u007f]/g, ' ').trim() : '';
  if (channel !== 'public' && !PRIVATE_CHANNELS.includes(channel as never)) return fail(400, 'ช่องแชทไม่ถูกต้อง', 'bad_channel');
  if (text.length < 1 || text.length > CHAT_MAX) return fail(400, `ข้อความต้องยาว 1–${CHAT_MAX} ตัวอักษร`, 'bad_text');

  const secrets = await ctx.store.getRoomSecrets(a.room.room_code);
  const g = secrets?.engine_state?.game ?? null;
  const lobby = lobbyOf(a.room);
  const row = { player_id: a.player.player_id, display_name: a.player.display_name, text };

  if (channel === 'public') {
    if (!canWritePublic(a.room, g, a.player.player_id, lobby)) return fail(403, 'ตอนนี้พิมพ์ในแชทสาธารณะไม่ได้', 'cannot_write');
    await ctx.store.insertChatPublic(a.room.room_code, row);
    return ok({ ok: true });
  }
  // ช่องลับ: เซิร์ฟเวอร์ตรวจว่าผู้ส่งอยู่ช่องนั้นจริง (กันชาวบ้านพิมพ์เข้าแชทหมาป่า)
  if (!channelsReadable(g, a.player.player_id).includes(channel)) return fail(403, 'คุณไม่มีสิทธิ์ใช้ช่องแชทนี้', 'forbidden_channel');
  if (!channelsWritable(g, a.player.player_id).includes(channel)) return fail(403, 'แชทลับของพวกเดียวกันใช้ได้เฉพาะตอนกลางคืน', 'secret_chat_day');
  await ctx.store.insertChatPrivate(a.room.room_code, channel, row);
  return ok({ ok: true });
}

// ---------------------------------------------------------------- มุมมองของฉัน
export async function myView(ctx: Ctx, headers: Headers, body: Record<string, unknown>): Promise<HandlerResult> {
  const a = await authenticate(ctx, headers, body.roomCode);
  if (isFail(a)) return a;
  const code = a.room.room_code;
  await ctx.store.touchPlayer(a.player.player_id, new Date(ctx.now()).toISOString());

  const secrets = await ctx.store.getRoomSecrets(code);
  const game = secrets?.engine_state?.game ?? null;
  const lobby = lobbyOf(a.room);

  const readable = channelsReadable(game, a.player.player_id);
  const priv: Record<string, ChatLine[]> = {};
  for (const ch of readable) priv[ch] = (await ctx.store.listChatPrivate(code, ch, 60)).map(toChatLine);

  const events = await ctx.store.listEvents(code, 80);
  const resp: MyViewResponse = {
    stateVersion: a.room.state_version,
    serverNow: new Date(ctx.now()).toISOString(),
    roomCode: code,
    phase: a.room.phase,
    endsAt: a.room.phase_ends_at,
    hasPassword: a.room.has_password,
    me: { playerId: a.player.player_id, displayName: a.player.display_name, isHost: a.player.is_host },
    players: a.players.map((p) => toLobbyPlayer(p, ctx.now())),
    spectator: a.player.is_spectator === true,
    dayNumber: a.room.day_number,
    lobby,
    // ★ เฉพาะ "มุมมองของผู้ถาม" — engine.buildView กรองความลับให้แล้ว
    game: game && !a.player.is_spectator ? buildView(game, a.player.player_id) : null,
    reward: secrets?.engine_state?.rewards?.[a.player.player_id] ?? null,
    log: events.map((e) => ({ id: e.id, at: e.created_at, day: e.day_number, phase: e.phase, kind: e.kind, data: e.payload })),
    chat: { public: (await ctx.store.listChatPublic(code, 60)).map(toChatLine), private: priv },
    canWrite: { public: canWritePublic(a.room, game, a.player.player_id, lobby), channels: readable, activeChannels: channelsWritable(game, a.player.player_id) },
  };
  return ok(resp);
}
