import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { UI } from '../../text/th';
import { TH } from '../../text/th';
import { api } from '../../net/werewolfClient';
import type { Session } from '../../net/werewolfClient';
import type { MyViewResponse } from '../../shared/api';
import { useCountdown } from '../useCountdown';

interface Props {
  view: MyViewResponse;
  session: Session;
  refresh: () => Promise<void>;
  serverNow: () => number;
}

export const RoleRevealPhase: React.FC<Props> = ({ view, session, refresh, serverNow }) => {
  const game = view.game!;
  const [shown, setShown] = useState(false);
  const [ready, setReady] = useState(false);
  const left = useCountdown(view.endsAt, serverNow);

  const nameOf = (id: string) => view.players.find((p) => p.playerId === id)?.displayName ?? '?';

  const sendReady = async () => {
    setReady(true);
    await api('action', { type: 'ready' }, session);
    await refresh();
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-red-500/30 bg-slate-950/70 p-5 text-center space-y-3">
        <div className="text-xs text-slate-400">{UI.reveal.yourRole}</div>
        {shown ? (
          <>
            <div className="text-4xl font-black text-slate-50">{game.me.roleNameTh}</div>
            <div className="text-xs text-violet-300">{UI.reveal.team}: {TH.team[game.me.team] ?? game.me.team}</div>
            <p className="text-sm text-slate-300 leading-relaxed">{game.me.descriptionTh}</p>
            {game.allies.length > 0 && (
              <div className="rounded-xl bg-red-950/30 border border-red-500/30 p-3 text-sm">
                <div className="text-xs text-red-300 mb-1">{UI.reveal.alliesTitle}</div>
                {game.allies.map((a) => <div key={a.playerId} className="font-bold">{nameOf(a.playerId)}</div>)}
              </div>
            )}
          </>
        ) : (
          <div className="py-6 text-6xl select-none">🎴</div>
        )}
        <button
          onClick={() => setShown((s) => !s)}
          className="inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold cursor-pointer"
        >
          {shown ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          {shown ? 'ซ่อนบท' : 'แตะเพื่อดูบทของฉัน'}
        </button>
        <p className="text-[11px] text-amber-300">{UI.reveal.secret}</p>
      </section>

      <button
        onClick={sendReady}
        disabled={ready}
        className="w-full min-h-14 rounded-xl bg-gradient-to-r from-red-700 to-violet-700 hover:brightness-110 font-black text-lg disabled:opacity-60 cursor-pointer disabled:cursor-default"
      >
        {ready ? UI.reveal.readyDone : UI.reveal.ready}
      </button>
      {left !== null && <p className="text-center text-xs text-slate-400">{UI.reveal.countdown(left)}</p>}
    </div>
  );
};
