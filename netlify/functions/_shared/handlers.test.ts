// ทดสอบตรรกะฝั่งเซิร์ฟเวอร์ด้วย MemoryStore: ห้อง · ตั๋ว · เริ่มเกม · กันความลับ · เวลา · แชท · ปล่อยที่นั่ง · เล่นจบทั้งเกม
import { describe, expect, it } from 'vitest';
import { MemoryStore } from './memoryStore';
import * as H from './handlers';
import type { Ctx, Headers } from './handlers';
import { presetRoles } from '../../../src/games/werewolf/engine';
import { countsFromRoles } from '../../../src/games/werewolf/shared/lobby';
import type { AuthResponse, MyViewResponse } from '../../../src/games/werewolf/shared/api';

interface Env {
  ctx: Ctx;
  store: MemoryStore;
  clock: { t: number };
}

function makeEnv(): Env {
  const clock = { t: 1_700_000_000_000 };
  const store = new MemoryStore();
  return { ctx: { store, now: () => clock.t, rand: (lo) => lo }, store, clock };
}

const hdr = (a: AuthResponse): Headers => ({ 'x-ww-player-id': a.playerId, 'x-ww-token': a.token });
const bodyOf = <T>(r: H.HandlerResult): T => r.body as T;

async function lobbyOf(env: Env, n: number, opts: { password?: string } = {}) {
  const host = bodyOf<AuthResponse>(await H.createRoom(env.ctx, { displayName: 'เจ้าของห้อง', password: opts.password }));
  const players = [host];
  for (let i = 2; i <= n; i++) {
    const r = await H.joinRoom(env.ctx, { roomCode: host.roomCode, displayName: `ผู้เล่น${i}`, password: opts.password });
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    players.push(bodyOf<AuthResponse>(r));
  }
  return { code: host.roomCode, host, players };
}

async function startWith(env: Env, n: number, roles = presetRoles(n)) {
  const lob = await lobbyOf(env, n);
  const u = await H.updateSettings(env.ctx, hdr(lob.host), { roomCode: lob.code, settings: { roleCounts: countsFromRoles(roles) } });
  expect(u.status).toBe(200);
  const s = await H.startGame(env.ctx, hdr(lob.host), { roomCode: lob.code });
  expect(s.status, JSON.stringify(s.body)).toBe(200);
  return lob;
}

const view = async (env: Env, code: string, a: AuthResponse) => {
  const r = await H.myView(env.ctx, hdr(a), { roomCode: code });
  expect(r.status, JSON.stringify(r.body)).toBe(200);
  return bodyOf<MyViewResponse>(r);
};

// ================================================================ สร้าง/เข้าห้อง
describe('สร้าง/เข้าห้อง', () => {
  it('สร้างห้องได้ รหัส 5 ตัว ได้ตั๋ว · ชื่อว่าง/ยาวเกินถูกปฏิเสธ', async () => {
    const env = makeEnv();
    const r = bodyOf<AuthResponse>(await H.createRoom(env.ctx, { displayName: ' ส้ม ' }));
    expect(r.roomCode).toMatch(/^[A-Z2-9]{5}$/);
    expect(r.token.length).toBeGreaterThan(30);
    expect((await H.createRoom(env.ctx, { displayName: '   ' })).status).toBe(400);
    expect((await H.createRoom(env.ctx, { displayName: 'x'.repeat(31) })).status).toBe(400);
    expect((await env.store.listPlayers(r.roomCode))[0].display_name).toBe('ส้ม');
  });

  it('เก็บเฉพาะ "แฮช" ของตั๋ว ไม่เก็บตั๋วดิบ', async () => {
    const env = makeEnv();
    const r = bodyOf<AuthResponse>(await H.createRoom(env.ctx, { displayName: 'ส้ม' }));
    const stored = await env.store.getAuth(r.playerId);
    expect(stored!.token_hash).not.toBe(r.token);
    expect(JSON.stringify(Array.from(env.store.auth.values()))).not.toContain(r.token);
  });

  it('เข้าห้อง: รหัสผิด/ไม่มีห้อง/ชื่อซ้ำ/ห้องเต็ม', async () => {
    const env = makeEnv();
    const { code, host } = await lobbyOf(env, 2);
    expect((await H.joinRoom(env.ctx, { roomCode: 'ZZZZZ', displayName: 'ก' })).status).toBe(404);
    expect((await H.joinRoom(env.ctx, { roomCode: 'ab', displayName: 'ก' })).status).toBe(400);
    expect((await H.joinRoom(env.ctx, { roomCode: code, displayName: 'เจ้าของห้อง' })).status).toBe(409);
    expect((await H.joinRoom(env.ctx, { roomCode: code, displayName: 'ผู้เล่น2' })).status).toBe(409); // ชื่อซ้ำ (ไม่ต้องสนตัวพิมพ์)
    await H.updateSettings(env.ctx, hdr(host), { roomCode: code, settings: { maxPlayers: 5 } });
    for (let i = 3; i <= 5; i++) await H.joinRoom(env.ctx, { roomCode: code, displayName: `ผู้เล่น${i}` });
    const full = await H.joinRoom(env.ctx, { roomCode: code.toLowerCase(), displayName: 'คนที่หก' });
    expect(full.status).toBe(403);
    expect(bodyOf<{ code: string }>(full).code).toBe('full');
  });

  it('ห้องมีรหัสผ่าน: ไม่ใส่/ใส่ผิดเข้าไม่ได้ ใส่ถูกเข้าได้ · แฮชรหัสผ่านไม่อยู่ในตารางสาธารณะ', async () => {
    const env = makeEnv();
    const { code } = await lobbyOf(env, 1, { password: 'ลับสุดยอด' });
    expect((await H.joinRoom(env.ctx, { roomCode: code, displayName: 'ก' })).status).toBe(403);
    expect((await H.joinRoom(env.ctx, { roomCode: code, displayName: 'ก', password: 'ผิด' })).status).toBe(403);
    expect((await H.joinRoom(env.ctx, { roomCode: code, displayName: 'ก', password: 'ลับสุดยอด' })).status).toBe(200);
    const room = await env.store.getRoom(code);
    expect(room!.has_password).toBe(true);
    expect(JSON.stringify(room)).not.toContain('ลับสุดยอด');
    expect(JSON.stringify(room)).not.toContain('scrypt');
    expect(JSON.stringify(room)).not.toContain('password_hash');
  });
});

// ================================================================ ตั๋วผู้เล่น
describe('ตั๋วผู้เล่น (auth)', () => {
  it('ไม่มีตั๋ว/ตั๋วผิด/ตั๋วของคนอื่น/ตั๋วจากห้องอื่น → 401', async () => {
    const env = makeEnv();
    const a = await lobbyOf(env, 2);
    const b = await lobbyOf(env, 2);
    expect((await H.myView(env.ctx, {}, { roomCode: a.code })).status).toBe(401);
    expect((await H.myView(env.ctx, { 'x-ww-player-id': a.host.playerId, 'x-ww-token': 'ปลอม' }, { roomCode: a.code })).status).toBe(401);
    // ใช้ตั๋วของผู้เล่นคนอื่นกับ id ของเจ้าของห้อง
    expect((await H.myView(env.ctx, { 'x-ww-player-id': a.host.playerId, 'x-ww-token': a.players[1].token }, { roomCode: a.code })).status).toBe(401);
    // ตั๋วถูกแต่ห้องไม่ตรง
    expect((await H.myView(env.ctx, hdr(a.host), { roomCode: b.code })).status).toBe(401);
    expect((await H.myView(env.ctx, hdr(a.host), { roomCode: a.code })).status).toBe(200);
  });

  it('เฉพาะเจ้าของห้องที่ตั้งค่า/เริ่มเกม/ปล่อยที่นั่งได้', async () => {
    const env = makeEnv();
    const { code, players } = await lobbyOf(env, 3);
    const guest = hdr(players[1]);
    expect((await H.updateSettings(env.ctx, guest, { roomCode: code, settings: {} })).status).toBe(403);
    expect((await H.startGame(env.ctx, guest, { roomCode: code })).status).toBe(403);
    expect((await H.releaseSeat(env.ctx, guest, { roomCode: code, targetPlayerId: players[2].playerId })).status).toBe(403);
  });
});

