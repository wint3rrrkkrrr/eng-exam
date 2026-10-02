// shared/avatarExtra.ts — ส่วนขยายแคตตาล็อกแบบ "สร้างจากสูตร": โทนสี (คูณทุกชิ้นของเดิม) · เสื้อลาย · เซ็ตพิเศษแลกด้วยโค้ด · วงล้อกาชา
// ข้อมูลล้วน (ไม่มี React) ใช้ร่วมกันทั้งเบราว์เซอร์และเซิร์ฟเวอร์ — ราคา/อัตราดรอป/โค้ดตัดสินที่เซิร์ฟเวอร์เสมอ
import type { AvatarItem, AvatarSlot, Rarity } from './avatar';

// ================================================================ โทนสี (วาดด้วยฟิลเตอร์สี SVG ทับของเดิม — ไม่ต้องวาดใหม่ทีละชิ้น)
export interface VariantDef {
  key: string;
  nameTh: string;
  extra: number; // ราคาเพิ่มจากของต้นฉบับ
  /** ฟิลเตอร์: หมุนเฉดสี (องศา) · ความอิ่มสี · ความสว่าง · เซเปีย (true = โทนวินเทจ) */
  hue?: number;
  sat?: number;
  bright?: number;
  sepia?: boolean;
}

export const VARIANTS: VariantDef[] = [
  { key: 'dusk', nameTh: 'สนธยา', extra: 20, hue: 35 },
  { key: 'emerald', nameTh: 'มรกต', extra: 20, hue: 95 },
  { key: 'ocean', nameTh: 'มหาสมุทร', extra: 20, hue: 165 },
  { key: 'amethyst', nameTh: 'อเมทิสต์', extra: 20, hue: 235 },
  { key: 'rose', nameTh: 'กุหลาบ', extra: 20, hue: 295 },
  { key: 'noir', nameTh: 'ขาวดำ', extra: 30, sat: 0 },
  { key: 'vintage', nameTh: 'วินเทจ', extra: 30, sepia: true, sat: 0.9 },
  { key: 'ember', nameTh: 'เพลิง', extra: 50, hue: -25, sat: 1.6 },
  { key: 'ice', nameTh: 'น้ำแข็ง', extra: 50, hue: 190, sat: 0.75, bright: 1.18 },
  { key: 'neon', nameTh: 'นีออน', extra: 60, hue: 20, sat: 2.4, bright: 1.05 },
  { key: 'cosmic', nameTh: 'จักรวาล', extra: 70, hue: 255, sat: 1.8 },
  { key: 'gold', nameTh: 'โกลด์', extra: 90, sepia: true, sat: 3, bright: 1.12 },
];
export const VARIANT_BY_KEY: Record<string, VariantDef> = Object.fromEntries(VARIANTS.map((v) => [v.key, v]));

/** ช่องที่คูณโทนสีได้ (ผิว/ผม/ตา/ปากมีระบบสีของตัวเอง) */
export const VARIANT_SLOTS: AvatarSlot[] = ['outfit', 'headwear', 'eyewear', 'accessory', 'effect', 'backdrop', 'grave'];

export function splitVariantId(id: string): { base: string; variant: VariantDef | null } {
  const i = id.indexOf('~');
  if (i < 0) return { base: id, variant: null };
  return { base: id.slice(0, i), variant: VARIANT_BY_KEY[id.slice(i + 1)] ?? null };
}

/** คูณทุกชิ้นของเดิมด้วยทุกโทนสี (ข้ามชิ้น "ไม่มี") */
export function buildVariantItems(base: AvatarItem[]): AvatarItem[] {
  const out: AvatarItem[] = [];
  for (const b of base) {
    if (!VARIANT_SLOTS.includes(b.slot) || /_none$/.test(b.id) || b.exclusive) continue;
    for (const v of VARIANTS) {
      out.push({ id: `${b.id}~${v.key}`, slot: b.slot, nameTh: `${b.nameTh} · โทน${v.nameTh}`, price: b.price + v.extra, ...(b.animated ? { animated: true } : {}) });
    }
  }
  return out;
}

