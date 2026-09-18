import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, UserCheck, Sparkles, Edit3, Save, Smartphone, Calendar, Award } from 'lucide-react';
import { supabaseSim, DEFAULT_AVATARS, UserProfile } from '../utils/supabaseSim';
import { compressAndResizeImage } from '../utils/imageUtils';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  isDark: boolean;
  onProfileUpdated?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  username,
  isDark,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<UserProfile>(() => supabaseSim.getProfile(username));
  const [bioInput, setBioInput] = useState(profile.bio);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen && username) {
      const p = supabaseSim.getProfile(username);
      setProfile(p);
      setBioInput(p.bio);
      setSelectedAvatar(p.avatar);
      setIsSaved(false);
    }
  }, [isOpen, username]);

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

  const handleSave = () => {
    supabaseSim.updateProfile(username, {
      avatar: selectedAvatar,
      bio: bioInput.trim() || 'เด็กเตรียมสอบ WINTER 2026 ✌️',
    });
    setProfile(supabaseSim.getProfile(username));
    setIsSaved(true);
    if (onProfileUpdated) onProfileUpdated();
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl border overflow-hidden ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-stone-200 text-stone-800'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-700/30">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">ปรับแต่งโปรไฟล์ส่วนตัว</h3>
                <p className="text-xs text-zinc-400">แก้ไขรูปและข้อความสถานะของคุณ</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Avatar Preview & Upload */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="relative group">
                <img
                  src={selectedAvatar}
                  alt={username}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400/40 shadow-xl"
                />
                <label className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-500 text-zinc-950 font-bold shadow-lg cursor-pointer hover:bg-amber-400 transition-all hover:scale-105">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
              <div className="text-center">
                <span className="font-black text-lg tracking-wide">{username}</span>
                <p className="text-xs text-amber-500 font-semibold flex items-center justify-center gap-1 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  ผู้เรียน WINTER PREP 2026
                </p>
              </div>
            </div>

            {/* Avatar Presets Selection */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2">
                เลือกรูปโปรไฟล์สำเร็จรูป
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {DEFAULT_AVATARS.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAvatar(imgUrl)}
                    className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all p-0.5 ${
                      selectedAvatar === imgUrl
                        ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100 hover:scale-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Preset ${i}`} className="w-full h-full object-cover rounded-full" />
                  </button>
                ))}
              </div>
            </div>

            {/* Bio Input */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                ข้อความสถานะ (Bio)
              </label>
              <input
                type="text"
                maxLength={60}
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="เช่น อ่านหนังสือวันละ 30 ข้อ!"
                className={`w-full px-4 py-2.5 rounded-xl text-sm border font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                  isDark ? 'bg-zinc-800/60 border-zinc-700 text-zinc-100' : 'bg-stone-50 border-stone-300 text-stone-800'
                }`}
              />
            </div>

            {/* Account Stats Info */}
            <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
              isDark ? 'bg-zinc-800/30 border-zinc-800 text-zinc-400' : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}>
              {(() => {
                const isAdmin = localStorage.getItem('winter_admin_auth_v1') === 'true' || username.trim().toLowerCase() === 'win' || username.trim().toLowerCase() === 'wintararer';
                return isAdmin ? (
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">อุปกรณ์ที่ใช้: {profile.device_info || 'ไม่ระบุ'}</span>
                  </div>
                ) : null;
              })()}
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>ลงทะเบียนเมื่อ: {new Date(profile.joined_at || Date.now()).toLocaleDateString('th-TH')}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-700/30">
            <button
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              {isSaved ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>บันทึกแล้ว!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>บันทึกการเปลี่ยนแปลง</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
