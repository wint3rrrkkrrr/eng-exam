// components/avatar/layersBackdrop.tsx — ฉากหลังอวตาร (SVG ล้วน) แบบ "เซ็ตกลางวัน/กลางคืน"
// ทุกธีมมี 2 เวอร์ชัน (ท้องฟ้า ดวงอาทิตย์/ดวงจันทร์ ไฟหน้าต่าง ฯลฯ) — เกมสลับให้อัตโนมัติตามเฟส (กลางคืน = เฟสกลางคืน)
// ภาพกลางวันวาดด้วยสีจริง ส่วนกลางคืนใช้ฟิลเตอร์ลดแสงสีน้ำเงินครอบ แล้ววาดไฟ/ดาว/พระจันทร์ทับด้านบน
import React from 'react';
import { Blink, Move } from './anim';

interface O { night: boolean; anim: boolean; uid: string }

interface Scene {
  sky: [string, string, string, string]; // [กลางวันบน, กลางวันล่าง, กลางคืนบน, กลางคืนล่าง]
  sun?: [number, number, number] | null;
  moon?: [number, number, number] | null;
  moonFill?: string;
  sunFill?: string;
  clouds?: boolean;
  starsDay?: boolean;
  far?: (o: O) => React.ReactNode; // ถูกฟิลเตอร์ให้มืดตอนกลางคืน
  lights?: (o: O) => React.ReactNode; // ไม่โดนฟิลเตอร์ (ไฟ/เรืองแสง/อนิเมชัน)
}