// ================================================================ เสื้อลาย (8 ลาย × 10 สี = 80 ชิ้น)
export interface PatternColor { key: string; nameTh: string; main: string; alt: string }
export const PATTERN_COLORS: PatternColor[] = [
  { key: 'red', nameTh: 'แดง', main: '#e5484d', alt: '#ffd6d8' },
  { key: 'blue', nameTh: 'น้ำเงิน', main: '#3d6fd9', alt: '#d6e4ff' },
  { key: 'green', nameTh: 'เขียว', main: '#2fa45a', alt: '#d3f5df' },
  { key: 'purple', nameTh: 'ม่วง', main: '#7b4fd6', alt: '#e6dbff' },
  { key: 'pink', nameTh: 'ชมพู', main: '#ee6fae', alt: '#ffe0ee' },
  { key: 'teal', nameTh: 'เขียวมิ้นต์', main: '#1fb5a0', alt: '#d2f6f0' },
  { key: 'orange', nameTh: 'ส้ม', main: '#f08a1c', alt: '#ffe8cc' },
  { key: 'black', nameTh: 'ดำ', main: '#2b2d38', alt: '#8b90a3' },
  { key: 'white', nameTh: 'ขาว', main: '#f4f6fb', alt: '#9aa3b8' },
  { key: 'gold', nameTh: 'ทอง', main: '#e0aa2a', alt: '#fff3bf' },
];
export interface PatternDef { key: string; nameTh: string; price: number }
export const PATTERNS: PatternDef[] = [
  { key: 'stripe', nameTh: 'ลายทาง', price: 40 },
  { key: 'dots', nameTh: 'ลายจุด', price: 40 },
  { key: 'stars', nameTh: 'ลายดาว', price: 60 },
  { key: 'check', nameTh: 'ลายหมากรุก', price: 60 },
  { key: 'hearts', nameTh: 'ลายหัวใจ', price: 70 },
  { key: 'zigzag', nameTh: 'ลายซิกแซก', price: 80 },
  { key: 'camo', nameTh: 'ลายพราง', price: 90 },
  { key: 'gradient', nameTh: 'ไล่สี', price: 110 },
];
export const PATTERN_COLOR_BY_KEY: Record<string, PatternColor> = Object.fromEntries(PATTERN_COLORS.map((c) => [c.key, c]));

export function buildPatternOutfits(): AvatarItem[] {
  const out: AvatarItem[] = [];
  for (const p of PATTERNS) {
    for (const c of PATTERN_COLORS) {
      out.push({ id: `of_pat_${p.key}_${c.key}`, slot: 'outfit', nameTh: `เสื้อ${p.nameTh}สี${c.nameTh}`, price: p.price + (c.key === 'gold' ? 60 : 0) });
    }
  }
  return out;
}

// ================================================================ คอลเลกชันแรปเปอร์ 🎤 (วาดใน components/avatar/layersRap.tsx — id รูปแบบ rap_<ช่อง>_<ชื่อ>)
export function buildRapItems(): AvatarItem[] {
  const r = (slot: AvatarSlot, name: string, nameTh: string, price: number, animated = false): AvatarItem =>
    ({ id: `rap_${slot}_${name}`, slot, nameTh: `แรปเปอร์ · ${nameTh}`, price, ...(animated ? { animated: true } : {}) });
  return [
    r('outfit', 'hoodie', 'ฮู้ดโอเวอร์ไซส์ลายกราฟฟิตี้ YO', 140, true), r('outfit', 'jersey', 'เสื้อบาสเบอร์ 23', 120),
    r('outfit', 'puffer', 'เสื้อพัฟเฟอร์สีทอง', 190), r('outfit', 'track', 'ชุดวอร์มแถบข้างสีน้ำเงิน', 130),
    r('outfit', 'camo', 'แจ็คเก็ตพรางสตรีท MC', 150), r('outfit', 'bling', 'แจ็คเก็ตหนังประดับเพชร', 260, true),
    r('headwear', 'snapback', 'หมวกสแนปแบ็กสีแดง', 90), r('headwear', 'snapbackgold', 'หมวกสแนปแบ็กสีทอง', 170, true),
    r('headwear', 'durag', 'ดูแร็กดำคาดทอง', 110), r('headwear', 'beanie', 'บีนนี่ปลายทอง', 100),
    r('eyewear', 'shades', 'แว่นดำเหลี่ยมหนา', 100), r('eyewear', 'goldmirror', 'แว่นกลมกรอบทองเลนส์กระจก', 160),
    r('eyewear', 'iced', 'แว่นไอซ์เอาท์ประดับเพชร', 240, true),
    r('mouth', 'grill', 'ฟันทองกริลล์', 150), r('mouth', 'diamond', 'ฟันเพชรกริลล์', 260, true),
    r('accessory', 'chain', 'สร้อยทองจี้ดอลลาร์', 180, true), r('accessory', 'cuban', 'สร้อยคิวบันสองเส้นจี้เพชร', 320, true),
    r('accessory', 'mic', 'ไมค์ในมือ', 140), r('accessory', 'boombox', 'ลำโพงบูมบ็อกซ์ตัวโต', 210, true),
    r('effect', 'money', 'ฝนแบงก์ดอลลาร์', 300, true), r('effect', 'beat', 'อีควอไลเซอร์ปรับเสียง', 260, true), r('effect', 'flash', 'แฟลชปาปารัซซี่', 220, true),
    r('backdrop', 'graffiti', 'กำแพงกราฟฟิตี้สตรีท', 200, true), r('backdrop', 'studio', 'สตูดิโออัดเสียง ON AIR', 240, true), r('backdrop', 'stage', 'เวทีคอนเสิร์ตสปอตไลต์', 300, true),
    r('grave', 'boombox', 'หลุมศพบูมบ็อกซ์', 230, true), r('grave', 'vinyl', 'หลุมศพแผ่นเสียงหมุน', 260, true),
  ];
}

