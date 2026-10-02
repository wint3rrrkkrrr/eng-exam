// components/avatar/layersSpecial.tsx — เซ็ตพิเศษแลกด้วยโค้ด 3 เซ็ต (WINTER · Nongfloat · Mos) ชิ้นละ 7 ช่อง
// ทุกชิ้นมี "ชื่อเจ้าของเซ็ต" อยู่บนตัวของ (ป้ายอก/ธง/ตัวอักษรลอย/ป้ายฉาก/จารึกหลุมศพ) และขยับได้ทั้งหมด
import React from 'react';
import { Blink, Move, Pulse, heartPath, starPath } from './anim';
import type { Ctx } from './layersHead';
import {
  RapAccessoryBack, RapAccessoryFront, RapBackdrop, RapEffectBack, RapEffectFront, RapEyewear, RapHeadwear, RapOutfit, isRapId, rapGraveBody,
} from './layersRap';

type SetKey = 'winter' | 'nongfloat' | 'mos' | 'khowfang';
const RB = ['#ff5d5d', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#9775fa']; // สายรุ้ง
interface Pal { name: string; len: number; a: string; b: string; c: string; d: string; glow: string; ink: string }

const PAL: Record<SetKey, Pal> = {
  winter: { name: 'WINTER', len: 26, a: '#d9f3ff', b: '#6db6ee', c: '#1d4f91', d: '#f6c945', glow: '#e6f7ff', ink: '#0b2a5c' },
  nongfloat: { name: 'Nongfloat', len: 34, a: '#ffe0f0', b: '#ff8cc6', c: '#e0449a', d: '#fff0a8', glow: '#ffd1ea', ink: '#9c1f6b' },
  mos: { name: 'Mos', len: 16, a: '#b6f23e', b: '#5c9a16', c: '#1b3306', d: '#5eead4', glow: '#a7f3d0', ink: '#e6ffd0' },
  khowfang: { name: 'KhowFang', len: 38, a: '#ff7fb0', b: '#ffd43b', c: '#4dabf7', d: '#ffffff', glow: '#ffffff', ink: '#5b2a86' },
};

/** เซ็ตพิเศษ (sp_) และคอลเลกชันแรปเปอร์ (rap_) — วาดในไฟล์นี้/layersRap แทนชั้นปกติ */
export const isSpecialId = (id: string): boolean => id.startsWith('sp_') || isRapId(id);
const setOf = (id: string): SetKey => (id.split('_')[1] as SetKey);

const TORSO = 'M6 125 C6 100 26 86 50 86 C74 86 94 100 94 125 Z';

/** ชื่อเจ้าของเซ็ต — ความกว้างคงที่ด้วย textLength ให้พอดีทุกฟอนต์ */
const Name: React.FC<{ set: SetKey; x: number; y: number; w?: number; size?: number; fill?: string; stroke?: string; anchor?: 'middle' | 'start' }> = ({ set, x, y, w, size = 6.2, fill, stroke, anchor = 'middle' }) => {
  const p = PAL[set];
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={900} fontFamily="system-ui, 'Segoe UI', sans-serif" letterSpacing=".4" textLength={w ?? p.len} lengthAdjust="spacingAndGlyphs"
      fill={fill ?? p.d} stroke={stroke ?? p.ink} strokeWidth=".5" paintOrder="stroke">{p.name}</text>
  );
};

const Sparkle: React.FC<{ x: number; y: number; r?: number; fill: string; on: boolean; begin?: number }> = ({ x, y, r = 3, fill, on, begin = 0 }) => (
  <g transform={`translate(${x} ${y})`}><Pulse on={on} min={0.3} max={1} dur={1.8} begin={begin} twinkle><path d={starPath(r)} fill={fill} /></Pulse></g>
);

