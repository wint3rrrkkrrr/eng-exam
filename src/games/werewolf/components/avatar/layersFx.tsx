// components/avatar/layersFx.tsx — เอฟเฟกต์รอบตัว (เคลื่อนไหวด้วย SMIL) · back = หลังตัวละคร · front = ทับตัวละคร
import React from 'react';
import { Blink, Move, Pulse, heartPath, starPath } from './anim';

interface P { id: string; uid: string; anim: boolean }

const COLS6 = ['#ff5d5d', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#9775fa'];
/** ตำแหน่งกระจาย [x, y, ช่วงเวลา, ออฟเซ็ต] */
const SCATTER: [number, number, number, number][] = [[10, 0, 5, 0], [26, 0, 6.2, 2.1], [42, 0, 4.6, 3.3], [58, 0, 5.8, 1.2], [74, 0, 6.6, 4.1], [90, 0, 5.2, 2.8], [18, 0, 7, 5.2], [66, 0, 4.8, 0.7]];

export const EffectBack: React.FC<P> = ({ id, uid, anim }) => {
  switch (id) {
    case 'fx_aura':
      return (
        <g>
          <defs><radialGradient id={`${uid}ar`} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffe680" stopOpacity=".95" /><stop offset=".6" stopColor="#ffc933" stopOpacity=".4" /><stop offset="1" stopColor="#ffc933" stopOpacity="0" /></radialGradient></defs>
          <g transform="translate(50 56)">
            <Move on={anim} type="rotate" from="0" to="360" dur={14}>
              {Array.from({ length: 12 }, (_, i) => <path key={i} d="M-3 0 L0 -62 L3 0 Z" fill="#fff0a8" opacity=".35" transform={`rotate(${i * 30})`} />)}
            </Move>
            <Blink on={anim} values=".7;1;.7" dur={2.2}><circle r="52" fill={`url(#${uid}ar)`} /></Blink>
          </g>
        </g>
      );
    case 'fx_smoke':
      return (
        <g>
          <rect width="100" height="125" fill="#1a1020" opacity=".28" />
          {[[16, 120, 10, 6, 0], [40, 124, 12, 7, 2], [64, 120, 11, 5.4, 1], [86, 124, 10, 6.6, 3.2], [28, 124, 9, 8, 4.4]].map(([x, y, r, d, b], i) => (
            <g key={i} transform={`translate(${x} ${y})`}><Move on={anim} from="0 0" to="4 -90" dur={d} begin={b} fade><circle r={r} fill="#3a3a48" opacity=".75" /></Move></g>
          ))}
        </g>
      );
    case 'fx_fire':
      return (
        <g>
          <defs><linearGradient id={`${uid}fl`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff3b1a" stopOpacity=".7" /><stop offset=".6" stopColor="#ff9a1a" stopOpacity=".25" /><stop offset="1" stopColor="#ffd43b" stopOpacity="0" /></linearGradient></defs>
          <rect y="55" width="100" height="70" fill={`url(#${uid}fl)`} />
        </g>
      );
    default:
      return null;
  }
};

export const EffectFront: React.FC<P> = ({ id, uid, anim }) => {
  switch (id) {
    case 'fx_sparkle':
      return (
        <g fill="#fff6b8" stroke="#ffd43b" strokeWidth=".5">
          {[[12, 18, 1.1], [86, 20, 1], [8, 56, .8], [92, 58, 1.1], [24, 98, .9], [80, 100, 1], [50, 6, .9], [70, 12, .7], [30, 36, .6]].map(([x, y, s], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}><Pulse on={anim} min={0.2} max={1.3} dur={1.5 + (i % 3) * 0.4} begin={i * 0.45} twinkle><path d={starPath(7)} /></Pulse></g>
          ))}
        </g>
      );
    case 'fx_bubbles':
      return (
        <g>
          {[[14, 124, 3, 6, 0], [30, 124, 2, 5, 1.6], [48, 124, 4, 7, 3], [66, 124, 2.4, 5.4, 0.8], [82, 124, 3.4, 6.6, 2.4], [92, 124, 1.8, 4.6, 4], [22, 124, 1.6, 5.8, 3.6]].map(([x, y, r, d, b], i) => (
            <g key={i} transform={`translate(${x} ${y})`}><Move on={anim} from="0 0" to="3 -128" dur={d} begin={b} fade>
              <circle r={r} fill="rgba(200,240,255,.25)" stroke="#e6faff" strokeWidth=".9" /><circle cx={-r * 0.3} cy={-r * 0.3} r={r * 0.25} fill="#fff" />
            </Move></g>
          ))}
        </g>
      );
    case 'fx_rain':
      return (
        <g stroke="#bfe3ff" strokeWidth="1" strokeLinecap="round" opacity=".85">
          {SCATTER.concat([[34, 0, 5.4, 1.4], [82, 0, 6, 3.7], [4, 0, 6.8, 2.6]]).map(([x, , d, b], i) => (
            <g key={i} transform={`translate(${x} 0)`}><Move on={anim} from="-3 -20" to="3 135" dur={d * 0.22} begin={b}><path d="M0 0 L-1.6 7" /></Move></g>
          ))}
        </g>
      );
    case 'fx_hearts':
      return (
        <g>
          {[[16, 120, 1, 6, 0], [34, 120, 1.4, 7, 2], [52, 120, .8, 5.4, 4], [70, 120, 1.2, 6.4, 1], [86, 120, .9, 5.8, 3]].map(([x, y, s, d, b], i) => (
            <g key={i} transform={`translate(${x} ${y})`}><Move on={anim} type="translate" values="0 0;5 -40;-4 -80;2 -125" dur={d} begin={b} fade>
              <path d={heartPath(5 * s)} fill={i % 2 ? '#ff6b9d' : '#ff4d7e'} opacity=".9" />
            </Move></g>
          ))}
        </g>
      );
    case 'fx_snow':
      return (
        <g fill="#fff">
          {SCATTER.concat([[34, 0, 5.4, 1.4], [82, 0, 6, 3.7], [4, 0, 6.8, 2.6]]).map(([x, , d, b], i) => (
            <g key={i} transform={`translate(${x} 0)`}><Move on={anim} type="translate" values="0 -6;6 60;-4 130" dur={d + 2} begin={b}><circle r={1.2 + (i % 3) * 0.5} opacity=".95" /></Move></g>
          ))}
        </g>
      );
    case 'fx_notes':
      return (
        <g fontFamily="sans-serif" fontWeight="900" fill="#7048e8">
          {[[14, 112, 12, 6.4, 0], [84, 108, 14, 7, 2.2], [26, 104, 10, 5.6, 4], [74, 112, 11, 6.8, 1]].map(([x, y, s, d, b], i) => (
            <g key={i} transform={`translate(${x} ${y})`}><Move on={anim} type="translate" values="0 0;6 -34;-5 -70;3 -108" dur={d} begin={b} fade>
              <text fontSize={s} fill={['#7048e8', '#e64980', '#1c7ed6', '#2f9e44'][i]}>{i % 2 ? '♫' : '♪'}</text>
            </Move></g>
          ))}
        </g>
      );
    case 'fx_petals':
      return (
        <g>
          {SCATTER.map(([x, , d, b], i) => (
            <g key={i} transform={`translate(${x} 0)`}><Move on={anim} type="translate" values="0 -8;10 40;-6 85;8 135" dur={d + 3} begin={b}>
              <Move on={anim} type="rotate" from="0" to="360" dur={3 + (i % 3)}><ellipse rx="2.8" ry="1.7" fill={i % 2 ? '#ffb7d0' : '#ff8fb8'} /></Move>
            </Move></g>
          ))}
        </g>
      );
    case 'fx_fireflies':
      return (
        <g>
          {[[14, 100, 0], [30, 70, 1.3], [74, 90, 2.1], [86, 52, 0.7], [58, 108, 1.8], [20, 36, 3], [70, 28, 2.6]].map(([x, y, b], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <Move on={anim} type="translate" values="0 0;8 -6;-4 -12;-8 -3;0 0" dur={6 + i} begin={Number(b)}>
                <Blink on={anim} dur={1.4 + (i % 3) * 0.5} begin={Number(b)}><circle r="5" fill="#d6ff6b" opacity=".3" /><circle r="1.6" fill="#f4ff9a" /></Blink>
              </Move>
            </g>
          ))}
        </g>
      );
    case 'fx_confetti':
      return (
        <g>
          {SCATTER.concat([[34, 0, 5.4, 1.4], [82, 0, 6, 3.7], [4, 0, 6.8, 2.6], [50, 0, 5, 3]]).map(([x, , d, b], i) => (
            <g key={i} transform={`translate(${x} 0)`}><Move on={anim} type="translate" values="0 -6;5 60;-5 132" dur={d * 0.7 + 1.4} begin={b}>
              <Move on={anim} type="rotate" from="0" to="360" dur={1.2 + (i % 3) * 0.5}><rect x="-1.6" y="-1" width="3.2" height="2" fill={COLS6[i % 6]} /></Move>
            </Move></g>
          ))}
        </g>
      );
    case 'fx_ghosts':
      return (
        <g opacity=".75">
          {[[10, 90, 0, 9], [70, 60, 3, 11], [40, 112, 6, 13]].map(([x, y, b, d], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <Move on={anim} type="translate" values="0 0;22 -18;44 0;22 -34;0 0" dur={d} begin={Number(b)}>
                <path d="M-6 8 V-2 C-6 -12 6 -12 6 -2 V8 L3.4 5.6 L1 8 L-1.4 5.6 L-3.6 8 Z" fill="#fff" stroke="#cfd6e4" strokeWidth=".6" />
                <circle cx="-2.2" cy="-3" r="1" fill="#2a1d22" /><circle cx="2.2" cy="-3" r="1" fill="#2a1d22" />
              </Move>
            </g>
          ))}
        </g>
      );
    case 'fx_coins':
      return (
        <g>
          {SCATTER.slice(0, 7).map(([x, , d, b], i) => (
            <g key={i} transform={`translate(${x} 0)`}><Move on={anim} type="translate" values="0 -8;3 60;-3 134" dur={d * 0.55 + 1.6} begin={b}>
              <Move on={anim} type="scale" values="1 1;.2 1;1 1" dur={0.8 + (i % 3) * 0.2}>
                <circle r="3.4" fill="#ffd43b" stroke="#c9a227" strokeWidth=".8" /><circle r="1.8" fill="none" stroke="#e0a526" strokeWidth=".6" />
              </Move>
            </Move></g>
          ))}
        </g>
      );
    case 'fx_matrix':
      return (
        <g fontFamily="monospace" fontWeight="900" fontSize="7" fill="#3dff7a">
          <rect width="100" height="125" fill="#001a08" opacity=".22" />
          {[6, 18, 30, 42, 58, 70, 82, 94].map((x, i) => (
            <g key={i} transform={`translate(${x} 0)`}><Move on={anim} from="0 -40" to="0 130" dur={3.4 + (i % 4) * 0.9} begin={i * 0.8}>
              {['1', '0', '7', '1', '0'].map((ch, k) => <text key={k} y={k * 8} opacity={1 - k * 0.18}>{ch}</text>)}
            </Move></g>
          ))}
        </g>
      );
    case 'fx_fire':
      return (
        <g>
          {[8, 22, 36, 50, 64, 78, 92].map((x, i) => (
            <g key={i} transform={`translate(${x} 126)`}>
              <Move on={anim} type="scale" values="1 1;1.1 1.35;.92 .85;1 1" dur={0.7 + (i % 3) * 0.2} begin={i * 0.3}>
                <path d={`M-8 0 C-9 -10 -2 -14 0 -${26 + (i % 3) * 8} C3 -14 9 -8 8 0 Z`} fill="#ff6a1a" opacity=".95" />
                <path d={`M-4.4 0 C-5 -6 -1 -9 0 -${16 + (i % 3) * 5} C2 -9 5 -5 4.4 0 Z`} fill="#ffd43b" />
              </Move>
            </g>
          ))}
        </g>
      );
    case 'fx_lightning':
      return (
        <g>
          <Blink on={anim} values="0;0;0;0;.55;0;.35;0;0" dur={4}><rect width="100" height="125" fill="#fff" /></Blink>
          {[[18, 0, 0], [80, 4, 1.7]].map(([x, y, b], i) => (
            <Blink key={i} on={anim} values="0;0;0;0;1;0;1;0;0" dur={4} begin={Number(b)}>
              <path transform={`translate(${x} ${y})`} d="M6 0 L-4 26 H3 L-6 54 L12 20 H4 L10 0 Z" fill="#fff7a8" stroke="#ffd43b" strokeWidth="1" strokeLinejoin="round" />
            </Blink>
          ))}
        </g>
      );
    case 'fx_orbit':
      return (
        <g transform="translate(50 20) scale(1 .34)">
          <Move on={anim} type="rotate" from="0" to="360" dur={3.6}>
            {[0, 120, 240].map((a, i) => (
              <g key={a} transform={`rotate(${a}) translate(34 0)`}><circle r="9" fill="#ffe680" opacity=".35" /><circle r="4.2" fill={['#fff3a8', '#9cf6ff', '#ffb3d1'][i]} /></g>
            ))}
          </Move>
        </g>
      );
    case 'fx_shimmer':
      return (
        <g>
          <defs>
            <linearGradient id={`${uid}sh`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              {COLS6.map((c, i) => <stop key={c} offset={0.2 + i * 0.12} stopColor={c} stopOpacity=".55" />)}
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g transform="rotate(-22 50 62)">
            <Move on={anim} from="-150 0" to="130 0" dur={3.2}><rect x="0" y="-30" width="46" height="190" fill={`url(#${uid}sh)`} /></Move>
          </g>
        </g>
      );
    default:
      return null;
  }
};