// ================================================================ เซ็ตพิเศษแลกด้วยโค้ด (ไม่ขายในร้าน · ไม่ออกจากกาชา · ชื่อเจ้าของเซ็ตอยู่บนของทุกชิ้น)
export type SetId = 'winter' | 'nongfloat' | 'mos' | 'khowfang';
export interface SpecialSet {
  id: SetId;
  person: string; // ชื่อที่ปรากฏบนของ
  nameTh: string;
  themeTh: string;
  parts: { slot: AvatarSlot; nameTh: string }[];
}

export const SPECIAL_SETS: SpecialSet[] = [
  {
    id: 'winter', person: 'WINTER', nameTh: 'เซ็ตจักรพรรดิน้ำแข็ง WINTER', themeTh: 'น้ำแข็งคริสตัล · ทองคำ · หิมะโปรย',
    parts: [
      { slot: 'outfit', nameTh: 'เสื้อคลุมจักรพรรดิน้ำแข็ง WINTER' },
      { slot: 'headwear', nameTh: 'มงกุฎผลึกน้ำแข็ง WINTER' },
      { slot: 'eyewear', nameTh: 'หน้ากากคริสตัล WINTER' },
      { slot: 'accessory', nameTh: 'ปีกน้ำแข็ง + ป้ายนามพระองค์ WINTER' },
      { slot: 'effect', nameTh: 'พายุหิมะรอบองค์ WINTER' },
      { slot: 'backdrop', nameTh: 'พระราชวังน้ำแข็ง WINTER' },
      { slot: 'grave', nameTh: 'สุสานคริสตัลหลวง WINTER' },
    ],
  },
  {
    id: 'nongfloat', person: 'Nongfloat', nameTh: 'เซ็ตเจ้าหญิงเมฆลอย Nongfloat', themeTh: 'ชมพูหวานฟุ้ง · เมฆชมพู · ลูกโป่งหัวใจลอย',
    parts: [
      { slot: 'outfit', nameTh: 'ชุดเมฆฟูลอยฟ้า Nongfloat' },
      { slot: 'headwear', nameTh: 'มงกุฎเมฆและลูกโป่ง Nongfloat' },
      { slot: 'eyewear', nameTh: 'แว่นหัวใจรุ้ง Nongfloat' },
      { slot: 'accessory', nameTh: 'ปีกผีเสื้อรุ้ง + ป้ายชื่อ Nongfloat' },
      { slot: 'effect', nameTh: 'ลูกโป่งและเมฆลอยรอบตัว Nongfloat' },
      { slot: 'backdrop', nameTh: 'เมืองบนก้อนเมฆ Nongfloat' },
      { slot: 'grave', nameTh: 'อนุสรณ์ก้อนเมฆสีรุ้ง Nongfloat' },
    ],
  },
  {
    id: 'mos', person: 'Mos', nameTh: 'เซ็ตเจ้าแห่งป่ามอส Mos', themeTh: 'ป่าตะไคร่ · เห็ดเรืองแสง · หิ่งห้อย',
    parts: [
      { slot: 'outfit', nameTh: 'เสื้อคลุมมอสป่าลึก Mos' },
      { slot: 'headwear', nameTh: 'มงกุฎกิ่งไม้และเห็ดเรืองแสง Mos' },
      { slot: 'eyewear', nameTh: 'หน้ากากใบไม้ Mos' },
      { slot: 'accessory', nameTh: 'ปีกใบไม้ + ป้ายชื่อ Mos' },
      { slot: 'effect', nameTh: 'หิ่งห้อยและสปอร์เรืองแสง Mos' },
      { slot: 'backdrop', nameTh: 'ป่ามอสเรืองแสง Mos' },
      { slot: 'grave', nameTh: 'หลุมศพโอบมอส Mos' },
    ],
  },
];
SPECIAL_SETS.push({
  id: 'khowfang', person: 'KhowFang', nameTh: 'เซ็ตเจ้าหญิงสายรุ้ง KhowFang', themeTh: 'สายรุ้งเจ็ดสี · ประกายหลากสี · เมฆฟู',
  parts: [
    { slot: 'outfit', nameTh: 'ชุดสายรุ้งไล่สี KhowFang' },
    { slot: 'headwear', nameTh: 'มงกุฎโค้งรุ้งและดาว KhowFang' },
    { slot: 'eyewear', nameTh: 'แว่นดาวขอบรุ้ง KhowFang' },
    { slot: 'accessory', nameTh: 'ปีกขนนกสายรุ้ง + ธงชื่อ KhowFang' },
    { slot: 'effect', nameTh: 'ออร่าสายรุ้งหมุนวน KhowFang' },
    { slot: 'backdrop', nameTh: 'ท้องฟ้าสายรุ้งยักษ์ KhowFang' },
    { slot: 'grave', nameTh: 'ซุ้มสายรุ้งอนุสรณ์ KhowFang' },
  ],
});
export const SET_BY_ID: Record<string, SpecialSet> = Object.fromEntries(SPECIAL_SETS.map((s) => [s.id, s]));

