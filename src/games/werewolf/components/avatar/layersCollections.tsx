// components/avatar/layersCollections.tsx — วาดคอลเลกชันธีม 13 ชุด (id col_<ธีม>_<ส่วน>) จากแม่แบบเดียว + สี/ลวดลายประจำธีม
import React from 'react';
import { COLLECTION_BY_ID } from '../../shared/collections';
import type { Collection, MotifKind } from '../../shared/collections';
import { Blink, Move, Pulse, heartPath, starPath } from './anim';
import type { Ctx } from './layersHead';

export const isColId = (id: string): boolean => id.startsWith('col_');
const parse = (id: string): { col: Collection; part: string } => {
  const [, colId, ...rest] = id.split('_');
  return { col: COLLECTION_BY_ID[colId] ?? COLLECTION_BY_ID.nin, part: rest.join('_') };
};
const TORSO = 'M6 125 C6 100 26 86 50 86 C74 86 94 100 94 125 Z';

// ================================================================ ลวดลายประจำธีม (วาดรอบจุด 0,0 ขนาดราว ±6)
const Motif: React.FC<{ kind: MotifKind; fill: string; line: string; accent: string }> = ({ kind, fill, line, accent }) => {
  switch (kind) {
    case 'shuriken':
      return <g><path d="M0 -6.4 L1.9 -1.9 L6.4 0 L1.9 1.9 L0 6.4 L-1.9 1.9 L-6.4 0 L-1.9 -1.9 Z" fill={fill} stroke={line} strokeWidth=".7" strokeLinejoin="round" /><circle r="1.3" fill={line} /></g>;
    case 'chip':
      return <g><rect x="-4" y="-4" width="8" height="8" rx="1.2" fill={fill} stroke={line} strokeWidth=".8" />{[-2.4, 0, 2.4].map((p) => <path key={p} d={`M${p} -4 V-6 M${p} 4 V6 M-4 ${p} H-6 M4 ${p} H6`} stroke={fill} strokeWidth=".9" />)}<rect x="-1.8" y="-1.8" width="3.6" height="3.6" fill={accent} /></g>;
    case 'pumpkin':
      return <g><path d="M0 -4.6 Q1 -6.4 2.6 -6.6" stroke="#4a7a2a" strokeWidth="1.2" fill="none" strokeLinecap="round" /><ellipse rx="6" ry="4.8" cy="1" fill={fill} stroke={line} strokeWidth=".7" /><path d="M0 -3.6 Q-2.6 1 0 5.6 M0 -3.6 Q2.6 1 0 5.6" stroke={line} strokeWidth=".5" fill="none" opacity=".6" /><path d="M-3 0 L-1.8 -1.6 L-.6 0 Z M3 0 L1.8 -1.6 L.6 0 Z M-2 3 L0 2 L2 3 L0 4 Z" fill={line} /></g>;
    case 'planet':
      return <g><circle r="3.8" fill={fill} stroke={line} strokeWidth=".7" /><ellipse rx="7" ry="2" fill="none" stroke={accent} strokeWidth="1.2" transform="rotate(-22)" /><path d="M-2 -1.4 Q0 -2.6 2.2 -1.2" stroke={line} strokeWidth=".6" fill="none" opacity=".5" /></g>;
    case 'anchor':
      return <g stroke={fill} strokeWidth="1.5" fill="none" strokeLinecap="round"><circle cy="-4.6" r="1.4" /><path d="M0 -3.2 V5 M-2.8 -1 H2.8 M-5 1.6 Q-4.6 5.4 0 5.6 Q4.6 5.4 5 1.6" /></g>;
    case 'candy':
      return <g><path d="M-3.6 0 L-7 -2.6 V2.6 Z M3.6 0 L7 -2.6 V2.6 Z" fill={accent} stroke={line} strokeWidth=".5" /><circle r="3.8" fill={fill} stroke={line} strokeWidth=".7" /><path d="M-2.6 -2 Q0 -3 2.6 -1.6 M-2.8 1.6 Q0 .4 2.8 2" stroke="#fff" strokeWidth="1" fill="none" opacity=".85" /></g>;
    case 'ankh':
      return <g stroke={fill} strokeWidth="1.6" fill="none" strokeLinecap="round"><ellipse cy="-3.8" rx="2.3" ry="2.8" /><path d="M0 -1 V6.4 M-3.4 1.2 H3.4" /></g>;
    case 'heartpx':
      return <g fill={fill} shapeRendering="crispEdges">{[[-4, -3], [-2, -3], [2, -3], [4, -3]].map(([x, y]) => <rect key={`${x}${y}`} x={x - 1} y={y - 1} width="2" height="2" />)}<rect x="-5" y="-1" width="10" height="2" /><rect x="-5" y="1" width="10" height="2" /><rect x="-3" y="3" width="6" height="2" /><rect x="-1" y="5" width="2" height="2" /></g>;
    case 'lotus':
      return <g fill={fill} stroke={line} strokeWidth=".5">{[-50, -25, 0, 25, 50].map((a) => <ellipse key={a} cy="-2.6" rx="1.7" ry="4.2" transform={`rotate(${a}) translate(0 4)`} />)}<circle cy="3.4" r="1.4" fill={accent} /></g>;
    case 'tree':
      return <g><path d="M0 -6.6 L4 -2 H1.8 L5 2 H2 L5.4 5.4 H-5.4 L-2 2 H-5 L-1.8 -2 H-4 Z" fill={fill} stroke={line} strokeWidth=".6" strokeLinejoin="round" /><rect x="-1" y="5.4" width="2" height="2" fill="#8a5a2b" /><g transform="translate(0 -7)"><path d={starPath(2.4)} fill={accent} /></g></g>;
    case 'starmoon':
      return <g><path d="M-1 -5.6 A5.6 5.6 0 1 0 4.6 3 A4.4 4.4 0 0 1 -1 -5.6 Z" fill={fill} stroke={line} strokeWidth=".6" /><g transform="translate(3.4 -3)"><path d={starPath(2.6)} fill={accent} /></g></g>;
    case 'bolt':
      return <path d="M1.4 -6.6 L-3.4 .8 H-.4 L-1.8 6.6 L3.6 -1.4 H.4 Z" fill={fill} stroke={line} strokeWidth=".7" strokeLinejoin="round" />;
    case 'heart':
      return <g><path d={heartPath(3.6)} fill={fill} stroke={line} strokeWidth=".7" strokeLinejoin="round" /><path d="M-3 -2 Q-2 -3.4 -0.6 -2.6" stroke="#fff" strokeWidth=".9" fill="none" strokeLinecap="round" opacity=".8" /></g>;
    case 'rose':
      return (
        <g>
          <path d="M0 3.6 V8" stroke="#2f8f4a" strokeWidth="1.2" strokeLinecap="round" /><path d="M0 6 Q3.4 4.4 4.6 6.4 Q2.2 7.6 0 6Z" fill="#43b05d" />
          <circle r="4.4" fill={fill} stroke={line} strokeWidth=".6" />
          <path d="M-2.6 .4 a2.6 2.6 0 0 1 5.2 0 a1.7 1.7 0 0 1 -3.4 0 a.9 .9 0 0 1 1.8 0" stroke={line} strokeWidth=".7" fill="none" strokeLinecap="round" />
        </g>
      );
    default: // sheriff
      return <g><path d={starPath(6.2).replace(/L/g, 'L')} fill={fill} stroke={line} strokeWidth=".6" /><path d="M0 -6 L1.2 -1.6 L5.6 -1.6 L2 1 L3.4 5.4 L0 2.8 L-3.4 5.4 L-2 1 L-5.6 -1.6 L-1.2 -1.6 Z" fill={fill} stroke={line} strokeWidth=".6" strokeLinejoin="round" /><circle r="1.4" fill={accent} /></g>;
  }
};

