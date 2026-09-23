import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gavel, Check } from 'lucide-react';
import { cheeseGame, isBot, CheeseVote } from '../../../utils/cheeseGameClient';
import { AuroraBg } from '../CheeseParticles';
import { CheesePhaseProps } from './types';

export const CheeseVotingPhase: React.FC<CheesePhaseProps> = ({ room, players, username, isDark, isHost, roomCode, refresh }) => {
  const [myVote, setMyVote] = useState<string | null>(null);
  const [votes, setVotes] = useState<CheeseVote[]>([]);
  const [finishing, setFinishing] = useState(false);
  const [votingSecondsLeft, setVotingSecondsLeft] = useState<number | null>(() => {
    if (!room.day_phase_ends_at) return null;
    return Math.max(0, Math.round((new Date(room.day_phase_ends_at).getTime() - Date.now()) / 1000));
  });

  const loadVotes = async () => {
    const v = await cheeseGame.getVotes(roomCode, room.vote_round);
    setVotes(v);
    const mine = v.find(x => x.voter.toLowerCase() === username.toLowerCase());
    if (mine) setMyVote(mine.target);
  };

  useEffect(() => {
    loadVotes();
    const unsubscribe = cheeseGame.subscribeToRoom(roomCode, loadVotes);
    const interval = setInterval(loadVotes, 2500);
    return () => { unsubscribe(); clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, room.vote_round]);

  const allVoted = votes.length >= players.length;

  useEffect(() => {
    if (allVoted && isHost && !finishing) {
      setFinishing(true);
      cheeseGame.finishVoting(roomCode).then(refresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allVoted, isHost]);

  useEffect(() => {
    if (!room.day_phase_ends_at) return;
    const endsAt = new Date(room.day_phase_ends_at).getTime();
    const tick = () => {
      const left = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setVotingSecondsLeft(left);
      if (left <= 0 && isHost && !finishing) {
        setFinishing(true);
        cheeseGame.finishVoting(roomCode).then(refresh);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.day_phase_ends_at, isHost, roomCode]);

  useEffect(() => {
    if (!isHost) return;
    const bots = players.filter(p => isBot(p));
    bots.forEach((bot, i) => {
      const targets = players.filter(p => p.username !== bot.username);
      if (targets.length === 0) return;
      const target = targets[Math.floor(Math.random() * targets.length)];
      setTimeout(
        () => cheeseGame.submitVote(roomCode, room.vote_round, bot.username, target.username),
        2000 + i * 700 + Math.random() * 1500
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, roomCode, room.vote_round]);

  const handleVote = async (target: string) => {
    if (myVote) return;
    try {
      await cheeseGame.submitVote(roomCode, room.vote_round, username, target);
      setMyVote(target);
      loadVotes();
    } catch {
      // submitVote failed
    }
  };

  const isUrgent = votingSecondsLeft !== null && votingSecondsLeft <= 15;

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-8 bg-[#05060f] text-zinc-100">
      {/* Rose-tinted aurora for voting drama */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.12) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.10) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        />
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${(i * 43) % 100}%`, top: `${(i * 67) % 100}%`, width: 1, height: 1 }}
            animate={{ opacity: [0.05, 0.6, 0.05] }}
            transition={{ duration: 2 + i % 5, repeat: Infinity, delay: i * 0.08 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-lg mx-auto space-y-5 text-center">

        {/* Header */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="space-y-2"
        >
          <motion.div
            animate={{ rotate: [-8, 8, -8], y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Gavel className="w-12 h-12 mx-auto text-rose-400" style={{ filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.6))' }} />
          </motion.div>
          <h1
            className="text-2xl font-black text-white"
            style={{ textShadow: '0 0 25px rgba(239,68,68,0.5)' }}
          >
            1 - 2 - 3 ชี้เลย!
          </h1>
          <p className="text-xs font-medium text-zinc-500">
            เลือกคนที่คิดว่าเป็นหนูจิ๊ด — เลือกได้ครั้งเดียว เปลี่ยนใจไม่ได้
          </p>
        </motion.div>

        {/* Vote counter + timer */}
        <div className="flex items-center justify-center gap-3">
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10"
            style={{ background: 'rgba(255,255,255,0.04)' }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-xs font-black text-amber-400">
              โหวตแล้ว {votes.length}/{players.length} คน
            </span>
            {(room.anonymous_vote ?? false) && <span className="text-[10px] text-zinc-600">(ลับ)</span>}
          </motion.div>

          {votingSecondsLeft !== null && (
            <motion.span
              className={`text-sm font-black px-3 py-1.5 rounded-xl border ${
                isUrgent
                  ? 'border-rose-500/50 text-rose-300'
                  : 'border-white/10 text-zinc-400'
              }`}
              style={{ background: isUrgent ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)' }}
              animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ⏱ {votingSecondsLeft}s
            </motion.span>
          )}
        </div>

        {/* Player grid */}
        <div className="grid grid-cols-2 gap-3">
          {players.map((p, i) => {
            const isSelf = p.username.toLowerCase() === username.toLowerCase();
            const isPicked = myVote === p.username;
            return (
              <motion.button
                key={p.username}
                onClick={() => !isSelf && handleVote(p.username)}
                disabled={isSelf || !!myVote}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 16 }}
                className="relative flex flex-col items-center gap-2 p-4 rounded-3xl border transition disabled:cursor-not-allowed"
                style={{
                  background: isPicked
                    ? 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 100%)'
                    : isSelf
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(255,255,255,0.04)',
                  borderColor: isPicked
                    ? 'rgba(245,158,11,0.6)'
                    : isSelf
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(255,255,255,0.08)',
                  boxShadow: isPicked ? '0 0 25px rgba(245,158,11,0.3)' : 'none',
                  opacity: isSelf ? 0.35 : 1,
                }}
                whileHover={!isSelf && !myVote ? {
                  scale: 1.04,
                  borderColor: 'rgba(239,68,68,0.5)',
                  boxShadow: '0 0 20px rgba(239,68,68,0.2)',
                } : {}}
                whileTap={!isSelf && !myVote ? { scale: 0.96 } : {}}
              >
                {isPicked && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: '#fbbf24', boxShadow: '0 0 12px rgba(245,158,11,0.6)' }}
                  >
                    <Check className="w-4 h-4 text-zinc-950" />
                  </motion.span>
                )}

                <div className="relative">
                  <img src={p.avatar} alt={p.username} className="w-14 h-14 rounded-full object-cover" style={{ boxShadow: isPicked ? '0 0 15px rgba(245,158,11,0.5)' : '0 0 0px transparent' }} />
                  {isPicked && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '2px solid rgba(245,158,11,0.6)' }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}
                </div>

                <span className="text-xs font-black truncate max-w-full text-zinc-200">
                  {p.username}{isSelf ? ' (คุณ)' : ''}
                </span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {myVote && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-black text-emerald-400"
              style={{ textShadow: '0 0 10px rgba(16,185,129,0.4)' }}
            >
              ✅ คุณโหวต {myVote} แล้ว — รอเพื่อนที่เหลือ...
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
