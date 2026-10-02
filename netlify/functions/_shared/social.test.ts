// ความก้าวหน้า (เลเวล/XP/สถิติ) · อันดับ · เพื่อน · รายงานผู้เล่น · ฝั่งเซิร์ฟเวอร์
import { describe, expect, it } from 'vitest';
import { MemoryStore } from './memoryStore';
import * as H from './handlers';
import type { Ctx } from './handlers';
import { applyGameResult, emptyProgress } from '../../../src/games/werewolf/shared/progress';

const make = (): { ctx: Ctx; store: MemoryStore } => {
  const store = new MemoryStore();
  return { ctx: { store, now: () => 1_700_000_000_000, rand: (lo) => lo }, store };
};
const reg = async (ctx: Ctx, username: string): Promise<string> =>
  ((await H.authLogin(ctx, { username, password: 'secret99', mode: 'register' })).body as { token: string }).token;

describe('ความก้าวหน้า/อันดับ', () => {
  it('ยังไม่เคยเล่น → เลเวล 1 ไม่มีอันดับ · ไม่ล็อกอิน → 401', async () => {
    const { ctx } = make();
    const t = await reg(ctx, 'newbie');
    const r = await H.progressGet(ctx, { sessionToken: t });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ username: 'newbie', level: 1, rank: null });
    expect((await H.progressGet(ctx, { sessionToken: 'x'.repeat(30) })).status).toBe(401);
  });

  it('มีผลเกม → เลเวล/อันดับถูกต้อง · ตารางอันดับเรียงตาม XP', async () => {
    const { ctx, store } = make();
    const a = await reg(ctx, 'alpha');
    await reg(ctx, 'beta');
    let pa = emptyProgress();
    for (let i = 0; i < 4; i++) pa = applyGameResult(pa, { won: true, survived: true, role: 'seer', team: 'village' }).progress;
    await store.saveProgress('alpha', pa);
    await store.saveProgress('beta', applyGameResult(emptyProgress(), { won: false, survived: false, role: 'villager', team: 'village' }).progress);
    const me = (await H.progressGet(ctx, { sessionToken: a })).body as { rank: number; level: number; xp: number };
    expect(me.rank).toBe(1);
    expect(me.xp).toBe(4 * 85);
    const lb = (await H.leaderboard(ctx)).body as { rows: { username: string; rank: number }[] };
    expect(lb.rows.map((r) => r.username)).toEqual(['alpha', 'beta']);
    expect(lb.rows[1].rank).toBe(2);
  });
});

describe('เพื่อน', () => {
  it('คืนเพื่อนพร้อมเลเวล · ออนไลน์ถ้าใช้งานภายใน 5 นาที · เรียงออนไลน์ก่อน', async () => {
    const { ctx, store } = make();
    const t = await reg(ctx, 'me1');
    store.friends.set('me1', ['อ่อนไลน์', 'ออฟไลน์']);
    store.lastActive.set('อ่อนไลน์', new Date(1_700_000_000_000 - 60_000).toISOString());
    store.lastActive.set('ออฟไลน์', new Date(1_700_000_000_000 - 3_600_000).toISOString());
    const rows = ((await H.friendsList(ctx, { sessionToken: t })).body as { rows: { username: string; online: boolean }[] }).rows;
    expect(rows.map((r) => [r.username, r.online])).toEqual([['อ่อนไลน์', true], ['ออฟไลน์', false]]);
    expect((await H.friendsList(ctx, { sessionToken: 'bad' })).status).toBe(401);
  });
});

describe('รายงานผู้เล่น', () => {
  it('รายงานสำเร็จ · รายงานตัวเอง/เหตุผลผิด/ผู้เล่นนอกห้อง ถูกปฏิเสธ · แอดมินเท่านั้นที่อ่านและปิดเรื่อง', async () => {
    const { ctx, store } = make();
    const host = (await H.createRoom(ctx, { displayName: 'เจ้าห้อง' })).body as { roomCode: string; playerId: string; token: string };
    const joined = (await H.joinRoom(ctx, { roomCode: host.roomCode, displayName: 'คนก่อกวน' })).body as { playerId: string };
    const h = { 'x-ww-player-id': host.playerId, 'x-ww-token': host.token };
    const base = { roomCode: host.roomCode, targetPlayerId: joined.playerId };
    expect((await H.reportSubmit(ctx, h, { ...base, reason: 'abuse', detail: 'ด่าทอ' })).status).toBe(200);
    expect((await H.reportSubmit(ctx, h, { ...base, reason: 'bogus' })).status).toBe(400);
    expect((await H.reportSubmit(ctx, h, { ...base, targetPlayerId: host.playerId, reason: 'spam' })).status).toBe(400);
    expect((await H.reportSubmit(ctx, h, { ...base, targetPlayerId: 'nope', reason: 'spam' })).status).toBe(404);
    expect((await H.reportSubmit(ctx, {}, { ...base, reason: 'spam' })).status).toBe(401);

    process.env.WW_ADMINS = 'boss';
    const admin = await reg(ctx, 'boss');
    const normal = await reg(ctx, 'someone');
    expect((await H.reportList(ctx, { sessionToken: normal })).status).toBe(403);
    const list = (await H.reportList(ctx, { sessionToken: admin })).body as { rows: { id: string; target_name: string; reason: string }[] };
    expect(list.rows).toHaveLength(1);
    expect(list.rows[0]).toMatchObject({ target_name: 'คนก่อกวน', reason: 'abuse' });
    expect((await H.reportResolve(ctx, { sessionToken: normal, id: list.rows[0].id })).status).toBe(403);
    expect((await H.reportResolve(ctx, { sessionToken: admin, id: list.rows[0].id, status: 'resolved', note: 'เตือนแล้ว' })).status).toBe(200);
    expect(((await H.reportList(ctx, { sessionToken: admin })).body as { rows: unknown[] }).rows).toHaveLength(0); // เหลือแต่ที่ยังไม่ปิด
    expect(store.reports[0].status).toBe('resolved');
    delete process.env.WW_ADMINS;
  });
});
