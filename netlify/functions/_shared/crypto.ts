// _shared/crypto.ts — ตั๋วผู้เล่น (token) + แฮชรหัสผ่านห้อง + รหัสห้อง
// เก็บ "แฮช" ของตั๋วเท่านั้น ไม่เก็บตั๋วดิบ · เทียบแบบ constant-time กัน timing attack
import { createHash, createHmac, randomBytes, randomInt, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

export function newToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 32).toString('hex')}`;
}

export function checkPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  return safeEqual(scryptSync(password, salt, 32).toString('hex'), hash);
}

/** ตั๋วกระเป๋าของบัญชี: คำนวณจากความลับของเซิร์ฟเวอร์ + รหัสกระเป๋า (ทุกเครื่องที่ล็อกอินได้ตั๋วเดียวกัน ไม่ต้องเก็บตั๋วไว้ที่ไหน) */
export function walletTokenFor(secret: string, walletId: string): string {
  return createHmac('sha256', secret).update(`wallet:${walletId}`).digest('base64url');
}

/** แฮช SHA-256 ล้วนแบบเก่า (เคยทำในเบราว์เซอร์) — ใช้ตรวจแล้วอัปเกรดเป็น scrypt ตอนล็อกอินครั้งแรก */
export function isLegacySha256(stored: string): boolean {
  return /^[0-9a-f]{64}$/.test(stored);
}
export function legacySha256(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export function newId(): string {
  return randomUUID();
}

export function newSeed(): string {
  return randomBytes(16).toString('hex');
}

// ตัดตัวที่สับสนง่าย (0/O, 1/I) ออก
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function newRoomCode(): string {
  let s = '';
  for (let i = 0; i < 5; i++) s += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return s;
}

/** สุ่มจำนวนเต็มช่วง [lo, hi] — ใช้กับเวลาหน่วงเท่านั้น (ไม่เกี่ยวกับการแจกบท) */
export function randBetween(lo: number, hi: number): number {
  return randomInt(lo, hi + 1);
}
