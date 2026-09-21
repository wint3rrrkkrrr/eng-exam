import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Crown, RotateCcw, Home } from 'lucide-react';
import { cheeseGame, CheeseVote } from '../../../utils/cheeseGameClient';
import { triggerConfetti } from '../../../utils/confetti';
import { CheesePhaseProps } from './types';

const ROLE_LABEL: Record<string, string> = {
  thief: '🦹 หนูจิ๊ด',
  accomplice: '🕵️ ลูกสมุนหนูจิ๊ด',
  mouse: '🐭 หนูบริสุทธิ์',
};

export const CheeseEndedPhase: React.FC<CheesePhaseProps> = ({ room, players, isDark, isHost, roomCode, refresh, onBackToHome }) => {
  const miceWon = room.winner === 'mice';
  const [votes, setVotes] = useState<CheeseVote[]>([]);

  useEffect(() => {
    if (miceWon) triggerConfetti();
    cheeseGame.getVotes(roomCode, room.vote_round).then(setVotes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRestart = async () => {
    await cheeseGame.restartToLobby(roomCode);
    refresh();
  };

  return (
    <div className={`min-h-screen px-4 py-10 ${isDark ? 'bg-[#0b0c16] text-zinc-100' : 'bg-indigo-50 text-stone-900'}`}>
      <div className="max-w-lg mx-auto space-y-6 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 12 }}
        >
          <div className="text-7xl mb-2">{miceWon ? '🎉🐭' : '🧀🦹'}</div>
          <h1 className={`text-2xl sm:text-3xl font-black ${miceWon ? 'text-emerald-400' : 'text-rose-400'}`}>
            {miceWon ? 'ฝ่ายหนูบริสุทธิ์ชนะ!' : 'ฝ่ายหนูจิ๊ดชนะ!'}
          </h1>
          <p className={`text-xs mt-1 font-medium ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
            {miceWon ? 'จับหนูจิ๊ดได้สำเร็จ! 🎊' : 'โหวตผิดตัว หนูจิ๊ดรอดไป...'}
          </p>
        </motion.div>

        {/* Revealed roles */}
        <div className={`rounded-3xl border p-4 space-y-2 shadow-xl ${isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-stone-200'}`}>
          <p className="text-xs font-black text-amber-400 mb-1">เฉลยบทบาททั้งหมด</p>
          {players.map((p, i) => (
            <motion.div
              key={p.username}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-center justify-between gap-2 p-2.5 rounded-2xl ${
                room.revealed_usernames.includes(p.username)
                  ? 'bg-amber-500/10 ring-1 ring-amber-400/40'
                  : isDark ? 'bg-zinc-800/40' : 'bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={p.avatar} alt={p.username} className="w-8 h-8 rounded-full object-cover ring-2 ring-zinc-700 shrink-0" />
                <span className="font-bold text-sm truncate">{p.username}</span>
                {p.is_host && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              </div>
              <span className={`text-xs font-black shrink-0 ${
                p.role === 'thief' ? 'text-rose-400' : p.role === 'accomplice' ? 'text-orange-400' : 'text-blue-300'
              }`}>
                {ROLE_LABEL[p.role || 'mouse']}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Vote summary */}
        {votes.length > 0 && (() => {
          const tally: Record<string, number> = {};
          votes.forEach(v => { tally[v.target] = (tally[v.target] || 0) + 1; });
          const maxVotes = Math.max(...Object.values(tally));
          const topTargets = Object.entries(tally).sort((a, b) => b[1] - a[1]);
          return (
            <div className={`rounded-3xl border p-4 space-y-3 shadow-xl ${isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-stone-200'}`}>
              <p className="text-xs font-black text-amber-400">ผลการโหวต</p>
              {/* Bar per target */}
              <div className="space-y-1.5">
                {topTargets.map(([target, count]) => {
                  const isTop = count === maxVotes;
                  const targetPlayer = players.find(p => p.username === target);
                  return (
                    <div key={target} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className={isTop ? 'text-rose-300' : isDark ? 'text-zinc-300' : 'text-stone-700'}>{target}</span>
                        <span className={isTop ? 'text-rose-400 font-black' : isDark ? 'text-zinc-500' : 'text-stone-500'}>
                          {count} โหวต {targetPlayer?.role === 'thief' ? '😈' : targetPlayer?.role === 'accomplice' ? '🕵️' : '🐭'}
                        </span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-stone-100'}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / votes.length) * 100}%` }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          className={`h-full rounded-full ${isTop ? 'bg-rose-500' : 'bg-zinc-600'}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Who voted for whom */}
              <details className="text-[10px]">
                <summary className={`cursor-pointer font-bold ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-stone-400 hover:text-stone-600'}`}>
                  ดูว่าใครโหวตใคร ▾
                </summary>
                <div className="mt-2 space-y-1">
                  {votes.map(v => (
                    <div key={v.voter} className={`flex items-center gap-1 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                      <span className="font-bold">{v.voter}</span>
                      <span className="text-zinc-600">→</span>
                      <span className={`font-bold ${v.target === topTargets[0]?.[0] ? 'text-rose-400' : ''}`}>{v.target}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          );
        })()}

        <div className="space-y-2">
          {isHost ? (
            <button
              onClick={handleRestart}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-zinc-950 shadow-lg active:scale-95 transition"
            >
              <RotateCcw className="w-4 h-4" />
              เล่นรอบใหม่ (ห้องเดิม)
            </button>
          ) : (
            <p className={`text-xs font-bold ${isDark ? 'text-zinc-500' : 'text-stone-500'}`}>รอเจ้าของห้องเริ่มรอบใหม่...</p>
          )}
          <button
            onClick={onBackToHome}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl font-bold text-xs border transition active:scale-95 ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-stone-200 text-stone-500'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            กลับหน้าแรก
          </button>
        </div>
      </div>
    </div>
  );
};
