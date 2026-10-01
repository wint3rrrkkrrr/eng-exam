// M5: ผู้เล่นหลุดกลางเกม (รอ/บอทเล่นแทน/ถือว่าตาย) + โหมดผู้ชม
import { describe, expect, it } from 'vitest';
import { MemoryStore } from './memoryStore';
import * as H from './handlers';
import type { Ctx, Headers } from './handlers';
import { applyAction, createGame, presetRoles } from '../../../src/games/werewolf/engine';
import { countsFromRoles } from '../../../src/games/werewolf/shared/lobby';
import type { AuthResponse, MyViewResponse } from '../../../src/games/werewolf/shared/api';

interface Env { ctx: Ctx; store: MemoryStore; clock: { t: number } }
function makeEnv(): Env {
  const clock = { t: 1_700_000_000_000 };
  const store = new MemoryStore();
  return { ctx: { store, now: () => clock.t, rand: (lo) => lo }, store, clock };
}
const hdr = (a: AuthResponse): Headers => ({ 'x-ww-player-id': a.playerId, 'x-ww-token': a.token });
const bodyOf = <T>(r: H.HandlerResult): T => r.body as T;
const view = async (env: Env, code: string, a: AuthResponse) => bodyOf<MyViewResponse>(await H.myView(env.ctx, hdr(a), { roomCode: code }));

async function startGameWith(env: Env, n: number, rules: Record<string, unknown> = {}, lobbyExtra: Record<string, unknown> = {}) {
  const host = bodyOf<AuthResponse>(await H.createRoom(env.ctx, { displayName: 'เจ้าของห้อง' }));
  const players = [host];
  for (let i = 2; i <= n; i++) players.push(bodyOf<AuthResponse>(await H.joinRoom(env.ctx, { roomCode: host.roomCode, displayName: `ผู้เล่น${i}` })));
  const u = await H.updateSettings(env.ctx, hdr(host), { roomCode: host.roomCode, settings: { roleCounts: countsFromRoles(presetRoles(n)), rules, ...lobbyExtra } });
  expect(u.status).toBe(200);
  expect((await H.startGame(env.ctx, hdr(host), { roomCode: host.roomCode })).status).toBe(200);
  return { code: host.roomCode, host, players };
}

describe('ตั้งค่าหลุดการเชื่อมต่อ', () => {
  it('ค่าที่ไม่ถูกต้องถูกทิ้ง · เวลาถูกบีบให้อยู่ในช่วง', async () => {
    const env = makeEnv();
    const host = bodyOf<AuthResponse>(await H.createRoom(env.ctx, { displayName: 'ก' }));
    const r = await H.updateSettings(env.ctx, hdr(host), { roomCode: host.roomCode, settings: { rules: { disconnectMode: 'hack', disconnectGraceSeconds: 5 } } });
    const rules = bodyOf<{ lobby: { rules: Record<string, unknown> } }>(r).lobby.rules;
    expect(rules.disconnectMode).toBeUndefined();
    expect(rules.disconnectGraceSeconds).toBe(15);
  });
  it('สถานะหลุด: ไม่ส่งสัญญาณเกิน 15 วิ = isConnected false · กลับมาโพลแล้ว = true', async () => {
    const env = makeEnv();
    const g = await startGameWith(env, 6);
    expect((await view(env, g.code, g.host)).players.every((p) => p.isConnected)).toBe(true);
    env.clock.t += 20_000;
    await view(env, g.code, g.host);
    const v = await view(env, g.code, g.host);
    expect(v.players.find((p) => p.playerId === g.host.playerId)!.isConnected).toBe(true);
    expect(v.players.filter((p) => !p.isConnected)).toHaveLength(5);
    await view(env, g.code, g.players[2]);
    expect((await view(env, g.code, g.host)).players.find((p) => p.playerId === g.players[2].playerId)!.isConnected).toBe(true);
  });
});

