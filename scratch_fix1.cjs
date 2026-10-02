// ชั่วคราว (ลบหลังรัน): แก้บั๊กที่หาเจอรอบ review
const fs = require('fs');
const edit = (file, pairs) => {
  let s = fs.readFileSync(file, 'utf8');
  for (const [from, to] of pairs) {
    if (!s.includes(from)) throw new Error(file + ' missing: ' + from.slice(0, 70));
    s = s.replace(from, () => to);
  }
  fs.writeFileSync(file, s);
};

// 1) เพลง: ระบบเสียงที่ยัง suspended ตอนสั่งเริ่ม → รอ resume แล้วค่อยเริ่มเอง (เดิมเงียบไปเลยจนกว่าจะมี sync ครั้งถัดไป)
edit('src/games/werewolf/shared/sound.ts', [
  ["  const audio = getCtx();\n  if (!audio || audio.state !== 'running') return;\n  const track = TRACKS[name];",
   "  const audio = getCtx();\n  if (!audio) return;\n  if (audio.state !== 'running') {\n    // ยังไม่ผ่านการแตะ/กำลังปลุก → รอ resume เสร็จแล้วลองเริ่มใหม่ (ถ้าเบราว์เซอร์ยังไม่อนุญาต ก็รอการแตะครั้งถัดไป)\n    void audio.resume().then(() => syncMusic()).catch(() => { /* รอการแตะครั้งหน้า */ });\n    return;\n  }\n  const track = TRACKS[name];"],
]);

// 2) แอดมินรีเซ็ตรหัส: ต้องตั้ง WW_ADMINS ชัดเจนเท่านั้น (เดิมมีค่าเริ่มต้น win,wintararer → ใครสมัครชื่อนั้นก่อนก็ได้สิทธิ์แอดมิน)
edit('netlify/functions/_shared/handlers.ts', [
  ["(WW_ADMINS คั่นด้วย , ค่าเริ่มต้น win,wintararer)", "(ต้องตั้งตัวแปร WW_ADMINS คั่นด้วย , เช่น win · ไม่ตั้ง = ปิดฟีเจอร์ — กันคนสมัครชื่อแอดมินแล้วได้สิทธิ์)"],
  ["(process.env.WW_ADMINS ?? 'win,wintararer')", "(process.env.WW_ADMINS ?? '')"],
  ["  if (!admins.includes(me.username.toLowerCase())) return fail(403, 'เฉพาะแอดมินเท่านั้น', 'not_admin');",
   "  if (!admins.includes(me.username.toLowerCase())) return fail(403, 'เฉพาะแอดมินเท่านั้น (เซิร์ฟเวอร์ต้องตั้ง WW_ADMINS)', 'not_admin');"],
  // 3) ล็อกอินชื่อที่ตัวพิมพ์ใหญ่-เล็กไม่ตรงกับบัญชี: บอกตรงๆ แทนให้ไปสมัครแล้วชนว่าชื่อซ้ำ
  ["    if (mode === 'login') return fail(404, 'ยังไม่มีบัญชีชื่อนี้ — ไปที่แท็บ \"สมัครสมาชิก\" ก่อน', 'no_account');",
   "    if (mode === 'login') {\n      if (await ctx.store.credentialExistsIgnoreCase(username)) return fail(404, 'ไม่พบชื่อนี้ — มีชื่อที่คล้ายกันแต่ตัวพิมพ์ใหญ่-เล็กต่างกัน ลองพิมพ์ให้ตรงกับตอนสมัคร', 'no_account');\n      return fail(404, 'ยังไม่มีบัญชีชื่อนี้ — ไปที่แท็บ \"สมัครสมาชิก\" ก่อน', 'no_account');\n    }"],
]);
edit('netlify/functions/_shared/authStandard.test.ts', [
  ["  it('แอดมินรีเซ็ตรหัส: คนทั่วไปทำไม่ได้ (403) · แอดมินทำได้ และเซสชันของผู้ถูกรีเซ็ตถูกยกเลิก', async () => {\n    const { ctx } = make();",
   "  it('ไม่ตั้ง WW_ADMINS = ปิดรีเซ็ตโดยแอดมิน (แม้ชื่อ win) · login ชื่อตัวพิมพ์ต่างกันได้ข้อความบอกใบ้', async () => {\n    const { ctx } = make();\n    delete process.env.WW_ADMINS;\n    const w = tok(await H.authLogin(ctx, { username: 'win', password: 'adminpass9', mode: 'register' }));\n    expect((await H.authAdminReset(ctx, { sessionToken: w, target: 'win', newPassword: 'resetpass9' })).status).toBe(403);\n    const r = await H.authLogin(ctx, { username: 'WIN', password: 'adminpass9', mode: 'login' });\n    expect(r.status).toBe(404);\n    expect(JSON.stringify(r.body)).toContain('ตัวพิมพ์');\n  });\n\n  it('แอดมินรีเซ็ตรหัส: คนทั่วไปทำไม่ได้ (403) · แอดมินทำได้ และเซสชันของผู้ถูกรีเซ็ตถูกยกเลิก', async () => {\n    const { ctx } = make();\n    process.env.WW_ADMINS = 'win';"],
]);

// 4) ออกจากระบบ: ล้างกระเป๋าที่จำไว้ในเครื่องด้วย (เครื่องที่หลายคนใช้ร่วมกัน)
edit('src/App.tsx', [
  ["      void logoutAccount(); // ยกเลิกเซสชันที่เซิร์ฟเวอร์ด้วย (ต้องเรียกก่อนล้างโทเค็นในเครื่อง)\n",
   "      void logoutAccount(); // ยกเลิกเซสชันที่เซิร์ฟเวอร์ด้วย (ต้องเรียกก่อนล้างโทเค็นในเครื่อง)\n      try { localStorage.removeItem('ww_wallet_v1'); localStorage.removeItem('ww_wallet_owner_v1'); } catch { /* ไม่เป็นไร */ }\n"],
]);
edit('src/components/ChangePasswordForm.tsx', [
  ["เปลี่ยนรหัสผ่านแล้ว — เครื่องอื่นที่ล็อกอินอยู่ถูกออกจากระบบ", "เปลี่ยนรหัสผ่านแล้ว — เซสชันของเครื่องอื่นถูกยกเลิกแล้ว (ต้องล็อกอินใหม่ด้วยรหัสใหม่)"],
]);
edit('src/components/AdminModal.tsx', [
  ["— ต้องล็อกอินเกมด้วยบัญชีแอดมินอยู่ ถึงจะรีเซ็ตได้", "— ต้องล็อกอินเกมด้วยบัญชีแอดมิน และเซิร์ฟเวอร์ต้องตั้ง WW_ADMINS ไว้"],
]);
console.log('ok');
