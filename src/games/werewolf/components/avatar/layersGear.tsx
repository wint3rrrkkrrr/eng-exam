// components/avatar/layersGear.tsx — แว่น/หน้ากาก และ หมวก (ชั้นบนสุดของใบหน้า)
import React from 'react';
import { INK } from './colors';
import { Blink, Move, Pulse, starPath } from './anim';
import type { Ctx } from './layersHead';

// ================================================================ แว่น/หน้ากาก
export const Eyewear: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const frame = { stroke: INK, strokeWidth: 1.8, fill: 'rgba(200,235,255,.22)' };
  const arms = <path d="M33.4 49 L29 47 M66.6 49 L71 47" stroke={INK} strokeWidth="1.6" />;
  switch (id) {
    case 'ew_round':
      return <g><circle cx="41" cy="50" r="7.6" {...frame} /><circle cx="59" cy="50" r="7.6" {...frame} /><path d="M48.6 49 Q50 47.6 51.4 49" stroke={INK} strokeWidth="1.6" fill="none" />{arms}</g>;
    case 'ew_square':
      return <g><rect x="33" y="44" width="16" height="12" rx="2.5" {...frame} /><rect x="51" y="44" width="16" height="12" rx="2.5" {...frame} /><path d="M49 49 H51" stroke={INK} strokeWidth="1.8" /><path d="M33 48 L29 46 M67 48 L71 46" stroke={INK} strokeWidth="1.6" /></g>;
    case 'ew_tape':
      return (
        <g>
          <rect x="33" y="44" width="16" height="12" rx="2.5" {...frame} /><rect x="51" y="44" width="16" height="12" rx="2.5" {...frame} /><path d="M49 49 H51" stroke={INK} strokeWidth="1.8" />
          <rect x="46" y="45" width="8" height="6" rx="1" fill="#f4f1e8" stroke="#bdb59b" strokeWidth=".6" transform="rotate(-8 50 48)" />
          <path d="M33 48 L29 46 M67 48 L71 46" stroke={INK} strokeWidth="1.6" />
        </g>
      );
    case 'ew_sunglasses':
      return (
        <g>
          <path d="M32 45 H49 V52 Q49 58 42 58 H39 Q32 58 32 52 Z" fill="#161a24" stroke={INK} strokeWidth="1.2" />
          <path d="M51 45 H68 V52 Q68 58 61 58 H58 Q51 58 51 52 Z" fill="#161a24" stroke={INK} strokeWidth="1.2" />
          <path d="M49 47 H51" stroke={INK} strokeWidth="2" /><path d="M32 47 L28 45 M68 47 L72 45" stroke={INK} strokeWidth="1.6" />
          <path d="M35 47 L40 47 M54 47 L59 47" stroke="rgba(255,255,255,.4)" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      );
    case 'ew_aviator':
      return (
        <g>
          <path d="M31 45 H49 Q50 58 40 58 Q31 58 31 45 Z" fill="rgba(60,50,20,.75)" stroke="#d6b04a" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M69 45 H51 Q50 58 60 58 Q69 58 69 45 Z" fill="rgba(60,50,20,.75)" stroke="#d6b04a" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M49 46 Q50 44 51 46" stroke="#d6b04a" strokeWidth="1.6" fill="none" /><path d="M31 46 L28 44 M69 46 L72 44" stroke="#d6b04a" strokeWidth="1.6" />
          <path d="M34 48 L38 52 M54 48 L58 52" stroke="rgba(255,255,255,.4)" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      );
    case 'ew_lennon': {
      const lens = (cx: number, col: string) => <circle key={cx} cx={cx} cy="50" r="7" fill={col} stroke="#c9a227" strokeWidth="1.4" />;
      return <g>{lens(41, 'rgba(255,120,60,.55)')}{lens(59, 'rgba(255,120,60,.55)')}<path d="M48 49 Q50 47.6 52 49" stroke="#c9a227" strokeWidth="1.4" fill="none" /><path d="M34 49 L29 47 M66 49 L71 47" stroke="#c9a227" strokeWidth="1.4" /></g>;
    }
    case 'ew_cateye':
      return (
        <g>
          <path d="M30 44 L36 45 H48 Q49 56 40 56 Q32 56 31 50 Z" fill="rgba(255,255,255,.22)" stroke="#c2255c" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M70 44 L64 45 H52 Q51 56 60 56 Q68 56 69 50 Z" fill="rgba(255,255,255,.22)" stroke="#c2255c" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M48.6 48 Q50 46.8 51.4 48" stroke="#c2255c" strokeWidth="1.6" fill="none" />
        </g>
      );
    case 'ew_eyepatch':
      return (
        <g>
          <path d="M28 40 L72 56" stroke="#2b2b33" strokeWidth="1.6" />
          <ellipse cx="41" cy="50" rx="7.5" ry="6.8" fill="#23232b" stroke="#111" strokeWidth="1" />
        </g>
      );
    case 'ew_3d':
      return (
        <g>
          <rect x="32" y="44" width="17" height="12" rx="2" fill="rgba(229,57,53,.6)" stroke="#fff" strokeWidth="1.8" /><rect x="51" y="44" width="17" height="12" rx="2" fill="rgba(0,188,212,.6)" stroke="#fff" strokeWidth="1.8" />
          <path d="M49 49 H51" stroke="#fff" strokeWidth="2" /><path d="M32 48 L28 46 M68 48 L72 46" stroke="#fff" strokeWidth="1.6" />
        </g>
      );
    case 'ew_heart': {
      const heart = (cx: number) => <path key={cx} transform={`translate(${cx} 51)`} d="M0 7 C-12 -1 -7 -9 0 -4 C7 -9 12 -1 0 7 Z" fill="rgba(239,71,111,.55)" stroke="#d61f57" strokeWidth="1.6" />;
      return <g>{heart(40)}{heart(60)}<path d="M46 47 Q50 45 54 47" stroke="#d61f57" strokeWidth="1.6" fill="none" /></g>;
    }
    case 'ew_partystar': {
      const star = (cx: number) => <path key={cx} transform={`translate(${cx} 50)`} d="M0-9 L2.6-3 L9-2.6 L4.2 1.8 L5.6 8.4 L0 5 L-5.6 8.4 L-4.2 1.8 L-9-2.6 L-2.6-3 Z" fill="rgba(255,214,0,.6)" stroke="#e0a800" strokeWidth="1.6" strokeLinejoin="round" />;
      return <g>{star(40)}{star(60)}<path d="M47 49 H53" stroke="#e0a800" strokeWidth="1.6" /></g>;
    }
    case 'ew_monocle':
      return <g><circle cx="59" cy="50" r="8" fill="rgba(255,240,170,.25)" stroke="#c9a227" strokeWidth="2" /><path d="M66 56 C70 66 68 78 62 86" stroke="#c9a227" strokeWidth="1.2" fill="none" /></g>;
    case 'ew_venice':
      return (
        <g>
          <path d="M28 46 C34 38 44 42 50 46 C56 42 66 38 72 46 C72 56 64 60 58 56 C54 54 52 52 50 52 C48 52 46 54 42 56 C36 60 28 56 28 46 Z" fill="#f6f1e6" stroke="#c9a227" strokeWidth="1.4" />
          <ellipse cx="41" cy="50" rx="4.4" ry="3.4" fill="#2a1d22" /><ellipse cx="59" cy="50" rx="4.4" ry="3.4" fill="#2a1d22" />
          <path d="M30 44 C36 40 44 42 48 46 M52 46 C56 42 64 40 70 44" stroke="#c9a227" strokeWidth="1.2" fill="none" />
          {[[34, 44], [66, 44], [50, 46]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.3" fill="#c9a227" />)}
        </g>
      );
    case 'ew_bandit':
      return (
        <g>
          <path d="M28 44 Q50 38 72 44 L72 56 Q60 60 56 54 Q50 50 44 54 Q40 60 28 56 Z" fill="#c92a2a" stroke="#7a1313" strokeWidth="1" />
          <ellipse cx="41" cy="50" rx="4.8" ry="4.2" fill="#fff" /><circle cx="41" cy="50.5" r="2.7" fill={INK} />
          <ellipse cx="59" cy="50" rx="4.8" ry="4.2" fill="#fff" /><circle cx="59" cy="50.5" r="2.7" fill={INK} />
        </g>
      );
    case 'ew_goggles':
      return (
        <g>
          <path d="M20 46 Q50 36 80 46 L80 52 Q50 42 20 52 Z" fill="#f08a1c" />
          <rect x="29" y="42" width="42" height="18" rx="9" fill="rgba(160,225,240,.55)" stroke="#16a3b8" strokeWidth="3" />
          <path d="M50 42 V60" stroke="#16a3b8" strokeWidth="2.4" />
          <path d="M34 47 Q38 45 42 47" stroke="rgba(255,255,255,.8)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'ew_ski':
      return (
        <g>
          <path d="M20 46 Q50 36 80 46 L80 53 Q50 43 20 53 Z" fill="#2563eb" />
          <rect x="28" y="42" width="44" height="19" rx="8" fill="rgba(255,176,60,.6)" stroke="#1e3a8a" strokeWidth="3" />
          <path d="M50 42 V61" stroke="#1e3a8a" strokeWidth="2.4" /><path d="M33 47 Q38 45 43 47" stroke="rgba(255,255,255,.8)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'ew_pixel': {
      const blocks: [number, number, number, number][] = [[31, 46, 18, 3], [31, 49, 18, 3], [33, 52, 14, 3], [35, 55, 10, 2], [51, 46, 18, 3], [51, 49, 18, 3], [53, 52, 14, 3], [55, 55, 10, 2], [48, 46, 4, 3]];
      return (
        <g shapeRendering="crispEdges">
          {blocks.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill="#111" />)}
          <rect x="33" y="47" width="4" height="2" fill="#fff" /><rect x="53" y="47" width="4" height="2" fill="#fff" />
          <rect x="29" y="46" width="2" height="2" fill="#111" /><rect x="69" y="46" width="2" height="2" fill="#111" />
        </g>
      );
    }
    case 'ew_scouter':
      return (
        <g>
          <path d="M29 36 C30 24 70 24 71 36" stroke="#2a2f3a" strokeWidth="1" fill="none" opacity="0" />
          <path d="M30 50 L26 56 L28 66 L33 64" stroke="#2f9e44" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M33 48 L40 48" stroke="#2f9e44" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M36 44 H50 V56 H36 Z" fill="rgba(60,255,130,.35)" stroke="#16a34a" strokeWidth="1.6" strokeLinejoin="round" />
          <Blink on={c.anim} values="1;.3;1" dur={1.2}><path d="M39 54 L39 50 L42 52 L44 47 L47 53" stroke="#a7ffc9" strokeWidth="1" fill="none" /></Blink>
          <circle cx="29" cy="49" r="2.4" fill="#16a34a" />
        </g>
      );
    case 'ew_visor':
      return (
        <g>
          <rect x="27" y="42" width="46" height="15" rx="7" fill="#12304a" stroke="#4dd0e1" strokeWidth="1.6" />
          <rect x="30" y="45" width="40" height="9" rx="4.5" fill="#4dd0e1" opacity=".55" />
          <Move on={c.anim} type="translate" values="0 0;36 0;0 0" dur={2.4}><rect x="30" y="45" width="3" height="9" rx="1.5" fill="#fff" opacity=".9" /></Move>
          <path d="M27 49 L22 47 M73 49 L78 47" stroke="#4dd0e1" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
};

// ================================================================ หมวก
const hat = (path: string, fill: string, stroke = 'rgba(0,0,0,.25)') => <path d={path} fill={fill} stroke={stroke} strokeWidth="1.1" strokeLinejoin="round" />;

export const Headwear: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  switch (id) {
    case 'hw_cap':
      return (
        <g>
          <path d="M28 40 C26 20 40 14 52 15 C66 16 74 26 72 40 Z" fill="#e5484d" />
          <path d="M28 40 C42 36 64 38 86 44 C84 48 70 46 58 44 L28 44 Z" fill="#b9272c" />
          <circle cx="51" cy="14.5" r="2.2" fill="#b9272c" /><path d="M42 22 Q50 18 60 21" stroke="rgba(255,255,255,.3)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'hw_bandana':
      return (
        <g>
          <path d="M27 38 C28 24 40 20 50 20 C60 20 72 24 73 38 C60 32 40 32 27 38 Z" fill="#d6336c" />
          <path d="M71 34 L84 28 L80 40 L86 48 L72 42 Z" fill="#d6336c" />
          {[[36, 28], [46, 25], [56, 25], [64, 28]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.4" fill="#fff" opacity=".85" />)}
        </g>
      );
    case 'hw_sweatband':
      return <g><path d="M28.4 38 C40 31 60 31 71.6 38 L71.8 33 C60 26 40 26 28.2 33 Z" fill="#e5484d" /><path d="M28.4 36 C40 29 60 29 71.6 36" stroke="#fff" strokeWidth="1.2" fill="none" /></g>;
    case 'hw_bucket':
      return (
        <g>
          <path d="M26 40 C28 20 40 14 50 14 C60 14 72 20 74 40 Z" fill="#6dbf8b" stroke="#3f8f5f" strokeWidth="1.1" />
          <path d="M18 42 C28 34 72 34 82 42 C80 46 20 46 18 42 Z" fill="#59ad78" stroke="#3f8f5f" strokeWidth="1.1" />
          <path d="M26 36 H74" stroke="#3f8f5f" strokeWidth="1.6" />
        </g>
      );
    case 'hw_beanie':
      return (
        <g>
          <path d="M27 38 C25 16 40 10 50 10 C60 10 75 16 73 38 Z" fill="#2f7fd1" />
          <rect x="26" y="34" width="48" height="9" rx="4.5" fill="#1f5fa3" />
          {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${33 + i * 7} 12 V34`} stroke="#256bb8" strokeWidth="1.4" />)}
          <circle cx="50" cy="8" r="5" fill="#e8f1fb" />
        </g>
      );
    case 'hw_pompom':
      return (
        <g>
          <path d="M27 38 C25 18 40 12 50 12 C60 12 75 18 73 38 Z" fill="#e5484d" />
          <rect x="26" y="34" width="48" height="9" rx="4.5" fill="#fff" stroke="#d9dee8" strokeWidth="1" />
          {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={34 + i * 8} cy="38.5" r="1.4" fill="#e5484d" />)}
          <circle cx="50" cy="7" r="6.4" fill="#fff" stroke="#d9dee8" strokeWidth="1" /><circle cx="48" cy="5.4" r="1.6" fill="#fff" />
        </g>
      );
    case 'hw_newsboy':
      return (
        <g>
          <path d="M26 40 C24 20 40 14 56 16 C70 18 76 28 74 40 Z" fill="#7a6a5a" stroke="#4a3f33" strokeWidth="1.1" />
          <path d="M26 40 C40 44 60 44 74 40 L74 37 C60 41 40 41 26 37 Z" fill="#5a4c3f" />
          <circle cx="50" cy="15" r="2" fill="#4a3f33" /><path d="M36 24 Q48 18 62 22" stroke="rgba(255,255,255,.25)" strokeWidth="2" fill="none" />
        </g>
      );
    case 'hw_hardhat':
      return (
        <g>
          <path d="M26 38 C26 16 40 12 50 12 C60 12 74 16 74 38 Z" fill="#ffd43b" stroke="#d9a400" strokeWidth="1" />
          <rect x="22" y="36" width="56" height="6" rx="3" fill="#f2b705" />
          <rect x="46" y="12" width="8" height="24" fill="#f2b705" opacity=".7" />
          <path d="M34 24 Q40 18 48 18" stroke="rgba(255,255,255,.5)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'hw_partyhat':
      return (
        <g>
          <path d="M50 -4 L66 34 H34 Z" fill="#9b59f0" />
          {[[44, 18], [54, 22], [48, 30], [58, 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.2" fill={['#ffd43b', '#ff6b9d', '#4dd0e1', '#fff'][i]} />)}
          <circle cx="50" cy="-4" r="4" fill="#ffd43b" /><path d="M34 34 H66" stroke="#7a3fd1" strokeWidth="3" />
        </g>
      );
    case 'hw_straw':
      return (
        <g>
          <path d="M10 40 C22 24 78 24 90 40 C78 46 22 46 10 40 Z" fill="#e8c460" stroke="#a9791a" strokeWidth="1.2" />
          <path d="M34 34 C36 18 64 18 66 34 Z" fill="#f0d27a" stroke="#a9791a" strokeWidth="1.1" />
          <path d="M16 38 C30 34 70 34 84 38 M22 41 C34 38 66 38 78 41" stroke="#b8923a" strokeWidth=".8" fill="none" />
          <path d="M34 32 H66" stroke="#c0392b" strokeWidth="2.4" />
        </g>
      );
    case 'hw_flower':
      return (
        <g transform="translate(66 28)">
          {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-5.5" rx="3.6" ry="5.2" fill="#ff8fab" transform={`rotate(${a})`} />)}
          <circle r="3.4" fill="#ffd43b" />
        </g>
      );
    case 'hw_fedora':
      return (
        <g>
          <path d="M14 40 C24 32 76 32 86 40 C76 46 24 46 14 40 Z" fill="#5a4a3a" stroke="#3a2e22" strokeWidth="1.1" />
          <path d="M30 36 C28 16 40 12 50 14 C60 12 72 16 70 36 Z" fill="#6b5a48" stroke="#3a2e22" strokeWidth="1.1" />
          <path d="M44 14 Q50 22 56 14" stroke="#3a2e22" strokeWidth="1.2" fill="none" /><path d="M30 31 H70" stroke="#c0392b" strokeWidth="3.4" />
        </g>
      );
    case 'hw_sailor':
      return (
        <g>
          <path d="M26 38 C24 22 36 18 50 18 C64 18 76 22 74 38 Z" fill="#fff" stroke="#c9d1e0" strokeWidth="1.1" />
          <path d="M24 36 C40 42 60 42 76 36 L76 40 C60 46 40 46 24 40 Z" fill="#1f3a7a" />
          <path d="M26 28 Q50 22 74 28" stroke="#1f3a7a" strokeWidth="1.6" fill="none" />
          <path d="M45 24 L50 20 L55 24 L50 27 Z" fill="#e5484d" />
        </g>
      );
    case 'hw_nurse':
      return (
        <g>
          <path d="M28 38 C28 24 36 20 50 20 C64 20 72 24 72 38 C60 34 40 34 28 38 Z" fill="#fff" stroke="#d9dee8" strokeWidth="1.1" />
          <path d="M47 23 H53 V27 H57 V33 H53 V37 H47 V33 H43 V27 H47 Z" fill="#e53935" transform="translate(0 -2) scale(1)" />
        </g>
      );
    case 'hw_police':
      return (
        <g>
          <path d="M26 38 C24 18 38 12 50 12 C62 12 76 18 74 38 Z" fill="#1f3a7a" stroke="#142654" strokeWidth="1.1" />
          <path d="M26 38 C42 44 58 44 74 38 L74 34 C58 40 42 40 26 34 Z" fill="#142654" />
          <path d="M50 18 L52 24 H58 L53 28 L55 34 L50 30 L45 34 L47 28 L42 24 H48 Z" fill="#facc15" stroke="#a16207" strokeWidth=".6" />
        </g>
      );
    case 'hw_chef':
      return (
        <g>
          <path d="M28 34 C18 30 20 12 34 14 C34 4 50 0 54 10 C62 2 78 6 74 18 C84 20 80 34 72 34 Z" fill="#fff" stroke="#d9dee8" strokeWidth="1.2" />
          <rect x="28" y="30" width="44" height="9" rx="2" fill="#f1f3f8" stroke="#d9dee8" strokeWidth="1" />
        </g>
      );
    case 'hw_headphones':
      return (
        <g>
          <path d="M26 50 C22 18 78 18 74 50" stroke="#3b3b4f" strokeWidth="5" fill="none" strokeLinecap="round" />
          <rect x="20" y="42" width="11" height="20" rx="5" fill="#7048e8" stroke="#3b3b4f" strokeWidth="2" />
          <rect x="69" y="42" width="11" height="20" rx="5" fill="#7048e8" stroke="#3b3b4f" strokeWidth="2" />
          <circle cx="25.5" cy="52" r="2.4" fill="#e599f7" /><circle cx="74.5" cy="52" r="2.4" fill="#e599f7" />
        </g>
      );
    case 'hw_graduation':
      return (
        <g>
          <path d="M34 34 C34 40 66 40 66 34 V28 H34 Z" fill="#23232b" />
          <path d="M50 14 L88 24 L50 34 L12 24 Z" fill="#2a2a35" stroke="#111" strokeWidth="1" strokeLinejoin="round" />
          <circle cx="50" cy="24" r="2" fill="#facc15" /><path d="M50 24 L82 29 V40" stroke="#facc15" strokeWidth="1.6" fill="none" /><rect x="80" y="39" width="4" height="7" rx="1.4" fill="#facc15" />
        </g>
      );
    case 'hw_cowboy':
      return (
        <g>
          <path d="M14 38 C22 44 78 44 86 38 C80 32 70 34 66 34 L34 34 C30 34 20 32 14 38 Z" fill="#a9703a" stroke="#7a4c22" strokeWidth="1.2" />
          <path d="M32 36 C30 14 38 8 50 12 C62 8 70 14 68 36 Z" fill="#b9814a" stroke="#7a4c22" strokeWidth="1.2" />
          <path d="M32 30 H68" stroke="#7a4c22" strokeWidth="3" />
          <path d="M44 14 Q50 22 56 14" stroke="#7a4c22" strokeWidth="1.4" fill="none" />
        </g>
      );
    case 'hw_catears':
      return (
        <g>
          <path d="M28 36 L26 12 L44 26 Z" fill="#3b3b4f" /><path d="M31 31 L30 18 L40 26 Z" fill="#ff8fab" />
          <path d="M72 36 L74 12 L56 26 Z" fill="#3b3b4f" /><path d="M69 31 L70 18 L60 26 Z" fill="#ff8fab" />
        </g>
      );
    case 'hw_bunny':
      return (
        <g>
          <ellipse cx="38" cy="10" rx="6" ry="20" fill="#f4f0f2" stroke="#d6cfd4" strokeWidth="1.2" /><ellipse cx="38" cy="12" rx="3" ry="14" fill="#ffb3c6" />
          <ellipse cx="62" cy="10" rx="6" ry="20" fill="#f4f0f2" stroke="#d6cfd4" strokeWidth="1.2" transform="rotate(10 62 10)" /><ellipse cx="62" cy="12" rx="3" ry="14" fill="#ffb3c6" transform="rotate(10 62 10)" />
        </g>
      );
    case 'hw_turban':
      return (
        <g>
          <path d="M26 40 C22 22 34 6 50 6 C66 6 78 22 74 40 C60 34 40 34 26 40 Z" fill="#f4efe3" stroke="#cfc4a8" strokeWidth="1.1" />
          <path d="M28 32 C44 22 62 24 74 34 M28 26 C44 16 64 18 72 28 M34 14 C48 12 60 14 68 18" stroke="#cfc4a8" strokeWidth="1.1" fill="none" />
          <circle cx="50" cy="26" r="3.2" fill="#c92a2a" stroke="#7a1313" strokeWidth=".8" /><path d="M50 22 L50 14" stroke="#c92a2a" strokeWidth="2" />
        </g>
      );
    case 'hw_army':
      return (
        <g>
          <path d="M24 40 C22 16 38 10 50 10 C62 10 78 16 76 40 Z" fill="#5a6b3a" stroke="#3a4726" strokeWidth="1.1" />
          <path d="M24 40 C40 44 60 44 76 40 L76 36 C60 40 40 40 24 36 Z" fill="#46542d" />
          <path d="M30 22 L42 28 M60 18 L70 26 M44 14 L52 20" stroke="#3a4726" strokeWidth="3" strokeLinecap="round" />
          <path d="M30 22 L42 28 M60 18 L70 26" stroke="#7d8f4c" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );
    case 'hw_santa':
      return (
        <g>
          <path d="M26 38 C26 20 42 10 60 12 C72 14 82 26 86 42 C78 36 70 34 62 34 C50 32 40 34 26 38 Z" fill="#d62828" stroke="#8a1010" strokeWidth="1.1" />
          <path d="M24 38 C40 30 62 30 76 38 C76 44 62 38 50 38 C38 38 24 44 24 38 Z" fill="#fff" stroke="#d9dee8" strokeWidth="1" />
          <circle cx="86" cy="43" r="5" fill="#fff" stroke="#d9dee8" strokeWidth="1" />
        </g>
      );
    case 'hw_laurel': {
      const leaf = (x: number, y: number, r: number, k: number) => <ellipse key={`${x}${k}`} cx={x} cy={y} rx="2" ry="4.4" fill="#4caf50" stroke="#2f7a35" strokeWidth=".6" transform={`rotate(${r} ${x} ${y})`} />;
      return (
        <g>
          {[[28, 44, -30], [28, 36, -10], [30, 28, 10], [35, 22, 30], [43, 18, 50]].map(([x, y, r], i) => leaf(x, y, r, i))}
          {[[72, 44, 30], [72, 36, 10], [70, 28, -10], [65, 22, -30], [57, 18, -50]].map(([x, y, r], i) => leaf(x, y, r, i + 9))}
        </g>
      );
    }
    case 'hw_sombrero':
      return (
        <g>
          <ellipse cx="50" cy="36" rx="46" ry="9" fill="#e8a33d" stroke="#a96b12" strokeWidth="1.2" />
          <path d="M34 34 C32 8 42 2 50 2 C58 2 68 8 66 34 Z" fill="#f2b45a" stroke="#a96b12" strokeWidth="1.2" />
          <path d="M33 29 H67" stroke="#d6336c" strokeWidth="3.4" />
          {[8, 22, 36, 64, 78, 92].map((x, i) => <circle key={i} cx={x} cy={36 + (i % 2 ? 2 : 0)} r="1.5" fill="#d6336c" />)}
        </g>
      );
    case 'hw_ninja':
      return (
        <g>
          <path d="M27 40 C27 32 73 32 73 40 L73 28 C60 22 40 22 27 28 Z" fill="#23232b" stroke="#111" strokeWidth="1" />
          <rect x="38" y="28" width="24" height="9" rx="2" fill="#9aa3b2" stroke="#6b7280" strokeWidth="1" /><path d="M44 30 V35 M50 30 V35 M56 30 V35" stroke="#6b7280" strokeWidth="1.2" />
          <path d="M73 32 L86 40 L74 38 L84 50 L72 40" fill="#23232b" />
        </g>
      );
    case 'hw_explorer':
      return (
        <g>
          <ellipse cx="50" cy="36" rx="38" ry="8" fill="#c8a45a" stroke="#8a6b2a" strokeWidth="1.2" />
          <path d="M32 34 C32 14 42 10 50 10 C58 10 68 14 68 34 Z" fill="#d4b06a" stroke="#8a6b2a" strokeWidth="1.2" />
          <path d="M32 30 H68" stroke="#6b4a1f" strokeWidth="3" />
        </g>
      );
    case 'hw_bearhood':
      return (
        <g>
          <circle cx="30" cy="22" r="8" fill="#8a5a2b" stroke="#5a3a1a" strokeWidth="1.1" /><circle cx="30" cy="22" r="4" fill="#d9a066" />
          <circle cx="70" cy="22" r="8" fill="#8a5a2b" stroke="#5a3a1a" strokeWidth="1.1" /><circle cx="70" cy="22" r="4" fill="#d9a066" />
          <path d="M26 44 C22 20 34 12 50 12 C66 12 78 20 74 44 C70 36 62 30 50 30 C38 30 30 36 26 44 Z" fill="#8a5a2b" stroke="#5a3a1a" strokeWidth="1.1" />
        </g>
      );
    case 'hw_tophat':
      return (
        <g>
          <rect x="31" y="-2" width="38" height="34" rx="3" fill="#23232b" stroke="#111" strokeWidth="1" />
          <ellipse cx="50" cy="34" rx="30" ry="6" fill="#23232b" stroke="#111" strokeWidth="1" />
          <rect x="31" y="22" width="38" height="7" fill="#c92a2a" />
        </g>
      );
    case 'hw_helmet':
      return (
        <g>
          <path d="M25 52 C22 20 36 8 50 8 C64 8 78 20 75 52 L67 52 L67 46 L33 46 L33 52 Z" fill="#aeb7c4" stroke="#6c7686" strokeWidth="1.4" />
          <path d="M50 8 V46" stroke="#6c7686" strokeWidth="2" />
          <path d="M36 42 H64" stroke="#6c7686" strokeWidth="2.6" />
          <path d="M50 8 C44 -2 58 -6 62 2" stroke="#e5484d" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'hw_antlers':
      return (
        <g stroke="#8a5a2b" strokeWidth="3.2" fill="none" strokeLinecap="round">
          <path d="M36 30 C32 20 28 14 24 6 M31 20 L22 18 M28 12 L33 6" /><path d="M64 30 C68 20 72 14 76 6 M69 20 L78 18 M72 12 L67 6" />
        </g>
      );
    case 'hw_mushroom':
      return (
        <g>
          <path d="M18 34 C16 10 38 2 50 2 C62 2 84 10 82 34 C66 28 34 28 18 34 Z" fill="#e5484d" stroke="#8a1c20" strokeWidth="1.2" />
          {[[34, 14, 4], [52, 10, 5], [68, 16, 3.6], [26, 25, 3], [76, 26, 3.4], [44, 22, 2.8]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" />)}
        </g>
      );
    case 'hw_wolfears':
      return (
        <g>
          <path d="M27 38 L24 8 L46 26 Z" fill="#6b6f7a" stroke="#4a4e57" strokeWidth="1.2" /><path d="M30 32 L28 15 L41 26 Z" fill="#f2a6b8" />
          <path d="M73 38 L76 8 L54 26 Z" fill="#6b6f7a" stroke="#4a4e57" strokeWidth="1.2" /><path d="M70 32 L72 15 L59 26 Z" fill="#f2a6b8" />
        </g>
      );
    case 'hw_jester':
      return (
        <g>
          <path d="M28 38 C20 28 14 20 8 22 C10 30 18 38 28 42 Z" fill="#e5484d" stroke="#7f1d1d" strokeWidth="1" strokeLinejoin="round" />
          <path d="M72 38 C80 28 86 20 92 22 C90 30 82 38 72 42 Z" fill="#2563eb" stroke="#1e3a8a" strokeWidth="1" strokeLinejoin="round" />
          <path d="M34 38 C32 24 42 8 50 2 C58 8 68 24 66 38 Z" fill="#facc15" stroke="#a16207" strokeWidth="1" strokeLinejoin="round" />
          <rect x="28" y="36" width="44" height="6" rx="3" fill="#7c3aed" />
          {[[8, 22, '#facc15'], [92, 22, '#facc15'], [50, 2, '#e5484d']].map(([x, y, col], i) => <circle key={i} cx={x as number} cy={y as number} r="3.6" fill={col as string} stroke="#a16207" strokeWidth=".8" />)}
        </g>
      );
    case 'hw_flowercrown':
      return (
        <g>
          <path d="M27 36 C38 28 62 28 73 36" stroke="#4caf50" strokeWidth="2.4" fill="none" />
          {[[30, 34, '#ff8fab'], [40, 30, '#ffd43b'], [50, 28, '#fff'], [60, 30, '#b197fc'], [70, 34, '#ff8fab']].map(([x, y, col], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cy="-2.4" rx="1.8" ry="2.6" fill={col as string} transform={`rotate(${a})`} />)}<circle r="1.4" fill="#f59f00" /></g>
          ))}
        </g>
      );
    case 'hw_dino':
      return (
        <g>
          <path d="M24 42 C20 18 40 8 54 10 C70 12 80 26 78 44 C72 36 60 30 48 30 C38 30 30 34 24 42 Z" fill="#4fae5f" stroke="#2f7a3f" strokeWidth="1.2" />
          {[[40, 10], [52, 8], [64, 14]].map(([x, y], i) => <path key={i} d={`M${x - 5} ${y + 3} L${x} ${y - 8} L${x + 5} ${y + 3} Z`} fill="#f59f00" stroke="#a16207" strokeWidth=".8" strokeLinejoin="round" />)}
          <circle cx="36" cy="26" r="3.2" fill="#fff" /><circle cx="36" cy="26" r="1.4" fill={INK} />
        </g>
      );
    case 'hw_viking':
      return (
        <g>
          <path d="M26 40 C24 16 38 8 50 8 C62 8 76 16 74 40 Z" fill="#aab3c0" stroke="#6c7686" strokeWidth="1.3" />
          <path d="M26 36 H74" stroke="#6c7686" strokeWidth="3" /><path d="M50 8 V36" stroke="#6c7686" strokeWidth="2" />
          <path d="M28 30 C14 28 12 14 18 8 C18 18 24 22 30 22 Z" fill="#f4f0e2" stroke="#b8ae8a" strokeWidth="1.1" />
          <path d="M72 30 C86 28 88 14 82 8 C82 18 76 22 70 22 Z" fill="#f4f0e2" stroke="#b8ae8a" strokeWidth="1.1" />
        </g>
      );
    case 'hw_pumpkin':
      return (
        <g>
          <path d="M50 8 C48 4 52 0 56 -2" stroke="#4a7a2a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M22 42 C16 22 30 8 50 10 C70 8 84 22 78 42 C70 36 60 32 50 32 C40 32 30 36 22 42 Z" fill="#f08a1c" stroke="#b45309" strokeWidth="1.2" />
          <path d="M50 10 C44 20 44 30 48 34 M50 10 C56 20 56 30 52 34 M36 14 C30 22 30 32 32 38 M64 14 C70 22 70 32 68 38" stroke="#c86a10" strokeWidth="1.2" fill="none" />
        </g>
      );
    case 'hw_wizard':
      return (
        <g>
          <path d="M50 -12 C48 6 42 18 34 34 H66 C60 20 56 8 50 -12 Z" fill="#2f3b9a" stroke="#1d2566" strokeWidth="1.2" />
          <ellipse cx="50" cy="35" rx="38" ry="7" fill="#3a47b4" stroke="#1d2566" strokeWidth="1.2" />
          <path d="M37 30 H63" stroke="#facc15" strokeWidth="3" />
          {[[46, 12, 3], [54, 20, 2.4], [48, 26, 2]].map(([x, y, r], i) => <g key={i} transform={`translate(${x} ${y})`}><Pulse on={c.anim} min={0.7} max={1.2} dur={1.6} begin={i * 0.5} twinkle><path d={starPath(Number(r) + 1)} fill="#fff3a8" /></Pulse></g>)}
        </g>
      );
    case 'hw_witch':
      return (
        <g>
          <path d="M50 -10 C48 8 40 20 34 34 H70 C64 22 54 8 50 -10 Z" fill="#4c2a85" stroke="#2f1a55" strokeWidth="1.2" />
          <ellipse cx="50" cy="35" rx="40" ry="7" fill="#5b33a1" stroke="#2f1a55" strokeWidth="1.2" />
          <path d="M37 30 H63" stroke="#f08a1c" strokeWidth="4" />
          <rect x="46" y="27" width="8" height="7" rx="1" fill="none" stroke="#ffd43b" strokeWidth="1.6" />
        </g>
      );
    case 'hw_unicorn':
      return (
        <g>
          <path d="M50 -10 L56 28 H44 Z" fill="#fde2f3" stroke="#e599d4" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M46 20 L55 16 M45 12 L54 8 M47 4 L53 1" stroke="#e599d4" strokeWidth="1.4" />
          <Blink on={c.anim} values=".3;1;.3" dur={1.8}><path d={starPath(3)} transform="translate(50 -12)" fill="#fff3a8" /></Blink>
          <path d="M36 32 C30 28 26 20 30 14 C32 22 38 26 42 28 Z" fill="#fde2f3" stroke="#e599d4" strokeWidth="1" />
        </g>
      );
    case 'hw_pirate':
      return (
        <g>
          <path d="M14 34 C20 16 34 4 50 4 C66 4 80 16 86 34 C74 30 62 28 50 28 C38 28 26 30 14 34 Z" fill="#1f1f2b" stroke="#000" strokeWidth="1" />
          <path d="M14 34 C26 38 74 38 86 34" stroke="#c9a227" strokeWidth="2.4" fill="none" />
          <circle cx="50" cy="17" r="5" fill="#f1f3f8" /><rect x="47" y="21" width="6" height="3" fill="#f1f3f8" /><circle cx="48.2" cy="16.5" r="1.2" fill="#1f1f2b" /><circle cx="51.8" cy="16.5" r="1.2" fill="#1f1f2b" />
        </g>
      );
    case 'hw_horns':
      return (
        <g>
          <path d="M31 34 C20 28 20 10 30 4 C28 16 36 24 42 28 Z" fill="#c92a2a" stroke="#7a1313" strokeWidth="1.2" />
          <path d="M69 34 C80 28 80 10 70 4 C72 16 64 24 58 28 Z" fill="#c92a2a" stroke="#7a1313" strokeWidth="1.2" />
        </g>
      );
    case 'hw_halo':
      return (
        <g>
          <Blink on={c.anim} values=".55;1;.55" dur={2}>
            <ellipse cx="50" cy="12" rx="22" ry="8" fill="#ffe680" opacity=".35" />
            <ellipse cx="50" cy="12" rx="18" ry="5" fill="none" stroke="#ffd43b" strokeWidth="4" /><ellipse cx="50" cy="12" rx="18" ry="5" fill="none" stroke="#fff3bf" strokeWidth="1.2" />
          </Blink>
        </g>
      );
    case 'hw_crown':
      return (
        <g>
          <path d="M28 34 L26 8 L38 20 L50 4 L62 20 L74 8 L72 34 Z" fill="#ffd43b" stroke="#c9a227" strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="28" y="30" width="44" height="6" rx="2" fill="#f2b705" stroke="#c9a227" strokeWidth="1" />
          <circle cx="50" cy="20" r="3" fill="#e5484d" /><circle cx="36" cy="26" r="2.2" fill="#4dabf7" /><circle cx="64" cy="26" r="2.2" fill="#69db7c" />
        </g>
      );
    default:
      void hat;
      return null;
  }
};
