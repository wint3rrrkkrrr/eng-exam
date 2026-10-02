// components/guidance.ts — "ตอนนี้เกิดอะไรขึ้น / ต้องทำอะไร" (ฟังก์ชันล้วน แยกจากหน้าจอเพื่อทดสอบได้)
// หลักคิด: ผู้เล่นมือใหม่ต้องรู้ใน 1 วินาทีว่า (1) อยู่ช่วงไหน (2) ถึงตาตัวเองไหม ต้องกดอะไร (3) รออะไรอยู่ (4) เมื่อกี้เกิดอะไรขึ้น
import type { MyViewResponse, PublicLogEvent } from '../shared/api';
import { currentGameEvents, formatEvent } from './eventLog';

export type Tone = 'action' | 'wait' | 'info' | 'dead' | 'danger' | 'win';

export interface Guidance {
  tone: Tone;
  icon: string;
  title: string;
  body?: string;
  /** แถบความคืบหน้า เช่น เสนอชื่อแล้ว 3/7 */
  progress?: { done: number; total: number; label: string };
  /** ผลของเหตุการณ์ที่ควรอ่าน (เช่น ใครตายเมื่อคืน) */
  lines?: string[];
}

/** ขั้นตอนของหนึ่งวัน (แสดงเป็นแถบ ให้เห็นว่าตอนนี้อยู่ตรงไหนและต่อไปคืออะไร) */
export const FLOW: { phase: string; icon: string; label: string; helpTh: string }[] = [
  { phase: 'night', icon: '🌙', label: 'กลางคืน', helpTh: 'ทุกคนหลับตา ผู้ที่มีความสามารถเลือกเป้าหมายพร้อมกัน หมาป่าเลือกเหยื่อ' },
  { phase: 'morning', icon: '☀️', label: 'เช้า', helpTh: 'ประกาศว่าเมื่อคืนมีใครตายหรือไม่' },
  { phase: 'discussion', icon: '💬', label: 'อภิปราย', helpTh: 'พูดคุยหาว่าใครน่าสงสัย กล่าวหา แก้ตัว อ้างบท (โกหกได้)' },
  { phase: 'nomination', icon: '🗳️', label: 'เสนอชื่อ', helpTh: 'ทุกคนเสนอชื่อคนที่สงสัย 1 คน คนที่ถูกเสนอมากสุดเข้ารอบ' },
  { phase: 'defense', icon: '🛡️', label: 'แก้ตัว', helpTh: 'ผู้ถูกเสนอชื่อชี้แจงว่าตัวเองไม่ใช่หมาป่า' },
  { phase: 'vote', icon: '⚖️', label: 'โหวต', helpTh: 'ทุกคนโหวตกำจัด 1 คน (หรืองดออกเสียงได้)' },
  { phase: 'execution', icon: '🔨', label: 'ผลโหวต', helpTh: 'ประกาศผล คนที่ถูกโหวตมากสุดถูกกำจัด แล้วกลับสู่กลางคืน' },
];

// (vote_result ไม่รวม: บรรทัดผลโหวตยาวมากในห้องคนเยอะ — ผลสรุปอยู่ในเหตุการณ์ "ถูกกำจัด" และในแชทแล้ว)
const IMPORTANT = new Set(['morning', 'death', 'execution', 'hunter_shot', 'gunner_shot', 'game_over', 'discussion_skipped']);

export function phaseHelp(phase: string): string {
  return FLOW.find((f) => f.phase === phase)?.helpTh ?? '';
}

/** บรรทัดเหตุการณ์สำคัญล่าสุด (สูงสุด n บรรทัด) ไว้ตอบว่า "เมื่อกี้เกิดอะไรขึ้น" */
export function recentHighlights(log: PublicLogEvent[], nameOf: (id: string) => string, n = 3): string[] {
  const events = currentGameEvents(log).filter((e) => IMPORTANT.has(e.kind));
  const lines = events.flatMap((e) => formatEvent(e, { nameOf }));
  return lines.slice(-n).map((l) => (l.length > 110 ? `${l.slice(0, 107)}…` : l));
}

function lastLines(view: MyViewResponse, kind: string, nameOf: (id: string) => string): string[] {
  const events = currentGameEvents(view.log);
  const last = [...events].reverse().find((e) => e.kind === kind);
  return last ? formatEvent(last, { nameOf }) : [];
}

export interface GuidanceInput {
  view: MyViewResponse;
  nameOf: (id: string) => string;
  hunterTurn: boolean;
  gunnerTurn: boolean;
}

