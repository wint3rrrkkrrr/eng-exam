// shared/notify.ts — สั่น (vibrate) · แจ้งเตือนของเบราว์เซอร์เมื่อสลับไปแท็บอื่น · ขนาดตัวอักษร (ตั้งค่าที่จำไว้ในเครื่อง)
// หมายเหตุ: การแจ้งเตือนนี้ทำงานได้ตอน "เปิดเว็บค้างไว้ในแท็บเบื้องหลัง" เท่านั้น — Push จริงตอนปิดแอปต้องมี service worker + เซิร์ฟเวอร์ push แยกต่างหาก (ยังไม่มี)
const VIBRATE_KEY = 'ww_vibrate_off_v1';
const NOTIFY_KEY = 'ww_notify_on_v1';
const FONT_KEY = 'ww_font_scale_v1';

const read = (k: string): string | null => {
  try { return localStorage.getItem(k); } catch { return null; }
};
const write = (k: string, v: string): void => {
  try { localStorage.setItem(k, v); } catch { /* จำค่าข้ามเซสชันไม่ได้ ไม่เป็นไร */ }
};

// ---------------------------------------------------------------- สั่น
export const canVibrate = (): boolean => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
export const isVibrateOn = (): boolean => read(VIBRATE_KEY) !== '1'; // ค่าเริ่มต้น: เปิด
export const setVibrateOn = (on: boolean): void => write(VIBRATE_KEY, on ? '0' : '1');

export function buzz(pattern: number | number[] = 120): void {
  if (!canVibrate() || !isVibrateOn()) return;
  try { navigator.vibrate(pattern); } catch { /* บางเบราว์เซอร์บล็อก */ }
}

// ---------------------------------------------------------------- แจ้งเตือนของเบราว์เซอร์
export const canNotify = (): boolean => typeof window !== 'undefined' && 'Notification' in window;
export const isNotifyOn = (): boolean => canNotify() && read(NOTIFY_KEY) === '1' && Notification.permission === 'granted';

/** เปิด/ปิดการแจ้งเตือน — เปิดครั้งแรกจะขอสิทธิ์จากเบราว์เซอร์ (ต้องเรียกจากการกดปุ่มของผู้ใช้) คืนค่าสถานะหลังตั้ง */
export async function setNotifyOn(on: boolean): Promise<boolean> {
  if (!canNotify()) return false;
  if (!on) { write(NOTIFY_KEY, '0'); return false; }
  let perm = Notification.permission;
  if (perm === 'default') {
    try { perm = await Notification.requestPermission(); } catch { perm = 'denied'; }
  }
  const granted = perm === 'granted';
  write(NOTIFY_KEY, granted ? '1' : '0');
  return granted;
}

/** แจ้งเตือนเฉพาะตอนผู้เล่นไม่ได้ดูหน้านี้อยู่ (แท็บซ่อน) — ไม่ซ้ำกับแบนเนอร์ในเกม */
export function notifyIfHidden(title: string, body: string, tag = 'ww'): void {
  if (typeof document === 'undefined' || !document.hidden || !isNotifyOn()) return;
  try {
    const n = new Notification(title, { body, tag, silent: false });
    n.onclick = () => { window.focus(); n.close(); };
  } catch { /* บางเครื่อง (มือถือ) ต้องใช้ service worker — ข้ามไป */ }
}

// ---------------------------------------------------------------- ขนาดตัวอักษร
export const FONT_STEPS = [100, 115, 130] as const;
export type FontStep = (typeof FONT_STEPS)[number];

export function getFontScale(): FontStep {
  const v = Number(read(FONT_KEY));
  return (FONT_STEPS as readonly number[]).includes(v) ? (v as FontStep) : 100;
}
export function setFontScale(v: FontStep): void {
  write(FONT_KEY, String(v));
  applyFontScale();
}
/** ปรับขนาด rem ทั้งหน้า (เกมนี้ใช้หน่วย rem ของ Tailwind ทั้งหมด จึงขยายตามทุกส่วน) */
export function applyFontScale(): void {
  if (typeof document === 'undefined') return;
  const v = getFontScale();
  document.documentElement.style.fontSize = v === 100 ? '' : `${v}%`;
}
export function resetFontScale(): void {
  if (typeof document !== 'undefined') document.documentElement.style.fontSize = '';
}
