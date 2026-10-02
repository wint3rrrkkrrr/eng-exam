// components/eventLog.ts — แปลง "เหตุการณ์สาธารณะ" จากเซิร์ฟเวอร์เป็นข้อความไทยสำหรับบันทึกเหตุการณ์
import { EVENT_TEXT, TH } from '../text/th';
import { ROLES } from '../engine';
import type { PublicLogEvent } from '../shared/api';

export interface LogContext {
  nameOf: (id: string) => string;
}

const roleName = (id: unknown): string | null => (typeof id === 'string' && ROLES[id] ? ROLES[id].nameTh : null);

/** เหตุการณ์ของ "เกมรอบปัจจุบัน" เท่านั้น (ตั้งแต่ game_start ล่าสุด) */
export function currentGameEvents(log: PublicLogEvent[]): PublicLogEvent[] {
  let start = 0;
  log.forEach((e, i) => { if (e.kind === 'game_start') start = i; });
  return log.slice(start);
}

/** คืนบรรทัดข้อความ (อาจมีหลายบรรทัด หรือไม่มีเลยถ้าไม่ต้องแสดง) */
export function formatEvent(e: PublicLogEvent, ctx: LogContext): string[] {
  const d = e.data as Record<string, unknown>;
  const n = (v: unknown) => (typeof v === 'string' ? ctx.nameOf(v) : '?');
  switch (e.kind) {
    case 'night_start':
      return [EVENT_TEXT.nightStart(Number(d.day ?? e.day))];
    case 'morning': {
      const deaths = (d.deaths as Record<string, unknown>[]) ?? [];
      if (deaths.length === 0) return [EVENT_TEXT.nobodyDied];
      return deaths.map((x) => EVENT_TEXT.morningDied(n(x.playerId), roleName(x.revealedRole)));
    }
    case 'death': {
      if (d.cause === 'disconnect') return [EVENT_TEXT.died(n(d.playerId), TH.cause.disconnect, roleName(d.revealedRole))]; // ประกาศทันทีทุกเฟส
      // ผู้ตายตอนกลางคืน/เช้า สรุปไว้ในเหตุการณ์ "morning" แล้ว
      if (e.phase === 'night' || e.phase === 'morning') return [];
      // ตายจากโหวต: แสดงตอนนี้ (มีบทที่เปิดเผยแล้วตามค่าตั้งค่า) ส่วนเหตุการณ์ "execution" ข้างล่างไม่แสดงซ้ำ
      if (d.cause === 'vote') return [EVENT_TEXT.executed(n(d.playerId), roleName(d.revealedRole))];
      return [EVENT_TEXT.died(n(d.playerId), TH.cause[String(d.cause)] ?? 'เสียชีวิต', roleName(d.revealedRole))];
    }
    case 'time_adjusted':
      return [EVENT_TEXT.timeAdjusted(d.direction === 'less')];
    case 'nominate':
      return [EVENT_TEXT.nominate(n(d.nominatorId), n(d.nomineeId))];
    case 'nominees':
      return [EVENT_TEXT.nominees(((d.candidates as string[]) ?? []).map((id) => ctx.nameOf(id)))];
    case 'no_nominees':
      return [EVENT_TEXT.noNominees];
    case 'vote_veiled':
      return [EVENT_TEXT.voteVeiled];
    case 'vote_result': {
      const tally = (d.tally as Record<string, number>) ?? {};
      if (d.veiled === true) return [EVENT_TEXT.voteResultVeiled(Object.keys(tally).map((id) => `${ctx.nameOf(id)} ${tally[id]}`))];
      const votes = (d.votes as Record<string, string | null>) ?? {};
      const rows = Object.keys(tally).map((id) => {
        const who = Object.entries(votes).filter(([, t]) => t === id).map(([v]) => ctx.nameOf(v));
        return `${ctx.nameOf(id)} ${tally[id]}${who.length ? ` (${who.join(', ')})` : ''}`;
      });
      const abstain = Object.entries(votes).filter(([, t]) => t === null).map(([v]) => ctx.nameOf(v));
      if (abstain.length) rows.push(`งดออกเสียง: ${abstain.join(', ')}`);
      return [EVENT_TEXT.voteResult(rows)];
    }
    case 'revote':
      return [EVENT_TEXT.revote(((d.candidates as string[]) ?? []).map((id) => ctx.nameOf(id)))];
    case 'execution': {
      const id = d.playerId as string | null;
      switch (d.outcome) {
        case 'executed': return [];
        case 'prince_survived': return [EVENT_TEXT.princeSurvived(n(id))];
        case 'idiot_survived': return [EVENT_TEXT.idiotSurvived(n(id))];
        case 'no_votes': return [EVENT_TEXT.noVotes];
        default: return [EVENT_TEXT.tie];
      }
    }
    case 'hunter_shot':
      return [EVENT_TEXT.hunterShot(n(d.hunterId), n(d.targetId))];
    case 'hunter_skipped':
      return [EVENT_TEXT.hunterSkipped(n(d.hunterId))];
    case 'game_over':
      return [EVENT_TEXT.gameOver(String((d.winners as { reasonTh?: string }[] | undefined)?.[0]?.reasonTh ?? ''))];
    default:
      return [];
  }
}
