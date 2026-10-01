// net/wallet.ts — กระเป๋าเงิน/ร้านค้าฝั่งเบราว์เซอร์: เก็บ "ตั๋วกระเป๋า" ในเครื่อง + เรียกเซิร์ฟเวอร์
// ★ เหรียญ/ของที่ซื้อ อยู่ที่เซิร์ฟเวอร์ — เครื่องผู้เล่นเก็บแค่ตั๋ว ไม่มีทางแก้เหรียญเองได้
import type { AvatarConfig } from '../shared/avatar';
import type { WalletCreated, WalletView } from '../shared/api';
import { api } from './werewolfClient';
import type { ApiResult } from './werewolfClient';

const KEY = 'ww_wallet_v1';

export interface WalletCreds {
  walletId: string;
  token: string;
}

export function loadWallet(): WalletCreds | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as WalletCreds;
    return o.walletId && o.token ? o : null;
  } catch {
    return null;
  }
}

function saveWallet(c: WalletCreds): void {
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* ใช้ได้ต่อ แต่รีเฟรชแล้วกระเป๋าหาย */ }
}

export function walletBody(c: WalletCreds | null): Record<string, unknown> {
  return c ? { walletId: c.walletId, walletToken: c.token } : {};
}

const headers = (c: WalletCreds) => ({ 'x-ww-wallet-id': c.walletId, 'x-ww-wallet-token': c.token });

/** เปิดกระเป๋า: ใช้ของเดิมถ้าตั๋วยังใช้ได้ · ไม่มี/ใช้ไม่ได้ → สร้างใหม่อัตโนมัติ (ได้เหรียญเริ่มต้น) */
export async function ensureWallet(): Promise<ApiResult<{ creds: WalletCreds; wallet: WalletView }>> {
  const existing = loadWallet();
  if (existing) {
    const r = await api<WalletView>('wallet', {}, null, headers(existing));
    if (r.ok) return { ok: true, status: 200, data: { creds: existing, wallet: r.data }, errorTh: '' };
    if (r.status !== 401) return { ok: false, status: r.status, data: undefined as never, errorTh: r.errorTh, code: r.code };
  }
  const made = await api<WalletCreated>('wallet-create', {});
  if (!made.ok) return { ok: false, status: made.status, data: undefined as never, errorTh: made.errorTh, code: made.code };
  const creds = { walletId: made.data.walletId, token: made.data.token };
  saveWallet(creds);
  return { ok: true, status: 200, data: { creds, wallet: made.data.wallet }, errorTh: '' };
}

export const buyItem = (c: WalletCreds, itemId: string) => api<WalletView>('shop-buy', { itemId }, null, headers(c));
export const saveAvatar = (c: WalletCreds, avatar: AvatarConfig) => api<WalletView>('avatar-save', { avatar }, null, headers(c));
