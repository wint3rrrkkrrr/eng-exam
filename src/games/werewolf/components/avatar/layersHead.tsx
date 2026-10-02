// components/avatar/layersHead.tsx — ทรงผม · ดวงตา · ปาก · หนวดเครา (วาดด้วย SVG ล้วน ไม่มีรูปภาพ)
// พิกัด: viewBox 0 0 100 125 · หัวอยู่กลาง (50,50) กว้าง 42 สูง 48 · ตา y=50 · ปาก y=66
import React from 'react';
import { RapMouth, isRapId } from './layersRap';
import { INK, shade } from './colors';
import { Blink, Move, Pulse, heartPath, starPath } from './anim';

export interface Ctx {
  skin: string;
  hair: string; // สีเติมของผม (อาจเป็น url(#...) กรณีสีไล่เฉด)
  uid: string;
  anim: boolean; // false = ไม่เคลื่อนไหว (ผู้ใช้ตั้งลดการเคลื่อนไหว)
}

const CAP = 'M28.5 48 C26 28 37 20 50 20 C63 20 74 28 71.5 48 C68 39 62 35 50 35 C38 35 32 39 28.5 48 Z';
const HL = 'rgba(255,255,255,.18)';

// ================================================================ ทรงผม
// back = ชั้นหลังหัว/ไหล่ · front = ชั้นหน้า (หน้าม้า/ยอดผม)
export const HairBack: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const f = c.hair;
  switch (id) {
    case 'hair_bob':
    case 'hair_bangs':
      return <path d="M26 48 C24 22 38 15 50 15 C62 15 76 22 74 48 L75 70 C75 75 69 75 68 70 L67 50 L33 50 L32 70 C31 75 25 75 25 70 Z" fill={f} />;
    case 'hair_long':
    case 'hair_halfup':
      return <path d="M25 48 C23 20 38 14 50 14 C62 14 77 20 75 48 L80 100 C74 104 66 100 64 96 L36 96 C34 100 26 104 20 100 Z" fill={f} />;
    case 'hair_wavy':
      return <path d="M25 48 C23 20 38 14 50 14 C62 14 77 20 75 48 C80 62 72 70 78 82 C82 92 76 100 70 98 L30 98 C24 100 18 92 22 82 C28 70 20 62 25 48 Z" fill={f} />;
    case 'hair_mullet':
      return <path d="M28 52 C24 70 30 90 40 98 L60 98 C70 90 76 70 72 52 Z" fill={f} />;
    case 'hair_ponytail':
      return <path d="M66 32 C84 30 92 50 86 68 C84 78 78 84 74 80 C80 66 78 54 68 50 Z" fill={f} />;
    case 'hair_pigtails':
      return (
        <g fill={f}>
          <path d="M28 44 C14 46 10 64 14 78 C16 84 24 84 26 76 C28 66 26 56 30 50 Z" />
          <path d="M72 44 C86 46 90 64 86 78 C84 84 76 84 74 76 C72 66 74 56 70 50 Z" />
        </g>
      );
    case 'hair_twinbuns':
      return <g fill={f}><circle cx="32" cy="22" r="9" /><circle cx="68" cy="22" r="9" /></g>;
    case 'hair_afro':
      return <circle cx="50" cy="38" r="31" fill={f} />;
    case 'hair_cloud':
      return <g fill={f}>{[[24, 44, 10], [20, 30, 10], [30, 18, 11], [44, 10, 11], [58, 10, 11], [70, 18, 11], [80, 30, 10], [76, 44, 10], [50, 24, 20]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>;
    case 'hair_curly':
      return <g fill={f}>{[[26, 46], [24, 34], [30, 24], [42, 18], [58, 18], [70, 24], [76, 34], [74, 46]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="9" />)}</g>;
    case 'hair_bun':
      return <circle cx="50" cy="13" r="10" fill={f} />;
    case 'hair_dreads':
      return (
        <g fill={f}>
          {[[22, 40, 46], [28, 46, 52], [66, 46, 52], [72, 40, 46], [34, 48, 40], [60, 48, 40]].map(([x, y, h], i) => <rect key={i} x={x} y={y} width="6" height={h} rx="3" />)}
          <path d="M28 48 C26 24 38 16 50 16 C62 16 74 24 72 48 Z" />
        </g>
      );
    case 'hair_flame': // เปลวไฟรอบหัว (ขยับ)
      return (
        <g>
          {[[28, 40, 24], [38, 28, 30], [50, 22, 38], [62, 28, 30], [72, 40, 24]].map(([x, y, h], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <Move on={c.anim} type="scale" values="1 1;1.12 1.22;0.94 0.9;1 1" dur={0.9 + i * 0.13} begin={i * 0.3}>
                <path d={`M-9 ${h * 0.5} C-9 ${h * 0.1} -2 ${-h * 0.2} 0 ${-h} C3 ${-h * 0.3} 9 ${h * 0.1} 9 ${h * 0.5} Z`} fill={`url(#${c.uid}fr)`} />
              </Move>
            </g>
          ))}
        </g>
      );
    default:
      return null;
  }
};

export const HairFront: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const f = c.hair;
  const shortCap = (
    <g>
      <path d={CAP} fill={f} />
      <path d="M36 28 C42 24 52 23 60 26" stroke={HL} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  );
  switch (id) {
    case 'hair_bald':
      return <ellipse cx="44" cy="30" rx="6" ry="2.4" fill="rgba(255,255,255,.35)" transform="rotate(-18 44 30)" />;
    case 'hair_buzz':
      return <path d="M29.5 46 C28 30 38 23 50 23 C62 23 72 30 70.5 46 C66 39 60 36 50 36 C40 36 34 39 29.5 46 Z" fill={f} opacity=".8" />;
    case 'hair_short':
    case 'hair_bun':
    case 'hair_ponytail':
    case 'hair_pigtails':
    case 'hair_twinbuns':
    case 'hair_mullet':
      return shortCap;
    case 'hair_topknot':
      return (
        <g>
          {shortCap}
          <ellipse cx="50" cy="16" rx="6.4" ry="5.6" fill={f} /><rect x="46.6" y="19.6" width="6.8" height="3" rx="1" fill="#d6336c" />
        </g>
      );
    case 'hair_halfup':
      return <g>{shortCap}<circle cx="50" cy="15" r="6.4" fill={f} /><rect x="46.8" y="19" width="6.4" height="2.6" rx="1" fill="#f06595" /></g>;
    case 'hair_bob':
    case 'hair_long':
    case 'hair_wavy':
      return (
        <g>
          <path d="M28 46 C28 28 38 22 50 22 C62 22 72 28 72 46 C66 38 58 34 50 34 C42 34 34 38 28 46 Z" fill={f} />
          <path d="M28 46 C34 40 40 37 46 36 C42 40 36 44 33 50 Z" fill={f} />
        </g>
      );
    case 'hair_bangs':
      return <path d="M28 47 C26 26 38 19 50 19 C62 19 74 26 72 47 L72 41 L66 44 L60 39 L54 44 L48 39 L42 44 L36 39 L30 44 Z" fill={f} />;
    case 'hair_sidepart':
      return (
        <g>
          <path d="M28 47 C25 25 40 19 53 20 C66 21 74 30 72 47 C68 37 58 33 44 36 C38 38 32 41 28 47 Z" fill={f} />
          <path d="M44 22 C46 28 44 33 40 36" stroke="#000" strokeWidth=".8" opacity=".3" fill="none" />
        </g>
      );
    case 'hair_undercut':
      return (
        <g>
          <path d="M29 46 C28 38 30 34 34 34 L34 44 Z M71 46 C72 38 70 34 66 34 L66 44 Z" fill={f} opacity=".4" />
          <path d="M33 38 C30 22 42 14 54 15 C68 16 72 26 67 38 C60 31 44 30 33 38 Z" fill={f} />
          <path d="M40 20 C46 17 54 17 60 20" stroke={HL} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'hair_spiky':
      return <path d="M28 48 L24 27 L35 33 L37 15 L46 29 L52 11 L58 29 L67 15 L66 33 L77 27 L72 48 C66 39 34 39 28 48 Z" fill={f} />;
    case 'hair_shaggy':
      return <path d="M27 50 C22 30 34 16 50 16 C66 16 78 30 73 50 L68 38 L64 46 L58 36 L52 46 L46 36 L40 46 L34 38 Z" fill={f} />;
    case 'hair_mohawk':
      return <path d="M43 36 L41 14 L46 20 L48 6 L52 18 L56 6 L59 20 L61 14 L58 36 Z" fill={f} />;
    case 'hair_pompadour':
      return (
        <g>
          <path d="M28 48 C24 24 32 8 52 6 C70 6 78 22 72 48 C68 36 60 32 50 32 C40 32 34 36 28 48 Z" fill={f} />
          <path d="M36 16 C44 10 56 10 64 14" stroke={HL} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'hair_afro':
      return <path d="M29 47 C28 36 34 31 50 31 C66 31 72 36 71 47 C66 40 60 38 50 38 C40 38 34 40 29 47 Z" fill={f} />;
    case 'hair_cloud':
      return <g fill={f}>{[[34, 36, 7], [44, 31, 7], [56, 31, 7], [66, 36, 7]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>;
    case 'hair_curly':
      return <g fill={f}>{[[34, 36], [44, 31], [56, 31], [66, 36]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="8" />)}</g>;
    case 'hair_braid':
      return (
        <g>
          {shortCap}
          {[[71, 54], [75, 62], [77, 71], [75, 80], [73, 89], [75, 98], [77, 106]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="5" ry="5.4" fill={f} />)}
          <rect x="73" y="108" width="8" height="3" rx="1.4" fill="#d6336c" />
        </g>
      );
    case 'hair_dreads':
      return <path d="M28.5 46 C26 28 37 20 50 20 C63 20 74 28 71.5 46 C68 38 62 35 50 35 C38 35 32 38 28.5 46 Z" fill={f} />;
    case 'hair_flame':
      return (
        <g>
          <path d={CAP} fill={`url(#${c.uid}fr)`} />
          <Blink on={c.anim} values=".5;1;.5" dur={0.7}><path d="M38 30 C44 24 56 24 62 30" stroke="#fff3a8" strokeWidth="2.4" fill="none" strokeLinecap="round" /></Blink>
        </g>
      );
    default:
      return null;
  }
};

// ================================================================ ดวงตา
export const Eyes: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const eye = (cx: number, extra?: React.ReactNode) => (
    <g key={cx}>
      <ellipse cx={cx} cy="50" rx="5.2" ry="5.6" fill="#fff" />
      <circle cx={cx} cy="50.6" r="3.1" fill={INK} />
      <circle cx={cx - 1} cy="49.2" r="1" fill="#fff" />
      {extra}
    </g>
  );
  const brows = (angry = false) => (
    <g stroke={INK} strokeWidth="1.8" strokeLinecap="round" fill="none">
      <path d={angry ? 'M35 41 L45 45' : 'M36 43 Q41 40 46 43'} />
      <path d={angry ? 'M65 41 L55 45' : 'M54 43 Q59 40 64 43'} />
    </g>
  );
  switch (id) {
    case 'eyes_happy':
      return (
        <g stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none">
          <path d="M36 52 Q41 45 46 52" /><path d="M54 52 Q59 45 64 52" />
        </g>
      );
    case 'eyes_closed':
      return (
        <g stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M36 50 Q41 55 46 50" /><path d="M54 50 Q59 55 64 50" />
          <path d="M36 50 L34.5 52 M46 50 L47.5 52 M54 50 L52.5 52 M64 50 L65.5 52" strokeWidth="1.4" />
        </g>
      );
    case 'eyes_sleepy':
      return (
        <g>
          {eye(41)}{eye(59)}
          <path d="M35 49 Q41 44 47 49 L47 48 Q41 41 35 48 Z" fill={c.skin} stroke={shade(c.skin, 0.25)} strokeWidth=".6" />
          <path d="M53 49 Q59 44 65 49 L65 48 Q59 41 53 48 Z" fill={c.skin} stroke={shade(c.skin, 0.25)} strokeWidth=".6" />
          {brows()}
        </g>
      );
    case 'eyes_angry':
      return <g>{eye(41)}{eye(59)}{brows(true)}</g>;
    case 'eyes_big':
      return (
        <g>
          {[41, 59].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy="50" rx="6.6" ry="7.4" fill="#fff" stroke={INK} strokeWidth=".8" />
              <ellipse cx={cx} cy="51" rx="4.6" ry="5.4" fill="#3a5fd0" /><ellipse cx={cx} cy="51.4" rx="2.6" ry="3.4" fill={INK} />
              <circle cx={cx - 1.8} cy="48.6" r="1.8" fill="#fff" /><circle cx={cx + 1.6} cy="53" r=".9" fill="#fff" />
            </g>
          ))}
          {brows()}
        </g>
      );
    case 'eyes_wink':
      return (
        <g>
          {eye(41)}
          <path d="M54 52 Q59 46 64 52" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          {brows()}
        </g>
      );
    case 'eyes_tired':
      return (
        <g>
          {eye(41)}{eye(59)}
          <path d="M35.5 50 A5.5 5.5 0 0 1 46.5 50 Z M53.5 50 A5.5 5.5 0 0 1 64.5 50 Z" fill={c.skin} />
          <path d="M35.5 50 H46.5 M53.5 50 H64.5" stroke={INK} strokeWidth="1.4" />
          <path d="M36 56.6 Q41 59.6 46 56.6 M54 56.6 Q59 59.6 64 56.6" stroke="#8a6fb0" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity=".8" />
        </g>
      );
    case 'eyes_cry':
      return (
        <g>
          {eye(41)}{eye(59)}
          <g stroke={INK} strokeWidth="1.8" strokeLinecap="round" fill="none"><path d="M36 42 Q41 45 46 44" /><path d="M64 42 Q59 45 54 44" /></g>
          {[[39.5, 0], [60.5, 1.1]].map(([x, b], i) => (
            <g key={i} transform={`translate(${x} 55)`}>
              <Move on={c.anim} from="0 0" to="0 14" dur={1.6} begin={Number(b)} fade><path d="M0 -2 C-2 1 -2 3 0 3 C2 3 2 1 0 -2 Z" fill="#5cc8ff" stroke="#2b8fc4" strokeWidth=".5" /></Move>
            </g>
          ))}
        </g>
      );
    case 'eyes_x':
      return (
        <g stroke={INK} strokeWidth="2.4" strokeLinecap="round">
          <path d="M37 46 L45 54 M45 46 L37 54 M55 46 L63 54 M63 46 L55 54" />
        </g>
      );
    case 'eyes_cat':
      return (
        <g>
          {[41, 59].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy="50" rx="5.4" ry="5.8" fill="#ffe066" stroke={INK} strokeWidth=".9" />
              <ellipse cx={cx} cy="50" rx="1.5" ry="4.8" fill={INK} /><circle cx={cx - 1.6} cy="48" r="1" fill="#fff" />
            </g>
          ))}
          {brows(true)}
        </g>
      );
    case 'eyes_dizzy': {
      const spiral = (cx: number, dir: number) => (
        <g key={cx} transform={`translate(${cx} 50)`}>
          <circle r="6" fill="#fff" stroke={INK} strokeWidth=".8" />
          <Move on={c.anim} type="rotate" from="0" to={`${360 * dir}`} dur={1.6}>
            <path d="M0 0 m-.8 0 a.8 .8 0 1 1 1.6 0 a1.8 1.8 0 1 1 -3.6 0 a2.9 2.9 0 1 1 5.8 0 a4 4 0 1 1 -8 0" stroke={INK} strokeWidth="1" fill="none" strokeLinecap="round" />
          </Move>
        </g>
      );
      return <g>{spiral(41, 1)}{spiral(59, -1)}</g>;
    }
    case 'eyes_dollar':
      return (
        <g>
          {[41, 59].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy="50" rx="5.8" ry="6" fill="#fff6c8" stroke="#c9a227" strokeWidth="1" />
              <text x={cx} y="54" textAnchor="middle" fontSize="10" fontWeight="900" fill="#2f9e44" fontFamily="sans-serif">$</text>
            </g>
          ))}
        </g>
      );
    case 'eyes_star': {
      const star = (cx: number) => <path key={cx} transform={`translate(${cx} 50)`} d="M0-6 L1.9-2 L6-1.6 L3 1.5 L3.8 6 L0 3.8 L-3.8 6 L-3 1.5 L-6-1.6 L-1.9-2 Z" fill="#ffd43b" stroke="#e8a317" strokeWidth=".8" />;
      return <g>{star(41)}{star(59)}</g>;
    }
    case 'eyes_sparkle':
      return (
        <g>
          {[41, 59].map((cx, i) => (
            <g key={cx}>
              <ellipse cx={cx} cy="50" rx="6" ry="6.8" fill="#fff" stroke={INK} strokeWidth=".8" />
              <ellipse cx={cx} cy="51" rx="4.2" ry="5" fill="#5b3dd8" /><ellipse cx={cx} cy="51.4" rx="2.3" ry="3" fill={INK} />
              <g transform={`translate(${cx - 1.6} 48.4)`}><Pulse on={c.anim} min={0.5} max={1.5} dur={1.2} begin={i * 0.5} twinkle><path d={starPath(2.4)} fill="#fff" /></Pulse></g>
              <circle cx={cx + 1.8} cy="53.2" r=".9" fill="#fff" />
            </g>
          ))}
          {brows()}
        </g>
      );
    case 'eyes_heart': {
      const heart = (cx: number) => <path key={cx} transform={`translate(${cx} 50)`} d="M0 5 C-8 -1 -5 -7 0 -3 C5 -7 8 -1 0 5 Z" fill="#ef476f" />;
      return <g>{heart(41)}{heart(59)}</g>;
    }
    case 'eyes_glow':
      return (
        <g>
          <Blink on={c.anim} values=".5;1;.5" dur={1.4}><circle cx="41" cy="50" r="8" fill="#ff3b3b" opacity=".3" /><circle cx="59" cy="50" r="8" fill="#ff3b3b" opacity=".3" /></Blink>
          <ellipse cx="41" cy="50" rx="4.2" ry="3.4" fill="#ff2d2d" /><ellipse cx="59" cy="50" rx="4.2" ry="3.4" fill="#ff2d2d" />
          <ellipse cx="41" cy="50" rx="1.3" ry="2.6" fill="#fff" opacity=".8" /><ellipse cx="59" cy="50" rx="1.3" ry="2.6" fill="#fff" opacity=".8" />
          {brows(true)}
        </g>
      );
    case 'eyes_laser':
      return (
        <g>
          <Blink on={c.anim} values="0;1;1;0;0" dur={1.8}>
            <path d="M37 49 L-4 40 L-4 52 L37 52 Z" fill="#ff2d2d" opacity=".75" /><path d="M37 50.4 L-4 46 L-4 48.4 L37 51.4 Z" fill="#fff" />
            <path d="M63 49 L104 40 L104 52 L63 52 Z" fill="#ff2d2d" opacity=".75" /><path d="M63 50.4 L104 46 L104 48.4 L63 51.4 Z" fill="#fff" />
          </Blink>
          <ellipse cx="41" cy="50" rx="4.6" ry="3.6" fill="#ff2d2d" /><ellipse cx="59" cy="50" rx="4.6" ry="3.6" fill="#ff2d2d" />
          <circle cx="41" cy="50" r="1.6" fill="#fff" /><circle cx="59" cy="50" r="1.6" fill="#fff" />
          {brows(true)}
        </g>
      );
    default:
      return <g>{eye(41)}{eye(59)}{brows()}</g>;
  }
};

