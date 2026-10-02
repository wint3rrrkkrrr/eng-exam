// engine/night.ts — การไหลของกลางคืน: สร้างช่องตื่น → รับแอคชัน → ปิดช่อง → ประมวลผล
import type {
  EngineError, EnginePlayer, GameAction, GameEvent, GameState, Intent, IntentKind, NightSlot, RoleDef,
} from './types';
import { getRole } from './roles';
import { nextRand } from './rng';
import { alivePlayers, err, ev, mustPlayer, player } from './state';
import { computeBlocked, resolveNight } from './pipeline';

type NightAction = Extract<GameAction, { type: 'night_action' }>;

/** บทที่อยู่ในฝูงหมาป่า (กัดเหยื่อร่วมกัน) = บทที่มีความสามารถ wolf_bite */
export function isPackRole(roleId: string): boolean {
  return getRole(roleId).abilities.some((a) => a.kind === 'wolf_bite');
}

export function canVeil(p: EnginePlayer): boolean {
  return p.roleId === 'veil_wolf' && Number(p.roleState.veilLeft) > 0;
}

/** บทที่ "ใช้ได้จริง" ของผู้เล่น: ความสามารถของตัวเอง + ความสามารถที่ยืมมา (นักเลียนแบบ) พร้อมระบุช่องตื่นชัดเจน */
export function actingDef(p: EnginePlayer): RoleDef {
  const def = getRole(p.roleId);
  const b = p.roleState.borrowedRole;
  if (typeof b !== 'string') return def;
  const bd = getRole(b);
  return { ...def, abilities: [...def.abilities, ...bd.abilities.map((ab) => ({ ...ab, nightSlot: ab.nightSlot ?? bd.nightSlot ?? undefined }))] };
}

/** ความสามารถของบทนี้ที่ตื่นในช่องนี้ */
export function abilityForSlot(def: ReturnType<typeof getRole>, slotNum: number) {
  return def.abilities.find((ab) => (ab.nightSlot ?? def.nightSlot) === slotNum);
}

/** กลางคืนทำพร้อมกันทุกบท — ช่องที่ผู้เล่นคนนี้ "ยังต้องทำ" ช่องแรก (เรียงตามเลขช่อง) · บทที่มี 2 ความสามารถจะเห็นทีละอัน */
export function pendingSlotFor(s: GameState, playerId: string): NightSlot | null {
  const n = s.night;
  if (!n) return null;
  const p = player(s, playerId);
  if (!p || !p.alive) return null;
  for (const slot of n.slots) {
    if (slot.idle || slot.auto || !slot.actors.includes(playerId)) continue;
    if (n.acted[actedKey(playerId, slot.slot)]) continue;
    return slot;
  }
  return null;
}

/** ทุกคนที่ต้องทำคืนนี้ส่งแอคชันครบแล้วหรือยัง */
export function nightDone(s: GameState): boolean {
  const n = s.night;
  if (!n) return true;
  // คนที่ตายกลางคืน (เช่น หลุดการเชื่อมต่อแล้วถูกนับว่าตาย) ไม่ต้องรอ
  return n.slots.every((slot) => slot.idle || slot.auto || slot.actors.every((id) => !player(s, id)?.alive || n.acted[actedKey(id, slot.slot)]));
}

// ---------------------------------------------------------------- เริ่มคืน
/** ช่องตื่นทั้งหมดของบทนี้คืนนี้ (ปกติ 1 ช่อง — บทที่มี 2 ความสามารถคนละช่อง เช่น หมาป่าผู้หยุดความสามารถ จะมี 2 ช่อง) */
function wakeSlotsOf(def: ReturnType<typeof getRole>, dayNumber: number): number[] {
  if (def.wakes === 'first-night' && dayNumber !== 1) return [];
  if (def.wakes !== 'every-night' && def.wakes !== 'first-night') return [];
  const set = new Set<number>();
  if (def.nightSlot != null) set.add(def.nightSlot);
  for (const ab of def.abilities) if (ab.nightSlot != null) set.add(ab.nightSlot);
  return Array.from(set);
}

