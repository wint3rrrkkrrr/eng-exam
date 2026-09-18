import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Gavel, Check } from 'lucide-react';
import { cheeseGame, CheeseVote } from '../../../utils/cheeseGameClient';
import { CheesePhaseProps } from './types';

export const CheeseVotingPhase: React.FC<CheesePhaseProps> = ({ room, players, username, isDark, isHost, roomCode, refresh }) => {
  const [myVote, setMyVote] = useState<string | null>(null);
  const [votes, setVotes] = useState<CheeseVote[]>([]);
  const [finishing, setFinishing] = useState(false);

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

  const handleVote = async (target: string) => {
    if (myVote) return; // one vote, no changing mind (matches "ชี้นิ้วพร้อมกัน")
    setMyVote(target);
    await cheeseGame.submitVote(roomCode, room.vote_round, username, target);
    loadVotes();
  };

  const handleForceFinish = async () => {
    if (finishing) return;
    setFinishing(true);
    await cheeseGame.finishVoting(roomCode);
    refresh();
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

        <p className="text-xs font-bold text-amber-400">
          โหวตแล้ว {votes.length}/{players.length} คน
        </p>

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

        {isHost && !allVoted && (
          <button
            onClick={handleForceFinish}
            className={`text-[11px] font-bold underline ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-stone-400 hover:text-stone-600'}`}
          >
            (เจ้าของห้อง) จบโหวตตอนนี้เลย แม้ยังไม่ครบทุกคน
          </button>
        )}
      </div>
    </div>
  );
};
