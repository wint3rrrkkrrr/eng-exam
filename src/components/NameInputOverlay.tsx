import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, User, ArrowRight, BookOpen, GraduationCap, Camera, Edit3, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabaseSim, DEFAULT_AVATARS, SESSION_TOKEN_KEY, loginAccount, passwordStrength, registerAccount } from '../utils/supabaseSim';
import type { LoginOutcome } from '../utils/supabaseSim';
import { compressAndResizeImage } from '../utils/imageUtils';

// คีย์เก่าที่เคยเก็บ "รหัสผ่านตัวจริง" ไว้ในเครื่อง — เลิกใช้แล้ว (ไม่ปลอดภัย) ให้เบราว์เซอร์/ตัวจัดการรหัสผ่านจำแทน
const LEGACY_SAVED_PW_KEY = 'grammar_quiz_saved_pw_v1';
const LAST_USER_KEY = 'grammar_quiz_last_username_v1';

interface NameInputOverlayProps {
  onSave: (name: string, rememberLogin: boolean) => void;
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  onPlayTap?: () => void;
}

type Mode = 'login' | 'register';

const STRENGTH_LABEL = ['', 'อ่อนมาก', 'พอใช้', 'ดี', 'แข็งแรง'];
const STRENGTH_COLOR = ['bg-zinc-600', 'bg-red-500', 'bg-orange-400', 'bg-lime-400', 'bg-emerald-400'];

function initialUsername(): string {
  try {
    const legacy = localStorage.getItem(LEGACY_SAVED_PW_KEY);
    if (legacy) {
      const u = (JSON.parse(legacy) as { username?: string }).username ?? '';
      localStorage.removeItem(LEGACY_SAVED_PW_KEY); // ลบรหัสผ่านตัวจริงที่เคยเก็บไว้ทิ้งทันที
      if (u) localStorage.setItem(LAST_USER_KEY, u);
    }
    return localStorage.getItem(LAST_USER_KEY) ?? '';
  } catch {
    return '';
  }
}