const Spark: React.FC<{ x: number; y: number; r?: number; fill: string; on: boolean; begin?: number }> = ({ x, y, r = 2.6, fill, on, begin = 0 }) => (
  <g transform={`translate(${x} ${y})`}><Pulse on={on} min={0.3} max={1} dur={1.7} begin={begin} twinkle><path d={starPath(r)} fill={fill} /></Pulse></g>
);

// ================================================================ เสื้อผ้า
export const ColOutfit: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const { col, part } = parse(id);
  const p = col.pal;
  const gid = `${c.uid}co${col.id}${part}`;
  const armor = part.endsWith('_b');
  return (
    <g>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={p.a} /><stop offset=".5" stopColor={p.b} /><stop offset="1" stopColor={p.c} /></linearGradient></defs>
      <path d={TORSO} fill={`url(#${gid})`} />
      {!armor ? (
        <g>
          <path d="M38 86 L50 108 L62 86" fill="none" stroke={p.d} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M18 125 L40 98 M82 125 L60 98" stroke={p.d} strokeWidth="1.6" opacity=".7" />
          <path d="M8 118 Q50 108 92 118" stroke={p.d} strokeWidth="2" fill="none" />
          <circle cx="50" cy="108" r="9" fill={p.c} stroke={p.d} strokeWidth="1.4" opacity=".92" />
          <g transform="translate(50 108) scale(1.35)"><Motif kind={col.motif} fill={p.d} line={p.c} accent={p.a} /></g>
        </g>
      ) : (
        <g>
          <ellipse cx="22" cy="95" rx="13" ry="8" fill={p.b} stroke={p.d} strokeWidth="1.6" /><ellipse cx="78" cy="95" rx="13" ry="8" fill={p.b} stroke={p.d} strokeWidth="1.6" />
          <path d="M16 94 H28 M72 94 H84" stroke={p.d} strokeWidth="1" />
          <path d="M34 90 H66 L62 112 H38 Z" fill={p.c} stroke={p.d} strokeWidth="1.4" strokeLinejoin="round" opacity=".92" />
          <g transform="translate(50 100) scale(1.1)"><Motif kind={col.motif} fill={p.d} line={p.c} accent={p.a} /></g>
          <rect x="6" y="116" width="88" height="6" fill={p.c} stroke={p.d} strokeWidth="1.2" /><rect x="44" y="114.5" width="12" height="9" rx="2" fill={p.d} stroke={p.c} strokeWidth="1" />
          {[14, 30, 70, 86].map((x) => <circle key={x} cx={x} cy="119" r="1.3" fill={p.d} />)}
        </g>
      )}
      <Spark x={22} y={104} fill={p.d} on={c.anim} /><Spark x={78} y={112} r={2.2} fill="#fff" on={c.anim} begin={0.9} />
    </g>
  );
};

