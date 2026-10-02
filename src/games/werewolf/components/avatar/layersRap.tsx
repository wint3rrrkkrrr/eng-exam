// components/avatar/layersRap.tsx — คอลเลกชันแรปเปอร์ 🎤 (id ขึ้นต้น rap_): ฮิปฮอปสตรีท — เสื้อ หมวก แว่น ฟันเงิน สร้อย ไมค์ บูมบ็อกซ์ ฉากกราฟฟิตี้/สตูดิโอ/เวที
import React from 'react';
import { Blink, Move, Pulse, starPath } from './anim';
import type { Ctx } from './layersHead';

export const isRapId = (id: string): boolean => id.startsWith('rap_');
const part = (id: string): string => id.split('_').slice(2).join('_'); // rap_<slot>_<name> → <name>
const TORSO = 'M6 125 C6 100 26 86 50 86 C74 86 94 100 94 125 Z';
const GOLD = '#e0aa2a';
const FONT = "Impact, 'Arial Black', system-ui, sans-serif";

const Sparkle: React.FC<{ x: number; y: number; r?: number; fill?: string; on: boolean; begin?: number }> = ({ x, y, r = 3, fill = '#fff', on, begin = 0 }) => (
  <g transform={`translate(${x} ${y})`}><Pulse on={on} min={0.3} max={1} dur={1.6} begin={begin} twinkle><path d={starPath(r)} fill={fill} /></Pulse></g>
);

