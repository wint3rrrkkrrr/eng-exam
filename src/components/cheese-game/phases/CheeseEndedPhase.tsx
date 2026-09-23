import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, RotateCcw, Home } from 'lucide-react';
import { cheeseGame, CheeseVote, formatNightHour } from '../../../utils/cheeseGameClient';
import { triggerConfetti } from '../../../utils/confetti';
import { AuroraBg } from '../CheeseParticles';
import { CheesePhaseProps } from './types';

const ROLE_LABEL: Record<string, string> = {
  thief: '🦹 หนูจิ๊ด',
  accomplice: '🕵️ ลูกสมุน',
  mouse: '🐭 หนูบริสุทธิ์',
};

const ROLE_COLOR: Record<string, string> = {
  thief: '#f87171',
  accomplice: '#fb923c',
  mouse: '#93c5fd',
};

export const CheeseEndedPhase: React.FC<CheesePhaseProps> = ({ room, players, isDark, isHost, roomCode, refresh, onBackToHome }) => {
  const miceWon = room.winner === 'mice';
  const thiefQuit = room.cheese_location === 'thief_quit';
  const [votes, setVotes] = useState<CheeseVote[]>([]);
  const [showVoteBreakdown, setShowVoteBreakdown] = useState(false);

  useEffect(() => {
    if (miceWon) triggerConfetti();
    cheeseGame.getVotes(roomCode, room.vote_round).then(setVotes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRestart = async () => {
    await cheeseGame.restartToLobby(roomCode);
    refresh();
  };

  const tally: Record<string, number> = {};
  votes.forEach(v => { tally[v.target] = (tally[v.target] || 0) + 1; });
  const topTargets = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const maxVotes = topTargets[0]?.[1] ?? 0;

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-10 bg-[#05060f] text-zinc-100">
      <AuroraBg />

      {/* Result-specific ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full"
          style={{ background: miceWon
            ? 'radial-gradient(ellipse, rgba(16,185,129,0.15) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(239,68,68,0.15) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-lg mx-auto space-y-6 text-center">

        {/* Winner banner */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 12 }}
          className="space-y-2"
        >
          <motion.div
            className="text-7xl select-none"
            animate={{ scale: [1, 1.1, 1], rotate: miceWon ? [0, -5, 5, 0] : [0, 3, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: `drop-shadow(0 0 20px ${miceWon ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'})` }}
          >
            {thiefQuit ? '🏃🧀' : miceWon ? '🎉🐭' : '🧀🦹'}
          </motion.div>

          <h1
            className={`text-3xl font-black ${miceWon ? 'text-emerald-300' : 'text-rose-300'}`}
            style={{ textShadow: miceWon ? '0 0 30px rgba(16,185,129,0.5)' : '0 0 30px rgba(239,68,68,0.5)' }}
          >
            {thiefQuit
              ? `หนูจิ๊ด ${room.revealed_usernames[0] || ''} หนีออกจากเกม!`
              : miceWon ? 'ฝ่ายหนูบริสุทธิ์ชนะ!' : 'ฝ่ายหนูจิ๊ดชนะ!'}
          </h1>
          <p className="text-xs font-medium text-zinc-500">
            {thiefQuit ? 'หนูจิ๊ดกดออก ฝ่ายหนูบริสุทธิ์ชนะโดยปริยาย 🎊'
              : miceWon ? 'จับหนูจิ๊ดได้สำเร็จ! 🎊'
              : 'โหวตผิดตัว หนูจิ๊ดรอดไป...'}
          </p>
        </motion.div>

        {/* Role reveal */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-white/8 p-4 space-y-2"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(10,10,25,0.85) 100%)' }}
        >
          <p className="text-xs font-black text-amber-400 mb-1">เฉลยบทบาททั้งหมด</p>
          {players.map((p, i) => (
            <motion.div
              key={p.username}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.07 }}
              className="flex items-center justify-between gap-2 p-2.5 rounded-2xl border transition"
              style={{
                background: room.revealed_usernames.includes(p.username)
                  ? 'rgba(245,158,11,0.1)'
                  : 'rgba(255,255,255,0.03)',
                borderColor: room.revealed_usernames.includes(p.username)
                  ? 'rgba(245,158,11,0.3)'
                  : 'rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={p.avatar} alt={p.username} className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 shrink-0" />
                <span className="font-bold text-sm truncate text-zinc-200">{p.username}</span>
                {p.is_host && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              </div>
              <span className="text-xs font-black shrink-0" style={{ color: ROLE_COLOR[p.role || 'mouse'] }}>
                {ROLE_LABEL[p.role || 'mouse']}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Wake time reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-3xl border border-white/8 p-4 space-y-3"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(10,10,25,0.85) 100%)' }}
        >
          <p className="text-xs font-black text-indigo-400">🌙 ใครตื่นกี่โมง</p>
          <div className="grid grid-cols-2 gap-2">
            {[...players].sort((a, b) => (a.dice_hour || 0) - (b.dice_hour || 0)).map((p, i) => (
              <motion.div
                key={p.username}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                className="flex items-center gap-2 p-2.5 rounded-2xl border"
                style={{
                  background: p.role === 'thief' ? 'rgba(239,68,68,0.08)'
                    : p.role === 'accomplice' ? 'rgba(251,146,60,0.08)'
                    : 'rgba(255,255,255,0.03)',
                  borderColor: p.role === 'thief' ? 'rgba(239,68,68,0.3)'
                    : p.role === 'accomplice' ? 'rgba(251,146,60,0.25)'
                    : 'rgba(255,255,255,0.06)',
                }}
              >
                <img src={p.avatar} alt={p.username} className="w-7 h-7 rounded-full object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-black truncate text-zinc-300">{p.username}</p>
                  <p className="text-[13px] font-black" style={{ color: ROLE_COLOR[p.role || 'mouse'] }}>
                    {p.dice_hour ? formatNightHour(p.dice_hour) : '?'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Vote summary */}
        {votes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-3xl border border-white/8 p-4 space-y-3"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(10,10,25,0.85) 100%)' }}
          >
            <p className="text-xs font-black text-amber-400">ผลการโหวต</p>
            <div className="space-y-2">
              {topTargets.map(([target, count], i) => {
                const isTop = count === maxVotes;
                const targetPlayer = players.find(p => p.username === target);
                return (
                  <motion.div
                    key={target}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.07 }}
                    className="space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className={isTop ? 'text-rose-300' : 'text-zinc-400'}>{target}</span>
                      <span className={isTop ? 'text-rose-400 font-black' : 'text-zinc-600'}>
                        {count} โหวต {targetPlayer?.role === 'thief' ? '😈' : targetPlayer?.role === 'accomplice' ? '🕵️' : '🐭'}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / votes.length) * 100}%` }}
                        transition={{ duration: 0.7, delay: 0.6 + i * 0.07 }}
                        className="h-full rounded-full"
                        style={{
                          background: isTop
                            ? 'linear-gradient(90deg, #ef4444, #f97316)'
                            : 'rgba(99,102,241,0.4)',
                          boxShadow: isTop ? '0 0 8px rgba(239,68,68,0.4)' : 'none',
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <button
              onClick={() => setShowVoteBreakdown(s => !s)}
              className="text-[10px] font-bold text-zinc-600 hover:text-zinc-400 transition"
            >
              {(room.anonymous_vote ?? false) ? 'ดูผลโหวต (ไม่เปิดเผยชื่อผู้โหวต)' : 'ดูว่าใครโหวตใคร'} {showVoteBreakdown ? '▴' : '▾'}
            </button>

            <AnimatePresence>
              {showVoteBreakdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-1"
                >
                  {votes.map((v, i) => (
                    <div key={v.voter} className="flex items-center gap-1 text-[10px]">
                      <span className="font-bold text-zinc-400">
                        {(room.anonymous_vote ?? false) ? `ผู้โหวต ${i + 1}` : v.voter}
                      </span>
                      <span className="text-zinc-700">→</span>
                      <span className={`font-bold ${v.target === topTargets[0]?.[0] ? 'text-rose-400' : 'text-zinc-500'}`}>
                        {v.target}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="space-y-2">
          {isHost ? (
            <motion.button
              onClick={handleRestart}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-zinc-950 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                boxShadow: '0 0 30px rgba(245,158,11,0.4)',
              }}
              whileHover={{ boxShadow: '0 0 45px rgba(245,158,11,0.6)' }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
              />
              <RotateCcw className="w-4 h-4 relative z-10" />
              <span className="relative z-10">เล่นรอบใหม่ (ห้องเดิม)</span>
            </motion.button>
          ) : (
            <p className="text-xs font-bold text-zinc-600">รอเจ้าของห้องเริ่มรอบใหม่...</p>
          )}
          <motion.button
            onClick={onBackToHome}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl font-bold text-xs border border-white/8 text-zinc-600 hover:text-zinc-300 hover:border-white/15 transition"
            whileTap={{ scale: 0.97 }}
          >
            <Home className="w-3.5 h-3.5" />
            กลับหน้าแรก
          </motion.button>
        </div>
      </div>
    </div>
  );
};
