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

      // poll skip votes
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

  // host drives bots: auto skip-discussion after short delay
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

  return (
    <div className={`min-h-screen px-4 py-6 ${isDark ? 'bg-gradient-to-b from-amber-950/40 via-[#0b0c16] to-[#0b0c16] text-zinc-100' : 'bg-gradient-to-b from-amber-100 to-indigo-50 text-stone-900'}`}>
      <div className="max-w-2xl mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <Sun className="w-12 h-12 text-amber-400 mx-auto" />
          </motion.div>
          <h1 className="text-2xl font-black">🧀 เช้าแล้ว! ชีสหายไปแล้ว!</h1>
          <p className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
            ถกเถียงหาตัวหนูจิ๊ดกันได้เลย — ใครตื่นกี่โมง ใครเห็นอะไรบ้าง?
          </p>
        </motion.div>

        {/* Countdown timer */}
        <div className={`mx-auto w-fit px-5 py-2 rounded-2xl font-black text-lg border ${
          secondsLeft <= 20 ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 animate-pulse' : isDark ? 'bg-zinc-900/70 border-zinc-800 text-amber-400' : 'bg-white border-stone-200 text-amber-600'
        }`}>
          ⏱️ {mins}:{secs.toString().padStart(2, '0')}
        </div>

        {/* Player roster — dice hour / role stay secret, only your own shows */}
        <div className="flex flex-wrap justify-center gap-2">
          {players.map(p => {
            const isSelf = p.username.toLowerCase() === username.toLowerCase();
            return (
              <div key={p.username} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200'}`}>
                <img src={p.avatar} alt={p.username} className="w-5 h-5 rounded-full object-cover" />
                <span className="text-[11px] font-bold">{p.username}</span>
                {isSelf && p.dice_hour && (
                  <span className="text-[9px] text-amber-400 font-bold">(คุณตื่น{formatNightHour(p.dice_hour)})</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Discussion chat */}
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs font-black px-1">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            วงถกเถียง (ทุกคนเห็น)
          </p>
          <CheeseChatPanel roomCode={roomCode} channel="main" username={username} avatar={avatar} isDark={isDark} heightClass="h-64" placeholder="พิมพ์ข้อความถกเถียง..." />
        </div>

        {/* Skip discussion: majority vote by all players */}
        <button
          disabled={skipVoted}
          onClick={async () => {
            await cheeseGame.logSkipDayVote(roomCode, username);
            setSkipVoted(true);
          }}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition active:scale-95 ${
            skipVoted
              ? isDark ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              : isDark ? 'bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:border-amber-400/40' : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-400'
          }`}
        >
          <SkipForward className="w-4 h-4" />
          {skipVoted
            ? `✅ คุณโหวตข้ามแล้ว (${skipVoteCount}/${skipNeeded} คน)`
            : `ข้ามการพูดคุย (${skipVoteCount}/${skipNeeded} คน)`}
        </button>
      </div>
    </div>
  );
};