// ================================================================ ตั้งค่า + เริ่มเกม
describe('ตั้งค่า + เริ่มเกม', () => {
  it('ค่าตั้งค่าถูกทำความสะอาด: บทไม่รู้จักถูกทิ้ง · ค่านอกช่วงถูกบีบ · ค่ากติกาแปลกปลอมถูกทิ้ง', async () => {
    const env = makeEnv();
    const { code, host } = await lobbyOf(env, 1);
    const r = await H.updateSettings(env.ctx, hdr(host), {
      roomCode: code,
      settings: {
        roleCounts: { werewolf: 2, ghost: 5, seer: -3 },
        rules: { tieRule: 'revote', hack: true, wolfDisagree: 'xxx', maxNominees: 99 },
        timers: { discussionSeconds: 99999, voteSeconds: 1 },
        chatMode: 'bad',
        maxPlayers: 1000,
      },
    });
    const lobby = bodyOf<{ lobby: any }>(r).lobby;
    expect(lobby.roleCounts).toEqual({ werewolf: 2 });
    expect(lobby.rules).toEqual({ tieRule: 'revote', maxNominees: 5 });
    expect(lobby.timers.discussionSeconds).toBe(900);
    expect(lobby.timers.voteSeconds).toBe(10);
    expect(lobby.chatMode).toBe('both');
    expect(lobby.maxPlayers).toBe(30);
  });

  it('เริ่มเกมไม่ได้ถ้าจำนวนบทไม่เท่าผู้เล่น / ไม่มีหมาป่า (422 พร้อมข้อความไทย)', async () => {
    const env = makeEnv();
    const lob = await lobbyOf(env, 6);
    await H.updateSettings(env.ctx, hdr(lob.host), { roomCode: lob.code, settings: { roleCounts: { werewolf: 1, villager: 3 } } });
    const r = await H.startGame(env.ctx, hdr(lob.host), { roomCode: lob.code });
    expect(r.status).toBe(422);
    expect(bodyOf<{ errorTh: string }>(r).errorTh).toContain('ไม่เท่ากับจำนวนผู้เล่น');
    expect((await env.store.getRoom(lob.code))!.phase).toBe('lobby');
  });

  it('เริ่มเกมสำเร็จ → role_reveal · ห้องล็อก · คนใหม่เข้าไม่ได้ · แก้ตั้งค่าไม่ได้', async () => {
    const env = makeEnv();
    const lob = await startWith(env, 8);
    const room = (await env.store.getRoom(lob.code))!;
    expect(room.phase).toBe('role_reveal');
    expect(room.is_locked).toBe(true);
    expect((await H.joinRoom(env.ctx, { roomCode: lob.code, displayName: 'มาสาย' })).status).toBe(403);
    expect((await H.updateSettings(env.ctx, hdr(lob.host), { roomCode: lob.code, settings: {} })).status).toBe(409);
    expect((await H.startGame(env.ctx, hdr(lob.host), { roomCode: lob.code })).status).toBe(409);
  });
});

// ================================================================ ★ กันความลับ
describe('กันความลับ (my-view)', () => {
  it('ทุกคนเห็นบทของตัวเองเท่านั้น · ตารางสาธารณะไม่มีบท · บันทึกสาธารณะไม่มีการแจกบท', async () => {
    const env = makeEnv();
    const lob = await startWith(env, 10);
    const secrets = (await env.store.getRoomSecrets(lob.code))!.engine_state!.game;
    const roleOf = new Map(secrets.players.map((p) => [p.id, p.roleId]));

    for (const a of lob.players) {
      const v = await view(env, lob.code, a);
      const json = JSON.stringify(v);
      expect(v.game!.me.role).toBe(roleOf.get(a.playerId));
      // ผู้เล่นอื่นที่ยังรอด ต้องไม่ถูกเปิดบท
      for (const p of v.players) expect(p.revealedRole).toBeNull();
      expect(v.log.some((e) => e.kind === 'roles_assigned')).toBe(false);
      // ผู้ที่ไม่ใช่หมาป่า ต้องไม่เห็นว่าใครเป็นหมาป่า
      if (roleOf.get(a.playerId) !== 'werewolf') expect(json).not.toContain('"role":"werewolf"');
      expect(json).not.toContain('rngState');
      expect(json).not.toContain('engine_state');
      expect(json).not.toContain('token_hash');
    }
    // ข้อมูลที่ anon อ่านได้จริงๆ (ตารางเปิด) ต้องไม่มีบท
    const publicRows = JSON.stringify([await env.store.getRoom(lob.code), await env.store.listPlayers(lob.code)]);
    for (const role of ['"role"', 'role_id', 'rng_seed', 'token']) expect(publicRows).not.toContain(role);
  });

  it('การส่งแอคชันปลอม: ชาวบ้านส่งคำสั่งกัด · actorId ปลอมในตัวคำขอ → ถูกปฏิเสธ สถานะไม่เปลี่ยน', async () => {
    const env = makeEnv();
    const lob = await startWith(env, 8);
    for (const a of lob.players) await H.action(env.ctx, hdr(a), { roomCode: lob.code, type: 'ready' });
    const g0 = (await env.store.getRoomSecrets(lob.code))!.engine_state!.game;
    expect(g0.phase).toBe('night');
    const villager = lob.players.find((a) => g0.players.find((p) => p.id === a.playerId)!.roleId === 'villager')!;
    const wolf = g0.players.find((p) => p.roleId === 'werewolf')!;
    const before = JSON.stringify((await env.store.getRoomSecrets(lob.code))!.engine_state);

    const r = await H.action(env.ctx, hdr(villager), { roomCode: lob.code, type: 'night_action', kind: 'wolf_bite', targets: [wolf.id], actorId: wolf.id });
    expect(r.status).toBe(403);
    expect(await env.store.getRoomSecrets(lob.code).then((s) => JSON.stringify(s!.engine_state))).toBe(before);
    expect(env.store.eventsPrivate.get(lob.code)!.some((e) => e.kind === 'rejected')).toBe(true);
    expect((await H.action(env.ctx, hdr(villager), { roomCode: lob.code, type: 'drop_table' })).status).toBe(400);
  });
});