// ================================================================ เสื้อผ้า
export const SpecialOutfit: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  if (isRapId(id)) return <RapOutfit id={id} c={c} />;
  const set = setOf(id);
  const p = PAL[set];
  const gid = `${c.uid}so${set}`;
  return (
    <g>
      <defs>
        {set === 'khowfang' ? (
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0.55" spreadMethod="reflect">
            {RB.map((col, i) => <stop key={col} offset={i / 5} stopColor={col} />)}
            {c.anim && <animateTransform attributeName="gradientTransform" type="translate" values="0 0;0.5 0;0 0" dur="6s" repeatCount="indefinite" />}
          </linearGradient>
        ) : (
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={p.a} /><stop offset=".55" stopColor={p.b} /><stop offset="1" stopColor={p.c} /></linearGradient>
        )}
      </defs>
      <path d={TORSO} fill={`url(#${gid})`} />
      {set === 'khowfang' && (
        <g>
          {[[16, 98, 8], [30, 92, 9], [70, 92, 9], [84, 98, 8], [50, 124, 11]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity=".78" />)}
          <path d="M8 114 Q50 96 92 114" stroke="#fff" strokeWidth="2.4" fill="none" opacity=".9" />
          {[[22, 104], [78, 104]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><path d={starPath(4)} fill="#fff" stroke="#ff7fb0" strokeWidth=".8" /></g>)}
        </g>
      )}
      {set === 'winter' && (
        <g>
          <path d="M6 112 L14 96 L18 108 L26 90 L32 104 L42 88 L50 100 L58 88 L68 104 L74 90 L82 108 L86 96 L94 112 L94 125 L6 125 Z" fill="#fff" opacity=".35" />
          <path d="M14 92 L8 80 L22 86 Z M86 92 L92 80 L78 86 Z M30 88 L28 78 L38 86 Z M70 88 L72 78 L62 86 Z" fill={p.a} stroke="#7fb8e6" strokeWidth=".8" strokeLinejoin="round" />
          <path d="M6 112 H94 M10 118 H90" stroke={p.d} strokeWidth="1.4" opacity=".9" />
        </g>
      )}
      {set === 'nongfloat' && (
        <g>
          {[[16, 100, 9], [30, 94, 10], [70, 94, 10], [84, 100, 9], [22, 112, 8], [78, 112, 8], [50, 120, 9]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={['#ffd1ea', '#ffb3da', '#ffe3f2'][i % 3]} opacity=".92" />
          ))}
          <path d="M14 108 Q26 98 34 110 M66 110 Q74 98 86 108" stroke="#ff4fa8" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {[[22, 92], [78, 92]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><path d={heartPath(4)} fill="#ff4fa8" stroke="#fff" strokeWidth=".8" /></g>)}
        </g>
      )}
      {set === 'mos' && (
        <g>
          {[[10, 108, 7], [22, 98, 8], [36, 92, 6], [64, 92, 6], [78, 98, 8], [90, 108, 7], [14, 120, 8], [86, 120, 8], [30, 122, 7], [70, 122, 7]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#6aa81b' : '#4d8710'} opacity=".95" />
          ))}
          {[[26, 112], [74, 114]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}><path d="M-3 0 Q0 -5 3 0 Z" fill="#fca5a5" /><rect x="-.9" y="0" width="1.8" height="3" fill="#fef3c7" /><circle cx="-1" cy="-1.6" r=".5" fill="#fff" /></g>
          ))}
        </g>
      )}
      {/* ป้ายชื่อกลางอก */}
      <rect x="28" y="103" width="44" height="14" rx="5" fill={set === 'nongfloat' ? 'rgba(255,240,248,.9)' : set === 'khowfang' ? 'rgba(60,20,110,.78)' : 'rgba(10,20,40,.62)'} stroke={set === 'nongfloat' ? '#ff4fa8' : set === 'khowfang' ? '#9775fa' : p.d} strokeWidth="1.4" />
      <Name set={set} x={50} y={113.4} w={set === 'mos' ? 18 : p.len + 6} size={7} fill={set === 'nongfloat' ? '#e0307f' : p.d} stroke={set === 'nongfloat' ? '#fff' : p.ink} />
      <Sparkle x={24} y={101} r={2.6} fill={p.d} on={c.anim} />
      <Sparkle x={76} y={106} r={2.2} fill="#fff" on={c.anim} begin={0.9} />
    </g>
  );
};

