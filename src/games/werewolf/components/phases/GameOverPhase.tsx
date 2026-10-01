import React, { useState } from 'react';
import { Loader2, RotateCcw, Trophy } from 'lucide-react';
import { GAME_UI, TH } from '../../text/th';
import { api } from '../../net/werewolfClient';
import type { Session } from '../../net/werewolfClient';
import type { MyViewResponse } from '../../shared/api';
import { ROLES } from '../../engine';

interface Props {
  view: MyViewResponse;
  session: Session;
  refresh: () => Promise<void>;
}

export const GameOverPhase: React.FC<Props> = ({ view, session, refresh }) => {
  const over = view.game?.gameOver;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!over) return null;

  const nameOf = (id: string) => view.players.find((p) => p.playerId === id)?.displayName ?? '?';
  const winner = over.winners?.[0];

  const again = async () => {
    setBusy(true);
    setError(null);
    const r = await api('play-again', {}, session);
    setBusy(false);
    if (!r.ok) setError(r.errorTh);
    await refresh();
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-950/40 to-violet-950/40 p-5 text-center space-y-2">
        <Trophy className="w-10 h-10 mx-auto text-amber-300" />
        <h2 className="text-2xl font-black">{GAME_UI.gameOver.title}</h2>
        {winner && (
          <>
            <div className="text-sm text-slate-300">{GAME_UI.gameOver.winners}: <span className="font-black text-amber-200">{GAME_UI.gameOver.teams[winner.team] ?? winner.team}</span></div>
            <p className="text-xs text-slate-400">{winner.reasonTh}</p>
            {winner.playerIds.length > 0 && <p className="text-xs text-slate-300">{winner.playerIds.map(nameOf).join(', ')}</p>}
          </>
        )}
      </section>

      {view.reward ? (
        <section className="rounded-2xl border border-amber-400/40 bg-amber-950/30 p-4 text-center space-y-1" role="status">
          <div className="text-2xl font-black text-amber-200">🪙 +{view.reward.total} เหรียญ</div>
          <div className="text-xs text-amber-100/80">
            เล่นจบ +{view.reward.play}{view.reward.win > 0 ? ` · ชนะ +${view.reward.win}` : ''}{view.reward.survive > 0 ? ` · รอดชีวิต +${view.reward.survive}` : ''}
          </div>
          <div className="text-[11px] text-slate-400">เอาไปซื้อของแต่งตัวได้ที่ "แต่งตัว / ร้านค้า" ในล็อบบี้</div>
        </section>
      ) : (
        <p className="rounded-xl border border-slate-700/60 bg-slate-950/40 px-4 py-3 text-center text-[11px] text-slate-400">
          อยากสะสมเหรียญไปซื้อของแต่งตัว? เปิด "แต่งตัว / ร้านค้า" ในล็อบบี้เพื่อสร้างกระเป๋าก่อนเริ่มเกมรอบหน้า
        </p>
      )}

      <section className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4 space-y-2">
        <h3 className="text-sm font-black">{GAME_UI.gameOver.roles}</h3>
        {over.allRoles.map((r) => (
          <div key={r.playerId} className="flex items-center justify-between gap-3 rounded-xl bg-slate-900/60 px-3 min-h-12 text-sm">
            <span className="truncate font-semibold">{nameOf(r.playerId)}{r.playerId === view.me.playerId ? ' (คุณ)' : ''}</span>
            <span className="text-right shrink-0">
              <span className="font-black">{ROLES[r.role]?.nameTh ?? r.role}</span>
              <span className="ml-2 text-[11px] text-slate-500">{TH.team[r.team] ?? r.team}</span>
            </span>
          </div>
        ))}
      </section>

      {view.me.isHost ? (
        <>
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          <button
            onClick={again}
            disabled={busy}
            className="w-full min-h-14 rounded-xl bg-gradient-to-r from-red-700 to-violet-700 hover:brightness-110 font-black disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
            {GAME_UI.gameOver.playAgain}
          </button>
        </>
      ) : (
        <p className="rounded-xl border border-slate-700/60 bg-slate-950/50 px-4 py-4 text-center text-sm text-slate-400">{GAME_UI.gameOver.waitHost}</p>
      )}
    </div>
  );
};