// ================================================================ เสื้อผ้า
export const RapOutfit: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const clip = `${c.uid}rpc${part(id)}`;
  switch (part(id)) {
    case 'hoodie':
      return (
        <g>
          <path d="M24 92 C28 80 40 78 50 84 C60 78 72 80 76 92 L72 100 L28 100 Z" fill="#12141c" />
          <path d={TORSO} fill="#262a3a" />
          <path d="M40 86 C44 96 56 96 60 86 L56 84 C52 90 48 90 44 84 Z" fill="#12141c" />
          <path d="M45 92 V108 M55 92 V108" stroke="#e8eaf2" strokeWidth="1.6" strokeLinecap="round" /><circle cx="45" cy="108.5" r="1.2" fill="#e8eaf2" /><circle cx="55" cy="108.5" r="1.2" fill="#e8eaf2" />
          <path d="M24 114 H76 L72 125 H28 Z" fill="#1a1d2a" opacity=".8" />
          <text x="50" y="113" textAnchor="middle" fontSize="13" fontFamily={FONT} fill="#ff4fd8" stroke="#00e5ff" strokeWidth=".7" paintOrder="stroke" letterSpacing=".5">YO</text>
          <Sparkle x={72} y={98} r={2.4} fill="#00e5ff" on={c.anim} />
        </g>
      );
    case 'jersey':
      return (
        <g>
          <path d={TORSO} fill="#2a2d3a" />
          <path d="M16 125 C16 108 28 98 38 94 L40 86 L60 86 L62 94 C72 98 84 108 84 125 Z" fill="#d62839" stroke="#fff" strokeWidth="1.6" />
          <path d="M40 86 L50 100 L60 86" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M20 118 H80 M22 122 H78" stroke="#fff" strokeWidth=".9" opacity=".7" />
          <text x="50" y="119" textAnchor="middle" fontSize="19" fontFamily={FONT} fill="#fff" stroke="#111" strokeWidth=".8" paintOrder="stroke">23</text>
        </g>
      );
    case 'puffer':
      return (
        <g>
          <path d={TORSO} fill="#2b2d38" />
          <path d="M14 125 C14 106 26 96 36 92 L38 84 L62 84 L64 92 C74 96 86 106 86 125 Z" fill={GOLD} stroke="#a9791a" strokeWidth="1.2" />
          {[96, 104, 112, 120].map((y) => <path key={y} d={`M${18 + (y - 96) / 6} ${y} Q50 ${y + 5} ${82 - (y - 96) / 6} ${y}`} stroke="#b8860b" strokeWidth="1.2" fill="none" />)}
          <path d="M50 88 V125" stroke="#a9791a" strokeWidth="1.6" /><rect x="48.4" y="92" width="3.2" height="6" rx="1" fill="#fff3bf" />
          <path d="M38 84 Q50 94 62 84" fill="none" stroke="#a9791a" strokeWidth="2" />
        </g>
      );
    case 'track':
      return (
        <g>
          <path d={TORSO} fill="#2f6fe0" />
          <path d="M12 125 C12 106 22 96 32 92 M88 125 C88 106 78 96 68 92" stroke="#fff" strokeWidth="3.4" fill="none" />
          <path d="M18 125 C18 108 26 99 35 95 M82 125 C82 108 74 99 65 95" stroke="#fff" strokeWidth="1.4" fill="none" />
          <path d="M36 86 L40 80 H60 L64 86 L50 96 Z" fill="#1f4fb0" stroke="#fff" strokeWidth="1" strokeLinejoin="round" />
          <path d="M50 96 V125" stroke="#cfe1ff" strokeWidth="1.6" strokeDasharray="2 1.4" /><rect x="48.6" y="97" width="2.8" height="7" rx="1" fill="#fff" />
        </g>
      );
    case 'camo':
      return (
        <g>
          <defs><clipPath id={clip}><path d={TORSO} /></clipPath></defs>
          <path d={TORSO} fill="#4b5d2a" />
          <g clipPath={`url(#${clip})`}>
            {[[18, 98, 12, 7, '#2f3b1b'], [44, 94, 14, 8, '#8a9a55'], [72, 100, 13, 8, '#2f3b1b'], [30, 114, 14, 7, '#6b5a3a'], [62, 116, 13, 7, '#8a9a55'], [88, 92, 8, 6, '#6b5a3a'], [10, 120, 8, 6, '#8a9a55']].map(([x, y, rx, ry, col], i) => <ellipse key={i} cx={x as number} cy={y as number} rx={rx as number} ry={ry as number} fill={col as string} />)}
          </g>
          <path d="M42 86 L50 100 L58 86 Z" fill="#2a2d1a" /><path d="M50 100 V125" stroke="#1f2410" strokeWidth="1.6" />
          <rect x="62" y="100" width="12" height="8" rx="1.5" fill="#f08a1c" stroke="#fff" strokeWidth=".8" /><text x="68" y="106.4" textAnchor="middle" fontSize="5.4" fontFamily={FONT} fill="#fff">MC</text>
        </g>
      );
    default: // bling — แจ็คเก็ตหนังประดับเพชร
      return (
        <g>
          <path d={TORSO} fill="#16161c" />
          <path d="M40 86 L50 112 L34 125 L22 100 Z M60 86 L50 112 L66 125 L78 100 Z" fill="#23232c" stroke="#3a3a46" strokeWidth="1" strokeLinejoin="round" />
          <path d="M42 86 L50 100 L58 86 Z" fill="#f4f6fb" />
          <path d="M36 98 L64 124" stroke="#c9ced8" strokeWidth="1.2" strokeDasharray="2 1.2" />
          {[[28, 102], [72, 102], [30, 114], [70, 114], [24, 92], [76, 92]].map(([x, y], i) => <Sparkle key={i} x={x} y={y} r={2.2} fill={i % 2 ? '#bfe9ff' : '#fff'} on={c.anim} begin={i * 0.4} />)}
        </g>
      );
  }
};

