// net/route.ts — ที่อยู่ลิงก์ของเกมแววูฟ: /เกม  และ  /เกม/<รหัสห้อง>  (รีเฟรชแล้วอยู่ที่เดิม · ส่งลิงก์ให้เพื่อนเข้าห้องได้ตรงๆ)
export const GAME_SEGMENT = 'เกม';

export interface GameRoute { active: boolean; code: string | null }

/** แปลง pathname → สถานะเกม (รับทั้งแบบไทยตรงๆ และแบบที่เบราว์เซอร์เข้ารหัส %E0%B9...) */
export function parseGamePath(pathname: string): GameRoute {
  let p = pathname;
  try { p = decodeURIComponent(pathname); } catch { /* ใช้ค่าเดิม */ }
  const m = new RegExp(`^/${GAME_SEGMENT}(?:/([A-Za-z0-9]{3,8}))?/?$`).exec(p);
  return m ? { active: true, code: m[1] ? m[1].toUpperCase() : null } : { active: false, code: null };
}

export const gamePath = (code?: string | null): string => (code ? `/${GAME_SEGMENT}/${code}` : `/${GAME_SEGMENT}`);

/** ลิงก์เต็มสำหรับเชิญเพื่อน เช่น https://เว็บ/เกม/ABCDE (ใช้ URL เข้ารหัสให้ถูกต้อง) */
export function inviteUrl(origin: string, code: string): string {
  return new URL(gamePath(code), origin).toString();
}