/** ความสามารถนี้ยังใช้ได้อยู่ไหม (เช่น ผู้พิทักษ์ประชาชนที่กระสุนหมดแล้ว) */
export function abilityUsable(p: EnginePlayer, ab: { kind: IntentKind; uses?: number | 'unlimited' }): boolean {
  if (ab.kind === 'vigilante_shot') return Number(p.roleState.shots) > 0;
  if (ab.kind === 'alpha_convert') return p.roleState.alphaUsed !== true;
  if (ab.kind === 'infect') return p.roleState.infectUsed !== true;
  return true;
}

/** คืนนี้ผู้เล่นคนนี้มีอะไรให้ทำในช่องนี้จริงไหม — ถ้าไม่มี จะไม่ถูกนับว่าต้องรอ (บทที่ตื่นมาดูหน้ากันเฉยๆ ยังนับว่าต้องตื่น) */
function canActInSlot(p: EnginePlayer, slot: number): boolean {
  const def = actingDef(p);
  const here = def.abilities.filter((ab) => (ab.nightSlot ?? def.nightSlot) === slot);
  if (here.length === 0) return true; // บทที่ตื่นแบบไม่ต้องเลือก (ช่างก่อสร้าง/สมุน)
  return here.some((ab) => abilityUsable(p, ab));
}

/** คีย์ "ทำแล้วหรือยัง" — ผูกกับช่องด้วย เพื่อให้บทที่ตื่น 2 ช่องในคืนเดียวทำแต่ละช่องแยกกันได้ */
export function actedKey(playerId: string, slot: number): string {
  return `${playerId}@${slot}`;
}

/** นักเลียนแบบ: ใส่ตัวเองเข้าช่องตื่นของบทที่ยืมมา (ใช้ความสามารถนั้นพร้อมคนอื่นในคืนเดียวกัน) */
function injectBorrowed(s: GameState, slots: NightSlot[]): void {
  for (const p of s.players) {
    if (!p.alive || typeof p.roleState.borrowedRole !== 'string') continue;
    const bd = getRole(p.roleState.borrowedRole);
    for (const slotNum of wakeSlotsOf(bd, s.dayNumber)) {
      let slot = slots.find((x) => x.slot === slotNum);
      if (!slot) {
        slot = { slot: slotNum, roleIds: [bd.id], actors: [], idle: true, auto: false };
        slots.push(slot);
        slots.sort((a, b) => a.slot - b.slot);
      }
      if (!slot.actors.includes(p.id) && canActInSlot(p, slotNum)) {
        slot.actors.push(p.id);
        slot.idle = false;
      }
    }
  }
}

export function startNight(s: GameState, events: GameEvent[]): void {
  s.dayNumber += 1;
  s.phase = 'night';
  s.tonightDeaths = [];
  // หญิงชรา: คืนสิทธิ์โหวตที่ถูกห้ามเมื่อพ้นวัน
  for (const p of s.players) {
    if (p.roleState.hagMuted === true) { p.roleState.hagMuted = false; if (p.alive) p.canVote = true; }
  }
  s.nominations = {};
  s.nominationOrder = [];
  s.candidates = [];
  s.votes = {};
  s.voteRound = 1;
  s.lastExecution = null;

  const roleIds = Array.from(new Set(s.players.map((p) => p.roleId)));
  const bySlot = new Map<number, string[]>();
  for (const id of roleIds) {
    const def = getRole(id);
    for (const slot of wakeSlotsOf(def, s.dayNumber)) {
      bySlot.set(slot, [...(bySlot.get(slot) ?? []), id]);
    }
  }
  const slots: NightSlot[] = Array.from(bySlot.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([slot, ids]) => {
      const actors = s.players.filter((p) => p.alive && ids.includes(p.roleId) && canActInSlot(p, slot)).map((p) => p.id);
      return {
        slot,
        roleIds: ids,
        actors,
        idle: actors.length === 0,
        auto: ids.every((i) => getRole(i).autoAck === true),
      };
    });

  injectBorrowed(s, slots);

  s.voteVeiled = false;
  s.night = { slots, intents: [], wolfVotes: {}, acted: {}, wolfTarget: null, veilBy: [] };
  events.push(ev(s, 'night_start', true, { day: s.dayNumber }));
}