export const Nose: React.FC<{ c: Ctx }> = ({ c }) => (
  <path d="M48 57 Q50 61 52 57" stroke={shade(c.skin, 0.28)} strokeWidth="1.4" fill="none" strokeLinecap="round" />
);

// ================================================================ ปาก
export const Mouth: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  if (isRapId(id)) return <RapMouth id={id} c={c} />; // ฟันกริลล์ของคอลเลกชันแรปเปอร์
  const line = { stroke: INK, strokeWidth: 2, strokeLinecap: 'round' as const, fill: 'none' };
  const fang = (x: number, tip: string) => <path d={`M${x} 66.6 L${x + 1.8} 72 L${x + 3.6} 67.4 Z`} fill="#fff" stroke={INK} strokeWidth=".7" />;
  switch (id) {
    case 'mouth_flat':
      return <path d="M43 67 L57 67" {...line} />;
    case 'mouth_sad':
      return <path d="M43 69 Q50 62 57 69" {...line} />;
    case 'mouth_open':
      return (
        <g><path d="M42 64 Q50 78 58 64 Z" fill="#7a2230" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" /><path d="M45 71 Q50 67 55 71 Q50 76 45 71 Z" fill="#ef7a8a" /></g>
      );
    case 'mouth_o':
      return <ellipse cx="50" cy="67" rx="3.4" ry="4.2" fill="#7a2230" stroke={INK} strokeWidth="1.3" />;
    case 'mouth_surprised':
      return <ellipse cx="50" cy="68" rx="4.6" ry="6" fill="#7a2230" stroke={INK} strokeWidth="1.4" />;
    case 'mouth_grin':
      return (
        <g><path d="M41 63 Q50 76 59 63 Z" fill="#fff" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" /><path d="M42.5 65.4 H57.5" stroke={INK} strokeWidth=".8" /></g>
      );
    case 'mouth_cat':
      return <path d="M41 64 Q45.5 70 50 64 Q54.5 70 59 64" {...line} />;
    case 'mouth_smirk':
      return <path d="M43 68 Q52 70 58 62" {...line} />;
    case 'mouth_kiss':
      return (
        <g>
          <path d="M46.6 66 Q50 62.6 53.4 66 Q50 70.4 46.6 66 Z" fill="#e0527a" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
          <g transform="translate(61 60)"><Move on={c.anim} from="0 0" to="5 -9" dur={1.8} fade><path d={heartPath(2.6)} fill="#ff6b9d" /></Move></g>
        </g>
      );
    case 'mouth_braces':
      return (
        <g>
          <path d="M41 63 Q50 76 59 63 Z" fill="#fff" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M42.4 66 H57.6" stroke="#8a93a3" strokeWidth="1.4" />
          {[44.6, 48, 52, 55.4].map((x) => <rect key={x} x={x - 1} y="64.8" width="2" height="2.4" fill="#aab3c2" stroke="#6b7280" strokeWidth=".3" />)}
        </g>
      );
    case 'mouth_tongue':
      return (
        <g><path d="M43 65 Q50 71 57 65" {...line} /><path d="M47 68 Q50 77 53 68 Z" fill="#ef6f86" stroke={INK} strokeWidth="1" /><path d="M50 69 V73" stroke="#c7425c" strokeWidth=".8" /></g>
      );
    case 'mouth_drool':
      return (
        <g>
          <path d="M43 64 Q50 72 57 64 Z" fill="#7a2230" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M55 68 Q57 74 56 78" stroke="#a5dcff" strokeWidth="2" fill="none" strokeLinecap="round" />
          <g transform="translate(56 78)"><Move on={c.anim} from="0 -1" to="0 8" dur={1.6} fade><path d="M0 -2 C-2 1 -2 3 0 3 C2 3 2 1 0 -2 Z" fill="#a5dcff" stroke="#5cb4e8" strokeWidth=".5" /></Move></g>
        </g>
      );
    case 'mouth_mask':
      return (
        <g>
          <path d="M30 56 L34 58 M70 56 L66 58" stroke="#9fb4c4" strokeWidth="1" />
          <path d="M33 58 C42 55 58 55 67 58 L65 74 C58 81 42 81 35 74 Z" fill="#dff3fb" stroke="#8db5cc" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M36 64 H64 M36 70 H64" stroke="#b9dcec" strokeWidth="1" />
        </g>
      );
    case 'mouth_fang':
      return <g><path d="M43 65 Q50 71 57 65" {...line} />{fang(45, '')}<path d="M51.4 67.4 L53.2 72 L55 66.6 Z" fill="#fff" stroke={INK} strokeWidth=".7" /></g>;
    case 'mouth_bloodfang':
      return (
        <g>
          <path d="M43 65 Q50 71 57 65" {...line} />
          <path d="M45 66.6 L46.8 72 L48.6 67.4 Z" fill="#fff" stroke={INK} strokeWidth=".7" /><path d="M51.4 67.4 L53.2 72 L55 66.6 Z" fill="#fff" stroke={INK} strokeWidth=".7" />
          <path d="M46.8 69.4 L46.8 72 L47.8 69 Z M53.2 69.4 L53.2 72 L52.2 69 Z" fill="#d61f2d" />
          {[46.8, 53.2].map((x, i) => <g key={x} transform={`translate(${x} 72)`}><Move on={c.anim} from="0 0" to="0 9" dur={1.5} begin={i * 0.7} fade><path d="M0 -1.6 C-1.6 .6 -1.6 2 0 2 C1.6 2 1.6 .6 0 -1.6 Z" fill="#d61f2d" /></Move></g>)}
        </g>
      );
    case 'mouth_gold':
      return (
        <g>
          <path d="M41 63 Q50 76 59 63 Z" fill="#fff" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M43 64.4 H57 L56 68 Q50 71 44 68 Z" fill="#ffd43b" stroke="#c9a227" strokeWidth=".7" />
          <path d="M45.4 64.6 V68.4 M48 64.6 V69.4 M50 64.6 V69.8 M52 64.6 V69.4 M54.6 64.6 V68.4" stroke="#c9a227" strokeWidth=".5" />
        </g>
      );
    default:
      return <path d="M43 65 Q50 72 57 65" {...line} />;
  }
};

