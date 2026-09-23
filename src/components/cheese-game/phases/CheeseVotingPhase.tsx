import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Gavel, Check } from 'lucide-react';
import { cheeseGame, isBot, CheeseVote } from '../../../utils/cheeseGameClient';
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

  // voting countdown timer
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

  // host drives bot votes: each bot votes for a random non-self player after a delay
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
    if (myVote) return; // one vote, no changing mind (matches "ชี้นิ้วพร้อมกัน")
    try {
      await cheeseGame.submitVote(roomCode, room.vote_round, username, target);
      setMyVote(target);
      loadVotes();
    } catch {
      // submitVote failed — do not set myVote so the user can retry
    }
  };

  return (
    <div className={`min-h-screen px-4 py-8 ${isDark ? 'bg-[#0b0c16] text-zinc-100' : 'bg-indigo-50 text-stone-900'}`}>
      <div className="max-w-lg mx-auto space-y-5 text-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-1">
          <Gavel className="w-10 h-10 text-amber-400 mx-auto" />
          <h1 className="text-xl font-black">1 - 2 - 3 ชี้เลย!</h1>
          <p className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
            เลือกคนที่คุณคิดว่าเป็นหนูจิ๊ด (เลือกได้ครั้งเดียว เปลี่ยนใจไม่ได้)
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-3">
          <p className="text-xs font-bold text-amber-400">
            โหวตแล้ว {votes.length}/{players.length} คน
            {(room.anonymous_vote ?? false) && <span className="ml-1.5 text-zinc-500 font-normal">(ลับ)</span>}
          </p>
          {votingSecondsLeft !== null && (
            <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${votingSecondsLeft <= 15 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-zinc-800 text-zinc-400'}`}>
              ⏱️ {votingSecondsLeft}s
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {players.map(p => {
            const isSelf = p.username.toLowerCase() === username.toLowerCase();
            const isPicked = myVote === p.username;
            return (
              <button
                key={p.username}
                onClick={() => !isSelf && handleVote(p.username)}
                disabled={isSelf || !!myVote}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition active:scale-95 disabled:cursor-not-allowed ${
                  isPicked
                    ? 'bg-amber-400/20 border-amber-400 ring-2 ring-amber-400'
                    : isSelf
                      ? 'opacity-40 border-transparent'
                      : isDark ? 'bg-zinc-900/60 border-zinc-800 hover:border-amber-400/40' : 'bg-white border-stone-200 hover:border-amber-400'
                }`}
              >
                {isPicked && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-zinc-950" />
                  </span>
                )}
                <img src={p.avatar} alt={p.username} className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-700" />
                <span className="text-xs font-bold truncate max-w-full">{p.username}{isSelf ? ' (คุณ)' : ''}</span>
              </button>
            );
          })}
        </div>

        {myVote && (
          <p className="text-xs font-bold text-emerald-400">✅ คุณโหวต {myVote} แล้ว รอเพื่อนที่เหลือ...</p>
        )}
      </div>
    </div>
  );
};
