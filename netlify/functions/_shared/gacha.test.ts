// กาชา 3 วงล้อ + แลกโค้ดเซ็ตพิเศษ + ของเซ็ตพิเศษ (ไม่ขาย/ไม่ออกกาชา/ใส่ได้เมื่อแลกแล้วเท่านั้น)
import { describe, expect, it } from 'vitest';
import { MemoryStore } from './memoryStore';
import { dispatch } from './http';
import type { Headers } from './handlers';
import type { GachaResponse, RedeemResponse, WalletCreated, WalletView } from '../../../src/games/werewolf/shared/api';
import { AVATAR_ITEMS, ITEM_BY_ID, gachaPool, itemRarity } from '../../../src/games/werewolf/shared/avatar';
import { DUPLICATE_REFUND_PCT, SPECIAL_SETS, WHEELS, setItemIds } from '../../../src/games/werewolf/shared/avatarExtra';

const call = (store: MemoryStore, route: Parameters<typeof dispatch>[0], headers: Headers, body: Record<string, unknown> = {}) => dispatch(route, headers, body, store);

async function newWallet(store: MemoryStore, coins = 100_000) {
  const w = (await call(store, 'wallet-create', {})).body as WalletCreated;
  store.wallets.get(w.walletId)!.coins = coins;
  const h: Headers = { 'x-ww-wallet-id': w.walletId, 'x-ww-wallet-token': w.token };
  return { w, h };
}

const CODES = { winter: 'WINTER-FROST-7QK9', nongfloat: 'NONGFLOAT-PINK-3MZP', mos: 'MOS-MOSSY-8XTD', khowfang: 'KHOWFANG-RAINBOW-5HJW' } as const;

describe('แคตตาล็อก', () => {
  it('ของทั้งหมดหลายพันชิ้น · id ไม่ซ้ำ · เซ็ตพิเศษ 4 เซ็ต × 7 ชิ้น มีชื่อเจ้าของเซ็ตอยู่ในชื่อของทุกชิ้น', () => {
    expect(AVATAR_ITEMS.length).toBeGreaterThan(3000);
    expect(new Set(AVATAR_ITEMS.map((i) => i.id)).size).toBe(AVATAR_ITEMS.length);
    for (const s of SPECIAL_SETS) {
      const ids = setItemIds(s.id);
      expect(ids).toHaveLength(7);
      for (const id of ids) {
        expect(ITEM_BY_ID[id].nameTh, id).toContain(s.person);
        expect(ITEM_BY_ID[id].exclusive).toBe(s.id);
      }
    }
  });

  it('กองกาชาไม่มีของเซ็ตพิเศษ/ของฟรี และมีครบทุกระดับ', () => {
    const pool = gachaPool();
    expect(pool.some((i) => i.id.startsWith('sp_'))).toBe(false);
    expect(pool.every((i) => i.price > 0)).toBe(true);
    const rarities = new Set(pool.map(itemRarity));
    expect([...rarities].sort()).toEqual(['common', 'epic', 'legendary', 'rare']);
  });
});