// ================================================================ หมวก/มงกุฎ
export const SpecialHeadwear: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  if (isRapId(id)) return <RapHeadwear id={id} c={c} />;
  const set = setOf(id);
  const p = PAL[set];
  if (set === 'winter') {
    return (
      <g>
        <path d="M27 30 L27 17 L36 25 L42 9 L50 21 L58 9 L64 25 L73 17 L73 30 Z" fill={p.a} stroke="#6db6ee" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M42 9 L46 22 M58 9 L54 22 M50 21 V30" stroke="#fff" strokeWidth=".9" opacity=".8" />
        <rect x="26" y="28" width="48" height="5" rx="2.2" fill={p.d} stroke="#b8860b" strokeWidth=".8" />
        <path d="M50 20 L54 26 L50 32 L46 26 Z" fill="#7dd3fc" stroke="#fff" strokeWidth=".8" />
        {[[34, 31], [66, 31]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" fill="#e0f2fe" stroke="#b8860b" strokeWidth=".5" />)}
        <Sparkle x={42} y={8} r={3} fill="#fff" on={c.anim} />
        <Sparkle x={58} y={8} r={2.4} fill={p.d} on={c.anim} begin={1} />
      </g>
    );
  }
  if (set === 'nongfloat') {
    return (
      <g>
        {[[34, 24, 8], [46, 19, 9], [58, 19, 9], [68, 24, 8]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={['#ffd1ea', '#ffe3f2', '#ffc2e3', '#ffd1ea'][i]} stroke="#ff9fcf" strokeWidth="1" />)}
        <rect x="28" y="24" width="44" height="7" rx="3.5" fill="#ffc2e3" stroke="#ff9fcf" strokeWidth="1" />
        <path d="M30 28 H70" stroke="#ff4fa8" strokeWidth="1.8" strokeLinecap="round" />
        {[[26, 8, '#ff8fb8', 0], [74, 4, '#ff5fb0', 0.8], [50, 2, '#ffb3da', 1.6]].map(([x, y, col, b], i) => (
          <Move key={i} on={c.anim} type="translate" values="0 0;0 -3;0 0" dur={2.4} begin={b as number}>
            <g transform={`translate(${x} ${y})`}>
              <path d={`M0 ${(i === 2 ? 14 : 20)} L${i === 0 ? 4 : i === 1 ? -4 : 0} 24`} stroke="#9aa3b8" strokeWidth=".6" fill="none" />
              <ellipse rx="4.6" ry="5.4" fill={col as string} /><path d="M-1.6 -2 Q-2.6 -3.4 -1 -4" stroke="#fff" strokeWidth=".8" fill="none" opacity=".8" />
            </g>
          </Move>
        ))}
        <Sparkle x={46} y={14} r={2.4} fill={p.d} on={c.anim} />
      </g>
    );
  }
  if (set === 'khowfang') {
    return (
      <g>
        {RB.map((col, i) => <path key={col} d={`M${27 - i * 0.2} 31 A${23 + i * 0.1} ${22 - i * 1.5} 0 0 1 ${73 + i * 0.2} 31`} stroke={col} strokeWidth="3.2" fill="none" transform={`translate(0 ${-i * 1.5})`} />)}
        {[[24, 30], [76, 30]].map(([x, y], i) => <g key={i}>{[[0, 0, 5], [5, -2, 5.5], [-4, 1, 4]].map(([dx, dy, r], j) => <circle key={j} cx={x + dx} cy={y + dy} r={r} fill="#fff" stroke="#ffd1ea" strokeWidth=".8" />)}</g>)}
        <g transform="translate(50 6)"><Pulse on={c.anim} min={0.85} max={1.15} dur={1.6}><path d={starPath(6)} fill="#ffe066" stroke="#ff9f1c" strokeWidth=".8" /></Pulse></g>
        <Sparkle x={34} y={8} r={2.4} fill="#ff7fb0" on={c.anim} />
        <Sparkle x={68} y={10} r={2.2} fill="#4dabf7" on={c.anim} begin={0.9} />
      </g>
    );
  }
  return (
    <g>
      <path d="M30 28 Q28 16 22 10 M30 22 Q24 20 20 22 M70 28 Q72 16 78 10 M70 22 Q76 20 80 22 M42 24 Q40 12 44 4 M58 24 Q60 12 56 4" stroke="#5a3a1a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {[[22, 10], [20, 22], [78, 10], [80, 22], [44, 4], [56, 4]].map(([x, y], i) => (
        <path key={i} d="M0 0 Q4 -5 8 0 Q4 4 0 0 Z" fill={i % 2 ? '#84cc16' : '#4d8710'} transform={`translate(${x - 4} ${y}) rotate(${i % 2 ? 30 : -30})`} />
      ))}
      <path d="M28 30 Q50 22 72 30 Q72 33 50 31 Q28 33 28 30 Z" fill="#4d8710" />
      {[[38, 25, 5], [62, 25, 4]].map(([x, y, r], i) => (
        <g key={i}>
          <Blink on={c.anim} dur={2.2 + i} begin={i}><circle cx={x} cy={y - 2} r={r + 3} fill={p.d} opacity=".35" /></Blink>
          <path d={`M${x - r} ${y} Q${x} ${y - r * 1.6} ${x + r} ${y} Z`} fill="#fda4af" /><rect x={x - 1} y={y} width="2" height="3.4" rx=".8" fill="#fef3c7" />
          <circle cx={x - r * 0.3} cy={y - r * 0.6} r=".9" fill="#fff" />
        </g>
      ))}
    </g>
  );
};

