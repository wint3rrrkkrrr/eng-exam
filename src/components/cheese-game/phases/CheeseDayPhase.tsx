import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sun, MessageSquare, SkipForward } from 'lucide-react';
import { cheeseGame, formatNightHour, isBot } from '../../../utils/cheeseGameClient';
import { CheeseChatPanel } from '../CheeseChatPanel';
import { CheesePhaseProps } from './types';

export const CheeseDayPhase: React.FC<CheesePhaseProps> = ({ room, players, username, avatar, isDark, isHost, roomCode, refresh }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (!room.day_phase_ends_at) return room.discussion_seconds;
    return Math.max(0, Math.round((new Date(room.day_phase_ends_at).getTime() - Date.now()) / 1000));
  });
  const [skipVoted, setSkipVoted] = useState(false);
  const [skipVoteCount, setSkipVoteCount] = useState(0);
  const skipNeeded = Math.ceil(players.length / 2);

  useEffect(() => {
    let called = false;
    const interval = setInterval(async () => {
      if (!room.day_phase_ends_at) return;
      const left = Math.max(0, Math.round((new Date(room.day_phase_ends_at).getTime() - Date.now()) / 1000));
      setSecondsLeft(left);
      const skipVotes = await cheeseGame.getSkipDayVotes(roomCode);
      setSkipVoteCount(skipVotes.length);
      if (skipVotes.includes(username)) setSkipVoted(true);
      const shouldAdvance = (left <= 0 || skipVotes.length >= skipNeeded) && isHost && !called;
      if (shouldAdvance) {
        called = true;
        clearInterval(interval);
        cheeseGame.goToVoting(roomCode).then(refresh);
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.day_phase_ends_at, isHost, roomCode, skipNeeded]);

  useEffect(() => {
    if (!isHost) return;
    const bots = players.filter(p => isBot(p));
    bots.forEach((bot, i) => {
      setTimeout(() => cheeseGame.logSkipDayVote(roomCode, bot.username), 1500 + i * 400 + Math.random() * 800);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, roomCode]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isUrgent = secondsLeft <= 20;

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-6 bg-[#0d0a05] text-zinc-100">
      {/* Warm amber aurora for morning */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-60 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.15) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.12, 1], y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 70%)' }}
          animate={{ x: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
            style={{ filter: 'drop-shadow(0 0 16px rgba(245,158,11,0.7))' }}
          >
            <Sun className="w-14 h-14 text-amber-400" />
          </motion.div>
          <h1
            className="text-2xl font-black text-white"
            style={{ textShadow: '0 0 25px rgba(245,158,11,0.5)' }}
          >
            🧀 เช้าแล้ว! ชีสหายไปแล้ว!
          </h1>
          <p className="text-xs font-medium text-zinc-500">
            ถกเถียงหาตัวหนูจิ๊ดกันได้เลย — ใครตื่นกี่โมง ใครเห็นอะไรบ้าง?
          </p>
        </motion.div>

        {/* Timer */}
        <motion.div
          className="mx-auto w-fit px-6 py-2.5 rounded-2xl font-black text-xl border"
          style={isUrgent ? {
            background: 'rgba(239,68,68,0.12)',
            borderColor: 'rgba(239,68,68,0.4)',
            color: '#fca5a5',
            boxShadow: '0 0 20px rgba(239,68,68,0.2)',
          } : {
            background: 'rgba(245,158,11,0.08)',
            borderColor: 'rgba(245,158,11,0.3)',
            color: '#fbbf24',
            boxShadow: '0 0 15px rgba(245,158,11,0.1)',
          }}
          animate={isUrgent ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 0.7, repeat: Infinity }}
        >
          ⏱️ {mins}:{secs.toString().padStart(2, '0')}
        </motion.div>

        {/* Player roster */}
        <div className="flex flex-wrap justify-center gap-2">
          {players.map((p, i) => {
            const isSelf = p.username.toLowerCase() === username.toLowerCase();
            return (
              <motion.div
                key={p.username}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-white/8"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <img src={p.avatar} alt={p.username} className="w-5 h-5 rounded-full object-cover" />
                <span className="text-[11px] font-bold text-zinc-300">{p.username}</span>
                {isSelf && p.dice_hour && (
                  <span className="text-[9px] text-amber-400 font-bold">(คุณตื่น{formatNightHour(p.dice_hour)})</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Discussion chat */}
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-black px-1 text-amber-400">
            <MessageSquare className="w-4 h-4" />
            วงถกเถียง (ทุกคนเห็น)
          </p>
          <div
            className="rounded-2xl overflow-hidden border border-white/8"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <CheeseChatPanel roomCode={roomCode} channel="main" username={username} avatar={avatar} isDark={true} heightClass="h-64" placeholder="พิมพ์ข้อความถกเถียง..." />
          </div>
        </div>

        {/* Skip button */}
        <motion.button
          disabled={skipVoted}
          onClick={async () => {
            await cheeseGame.logSkipDayVote(roomCode, username);
            setSkipVoted(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm border transition"
          style={skipVoted
            ? { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', color: '#52525b' }
            : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)', color: '#a1a1aa' }
          }
          whileHover={!skipVoted ? { borderColor: 'rgba(245,158,11,0.3)', color: '#fbbf24' } : {}}
          whileTap={!skipVoted ? { scale: 0.97 } : {}}
        >
          <SkipForward className="w-4 h-4" />
          {skipVoted
            ? `✅ คุณโหวตข้ามแล้ว (${skipVoteCount}/${skipNeeded} คน)`
            : `ข้ามการพูดคุย (${skipVoteCount}/${skipNeeded} คน)`}
        </motion.button>
      </div>
    </div>
  );
};
