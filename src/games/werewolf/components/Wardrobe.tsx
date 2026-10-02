import React, { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Lock, Search, X } from 'lucide-react';
import {
  DEFAULT_AVATAR, FREE_ITEM_IDS, ITEM_BY_ID, RARITY_TH, SLOTS, itemRarity, itemsOfSlot,
} from '../shared/avatar';
import type { AvatarConfig, AvatarSlot, Rarity } from '../shared/avatar';
import { VARIANTS, VARIANT_SLOTS } from '../shared/avatarExtra';
import { COLLECTIONS, collectionLook } from '../shared/collections';
import { bundleQuote } from '../shared/avatar';
import type { WalletView } from '../shared/api';
import { playGameSound } from '../shared/sound';
import { buyCollection, buyItem, ensureWallet, saveAvatar } from '../net/wallet';
import type { WalletCreds } from '../net/wallet';
import { AvatarArt, GraveArt } from './avatar/AvatarArt';
import { GachaPanel } from './GachaPanel';
import { RedeemPanel } from './RedeemPanel';
import { CollectionView, ShopFront } from './ShopFront';

export type WardrobeTab = 'store' | 'wardrobe' | 'gacha' | 'redeem';

interface Props {
  onClose: () => void;
  /** เรียกหลังบันทึกอวตารสำเร็จ (ล็อบบี้ใช้ซิงก์อวตารขึ้นห้อง) */
  onSaved?: (creds: WalletCreds) => void | Promise<void>;
  initialTab?: WardrobeTab;
}

const RARITY_STYLE: Record<Rarity, string> = {
  common: 'text-slate-300 border-slate-600',
  rare: 'text-sky-300 border-sky-500/60',
  epic: 'text-violet-300 border-violet-500/70',
  legendary: 'text-amber-300 border-amber-400/80',
};

const PAGE = 45;
const TABS: { key: WardrobeTab; label: string }[] = [
  { key: 'store', label: '🛍️ ร้านค้า' },
  { key: 'wardrobe', label: '👕 ตู้เสื้อผ้า' },
  { key: 'gacha', label: '🎰 กาชา' },
  { key: 'redeem', label: '🎁 แลกโค้ด' },
];

