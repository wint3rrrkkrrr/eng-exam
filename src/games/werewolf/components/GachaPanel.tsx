// components/GachaPanel.tsx — กาชา 3 วงล้อ (เงิน/ทอง/เพชร): วงล้อ SVG หมุนจริง → เปิดผล (เซิร์ฟเวอร์สุ่มและหักเหรียญเอง วงล้อเป็นแค่ภาพประกอบ)
import React, { useRef, useState } from 'react';
import { Loader2, Sparkles, X } from 'lucide-react';
import { ITEM_BY_ID, RARITY_TH, itemRarity } from '../shared/avatar';
import type { AvatarConfig, Rarity } from '../shared/avatar';
import { DUPLICATE_REFUND_PCT, WHEELS } from '../shared/avatarExtra';
import type { WheelDef, WheelId } from '../shared/avatarExtra';
import type { GachaResponse, GachaResult, WalletView } from '../shared/api';
import { spinGacha } from '../net/wallet';
import type { WalletCreds } from '../net/wallet';
import { AvatarArt, GraveArt } from './avatar/AvatarArt';
import { playGameSound } from '../shared/sound';

interface Props {
  creds: WalletCreds;
  wallet: WalletView;
  draft: AvatarConfig;
  onWallet: (w: WalletView) => void;
  onEquip: (itemId: string) => void;
}

const RARITY_COLOR: Record<Rarity, string> = { common: '#7b8aa6', rare: '#38a3e8', epic: '#9b5de5', legendary: '#f5b301' };
const RARITY_GLOW: Record<Rarity, string> = { common: 'shadow-slate-500/30', rare: 'shadow-sky-400/50', epic: 'shadow-violet-500/60', legendary: 'shadow-amber-400/80' };
const RARITY_TEXT: Record<Rarity, string> = { common: 'text-slate-300', rare: 'text-sky-300', epic: 'text-violet-300', legendary: 'text-amber-300' };

const THEME: Record<WheelId, { rim: [string, string, string]; hub: string; icon: string; card: string; btn: string }> = {
  silver: { rim: ['#f4f6fa', '#9aa3b2', '#dfe4ee'], hub: '🪙', icon: '🥈', card: 'from-slate-700/60 to-slate-900/70 border-slate-400/50', btn: 'from-slate-300 to-slate-500 text-slate-950' },
  gold: { rim: ['#fff0a0', '#d9a21f', '#ffe27a'], hub: '👑', icon: '🥇', card: 'from-amber-800/50 to-slate-900/70 border-amber-400/60', btn: 'from-amber-300 to-orange-500 text-slate-950' },
  diamond: { rim: ['#e0fbff', '#4fc3f7', '#b3ecff'], hub: '💎', icon: '💠', card: 'from-cyan-800/50 to-indigo-950/80 border-cyan-300/60', btn: 'from-cyan-300 to-fuchsia-500 text-slate-950' },
};

/** ช่องบนวงล้อ 12 ช่อง เรียงตามระดับ (ภาพประกอบ — ผลจริงมาจากเซิร์ฟเวอร์ แล้วหมุนไปหยุดที่ช่องระดับเดียวกัน) */
function segmentsFor(w: WheelDef): Rarity[] {
  const weights = (Object.entries(w.rates) as [Rarity, number][]).filter(([, v]) => v > 0);
  const total = weights.reduce((s, [, v]) => s + v, 0);
  const segs: Rarity[] = [];
  for (const [r, v] of weights) segs.push(...Array(Math.max(1, Math.round((v / total) * 12))).fill(r));
  while (segs.length > 12) segs.splice(segs.lastIndexOf(segs[0]), 1);
  while (segs.length < 12) segs.push(weights[0][0]);
  // สลับให้ระดับต่างๆ กระจายรอบวง
  const order: Rarity[] = [];
  const bucket: Record<string, Rarity[]> = {};
  segs.forEach((r) => (bucket[r] ??= []).push(r));
  const keys = Object.keys(bucket) as Rarity[];
  while (order.length < 12) for (const k of keys) { const x = bucket[k].shift(); if (x) order.push(x); }
  return order;
}

