import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { LeaderboardView } from '../LeaderboardView';
import { getLeaderboard } from '../../games/werewolf/net/community';
import type { LeaderboardRow } from '../../games/werewolf/net/community';
import { Avatar, Glass, SectionTitle, pill } from './ui';

interface Props {
  username: string;
  isDark: boolean;
  onTap?: () => void;
}

const MEDAL = ['🥇', '🥈', '🥉'];

/** อันดับ: คะแนนข้อสอบ (ระบบเดิม) และเลเวลแววูฟ */
export const RankingSection: React.FC<Props> = ({ username, isDark, onTap }) => {
  const [tab, setTab] = useState<'werewolf' | 'exam'>('werewolf');
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (tab !== 'werewolf') return;
    let alive = true;
    void getLeaderboard().then((r) => {
      if (!alive) return;
      if (r.ok) { setRows(r.data.rows); setError(false); } else setError(true);
    });
    return () => { alive = false; };
  }, [tab]);

  const strong = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-4">
      <SectionTitle isDark={isDark} icon="🏆" title="อันดับ" hint="ใครเก่งสุดในชุมชนของเรา" />
      <div className="flex gap-2" role="tablist">
        <button role="tab" aria-selected={tab === 'werewolf'} className={pill(isDark, tab === 'werewolf')} onClick={() => { onTap?.(); setTab('werewolf'); }}>🐺 แววูฟ</button>
        <button role="tab" aria-selected={tab === 'exam'} className={pill(isDark, tab === 'exam')} onClick={() => { onTap?.(); setTab('exam'); }}>📚 ข้อสอบ</button>
      </div>

      {tab === 'werewolf' ? (
        <Glass isDark={isDark} className="p-3 sm:p-5">
          {rows === null && !error && <div className="flex justify-center py-10"><Loader2 className={`w-6 h-6 animate-spin ${muted}`} /></div>}
          {error && <p className={`text-sm text-center py-10 ${muted}`}>โหลดอันดับไม่ได้ในตอนนี้ ลองใหม่อีกครั้ง</p>}
          {rows && rows.length === 0 && (
            <div className="text-center py-10 space-y-2"><div className="text-4xl">🐺</div><p className={`font-bold ${strong}`}>ยังไม่มีอันดับ</p><p className={`text-sm ${muted}`}>เล่นแววูฟให้จบสักเกมเพื่อขึ้นอันดับแรก!</p></div>
          )}
          {rows && rows.length > 0 && (
            <ol className="space-y-2">
              {rows.map((r) => {
                const me = r.username.toLowerCase() === username.toLowerCase();
                return (
                  <li key={r.username} className={`flex items-center gap-3 p-3 rounded-2xl ${me ? 'bg-cyan-500/15 ring-1 ring-cyan-400/40' : isDark ? 'bg-white/[0.04]' : 'bg-white/70'}`}>
                    <span className={`w-9 text-center font-black text-lg ${r.rank <= 3 ? '' : muted}`}>{MEDAL[r.rank - 1] ?? r.rank}</span>
                    <Avatar username={r.username} size={42} />
                    <div className="min-w-0 flex-1">
                      <div className={`font-black truncate ${strong}`}>{r.username}{me && <span className="ml-1.5 text-[11px] text-cyan-300">(คุณ)</span>}</div>
                      <div className={`text-xs truncate ${muted}`}>{r.title}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-amber-400">Lv.{r.level}</div>
                      <div className={`text-[11px] ${muted}`}>{r.xp.toLocaleString()} XP · ชนะ {r.wins}/{r.games}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Glass>
      ) : (
        <LeaderboardView currentUsername={username} theme={isDark ? 'dark' : 'light'} onPlayTap={onTap} />
      )}
    </div>
  );
};