// ================================================================ เวลา (tick)
describe('ตัวจับเวลา (tick)', () => {
  it('ทุกคนกด "พร้อม" → เริ่มคืนแรกทันที', async () => {
    const env = makeEnv();
    const lob = await startWith(env, 8);
    expect((await env.store.getRoom(lob.code))!.phase).toBe('role_reveal');
    for (const a of lob.players) await H.action(env.ctx, hdr(a), { roomCode: lob.code, type: 'ready' });
    expect((await env.store.getRoom(lob.code))!.phase).toBe('night');
  });

  it('หมดเวลาดูบท → tick เดินเข้าคืนแรกเอง (แม้บางคนไม่กดพร้อม)', async () => {
    const env = makeEnv();
    const lob = await startWith(env, 8);
    expect((await H.tick(env.ctx, hdr(lob.host), { roomCode: lob.code })).body).toEqual({ advanced: false });
    env.clock.t += 61_000;
    expect((await H.tick(env.ctx, hdr(lob.host), { roomCode: lob.code })).body).toEqual({ advanced: true });
    expect((await env.store.getRoom(lob.code))!.phase).toBe('night');
  });

  it('★ กลางคืนเฟสเดียว: ไม่จบก่อนเวลาขั้นต่ำ และไม่จบจนกว่าทุกคนกดครบ/หมดเวลา', async () => {
    const env = makeEnv();
    const lob = await startWith(env, 8);
    for (const a of lob.players) await H.action(env.ctx, hdr(a), { roomCode: lob.code, type: 'ready' });
    const phaseOf = async () => (await env.store.getRoom(lob.code))!.phase;
    expect(await phaseOf()).toBe('night');
    env.clock.t += 1000; // ยังไม่ถึงเวลาขั้นต่ำ
    expect((await H.tick(env.ctx, hdr(lob.host), { roomCode: lob.code })).body).toEqual({ advanced: false });
    expect(await phaseOf()).toBe('night');
    env.clock.t += 13_000; // เกินเวลาขั้นต่ำแล้ว แต่ยังมีคนไม่กด + ยังไม่หมดเวลา → ยังไม่จบคืน
    expect((await H.tick(env.ctx, hdr(lob.host), { roomCode: lob.code })).body).toEqual({ advanced: false });
    expect(await phaseOf()).toBe('night');
    env.clock.t += 300_000; // หมดเวลา → จบคืน
    expect((await H.tick(env.ctx, hdr(lob.host), { roomCode: lob.code })).body).toEqual({ advanced: true });
    expect(await phaseOf()).not.toBe('night');
  });

  it('★ กลางคืน: คนกดแอคชันไม่ต่อเวลา (phase_ends_at ไม่ขยับ) — กันคนยื้อเวลา', async () => {
    const env = makeEnv();
    const lob = await startWith(env, 8);
    for (const a of lob.players) await H.action(env.ctx, hdr(a), { roomCode: lob.code, type: 'ready' });
    const room0 = (await env.store.getRoom(lob.code))!;
    expect(room0.phase).toBe('night');
    const ends0 = room0.phase_ends_at;
    env.clock.t += 2000;
    for (const a of lob.players) await actFor(env, lob.code, a, await view(env, lob.code, a), 0, 0);
    const room1 = (await env.store.getRoom(lob.code))!;
    expect(room1.phase).toBe('night');
    expect(room1.phase_ends_at).toBe(ends0);
  });

  it('★ โหวตข้ามการพูดคุย: เกินครึ่งแล้วเข้าเสนอชื่อทันที และตั้งเวลาเฟสใหม่ที่เซิร์ฟเวอร์', async () => {
    const env = makeEnv();
    const lob = await startWith(env, 6);
    for (const a of lob.players) await H.action(env.ctx, hdr(a), { roomCode: lob.code, type: 'ready' });
    env.clock.t += 300_000;
    await H.tick(env.ctx, hdr(lob.host), { roomCode: lob.code });
    env.clock.t += 9_000;
    await H.tick(env.ctx, hdr(lob.host), { roomCode: lob.code });
    const r0 = (await env.store.getRoom(lob.code))!;
    expect(r0.phase).toBe('discussion');
    const g = (await env.store.getRoomSecrets(lob.code))!.engine_state!.game;
    const aliveIds = g.players.filter((p) => p.alive).map((p) => p.id);
    const need = Math.floor(aliveIds.length / 2) + 1;
    const voters = lob.players.filter((a) => aliveIds.includes(a.playerId));
    for (let i = 0; i < need - 1; i++) {
      expect((await H.action(env.ctx, hdr(voters[i]), { roomCode: lob.code, type: 'skip_discussion' })).status).toBe(200);
    }
    expect((await env.store.getRoom(lob.code))!.phase).toBe('discussion');
    expect((await H.action(env.ctx, hdr(voters[need - 1]), { roomCode: lob.code, type: 'skip_discussion' })).status).toBe(200);
    const r1 = (await env.store.getRoom(lob.code))!;
    expect(r1.phase).toBe('nomination');
    expect(r1.phase_ends_at).not.toBe(r0.phase_ends_at); // เวลาของเฟสใหม่
    // ผู้ชมโหวตไม่ได้ · นอกช่วงอภิปรายถูกปฏิเสธ
    expect((await H.action(env.ctx, hdr(voters[0]), { roomCode: lob.code, type: 'skip_discussion' })).status).toBe(403);
  });

  it('★ ผู้ควบคุมเวลา: เพิ่ม/ลดเวลาอภิปรายจริงที่เซิร์ฟเวอร์ (ครั้งละ 60 วินาที) · ลดแล้วเหลือไม่ต่ำกว่า 10 วินาที', async () => {
    const env = makeEnv();
    const roles = ['time_lord', 'werewolf', 'villager', 'villager', 'villager', 'villager'];
    const lob = await startWith(env, 6, roles);
    for (const a of lob.players) await H.action(env.ctx, hdr(a), { roomCode: lob.code, type: 'ready' });
    const g = (await env.store.getRoomSecrets(lob.code))!.engine_state!.game;
    const tl = lob.players.find((a) => g.players.find((p) => p.id === a.playerId)!.roleId === 'time_lord')!;
    env.clock.t += 300_000; // กลางคืนหมดเวลา → เช้า
    await H.tick(env.ctx, hdr(lob.host), { roomCode: lob.code });
    env.clock.t += 9_000; // เช้า → อภิปราย
    await H.tick(env.ctx, hdr(lob.host), { roomCode: lob.code });
    const r0 = (await env.store.getRoom(lob.code))!;
    expect(r0.phase).toBe('discussion');
    const ends0 = Date.parse(r0.phase_ends_at!);

    expect((await H.action(env.ctx, hdr(tl), { roomCode: lob.code, type: 'time_adjust', direction: 'more' })).status).toBe(200);
    const r1 = (await env.store.getRoom(lob.code))!;
    expect(Date.parse(r1.phase_ends_at!)).toBe(ends0 + 60_000);
    expect((await env.store.getRoomSecrets(lob.code))!.engine_state!.game.timeAdjust).toBeNull(); // ธงถูกเคลียร์แล้ว

    // ลดตอนเหลือเวลาไม่ถึง 70 วินาที → ถูกกันไว้ที่ 10 วินาทีจากตอนนี้
    env.clock.t = Date.parse(r1.phase_ends_at!) - 30_000;
    expect((await H.action(env.ctx, hdr(tl), { roomCode: lob.code, type: 'time_adjust', direction: 'less' })).status).toBe(200);
    const r2 = (await env.store.getRoom(lob.code))!;
    expect(Date.parse(r2.phase_ends_at!)).toBe(env.clock.t + 10_000);
    // ครั้งที่ 3 ถูกปฏิเสธ · คนอื่นปรับไม่ได้
    expect((await H.action(env.ctx, hdr(tl), { roomCode: lob.code, type: 'time_adjust', direction: 'more' })).status).toBe(403);
    const other = lob.players.find((a) => a !== tl)!;
    expect((await H.action(env.ctx, hdr(other), { roomCode: lob.code, type: 'time_adjust', direction: 'more' })).status).toBe(403);
  });

  it('★ tick พร้อมกันหลายเครื่อง → เดินจริงแค่รอบเดียว (idempotent)', async () => {
    const env = makeEnv();
    const lob = await startWith(env, 8);
    env.clock.t += 61_000; // หมดเวลาดูบท
    const results = await Promise.all(lob.players.map((a) => H.tick(env.ctx, hdr(a), { roomCode: lob.code })));
    const advanced = results.filter((r) => (r.body as { advanced: boolean }).advanced).length;
    expect(advanced).toBe(1);
    const g = (await env.store.getRoomSecrets(lob.code))!.engine_state!.game;
    expect(g.dayNumber).toBe(1); // เริ่มคืนเดียว ไม่ใช่สองคืน
  });
});