const Wheel: React.FC<{ w: WheelDef; angle: number; spinning: boolean }> = ({ w, angle, spinning }) => {
  const th = THEME[w.id];
  const segs = segmentsFor(w);
  const n = segs.length;
  const R = 92;
  const slice = (i: number) => {
    const a0 = ((i * 360) / n - 90) * (Math.PI / 180);
    const a1 = (((i + 1) * 360) / n - 90) * (Math.PI / 180);
    return `M0 0 L${R * Math.cos(a0)} ${R * Math.sin(a0)} A${R} ${R} 0 0 1 ${R * Math.cos(a1)} ${R * Math.sin(a1)} Z`;
  };
  const gid = `wg${w.id}`;
  return (
    <div className="relative w-52 h-52 mx-auto">
      <svg viewBox="-110 -110 220 220" className="w-full h-full drop-shadow-xl" aria-label={w.nameTh}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={th.rim[0]} /><stop offset=".5" stopColor={th.rim[1]} /><stop offset="1" stopColor={th.rim[2]} /></linearGradient>
        </defs>
        <circle r="106" fill={`url(#${gid})`} />
        <circle r="98" fill="#0b1020" />
        <g style={{ transform: `rotate(${angle}deg)`, transition: spinning ? 'transform 3.4s cubic-bezier(.12,.72,.12,1)' : 'none' }}>
          {segs.map((r, i) => (
            <g key={i}>
              <path d={slice(i)} fill={RARITY_COLOR[r]} stroke="#0b1020" strokeWidth="1.6" opacity={i % 2 ? 0.88 : 1} />
              <text transform={`rotate(${((i + 0.5) * 360) / n}) translate(0 -66)`} textAnchor="middle" fontSize="13" fill="#fff" opacity=".92">{r === 'legendary' ? '★' : r === 'epic' ? '◆' : r === 'rare' ? '●' : '·'}</text>
            </g>
          ))}
        </g>
        {/* ไฟรอบวง */}
        {Array.from({ length: 16 }, (_, i) => (
          <circle key={i} cx={102 * Math.cos((i * 22.5 * Math.PI) / 180)} cy={102 * Math.sin((i * 22.5 * Math.PI) / 180)} r="2.6" fill="#fff">
            <animate attributeName="opacity" values={i % 2 ? '.2;1;.2' : '1;.2;1'} dur={spinning ? '.35s' : '1.6s'} repeatCount="indefinite" />
          </circle>
        ))}
        <circle r="20" fill={`url(#${gid})`} stroke="#0b1020" strokeWidth="2" />
        <text textAnchor="middle" dominantBaseline="central" fontSize="20">{th.hub}</text>
        {/* เข็มชี้ด้านบน */}
        <path d="M-9 -112 L9 -112 L0 -92 Z" fill="#ff3d57" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const ResultCard: React.FC<{ r: GachaResult; draft: AvatarConfig; big?: boolean }> = ({ r, draft, big }) => {
  const item = ITEM_BY_ID[r.itemId];
  const rar = itemRarity(item);
  return (
    <div className={`rounded-xl border-2 overflow-hidden bg-slate-900/80 shadow-lg ${RARITY_GLOW[rar]}`} style={{ borderColor: RARITY_COLOR[rar] }}>
      <div className={`relative ${big ? 'aspect-[4/5]' : 'aspect-[4/5]'} bg-sky-300`}>
        {item.slot === 'grave'
          ? <GraveArt backdrop={draft.backdrop} grave={item.id} role="seer" className="absolute inset-0 w-full h-full" />
          : <AvatarArt config={{ ...draft, [item.slot]: item.id }} className="absolute inset-0 w-full h-full" />}
        {rar === 'legendary' && <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-pulse" />}
      </div>
      <div className="p-1.5 space-y-0.5">
        <div className={`${big ? 'text-sm' : 'text-[10px]'} font-black leading-tight`}>{item.nameTh}</div>
        <div className={`text-[10px] font-black ${RARITY_TEXT[rar]}`}>{RARITY_TH[rar]}</div>
        {r.duplicate && <div className="text-[10px] font-bold text-emerald-300">ซ้ำ → คืน 🪙 {r.refund}</div>}
        {!r.duplicate && <div className="text-[10px] font-bold text-amber-200">ใหม่! ✨</div>}
      </div>
    </div>
  );
};

export const GachaPanel: React.FC<Props> = ({ creds, wallet, draft, onWallet, onEquip }) => {
  const [angles, setAngles] = useState<Record<string, number>>({ silver: 0, gold: 0, diamond: 0 });
  const [spinning, setSpinning] = useState<WheelId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GachaResponse | null>(null);
  const timer = useRef<number | null>(null);

  const spin = async (w: WheelDef, count: 1 | 10) => {
    if (spinning) return;
    setError(null);
    setSpinning(w.id);
    playGameSound('confirm');
    const r = await spinGacha(creds, w.id, count);
    if (!r.ok) {
      setSpinning(null);
      return setError(r.errorTh);
    }
    // หมุนไปหยุดที่ช่องที่ระดับตรงกับ "ของที่ดีที่สุด" ในรอบนี้ (ภาพประกอบเท่านั้น)
    const order: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
    const best = r.data.results.map((x) => x.rarity).sort((a, b) => order.indexOf(b) - order.indexOf(a))[0] ?? 'common';
    const segs = segmentsFor(w);
    const idxs = segs.map((s, i) => (s === best ? i : -1)).filter((i) => i >= 0);
    const target = idxs[Math.floor(Math.random() * idxs.length)] ?? 0;
    const segAngle = 360 / segs.length;
    setAngles((a) => {
      const cur = a[w.id] ?? 0;
      const base = Math.ceil(cur / 360) * 360 + 360 * 5;
      return { ...a, [w.id]: base + (360 - (target + 0.5) * segAngle) };
    });
    // เสียงติ๊กวงล้อ: ถี่ตอนเริ่ม ช้าลงตอนใกล้หยุด
    let t = 0;
    for (let i = 0; i < 28; i++) { t += 60 + i * i * 0.35; const at = t; window.setTimeout(() => playGameSound('gacha_tick'), at); }
    timer.current = window.setTimeout(() => {
      setSpinning(null);
      onWallet(r.data.wallet);
      setResult(r.data);
      playGameSound(('rarity_' + best) as 'rarity_common');
    }, 3500);
  };

  const wheel = result ? WHEELS.find((w) => w.id === result.wheel) : null;

  return (
    <div className="px-3 pt-4 space-y-4">
      <p className="text-center text-xs text-slate-400">หมุนวงล้อเพื่อลุ้นของแต่งตัว — ของที่ได้ซ้ำจะคืนเหรียญ {DUPLICATE_REFUND_PCT}% ของราคา · เซ็ตพิเศษได้จากโค้ดเท่านั้น</p>

      {WHEELS.map((w) => {
        const th = THEME[w.id];
        const busy = spinning !== null;
        return (
          <section key={w.id} className={`rounded-3xl border-2 bg-gradient-to-b ${th.card} p-4 space-y-3`}>
            <div className="text-center">
              <h2 className="text-lg font-black">{th.icon} {w.nameTh}</h2>
              <p className="text-xs text-slate-300">{w.taglineTh}</p>
            </div>
            <Wheel w={w} angle={angles[w.id] ?? 0} spinning={spinning === w.id} />
            <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
              {(['common', 'rare', 'epic', 'legendary'] as Rarity[]).map((r) => {
                const total = Object.values(w.rates).reduce((s, v) => s + v, 0);
                return (
                  <div key={r} className="rounded-lg bg-black/30 py-1" style={{ color: RARITY_COLOR[r] }}>
                    {RARITY_TH[r]}<div className="text-white/90">{w.rates[r] === 0 ? '—' : `${((w.rates[r] / total) * 100).toFixed(w.rates[r] < 5 ? 1 : 0)}%`}</div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => void spin(w, 1)}
                disabled={busy || wallet.coins < w.cost}
                className={`min-h-14 rounded-xl bg-gradient-to-r ${th.btn} font-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-1.5`}
              >
                {spinning === w.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} หมุน ×1 · 🪙 {w.cost}
              </button>
              <button
                onClick={() => void spin(w, 10)}
                disabled={busy || wallet.coins < w.cost}
                className={`min-h-14 rounded-xl bg-gradient-to-r ${th.btn} font-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-1.5`}
              >
                หมุน ×10 · 🪙 {w.cost * 10}
              </button>
            </div>
            {wallet.coins < w.cost && <p className="text-center text-[11px] text-red-300">เหรียญไม่พอ — เล่นเกมเพื่อสะสมเหรียญ (เล่น +150 · ชนะ +200 · รอด +100)</p>}
          </section>
        );
      })}
      {error && <p role="alert" className="text-sm text-red-300 text-center">{error}</p>}

      {result && wheel && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm overflow-y-auto" role="dialog" aria-label="ผลกาชา">
          <div className="max-w-xl mx-auto p-4 space-y-3 min-h-full flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">{THEME[wheel.id].icon} ผลจาก{wheel.nameTh}</h2>
              <button onClick={() => setResult(null)} aria-label="ปิด" className="min-w-12 min-h-12 flex items-center justify-center cursor-pointer"><X className="w-6 h-6" /></button>
            </div>
            <div className={result.results.length === 1 ? 'max-w-[11rem] mx-auto w-full' : 'grid grid-cols-5 gap-1.5'}>
              {result.results.map((r, i) => <ResultCard key={i} r={r} draft={draft} big={result.results.length === 1} />)}
            </div>
            <p className="text-center text-xs text-slate-300">เหรียญคงเหลือ 🪙 {result.wallet.coins}</p>
            {result.results.length === 1 && !result.results[0].duplicate && (
              <button onClick={() => { onEquip(result.results[0].itemId); setResult(null); }} className="min-h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-black cursor-pointer">ใส่เลย</button>
            )}
            <button onClick={() => setResult(null)} className="min-h-12 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold cursor-pointer">ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
};