// ================================================================ หมวก
export const RapHeadwear: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  switch (part(id)) {
    case 'snapback':
    case 'snapbackgold': {
      const gold = part(id) === 'snapbackgold';
      const main = gold ? GOLD : '#d62839';
      const dark = gold ? '#8a5f0c' : '#8f1424';
      return (
        <g>
          <path d="M28 36 C28 14 72 14 72 36 Z" fill={main} stroke={dark} strokeWidth="1.2" />
          <path d="M50 16 V36 M38 20 L36 36 M62 20 L64 36" stroke={dark} strokeWidth=".9" opacity=".7" /><circle cx="50" cy="15.5" r="2" fill={dark} />
          <path d="M22 37 Q50 30 78 37 L82 42 Q50 50 18 42 Z" fill={gold ? '#15151c' : '#1c1c26'} stroke="#000" strokeWidth="1" strokeLinejoin="round" />
          <g transform="translate(50 26)"><path d={starPath(5.4)} fill={gold ? '#15151c' : '#fff'} /></g>
          {gold && <Sparkle x={68} y={22} r={2.4} fill="#fff" on={c.anim} />}
        </g>
      );
    }
    case 'durag':
      return (
        <g>
          <path d="M27 42 C27 16 73 16 73 42 C60 34 40 34 27 42 Z" fill="#14141b" stroke="#000" strokeWidth="1" />
          {[24, 30, 36].map((y, i) => <path key={y} d={`M${34 + i} ${y - 4} Q50 ${y - 8} ${66 - i} ${y - 4}`} stroke="#3a3a48" strokeWidth=".8" fill="none" />)}
          <path d="M27 40 Q50 32 73 40" stroke={GOLD} strokeWidth="1.4" fill="none" />
          <path d="M73 38 C82 44 88 58 86 78 C82 66 78 56 72 46 Z M27 38 C18 44 12 58 14 78 C18 66 22 56 28 46 Z" fill="#14141b" stroke="#000" strokeWidth=".8" />
          <path d="M80 50 Q84 62 84 72 M20 50 Q16 62 16 72" stroke="#3a3a48" strokeWidth=".8" fill="none" />
        </g>
      );
    default: // beanie
      return (
        <g>
          <path d="M29 36 C29 12 71 12 71 36 Z" fill="#222633" stroke="#0e1018" strokeWidth="1" />
          {[34, 42, 50, 58, 66].map((x) => <path key={x} d={`M${x} 18 V34`} stroke="#2e3344" strokeWidth=".9" />)}
          <path d="M27 31 H73 V40 Q50 45 27 40 Z" fill={GOLD} stroke="#8a5f0c" strokeWidth="1" />
          {[34, 40, 46, 52, 58, 64].map((x) => <path key={x} d={`M${x} 32 V42`} stroke="#b8860b" strokeWidth=".8" />)}
          <circle cx="50" cy="12" r="4" fill={GOLD} stroke="#8a5f0c" strokeWidth=".8" />
        </g>
      );
  }
};

// ================================================================ แว่น
export const RapEyewear: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  switch (part(id)) {
    case 'shades':
      return (
        <g>
          <path d="M29 45 H48 V55 Q48 58 44 58 H33 Q29 58 29 55 Z M52 45 H71 V55 Q71 58 67 58 H56 Q52 58 52 55 Z" fill="#0d0f16" stroke="#000" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M48 47 H52 M29 47 L24 46 M71 47 L76 46" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 48 L38 48 M55 48 L61 48" stroke="#8aa0ff" strokeWidth="1.2" strokeLinecap="round" opacity=".8" />
        </g>
      );
    case 'goldmirror':
      return (
        <g>
          <defs><linearGradient id={`${c.uid}rgm`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff9ecb" /><stop offset="1" stopColor="#7ec8ff" /></linearGradient></defs>
          <circle cx="39" cy="51" r="7.4" fill={`url(#${c.uid}rgm)`} stroke={GOLD} strokeWidth="2.2" /><circle cx="61" cy="51" r="7.4" fill={`url(#${c.uid}rgm)`} stroke={GOLD} strokeWidth="2.2" />
          <path d="M46.4 50 H53.6" stroke={GOLD} strokeWidth="2" /><path d="M31.6 50 L26 48 M68.4 50 L74 48" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M35 47 L40 45 M57 47 L62 45" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity=".8" />
        </g>
      );
    default: // iced
      return (
        <g>
          <rect x="29" y="45" width="19" height="12" rx="2.4" fill="rgba(180,230,255,.35)" stroke="#e8f4ff" strokeWidth="2" /><rect x="52" y="45" width="19" height="12" rx="2.4" fill="rgba(180,230,255,.35)" stroke="#e8f4ff" strokeWidth="2" />
          <path d="M48 49 H52" stroke="#e8f4ff" strokeWidth="2" />
          {[31, 36, 41, 46, 54, 59, 64, 69].map((x, i) => <circle key={x} cx={x} cy={i % 2 ? 56 : 46} r="1.1" fill="#fff" />)}
          <Sparkle x={30} y={44} r={3} on={c.anim} /><Sparkle x={70} y={58} r={2.6} on={c.anim} begin={0.8} fill="#bfe9ff" />
        </g>
      );
  }
};

