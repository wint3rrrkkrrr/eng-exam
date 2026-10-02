import React, { useId } from 'react';
import { DEFAULT_AVATAR } from '../../shared/avatar';
import type { AvatarConfig } from '../../shared/avatar';
import { HAIR, SKIN, shade } from './colors';
import { Eyes, FacialHair, HairBack, HairFront, Mouth, Nose } from './layersHead';
import type { Ctx } from './layersHead';
import { Backdrop } from './layersBackdrop';
import { Eyewear, Headwear } from './layersGear';
import { AccessoryBack, AccessoryFront, Outfit } from './layersBody';
import { EffectBack, EffectFront } from './layersFx';
import { Move } from './anim';
import { RoleGlyph } from './RoleIcon';
import { Tone, VariantDefs, splitVariantId } from './variants';
import {
  SpecialAccessoryBack, SpecialAccessoryFront, SpecialBackdrop, SpecialEffectBack, SpecialEffectFront, SpecialEyewear,
  SpecialHeadwear, SpecialOutfit, isSpecialId, specialGraveBody,
} from './layersSpecial';
import { prefersReducedMotion, useNight } from './TimeContext';

interface Props {
  config?: Partial<AvatarConfig> | null;
  className?: string;
  title?: string;
  night?: boolean; // ไม่ระบุ = ตามเฟสเกม (TimeContext)
  still?: boolean; // true = ไม่เคลื่อนไหว
}

