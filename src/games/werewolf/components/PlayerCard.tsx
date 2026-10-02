import React from 'react';
import { Crown, WifiOff, ZoomIn } from 'lucide-react';
import type { LobbyPlayer } from '../shared/api';
import { parseAvatar } from '../shared/avatar';
import { RoleIcon } from './avatar/RoleIcon';
import { AvatarArt, GraveArt } from './avatar/AvatarArt';

export interface PlayerCardProps {
  player: LobbyPlayer;
  isMe?: boolean;
  selected?: boolean;
  selectable?: boolean; // แตะเลือกได้ตอนนี้
  dimmed?: boolean; // มีการเลือกอยู่แต่การ์ดนี้เลือกไม่ได้ → ทำให้จางลง
  onClick?: () => void;
  chip?: { text: string; tone: string } | null; // ป้ายด้านล่างการ์ด (เช่น "→ ส้ม", "ยังไม่โหวต")
  badge?: number | null; // วงกลมตัวเลขมุมขวาบน (จำนวนคนเสนอชื่อ/โหวต)
  topRight?: React.ReactNode; // ปุ่ม/ไอคอนมุมขวาบน (เช่น เชิญออก)
  offline?: boolean; // หลุดการเชื่อมต่ออยู่
  onRoleClick?: (roleId: string) => void; // แตะไอคอนบทของคนตาย → ดูข้อมูลบท
  onZoom?: () => void; // ดูตัวละครแบบใหญ่ (ปุ่มแว่นขยายมุมซ้ายล่าง · ถ้าการ์ดนี้ไม่ได้ใช้เลือกเป้าหมาย แตะที่การ์ดได้เลย)
}

/** การ์ดผู้เล่นแบบในเกมแววูฟ: อวตารเต็มการ์ด + เลขที่นั่ง/ชื่อด้านบน · ตายแล้วเป็นป้ายหลุมศพ + ไอคอนบท (แตะดูข้อมูลบทได้) */
export const PlayerCard: React.FC<PlayerCardProps> = ({
  player, isMe, selected, selectable, dimmed, onClick, chip, badge, topRight, offline, onRoleClick, onZoom,
}) => {
  const avatar = parseAvatar(player.avatar);
  const dead = !player.isAlive;

  const body = (
    <>
      {dead ? <GraveArt backdrop={avatar.backdrop} grave={avatar.grave} role={player.revealedRole} className="absolute inset-0 w-full h-full" /> : <AvatarArt config={avatar} className="absolute inset-0 w-full h-full" />}

      {/* ชื่อ + เลขที่นั่ง (เหมือนในภาพตัวอย่าง: "1 20p") */}
      <div className="absolute top-0 inset-x-0 px-1 pt-0.5 flex items-center justify-center gap-1 text-white font-black text-[11px] leading-tight [text-shadow:0_1px_2px_rgba(0,0,0,.75)]">
        <span>{player.seat}</span>
        <span className="truncate max-w-[70%]">{player.displayName}</span>
      </div>

      {onZoom && onClick && (
        <span
          role="button"
          tabIndex={0}
          aria-label={`ดูตัวละครของ ${player.displayName} ใหญ่ๆ`}
          onClick={(e) => { e.stopPropagation(); onZoom(); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onZoom(); } }}
          className="absolute bottom-1 left-1 w-7 h-7 rounded-full bg-black/55 text-white flex items-center justify-center cursor-pointer active:scale-90"
        ><ZoomIn className="w-4 h-4" /></span>
      )}
      {offline && <span className="absolute bottom-1 left-9 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center" role="img" aria-label="หลุดการเชื่อมต่อ"><WifiOff className="w-3.5 h-3.5 text-amber-300" /></span>}
      {player.isHost && <Crown className="absolute top-4 left-0.5 w-3.5 h-3.5 text-amber-300 drop-shadow" aria-label="เจ้าของห้อง" />}
      {topRight && <div className="absolute top-3 right-0">{topRight}</div>}

      {badge != null && badge > 0 && (
        <div className="absolute top-4 right-1 min-w-6 h-6 px-1 rounded-full bg-red-600 border-2 border-white text-white text-[12px] font-black flex items-center justify-center shadow" aria-label={`${badge} เสียง`}>
          {badge}
        </div>
      )}

      {/* ไอคอนบท (ตายแล้ว/ถูกเปิดเผย) — แตะเพื่อดูข้อมูลบท */}
      {player.revealedRole && (
        onRoleClick ? (
          <span
            role="button"
            tabIndex={0}
            aria-label={`ดูข้อมูลบท`}
            onClick={(e) => { e.stopPropagation(); onRoleClick(player.revealedRole!); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onRoleClick(player.revealedRole!); } }}
            className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white/95 border border-slate-300 flex items-center justify-center text-[16px] shadow cursor-pointer active:scale-90"
          >
            <RoleIcon id={player.revealedRole} className="w-[78%] h-[78%]" />
          </span>
        ) : (
          <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-white/90 border border-slate-300 flex items-center justify-center text-[13px] shadow"><RoleIcon id={player.revealedRole} className="w-[78%] h-[78%]" /></div>
        )
      )}

      {chip && (
        <div className={`absolute bottom-0 inset-x-0 px-1 py-0.5 text-center text-[10px] font-bold truncate bg-black/60 ${chip.tone}`}>{chip.text}</div>
      )}
      {isMe && <div className="absolute inset-0 rounded-lg ring-2 ring-amber-300 ring-inset pointer-events-none" />}
      {selectable && !selected && <div className="absolute inset-0 rounded-lg ring-2 ring-white/70 ring-inset pointer-events-none" />}
      {selected && <div className="absolute inset-0 rounded-lg ring-4 ring-red-500 ring-inset bg-red-500/20 pointer-events-none" />}
    </>
  );

  const cls = `relative aspect-[4/5] w-full rounded-lg overflow-hidden bg-sky-300 border border-white/30 transition-opacity ${dimmed ? 'opacity-40' : dead ? 'opacity-90' : ''}`;
  const label = `${player.seat} ${player.displayName}${dead ? ' (ตายแล้ว)' : ''}`;
  if (!onClick && onZoom) {
    // ไม่ได้ใช้เลือกเป้าหมาย → แตะการ์ดเพื่อดูตัวละครใหญ่ๆ
    return (
      <div role="button" tabIndex={0} onClick={onZoom} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onZoom(); } }} aria-label={`${label} — แตะเพื่อดูใหญ่ๆ`} className={`${cls} cursor-zoom-in`}>{body}</div>
    );
  }
  if (!onClick) return <div className={cls} aria-label={label}>{body}</div>;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      aria-pressed={selected}
      aria-label={label}
      className={`${cls} cursor-pointer active:scale-95 transition-transform`}
    >
      {body}
    </div>
  );
};

/** ตารางการ์ดผู้เล่น: คนน้อย 4 คอลัมน์ · คนเยอะเพิ่มคอลัมน์ให้การ์ดเล็กลง จะได้เห็นทุกคนโดยไม่ต้องเลื่อนยาว */
export const PlayerGrid: React.FC<{ children: React.ReactNode; count?: number }> = ({ children, count = 12 }) => (
  // คนน้อย = การ์ดใหญ่ (3 คอลัมน์) ให้เห็นชุดแต่งตัวชัดๆ · คนเยอะค่อยเพิ่มคอลัมน์
  <div className={`grid gap-2 ${count > 24 ? 'grid-cols-6' : count > 15 ? 'grid-cols-5' : count > 9 ? 'grid-cols-4' : 'grid-cols-3'}`}>{children}</div>
);
