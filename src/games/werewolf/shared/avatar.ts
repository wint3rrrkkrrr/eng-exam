// shared/avatar.ts — แคตตาล็อกของแต่งตัวอวตาร + ราคา + กติกาเหรียญ (ข้อมูลล้วน ใช้ร่วมกันทั้งเบราว์เซอร์และเซิร์ฟเวอร์)
// ★ ราคา/สิทธิ์การเป็นเจ้าของตัดสินที่เซิร์ฟเวอร์เสมอ — ไฟล์นี้บอกแค่ "มีอะไรขายบ้าง ราคาเท่าไร"

import { buildCollectionItems, colItemIds } from './collections';
import { buildFaceItems } from './faceExtras';
import { buildPatternOutfits, buildRapItems, buildSpecialItems, buildVariantItems } from './avatarExtra';

export type AvatarSlot =
  | 'skin' | 'hairStyle' | 'hairColor' | 'eyes' | 'mouth' | 'facialHair'
  | 'eyewear' | 'headwear' | 'outfit' | 'accessory' | 'effect' | 'backdrop' | 'grave';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AvatarItem {
  id: string;
  slot: AvatarSlot;
  nameTh: string;
  price: number; // 0 = ฟรี (มีให้ทุกคนตั้งแต่เริ่ม)
  animated?: boolean; // มีการขยับ (แสดงป้าย ✨ ในร้าน)
  /** ของเซ็ตพิเศษ: ได้จากโค้ดเท่านั้น (ไม่ขาย ไม่ออกกาชา) — ค่าคือรหัสเซ็ต */
  exclusive?: string;
  rarity?: Rarity; // กำหนดระดับตรงๆ (ของเซ็ตพิเศษ) · ไม่ระบุ = คำนวณจากราคา
}

export type AvatarConfig = Record<AvatarSlot, string>;

export const SLOTS: { slot: AvatarSlot; labelTh: string; icon: string }[] = [
  { slot: 'effect', labelTh: 'เอฟเฟกต์', icon: '✨' },
  { slot: 'headwear', labelTh: 'หมวก', icon: '🎩' },
  { slot: 'hairStyle', labelTh: 'ทรงผม', icon: '💇' },
  { slot: 'hairColor', labelTh: 'สีผม', icon: '🎨' },
  { slot: 'eyes', labelTh: 'ดวงตา', icon: '👀' },
  { slot: 'mouth', labelTh: 'ปาก', icon: '👄' },
  { slot: 'eyewear', labelTh: 'แว่น/หน้ากาก', icon: '🕶️' },
  { slot: 'facialHair', labelTh: 'หนวดเครา', icon: '🧔' },
  { slot: 'outfit', labelTh: 'เสื้อผ้า', icon: '👕' },
  { slot: 'accessory', labelTh: 'ของประดับ', icon: '🎀' },
  { slot: 'backdrop', labelTh: 'ฉากหลัง ☀️🌙', icon: '🌄' },
  { slot: 'grave', labelTh: 'หลุมศพตอนตาย', icon: '🪦' },
  { slot: 'skin', labelTh: 'สีผิว', icon: '🧑' },
];

const it = (slot: AvatarSlot, id: string, nameTh: string, price: number, animated = false): AvatarItem => (
  animated ? { id, slot, nameTh, price, animated } : { id, slot, nameTh, price }
);