// ================================================================ หมวก
export const ColHeadwear: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const { col, part } = parse(id);
  const p = col.pal;
  if (part.endsWith('_a')) {
    return (
      <g>
        <path d="M27 31 L27 15 L37 24 L44 8 L50 20 L56 8 L63 24 L73 15 L73 31 Z" fill={p.b} stroke={p.d} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M44 8 L46 22 M56 8 L54 22" stroke={p.a} strokeWidth=".9" opacity=".8" />
        <rect x="26" y="28" width="48" height="6" rx="2.4" fill={p.d} stroke={p.c} strokeWidth="1" />
        <g transform="translate(50 20) scale(1.15)"><Motif kind={col.motif} fill={p.d} line={p.c} accent={p.a} /></g>
        <Spark x={36} y={14} r={2.2} fill={p.a} on={c.anim} /><Spark x={65} y={12} r={2.6} fill="#fff" on={c.anim} begin={1} />
      </g>
    );
  }
  return (
    <g>
      <path d="M27 36 C27 14 73 14 73 36 Z" fill={p.b} stroke={p.c} strokeWidth="1.2" />
      <path d="M20 37 Q50 28 80 37 L84 41 Q50 52 16 41 Z" fill={p.c} stroke={p.d} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M32 22 Q50 16 68 22" stroke={p.a} strokeWidth="1" fill="none" opacity=".7" />
      <circle cx="50" cy="30" r="6.2" fill={p.c} stroke={p.d} strokeWidth="1.2" />
      <g transform="translate(50 30) scale(.9)"><Motif kind={col.motif} fill={p.d} line={p.c} accent={p.a} /></g>
    </g>
  );
};

// ================================================================ แว่น/หน้ากาก
export const ColEyewear: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const { col } = parse(id);
  const p = col.pal;
  return (
    <g>
      <path fillRule="evenodd" d="M26 47 Q50 40 74 47 L72 57 Q50 53 28 57 Z M33 49 Q38 46 44 49 Q40 54 33 52 Z M56 49 Q62 46 67 49 Q67 52 60 54 Q56 54 56 49 Z" fill={p.b} stroke={p.d} strokeWidth="1.5" strokeLinejoin="round" />
      <g transform="translate(50 45) scale(.7)"><Motif kind={col.motif} fill={p.d} line={p.c} accent={p.a} /></g>
      <Blink on={c.anim} dur={3}><path d="M30 48 L37 47 M63 47 L70 48" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".7" /></Blink>
    </g>
  );
};

