// shared/collections.ts — คอลเลกชันธีมของแต่งตัว (ข้อมูลล้วน): แต่ละคอลเลกชัน 10 ชิ้น วาดจากแม่แบบ + สี + ลวดลายประจำธีมใน components/avatar/layersCollections.tsx
// id รูปแบบ col_<คอลเลกชัน>_<ส่วน> เช่น col_nin_outfit_a · ราคา/อัตราดรอปตัดสินที่เซิร์ฟเวอร์เสมอ
import type { AvatarItem, AvatarSlot } from './avatar';

export type MotifKind =
  | 'shuriken' | 'chip' | 'pumpkin' | 'planet' | 'anchor' | 'candy' | 'ankh' | 'heartpx' | 'lotus' | 'tree' | 'starmoon' | 'bolt' | 'sheriff';
export type SceneKind = 'hills' | 'city' | 'water' | 'space' | 'desert' | 'candy';

export interface Collection {
  id: string;
  emoji: string;
  nameTh: string;
  motif: MotifKind;
  scene: SceneKind;
  /** สี: a = อ่อน · b = หลัก · c = เข้ม · d = เน้น */
  pal: { a: string; b: string; c: string; d: string };
  /** ท้องฟ้า [กลางวันบน, กลางวันล่าง, กลางคืนบน, กลางคืนล่าง] */
  sky: [string, string, string, string];
  /** ชื่อไทยของแต่ละส่วน */
  names: { outfit_a: string; outfit_b: string; headwear_a: string; headwear_b: string; eyewear: string; accessory_a: string; accessory_b: string; effect: string; backdrop: string; grave: string };
  tier: number; // ตัวคูณราคา (1 = มาตรฐาน)
}