// ================================================================ ฟันเงิน/ฟันเพชร (ช่องปาก)
export const RapMouth: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  const diamond = part(id) === 'diamond';
  const fill = diamond ? '#eef6ff' : GOLD;
  const line = diamond ? '#9bb4d0' : '#8a5f0c';
  return (
    <g>
      <path d="M41 63 Q50 74 59 63 Q50 66 41 63 Z" fill="#5a1a22" />
      <path d="M42.4 63.4 Q50 66.4 57.6 63.4 L56 68 Q50 71 44 68 Z" fill={fill} stroke={line} strokeWidth=".8" strokeLinejoin="round" />
      {[46, 50, 54].map((x) => <path key={x} d={`M${x} 64.6 V69.6`} stroke={line} strokeWidth=".6" />)}
      {diamond && <><Sparkle x={44} y={66} r={2.2} on={c.anim} /><Sparkle x={56} y={67} r={1.8} on={c.anim} begin={0.7} fill="#bfe9ff" /></>}
    </g>
  );
};

// ================================================================ ของประดับ: ไมค์/บูมบ็อกซ์ (หน้า) + สร้อย
export const RapAccessoryBack: React.FC<{ id: string; c: Ctx }> = () => null;

export const RapAccessoryFront: React.FC<{ id: string; c: Ctx }> = ({ id, c }) => {
  switch (part(id)) {
    case 'chain':
      return (
        <g>
          <path d="M34 89 Q50 116 66 89" stroke={GOLD} strokeWidth="3.2" fill="none" strokeDasharray="3.4 1.4" strokeLinecap="round" />
          <path d="M34 89 Q50 116 66 89" stroke="#fff3bf" strokeWidth=".8" fill="none" strokeDasharray="1 5" />
          <g transform="translate(50 108)"><Pulse on={c.anim} min={0.94} max={1.06} dur={2}><rect x="-7" y="-6" width="14" height="14" rx="3" fill={GOLD} stroke="#8a5f0c" strokeWidth="1.2" /><text x="0" y="5" textAnchor="middle" fontSize="11" fontFamily={FONT} fill="#6b4a08">$</text></Pulse></g>
          <Sparkle x={57} y={103} r={2.4} on={c.anim} />
        </g>
      );
    case 'cuban':
      return (
        <g>
          <path d="M33 89 Q50 108 67 89" stroke={GOLD} strokeWidth="4.6" fill="none" strokeDasharray="5 1.6" strokeLinecap="round" />
          <path d="M30 91 Q50 122 70 91" stroke="#f1cf62" strokeWidth="4.6" fill="none" strokeDasharray="5 1.6" strokeLinecap="round" />
          <g transform="translate(50 117)"><Pulse on={c.anim} min={0.94} max={1.08} dur={1.8}><path d="M0 -8 L8 0 L0 9 L-8 0 Z" fill="#dff3ff" stroke="#8fb8dd" strokeWidth="1.2" strokeLinejoin="round" /><path d="M-8 0 H8 M0 -8 L-3 0 L0 9 L3 0 Z" stroke="#8fb8dd" strokeWidth=".7" fill="none" /></Pulse></g>
          <Sparkle x={58} y={110} r={2.6} on={c.anim} /><Sparkle x={42} y={120} r={2.2} on={c.anim} begin={0.9} fill="#bfe9ff" />
        </g>
      );
    case 'mic':
      return (
        <g>
          <path d="M92 125 Q96 112 86 108" stroke="#2a2a33" strokeWidth="2" fill="none" />
          <g transform="translate(78 110) rotate(28)">
            <rect x="-2.6" y="2" width="5.2" height="22" rx="2.4" fill="#2a2d3a" stroke="#0e1018" strokeWidth=".8" />
            <circle cx="0" cy="-2" r="7" fill="#9aa3b2" stroke="#4b5363" strokeWidth="1.2" />
            {[-4, 0, 4].map((x) => <path key={x} d={`M${x} -8 V4`} stroke="#4b5363" strokeWidth=".7" />)}{[-5, -1, 3].map((y) => <path key={y} d={`M-6.5 ${y} H6.5`} stroke="#4b5363" strokeWidth=".7" />)}
            <rect x="-3" y="8" width="6" height="2.4" fill={GOLD} />
          </g>
        </g>
      );
    default: // boombox
      return (
        <g transform="translate(2 100)">
          <path d="M6 6 Q8 -2 17 -2 Q26 -2 28 6" stroke="#3a3a46" strokeWidth="2" fill="none" />
          <rect x="0" y="4" width="34" height="22" rx="3" fill="#2a2d3a" stroke="#0e1018" strokeWidth="1.2" />
          {[9, 25].map((x, i) => (
            <g key={x} transform={`translate(${x} 17)`}><Pulse on={c.anim} min={0.9} max={1.08} dur={0.6} begin={i * 0.3}><circle r="6" fill="#14161f" stroke="#7b8294" strokeWidth="1" /><circle r="2.6" fill="#7b8294" /></Pulse></g>
          ))}
          <rect x="13.5" y="8" width="7" height="5" rx="1" fill="#e5484d" /><path d="M2 8 H12 M22 8 H32" stroke="#7b8294" strokeWidth=".8" />
        </g>
      );
  }
};

