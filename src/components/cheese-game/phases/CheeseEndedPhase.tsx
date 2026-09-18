import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Crown, RotateCcw, Home } from 'lucide-react';
import { cheeseGame } from '../../../utils/cheeseGameClient';
import { triggerConfetti } from '../../../utils/confetti';
import { CheesePhaseProps } from './types';

const ROLE_LABEL: Record<string, string> = {
  thief: '🦹 หนูจิ๊ด',
  accomplice: '🕵️ ลูกสมุนหนูจิ๊ด',
  mouse: '🐭 หนูบริสุทธิ์',
};

export const CheeseEndedPhase: React.FC<CheesePhaseProps> = ({ room, players, isDark, isHost, roomCode, refresh, onBackToHome }) => {
  const miceWon = room.winner === 'mice';

  useEffect(() => {
    if (miceWon) triggerConfetti();
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