// ================================================================ ของประดับ: ปีก (หลัง) / ของลอย (หน้า)
export const ColAccessoryBack: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const { col, part } = parse(id);
  if (part !== 'accessory_a') return null;
  const p = col.pal;
  const wing = (side: 1 | -1) => (
    <g transform={`translate(${side === 1 ? 74 : 26} 94) scale(${side} 1)`}>
      <Move on={c.anim} type="rotate" values="0 0 0;-7 0 0;0 0 0" dur={3.2}>
        {[0, 1, 2, 3].map((i) => <path key={i} d="M0 2 C14 -8 34 -16 46 -8 C38 4 20 10 0 8 Z" fill={[p.b, p.a, p.d, p.c][i]} stroke={p.c} strokeWidth=".8" opacity=".95" transform={`rotate(${-30 + i * 14} 0 4) scale(${1 - i * 0.12})`} />)}
      </Move>
    </g>
  );
  return <g>{wing(1)}{wing(-1)}</g>;
};

export const ColAccessoryFront: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const { col, part } = parse(id);
  if (part !== 'accessory_b') return null;
  const p = col.pal;
  return (
    <g transform="translate(82 78)">
      <Move on={c.anim} type="translate" values="0 0;0 -5;0 0" dur={2.6}>
        <circle r="10" fill={p.c} stroke={p.d} strokeWidth="1.4" opacity=".92" />
        <g transform="scale(1.5)"><Motif kind={col.motif} fill={p.d} line={p.c} accent={p.a} /></g>
        <Spark x={8} y={-9} r={2.4} fill="#fff" on={c.anim} />
      </Move>
    </g>
  );
};

// ================================================================ เอฟเฟกต์
export const ColEffectBack: React.FC<{ id: string; uid: string; anim: boolean }> = ({ id, uid, anim }) => {
  const { col } = parse(id);
  const p = col.pal;
  const gid = `${uid}ce${col.id}`;
  return (
    <g>
      <defs><radialGradient id={gid}><stop offset="0" stopColor={p.a} stopOpacity=".7" /><stop offset=".65" stopColor={p.b} stopOpacity=".3" /><stop offset="1" stopColor={p.b} stopOpacity="0" /></radialGradient></defs>
      <Pulse on={anim} min={0.92} max={1.06} dur={3}><g transform="translate(50 62)"><ellipse rx="52" ry="62" fill={`url(#${gid})`} /></g></Pulse>
      <g transform="translate(50 62)"><Move on={anim} type="rotate" from="0" to="360" dur={22}><ellipse rx="46" ry="56" fill="none" stroke={p.d} strokeWidth="1.1" strokeDasharray="3 6" opacity=".85" /></Move></g>
    </g>
  );
};

export const ColEffectFront: React.FC<{ id: string; uid: string; anim: boolean }> = ({ id, anim }) => {
  const { col } = parse(id);
  const p = col.pal;
  const bits: [number, number, number][] = [[10, 22, 0], [88, 30, 1.1], [16, 72, 2.2], [86, 80, 0.5], [30, 44, 1.7], [72, 18, 2.8], [8, 102, 3.3], [92, 106, 1.4]];
  return (
    <g>
      {bits.map(([x, y, b], i) => (
        <Move key={i} on={anim} type="translate" values={i % 2 ? '0 6;5 -12;0 6' : '0 0;-5 -10;0 0'} dur={4 + (i % 3)} begin={b}>
          <g transform={`translate(${x} ${y}) scale(${0.7 + (i % 3) * 0.2})`}><Motif kind={col.motif} fill={i % 2 ? p.d : p.a} line={p.c} accent={p.d} /></g>
        </Move>
      ))}
      {[[24, 12], [78, 8], [50, 4]].map(([x, y], i) => <Spark key={i} x={x} y={y} r={2.2} fill="#fff" on={anim} begin={i * 0.8} />)}
    </g>
  );
};

