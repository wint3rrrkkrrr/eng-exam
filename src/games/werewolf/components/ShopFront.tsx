import React, { useMemo } from 'react';
import { Check, Lock, Sparkles } from 'lucide-react';
import { ITEM_BY_ID, RARITY_TH, bundleQuote, itemRarity } from '../shared/avatar';
import type { AvatarConfig, Rarity } from '../shared/avatar';
import { BUNDLE_DISCOUNT_PCT } from '../shared/avatar';
import { COLLECTIONS, COLLECTION_BLURB, COL_PARTS, FEATURED_COLLECTION, NEW_COLLECTIONS, collectionLook, colItemId } from '../shared/collections';
import type { Collection } from '../shared/collections';
import { AvatarArt } from './avatar/AvatarArt';

/** ภาพตัวอย่าง: หน้าตา/ผมของผู้เล่นเอง ใส่ชุดของคอลเลกชัน */
export const lookOf = (draft: AvatarConfig, colId: string): AvatarConfig => ({ ...draft, ...collectionLook(colId) } as AvatarConfig);

const grad = (c: Collection, deg = 135) => `linear-gradient(${deg}deg, ${c.pal.c}, ${c.pal.b})`;

export const useOwnedCount = (owned: Set<string>) =>
  useMemo(() => Object.fromEntries(COLLECTIONS.map((c) => [c.id, COL_PARTS.filter((p) => owned.has(colItemId(c.id, p.part))).length])), [owned]);

interface Props {
  coins: number;
  owned: Set<string>;
  draft: AvatarConfig;
  onOpen: (id: string) => void;
  onBuy: (id: string) => void;
  onGacha: () => void;
  onRedeem: () => void;
}

const Progress: React.FC<{ have: number; total: number; color: string }> = ({ have, total, color }) => (
  <div className="h-1.5 rounded-full bg-black/30 overflow-hidden" role="progressbar" aria-valuenow={have} aria-valuemin={0} aria-valuemax={total} aria-label="สะสมแล้ว">
    <div className="h-full rounded-full" style={{ width: `${(have / total) * 100}%`, background: color }} />
  </div>
);

