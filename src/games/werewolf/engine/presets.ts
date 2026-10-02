// engine/presets.ts — ชุดบทพรีเซ็ตตามจำนวนผู้เล่น
// หมายเหตุสำคัญ: specials ถูกตัดท้ายด้วย .slice(0, n) เสมอ (ที่นั่งไม่พอใส่ทุกบทที่ "ปลดล็อก" แล้ว)
// → ลำดับการ push คือลำดับความสำคัญ (คนแรกๆ รอดแน่นอน คนท้ายๆ อาจถูกตัดถ้าที่นั่งไม่พอ โดยเฉพาะเกมใหญ่ 25–30 คน)
// ผู้เล่นเพิ่มบทที่ขาดไปเองได้เสมอในหน้าตั้งค่า ไม่ได้จำกัดแค่ที่ใส่ไว้ในนี้

import { shuffle } from './rng';

/**
 * variant 0 = ชุดมาตรฐานคงที่ (เหมือนเดิม) · variant ≥ 1 = สลับ "ครึ่งท้ายของลำดับความสำคัญ" ให้บทอื่นได้ขึ้นแทน (เกมใหญ่ที่ที่นั่งไม่พอใส่ทุกบท)
 * ผลคงที่ตามค่า (n, variant) — ไม่ใช้ Math.random · บทที่ต้องมาเป็นคู่ (ช่างก่อสร้าง) ย้ายไปพร้อมกัน
 */
export function presetRoles(n: number, variant = 0): string[] {
  const wolves = Math.max(1, Math.round(n / 4));
  const specials: string[] = ['seer', 'doctor'];
  if (n >= 8) specials.push('hunter');
  if (n >= 10) specials.push('witch', 'tanner');
  if (n >= 12) specials.push('roleblocker');
  if (n >= 13) specials.push('bodyguard', 'cupid', 'mason', 'mason');
  if (n >= 14) specials.push('lycan');
  if (n >= 15) specials.push('priest', 'detective');
  if (n >= 17) specials.push('vigilante', 'tough_guy');
  if (n >= 17) specials.push('gunner');
  if (n >= 11) specials.push('jester'); // อยู่ก่อนหน้านี้ในลำดับ priority จริง แต่ push ทีหลังเพื่อให้โค้ดอ่านง่าย — สลับลำดับ push ด้านล่างแทน
  if (n >= 13) specials.push('nostradamus');
  if (n >= 9) specials.push('doppelganger');
  if (n >= 12) specials.push('wild_child');
  if (n >= 21) specials.push('sasquatch');
  if (n >= 16) specials.push('serial_killer');
  if (n >= 18) specials.push('chupacabra');
  if (n >= 20) specials.push('lone_wolf_hunter');
  if (n >= 25) specials.push('arsonist');
  if (n >= 19) specials.push('cursed_villager', 'apprentice_seer');
  if (n >= 16) specials.push('old_hag', 'aura_seer');
  if (n >= 23) specials.push('vampire');
  if (n >= 24) specials.push('fool');
  if (n >= 26) specials.push('mirror');
  if (n >= 27) specials.push('cult_leader');
  if (n >= 22) specials.push('investigator', 'mystic_seer', 'gravekeeper');
  if (n >= 20) specials.push('swapper');
  if (n >= 18) specials.push('mayor', 'prince', 'village_idiot', 'pacifist');
  if (n >= 18) specials.push('time_lord');
  if (n >= 24) specials.push('copycat');
  const slots = Math.max(0, n - wolves);
  let orderedSpecials = specials;
  if (variant > 0 && specials.length > slots) {
    // จัดเป็นหน่วย (ช่างก่อสร้างต้องมีสองคนเสมอ จึงเป็นหน่วยคู่) แล้วคงครึ่งหน้าตามลำดับความสำคัญ สลับครึ่งท้าย
    const units: string[][] = [];
    for (const r of specials) {
      const last = units[units.length - 1];
      if (r === 'mason' && last && last[0] === 'mason' && last.length === 1) last.push(r);
      else units.push([r]);
    }
    const keep = Math.max(2, Math.ceil(slots / 2));
    const headUnits: string[][] = [];
    let count = 0;
    let idx = 0;
    while (idx < units.length && count < keep) { headUnits.push(units[idx]); count += units[idx].length; idx++; }
    const rng = { rngState: (variant * 2654435761 + n * 40503) >>> 0 };
    const ordered = [...headUnits, ...shuffle(rng, units.slice(idx))];
    orderedSpecials = [];
    for (const u of ordered) if (orderedSpecials.length + u.length <= slots) orderedSpecials.push(...u); // หน่วยที่ใส่ไม่พอดีข้ามไป ไม่ตัดครึ่งคู่
  }
  const wolfRoles = Array(wolves).fill('werewolf');
  if (n >= 14 && wolves >= 2) wolfRoles[0] = 'wolf_blocker'; // แทนหมาป่าธรรมดา 1 ตัว ไม่ใช่บทเสริม
  if (n >= 16 && wolves >= 3) wolfRoles[1] = 'wolf_cub';
  if (n >= 19 && wolves >= 4) wolfRoles[2] = 'lone_wolf';
  if (n >= 22 && wolves >= 5) wolfRoles[3] = 'sorcerer';
  if (n >= 25 && wolves >= 6) wolfRoles[4] = 'wolf_seer';
  if (n >= 28 && wolves >= 7) wolfRoles[5] = 'alpha_wolf';
  if (n >= 30 && wolves >= 8) wolfRoles[6] = 'infectious_wolf';
  if (n >= 21 && wolves >= 3) wolfRoles[wolfRoles.length - 1] = 'minion'; // สมุนแทนหมาป่า 1 ตัว (ทำทีหลังสุดกันชนกับช่องอื่น)
  if (variant % 2 === 1 && wolves >= 2 && n >= 12) {
    const i = wolfRoles.lastIndexOf('werewolf');
    if (i > 0) wolfRoles[i] = 'veil_wolf'; // ชุดสลับคี่: ให้หมาป่าผู้บดบังได้ขึ้นบ้าง
  }
  const roles = [...wolfRoles, ...orderedSpecials];
  while (roles.length < n) roles.push('villager');
  return roles.slice(0, n);
}
