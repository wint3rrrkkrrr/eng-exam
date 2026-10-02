// _shared/http.ts — ตัวห่อบาง ๆ ระหว่างคำขอ HTTP กับ handlers (ใช้ร่วมกันทั้ง Netlify Function และสะพานรันในเครื่อง)
import { MemoryStore } from './memoryStore';
import { SupabaseStore } from './supabaseStore';
import type { WwStore } from './store';
import * as H from './handlers';
import type { Ctx, Headers, HandlerResult } from './handlers';

export type Route =
  | 'create-room' | 'join-room' | 'update-settings' | 'start-game' | 'my-view'
  | 'action' | 'nominate' | 'vote' | 'chat' | 'release-seat' | 'add-bots' | 'tick' | 'play-again'
  | 'gacha-spin' | 'redeem-code' | 'auth-login' | 'auth-logout' | 'auth-password' | 'auth-admin-reset' | 'progress-get' | 'leaderboard' | 'friends-list' | 'report-submit' | 'report-list' | 'report-resolve' | 'wallet-create' | 'wallet-login' | 'wallet' | 'shop-buy' | 'shop-buy-collection' | 'avatar-save' | 'sync-avatar';

export const ROUTES: Route[] = [
  'create-room', 'join-room', 'update-settings', 'start-game', 'my-view',
  'action', 'nominate', 'vote', 'chat', 'release-seat', 'add-bots', 'tick', 'play-again',
  'gacha-spin', 'redeem-code', 'auth-login', 'auth-logout', 'auth-password', 'auth-admin-reset', 'auth-admin-reset', 'progress-get', 'leaderboard', 'friends-list', 'report-submit', 'report-list', 'report-resolve', 'wallet-create', 'wallet-login', 'wallet', 'shop-buy', 'shop-buy-collection', 'avatar-save', 'sync-avatar',
];

let cachedStore: WwStore | null = null;

/** มี SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY → ใช้ Supabase · ไม่มี → ใช้หน่วยความจำ (เฉพาะรันในเครื่อง) */
export function getStore(env: Record<string, string | undefined> = process.env): WwStore {
  if (cachedStore) return cachedStore;
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  cachedStore = url && key ? new SupabaseStore(url, key) : new MemoryStore();
  return cachedStore;
}

export function usingMemoryStore(): boolean {
  return cachedStore instanceof MemoryStore;
}

/** ลิมิตต่อหน้าต่างเวลา [จำนวนครั้ง, วินาที] — เกินแล้วตอบ 429 (ค่ากว้างพอสำหรับการเล่นปกติ/ดึงมุมมองถี่ๆ ช่วงโหวต) */
export const RATE_LIMITS: Record<Route, [number, number]> = {
  'create-room': [10, 60], 'join-room': [30, 60], 'update-settings': [60, 60], 'start-game': [10, 60],
  'my-view': [400, 60], 'action': [240, 60], 'nominate': [60, 60], 'vote': [60, 60], 'chat': [60, 60],
  'release-seat': [30, 60], 'add-bots': [20, 60], 'tick': [120, 60], 'play-again': [10, 60],
  'auth-login': [20, 60], 'auth-logout': [30, 60], 'auth-password': [10, 60], 'auth-admin-reset': [10, 60], 'progress-get': [60, 60], 'leaderboard': [60, 60], 'friends-list': [60, 60], 'report-submit': [10, 60], 'report-list': [30, 60], 'report-resolve': [30, 60], 'wallet-create': [10, 60], 'wallet-login': [20, 60], 'wallet': [120, 60],
  'shop-buy': [30, 60], 'shop-buy-collection': [20, 60], 'avatar-save': [30, 60], 'sync-avatar': [30, 60],
  'gacha-spin': [40, 60], 'redeem-code': [10, 60],
};

// ต้องมีตั๋วผู้เล่น/กระเป๋าถึงจะรู้ตัวตน — เส้นทางอื่นนับตาม IP
const IP_ONLY: Route[] = ['leaderboard', 'progress-get', 'friends-list', 'report-list', 'report-resolve', 'create-room', 'join-room', 'auth-login', 'auth-logout', 'auth-password', 'wallet-create', 'wallet-login'];

export interface DispatchOptions {
  /** เปิดตัวจำกัดความถี่ (ค่าเริ่มต้น: เปิดเมื่อใช้ Supabase จริง · ที่เก็บในหน่วยความจำ/เทสต์ปิดไว้) */
  rateLimit?: boolean;
  secret?: string;
}

function rateKey(route: Route, headers: Headers): string {
  const who = IP_ONLY.includes(route)
    ? `ip:${headers['x-ww-ip'] ?? 'unknown'}`
    : `p:${headers['x-ww-player-id'] ?? headers['x-ww-wallet-id'] ?? headers['x-ww-ip'] ?? 'unknown'}`;
  return `${route}|${who}`;
}