/** ไล่สีของผมพิเศษ (สายรุ้ง/เงิน/ทอง/ไฟ/กาแล็กซี) — ไฟกับกาแล็กซีขยับได้ */
const HairGradients: React.FC<{ uid: string; anim: boolean }> = ({ uid, anim }) => (
  <defs>
    <linearGradient id={`${uid}rb`} x1="0" y1="0" x2="1" y2="1">{['#ff5d5d', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#9775fa'].map((col, i) => <stop key={col} offset={i / 5} stopColor={col} />)}</linearGradient>
    <linearGradient id={`${uid}sv`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4f6fa" /><stop offset=".5" stopColor="#9aa3b2" /><stop offset="1" stopColor="#e6e9f0" /></linearGradient>
    <linearGradient id={`${uid}gd`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff0a0" /><stop offset=".5" stopColor="#d9a21f" /><stop offset="1" stopColor="#ffe27a" /></linearGradient>
    <linearGradient id={`${uid}fr`} x1="0" y1="1" x2="0" y2="0" spreadMethod="reflect" gradientUnits="objectBoundingBox">
      <stop offset="0" stopColor="#e5251a" /><stop offset=".55" stopColor="#ff8a1a" /><stop offset="1" stopColor="#ffe05a" />
      {anim && <animate attributeName="y1" values="1;1.4;1" dur="1.1s" repeatCount="indefinite" />}
    </linearGradient>
    <linearGradient id={`${uid}gx`} x1="0" y1="0" x2="1" y2="1" spreadMethod="repeat">
      <stop offset="0" stopColor="#1b1457" /><stop offset=".35" stopColor="#5b2ea6" /><stop offset=".6" stopColor="#e056a8" /><stop offset=".8" stopColor="#4aa3ff" /><stop offset="1" stopColor="#1b1457" />
      {anim && <animateTransform attributeName="gradientTransform" type="translate" values="0 0;1 1" dur="6s" repeatCount="indefinite" />}
    </linearGradient>
  </defs>
);

/** อวตารการ์ตูนครึ่งตัว วาดด้วย SVG ล้วน (ไม่มีรูปภาพ) — ประกอบจากชิ้นส่วนตามแคตตาล็อกใน shared/avatar.ts */
export const AvatarArt: React.FC<Props> = ({ config, className, title, night, still }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ctxNight = useNight();
  const isNight = night ?? ctxNight;
  const anim = !still && !prefersReducedMotion();
  const cfg: AvatarConfig = { ...DEFAULT_AVATAR, ...(config ?? {}) };
  const skin = SKIN[cfg.skin] ?? SKIN.skin_light;
  const hairBase = HAIR[cfg.hairColor] ?? HAIR.hc_brown;
  const hair = hairBase.startsWith('grad:') ? `url(#${uid}${hairBase.slice(5)})` : hairBase;
  const c: Ctx = { skin, hair, uid, anim };
  // โทนสี (id รูปแบบ ของเดิม~โทน) + เซ็ตพิเศษ (sp_...)
  const bd = splitVariantId(cfg.backdrop);
  const fxv = splitVariantId(cfg.effect);
  const acv = splitVariantId(cfg.accessory);
  const ofv = splitVariantId(cfg.outfit);
  const ewv = splitVariantId(cfg.eyewear);
  const hwv = splitVariantId(cfg.headwear);

  return (
    <svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label={title ?? 'อวตาร'}>
      {title && <title>{title}</title>}
      <HairGradients uid={uid} anim={anim} />
      <VariantDefs uid={uid} ids={[cfg.backdrop, cfg.effect, cfg.accessory, cfg.outfit, cfg.eyewear, cfg.headwear]} />

      <Tone variant={bd.variant} uid={uid}>{isSpecialId(bd.base) ? <SpecialBackdrop id={bd.base} uid={uid} anim={anim} night={isNight} /> : <Backdrop id={bd.base} uid={uid} anim={anim} night={isNight} />}</Tone>
      <Tone variant={fxv.variant} uid={uid}>{isSpecialId(fxv.base) ? <SpecialEffectBack id={fxv.base} uid={uid} anim={anim} /> : <EffectBack id={fxv.base} uid={uid} anim={anim} />}</Tone>
      <Tone variant={acv.variant} uid={uid}>{isSpecialId(acv.base) ? <SpecialAccessoryBack id={acv.base} c={c} /> : <AccessoryBack id={acv.base} c={c} />}</Tone>
      <HairBack id={cfg.hairStyle} c={c} />

      {/* คอ + เสื้อผ้า */}
      <rect x="43" y="68" width="14" height="24" rx="6" fill={shade(skin, 0.1)} />
      <Tone variant={ofv.variant} uid={uid}>{isSpecialId(ofv.base) ? <SpecialOutfit id={ofv.base} c={c} /> : <Outfit id={ofv.base} c={c} />}</Tone>

      {/* หัว */}
      <circle cx="29.5" cy="52" r="4.8" fill={skin} /><circle cx="29.5" cy="52" r="2.2" fill={shade(skin, 0.12)} />
      <circle cx="70.5" cy="52" r="4.8" fill={skin} /><circle cx="70.5" cy="52" r="2.2" fill={shade(skin, 0.12)} />
      <ellipse cx="50" cy="50" rx="21" ry="24" fill={skin} />
      <ellipse cx="36" cy="60" rx="3.4" ry="2.2" fill="#ff7b95" opacity=".22" /><ellipse cx="64" cy="60" rx="3.4" ry="2.2" fill="#ff7b95" opacity=".22" />

      <Eyes id={cfg.eyes} c={c} />
      <Nose c={c} />
      <Mouth id={cfg.mouth} c={c} />
      <FacialHair id={cfg.facialHair} c={c} />
      <HairFront id={cfg.hairStyle} c={c} />
      <Tone variant={ewv.variant} uid={uid}>{isSpecialId(ewv.base) ? <SpecialEyewear id={ewv.base} c={c} /> : <Eyewear id={ewv.base} c={c} />}</Tone>
      <Tone variant={hwv.variant} uid={uid}>{isSpecialId(hwv.base) ? <SpecialHeadwear id={hwv.base} c={c} /> : <Headwear id={hwv.base} c={c} />}</Tone>
      <Tone variant={acv.variant} uid={uid}>{isSpecialId(acv.base) ? <SpecialAccessoryFront id={acv.base} c={c} /> : <AccessoryFront id={acv.base} c={c} />}</Tone>
      <Tone variant={fxv.variant} uid={uid}>{isSpecialId(fxv.base) ? <SpecialEffectFront id={fxv.base} uid={uid} anim={anim} /> : <EffectFront id={fxv.base} uid={uid} anim={anim} />}</Tone>
    </svg>
  );
};

// ================================================================ หลุมศพ
type Plate = [number, number, number]; // ศูนย์กลาง x, y และรัศมีของแผ่นป้ายบทที่เฉลย

const Arch: React.FC<{ fill?: string; stroke?: string; hl?: string }> = ({ fill = '#a9afb9', stroke = '#7c8392', hl = 'rgba(255,255,255,.35)' }) => (
  <g>
    <path d="M26 108 V62 C26 40 74 40 74 62 V108 Z" fill={fill} stroke={stroke} strokeWidth="2" />
    <path d="M26 108 V62 C26 40 74 40 74 62" fill="none" stroke={hl} strokeWidth="2" />
  </g>
);

const Skull: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r="9" fill="#e9ecf2" /><rect x="-5" y="6" width="10" height="6" rx="2" fill="#e9ecf2" />
    <circle cx="-3.5" cy="0" r="2.4" fill="#4a4f5a" /><circle cx="3.5" cy="0" r="2.4" fill="#4a4f5a" /><path d="M-1.4 6 L-1.4 10 M1.4 6 L1.4 10" stroke="#4a4f5a" strokeWidth="1" />
  </g>
);

/** วาดตัวหลุมศพของแต่ละแบบ คืนตำแหน่งแผ่นป้ายบท */
function graveBody(id: string, anim: boolean): { shape: React.ReactNode; plate: Plate; lines?: boolean } {
  switch (id) {
    case 'gr_cross':
      return { plate: [50, 48, 10], shape: <path d="M42 108 V56 H28 V40 H42 V24 H58 V40 H72 V56 H58 V108 Z" fill="#b6b0a4" stroke="#857e70" strokeWidth="2" strokeLinejoin="round" /> };
    case 'gr_flowers':
      return {
        plate: [50, 68, 10],
        shape: (
          <g>
            <Arch fill="#b4b9c2" />
            {[[28, 106, '#ff8fab'], [38, 110, '#ffd43b'], [62, 110, '#fff'], [72, 106, '#b197fc'], [46, 112, '#ff6b6b']].map(([x, y, col], i) => (
              <g key={i} transform={`translate(${x} ${y})`}><path d="M0 0 V6" stroke="#2f9e44" strokeWidth="1.4" />{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cy="-2.6" rx="1.8" ry="2.8" fill={col as string} transform={`rotate(${a})`} />)}<circle r="1.2" fill="#f59f00" /></g>
            ))}
          </g>
        ),
      };
    case 'gr_heart':
      return { plate: [50, 62, 10], shape: <path d="M50 108 C14 82 14 36 36 36 C44 36 49 41 50 46 C51 41 56 36 64 36 C86 36 86 82 50 108 Z" fill="#e58aa4" stroke="#b0546f" strokeWidth="2" strokeLinejoin="round" /> };
    case 'gr_skull':
      return {
        plate: [50, 92, 8],
        shape: (
          <g>
            <path d="M24 70 C24 36 76 36 76 70 C76 82 70 86 66 88 V100 H34 V88 C30 86 24 82 24 70 Z" fill="#e9ecf2" stroke="#9aa1ae" strokeWidth="2" strokeLinejoin="round" />
            <ellipse cx="38" cy="66" rx="8" ry="9" fill="#3a3f4a" /><ellipse cx="62" cy="66" rx="8" ry="9" fill="#3a3f4a" /><path d="M50 74 L46 82 H54 Z" fill="#3a3f4a" />
          </g>
        ),
      };
    case 'gr_pumpkin':
      return {
        plate: [50, 86, 9],
        shape: (
          <g>
            <path d="M50 44 C48 40 52 36 56 34" stroke="#4a7a2a" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            <path d="M16 78 C14 52 32 44 50 48 C68 44 86 52 84 78 C86 100 66 108 50 106 C34 108 14 100 16 78 Z" fill="#f08a1c" stroke="#b45309" strokeWidth="2" />
            <path d="M50 48 C42 62 42 92 50 106 M50 48 C58 62 58 92 50 106 M32 52 C24 66 24 92 32 102 M68 52 C76 66 76 92 68 102" stroke="#c86a10" strokeWidth="1.4" fill="none" />
            <path d="M32 66 L40 60 L42 70 Z M68 66 L60 60 L58 70 Z" fill="#3a1a08" />
          </g>
        ),
      };
    case 'gr_paw':
      return {
        plate: [50, 74, 10],
        shape: (
          <g>
            <Arch fill="#9aa0ab" />
            <g fill="#6f7685" opacity=".55"><ellipse cx="50" cy="76" rx="12" ry="9" /><circle cx="34" cy="62" r="4.4" /><circle cx="44" cy="54" r="4.4" /><circle cx="56" cy="54" r="4.4" /><circle cx="66" cy="62" r="4.4" /></g>
          </g>
        ),
      };
    case 'gr_coffin':
      return {
        plate: [50, 58, 10],
        shape: (
          <g>
            <path d="M38 26 H62 L74 56 L64 108 H36 L26 56 Z" fill="#8a5a2b" stroke="#4a2f14" strokeWidth="2" strokeLinejoin="round" />
            <path d="M50 30 V104" stroke="#6b4421" strokeWidth="1.2" /><path d="M36 30 L28 56 L36 104 M64 30 L72 56 L64 104" stroke="#a9733a" strokeWidth="1.2" fill="none" />
          </g>
        ),
      };
    case 'gr_obelisk':
      return {
        plate: [50, 62, 8.4],
        shape: (
          <g>
            <path d="M38 108 L42 36 L50 22 L58 36 L62 108 Z" fill="#a9afb9" stroke="#7c8392" strokeWidth="2" strokeLinejoin="round" />
            <path d="M42 36 L58 36" stroke="#7c8392" strokeWidth="1.4" /><rect x="32" y="100" width="36" height="8" rx="1.5" fill="#8d94a2" stroke="#7c8392" strokeWidth="1.4" />
          </g>
        ),
      };
    case 'gr_ice':
      return {
        plate: [50, 70, 10],
        shape: (
          <g>
            <Arch fill="#bfe4f7" stroke="#6fb2d6" hl="rgba(255,255,255,.7)" />
            <path d="M22 108 L26 88 L32 108 Z M70 108 L76 84 L80 108 Z M60 108 L64 94 L68 108 Z" fill="#d9f1fc" stroke="#6fb2d6" strokeWidth="1.2" strokeLinejoin="round" />
          </g>
        ),
      };
    case 'gr_ghost':
      return {
        plate: [50, 80, 9],
        shape: (
          <g>
            <Arch />
            <g transform="translate(50 36)">
              <Move on={anim} type="translate" values="0 0;0 -6;0 0" dur={2.6}>
                <path d="M-10 14 V-2 C-10 -18 10 -18 10 -2 V14 L6 10 L2 14 L-2 10 L-6 14 Z" fill="#fff" stroke="#cfd6e4" strokeWidth="1" opacity=".92" />
                <circle cx="-3.6" cy="-4" r="1.8" fill="#2a1d22" /><circle cx="3.6" cy="-4" r="1.8" fill="#2a1d22" /><ellipse cx="0" cy="2" rx="1.8" ry="2.4" fill="#2a1d22" />
              </Move>
            </g>
          </g>
        ),
      };
    case 'gr_angel':
      return {
        plate: [50, 96, 8],
        shape: (
          <g>
            <rect x="28" y="82" width="44" height="26" rx="2" fill="#c3c8d2" stroke="#8d94a2" strokeWidth="2" />
            <path d="M50 78 C40 60 22 56 18 66 C26 66 28 72 28 76 C36 72 44 76 50 78 Z M50 78 C60 60 78 56 82 66 C74 66 72 72 72 76 C64 72 56 76 50 78 Z" fill="#fff" stroke="#c3c8d2" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M42 80 C42 66 58 66 58 80 Z" fill="#f1f3f8" stroke="#c3c8d2" strokeWidth="1.4" /><circle cx="50" cy="58" r="7" fill="#f1f3f8" stroke="#c3c8d2" strokeWidth="1.4" />
            <ellipse cx="50" cy="48" rx="8" ry="2.6" fill="none" stroke="#ffd43b" strokeWidth="2" />
          </g>
        ),
      };
    case 'gr_gold':
      return {
        plate: [50, 68, 10],
        shape: (
          <g>
            <Arch fill="#e6b53a" stroke="#a9791a" hl="rgba(255,255,255,.6)" />
            {[[34, 52, '#e5484d'], [66, 52, '#3b82f6'], [50, 46, '#22c55e']].map(([x, y, col], i) => <circle key={i} cx={x as number} cy={y as number} r="3" fill={col as string} stroke="#fff3bf" strokeWidth="1" />)}
            <path d="M32 100 H68" stroke="#a9791a" strokeWidth="2" />
          </g>
        ),
      };
    default: // gr_stone
      return {
        plate: [50, 68, 10],
        lines: true,
        shape: <Arch />,
      };
  }
}

/** ป้ายหลุมศพ (ผู้เล่นที่ตายแล้ว) — ฉากหลังของผู้เล่น + หลุมศพตามที่ตั้งไว้ · ถ้าเฉลยบทแล้ว ไอคอนบทจะอยู่บนป้ายหลุมศพ (ยังไม่เฉลย = หัวกะโหลก) */
export const GraveArt: React.FC<{ backdrop?: string; grave?: string; role?: string | null; className?: string; night?: boolean; still?: boolean }> = ({ backdrop, grave, role, className, night, still }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ctxNight = useNight();
  const anim = !still && !prefersReducedMotion();
  const gv = splitVariantId(grave ?? 'gr_stone');
  const bgv = splitVariantId(backdrop ?? 'bg_meadow');
  const { shape, plate, lines } = isSpecialId(gv.base) ? { ...specialGraveBody(gv.base, anim), lines: false } : graveBody(gv.base, anim);
  const [px, py, pr] = plate;
  return (
    <svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="ตายแล้ว">
      <VariantDefs uid={uid} ids={[backdrop ?? '', grave ?? '']} />
      <Tone variant={bgv.variant} uid={uid}>{isSpecialId(bgv.base) ? <SpecialBackdrop id={bgv.base} uid={uid} anim={anim} night={night ?? ctxNight} /> : <Backdrop id={bgv.base} uid={uid} anim={anim} night={night ?? ctxNight} />}</Tone>
      <rect width="100" height="125" fill="rgba(20,20,40,.18)" />
      <ellipse cx="50" cy="104" rx="30" ry="6" fill="rgba(0,0,0,.18)" />
      <Tone variant={gv.variant} uid={uid}>{shape}</Tone>
      {/* แผ่นป้ายบทบนหลุมศพ */}
      <circle cx={px} cy={py} r={pr + 1.6} fill="#8d94a2" opacity=".55" />
      <circle cx={px} cy={py} r={pr} fill="#f6f7fb" stroke="#7c8392" strokeWidth="1.4" />
      {role ? (
        <g transform={`translate(${px - pr * 0.82} ${py - pr * 0.82}) scale(${(pr * 1.64) / 32})`}><RoleGlyph id={role} /></g>
      ) : (
        <Skull x={px} y={py - 1} s={pr / 12} />
      )}
      {lines && <path d="M40 90 H60 M43 96 H57" stroke="#7c8392" strokeWidth="2" strokeLinecap="round" />}
      <ellipse cx="50" cy="112" rx="38" ry="9" fill="#4f9a45" opacity=".9" />
    </svg>
  );
};
