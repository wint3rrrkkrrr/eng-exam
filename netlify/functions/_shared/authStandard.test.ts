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

  it('แอดมินรีเซ็ตรหัส: คนทั่วไปทำไม่ได้ (403) · แอดมินทำได้ และเซสชันของผู้ถูกรีเซ็ตถูกยกเลิก', async () => {
    const { ctx } = make();
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
