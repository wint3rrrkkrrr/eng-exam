import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Award, RefreshCw, Flame, UserCheck, Zap, Star, UserPlus, Eye, X, Sparkles, Smartphone, Calendar } from 'lucide-react';
import { supabaseSim, UserAggregatedLeaderboard } from '../utils/supabaseSim';

interface LeaderboardViewProps {
  theme: 'light' | 'dark';
  currentUsername: string;
  onPlayTap?: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  theme,
  currentUsername,
  onPlayTap,
}) => {
  const [data, setData] = useState<UserAggregatedLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBioUser, setSelectedBioUser] = useState<UserAggregatedLeaderboard | null>(null);
  const isDark = theme === 'dark';

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const records = await supabaseSim.getAggregatedLeaderboard();
      setData(records);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleRefresh = () => {
    onPlayTap?.();
    fetchLeaderboard();
  };

  const getRankBadge = (index: number, entry?: UserAggregatedLeaderboard) => {
    if (entry?.isRankZero || entry?.username.trim().toLowerCase() === 'win') {
      return (
        <span className="flex items-center justify-center px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 text-zinc-950 font-black text-xs shadow-[0_0_18px_rgba(251,191,36,0.8)] animate-pulse border border-amber-200">
          👑 #0
        </span>
      );
    }

    const hasRankZero = data.some(d => d.isRankZero || d.username.trim().toLowerCase() === 'win');
    const realRank = hasRankZero ? index : index + 1;

    if (realRank === 1) {
      return (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-zinc-950 font-black text-sm shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse">
          🥇 #1
        </span>
      );
    }
    if (realRank === 2) {
      return (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 text-zinc-950 font-black text-sm shadow-[0_0_12px_rgba(203,213,225,0.5)]">
          🥈 #2
        </span>
      );
    }
    if (realRank === 3) {
      return (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm shadow-[0_0_10px_rgba(180,83,9,0.4)]">
          🥉 #3
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800/80 text-zinc-400 font-bold text-xs">
        {realRank}
      </span>
    );
  };

  const formatDate = (isoStr: string, isWinRankZero?: boolean) => {
    if (isWinRankZero) {
      const d = new Date();
      return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    }
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/20 pb-4">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400 animate-bounce" />
            <span>ตารางคนเก่งคะแนนสะสม 🏆</span>
          </h2>
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-600'} mt-1`}>
            รวมคะแนนตอบถูกสะสม + สตรีคสูงสุดจากทุกวิชา ยิ่งทำบ่อยยิ่งอยู่อันดับสูง!
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition duration-200 self-start sm:self-auto ${
            isDark 
              ? 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-white' 
              : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700 shadow-2xs'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>{loading ? 'กำลังอัปเดต...' : 'รีเฟรชตาราง'}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-xs font-bold text-zinc-400">กำลังเช็คคะแนนล่าสุด...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-800/30 rounded-3xl p-6">
          <Award className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
          <p className="text-sm font-bold text-zinc-300">ยังไม่มีใครลงแข่งเลย!</p>
          <p className="text-xs text-zinc-400 mt-1">รีบเข้าทำข้อสอบวิชาไหนก็ได้ คนแรกจะติด Top 1 ทันที!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800/20 shadow-xl">
          <div className={`overflow-x-auto ${isDark ? 'bg-zinc-950/60' : 'bg-white'}`}>
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className={`border-b font-bold text-xs uppercase tracking-wider ${
                  isDark ? 'border-zinc-800 text-zinc-400 bg-zinc-900/50' : 'border-stone-200 text-stone-600 bg-stone-100/80'
                }`}>
                  <th className="p-3.5 text-center w-16">อันดับ</th>
                  <th className="p-3.5">ผู้เรียน</th>
                  <th className="p-3.5 text-center">คะแนนรวมสะสม</th>
                  <th className="p-3.5 text-center">ความแม่นยำ</th>
                  <th className="p-3.5 text-center">สตรีคสูงสุด</th>
                  <th className="p-3.5 text-center">เล่นล่าสุด</th>
                  <th className="p-3.5 text-center">เพิ่มเพื่อน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/10">
                {data.map((entry, idx) => {
                  const isWinRankZero = entry.isRankZero || entry.username.trim().toLowerCase() === 'win';
                  const accuracy = entry.totalAttempted > 0 ? Math.round((entry.totalScore / entry.totalAttempted) * 100) : 100;
                  const isCurrentUser = entry.username.trim().toLowerCase() === currentUsername.trim().toLowerCase();
                  const userProfile = supabaseSim.getProfile(entry.username);
                  const isAlreadyFriend = supabaseSim.getFriends(currentUsername).some(f => f.toLowerCase() === entry.username.toLowerCase());
                  
                  return (
                    <motion.tr
                      key={entry.username}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.04, 0.5) }}
                      className={`transition-colors font-medium ${
                        isWinRankZero
                          ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border-l-4 border-l-amber-400 text-amber-200 font-black shadow-md'
                          : isCurrentUser
                            ? isDark 
                              ? 'bg-amber-400/15 border-l-4 border-l-amber-400 text-amber-200 font-black'
                              : 'bg-amber-500/15 border-l-4 border-l-amber-500 text-stone-900 font-black'
                            : isDark
                              ? 'hover:bg-zinc-900/60 text-zinc-200'
                              : 'hover:bg-stone-50 text-stone-800'
                      }`}
                    >
                      <td className="p-3.5 text-center font-bold">
                        <div className="flex justify-center">{getRankBadge(idx, entry)}</div>
                      </td>
                      <td className="p-3.5 font-bold">
                        <button
                          onClick={() => setSelectedBioUser(entry)}
                          className="flex items-center gap-2.5 group text-left transition-transform active:scale-95 cursor-pointer"
                          title="กดเพื่อดูไบโอและโปรไฟล์"
                        >
                          <img
                            src={userProfile.avatar}
                            alt={entry.username}
                            className="w-7 h-7 rounded-full object-cover ring-2 ring-amber-400/50 shrink-0 group-hover:scale-110 transition-transform"
                          />
                          <span className="truncate max-w-[120px] sm:max-w-[180px] font-extrabold text-sm group-hover:text-amber-400 transition-colors">
                            {entry.username}
                          </span>
                          {isWinRankZero && (
                            <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-orange-400 text-zinc-950 shadow-xs border border-amber-200">
                              👑 TOP VIP
                            </span>
                          )}
                          {isCurrentUser && !isWinRankZero && (
                            <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded bg-amber-400 text-zinc-950 shadow-xs">
                              YOU
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="p-3.5 text-center font-black text-base text-amber-400">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                          <span>{entry.totalScore}</span>
                          <span className="text-xs text-zinc-500 font-normal">({entry.totalAttempted} ข้อ)</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                          accuracy >= 80 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : accuracy >= 50 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {accuracy}%
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-black">
                        {entry.maxStreak >= 1 ? (
                          <div className="inline-flex items-center gap-1 text-orange-400 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs">
                            <Flame className="w-3.5 h-3.5 fill-orange-500" />
                            <span>{entry.maxStreak} 🔥</span>
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center text-xs font-bold text-amber-300">
                        {formatDate(entry.lastActive, isWinRankZero)}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedBioUser(entry)}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-500/20 text-blue-300 hover:bg-blue-500 hover:text-white transition-all flex items-center gap-1 active:scale-95"
                            title="ดูสถานะและไบโอ"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ดูไบโอ</span>
                          </button>

                          {!isCurrentUser && (
                            isAlreadyFriend ? (
                              <span className="text-[11px] font-extrabold text-emerald-400 px-2 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                เพื่อนแล้ว
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  const res = supabaseSim.sendFriendRequest(currentUsername, entry.username);
                                  alert(res.message);
                                }}
                                className="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 transition-all flex items-center gap-1 active:scale-95"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>แอดเพื่อน</span>
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Bio Modal */}
      <AnimatePresence>
        {selectedBioUser && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl border overflow-hidden ${
                isDark ? 'bg-[#0f1118] border-zinc-800 text-zinc-100' : 'bg-white border-stone-200 text-stone-900'
              }`}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-black text-sm text-amber-400 tracking-wider uppercase">
                    โปรไฟล์ผู้เรียน
                  </span>
                </div>
                <button
                  onClick={() => setSelectedBioUser(null)}
                  className="p-1.5 rounded-full hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Card Body */}
              {(() => {
                const uProfile = supabaseSim.getProfile(selectedBioUser.username);
                const isWin = selectedBioUser.isRankZero || selectedBioUser.username.trim().toLowerCase() === 'win';
                const isFriend = supabaseSim.getFriends(currentUsername).some(f => f.toLowerCase() === selectedBioUser.username.toLowerCase());
                const accuracy = selectedBioUser.totalAttempted > 0 ? Math.round((selectedBioUser.totalScore / selectedBioUser.totalAttempted) * 100) : 100;

                return (
                  <div className="mt-4 space-y-4">
                    {/* Avatar & Badges */}
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                      <div className="relative">
                        <img
                          src={uProfile.avatar}
                          alt={selectedBioUser.username}
                          className={`w-24 h-24 rounded-full object-cover ring-4 shadow-xl ${
                            isWin ? 'ring-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)]' : 'ring-amber-400/40'
                          }`}
                        />
                        {isWin && (
                          <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-zinc-950 font-black text-[10px] shadow-md border border-amber-200">
                            👑 TOP VIP
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-extrabold text-xl tracking-wide flex items-center justify-center gap-1.5">
                          <span>{selectedBioUser.username}</span>
                          {selectedBioUser.username.toLowerCase() === currentUsername.toLowerCase() && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-zinc-950">
                              คุณ
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-amber-500 font-bold mt-0.5">
                          {isWin ? '👑 RANK 0 TOP SUPREME VIP' : 'ผู้เรียน WINTER PREP 2026'}
                        </p>
                      </div>
                    </div>

                    {/* Bio Box */}
                    <div className={`p-3.5 rounded-2xl border text-center relative overflow-hidden ${
                      isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <p className="text-xs font-extrabold italic">
                        "{uProfile.bio || 'ไม่มีข้อความสถานะ'}"
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <div className={`p-3 rounded-2xl border flex flex-col items-center ${
                        isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-stone-50 border-stone-200'
                      }`}>
                        <span className="text-zinc-500 text-[10px]">คะแนนสะสมรวม</span>
                        <span className="text-amber-400 text-base font-black flex items-center gap-1 mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {selectedBioUser.totalScore}
                        </span>
                      </div>

                      <div className={`p-3 rounded-2xl border flex flex-col items-center ${
                        isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-stone-50 border-stone-200'
                      }`}>
                        <span className="text-zinc-500 text-[10px]">สตรีคสูงสุด</span>
                        <span className="text-orange-400 text-base font-black flex items-center gap-1 mt-0.5">
                          <Flame className="w-3.5 h-3.5 fill-orange-400" />
                          {selectedBioUser.maxStreak} วัน
                        </span>
                      </div>

                      <div className={`p-3 rounded-2xl border flex flex-col items-center ${
                        isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-stone-50 border-stone-200'
                      }`}>
                        <span className="text-zinc-500 text-[10px]">ความแม่นยำ</span>
                        <span className="text-emerald-400 text-base font-black mt-0.5">
                          {accuracy}%
                        </span>
                      </div>

                      <div className={`p-3 rounded-2xl border flex flex-col items-center ${
                        isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-stone-50 border-stone-200'
                      }`}>
                        <span className="text-zinc-500 text-[10px]">ข้อทำสะสม</span>
                        <span className="text-blue-400 text-base font-black mt-0.5">
                          {selectedBioUser.totalAttempted} ข้อ
                        </span>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className={`p-3 rounded-2xl border text-[11px] space-y-1.5 ${
                      isDark ? 'bg-zinc-900/30 border-zinc-800 text-zinc-400' : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}>
                      {(() => {
                        const isAdmin = localStorage.getItem('winter_admin_auth_v1') === 'true' || currentUsername.trim().toLowerCase() === 'win' || currentUsername.trim().toLowerCase() === 'wintararer';
                        return isAdmin ? (
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">อุปกรณ์ที่ใช้: {selectedBioUser.deviceInfo || uProfile.device_info || 'ไม่ระบุ'}</span>
                          </div>
                        ) : null;
                      })()}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>เล่นล่าสุด: {formatDate(selectedBioUser.lastActive, isWin)}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {selectedBioUser.username.toLowerCase() !== currentUsername.toLowerCase() && (
                      <div className="pt-2">
                        {isFriend ? (
                          <div className="w-full py-2.5 rounded-xl font-extrabold text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-center flex items-center justify-center gap-1.5">
                            <UserCheck className="w-4 h-4" />
                            <span>เป็นเพื่อนกันเรียบร้อยแล้ว</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              const res = supabaseSim.sendFriendRequest(currentUsername, selectedBioUser.username);
                              alert(res.message);
                            }}
                            className="w-full py-2.5 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>ส่งคำขอเป็นเพื่อนกับ {selectedBioUser.username}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