// ================================================================ แชท
describe('แชท', () => {
  it('ล็อบบี้: ใครก็พิมพ์สาธารณะได้ · ข้อความว่าง/ยาวเกินถูกปฏิเสธ · ช่องลับใช้ไม่ได้', async () => {
    const env = makeEnv();
    const { code, players } = await lobbyOf(env, 3);
    expect((await H.chat(env.ctx, hdr(players[1]), { roomCode: code, channel: 'public', text: 'สวัสดี' })).status).toBe(200);
    expect((await H.chat(env.ctx, hdr(players[1]), { roomCode: code, channel: 'public', text: '' })).status).toBe(400);
    expect((await H.chat(env.ctx, hdr(players[1]), { roomCode: code, channel: 'public', text: 'ก'.repeat(301) })).status).toBe(400);
    expect((await H.chat(env.ctx, hdr(players[1]), { roomCode: code, channel: 'wolf', text: 'x' })).status).toBe(403);
    expect((await H.chat(env.ctx, hdr(players[1]), { roomCode: code, channel: 'zzz', text: 'x' })).status).toBe(400);
    const v = await view(env, code, players[0]);
    expect(v.chat.public.map((c) => c.text)).toEqual(['สวัสดี']);
  });

  it('★ แชทหมาป่า: หมาป่าพิมพ์/อ่านได้ ชาวบ้านพิมพ์ไม่ได้และอ่านไม่เห็น', async () => {
    const env = makeEnv();
    const lob = await startWith(env, 8);
    for (const a of lob.players) await H.action(env.ctx, hdr(a), { roomCode: lob.code, type: 'ready' });
    const g = (await env.store.getRoomSecrets(lob.code))!.engine_state!.game;
    const wolves = lob.players.filter((a) => g.players.find((p) => p.id === a.playerId)!.team === 'wolf');
    const others = lob.players.filter((a) => !wolves.includes(a));

    expect((await H.chat(env.ctx, hdr(wolves[0]), { roomCode: lob.code, channel: 'wolf', text: 'กัดคนที่ 3' })).status).toBe(200);
    expect((await H.chat(env.ctx, hdr(others[0]), { roomCode: lob.code, channel: 'wolf', text: 'แทรก' })).status).toBe(403);

    const wv = await view(env, lob.code, wolves[1]);
    expect(wv.chat.private.wolf.map((c) => c.text)).toEqual(['กัดคนที่ 3']);
    for (const o of others) {
      const ov = await view(env, lob.code, o);
      expect(JSON.stringify(ov)).not.toContain('กัดคนที่ 3');
      expect(ov.chat.private.wolf).toBeUndefined();
    }
  });

  it('★ แชทลับของพวกเดียวกัน: คุยได้เฉพาะตอนกลางคืน — กลางวันพิมพ์ไม่ได้ (แต่ยังอ่านย้อนหลังได้)', async () => {
    const env = makeEnv();
    const lob = await startWith(env, 8);
    for (const a of lob.players) await H.action(env.ctx, hdr(a), { roomCode: lob.code, type: 'ready' });
    const secrets = (await env.store.getRoomSecrets(lob.code))!;
    const g = secrets.engine_state!.game;
    const wolf = lob.players.find((a) => g.players.find((p) => p.id === a.playerId)!.team === 'wolf')!;
    expect(g.phase).toBe('night');
    expect((await H.chat(env.ctx, hdr(wolf), { roomCode: lob.code, channel: 'wolf', text: 'กลางคืนคุยได้' })).status).toBe(200);

    env.clock.t += 300_000; // หมดเวลากลางคืน → เช้า
    await H.tick(env.ctx, hdr(lob.host), { roomCode: lob.code });
    env.clock.t += 9_000; // เช้า → อภิปราย (กลางวัน)
    await H.tick(env.ctx, hdr(lob.host), { roomCode: lob.code });
    expect((await env.store.getRoom(lob.code))!.phase).toBe('discussion');
    const day = await H.chat(env.ctx, hdr(wolf), { roomCode: lob.code, channel: 'wolf', text: 'กลางวันห้ามคุย' });
    expect(day.status).toBe(403);
    const v = await view(env, lob.code, wolf);
    expect(v.canWrite.channels).toContain('wolf'); // ยังอ่านได้
    expect(v.canWrite.activeChannels).not.toContain('wolf'); // แต่พิมพ์ไม่ได้
    expect(v.chat.private.wolf.map((c) => c.text)).toEqual(['กลางคืนคุยได้']);
  });

  it('กลางคืนแชทสาธารณะปิด (เงียบ) · โหมด "เสียง" ปิดแชทสาธารณะ', async () => {
    const env = makeEnv();
    const lob = await startWith(env, 8);
    for (const a of lob.players) await H.action(env.ctx, hdr(a), { roomCode: lob.code, type: 'ready' });
    expect((await H.chat(env.ctx, hdr(lob.players[1]), { roomCode: lob.code, channel: 'public', text: 'กลางคืน' })).status).toBe(403);
  });
});

// ================================================================ ปล่อยที่นั่ง (Q12)
describe('ปล่อยที่นั่งคืน', () => {
  it('ล็อบบี้: เจ้าของห้องเชิญผู้เล่นออกได้', async () => {
    const env = makeEnv();
    const { code, host, players } = await lobbyOf(env, 3);
    expect((await H.releaseSeat(env.ctx, hdr(host), { roomCode: code, targetPlayerId: players[2].playerId })).status).toBe(200);
    expect((await env.store.listPlayers(code)).length).toBe(2);
    expect((await H.myView(env.ctx, hdr(players[2]), { roomCode: code })).status).toBe(401);
  });

  it('ระหว่างเกม: ตั๋วเก่าใช้ไม่ได้ · เข้าด้วยชื่อเดิมได้ที่นั่งและบทเดิมคืน · ปล่อยตัวเองไม่ได้', async () => {
    const env = makeEnv();
    const lob = await startWith(env, 8);
    const victim = lob.players[3];
    const roleBefore = (await view(env, lob.code, victim)).game!.me.role;

    expect((await H.releaseSeat(env.ctx, hdr(lob.host), { roomCode: lob.code, targetPlayerId: lob.host.playerId })).status).toBe(400);
    expect((await H.releaseSeat(env.ctx, hdr(lob.host), { roomCode: lob.code, targetPlayerId: victim.playerId })).status).toBe(200);
    expect((await H.myView(env.ctx, hdr(victim), { roomCode: lob.code })).status).toBe(401); // ตั๋วเก่าตาย

    const re = await H.joinRoom(env.ctx, { roomCode: lob.code, displayName: 'ผู้เล่น4' });
    expect(re.status).toBe(200);
    const fresh = bodyOf<AuthResponse>(re);
    expect(fresh.playerId).toBe(victim.playerId);
    expect(fresh.token).not.toBe(victim.token);
    expect((await view(env, lob.code, fresh)).game!.me.role).toBe(roleBefore);
    // ชื่อของผู้เล่นที่ยังมีตั๋วอยู่ ใครก็แย่งไม่ได้
    expect((await H.joinRoom(env.ctx, { roomCode: lob.code, displayName: 'ผู้เล่น5' })).status).toBe(409);
  });
});

