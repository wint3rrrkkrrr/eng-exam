// engine/pipeline.ts — ท่อประมวลผลกลางคืน 10 ขั้น (RULES ข้อ 6)
// ทุกการกระทำเป็น "เจตนา" (Intent) ในลิสต์ แล้วค่อยประมวลผลตามขั้น ไม่มีใครตายทันทีที่ถูกเลือก
// ขั้น 1–3 (ขัดขวาง/สลับชะตา/สะท้อน) และ 5, 9 เป็นขั้นที่ "ผ่านตรง" ใน M2 — ใส่ไว้ให้ครบโครง
// เพื่อให้บทที่ทับซ้อนกัน (M6) เพิ่มเข้ามาโดยไม่ต้องรื้อเอนจิน (Q23)
import type { AbilityCategory, DeathCause, GameEvent, GameState, Intent } from './types';
import { getRole } from './roles';
import { settleDeaths, publicCause } from './deaths';
import { ev, mustPlayer, player } from './state';

type Log = (step: string, data?: Record<string, unknown>) => void;

/**
 * ผู้ที่ถูกขัดขวางคืนนี้ — ประมวลตามเลขช่อง (ผู้ขัดขวางช่องน้อยกว่าทำก่อน · ผู้ขัดขวางที่ถูกขัดแล้วขัดใครไม่ได้)
 * ใช้ทั้งตอนปิดช่องหมาป่า (กรองเสียงของหมาป่าที่ถูกขัด) และขั้น 1 ของท่อ
 */
export function computeBlocked(intents: Intent[]): Set<string> {
  const blocked = new Set<string>();
  const blocks = intents.filter((i) => i.kind === 'block').sort((a, b) => a.slot - b.slot);
  for (const b of blocks) {
    if (blocked.has(b.actorId)) continue;
    for (const t of b.targets) blocked.add(t);
  }
  return blocked;
}

// ขั้น 1: ขัดขวาง — เจตนาของผู้ถูกขัดถูกยกเลิก (ไม่ตัดจำนวนครั้งที่ใช้ได้) และแจ้งผู้ถูกขัดตามตั้งค่า
function step01Blocks(s: GameState, intents: Intent[], log: Log): Intent[] {
  const blocked = computeBlocked(intents);
  if (blocked.size === 0) return intents;
  for (const id of blocked) {
    if (s.settings.blockedNotice) (s.privateLog[id] ??= []).push({ kind: 'blocked', day: s.dayNumber });
  }
  log('01blocks', { blocked: Array.from(blocked) });
  return intents.filter((i) => i.kind === 'block' ? !blocked.has(i.actorId) : !blocked.has(i.actorId));
}
/**
 * ขั้น 2: สลับชะตา — ผู้สลับชะตาเลือก A,B แล้วสลับเป้าหมายของ "ทุกเจตนาของคนอื่น" แบบสมมาตร
 * (หมาป่าเลือก A + หมอกัน B → กลายเป็นหมาป่าเลือก B + หมอกัน A) · ไม่สลับบท/ฝ่ายโดยตรง · ไม่สลับเจตนาของผู้สลับชะตาเอง
 */
function step02Swap(s: GameState, intents: Intent[], log: Log): Intent[] {
  const swapIntent = intents.find((i) => i.kind === 'swap');
  if (!swapIntent) return intents;
  const [a, b] = swapIntent.targets;
  if (!a || !b) return intents;
  log('02swap', { a, b });
  return intents.map((i) => {
    if (i.kind === 'swap' || i.targets.length === 0) return i;
    const targets = i.targets.map((t) => (t === a ? b : t === b ? a : t));
    return targets.every((t, idx) => t === i.targets[idx]) ? i : { ...i, targets };
  });
}
const INVESTIGATE_KINDS = new Set([
  'investigate_seer', 'investigate_aura', 'investigate_mystic', 'investigate_pair',
  'investigate_group', 'investigate_sorcerer', 'investigate_wolfseer',
]);
const ATTACK_KINDS = new Set(['vigilante_shot']); // wolf_bite ไม่สะท้อน (เป็นมติร่วมของฝูง ไม่ใช่คนเดียว 🔸A28)