const BASE_ITEMS: AvatarItem[] = [
  // ================================================================ สีผิว
  it('skin', 'skin_light', 'ผิวขาว', 0), it('skin', 'skin_fair', 'ผิวสว่าง', 0), it('skin', 'skin_tan', 'ผิวแทน', 0),
  it('skin', 'skin_brown', 'ผิวน้ำตาล', 0), it('skin', 'skin_dark', 'ผิวเข้ม', 0), it('skin', 'skin_deep', 'ผิวเข้มมาก', 0),
  it('skin', 'skin_pink', 'ผิวชมพู', 60), it('skin', 'skin_ghost', 'ผิวซีดผี', 100), it('skin', 'skin_zombie', 'ผิวซอมบี้', 150),
  it('skin', 'skin_blue', 'ผิวฟ้า', 150), it('skin', 'skin_purple', 'ผิวม่วงเอเลี่ยน', 180), it('skin', 'skin_gold', 'ผิวทองคำ', 400),

  // ================================================================ ทรงผม
  it('hairStyle', 'hair_short', 'ผมสั้น', 0), it('hairStyle', 'hair_bob', 'ผมบ็อบ', 0), it('hairStyle', 'hair_bald', 'หัวโล้น', 0),
  it('hairStyle', 'hair_buzz', 'ผมเกรียน', 20), it('hairStyle', 'hair_sidepart', 'ผมเสยข้าง', 30), it('hairStyle', 'hair_bangs', 'ผมหน้าม้า', 30),
  it('hairStyle', 'hair_bun', 'ผมมวย', 40), it('hairStyle', 'hair_spiky', 'ผมตั้ง', 40), it('hairStyle', 'hair_undercut', 'ผมอันเดอร์คัท', 50),
  it('hairStyle', 'hair_long', 'ผมยาว', 50), it('hairStyle', 'hair_ponytail', 'ผมหางม้า', 50), it('hairStyle', 'hair_shaggy', 'ผมยุ่งเท่ๆ', 50),
  it('hairStyle', 'hair_topknot', 'จุกซามูไร', 60), it('hairStyle', 'hair_curly', 'ผมหยิก', 60), it('hairStyle', 'hair_pigtails', 'ผมแกละ', 60),
  it('hairStyle', 'hair_twinbuns', 'ผมมวยคู่', 60), it('hairStyle', 'hair_braid', 'ผมเปียยาว', 70), it('hairStyle', 'hair_wavy', 'ผมลอนยาว', 70),
  it('hairStyle', 'hair_mullet', 'ผมมัลเล็ต', 70), it('hairStyle', 'hair_halfup', 'ผมครึ่งหัว', 70), it('hairStyle', 'hair_mohawk', 'ผมโมฮอว์ก', 80),
  it('hairStyle', 'hair_afro', 'ผมอาโฟร', 80), it('hairStyle', 'hair_pompadour', 'ผมทรงป๊อมปาดัวร์', 90), it('hairStyle', 'hair_dreads', 'ผมเดรดล็อก', 120),
  it('hairStyle', 'hair_cloud', 'ผมฟูเมฆ', 120), it('hairStyle', 'hair_flame', 'ผมไฟลุก', 400, true),

  // ================================================================ สีผม
  it('hairColor', 'hc_black', 'ดำ', 0), it('hairColor', 'hc_brown', 'น้ำตาล', 0), it('hairColor', 'hc_blonde', 'บลอนด์', 30),
  it('hairColor', 'hc_red', 'แดงส้ม', 30), it('hairColor', 'hc_gray', 'เทา', 30), it('hairColor', 'hc_maroon', 'แดงเลือดหมู', 30),
  it('hairColor', 'hc_cream', 'ครีม', 30), it('hairColor', 'hc_navy', 'น้ำเงินเข้ม', 40), it('hairColor', 'hc_orange', 'ส้มสด', 50),
  it('hairColor', 'hc_white', 'ขาวเงิน', 60), it('hairColor', 'hc_blue', 'ฟ้าสด', 120), it('hairColor', 'hc_pink', 'ชมพู', 120),
  it('hairColor', 'hc_green', 'เขียว', 120), it('hairColor', 'hc_purple', 'ม่วง', 120), it('hairColor', 'hc_teal', 'เขียวมิ้นต์', 120),
  it('hairColor', 'hc_lime', 'เขียวมะนาว', 120), it('hairColor', 'hc_cyan', 'ฟ้านีออน', 120), it('hairColor', 'hc_silver', 'เงินเมทัลลิก', 220),
  it('hairColor', 'hc_gold', 'ทองเมทัลลิก', 260), it('hairColor', 'hc_rainbow', 'สายรุ้ง', 400),
  it('hairColor', 'hc_fire', 'ไฟลุกไหล', 450, true), it('hairColor', 'hc_galaxy', 'กาแล็กซี', 500, true),

  // ================================================================ ดวงตา
  it('eyes', 'eyes_round', 'ตากลม', 0), it('eyes', 'eyes_happy', 'ตายิ้ม', 30), it('eyes', 'eyes_sleepy', 'ตาง่วง', 30),
  it('eyes', 'eyes_closed', 'หลับตา', 30), it('eyes', 'eyes_angry', 'ตาดุ', 40), it('eyes', 'eyes_big', 'ตาโตอนิเมะ', 50),
  it('eyes', 'eyes_wink', 'ขยิบตา', 50), it('eyes', 'eyes_tired', 'ตาอดนอน', 50), it('eyes', 'eyes_cry', 'ตาร้องไห้', 60),
  it('eyes', 'eyes_x', 'ตากากบาท', 60), it('eyes', 'eyes_cat', 'ตาแมว', 70), it('eyes', 'eyes_dizzy', 'ตาหมุน', 80, true),
  it('eyes', 'eyes_dollar', 'ตาเงิน', 90), it('eyes', 'eyes_star', 'ตาดาว', 100), it('eyes', 'eyes_sparkle', 'ตาแวววาว', 110, true),
  it('eyes', 'eyes_heart', 'ตาหัวใจ', 120), it('eyes', 'eyes_glow', 'ตาแดงเรืองแสง', 200, true), it('eyes', 'eyes_laser', 'ตายิงเลเซอร์', 300, true),

  // ================================================================ ปาก
  it('mouth', 'mouth_smile', 'ยิ้ม', 0), it('mouth', 'mouth_flat', 'หน้านิ่ง', 0), it('mouth', 'mouth_open', 'อ้าปาก', 20),
  it('mouth', 'mouth_o', 'ปากกลม', 20), it('mouth', 'mouth_sad', 'หน้าเศร้า', 20), it('mouth', 'mouth_grin', 'ยิ้มกว้าง', 30),
  it('mouth', 'mouth_cat', 'ปากแมว', 30), it('mouth', 'mouth_smirk', 'ยิ้มมุมปาก', 40), it('mouth', 'mouth_surprised', 'ตกใจ', 40),
  it('mouth', 'mouth_kiss', 'จุ๊บ', 50), it('mouth', 'mouth_braces', 'ยิ้มจัดฟัน', 50), it('mouth', 'mouth_tongue', 'แลบลิ้น', 60),
  it('mouth', 'mouth_drool', 'น้ำลายไหล', 60), it('mouth', 'mouth_mask', 'หน้ากากอนามัย', 70), it('mouth', 'mouth_fang', 'เขี้ยวแวมไพร์', 100),
  it('mouth', 'mouth_bloodfang', 'เขี้ยวเปื้อนเลือด', 130), it('mouth', 'mouth_gold', 'ฟันทอง', 150),

  // ================================================================ หนวดเครา
  it('facialHair', 'fh_none', 'ไม่มี', 0), it('facialHair', 'fh_stubble', 'หนวดเครารุงรัง', 40), it('facialHair', 'fh_sideburns', 'จอนยาว', 40),
  it('facialHair', 'fh_pencil', 'หนวดเส้นบาง', 40), it('facialHair', 'fh_mustache', 'หนวดงอน', 50), it('facialHair', 'fh_soulpatch', 'เคราใต้ปาก', 50),
  it('facialHair', 'fh_chinstrap', 'เคราคาดคาง', 60), it('facialHair', 'fh_goatee', 'เคราแพะ', 60), it('facialHair', 'fh_mutton', 'จอนหนา', 70),
  it('facialHair', 'fh_walrus', 'หนวดวอลรัส', 80), it('facialHair', 'fh_beard', 'เคราเต็มหน้า', 80), it('facialHair', 'fh_handlebar', 'หนวดม้วนยักษ์', 100),
  it('facialHair', 'fh_braided', 'เคราถักเปีย', 140), it('facialHair', 'fh_wizard', 'เคราพ่อมดขาว', 180), it('facialHair', 'fh_santa', 'เคราซานตา', 200),

  // ================================================================ แว่น/หน้ากาก
  it('eyewear', 'ew_none', 'ไม่มี', 0), it('eyewear', 'ew_round', 'แว่นกลม', 40), it('eyewear', 'ew_square', 'แว่นเหลี่ยม', 40),
  it('eyewear', 'ew_tape', 'แว่นติดเทป', 50), it('eyewear', 'ew_sunglasses', 'แว่นกันแดด', 60), it('eyewear', 'ew_aviator', 'แว่นนักบิน', 70),
  it('eyewear', 'ew_lennon', 'แว่นเลนส์สี', 70), it('eyewear', 'ew_cateye', 'แว่นหางตา', 80), it('eyewear', 'ew_eyepatch', 'ผ้าปิดตา', 90),
  it('eyewear', 'ew_3d', 'แว่น 3 มิติ', 90), it('eyewear', 'ew_heart', 'แว่นหัวใจ', 100), it('eyewear', 'ew_partystar', 'แว่นดาวปาร์ตี้', 100),
  it('eyewear', 'ew_monocle', 'แว่นเลนส์เดียว', 120), it('eyewear', 'ew_venice', 'หน้ากากเวนิส', 130), it('eyewear', 'ew_bandit', 'หน้ากากโจร', 140),
  it('eyewear', 'ew_goggles', 'แว่นดำน้ำ', 150), it('eyewear', 'ew_ski', 'แว่นสกี', 150), it('eyewear', 'ew_pixel', 'แว่นพิกเซล (Deal with it)', 180),
  it('eyewear', 'ew_scouter', 'เครื่องวัดพลัง', 200), it('eyewear', 'ew_visor', 'แว่นอนาคต', 200, true),

  // ================================================================ หมวก
  it('headwear', 'hw_none', 'ไม่มี', 0), it('headwear', 'hw_cap', 'หมวกแก๊ป', 40), it('headwear', 'hw_bandana', 'ผ้าโพกหัว', 40),
  it('headwear', 'hw_sweatband', 'ผ้าคาดหัว', 30), it('headwear', 'hw_bucket', 'หมวกบักเก็ต', 50), it('headwear', 'hw_beanie', 'หมวกไหมพรม', 50),
  it('headwear', 'hw_newsboy', 'หมวกเบเร่ต์ช่างภาพ', 60), it('headwear', 'hw_hardhat', 'หมวกช่าง', 60), it('headwear', 'hw_partyhat', 'หมวกปาร์ตี้', 60),
  it('headwear', 'hw_pompom', 'หมวกไหมพรมปอมปอม', 60), it('headwear', 'hw_straw', 'หมวกฟางชาวนา', 70), it('headwear', 'hw_flower', 'ดอกไม้ติดผม', 80),
  it('headwear', 'hw_fedora', 'หมวกเฟดอร่า', 90), it('headwear', 'hw_sailor', 'หมวกกะลาสี', 90), it('headwear', 'hw_nurse', 'หมวกพยาบาล', 90),
  it('headwear', 'hw_police', 'หมวกตำรวจ', 100), it('headwear', 'hw_chef', 'หมวกเชฟ', 100), it('headwear', 'hw_headphones', 'หูฟังเกมมิ่ง', 100),
  it('headwear', 'hw_graduation', 'หมวกรับปริญญา', 110), it('headwear', 'hw_cowboy', 'หมวกคาวบอย', 120), it('headwear', 'hw_catears', 'หูแมว', 120),
  it('headwear', 'hw_bunny', 'หูกระต่าย', 120), it('headwear', 'hw_turban', 'ผ้าโพกหัวทรงสูง', 120), it('headwear', 'hw_army', 'หมวกเหล็กทหาร', 120),
  it('headwear', 'hw_santa', 'หมวกซานตา', 120), it('headwear', 'hw_laurel', 'พวงหรีดใบไม้', 130), it('headwear', 'hw_sombrero', 'หมวกซอมเบรโร', 130),
  it('headwear', 'hw_ninja', 'ผ้าคาดหัวนินจา', 130), it('headwear', 'hw_explorer', 'หมวกนักสำรวจ', 140), it('headwear', 'hw_bearhood', 'หมวกหมี', 140),
  it('headwear', 'hw_tophat', 'หมวกทรงสูง', 150), it('headwear', 'hw_helmet', 'หมวกเกราะอัศวิน', 150), it('headwear', 'hw_antlers', 'เขากวาง', 150),
  it('headwear', 'hw_mushroom', 'หมวกเห็ด', 150), it('headwear', 'hw_jester', 'หมวกตัวตลกในวัง', 160), it('headwear', 'hw_wolfears', 'หูหมาป่า', 160),
  it('headwear', 'hw_flowercrown', 'มงกุฎดอกไม้', 160), it('headwear', 'hw_dino', 'หมวกไดโนเสาร์', 170), it('headwear', 'hw_viking', 'หมวกไวกิ้ง', 180),
  it('headwear', 'hw_pumpkin', 'หัวฟักทองฮาโลวีน', 180), it('headwear', 'hw_wizard', 'หมวกพ่อมดดาว', 200), it('headwear', 'hw_witch', 'หมวกแม่มด', 200),
  it('headwear', 'hw_unicorn', 'เขายูนิคอร์น', 220), it('headwear', 'hw_pirate', 'หมวกโจรสลัด', 220), it('headwear', 'hw_horns', 'เขาปีศาจ', 250),
  it('headwear', 'hw_halo', 'ห่วงนางฟ้า', 300, true), it('headwear', 'hw_crown', 'มงกุฎทอง', 500),

  // ================================================================ เสื้อผ้า
  it('outfit', 'of_tee_orange', 'เสื้อยืดส้ม', 0), it('outfit', 'of_tee_blue', 'เสื้อยืดฟ้า', 0), it('outfit', 'of_tee_red', 'เสื้อยืดแดง', 20),
  it('outfit', 'of_tee_green', 'เสื้อยืดเขียว', 20), it('outfit', 'of_tee_pink', 'เสื้อยืดชมพู', 20), it('outfit', 'of_tee_purple', 'เสื้อยืดม่วง', 20),
  it('outfit', 'of_tee_black', 'เสื้อยืดดำ', 20), it('outfit', 'of_tee_white', 'เสื้อยืดขาว', 20), it('outfit', 'of_tank', 'เสื้อกล้าม', 40),
  it('outfit', 'of_hoodie', 'เสื้อฮู้ด', 50), it('outfit', 'of_polo', 'เสื้อโปโล', 50), it('outfit', 'of_workvest', 'เสื้อช่างสีเหลือง', 60),
  it('outfit', 'of_pajama', 'ชุดนอนลายดาว', 60), it('outfit', 'of_schoolthai', 'ชุดนักเรียน', 60), it('outfit', 'of_sweater', 'สเวตเตอร์ลายข้าวหลามตัด', 70),
  it('outfit', 'of_overalls', 'ชุดเอี๊ยม', 70), it('outfit', 'of_jersey', 'เสื้อทีมกีฬา', 70), it('outfit', 'of_denim', 'แจ็คเก็ตยีนส์', 80),
  it('outfit', 'of_hawaii', 'เสื้อฮาวาย', 80), it('outfit', 'of_sailor', 'ชุดกะลาสี', 80), it('outfit', 'of_wolftee', 'เสื้อยืดลายหมาป่า', 90),
  it('outfit', 'of_labcoat', 'เสื้อกาวน์', 90), it('outfit', 'of_scrubs', 'ชุดผ่าตัดเขียว', 90), it('outfit', 'of_chefcoat', 'ชุดเชฟ', 90),
  it('outfit', 'of_trackjacket', 'แจ็คเก็ตวอร์ม', 100), it('outfit', 'of_leather', 'แจ็คเก็ตหนังสีดำ', 110), it('outfit', 'of_police', 'เครื่องแบบตำรวจ', 110),
  it('outfit', 'of_suit', 'สูทสีน้ำเงิน', 120), it('outfit', 'of_ninja', 'ชุดนินจา', 120), it('outfit', 'of_kimono', 'กิโมโน', 130),
  it('outfit', 'of_sabai', 'ชุดไทยสไบ', 140), it('outfit', 'of_cloak', 'ผ้าคลุมม่วง', 140), it('outfit', 'of_wizardrobe', 'ชุดคลุมพ่อมด', 150),
  it('outfit', 'of_tuxedo', 'ทักซิโด้', 160), it('outfit', 'of_hero', 'ชุดซุปเปอร์ฮีโร่', 180), it('outfit', 'of_astronaut', 'ชุดนักบินอวกาศ', 200),
  it('outfit', 'of_samurai', 'เกราะซามูไร', 220), it('outfit', 'of_armor', 'เกราะเหล็ก', 220), it('outfit', 'of_kingrobe', 'ชุดคลุมกษัตริย์', 300),
  it('outfit', 'of_neon', 'ชุดนีออนวิ่งไฟ', 350, true), it('outfit', 'of_gold', 'สูทสีทอง', 450),

  // ================================================================ ของประดับ
  it('accessory', 'ac_none', 'ไม่มี', 0), it('accessory', 'ac_bowtie', 'โบว์ผูกคอ', 40), it('accessory', 'ac_necktie', 'เนคไท', 40),
  it('accessory', 'ac_scarf', 'ผ้าพันคอแดง', 50), it('accessory', 'ac_earrings', 'ต่างหู', 50), it('accessory', 'ac_headset', 'หูฟังคล้องคอ', 50),
  it('accessory', 'ac_lollipop', 'อมยิ้ม', 60), it('accessory', 'ac_gum', 'ลูกโป่งหมากฝรั่ง', 60, true), it('accessory', 'ac_necklace', 'สร้อยคอ', 70),
  it('accessory', 'ac_medal', 'เหรียญรางวัล', 80), it('accessory', 'ac_lei', 'พวงมาลัยดอกไม้', 80), it('accessory', 'ac_rose', 'กุหลาบคาบปาก', 90),
  it('accessory', 'ac_pipe', 'ไปป์', 100), it('accessory', 'ac_balloon', 'ลูกโป่งลอย', 100, true), it('accessory', 'ac_butterflies', 'ผีเสื้อรอบตัว', 120, true),
  it('accessory', 'ac_cape', 'ผ้าคลุมไหล่ฮีโร่', 130), it('accessory', 'ac_katana', 'ดาบซามูไรสะพายหลัง', 140), it('accessory', 'ac_guitar', 'กีตาร์สะพายหลัง', 150),
  it('accessory', 'ac_sparkles', 'ประกายระยิบ', 150, true), it('accessory', 'ac_surfboard', 'กระดานโต้คลื่น', 160), it('accessory', 'ac_catpet', 'แมวนั่งบนหัว', 180),
  it('accessory', 'ac_dogpet', 'หมาน้อยบนไหล่', 180), it('accessory', 'ac_parrot', 'นกแก้วบนไหล่', 220), it('accessory', 'ac_wings_angel', 'ปีกนางฟ้า', 280),
  it('accessory', 'ac_wings_demon', 'ปีกปีศาจ', 280),

  // ================================================================ เอฟเฟกต์รอบตัว (ขยับได้ทั้งหมด)
  it('effect', 'fx_none', 'ไม่มี', 0),
  it('effect', 'fx_sparkle', 'ประกายดาวกะพริบ', 80, true), it('effect', 'fx_bubbles', 'ฟองสบู่ลอย', 90, true), it('effect', 'fx_rain', 'ฝนโปรยปราย', 90, true),
  it('effect', 'fx_hearts', 'หัวใจลอยขึ้น', 100, true), it('effect', 'fx_snow', 'หิมะโปรย', 100, true), it('effect', 'fx_notes', 'โน้ตดนตรีลอย', 110, true),
  it('effect', 'fx_petals', 'กลีบซากุระปลิว', 120, true), it('effect', 'fx_fireflies', 'หิ่งห้อยบินวน', 130, true), it('effect', 'fx_confetti', 'กระดาษสีปาร์ตี้', 140, true),
  it('effect', 'fx_ghosts', 'วิญญาณวนเวียน', 150, true), it('effect', 'fx_coins', 'เหรียญทองร่วง', 160, true), it('effect', 'fx_matrix', 'รหัสเขียวไหลลง', 180, true),
  it('effect', 'fx_fire', 'เปลวไฟลุกท่วม', 200, true), it('effect', 'fx_lightning', 'สายฟ้าฟาด', 220, true), it('effect', 'fx_smoke', 'ควันดำมืด', 260, true),
  it('effect', 'fx_orbit', 'ดาวโคจรรอบหัว', 280, true), it('effect', 'fx_aura', 'ออร่าทองส่องประกาย', 300, true), it('effect', 'fx_shimmer', 'แสงรุ้งวิ่งผ่าน', 350, true),

  // ================================================================ ฉากหลัง (ทุกธีมมีเวอร์ชันกลางวัน/กลางคืน สลับตามเฟสเกมอัตโนมัติ)
  it('backdrop', 'bg_meadow', 'ทุ่งหญ้า', 0), it('backdrop', 'bg_village', 'หมู่บ้าน', 80), it('backdrop', 'bg_beach', 'ชายหาดทะเล', 90),
  it('backdrop', 'bg_forest', 'ป่าลึก (กลางคืนมีหิ่งห้อย)', 100, true), it('backdrop', 'bg_desert', 'ทะเลทราย', 100), it('backdrop', 'bg_snow', 'ทุ่งหิมะ', 100, true),
  it('backdrop', 'bg_mountain', 'ภูเขาสูง', 100), it('backdrop', 'bg_city', 'เมืองใหญ่', 120), it('backdrop', 'bg_stage', 'เวทีสปอตไลต์', 120, true),
  it('backdrop', 'bg_castle', 'ปราสาทโบราณ', 130), it('backdrop', 'bg_cherry', 'สวนซากุระ', 140, true), it('backdrop', 'bg_candy', 'แดนขนมหวาน', 140),
  it('backdrop', 'bg_haunted', 'บ้านผีสิง', 150, true), it('backdrop', 'bg_temple', 'วัดโบราณ', 150), it('backdrop', 'bg_volcano', 'ภูเขาไฟ', 160, true),
  it('backdrop', 'bg_underwater', 'ใต้ทะเลลึก', 170, true), it('backdrop', 'bg_space', 'อวกาศ', 200), it('backdrop', 'bg_neon', 'เมืองนีออน', 220, true),
  it('backdrop', 'bg_aurora', 'แสงเหนือ', 250, true), it('backdrop', 'bg_bloodmoon', 'ตะวัน/จันทร์เลือด', 250), it('backdrop', 'bg_rainbow', 'สายรุ้ง', 300),

  // ================================================================ หลุมศพตอนตาย (แสดงบนการ์ดเมื่อผู้เล่นตาย — ไอคอนบทที่เฉลยยังอยู่ที่มุมการ์ด)
  it('grave', 'gr_stone', 'หลุมศพหินเรียบ', 0), it('grave', 'gr_cross', 'ไม้กางเขน', 50), it('grave', 'gr_flowers', 'หลุมศพประดับดอกไม้', 60),
  it('grave', 'gr_heart', 'หลุมศพหัวใจ', 70), it('grave', 'gr_skull', 'หลุมศพกะโหลกยักษ์', 80), it('grave', 'gr_pumpkin', 'ฟักทองฮาโลวีน', 90),
  it('grave', 'gr_paw', 'อนุสรณ์รอยเท้าหมาป่า', 100), it('grave', 'gr_coffin', 'โลงศพตั้ง', 110), it('grave', 'gr_obelisk', 'เสาโอเบลิสก์', 130),
  it('grave', 'gr_ice', 'หลุมศพน้ำแข็ง', 150), it('grave', 'gr_ghost', 'ผีลอยเหนือหลุม', 200, true), it('grave', 'gr_angel', 'รูปปั้นนางฟ้า', 220),
  it('grave', 'gr_gold', 'สุสานทองคำ', 250),
];

