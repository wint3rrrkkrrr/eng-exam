import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { UI } from '../text/th';
import type { Session } from '../net/werewolfClient';
import type { MyViewResponse } from '../shared/api';
import { PlayerCard, PlayerGrid } from './PlayerCard';
import { GameChatPanel } from './GameChatPanel';
import { RoleInfoModal } from './InfoModals';
import { useCountdown } from './useCountdown';

interface Props {
  view: MyViewResponse;
  session: Session;
  refresh: () => Promise<void>;
  serverNow: () => number;
}

/** หน้าจอผู้ชม: เห็นเฉพาะข้อมูลสาธารณะ (ใครเป็น/ตาย บทที่เฉลยแล้ว แชทสาธารณะ ประกาศ) — เซิร์ฟเวอร์ไม่ส่งบทของใครมาให้ */
export const SpectatorScreen: React.FC<Props> = ({ view, session, refresh, serverNow }) => {
  const [roleInfo, setRoleInfo] = useState<string | null>(null);
  const left = useCountdown(view.endsAt, serverNow);
  const players = view.players.filter((p) => !p.isSpectator);
  const spectators = view.players.filter((p) => p.isSpectator);
  const over = view.phase === 'game_over';

  return (
    <div className="space-y-4">
      {roleInfo && <RoleInfoModal roleId={roleInfo} onClose={() => setRoleInfo(null)} />}

      <div className="rounded-2xl border border-sky-500/40 bg-sky-950/40 px-4 py-3 text-sm font-bold text-sky-100 flex items-center gap-2">
        <Eye className="w-5 h-5 shrink-0" /> {UI.spectate.banner}
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400">{UI.spectate.day(view.dayNumber)}</div>
          <div className="text-base font-black">{UI.phases[view.phase] ?? view.phase}</div>
        </div>
        {left !== null && !over && <div className="text-2xl font-black tabular-nums text-amber-200" aria-live="off">{left}</div>}
      </div>

      <section aria-label={UI.game.players}>
        <PlayerGrid>
          {players.map((p) => (
            <PlayerCard key={p.playerId} player={p} offline={!p.isConnected && p.isAlive} onRoleClick={setRoleInfo} />
          ))}
        </PlayerGrid>
      </section>

      {over && <p className="rounded-xl border border-violet-500/30 bg-violet-950/30 px-4 py-3 text-sm text-violet-100">{UI.spectate.ended}</p>}

      <GameChatPanel view={view} session={session} refresh={refresh} />

      <p className="text-center text-xs text-slate-400">
        {UI.spectate.watching(spectators.length)}
      </p>
    </div>
  );
};