// ขั้น 3: สะท้อน — เจตนา "โจมตี" ที่เป้าหมายเป็นกระจก ย้อนกลับไปที่ผู้ใช้ (คนนั้นโดนเอง)
// เจตนา "สืบสวน" ที่เป้าหมายเป็นกระจก → ไม่เปลี่ยนเป้าหมายจริง แต่ตั้งธง mirrored ให้ขั้น 10 ตอบว่า "ผลถูกสะท้อน" แทนข้อมูลจริง
function step03Mirror(s: GameState, intents: Intent[], log: Log): Intent[] {
  const mirrors = new Set(s.players.filter((p) => p.alive && p.roleId === 'mirror').map((p) => p.id));
  if (mirrors.size === 0) return intents;
  return intents.map((i) => {
    if (!i.targets.some((t) => mirrors.has(t))) return i;
    if (ATTACK_KINDS.has(i.kind)) {
      log('03mirror_attack', { actor: i.actorId, kind: i.kind });
      return { ...i, targets: i.targets.map((t) => (mirrors.has(t) ? i.actorId : t)) };
    }
    if (INVESTIGATE_KINDS.has(i.kind)) {
      log('03mirror_investigate', { actor: i.actorId, kind: i.kind });
      return { ...i, meta: { ...i.meta, mirrored: true } };
    }
    return i;
  });
}

interface Attack {
  targetId: string;
  cause: DeathCause;
  fromWolves: boolean; // เป้าหมายหลักของฝูง — แม่มดชุบได้เฉพาะอันนี้
  packKill: boolean; // เป็นการฆ่าของฝูงหมาป่า (รวมเป้าหมายที่สองของลูกหมาป่า) — คนถึก/ผู้ต้องคำสาปมีผล
  actorId?: string; // ผู้ลงมือ (ใช้กับผู้พิทักษ์ประชาชน)
  negatedBy?: 'doctor' | 'bodyguard' | 'priest';
  healed?: boolean;
}

export function isWolfForSeer(s: GameState, id: string): boolean {
  const p = mustPlayer(s, id);
  const def = getRole(p.roleId);
  if (def.seenAsWolf !== undefined) return def.seenAsWolf; // บทที่กำหนดเอง (ลวงตา = จริง · สมุน = เท็จ)
  return p.team === 'wolf';
}

/** รัศมีที่ผู้หยั่งรู้รัศมีเห็น — ตามฝ่ายจริง (ไม่ถูกหลอกโดยมนุษย์หมาป่าลวงตา ตาราง 11.1) */
export function auraOf(s: GameState, id: string): 'good' | 'evil' | 'neutral' {
  const p = mustPlayer(s, id);
  if (p.team === 'wolf') return 'evil';
  if (p.team === 'village') return 'good';
  return 'neutral';
}

/** ประเภทความสามารถที่ผู้หยั่งรู้ลึกลับเห็น (🔸A16) */
export function abilityCategoryOf(s: GameState, id: string): AbilityCategory {
  const roleId = mustPlayer(s, id).roleId;
  if (roleId === 'gunner') return 'kill'; // ยิงได้ตอนกลางวัน ไม่มีในลิสต์ความสามารถกลางคืน
  const def = getRole(roleId);
  const kinds = def.abilities.map((a) => a.kind);
  if (kinds.some((k) => k === 'wolf_bite' || k === 'vigilante_shot' || k === 'solo_kill' || k === 'ignite' || k === 'hunt_wolf' || k === 'hunt_chupacabra')) return 'kill';
  if (kinds.some((k) => k === 'block')) return 'block';
  if (kinds.some((k) => k === 'protect_doctor' || k === 'protect_bodyguard' || k === 'protect_priest' || k === 'witch')) return 'protect';
  if (kinds.some((k) => k.startsWith('investigate') || k === 'inspect_grave')) return 'investigate';
  if (kinds.some((k) => k === 'cupid_pair' || k === 'swap' || k === 'hag_curse' || k === 'alpha_convert' || k === 'infect' || k === 'vampire_bite' || k === 'cult_recruit')) return 'convert';
  return 'none';
}