export async function dispatch(
  route: Route, headers: Headers, body: Record<string, unknown>, store: WwStore = getStore(), opts: DispatchOptions = {},
): Promise<HandlerResult> {
  const limited = opts.rateLimit ?? !(store instanceof MemoryStore);
  const ctx: Ctx = {
    store,
    now: () => Date.now(),
    rateLimit: limited,
    secret: opts.secret ?? process.env.WW_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? undefined,
  };
  try {
    if (limited) {
      const [limit, windowSec] = RATE_LIMITS[route];
      if (!(await store.rateHit(rateKey(route, headers), limit, windowSec))) {
        return { status: 429, body: { errorTh: 'ส่งคำขอถี่เกินไป รอสักครู่แล้วลองใหม่', code: 'rate_limited' } };
      }
    }
    switch (route) {
      case 'create-room': return await H.createRoom(ctx, body);
      case 'join-room': return await H.joinRoom(ctx, body);
      case 'update-settings': return await H.updateSettings(ctx, headers, body);
      case 'start-game': return await H.startGame(ctx, headers, body);
      case 'my-view': return await H.myView(ctx, headers, body);
      case 'action': return await H.action(ctx, headers, body);
      case 'nominate': return await H.action(ctx, headers, body, 'nominate');
      case 'vote': return await H.action(ctx, headers, body, 'vote');
      case 'chat': return await H.chat(ctx, headers, body);
      case 'release-seat': return await H.releaseSeat(ctx, headers, body);
      case 'add-bots': return await H.addBots(ctx, headers, body);
      case 'tick': return await H.tick(ctx, headers, body);
      case 'play-again': return await H.playAgain(ctx, headers, body);
      case 'gacha-spin': return await H.gachaSpin(ctx, headers, body);
      case 'redeem-code': return await H.redeemCode(ctx, headers, body);
      case 'auth-login': return await H.authLogin(ctx, body);
      case 'auth-logout': return await H.authLogout(ctx, body);
      case 'auth-password': return await H.authPassword(ctx, body);
      case 'auth-admin-reset': return await H.authAdminReset(ctx, body);
      case 'progress-get': return await H.progressGet(ctx, body);
      case 'leaderboard': return await H.leaderboard(ctx);
      case 'friends-list': return await H.friendsList(ctx, body);
      case 'report-submit': return await H.reportSubmit(ctx, headers, body);
      case 'report-list': return await H.reportList(ctx, body);
      case 'report-resolve': return await H.reportResolve(ctx, body);
      case 'wallet-create': return await H.walletCreate(ctx);
      case 'wallet-login': return await H.walletLogin(ctx, body);
      case 'wallet': return await H.walletGet(ctx, headers);
      case 'shop-buy': return await H.shopBuy(ctx, headers, body);
      case 'shop-buy-collection': return await H.shopBuyCollection(ctx, headers, body);
      case 'avatar-save': return await H.avatarSave(ctx, headers, body);
      case 'sync-avatar': return await H.syncAvatar(ctx, headers, body);
    }
  } catch (e) {
    // ไม่ส่งรายละเอียดข้อผิดพลาดภายในให้เบราว์เซอร์ (กันข้อมูลรั่ว) — บันทึกไว้ที่ log ของเซิร์ฟเวอร์
    console.error(`[ww:${route}]`, e);
    return { status: 500, body: { errorTh: 'ระบบขัดข้อง ลองใหม่อีกครั้ง', code: 'server_error' } };
  }
}

/** แปลง Request (มาตรฐานเว็บ) → เรียก dispatch → Response */
export async function handleRequest(route: Route, req: Request): Promise<Response> {
  const json = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
  if (req.method !== 'POST') return new Response(JSON.stringify({ errorTh: 'ใช้ได้เฉพาะ POST' }), { status: 405, headers: json });
  let body: Record<string, unknown> = {};
  try {
    const text = await req.text();
    if (text.length > 20_000) return new Response(JSON.stringify({ errorTh: 'คำขอใหญ่เกินไป' }), { status: 413, headers: json });
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    if (body === null || typeof body !== 'object' || Array.isArray(body)) throw new Error('bad');
  } catch {
    return new Response(JSON.stringify({ errorTh: 'รูปแบบคำขอไม่ถูกต้อง' }), { status: 400, headers: json });
  }
  const headers: Headers = {
    'x-ww-player-id': req.headers.get('x-ww-player-id') ?? undefined,
    'x-ww-token': req.headers.get('x-ww-token') ?? undefined,
    'x-ww-wallet-id': req.headers.get('x-ww-wallet-id') ?? undefined,
    'x-ww-wallet-token': req.headers.get('x-ww-wallet-token') ?? undefined,
    // IP ผู้เรียก (Netlify ใส่ให้เอง) — ใช้นับ rate limit เท่านั้น
    'x-ww-ip': (req.headers.get('x-nf-client-connection-ip') ?? (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim()) || undefined,
  };
  const r = await dispatch(route, headers, body);
  return new Response(JSON.stringify(r.body), { status: r.status, headers: json });
}