export const COLLECTIONS: Collection[] = [
  {
    id: 'nin', emoji: '🥷', nameTh: 'ซามูไร/นินจา', motif: 'shuriken', scene: 'hills',
    pal: { a: '#ffb3b3', b: '#c1121f', c: '#2b0a0f', d: '#e8edf5' }, sky: ['#ffd6a5', '#ffeede', '#1a0b14', '#4a1d2f'], tier: 1.1,
    names: { outfit_a: 'กิโมโนซามูไร', outfit_b: 'เกราะนินจาเงา', headwear_a: 'มงกุฎโชกุน', headwear_b: 'หมวกฟางนักดาบ', eyewear: 'หน้ากากนินจา', accessory_a: 'ปีกกาเงา', accessory_b: 'ชูริเคนลอยข้างไหล่', effect: 'ชูริเคนและกลีบซากุระวน', backdrop: 'วัดญี่ปุ่นใต้จันทร์', grave: 'ประตูโทริอิอนุสรณ์' },
  },
  {
    id: 'cyb', emoji: '🤖', nameTh: 'ไซเบอร์พังก์', motif: 'chip', scene: 'city',
    pal: { a: '#7df9ff', b: '#7a2cff', c: '#0a0620', d: '#ff2bd6' }, sky: ['#6ee7ff', '#fdf2ff', '#05020f', '#2d0a52'], tier: 1.2,
    names: { outfit_a: 'แจ็คเก็ตนีออนวิ่งวงจร', outfit_b: 'เกราะไซบอร์ก', headwear_a: 'มงกุฎโฮโลแกรม', headwear_b: 'หมวกเฮลเมตไซเบอร์', eyewear: 'ไบเซอร์สแกนเนอร์', accessory_a: 'ปีกแสงโฮโลแกรม', accessory_b: 'ชิปลอยข้างไหล่', effect: 'ข้อมูลดิจิทัลไหลวน', backdrop: 'มหานครไซเบอร์นีออน', grave: 'ตู้เซิร์ฟเวอร์อนุสรณ์' },
  },
  {
    id: 'hal', emoji: '🎃', nameTh: 'ฮาโลวีน', motif: 'pumpkin', scene: 'hills',
    pal: { a: '#ffd8a8', b: '#f08a1c', c: '#2a0f3a', d: '#9b5de5' }, sky: ['#ffd29d', '#fff0d9', '#12041f', '#3a1260'], tier: 1,
    names: { outfit_a: 'ชุดคลุมแม่มดฟักทอง', outfit_b: 'เกราะโครงกระดูก', headwear_a: 'มงกุฎค้างคาว', headwear_b: 'หมวกแม่มดลายฟักทอง', eyewear: 'หน้ากากผีสิง', accessory_a: 'ปีกค้างคาว', accessory_b: 'ฟักทองลอยข้างไหล่', effect: 'ฟักทองและค้างคาวบินวน', backdrop: 'สุสานฮาโลวีนใต้จันทร์เต็มดวง', grave: 'หลุมศพฟักทองยักษ์' },
  },
  {
    id: 'spc', emoji: '🚀', nameTh: 'อวกาศ', motif: 'planet', scene: 'space',
    pal: { a: '#c7d2fe', b: '#4f46e5', c: '#0b0a2a', d: '#f9a8d4' }, sky: ['#8ec5ff', '#e6f0ff', '#02010f', '#1b1160'], tier: 1.15,
    names: { outfit_a: 'ชุดนักบินอวกาศกาแล็กซี', outfit_b: 'เกราะนักรบดาวเคราะห์', headwear_a: 'มงกุฎดาวเคราะห์', headwear_b: 'หมวกกระจกนักบิน', eyewear: 'แว่นนักสำรวจอวกาศ', accessory_a: 'ปีกเนบิวลา', accessory_b: 'ดาวเคราะห์ลอยข้างไหล่', effect: 'ดวงดาวและดาวหางโคจร', backdrop: 'ฉากอวกาศลึกกับดาวเคราะห์', grave: 'อนุสรณ์ดาวตก' },
  },
  {
    id: 'pir', emoji: '🏴‍☠️', nameTh: 'โจรสลัด', motif: 'anchor', scene: 'water',
    pal: { a: '#fde68a', b: '#0f766e', c: '#082f2c', d: '#fbbf24' }, sky: ['#7dd3fc', '#e0f7ff', '#041b2d', '#0b4a5a'], tier: 1,
    names: { outfit_a: 'เสื้อกัปตันโจรสลัด', outfit_b: 'เสื้อคลุมเรือหลวง', headwear_a: 'มงกุฎราชาแห่งท้องทะเล', headwear_b: 'หมวกสามเหลี่ยมกัปตัน', eyewear: 'ผ้าปิดตาสมบัติ', accessory_a: 'ปีกคลื่นทะเล', accessory_b: 'สมอเรือลอยข้างไหล่', effect: 'ฟองทะเลและสมอวน', backdrop: 'เรือโจรสลัดกลางทะเล', grave: 'อนุสรณ์สมอเรือจม' },
  },
  {
    id: 'swt', emoji: '🍭', nameTh: 'ขนมหวานคาวาอี้', motif: 'candy', scene: 'candy',
    pal: { a: '#ffe4f1', b: '#ff7eb6', c: '#a8327a', d: '#7de0d0' }, sky: ['#ffd6ec', '#fff5fa', '#3a1250', '#b43f95'], tier: 1,
    names: { outfit_a: 'ชุดเค้กสตรอว์เบอร์รี', outfit_b: 'แจ็คเก็ตมาการอง', headwear_a: 'มงกุฎลูกกวาด', headwear_b: 'หมวกไอศกรีมโคน', eyewear: 'หน้ากากขนมหวาน', accessory_a: 'ปีกมาร์ชแมลโลว์', accessory_b: 'ลูกอมลอยข้างไหล่', effect: 'ลูกอมและโรยน้ำตาลปลิว', backdrop: 'เมืองขนมหวานลอลลีป๊อป', grave: 'อนุสรณ์เค้กหวาน' },
  },
  {
    id: 'egy', emoji: '🏺', nameTh: 'ฟาโรห์อียิปต์', motif: 'ankh', scene: 'desert',
    pal: { a: '#fde68a', b: '#d4a017', c: '#4a2f05', d: '#22d3ee' }, sky: ['#ffe29a', '#fff7dc', '#1a1030', '#5a3a12'], tier: 1.3,
    names: { outfit_a: 'เสื้อคลุมฟาโรห์ทองคำ', outfit_b: 'เกราะอนูบิส', headwear_a: 'มงกุฎฟาโรห์คู่', headwear_b: 'หมวกนีเมสลายแถบ', eyewear: 'หน้ากากดวงตาฮอรัส', accessory_a: 'ปีกไอซิสทองคำ', accessory_b: 'กุญแจอังค์ลอยข้างไหล่', effect: 'ทรายทองและอังค์วน', backdrop: 'พีระมิดกลางทะเลทราย', grave: 'สุสานฟาโรห์ทองคำ' },
  },
  {
    id: 'pxl', emoji: '🎮', nameTh: 'เกมเมอร์พิกเซล', motif: 'heartpx', scene: 'city',
    pal: { a: '#b2ffb2', b: '#22c55e', c: '#052e16', d: '#ff4d6d' }, sky: ['#9be7ff', '#effbff', '#04120f', '#0a3b2a'], tier: 1,
    names: { outfit_a: 'เสื้อฮู้ดเกมเมอร์ลายพิกเซล', outfit_b: 'เกราะ 8 บิต', headwear_a: 'มงกุฎพิกเซลราชา', headwear_b: 'หมวกหูฟังเกมมิ่ง', eyewear: 'แว่น VR พิกเซล', accessory_a: 'ปีกพิกเซลเขียว', accessory_b: 'หัวใจพิกเซลลอยข้างไหล่', effect: 'พิกเซลและเหรียญเกมลอย', backdrop: 'ฉากเกมย้อนยุค 8 บิต', grave: 'หลุมศพ GAME OVER' },
  },
  {
    id: 'thai', emoji: '🪷', nameTh: 'ไทยประยุกต์', motif: 'lotus', scene: 'hills',
    pal: { a: '#fff1c1', b: '#c9302c', c: '#4b0f0a', d: '#f6c945' }, sky: ['#ffcf8f', '#fff4de', '#1b0a14', '#5a1d1d'], tier: 1.25,
    names: { outfit_a: 'ชุดไทยสไบทองลายกนก', outfit_b: 'เสื้อราชปะแตนปักทอง', headwear_a: 'มงกุฎชฎายอดแหลม', headwear_b: 'หมวกกะลาสีทองลายไทย', eyewear: 'หน้ากากโขนทอง', accessory_a: 'ปีกกินรีทอง', accessory_b: 'ดอกบัวลอยข้างไหล่', effect: 'กลีบบัวและประกายทองลอย', backdrop: 'วัดทองยามพระอาทิตย์ตก', grave: 'เจดีย์ทองอนุสรณ์' },
  },
  {
    id: 'xms', emoji: '🎄', nameTh: 'คริสต์มาส', motif: 'tree', scene: 'hills',
    pal: { a: '#ffe4e4', b: '#d62839', c: '#14532d', d: '#f6c945' }, sky: ['#bde5ff', '#f3faff', '#06142b', '#1d3f7a'], tier: 1,
    names: { outfit_a: 'ชุดซานตาครอส', outfit_b: 'สเวตเตอร์ลายคริสต์มาส', headwear_a: 'มงกุฎต้นสน', headwear_b: 'หมวกกวางเรนเดียร์', eyewear: 'แว่นกรอบลูกบอลคริสต์มาส', accessory_a: 'ปีกเกล็ดหิมะ', accessory_b: 'ต้นคริสต์มาสลอยข้างไหล่', effect: 'หิมะและดาวคริสต์มาสโปรย', backdrop: 'หมู่บ้านหิมะคืนคริสต์มาส', grave: 'อนุสรณ์ต้นสนหิมะ' },
  },
  {
    id: 'wiz', emoji: '🔮', nameTh: 'พ่อมดเวทมนตร์', motif: 'starmoon', scene: 'hills',
    pal: { a: '#e9d5ff', b: '#7c3aed', c: '#1e0a3c', d: '#fcd34d' }, sky: ['#c4b5fd', '#f5f0ff', '#0b0620', '#3a1a7a'], tier: 1.2,
    names: { outfit_a: 'ชุดคลุมจอมเวทดาวจันทร์', outfit_b: 'เกราะนักเวทมนตร์', headwear_a: 'มงกุฎจันทร์เสี้ยว', headwear_b: 'หมวกจอมเวทปลายโค้ง', eyewear: 'หน้ากากมนตราลึกลับ', accessory_a: 'ปีกแสงเวทมนตร์', accessory_b: 'ลูกแก้วดาวจันทร์ลอย', effect: 'ประกายเวทและดวงจันทร์วน', backdrop: 'หอคอยพ่อมดใต้ดวงดาว', grave: 'อนุสรณ์ผลึกเวท' },
  },
  {
    id: 'hero', emoji: '⚡', nameTh: 'ซุปเปอร์ฮีโร่', motif: 'bolt', scene: 'city',
    pal: { a: '#bfdbfe', b: '#2563eb', c: '#7f1d1d', d: '#facc15' }, sky: ['#8ecbff', '#e9f5ff', '#05122b', '#1d3b8a'], tier: 1.1,
    names: { outfit_a: 'ชุดฮีโร่สายฟ้า', outfit_b: 'เกราะฮีโร่พิทักษ์เมือง', headwear_a: 'มงกุฎผู้พิทักษ์', headwear_b: 'หมวกคลุมหน้าฮีโร่', eyewear: 'หน้ากากฮีโร่', accessory_a: 'ผ้าคลุมฮีโร่ปีกใหญ่', accessory_b: 'สายฟ้าลอยข้างไหล่', effect: 'สายฟ้าและดาววิ่งวน', backdrop: 'เมืองใหญ่ยามพิทักษ์', grave: 'อนุสาวรีย์วีรบุรุษ' },
  },
  {
    id: 'cow', emoji: '🤠', nameTh: 'คาวบอยตะวันตก', motif: 'sheriff', scene: 'desert',
    pal: { a: '#fed7aa', b: '#b45309', c: '#3b1d06', d: '#e5e7eb' }, sky: ['#ffcf8a', '#fff0d2', '#1c0f06', '#6b3a14'], tier: 1,
    names: { outfit_a: 'เสื้อนายอำเภอ', outfit_b: 'แจ็คเก็ตหนังชายขอบ', headwear_a: 'มงกุฎนายอำเภอทอง', headwear_b: 'หมวกคาวบอยปักดาว', eyewear: 'ผ้าพันหน้าโจรทะเลทราย', accessory_a: 'ผ้าคลุมปอนโชปีก', accessory_b: 'ดาวนายอำเภอลอยข้างไหล่', effect: 'ฝุ่นทะเลทรายและดาวบินวน', backdrop: 'เมืองตะวันตกใต้พระอาทิตย์', grave: 'ไม้กางเขนทะเลทราย' },
  },
];
export const COLLECTION_BY_ID: Record<string, Collection> = Object.fromEntries(COLLECTIONS.map((c) => [c.id, c]));