// ================================================================ แว่น/หน้ากาก
export const SpecialEyewear: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  if (isRapId(id)) return <RapEyewear id={id} c={c} />;
  const set = setOf(id);
  const p = PAL[set];
  if (set === 'winter') {
    return (
      <g>
        <path d="M30 46 L37 42 L44 46 L44 54 L37 58 L30 54 Z M56 46 L63 42 L70 46 L70 54 L63 58 L56 54 Z" fill="rgba(125,211,252,.45)" stroke={p.d} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M44 49 H56" stroke={p.d} strokeWidth="1.6" /><path d="M32 47 L36 45 M58 47 L62 45" stroke="#fff" strokeWidth="1" opacity=".9" />
        <Sparkle x={69} y={43} r={2.4} fill="#fff" on={c.anim} />
      </g>
    );
  }
  if (set === 'nongfloat') {
    return (
      <g>
        <g transform="translate(38 50)"><path d={heartPath(7)} fill="rgba(255,182,224,.6)" stroke="#ff5fb0" strokeWidth="1.6" strokeLinejoin="round" /></g>
        <g transform="translate(62 50)"><path d={heartPath(7)} fill="rgba(255,150,205,.55)" stroke="#ff3d9a" strokeWidth="1.6" strokeLinejoin="round" /></g>
        <path d="M45 49 H55" stroke={p.d} strokeWidth="1.6" />
        <Blink on={c.anim} dur={2.6}><path d="M32 44 L35 41 M66 44 L69 41" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" /></Blink>
      </g>
    );
  }
  if (set === 'khowfang') {
    return (
      <g>
        <g transform="translate(38 50)"><path d={starPath(9)} fill="rgba(255,255,255,.4)" stroke="#ff5d8f" strokeWidth="1.8" strokeLinejoin="round" /></g>
        <g transform="translate(62 50)"><path d={starPath(9)} fill="rgba(255,255,255,.4)" stroke="#4dabf7" strokeWidth="1.8" strokeLinejoin="round" /></g>
        <path d="M45 50 H55" stroke="#ffd43b" strokeWidth="1.8" /><path d="M29 49 L24 47 M71 49 L76 47" stroke="#69db7c" strokeWidth="1.6" strokeLinecap="round" />
        <Sparkle x={70} y={42} r={2.4} fill="#fff" on={c.anim} />
      </g>
    );
  }
  return (
    <g>
      <path d="M28 52 Q30 40 46 46 Q46 56 36 58 Q30 58 28 52 Z M72 52 Q70 40 54 46 Q54 56 64 58 Q70 58 72 52 Z" fill="#4d8710" stroke="#2e5a0a" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M31 51 Q38 47 44 49 M69 51 Q62 47 56 49" stroke="#b6f23e" strokeWidth=".9" fill="none" />
      <circle cx="36" cy="52" r="1.6" fill={p.d} /><circle cx="64" cy="52" r="1.6" fill={p.d} />
      <Blink on={c.anim} dur={2.4}><circle cx="36" cy="52" r="3" fill={p.d} opacity=".4" /><circle cx="64" cy="52" r="3" fill={p.d} opacity=".4" /></Blink>
    </g>
  );
};

// ================================================================ ของประดับ: ปีก (หลัง) + ธงชื่อ (หน้า)
export const SpecialAccessoryBack: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  if (isRapId(id)) return <RapAccessoryBack id={id} c={c} />;
  const set = setOf(id);
  const p = PAL[set];
  const wing = (side: 1 | -1) => (
    <g transform={`translate(${side === 1 ? 74 : 26} 92) scale(${side} 1)`}>
      <Move on={c.anim} type="rotate" values="0 0 0;-6 0 0;0 0 0" dur={3}>
        {set === 'winter' && <path d="M0 0 L26 -40 L22 -12 L40 -30 L28 0 L44 -8 L24 14 L30 20 L0 12 Z" fill={p.a} stroke="#6db6ee" strokeWidth="1.2" strokeLinejoin="round" opacity=".95" />}
        {set === 'nongfloat' && <g><path d="M0 0 C16 -44 44 -40 36 -12 C34 0 14 8 0 6 Z" fill="#ff9ccd" stroke="#fff" strokeWidth="1.4" /><path d="M2 8 C14 8 30 14 26 28 C20 34 6 24 2 8 Z" fill="#ffc2e3" stroke="#fff" strokeWidth="1.2" /><circle cx="22" cy="-16" r="4.2" fill="#ffe3f2" /><circle cx="16" cy="18" r="2.6" fill="#fff" /><path d="M6 -4 Q18 -20 30 -14" stroke="#ff4fa8" strokeWidth=".9" fill="none" /></g>}
        {set === 'khowfang' && <g>{RB.map((col, i) => <path key={col} d="M0 2 C12 -10 34 -22 46 -14 C40 2 20 8 0 6 Z" fill={col} stroke="#fff" strokeWidth=".8" opacity=".95" transform={`rotate(${-26 + i * 9} 0 4) scale(${1 - i * 0.07})`} />)}</g>}
        {set === 'mos' && <g><path d="M0 0 C10 -34 36 -44 42 -30 C40 -10 20 4 0 4 Z" fill="#5c9a16" stroke="#2e5a0a" strokeWidth="1.2" /><path d="M2 2 C16 -12 28 -24 38 -30 M10 -6 L18 -2 M16 -14 L26 -8" stroke="#b6f23e" strokeWidth=".9" fill="none" /><path d="M2 8 C14 8 28 14 24 26 C16 28 6 20 2 8 Z" fill="#4d8710" stroke="#2e5a0a" strokeWidth="1" /></g>}
      </Move>
    </g>
  );
  return <g>{wing(1)}{wing(-1)}</g>;
};