// ================================================================ เอฟเฟกต์
export const RapEffectBack: React.FC<{ id: string; uid: string; anim: boolean }> = ({ id, uid, anim }) => {
  const kind = part(id);
  if (kind !== 'beat') return null;
  return (
    <g>
      <defs><radialGradient id={`${uid}rbt`}><stop offset="0" stopColor="#ff4fd8" stopOpacity=".5" /><stop offset="1" stopColor="#ff4fd8" stopOpacity="0" /></radialGradient></defs>
      <Pulse on={anim} min={0.9} max={1.08} dur={0.8}><g transform="translate(50 62)"><ellipse rx="54" ry="64" fill={`url(#${uid}rbt)`} /></g></Pulse>
    </g>
  );
};

export const RapEffectFront: React.FC<{ id: string; uid: string; anim: boolean }> = ({ id, anim }) => {
  switch (part(id)) {
    case 'money':
      return (
        <g>
          {[[12, 0], [30, 1.6], [52, 0.8], [70, 2.4], [88, 1.2], [42, 3.1], [20, 3.9], [78, 2.9]].map(([x, b], i) => (
            <Move key={i} on={anim} type="translate" from={`${i % 2 ? 6 : -6} -12`} to={`${i % 2 ? -8 : 8} 134`} dur={5 + (i % 3)} begin={b}>
              <g transform={`translate(${x} 0) rotate(${(i * 37) % 60 - 30})`}>
                <rect x="-6" y="-3.4" width="12" height="6.8" rx="1" fill="#6fcf7a" stroke="#2f8f3a" strokeWidth=".8" /><circle r="2" fill="#2f8f3a" opacity=".5" /><text x="0" y="1.6" textAnchor="middle" fontSize="4.6" fontFamily={FONT} fill="#1d5c25">$</text>
              </g>
            </Move>
          ))}
        </g>
      );
    case 'beat':
      return (
        <g>
          {Array.from({ length: 11 }, (_, i) => {
            const hs = [12, 22, 8, 26, 14, 20, 10, 24, 16, 28, 9];
            const h = hs[i];
            const col = ['#ff4fd8', '#a855f7', '#22d3ee'][i % 3];
            return (
              <rect key={i} x={5 + i * 8.6} y={122 - h} width="5.6" height={h} rx="1.4" fill={col} opacity=".92">
                {anim && <animate attributeName="height" values={`${h};${hs[(i + 4) % 11]};${hs[(i + 7) % 11]};${h}`} dur={`${0.6 + (i % 4) * 0.12}s`} repeatCount="indefinite" />}
                {anim && <animate attributeName="y" values={`${122 - h};${122 - hs[(i + 4) % 11]};${122 - hs[(i + 7) % 11]};${122 - h}`} dur={`${0.6 + (i % 4) * 0.12}s`} repeatCount="indefinite" />}
              </rect>
            );
          })}
        </g>
      );
    default: // flash — แฟลชปาปารัซซี่
      return (
        <g>
          {[[10, 24, 0], [88, 40, 0.5], [18, 84, 1.1], [84, 98, 0.3], [50, 12, 0.8], [6, 56, 1.5], [94, 70, 1.9]].map(([x, y, b], i) => (
            <Blink key={i} on={anim} values="0;1;0;0;0" dur={2.2} begin={b as number}>
              <g transform={`translate(${x} ${y})`}><path d={starPath(8)} fill="#fff" /><circle r="3" fill="#fffbe0" /></g>
            </Blink>
          ))}
        </g>
      );
  }
};

