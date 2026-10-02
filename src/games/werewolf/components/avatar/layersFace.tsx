// components/avatar/layersFace.tsx — ทรงผม · ดวงตา · ปาก ชุดเพิ่มเติม (id: hair2_* / eyes2_* / mouth2_*)
// พิกัดเหมือน layersHead: viewBox 0 0 100 125 · หัวกลาง (50,50) · ตา (41|59, 50) · ปาก y≈66
import React from 'react';
import { INK, shade } from './colors';
import { Blink, Move, Pulse, heartPath, starPath } from './anim';
import type { Ctx } from './layersHead';

export const isFace2Id = (id: string): boolean => id.startsWith('hair2_') || id.startsWith('eyes2_') || id.startsWith('mouth2_');

const CAP = 'M28.5 48 C26 28 37 20 50 20 C63 20 74 28 71.5 48 C68 39 62 35 50 35 C38 35 32 39 28.5 48 Z';
const HL = 'rgba(255,255,255,.18)';
const DK = 'rgba(0,0,0,.32)';
const cap = (f: string) => (
  <g>
    <path d={CAP} fill={f} />
    <path d="M36 28 C42 24 52 23 60 26" stroke={HL} strokeWidth="2.2" fill="none" strokeLinecap="round" />
  </g>
);

// ================================================================ ทรงผมหลังหัว
export const Face2HairBack: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const f = c.hair;
  switch (id) {
    case 'hair2_highpony':
      return (
        <Move on={c.anim} type="rotate" values="-4 56 24;4 56 24;-4 56 24" dur={2.6}>
          <path d="M44 24 C38 6 58 0 70 8 C82 16 82 34 76 46 C72 32 64 22 56 26 Z" fill={f} />
        </Move>
      );
    case 'hair2_sidebraid':
      return (
        <g>
          {[[31, 54], [28, 63], [26, 72], [27, 81], [29, 90], [27, 99]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="5" ry="5.4" fill={f} stroke={DK} strokeWidth=".5" />)}
          <rect x="22" y="103" width="9" height="3" rx="1.4" fill="#4dabf7" />
        </g>
      );
    case 'hair2_bunbig':
      return <g><circle cx="50" cy="12" r="14" fill={f} /><path d="M40 8 Q50 2 60 8" stroke={HL} strokeWidth="2" fill="none" /></g>;
    case 'hair2_bunny':
      return (
        <g>
          {[[38, -1], [62, 1]].map(([x, d], i) => (
            <g key={x} transform={`translate(${x} 22)`}>
              <Move on={c.anim} type="rotate" values={`${d - 6} 0 0;${d + 6} 0 0;${d - 6} 0 0`} dur={2.4} begin={i * 0.7}>
                <ellipse cx="0" cy="-14" rx="6" ry="15" fill={f} /><ellipse cx="0" cy="-13" rx="2.8" ry="10" fill="#ffb3c7" opacity=".85" />
              </Move>
            </g>
          ))}
        </g>
      );
    case 'hair2_ptlong':
      return (
        <g fill={f}>
          <path d="M30 40 C16 44 12 70 14 100 C14 108 24 108 24 100 C24 76 28 60 34 50 Z" />
          <path d="M70 40 C84 44 88 70 86 100 C86 108 76 108 76 100 C76 76 72 60 66 50 Z" />
        </g>
      );
    case 'hair2_ringlets':
      return <g fill={f} stroke={DK} strokeWidth=".5">{[56, 67, 78, 89, 100].map((y, i) => <g key={y}><circle cx={i % 2 ? 24 : 27} cy={y} r="7" /><circle cx={i % 2 ? 76 : 73} cy={y} r="7" /></g>)}</g>;
    case 'hair2_sidebun':
      return <g><circle cx="72" cy="24" r="9" fill={f} /><path d="M66 22 Q72 17 78 22" stroke={HL} strokeWidth="1.6" fill="none" /></g>;
    case 'hair2_cotton':
      return <g fill={f}>{[[20, 44, 14], [16, 62, 12], [80, 44, 14], [84, 62, 12], [50, 14, 16], [32, 18, 13], [68, 18, 13]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>;
    case 'hair2_flower':
      return (
        <g fill={f} stroke="rgba(255,255,255,.55)" strokeWidth=".8">
          {Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2; return <circle key={i} cx={50 + Math.cos(a) * 25} cy={42 + Math.sin(a) * 26} r="9" />; })}
        </g>
      );
    case 'hair2_twintail':
      return (
        <g fill={f}>
          <Move on={c.anim} type="rotate" values="-3 30 26;3 30 26;-3 30 26" dur={2.8}><path d="M30 24 C12 12 4 36 12 54 C16 44 22 36 32 34 Z" /></Move>
          <Move on={c.anim} type="rotate" values="3 70 26;-3 70 26;3 70 26" dur={2.8} begin={1}><path d="M70 24 C88 12 96 36 88 54 C84 44 78 36 68 34 Z" /></Move>
        </g>
      );
    case 'hair2_unicorn':
      return (
        <g>
          <path d="M45 22 L50 -2 L55 22 Z" fill="#ffe08a" stroke="#d9a520" strokeWidth=".8" strokeLinejoin="round" />
          <path d="M47 16 L53 12 M47.5 10 L52.5 6.4" stroke="#d9a520" strokeWidth=".8" />
          <path d="M72 30 C84 34 86 54 80 70 C78 56 74 48 70 44 Z" fill={f} />
        </g>
      );
    case 'hair2_mushroom':
      return <path d="M22 54 C16 20 40 10 50 10 C60 10 84 20 78 54 L72 50 L28 50 Z" fill={f} />;
    default:
      return null;
  }
};