describe('หลุดกลางเกม', () => {
  it('โหมดรอ: คนหลุดไม่ถูกทำอะไร · เฟสไม่เดินก่อนหมดเวลา', async () => {
    const env = makeEnv();
    const g = await startGameWith(env, 8, { disconnectMode: 'wait', disconnectGraceSeconds: 15 });
    await H.action(env.ctx, hdr(g.host), { roomCode: g.code, type: 'ready' });
    env.clock.t += 30_000;
    await H.tick(env.ctx, hdr(g.host), { roomCode: g.code });
    expect((await env.store.getRoom(g.code))!.phase).toBe('role_reveal');
  });

  it('โหมดบอทเล่นแทน: คนหลุดถูกกด "พร้อม" ให้ → เฟสเดินต่อก่อนหมดเวลา · กลับมาแล้วยังไม่ตาย', async () => {
    const env = makeEnv();
    const g = await startGameWith(env, 8, { disconnectMode: 'bot', disconnectGraceSeconds: 15 });
    await H.action(env.ctx, hdr(g.host), { roomCode: g.code, type: 'ready' });
    env.clock.t += 30_000;
    await H.tick(env.ctx, hdr(g.host), { roomCode: g.code });
    expect((await env.store.getRoom(g.code))!.phase).not.toBe('role_reveal');
    const back = await view(env, g.code, g.players[3]);
    expect(back.game!.me.isAlive).toBe(true);
  });

  it('โหมดบอท: เล่นจนจบเกมได้โดยมีเพียงเจ้าของห้องที่ออนไลน์ และไม่มีคำสั่งของบอทถูกปฏิเสธ', async () => {
    const env = makeEnv();
    const g = await startGameWith(env, 8, { disconnectMode: 'bot', disconnectGraceSeconds: 15 });
    await H.action(env.ctx, hdr(g.host), { roomCode: g.code, type: 'ready' });
    for (let step = 0; step < 3000; step++) {
      if ((await env.store.getRoom(g.code))!.phase === 'game_over') break;
      env.clock.t += 5_000;
      await H.tick(env.ctx, hdr(g.host), { roomCode: g.code });
    }
    expect((await env.store.getRoom(g.code))!.phase).toBe('game_over');
    expect(env.store.eventsPrivate.get(g.code)!.filter((e) => e.kind === 'rejected')).toEqual([]);
  }, 60_000);

  it('โหมดถือว่าตาย: หลุดเกินเวลา → ตายด้วย disconnect + ตรวจผู้ชนะทันที', async () => {
    const env = makeEnv();
    const g = await startGameWith(env, 8, { disconnectMode: 'dead', disconnectGraceSeconds: 15 });
    env.clock.t += 20_000;
    await H.tick(env.ctx, hdr(g.host), { roomCode: g.code });
    const rows = await env.store.listPlayers(g.code);
    const dead = rows.filter((p) => !p.is_alive);
    expect(dead.length).toBeGreaterThanOrEqual(1);
    expect(dead.every((p) => p.death_cause === 'disconnect' || p.death_cause === 'lover' || p.death_cause === 'hunter')).toBe(true);
    expect(dead.some((p) => p.death_cause === 'disconnect')).toBe(true);
    expect((await env.store.getRoom(g.code))!.phase).toBe('game_over'); // เหลือแต่เจ้าของห้อง → เกมจบ
  });

  it('โหมดถือว่าตาย: ผู้ที่ยังออนไลน์ไม่ถูกฆ่า', async () => {
    const env = makeEnv();
    const g = await startGameWith(env, 8, { disconnectMode: 'dead', disconnectGraceSeconds: 60 });
    env.clock.t += 40_000;
    for (const p of g.players) await view(env, g.code, p);
    env.clock.t += 40_000; // ทุกคนเงียบ 40 วิ < 60
    await H.tick(env.ctx, hdr(g.host), { roomCode: g.code });
    expect((await env.store.listPlayers(g.code)).every((p) => p.is_alive)).toBe(true);
  });
});

