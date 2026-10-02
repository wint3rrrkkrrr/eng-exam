// ระบบล็อกอินมาตรฐาน: สมัคร/เข้าสู่ระบบแยกกัน · นโยบายรหัสผ่าน · ชื่อซ้ำไม่สนตัวพิมพ์ · ออกจากระบบจริง · เปลี่ยนรหัส · แอดมินรีเซ็ต
import { describe, expect, it } from 'vitest';
import { MemoryStore } from './memoryStore';
import * as H from './handlers';
import type { Ctx } from './handlers';

const make = (): { ctx: Ctx; store: MemoryStore } => {
  const store = new MemoryStore();
  return { ctx: { store, now: () => 1_700_000_000_000, rand: (lo) => lo }, store };
};
const tok = (r: H.HandlerResult) => (r.body as { token: string }).token;

describe('สมัคร / เข้าสู่ระบบ แยกกัน', () => {
  it('login ชื่อที่ไม่มีบัญชี → 404 และ "ไม่สร้างบัญชีให้เอง" (กันพิมพ์ชื่อผิด)', async () => {
    const { ctx, store } = make();
    expect((await H.authLogin(ctx, { username: 'พิมพ์ผิด', password: 'secret99', mode: 'login' })).status).toBe(404);
    expect(await store.getCredential('พิมพ์ผิด')).toBeNull();
  });

  it('register: สำเร็จ → login ได้ · ชื่อซ้ำ → 409 · ซ้ำแบบตัวพิมพ์ต่างกันก็ 409', async () => {
    const { ctx } = make();
    const r = await H.authLogin(ctx, { username: 'Winter', password: 'secret99', mode: 'register' });
    expect(r.status).toBe(200);
    expect((r.body as { created: boolean }).created).toBe(true);
    expect((await H.authLogin(ctx, { username: 'Winter', password: 'other1234', mode: 'register' })).status).toBe(409);
    expect((await H.authLogin(ctx, { username: 'WINTER', password: 'other1234', mode: 'register' })).status).toBe(409);
    expect((await H.authLogin(ctx, { username: 'Winter', password: 'secret99', mode: 'login' })).status).toBe(200);
    expect((await H.authLogin(ctx, { username: 'Winter', password: 'ผิดครับ99', mode: 'login' })).status).toBe(401);
  });

  it('นโยบายรหัสผ่าน: สั้นกว่า 8 / ซ้ำชื่อ / รหัสยอดฮิต / ตัวเดียวซ้ำ ถูกปฏิเสธตอนสมัคร', async () => {
    const { ctx } = make();
    for (const pw of ['short1', 'newuser1', '12345678', 'password', 'aaaaaaaa']) {
      const r = await H.authLogin(ctx, { username: 'newuser1', password: pw, mode: 'register' });
      expect(r.status, pw).toBe(400);
    }
    expect((await H.authLogin(ctx, { username: 'newuser1', password: 'ดีพอแล้ว99', mode: 'register' })).status).toBe(200);
  });

  it('บัญชีเก่ารหัสสั้น (4 ตัว) ยังล็อกอินได้ · ชื่อที่ยังไม่เคยตั้งรหัสใช้สมัครรับสิทธิ์ได้', async () => {
    const { ctx, store } = make();
    await store.createCredential('เก่า', (await import('./crypto')).hashPassword('1234'));
    expect((await H.authLogin(ctx, { username: 'เก่า', password: '1234', mode: 'login' })).status).toBe(200);
    // ชื่อเดิมใน winter_users ที่ไม่มีรหัส = ไม่มีแถวใน credentials → สมัครได้
    expect((await H.authLogin(ctx, { username: 'ไม่มีรหัส', password: 'secret99', mode: 'register' })).status).toBe(200);
  });

  it('ไม่ระบุ mode = พฤติกรรมเดิม (ล็อกอิน/สมัครรวม) เพื่อเบราว์เซอร์รุ่นเก่า', async () => {
    const { ctx } = make();
    expect((await H.authLogin(ctx, { username: 'legacy1', password: 'abcd' })).status).toBe(200);
    expect((await H.authLogin(ctx, { username: 'legacy1', password: 'abcd' })).status).toBe(200);
  });

  it('ชื่อที่มีอักขระควบคุม/วงเล็บแหลม ถูกปฏิเสธ', async () => {
    const { ctx } = make();
    for (const u of ['a<b>c', 'ab\u0007cd']) expect((await H.authLogin(ctx, { username: u, password: 'secret99', mode: 'register' })).status, u).toBe(400);
  });
});

