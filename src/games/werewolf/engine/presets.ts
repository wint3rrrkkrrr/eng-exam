// engine/presets.ts — ชุดบทพรีเซ็ตตามจำนวนผู้เล่น
// หมายเหตุสำคัญ: specials ถูกตัดท้ายด้วย .slice(0, n) เสมอ (ที่นั่งไม่พอใส่ทุกบทที่ "ปลดล็อก" แล้ว)
// → ลำดับการ push คือลำดับความสำคัญ (คนแรกๆ รอดแน่นอน คนท้ายๆ อาจถูกตัดถ้าที่นั่งไม่พอ โดยเฉพาะเกมใหญ่ 25–30 คน)
// ผู้เล่นเพิ่มบทที่ขาดไปเองได้เสมอในหน้าตั้งค่า ไม่ได้จำกัดแค่ที่ใส่ไว้ในนี้

export function presetRoles(n: number): string[] {
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
  const wolfRoles = Array(wolves).fill('werewolf');
  if (n >= 14 && wolves >= 2) wolfRoles[0] = 'wolf_blocker'; // แทนหมาป่าธรรมดา 1 ตัว ไม่ใช่บทเสริม
  if (n >= 16 && wolves >= 3) wolfRoles[1] = 'wolf_cub';
  if (n >= 19 && wolves >= 4) wolfRoles[2] = 'lone_wolf';
  if (n >= 22 && wolves >= 5) wolfRoles[3] = 'sorcerer';
  if (n >= 25 && wolves >= 6) wolfRoles[4] = 'wolf_seer';
  if (n >= 28 && wolves >= 7) wolfRoles[5] = 'alpha_wolf';
  if (n >= 30 && wolves >= 8) wolfRoles[6] = 'infectious_wolf';
  if (n >= 21 && wolves >= 3) wolfRoles[wolfRoles.length - 1] = 'minion'; // สมุนแทนหมาป่า 1 ตัว (ทำทีหลังสุดกันชนกับช่องอื่น)
  const roles = [...wolfRoles, ...specials];
  while (roles.length < n) roles.push('villager');
  return roles.slice(0, n);
}