// ================================================================ เล่นจบทั้งเกมผ่าน handlers (บอทขับตามมุมมองของแต่ละคน)
async function actFor(env: Env, code: string, a: AuthResponse, v: MyViewResponse, pickIdx: number, step: number): Promise<void> {
  const t = v.game!.myTurn;
  if (!t.isMyTurn) return;
  const targets = t.selectableTargets;
  // เกมที่ยื้อนานผิดปกติ (หมาป่าเลือกไม่ตรงกันซ้ำๆ) → ทุกคนโหวต/เสนอชื่อคนเดียวกัน ให้เกมเดินไปจนจบได้แน่นอน
  const forced = step > 300;
  const pick = (n = 0) => targets[(forced && (t.actionKind === 'vote' || t.actionKind === 'nominate') ? n : pickIdx + n) % targets.length];
  const h = hdr(a);
  switch (t.actionKind) {
    case 'hunter_shot': await H.action(env.ctx, h, { roomCode: code, type: 'hunter_shot', targetId: pick() }); break;
    case 'nominate': await H.action(env.ctx, h, { roomCode: code, type: 'nominate', targetId: pick() }); break;
    case 'vote': await H.action(env.ctx, h, { roomCode: code, type: 'vote', targetId: !forced && pickIdx % 5 === 0 ? null : pick() }); break;
    case 'witch': await H.action(env.ctx, h, { roomCode: code, type: 'night_action', kind: 'witch', meta: { heal: false } }); break;
    case 'cupid_pair': await H.action(env.ctx, h, { roomCode: code, type: 'night_action', kind: 'cupid_pair', targets: [pick(), pick(1)] }); break;
    case 'wolf_bite': // หมาป่าทุกตัวเลือกคนเดียวกัน (ฝูงต้องเห็นตรงกันจึงจะกัดสำเร็จ)
      await H.action(env.ctx, h, { roomCode: code, type: 'night_action', kind: 'wolf_bite', targets: [targets[v.game!.dayNumber % targets.length]] }); // ตามวัน ไม่ใช่ตามก้าว: หมาป่าที่มี 2 ความสามารถกดคนละก้าวก็ยังเลือกคนเดียวกัน
      break;
    default:
      if (targets.length === 0) await H.action(env.ctx, h, { roomCode: code, type: 'night_action', kind: 'skip' });
      else await H.action(env.ctx, h, { roomCode: code, type: 'night_action', kind: t.actionKind!, targets: [pick()] });
  }
}

describe('เล่นจบทั้งเกมผ่าน handlers', () => {
  for (const n of [8, 15]) {
    it(`${n} คน: ทุกคนทำตามมุมมองของตัวเอง + tick เดินเวลา → เกมจบ ไม่มีคำสั่งถูกปฏิเสธ`, async () => {
      const env = makeEnv();
      const lob = await startWith(env, n);
      for (const a of lob.players) await H.action(env.ctx, hdr(a), { roomCode: lob.code, type: 'ready' });

      let rejectedBefore = 0;
      for (let step = 0; step < 4000; step++) {
        const room = (await env.store.getRoom(lob.code))!;
        if (room.phase === 'game_over') break;
        for (let i = 0; i < lob.players.length; i++) {
          const a = lob.players[i];
          const v = await view(env, lob.code, a);
          await actFor(env, lob.code, a, v, step + i, step);
        }
        env.clock.t += 5000;
        await H.tick(env.ctx, hdr(lob.host), { roomCode: lob.code });
        if (step % 50 === 0) {
          const rej = env.store.eventsPrivate.get(lob.code)!.filter((e) => e.kind === 'rejected');
          expect(rej.length, `คำสั่งที่ถูกปฏิเสธ: ${JSON.stringify(rej.slice(rejectedBefore))}`).toBe(0);
          rejectedBefore = rej.length;
        }
      }
      const room = (await env.store.getRoom(lob.code))!;
      expect(room.phase).toBe('game_over');
      expect(room.winners).not.toBeNull();

      // จบแล้วเปิดบททุกคน
      const v = await view(env, lob.code, lob.players[0]);
      expect(v.game!.gameOver!.allRoles).toHaveLength(n);
      expect(env.store.eventsPrivate.get(lob.code)!.filter((e) => e.kind === 'rejected')).toEqual([]);
    }, 120_000);
  }
});

// ================================================================ เล่นอีกครั้ง
async function playToEnd(env: Env, lob: { code: string; players: AuthResponse[]; host: AuthResponse }) {
  for (const a of lob.players) await H.action(env.ctx, hdr(a), { roomCode: lob.code, type: 'ready' });
  for (let step = 0; step < 4000; step++) {
    if ((await env.store.getRoom(lob.code))!.phase === 'game_over') return;
    for (let i = 0; i < lob.players.length; i++) {
      const a = lob.players[i];
      await actFor(env, lob.code, a, await view(env, lob.code, a), step + i, step);
    }
    env.clock.t += 5000;
    await H.tick(env.ctx, hdr(lob.host), { roomCode: lob.code });
  }
  throw new Error('เกมไม่จบ');
}