describe('ออกจากระบบ / เปลี่ยนรหัสผ่าน / แอดมินรีเซ็ต', () => {
  it('ออกจากระบบ: โทเค็นเดิมใช้ล็อกอินกระเป๋าไม่ได้อีก', async () => {
    const { ctx } = make();
    const t = tok(await H.authLogin(ctx, { username: 'outuser', password: 'secret99', mode: 'register' }));
    expect((await H.walletLogin(ctx, { username: 'outuser', sessionToken: t })).status).toBe(200);
    expect((await H.authLogout(ctx, { sessionToken: t })).status).toBe(200);
    expect((await H.walletLogin(ctx, { username: 'outuser', sessionToken: t })).status).toBe(401);
    expect((await H.authLogout(ctx, { sessionToken: t })).status).toBe(401); // ออกซ้ำ = ไม่มีเซสชันแล้ว
  });

  it('เปลี่ยนรหัส: ต้องรู้รหัสเดิม · รหัสใหม่ต้องผ่านนโยบาย · สำเร็จแล้วเครื่องอื่นหลุด เครื่องนี้ยังอยู่', async () => {
    const { ctx } = make();
    const a = tok(await H.authLogin(ctx, { username: 'pwuser', password: 'oldpass99', mode: 'register' }));
    const b = tok(await H.authLogin(ctx, { username: 'pwuser', password: 'oldpass99', mode: 'login' })); // เครื่องที่สอง
    expect((await H.authPassword(ctx, { sessionToken: a, oldPassword: 'ผิดๆๆๆๆๆ1', newPassword: 'brandnew99' })).status).toBe(401);
    expect((await H.authPassword(ctx, { sessionToken: a, oldPassword: 'oldpass99', newPassword: 'short' })).status).toBe(400);
    expect((await H.authPassword(ctx, { sessionToken: a, oldPassword: 'oldpass99', newPassword: 'oldpass99' })).status).toBe(400);
    expect((await H.authPassword(ctx, { sessionToken: 'x'.repeat(30), oldPassword: 'oldpass99', newPassword: 'brandnew99' })).status).toBe(401);
    expect((await H.authPassword(ctx, { sessionToken: a, oldPassword: 'oldpass99', newPassword: 'brandnew99' })).status).toBe(200);
    expect((await H.authLogin(ctx, { username: 'pwuser', password: 'oldpass99', mode: 'login' })).status).toBe(401);
    expect((await H.authLogin(ctx, { username: 'pwuser', password: 'brandnew99', mode: 'login' })).status).toBe(200);
    expect((await H.walletLogin(ctx, { username: 'pwuser', sessionToken: a })).status).toBe(200); // เครื่องที่เปลี่ยนรหัสยังอยู่
    expect((await H.walletLogin(ctx, { username: 'pwuser', sessionToken: b })).status).toBe(401); // เครื่องอื่นถูกเตะ
  });

  it('ไม่ตั้ง WW_ADMINS = ปิดรีเซ็ตโดยแอดมิน (แม้ชื่อ win) · login ชื่อตัวพิมพ์ต่างกันได้ข้อความบอกใบ้', async () => {
    const { ctx } = make();
    delete process.env.WW_ADMINS;
    const w = tok(await H.authLogin(ctx, { username: 'win', password: 'adminpass9', mode: 'register' }));
    expect((await H.authAdminReset(ctx, { sessionToken: w, target: 'win', newPassword: 'resetpass9' })).status).toBe(403);
    const r = await H.authLogin(ctx, { username: 'WIN', password: 'adminpass9', mode: 'login' });
    expect(r.status).toBe(404);
    expect(JSON.stringify(r.body)).toContain('ตัวพิมพ์');
  });

  it('แอดมินรีเซ็ตรหัส: คนทั่วไปทำไม่ได้ (403) · แอดมินทำได้ และเซสชันของผู้ถูกรีเซ็ตถูกยกเลิก', async () => {
    const { ctx } = make();
    process.env.WW_ADMINS = 'win';
    const victim = tok(await H.authLogin(ctx, { username: 'forgetful', password: 'oldpass99', mode: 'register' }));
    const normal = tok(await H.authLogin(ctx, { username: 'someone', password: 'secret99', mode: 'register' }));
    const admin = tok(await H.authLogin(ctx, { username: 'win', password: 'adminpass9', mode: 'register' }));
    expect((await H.authAdminReset(ctx, { sessionToken: normal, target: 'forgetful', newPassword: 'resetpass9' })).status).toBe(403);
    expect((await H.authAdminReset(ctx, { sessionToken: admin, target: 'ไม่มีคนนี้', newPassword: 'resetpass9' })).status).toBe(404);
    expect((await H.authAdminReset(ctx, { sessionToken: admin, target: 'forgetful', newPassword: 'short' })).status).toBe(400);
    expect((await H.authAdminReset(ctx, { sessionToken: admin, target: 'forgetful', newPassword: 'resetpass9' })).status).toBe(200);
    expect((await H.authLogin(ctx, { username: 'forgetful', password: 'resetpass9', mode: 'login' })).status).toBe(200);
    expect((await H.walletLogin(ctx, { username: 'forgetful', sessionToken: victim })).status).toBe(401);
  });
});