export function resolveNight(s: GameState, events: GameEvent[]): void {
  const n = s.night;
  if (!n) return;
  const log: Log = (step, data = {}) => events.push(ev(s, 'pipeline', false, { step, ...data }));

  // หมาป่าผู้บดบัง: ตั้งธงให้โหวตวันถัดไปถูกบดบัง (ใช้ครั้งไป 1)
  const blockedAtVeil = computeBlocked(n.intents);
  for (const id of n.veilBy) {
    if (blockedAtVeil.has(id)) continue; // ถูกขัดขวาง: ไม่บดบัง และไม่เสียสิทธิ์
    const w = mustPlayer(s, id);
    w.roleState.veilLeft = Math.max(0, Number(w.roleState.veilLeft) - 1);
    s.veilNext = true;
    events.push(ev(s, 'veil_set', false, { actorId: id }));
  }

  let intents = n.intents.filter((i) => !i.cancelled);
  intents = step01Blocks(s, intents, log);
  intents = step02Swap(s, intents, log);
  intents = step03Mirror(s, intents, log);

  // บันทึก "กันใครคืนนี้" ไว้ตรวจกฎกันคนเดิมซ้ำ (หมอ + นักบวช)
  for (const p of s.players) {
    if (p.roleId === 'doctor') {
      const it = intents.find((i) => i.actorId === p.id && i.kind === 'protect_doctor');
      p.roleState.lastProtected = it ? it.targets[0] : null;
    } else if (p.roleId === 'priest') {
      const it = intents.find((i) => i.actorId === p.id && i.kind === 'protect_priest');
      p.roleState.lastProtected = it ? it.targets[0] : null;
    }
  }

  // หญิงชรา: ผู้ถูกเลือก (ที่ยังไม่ตายตอนนี้) ห้ามโหวตวันถัดไป — เก็บสิทธิ์เดิมไว้คืนตอนเริ่มคืนถัดไป
  for (const it of intents.filter((i) => i.kind === 'hag_curse')) {
    const t = player(s, it.targets[0]);
    if (!t || !t.alive) continue;
    if (t.canVote) { t.canVote = false; t.roleState.hagMuted = true; }
    (s.privateLog[t.id] ??= []).push({ kind: 'muted', day: s.dayNumber });
    log('01hag', { target: t.id });
  }

  // ---- ขั้น 4: ป้องกัน (ทำกับ "ทุกการโจมตี" ของคืนนี้ — ฝูงหมาป่า + ผู้พิทักษ์ประชาชน)
  const attacks: Attack[] = [];
  const bite = intents.find((i) => i.kind === 'wolf_bite');
  if (bite && bite.targets[0]) attacks.push({ targetId: bite.targets[0], cause: 'wolf', fromWolves: true, packKill: true });
  const cubExtra = intents.find((i) => i.kind === 'wolf_bite_extra');
  if (cubExtra && cubExtra.targets[0]) attacks.push({ targetId: cubExtra.targets[0], cause: 'wolf', fromWolves: false, packKill: true }); // ลูกหมาป่า: เป้าหมายที่สอง (แม่มดชุบได้เฉพาะเป้าหมายแรก)
  for (const it of intents.filter((i) => i.kind === 'vigilante_shot')) {
    const t = it.targets[0];
    if (!t) continue;
    const v = mustPlayer(s, it.actorId);
    if (Number(v.roleState.shots) <= 0) continue;
    v.roleState.shots = Number(v.roleState.shots) - 1; // ยิงแล้วเสียนัด (ถ้าถูกขัดขวางจะไม่มาถึงตรงนี้)
    attacks.push({ targetId: t, cause: 'vigilante', fromWolves: false, packKill: false, actorId: it.actorId });
  }
  for (const it of intents.filter((i) => i.kind === 'solo_kill')) {
    const t = it.targets[0];
    if (t) attacks.push({ targetId: t, cause: 'solo_kill', fromWolves: false, packKill: false });
  }
  for (const it of intents.filter((i) => i.kind === 'hunt_wolf')) {
    const t = it.targets[0];
    if (t) attacks.push({ targetId: t, cause: 'hunt_wolf', fromWolves: false, packKill: false });
  }
  for (const it of intents.filter((i) => i.kind === 'hunt_chupacabra')) {
    const t = it.targets[0];
    if (t && mustPlayer(s, t).team === 'wolf') attacks.push({ targetId: t, cause: 'chupacabra', fromWolves: false, packKill: false });
    // เลือกผิด (ไม่ใช่หมาป่า) = เงียบ ไม่เกิดอะไรขึ้น ไม่มีผลลัพธ์ให้รู้
  }
  // นักวางเพลิง: ชโลมน้ำมันสะสมไว้ก่อน (ไม่ใช่การโจมตี) แล้วจุดไฟเผาทุกคนที่ชโลมพร้อมกัน (ทะลุทุกการป้องกัน)
  for (const it of intents.filter((i) => i.kind === 'oil_mark')) {
    const t = it.targets[0];
    const arsonist2 = mustPlayer(s, it.actorId);
    const marked = Array.isArray(arsonist2.roleState.marked) ? (arsonist2.roleState.marked as string[]) : [];
    if (t && !marked.includes(t)) arsonist2.roleState.marked = [...marked, t];
  }
  for (const it of intents.filter((i) => i.kind === 'ignite')) {
    const arsonist2 = mustPlayer(s, it.actorId);
    const marked = Array.isArray(arsonist2.roleState.marked) ? (arsonist2.roleState.marked as string[]) : [];
    for (const t of marked) if (player(s, t)?.alive) attacks.push({ targetId: t, cause: 'fire', fromWolves: false, packKill: false });
    arsonist2.roleState.marked = [];
  }

  const deaths: { id: string; cause: DeathCause }[] = [];
  const bodyguardDeaths = new Set<string>();
  for (const atk of attacks) {
    if (atk.cause === 'fire') {
      // ไฟนักวางเพลิงทะลุทุกการป้องกัน (ตาราง 11.2 — 🔸A30)
      log('04protect', { target: atk.targetId, cause: atk.cause, negatedBy: null });
      continue;
    }
    const docSaves = atk.cause !== 'solo_kill' && intents.some((i) => i.kind === 'protect_doctor' && i.targets[0] === atk.targetId); // หมอกันฆาตกรเดี่ยวไม่ได้
    const priestSaves = intents.some((i) => i.kind === 'protect_priest' && i.targets[0] === atk.targetId);
    if (docSaves) {
      atk.negatedBy = 'doctor';
    } else if (priestSaves) {
      atk.negatedBy = 'priest';
    } else {
      const bg = intents.find((i) => i.kind === 'protect_bodyguard' && i.targets[0] === atk.targetId);
      if (bg) {
        atk.negatedBy = 'bodyguard';
        bodyguardDeaths.add(bg.actorId);
      }
    }
    log('04protect', { target: atk.targetId, cause: atk.cause, negatedBy: atk.negatedBy ?? null });
  }
  const wolfAttack = attacks.find((a) => a.fromWolves) ?? null;

  // ---- ขั้น 6: ยาแม่มด (ชุบได้เฉพาะเหยื่อของฝูง)
  const poisons: string[] = [];
  for (const it of intents.filter((i) => i.kind === 'witch')) {
    const w = mustPlayer(s, it.actorId);
    // ใช้การโจมตีจริงหลังขัดขวาง/สลับชะตา แทนเป้าหมายดิบที่ฝูงประกาศ — แม่มดชุบ "คนที่ถูกโจมตีจริง" เสมอ
    if (it.meta.heal === true && Number(w.roleState.heal) > 0 && wolfAttack) {
      if (wolfAttack.negatedBy) {
        // หมอ/นักบวช/ผู้คุ้มกันกันไว้แล้ว: ได้ยาคืน (ตั้งค่าได้) หรือเสียไปเลย
        if (!s.settings.witchRefundOnProtected) w.roleState.heal = 0;
        log('06heal', { refunded: s.settings.witchRefundOnProtected });
      } else {
        wolfAttack.healed = true;
        w.roleState.heal = 0;
        log('06heal', { saved: wolfAttack.targetId });
      }
    }
    const pid = it.meta.poisonId;
    if (typeof pid === 'string' && Number(w.roleState.poison) > 0) {
      w.roleState.poison = 0;
      poisons.push(pid);
      log('06poison', { target: pid });
    }
  }

  // ---- ขั้น 5: ภูมิคุ้มกันพิเศษ — คนถึก / ชาวบ้านต้องคำสาป (เฉพาะการโจมตีของฝูง และต้องไม่ถูกกันไว้)
  for (const atk of attacks) {
    if (atk.negatedBy || atk.healed || !atk.packKill) continue;
    const target = player(s, atk.targetId);
    if (!target || !target.alive) continue;
    if (target.roleId === 'cursed_villager') {
      atk.negatedBy = 'doctor'; // ไม่ตายคืนนี้ (ใช้ช่องเดิมเพื่อบอกว่า "ไม่เกิดการตาย")
      s.delayed.push({ kind: 'convert_wolf', targetId: target.id, onDay: s.dayNumber + 1 });
      (s.privateLog[target.id] ??= []).push({ kind: 'cursed', day: s.dayNumber });
      log('05cursed', { target: target.id });
    } else if (target.roleId === 'tough_guy') {
      atk.negatedBy = 'doctor';
      s.delayed.push({ kind: 'die', targetId: target.id, onDay: s.dayNumber + 1, cause: 'wolf' });
      (s.privateLog[target.id] ??= []).push({ kind: 'tough', day: s.dayNumber });
      log('05tough', { target: target.id });
    }
  }

  // ---- ขั้น 7: ยืนยันรายชื่อตาย (ตายครั้งเดียว ไม่นับซ้ำ — settleDeaths กันซ้ำให้)
  for (const atk of attacks) {
    if (atk.negatedBy || atk.healed) continue;
    deaths.push({ id: atk.targetId, cause: atk.cause });
    // ผู้พิทักษ์ประชาชนยิงฝ่ายหมู่บ้าน → ตายด้วยความรู้สึกผิดตอนจบคืนถัดไป (🔸A18)
    if (atk.cause === 'vigilante' && atk.actorId) {
      const victim = player(s, atk.targetId);
      if (victim && victim.team === 'village') {
        s.delayed.push({ kind: 'die', targetId: atk.actorId, onDay: s.dayNumber + 1, cause: 'guilt' });
      }
    }
  }
  for (const id of bodyguardDeaths) deaths.push({ id, cause: 'bodyguard' });
  for (const id of poisons) deaths.push({ id, cause: 'poison' });

  // ---- ขั้น 9: ผลที่ค้างมาจากคืนก่อน (คนถึกตาย · ผู้ต้องคำสาปกลายเป็นหมาป่า · ความรู้สึกผิด)
  const due = s.delayed.filter((d) => d.onDay <= s.dayNumber);
  s.delayed = s.delayed.filter((d) => d.onDay > s.dayNumber);
  for (const d of due) {
    const target = player(s, d.targetId);
    if (!target || !target.alive) continue;
    if (d.kind === 'die') {
      deaths.push({ id: target.id, cause: d.cause ?? 'wolf' });
      log('09delayed_die', { target: target.id });
    } else if (d.kind === 'convert_vampire') {
      target.roleId = 'vampire';
      target.team = 'vampire';
      target.winWith = 'vampire';
      events.push(ev(s, 'converted', false, { playerId: target.id, to: 'vampire' }));
      log('09convert', { target: target.id, to: 'vampire' });
    } else {
      target.roleId = 'werewolf';
      target.team = 'wolf';
      target.winWith = 'wolf';
      events.push(ev(s, 'converted', false, { playerId: target.id, to: 'werewolf' }));
      log('09convert', { target: target.id, to: 'werewolf' });
    }
  }
  log('07confirm', { deaths: deaths.map((d) => d.id) });

  // ---- ขั้น 10 (คำนวณก่อนขั้น 8–9 ตาม RULES: ใช้สถานะก่อนลูกโซ่) แล้วส่งตอนเช้า
  // เจตนาสืบสวนที่ถูกกระจกสะท้อน (meta.mirrored) → ได้ข้อความ "ผลถูกสะท้อน" แทนข้อมูลจริง
  const mirroredResult = (actorId: string) => (s.privateLog[actorId] ??= []).push({ kind: 'mirrored', day: s.dayNumber });
  for (const it of intents.filter((i) => i.kind === 'investigate_seer')) {
    const t = it.targets[0];
    if (!t) continue;
    if (it.meta.mirrored) { mirroredResult(it.actorId); continue; }
    (s.privateLog[it.actorId] ??= []).push({
      kind: 'seer', day: s.dayNumber, targetId: t, isWolf: isWolfForSeer(s, t),
    });
  }
  for (const it of intents.filter((i) => i.kind === 'investigate_aura')) {
    const t = it.targets[0];
    if (!t) continue;
    if (it.meta.mirrored) { mirroredResult(it.actorId); continue; }
    (s.privateLog[it.actorId] ??= []).push({ kind: 'aura', day: s.dayNumber, targetId: t, aura: auraOf(s, t) });
  }
  for (const it of intents.filter((i) => i.kind === 'investigate_mystic')) {
    const t = it.targets[0];
    if (!t) continue;
    if (it.meta.mirrored) { mirroredResult(it.actorId); continue; }
    (s.privateLog[it.actorId] ??= []).push({ kind: 'mystic', day: s.dayNumber, targetId: t, category: abilityCategoryOf(s, t) });
  }
  for (const it of intents.filter((i) => i.kind === 'investigate_pair')) {
    const [a, b] = it.targets;
    if (!a || !b) continue;
    if (it.meta.mirrored) { mirroredResult(it.actorId); continue; }
    (s.privateLog[it.actorId] ??= []).push({
      kind: 'detective', day: s.dayNumber, targetIds: [a, b], sameTeam: mustPlayer(s, a).team === mustPlayer(s, b).team,
    });
  }
  for (const it of intents.filter((i) => i.kind === 'investigate_group')) {
    if (it.targets.length === 0) continue;
    if (it.meta.mirrored) { mirroredResult(it.actorId); continue; }
    (s.privateLog[it.actorId] ??= []).push({
      kind: 'investigator', day: s.dayNumber, targetIds: it.targets.slice(), hasWolf: it.targets.some((t) => isWolfForSeer(s, t)),
    });
  }
  for (const it of intents.filter((i) => i.kind === 'inspect_grave')) {
    const t = it.targets[0];
    if (!t) continue;
    const target = mustPlayer(s, t);
    (s.privateLog[it.actorId] ??= []).push({ kind: 'grave', day: s.dayNumber, targetId: t, roleId: target.roleId, team: target.team });
  }
  for (const it of intents.filter((i) => i.kind === 'investigate_sorcerer')) {
    const t = it.targets[0];
    if (!t) continue;
    if (it.meta.mirrored) { mirroredResult(it.actorId); continue; }
    (s.privateLog[it.actorId] ??= []).push({ kind: 'sorcerer_check', day: s.dayNumber, targetId: t, isSeer: mustPlayer(s, t).roleId === 'seer' });
  }
  for (const it of intents.filter((i) => i.kind === 'investigate_wolfseer')) {
    const t = it.targets[0];
    if (!t) continue;
    if (it.meta.mirrored) { mirroredResult(it.actorId); continue; }
    const target = mustPlayer(s, t);
    (s.privateLog[it.actorId] ??= []).push({ kind: 'wolfseer_check', day: s.dayNumber, targetId: t, roleId: target.roleId, team: target.team });
  }
  for (const it of intents.filter((i) => i.kind === 'predict')) {
    const teamGuess = typeof it.meta.team === 'string' ? it.meta.team : null;
    if (teamGuess) mustPlayer(s, it.actorId).roleState.predictedTeam = teamGuess;
  }

  // หมาป่าอัลฟ่า: เปลี่ยนเป้าหมายเป็นหมาป่าตอนจบคืนถัดไป (1 ครั้ง/เกม)
  for (const it of intents.filter((i) => i.kind === 'alpha_convert')) {
    const actor = mustPlayer(s, it.actorId);
    const t = it.targets[0];
    if (!t || actor.roleState.alphaUsed === true) continue;
    actor.roleState.alphaUsed = true;
    const target = player(s, t);
    if (target && target.alive && target.team === 'village') {
      s.delayed.push({ kind: 'convert_wolf', targetId: t, onDay: s.dayNumber + 1 });
      log('alpha_convert', { target: t });
    }
  }

  // หมาป่าแพร่เชื้อ: ติดเชื้อแทนการฆ่าคืนนี้ → แปลงเป็นหมาป่าตอนจบคืนที่ 2 ถัดจากนี้ (1 ครั้ง/เกม)
  for (const it of intents.filter((i) => i.kind === 'infect')) {
    const actor = mustPlayer(s, it.actorId);
    const t = it.targets[0];
    if (!t || actor.roleState.infectUsed === true) continue;
    actor.roleState.infectUsed = true;
    const target = player(s, t);
    if (target && target.alive) {
      s.delayed.push({ kind: 'convert_wolf', targetId: t, onDay: s.dayNumber + 2 });
      (s.privateLog[t] ??= []).push({ kind: 'infected', day: s.dayNumber });
      log('infect', { target: t });
    }
  }

  // แวมไพร์: กัดแล้วไม่ตาย แต่แปลงเป็นแวมไพร์ตอนจบคืนถัดไป — หมอ/นักบวช/ผู้คุ้มกันกันได้ (แม่มดชุบไม่ได้ เพราะไม่ใช่เหยื่อฝูงหมาป่า)
  for (const it of intents.filter((i) => i.kind === 'vampire_bite')) {
    const t = it.targets[0];
    if (!t) continue;
    const target = player(s, t);
    if (!target || !target.alive || target.team === 'vampire') continue;
    const saved = intents.some((i) => (i.kind === 'protect_doctor' || i.kind === 'protect_bodyguard' || i.kind === 'protect_priest') && i.targets[0] === t);
    if (saved) { log('vampire_blocked', { target: t }); continue; }
    s.delayed.push({ kind: 'convert_vampire', targetId: t, onDay: s.dayNumber + 1 });
    (s.privateLog[t] ??= []).push({ kind: 'vampire_bitten', day: s.dayNumber });
    log('vampire_bite', { target: t });
  }

  // ผู้นำลัทธิ: ชักชวนสำเร็จ → เป็นสมาชิกลัทธิทันทีตอนจบคืนนี้ (ไม่ต้องรอข้ามคืน) — ชักชวนได้เฉพาะฝ่ายหมู่บ้าน
  for (const it of intents.filter((i) => i.kind === 'cult_recruit')) {
    const t = it.targets[0];
    if (!t) continue;
    const target = player(s, t);
    if (!target || !target.alive || target.team !== 'village') continue;
    target.roleId = 'cult_member';
    target.team = 'cult';
    target.winWith = 'cult';
    (s.privateLog[t] ??= []).push({ kind: 'cult_recruited', day: s.dayNumber });
    events.push(ev(s, 'converted', false, { playerId: t, to: 'cult_member' }));
    log('cult_recruit', { target: t });
  }

  // เด็กป่าหลงทาง / มนุษย์ป่า: เลือกต้นแบบคืนแรก (เฝ้าดูว่าต้นแบบตายเมื่อไรใน deaths.ts)
  for (const it of intents.filter((i) => i.kind === 'pick_model')) {
    const t = it.targets[0];
    if (!t) continue;
    mustPlayer(s, it.actorId).roleState.modelId = t;
    log('pick_model', { actor: it.actorId, model: t });
  }

  // ---- ขั้น 8: ลูกโซ่หลังตาย (คู่รัก → นายพราน) + ขั้น 9: เปลี่ยนฝ่าย (M6) + ตรวจผู้ชนะ
  s.resume = 'morning';
  settleDeaths(s, deaths, events);
  if (s.phase !== 'game_over') s.phase = 'morning';
  afterPending(s, events);
}

/** เมื่อไม่มีนายพรานค้างยิง → ประกาศเช้า (หรือปิดการรอ) */
export function afterPending(s: GameState, events: GameEvent[]): void {
  if (s.pendingHunters.length > 0) return;
  if (s.resume === 'morning') announceMorning(s, events);
  s.resume = null;
}

export function announceMorning(s: GameState, events: GameEvent[]): void {
  const deaths = s.tonightDeaths.map((d) => {
    const p = player(s, d.id)!;
    return {
      playerId: d.id,
      cause: publicCause(d.cause),
      revealedRole: p.revealedRole,
      revealedTeam: p.revealedTeam,
      revealedIsWolf: p.revealedIsWolf,
    };
  });
  events.push(ev(s, 'morning', true, { deaths, nobodyDied: deaths.length === 0 }, 'morning'));
}