// ================================================================ ฉากหลัง
export const RapBackdrop: React.FC<{ id: string; uid: string; anim: boolean; night: boolean }> = ({ id, uid, anim, night }) => {
  switch (part(id)) {
    case 'graffiti':
      return (
        <g>
          <rect width="100" height="125" fill={night ? '#2a1a28' : '#a65440'} />
          {Array.from({ length: 14 }, (_, r) => Array.from({ length: 6 }, (_, q) => <rect key={`${r}${q}`} x={q * 18 - (r % 2) * 9} y={r * 9} width="17" height="8" fill={night ? '#3a2438' : r % 3 ? '#b86250' : '#9a4a38'} opacity=".75" />))}
          <g transform="translate(8 26) rotate(-6)">
            <text fontSize="30" fontFamily={FONT} fill="#ffd43b" stroke="#111" strokeWidth="2" paintOrder="stroke" letterSpacing="1">RAP</text>
            <text y="1.5" x="1.5" fontSize="30" fontFamily={FONT} fill="none" stroke="#ff4fa8" strokeWidth=".8" letterSpacing="1">RAP</text>
          </g>
          <path d="M60 60 C70 50 92 56 90 70 C88 82 70 78 62 84" stroke="#22d3ee" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".9" />
          <circle cx="22" cy="72" r="9" fill="#7c3aed" opacity=".85" /><path d="M16 72 H28 M22 66 V78" stroke="#fff" strokeWidth="1.6" />
          {night && <g opacity=".95"><path d="M86 0 V30" stroke="#444" strokeWidth="2" /><Blink on={anim} values=".8;1;.8" dur={3}><path d="M80 30 L98 30 L112 125 L66 125 Z" fill="#fff3a0" opacity=".16" /><circle cx="89" cy="31" r="3.6" fill="#fff6b0" /></Blink></g>}
          <rect y="108" width="100" height="17" fill={night ? '#1b1b26' : '#6b6f7c'} /><path d="M0 108 H100" stroke={night ? '#33334a' : '#9aa0ae'} strokeWidth="1.4" />
        </g>
      );
    case 'studio':
      return (
        <g>
          <rect width="100" height="125" fill={night ? '#150a26' : '#3b2468'} />
          {Array.from({ length: 5 }, (_, r) => Array.from({ length: 6 }, (_, q) => <path key={`${r}${q}`} d={`M${q * 18 + 9} ${r * 18} l9 9 l-9 9 l-9 -9 Z`} fill={(r + q) % 2 ? '#2a1a4a' : '#352060'} stroke="#150a26" strokeWidth=".6" />))}
          <g transform="translate(34 4)"><Blink on={anim} values=".55;1;.55" dur={1.6}><rect width="32" height="11" rx="3" fill="#e5252a" stroke="#ffb3b3" strokeWidth="1" /><text x="16" y="8.2" textAnchor="middle" fontSize="7" fontFamily={FONT} fill="#fff" letterSpacing=".6">ON AIR</text></Blink></g>
          <rect y="96" width="100" height="29" fill="#14141c" /><rect y="96" width="100" height="3" fill="#2f2f40" />
          {Array.from({ length: 12 }, (_, i) => <g key={i}><rect x={4 + i * 8} y="102" width="2.4" height="14" rx="1" fill="#2a2a3a" /><rect x={3.6 + i * 8} y={104 + ((i * 5) % 8)} width="3.2" height="4" rx="1" fill={['#ff4fd8', '#22d3ee', '#ffd43b'][i % 3]} /></g>)}
          <g transform="translate(78 64)"><path d="M0 40 V10" stroke="#aaa" strokeWidth="1.6" /><circle cy="6" r="6" fill="#2a2d3a" stroke="#9aa3b2" strokeWidth="1.2" /></g>
        </g>
      );
    default: // stage — เวทีคอนเสิร์ต
      return (
        <g>
          <rect width="100" height="125" fill={night ? '#0c0620' : '#2b1459'} />
          {[[20, '#ff4fd8', 0], [50, '#22d3ee', 1], [80, '#ffd43b', 2]].map(([x, col, b], i) => (
            <Move key={i} on={anim} type="rotate" values={`-14 ${x} 0;14 ${x} 0;-14 ${x} 0`} dur={4 + i} begin={b as number}>
              <path d={`M${x} 0 L${(x as number) - 22} 100 L${(x as number) + 22} 100 Z`} fill={col as string} opacity={night ? 0.32 : 0.22} />
            </Move>
          ))}
          <rect y="74" width="100" height="6" fill="#1b1030" /><rect y="80" width="100" height="45" fill="#0a0614" />
          {[[4, 98], [16, 94], [28, 99], [42, 95], [58, 97], [72, 94], [86, 99], [96, 95]].map(([x, y], i) => (
            <g key={i} fill="#05030c"><circle cx={x} cy={y} r="5" /><rect x={(x as number) - 5} y={y} width="10" height="30" rx="4" />
              <Move on={anim} type="translate" values="0 0;0 -3;0 0" dur={0.9} begin={i * 0.2}><path d={`M${(x as number) - 5} ${(y as number) + 4} L${(x as number) - 9} ${(y as number) - 8} M${(x as number) + 5} ${(y as number) + 4} L${(x as number) + 9} ${(y as number) - 8}`} stroke="#05030c" strokeWidth="2.6" strokeLinecap="round" /></Move></g>
          ))}
          {Array.from({ length: 10 }, (_, i) => <Blink key={i} on={anim} dur={1 + (i % 3) * 0.4} begin={i * 0.2}><circle cx={6 + i * 10} cy={86} r="1.6" fill={['#ff4fd8', '#22d3ee', '#ffd43b'][i % 3]} /></Blink>)}
        </g>
      );
  }
};