// ================================================================ หนวดเครา
export const FacialHair: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const f = c.hair;
  const stache = 'M50 61 C46 58 40 60 36 64 C41 63 45 65 50 63 C55 65 59 63 64 64 C60 60 54 58 50 61 Z';
  const white = '#f6f6fa';
  const whiteLine = '#c9ccd8';
  switch (id) {
    case 'fh_sideburns':
      return <g fill={f}><path d="M29 47 L33.4 47 L34.4 64 L30.6 66 Z" /><path d="M71 47 L66.6 47 L65.6 64 L69.4 66 Z" /></g>;
    case 'fh_pencil':
      return <path d="M38 63.6 C42 60 46 60 50 62 C54 60 58 60 62 63.6 C58 61.8 54 62.4 50 63.8 C46 62.4 42 61.8 38 63.6 Z" fill={f} />;
    case 'fh_mustache':
      return <path d={stache} fill={f} stroke={INK} strokeWidth=".5" />;
    case 'fh_soulpatch':
      return <path d="M47 73 Q50 70 53 73 Q50 78 47 73 Z" fill={f} />;
    case 'fh_chinstrap':
      return <path d="M30 54 C30 74 40 82 50 82 C60 82 70 74 70 54 L67 54 C67 70 60 77 50 77 C40 77 33 70 33 54 Z" fill={f} />;
    case 'fh_goatee':
      return (
        <g fill={f}>
          <path d="M50 61 C46 59 42 61 40 64 C44 63 47 64 50 63 C53 64 56 63 60 64 C58 61 54 59 50 61 Z" />
          <path d="M45 72 Q50 84 55 72 Q50 74 45 72 Z" />
        </g>
      );
    case 'fh_mutton':
      return (
        <g fill={f}>
          <path d="M28 46 L34 46 L36 66 C33 68 30 66 29 62 Z" /><path d="M72 46 L66 46 L64 66 C67 68 70 66 71 62 Z" />
          <path d={stache} />
        </g>
      );
    case 'fh_walrus':
      return <path d="M50 60 C44 57 34 59 30 71 C34 68 40 68 50 64 C60 68 66 68 70 71 C66 59 56 57 50 60 Z" fill={f} stroke={INK} strokeWidth=".5" />;
    case 'fh_beard':
      return (
        <g fill={f}>
          <path d="M29 56 C29 76 38 80 50 80 C62 80 71 76 71 56 C68 64 62 68 50 66 C38 68 32 64 29 56 Z" />
          <path d={stache} />
        </g>
      );
    case 'fh_handlebar':
      return (
        <g fill={f}>
          <path d="M50 61 C45 58 38 59 33 63 C40 63 45 65 50 63 C55 65 60 63 67 63 C62 59 55 58 50 61 Z" />
          <circle cx="31" cy="60" r="3" /><circle cx="69" cy="60" r="3" />
          <path d="M33 63 C30 66 28 62 31 60 M67 63 C70 66 72 62 69 60" stroke={f} strokeWidth="1.6" fill="none" />
        </g>
      );
    case 'fh_braided':
      return (
        <g fill={f}>
          <path d="M29 56 C29 76 38 82 50 82 C62 82 71 76 71 56 C68 64 62 68 50 66 C38 68 32 64 29 56 Z" />
          <path d={stache} />
          {[[42, 86], [42, 93], [42, 100], [58, 86], [58, 93], [58, 100]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="4" ry="4.4" />)}
          <rect x="38" y="104" width="8" height="2.6" rx="1.2" fill="#e0a526" /><rect x="54" y="104" width="8" height="2.6" rx="1.2" fill="#e0a526" />
        </g>
      );
    case 'fh_wizard':
      return (
        <g fill={white} stroke={whiteLine} strokeWidth=".8" strokeLinejoin="round">
          <path d="M29 54 C28 78 36 90 44 112 C47 118 53 118 56 112 C64 90 72 78 71 54 C68 64 62 68 50 66 C38 68 32 64 29 54 Z" />
          <path d="M50 61 C46 58 38 59 33 64 C40 63 45 65 50 63 C55 65 60 63 67 64 C62 59 54 58 50 61 Z" />
        </g>
      );
    case 'fh_santa':
      return (
        <g fill={white} stroke={whiteLine} strokeWidth=".8">
          {[[30, 58, 6], [30, 66, 6], [36, 74, 7], [44, 80, 7], [50, 82, 7.4], [56, 80, 7], [64, 74, 7], [70, 66, 6], [70, 58, 6], [38, 66, 5], [62, 66, 5]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
          <path d="M50 61 C45 57 36 58 32 65 C39 64 45 66 50 64 C55 66 61 64 68 65 C64 58 55 57 50 61 Z" />
        </g>
      );
    case 'fh_stubble':
      return (
        <g fill="#000" opacity=".3">
          {[[36, 66], [40, 71], [45, 74], [50, 75], [55, 74], [60, 71], [64, 66], [42, 62], [58, 62], [47, 70], [53, 70]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r=".9" />)}
        </g>
      );
    default:
      return null;
  }
};
