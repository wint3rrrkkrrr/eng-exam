import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, DoorOpen, PlusCircle, Users, Loader2, Pencil } from 'lucide-react';
import { cheeseGame } from '../../utils/cheeseGameClient';
import { supabaseSim } from '../../utils/supabaseSim';
import { CheeseRoom } from './CheeseRoom';
import { CheeseAvatarPicker } from './CheeseAvatarPicker';
import { CheeseParticles, AuroraBg } from './CheeseParticles';
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

  useEffect(() => {
    if (!username) return;
    supabaseSim.fetchProfile(username).then(profile => {
      if (profile.mouse_avatar) {
        const config = loadMouseAvatarFromProfile(profile.mouse_avatar);
        setAvatarConfig(config);
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
    if (!joinCodeInput.trim()) { setErrorMsg('กรอกรหัสห้องก่อนครับ'); return; }
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
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-10 bg-[#05060f]">
      <AuroraBg />
      <CheeseParticles count={28} />

      {/* Stars grid */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${(i * 43 + 7) % 100}%`,
              top: `${(i * 67 + 11) % 100}%`,
              width: i % 5 === 0 ? 2 : 1,
              height: i % 5 === 0 ? 2 : 1,
            }}
            animate={{ opacity: [0.1, 0.9, 0.1] }}
            transition={{ duration: 2 + (i % 5), repeat: Infinity, delay: i * 0.08 }}
          />
        ))}
      </div>

      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border border-white/10 bg-white/5 backdrop-blur text-zinc-300 hover:bg-white/10 transition active:scale-95"
      >
        <Home className="w-3.5 h-3.5 text-amber-400" />
        กลับหน้าแรก
      </button>

      <div className="relative z-10 w-full max-w-md space-y-7 text-center">

        {/* Hero */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
          className="space-y-4"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative inline-block">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: '0 0 30px 8px rgba(245,158,11,0.35)' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              <motion.img
                key={avatar}
                src={avatar}
                alt="avatar"
                className="w-24 h-24 rounded-full ring-4 ring-amber-400/60 shadow-2xl cursor-pointer relative z-10"
                onClick={() => setShowPicker(true)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
              />
              <motion.button
                onClick={() => setShowPicker(true)}
                className="absolute -bottom-1 -right-1 z-20 w-8 h-8 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.15, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <Pencil className="w-3.5 h-3.5" />
              </motion.button>
            </div>
            <p className="text-xs font-bold text-zinc-400">
              {username} —{' '}
              <button onClick={() => setShowPicker(true)} className="text-amber-400 hover:text-amber-300 underline-offset-2 hover:underline transition">
                แต่งตัวหนู
              </button>
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <motion.div
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl select-none"
            >
              🧀
            </motion.div>
            <h1
              className="text-3xl sm:text-4xl font-black text-white tracking-tight"
              style={{ textShadow: '0 0 30px rgba(245,158,11,0.6), 0 0 60px rgba(245,158,11,0.2)' }}
            >
              หนูชีสอยู่ไหน?
            </h1>
            <p className="text-xs font-medium text-zinc-500">
              Cheese Thief — เกมจับโจรชีสสำหรับเพื่อนกลุ่มคุณ
            </p>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 160, damping: 16 }}
          className="rounded-3xl border border-amber-400/20 p-6 space-y-4 backdrop-blur-md"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(15,15,30,0.9) 100%)',
            boxShadow: '0 0 40px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Create */}
          <motion.button
            onClick={handleCreateRoom}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-zinc-950 disabled:opacity-60 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)',
              boxShadow: '0 0 25px rgba(245,158,11,0.5), 0 4px 20px rgba(0,0,0,0.4)',
            }}
            whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(245,158,11,0.7), 0 4px 20px rgba(0,0,0,0.4)' }}
            whileTap={{ scale: 0.97 }}
          >
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
            />
            {loading === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            สร้างห้องใหม่
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-bold text-zinc-600">หรือ</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder="กรอกรหัสห้อง เช่น A3F9K"
              maxLength={5}
              className="w-full px-4 py-3 rounded-2xl text-center tracking-[0.35em] font-black text-sm border border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40 transition"
            />
            <motion.button
              onClick={handleJoinRoom}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm border border-amber-400/30 text-amber-300 disabled:opacity-60 transition"
              style={{ background: 'rgba(245,158,11,0.08)' }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(245,158,11,0.6)', background: 'rgba(245,158,11,0.14)' }}
              whileTap={{ scale: 0.97 }}
            >
              {loading === 'join' ? <Loader2 className="w-4 h-4 animate-spin" /> : <DoorOpen className="w-4 h-4" />}
              เข้าร่วมห้อง
            </motion.button>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs font-bold text-rose-400"
              >
                ⚠️ {errorMsg}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-600"
        >
          <Users className="w-3.5 h-3.5" />
          เล่นได้ 3-20 คน • เจ้าของห้องตั้งค่า/เตะผู้เล่นได้ก่อนเริ่ม
        </motion.div>
      </div>

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