// ================================================================ หลุมศพ
export function rapGraveBody(id: string, anim: boolean): { shape: React.ReactNode; plate: [number, number, number] } {
  if (part(id) === 'vinyl') {
    return {
      plate: [50, 66, 9],
      shape: (
        <g>
          <Move on={anim} type="rotate" from="0 50 66" to="360 50 66" dur={9}>
            <circle cx="50" cy="66" r="38" fill="#15151c" stroke="#000" strokeWidth="1.6" />
            {[32, 26, 20, 15].map((r) => <circle key={r} cx="50" cy="66" r={r} fill="none" stroke="#2c2c3a" strokeWidth=".9" />)}
            <path d="M22 50 A32 32 0 0 1 40 36" stroke="#fff" strokeWidth="1.4" fill="none" opacity=".35" />
          </Move>
          <circle cx="50" cy="66" r="12" fill="#d62839" stroke="#8f1424" strokeWidth="1.4" />
          <rect x="30" y="104" width="40" height="7" rx="2" fill="#3a3a48" stroke="#14141b" strokeWidth="1.2" />
        </g>
      ),
    };
  }
  return {
    plate: [50, 62, 9],
    shape: (
      <g>
        <path d="M34 36 Q50 22 66 36" stroke="#3a3a46" strokeWidth="3" fill="none" />
        <rect x="16" y="36" width="68" height="70" rx="6" fill="#2a2d3a" stroke="#0e1018" strokeWidth="2" />
        <rect x="26" y="46" width="48" height="34" rx="4" fill="#14161f" stroke="#7b8294" strokeWidth="1.2" />
        {[[34, 94], [66, 94]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><Pulse on={anim} min={0.92} max={1.06} dur={0.7} begin={i * 0.35}><circle r="8" fill="#14161f" stroke="#7b8294" strokeWidth="1.4" /><circle r="3.4" fill="#7b8294" /></Pulse></g>)}
        <rect x="42" y="88" width="16" height="8" rx="2" fill="#e5484d" />
      </g>
    ),
  };
}
