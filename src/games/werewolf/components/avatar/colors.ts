// components/avatar/colors.ts — สีของอวตาร (สีผิว/สีผม) + ตัวช่วยปรับความเข้มสี

export const SKIN: Record<string, string> = {
  skin_light: '#fbe3c7',
  skin_fair: '#f4d0a8',
  skin_tan: '#e2ab7e',
  skin_brown: '#c58a5c',
  skin_dark: '#8f5a3c',
  skin_deep: '#5a3a2a',
  skin_pink: '#f8c3cf',
  skin_ghost: '#e6eaf2',
  skin_zombie: '#a6c98a',
  skin_blue: '#8fc4e8',
  skin_purple: '#b79be0',
  skin_gold: '#eabf4e',
};

/** สีผมธรรมดา = รหัสสี · สีพิเศษ = 'grad:<ชื่อ>' (ไล่สี/เคลื่อนไหว วาดใน AvatarArt) */
export const HAIR: Record<string, string> = {
  hc_black: '#2b2224',
  hc_brown: '#6b3f2a',
  hc_blonde: '#e2b94a',
  hc_red: '#c8492b',
  hc_gray: '#9aa0a8',
  hc_maroon: '#6e1f2b',
  hc_cream: '#f3e6c4',
  hc_navy: '#1f2a5c',
  hc_orange: '#f08a1c',
  hc_white: '#f1f1f4',
  hc_blue: '#3d7be0',
  hc_pink: '#ee6fae',
  hc_green: '#4cbf6b',
  hc_purple: '#8a54d6',
  hc_teal: '#2bb5a0',
  hc_lime: '#a4d61f',
  hc_cyan: '#27e0f0',
  hc_silver: 'grad:sv',
  hc_gold: 'grad:gd',
  hc_rainbow: 'grad:rb',
  hc_fire: 'grad:fr',
  hc_galaxy: 'grad:gx',
};

/** ผสมสีกับสีดำ (amt>0) หรือสีขาว (amt<0) เพื่อทำเงา/ไฮไลต์ */
export function shade(hex: string, amt: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const n = parseInt(hex.replace('#', ''), 16);
  const target = amt >= 0 ? 0 : 255;
  const k = Math.abs(amt);
  const r = Math.round(((n >> 16) & 255) * (1 - k) + target * k);
  const g = Math.round(((n >> 8) & 255) * (1 - k) + target * k);
  const b = Math.round((n & 255) * (1 - k) + target * k);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export const INK = '#2a1d22'; // สีเส้น/รูม่านตา