// ---------------------------------------------------------------- เป้าหมายที่ทำได้
export function legalTargets(s: GameState, actor: EnginePlayer, kind: IntentKind): string[] {
  const def = actingDef(actor);
  const ab = def.abilities.find((a) => a.kind === kind);
  if (!ab) return [];
  let selfOk = ab.canTargetSelf;
  if (kind === 'protect_doctor') selfOk = s.settings.doctorSelfProtect;
  if (kind === 'cupid_pair') selfOk = s.settings.cupidSelf;

  return s.players
    .filter((p) => {
      if (!ab.canTargetDead && !p.alive) return false;
      if (p.id === actor.id && !selfOk) return false;
      if (kind === 'wolf_bite' && p.team === 'wolf') return false; // ห้ามกัดหมาป่าด้วยกัน
      if (kind === 'protect_doctor' && s.settings.doctorNoRepeat && actor.roleState.lastProtected === p.id) return false;
      if (kind === 'protect_priest' && actor.roleState.lastProtected === p.id) return false; // นักบวชห้ามคนเดิมซ้ำเสมอ
      if (kind === 'inspect_grave' && p.alive) return false; // ผู้ดูแลสุสานอ่านได้เฉพาะศพ
      if (kind === 'alpha_convert' && p.team !== 'village') return false; // อัลฟ่าเปลี่ยนได้เฉพาะคนฝ่ายหมู่บ้าน
      if (kind === 'cult_recruit' && p.team !== 'village') return false; // ผู้นำลัทธิชักชวนได้เฉพาะคนฝ่ายหมู่บ้าน
      if (kind === 'vampire_bite' && p.team === 'vampire') return false; // กัดแวมไพร์ด้วยกันไม่ได้
      if (kind === 'hunt_wolf' && s.players.some((x) => x.alive && x.team === 'wolf') && p.team !== 'wolf') return false; // ยังมีหมาป่าเหลือ → ฆ่าได้เฉพาะหมาป่า
      return true;
    })
    .map((p) => p.id);
}

/** ตัวเลือกยาของแม่มด (ใช้ทั้งตรวจแอคชันและทำปุ่มบนหน้าจอ) */
/** กลางคืนทำพร้อมกัน → แม่มดไม่รู้ว่าใครโดนกัด: ชุบได้ด้วยการ "เลือกคนที่จะช่วย" (ยาหมดไปทันทีที่ใช้) */
export function witchOptions(s: GameState, w: EnginePlayer): { canHeal: boolean; healTargets: string[]; poisonTargets: string[] } {
  const healTargets = Number(w.roleState.heal) > 0
    ? s.players.filter((p) => p.alive && (s.settings.witchSelfHeal || p.id !== w.id)).map((p) => p.id)
    : [];
  const poisonTargets = Number(w.roleState.poison) > 0
    ? s.players.filter((p) => p.alive && p.id !== w.id).map((p) => p.id)
    : [];
  return { canHeal: healTargets.length > 0, healTargets, poisonTargets };
}