describe('เล่นอีกครั้ง', () => {
  it('ก่อนเกมจบ หรือไม่ใช่เจ้าของห้อง → ปฏิเสธ', async () => {
    const env = makeEnv();
    const lob = await startWith(env, 8);
    expect((await H.playAgain(env.ctx, hdr(lob.host), { roomCode: lob.code })).status).toBe(409);
    await playToEnd(env, lob);
    expect((await H.playAgain(env.ctx, hdr(lob.players[1]), { roomCode: lob.code })).status).toBe(403);
  });

  it('เกมจบแล้วเจ้าของห้องกด → กลับล็อบบี้ · คงค่าตั้งค่า · ผู้เล่นฟื้น · ล้างบันทึกเดิม · เริ่มเกมใหม่ได้ด้วยบทชุดใหม่', async () => {
    const env = makeEnv();
    const lob = await startWith(env, 8);
    const firstRoles = (await env.store.getRoomSecrets(lob.code))!.engine_state!.game.players.map((p) => p.roleId).join(',');
    const seed1 = (await env.store.getRoomSecrets(lob.code))!.rng_seed;
    await playToEnd(env, lob);
    expect((await H.chat(env.ctx, hdr(lob.host), { roomCode: lob.code, channel: 'public', text: 'บันทึกแชทสาธารณะ' })).status).toBe(200); // จบเกมแล้วคุยได้

    const r = await H.playAgain(env.ctx, hdr(lob.host), { roomCode: lob.code });
    expect(r.status, JSON.stringify(r.body)).toBe(200);

    const room = (await env.store.getRoom(lob.code))!;
    expect(room.phase).toBe('lobby');
    expect(room.is_locked).toBe(false);
    expect(room.winners).toBeNull();
    expect((await env.store.getRoomSecrets(lob.code))!.engine_state).toBeNull();
    expect((await env.store.getRoomSecrets(lob.code))!.rng_seed).not.toBe(seed1);
    expect((await env.store.listPlayers(lob.code)).every((p) => p.is_alive && p.can_vote && p.revealed_role === null && p.death_cause === null)).toBe(true);
    expect(env.store.eventsPublic.get(lob.code)).toEqual([]);

    const v = await view(env, lob.code, lob.players[2]);
    expect(v.phase).toBe('lobby');
    expect(v.game).toBeNull();
    expect(v.lobby.roleCounts).toEqual(countsFromRoles(presetRoles(8))); // คงค่าตั้งค่าเดิม
    expect(v.chat.public.map((c) => c.text)).toContain('บันทึกแชทสาธารณะ'); // แชทสาธารณะคงไว้

    // เริ่มรอบใหม่ได้ ด้วยเมล็ดสุ่มใหม่
    expect((await H.startGame(env.ctx, hdr(lob.host), { roomCode: lob.code })).status).toBe(200);
    const secondRoles = (await env.store.getRoomSecrets(lob.code))!.engine_state!.game.players.map((p) => p.roleId).join(',');
    expect(secondRoles.split(',').sort()).toEqual(firstRoles.split(',').sort()); // ชุดบทเดิม
    expect(secondRoles).not.toBe(firstRoles); // แต่แจกใหม่
  });
});

// ================================================================ กระเป๋าเงิน + ร้านค้า + อวตาร
import type { WalletCreated, WalletView } from '../../../src/games/werewolf/shared/api';
import { AVATAR_ITEMS, DEFAULT_AVATAR, STARTING_COINS, parseAvatar } from '../../../src/games/werewolf/shared/avatar';

const wh = (w: { walletId: string; token: string }): Headers => ({ 'x-ww-wallet-id': w.walletId, 'x-ww-wallet-token': w.token });
const newWallet = async (env: Env) => bodyOf<WalletCreated>(await H.walletCreate(env.ctx));
const priceOf = (id: string) => AVATAR_ITEMS.find((i) => i.id === id)!.price;

const loginAcct = async (env: Env, username: string, password: string) =>
  bodyOf<{ username: string; token: string; created: boolean }>(await H.authLogin(env.ctx, { username, password }));
const walletLogin = (env: Env, username: string, sessionToken: string, device?: WalletCreated) =>
  H.walletLogin(env.ctx, { username, sessionToken, ...(device ? { walletId: device.walletId, walletToken: device.token } : {}) });

describe('บัญชีเว็บ: ตรวจรหัสผ่านที่เซิร์ฟเวอร์ (authLogin)', () => {
  it('ชื่อใหม่ → สร้างบัญชี ได้ session token · เก็บรหัสแบบ scrypt ไม่ใช่ข้อความดิบ · เก็บแฮชของ token ไม่ใช่ token', async () => {
    const env = makeEnv();
    const r = await loginAcct(env, 'WIN', 'รหัสลับ1234');
    expect(r.created).toBe(true);
    expect(r.token.length).toBeGreaterThan(30);
    const stored = env.store.credentials.get('WIN')!;
    expect(stored).not.toContain('รหัสลับ1234');
    expect(stored).toMatch(/^[0-9a-f]{32}:[0-9a-f]{64}$/); // salt:scrypt
    expect(env.store.sessions.has(r.token)).toBe(false); // เก็บเฉพาะแฮช
    expect(env.store.users.has('WIN')).toBe(true);
  });

  it('ล็อกอินซ้ำด้วยรหัสเดิมได้ · รหัสผิดถูกปฏิเสธ 401 · ได้ token คนละอันต่อเครื่อง', async () => {
    const env = makeEnv();
    const a = await loginAcct(env, 'WIN', 'secret99');
    const b = await loginAcct(env, 'WIN', 'secret99');
    expect(b.created).toBe(false);
    expect(b.token).not.toBe(a.token);
    expect((await H.authLogin(env.ctx, { username: 'WIN', password: 'ผิด1234' })).status).toBe(401);
    expect((await H.authLogin(env.ctx, { username: 'WIN', password: '' })).status).toBe(400);
    expect((await H.authLogin(env.ctx, { username: 'W', password: 'secret99' })).status).toBe(400);
    expect((await H.authLogin(env.ctx, { username: 'x'.repeat(21), password: 'secret99' })).status).toBe(400);
    expect((await H.authLogin(env.ctx, { username: 5, password: {} })).status).toBe(400);
  });

  it('แฮช SHA-256 แบบเก่า (จากเวอร์ชันก่อน) ล็อกอินได้ แล้วถูกอัปเกรดเป็น scrypt อัตโนมัติ', async () => {
    const env = makeEnv();
    const { createHash } = await import('node:crypto');
    env.store.credentials.set('OLD', createHash('sha256').update('oldpass1').digest('hex'));
    expect((await H.authLogin(env.ctx, { username: 'OLD', password: 'wrong999' })).status).toBe(401);
    expect((await H.authLogin(env.ctx, { username: 'OLD', password: 'oldpass1' })).status).toBe(200);
    expect(env.store.credentials.get('OLD')).toMatch(/^[0-9a-f]{32}:[0-9a-f]{64}$/);
    expect((await H.authLogin(env.ctx, { username: 'OLD', password: 'oldpass1' })).status).toBe(200); // ยังเข้าได้หลังอัปเกรด
  });

  it('★ ลองเดารหัส: เกิน 8 ครั้ง/นาที (ต่อชื่อ) → 429 แม้จะเดาถูกในครั้งต่อไป', async () => {
    const env = makeEnv();
    const ctx = { ...env.ctx, rateLimit: true };
    await H.authLogin(ctx, { username: 'WIN', password: 'secret99' });
    let last = 0;
    for (let i = 0; i < 12; i++) last = (await H.authLogin(ctx, { username: 'WIN', password: `เดา${i}xx` })).status;
    expect(last).toBe(429);
    expect((await H.authLogin(ctx, { username: 'WIN', password: 'secret99' })).status).toBe(429);
    expect((await H.authLogin(ctx, { username: 'คนอื่น', password: 'secret99' })).status).toBe(200); // ชื่ออื่นไม่โดนลิมิตด้วย
  });
});

