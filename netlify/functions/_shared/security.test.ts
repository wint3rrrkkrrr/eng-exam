// M7: "ลองโกงเองไม่สำเร็จ" — ยิงคำขอแปลก/ปลอม/ข้ามสิทธิ์เข้า API ตรงๆ ต้องถูกปฏิเสธเสมอ (ไม่ 500 ไม่รั่ว ไม่เปลี่ยนสถานะ)
import { describe, expect, it } from 'vitest';
import { MemoryStore } from './memoryStore';
import { dispatch, ROUTES } from './http';
import type { Route } from './http';
import type { Headers } from './handlers';
import type { AuthResponse, MyViewResponse } from '../../../src/games/werewolf/shared/api';
import { presetRoles } from '../../../src/games/werewolf/engine';
import { countsFromRoles } from '../../../src/games/werewolf/shared/lobby';

const hdr = (a: AuthResponse): Headers => ({ 'x-ww-player-id': a.playerId, 'x-ww-token': a.token });
const call = (store: MemoryStore, route: Route, headers: Headers, body: Record<string, unknown>) => dispatch(route, headers, body, store);

async function room(store: MemoryStore, n: number) {
  const created = (await call(store, 'create-room', {}, { displayName: 'เจ้าของ' })).body as AuthResponse;
  const players = [created];
  for (let i = 2; i <= n; i++) players.push((await call(store, 'join-room', {}, { roomCode: created.roomCode, displayName: `ผู้เล่น${i}` })).body as AuthResponse);
  await call(store, 'update-settings', hdr(created), { roomCode: created.roomCode, settings: { roleCounts: countsFromRoles(presetRoles(n)) } });
  await call(store, 'start-game', hdr(created), { roomCode: created.roomCode });
  for (const p of players) await call(store, 'action', hdr(p), { roomCode: created.roomCode, type: 'ready' });
  return { code: created.roomCode, players };
}

const view = async (store: MemoryStore, code: string, a: AuthResponse) => (await call(store, 'my-view', hdr(a), { roomCode: code })).body as MyViewResponse;

describe('คำขอขยะ/ปลอมทุกเส้นทาง → ไม่มี 500 และไม่ใช่ 2xx', () => {
  const junk: Record<string, unknown>[] = [
    {},
    { roomCode: 5 },
    { roomCode: 'ABCDE' },
    { roomCode: 'ABCDE', type: {} },
    { roomCode: 'ABCDE', type: 'night_action', kind: [], targets: 'x' },
    { roomCode: 'ABCDE', channel: {}, text: {} },
    { itemId: {}, avatar: 'x', walletId: [], walletToken: {} },
    { username: {}, passwordHash: 5 },
    JSON.parse('{"__proto__": {"polluted": true}, "constructor": {"prototype": {"polluted": true}}, "roomCode": "ABCDE"}'),
  ];
  for (const route of ROUTES) {
    if (route === 'create-room' || route === 'wallet-create' || route === 'leaderboard') continue; // สร้างของใหม่/อันดับสาธารณะ เปิดดูได้โดยไม่ต้องมีตั๋วตามออกแบบ
    it(`${route}: ไม่มีตั๋ว + เนื้อหาขยะ`, async () => {
      const store = new MemoryStore();
      for (const body of junk) {
        const r = await call(store, route, {}, body);
        expect(r.status, JSON.stringify(body)).toBeLessThan(500);
        expect(r.status, JSON.stringify(body)).toBeGreaterThanOrEqual(400);
      }
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });
  }
});

describe('ตัวจำกัดความถี่ (rate limit)', () => {
  const limited = (store: MemoryStore, route: Route, headers: Headers, body: Record<string, unknown>) =>
    dispatch(route, headers, body, store, { rateLimit: true });

  it('สร้างห้อง/ล็อกอินรัวๆ จาก IP เดียว → 429 · IP อื่นไม่โดนด้วย', async () => {
    const store = new MemoryStore();
    const ip = { 'x-ww-ip': '1.2.3.4' };
    let created = 0;
    for (let i = 0; i < 14; i++) if ((await limited(store, 'create-room', ip, { displayName: `ห้อง${i}` })).status === 200) created++;
    expect(created).toBe(10); // ลิมิต 10 ครั้ง/นาที
    expect((await limited(store, 'create-room', { 'x-ww-ip': '5.6.7.8' }, { displayName: 'คนอื่น' })).status).toBe(200);

    let status = 0;
    for (let i = 0; i < 22; i++) status = (await limited(store, 'auth-login', ip, { username: `ชื่อ${i}`, password: 'secret99' })).status;
    expect(status).toBe(429);
  });

  it('คำขอปกติ (ดึงมุมมองถี่ตอนโหวต) ไม่โดนลิมิตพร่ำเพรื่อ', async () => {
    const store = new MemoryStore();
    const { code, players } = await room(store, 8);
    for (let i = 0; i < 100; i++) {
      const r = await limited(store, 'my-view', hdr(players[1]), { roomCode: code });
      expect(r.status).toBe(200);
    }
  });

  it('ตัวนับล้ม (ฐานข้อมูลมีปัญหา) → ไม่ทำให้เกมเล่นไม่ได้ (ปล่อยผ่าน)', async () => {
    const store = new MemoryStore();
    store.rateHit = async () => true;
    expect((await limited(store, 'create-room', {}, { displayName: 'เจ้าของ' })).status).toBe(200);
  });
});