// ---------------------------------------------------------------- รับแอคชันกลางคืน
export function applyNightAction(s: GameState, a: NightAction, events: GameEvent[]): EngineError | undefined {
  const n = s.night;
  if (s.phase !== 'night' || !n) return err('wrong_phase', 'ตอนนี้ไม่ใช่เวลากลางคืน');
  const actor = player(s, a.actorId);
  if (!actor) return err('no_player', 'ไม่พบผู้เล่น');
  if (!actor.alive) return err('dead', 'ผู้ที่ตายแล้วใช้ความสามารถไม่ได้');
  const def = actingDef(actor);
  // กลางคืนทำพร้อมกัน: ข้าม = ข้ามความสามารถที่ค้างอยู่อันแรก · อย่างอื่น = หาช่องจากชนิดความสามารถ
  let slot: NightSlot | null | undefined;
  if (a.kind === 'skip') {
    slot = pendingSlotFor(s, actor.id);
    if (!slot) return err('not_your_turn', 'คืนนี้คุณไม่มีอะไรต้องทำแล้ว');
  } else {
    const abx = def.abilities.find((x) => x.kind === a.kind);
    if (!abx) return err('not_your_role', 'บทของคุณใช้ความสามารถนี้ไม่ได้');
    const slotNum = abx.nightSlot ?? def.nightSlot;
    slot = n.slots.find((sl) => sl.slot === slotNum);
    if (!slot || !slot.actors.includes(actor.id)) return err('not_your_turn', 'คืนนี้คุณใช้ความสามารถนี้ไม่ได้');
  }
  if (slot.auto) return err('no_action', 'ช่องนี้ไม่ต้องเลือกอะไร');
  const key = actedKey(actor.id, slot.slot);
  if (n.acted[key]) return err('already_acted', 'คุณส่งคำสั่งของช่องนี้ไปแล้ว');

  if (a.kind === 'skip') {
    n.acted[key] = true;
    // ข้ามช่องกัดของฝูง (ไม่ใช่ช่องอื่นที่บทเดียวกันตื่นด้วย เช่น หมาป่าผู้หยุดความสามารถที่ช่อง 11)
    const biteAb = def.abilities.find((x) => x.kind === 'wolf_bite');
    const biteSlot = biteAb ? (biteAb.nightSlot ?? def.nightSlot) : null;
    if (biteAb !== undefined && biteSlot === slot.slot) n.wolfVotes[actor.id] = null;
    events.push(ev(s, 'skip', false, { actorId: actor.id }));
    return undefined;
  }

  const ab = def.abilities.find((x) => x.kind === a.kind);
  if (!ab) return err('not_your_role', 'บทของคุณใช้ความสามารถนี้ไม่ได้');
  if (a.kind === 'vigilante_shot' && Number(actor.roleState.shots) <= 0) return err('no_ammo', 'คุณใช้กระสุนหมดแล้ว');

  const targets = a.targets ?? [];

  // ---- แม่มด: ใช้ meta { heal, poisonId }
  if (a.kind === 'witch') {
    const opt = witchOptions(s, actor);
    const healId = typeof a.meta?.healId === 'string' ? (a.meta.healId as string) : null;
    const poisonId = typeof a.meta?.poisonId === 'string' ? (a.meta.poisonId as string) : null;
    if (healId && !opt.canHeal) return err('no_heal', 'ใช้ยาชุบชีวิตไม่ได้ในตอนนี้');
    if (healId && !opt.healTargets.includes(healId)) return err('bad_heal', 'ช่วยคนนี้ด้วยยาชุบชีวิตไม่ได้');
    if (poisonId && !opt.poisonTargets.includes(poisonId)) return err('bad_poison', 'วางยาพิษคนนี้ไม่ได้');
    if (healId && poisonId && !s.settings.witchBothSameNight) return err('both_potions', 'ใช้ยาสองชนิดในคืนเดียวกันไม่ได้');
    n.acted[key] = true;
    if (!healId && !poisonId) return undefined; // ไม่ใช้ยา = ข้าม
    n.intents.push({ actorId: actor.id, roleId: actor.roleId, slot: slot.slot, kind: 'witch', targets: poisonId ? [poisonId] : [], meta: { healId, poisonId } });
    return undefined;
  }

  // ---- บทอื่น: ตรวจจำนวนและความถูกต้องของเป้าหมาย
  if (targets.length !== ab.targets) return err('bad_target_count', `ต้องเลือกเป้าหมาย ${ab.targets} คน`);
  if (new Set(targets).size !== targets.length) return err('dup_target', 'เลือกคนซ้ำกันไม่ได้');
  const legal = legalTargets(s, actor, a.kind);
  for (const t of targets) {
    if (!legal.includes(t)) return err('bad_target', 'เป้าหมายนี้ไม่ถูกต้องตามกติกา');
  }

  // ---- ผู้ลอกเลียนแบบ: มีผลทันที — กลายเป็นบทของเป้าหมาย และแทรกตัวเองเข้าช่องตื่นของบทนั้น (ใช้ความสามารถคืนแรกได้เลยถ้ามี)
  if (a.kind === 'copy_role') {
    const targetId = targets[0];
    const target = mustPlayer(s, targetId);
    const targetDef = getRole(target.roleId);
    actor.roleId = target.roleId;
    actor.team = target.team;
    actor.winWith = target.winWith;
    actor.roleState = targetDef.initRoleState ? targetDef.initRoleState() : {};
    const slotsToJoin = new Set<number>();
    if (targetDef.nightSlot != null) slotsToJoin.add(targetDef.nightSlot);
    for (const copiedAb of targetDef.abilities) if (copiedAb.nightSlot != null) slotsToJoin.add(copiedAb.nightSlot);
    for (const slotNum of slotsToJoin) {
      const slotObj = n.slots.find((sl) => sl.slot === slotNum);
      if (slotObj && !slotObj.actors.includes(actor.id)) {
        slotObj.actors.push(actor.id);
        slotObj.idle = false;
      }
    }
    n.acted[key] = true;
    (s.privateLog[actor.id] ??= []).push({ kind: 'copied', day: s.dayNumber, roleId: target.roleId });
    events.push(ev(s, 'copied', false, { actorId: actor.id, roleId: target.roleId }));
    return undefined;
  }

  // ---- คิวปิด: มีผลทันที (ช่องคืนแรกก่อนผู้ขัดขวาง) — คู่รักเห็นหน้ากัน
  if (a.kind === 'cupid_pair') {
    const [x, y] = targets;
    const px = mustPlayer(s, x);
    const py = mustPlayer(s, y);
    px.loverOf = y;
    py.loverOf = x;
    s.loverPairs.push([x, y]);
    (s.privateLog[x] ??= []).push({ kind: 'lover', day: s.dayNumber, loverId: y });
    (s.privateLog[y] ??= []).push({ kind: 'lover', day: s.dayNumber, loverId: x });
    n.acted[key] = true;
    events.push(ev(s, 'cupid_pair', false, { actorId: actor.id, lovers: [x, y] }));
    return undefined;
  }

  // ---- ฝูงหมาป่า: เก็บเสียงของแต่ละตัว รวมตอนปิดช่อง
  if (a.kind === 'wolf_bite') {
    // หมาป่าผู้บดบัง: ติ๊ก meta.veil = บดบังโหวตวันถัดไป (ใช้ได้ตามจำนวนที่เหลือ)
    if (a.meta?.veil === true) {
      if (!canVeil(actor)) return err('no_veil', 'คุณใช้การบดบังโหวตไม่ได้ (ไม่ใช่บทนี้ หรือใช้ครบแล้ว)');
      n.veilBy.push(actor.id);
    }
    n.wolfVotes[actor.id] = targets[0];
    n.acted[key] = true;
    return undefined;
  }

  if (a.kind === 'predict') {
    const team = a.meta?.team;
    if (team !== 'village' && team !== 'wolf' && team !== 'solo') return err('bad_prediction', 'ต้องทายฝ่าย หมู่บ้าน/หมาป่า/อิสระ เท่านั้น');
  }

  const intent: Intent = { actorId: actor.id, roleId: actor.roleId, slot: slot.slot, kind: a.kind, targets, meta: a.meta ?? {} };
  n.intents.push(intent);
  n.acted[key] = true;
  return undefined;
}