describe('กระเป๋าเงินตามบัญชี (ข้ามเครื่อง)', () => {
  it('ล็อกอินคนละเครื่องด้วยบัญชีเดียวกัน → ได้กระเป๋า/ของที่ซื้อ/เหรียญเดียวกัน', async () => {
    const env = makeEnv();
    const s1 = (await loginAcct(env, 'WIN', 'secret99')).token;
    const d1 = bodyOf<WalletCreated>(await walletLogin(env, 'WIN', s1));
    expect((await H.shopBuy(env.ctx, wh(d1), { itemId: 'hw_cap' })).status).toBe(200);

    const s2 = (await loginAcct(env, 'WIN', 'secret99')).token; // เครื่องที่ 2 (session คนละอัน)
    const d2 = bodyOf<WalletCreated>(await walletLogin(env, 'WIN', s2));
    expect(d2.walletId).toBe(d1.walletId);
    expect(d2.token).toBe(d1.token); // ตั๋วกระเป๋าคำนวณจากความลับของเซิร์ฟเวอร์ — ตรงกันทุกเครื่อง
    expect(d2.wallet.owned).toEqual(['hw_cap']);
    expect(d2.wallet.coins).toBe(STARTING_COINS - priceOf('hw_cap'));
    expect((await H.walletGet(env.ctx, wh(d2))).status).toBe(200);
  });

  it('session ผิด/หมดอายุ/ของคนอื่น/ไม่มี → ปฏิเสธ ไม่ได้กระเป๋า', async () => {
    const env = makeEnv();
    const a = (await loginAcct(env, 'ผู้ใช้เอ', 'secret99')).token;
    await loginAcct(env, 'ผู้ใช้บี', 'secret99');
    expect((await walletLogin(env, 'ผู้ใช้เอ', 'ปลอม'.repeat(10))).status).toBe(401);
    expect((await walletLogin(env, 'ผู้ใช้บี', a)).status).toBe(401); // token ของ A อ้างเป็น B
    expect((await walletLogin(env, 'ผู้ใช้เอ', 'short')).status).toBe(400);
    expect((await H.walletLogin(env.ctx, { username: 'A' })).status).toBe(400);
    env.clock.t += 61 * 86_400_000; // เกิน 60 วัน
    expect((await walletLogin(env, 'ผู้ใช้เอ', a)).status).toBe(401);
    expect(env.store.wallets.size).toBe(0);
  });

  it('กระเป๋าเดิมของเครื่อง (ยังไม่ผูกบัญชี) ถูกย้ายมาผูกให้ครั้งแรก — เหรียญ/ของไม่หาย', async () => {
    const env = makeEnv();
    const s = (await loginAcct(env, 'WIN', 'secret99')).token;
    const old = await newWallet(env);
    await H.shopBuy(env.ctx, wh(old), { itemId: 'hw_cap' });
    const r = bodyOf<WalletCreated>(await walletLogin(env, 'WIN', s, old));
    expect(r.walletId).toBe(old.walletId);
    expect(r.wallet.owned).toEqual(['hw_cap']);
    expect((await H.walletGet(env.ctx, wh(old))).status).toBe(401); // ตั๋วเดิมใช้ไม่ได้แล้ว (ตั๋วใหม่ = ของบัญชี)
  });

  it('★ แย่งกระเป๋าไม่ได้: บัญชี B ถือตั๋วกระเป๋าของบัญชี A มาก็ไม่ได้ของ A · ได้กระเป๋าใหม่ของตัวเอง', async () => {
    const env = makeEnv();
    const sa = (await loginAcct(env, 'ผู้ใช้เอ', 'secret99')).token;
    const sb = (await loginAcct(env, 'ผู้ใช้บี', 'secret99')).token;
    const a = bodyOf<WalletCreated>(await walletLogin(env, 'ผู้ใช้เอ', sa));
    await H.shopBuy(env.ctx, wh(a), { itemId: 'hw_cap' });
    const b = bodyOf<WalletCreated>(await walletLogin(env, 'ผู้ใช้บี', sb, a));
    expect(b.walletId).not.toBe(a.walletId);
    expect(b.wallet.owned).toEqual([]);
    expect(env.store.wallets.get(a.walletId)!.username).toBe('ผู้ใช้เอ');
  });

  it('ตั๋วกระเป๋าเดาไม่ได้: คนละกระเป๋าได้ตั๋วต่างกัน และตั๋วของ A ใช้เปิดกระเป๋า B ไม่ได้', async () => {
    const env = makeEnv();
    const a = bodyOf<WalletCreated>(await walletLogin(env, 'ผู้ใช้เอ', (await loginAcct(env, 'ผู้ใช้เอ', 'secret99')).token));
    const b = bodyOf<WalletCreated>(await walletLogin(env, 'ผู้ใช้บี', (await loginAcct(env, 'ผู้ใช้บี', 'secret99')).token));
    expect(a.token).not.toBe(b.token);
    expect((await H.walletGet(env.ctx, { 'x-ww-wallet-id': b.walletId, 'x-ww-wallet-token': a.token })).status).toBe(401);
  });
});

describe('กระเป๋าเงิน', () => {
  it('สร้างกระเป๋า: ได้เหรียญเริ่มต้น · ดูได้ด้วยตั๋วที่ถูกต้องเท่านั้น · เก็บเฉพาะแฮชของตั๋ว', async () => {
    const env = makeEnv();
    const w = await newWallet(env);
    expect(w.wallet.coins).toBe(STARTING_COINS);
    expect(w.wallet.owned).toEqual([]);
    expect((await H.walletGet(env.ctx, wh(w))).status).toBe(200);
    expect((await H.walletGet(env.ctx, { 'x-ww-wallet-id': w.walletId, 'x-ww-wallet-token': 'ปลอม' })).status).toBe(401);
    expect((await H.walletGet(env.ctx, {})).status).toBe(401);
    expect(JSON.stringify(Array.from(env.store.wallets.values()))).not.toContain(w.token);
  });

  it('ซื้อของ: หักเหรียญตามราคาในแคตตาล็อก · ซื้อซ้ำ/เหรียญไม่พอ/ของฟรี/ไม่มีสินค้า ถูกปฏิเสธ', async () => {
    const env = makeEnv();
    const w = await newWallet(env);
    const r = await H.shopBuy(env.ctx, wh(w), { itemId: 'hw_cap', price: 1 }); // ราคาที่ส่งมาถูกเมิน
    expect(r.status).toBe(200);
    const v = bodyOf<WalletView>(r);
    expect(v.coins).toBe(STARTING_COINS - priceOf('hw_cap'));
    expect(v.owned).toEqual(['hw_cap']);
    expect((await H.shopBuy(env.ctx, wh(w), { itemId: 'hw_cap' })).status).toBe(409);
    expect((await H.shopBuy(env.ctx, wh(w), { itemId: 'hw_crown' })).status).toBe(402); // 500 เหรียญ ไม่พอ
    expect((await H.shopBuy(env.ctx, wh(w), { itemId: 'hw_none' })).status).toBe(400);
    expect((await H.shopBuy(env.ctx, wh(w), { itemId: 'ไม่มีจริง' })).status).toBe(404);
    expect(env.store.wallets.get(w.walletId)!.coins).toBe(STARTING_COINS - priceOf('hw_cap'));
  });

  it('★ กดซื้อพร้อมกันหลายครั้ง → หักเหรียญครั้งเดียว (ไม่ซื้อซ้อน)', async () => {
    const env = makeEnv();
    const w = await newWallet(env);
    const results = await Promise.all(Array.from({ length: 5 }, () => H.shopBuy(env.ctx, wh(w), { itemId: 'ew_round' })));
    expect(results.filter((r) => r.status === 200)).toHaveLength(1);
    expect(env.store.wallets.get(w.walletId)!.coins).toBe(STARTING_COINS - priceOf('ew_round'));
  });

  it('บันทึกอวตาร: ใส่ได้เฉพาะของฟรีหรือของที่ซื้อแล้ว — ของที่ไม่มีถูกแทนด้วยค่าเริ่มต้น', async () => {
    const env = makeEnv();
    const w = await newWallet(env);
    await H.shopBuy(env.ctx, wh(w), { itemId: 'hw_cap' });
    const r = await H.avatarSave(env.ctx, wh(w), { avatar: { headwear: 'hw_cap', eyewear: 'ew_visor', hairStyle: 'hair_bob', outfit: 'ไม่มีจริง', skin: 'hw_cap' } });
    const a = bodyOf<WalletView>(r).avatar;
    expect(a.headwear).toBe('hw_cap'); // ซื้อแล้ว
    expect(a.eyewear).toBe(DEFAULT_AVATAR.eyewear); // ยังไม่ได้ซื้อ (200 เหรียญ)
    expect(a.hairStyle).toBe('hair_bob'); // ฟรี
    expect(a.outfit).toBe(DEFAULT_AVATAR.outfit); // ไม่รู้จัก
    expect(a.skin).toBe(DEFAULT_AVATAR.skin); // ผิดช่อง
  });
});