describe('รหัสผ่านไม่รั่วออกทางไหนเลย', () => {
  it('ผลล็อกอิน/ข้อมูลห้อง/กระเป๋า ไม่มีรหัสผ่านหรือแฮชรหัส · เก็บเฉพาะ scrypt + แฮชของ token', async () => {
    const store = new MemoryStore();
    const login = await dispatch('auth-login', {}, { username: 'WIN', password: 'ลับสุดยอด99' }, store);
    expect(login.status).toBe(200);
    const json = JSON.stringify(login.body);
    expect(json).not.toContain('ลับสุดยอด99');
    expect(json).not.toContain(store.credentials.get('WIN')!);
    // ตั๋วเซสชันที่ส่งกลับไม่ใช่ค่าที่เก็บในฐานข้อมูล (เก็บเฉพาะแฮช)
    const token = (login.body as { token: string }).token;
    expect([...store.sessions.keys()]).not.toContain(token);
    const w = await dispatch('wallet-login', {}, { username: 'WIN', sessionToken: token }, store);
    expect(w.status).toBe(200);
    expect(JSON.stringify(w.body)).not.toContain(store.credentials.get('WIN')!);
    expect(JSON.stringify(w.body)).not.toContain('password');
  });
});

describe('ลองโกงระหว่างเล่น', () => {
  it('ตั๋วของคนอื่น/ตั๋วปลอม/ตั๋วจากห้องอื่น → ใช้ไม่ได้ทุกเส้นทางที่ต้องมีตั๋ว', async () => {
    const store = new MemoryStore();
    const a = await room(store, 8);
    const b = await room(store, 8);
    const victim = a.players[1];
    const attempts: [Route, Record<string, unknown>][] = [
      ['my-view', { roomCode: a.code }],
      ['action', { roomCode: a.code, type: 'night_action', kind: 'skip' }],
      ['chat', { roomCode: a.code, channel: 'public', text: 'x' }],
      ['tick', { roomCode: a.code }],
    ];
    for (const [route, body] of attempts) {
      // ใช้ id ของเหยื่อแต่ตั๋วปลอม
      expect((await call(store, route, { 'x-ww-player-id': victim.playerId, 'x-ww-token': 'ปลอม' }, body)).status, `${route} ตั๋วปลอม`).toBe(401);
      // ตั๋วของผู้เล่นห้อง B มาใช้กับห้อง A
      expect((await call(store, route, hdr(b.players[0]), body)).status, `${route} ข้ามห้อง`).toBe(401);
      // ตั๋วของคนในห้องเดียวกันแต่ id คนละคน
      expect((await call(store, route, { 'x-ww-player-id': victim.playerId, 'x-ww-token': a.players[2].token }, body)).status, `${route} สลับตั๋ว`).toBe(401);
    }
  });

  it('ไม่เห็นบท/ความลับของคนอื่นผ่าน my-view ของตัวเอง (ทุกคน ทุกเฟส ถึงเช้า)', async () => {
    const store = new MemoryStore();
    const { code, players } = await room(store, 10);
    const secrets = (await store.getRoomSecrets(code))!.engine_state!.game;
    for (const me of players) {
      const v = await view(store, code, me);
      const json = JSON.stringify(v);
      for (const other of secrets.players) {
        if (other.id === me.playerId) continue;
        // บทของคนอื่น (เป็นสตริงรหัสบท) ต้องไม่โผล่ใกล้ id ของเขาในมุมมองของเรา ยกเว้นเพื่อนร่วมฝ่ายที่กติกาให้เห็น
        const allyIds = (v.game?.allies ?? []).map((x) => x.playerId);
        if (allyIds.includes(other.id)) continue;
        expect(json.includes(`"playerId":"${other.id}","role"`), `${me.playerId} เห็นบทของ ${other.id}`).toBe(false);
      }
      expect(json).not.toContain('rngState');
      expect(json).not.toContain('"seed"');
      expect(json).not.toContain('intents');
      expect(json).not.toContain('token_hash');
    }
  });

  it('ส่งแอคชันกลางคืนแทนคนอื่น (actorId ปลอมในเนื้อหา) → ใช้ตัวตนจากตั๋ว ไม่เปลี่ยนเกม', async () => {
    const store = new MemoryStore();
    const { code, players } = await room(store, 8);
    const g0 = (await store.getRoomSecrets(code))!.engine_state!.game;
    const wolf = g0.players.find((p) => p.team === 'wolf')!;
    const villager = players.find((p) => g0.players.find((x) => x.id === p.playerId)!.roleId === 'villager')!;
    const before = JSON.stringify((await store.getRoomSecrets(code))!.engine_state!.game.night);
    const r = await call(store, 'action', hdr(villager), { roomCode: code, type: 'night_action', actorId: wolf.id, kind: 'wolf_bite', targets: [villager.playerId] });
    expect(r.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify((await store.getRoomSecrets(code))!.engine_state!.game.night)).toBe(before);
  });

  it('ชาวบ้านพิมพ์เข้าแชทลับทุกช่อง / ช่องที่ไม่มีอยู่ → ปฏิเสธ', async () => {
    const store = new MemoryStore();
    const { code, players } = await room(store, 8);
    const g0 = (await store.getRoomSecrets(code))!.engine_state!.game;
    const villager = players.find((p) => g0.players.find((x) => x.id === p.playerId)!.team === 'village')!;
    for (const channel of ['wolf', 'vampire', 'cult', 'lovers', 'dead', '__proto__', 'ADMIN', '']) {
      const r = await call(store, 'chat', hdr(villager), { roomCode: code, channel, text: 'แทรก' });
      expect(r.status, channel).toBeGreaterThanOrEqual(400);
      expect(r.status, channel).toBeLessThan(500);
    }
  });

  it('ผู้ชมอ่านได้อย่างเดียว: ส่งแอคชัน/โหวต/แชทลับไม่ได้', async () => {
    const store = new MemoryStore();
    const { code } = await room(store, 8);
    // เข้าห้องหลังเริ่มเกม = ผู้ชม (ห้องล็อก)
    const j = await call(store, 'join-room', {}, { roomCode: code, displayName: 'คนดู', spectate: true });
    expect(j.status).toBe(200);
    const spec = j.body as AuthResponse;
    for (const body of [
      { roomCode: code, type: 'night_action', kind: 'skip' },
      { roomCode: code, type: 'vote', targetId: null },
      { roomCode: code, type: 'gunner_shot', targetId: 'p1' },
      { roomCode: code, type: 'hunter_shot', targetId: 'p1' },
    ]) {
      const r = await call(store, 'action', hdr(spec), body);
      expect(r.status).toBeGreaterThanOrEqual(400);
    }
    expect((await call(store, 'chat', hdr(spec), { roomCode: code, channel: 'wolf', text: 'x' })).status).toBe(403);
  });

  it('กระเป๋า: ราคาจากไคลเอนต์ถูกเมิน · จำนวนติดลบ/ราคาติดลบ/ของฟรี ไม่ทำให้เหรียญเพิ่ม', async () => {
    const store = new MemoryStore();
    const w = (await call(store, 'wallet-create', {}, {})).body as { walletId: string; token: string; wallet: { coins: number } };
    const h: Headers = { 'x-ww-wallet-id': w.walletId, 'x-ww-wallet-token': w.token };
    for (const body of [{ itemId: 'hw_cap', price: -999999 }, { itemId: 'hw_cap', price: 0 }, { itemId: 'hw_cap', qty: -5 }]) {
      await call(store, 'shop-buy', h, body);
    }
    const after = (await call(store, 'wallet', h, {})).body as { coins: number; owned: string[] };
    expect(after.coins).toBeLessThanOrEqual(w.wallet.coins);
    expect(after.owned.filter((x) => x === 'hw_cap').length).toBeLessThanOrEqual(1);
    // ตั๋วกระเป๋าผิด → อ่าน/ซื้อไม่ได้
    expect((await call(store, 'wallet', { ...h, 'x-ww-wallet-token': 'ปลอม' }, {})).status).toBe(401);
    expect((await call(store, 'shop-buy', { ...h, 'x-ww-wallet-token': 'ปลอม' }, { itemId: 'hw_cap' })).status).toBe(401);
  });

  it('ส่งอวตารที่ไม่ได้ซื้อ (ใส่ของแพงฟรี) → ถูกแทนด้วยค่าเริ่มต้น ไม่ได้ของฟรี', async () => {
    const store = new MemoryStore();
    const w = (await call(store, 'wallet-create', {}, {})).body as { walletId: string; token: string };
    const h: Headers = { 'x-ww-wallet-id': w.walletId, 'x-ww-wallet-token': w.token };
    const r = await call(store, 'avatar-save', h, { avatar: { headwear: 'hw_crown', outfit: 'ไม่มีจริง' } });
    expect(r.status).toBe(200);
    expect((r.body as { avatar: Record<string, string> }).avatar.headwear).not.toBe('hw_crown');
    expect((r.body as { owned: string[] }).owned).not.toContain('hw_crown');
  });
});