/** หน้าร้านค้า: คอลเลกชันเด่น · ใกล้ครบ · คอลเลกชันทั้งหมด · ทางลัดกาชา/แลกโค้ด */
export const ShopFront: React.FC<Props> = ({ coins, owned, draft, onOpen, onBuy, onGacha, onRedeem }) => {
  const counts = useOwnedCount(owned);
  const total = COL_PARTS.length;
  const featured = COLLECTIONS.find((c) => c.id === FEATURED_COLLECTION) ?? COLLECTIONS[0];
  const fq = bundleQuote(featured.id, owned);
  const nearly = COLLECTIONS.filter((c) => counts[c.id] >= 1 && counts[c.id] < total).sort((a, b) => counts[b.id] - counts[a.id]).slice(0, 6);
  const ordered = [...COLLECTIONS].sort((a, b) => Number(NEW_COLLECTIONS.includes(b.id)) - Number(NEW_COLLECTIONS.includes(a.id)) || Number(counts[a.id] >= total) - Number(counts[b.id] >= total));

  return (
    <div className="px-3 pt-4 space-y-6">
      {/* คอลเลกชันเด่น */}
      <section aria-label="คอลเลกชันเด่น" className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl" style={{ background: grad(featured, 150) }}>
        <div className="absolute -right-4 -top-6 text-[8rem] opacity-15 select-none pointer-events-none leading-none" aria-hidden>{featured.emoji}</div>
        <div className="relative flex gap-4 items-center">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-white text-[10px] font-black" style={{ color: featured.pal.b }}>✨ คอลเลกชันเด่น</span>
              {NEW_COLLECTIONS.includes(featured.id) && <span className="px-2.5 py-0.5 rounded-full bg-black/30 text-[10px] font-black">ใหม่!</span>}
            </div>
            <h2 className="text-2xl font-black leading-tight">{featured.emoji} {featured.nameTh}</h2>
            <p className="text-xs font-semibold text-white/90">{COLLECTION_BLURB[featured.id]}</p>
            <p className="text-[11px] font-bold text-white/80">10 ชิ้น: เสื้อผ้า หมวก แว่น ปีก ของประดับ เอฟเฟกต์ ฉากหลัง และหลุมศพ</p>
            <div>
              <Progress have={counts[featured.id]} total={total} color="#fff" />
              <div className="mt-1 text-[11px] font-bold text-white/85">สะสมแล้ว {counts[featured.id]}/{total} ชิ้น</div>
            </div>
          </div>
          <div className="shrink-0 w-28 sm:w-32 aspect-[4/5] rounded-2xl overflow-hidden border-2 border-white/60 shadow-xl">
            <AvatarArt config={lookOf(draft, featured.id)} className="w-full h-full" title={`ตัวอย่างชุด ${featured.nameTh}`} />
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap items-center gap-2">
          {fq.ids.length === 0 ? (
            <span className="inline-flex items-center gap-1.5 px-4 min-h-12 rounded-xl bg-white/20 font-black text-sm"><Check className="w-4 h-4" /> สะสมครบชุดแล้ว</span>
          ) : (
            <button onClick={() => onBuy(featured.id)} className="min-h-12 px-5 rounded-xl bg-white font-black text-sm cursor-pointer active:scale-95 transition-transform" style={{ color: featured.pal.c }}>
              ซื้อทั้งชุด 🪙 {fq.price.toLocaleString()}
              {fq.saved > 0 && <span className="ml-2 text-[11px] opacity-70 line-through">{fq.full.toLocaleString()}</span>}
            </button>
          )}
          <button onClick={() => onOpen(featured.id)} className="min-h-12 px-5 rounded-xl bg-black/30 hover:bg-black/40 font-black text-sm cursor-pointer">ดูทั้งชุด</button>
          {fq.ids.length > 0 && fq.saved > 0 && <span className="text-[11px] font-black text-white/90">ประหยัด {fq.saved.toLocaleString()} 🪙 ({BUNDLE_DISCOUNT_PCT}%)</span>}
        </div>
      </section>

      {/* ใกล้ครบ */}
      {nearly.length > 0 && (
        <section aria-label="ใกล้สะสมครบ" className="space-y-2">
          <h3 className="px-1 text-sm font-black">🔥 ใกล้ครบแล้ว — ซื้อที่เหลือราคาลด {BUNDLE_DISCOUNT_PCT}%</h3>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {nearly.map((c) => {
              const q = bundleQuote(c.id, owned);
              return (
                <button key={c.id} onClick={() => onOpen(c.id)} className="shrink-0 w-44 rounded-2xl p-3 text-left text-white cursor-pointer" style={{ background: grad(c) }}>
                  <div className="font-black text-sm truncate">{c.emoji} {c.nameTh}</div>
                  <div className="mt-1"><Progress have={counts[c.id]} total={total} color="#fff" /></div>
                  <div className="mt-1 text-[11px] font-bold">เหลืออีก {total - counts[c.id]} ชิ้น · 🪙 {q.price.toLocaleString()}</div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* คอลเลกชันทั้งหมด */}
      <section aria-label="คอลเลกชันทั้งหมด" className="space-y-2">
        <h3 className="px-1 text-sm font-black">🛍️ คอลเลกชันทั้งหมด ({COLLECTIONS.length})</h3>
        <ul className="grid grid-cols-2 gap-3">
          {ordered.map((c) => {
            const have = counts[c.id];
            const q = bundleQuote(c.id, owned);
            const complete = have >= total;
            return (
              <li key={c.id}>
                <button onClick={() => onOpen(c.id)} className="w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-900/70 text-left cursor-pointer active:scale-[.98] transition-transform">
                  <div className="relative aspect-[4/3]" style={{ background: grad(c, 160) }}>
                    <div className="absolute inset-0 flex justify-center">
                      <div className="h-full aspect-[4/5]"><AvatarArt config={lookOf(draft, c.id)} still className="w-full h-full" /></div>
                    </div>
                    {NEW_COLLECTIONS.includes(c.id) && <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white text-[10px] font-black" style={{ color: c.pal.b }}>ใหม่</span>}
                    {complete && <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></span>}
                  </div>
                  <div className="p-2.5 space-y-1.5">
                    <div className="font-black text-sm leading-tight">{c.emoji} {c.nameTh}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 min-h-[2.4em]">{COLLECTION_BLURB[c.id]}</p>
                    <Progress have={have} total={total} color={c.pal.b} />
                    <div className="flex items-center justify-between text-[11px] font-black">
                      <span className="text-slate-300">{have}/{total} ชิ้น</span>
                      <span className={complete ? 'text-emerald-300' : 'text-amber-300'}>{complete ? 'ครบชุด ✓' : `🪙 ${q.price.toLocaleString()}`}</span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ทางลัด */}
      <section aria-label="ทางลัด" className="grid grid-cols-2 gap-3 pb-2">
        <button onClick={onGacha} className="rounded-2xl p-4 text-left bg-gradient-to-br from-amber-500 to-orange-700 text-white cursor-pointer">
          <Sparkles className="w-5 h-5 mb-1" /><div className="font-black text-sm">วงล้อกาชา</div><div className="text-[11px] font-semibold opacity-90">ลุ้นของหายาก เงิน/ทอง/เพชร</div>
        </button>
        <button onClick={onRedeem} className="rounded-2xl p-4 text-left bg-gradient-to-br from-emerald-500 to-teal-700 text-white cursor-pointer">
          <Lock className="w-5 h-5 mb-1" /><div className="font-black text-sm">แลกโค้ดพิเศษ</div><div className="text-[11px] font-semibold opacity-90">ชุดเซ็ตพิเศษสุดหายาก</div>
        </button>
      </section>
      <p className="text-center text-[11px] text-slate-500">เหรียญของคุณ 🪙 {coins.toLocaleString()} · เล่นจบเกมได้เหรียญเพิ่ม</p>
    </div>
  );
};

/** รายละเอียดคอลเลกชัน: ลองใส่ทั้งชุด · ดูทีละชิ้น · ซื้อทีละชิ้นหรือทั้งชุด */
interface ViewProps {
  colId: string;
  owned: Set<string>;
  draft: AvatarConfig;
  /** ภาพตัวอย่างใหญ่ (รวมชุดที่กำลังลอง/ชิ้นที่กำลังเลือกซื้อ) */
  preview: AvatarConfig;
  night: boolean;
  pending: string | null;
  trying: boolean;
  onBack: () => void;
  onPick: (id: string) => void;
  onTryAll: () => void;
  onBuyAll: () => void;
  onEquipAll: () => void;
}

const RARITY_TEXT: Record<Rarity, string> = { common: 'text-slate-300', rare: 'text-sky-300', epic: 'text-violet-300', legendary: 'text-amber-300' };

export const CollectionView: React.FC<ViewProps> = ({ colId, owned, draft, preview, night, pending, trying, onBack, onPick, onTryAll, onBuyAll, onEquipAll }) => {
  const col = COLLECTIONS.find((c) => c.id === colId)!;
  const q = bundleQuote(colId, owned);
  const complete = q.ids.length === 0;
  const parts = COL_PARTS.map((p) => ({ part: p.part, id: colItemId(colId, p.part), item: ITEM_BY_ID[colItemId(colId, p.part)] }));

  return (
    <div className="px-3 pt-3 space-y-4">
      <button onClick={onBack} className="min-h-11 px-3 -ml-1 rounded-xl text-sm font-black text-slate-300 hover:text-white cursor-pointer">← กลับหน้าร้านค้า</button>

      <section className="rounded-3xl p-4 text-white" style={{ background: grad(col, 150) }}>
        <div className="flex gap-4 items-center">
          <div className="w-32 aspect-[4/5] rounded-2xl overflow-hidden border-2 border-white/60 shadow-xl shrink-0">
            <AvatarArt config={preview} night={night} className="w-full h-full" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <h2 className="text-xl font-black leading-tight">{col.emoji} {col.nameTh}</h2>
            <p className="text-xs font-semibold text-white/90">{COLLECTION_BLURB[colId]}</p>
            <p className="text-[11px] font-bold text-white/80">สะสมแล้ว {q.have}/{q.total} ชิ้น</p>
            <button onClick={onTryAll} aria-pressed={trying} className={`min-h-11 px-4 rounded-xl text-xs font-black cursor-pointer ${trying ? 'bg-white text-slate-900' : 'bg-black/30 hover:bg-black/40'}`}>
              {trying ? '👀 กำลังลองใส่ทั้งชุด' : '👗 ลองใส่ทั้งชุด'}
            </button>
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-black/25 p-3 flex items-center justify-between gap-3">
          {complete ? (
            <>
              <span className="font-black text-sm">🎉 สะสมครบทั้งชุดแล้ว</span>
              <button onClick={onEquipAll} className="min-h-11 px-4 rounded-xl bg-white text-slate-900 font-black text-sm cursor-pointer">ใส่ทั้งชุด</button>
            </>
          ) : (
            <>
              <div>
                <div className="text-[11px] font-bold text-white/80">ซื้อที่เหลือ {q.ids.length} ชิ้น ลด {BUNDLE_DISCOUNT_PCT}%</div>
                <div className="font-black text-lg tabular-nums">🪙 {q.price.toLocaleString()} <span className="text-xs font-bold opacity-70 line-through">{q.full.toLocaleString()}</span></div>
                <div className="text-[11px] font-black text-amber-200">ประหยัด {q.saved.toLocaleString()} เหรียญ</div>
              </div>
              <button onClick={onBuyAll} className="min-h-12 px-5 rounded-xl bg-white font-black text-sm cursor-pointer active:scale-95 transition-transform" style={{ color: col.pal.c }}>ซื้อทั้งชุด</button>
            </>
          )}
        </div>
      </section>

      <h3 className="px-1 text-sm font-black">ในคอลเลกชันนี้ ({parts.length} ชิ้น)</h3>
      <ul className="grid grid-cols-2 gap-3">
        {parts.map(({ id, item }) => {
          const isOwned = owned.has(id);
          const rarity = itemRarity(item);
          const slot = item.slot;
          return (
            <li key={id}>
              <button onClick={() => onPick(id)} aria-pressed={pending === id} className={`w-full rounded-2xl border-2 overflow-hidden bg-slate-900/70 text-left cursor-pointer active:scale-[.98] transition-transform ${pending === id ? 'border-red-400' : isOwned ? 'border-emerald-500/60' : 'border-slate-700'}`}>
                <div className="relative aspect-[4/5] bg-sky-300">
                  <AvatarArt config={{ ...draft, [slot]: id } as AvatarConfig} night={night} still className="absolute inset-0 w-full h-full" />
                  {isOwned ? <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></span>
                    : <span className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"><Lock className="w-3.5 h-3.5 text-amber-300" /></span>}
                  {item.animated && <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-1.5 text-[10px] font-black text-amber-200">✨ ขยับ</span>}
                </div>
                <div className="p-2 space-y-0.5">
                  <div className="text-xs font-bold leading-tight line-clamp-2 min-h-[2.2em]">{item.nameTh.replace(/^.*·\s*/, '')}</div>
                  <div className="flex items-center justify-between text-[11px] font-black">
                    <span className={RARITY_TEXT[rarity]}>{RARITY_TH[rarity]}</span>
                    <span className={isOwned ? 'text-emerald-300' : 'text-amber-300'}>{isOwned ? '✓ มีแล้ว' : `🪙 ${item.price}`}</span>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