export const SpecialAccessoryFront: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  if (isRapId(id)) return <RapAccessoryFront id={id} c={c} />;
  const set = setOf(id);
  const p = PAL[set];
  const fw = set === 'mos' ? 22 : set === 'winter' ? 30 : 38;
  return (
    <g transform="translate(78 66)">
      <Move on={c.anim} type="rotate" values="-3 0 40;3 0 40;-3 0 40" dur={3.2}>
        <path d="M0 0 V50" stroke="#a97c3b" strokeWidth="2" strokeLinecap="round" /><circle cx="0" cy="-1" r="2.2" fill={p.d} />
        {set === 'khowfang' && RB.map((col, i) => <rect key={col} x="1" y={3 + i * 2.34} width={fw - 1} height="2.4" fill={col} />)}
        <path d={`M1 3 H${fw} L${fw - 5} 10 L${fw} 17 H1 Z`} fill={set === 'khowfang' ? 'none' : set === 'nongfloat' ? '#ffd6ec' : set === 'winter' ? '#2a62ad' : '#2e5a0a'} stroke={set === 'nongfloat' ? '#ff4fa8' : set === 'khowfang' ? '#fff' : p.d} strokeWidth="1.2" strokeLinejoin="round" />
        <Name set={set} x={1 + (fw - 5) / 2} y={13.2} w={fw - 12} size={6} fill={set === 'nongfloat' ? '#d6247a' : p.d} stroke={set === 'nongfloat' ? '#fff' : p.ink} />
      </Move>
    </g>
  );
};

// ================================================================ เอฟเฟกต์
export const SpecialEffectBack: React.FC<{ id: string; uid: string; anim: boolean }> = ({ id, uid, anim }) => {
  if (isRapId(id)) return <RapEffectBack id={id} uid={uid} anim={anim} />;
  const set = setOf(id);
  const p = PAL[set];
  const gid = `${uid}sg${set}`;
  return (
    <g>
      <defs><radialGradient id={gid}><stop offset="0" stopColor={p.glow} stopOpacity=".85" /><stop offset=".6" stopColor={p.b} stopOpacity=".35" /><stop offset="1" stopColor={p.b} stopOpacity="0" /></radialGradient></defs>
      <Pulse on={anim} min={0.92} max={1.06} dur={3}><g transform="translate(50 62)"><ellipse rx="52" ry="62" fill={`url(#${gid})`} /></g></Pulse>
      <g transform="translate(50 62)">
        <Move on={anim} type="rotate" from="0" to="360" dur={set === 'khowfang' ? 14 : 26}>
          {set === 'khowfang'
            ? RB.map((col, i) => <ellipse key={col} rx={42 + i * 2.2} ry={52 + i * 2.2} fill="none" stroke={col} strokeWidth="1.6" strokeDasharray={`${14 - i} ${5 + i * 2}`} opacity=".85" />)
            : <ellipse rx="46" ry="56" fill="none" stroke={p.d} strokeWidth="1" strokeDasharray="3 6" opacity=".8" />}
        </Move>
      </g>
    </g>
  );
};

export const SpecialEffectFront: React.FC<{ id: string; uid: string; anim: boolean }> = ({ id, uid, anim }) => {
  if (isRapId(id)) return <RapEffectFront id={id} uid={uid} anim={anim} />;
  const set = setOf(id);
  const p = PAL[set];
  const bits: [number, number, number][] = [[10, 20, 0], [88, 30, 1.1], [18, 70, 2.2], [84, 78, 0.5], [30, 40, 1.7], [70, 18, 2.8], [6, 100, 3.3], [94, 104, 1.4]];
  return (
    <g>
      {bits.map(([x, y, b], i) => (
        <Move key={i} on={anim} type="translate" values={set === 'winter' ? '0 -10;4 18;0 -10' : set === 'nongfloat' ? '0 14;0 -16;0 14' : '0 0;6 -8;-4 -14;0 0'} dur={4 + (i % 3)} begin={b}>
          <g transform={`translate(${x} ${y})`}>
            {set === 'winter' && <g stroke="#fff" strokeWidth="1" strokeLinecap="round"><path d="M0 -3 V3 M-2.6 -1.5 L2.6 1.5 M-2.6 1.5 L2.6 -1.5" /></g>}
            {set === 'nongfloat' && (i % 2 ? <path d={heartPath(2.8)} fill={i % 4 === 1 ? '#ff5fb0' : '#ff9ccd'} /> : <g><ellipse rx="3" ry="3.6" fill={i % 4 ? '#ff7fc0' : '#ffc2e3'} /><path d="M0 3.6 L0 8" stroke="#d99" strokeWidth=".5" /></g>)}
            {set === 'mos' && <g><circle r="3.4" fill={p.d} opacity=".28" /><circle r="1.3" fill="#fff" /></g>}
            {set === 'khowfang' && (i % 2 ? <path d={heartPath(2.6)} fill={RB[i % 6]} /> : <path d={starPath(3.4)} fill={RB[i % 6]} />)}
          </g>
        </Move>
      ))}
      {/* ชื่อลอยขึ้นแล้วจางหาย */}
      <Move on={anim} type="translate" values="0 10;0 -14" dur={4.2} fade>
        <Name set={set} x={22} y={62} w={set === 'mos' ? 16 : p.len} size={6.4} />
      </Move>
      {!anim && <Name set={set} x={22} y={56} w={set === 'mos' ? 16 : p.len} size={6.4} />}
    </g>
  );
};