describe('กาชา (gacha-spin)', () => {
  it('หมุนวงล้อเงิน 1 ครั้ง: หักเหรียญตามราคาวงล้อ ได้ของ 1 ชิ้นเข้ากระเป๋า (หรือเหรียญคืนถ้าซ้ำ)', async () => {
    const store = new MemoryStore();
    const { w, h } = await newWallet(store, 1000);
    const r = await call(store, 'gacha-spin', h, { wheel: 'silver' });
    expect(r.status).toBe(200);
    const body = r.body as GachaResponse;
    expect(body.results).toHaveLength(1);
    const res = body.results[0];
    expect(ITEM_BY_ID[res.itemId]).toBeDefined();
    expect(res.duplicate).toBe(false);
    expect(body.wallet.coins).toBe(1000 - WHEELS[0].cost);
    expect(store.wallets.get(w.walletId)!.owned).toContain(res.itemId);
  });

  it('★ หมุนหลายร้อยครั้ง: ไม่เคยได้ของเซ็ตพิเศษ · วงล้อเพชรไม่มีของธรรมดา · วงล้อเงินส่วนใหญ่เป็นของธรรมดา · วงล้อดีกว่าได้ของหายากกว่า', async () => {
    const store = new MemoryStore();
    const { h } = await newWallet(store, 50_000_000);
    const tally = async (wheel: string, n: number) => {
      const t = { common: 0, rare: 0, epic: 0, legendary: 0 };
      for (let i = 0; i < n / 10; i++) {
        const r = (await call(store, 'gacha-spin', h, { wheel, count: 10 })).body as GachaResponse;
        for (const x of r.results) { t[x.rarity]++; expect(x.itemId.startsWith('sp_')).toBe(false); }
      }
      return t;
    };
    const silver = await tally('silver', 600);
    const gold = await tally('gold', 600);
    const diamond = await tally('diamond', 600);
    expect(diamond.common).toBe(0);
    expect(silver.common).toBeGreaterThan(silver.rare); // 70% vs 25%
    expect(silver.common / 600).toBeGreaterThan(0.5);
    expect(gold.epic + gold.legendary).toBeGreaterThan(silver.epic + silver.legendary);
    expect(diamond.legendary).toBeGreaterThan(gold.legendary);
    expect(diamond.legendary / 600).toBeGreaterThan(0.15); // เป้า 28%
  });

  it('ของซ้ำ → เหรียญคืน 40% ของราคา (ไม่ได้ของเพิ่ม)', async () => {
    const store = new MemoryStore();
    const { w, h } = await newWallet(store, 5000);
    store.wallets.get(w.walletId)!.owned = gachaPool().map((i) => i.id); // มีครบทุกชิ้นแล้ว → ทุกครั้งซ้ำ
    const r = (await call(store, 'gacha-spin', h, { wheel: 'gold' })).body as GachaResponse;
    const res = r.results[0];
    expect(res.duplicate).toBe(true);
    expect(res.refund).toBe(Math.floor((ITEM_BY_ID[res.itemId].price * DUPLICATE_REFUND_PCT) / 100));
    expect(r.wallet.coins).toBe(5000 - 180 + res.refund);
  });

  it('เหรียญไม่พอ → 402 ไม่หักเหรียญ ไม่ได้ของ · ×10 ที่เหรียญพอแค่ 3 ครั้ง → หมุนได้ 3 ครั้งแล้วหยุด', async () => {
    const store = new MemoryStore();
    const { w, h } = await newWallet(store, 59);
    const r = await call(store, 'gacha-spin', h, { wheel: 'silver' });
    expect(r.status).toBe(402);
    expect(store.wallets.get(w.walletId)!.coins).toBe(59);
    expect(store.wallets.get(w.walletId)!.owned).toEqual([]);

    store.wallets.get(w.walletId)!.coins = 60 * 3 + 5;
    const ten = (await call(store, 'gacha-spin', h, { wheel: 'silver', count: 10 })).body as GachaResponse;
    expect(ten.results.length).toBeGreaterThanOrEqual(3); // ของซ้ำคืนเหรียญ อาจหมุนได้มากกว่า 3 นิดหน่อย แต่ไม่ถึง 10
    expect(ten.results.length).toBeLessThan(10);
    expect(ten.wallet.coins).toBeLessThan(60);
  });

  it('วงล้อ/จำนวนไม่ถูกต้อง · ไม่มีตั๋วกระเป๋า → ปฏิเสธ', async () => {
    const store = new MemoryStore();
    const { h } = await newWallet(store);
    expect((await call(store, 'gacha-spin', h, { wheel: 'platinum' })).status).toBe(404);
    expect((await call(store, 'gacha-spin', h, { wheel: 'silver', count: 100 })).status).toBe(400);
    expect((await call(store, 'gacha-spin', h, { wheel: 'silver', count: -1 })).status).toBe(400);
    expect((await call(store, 'gacha-spin', { ...h, 'x-ww-wallet-token': 'ปลอม' }, { wheel: 'silver' })).status).toBe(401);
    expect((await call(store, 'gacha-spin', {}, { wheel: 'silver' })).status).toBe(401);
  });

  it('★ กดหมุนพร้อมกันหลายครั้งด้วยเหรียญพอแค่ 2 ครั้ง → สำเร็จไม่เกิน 2 (ไม่หักติดลบ)', async () => {
    const store = new MemoryStore();
    const { w, h } = await newWallet(store, 125);
    const rs = await Promise.all(Array.from({ length: 6 }, () => call(store, 'gacha-spin', h, { wheel: 'silver' })));
    expect(rs.filter((r) => r.status === 200).length).toBe(2);
    expect(store.wallets.get(w.walletId)!.coins).toBe(5);
  });

  it('★ ลิมิตหมุน: เกิน 40 ครั้ง/นาทีต่อกระเป๋า → 429', async () => {
    const store = new MemoryStore();
    const { h } = await newWallet(store, 50_000_000);
    let last = 0;
    for (let i = 0; i < 45; i++) last = (await dispatch('gacha-spin', h, { wheel: 'silver' }, store, { rateLimit: true })).status;
    expect(last).toBe(429);
  });
});