const PATTERN_ITEMS = buildPatternOutfits();
const RAP_ITEMS = buildRapItems();
const COL_ITEMS = buildCollectionItems();
const FACE_ITEMS = buildFaceItems();
const SPECIAL_ITEMS = buildSpecialItems();
/** ของทั้งหมด = ของเดิม + เสื้อลาย + เซ็ตพิเศษ + โทนสีของทุกชิ้นที่คูณได้ (หลายพันชิ้น) */
export const AVATAR_ITEMS: AvatarItem[] = [...BASE_ITEMS, ...PATTERN_ITEMS, ...RAP_ITEMS, ...COL_ITEMS, ...FACE_ITEMS, ...SPECIAL_ITEMS, ...buildVariantItems([...BASE_ITEMS, ...PATTERN_ITEMS, ...RAP_ITEMS, ...COL_ITEMS])];

export const ITEM_BY_ID: Record<string, AvatarItem> = Object.fromEntries(AVATAR_ITEMS.map((i) => [i.id, i]));

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: 'skin_light',
  hairStyle: 'hair_short',
  hairColor: 'hc_brown',
  eyes: 'eyes_round',
  mouth: 'mouth_smile',
  facialHair: 'fh_none',
  eyewear: 'ew_none',
  headwear: 'hw_none',
  outfit: 'of_tee_orange',
  accessory: 'ac_none',
  effect: 'fx_none',
  backdrop: 'bg_meadow',
  grave: 'gr_stone',
};