// ================================================================ ฉากหลัง (กลางวัน/กลางคืน)
const Snow: React.FC<{ on: boolean; fill?: string; n?: number }> = ({ on, fill = '#fff', n = 14 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <Move key={i} on={on} type="translate" from={`0 -8`} to={`${(i % 2 ? 6 : -6)} 130`} dur={5 + (i % 4)} begin={i * 0.7}>
        <circle cx={(i * 37) % 100} cy={0} r={0.8 + (i % 3) * 0.5} fill={fill} opacity=".9" />
      </Move>
    ))}
  </g>
);

export const SpecialBackdrop: React.FC<{ id: string; uid: string; anim: boolean; night: boolean }> = ({ id, uid, anim, night }) => {
  if (isRapId(id)) return <RapBackdrop id={id} uid={uid} anim={anim} night={night} />;
  const set = setOf(id);
  const p = PAL[set];
  const sky = `${uid}sk${set}`;
  const stars: [number, number, number][] = [[12, 10, 1.2], [30, 24, 0.9], [50, 8, 1.4], [70, 16, 1], [88, 10, 1.2], [8, 40, 0.9], [92, 38, 1]];
  const palette = {
    winter: night ? ['#071433', '#24508f'] : ['#bfe6ff', '#f2fbff'],
    nongfloat: night ? ['#3a0c3e', '#d1479d'] : ['#ffb0d8', '#ffeaf5'],
    mos: night ? ['#04120a', '#0e3b2a'] : ['#b8e07a', '#e9f7c6'],
    khowfang: night ? ['#1b0f3b', '#6a2f9c'] : ['#9ad4ff', '#fff4c9'],
  }[set];
  return (
    <g>
      <defs><linearGradient id={sky} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={palette[0]} /><stop offset="1" stopColor={palette[1]} /></linearGradient></defs>
      <rect width="100" height="125" fill={`url(#${sky})`} />
      {night && stars.map(([x, y, r], i) => <Blink key={i} on={anim} dur={2 + (i % 3)} begin={i * 0.4}><circle cx={x} cy={y} r={r} fill="#fff" /></Blink>)}
      {night ? <circle cx="78" cy="22" r="9" fill="#fffbe0" opacity=".95" /> : <circle cx="80" cy="20" r="9" fill="#fff6b0" opacity=".9" />}

      {set === 'winter' && (
        <g>
          {night && [0, 1, 2].map((i) => (
            <Blink key={i} on={anim} values=".25;.7;.25" dur={5 + i} begin={i * 1.2}>
              <path d={`M0 ${30 + i * 8} Q30 ${10 + i * 8} 60 ${30 + i * 8} T100 ${24 + i * 8} V${40 + i * 8} Q70 ${26 + i * 8} 40 ${42 + i * 8} T0 ${44 + i * 8} Z`} fill={['#5eead4', '#a78bfa', '#7dd3fc'][i]} opacity=".5" />
            </Blink>
          ))}
          <g opacity={night ? 0.92 : 1}>
            <path d="M8 96 V58 L16 40 L24 58 V96 Z M34 96 V48 L44 22 L54 48 V96 Z M66 96 V54 L74 34 L82 54 V96 Z" fill={night ? '#6d9bd6' : '#e6f6ff'} stroke="#8fc3ee" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M44 22 V12 M16 40 V33 M74 34 V27" stroke={p.d} strokeWidth="1.6" />{[[44, 11], [16, 32], [74, 26]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" fill={p.d} />)}
            <path d="M38 96 V80 Q44 72 50 80 V96 Z" fill={night ? '#fff2a6' : '#7dd3fc'} opacity={night ? 0.95 : 0.8} />
          </g>
          <ellipse cx="50" cy="118" rx="70" ry="20" fill="#fff" /><ellipse cx="14" cy="112" rx="30" ry="12" fill="#eaf6ff" />
          <Snow on={anim} />
        </g>
      )}
      {set === 'nongfloat' && (
        <g>
          {[[18, 36, 1], [74, 52, 0.9], [44, 18, 0.7]].map(([x, y, s], i) => (
            <Move key={i} on={anim} type="translate" values="0 0;0 -3;0 0" dur={4 + i} begin={i}>
              <g transform={`translate(${x} ${y}) scale(${s})`}>
                {[[0, 0, 11], [11, -3, 12], [24, 0, 10], [12, 5, 14]].map(([cx, cy, r], j) => <circle key={j} cx={cx} cy={cy} r={r} fill={night ? '#f5b8dc' : j % 2 ? '#ffe0f0' : '#ffc9e6'} opacity=".96" />)}
              </g>
            </Move>
          ))}
          <Move on={anim} type="translate" values="0 0;0 -3;0 0" dur={5}>
            <g transform="translate(26 82)"><ellipse cx="22" cy="12" rx="26" ry="8" fill="#ff9fcf" /><path d="M0 14 Q22 38 44 14 Z" fill="#d97bb0" /><rect x="14" y="-2" width="14" height="14" fill="#fff0f7" stroke="#ff9fcf" /><path d="M12 -2 L21 -10 L30 -2 Z" fill="#ff4fa8" /></g>
          </Move>
          {[[10, 100, '#ff8fb8'], [86, 96, '#ff5fb0'], [60, 108, '#ffb3da'], [30, 112, '#ff7fc0'], [74, 112, '#ffc2e3']].map(([x, y, col], i) => (
            <Move key={i} on={anim} type="translate" from="0 20" to="0 -150" dur={9 + i * 2} begin={i * 2.3}>
              <g transform={`translate(${x} ${y})`}><ellipse rx="5" ry="6" fill={col as string} /><path d="M0 6 Q2 12 0 18" stroke="#9aa3b8" strokeWidth=".6" fill="none" /></g>
            </Move>
          ))}
        </g>
      )}
      {set === 'khowfang' && (
        <g>
          {RB.map((col, i) => (
            <Blink key={col} on={anim && night} values=".55;1;.55" dur={3 + i * 0.3} begin={i * 0.4}>
              <path d={`M${-4 + i * 0.4} 112 A${54 - i * 5.2} ${64 - i * 6} 0 0 1 ${104 - i * 0.4} 112`} stroke={col} strokeWidth="5.4" fill="none" opacity={night ? 0.85 : 0.92} />
            </Blink>
          ))}
          {[[8, 112, 10], [20, 114, 12], [82, 114, 12], [94, 112, 10], [50, 120, 12]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={night ? '#e8d4ff' : '#fff'} opacity=".95" />)}
          {[[18, 70], [84, 62], [50, 36], [28, 96], [74, 92]].map(([x, y], i) => <Sparkle key={i} x={x} y={y} r={2.6} fill={RB[i % 6]} on={anim} begin={i * 0.5} />)}
        </g>
      )}
      {set === 'mos' && (
        <g>
          {!night && [20, 50, 76].map((x, i) => <path key={i} d={`M${x} 0 L${x + 14} 125 L${x - 8} 125 Z`} fill="#fffbd0" opacity=".16" />)}
          {[[8, 20], [38, 14], [66, 24], [92, 10]].map(([x, w], i) => (
            <g key={i}><rect x={x - w / 4} y={30 + (i % 2) * 6} width={w / 2} height="100" rx="4" fill={night ? '#0a2a18' : '#4b7a24'} /><path d={`M${x - w / 4} 60 Q${x} 54 ${x + w / 4} 60`} stroke={night ? '#1e5a2a' : '#8bc34a'} strokeWidth="3" fill="none" /></g>
          ))}
          <ellipse cx="50" cy="122" rx="70" ry="16" fill={night ? '#0e3b1d' : '#5c9a16'} />
          {[[16, 104, 9], [40, 110, 6], [64, 106, 8], [86, 108, 7]].map(([x, y, r], i) => (
            <g key={i}>
              {night && <Blink on={anim} dur={2.6 + (i % 2)} begin={i}><circle cx={x} cy={y - r * 0.4} r={r + 6} fill={p.d} opacity=".28" /></Blink>}
              <path d={`M${x - r} ${y} Q${x} ${y - r * 1.5} ${x + r} ${y} Z`} fill={i % 2 ? '#fda4af' : '#7dd3fc'} /><rect x={x - 1.2} y={y} width="2.4" height="5" rx="1" fill="#fef3c7" />
            </g>
          ))}
          {night && [[20, 60], [60, 40], [80, 80], [40, 90]].map(([x, y], i) => (
            <Move key={i} on={anim} type="translate" values="0 0;8 -10;-6 -4;0 0" dur={6 + i} begin={i * 1.3}>
              <g><circle cx={x} cy={y} r="3.4" fill="#fde047" opacity=".3" /><circle cx={x} cy={y} r="1.2" fill="#fef9c3" /></g>
            </Move>
          ))}
        </g>
      )}

      {/* ป้ายชื่อเจ้าของฉาก */}
      <g transform="translate(50 8)">
        <rect x={-(p.len + 10) / 2} y="-7" width={p.len + 10} height="12" rx="4" fill={night ? 'rgba(5,10,30,.65)' : 'rgba(255,255,255,.72)'} stroke={p.d} strokeWidth="1.2" />
        <Name set={set} x={0} y={2.4} w={p.len} size={6.4} fill={night ? p.d : set === 'nongfloat' ? '#d6247a' : p.c} stroke={night ? p.ink : '#fff'} />
      </g>
    </g>
  );
};

