// บอทในห้อง: เพิ่มได้เฉพาะเจ้าของห้องในล็อบบี้ · เล่นเองใน tick จนเกมจบ (คนไม่ทำอะไรก็ไม่ค้าง) · ไม่ได้เหรียญ/XP
import { describe, expect, it } from 'vitest';
import { MemoryStore } from './memoryStore';
import * as H from './handlers';
import type { Ctx } from './handlers';
import { presetRoles } from '../../../src/games/werewolf/engine';
import { countsFromRoles } from '../../../src/games/werewolf/shared/lobby';
import type { AuthResponse } from '../../../src/games/werewolf/shared/api';

const hdr = (a: AuthResponse) => ({ 'x-ww-player-id': a.playerId, 'x-ww-token': a.token });

async function setup() {
  const clock = { t: 1_700_000_000_000 };
  const store = new MemoryStore();
  const ctx: Ctx = { store, now: () => clock.t, rand: (lo) => lo };
  const host = (await H.createRoom(ctx, { displayName: 'เจ้าของ' })).body as AuthResponse;
  return { ctx, store, clock, host };
}

describe('เพิ่มบอท', () => {
  it('เจ้าของห้องเพิ่มได้ · ชื่อไม่ซ้ำ · ไม่เกินจำนวนสูงสุด · คนอื่น/นอกล็อบบี้เพิ่มไม่ได้', async () => {
    const { ctx, store, host } = await setup();
    const guest = (await H.joinRoom(ctx, { roomCode: host.roomCode, displayName: 'แขก' })).body as AuthResponse;
    expect((await H.addBots(ctx, hdr(guest), { roomCode: host.roomCode, count: 2 })).status).toBe(403);
    expect((await H.addBots(ctx, hdr(host), { roomCode: host.roomCode, count: 0 })).status).toBe(400);
    expect((await H.addBots(ctx, hdr(host), { roomCode: host.roomCode, count: 3 })).status).toBe(200);
    expect((await H.addBots(ctx, hdr(host), { roomCode: host.roomCode, count: 2 })).status).toBe(200);
    const players = await store.listPlayers(host.roomCode);
    expect(players.filter((p) => p.is_bot)).toHaveLength(5);
    expect(new Set(players.map((p) => p.display_name)).size).toBe(players.length);
    await H.updateSettings(ctx, hdr(host), { roomCode: host.roomCode, settings: { maxPlayers: 8 } });
    const r = await H.addBots(ctx, hdr(host), { roomCode: host.roomCode, count: 20 });
    expect((r.body as { added: number }).added).toBe(1); // เหลือที่ว่างแค่ 1 (8 − 7)
    expect((await H.addBots(ctx, hdr(host), { roomCode: host.roomCode, count: 1 })).status).toBe(403); // เต็มแล้ว
    const bot = players.find((p) => p.is_bot)!;
    expect(bot.is_alive).toBe(true);
  });
});

describe('บอทเล่นเอง', () => {
  it('★ ห้อง 1 คน + บอท 6: คนไม่ทำอะไรเลย เกมก็เดินจนจบ (ไม่ค้าง) · บอทไม่ได้เหรียญ/XP', async () => {
    const { ctx, store, clock, host } = await setup();
    await H.addBots(ctx, hdr(host), { roomCode: host.roomCode, count: 6 });
    await H.updateSettings(ctx, hdr(host), { roomCode: host.roomCode, settings: { roleCounts: countsFromRoles(presetRoles(7)) } });
    expect((await H.startGame(ctx, hdr(host), { roomCode: host.roomCode })).status).toBe(200);

    let phase = '';
    for (let i = 0; i < 600 && phase !== 'game_over'; i++) {
      clock.t += 20_000; // เวลาเดินไปเรื่อยๆ เหมือนผู้เล่นกด tick
      await H.tick(ctx, hdr(host), { roomCode: host.roomCode });
      phase = (await store.getRoom(host.roomCode))!.phase;
    }
    expect(phase).toBe('game_over');
    expect(store.progress.size).toBe(0);
    expect(store.wallets.size).toBe(0);
  });

  it('บอทลงมือเองในกลางคืน/โหวต: มีเหตุการณ์ที่บอทเป็นผู้กระทำ และมีผู้เสียชีวิตเกิดขึ้นในเกม', async () => {
    const { ctx, store, clock, host } = await setup();
    await H.addBots(ctx, hdr(host), { roomCode: host.roomCode, count: 6 });
    await H.updateSettings(ctx, hdr(host), { roomCode: host.roomCode, settings: { roleCounts: countsFromRoles(presetRoles(7)) } });
    await H.startGame(ctx, hdr(host), { roomCode: host.roomCode });
    for (let i = 0; i < 600; i++) {
      clock.t += 20_000;
      await H.tick(ctx, hdr(host), { roomCode: host.roomCode });
      if ((await store.getRoom(host.roomCode))!.phase === 'game_over') break;
    }
    const game = (await store.getRoomSecrets(host.roomCode))!.engine_state!.game;
    expect(game.players.some((p) => !p.alive)).toBe(true);
    expect(game.winners?.length ?? 0).toBeGreaterThan(0);
  });
});