export function itemsOfSlot(slot: AvatarSlot): AvatarItem[] {
  return AVATAR_ITEMS.filter((i) => i.slot === slot);
}

export function itemRarity(item: AvatarItem): Rarity {
  return item.rarity ?? rarityOf(item.price);
}

/** ของที่สุ่มออกจากกาชาได้ = ของที่ขายในร้าน (ราคา > 0) ที่ไม่ใช่เซ็ตพิเศษ */
export function gachaPool(): AvatarItem[] {
  return AVATAR_ITEMS.filter((i) => i.price > 0 && !i.exclusive);
}

export function rarityOf(price: number): Rarity {
  // เกณฑ์ปรับให้ของ ~3,500 ชิ้น กระจายประมาณ ธรรมดา 40% · หายาก 30% · หายากมาก 22% · ในตำนาน 8%
  if (price >= 300) return 'legendary';
  if (price >= 170) return 'epic';
  if (price >= 120) return 'rare';
  return 'common';
}

export const RARITY_TH: Record<Rarity, string> = { common: 'ธรรมดา', rare: 'หายาก', epic: 'หายากมาก', legendary: 'ในตำนาน' };

/** ของที่ทุกคนมีตั้งแต่เริ่ม (ราคา 0) */
export const FREE_ITEM_IDS: string[] = AVATAR_ITEMS.filter((i) => i.price === 0 && !i.exclusive).map((i) => i.id);

