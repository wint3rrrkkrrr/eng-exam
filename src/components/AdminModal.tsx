import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, User, Trash2, X, RefreshCw, CheckCircle2, AlertCircle, LogOut, Users, Award, UserCheck, Laptop } from 'lucide-react';
import { supabaseSim, UserAggregatedLeaderboard } from '../utils/supabaseSim';

interface AdminModalProps {
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  onPlayTap?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  theme,
  soundEnabled,
  onPlayTap,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('winter_admin_auth_v1') === 'true';
    } catch {
      return false;
    }
  });

  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [realUsersData, setRealUsersData] = useState<UserAggregatedLeaderboard[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const isDark = theme === 'dark';

  const fetchAdminData = async () => {
    setLoadingUsers(true);
    try {
      const data = await supabaseSim.getAggregatedLeaderboard();
      setRealUsersData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isOpen && isLoggedIn) {
      fetchAdminData();
    }
  }, [isOpen, isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onPlayTap?.();

    if (inputUsername.trim() === 'wintararer' && inputPassword === '01yaQRl2Hs') {
      setIsLoggedIn(true);
      setLoginError('');
      try {
        localStorage.setItem('winter_admin_auth_v1', 'true');
      } catch {}
      fetchAdminData();
    } else {
      setLoginError('ชื่อผู้ใช้หรือรหัสผ่านแอดมินไม่ถูกต้อง!');
    }
  };

  const handleLogout = () => {
    onPlayTap?.();
    setIsLoggedIn(false);
    try {
      localStorage.removeItem('winter_admin_auth_v1');
    } catch {}
  };

  const handleDeleteUser = (username: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ "${username}" ออกจากระบบ?`)) {
      onPlayTap?.();
      supabaseSim.deleteUserByAdmin(username);
      fetchAdminData();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('⚠️ คำเตือน: คุณต้องการลบข้อมูลผู้ใช้งานและลีดเดอร์บอร์ดทั้งหมดจริงหรือไม่?')) {
      onPlayTap?.();
      supabaseSim.clearAllScoresByAdmin();
      fetchAdminData();
    }
  };

  return (
    <>
      {/* Floating Admin Trigger Button at Bottom Right */}
      <div className="fixed bottom-3 right-3 z-50">
        <button
          onClick={() => {
            onPlayTap?.();
            setIsOpen(true);
          }}
          className={`p-2 sm:px-3 sm:py-1.5 rounded-full border text-xs font-bold transition-all shadow-lg hover:scale-105 flex items-center gap-1.5 ${
            isDark
              ? 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 backdrop-blur-md'
              : 'bg-white/90 border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 backdrop-blur-md shadow-md'
          }`}
          title="เมนูผู้ดูแลระบบ (Admin)"
        >
          <Shield className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Admin</span>
        </button>
      </div>

      {/* Admin Modal Popup */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`w-full max-w-2xl p-6 rounded-3xl border shadow-2xl relative overflow-hidden text-left ${
                isDark 
                  ? 'bg-[#0e1017] border-zinc-800 text-zinc-100' 
                  : 'bg-white border-stone-200 text-stone-900'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-full border transition ${
                  isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400' : 'border-stone-200 hover:bg-stone-100 text-stone-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black flex items-center gap-2">
                    <span>แผงควบคุมผู้ดูแลระบบ (Admin Panel)</span>
                  </h2>
                  <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                    {isLoggedIn ? 'จัดการรายชื่อผู้ใช้จริง และตรวจสอบคะแนนสะสมในระบบ' : 'กรุณาเข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบ'}
                  </p>
                </div>
              </div>

              {!isLoggedIn ? (
                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-4 pt-2">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold mb-1 block opacity-80">ชื่อผู้ใช้ (Username)</label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                        <input
                          type="text"
                          value={inputUsername}
                          onChange={(e) => setInputUsername(e.target.value)}
                          placeholder="xxx"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-stone-50 border-stone-200'
                          }`}
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold mb-1 block opacity-80">รหัสผ่าน (Password)</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                        <input
                          type="password"
                          value={inputPassword}
                          onChange={(e) => setInputPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-stone-50 border-stone-200'
                          }`}
                        />
                      </div>
                    </div>

                    {loginError && (
                      <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{loginError}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-black text-sm bg-amber-400 text-zinc-950 hover:bg-amber-300 transition shadow-md"
                  >
                    เข้าสู่ระบบแอดมิน
                  </button>
                </form>
              ) : (
                /* Admin Dashboard */
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      <span>เข้าสู่ระบบในนาม: <strong className="text-amber-400 font-extrabold">wintararer</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={fetchAdminData}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${loadingUsers ? 'animate-spin' : ''}`} />
                        <span>รีเฟรช</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold flex items-center gap-1"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>รายชื่อผู้ใช้งานจริงในระบบ ({realUsersData.length} คน)</span>
                    </h3>

                    {realUsersData.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-xs text-red-400 hover:text-red-300 font-bold underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>ล้างข้อมูลทั้งหมด</span>
                      </button>
                    )}
                  </div>

                  {loadingUsers ? (
                    <div className="py-8 text-center text-xs text-zinc-400">กำลังดึงข้อมูล...</div>
                  ) : realUsersData.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-zinc-800 rounded-2xl text-xs text-zinc-400">
                      ยังไม่มีผู้ใช้จริงในระบบ
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto rounded-xl border border-zinc-800 divide-y divide-zinc-800 text-xs">
                      {realUsersData.map((u) => (
                        <div key={u.username} className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-900/50 transition">
                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-amber-300 text-sm">{u.username}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-200/80 font-medium">
                              <Laptop className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>อุปกรณ์: <strong className="text-zinc-200 font-bold">{u.deviceInfo || 'ไม่ระบุอุปกรณ์'}</strong></span>
                            </div>
                            <p className="text-[11px] text-zinc-400">
                              ทำโจทย์สะสม {u.totalAttempted} ข้อ (ถูก {u.totalScore} ข้อ) • คอมโบสูงสุด {u.maxStreak} 🔥
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteUser(u.username)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 shrink-0 transition"
                            title="ลบผู้ใช้นี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
