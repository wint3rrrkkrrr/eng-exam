import React, { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Lock, X } from 'lucide-react';
import {
  DEFAULT_AVATAR, FREE_ITEM_IDS, ITEM_BY_ID, RARITY_TH, SLOTS, itemsOfSlot, rarityOf,
} from '../shared/avatar';
import type { AvatarConfig, AvatarSlot, Rarity } from '../shared/avatar';
import type { WalletView } from '../shared/api';
import { buyItem, ensureWallet, saveAvatar } from '../net/wallet';
import type { WalletCreds } from '../net/wallet';
import { AvatarArt, GraveArt } from './avatar/AvatarArt';

interface Props {
  onClose: () => void;
  /** เรียกหลังบันทึกอวตารสำเร็จ (ล็อบบี้ใช้ซิงก์อวตารขึ้นห้อง) */
  onSaved?: (creds: WalletCreds) => void | Promise<void>;
}

const RARITY_STYLE: Record<Rarity, string> = {
  common: 'text-slate-300 border-slate-600',
  rare: 'text-sky-300 border-sky-500/60',
  epic: 'text-violet-300 border-violet-500/70',
  legendary: 'text-amber-300 border-amber-400/80',
};

export const Wardrobe: React.FC<Props> = ({ onClose, onSaved }) => {
  const [creds, setCreds] = useState<WalletCreds | null>(null);
  const [wallet, setWallet] = useState<WalletView | null>(null);
  const [draft, setDraft] = useState<AvatarConfig>({ ...DEFAULT_AVATAR });
  const [slot, setSlot] = useState<AvatarSlot>('headwear');
  const [pending, setPending] = useState<string | null>(null); // ของที่ยังไม่ได้ซื้อ (กำลังลองดู)
  const [busy, setBusy] = useState<'buy' | 'save' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [night, setNight] = useState(false); // ดูตัวอย่างฉากกลางวัน/กลางคืน

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

  const owned = useMemo(() => new Set<string>([...FREE_ITEM_IDS, ...(wallet?.owned ?? [])]), [wallet]);
  const dirty = !!wallet && JSON.stringify(draft) !== JSON.stringify(wallet.avatar);
  const preview: AvatarConfig = pending ? { ...draft, [ITEM_BY_ID[pending].slot]: pending } : draft;
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
    if (!r.ok) return setError(r.errorTh);
    setWallet(r.data);
    setDraft((d) => ({ ...d, [pendingItem.slot]: pendingItem.id }));
    setPending(null);
    flash(`ซื้อ "${pendingItem.nameTh}" แล้ว!`);
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

  const items = itemsOfSlot(slot);

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1020] text-slate-100 overflow-y-auto" role="dialog" aria-label="ตู้เสื้อผ้าและร้านค้า">
      <div className="max-w-xl mx-auto pb-32">
        <header className="sticky top-0 z-10 bg-[#0b1020]/95 backdrop-blur px-4 py-3 flex items-center justify-between gap-3 border-b border-slate-800">
          <button onClick={close} aria-label="ปิด" className="min-w-12 min-h-12 -ml-2 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-base font-black">ตู้เสื้อผ้า & ร้านค้า</h1>
          <div className="rounded-full bg-amber-950/60 border border-amber-400/40 px-3 py-1.5 text-sm font-black text-amber-200 tabular-nums" aria-label="เหรียญของคุณ">
            🪙 {wallet ? wallet.coins : '…'}
          </div>
        </header>

        {!wallet && !error && <div className="py-20 flex items-center justify-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> กำลังเปิดกระเป๋า…</div>}
        {error && !wallet && <p role="alert" className="m-4 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</p>}

        {wallet && (
          <>
            {/* ตัวอย่าง */}
            <section className="px-4 pt-4 flex flex-col items-center gap-2">
              <div className="w-44 aspect-[4/5] rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl shadow-violet-900/40 bg-sky-300">
                {slot === 'grave'
                  ? <GraveArt backdrop={preview.backdrop} grave={preview.grave} role="seer" night={night} className="w-full h-full" />
                  : <AvatarArt config={preview} night={night} className="w-full h-full" title="ตัวอย่างอวตารของคุณ" />}
              </div>
              <p className="text-xs text-slate-400">
                {pendingItem ? `กำลังลอง: ${pendingItem.nameTh}` : dirty ? 'มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก' : 'อวตารที่ใส่อยู่'}
              </p>
              <button onClick={() => setNight((n) => !n)} className="min-h-12 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold cursor-pointer" aria-pressed={night}>
                {night ? '🌙 กลางคืน — แตะเพื่อดูกลางวัน' : '☀️ กลางวัน — แตะเพื่อดูกลางคืน'}
              </button>
              <p className="text-[11px] text-slate-500">เล่นจบเกมได้เหรียญ: เล่น +20 · ชนะ +30 · รอดชีวิต +10</p>
            </section>

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

            {/* ของในหมวด */}
            <ul className="mt-3 px-3 grid grid-cols-3 gap-2" aria-label="รายการของ">
              {items.map((item) => {
                const isOwned = owned.has(item.id);
                const equipped = draft[slot] === item.id;
                const rarity = rarityOf(item.price);
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
                        {equipped && <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></span>}
                        {!isOwned && <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"><Lock className="w-3 h-3 text-amber-300" /></span>}
                      </div>
                      <div className="px-1.5 py-1.5 space-y-0.5">
                        <div className="text-[11px] font-bold leading-tight truncate">{item.nameTh}</div>
                        <div className={`text-[10px] font-black ${isOwned ? 'text-emerald-300' : 'text-amber-300'}`}>
                          {item.price === 0 ? 'ฟรี' : isOwned ? '✓ มีแล้ว' : `🪙 ${item.price}`}
                        </div>
                        {item.price > 0 && <div className={`text-[9px] ${RARITY_STYLE[rarity].split(' ')[0]}`}>{RARITY_TH[rarity]}</div>}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {/* แถบล่าง: ซื้อ / บันทึก */}
      {wallet && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-[#0b1020]/95 backdrop-blur border-t border-slate-800 px-4 py-3">
          <div className="max-w-xl mx-auto space-y-2">
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
            {toast && <p role="status" className="text-sm text-emerald-300 font-bold">{toast}</p>}
            {pendingItem ? (
              <div className="flex gap-2">
                <button onClick={() => setPending(null)} className="min-h-14 px-4 rounded-xl bg-slate-800 text-sm font-bold cursor-pointer">ยกเลิก</button>
                <button
                  onClick={buy}
                  disabled={busy !== null || wallet.coins < pendingItem.price}
                  className="flex-1 min-h-14 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-black text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  {busy === 'buy' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {wallet.coins < pendingItem.price ? `เหรียญไม่พอ (ขาด ${pendingItem.price - wallet.coins})` : `ซื้อ "${pendingItem.nameTh}" 🪙 ${pendingItem.price}`}
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
