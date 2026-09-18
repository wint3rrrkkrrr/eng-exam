import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, User, ArrowRight, BookOpen, GraduationCap, Camera, Edit3 } from 'lucide-react';
import logoImage from '../assets/images/winter_exam_logo_1789496745669.jpg';
import { supabaseSim, DEFAULT_AVATARS } from '../utils/supabaseSim';
import { compressAndResizeImage } from '../utils/imageUtils';

interface NameInputOverlayProps {
  onSave: (name: string) => void;
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  onPlayTap?: () => void;
}

export const NameInputOverlay: React.FC<NameInputOverlayProps> = ({
  onSave,
  theme,
  soundEnabled,
  onPlayTap,
}) => {
  const [inputName, setInputName] = useState('');
  const [bioInput, setBioInput] = useState('เด็กเตรียมสอบ WINTER 2026 ✌️');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [showAdvancedProfile, setShowAdvancedProfile] = useState(false);
  const [error, setError] = useState('');
  const isDark = theme === 'dark';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await compressAndResizeImage(file, 250, 250, 0.75);
        setSelectedAvatar(compressedDataUrl);
      } catch (err) {
        console.error('Error compressing image:', err);
        alert('เกิดข้อผิดพลาดในการโหลดรูปภาพ ลองใช้อีกรูปครับ');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed) {
      setError('พิมพ์ชื่อเล่นของคุณก่อนนะ');
      return;
    }
    if (trimmed.length < 2) {
      setError('ชื่อสั้นไปหน่อย ตั้งอย่างน้อย 2 ตัวอักษรนะ');
      return;
    }
    if (trimmed.length > 20) {
      setError('ชื่อยาวเกินไปหน่อย ไม่เกิน 20 ตัวอักษรพอนะ');
      return;
    }

    onPlayTap?.();
    
    // Save custom profile settings
    supabaseSim.updateProfile(trimmed, {
      avatar: selectedAvatar,
      bio: bioInput.trim() || 'เด็กเตรียมสอบ WINTER 2026 ✌️',
    });

    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`w-full max-w-md my-auto p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${
          isDark 
            ? 'bg-[#0e1017] border-zinc-800 text-zinc-100 shadow-[0_10px_40px_rgba(245,158,11,0.08)]' 
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-5 relative z-10">
          {/* Avatar Preview with Camera Overlay */}
          <div className="relative group my-1">
            <img
              src={selectedAvatar}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-xl"
            />
            <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-amber-500 text-zinc-950 font-bold shadow-lg cursor-pointer hover:bg-amber-400 transition-all hover:scale-110">
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>WINTER PREP HUB ❄️</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-amber-300">
              สร้างโปรไฟล์แล้วลุยโจทย์กัน! 🚀
            </h2>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
              ตั้งชื่อ เลือกรูปอวตาร และพิมพ์สถานะสุดเท่ได้เลย!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-3.5 text-left">
            {/* Name Input */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">
                ชื่อผู้เรียน / ชื่อเล่น
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-4 h-4 opacity-60" />
                </div>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => {
                    setInputName(e.target.value);
                    setError('');
                  }}
                  placeholder="พิมพ์ชื่อเล่นของคุณที่นี่..."
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm font-bold tracking-wide outline-none transition-all ${
                    isDark
                      ? 'bg-zinc-900/60 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-amber-400/60 focus:bg-zinc-900'
                      : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-stone-400 focus:bg-stone-100/50'
                  }`}
                  maxLength={20}
                  autoFocus
                />
              </div>
            </div>

            {/* Bio Input */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">
                สถานะประจำตัว (Bio)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Edit3 className="w-4 h-4 opacity-60" />
                </div>
                <input
                  type="text"
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="เช่น อ่านหนังสือวันละ 30 ข้อ!"
                  maxLength={60}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs font-semibold outline-none transition-all ${
                    isDark
                      ? 'bg-zinc-900/60 border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:border-amber-400/60'
                      : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400'
                  }`}
                />
              </div>
            </div>

            {/* Avatar Preset Options */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-zinc-400">
                  เลือกรูปโปรไฟล์สำเร็จรูป
                </label>
                <button
                  type="button"
                  onClick={() => setShowAdvancedProfile(!showAdvancedProfile)}
                  className="text-[11px] font-bold text-amber-400 hover:underline"
                >
                  {showAdvancedProfile ? 'ย่อรูป' : 'ดูรูปทั้งหมด'}
                </button>
              </div>
              <div className={`grid grid-cols-6 gap-2 transition-all ${showAdvancedProfile ? 'max-h-40 overflow-y-auto pr-1' : ''}`}>
                {DEFAULT_AVATARS.slice(0, showAdvancedProfile ? DEFAULT_AVATARS.length : 6).map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedAvatar(imgUrl)}
                    className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all p-0.5 ${
                      selectedAvatar === imgUrl
                        ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:scale-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Preset ${i}`} className="w-full h-full object-cover rounded-full" />
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-bold text-red-500 text-left pt-1"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className={`w-full group inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm tracking-wider transition-all duration-300 transform active:scale-98 shadow-md hover:scale-[1.02] mt-2 ${
                isDark
                  ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-amber-500/10'
                  : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
            >
              <span>บันทึกโปรไฟล์ & ลุยกันเลย!</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="flex items-center justify-center gap-6 pt-1 text-[10px] font-bold text-zinc-500">
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3 text-blue-400" /> คลังข้อสอบ 1,200+ ข้อ</span>
            <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3 text-amber-400" /> อ่านสรุปเนื้อหาเข้าใจง่าย</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