// ================================================================ ฉากหลัง
export const ColBackdrop: React.FC<{ id: string; uid: string; anim: boolean; night: boolean }> = ({ id, uid, anim, night }) => {
  const { col } = parse(id);
  const p = col.pal;
  const sky = `${uid}cs${col.id}`;
  const [t, b] = night ? [col.sky[2], col.sky[3]] : [col.sky[0], col.sky[1]];
  const stars: [number, number, number][] = [[12, 10, 1.2], [30, 24, 0.9], [50, 8, 1.4], [70, 16, 1], [88, 10, 1.2], [8, 40, 0.9], [92, 38, 1], [60, 30, .8]];
  return (
    <g>
      <defs><linearGradient id={sky} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={t} /><stop offset="1" stopColor={b} /></linearGradient></defs>
      <rect width="100" height="125" fill={`url(#${sky})`} />
      {(night || col.scene === 'space') && stars.map(([x, y, r], i) => <Blink key={i} on={anim} dur={2 + (i % 3)} begin={i * 0.4}><circle cx={x} cy={y} r={r} fill="#fff" /></Blink>)}
      {/* ลวดลายประจำธีมขนาดใหญ่เป็นดวงอาทิตย์/จันทร์ */}
      <g transform="translate(74 24) scale(3.4)" opacity={night ? 0.6 : 0.5}><Motif kind={col.motif} fill={p.d} line={p.c} accent={p.a} /></g>

      {col.scene === 'hills' && (
        <g>
          <path d="M-4 96 Q22 66 50 90 Q78 64 104 94 V125 H-4 Z" fill={night ? p.c : p.b} opacity=".85" />
          <path d="M-4 108 Q30 90 56 106 Q82 94 104 108 V125 H-4 Z" fill={night ? '#000' : p.c} opacity={night ? 0.5 : 0.7} />
          {[[16, 100], [84, 102], [60, 108]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><Move on={anim} type="translate" values="0 0;0 -2;0 0" dur={3 + i}><Motif kind={col.motif} fill={p.d} line={p.c} accent={p.a} /></Move></g>)}
        </g>
      )}
      {col.scene === 'city' && (
        <g>
          {[[2, 62, 16], [20, 48, 18], [40, 70, 14], [56, 42, 20], [78, 58, 18]].map(([x, y, w], i) => (
            <g key={i}><rect x={x} y={y} width={w} height={125 - y} fill={night ? p.c : p.b} stroke={p.d} strokeWidth=".6" opacity=".92" />
              {Array.from({ length: 6 }, (_, k) => <Blink key={k} on={anim && night} values=".3;1;.3" dur={2 + ((i + k) % 3)} begin={k * 0.3}><rect x={x + 3 + (k % 2) * 7} y={y + 6 + Math.floor(k / 2) * 9} width="3.6" height="4.4" fill={night ? p.d : p.a} opacity={night ? 1 : 0.7} /></Blink>)}
            </g>
          ))}
          <rect y="110" width="100" height="15" fill={night ? '#05030c' : p.c} opacity=".85" />
        </g>
      )}
      {col.scene === 'water' && (
        <g>
          <rect y="84" width="100" height="41" fill={night ? '#062a3a' : '#2aa7c9'} />
          {[0, 1, 2, 3].map((i) => <Move key={i} on={anim} type="translate" values={`0 0;${i % 2 ? -8 : 8} 0;0 0`} dur={4 + i}><path d={`M-10 ${92 + i * 8} q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0`} stroke={night ? '#38bdf8' : '#e6fbff'} strokeWidth="1.6" fill="none" opacity=".8" /></Move>)}
          <g transform="translate(40 66)"><Move on={anim} type="translate" values="0 0;0 -2;0 0" dur={3}><path d="M0 18 H30 L26 26 H4 Z" fill={p.c} stroke={p.d} strokeWidth="1" /><path d="M15 18 V-2" stroke={p.d} strokeWidth="1.6" /><path d="M15 -2 L28 10 H15 Z" fill={p.a} stroke={p.d} strokeWidth=".8" /></Move></g>
        </g>
      )}
      {col.scene === 'space' && (
        <g>
          {[[22, 40, 11, p.b], [68, 70, 7, p.d]].map(([x, y, r, f], i) => <Move key={i} on={anim} type="translate" values="0 0;3 -3;0 0" dur={5 + i}><g transform={`translate(${x} ${y})`}><circle r={r as number} fill={f as string} stroke="#fff" strokeWidth=".6" opacity=".95" /><ellipse rx={(r as number) * 1.7} ry={(r as number) * 0.4} fill="none" stroke={p.a} strokeWidth="1.2" transform="rotate(-20)" /></g></Move>)}
          <Move on={anim} type="translate" from="-10 8" to="120 -20" dur={5}><path d="M0 0 L12 -3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity=".9" /></Move>
          <ellipse cx="50" cy="124" rx="70" ry="14" fill={p.c} opacity=".9" />
        </g>
      )}
      {col.scene === 'desert' && (
        <g>
          <path d="M-4 100 Q24 82 52 98 Q80 84 104 100 V125 H-4 Z" fill={night ? p.c : p.a} />
          <path d="M-4 112 Q30 98 60 112 Q84 102 104 112 V125 H-4 Z" fill={night ? '#000' : p.b} opacity={night ? 0.55 : 0.8} />
          {col.id === 'egy'
            ? <g><path d="M14 100 L38 62 L62 100 Z" fill={night ? '#6b4a14' : p.b} stroke={p.d} strokeWidth="1" /><path d="M54 100 L72 74 L90 100 Z" fill={night ? '#5a3a10' : p.a} stroke={p.d} strokeWidth="1" /></g>
            : <g><path d="M70 106 V74 M70 90 H60 V80 M70 84 H80 V76" stroke={night ? '#1f4d2a' : '#3f8f4a'} strokeWidth="4" strokeLinecap="round" fill="none" /><path d="M14 104 V86 M14 94 H8" stroke={night ? '#1f4d2a' : '#3f8f4a'} strokeWidth="3" strokeLinecap="round" fill="none" /></g>}
        </g>
      )}
      {col.scene === 'love' && (
        <g>
          <path d="M-4 102 Q26 82 54 100 Q80 86 104 100 V125 H-4 Z" fill={night ? p.c : p.a} opacity=".95" />
          <path d="M-4 112 Q30 98 60 112 Q84 102 104 112 V125 H-4 Z" fill={night ? '#1d0620' : p.b} opacity={night ? 0.7 : 0.55} />
          {[[16, 108], [48, 112], [84, 110]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><Motif kind="rose" fill={p.b} line={p.c} accent={p.d} /></g>)}
          {[[18, 96, 0], [40, 90, 1.1], [62, 98, 2.2], [82, 88, 0.6], [30, 104, 1.7]].map(([x, y, b], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <Move on={anim} type="translate" values="0 4;3 -26;0 4" dur={4.5 + (i % 3)} begin={b as number} fade>
                <path d={heartPath(2.6 + (i % 2))} fill={i % 2 ? p.b : '#fff'} opacity=".9" />
              </Move>
            </g>
          ))}
        </g>
      )}
      {col.scene === 'candy' && (
        <g>
          <path d="M-4 100 Q24 84 52 98 Q80 86 104 100 V125 H-4 Z" fill={p.b} opacity=".9" /><path d="M-4 112 Q30 100 60 112 Q84 104 104 112 V125 H-4 Z" fill={p.a} />
          {[[18, 70, p.d], [46, 60, p.b], [76, 68, p.c]].map(([x, y, f], i) => <g key={i} transform={`translate(${x} ${y})`}><path d="M0 0 V34" stroke="#fff" strokeWidth="2" /><Move on={anim} type="rotate" values="-6 0 0;6 0 0;-6 0 0" dur={3 + i}><circle r="8" fill={f as string} stroke="#fff" strokeWidth="1.4" /><path d="M-6 0 Q0 -6 6 0 M-5 4 Q0 -2 5 4" stroke="#fff" strokeWidth="1.2" fill="none" /></Move></g>)}
        </g>
      )}
    </g>
  );
};

