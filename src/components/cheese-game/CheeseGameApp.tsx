import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, DoorOpen, PlusCircle, Users, Loader2, Pencil } from 'lucide-react';
import { cheeseGame } from '../../utils/cheeseGameClient';
import { supabaseSim } from '../../utils/supabaseSim';
import { CheeseRoom } from './CheeseRoom';
import { CheeseAvatarPicker } from './CheeseAvatarPicker';
import {
  MouseAvatarConfig,
  loadMouseAvatarConfig,
  loadMouseAvatarFromProfile,
  saveMouseAvatarConfig,
  generateMouseAvatarUri,
} from './mouseavatar';

interface CheeseGameAppProps {
  username: string;
  isDark: boolean;
  onBack: () => void;
}

const STORAGE_KEY_ROOM = 'cheese_game_room_code_v1';

export const CheeseGameApp: React.FC<CheeseGameAppProps> = ({ username, isDark, onBack }) => {
  const [roomCode, setRoomCode] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY_ROOM); } catch { return null; }
  });
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [loading, setLoading] = useState<'create' | 'join' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [avatarConfig, setAvatarConfig] = useState<MouseAvatarConfig>(() => loadMouseAvatarConfig(username));
  const [showPicker, setShowPicker] = useState(false);

  // On mount: fetch Supabase profile to restore mouse avatar across devices
  useEffect(() => {
    if (!username) return;
    supabaseSim.fetchProfile(username).then(profile => {
      if (profile.mouse_avatar) {
        const config = loadMouseAvatarFromProfile(profile.mouse_avatar);
        setAvatarConfig(config);
        // Also update localStorage cache for this device
        try { localStorage.setItem(`cheese_mouse_avatar_v2_${username}`, profile.mouse_avatar); } catch {}
      }
    });
  }, [username]);

  const avatar = generateMouseAvatarUri(avatarConfig);

  const handleSaveAvatar = (config: MouseAvatarConfig) => {
    saveMouseAvatarConfig(username, config, supabaseSim.updateProfile);
    setAvatarConfig(config);
  };

  const enterRoom = (code: string) => {
    setRoomCode(code);
    try { localStorage.setItem(STORAGE_KEY_ROOM, code); } catch {}
  };

  const exitRoom = () => {
    setRoomCode(null);
    try { localStorage.removeItem(STORAGE_KEY_ROOM); } catch {}
  };

  const handleCreateRoom = async () => {
    setErrorMsg(null);
    setLoading('create');
    try {
      const code = await cheeseGame.createRoom(username, avatar);
      enterRoom(code);
    } catch (e) {
      console.error(e);
      setErrorMsg('สร้างห้องไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setLoading(null);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCodeInput.trim()) {
      setErrorMsg('กรอกรหัสห้องก่อนครับ');
      return;
    }
    setErrorMsg(null);
    setLoading('join');
    try {
      const res = await cheeseGame.joinRoom(joinCodeInput, username, avatar);
      if (res.success) {
        enterRoom(joinCodeInput.trim().toUpperCase());
      } else {
        setErrorMsg(res.message);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('เข้าห้องไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setLoading(null);
    }
  };

  if (roomCode) {
    return <CheeseRoom roomCode={roomCode} username={username} avatar={avatar} isDark={isDark} onExitRoom={exitRoom} onBackToHome={() => { exitRoom(); onBack(); }} />;
  }

  return (
    <div className={`min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-10 ${isDark ? 'bg-[#0b0c16]' : 'bg-indigo-50'}`}>
      {/* Ambient night-sky decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 28 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-yellow-200"
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, fontSize: `${6 + (i % 5) * 2}px` }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: i * 0.15 }}
          >
            ✦
          </motion.span>
        ))}
        <motion.div
          className="absolute -top-10 -right-10 text-[180px] opacity-10 select-none"
          animate={{ rotate: [0, 8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          🌙
        </motion.div>
      </div>

      <button
        onClick={onBack}
        className={`absolute top-4 left-4 sm:top-6 sm:left-6 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition active:scale-95 ${
          isDark ? 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-white/90 hover:bg-white text-stone-800 border-stone-200'
        }`}
      >
        <Home className="w-3.5 h-3.5 text-amber-500" />
        <span>กลับหน้าแรก</span>
      </button>

      <div className="relative z-10 w-full max-w-md space-y-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="space-y-3"
        >
          {/* Mouse avatar with edit button */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative inline-block">
              <motion.img
                key={avatar}
                src={avatar}
                alt="avatar"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full ring-4 ring-amber-400/50 shadow-xl cursor-pointer"
                onClick={() => setShowPicker(true)}
                whileTap={{ scale: 0.93 }}
              />
              <button
                onClick={() => setShowPicker(true)}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg active:scale-90 transition"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className={`text-xs font-bold ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
              {username} — <button onClick={() => setShowPicker(true)} className="text-amber-400 underline-offset-2 hover:underline">แต่งตัวหนู</button>
            </p>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>
            หนูชีสอยู่ไหน?
          </h1>
          <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
            Cheese Thief — เกมจับโจรชีสสำหรับเพื่อนกลุ่มคุณ 4-10 คน
          </p>
        </motion.div>

        <div className={`rounded-3xl border p-5 sm:p-6 space-y-4 shadow-2xl backdrop-blur-sm ${
          isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white/90 border-stone-200'
        }`}>
          <button
            onClick={handleCreateRoom}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-zinc-950 shadow-lg active:scale-95 transition disabled:opacity-60"
          >
            {loading === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            <span>สร้างห้องใหม่</span>
          </button>

          <div className="flex items-center gap-3">
            <div className={`h-px flex-1 ${isDark ? 'bg-zinc-800' : 'bg-stone-200'}`} />
            <span className={`text-[10px] font-bold ${isDark ? 'text-zinc-600' : 'text-stone-400'}`}>หรือ</span>
            <div className={`h-px flex-1 ${isDark ? 'bg-zinc-800' : 'bg-stone-200'}`} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="กรอกรหัสห้อง เช่น A3F9K"
                maxLength={5}
                className={`flex-1 px-4 py-3 rounded-2xl text-center tracking-[0.3em] font-black text-sm border focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600' : 'bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400'
                }`}
              />
            </div>
            <button
              onClick={handleJoinRoom}
              disabled={loading !== null}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm border transition active:scale-95 disabled:opacity-60 ${
                isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border-amber-500/30' : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              {loading === 'join' ? <Loader2 className="w-4 h-4 animate-spin" /> : <DoorOpen className="w-4 h-4" />}
              <span>เข้าร่วมห้อง</span>
            </button>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs font-bold text-rose-400"
              >
                {errorMsg}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className={`flex items-center justify-center gap-1.5 text-[11px] font-medium ${isDark ? 'text-zinc-500' : 'text-stone-500'}`}>
          <Users className="w-3.5 h-3.5" />
          <span>เล่นได้ 4-10 คน • เจ้าของห้องตั้งค่า/เตะผู้เล่นได้ก่อนเริ่ม</span>
        </div>
      </div>

      {/* Avatar picker modal */}
      <AnimatePresence>
        {showPicker && (
          <CheeseAvatarPicker
            config={avatarConfig}
            isDark={isDark}
            onSave={handleSaveAvatar}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