describe('เปลี่ยนเครื่อง: เงิน/ชุดต้องตามบัญชี', () => {
  const login = async (ctx: Ctx, username: string) => tok(await H.authLogin(ctx, { username, password: 'secret99', mode: 'login' }));

  it('★ เครื่อง A มีกระเป๋าเก่า (ซื้อของแล้ว ยังไม่ผูกบัญชี) → เครื่อง B เปิดก่อน → เครื่อง A ตามมา: ของ/เหรียญรวมกัน ไม่สูญ', async () => {
    const { ctx, store } = make();
    await H.authLogin(ctx, { username: 'mover', password: 'secret99', mode: 'register' });
    // เครื่อง A: กระเป๋าเก่าแบบไม่ผูกบัญชี ซื้อของไว้
    const a = (await H.walletCreate(ctx)).body as { walletId: string; token: string };
    await H.shopBuy(ctx, { 'x-ww-wallet-id': a.walletId, 'x-ww-wallet-token': a.token }, { itemId: 'hw_cap' });
    const aBefore = (await store.getWallet(a.walletId))!;
    expect(aBefore.owned).toContain('hw_cap');
    // เครื่อง B ล็อกอินก่อน (ไม่มีกระเป๋าเครื่อง) → ได้กระเป๋าใหม่ของบัญชี
    const b = (await H.walletLogin(ctx, { username: 'mover', sessionToken: await login(ctx, 'mover') })).body as { walletId: string; wallet: { coins: number; owned: string[] } };
    expect(b.wallet.owned).not.toContain('hw_cap');
    // เครื่อง A ล็อกอินตามมา พร้อมกระเป๋าเก่า → รวมเข้าบัญชี
    const merged = (await H.walletLogin(ctx, { username: 'mover', sessionToken: await login(ctx, 'mover'), walletId: a.walletId, walletToken: a.token })).body as { walletId: string; wallet: { coins: number; owned: string[] } };
    expect(merged.walletId).toBe(b.walletId); // ใช้กระเป๋าของบัญชีเดียวกัน
    expect(merged.wallet.owned).toContain('hw_cap');
    expect(merged.wallet.coins).toBe(b.wallet.coins + aBefore.coins);
    // กระเป๋าเก่าถูกปิด: ล็อกอินซ้ำพร้อมกระเป๋าเก่าไม่รวมซ้ำ (เหรียญไม่งอกเพิ่ม)
    const again = (await H.walletLogin(ctx, { username: 'mover', sessionToken: await login(ctx, 'mover'), walletId: a.walletId, walletToken: a.token })).body as { wallet: { coins: number } };
    expect(again.wallet.coins).toBe(merged.wallet.coins);
  });

  it('บัญชีที่ผูกกระเป๋าแล้ว ล็อกอินจากเครื่องใหม่ (ไม่มีกระเป๋าเครื่อง) → ได้กระเป๋า/ของเดิมครบ', async () => {
    const { ctx } = make();
    await H.authLogin(ctx, { username: 'phoenix', password: 'secret99', mode: 'register' });
    const first = (await H.walletLogin(ctx, { username: 'phoenix', sessionToken: await login(ctx, 'phoenix') })).body as { walletId: string; token: string };
    await H.shopBuy(ctx, { 'x-ww-wallet-id': first.walletId, 'x-ww-wallet-token': first.token }, { itemId: 'hw_cap' });
    const second = (await H.walletLogin(ctx, { username: 'phoenix', sessionToken: await login(ctx, 'phoenix') })).body as { walletId: string; wallet: { owned: string[] } };
    expect(second.walletId).toBe(first.walletId);
    expect(second.wallet.owned).toContain('hw_cap');
  });
});