const STARS: [number, number, number][] = [[12, 12, 1.2], [30, 26, 0.9], [46, 8, 1.4], [64, 14, 1], [86, 10, 1.2], [92, 34, 0.9], [8, 44, 1], [22, 58, 0.8], [72, 40, 0.9], [56, 30, 0.8], [38, 44, 0.7]];
const SKY6 = ['#ff5d5d', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#9775fa'];
const HOUSES: [number, number, number][] = [[6, 70, 24], [38, 62, 26], [72, 68, 24]];
const TOWNS: [number, number, number][] = [[2, 60, 16], [20, 48, 18], [40, 66, 14], [58, 44, 20], [80, 58, 18]];

const Hill: React.FC<{ a?: string; b?: string; c?: string }> = ({ a = '#69b65c', b = '#58a64d', c = '#4f9a45' }) => (
  <g><ellipse cx="14" cy="112" rx="46" ry="22" fill={a} /><ellipse cx="86" cy="114" rx="50" ry="24" fill={b} /><ellipse cx="50" cy="132" rx="70" ry="22" fill={c} /></g>
);

const SCENES: Record<string, Scene> = {
  bg_meadow: { sky: ['#6fc8f2', '#c9edfb', '#0f1640', '#2a2f6b'], clouds: true, far: () => <Hill /> },

  bg_village: {
    sky: ['#7ec8f0', '#dcf2fb', '#0f1640', '#2c2f6e'], clouds: true,
    far: () => (
      <g>
        <Hill a="#6dba5f" b="#5aa84f" c="#4f9a45" />
        {HOUSES.map(([x, y, w], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height="26" fill="#f1d9b0" stroke="#b58b52" strokeWidth=".8" />
            <path d={`M${x - 3} ${y} L${x + w / 2} ${y - 13} L${x + w + 3} ${y} Z`} fill={i % 2 ? '#c0502f' : '#8a4b2a'} />
            <rect x={x + w / 2 - 3} y={y + 6} width="6" height="7" fill="#a9d6ee" stroke="#7a5a30" strokeWidth=".6" />
            <rect x={x + w / 2 - 3} y={y + 17} width="6" height="9" fill="#7a5a30" />
          </g>
        ))}
      </g>
    ),
    lights: ({ night }) => night ? <g>{HOUSES.map(([x, y, w], i) => <g key={i}><circle cx={x + w / 2} cy={y + 9.5} r="7" fill="#ffd36b" opacity=".25" /><rect x={x + w / 2 - 3} y={y + 6} width="6" height="7" fill="#ffd36b" /></g>)}</g> : null,
  },

  bg_castle: {
    sky: ['#86cdf2', '#e1f4fb', '#0e1238', '#2a2c66'], clouds: true,
    far: () => (
      <g>
        <Hill a="#6dba5f" b="#5aa84f" c="#4f9a45" />
        <rect x="34" y="52" width="32" height="46" fill="#b6bccb" stroke="#7b8497" strokeWidth="1" />
        <rect x="14" y="40" width="16" height="58" fill="#c3c9d6" stroke="#7b8497" strokeWidth="1" /><rect x="70" y="40" width="16" height="58" fill="#c3c9d6" stroke="#7b8497" strokeWidth="1" />
        <path d="M11 40 L22 22 L33 40 Z M67 40 L78 22 L89 40 Z" fill="#b03a48" /><path d="M22 22 V12 L30 15 L22 18 M78 22 V12 L86 15 L78 18" fill="#e5484d" stroke="#5a2a30" strokeWidth=".8" />
        <path d="M34 52 h4 v-4 h4 v4 h4 v-4 h4 v4 h4 v-4 h4 v4 h4 v-4 h4 v4" fill="#b6bccb" stroke="#7b8497" strokeWidth=".8" />
        <path d="M44 98 V82 A6 6 0 0 1 56 82 V98 Z" fill="#5a3a22" />
        {[[22, 60], [78, 60], [22, 78], [78, 78]].map(([x, y], i) => <rect key={i} x={x - 2} y={y} width="4" height="7" rx="2" fill="#4a5568" />)}
      </g>
    ),
    lights: ({ night }) => night ? <g>{[[22, 60], [78, 60], [22, 78], [78, 78]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y + 3.5} r="6" fill="#ffd36b" opacity=".25" /><rect x={x - 2} y={y} width="4" height="7" rx="2" fill="#ffd36b" /></g>)}<path d="M44 98 V82 A6 6 0 0 1 56 82 V98 Z" fill="#ffb347" opacity=".6" /></g> : null,
  },

  bg_beach: {
    sky: ['#79d3fa', '#d8f4ff', '#0d1440', '#232b66'], clouds: true,
    far: () => (
      <g>
        <rect y="68" width="100" height="34" fill="#2fa7d8" />
        <path d="M0 76 Q12 70 25 76 T50 76 T75 76 T100 76" stroke="#fff" strokeWidth="1.6" fill="none" opacity=".65" />
        <path d="M0 86 Q12 80 25 86 T50 86 T75 86 T100 86" stroke="#fff" strokeWidth="1.2" fill="none" opacity=".4" />
        <path d="M0 98 Q25 90 50 98 T100 96 V125 H0 Z" fill="#f2d49b" />
        <path d="M14 100 Q16 80 20 62" stroke="#8a5a2b" strokeWidth="3" fill="none" strokeLinecap="round" />
        {[[-26, -8], [-8, -16], [14, -10], [26, 2]].map(([dx, dy], i) => <path key={i} d={`M20 62 q${dx / 2} ${dy - 8} ${dx} ${dy + 6}`} stroke="#2f9e44" strokeWidth="3.4" fill="none" strokeLinecap="round" />)}
      </g>
    ),
    lights: ({ night }) => night ? <path d="M70 70 H86 M72 75 H84 M75 80 H81" stroke="#fff6c8" strokeWidth="1.6" strokeLinecap="round" opacity=".6" /> : null,
  },

  bg_forest: {
    sky: ['#a8dcae', '#e6f6da', '#0c1a2e', '#1c3a3a'],
    far: () => (
      <g>
        {[[10, 70, 22], [30, 60, 30], [70, 62, 28], [90, 72, 20]].map(([x, y, h], i) => (
          <g key={i}><rect x={x - 2} y={y + h / 2} width="4" height="16" fill="#6b4a2f" /><path d={`M${x} ${y - h / 2} L${x + 12} ${y + h / 2 + 4} L${x - 12} ${y + h / 2 + 4} Z`} fill={i % 2 ? '#2f8f55' : '#3aa564'} /></g>
        ))}
        <ellipse cx="50" cy="136" rx="80" ry="30" fill="#4a8f4f" />
      </g>
    ),
    lights: ({ night, anim }) => night ? (
      <g>
        {[[20, 90, 0], [44, 80, 1.3], [68, 96, 2.1], [84, 76, 0.7], [56, 104, 1.8]].map(([x, y, b], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <Move on={anim} type="translate" values="0 0;4 -5;-3 -9;0 0" dur={5 + i} begin={Number(b)}>
              <Blink on={anim} dur={1.6 + i * 0.3} begin={Number(b)}><circle r="4.4" fill="#d6ff6b" opacity=".3" /><circle r="1.5" fill="#f4ff9a" /></Blink>
            </Move>
          </g>
        ))}
      </g>
    ) : null,
  },

  bg_desert: {
    sky: ['#ffcf8a', '#fff0c8', '#0c1038', '#2b2a5c'],
    far: () => (
      <g>
        <path d="M0 90 Q25 76 50 88 T100 82 V125 H0 Z" fill="#efc07a" />
        <path d="M0 100 Q25 88 50 98 T100 94 V125 H0 Z" fill="#e8b36b" />
        <path d="M14 98 v-16 M14 90 h-5 v-6 M14 88 h5 v-8" stroke="#4f9a56" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M82 98 v-12 M82 92 h-4 v-5 M82 90 h4 v-6" stroke="#4f9a56" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </g>
    ),
  },

  bg_snow: {
    sky: ['#bcdcff', '#f1f8ff', '#0e1a44', '#2c4478'], clouds: true,
    far: () => (
      <g>
        <ellipse cx="50" cy="140" rx="88" ry="38" fill="#fff" /><ellipse cx="20" cy="112" rx="40" ry="14" fill="#f4f9ff" />
        {[[14, 78, 1], [36, 70, 1.15], [84, 76, 1.05]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <rect x="-2" y="22" width="4" height="12" fill="#6b4a2f" />
            <path d="M0 -16 L11 8 H-11 Z M0 -6 L13 20 H-13 Z" fill="#2f7a55" />
            <path d="M0 -16 L4.4 -6 H-4.4 Z M0 -6 L6 6 H-6 Z" fill="#fff" />
          </g>
        ))}
      </g>
    ),
    lights: ({ anim }) => (
      <g>
        {[[12, 0, 6, 0], [30, 8, 7, 2], [52, 0, 5.4, 1], [70, 4, 6.6, 3], [88, 0, 5.8, 1.6]].map(([x, y, d, b], i) => (
          <g key={i} transform={`translate(${x} ${y})`}><Move on={anim} from="0 -4" to="4 130" dur={d} begin={b}><circle r="1.4" fill="#fff" /></Move></g>
        ))}
      </g>
    ),
  },

  bg_mountain: {
    sky: ['#9ccdf2', '#e0f1fb', '#0c1640', '#27346a'], sun: [20, 22, 8], moon: [20, 22, 8], clouds: true,
    far: () => (
      <g>
        <path d="M-4 100 L28 42 L52 80 L70 50 L106 100 Z" fill="#7d8aa3" />
        <path d="M28 42 L36 56 L30 54 L26 60 L22 54 L18 56 Z M70 50 L77 62 L72 60 L68 66 L64 60 L62 62 Z" fill="#fff" />
        <ellipse cx="50" cy="132" rx="80" ry="34" fill="#5da05a" />
        <path d="M8 100 l4-10 l4 10 M84 98 l4-10 l4 10" stroke="#2f7a3f" strokeWidth="4" fill="none" strokeLinejoin="round" />
      </g>
    ),
  },

  bg_city: {
    sky: ['#8cc8ef', '#e0f1fb', '#0b0f2e', '#2a2c5e'], clouds: true,
    far: () => (
      <g>
        {TOWNS.map(([x, y, w], i) => (
          <g key={i}><rect x={x} y={y} width={w} height={125 - y} fill={i % 2 ? '#8a94b5' : '#9aa3c0'} />
            {[0, 1, 2, 3].map((r) => <rect key={r} x={x + 3} y={y + 6 + r * 10} width="3" height="4" fill="#cfe6f7" />)}</g>
        ))}
      </g>
    ),
    lights: ({ night }) => night ? (
      <g>{TOWNS.map(([x, y], i) => <g key={i}>{[0, 1, 2, 3].map((r) => (i + r) % 3 !== 0 && <rect key={r} x={x + 3} y={y + 6 + r * 10} width="3" height="4" fill="#ffd36b" />)}</g>)}</g>
    ) : null,
  },

  bg_stage: {
    sky: ['#b8325a', '#e86c8a', '#1a0614', '#3c0d28'], sun: null, moon: null,
    far: () => (
      <g>
        <path d="M0 0 H100 V10 Q50 22 0 10 Z" fill="#8a1d3a" />
        <path d="M0 0 V80 M12 0 V70 M88 0 V70 M100 0 V80" stroke="#6c1230" strokeWidth="4" />
        <rect y="104" width="100" height="21" fill="#7a4a2a" /><path d="M0 108 H100 M0 114 H100 M0 120 H100" stroke="#5a3418" strokeWidth=".8" />
      </g>
    ),
    lights: ({ night, anim }) => (
      <g>
        <Blink on={anim} values={night ? '.55;.9;.55' : '.25;.4;.25'} dur={3}><path d="M50 0 L16 104 H84 Z" fill="#fff6c8" opacity={night ? 0.5 : 0.28} /></Blink>
        <ellipse cx="50" cy="106" rx="40" ry="8" fill="#fff6c8" opacity={night ? 0.5 : 0.3} />
      </g>
    ),
  },

  bg_cherry: {
    sky: ['#ffd0e2', '#fff0f6', '#1c1136', '#3d2a66'], clouds: true,
    far: () => (
      <g>
        <path d="M96 125 C92 90 84 70 70 52 M86 90 C74 82 64 74 56 66" stroke="#6b4a3a" strokeWidth="4" fill="none" strokeLinecap="round" />
        {[[66, 46], [74, 38], [58, 58], [50, 64], [82, 52], [90, 40], [62, 34], [78, 62]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7 + (i % 3)} fill={i % 2 ? '#ffb7d0' : '#ff9ec0'} />)}
        <ellipse cx="50" cy="134" rx="80" ry="26" fill="#9bd48c" />
      </g>
    ),
    lights: ({ night, anim }) => (
      <g>
        {night && [[16, 40], [36, 54], [90, 84]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="8" fill="#ff7a5a" opacity=".3" /><ellipse cx={x} cy={y} rx="3.6" ry="4.6" fill="#ff5d4a" /><path d={`M${x} ${y - 4.6} V${y - 9}`} stroke="#ffd36b" strokeWidth="1" /></g>)}
        {[[10, 20, 5.2, 0], [34, 8, 6.8, 2], [52, 30, 7.4, 4], [18, 56, 6, 1], [70, 14, 7, 3]].map(([x, y, d, b], i) => (
          <g key={i} transform={`translate(${x} ${y})`}><Move on={anim} from="0 0" to="14 120" dur={d} begin={b}><ellipse rx="2.6" ry="1.6" fill="#ffc2d8" transform="rotate(30)" /></Move></g>
        ))}
      </g>
    ),
  },

  bg_candy: {
    sky: ['#ffc6e6', '#fff0fa', '#2a1650', '#5a3a8c'], clouds: true,
    far: () => (
      <g>
        {([[16, 52, '#ff6b9d'], [78, 44, '#4dd0e1'], [52, 34, '#ffd43b']] as [number, number, string][]).map(([x, y, c], i) => (
          <g key={i}><path d={`M${x} ${y + 8} V${y + 40}`} stroke="#fff" strokeWidth="2.4" /><circle cx={x} cy={y} r="9" fill={c} /><path d={`M${x} ${y} m-5 0 a5 5 0 1 1 10 0 a3 3 0 1 1 -6 0`} stroke="#fff" strokeWidth="1.6" fill="none" /></g>
        ))}
        <path d="M0 100 Q25 84 50 98 T100 94 V125 H0 Z" fill="#a8e6cf" /><path d="M0 112 Q25 100 50 110 T100 106 V125 H0 Z" fill="#ffb3d1" />
        {[[12, 106], [40, 116], [70, 104], [90, 114]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" fill={SKY6[i]} />)}
      </g>
    ),
  },

  bg_haunted: {
    sky: ['#9aa0b8', '#d6d9e6', '#1a1233', '#3b2a68'], sun: [78, 22, 8], moon: [76, 24, 11], clouds: true,
    far: () => (
      <g>
        <ellipse cx="50" cy="134" rx="80" ry="32" fill="#4a4a5e" />
        <path d="M20 100 V60 L36 46 L52 60 V100 Z" fill="#3a3550" /><path d="M16 60 L36 42 L56 60 Z" fill="#2a2640" />
        <rect x="28" y="66" width="6" height="8" fill="#5a5a74" /><rect x="40" y="76" width="6" height="8" fill="#5a5a74" />
        <path d="M82 100 V60 M82 74 L70 62 M82 68 L92 56" stroke="#2a2640" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    ),
    lights: ({ night, anim }) => night ? (
      <g>
        <rect x="28" y="66" width="6" height="8" fill="#ffcc4d" /><rect x="40" y="76" width="6" height="8" fill="#ffcc4d" />
        {[[60, 40, 0], [30, 30, 1.2]].map(([x, y, b], i) => (
          <g key={i} transform={`translate(${x} ${y})`}><Move on={anim} type="translate" values="0 0;6 -3;12 2;0 0" dur={4 + i} begin={Number(b)}><path d="M-5 0 Q-2 -4 0 0 Q2 -4 5 0 Q2 3 0 2 Q-2 3 -5 0 Z" fill="#120d22" /></Move></g>
        ))}
      </g>
    ) : null,
  },

  bg_temple: {
    sky: ['#79c3ee', '#ffe9bd', '#16113a', '#4a2c64'], sun: [22, 30, 9], moon: [22, 30, 8], clouds: true,
    far: () => (
      <g>
        <path d="M50 18 L54 46 L60 60 L56 60 L64 84 L36 84 L44 60 L40 60 L46 46 Z" fill="#e9b94a" stroke="#a9791a" strokeWidth="1" />
        <path d="M22 100 V84 L30 72 L38 84 V100 Z M62 100 V84 L70 72 L78 84 V100 Z" fill="#d6a03a" stroke="#a9791a" strokeWidth="1" />
        <rect y="98" width="100" height="27" fill="#8a6a3a" />
      </g>
    ),
    lights: ({ night }) => night ? <g>{[[14, 84], [86, 84], [50, 94]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="8" fill="#ff9a3a" opacity=".3" /><ellipse cx={x} cy={y} rx="3.4" ry="4.2" fill="#ffb347" /></g>)}</g> : null,
  },

  bg_volcano: {
    sky: ['#e58a5a', '#ffd9a8', '#1a0508', '#4a1118'], sun: [80, 20, 9], moon: [80, 20, 8], clouds: false,
    far: () => (
      <g>
        <path d="M-6 125 L32 56 L42 62 L50 52 L60 62 L68 56 L106 125 Z" fill="#5a3a3a" />
        <path d="M42 62 L50 52 L60 62 L56 70 L50 64 L46 72 Z" fill="#7a4a42" />
        <ellipse cx="50" cy="134" rx="80" ry="22" fill="#3a2a2a" />
      </g>
    ),
    lights: ({ night, anim }) => (
      <g>
        <path d="M50 64 L48 90 M54 70 L58 96" stroke="#ff7a1a" strokeWidth="3" strokeLinecap="round" opacity=".9" />
        <path d="M42 62 L50 52 L60 62 L56 70 L50 64 L46 72 Z" fill="#ff7a1a" />
        <Blink on={anim} values="1;.5;1" dur={1.6}><circle cx="50" cy="56" r={night ? 13 : 9} fill="#ff7a1a" opacity=".3" /></Blink>
        {night && [[44, 40, 0], [58, 44, 1], [52, 34, 2]].map(([x, y, b], i) => <g key={i} transform={`translate(${x} ${y})`}><Move on={anim} from="0 14" to="3 -30" dur={3} begin={Number(b)} fade><circle r="1.2" fill="#ffae42" /></Move></g>)}
      </g>
    ),
  },

  bg_underwater: {
    sky: ['#4fd0f0', '#1a78b8', '#06203d', '#031026'], sun: null, moon: null,
    far: () => (
      <g>
        <path d="M10 0 L30 125 M44 0 L66 125 M78 0 L96 125" stroke="#fff" strokeWidth="6" opacity=".1" />
        <ellipse cx="50" cy="132" rx="80" ry="26" fill="#e6cf8f" />
        <path d="M12 118 C8 100 16 92 12 78 M22 118 C26 102 18 96 24 84 M84 118 C80 104 88 96 84 84" stroke="#2f9e44" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <path d="M60 112 q6 -10 14 -2 q-6 4 -14 2 M74 110 l6 -3 l-1 6 Z" fill="#ff8a4b" />
      </g>
    ),
    lights: ({ night, anim }) => (
      <g>
        {night && [[30, 50, 0], [72, 40, 2]].map(([x, y, b], i) => (
          <g key={i} transform={`translate(${x} ${y})`}><Move on={anim} type="translate" values="0 0;0 -8;0 0" dur={4} begin={Number(b)}>
            <circle r="9" fill="#9cf6ff" opacity=".2" /><path d="M-5 0 A5 5 0 0 1 5 0 Z" fill="#9cf6ff" opacity=".85" /><path d="M-3 0 V8 M0 0 V10 M3 0 V8" stroke="#9cf6ff" strokeWidth="1" opacity=".8" />
          </Move></g>
        ))}
        {[[30, 90, 2.2, 5, 0], [58, 100, 1.6, 4, 2], [74, 96, 2.6, 6, 1], [88, 104, 1.4, 4.4, 3], [48, 110, 1.8, 5.2, 4]].map(([x, y, r, d, b], i) => (
          <g key={i} transform={`translate(${x} ${y})`}><Move on={anim} from="0 0" to="0 -90" dur={d} begin={b} fade><circle r={r} fill="none" stroke="#e6faff" strokeWidth=".9" /></Move></g>
        ))}
      </g>
    ),
  },

  bg_space: {
    sky: ['#6a4fc0', '#c48be8', '#02030f', '#0c0a2a'], sun: null, moon: null, starsDay: true,
    far: () => <g><circle cx="82" cy="40" r="9" fill="#f08a4b" /><ellipse cx="82" cy="40" rx="15" ry="3.6" fill="none" stroke="#ffd6a0" strokeWidth="1.4" /></g>,
  },

  bg_neon: {
    sky: ['#ffb0d8', '#ffe6f4', '#1a0b3d', '#5a1a7a'], sun: null, moon: null,
    lights: ({ night, anim, uid }) => {
      const line = night ? '#4dd0e1' : '#c06bd8';
      return (
        <g>
          <defs><clipPath id={`${uid}nc`}><rect y="72" width="100" height="53" /></clipPath></defs>
          <circle cx="50" cy="66" r="22" fill={night ? '#ff4fa3' : '#ff9ec9'} /><rect y="62" width="100" height="3" fill={night ? '#2a0d52' : '#ffe6f4'} /><rect y="68" width="100" height="2" fill={night ? '#2a0d52' : '#ffe6f4'} />
          <rect y="72" width="100" height="53" fill={night ? '#12062b' : '#f6d3ee'} />
          <g clipPath={`url(#${uid}nc)`}>
            <path d="M50 72 L-40 125 M50 72 L-10 125 M50 72 L20 125 M50 72 L50 125 M50 72 L80 125 M50 72 L110 125 M50 72 L140 125" stroke={line} strokeWidth=".9" opacity=".85" />
            <Move on={anim} from="0 0" to="0 18" dur={1.4}>{[72, 78, 86, 96, 108, 122, 138].map((y) => <path key={y} d={`M0 ${y - 18} H100`} stroke={line} strokeWidth=".9" opacity=".85" />)}</Move>
          </g>
        </g>
      );
    },
  },

  bg_aurora: {
    sky: ['#bfe0ff', '#eaf6ff', '#0a1233', '#101c44'], sun: [80, 20, 8], moon: [80, 20, 7],
    far: () => <g><ellipse cx="50" cy="138" rx="80" ry="32" fill="#f4f9ff" /><ellipse cx="14" cy="116" rx="40" ry="14" fill="#e6f0fb" /></g>,
    lights: ({ night, anim, uid }) => (
      <g opacity={night ? 1 : 0.35}>
        <defs><linearGradient id={`${uid}au`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3ef0a8" stopOpacity="0" /><stop offset=".5" stopColor="#3ef0a8" stopOpacity=".75" /><stop offset="1" stopColor="#8a6bff" stopOpacity="0" /></linearGradient></defs>
        <Move on={anim} type="translate" values="-6 0;6 4;-6 0" dur={7}><path d="M-10 60 C10 20 30 70 50 34 S90 60 110 24 V52 C90 86 70 40 50 74 S10 50 -10 92 Z" fill={`url(#${uid}au)`} /></Move>
        <Blink on={anim} values=".4;.9;.4" dur={5}><path d="M-10 40 C20 10 40 50 60 20 S95 40 110 8 V28 C90 60 70 24 55 48 S20 34 -10 64 Z" fill="#7affc8" opacity=".35" /></Blink>
      </g>
    ),
  },

  bg_bloodmoon: {
    sky: ['#e0702a', '#ffb870', '#26070d', '#3a0a14'], sun: [50, 52, 15], moon: [50, 40, 26], moonFill: '#b3202a', sunFill: '#ffd27a',
    far: () => (
      <g>
        <path d="M0 100 Q20 90 40 98 T100 94 V125 H0 Z" fill="#3a1a14" />
        <path d="M70 96 l4-10 l4 10 M30 98 l3-8 l3 8 M14 96 V80 M14 86 l-6 -6 M14 84 l6 -5" stroke="#2a0f0c" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    ),
  },

  bg_rainbow: {
    sky: ['#8fd8ff', '#e6f7ff', '#0f1a45', '#2a3470'], clouds: true,
    far: () => (
      <g>
        {SKY6.map((c, i) => <path key={c} d="M-6 118 A56 56 0 0 1 106 118" transform={`translate(0 ${-i * 5})`} fill="none" stroke={c} strokeWidth="5" />)}
        <ellipse cx="50" cy="140" rx="90" ry="32" fill="#7ad17a" />
      </g>
    ),
  },
};

export const BACKDROP_IDS = Object.keys(SCENES);

const Moon: React.FC<{ x: number; y: number; r: number; fill?: string }> = ({ x, y, r, fill = '#f4eecb' }) => (
  <g>
    <circle cx={x} cy={y} r={r + 6} fill={fill} opacity=".18" />
    <circle cx={x} cy={y} r={r} fill={fill} />
    <circle cx={x - r * 0.3} cy={y - r * 0.2} r={r * 0.22} fill="rgba(0,0,0,.12)" /><circle cx={x + r * 0.3} cy={y + r * 0.3} r={r * 0.16} fill="rgba(0,0,0,.1)" />
  </g>
);

/** ฉากหลังตามธีม — night=true ใช้เวอร์ชันกลางคืน */
export const Backdrop: React.FC<{ id: string; uid: string; anim?: boolean; night?: boolean }> = ({ id, uid, anim = true, night = false }) => {
  const s = SCENES[id] ?? SCENES.bg_meadow;
  const o: O = { night, anim, uid };
  const sun = s.sun === undefined ? [78, 22, 9] as [number, number, number] : s.sun;
  const moon = s.moon === undefined ? [78, 22, 8] as [number, number, number] : s.moon;
  const stars = night || s.starsDay;
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}sk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={night ? s.sky[2] : s.sky[0]} /><stop offset="1" stopColor={night ? s.sky[3] : s.sky[1]} />
        </linearGradient>
        <filter id={`${uid}nt`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.36 0.14 0.08 0 0  0.08 0.34 0.2 0 0.02  0.14 0.24 0.6 0 0.1  0 0 0 1 0" />
        </filter>
      </defs>
      <rect width="100" height="125" fill={`url(#${uid}sk)`} />
      {stars && STARS.map(([x, y, r], i) => (
        <Blink key={i} on={anim && i % 2 === 0} values="1;.35;1" dur={2 + (i % 4) * 0.7} begin={i * 0.4}><circle cx={x} cy={y} r={r} fill="#fff" opacity={night ? 0.95 : 0.6} /></Blink>
      ))}
      {!night && sun && (
        <g><circle cx={sun[0]} cy={sun[1]} r={sun[2] + 7} fill={s.sunFill ?? '#fff3a0'} opacity=".28" /><circle cx={sun[0]} cy={sun[1]} r={sun[2]} fill={s.sunFill ?? '#ffe38a'} /></g>
      )}
      {night && moon && <Moon x={moon[0]} y={moon[1]} r={moon[2]} fill={s.moonFill} />}
      {!night && s.clouds && (
        <g fill="#fff" opacity=".8"><ellipse cx="22" cy="24" rx="12" ry="4.4" /><ellipse cx="30" cy="21" rx="7" ry="4" /><ellipse cx="62" cy="36" rx="10" ry="3.6" /><ellipse cx="68" cy="33.4" rx="6" ry="3.2" /></g>
      )}
      {s.far && <g filter={night ? `url(#${uid}nt)` : undefined}>{s.far(o)}</g>}
      {s.lights && s.lights(o)}
    </g>
  );
};
