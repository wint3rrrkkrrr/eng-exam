import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, User, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import logoImage from '../assets/images/winter_exam_logo_1789496745669.jpg';

interface NameInputOverlayProps {
  onSave: (name: string) => void;
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  onPlayTap: () => void;
}

export const NameInputOverlay: React.FC<NameInputOverlayProps> = ({
  onSave,
  theme,
  soundEnabled,
  onPlayTap,
}) => {
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState('');
  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed) {
      setError('กรุณากรอกชื่อเล่นหรือนามแฝงของคุณเพื่อดำเนินต่อ');
      return;
    }
    if (trimmed.length < 2) {
      setError('ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร');
      return;
    }
    if (trimmed.length > 20) {
      setError('ชื่อต้องมีความยาวไม่เกิน 20 ตัวอักษร');
      return;
    }

    onPlayTap();
    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${
          isDark 
            ? 'bg-[#0e1017] border-zinc-800 text-zinc-100 shadow-[0_10px_40px_rgba(245,158,11,0.08)]' 
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-6 relative z-10">
          {/* Logo container */}
          <div className="p-3 rounded-full bg-gradient-to-tr from-amber-500/20 to-blue-500/20 border border-amber-500/30">
            <img
              src={logoImage}
              alt="WINTER Prep Hub"
              className="w-16 h-16 rounded-full object-cover border-2 border-amber-400"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>WINTER PREP HUB ❄️</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-amber-300">
              เข้าสู่ระบบคลังข้อสอบอัจฉริยะ
            </h2>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
              กรอกชื่อเล่นหรือนามแฝงของคุณเพื่อเริ่มสะสมคะแนนบน **Leaderboard** แบบเรียลไทม์!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <User className="w-5 h-5 opacity-60" />
              </div>
              <input
                type="text"
                value={inputName}
                onChange={(e) => {
                  setInputName(e.target.value);
                  setError('');
                }}
                placeholder="กรอกชื่อของคุณที่นี่..."
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm font-bold tracking-wide outline-none transition-all ${
                  isDark
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-amber-400/60 focus:bg-zinc-900'
                    : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-stone-400 focus:bg-stone-100/50'
                }`}
                maxLength={20}
                autoFocus
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-bold text-red-500 text-left"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className={`w-full group inline-flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm tracking-wider transition-all duration-300 transform active:scale-98 shadow-md hover:scale-[1.02] ${
                isDark
                  ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-amber-500/10'
                  : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
            >
              <span>ยินดีต้อนรับ เข้าสู่ระบบ</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="flex items-center justify-center gap-6 pt-2 text-[10px] font-bold text-zinc-500">
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3 text-blue-400" /> 1,200 ข้อสอบ</span>
            <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3 text-amber-400" /> สรุปเนื้อหาเจาะลึก</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
