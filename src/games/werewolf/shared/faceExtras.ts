// shared/faceExtras.ts — ทรงผม/ดวงตา/ปาก ชุดเพิ่มเติม (วาดใน components/avatar/layersFace.tsx — id รูปแบบ hair2_* eyes2_* mouth2_*)
import type { AvatarItem, AvatarSlot } from './avatar';

type Row = [id: string, nameTh: string, price: number, animated?: boolean];

const HAIR: Row[] = [
  ['bowl', 'ผมทรงกะลา', 30], ['pixie', 'ผมพิกซี่เปรี้ยว', 40], ['highpony', 'หางม้าสูงแกว่งไกว', 60, true], ['sidebraid', 'ผมเปียข้างไหล่', 60],
  ['bunbig', 'ผมมวยสูงก้อนโต', 50], ['cornrows', 'ผมถักคอร์นโรว์', 80], ['fauxhawk', 'ผมสันเฟาว์ฮอว์ก', 70], ['sideshave', 'ผมโกนข้าง', 70],
  ['spikelong', 'ผมตั้งยาวซูเปอร์', 100], ['ahoge', 'ผมกระดกขยับได้', 90, true], ['curtain', 'ผมม่านม้าแสกกลาง', 50], ['bunny', 'ผมหูกระต่ายแกว่ง', 140, true],
  ['catear', 'ผมหูแมว', 110], ['heart', 'ผมหัวใจเต้น', 130, true], ['ptlong', 'ผมแกละยาวเหยียด', 80], ['ringlets', 'ผมลอนขดยาว', 90],
  ['mushroom', 'ผมทรงเห็ด', 40], ['slick', 'ผมเสยหลังเงา', 60], ['sidebun', 'ผมมวยข้าง', 50], ['emo', 'ผมปรกตาด้านข้าง', 60],
  ['swirl', 'ผมซอฟต์ครีมหมุนวน', 160], ['cotton', 'ผมสายไหมฟู', 120], ['flower', 'ผมกลีบดอกไม้', 150], ['antenna', 'ผมหนวดเอเลี่ยนไฟกะพริบ', 170, true],
  ['lightning', 'ผมสายฟ้าแลบ', 220, true], ['crownbraid', 'ผมเปียคาดหัว', 100], ['balding', 'ผมโล้นกลางหัว', 20], ['waves', 'ผมหยักศกหน้าม้า', 60],
  ['twintail', 'ผมทวินเทลสูงแกว่ง', 100, true], ['unicorn', 'ผมยูนิคอร์นเขาทอง', 250], ['horns', 'ผมเขาปีศาจ', 90],
];

const EYES: Row[] = [
  ['lashes', 'ตาขนตางอน', 40], ['dot', 'ตาจุดเล็ก', 20], ['oval', 'ตารีวาว', 30], ['wide', 'ตาเบิกโพลง', 40], ['sus', 'ตาหรี่ไม่เชื่อ', 50],
  ['side', 'ตาเหล่มองข้าง', 30], ['up', 'ตามองบน', 30], ['down', 'ตามองต่ำ', 30], ['spiral', 'ตาก้นหอยหมุน', 90, true], ['flame', 'ตาเปลวไฟ', 180, true],
  ['ice', 'ตาคริสตัลน้ำแข็ง', 150], ['galaxy', 'ตากาแล็กซี', 220, true], ['rainbow', 'ตาสายรุ้ง', 160], ['snake', 'ตางูเหลือบ', 100],
  ['robot', 'ตาหุ่นยนต์สแกน', 200, true], ['pixel', 'ตาพิกเซล', 70], ['heartbeat', 'ตาหัวใจเต้น', 140, true], ['starspin', 'ตาดาวหมุน', 130, true],
  ['uwu', 'ตาแง้ว ><', 50], ['dash', 'ตาขีด = =', 30], ['kawaii', 'ตาคาวาอี้ชมพู', 120], ['tears', 'ตาน้ำตาพราก', 110, true],
  ['sharingan', 'ตาชาริงกัน', 260, true], ['moon', 'ตาจันทร์เสี้ยว', 130], ['hetero', 'ตาสองสี', 80], ['blind', 'ตาขาวล้วน', 50],
  ['hollow', 'ตาโบ๋แดงเรือง', 170, true], ['cyclops', 'ตาเดียวไซคลอปส์', 120], ['third', 'ตาที่สามกลางหน้าผาก', 190, true], ['bug', 'ตาแมลง', 110],
  ['blush', 'ตายิ้มแก้มแดง', 50], ['glint', 'ตาประกายดาว', 150, true], ['coin', 'ตาเหรียญทองหมุน', 240, true],
];

const MOUTH: Row[] = [
  ['tiny', 'ปากจิ๋ม', 20], ['wavy', 'ปากหยักคลื่น', 30], ['zigzag', 'ปากซิกแซก', 30], ['lipstick', 'ลิปสติกแดงสด', 70], ['pout', 'ปากจู๋', 40],
  ['yawn', 'หาวหวอด', 50], ['laugh', 'หัวเราะลั่น', 100, true], ['dimple', 'ยิ้มลักยิ้ม', 40], ['teeth', 'ยิ้มกัดฟัน', 40], ['bucktooth', 'ฟันกระต่าย', 50],
  ['beak', 'ปากเป็ด', 80], ['lollipop', 'อมอมยิ้ม', 90], ['whistle', 'ผิวปากเป็นเพลง', 110, true], ['bubblegum', 'เป่าลูกโป่งหมากฝรั่ง', 130, true],
  ['stitch', 'ปากเย็บด้าย', 60], ['zip', 'ปากรูดซิป', 90], ['shark', 'ฟันฉลาม', 120], ['rainbow', 'ยิ้มสายรุ้ง', 140], ['fire', 'พ่นไฟ', 230, true],
  ['ice', 'ลมหายใจเย็นเยียบ', 190, true], ['blood', 'เลือดไหลมุมปาก', 150, true], ['cheshire', 'ยิ้มแมวเชสเชียร์', 100], ['ghost', 'ปากผีลอยน้อย', 60],
  ['robot', 'ปากตะแกรงหุ่นยนต์', 110], ['pixel', 'ยิ้มพิกเซล', 70], ['scream', 'กรี๊ดสุดเสียง', 60], ['overbite', 'เขี้ยวเล็กน่ารัก', 80],
];

const make = (slot: AvatarSlot, prefix: string, rows: Row[]): AvatarItem[] =>
  rows.map(([id, nameTh, price, animated]) => ({ id: `${prefix}_${id}`, slot, nameTh, price, ...(animated ? { animated: true } : {}) }));

export function buildFaceItems(): AvatarItem[] {
  return [...make('hairStyle', 'hair2', HAIR), ...make('eyes', 'eyes2', EYES), ...make('mouth', 'mouth2', MOUTH)];
}
