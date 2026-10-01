// components/avatar/layersBody.tsx — เสื้อผ้า · ของประดับ (ชั้นหลัง/ชั้นหน้า)
import React from 'react';
import { INK, shade } from './colors';
import { Blink, Move, Pulse, heartPath, starPath } from './anim';
import type { Ctx } from './layersHead';

const TORSO = 'M6 125 C6 100 26 86 50 86 C74 86 94 100 94 125 Z';
const TEES: Record<string, [string, string]> = {
  of_tee_orange: ['#f5a623', '#d4861a'], of_tee_blue: ['#3d8bd9', '#2a68a8'], of_tee_red: ['#e5484d', '#b9272c'],
  of_tee_green: ['#3fae5a', '#2a7d40'], of_tee_pink: ['#f47fb0', '#d45a8c'], of_tee_purple: ['#8a5fe0', '#6540b8'],
  of_tee_black: ['#33343f', '#1b1c24'], of_tee_white: ['#f6f7fb', '#cfd5e2'],
};

// ================================================================ เสื้อผ้า (ครึ่งตัวบน)
export const Outfit: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const neckV = <path d="M42 86 L50 100 L58 86 Z" fill={shade(c.skin, 0.1)} />;
  const tee = TEES[id];
  if (tee) return <g><path d={TORSO} fill={tee[0]} />{neckV}<path d="M40 86 C44 94 56 94 60 86" stroke={tee[1]} strokeWidth="2" fill="none" /></g>;
  switch (id) {
    case 'of_tank':
      return (
        <g>
          <path d={TORSO} fill={shade(c.skin, 0.04)} />
          <path d="M20 125 C20 108 30 98 38 94 L40 86 C44 94 56 94 60 86 L62 94 C70 98 80 108 80 125 Z" fill="#fff" stroke="#d9dee8" strokeWidth="1" />
        </g>
      );
    case 'of_hoodie':
      return (
        <g>
          <path d={TORSO} fill="#6c5ce7" />
          <path d="M30 88 C36 80 64 80 70 88 C66 96 34 96 30 88 Z" fill="#5646c9" />
          <path d="M42 90 C46 96 54 96 58 90 L56 86 C52 90 48 90 44 86 Z" fill={shade(c.skin, 0.1)} />
          <path d="M45 94 V108 M55 94 V108" stroke="#e8e4ff" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M30 118 H70 V125 H30 Z" fill="#5646c9" opacity=".6" />
        </g>
      );
    case 'of_polo':
      return (
        <g>
          <path d={TORSO} fill="#2fae9a" />
          <path d="M38 86 L44 98 L50 92 L56 98 L62 86 L56 84 L50 90 L44 84 Z" fill="#fff" stroke="#d9dee8" strokeWidth=".8" strokeLinejoin="round" />
          <path d="M50 92 V108" stroke="#1f8374" strokeWidth="1.4" />{[98, 104].map((y) => <circle key={y} cx="50" cy={y} r="1.1" fill="#fff" />)}
        </g>
      );
    case 'of_workvest':
      return (
        <g>
          <path d={TORSO} fill="#2f3b5c" />
          <path d="M30 92 C34 88 40 86 42 86 L44 125 H20 C20 108 24 98 30 92 Z" fill="#ffd43b" /><path d="M70 92 C66 88 60 86 58 86 L56 125 H80 C80 108 76 98 70 92 Z" fill="#ffd43b" />
          <path d="M26 112 H44 M56 112 H74" stroke="#d9d9d9" strokeWidth="2.6" />{neckV}
        </g>
      );
    case 'of_pajama':
      return (
        <g>
          <path d={TORSO} fill="#4a5fb8" />
          {[[22, 106, 1.2], [36, 116, 1], [60, 104, 1.1], [74, 114, 1.3], [48, 122, .9], [84, 104, .9]].map(([x, y, s], i) => <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d={starPath(4)} fill="#ffe680" />)}
          <path d="M40 86 C44 94 56 94 60 86" fill="#fff" stroke="#fff" strokeWidth="2" />{neckV}
        </g>
      );
    case 'of_schoolthai':
      return (
        <g>
          <path d={TORSO} fill="#fff" stroke="#d9dee8" strokeWidth="1" />
          <path d="M38 86 L44 98 L50 90 L56 98 L62 86 L56 84 L50 88 L44 84 Z" fill="#fff" stroke="#c9d1e0" strokeWidth=".8" strokeLinejoin="round" />{neckV}
          <path d="M50 92 V120" stroke="#d9dee8" strokeWidth="1" />{[98, 106, 114].map((y) => <circle key={y} cx="50" cy={y} r="1.2" fill="#c9a227" />)}
          <rect x="62" y="104" width="12" height="7" rx="1" fill="#e9f2ff" stroke="#9db4d6" strokeWidth=".7" />
        </g>
      );
    case 'of_sweater':
      return (
        <g>
          <path d={TORSO} fill="#4a9be0" />
          {[[34, 106], [50, 106], [66, 106], [42, 116], [58, 116], [26, 116], [74, 116]].map(([x, y], i) => <path key={i} d={`M${x} ${y - 5} L${x + 5} ${y} L${x} ${y + 5} L${x - 5} ${y} Z`} fill="#1f2a44" />)}
          <path d="M40 86 C44 96 56 96 60 86" fill="#3a82c6" stroke="#2b6aa6" strokeWidth="1.4" />{neckV}
        </g>
      );
    case 'of_overalls':
      return (
        <g>
          <path d={TORSO} fill="#f1f3f8" />
          <path d="M26 125 L30 100 L40 96 L40 125 Z" fill="#3b73c9" /><path d="M74 125 L70 100 L60 96 L60 125 Z" fill="#3b73c9" />
          <rect x="36" y="100" width="28" height="25" rx="3" fill="#3b73c9" />
          <path d="M36 100 L34 86 M64 100 L66 86" stroke="#3b73c9" strokeWidth="5" strokeLinecap="round" />
          <circle cx="37" cy="102" r="2" fill="#ffd43b" /><circle cx="63" cy="102" r="2" fill="#ffd43b" />
        </g>
      );
    case 'of_jersey':
      return (
        <g>
          <path d={TORSO} fill="#e5484d" />
          <path d="M6 125 C6 108 12 98 20 92 L24 125 Z" fill="#fff" opacity=".9" /><path d="M94 125 C94 108 88 98 80 92 L76 125 Z" fill="#fff" opacity=".9" />
          <text x="50" y="118" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff" fontFamily="sans-serif">10</text>
          <path d="M40 86 C44 94 56 94 60 86" fill="#fff" stroke="#fff" strokeWidth="2" />{neckV}
        </g>
      );
    case 'of_denim':
      return (
        <g>
          <path d={TORSO} fill="#4a78b8" stroke="#2f5288" strokeWidth="1" />
          <path d="M50 92 V125 M36 96 L34 125 M64 96 L66 125" stroke="#2f5288" strokeWidth="1.2" />
          <path d="M36 88 L46 104 L50 92 Z M64 88 L54 104 L50 92 Z" fill="#5a88c8" stroke="#2f5288" strokeWidth="1" strokeLinejoin="round" />
          <path d="M42 88 C46 96 54 96 58 88 L50 100 Z" fill="#fff" />
          <rect x="24" y="104" width="10" height="9" rx="1" fill="none" stroke="#2f5288" strokeWidth="1" strokeDasharray="2 1.4" />
        </g>
      );
    case 'of_hawaii':
      return (
        <g>
          <path d={TORSO} fill="#17a2b8" />
          {[[30, 104], [64, 108], [44, 118], [74, 96], [24, 120]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-3" rx="1.8" ry="3" fill="#ffd43b" transform={`rotate(${a})`} />)}<circle r="1.4" fill="#e5484d" /></g>)}
          <path d="M42 86 L50 104 L58 86 Z" fill={shade(c.skin, 0.1)} /><path d="M36 86 L50 108 M64 86 L50 108" stroke="#0c7a8a" strokeWidth="2" />
        </g>
      );
    case 'of_sailor':
      return (
        <g>
          <path d={TORSO} fill="#fff" stroke="#d9dee8" strokeWidth="1" />
          <path d="M30 86 L50 108 L70 86 L62 84 L50 96 L38 84 Z" fill="#1f3a7a" /><path d="M36 88 L50 104 L64 88" stroke="#fff" strokeWidth="1.2" fill="none" />
          <path d="M50 100 L44 108 L50 112 L56 108 Z" fill="#e5484d" />
        </g>
      );
    case 'of_wolftee':
      return (
        <g>
          <path d={TORSO} fill="#ff6fa5" />
          <path d="M40 86 C44 94 56 94 60 86" stroke="#d94f86" strokeWidth="2" fill="none" />
          <g transform="translate(50 108)">
            <path d="M-12 -8 L-8 -16 L-4 -9 L4 -9 L8 -16 L12 -8 L10 4 L2 10 L-2 10 L-10 4 Z" fill="#fff" />
            <path d="M-6 -2 L-2 0 M6 -2 L2 0" stroke={INK} strokeWidth="1.6" strokeLinecap="round" /><path d="M-2 5 L0 7 L2 5" stroke={INK} strokeWidth="1.4" fill="none" />
          </g>
        </g>
      );
    case 'of_labcoat':
      return (
        <g>
          <path d={TORSO} fill="#f6f7fb" stroke="#d9dee8" strokeWidth="1" />
          <path d="M42 86 L50 120 L58 86 Z" fill="#8fd3f4" /><path d="M34 88 L46 108 L42 86 Z" fill="#e9ecf2" stroke="#d0d6e0" strokeWidth=".8" /><path d="M66 88 L54 108 L58 86 Z" fill="#e9ecf2" stroke="#d0d6e0" strokeWidth=".8" />
          <rect x="62" y="108" width="14" height="10" rx="1.5" fill="none" stroke="#c7cedb" strokeWidth="1" /><path d="M66 108 V102 M70 108 V100" stroke="#3b73c9" strokeWidth="1.6" />
        </g>
      );
    case 'of_scrubs':
      return (
        <g>
          <path d={TORSO} fill="#3fb59a" />
          <path d="M38 86 L50 106 L62 86 Z" fill={shade(c.skin, 0.1)} /><path d="M38 86 L50 106 L62 86" stroke="#2a8a74" strokeWidth="2" fill="none" />
          <rect x="60" y="106" width="14" height="10" rx="1.5" fill="#35a58b" stroke="#2a8a74" strokeWidth="1" />
        </g>
      );
    case 'of_chefcoat':
      return (
        <g>
          <path d={TORSO} fill="#fff" stroke="#d9dee8" strokeWidth="1" />
          <path d="M42 86 L50 96 L58 86" fill="#f1f3f8" stroke="#d9dee8" strokeWidth="1" />
          <path d="M50 96 V125" stroke="#d9dee8" strokeWidth="1.2" />{[[44, 100], [44, 110], [56, 100], [56, 110]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" fill="#1f3a7a" />)}
        </g>
      );
    case 'of_trackjacket':
      return (
        <g>
          <path d={TORSO} fill="#d62828" />
          <path d="M6 125 C6 108 12 98 20 92 L24 125 Z" fill="#fff" opacity=".95" /><path d="M94 125 C94 108 88 98 80 92 L76 125 Z" fill="#fff" opacity=".95" />
          <path d="M36 86 L46 90 L50 125 M64 86 L54 90 L50 125" stroke="#fff" strokeWidth="1.6" fill="none" /><path d="M50 92 V125" stroke="#fde68a" strokeWidth="1.6" />{neckV}
        </g>
      );
    case 'of_leather':
      return (
        <g>
          <path d={TORSO} fill="#26262e" stroke="#0f0f14" strokeWidth="1" />
          <path d="M38 86 L46 100 L50 88 L54 100 L62 86 L50 125 Z" fill="#1c1c22" />
          <path d="M36 88 L26 108 L36 112 L44 100 Z M64 88 L74 108 L64 112 L56 100 Z" fill="#33333d" stroke="#0f0f14" strokeWidth=".8" />
          <path d="M50 100 V125" stroke="#9aa3b2" strokeWidth="1.2" />{[[26, 108], [74, 108]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.4" fill="#c9d1e0" />)}
          <path d="M42 86 L50 100 L58 86 Z" fill="#e5e7ee" />
        </g>
      );
    case 'of_police':
      return (
        <g>
          <path d={TORSO} fill="#2a4a8f" />
          <path d="M38 86 L44 98 L50 90 L56 98 L62 86 L56 84 L50 88 L44 84 Z" fill="#fff" />{neckV}
          <path d="M50 92 V125" stroke="#1d3568" strokeWidth="1.2" />{[100, 108, 116].map((y) => <circle key={y} cx="50" cy={y} r="1.3" fill="#facc15" />)}
          <path d="M60 102 l3 -2 l3 2 v6 l-3 2 l-3 -2 Z" fill="#facc15" stroke="#a16207" strokeWidth=".6" />
          <path d="M28 92 H38" stroke="#facc15" strokeWidth="2" />
        </g>
      );
    case 'of_suit':
      return (
        <g>
          <path d={TORSO} fill="#25316b" />
          <path d="M42 86 L50 112 L58 86 Z" fill="#fff" />
          <path d="M50 94 L46 100 L50 118 L54 100 Z" fill="#c92a2a" />
          <path d="M34 90 L44 125 L50 112 L40 86 Z" fill="#1c2656" /><path d="M66 90 L56 125 L50 112 L60 86 Z" fill="#1c2656" />
        </g>
      );
    case 'of_ninja':
      return (
        <g>
          <path d={TORSO} fill="#23232b" />
          <path d="M34 88 L50 112 L66 88" stroke="#3a3a46" strokeWidth="2" fill="none" /><path d="M24 108 H76" stroke="#d62828" strokeWidth="5" />
          <path d="M70 108 L82 118 M70 108 L80 124" stroke="#d62828" strokeWidth="3" strokeLinecap="round" />
          <path d="M42 86 C46 92 54 92 58 86 L56 82 L44 82 Z" fill="#23232b" />
        </g>
      );
    case 'of_kimono':
      return (
        <g>
          <path d={TORSO} fill="#c2255c" />
          <path d="M40 86 L62 125 L74 125 L50 92 Z" fill="#f8d7e3" /><path d="M60 86 L38 125 L26 125 L50 92 Z" fill="#e64980" />
          <rect x="30" y="108" width="40" height="8" fill="#ffd43b" transform="rotate(-6 50 112)" />
          {[[20, 106], [78, 110], [34, 120]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.4" fill="#fff" opacity=".7" />)}
        </g>
      );
    case 'of_sabai': // ชุดไทยสไบ
      return (
        <g>
          <path d={TORSO} fill="#7c3aed" />
          <path d="M20 125 C20 104 30 92 44 86 L62 125 Z" fill="#facc15" opacity=".95" /><path d="M20 125 C20 104 30 92 44 86 L48 88 C36 96 30 108 32 125 Z" fill="#c9a227" />
          <path d="M44 86 L62 125" stroke="#a16207" strokeWidth="1.4" />
          {[[34, 108], [42, 100], [38, 118], [52, 112], [48, 122]].map(([x, y], i) => <path key={i} transform={`translate(${x} ${y})`} d={starPath(2.6)} fill="#fff7cc" />)}
        </g>
      );
    case 'of_cloak':
      return (
        <g>
          <path d="M2 125 C2 96 22 80 50 80 C78 80 98 96 98 125 Z" fill="#5f3dc4" />
          <path d="M24 90 C30 80 70 80 76 90 L72 100 C60 94 40 94 28 100 Z" fill="#4c2fa6" />
          <path d="M40 86 C44 94 56 94 60 86 L56 100 C52 104 48 104 44 100 Z" fill="#241a4a" />
          <circle cx="50" cy="100" r="4" fill="#ffd43b" stroke="#c9a227" strokeWidth="1.2" />
        </g>
      );
    case 'of_wizardrobe':
      return (
        <g>
          <path d="M2 125 C2 98 24 82 50 82 C76 82 98 98 98 125 Z" fill="#2f3b9a" />
          <path d="M40 86 C44 94 56 94 60 86 L56 125 H44 Z" fill="#1d2566" />
          <path d="M2 125 C2 112 8 104 14 100 L22 125 Z M98 125 C98 112 92 104 86 100 L78 125 Z" fill="#3a47b4" />
          {[[20, 108], [78, 114], [30, 120], [66, 104], [88, 120]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><Pulse on={c.anim} min={0.6} max={1.1} dur={2} begin={i * 0.4} twinkle><path d={starPath(3)} fill="#fff3a8" /></Pulse></g>)}
          <path d="M44 100 H56" stroke="#facc15" strokeWidth="2" />
        </g>
      );
    case 'of_tuxedo':
      return (
        <g>
          <path d={TORSO} fill="#1f1f2b" />
          <path d="M40 86 L50 118 L60 86 Z" fill="#fff" />
          <path d="M36 88 L46 125 L50 110 Z" fill="#111" /><path d="M64 88 L54 125 L50 110 Z" fill="#111" />
          <path d="M44 92 L50 95 L44 99 Z M56 92 L50 95 L56 99 Z" fill="#c92a2a" /><circle cx="50" cy="95" r="1.8" fill="#9c1c1c" />
          {[104, 112].map((y) => <circle key={y} cx="50" cy={y} r="1.3" fill="#1f1f2b" />)}
        </g>
      );
    case 'of_hero':
      return (
        <g>
          <path d={TORSO} fill="#2563eb" />
          <path d="M40 86 C44 94 56 94 60 86 L64 96 H36 Z" fill="#1d4ed8" />
          <path d="M50 98 L58 106 L50 120 L42 106 Z" fill="#facc15" stroke="#a16207" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M47 106 H53 M50 102 V112" stroke="#d62828" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 118 H76" stroke="#d62828" strokeWidth="4" />{neckV}
        </g>
      );
    case 'of_astronaut':
      return (
        <g>
          <path d={TORSO} fill="#f1f3f8" stroke="#c9d1e0" strokeWidth="1.2" />
          <path d="M34 90 C40 82 60 82 66 90 L62 98 C54 94 46 94 38 98 Z" fill="#dfe4ee" stroke="#aeb7c8" strokeWidth="1.2" />
          <rect x="36" y="104" width="28" height="16" rx="3" fill="#cfd6e4" stroke="#aeb7c8" strokeWidth="1" />
          <circle cx="43" cy="112" r="2.4" fill="#e5484d" /><circle cx="50" cy="112" r="2.4" fill="#3b82f6" /><circle cx="57" cy="112" r="2.4" fill="#22c55e" />
          <rect x="10" y="108" width="14" height="6" rx="2" fill="#d62828" /><path d="M6 125 C6 118 8 112 12 108" stroke="#c9d1e0" strokeWidth="1" fill="none" />
        </g>
      );
    case 'of_samurai':
      return (
        <g>
          <path d={TORSO} fill="#7a1f2b" stroke="#4a1018" strokeWidth="1.2" />
          {[96, 104, 112, 120].map((y, i) => <path key={y} d={`M${12 + i * 3} ${y} H${88 - i * 3}`} stroke="#d9a53a" strokeWidth="1.6" />)}
          <path d="M6 125 C6 106 14 96 24 92 L26 106 L12 125 Z M94 125 C94 106 86 96 76 92 L74 106 L88 125 Z" fill="#3a3a48" stroke="#1d1d26" strokeWidth="1.2" />
          <path d="M42 86 C46 94 54 94 58 86 L56 92 L44 92 Z" fill="#d9a53a" />
        </g>
      );
    case 'of_armor':
      return (
        <g>
          <path d={TORSO} fill="#aeb7c4" stroke="#6c7686" strokeWidth="1.4" />
          <path d="M6 125 C6 106 14 96 24 92 L30 108 L12 125 Z" fill="#c3cad6" stroke="#6c7686" strokeWidth="1.2" />
          <path d="M94 125 C94 106 86 96 76 92 L70 108 L88 125 Z" fill="#c3cad6" stroke="#6c7686" strokeWidth="1.2" />
          <path d="M50 92 V125 M34 104 H66" stroke="#6c7686" strokeWidth="1.6" />
          {[[34, 100], [66, 100], [40, 118], [60, 118]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" fill="#6c7686" />)}
          <path d="M42 86 C46 92 54 92 58 86 L56 82 L44 82 Z" fill="#8f98a8" />
        </g>
      );
    case 'of_kingrobe':
      return (
        <g>
          <path d="M2 125 C2 96 22 80 50 80 C78 80 98 96 98 125 Z" fill="#b01e3a" />
          <path d="M20 88 C30 80 70 80 80 88 L82 104 C70 96 30 96 18 104 Z" fill="#f6f1e6" />
          {[[28, 92], [38, 95], [50, 96], [62, 95], [72, 92]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="2" fill="#2a1d22" /><path d={`M${x - 1.6} ${y + 1} v3 M${x + .2} ${y + 1} v4 M${x + 1.8} ${y + 1} v3`} stroke="#2a1d22" strokeWidth=".8" /></g>)}
          <path d="M42 86 C46 94 54 94 58 86 L56 108 H44 Z" fill="#7a1228" /><rect x="40" y="104" width="20" height="4" fill="#ffd43b" />
        </g>
      );
    case 'of_neon':
      return (
        <g>
          <path d={TORSO} fill="#14142b" />
          <Blink on={c.anim} values=".6;1;.6" dur={1.6}>
            <path d="M6 125 C6 100 26 86 50 86 C74 86 94 100 94 125" stroke="#4dd0e1" strokeWidth="2" fill="none" />
            <path d="M40 86 C44 94 56 94 60 86" stroke="#ff4fa3" strokeWidth="2" fill="none" />
            <path d="M50 94 V125 M30 104 L70 104 M26 116 L74 116" stroke="#ff4fa3" strokeWidth="1.6" fill="none" />
          </Blink>
          <Move on={c.anim} type="translate" values="0 0;0 24;0 0" dur={3}><rect x="8" y="100" width="84" height="2.4" fill="#7affc8" opacity=".5" /></Move>
        </g>
      );
    case 'of_gold':
      return (
        <g>
          <path d={TORSO} fill="#e0a526" />
          <path d="M42 86 L50 112 L58 86 Z" fill="#fff6d6" /><path d="M50 94 L46 100 L50 118 L54 100 Z" fill="#c92a2a" />
          <path d="M34 90 L44 125 L50 112 L40 86 Z" fill="#c9891a" /><path d="M66 90 L56 125 L50 112 L60 86 Z" fill="#c9891a" />
          <path d="M16 112 L24 104 M84 112 L76 104" stroke="#fff3bf" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    default: // of_tee_orange
      return <g><path d={TORSO} fill="#f5a623" />{neckV}<path d="M40 86 C44 94 56 94 60 86" stroke="#d4861a" strokeWidth="2" fill="none" /></g>;
  }
};

// ================================================================ ของประดับ: ชั้นหลังตัว
export const AccessoryBack: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  switch (id) {
    case 'ac_surfboard':
      return (
        <g transform="rotate(12 80 70)">
          <path d="M78 18 C90 40 90 100 78 128 C66 100 66 40 78 18 Z" fill="#ffd43b" stroke="#d9a400" strokeWidth="1.2" />
          <path d="M78 20 V126" stroke="#e5484d" strokeWidth="3" /><path d="M72 40 H84 M71 70 H85" stroke="#fff" strokeWidth="1.6" opacity=".7" />
        </g>
      );
    case 'ac_cape':
      return <g><path d="M24 84 C8 100 4 118 2 125 H98 C96 118 92 100 76 84 Z" fill="#d62828" stroke="#8a1010" strokeWidth="1.1" /><path d="M30 92 C22 104 18 116 16 125 M70 92 C78 104 82 116 84 125" stroke="#a31515" strokeWidth="1.2" fill="none" /></g>;
    case 'ac_katana':
      return (
        <g transform="rotate(-36 50 90)">
          <rect x="47" y="2" width="6" height="98" rx="2" fill="#2a2f3a" /><rect x="46" y="62" width="8" height="3" fill="#c9a227" />
          <rect x="47.5" y="100" width="5" height="22" rx="2" fill="#7a1228" /><rect x="44" y="97" width="12" height="4" rx="1.4" fill="#c9a227" />
        </g>
      );
    case 'ac_guitar':
      return (
        <g transform="rotate(24 50 80)">
          <rect x="46" y="-6" width="5" height="52" rx="1.4" fill="#5a3a22" /><rect x="44" y="-10" width="9" height="10" rx="2" fill="#3a2414" />
          <path d="M48.5 44 C34 44 30 58 38 64 C28 72 32 94 48.5 94 C65 94 69 72 59 64 C67 58 63 44 48.5 44 Z" fill="#d97b43" stroke="#7c3a14" strokeWidth="1.4" />
          <circle cx="48.5" cy="70" r="5" fill="#2a1d22" /><path d="M48.5 46 V88" stroke="#f3e9d2" strokeWidth=".7" />
        </g>
      );
    case 'ac_wings_angel':
      return (
        <g>
          <Move on={c.anim} type="scale" values="1 1;1.04 .96;1 1" dur={2.6}>
            <path d="M42 90 C28 60 6 54 -2 68 C8 70 10 78 8 84 C16 82 20 88 18 96 C28 90 36 96 42 106 Z" fill="#fff" stroke="#cfd6e4" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M58 90 C72 60 94 54 102 68 C92 70 90 78 92 84 C84 82 80 88 82 96 C72 90 64 96 58 106 Z" fill="#fff" stroke="#cfd6e4" strokeWidth="1.2" strokeLinejoin="round" />
          </Move>
        </g>
      );
    case 'ac_wings_demon':
      return (
        <g>
          <path d="M42 92 C30 62 10 44 -4 52 C4 58 4 64 2 70 C10 66 16 70 16 78 C22 74 28 80 26 88 C32 84 38 90 42 104 Z" fill="#7a1228" stroke="#3a0a14" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M58 92 C70 62 90 44 104 52 C96 58 96 64 98 70 C90 66 84 70 84 78 C78 74 72 80 74 88 C68 84 62 90 58 104 Z" fill="#7a1228" stroke="#3a0a14" strokeWidth="1.2" strokeLinejoin="round" />
        </g>
      );
    default:
      return null;
  }
};

// ================================================================ ของประดับ: ชั้นหน้า
export const AccessoryFront: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const bf = (x: number, y: number, col: string, s: number, b: number) => (
    <g key={`${x}${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
      <Move on={c.anim} type="translate" values="0 0;4 -5;-3 -9;0 0" dur={4 + b} begin={b}>
        <Move on={c.anim} type="scale" values="1 1;.4 1;1 1" dur={0.5}>
          <path d="M0 0 C-7 -8 -12 2 -5 4 C-10 9 -2 13 0 6 C2 13 10 9 5 4 C12 2 7 -8 0 0 Z" fill={col} stroke="rgba(0,0,0,.25)" strokeWidth=".5" /><path d="M0 -2 V8" stroke={INK} strokeWidth="1" />
        </Move>
      </Move>
    </g>
  );
  switch (id) {
    case 'ac_scarf':
      return (
        <g>
          <path d="M34 84 C42 94 58 94 66 84 L68 92 C58 102 42 102 32 92 Z" fill="#d6336c" />
          <path d="M58 94 L66 118 L56 120 L52 98 Z" fill="#c2255c" />
          <path d="M40 90 L44 96 M50 92 L52 98 M60 90 L62 96" stroke="#f783ac" strokeWidth="1.4" />
        </g>
      );
    case 'ac_bowtie':
      return <g><path d="M50 90 L38 84 L38 98 Z M50 90 L62 84 L62 98 Z" fill="#e5484d" stroke="#9c1c1c" strokeWidth="1" /><circle cx="50" cy="90" r="3" fill="#c92a2a" /></g>;
    case 'ac_necktie':
      return <g><path d="M46 88 H54 L52 92 L56 112 L50 118 L44 112 L48 92 Z" fill="#c92a2a" stroke="#7a1313" strokeWidth="1" strokeLinejoin="round" /><path d="M46 100 L54 104" stroke="#e86a6a" strokeWidth="1.4" /></g>;
    case 'ac_necklace':
      return (
        <g>
          <path d="M38 85 C42 104 58 104 62 85" stroke="#ffd43b" strokeWidth="1.6" fill="none" />
          <path d="M50 104 l4 4 l-4 6 l-4 -6 Z" fill="#4dd0e1" stroke="#16a3b8" strokeWidth="1" />
        </g>
      );
    case 'ac_earrings':
      return <g><circle cx="29" cy="60" r="3.2" fill="none" stroke="#ffd43b" strokeWidth="1.8" /><circle cx="71" cy="60" r="3.2" fill="none" stroke="#ffd43b" strokeWidth="1.8" /></g>;
    case 'ac_headset':
      return (
        <g>
          <path d="M34 88 C34 108 66 108 66 88" stroke="#3b3b4f" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <rect x="28" y="82" width="9" height="13" rx="4" fill="#7048e8" stroke="#3b3b4f" strokeWidth="1.6" /><rect x="63" y="82" width="9" height="13" rx="4" fill="#7048e8" stroke="#3b3b4f" strokeWidth="1.6" />
        </g>
      );
    case 'ac_lollipop':
      return (
        <g>
          <path d="M58 68 L74 84" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="78" cy="88" r="9" fill="#ff6b9d" stroke="#d6336c" strokeWidth="1.2" />
          <path d="M78 88 m-5 0 a5 5 0 1 1 10 0 a3 3 0 1 1 -6 0 a1.6 1.6 0 1 1 3.2 0" stroke="#fff" strokeWidth="1.6" fill="none" />
        </g>
      );
    case 'ac_gum':
      return (
        <g transform="translate(58 68)">
          <Move on={c.anim} type="scale" values="0.5;1.2;0.5" dur={2.2}>
            <circle cx="6" cy="2" r="7" fill="#ff8fc0" stroke="#d6336c" strokeWidth="1" /><path d="M2 -1 Q4 -4 7 -3" stroke="rgba(255,255,255,.7)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </Move>
        </g>
      );
    case 'ac_medal':
      return (
        <g>
          <path d="M44 86 L50 106 L56 86" fill="#2563eb" /><path d="M44 86 L50 106 L56 86" stroke="#1e3a8a" strokeWidth="1" fill="none" />
          <circle cx="50" cy="110" r="6.4" fill="#facc15" stroke="#a16207" strokeWidth="1.2" /><path d={starPath(3.6)} transform="translate(50 110)" fill="#fff7cc" />
        </g>
      );
    case 'ac_lei':
      return (
        <g>
          <path d="M32 86 C34 110 66 110 68 86" stroke="#2f9e44" strokeWidth="3" fill="none" />
          {[[34, 94, '#ff8fab'], [38, 102, '#ffd43b'], [46, 107, '#fff'], [54, 107, '#ff8fab'], [62, 102, '#ffd43b'], [66, 94, '#fff']].map(([x, y, col], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cy="-2.6" rx="1.8" ry="2.8" fill={col as string} transform={`rotate(${a})`} />)}<circle r="1.2" fill="#f59f00" /></g>
          ))}
        </g>
      );
    case 'ac_rose':
      return (
        <g>
          <path d="M58 66 L76 76" stroke="#2f9e44" strokeWidth="2.2" strokeLinecap="round" /><path d="M66 71 q6 -2 6 -8 q-6 2 -6 8" fill="#51cf66" />
          <circle cx="78" cy="77" r="5.4" fill="#e03131" /><path d="M75 75 q3 4 6 0 M76 79 q2 -3 5 0" stroke="#a61e1e" strokeWidth="1" fill="none" />
        </g>
      );
    case 'ac_pipe':
      return (
        <g>
          <path d="M57 67 H67 Q72 67 72 72" stroke="#6b4a2f" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <path d="M68 70 H78 V82 H68 Z" fill="#8a5a36" stroke="#5a3a22" strokeWidth="1.2" />
          <g transform="translate(73 62)"><Move on={c.anim} from="0 0" to="2 -14" dur={2.4} fade><path d="M0 0 q-3 -4 1 -8 q3 -3 0 -7" stroke="rgba(255,255,255,.8)" strokeWidth="1.6" fill="none" strokeLinecap="round" /></Move></g>
        </g>
      );
    case 'ac_balloon':
      return (
        <g transform="translate(14 40)">
          <Move on={c.anim} type="translate" values="0 0;2 -6;0 0" dur={3.2}>
            <path d="M0 40 Q-3 52 2 64" stroke="#8a93a3" strokeWidth=".9" fill="none" />
            <ellipse cx="0" cy="22" rx="10" ry="13" fill="#e5484d" stroke="#9c1c1c" strokeWidth="1" /><path d="M-3 36 L3 36 L0 40 Z" fill="#c92a2a" /><path d="M-5 14 Q-3 9 1 8" stroke="rgba(255,255,255,.6)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </Move>
        </g>
      );
    case 'ac_butterflies':
      return <g>{bf(10, 28, '#4dabf7', 1.1, 0)}{bf(90, 40, '#f06595', 0.9, 1.2)}{bf(14, 70, '#ffd43b', 0.8, 2.4)}</g>;
    case 'ac_sparkles':
      return (
        <g fill="#fff3bf" stroke="#ffd43b" strokeWidth=".6">
          {[[12, 20, 1.2], [88, 24, 1], [18, 60, .8], [86, 62, 1.1], [50, 6, .8], [92, 90, .7]].map(([x, y, s], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}><Pulse on={c.anim} min={0.3} max={1.2} dur={1.6} begin={i * 0.37} twinkle><path d={starPath(7)} /></Pulse></g>
          ))}
        </g>
      );
    case 'ac_catpet':
      return (
        <g transform="translate(50 20)">
          <ellipse cx="0" cy="6" rx="12" ry="9" fill="#f0a64a" stroke="#a9651a" strokeWidth="1.1" />
          <path d="M-9 -2 L-10 -12 L-3 -6 Z M9 -2 L10 -12 L3 -6 Z" fill="#f0a64a" stroke="#a9651a" strokeWidth="1.1" strokeLinejoin="round" />
          <circle cx="-4" cy="3" r="1.4" fill={INK} /><circle cx="4" cy="3" r="1.4" fill={INK} /><path d="M-1.4 6 L1.4 6 L0 7.6 Z" fill="#ff8fab" />
          <path d="M-8 7 L-14 6 M-8 9 L-14 10 M8 7 L14 6 M8 9 L14 10" stroke="#a9651a" strokeWidth=".7" />
          <path d="M12 8 C20 4 22 -2 18 -6" stroke="#f0a64a" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'ac_dogpet':
      return (
        <g transform="translate(76 88)">
          <ellipse cx="0" cy="6" rx="9" ry="8" fill="#e8c28a" stroke="#a9791a" strokeWidth="1.1" />
          <circle cx="0" cy="-5" r="8" fill="#e8c28a" stroke="#a9791a" strokeWidth="1.1" />
          <path d="M-8 -8 C-14 -6 -13 4 -9 4 Z M8 -8 C14 -6 13 4 9 4 Z" fill="#a9791a" />
          <circle cx="-3" cy="-6" r="1.3" fill={INK} /><circle cx="3" cy="-6" r="1.3" fill={INK} /><ellipse cx="0" cy="-2.4" rx="2.2" ry="1.6" fill={INK} />
          <path d="M0 -1 V2" stroke={INK} strokeWidth=".8" /><path d="M-2 3 Q0 8 2 3 Z" fill="#ff8fab" />
        </g>
      );
    case 'ac_parrot':
      return (
        <g transform="translate(74 90)">
          <ellipse cx="0" cy="4" rx="7" ry="10" fill="#e5484d" /><circle cx="0" cy="-8" r="6" fill="#e5484d" />
          <path d="M5 -9 L11 -7 L5 -5 Z" fill="#ffd43b" /><circle cx="1.5" cy="-9" r="1.4" fill="#fff" /><circle cx="1.8" cy="-9" r="0.7" fill={INK} />
          <path d="M-6 8 C-14 12 -12 22 -6 20 Z" fill="#2f9e44" /><path d="M-7 4 C-12 6 -12 12 -7 12 Z" fill="#4dabf7" />
        </g>
      );
    default:
      return null;
  }
};

void heartPath;
