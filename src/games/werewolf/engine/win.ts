// engine/win.ts — เงื่อนไขชนะ + ลำดับความสำคัญ (RULES ข้อ 8)
import type { GameState, Winner } from './types';
import { alivePlayers } from './state';

/**
 * ผู้ชนะ "แยก" ที่ประกาศร่วมกับผู้ชนะหลักเสมอ ไม่แย่งอันดับใคร (RULES 8.2 ท้ายข้อ):
 *  - ผู้ทำนายอนาคต: ทายฝ่ายผู้ชนะหลักถูก (ไม่ต้องรอดก็ได้)
 *  - คนโง่เจ้าเล่ห์: ถูกโหวตประหารสำเร็จ (ตั้งธงไว้ตอนประหาร — ดู vote.ts)
 *  - กระจกสะท้อน: รอดชีวิตจนเกมจบ
 * เรียกจากทุกจุดที่ "เกมจบจริง" (checkWinners คืนค่า และจุดที่ตัวตลก/คนฟอกจบเกมเองใน vote.ts)
 */
export function appendSideWinners(s: GameState, winners: Winner[]): Winner[] {
  const mainTeam = winners.find((w) => w.main)?.team;
  const extra: Winner[] = [];
  for (const p of s.players) {
    if (p.roleId === 'nostradamus' && typeof p.roleState.predictedTeam === 'string' && p.roleState.predictedTeam === mainTeam) {
      extra.push({ team: 'solo', playerIds: [p.id], reasonTh: 'ผู้ทำนายอนาคตทายฝ่ายผู้ชนะถูกต้อง', main: false });
    }
    if (p.roleId === 'fool' && p.roleState.sideWinFool === true) {
      extra.push({ team: 'solo', playerIds: [p.id], reasonTh: 'คนโง่เจ้าเล่ห์ถูกโหวตประหารสำเร็จ (ชนะเฉพาะตัว)', main: false });
    }
    if (p.roleId === 'copycat' && p.alive) {
      extra.push({ team: 'solo', playerIds: [p.id], reasonTh: 'นักเลียนแบบรอดชีวิตจนเกมจบ', main: false });
    }
    if (p.roleId === 'mirror' && p.alive) {
      extra.push({ team: 'solo', playerIds: [p.id], reasonTh: 'กระจกสะท้อนรอดชีวิตจนเกมจบ', main: false });
    }
    if (p.roleId === 'chupacabra' && p.alive && !s.players.some((x) => x.alive && x.team === 'wolf')) {
      extra.push({ team: 'solo', playerIds: [p.id], reasonTh: 'ชูปาคาบรากำจัดหมาป่าหมดและยังมีชีวิตอยู่', main: false });
    }
  }
  return extra.length > 0 ? [...winners, ...extra] : winners;
}

/**
 * ตรวจผู้ชนะหลัก (ทำให้เกมจบ) ตามลำดับ RULES 8.2:
 *   1 คู่รักข้ามฝ่าย  2 ฝ่ายอิสระรายบุคคล (คนฟอก ถูกโหวตแล้ว — ตั้งตอนประหาร)  3 หมาป่า  4 หมู่บ้าน
 * คืน null ถ้าเกมยังไม่จบ
 */
export function checkWinners(s: GameState): Winner[] | null {
  const alive = alivePlayers(s);

  // 1) คู่รักข้ามฝ่าย — เหลือรอดสองคนนั้นเท่านั้น
  if (s.settings.loversWin && alive.length === 2) {
    for (const [a, b] of s.loverPairs) {
      const ids = alive.map((p) => p.id);
      if (ids.includes(a) && ids.includes(b)) {
        const pa = alive.find((p) => p.id === a)!;
        const pb = alive.find((p) => p.id === b)!;
        if (pa.team !== pb.team) {
          return appendSideWinners(s, [{ team: 'lovers', playerIds: [a, b], reasonTh: 'คู่รักข้ามฝ่ายรอดเหลือสองคนสุดท้าย', main: true }]);
        }
      }
    }
  }

  // ไม่เหลือใครเลย — ไม่มีผู้ชนะหลัก
  if (alive.length === 0) {
    return [{ team: 'village', playerIds: [], reasonTh: 'ทุกคนตายหมด — เสมอ', main: true }];
  }

  // 2) ฝ่ายอิสระที่ชนะเมื่อ "เป็นคนสุดท้ายที่รอด" (ฆาตกรเดี่ยว/นักวางเพลิง/นักล่าหมาป่าเดี่ยว)
  const SOLO_LAST_SURVIVOR = ['serial_killer', 'arsonist', 'lone_wolf_hunter'];
  if (alive.length === 1 && SOLO_LAST_SURVIVOR.includes(alive[0].roleId)) {
    return appendSideWinners(s, [{ team: 'solo', playerIds: [alive[0].id], reasonTh: 'เป็นผู้เล่นคนสุดท้ายที่รอด', main: true }]);
  }

  // 3) ทีมอิสระ (แวมไพร์ / ลัทธิ) — ก่อนหมาป่าตามลำดับ RULES 8.2 🔸 (แวมไพร์ก่อนลัทธิ)
  const vampires = alive.filter((p) => p.team === 'vampire');
  if (vampires.length > 0 && vampires.length >= alive.length - vampires.length) {
    return appendSideWinners(s, [{
      team: 'vampire',
      playerIds: s.players.filter((p) => p.team === 'vampire').map((p) => p.id),
      reasonTh: 'จำนวนแวมไพร์ที่รอดมากพอจะควบคุมหมู่บ้าน',
      main: true,
    }]);
  }
  const cultists = alive.filter((p) => p.team === 'cult');
  if (cultists.length > 0 && cultists.length >= alive.length - cultists.length) {
    return appendSideWinners(s, [{
      team: 'cult',
      playerIds: s.players.filter((p) => p.team === 'cult').map((p) => p.id),
      reasonTh: 'จำนวนสมาชิกลัทธิที่รอดมากพอจะควบคุมหมู่บ้าน',
      main: true,
    }]);
  }

  const wolves = alive.filter((p) => p.team === 'wolf');
  const others = alive.filter((p) => p.team !== 'wolf');

  // 4) หมาป่า
  const wolfWins =
    wolves.length > 0 &&
    (s.settings.wolfWinOperator === 'gte' ? wolves.length >= others.length : wolves.length > others.length);
  if (wolfWins) {
    // หมาป่าเดียวดาย: ชนะเฉพาะเมื่อเป็นหมาป่าที่เหลือรอดเพียงตัวเดียว (ถ้ามีหมาป่าตัวอื่นรอดด้วย เขาแพ้)
    const soleWolfLeft = wolves.length === 1;
    return appendSideWinners(s, [{
      team: 'wolf',
      playerIds: s.players
        .filter((p) => p.winWith === 'wolf' || p.team === 'wolf')
        .filter((p) => p.roleId !== 'lone_wolf' || soleWolfLeft)
        .map((p) => p.id),
      reasonTh: 'จำนวนหมาป่าที่รอดมากพอจะควบคุมหมู่บ้าน',
      main: true,
    }]);
  }

  // 5) หมู่บ้าน — ภัยทุกฝ่าย (หมาป่า/แวมไพร์/ลัทธิ) ถูกกำจัดหมด
  if (wolves.length === 0 && vampires.length === 0 && cultists.length === 0) {
    return appendSideWinners(s, [{
      team: 'village',
      playerIds: s.players.filter((p) => p.team === 'village').map((p) => p.id),
      reasonTh: 'หมาป่าทุกตัวถูกกำจัดแล้ว',
      main: true,
    }]);
  }

  return null;
}