/**
 * ทำความสะอาดอวตาร: ช่องที่ไม่รู้จัก/ไม่ได้เป็นเจ้าของ → ใช้ค่าเริ่มต้นของช่องนั้น
 * (เซิร์ฟเวอร์เรียกทุกครั้งก่อนบันทึก — ไม่เชื่อค่าจากเบราว์เซอร์)
 */
export function sanitizeAvatar(input: unknown, owned: Iterable<string>): AvatarConfig {
  const own = new Set<string>([...FREE_ITEM_IDS, ...owned]);
  const src = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const out = { ...DEFAULT_AVATAR };
  for (const slot of Object.keys(DEFAULT_AVATAR) as AvatarSlot[]) {
    const v = src[slot];
    if (typeof v === 'string' && ITEM_BY_ID[v]?.slot === slot && own.has(v)) out[slot] = v;
  }
  return out;
}

/** อ่านอวตารจากข้อความ JSON ที่เก็บในตารางสาธารณะ (ผู้เล่นทุกคนเห็นได้) — ผิดรูปแบบ/ช่องเก่าที่เลิกใช้ → ค่าเริ่มต้น */
export function parseAvatar(raw: string | null | undefined): AvatarConfig {
  if (!raw) return { ...DEFAULT_AVATAR };
  try {
    const o = JSON.parse(raw);
    const out = { ...DEFAULT_AVATAR };
    for (const slot of Object.keys(DEFAULT_AVATAR) as AvatarSlot[]) {
      const v = (o as Record<string, unknown>)?.[slot];
      if (typeof v === 'string' && ITEM_BY_ID[v]?.slot === slot) out[slot] = v;
    }
    return out;
  } catch {
    return { ...DEFAULT_AVATAR };
  }
}