// ================================================================ ทรงผมหน้า
export const Face2HairFront: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const f = c.hair;
  switch (id) {
    case 'hair2_bowl':
      return <g><path d="M27 46 C24 22 38 15 50 15 C62 15 76 22 73 46 L71 38 L29 38 Z" fill={f} /><path d="M34 22 C42 17 56 17 64 22" stroke={HL} strokeWidth="2" fill="none" strokeLinecap="round" /></g>;
    case 'hair2_pixie':
      return <path d="M28 47 C25 24 40 17 54 18 C68 19 74 30 72 47 C68 38 60 33 52 33 L58 41 L48 35 C42 40 34 40 28 47 Z" fill={f} />;
    case 'hair2_highpony':
    case 'hair2_bunbig':
    case 'hair2_bunny':
    case 'hair2_ptlong':
    case 'hair2_ringlets':
    case 'hair2_sidebun':
    case 'hair2_cotton':
    case 'hair2_twintail':
    case 'hair2_sidebraid':
      return cap(f);
    case 'hair2_flower':
      return <g>{cap(f)}<circle cx="50" cy="22" r="4" fill="#ffd43b" stroke="#e8a317" strokeWidth=".8" /></g>;
    case 'hair2_unicorn':
      return cap(f);
    case 'hair2_horns':
      return <g>{cap(f)}<path d="M34 28 L26 8 L45 22 Z M66 28 L74 8 L55 22 Z" fill={f} /></g>;
    case 'hair2_cornrows':
      return (
        <g>
          <path d={CAP} fill={f} />
          <path d="M50 20 V35 M42 21 V36 M58 21 V36 M35 25 L36 38 M65 25 L64 38" stroke={DK} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );
    case 'hair2_fauxhawk':
      return <path d="M30 44 C30 30 36 24 44 22 L46 8 L54 8 L56 22 C64 24 70 30 70 44 C64 38 58 35 50 35 C42 35 36 38 30 44 Z" fill={f} />;
    case 'hair2_sideshave':
      return (
        <g>
          <path d="M50 20 C63 20 74 28 71.5 48 C68 39 62 35 50 35 Z" fill={f} />
          <path d="M28.5 48 C26 28 37 20 50 20 V35 C38 35 32 39 28.5 48 Z" fill={f} opacity=".3" />
          <path d="M50 20 V35" stroke={DK} strokeWidth="1" />
        </g>
      );
    case 'hair2_spikelong':
      return <path d="M28 48 L16 22 L33 30 L30 4 L45 25 L54 0 L58 25 L72 6 L68 32 L86 22 L72 48 C66 39 34 39 28 48 Z" fill={f} />;
    case 'hair2_ahoge':
      return (
        <g>
          {cap(f)}
          <g transform="translate(50 22)">
            <Move on={c.anim} type="rotate" values="-10 0 0;10 0 0;-10 0 0" dur={2.2}>
              <path d="M0 0 C-3 -12 7 -17 9 -10 C11 -5 4 -4 5 -9" stroke={f} strokeWidth="2.6" fill="none" strokeLinecap="round" />
            </Move>
          </g>
        </g>
      );
    case 'hair2_curtain':
      return (
        <g fill={f}>
          <path d="M27 50 C24 26 38 18 50 19 C48 30 40 42 31 52 Z" />
          <path d="M73 50 C76 26 62 18 50 19 C52 30 60 42 69 52 Z" />
        </g>
      );
    case 'hair2_catear':
      return (
        <g>
          {cap(f)}
          <path d="M31 31 L32 10 L47 24 Z M69 31 L68 10 L53 24 Z" fill={f} />
          <path d="M35 25 L35.4 15 L42 22 Z M65 25 L64.6 15 L58 22 Z" fill="#ffb3c7" />
        </g>
      );
    case 'hair2_heart':
      return <g>{cap(f)}<g transform="translate(50 16)"><Pulse on={c.anim} min={0.85} max={1.15} dur={1}><path d={heartPath(5.4)} fill={f} stroke="rgba(255,255,255,.7)" strokeWidth=".9" /></Pulse></g></g>;
    case 'hair2_mushroom':
      return <path d="M22 50 C16 18 40 10 50 10 C60 10 84 18 78 50 C72 40 62 36 50 36 C38 36 28 40 22 50 Z" fill={f} />;
    case 'hair2_slick':
      return (
        <g>
          <path d="M28 48 C25 26 38 18 52 18 C66 18 74 28 72 48 C68 38 58 33 50 33 C40 33 33 38 28 48 Z" fill={f} />
          <path d="M34 28 C44 21 58 21 68 28 M32 34 C44 26 60 26 70 34" stroke={HL} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'hair2_emo':
      return <path d="M28 47 C25 24 40 17 54 18 C68 19 74 30 72 47 C66 36 56 34 50 34 C48 44 42 54 34 58 C32 52 30 50 28 47 Z" fill={f} />;
    case 'hair2_swirl':
      return (
        <g>
          {cap(f)}
          <ellipse cx="50" cy="19" rx="13" ry="5.6" fill={f} stroke="rgba(255,255,255,.45)" strokeWidth=".8" />
          <ellipse cx="50" cy="12" rx="9.4" ry="4.6" fill={f} stroke="rgba(255,255,255,.45)" strokeWidth=".8" />
          <ellipse cx="50" cy="6.4" rx="5.6" ry="3.6" fill={f} stroke="rgba(255,255,255,.45)" strokeWidth=".8" />
          <path d="M50 3 Q53 -1 51 -3" stroke={f} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'hair2_antenna':
      return (
        <g>
          {cap(f)}
          {[[42, 6], [58, 6]].map(([x, y], i) => (
            <g key={x}>
              <path d={`M${i ? 54 : 46} 22 L${x} ${y + 2}`} stroke={INK} strokeWidth="1.4" />
              <Blink on={c.anim} dur={1.4} begin={i * 0.7}><circle cx={x} cy={y} r="3.2" fill={i ? '#ff6b6b' : '#69db7c'} stroke={INK} strokeWidth=".7" /></Blink>
            </g>
          ))}
        </g>
      );
    case 'hair2_lightning':
      return (
        <g>
          <path d="M28 48 C26 28 36 20 46 18 L40 8 L54 14 L50 2 L60 16 L66 12 C72 20 74 32 72 48 C66 39 34 39 28 48 Z" fill={f} />
          <Blink on={c.anim} values=".4;1;.4" dur={0.8}><path d="M54 5 L46 20 L52 20 L47 32 L59 15 L53 15 Z" fill="#ffe066" stroke="#e8a317" strokeWidth=".6" strokeLinejoin="round" /></Blink>
        </g>
      );
    case 'hair2_crownbraid':
      return (
        <g>
          {cap(f)}
          {[[31, 40], [33.5, 31], [40, 24.5], [50, 21.5], [60, 24.5], [66.5, 31], [69, 40]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="4.8" ry="4.4" fill={f} stroke={DK} strokeWidth=".6" />)}
        </g>
      );
    case 'hair2_balding':
      return (
        <g fill={f}>
          <path d="M29 47 C27 36 30 30 33 29 L37 46 Z" /><path d="M71 47 C73 36 70 30 67 29 L63 46 Z" />
          <path d="M44 27 Q47 21 50 25 M52 25 Q55 21 58 27" stroke={f} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <ellipse cx="42" cy="31" rx="5" ry="2" fill="rgba(255,255,255,.3)" transform="rotate(-18 42 31)" />
        </g>
      );
    case 'hair2_waves':
      return (
        <g fill={f}>
          <path d={CAP} />
          {[32, 38, 44, 50, 56, 62, 68].map((x) => <circle key={x} cx={x} cy={x === 32 || x === 68 ? 40 : 36} r="5" />)}
        </g>
      );
    default:
      return null;
  }
};

// ================================================================ ดวงตา
export const Face2Eyes: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const eye = (cx: number, dx = 0, dy = 0) => (
    <g key={cx}>
      <ellipse cx={cx} cy="50" rx="5.2" ry="5.6" fill="#fff" />
      <circle cx={cx + dx} cy={50.6 + dy} r="3.1" fill={INK} />
      <circle cx={cx + dx - 1} cy={49.2 + dy} r="1" fill="#fff" />
    </g>
  );
  const both = (fn: (cx: number, i: number) => React.ReactNode) => <g>{[41, 59].map((cx, i) => <g key={cx}>{fn(cx, i)}</g>)}</g>;
  switch (id) {
    case 'eyes2_lashes':
      return (
        <g>
          {eye(41)}{eye(59)}
          <g stroke={INK} strokeWidth="1.3" strokeLinecap="round">
            <path d="M35.6 47 L32.6 44.6 M37.4 45.2 L35.6 42.2 M39.6 44.4 L39 41.2 M46.4 47 L49.4 44.6 M44.6 45.2 L46.4 42.2" />
            <path d="M64.4 47 L67.4 44.6 M62.6 45.2 L64.4 42.2 M60.4 44.4 L61 41.2 M53.6 47 L50.6 44.6 M55.4 45.2 L53.6 42.2" />
          </g>
        </g>
      );
    case 'eyes2_dot':
      return <g fill={INK}><circle cx="41" cy="50" r="2.4" /><circle cx="59" cy="50" r="2.4" /></g>;
    case 'eyes2_oval':
      return both((cx) => <g><ellipse cx={cx} cy="50" rx="2.8" ry="4.6" fill={INK} /><ellipse cx={cx - 0.8} cy="48" rx="1" ry="1.4" fill="#fff" /></g>);
    case 'eyes2_wide':
      return both((cx) => <g><ellipse cx={cx} cy="50" rx="6.4" ry="7.2" fill="#fff" stroke={INK} strokeWidth=".8" /><circle cx={cx} cy="50" r="1.6" fill={INK} /></g>);
    case 'eyes2_sus':
      return (
        <g>
          {eye(41)}{eye(59)}
          <path d="M35 51 Q41 44 47 51 L47 44 L35 44 Z M53 51 Q59 44 65 51 L65 44 L53 44 Z" fill={c.skin} />
          <path d="M35 51 H47 M53 51 H65" stroke={INK} strokeWidth="1.4" />
          <path d="M35 42 L46 43 M54 40 Q60 38 65 41" stroke={INK} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </g>
      );
    case 'eyes2_side': return <g>{eye(41, 2.6)}{eye(59, 2.6)}</g>;
    case 'eyes2_up': return <g>{eye(41, 0, -3)}{eye(59, 0, -3)}</g>;
    case 'eyes2_down': return <g>{eye(41, 0, 2.2)}{eye(59, 0, 2.2)}</g>;
    case 'eyes2_spiral':
      return both((cx, i) => (
        <g transform={`translate(${cx} 50)`}>
          <circle r="6" fill="#fff" stroke={INK} strokeWidth=".8" />
          <Move on={c.anim} type="rotate" from="0" to={i ? '-360' : '360'} dur={1.6}>
            <path d="M0 0 m-.6 0 a.6 .6 0 1 1 1.2 0 a1.8 1.8 0 1 1 -3 0 a3.2 3.2 0 1 1 5.4 0 a4.6 4.6 0 1 1 -7.6 0" stroke={INK} strokeWidth="1" fill="none" strokeLinecap="round" />
          </Move>
        </g>
      ));
    case 'eyes2_flame':
      return both((cx, i) => (
        <g>
          <ellipse cx={cx} cy="50" rx="5.4" ry="5.8" fill="#ff7a1a" />
          <ellipse cx={cx} cy="50.4" rx="2.8" ry="3.4" fill="#ffe066" />
          <g transform={`translate(${cx} 45)`}>
            <Move on={c.anim} type="scale" values="1 1;1.2 1.5;.9 .9;1 1" dur={0.8 + i * 0.15}><path d="M-3 0 C-3 -3 -1 -5 0 -9 C1 -5 3 -3 3 0 Z" fill="#ff5a1f" opacity=".9" /></Move>
          </g>
        </g>
      ));
    case 'eyes2_ice':
      return both((cx) => <g><ellipse cx={cx} cy="50" rx="5.4" ry="5.8" fill="#d7f3ff" stroke="#6cc3ec" strokeWidth=".9" /><path d={`M${cx} 45.6 L${cx + 3} 50 L${cx} 54.4 L${cx - 3} 50 Z`} fill="#3aa0d8" /><circle cx={cx - 1.4} cy="48.4" r="1" fill="#fff" /></g>);
    case 'eyes2_galaxy':
      return both((cx, i) => (
        <g>
          <ellipse cx={cx} cy="50" rx="5.8" ry="6.2" fill="#1b1060" stroke="#7c5cff" strokeWidth=".8" />
          {[[-2, -2], [2, 1], [-1, 3], [3, -3]].map(([x, y], k) => <Blink key={k} on={c.anim} dur={1.6} begin={k * 0.4 + i * 0.3}><circle cx={cx + x} cy={50 + y} r=".9" fill="#fff" /></Blink>)}
          <ellipse cx={cx} cy="50" rx="3.4" ry="1.2" fill="none" stroke="#ff9bf0" strokeWidth=".8" transform={`rotate(-25 ${cx} 50)`} />
        </g>
      ));
    case 'eyes2_rainbow':
      return both((cx) => (
        <g>
          <ellipse cx={cx} cy="50" rx="5.8" ry="6.2" fill="#ff4d4d" /><ellipse cx={cx} cy="50.2" rx="4.6" ry="5" fill="#ffd43b" />
          <ellipse cx={cx} cy="50.4" rx="3.4" ry="3.8" fill="#51cf66" /><ellipse cx={cx} cy="50.6" rx="2.2" ry="2.6" fill="#339af0" /><circle cx={cx} cy="50.6" r="1.1" fill={INK} />
          <circle cx={cx - 2} cy="48" r="1.1" fill="#fff" />
        </g>
      ));
    case 'eyes2_snake':
      return both((cx) => <g><ellipse cx={cx} cy="50" rx="5.2" ry="5.8" fill="#d4f542" stroke={INK} strokeWidth=".7" /><ellipse cx={cx} cy="50" rx="1.1" ry="5.2" fill={INK} /></g>);
    case 'eyes2_robot':
      return both((cx, i) => (
        <g>
          <rect x={cx - 5.6} y="45" width="11.2" height="10" rx="1.8" fill="#08202c" stroke="#4dd0e1" strokeWidth="1" />
          <g transform={`translate(${cx} 50)`}><Move on={c.anim} type="translate" values="0 -3.4;0 3.4;0 -3.4" dur={1.6} begin={i * 0.3}><rect x="-4.4" y="-.5" width="8.8" height="1.1" fill="#7cf5ff" /></Move></g>
          <circle cx={cx + 4} cy="46.8" r=".8" fill="#69db7c" />
        </g>
      ));
    case 'eyes2_pixel':
      return (
        <g fill={INK} shapeRendering="crispEdges">
          {[41, 59].map((cx) => <g key={cx}><rect x={cx - 4} y="47" width="8" height="2" /><rect x={cx - 4} y="49" width="2" height="4" /><rect x={cx + 2} y="49" width="2" height="4" /><rect x={cx - 2} y="53" width="4" height="2" /><rect x={cx - 1} y="50" width="2" height="2" fill="#fff" /></g>)}
        </g>
      );
    case 'eyes2_heartbeat':
      return both((cx, i) => <g transform={`translate(${cx} 50)`}><Pulse on={c.anim} min={0.8} max={1.2} dur={0.7} begin={i * 0.1}><path d={heartPath(4.4)} fill="#ff2d55" stroke="#9b1230" strokeWidth=".7" /><circle cx="-2" cy="-2" r="1" fill="#fff" /></Pulse></g>);
    case 'eyes2_starspin':
      return both((cx, i) => <g transform={`translate(${cx} 50)`}><Move on={c.anim} type="rotate" from="0" to={i ? '-360' : '360'} dur={3}><path d={starPath(6.6)} fill="#ffd43b" stroke="#e8a317" strokeWidth=".6" /></Move></g>);
    case 'eyes2_uwu':
      return <g stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"><path d="M36 46 L45 50 L36 54" /><path d="M64 46 L55 50 L64 54" /></g>;
    case 'eyes2_dash':
      return <g stroke={INK} strokeWidth="2.8" strokeLinecap="round"><path d="M36 50 H46" /><path d="M54 50 H64" /></g>;
    case 'eyes2_kawaii':
      return both((cx, i) => (
        <g>
          <ellipse cx={cx} cy="50.4" rx="6.4" ry="7.4" fill={INK} />
          <ellipse cx={cx} cy="51.6" rx="5" ry="5.8" fill="#ff8fc7" />
          <ellipse cx={cx} cy="52.6" rx="3.2" ry="3.6" fill="#b0206a" />
          <circle cx={cx - 2.2} cy="47.6" r="2.2" fill="#fff" /><circle cx={cx + 2} cy="53.6" r="1" fill="#fff" />
          <path d={`M${cx + (i ? 6 : -6)} 46.4 l${i ? 2.4 : -2.4} -2`} stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
        </g>
      ));
    case 'eyes2_tears':
      return (
        <g>
          {eye(41)}{eye(59)}
          {[41, 59].map((cx, i) => (
            <g key={cx} transform={`translate(${cx + (i ? 3 : -3)} 56)`}>
              <Move on={c.anim} type="translate" values="0 0;0 14" dur={1.2} begin={i * 0.5} fade><path d="M0 -2 C-2 1 -2 3 0 3 C2 3 2 1 0 -2 Z" fill="#7cc8ff" /></Move>
            </g>
          ))}
          <path d="M36 58 Q39 63 38 76 M64 58 Q61 63 62 76" stroke="#7cc8ff" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".7" />
        </g>
      );
    case 'eyes2_sharingan':
      return both((cx, i) => (
        <g transform={`translate(${cx} 50)`}>
          <circle r="5.8" fill="#d62828" stroke={INK} strokeWidth=".8" />
          <Move on={c.anim} type="rotate" from="0" to={i ? '-360' : '360'} dur={2.4}>
            <circle r="3.3" fill="none" stroke={INK} strokeWidth=".5" />
            {[0, 120, 240].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 3.3} cy={Math.sin((a * Math.PI) / 180) * 3.3} r="1.2" fill={INK} />)}
          </Move>
          <circle r="1.2" fill={INK} />
        </g>
      ));
    case 'eyes2_moon':
      return both((cx, i) => <g transform={`translate(${cx} 50) scale(${i ? -1 : 1} 1)`}><circle r="5.8" fill="#1a1a3a" stroke={INK} strokeWidth=".8" /><path d="M0 -4.6 A4.6 4.6 0 1 0 0 4.6 A3.4 3.4 0 1 1 0 -4.6 Z" fill="#ffe9a6" /></g>);
    case 'eyes2_hetero':
      return (
        <g>
          {[[41, '#2f7bff'], [59, '#f59f00']].map(([cx, col]) => (
            <g key={cx as number}>
              <ellipse cx={cx as number} cy="50" rx="5.4" ry="5.8" fill="#fff" /><circle cx={cx as number} cy="50.4" r="3.6" fill={col as string} /><circle cx={cx as number} cy="50.4" r="1.7" fill={INK} /><circle cx={(cx as number) - 1.2} cy="49" r="1" fill="#fff" />
            </g>
          ))}
        </g>
      );
    case 'eyes2_blind':
      return <g fill="#f4f6fa" stroke={INK} strokeWidth=".8"><ellipse cx="41" cy="50" rx="5.4" ry="5.8" /><ellipse cx="59" cy="50" rx="5.4" ry="5.8" /></g>;
    case 'eyes2_hollow':
      return both((cx, i) => <g><ellipse cx={cx} cy="50" rx="5.2" ry="6" fill="#050308" /><Blink on={c.anim} dur={1.6} begin={i * 0.5}><circle cx={cx} cy="50.4" r="1.4" fill="#ff2a2a" /></Blink></g>);
    case 'eyes2_cyclops':
      return <g><ellipse cx="50" cy="50" rx="10" ry="8.4" fill="#fff" stroke={INK} strokeWidth="1" /><circle cx="50" cy="50.6" r="5" fill="#6741d9" /><circle cx="50" cy="50.6" r="2.6" fill={INK} /><circle cx="48.2" cy="48.4" r="1.4" fill="#fff" /></g>;
    case 'eyes2_third':
      return <g>{eye(41)}{eye(59)}<Blink on={c.anim} values="1;1;.2;1" dur={3}><ellipse cx="50" cy="37" rx="3.6" ry="2.8" fill="#fff" stroke={INK} strokeWidth=".7" /><circle cx="50" cy="37" r="1.5" fill="#d6336c" /></Blink></g>;
    case 'eyes2_bug':
      return both((cx) => <g><ellipse cx={cx} cy="50" rx="6.2" ry="6.8" fill="#2e7d32" stroke={INK} strokeWidth=".7" />{[[-2, -2], [2, -2], [0, 1], [-2.6, 3], [2.6, 3]].map(([x, y], k) => <circle key={k} cx={cx + x} cy={50 + y} r="1.3" fill="#8fe388" />)}</g>);
    case 'eyes2_blush':
      return (
        <g>
          <g stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none"><path d="M36 52 Q41 46 46 52" /><path d="M54 52 Q59 46 64 52" /></g>
          <ellipse cx="35" cy="58" rx="4.4" ry="2.6" fill="#ff7aa8" opacity=".7" /><ellipse cx="65" cy="58" rx="4.4" ry="2.6" fill="#ff7aa8" opacity=".7" />
        </g>
      );
    case 'eyes2_glint':
      return both((cx, i) => <g><ellipse cx={cx} cy="50" rx="5.6" ry="6.4" fill={INK} /><g transform={`translate(${cx - 1.4} 48)`}><Blink on={c.anim} dur={1.8} begin={i * 0.5}><path d={starPath(2.8)} fill="#fff" /></Blink></g></g>);
    case 'eyes2_coin':
      return both((cx, i) => (
        <g transform={`translate(${cx} 50)`}>
          <Move on={c.anim} type="scale" values="1 1;.12 1;1 1" dur={1.4} begin={i * 0.4}>
            <circle r="5.8" fill="#ffd43b" stroke="#c9a227" strokeWidth="1" /><circle r="3.8" fill="none" stroke="#c9a227" strokeWidth=".6" /><path d="M0 -2.6 V2.6 M-1.6 -1 Q0 -2.6 1.6 -1 Q-1.6 1 1.6 1 Q0 2.6 -1.6 1" stroke="#a37a00" strokeWidth=".7" fill="none" />
          </Move>
        </g>
      ));
    default:
      return null;
  }
};

