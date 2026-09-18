import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Award, Sparkles, RefreshCw, Flame, Calendar, BookOpen, User } from 'lucide-react';
import { supabaseSim, LeaderboardEntry } from '../utils/supabaseSim';

interface LeaderboardViewProps {
  theme: 'light' | 'dark';
  currentUsername: string;
  onPlayTap: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  theme,
  currentUsername,
  onPlayTap,
}) => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const isDark = theme === 'dark';

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const records = await supabaseSim.getLeaderboard();
      // Sort first by score percentage (score/max_questions), then by streak, then by date (newer first)
      const sorted = [...records].sort((a, b) => {
        const pctA = a.score / a.max_questions;
        const pctB = b.score / b.max_questions;
        if (pctB !== pctA) return pctB - pctA;
        if (b.streak !== a.streak) return b.streak - a.streak;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setData(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoading(false), 500); // smooth feel
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleRefresh = () => {
    onPlayTap();
    fetchLeaderboard();
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-zinc-950 font-black text-sm shadow-[0_0_12px_rgba(245,158,11,0.5)]">
          👑
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-zinc-900 font-black text-sm shadow-[0_0_10px_rgba(203,213,225,0.4)]">
          🥈
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs shadow-[0_0_10px_rgba(180,83,9,0.3)]">
          🥉
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 font-bold text-xs">
        {index + 1}
      </span>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/10 pb-4">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400 animate-bounce" />
            <span>ทำเนียบเกียรติยศสูงสุด (Leaderboard)</span>
          </h2>
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-500'} mt-1`}>
            จัดอันดับผู้เรียนที่มีความถูกต้องและสถิติคอมโบการทำข้อสอบได้ยอดเยี่ยมที่สุดด้วย **Supabase Realtime Database**
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition duration-200 ${
            isDark 
              ? 'bg-zinc-900/60 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-white' 
              : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>{loading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-12 h-12 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-xs font-bold text-zinc-400 animate-pulse">กำลังประมวลผลคะแนนผู้เข้าแข่ง...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-800/30 rounded-3xl">
          <Award className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-zinc-400">ยังไม่มีประวัติคะแนนปรากฏในขณะนี้</p>
          <p className="text-xs text-zinc-500 mt-1">มาประเดิมทำข้อสอบเพื่อเก็บอันดับแรกของตารางกันเลย!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800/10 shadow-lg">
          <div className={`overflow-x-auto ${isDark ? 'bg-zinc-950/40' : 'bg-white'}`}>
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className={`border-b font-bold ${isDark ? 'border-zinc-800 text-zinc-400 bg-zinc-900/30' : 'border-stone-100 text-stone-600 bg-stone-50'}`}>
                  <th className="p-4 text-center w-16">อันดับ</th>
                  <th className="p-4">ผู้สอบ</th>
                  <th className="p-4">รายวิชา</th>
                  <th className="p-4 text-center">คะแนนเต็ม</th>
                  <th className="p-4 text-center">ความแม่นยำ</th>
                  <th className="p-4 text-center">คอมโบสูงสุด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/10">
                {data.map((entry, idx) => {
                  const accuracy = entry.max_questions > 0 ? Math.round((entry.score / entry.max_questions) * 100) : 0;
                  const isCurrentUser = entry.username.trim().toLowerCase() === currentUsername.trim().toLowerCase();
                  
                  return (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.05, 0.8) }}
                      className={`transition-colors font-medium ${
                        isCurrentUser
                          ? isDark 
                            ? 'bg-amber-400/10 border-l-2 border-l-amber-500 hover:bg-amber-400/15'
                            : 'bg-amber-500/10 border-l-2 border-l-amber-600 hover:bg-amber-500/15'
                          : isDark
                            ? 'hover:bg-zinc-900/40 text-zinc-300'
                            : 'hover:bg-stone-50 text-stone-800'
                      }`}
                    >
                      <td className="p-4 text-center font-bold">
                        <div className="flex justify-center">{getRankBadge(idx)}</div>
                      </td>
                      <td className="p-4 font-black">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[120px] sm:max-w-[180px]">{entry.username}</span>
                          {isCurrentUser && (
                            <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950">YOU</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-bold text-amber-400">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 opacity-60 text-blue-400" />
                          <span>{entry.subject_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold">
                        <span className="text-emerald-400 font-extrabold">{entry.score}</span> / {entry.max_questions} ข้อ
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                          accuracy >= 80 
                            ? 'bg-emerald-500/15 text-emerald-400' 
                            : accuracy >= 50 
                              ? 'bg-amber-500/15 text-amber-400' 
                              : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {accuracy}%
                        </span>
                      </td>
                      <td className="p-4 text-center font-extrabold text-orange-500">
                        {entry.streak >= 2 ? (
                          <div className="flex items-center justify-center gap-0.5">
                            <Flame className="w-3.5 h-3.5 fill-orange-500" />
                            <span>{entry.streak} 🔥</span>
                          </div>
                        ) : (
                          <span className="opacity-40">-</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
