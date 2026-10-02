// _shared/http.ts — ตัวห่อบาง ๆ ระหว่างคำขอ HTTP กับ handlers (ใช้ร่วมกันทั้ง Netlify Function และสะพานรันในเครื่อง)
import { MemoryStore } from './memoryStore';
import { SupabaseStore } from './supabaseStore';
import type { WwStore } from './store';
import * as H from './handlers';
import type { Ctx, Headers, HandlerResult } from './handlers';

export type Route =
  | 'create-room' | 'join-room' | 'update-settings' | 'start-game' | 'my-view'
  | 'action' | 'nominate' | 'vote' | 'chat' | 'release-seat' | 'tick' | 'play-again'
  | 'wallet-create' | 'wallet-login' | 'wallet' | 'shop-buy' | 'avatar-save' | 'sync-avatar';

export const ROUTES: Route[] = [
  'create-room', 'join-room', 'update-settings', 'start-game', 'my-view',
  'action', 'nominate', 'vote', 'chat', 'release-seat', 'tick', 'play-again',
  'wallet-create', 'wallet-login', 'wallet', 'shop-buy', 'avatar-save', 'sync-avatar',
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

export async function dispatch(route: Route, headers: Headers, body: Record<string, unknown>, store: WwStore = getStore()): Promise<HandlerResult> {
  const ctx: Ctx = { store, now: () => Date.now() };
  try {
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
      case 'tick': return await H.tick(ctx, headers, body);
      case 'play-again': return await H.playAgain(ctx, headers, body);
      case 'wallet-create': return await H.walletCreate(ctx);
      case 'wallet-login': return await H.walletLogin(ctx, body);
      case 'wallet': return await H.walletGet(ctx, headers);
      case 'shop-buy': return await H.shopBuy(ctx, headers, body);
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
  };
  const r = await dispatch(route, headers, body);
  return new Response(JSON.stringify(r.body), { status: r.status, headers: json });
}