export function guidanceFor({ view, nameOf, hunterTurn, gunnerTurn }: GuidanceInput): Guidance {
  const game = view.game;
  if (!game) return { tone: 'info', icon: '⏳', title: 'กำลังโหลดเกม…' };
  const alive = game.me.isAlive;
  const turn = game.myTurn;
  const aliveCount = view.players.filter((p) => p.isAlive && !p.isSpectator).length;

  if (view.phase === 'game_over') {
    return { tone: 'win', icon: '🏆', title: 'จบเกมแล้ว', body: 'ดูว่าใครเป็นบทอะไรด้านล่าง แล้วกด "เล่นอีกครั้ง" ได้เลย' };
  }

  // นายพรานต้องยิง — สำคัญที่สุด แม้ตายแล้วก็ต้องยิง
  if (hunterTurn) {
    return { tone: 'danger', icon: '🔫', title: 'คุณเป็นนายพราน — เลือกคนที่จะยิงลากไปด้วย!', body: 'แตะการ์ดผู้เล่นด้านล่าง แล้วกดปุ่ม "ยิง!"' };
  }

  if (view.spectator) {
    return { tone: 'info', icon: '👀', title: 'คุณกำลังดูเกมอยู่ (ผู้ชม)', body: 'ดูได้อย่างเดียว ไม่มีผลกับเกม' };
  }

  if (!alive) {
    return { tone: 'dead', icon: '👻', title: 'คุณตายแล้ว — ดูเกมต่อได้', body: 'ห้ามบอกใบ้ให้คนที่ยังเล่นอยู่ · แชทกับผู้ตายคนอื่นได้ที่แท็บ "ผู้ตาย"' };
  }

  switch (view.phase) {
    case 'night':
      if (turn.isMyTurn) {
        return {
          tone: 'action', icon: '🌙', title: turn.promptTh ? `ถึงตาคุณ: ${turn.promptTh}` : 'ถึงตาคุณใช้ความสามารถ',
          body: 'แตะการ์ดผู้เล่นด้านล่าง แล้วกดปุ่มยืนยัน (กดข้ามได้ถ้าไม่อยากใช้) — คืนนี้ทุกคนทำพร้อมกัน ไม่ต้องรอคิว',
        };
      }
      return {
        tone: 'wait', icon: '😴', title: 'กลางคืน — คุณไม่มีอะไรต้องทำตอนนี้',
        body: 'หลับตารอเช้า · หน้าจอนี้ทุกคนเห็นเหมือนกันเพื่อไม่ให้รู้ว่าใครมีบทพิเศษ',
      };
    case 'morning': {
      const lines = lastLines(view, 'morning', nameOf);
      return { tone: lines.some((l) => !l.includes('ไม่มีผู้เสียชีวิต')) ? 'danger' : 'info', icon: '☀️', title: 'เช้าแล้ว — เมื่อคืนเกิดอะไรขึ้น?', lines: lines.length ? lines : ['กำลังประกาศผล…'], body: 'อีกสักครู่จะเข้าสู่การอภิปราย' };
    }
    case 'discussion': {
      const skip = game.skipDiscussion;
      const extra = gunnerTurn ? ' · คุณเป็นมือปืน ยิงได้ตอนนี้เลย (ปุ่มด้านล่าง)' : '';
      return {
        tone: 'info', icon: '💬', title: 'ช่วงอภิปราย — ช่วยกันหาตัวหมาป่า',
        body: `พิมพ์คุยในแชทด้านล่าง กล่าวหา แก้ตัว หรืออ้างบท (โกหกได้)${skip ? ` · คุยพอแล้วกด "โหวตข้าม" (${skip.votes}/${skip.needed})` : ''}${extra}`,
      };
    }
    case 'nomination': {
      const done = Object.keys(game.nominations).length;
      const progress = { done, total: aliveCount, label: 'เสนอชื่อแล้ว' };
      if (turn.isMyTurn) {
        return { tone: 'action', icon: '🗳️', title: 'ถึงตาคุณ: เสนอชื่อคนที่สงสัย 1 คน', body: 'แตะการ์ดผู้เล่น (เสนอตัวเองไม่ได้) แล้วกดปุ่ม "ยืนยันเสนอชื่อ"', progress };
      }
      return { tone: 'wait', icon: '✅', title: 'คุณเสนอชื่อแล้ว — รอคนอื่น', body: 'ผู้ที่ถูกเสนอมากที่สุดจะเข้ารอบแก้ตัวและโหวต', progress };
    }
    case 'defense': {
      const names = game.candidates.map(nameOf).join(', ');
      const mine = game.candidates.includes(game.me.playerId);
      return {
        tone: mine ? 'danger' : 'info', icon: '🛡️',
        title: mine ? 'คุณถูกเสนอชื่อ! แก้ตัวให้ดี' : `ฟังคำแก้ตัวของ: ${names}`,
        body: mine ? 'พิมพ์ชี้แจงในแชทด้านล่างว่าทำไมคุณไม่ใช่หมาป่า แล้วอีกสักครู่จะโหวต' : `ผู้ถูกเสนอชื่อ: ${names} · ฟังเหตุผลแล้วคิดว่าจะโหวตใคร`,
      };
    }
    case 'vote': {
      const live = game.liveVotes;
      const eligible = view.players.filter((p) => p.isAlive && p.canVote).length;
      const progress = live ? { done: Object.keys(live).length, total: eligible, label: 'โหวตแล้ว' } : undefined;
      if (!game.me.canVote) return { tone: 'wait', icon: '🔇', title: 'ครั้งนี้คุณโหวตไม่ได้', body: 'รอดูผลโหวต', progress };
      if (turn.isMyTurn) {
        return { tone: 'action', icon: '⚖️', title: 'ถึงตาคุณ: โหวตกำจัด 1 คน', body: 'แตะการ์ดผู้ถูกเสนอชื่อ แล้วกด "ยืนยันโหวต" · ไม่แน่ใจกด "งดออกเสียง" ได้', progress };
      }
      return { tone: 'wait', icon: '✅', title: 'คุณโหวตแล้ว — รอคนอื่น', body: 'เมื่อทุกคนโหวตครบหรือหมดเวลา จะประกาศผล', progress };
    }
    case 'execution': {
      const events = currentGameEvents(view.log);
      let from = 0;
      events.forEach((e, i) => { if (e.kind === 'vote_result') from = i; });
      const lines = events.slice(from).flatMap((e) => formatEvent(e, { nameOf }));
      return { tone: 'danger', icon: '⚖️', title: 'ผลการโหวต', lines: lines.length ? lines : ['กำลังนับคะแนน…'], body: 'จากนั้นกลับสู่กลางคืน' };
    }
    default:
      return { tone: 'info', icon: '⏳', title: 'กำลังเตรียมเกม…' };
  }
}