export const NameInputOverlay: React.FC<NameInputOverlayProps> = ({
  onSave,
  theme,
  soundEnabled,
  onPlayTap,
}) => {
  const [mode, setMode] = useState<Mode>('login');
  const [inputName, setInputName] = useState(initialUsername);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bioInput, setBioInput] = useState('เด็กเตรียมสอบ WINTER 2026 ✌️');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [showAdvancedProfile, setShowAdvancedProfile] = useState(false);
  const [error, setError] = useState('');
  const isDark = theme === 'dark';
  const isRegister = mode === 'register';

  const inputCls = `w-full pl-10 pr-4 py-3 rounded-2xl border text-sm font-bold tracking-wide outline-none transition-all ${
    isDark
      ? 'bg-zinc-900/60 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-amber-400/60 focus:bg-zinc-900'
      : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-stone-400 focus:bg-stone-100/50'
  }`;

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setConfirm('');
  };

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

  const failMessage = (r: LoginOutcome): string => {
    switch (r.reason) {
      case 'wrong_password': return 'ชื่อหรือรหัสผ่านไม่ถูกต้อง ลองใหม่อีกครั้งนะ';
      case 'no_account': return r.messageTh ?? 'ยังไม่มีบัญชีชื่อนี้ — ไปที่แท็บ "สมัครสมาชิก" ก่อน';
      default: return r.messageTh ?? 'ลองใหม่อีกครั้งนะ';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const trimmed = inputName.trim();
    if (!trimmed) return setError('พิมพ์ชื่อผู้ใช้ก่อนนะ');
    if (trimmed.length < 2) return setError('ชื่อสั้นไปหน่อย ต้องมีอย่างน้อย 2 ตัวอักษรนะ');
    if (trimmed.length > 20) return setError('ชื่อยาวเกินไปหน่อย ไม่เกิน 20 ตัวอักษรพอนะ');
    if (!password) return setError('กรอกรหัสผ่านก่อนนะ');
    if (isRegister) {
      if (password.length < 8) return setError('รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษรนะ');
      if (password !== confirm) return setError('รหัสผ่านสองช่องไม่ตรงกัน');
    }

    setSubmitting(true);
    setError('');
    try {
      const result = isRegister ? await registerAccount(trimmed, password) : await loginAccount(trimmed, password);
      if (!result.ok) {
        setError(failMessage(result));
        setSubmitting(false);
        return;
      }

      onPlayTap?.();

      // เก็บ session token (ไม่ใช่รหัสผ่าน) ไว้ให้ระบบกระเป๋าเงิน/ตู้เสื้อผ้าของเกมล็อกอินบัญชีเดียวกันข้ามเครื่อง (ที่เก็บเดียวกับ "จำการเข้าสู่ระบบ")
      try {
        const keep = rememberLogin ? localStorage : sessionStorage;
        const drop = rememberLogin ? sessionStorage : localStorage;
        keep.setItem(SESSION_TOKEN_KEY, result.token ?? '');
        drop.removeItem(SESSION_TOKEN_KEY);
        localStorage.setItem(LAST_USER_KEY, trimmed); // จำแค่ชื่อไว้เติมให้ครั้งหน้า (ไม่เก็บรหัสผ่าน)
      } catch {
        // ไม่เป็นไร — กระเป๋าจะใช้แบบผูกกับเครื่องตามเดิม
      }

      // สมัครใหม่เท่านั้นที่ตั้งรูป/Bio ตามที่เลือก — เข้าสู่ระบบไม่เขียนทับโปรไฟล์เดิมของบัญชี
      if (isRegister) {
        supabaseSim.updateProfile(trimmed, {
          avatar: selectedAvatar,
          bio: bioInput.trim() || 'เด็กเตรียมสอบ WINTER 2026 ✌️',
        });
      }

      onSave(trimmed, rememberLogin);
    } catch {
      setError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้งนะ');
      setSubmitting(false);
    }
  };

  const strength = passwordStrength(password);
  const muted = isDark ? 'text-zinc-500' : 'text-stone-500';

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
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>WINTER PREP HUB ❄️</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-amber-300">
              {isRegister ? 'สร้างบัญชีใหม่ 🚀' : 'ยินดีต้อนรับกลับมา! 👋'}
            </h2>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
              {isRegister ? 'ตั้งชื่อ รหัสผ่าน แล้วเลือกรูปอวตารสุดเท่ได้เลย!' : 'เข้าสู่ระบบด้วยชื่อและรหัสผ่านของคุณ'}
            </p>
          </div>

          {/* แท็บ เข้าสู่ระบบ / สมัครสมาชิก */}
          <div role="tablist" className={`w-full grid grid-cols-2 p-1 rounded-2xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-stone-100 border-stone-200'}`}>
            {([['login', 'เข้าสู่ระบบ'], ['register', 'สมัครสมาชิก']] as const).map(([m, label]) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`py-2.5 rounded-xl text-sm font-black transition-all ${
                  mode === m
                    ? 'bg-amber-400 text-zinc-950 shadow'
                    : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-3.5 text-left" autoComplete="on">
            {/* Avatar Preview (สมัครใหม่เท่านั้น) */}
            {isRegister && (
              <div className="relative group my-1 mx-auto w-20">
                <img src={selectedAvatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-xl" />
                <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-amber-500 text-zinc-950 font-bold shadow-lg cursor-pointer hover:bg-amber-400 transition-all hover:scale-110" aria-label="อัปโหลดรูปโปรไฟล์">
                  <Camera className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            )}

            {/* Name Input */}
            <div>
              <label htmlFor="ww-username" className="block text-xs font-bold text-zinc-400 mb-1">ชื่อผู้ใช้ / ชื่อเล่น</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-4 h-4 opacity-60" />
                </div>
                <input
                  id="ww-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={inputName}
                  onChange={(e) => { setInputName(e.target.value); setError(''); }}
                  placeholder="พิมพ์ชื่อของคุณที่นี่..."
                  className={inputCls}
                  maxLength={20}
                  autoFocus={!inputName}
                />
              </div>
              {isRegister && <p className={`mt-1 text-[10px] ${muted}`}>2–20 ตัวอักษร · ชื่อซ้ำไม่ได้ (ไม่สนตัวพิมพ์ใหญ่-เล็ก)</p>}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="ww-password" className="block text-xs font-bold text-zinc-400 mb-1">รหัสผ่าน</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4 opacity-60" />
                </div>
                <input
                  id="ww-password"
                  name={isRegister ? 'new-password' : 'password'}
                  type={showPw ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder={isRegister ? 'ตั้งรหัสผ่าน (อย่างน้อย 8 ตัว)' : 'กรอกรหัสผ่านของคุณ'}
                  className={`${inputCls} pr-12`}
                  maxLength={100}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  aria-pressed={showPw}
                  className="absolute inset-y-0 right-0 px-3.5 flex items-center text-zinc-400 hover:text-amber-400 cursor-pointer"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isRegister && password.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2" aria-live="polite">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength ? STRENGTH_COLOR[strength] : isDark ? 'bg-zinc-800' : 'bg-stone-200'}`} />)}
                  </div>
                  <span className={`text-[10px] font-bold ${muted}`}>{STRENGTH_LABEL[strength]}</span>
                </div>
              )}
            </div>

            {/* ยืนยันรหัสผ่าน (สมัครใหม่) */}
            {isRegister && (
              <div>
                <label htmlFor="ww-confirm" className="block text-xs font-bold text-zinc-400 mb-1">ยืนยันรหัสผ่านอีกครั้ง</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="w-4 h-4 opacity-60" />
                  </div>
                  <input
                    id="ww-confirm"
                    name="confirm-password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                    placeholder="พิมพ์รหัสผ่านเดิมซ้ำ"
                    className={inputCls}
                    maxLength={100}
                  />
                </div>
                {confirm.length > 0 && confirm !== password && <p className="mt-1 text-[10px] font-bold text-red-400">รหัสผ่านสองช่องยังไม่ตรงกัน</p>}
              </div>
            )}

            {/* จำการเข้าสู่ระบบ */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold">
              <input
                type="checkbox"
                checked={rememberLogin}
                onChange={(e) => setRememberLogin(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
              />
              <span className={isDark ? 'text-zinc-300' : 'text-stone-700'}>จำการเข้าสู่ระบบ (ไม่ต้องล็อกอินใหม่ทุกครั้ง)</span>
            </label>
            <p className={`text-[10px] -mt-1.5 ${muted}`}>
              🔒 อยากให้จำรหัสผ่านให้ → กด "บันทึก/Save" เมื่อเบราว์เซอร์ถาม (เราไม่เก็บรหัสผ่านของคุณไว้ในเครื่อง)
            </p>

            {isRegister && (
              <>
                {/* Bio Input */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">สถานะประจำตัว (Bio)</label>
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
                    <label className="block text-xs font-bold text-zinc-400">เลือกรูปโปรไฟล์สำเร็จรูป</label>
                    <button type="button" onClick={() => setShowAdvancedProfile(!showAdvancedProfile)} className="text-[11px] font-bold text-amber-400 hover:underline">
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
                          selectedAvatar === imgUrl ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-100'
                        }`}
                      >
                        <img src={imgUrl} alt={`Preset ${i}`} className="w-full h-full object-cover rounded-full" />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {error && (
              <motion.p
                role="alert"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-bold text-red-500 text-left pt-1"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full group inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm tracking-wider transition-all duration-300 transform active:scale-98 shadow-md hover:scale-[1.02] mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                isDark ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-amber-500/10' : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'สมัครสมาชิก & ลุยกันเลย!' : 'เข้าสู่ระบบ & ลุยกันเลย!'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className={`text-center text-[11px] ${muted}`}>
              {isRegister ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'}{' '}
              <button type="button" onClick={() => switchMode(isRegister ? 'login' : 'register')} className="font-black text-amber-400 hover:underline">
                {isRegister ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </button>
            </p>
            {!isRegister && <p className={`text-center text-[10px] ${muted}`}>ลืมรหัสผ่าน? ติดต่อแอดมิน (WIN) ให้รีเซ็ตให้</p>}
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