export function serializeAvatar(a: AvatarConfig): string {
  return JSON.stringify(a);
}

/** อวตารสุ่มจากของฟรี (บอท/ผู้เล่นที่ยังไม่มีกระเป๋า) — เลือกตามเมล็ด ได้ผลเดิมทุกครั้ง */
export function randomFreeAvatar(seed: string): AvatarConfig {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  const next = () => { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h / 4294967296; };
  const out = { ...DEFAULT_AVATAR };
  for (const slot of Object.keys(DEFAULT_AVATAR) as AvatarSlot[]) {
    const free = itemsOfSlot(slot).filter((i) => i.price === 0 && !i.exclusive); // ห้ามหยิบของเซ็ตพิเศษ (ราคา 0 แต่ได้จากโค้ดเท่านั้น)
    out[slot] = free[Math.floor(next() * free.length)].id;
  }
  return out;
}

// ---------------------------------------------------------------- ซื้อทั้งคอลเลกชัน
/** ส่วนลดเมื่อซื้อทั้งชุด (คิดเฉพาะชิ้นที่ยังไม่มี) */
export const BUNDLE_DISCOUNT_PCT = 20;
export interface BundleQuote {
  /** ชิ้นที่ยังไม่มีและจะได้ในแพ็กเกจ */
  ids: string[];
  /** ราคารวมถ้าซื้อทีละชิ้น */
  full: number;
  /** ราคาแพ็กเกจหลังลด (ปัดเป็นหลักสิบ) */
  price: number;
  saved: number;
  total: number;
  have: number;
}
/** คำนวณราคาซื้อทั้งชุดของคอลเลกชัน ตามของที่มีอยู่แล้ว */
export function bundleQuote(collectionId: string, owned: Iterable<string>): BundleQuote {
  const have = new Set(owned);
  const all = colItemIds(collectionId).filter((id) => ITEM_BY_ID[id]);
  const ids = all.filter((id) => !have.has(id));
  const full = ids.reduce((s, id) => s + ITEM_BY_ID[id].price, 0);
  const price = Math.round((full * (100 - BUNDLE_DISCOUNT_PCT)) / 100 / 10) * 10;
  return { ids, full, price, saved: full - price, total: all.length, have: all.length - ids.length };
}

// ---------------------------------------------------------------- เหรียญ
export const STARTING_COINS = 1000;
export const REWARD = { play: 150, win: 200, survive: 100 } as const;

export interface RewardBreakdown {
  total: number;
  play: number;
  win: number;
  survive: number;
}

export function computeReward(won: boolean, survived: boolean): RewardBreakdown {
  const play = REWARD.play;
  const win = won ? REWARD.win : 0;
  const survive = survived ? REWARD.survive : 0;
  return { total: play + win + survive, play, win, survive };
}
