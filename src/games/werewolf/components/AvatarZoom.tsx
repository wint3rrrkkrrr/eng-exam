import React, { useEffect } from 'react';
import { Crown, X } from 'lucide-react';
import type { LobbyPlayer } from '../shared/api';
import { parseAvatar } from '../shared/avatar';
import { AvatarArt, GraveArt } from './avatar/AvatarArt';
import { RoleIcon } from './avatar/RoleIcon';
import { ROLES } from '../engine';

interface Props {
  player: LobbyPlayer;
  isMe?: boolean;
  night: boolean;
  onClose: () => void;
}

/** ดูตัวละครของใครสักคนแบบใหญ่ๆ — ให้คนแต่งตัวสวยได้เห็นชุดตัวเอง (และเห็นชุดของเพื่อน) */
export const AvatarZoom: React.FC<Props> = ({ player, isMe, night, onClose }) => {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  const avatar = parseAvatar(player.avatar);
  const dead = !player.isAlive;
  const role = player.revealedRole ? ROLES[player.revealedRole] : null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-label={`ตัวละครของ ${player.displayName}`} onClick={onClose}>
      <div className="relative w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="ปิด" className="absolute -top-3 -right-3 z-10 w-11 h-11 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-700"><X className="w-5 h-5" /></button>
        <div className="aspect-[4/5] w-full rounded-3xl overflow-hidden border-4 border-white/70 shadow-2xl bg-sky-300">
          {dead
            ? <GraveArt backdrop={avatar.backdrop} grave={avatar.grave} role={player.revealedRole} night={night} className="w-full h-full" />
            : <AvatarArt config={avatar} night={night} className="w-full h-full" title={`ตัวละครของ ${player.displayName}`} />}
        </div>
        <div className="mt-3 rounded-2xl bg-slate-900/90 border border-slate-700 px-4 py-3 text-center text-slate-100 space-y-0.5">
          <div className="flex items-center justify-center gap-2 text-lg font-black">
            {player.isHost && <Crown className="w-4 h-4 text-amber-300" aria-label="เจ้าของห้อง" />}
            <span className="truncate">{player.seat} · {player.displayName}</span>
            {isMe && <span className="text-xs text-amber-300">(คุณ)</span>}
          </div>
          <div className={`text-sm font-bold ${dead ? 'text-red-300' : 'text-emerald-300'}`}>{dead ? '💀 ตายแล้ว' : '❤️ ยังมีชีวิต'}</div>
          {role && <div className="inline-flex items-center gap-1.5 text-sm text-slate-300"><span className="w-5 h-5 inline-block"><RoleIcon id={player.revealedRole!} className="w-full h-full" /></span>บทที่เปิดเผย: <b>{role.nameTh}</b></div>}
        </div>
      </div>
    </div>
  );
};
