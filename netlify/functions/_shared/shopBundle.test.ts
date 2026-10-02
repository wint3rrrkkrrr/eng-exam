// ซื้อทั้งคอลเลกชัน: ราคาแพ็กเกจ (ลดเฉพาะชิ้นที่ยังไม่มี) · หักเหรียญครั้งเดียว · ซ้ำ/เหรียญไม่พอ/ไม่มีคอลเลกชัน ถูกปฏิเสธ
import { describe, expect, it } from 'vitest';
import { MemoryStore } from './memoryStore';
import * as H from './handlers';
import type { Ctx } from './handlers';
import { BUNDLE_DISCOUNT_PCT, ITEM_BY_ID, bundleQuote } from '../../../src/games/werewolf/shared/avatar';
import { COLLECTIONS, FEATURED_COLLECTION, colItemIds } from '../../../src/games/werewolf/shared/collections';

const make = (): { ctx: Ctx; store: MemoryStore } => {
  const store = new MemoryStore();
  return { ctx: { store, now: () => 1_700_000_000_000, rand: (lo) => lo }, store };
};
const newWallet = async (ctx: Ctx) => (await H.walletCreate(ctx)).body as { walletId: string; token: string };
const hd = (w: { walletId: string; token: string }) => ({ 'x-ww-wallet-id': w.walletId, 'x-ww-wallet-token': w.token });

describe('คอลเลกชันวาเลนไทน์', () => {
  it('มีคอลเลกชันวาเลนไทน์ 10 ชิ้น ทุกชิ้นอยู่ในแคตตาล็อกพร้อมราคา และเป็นคอลเลกชันเด่น', () => {
    expect(COLLECTIONS.some((c) => c.id === 'val')).toBe(true);
    expect(FEATURED_COLLECTION).toBe('val');
    const ids = colItemIds('val');
    expect(ids).toHaveLength(10);
    for (const id of ids) expect(ITEM_BY_ID[id]?.price, id).toBeGreaterThan(0);
  });
});

describe('ราคาแพ็กเกจ', () => {
  it('ลด 20% จากชิ้นที่ยังไม่มี · ชิ้นที่มีแล้วไม่คิดซ้ำ · ครบแล้ว = ไม่มีของให้ซื้อ', () => {
    const all = colItemIds('val');
    const q = bundleQuote('val', []);
    const sum = all.reduce((s, id) => s + ITEM_BY_ID[id].price, 0);
    expect(q.full).toBe(sum);
    expect(q.price).toBe(Math.round((sum * (100 - BUNDLE_DISCOUNT_PCT)) / 100 / 10) * 10);
    expect(q.saved).toBe(q.full - q.price);
    expect(q.price).toBeLessThan(q.full);
    const half = bundleQuote('val', all.slice(0, 4));
    expect(half.ids).toHaveLength(6);
    expect(half.have).toBe(4);
    expect(half.full).toBeLessThan(q.full);
    expect(bundleQuote('val', all).ids).toHaveLength(0);
  });
});

describe('ซื้อทั้งชุด (เซิร์ฟเวอร์)', () => {
  it('★ ซื้อสำเร็จ: หักเหรียญตามราคาแพ็กเกจ ได้ครบ 10 ชิ้น · ซื้อซ้ำ 409 · คอลเลกชันที่ไม่มี 404 · ส่งราคามาเองถูกเมิน', async () => {
    const { ctx, store } = make();
    const w = await newWallet(ctx);
    store.wallets.get(w.walletId)!.coins = 100000;
    const q = bundleQuote('val', []);
    const r = await H.shopBuyCollection(ctx, hd(w), { collectionId: 'val', price: 1 });
    expect(r.status).toBe(200);
    const view = r.body as { coins: number; owned: string[] };
    expect(view.coins).toBe(100000 - q.price);
    for (const id of colItemIds('val')) expect(view.owned).toContain(id);
    expect((await H.shopBuyCollection(ctx, hd(w), { collectionId: 'val' })).status).toBe(409);
    expect((await H.shopBuyCollection(ctx, hd(w), { collectionId: 'nope' })).status).toBe(404);
    expect((await H.shopBuyCollection(ctx, {}, { collectionId: 'val' })).status).toBe(401);
  });

  it('เหรียญไม่พอ → 402 ไม่หักอะไร · มีบางชิ้นแล้ว → จ่ายเฉพาะชิ้นที่เหลือ', async () => {
    const { ctx, store } = make();
    const w = await newWallet(ctx);
    const row = store.wallets.get(w.walletId)!;
    row.coins = 10;
    expect((await H.shopBuyCollection(ctx, hd(w), { collectionId: 'val' })).status).toBe(402);
    expect(row.coins).toBe(10);
    expect(row.owned).toHaveLength(0);
    const ids = colItemIds('val');
    row.owned = ids.slice(0, 5);
    row.coins = 100000;
    const q = bundleQuote('val', row.owned);
    expect(q.ids).toHaveLength(5);
    expect((await H.shopBuyCollection(ctx, hd(w), { collectionId: 'val' })).status).toBe(200);
    expect(row.coins).toBe(100000 - q.price);
    expect(row.owned).toHaveLength(10);
  });
});