describe('แลกโค้ดเซ็ตพิเศษ (redeem-code)', () => {
  it('ทั้ง 4 โค้ดแลกได้ ได้ของครบ 7 ชิ้นต่อเซ็ต · พิมพ์ตัวเล็ก/เว้นวรรค/ไม่มีขีดก็แลกได้', async () => {
    const store = new MemoryStore();
    const { w, h } = await newWallet(store);
    const forms = { winter: CODES.winter, nongfloat: 'nongfloat pink 3mzp', mos: ' mosmossy8xtd ', khowfang: 'khowfang-rainbow-5hjw' };
    for (const [set, code] of Object.entries(forms)) {
      const r = await call(store, 'redeem-code', h, { code });
      expect(r.status, set).toBe(200);
      const body = r.body as RedeemResponse;
      expect(body.setId).toBe(set);
      expect(body.added).toBe(7);
      expect(body.itemIds).toEqual(setItemIds(set as 'winter'));
    }
    expect(store.wallets.get(w.walletId)!.owned).toHaveLength(28);
  });

  it('โค้ดผิด/ว่าง/ยาวเกิน → ปฏิเสธ · แลกซ้ำ → 409 ไม่ได้ของเพิ่ม', async () => {
    const store = new MemoryStore();
    const { w, h } = await newWallet(store);
    expect((await call(store, 'redeem-code', h, { code: 'WINTER-FAKE-0000' })).status).toBe(404);
    expect((await call(store, 'redeem-code', h, { code: '' })).status).toBe(400);
    expect((await call(store, 'redeem-code', h, { code: 'x'.repeat(100) })).status).toBe(400);
    expect((await call(store, 'redeem-code', h, { code: { a: 1 } })).status).toBe(400);
    expect((await call(store, 'redeem-code', h, { code: CODES.mos })).status).toBe(200);
    expect((await call(store, 'redeem-code', h, { code: CODES.mos })).status).toBe(409);
    expect(store.wallets.get(w.walletId)!.owned).toHaveLength(7);
    expect((await call(store, 'redeem-code', { ...h, 'x-ww-wallet-token': 'ปลอม' }, { code: CODES.winter })).status).toBe(401);
  });

  it('คนละกระเป๋าแลกโค้ดเดียวกันได้ทั้งคู่ (โค้ดแจกเพื่อน) แต่กระเป๋าเดียวแลกเซ็ตเดิมซ้ำไม่ได้', async () => {
    const store = new MemoryStore();
    const a = await newWallet(store);
    const b = await newWallet(store);
    expect((await call(store, 'redeem-code', a.h, { code: CODES.winter })).status).toBe(200);
    expect((await call(store, 'redeem-code', b.h, { code: CODES.winter })).status).toBe(200);
    expect((await call(store, 'redeem-code', a.h, { code: CODES.winter })).status).toBe(409);
  });

  it('★ ลิมิตเดาโค้ด: เกิน 10 ครั้ง/นาทีต่อกระเป๋า → 429', async () => {
    const store = new MemoryStore();
    const { h } = await newWallet(store);
    let last = 0;
    for (let i = 0; i < 13; i++) last = (await dispatch('redeem-code', h, { code: `GUESS-${i}-ABCD` }, store, { rateLimit: true })).status;
    expect(last).toBe(429);
  });

  it('ของเซ็ตพิเศษซื้อด้วยเหรียญไม่ได้ · ใส่ได้เฉพาะเมื่อแลกโค้ดแล้ว', async () => {
    const store = new MemoryStore();
    const { h } = await newWallet(store);
    const id = setItemIds('winter')[0];
    expect((await call(store, 'shop-buy', h, { itemId: id })).status).toBe(403);

    const save = async () => ((await call(store, 'avatar-save', h, { avatar: { outfit: id, backdrop: setItemIds('winter')[5] } })).body as WalletView).avatar;
    expect((await save()).outfit).not.toBe(id); // ยังไม่แลก → ถูกแทนด้วยค่าเริ่มต้น
    await call(store, 'redeem-code', h, { code: CODES.winter });
    const a = await save();
    expect(a.outfit).toBe(id);
    expect(a.backdrop).toBe(setItemIds('winter')[5]);
  });

  it('โทนสีของของเดิมซื้อ/ใส่ได้ตามปกติ (id แบบ ของเดิม~โทน)', async () => {
    const store = new MemoryStore();
    const { h } = await newWallet(store, 5000);
    const item = AVATAR_ITEMS.find((i) => i.id === 'hw_cap~gold')!;
    expect(item.price).toBeGreaterThan(ITEM_BY_ID['hw_cap'].price);
    const buy = await call(store, 'shop-buy', h, { itemId: 'hw_cap~gold' });
    expect(buy.status).toBe(200);
    const a = ((await call(store, 'avatar-save', h, { avatar: { headwear: 'hw_cap~gold', eyewear: 'ew_round~neon' } })).body as WalletView).avatar;
    expect(a.headwear).toBe('hw_cap~gold');
    expect(a.eyewear).not.toBe('ew_round~neon'); // ยังไม่ได้ซื้อ
  });
});