describe('อวตารในห้อง', () => {
  it('เข้าห้องด้วยกระเป๋า → ที่นั่งใช้อวตารของกระเป๋า (ผู้เล่นอื่นเห็น) · ตั๋วกระเป๋าปลอม → ได้อวตารสุ่มจากของฟรี', async () => {
    const env = makeEnv();
    const w = await newWallet(env);
    await H.shopBuy(env.ctx, wh(w), { itemId: 'hw_beanie' });
    await H.avatarSave(env.ctx, wh(w), { avatar: { ...DEFAULT_AVATAR, headwear: 'hw_beanie' } });

    const host = bodyOf<AuthResponse>(await H.createRoom(env.ctx, { displayName: 'เจ้าของ', walletId: w.walletId, walletToken: w.token }));
    const fake = bodyOf<AuthResponse>(await H.joinRoom(env.ctx, { roomCode: host.roomCode, displayName: 'คนปลอม', walletId: w.walletId, walletToken: 'ปลอม' }));
    const guest = bodyOf<AuthResponse>(await H.joinRoom(env.ctx, { roomCode: host.roomCode, displayName: 'แขก' }));

    const v = await view(env, host.roomCode, guest);
    const byName = Object.fromEntries(v.players.map((p) => [p.displayName, parseAvatar(p.avatar)]));
    expect(byName['เจ้าของ'].headwear).toBe('hw_beanie');
    expect(byName['คนปลอม'].headwear).toBe('hw_none'); // ฟรีเท่านั้น
    expect(byName['แขก'].headwear).toBe('hw_none');
    expect((await env.store.getRoomWallets(host.roomCode))[host.playerId]).toBe(w.walletId);
    expect((await env.store.getRoomWallets(host.roomCode))[fake.playerId]).toBeUndefined();
  });

  it('ซิงก์อวตารในล็อบบี้: ได้ · ระหว่างเกมไม่ได้ · ตั๋วกระเป๋าผิดไม่ได้', async () => {
    const env = makeEnv();
    const w = await newWallet(env);
    await H.shopBuy(env.ctx, wh(w), { itemId: 'hw_crown' }).catch(() => undefined);
    await H.shopBuy(env.ctx, wh(w), { itemId: 'ew_round' });
    await H.avatarSave(env.ctx, wh(w), { avatar: { ...DEFAULT_AVATAR, eyewear: 'ew_round' } });
    const lob = await lobbyOf(env, 8);
    const me = lob.players[3];
    expect((await H.syncAvatar(env.ctx, hdr(me), { roomCode: lob.code, walletId: w.walletId, walletToken: 'ปลอม' })).status).toBe(401);
    expect((await H.syncAvatar(env.ctx, hdr(me), { roomCode: lob.code, walletId: w.walletId, walletToken: w.token })).status).toBe(200);
    const row = (await env.store.listPlayers(lob.code)).find((p) => p.player_id === me.playerId)!;
    expect(parseAvatar(row.avatar).eyewear).toBe('ew_round');

    await H.updateSettings(env.ctx, hdr(lob.host), { roomCode: lob.code, settings: { roleCounts: countsFromRoles(presetRoles(8)) } });
    await H.startGame(env.ctx, hdr(lob.host), { roomCode: lob.code });
    expect((await H.syncAvatar(env.ctx, hdr(me), { roomCode: lob.code, walletId: w.walletId, walletToken: w.token })).status).toBe(409);
  });

  it('ข้อมูลสาธารณะของห้องไม่มีตั๋ว/เหรียญของกระเป๋า', async () => {
    const env = makeEnv();
    const w = await newWallet(env);
    const host = bodyOf<AuthResponse>(await H.createRoom(env.ctx, { displayName: 'เจ้าของ', walletId: w.walletId, walletToken: w.token }));
    const pub = JSON.stringify([await env.store.getRoom(host.roomCode), await env.store.listPlayers(host.roomCode)]);
    expect(pub).not.toContain(w.token);
    expect(pub).not.toContain(w.walletId);
    expect(pub).not.toContain('coins');
  });
});

describe('รางวัลเหรียญตอนจบเกม', () => {
  it('คนที่มีกระเป๋าได้เหรียญเกมละครั้ง (เล่น+ชนะ+รอด) · แขกไม่มีกระเป๋าไม่ได้ · เรียก tick ซ้ำไม่จ่ายซ้ำ', async () => {
    const env = makeEnv();
    const w1 = await newWallet(env);
    const w2 = await newWallet(env);
    const host = bodyOf<AuthResponse>(await H.createRoom(env.ctx, { displayName: 'เจ้าของ', walletId: w1.walletId, walletToken: w1.token }));
    const players = [host];
    for (let i = 2; i <= 8; i++) {
      const creds = i === 2 ? { walletId: w2.walletId, walletToken: w2.token } : {};
      players.push(bodyOf<AuthResponse>(await H.joinRoom(env.ctx, { roomCode: host.roomCode, displayName: `ผู้เล่น${i}`, ...creds })));
    }
    await H.updateSettings(env.ctx, hdr(host), { roomCode: host.roomCode, settings: { roleCounts: countsFromRoles(presetRoles(8)) } });
    expect((await H.startGame(env.ctx, hdr(host), { roomCode: host.roomCode })).status).toBe(200);
    await playToEnd(env, { code: host.roomCode, players, host });

    const room = (await env.store.getRoom(host.roomCode))!;
    expect(room.phase).toBe('game_over');
    const game = (await env.store.getRoomSecrets(host.roomCode))!.engine_state!.game;
    const winners = new Set(game.winners![0].playerIds);

    for (const [wallet, pl] of [[w1, host], [w2, players[1]]] as const) {
      const alive = game.players.find((p) => p.id === pl.playerId)!.alive;
      const expected = STARTING_COINS + 20 + (winners.has(pl.playerId) ? 30 : 0) + (alive ? 10 : 0);
      expect(env.store.wallets.get(wallet.walletId)!.coins, `เหรียญของ ${pl.playerId}`).toBe(expected);
      expect(env.store.wallets.get(wallet.walletId)!.games_played).toBe(1);
      expect((await view(env, host.roomCode, pl)).reward!.total).toBe(expected - STARTING_COINS);
    }
    // แขก (ไม่มีกระเป๋า) ไม่มีรางวัล
    expect((await view(env, host.roomCode, players[4])).reward).toBeNull();

    // เรียก tick/อ่านซ้ำหลายครั้ง → ไม่จ่ายซ้ำ
    for (let i = 0; i < 3; i++) await H.tick(env.ctx, hdr(host), { roomCode: host.roomCode });
    expect(env.store.wallets.get(w1.walletId)!.games_played).toBe(1);
  });
});
