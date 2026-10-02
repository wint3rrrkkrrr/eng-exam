// _shared/redeemCodes.ts — โค้ดแลกเซ็ตพิเศษ: เก็บเฉพาะ "แฮช" (SHA-256) ของโค้ด ไม่เก็บโค้ดดิบในโค้ดโปรแกรม
// เปรียบเทียบหลังตัดช่องว่าง/ขีด/ตัวพิมพ์เล็กใหญ่ออก → WINTER-FROST-7QK9 = winter frost 7qk9
import { createHash, timingSafeEqual } from 'node:crypto';
import type { SetId } from '../../../src/games/werewolf/shared/avatarExtra';

const HASHES: { setId: SetId; hash: string }[] = [
  { setId: 'winter', hash: '365a3e10f7fc5a9be8eca3630cd460015cb7c994987e0fd6e1d490e41a270bf6' },
  { setId: 'nongfloat', hash: 'b80d7a58cdf6b77215a11325997fa2cc4f3701b1c855fff614b48b5cfd2e825d' },
  { setId: 'mos', hash: '764f36da6ea7563a85d8ef42ff5823aaa433b5e3bd643adf06bb0b86c5be1850' },
  { setId: 'khowfang', hash: 'b0c87cfcca27c8e13bf9c2e4418308cff676acb561ae069658385071437ebd23' },
];

export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function hashCode(raw: string): string {
  return createHash('sha256').update(`ww-redeem:${normalizeCode(raw)}`).digest('hex');
}

/** โค้ดนี้เป็นของเซ็ตไหน (null = ไม่ถูกต้อง) — เทียบแบบ constant-time */
export function setForCode(raw: string): SetId | null {
  const h = Buffer.from(hashCode(raw), 'hex');
  let found: SetId | null = null;
  for (const e of HASHES) {
    if (timingSafeEqual(h, Buffer.from(e.hash, 'hex'))) found = e.setId;
  }
  return found;
}