// ================================================================ หลุมศพ
export function colGraveBody(id: string, anim: boolean): { shape: React.ReactNode; plate: [number, number, number] } {
  const { col } = parse(id);
  const p = col.pal;
  return {
    plate: [50, 70, 10],
    shape: (
      <g>
        <path d="M24 108 V62 C24 36 76 36 76 62 V108 Z" fill={p.b} stroke={p.d} strokeWidth="2.2" />
        <path d="M24 108 V62 C24 36 76 36 76 62" fill="none" stroke={p.a} strokeWidth="2" opacity=".6" />
        <path d="M18 108 H82 V114 H18 Z" fill={p.c} stroke={p.d} strokeWidth="1.4" />
        <g transform="translate(50 44) scale(1.5)"><Move on={anim} type="translate" values="0 0;0 -1.4;0 0" dur={2.4}><Motif kind={col.motif} fill={p.d} line={p.c} accent={p.a} /></Move></g>
        {[[30, 98], [70, 98]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y}) scale(.7)`}><Motif kind={col.motif} fill={p.a} line={p.c} accent={p.d} /></g>)}
        <Spark x={30} y={52} r={2.4} fill="#fff" on={anim} /><Spark x={72} y={58} r={2} fill={p.d} on={anim} begin={1} />
      </g>
    ),
  };
}