// ================================================================ หลุมศพ
export function specialGraveBody(id: string, anim: boolean): { shape: React.ReactNode; plate: [number, number, number] } {
  if (isRapId(id)) return rapGraveBody(id, anim);
  const set = setOf(id);
  const p = PAL[set];
  if (set === 'winter') {
    return {
      plate: [50, 62, 10],
      shape: (
        <g>
          <path d="M50 20 L74 44 L70 108 H30 L26 44 Z" fill="#cfeeff" stroke="#6db6ee" strokeWidth="2" strokeLinejoin="round" />
          <path d="M50 20 L58 44 L54 108 M50 20 L42 44 L46 108" stroke="#fff" strokeWidth="1.2" opacity=".8" fill="none" />
          <rect x="22" y="100" width="56" height="9" rx="2" fill={p.d} stroke="#b8860b" strokeWidth="1.2" />
          <Name set="winter" x={50} y={92} w={32} size={8} fill="#1d4f91" stroke="#fff" />
          <Sparkle x={72} y={34} r={3.4} fill="#fff" on={anim} />
          <Sparkle x={28} y={60} r={2.6} fill={p.d} on={anim} begin={1.2} />
        </g>
      ),
    };
  }
  if (set === 'nongfloat') {
    return {
      plate: [50, 66, 10],
      shape: (
        <g>
          <path d="M18 58 A34 34 0 0 1 82 58" stroke="#ff4fa8" strokeWidth="3" fill="none" /><path d="M22 58 A30 30 0 0 1 78 58" stroke="#ff8fc8" strokeWidth="3" fill="none" /><path d="M26 58 A26 26 0 0 1 74 58" stroke="#ffc2e3" strokeWidth="3" fill="none" />
          {[[24, 86, 14], [42, 78, 17], [62, 80, 16], [78, 88, 13], [50, 96, 16]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={['#ffd6ec', '#ffe6f3', '#ffc2e3'][i % 3]} stroke="#ff9fcf" strokeWidth="1.4" />)}
          <Name set="nongfloat" x={50} y={96} w={36} size={7.4} fill="#d6247a" stroke="#fff" />
          {[[16, 42], [86, 46]].map(([x, y], i) => <Move key={i} on={anim} type="translate" values="0 0;0 -4;0 0" dur={3 + i} begin={i}><g transform={`translate(${x} ${y})`}><path d={heartPath(4)} fill="#ff4fa8" /></g></Move>)}
        </g>
      ),
    };
  }
  if (set === 'khowfang') {
    return {
      plate: [50, 70, 10],
      shape: (
        <g>
          {RB.map((col, i) => <path key={col} d={`M${16 + i * 3.4} 108 V${64 - i * 1.2} A${34 - i * 3.4} ${30 - i * 3} 0 0 1 ${84 - i * 3.4} ${64 - i * 1.2} V108`} stroke={col} strokeWidth="3.4" fill="none" />)}
          <path d="M38 108 V66 C38 52 62 52 62 66 V108 Z" fill="#f4eefc" stroke="#c9b6ea" strokeWidth="1.6" />
          {[[22, 108, 8], [78, 108, 8]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" stroke="#ffd1ea" strokeWidth="1" />)}
          <Name set="khowfang" x={50} y={99} w={26} size={7} fill="#7b3fc4" stroke="#fff" />
          <Sparkle x={26} y={50} r={3} fill="#ff7fb0" on={anim} />
          <Sparkle x={76} y={44} r={2.6} fill="#4dabf7" on={anim} begin={1} />
        </g>
      ),
    };
  }
  return {
    plate: [50, 68, 10],
    shape: (
      <g>
        <path d="M26 108 V62 C26 40 74 40 74 62 V108 Z" fill="#7c8a72" stroke="#3a4a30" strokeWidth="2" />
        <path d="M26 74 Q38 62 50 70 Q62 62 74 74 V62 C74 40 26 40 26 62 Z" fill="#5c9a16" /><path d="M26 108 Q38 96 50 102 Q62 96 74 108 Z" fill="#4d8710" />
        {[[30, 96, 6], [70, 98, 7]].map(([x, y, r], i) => (
          <g key={i}><Blink on={anim} dur={2.4} begin={i}><circle cx={x} cy={y - 2} r={r + 5} fill={p.d} opacity=".3" /></Blink><path d={`M${x - r} ${y} Q${x} ${y - r * 1.6} ${x + r} ${y} Z`} fill={i ? '#fda4af' : '#7dd3fc'} /><rect x={x - 1} y={y} width="2" height="4" fill="#fef3c7" /></g>
        ))}
        <path d="M30 50 Q22 62 28 76 M70 52 Q80 64 72 80" stroke="#84cc16" strokeWidth="2" fill="none" strokeLinecap="round" />
        <Name set="mos" x={50} y={92} w={22} size={8.4} fill="#e6ffd0" stroke="#1b3306" />
      </g>
    ),
  };
}