export const specialItemId = (set: SetId, slot: AvatarSlot): string => `sp_${set}_${slot}`;

export function buildSpecialItems(): AvatarItem[] {
  return SPECIAL_SETS.flatMap((s) => s.parts.map((p): AvatarItem => ({
    id: specialItemId(s.id, p.slot), slot: p.slot, nameTh: p.nameTh, price: 0, animated: true, exclusive: s.id, rarity: 'legendary',
  })));
}
export const setItemIds = (set: SetId): string[] => SET_BY_ID[set].parts.map((p) => specialItemId(set, p.slot));

// ================================================================ วงล้อกาชา
export type WheelId = 'silver' | 'gold' | 'diamond';
export interface WheelDef {
  id: WheelId;
  nameTh: string;
  cost: number;
  /** น้ำหนักโอกาสออกตามระดับ (รวมไม่ต้องเป็น 100) */
  rates: Record<Rarity, number>;
  taglineTh: string;
}
export const WHEELS: WheelDef[] = [
  { id: 'silver', nameTh: 'วงล้อเงิน', cost: 60, rates: { common: 70, rare: 25, epic: 4.5, legendary: 0.5 }, taglineTh: 'ของทั่วไปเพียบ มีลุ้นของหายาก' },
  { id: 'gold', nameTh: 'วงล้อทอง', cost: 180, rates: { common: 25, rare: 45, epic: 24, legendary: 6 }, taglineTh: 'หายากขึ้น ลุ้นหายากมากและในตำนาน' },
  { id: 'diamond', nameTh: 'วงล้อเพชร', cost: 500, rates: { common: 0, rare: 22, epic: 50, legendary: 28 }, taglineTh: 'ไม่มีของธรรมดา เน้นหายากมากขึ้นไป' },
];
export const WHEEL_BY_ID: Record<string, WheelDef> = Object.fromEntries(WHEELS.map((w) => [w.id, w]));
/** ของซ้ำได้เหรียญคืนกี่ % ของราคา */
export const DUPLICATE_REFUND_PCT = 40;
export const SPIN_COUNTS = [1, 10] as const;