describe('โหมดผู้ชม', () => {
  it('เกมเริ่มแล้ว: เข้าแบบผู้เล่นไม่ได้ · เข้าแบบผู้ชมได้ · ไม่ได้บท ไม่อยู่ในเอนจิน ไม่เห็นความลับ', async () => {
    const env = makeEnv();
    const g = await startGameWith(env, 8);
    const plain = await H.joinRoom(env.ctx, { roomCode: g.code, displayName: 'คนมาสาย' });
    expect(plain.status).toBe(403);
    expect((plain.body as { code: string }).code).toBe('locked_can_spectate');
    const sr = await H.joinRoom(env.ctx, { roomCode: g.code, displayName: 'คนมาสาย', spectate: true });
    expect(sr.status).toBe(200);
    const spec = bodyOf<AuthResponse>(sr);

    const v = await view(env, g.code, spec);
    expect(v.spectator).toBe(true);
    expect(v.game).toBeNull();
    expect(v.canWrite.channels).toEqual([]);
    expect(v.canWrite.public).toBe(false);
    expect(v.players.find((p) => p.displayName === 'คนมาสาย')!.isSpectator).toBe(true);

    expect((await H.action(env.ctx, hdr(spec), { roomCode: g.code, type: 'ready' })).status).toBe(403);
    expect((await H.chat(env.ctx, hdr(spec), { roomCode: g.code, channel: 'wolf', text: 'hi' })).status).toBe(403);
    expect((await H.chat(env.ctx, hdr(spec), { roomCode: g.code, channel: 'public', text: 'hi' })).status).toBe(403);

    const game = (await env.store.getRoomSecrets(g.code))!.engine_state!.game;
    expect(game.players).toHaveLength(8);
  });

  it('ปิดการเข้าชมในตั้งค่า → เข้าไม่ได้', async () => {
    const env = makeEnv();
    const g = await startGameWith(env, 6, {}, { allowSpectators: false });
    const r = await H.joinRoom(env.ctx, { roomCode: g.code, displayName: 'คนมาสาย', spectate: true });
    expect(r.status).toBe(403);
  });

  it('จบเกม → เล่นอีกครั้ง: ผู้ชมกลายเป็นผู้เล่นในล็อบบี้', async () => {
    const env = makeEnv();
    const g = await startGameWith(env, 6, { disconnectMode: 'dead', disconnectGraceSeconds: 15 });
    const spec = bodyOf<AuthResponse>(await H.joinRoom(env.ctx, { roomCode: g.code, displayName: 'ผู้ชม', spectate: true }));
    env.clock.t += 20_000;
    await view(env, g.code, spec);
    await H.tick(env.ctx, hdr(g.host), { roomCode: g.code });
    expect((await env.store.getRoom(g.code))!.phase).toBe('game_over');
    expect((await H.playAgain(env.ctx, hdr(g.host), { roomCode: g.code })).status).toBe(200);
    const v = await view(env, g.code, spec);
    expect(v.spectator).toBe(false);
    expect(v.players.find((p) => p.displayName === 'ผู้ชม')!.isSpectator).toBe(false);
  });
});

describe('เอนจิน: disconnect_dead', () => {
  it('ฆ่าคนหลุดแล้วตรวจผู้ชนะ · ไม่มีผู้เล่น → ปฏิเสธ', () => {
    const roles = presetRoles(6);
    const { state } = createGame({
      roomCode: 'AAAAA', seed: 's', roleIds: roles,
      players: roles.map((_, i) => ({ id: `p${i}`, name: `n${i}`, seat: i + 1 })),
    });
    let s = state!;
    const wolf = s.players.find((p) => p.team === 'wolf')!;
    for (const p of s.players.filter((x) => x.team !== 'wolf')) {
      const r = applyAction(s, { type: 'disconnect_dead', actorId: p.id });
      if (r.error) continue;
      s = r.state;
      if (s.phase === 'game_over') break;
    }
    expect(s.phase).toBe('game_over');
    expect(s.players.find((p) => p.id === wolf.id)!.alive).toBe(true);
    expect(applyAction(s, { type: 'disconnect_dead', actorId: 'nobody' }).error).toBeTruthy();
  });
});
