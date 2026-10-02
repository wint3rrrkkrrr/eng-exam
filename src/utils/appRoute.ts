// utils/appRoute.ts — ที่อยู่ลิงก์ของทั้งเว็บ (รีเฟรชแล้วอยู่หน้าเดิม · ส่งลิงก์ให้เพื่อนได้)
//   /                              หน้าแรก Winter Community
//   /werewolf  /werewolf/<ห้อง>    เกมแววูฟ
//   /cheese    /cheese/<ห้อง>      เกมหนูชีส
//   /exam      /exam/<วิชา>        คลังข้อสอบ
import { gamePath, parseGamePath } from '../games/werewolf/net/route';

export type AppRoute =
  | { kind: 'home' }
  | { kind: 'werewolf'; code: string | null }
  | { kind: 'cheese'; code: string | null }
  | { kind: 'exam'; subject: string | null };

export const CHEESE_SEGMENT = 'cheese';
export const EXAM_SEGMENT = 'exam';

const decode = (s: string): string => { try { return decodeURIComponent(s); } catch { return s; } };

export function parseAppRoute(pathname: string): AppRoute {
  const w = parseGamePath(pathname);
  if (w.active) return { kind: 'werewolf', code: w.code };
  const p = decode(pathname);
  const c = new RegExp(`^/${CHEESE_SEGMENT}(?:/([A-Za-z0-9]{3,8}))?/?$`).exec(p);
  if (c) return { kind: 'cheese', code: c[1] ? c[1].toUpperCase() : null };
  const e = new RegExp(`^/${EXAM_SEGMENT}(?:/([A-Za-z0-9_-]{1,40}))?/?$`).exec(p);
  if (e) return { kind: 'exam', subject: e[1] ?? null };
  return { kind: 'home' };
}

export function routePath(r: AppRoute): string {
  switch (r.kind) {
    case 'werewolf': return gamePath(r.code);
    case 'cheese': return r.code ? `/${CHEESE_SEGMENT}/${r.code}` : `/${CHEESE_SEGMENT}`;
    case 'exam': return r.subject ? `/${EXAM_SEGMENT}/${r.subject}` : `/${EXAM_SEGMENT}`;
    default: return '/';
  }
}

/** เทียบ path สองอันว่าเป็นที่เดียวกันไหม (ไม่สนการเข้ารหัส % หรือเครื่องหมาย / ท้าย) */
export const samePath = (a: string, b: string): boolean => decode(a).replace(/\/+$/, '') === decode(b).replace(/\/+$/, '');
