// components/RedeemPanel.tsx — แลกโค้ดเซ็ตพิเศษ + ดู/ใส่เซ็ตที่มีแล้ว
import React, { useState } from 'react';
import { Gift, Loader2 } from 'lucide-react';
import { ITEM_BY_ID } from '../shared/avatar';
import type { AvatarConfig } from '../shared/avatar';
import { SPECIAL_SETS, setItemIds } from '../shared/avatarExtra';
import type { SpecialSet } from '../shared/avatarExtra';
import type { WalletView } from '../shared/api';
import { redeemCode } from '../net/wallet';
import type { WalletCreds } from '../net/wallet';
import { AvatarArt } from './avatar/AvatarArt';
import { playGameSound } from '../shared/sound';

interface Props {
  creds: WalletCreds;
  wallet: WalletView;
  draft: AvatarConfig;
  onWallet: (w: WalletView) => void;
  onEquipSet: (itemIds: string[]) => void;
}

const SetCard: React.FC<{ set: SpecialSet; owned: boolean; draft: AvatarConfig; onEquip: () => void; fresh?: boolean }> = ({ set, owned, draft, onEquip, fresh }) => {
  const ids = setItemIds(set.id);
  const cfg: AvatarConfig = { ...draft };
  for (const id of ids) cfg[ITEM_BY_ID[id].slot] = id;
  return (
    <section className={`rounded-3xl border-2 p-3 space-y-2 ${owned ? 'border-amber-400/70 bg-gradient-to-b from-amber-950/40 to-slate-900/70' : 'border-slate-700 bg-slate-900/50 opacity-80'} ${fresh ? 'ring-4 ring-amber-300/60' : ''}`}>
      <div className="flex gap-3">
        <div className="w-28 shrink-0 aspect-[4/5] rounded-2xl overflow-hidden border border-white/30 bg-sky-300">
          <AvatarArt config={cfg} className="w-full h-full" />
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-black leading-tight">{set.nameTh}</h3>
          <p className="text-[11px] text-slate-300">{set.themeTh}</p>
          <p className="text-[11px] text-amber-200 font-bold">{owned ? '✓ ได้รับแล้ว (7 ชิ้น)' : '🔒 ต้องใช้โค้ดพิเศษ'}</p>
          <ul className="text-[10px] text-slate-400 leading-snug space-y-0.5">
            {set.parts.map((p) => <li key={p.slot}>• {p.nameTh}</li>)}
          </ul>
        </div>
      </div>
      {owned && <button onClick={onEquip} className="w-full min-h-12 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-black cursor-pointer">ใส่ทั้งเซ็ต</button>}
    </section>
  );
};

export const RedeemPanel: React.FC<Props> = ({ creds, wallet, draft, onWallet, onEquipSet }) => {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [freshSet, setFreshSet] = useState<string | null>(null);
  const owned = new Set(wallet.owned);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    const r = await redeemCode(creds, code);
    setBusy(false);
    if (!r.ok) return setError(r.errorTh);
    onWallet(r.data.wallet);
    setFreshSet(r.data.setId);
    setCode('');
    playGameSound('win');
  };

  return (
    <div className="px-3 pt-4 space-y-4">
      <form onSubmit={submit} className="rounded-3xl border-2 border-fuchsia-500/50 bg-gradient-to-b from-fuchsia-950/40 to-slate-900/70 p-4 space-y-3">
        <h2 className="text-base font-black flex items-center gap-2"><Gift className="w-5 h-5 text-fuchsia-300" /> แลกโค้ดเซ็ตพิเศษ</h2>
        <p className="text-xs text-slate-300">มีโค้ดจากเจ้าของเว็บ? กรอกที่นี่เพื่อรับเซ็ตของแต่งตัวสุดอลังการทั้งชุด (พิมพ์ตัวเล็ก/ใหญ่ มีขีดหรือไม่มีก็ได้)</p>
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(null); }}
          maxLength={40}
          placeholder="เช่น XXXXX-XXXXX-XXXX"
          autoCapitalize="characters"
          className="w-full min-h-14 px-4 rounded-xl bg-slate-950/80 border border-fuchsia-500/40 text-center text-lg font-black tracking-widest uppercase placeholder:text-slate-600 placeholder:tracking-normal placeholder:font-bold placeholder:text-sm focus:outline-none focus:border-fuchsia-300"
        />
        {error && <p role="alert" className="text-sm text-red-300 text-center">{error}</p>}
        <button type="submit" disabled={busy || !code.trim()} className="w-full min-h-14 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 font-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2">
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gift className="w-5 h-5" />} แลกโค้ด
        </button>
      </form>

      <h3 className="text-xs font-black text-slate-300 pt-1">เซ็ตพิเศษทั้งหมด ({SPECIAL_SETS.length} เซ็ต)</h3>
      {SPECIAL_SETS.map((s) => (
        <SetCard
          key={s.id}
          set={s}
          owned={setItemIds(s.id).every((id) => owned.has(id))}
          draft={draft}
          fresh={freshSet === s.id}
          onEquip={() => onEquipSet(setItemIds(s.id))}
        />
      ))}
    </div>
  );
};
