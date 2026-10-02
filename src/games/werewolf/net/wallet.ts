// net/wallet.ts — กระเป๋าเงิน/ร้านค้าฝั่งเบราว์เซอร์: เก็บ "ตั๋วกระเป๋า" ในเครื่อง + เรียกเซิร์ฟเวอร์
// ★ เหรียญ/ของที่ซื้อ อยู่ที่เซิร์ฟเวอร์ — เครื่องผู้เล่นเก็บแค่ตั๋ว ไม่มีทางแก้เหรียญเองได้
import type { AvatarConfig } from '../shared/avatar';
import type { GachaResponse, RedeemResponse, WalletCreated, WalletView } from '../shared/api';
import { api } from './werewolfClient';
import type { ApiResult } from './werewolfClient';

const KEY = 'ww_wallet_v1';
const OWNER_KEY = 'ww_wallet_owner_v1'; // บัญชีที่กระเป๋าในเครื่องนี้เป็นของ (ว่าง = กระเป๋าของเครื่องที่ยังไม่ผูกบัญชี)
const USER_KEY = 'grammar_quiz_username_v1';
const TOKEN_KEY = 'grammar_quiz_token_v1';

export interface AccountCreds {
  username: string;
  sessionToken: string; // ได้จากเซิร์ฟเวอร์ตอนล็อกอิน (ไม่ใช่รหัสผ่าน)
}

/** บัญชีเว็บที่ล็อกอินอยู่ (ชื่อ + แฮชรหัสผ่านที่เก็บไว้ตอนล็อกอิน) — ไม่มี = ล็อกอินแบบเก่า/ยังไม่ล็อกอิน */
export function savedAccount(): AccountCreds | null {
  try {
    const username = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || '';
    const sessionToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || '';
    return username && sessionToken ? { username, sessionToken } : null;
  } catch {
    return null;
  }
}

function walletOwner(): string | null {
  try { return localStorage.getItem(OWNER_KEY); } catch { return null; }
}
function setWalletOwner(name: string | null): void {
  try { if (name) localStorage.setItem(OWNER_KEY, name); else localStorage.removeItem(OWNER_KEY); } catch { /* ไม่เป็นไร */ }
}

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
  // ล็อกอินด้วยบัญชีเว็บแล้ว → ใช้กระเป๋าของ "บัญชี" (ตามไปทุกเครื่อง) · เครื่องที่ยังไม่ผูก/เปลี่ยนบัญชี → ขอกระเป๋าของบัญชีนี้จากเซิร์ฟเวอร์
  const account = savedAccount();
  if (account && walletOwner() !== account.username) {
    const local = loadWallet();
    const body = { username: account.username, sessionToken: account.sessionToken, ...(walletOwner() === null ? walletBody(local) : {}) };
    const r = await api<WalletCreated>('wallet-login', body);
    if (r.ok) {
      const creds = { walletId: r.data.walletId, token: r.data.token };
      saveWallet(creds);
      setWalletOwner(account.username);
      return { ok: true, status: 200, data: { creds, wallet: r.data.wallet }, errorTh: '' };
    }
    // เซสชันหมดอายุ/ถูกยกเลิก (401) หรือข้อมูลล็อกอินผิดรูปแบบ (400): ห้ามถอยไปสร้าง/ใช้กระเป๋าของเครื่อง — จะทำให้เหรียญกับชุดไม่ตามบัญชี
    if (r.status === 401 || r.status === 400) {
      return { ok: false, status: 401, data: undefined as never, errorTh: 'เซสชันหมดอายุ — กรุณากด "ออกจากระบบ" แล้วล็อกอินใหม่ เหรียญและชุดของคุณจะกลับมา', code: 'bad_session' };
    }
    return { ok: false, status: r.status, data: undefined as never, errorTh: r.errorTh, code: r.code };
  }
  const existing = account && walletOwner() === account.username ? loadWallet() : (account ? null : loadWallet());
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

export const spinGacha = (c: WalletCreds, wheel: string, count: number) => api<GachaResponse>('gacha-spin', { wheel, count }, null, headers(c));
export const redeemCode = (c: WalletCreds, code: string) => api<RedeemResponse>('redeem-code', { code }, null, headers(c));
export const buyCollection = (c: WalletCreds, collectionId: string) => api<WalletView>('shop-buy-collection', { collectionId }, null, headers(c));
export const buyItem = (c: WalletCreds, itemId: string) => api<WalletView>('shop-buy', { itemId }, null, headers(c));
export const saveAvatar = (c: WalletCreds, avatar: AvatarConfig) => api<WalletView>('avatar-save', { avatar }, null, headers(c));