// ---------------------------------------------------------------- ปิดช่อง / เดินช่อง
/** ช่องนี้เป็นช่อง "กัด" ของฝูงจริงหรือไม่ (ต่างจากช่องอื่นที่บทในฝูงอาจตื่นด้วย เช่น หมาป่าผู้หยุดความสามารถ) */
function isBiteSlot(slot: NightSlot): boolean {
  return slot.roleIds.some((r) => {
    if (!isPackRole(r)) return false;
    const def = getRole(r);
    const ab = def.abilities.find((x) => x.kind === 'wolf_bite');
    return ab && (ab.nightSlot ?? def.nightSlot) === slot.slot;
  });
}

/** จบคืน: รวมเสียงโหวตของฝูงเป็นเหยื่อเดียว (ทุกคนส่งพร้อมกันแล้ว) ก่อนเข้าท่อประมวลผล */
function finalizeWolves(s: GameState, events: GameEvent[]): void {
  const n = s.night!;
  const biteSlot = n.slots.find(isBiteSlot);
  if (!biteSlot) return;
  const slotNo = biteSlot.slot;

  // หมาป่าแพร่เชื้อเลือก "แพร่เชื้อแทนฆ่า" คืนนี้ → ฝูงไม่มีใครตายจากการกัดคืนนี้เลย
  const infected = n.intents.some((i) => i.kind === 'infect');

  const blockedNow = computeBlocked(n.intents); // หมาป่าที่ถูกขัดขวางไม่ได้ร่วมเลือกเหยื่อ
  const votes = Object.entries(n.wolfVotes).sort(([x], [y]) => (x < y ? -1 : x > y ? 1 : 0)).filter(([voter, v]) => typeof v === 'string' && !blockedNow.has(voter)).map(([, v]) => v as string);
  let target: string | null = null;
  if (!infected && votes.length > 0) {
    const uniq = Array.from(new Set(votes));
    if (uniq.length === 1) target = uniq[0];
    else if (s.settings.wolfDisagree === 'random') target = votes[Math.floor(nextRand(s) * votes.length)];
  }
  if (s.dayNumber === 1 && !s.settings.firstNightKill) target = null;
  n.wolfTarget = target;
  if (target) {
    n.intents.push({ actorId: 'wolves', roleId: 'werewolf', slot: slotNo, kind: 'wolf_bite', targets: [target], meta: { votes: n.wolfVotes } });
    // ลูกหมาป่าตายไปแล้ว → ฝูงฆ่าเพิ่มอีก 1 คน (🔸A27: คนถัดไปที่มีหมาป่าอย่างน้อย 1 ตัวเลือก)
    if (s.packExtraKill) {
      const alt = votes.find((v) => v !== target);
      if (alt) n.intents.push({ actorId: 'wolves_cub', roleId: 'werewolf', slot: slotNo, kind: 'wolf_bite_extra', targets: [alt], meta: {} });
      s.packExtraKill = false;
    }
  }
  events.push(ev(s, 'wolf_decision', false, { target, votes: n.wolfVotes, infected }));
}

/** จบคืนเมื่อทุกคนส่งแอคชันครบ (หรือหมดเวลา) → ประมวลผลทั้งคืนทีเดียว */
export function advanceNight(s: GameState, timedOut: boolean, events: GameEvent[]): void {
  if (!s.night) return;
  if (!nightDone(s) && !timedOut) return;
  finalizeWolves(s, events);
  resolveNight(s, events);
  s.night = null;
}

export function aliveCount(s: GameState): number {
  return alivePlayers(s).length;
}