export const Wardrobe: React.FC<Props> = ({ onClose, onSaved, initialTab = 'store' }) => {
  const [tab, setTab] = useState<WardrobeTab>(initialTab);
  const [creds, setCreds] = useState<WalletCreds | null>(null);
  const [wallet, setWallet] = useState<WalletView | null>(null);
  const [draft, setDraft] = useState<AvatarConfig>({ ...DEFAULT_AVATAR });
  const [slot, setSlot] = useState<AvatarSlot>('headwear');
  const [pending, setPending] = useState<string | null>(null); // ของที่ยังไม่ได้ซื้อ (กำลังลองดู)
  const [busy, setBusy] = useState<'buy' | 'save' | null>(null);
  const [viewCol, setViewCol] = useState<string | null>(null); // คอลเลกชันที่กำลังเปิดดู
  const [tryAll, setTryAll] = useState(false); // ลองใส่ทั้งชุด
  const [bundleAsk, setBundleAsk] = useState<string | null>(null); // รอยืนยันซื้อทั้งชุด
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [night, setNight] = useState(false); // ดูตัวอย่างฉากกลางวัน/กลางคืน
  // ตัวกรองร้านค้า (ของมีหลายพันชิ้น)
  const [query, setQuery] = useState('');
  const [rarityF, setRarityF] = useState<'all' | Rarity>('all');
  const [ownF, setOwnF] = useState<'all' | 'owned' | 'notOwned'>('all');
  const [toneF, setToneF] = useState<string>('all'); // all | base | <variant key>
  const [collF, setCollF] = useState<string>('all'); // คอลเลกชัน
  const [sort, setSort] = useState<'default' | 'priceAsc' | 'priceDesc'>('default');
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    let alive = true;
    void ensureWallet().then((r) => {
      if (!alive) return;
      if (!r.ok) return setError(r.errorTh);
      setCreds(r.data.creds);
      setWallet(r.data.wallet);
      setDraft(r.data.wallet.avatar);
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => { setLimit(PAGE); }, [slot, query, rarityF, ownF, toneF, sort, collF]);

  const owned = useMemo(() => new Set<string>([...FREE_ITEM_IDS, ...(wallet?.owned ?? [])]), [wallet]);
  const dirty = !!wallet && JSON.stringify(draft) !== JSON.stringify(wallet.avatar);
  const base: AvatarConfig = viewCol && tryAll ? ({ ...draft, ...collectionLook(viewCol) } as AvatarConfig) : draft;
  const preview: AvatarConfig = pending ? { ...base, [ITEM_BY_ID[pending].slot]: pending } : base;
  const pendingItem = pending ? ITEM_BY_ID[pending] : null;

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const pick = (id: string) => {
    setError(null);
    if (owned.has(id)) {
      setDraft((d) => ({ ...d, [ITEM_BY_ID[id].slot]: id }));
      setPending(null);
    } else if (ITEM_BY_ID[id].exclusive) {
      setPending(null);
      flash('ของเซ็ตพิเศษ — ต้องแลกด้วยโค้ด');
    } else {
      setPending(id);
    }
  };

  const buy = async () => {
    if (!creds || !pendingItem) return;
    setBusy('buy');
    setError(null);
    const r = await buyItem(creds, pendingItem.id);
    setBusy(null);
    if (!r.ok) { playGameSound('error'); return setError(r.errorTh); }
    playGameSound('buy');
    setWallet(r.data);
    setDraft((d) => ({ ...d, [pendingItem.slot]: pendingItem.id }));
    setPending(null);
    flash(`ซื้อ "${pendingItem.nameTh}" แล้ว!`);
  };

  const openCollection = (id: string) => { setViewCol(id); setTryAll(false); setPending(null); setBundleAsk(null); setError(null); };

  const buyBundle = async () => {
    if (!creds || !bundleAsk) return;
    const id = bundleAsk;
    setBusy('buy');
    setError(null);
    const r = await buyCollection(creds, id);
    setBusy(null);
    setBundleAsk(null);
    if (!r.ok) { playGameSound('error'); return setError(r.errorTh); }
    playGameSound('buy');
    setWallet(r.data);
    setDraft((d) => ({ ...d, ...collectionLook(id) }) as AvatarConfig); // ใส่ทั้งชุดให้เลย (ยังไม่บันทึกจนกว่าจะกด)
    setTryAll(false);
    flash(`ซื้อคอลเลกชัน ${COLLECTIONS.find((x) => x.id === id)?.nameTh} ครบชุดแล้ว! อย่าลืมกดบันทึก`);
  };

  const save = async (closeAfter = false) => {
    if (!creds) return;
    setBusy('save');
    setError(null);
    const r = await saveAvatar(creds, draft);
    setBusy(null);
    if (!r.ok) return setError(r.errorTh);
    setWallet(r.data);
    await onSaved?.(creds);
    flash('บันทึกอวตารแล้ว ✓');
    if (closeAfter) onClose();
  };

  const close = async () => {
    if (dirty && creds) await save(true); // มีการเปลี่ยนแปลงค้างอยู่ → บันทึกให้ก่อนปิด
    else onClose();
  };

  const equip = (id: string) => setDraft((d) => ({ ...d, [ITEM_BY_ID[id].slot]: id }));
  const equipMany = (ids: string[]) => {
    setDraft((d) => {
      const next = { ...d };
      for (const id of ids) next[ITEM_BY_ID[id].slot] = id;
      return next;
    });
    setTab('wardrobe');
    flash('ใส่ทั้งเซ็ตแล้ว — อย่าลืมกดบันทึก');
  };

  // ---------------------------------------------------------------- รายการของในหมวด (กรอง/ค้นหา/เรียง)
  const all = useMemo(() => itemsOfSlot(slot).filter((i) => !i.exclusive || owned.has(i.id)), [slot, owned]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = all.filter((i) => {
      if (q && !i.nameTh.toLowerCase().includes(q)) return false;
      if (rarityF !== 'all' && itemRarity(i) !== rarityF) return false;
      if (ownF === 'owned' && !owned.has(i.id)) return false;
      if (ownF === 'notOwned' && owned.has(i.id)) return false;
      if (collF === 'rap' && !i.id.startsWith('rap_')) return false;
      if (collF.startsWith('col:') && !i.id.startsWith('col_' + collF.slice(4) + '_')) return false;
      if (toneF === 'base' && i.id.includes('~')) return false;
      if (toneF !== 'all' && toneF !== 'base' && !i.id.endsWith(`~${toneF}`)) return false;
      return true;
    });
    if (sort !== 'default') list = [...list].sort((a, b) => (sort === 'priceAsc' ? a.price - b.price : b.price - a.price));
    return list;
  }, [all, query, rarityF, ownF, toneF, collF, sort, owned]);
  const shown = filtered.slice(0, limit);
  const toneAble = VARIANT_SLOTS.includes(slot);

  const chip = (active: boolean) => `shrink-0 min-h-10 px-3 rounded-full text-[11px] font-bold cursor-pointer ${active ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1020] text-slate-100 overflow-y-auto" role="dialog" aria-label="ตู้เสื้อผ้า ร้านค้า กาชา และแลกโค้ด">
      <div className="max-w-xl mx-auto pb-32">
        <header className="sticky top-0 z-10 bg-[#0b1020]/95 backdrop-blur px-4 py-3 flex items-center justify-between gap-3 border-b border-slate-800">
          <button onClick={close} aria-label="ปิด" className="min-w-12 min-h-12 -ml-2 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-base font-black">ร้านค้าแววูฟ</h1>
          <div className="rounded-full bg-amber-950/60 border border-amber-400/40 px-3 py-1.5 text-sm font-black text-amber-200 tabular-nums" aria-label="เหรียญของคุณ">
            🪙 {wallet ? wallet.coins : '…'}
          </div>
        </header>

        {!wallet && !error && <div className="py-20 flex items-center justify-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> กำลังเปิดกระเป๋า…</div>}
        {error && !wallet && <p role="alert" className="m-4 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</p>}

        {wallet && creds && (
          <>
            <nav className="px-3 pt-3 grid grid-cols-4 gap-1.5" role="tablist" aria-label="เมนูร้านค้า">
              {TABS.map((t) => (
                <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                  className={`min-h-12 rounded-xl text-xs sm:text-sm font-black cursor-pointer ${tab === t.key ? 'bg-gradient-to-r from-pink-600 to-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                  {t.label}
                </button>
              ))}
            </nav>

            {/* ตัวอย่าง (ทุกแท็บเห็นอวตารที่กำลังแต่ง · หน้าแรกของร้านมีภาพตัวอย่างในการ์ดเองแล้ว) */}
            {(tab !== 'store') && (
            <section className="px-4 pt-4 flex flex-col items-center gap-2">
              <div className="w-40 aspect-[4/5] rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl shadow-violet-900/40 bg-sky-300">
                {tab === 'wardrobe' && slot === 'grave'
                  ? <GraveArt backdrop={preview.backdrop} grave={preview.grave} role="seer" night={night} className="w-full h-full" />
                  : <AvatarArt config={preview} night={night} className="w-full h-full" title="ตัวอย่างอวตารของคุณ" />}
              </div>
              <p className="text-xs text-slate-400">
                {pendingItem ? `กำลังลอง: ${pendingItem.nameTh}` : dirty ? 'มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก' : 'อวตารที่ใส่อยู่'}
              </p>
              <button onClick={() => setNight((n) => !n)} className="min-h-12 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold cursor-pointer" aria-pressed={night}>
                {night ? '🌙 กลางคืน — แตะเพื่อดูกลางวัน' : '☀️ กลางวัน — แตะเพื่อดูกลางคืน'}
              </button>
              <p className="text-[11px] text-slate-500">เล่นจบเกมได้เหรียญ: เล่น +200 · ชนะ +300 · รอดชีวิต +100</p>
            </section>
            )}

            {tab === 'store' && (viewCol
              ? <CollectionView colId={viewCol} owned={owned} draft={draft} preview={preview} night={night} pending={pending} trying={tryAll}
                  onBack={() => { setViewCol(null); setPending(null); setBundleAsk(null); setTryAll(false); }}
                  onPick={(id) => { setBundleAsk(null); pick(id); }}
                  onTryAll={() => { setPending(null); setTryAll((t) => !t); }}
                  onBuyAll={() => { setPending(null); setBundleAsk(viewCol); }}
                  onEquipAll={() => { setDraft((d) => ({ ...d, ...collectionLook(viewCol) }) as AvatarConfig); flash('ใส่ทั้งชุดแล้ว — อย่าลืมกดบันทึก'); }}
                />
              : <ShopFront coins={wallet.coins} owned={owned} draft={draft} onOpen={openCollection}
                  onBuy={(id) => { openCollection(id); setBundleAsk(id); }}
                  onGacha={() => setTab('gacha')} onRedeem={() => setTab('redeem')} />
            )}

            {tab === 'gacha' && <GachaPanel creds={creds} wallet={wallet} draft={draft} onWallet={setWallet} onEquip={(id) => { equip(id); setTab('wardrobe'); setSlot(ITEM_BY_ID[id].slot); flash('ใส่ของใหม่แล้ว — อย่าลืมกดบันทึก'); }} />}
            {tab === 'redeem' && <RedeemPanel creds={creds} wallet={wallet} draft={draft} onWallet={setWallet} onEquipSet={equipMany} />}

            {tab === 'wardrobe' && (
              <>
                {/* หมวดหมู่ */}
                <nav className="mt-4 px-3 flex gap-1.5 overflow-x-auto" role="tablist" aria-label="หมวดของแต่งตัว">
                  {SLOTS.map((s) => (
                    <button
                      key={s.slot}
                      role="tab"
                      aria-selected={slot === s.slot}
                      onClick={() => { setSlot(s.slot); setPending(null); }}
                      className={`shrink-0 min-h-12 px-3.5 rounded-xl text-xs font-bold cursor-pointer ${slot === s.slot ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                      <span className="mr-1">{s.icon}</span>{s.labelTh}
                    </button>
                  ))}
                </nav>

                {/* ตัวกรอง */}
                <div className="mt-3 px-3 space-y-2">
                  <label className="relative block">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาชื่อของ…" className="w-full min-h-12 pl-9 pr-3 rounded-xl bg-slate-900/80 border border-slate-700 text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-400" />
                  </label>
                  <div className="flex gap-1.5 overflow-x-auto pb-1" aria-label="กรองตามระดับ">
                    <button className={chip(rarityF === 'all')} onClick={() => setRarityF('all')}>ทุกระดับ</button>
                    {(['common', 'rare', 'epic', 'legendary'] as Rarity[]).map((r) => <button key={r} className={chip(rarityF === r)} onClick={() => setRarityF(r)}>{RARITY_TH[r]}</button>)}
                    <span className="shrink-0 w-px bg-slate-700 mx-0.5" />
                    <button className={chip(ownF === 'all')} onClick={() => setOwnF('all')}>ทั้งหมด</button>
                    <button className={chip(ownF === 'owned')} onClick={() => setOwnF('owned')}>ที่มีแล้ว</button>
                    <button className={chip(ownF === 'notOwned')} onClick={() => setOwnF('notOwned')}>ยังไม่มี</button>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1" aria-label="คอลเลกชัน">
                    <button className={chip(collF === 'all')} onClick={() => setCollF('all')}>ทุกคอลเลกชัน</button>
                    <button className={chip(collF === 'rap')} onClick={() => setCollF('rap')}>🎤 แรปเปอร์</button>
                    {COLLECTIONS.map((c) => <button key={c.id} className={chip(collF === 'col:' + c.id)} onClick={() => setCollF('col:' + c.id)}>{c.emoji} {c.nameTh}</button>)}
                  </div>
                  <div className="flex gap-2">
                    {toneAble && (
                      <select value={toneF} onChange={(e) => setToneF(e.target.value)} aria-label="กรองตามโทนสี" className="flex-1 min-h-11 px-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-bold">
                        <option value="all">ทุกโทนสี</option>
                        <option value="base">ต้นฉบับเท่านั้น</option>
                        {VARIANTS.map((v) => <option key={v.key} value={v.key}>โทน{v.nameTh}</option>)}
                      </select>
                    )}
                    <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="เรียงลำดับ" className="flex-1 min-h-11 px-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-bold">
                      <option value="default">เรียงตามปกติ</option>
                      <option value="priceAsc">ราคาน้อย → มาก</option>
                      <option value="priceDesc">ราคามาก → น้อย</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-500">พบ {filtered.length.toLocaleString()} ชิ้น{all.length > 80 ? ` (ทั้งหมวด ${all.length.toLocaleString()})` : ''}</p>
                </div>

                {/* ของในหมวด */}
                <ul className="mt-2 px-3 grid grid-cols-3 gap-2" aria-label="รายการของ">
                  {shown.map((item) => {
                    const isOwned = owned.has(item.id);
                    const equipped = draft[slot] === item.id;
                    const rarity = itemRarity(item);
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => pick(item.id)}
                          aria-pressed={equipped || pending === item.id}
                          className={`w-full rounded-xl border-2 overflow-hidden bg-slate-900/70 text-left cursor-pointer transition-transform active:scale-95 ${
                            pending === item.id ? 'border-red-400' : equipped ? 'border-emerald-400' : RARITY_STYLE[rarity].split(' ')[1]
                          }`}
                        >
                          <div className="relative aspect-[4/5] bg-sky-300">
                            {slot === 'grave'
                              ? <GraveArt backdrop={draft.backdrop} grave={item.id} role="seer" night={night} className="absolute inset-0 w-full h-full" />
                              : <AvatarArt config={{ ...draft, [slot]: item.id }} night={night} className="absolute inset-0 w-full h-full" />}
                            {item.animated && <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-1.5 text-[10px] font-black text-amber-200" aria-label="ขยับได้">✨</span>}
                            {item.exclusive && <span className="absolute bottom-1 right-1 rounded-full bg-fuchsia-700/90 px-1.5 text-[9px] font-black text-white">เซ็ตพิเศษ</span>}
                            {equipped && <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></span>}
                            {!isOwned && <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"><Lock className="w-3 h-3 text-amber-300" /></span>}
                          </div>
                          <div className="px-1.5 py-1.5 space-y-0.5">
                            <div className="text-[11px] font-bold leading-tight line-clamp-2 min-h-[1.9em]">{item.nameTh}</div>
                            <div className={`text-[10px] font-black ${isOwned ? 'text-emerald-300' : 'text-amber-300'}`}>
                              {item.exclusive ? '🎁 จากโค้ด' : item.price === 0 ? 'ฟรี' : isOwned ? '✓ มีแล้ว' : `🪙 ${item.price}`}
                            </div>
                            {(item.price > 0 || item.exclusive) && <div className={`text-[9px] ${RARITY_STYLE[rarity].split(' ')[0]}`}>{RARITY_TH[rarity]}</div>}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {filtered.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-500">ไม่พบของที่ตรงกับตัวกรอง</p>}
                {filtered.length > limit && (
                  <div className="px-3 pt-3">
                    <button onClick={() => setLimit((l) => l + PAGE)} className="w-full min-h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold cursor-pointer">
                      ดูเพิ่ม ({(filtered.length - limit).toLocaleString()} ชิ้นที่เหลือ)
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* แถบล่าง: ซื้อ / บันทึก */}
      {wallet && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-[#0b1020]/95 backdrop-blur border-t border-slate-800 px-4 py-3">
          <div className="max-w-xl mx-auto space-y-2">
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
            {toast && <p role="status" className="text-sm text-emerald-300 font-bold">{toast}</p>}
            {bundleAsk && tab === 'store' ? (
              (() => {
                const q = bundleQuote(bundleAsk, owned);
                const name = COLLECTIONS.find((x) => x.id === bundleAsk)?.nameTh;
                return (
                  <div className="flex gap-2">
                    <button onClick={() => setBundleAsk(null)} className="min-h-14 px-4 rounded-xl bg-slate-800 text-sm font-bold cursor-pointer">ยกเลิก</button>
                    <button
                      onClick={buyBundle}
                      disabled={busy !== null || wallet.coins < q.price}
                      className="flex-1 min-h-14 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 font-black text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2 px-2 text-sm"
                    >
                      {busy === 'buy' && <Loader2 className="w-4 h-4 animate-spin" />}
                      {wallet.coins < q.price ? `เหรียญไม่พอ (ขาด ${(q.price - wallet.coins).toLocaleString()})` : `ยืนยันซื้อทั้งชุด 🪙 ${q.price.toLocaleString()} — ${name}`}
                    </button>
                  </div>
                );
              })()
            ) : pendingItem && (tab === 'wardrobe' || tab === 'store') ? (
              <div className="flex gap-2">
                <button onClick={() => setPending(null)} className="min-h-14 px-4 rounded-xl bg-slate-800 text-sm font-bold cursor-pointer">ยกเลิก</button>
                <button
                  onClick={buy}
                  disabled={busy !== null || wallet.coins < pendingItem.price}
                  className="flex-1 min-h-14 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-black text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2 px-2 text-sm"
                >
                  {busy === 'buy' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {wallet.coins < pendingItem.price ? `เหรียญไม่พอ (ขาด ${pendingItem.price - wallet.coins})` : `ซื้อ 🪙 ${pendingItem.price} — ${pendingItem.nameTh}`}
                </button>
              </div>
            ) : (
              <button
                onClick={() => save(false)}
                disabled={busy !== null || !dirty}
                className="w-full min-h-14 rounded-xl bg-gradient-to-r from-red-700 to-violet-700 font-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2"
              >
                {busy === 'save' && <Loader2 className="w-4 h-4 animate-spin" />}
                {dirty ? 'บันทึกอวตาร' : 'บันทึกแล้ว ✓'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