export type ColPart = keyof Collection['names'];
export const COL_PARTS: { part: ColPart; slot: AvatarSlot; base: number; animated: boolean }[] = [
  { part: 'outfit_a', slot: 'outfit', base: 130, animated: true },
  { part: 'outfit_b', slot: 'outfit', base: 170, animated: true },
  { part: 'headwear_a', slot: 'headwear', base: 120, animated: true },
  { part: 'headwear_b', slot: 'headwear', base: 100, animated: false },
  { part: 'eyewear', slot: 'eyewear', base: 110, animated: false },
  { part: 'accessory_a', slot: 'accessory', base: 190, animated: true },
  { part: 'accessory_b', slot: 'accessory', base: 150, animated: true },
  { part: 'effect', slot: 'effect', base: 230, animated: true },
  { part: 'backdrop', slot: 'backdrop', base: 200, animated: true },
  { part: 'grave', slot: 'grave', base: 180, animated: true },
];

export const colItemId = (col: string, part: ColPart): string => `col_${col}_${part}`;

export function buildCollectionItems(): AvatarItem[] {
  const out: AvatarItem[] = [];
  for (const c of COLLECTIONS) {
    for (const p of COL_PARTS) {
      out.push({
        id: colItemId(c.id, p.part), slot: p.slot, nameTh: `${c.emoji} ${c.nameTh} · ${c.names[p.part]}`,
        price: Math.round((p.base * c.tier) / 10) * 10, ...(p.animated ? { animated: true } : {}),
      });
    }
  }
  return out;
}
