// net/werewolfClient.ts — เรียก /api/ww/* + ฟังสัญญาณเรียลไทม์ (ถ้ามี Supabase) + เก็บตั๋วผู้เล่นในเครื่อง
import { API_BASE } from '../shared/api';
import { UI } from '../text/th';
import { isSupabaseReady, supabase } from '../../../utils/supabaseClient';

export interface Session {
  roomCode: string;
  playerId: string;
  token: string;
}

const LAST_ROOM_KEY = 'ww_room_code_v1';
const tokenKey = (code: string) => `ww_token_${code}`;
const playerKey = (code: string) => `ww_player_${code}`;

// localStorage อาจใช้ไม่ได้ (โหมดส่วนตัว ฯลฯ) — ห่อ try/catch เสมอ
export function saveSession(s: Session): void {
  try {
    localStorage.setItem(LAST_ROOM_KEY, s.roomCode);
    localStorage.setItem(tokenKey(s.roomCode), s.token);
    localStorage.setItem(playerKey(s.roomCode), s.playerId);
  } catch { /* ใช้ต่อไปได้ แต่รีเฟรชหน้าแล้วต้องเข้าห้องใหม่ */ }
}

export function loadSession(): Session | null {
  try {
    const code = localStorage.getItem(LAST_ROOM_KEY);
    if (!code) return null;
    const token = localStorage.getItem(tokenKey(code));
    const playerId = localStorage.getItem(playerKey(code));
    return token && playerId ? { roomCode: code, playerId, token } : null;
  } catch {
    return null;
  }
}

export function clearSession(code: string): void {
  try {
    localStorage.removeItem(tokenKey(code));
    localStorage.removeItem(playerKey(code));
    if (localStorage.getItem(LAST_ROOM_KEY) === code) localStorage.removeItem(LAST_ROOM_KEY);
  } catch { /* ไม่เป็นไร */ }
}

// ★ โปรเจกต์นี้ไม่ได้เปิด strict ของ TypeScript จึงใช้รูปแบบเดียว: ตรวจ r.ok ก่อน แล้วค่อยอ่าน r.data / r.errorTh
export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T;
  errorTh: string;
  code?: string;
}

export async function api<T = unknown>(
  route: string,
  body: Record<string, unknown> = {},
  session?: Session | null,
  extraHeaders?: Record<string, string>,
): Promise<ApiResult<T>> {
  try {
    const headers: Record<string, string> = { 'content-type': 'application/json', ...(extraHeaders ?? {}) };
    const payload = { ...body };
    if (session) {
      headers['x-ww-player-id'] = session.playerId;
      headers['x-ww-token'] = session.token;
      payload.roomCode = session.roomCode;
    }
    const res = await fetch(`${API_BASE}/${route}`, { method: 'POST', headers, body: JSON.stringify(payload) });
    const type = res.headers.get('content-type') ?? '';
    if (!type.includes('application/json')) {
      // ได้ HTML กลับมา = ยังไม่มีฟังก์ชันเซิร์ฟเวอร์ (กฎ SPA ส่งไปหน้าเว็บแทน)
      return { ok: false, status: res.status, data: undefined as unknown as T, errorTh: UI.errors.serverNotReady, code: 'no_server' };
    }
    const json = (await res.json()) as T & { errorTh?: string; code?: string };
    if (!res.ok) return { ok: false, status: res.status, data: undefined as unknown as T, errorTh: json.errorTh ?? 'ทำรายการไม่ได้', code: json.code };
    return { ok: true, status: res.status, data: json, errorTh: '' };
  } catch {
    return { ok: false, status: 0, data: undefined as unknown as T, errorTh: UI.errors.network, code: 'network' };
  }
}

/**
 * ฟังการเปลี่ยนแปลงของห้องแบบเรียลไทม์ (ตารางเปิดเท่านั้น) — ถ้าไม่มี Supabase จะไม่ทำอะไร (ใช้การดึงซ้ำแทน)
 * ★ ชื่อ channel ต้องไม่ซ้ำกันทุกครั้งที่ subscribe (กฎเหล็กข้อ 6 — เกมเดิมพังเพราะเรื่องนี้)
 */
export function subscribeRoom(roomCode: string, onChange: () => void): () => void {
  if (!isSupabaseReady) return () => undefined;
  const name = `ww-${roomCode}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const filter = `room_code=eq.${roomCode}`;
  const channel = supabase
    .channel(name)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ww_rooms', filter }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ww_players', filter }, onChange)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ww_chat_public', filter }, onChange)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ww_events', filter }, onChange)
    .subscribe();
  return () => {
    try { void supabase.removeChannel(channel); } catch { /* ไม่เป็นไร */ }
  };
}