// ================================================================ ปาก
export const Face2Mouth: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const line = { stroke: INK, strokeWidth: 2, strokeLinecap: 'round' as const, fill: 'none' };
  const tri = (x: number, y: number, d: 1 | -1, w = 2.6) => `M${x} ${y} L${x + w / 2} ${y + 3 * d} L${x + w} ${y} Z`;
  switch (id) {
    case 'mouth2_tiny': return <path d="M47 66 Q50 68.6 53 66" {...line} />;
    case 'mouth2_wavy': return <path d="M40 67 Q43.5 62.6 47 67 T54 67 T60 67" {...line} />;
    case 'mouth2_zigzag': return <path d="M41 66 L44.5 69.4 L48 65 L51.5 69.4 L55 65 L59 68.4" {...line} strokeLinejoin="round" />;
    case 'mouth2_lipstick':
      return <g><path d="M41.6 66 Q46 61.6 50 64.2 Q54 61.6 58.4 66 Q50 75 41.6 66 Z" fill="#d61f4f" stroke="#8c1233" strokeWidth=".9" strokeLinejoin="round" /><path d="M42 66 Q50 68.4 58 66" stroke="#8c1233" strokeWidth=".8" fill="none" /><path d="M45 70 Q49 72 53 70" stroke="#ff8fb0" strokeWidth="1" fill="none" strokeLinecap="round" /></g>;
    case 'mouth2_pout': return <g><ellipse cx="50" cy="67" rx="4.6" ry="2.8" fill="#e66b8e" stroke={INK} strokeWidth="1.2" /><path d="M46 66.4 Q50 65 54 66.4" stroke="#fff" strokeWidth=".8" fill="none" opacity=".7" /></g>;
    case 'mouth2_yawn':
      return <g><ellipse cx="50" cy="68" rx="6.4" ry="8" fill="#6e1c2a" stroke={INK} strokeWidth="1.4" /><ellipse cx="50" cy="73" rx="4.2" ry="3" fill="#ef7a8a" /></g>;
    case 'mouth2_laugh':
      return (
        <g transform="translate(50 62)">
          <Move on={c.anim} type="scale" values="1 1;1 .84;1 1" dur={0.45}>
            <g transform="translate(-50 -62)">
              <path d="M39 62 Q50 84 61 62 Z" fill="#7a2230" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M40.4 63.4 H59.6 L58.4 67 Q50 69 41.6 67 Z" fill="#fff" />
              <ellipse cx="50" cy="73" rx="5" ry="3.4" fill="#ef7a8a" />
            </g>
          </Move>
        </g>
      );
    case 'mouth2_dimple':
      return <g><path d="M43 65 Q50 72 57 65" {...line} /><path d="M40 62.6 Q38.6 65 40.6 67.4 M60 62.6 Q61.4 65 59.4 67.4" stroke={INK} strokeWidth="1.2" fill="none" strokeLinecap="round" /></g>;
    case 'mouth2_teeth':
      return <g><rect x="41" y="63" width="18" height="8" rx="2.4" fill="#fff" stroke={INK} strokeWidth="1.5" /><path d="M41 67 H59 M45.5 63 V71 M50 63 V71 M54.5 63 V71" stroke={INK} strokeWidth=".8" /></g>;
    case 'mouth2_bucktooth':
      return <g><path d="M43 65 Q50 70 57 65" {...line} /><rect x="46.6" y="66" width="3.2" height="5.6" rx=".8" fill="#fff" stroke={INK} strokeWidth=".9" /><rect x="50.2" y="66" width="3.2" height="5.6" rx=".8" fill="#fff" stroke={INK} strokeWidth=".9" /></g>;
    case 'mouth2_beak':
      return <g><path d="M39 63 Q50 59 61 63 Q64 71 50 71 Q36 71 39 63 Z" fill="#ffb020" stroke="#c77700" strokeWidth="1.2" strokeLinejoin="round" /><path d="M41 66.4 Q50 68.6 59 66.4" stroke="#c77700" strokeWidth=".9" fill="none" /><circle cx="46.6" cy="63.4" r=".8" fill="#c77700" /><circle cx="53.4" cy="63.4" r=".8" fill="#c77700" /></g>;
    case 'mouth2_lollipop':
      return (
        <g>
          <path d="M43 66 Q49 70 55 66" {...line} />
          <path d="M55 67 L68 82" stroke="#f1e7d0" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="62" cy="62" r="6.6" fill="#ff6fa8" stroke={INK} strokeWidth=".9" />
          <path d="M62 62 m-1 0 a1 1 0 1 1 2 0 a2.4 2.4 0 1 1 -4 0 a3.8 3.8 0 1 1 6.2 0" stroke="#fff" strokeWidth="1" fill="none" />
        </g>
      );
    case 'mouth2_whistle':
      return (
        <g>
          <ellipse cx="50" cy="67" rx="2.6" ry="3" fill="#7a2230" stroke={INK} strokeWidth="1.2" />
          <g transform="translate(58 62)"><Move on={c.anim} from="0 0" to="8 -12" dur={1.6} fade><circle cx="0" cy="2" r="1.8" fill="#4dabf7" /><path d="M1.8 2 V-5 L5 -3.6" stroke="#4dabf7" strokeWidth="1.2" fill="none" /></Move></g>
        </g>
      );
    case 'mouth2_bubblegum':
      return (
        <g>
          <ellipse cx="50" cy="66" rx="2.4" ry="2.8" fill="#7a2230" stroke={INK} strokeWidth="1.1" />
          <g transform="translate(50 69)"><Pulse on={c.anim} min={0.7} max={1.25} dur={1.6}><circle cx="0" cy="3" r="7" fill="#ff8fc7" stroke="#d6336c" strokeWidth=".9" opacity=".92" /><ellipse cx="-2.4" cy=".6" rx="2" ry="1.2" fill="#fff" opacity=".7" /></Pulse></g>
        </g>
      );
    case 'mouth2_stitch':
      return <g><path d="M41 67 H59" {...line} />{[43, 46, 49, 52, 55, 58].map((x) => <path key={x} d={`M${x - 0.8} 64.4 L${x + 0.8} 69.6`} stroke={INK} strokeWidth="1.2" strokeLinecap="round" />)}</g>;
    case 'mouth2_zip':
      return (
        <g>
          <path d="M40 67 H60" stroke="#6b7280" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M41 67 H59" stroke="#d1d5db" strokeWidth="1" strokeDasharray="1.6 1.4" />
          <rect x="56" y="65" width="5" height="7" rx="1.4" fill="#f59f00" stroke="#9a6200" strokeWidth=".8" /><circle cx="58.5" cy="70" r="1" fill="#fff" />
        </g>
      );
    case 'mouth2_shark':
      return (
        <g>
          <path d="M40 62 Q50 82 60 62 Z" fill="#7a2230" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
          {[41.4, 44.6, 47.8, 51, 54.2, 57.4].map((x) => <path key={x} d={tri(x, 62.8, 1, 2.8)} fill="#fff" stroke={INK} strokeWidth=".5" />)}
          {[45, 49, 53].map((x) => <path key={x} d={tri(x, 73.6, -1, 2.6)} fill="#fff" stroke={INK} strokeWidth=".5" />)}
        </g>
      );
    case 'mouth2_rainbow':
      return <g fill="none" strokeLinecap="round" strokeWidth="1.8">{['#ff4d4d', '#ffd43b', '#51cf66', '#339af0'].map((col, i) => <path key={col} d={`M${42 - i * 0.4} ${64 + i * 1.6} Q50 ${72 + i * 1.6} ${58 + i * 0.4} ${64 + i * 1.6}`} stroke={col} />)}</g>;
    case 'mouth2_fire':
      return (
        <g>
          <ellipse cx="50" cy="67" rx="4.4" ry="4.8" fill="#7a2230" stroke={INK} strokeWidth="1.3" />
          <g transform="translate(52 70)">
            <Move on={c.anim} type="scale" values="1 1;1.25 1.35;.9 .9;1 1" dur={0.5}>
              <path d="M0 -2 C14 -6 26 2 30 14 C20 8 14 12 6 8 C2 6 0 4 0 -2 Z" fill="#ff7a1a" /><path d="M2 0 C12 -2 20 4 22 10 C14 6 8 8 3 4 Z" fill="#ffe066" />
            </Move>
          </g>
        </g>
      );
    case 'mouth2_ice':
      return (
        <g>
          <ellipse cx="50" cy="66.6" rx="3" ry="3.4" fill="#7a2230" stroke={INK} strokeWidth="1.2" />
          {[0, 1, 2].map((i) => <g key={i} transform="translate(54 68)"><Move on={c.anim} from="0 0" to="22 6" dur={2} begin={i * 0.66} fade><circle cx="0" cy="0" r={2.2 + i * 0.8} fill="#cfefff" stroke="#7cc8ff" strokeWidth=".6" opacity=".85" /></Move></g>)}
        </g>
      );
    case 'mouth2_blood':
      return (
        <g>
          <path d="M43 65 Q50 71 57 65" {...line} />
          <path d="M56 66 Q58 72 57 80 Q56 84 55 80 Q55 72 54 68 Z" fill="#c1121f" />
          <g transform="translate(56 84)"><Move on={c.anim} from="0 0" to="0 10" dur={1.5} fade><path d="M0 -1.8 C-1.8 .6 -1.8 2.2 0 2.2 C1.8 2.2 1.8 .6 0 -1.8 Z" fill="#c1121f" /></Move></g>
        </g>
      );
    case 'mouth2_cheshire':
      return <g><path d="M37 61.6 Q50 82 63 61.6 Q50 68 37 61.6 Z" fill="#fff" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />{[42, 46, 50, 54, 58].map((x) => <path key={x} d={`M${x} 63.6 V67`} stroke={INK} strokeWidth=".6" />)}</g>;
    case 'mouth2_ghost':
      return <path d="M44 62 Q50 60 56 62 L57 72 Q54.4 70 52.6 73 Q50 70 47.4 73 Q45.6 70 43 72 Z" fill="#2a1a30" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />;
    case 'mouth2_robot':
      return <g><rect x="40" y="62.6" width="20" height="9" rx="1.6" fill="#cfd8dc" stroke="#546e7a" strokeWidth="1.2" />{[43.5, 47, 50.5, 54, 57.5].map((x) => <path key={x} d={`M${x} 63.4 V71.4`} stroke="#546e7a" strokeWidth="1" />)}</g>;
    case 'mouth2_pixel':
      return <g fill={INK} shapeRendering="crispEdges">{[[41, 62], [43, 64], [45, 66], [47, 68], [49, 68], [51, 68], [53, 66], [55, 64], [57, 62]].map(([x, y], i) => <rect key={i} x={x} y={y} width="2.4" height="2.4" />)}</g>;
    case 'mouth2_scream':
      return <g><ellipse cx="50" cy="69" rx="7.4" ry="9.4" fill="#4a0f1c" stroke={INK} strokeWidth="1.5" /><path d="M43.4 62.6 Q50 59 56.6 62.6 L55.4 66 H44.6 Z" fill="#fff" /><ellipse cx="50" cy="75" rx="4.6" ry="3.4" fill="#ef6f86" /></g>;
    case 'mouth2_overbite':
      return <g><path d="M43 65 Q50 70 57 65" {...line} /><path d="M44.4 65.6 L45.6 71 L48 66.4 Z M52 66.4 L54.4 71 L55.6 65.6 Z" fill="#fff" stroke={INK} strokeWidth=".7" strokeLinejoin="round" /></g>;
    default:
      return null;
  }
};
