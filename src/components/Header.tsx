import React from 'react';
import { 
  BookOpen, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Layers, 
  Sparkles, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Flame,
  LayoutGrid,
  ChevronDown,
  History,
  Shuffle,
  Home,
  User,
  LogOut,
  Edit3
} from 'lucide-react';
import { QuizViewMode, ThemeMode } from '../types';
import { supabaseSim } from '../utils/supabaseSim';

interface HeaderProps {
  currentSubjectName: string;
  totalQuestionsInBatch: number;
  totalQuestionsInBank: number;
  completedBankCount: number;
  answeredCount: number;
  correctCount: number;
  viewMode: QuizViewMode;
  onToggleViewMode: (mode: QuizViewMode) => void;
  onOpenGuide: () => void;
  onOpenSubjectSelector: () => void;
  onOpenHistory: () => void;
  onResetBatch: () => void;
  onShowSummary: () => void;
  onReshuffleBatch: () => void;
  onBatchSizeChange: (size: number) => void;
  currentBatchSize: number;
  secondsElapsed: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  streakCount: number;
  onBackToHome: () => void;
  username?: string;
  onLogout?: () => void;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSubjectName,
  totalQuestionsInBatch,
  totalQuestionsInBank,
  completedBankCount,
  answeredCount,
  correctCount,
  viewMode,
  onToggleViewMode,
  onOpenGuide,
  onOpenSubjectSelector,
  onOpenHistory,
  onResetBatch,
  onShowSummary,
  onReshuffleBatch,
  onBatchSizeChange,
  currentBatchSize,
  secondsElapsed,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  streakCount,
  onBackToHome,
  username,
  onLogout,
  onOpenProfile,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const isDark = theme === 'dark';
  const progressPercent = totalQuestionsInBatch > 0 ? Math.round((answeredCount / totalQuestionsInBatch) * 100) : 0;
  const bankPercent = totalQuestionsInBank > 0 ? Math.round((completedBankCount / totalQuestionsInBank) * 100) : 0;

  return (
    <header
      className={`sticky top-0 z-40 transition-colors backdrop-blur-md border-b ${
        isDark
          ? 'bg-[#0f1117]/95 border-zinc-800 text-zinc-100'
          : 'bg-white/95 border-stone-200 text-stone-900'
      }`}
      id="app-header"
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        {/* Left Branding, Subject Picker & Bank Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Back to Home Button */}
              <button
                onClick={onBackToHome}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black border transition active:scale-95 ${
                  isDark
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-600'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200 hover:border-stone-300'
                }`}
                title="กลับสู่หน้าแรก (WINTER Prep Hub)"
                id="back-to-home-btn"
              >
                <Home className="w-3.5 h-3.5 text-amber-500" />
                <span>กลับหน้าแรก</span>
              </button>

              {/* Subject Switch Button */}
              <button
                onClick={onOpenSubjectSelector}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition active:scale-95 ${
                  isDark
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border-amber-500/40'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                }`}
                title="คลิกเพื่อเลือกวิชาหรือเปลี่ยนจำนวนข้อ"
                id="switch-subject-btn"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                <span>เปลี่ยนวิชา / จำนวนข้อ</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {/* Creator Credit Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide transition-all ${
                  isDark
                    ? 'bg-amber-950/70 text-amber-300 border border-amber-800/80 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
                title="สร้างสรรค์โดย WINTER"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>โดย WINTER</span>
              </span>

              {/* Streak Badge */}
              {streakCount >= 2 && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-orange-500/15 text-orange-500 border border-orange-500/30 animate-pulse"
                  title="ตอบถูกต่อเนื่อง"
                >
                  <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                  <span>{streakCount} คอมโบ! 🔥</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-1.5">
                <span>{currentSubjectName}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                  isDark ? 'bg-zinc-800 text-amber-400' : 'bg-stone-100 text-stone-700'
                }`}>
                  สุ่มรอบละ {totalQuestionsInBatch} ข้อ
                </span>
              </h1>
            </div>
          </div>

          {/* Quick Bank History & Batch Size Picker */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
            {/* Completed Bank Pool Trigger */}
            <button
              onClick={onOpenHistory}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                isDark
                  ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                  : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-800'
              }`}
              title="ดูประวัติข้อที่เคยทำแล้วทั้งหมด"
              id="header-history-btn"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>ทำแล้ว {completedBankCount}/{totalQuestionsInBank} ข้อ</span>
              <span className="text-[10px] opacity-75 font-normal">({bankPercent}%)</span>
            </button>

            {/* Batch Size Quick Dropdown */}
            <div
              className={`flex items-center rounded-lg p-0.5 border text-xs ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-stone-100 border-stone-200'
              }`}
            >
              {[10, 20, 40].map((size) => (
                <button
                  key={size}
                  onClick={() => onBatchSizeChange(size)}
                  className={`px-2 py-1 rounded-md font-semibold transition ${
                    currentBatchSize === size
                      ? isDark
                        ? 'bg-zinc-800 text-amber-300 shadow-xs'
                        : 'bg-white text-stone-950 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={`สุ่มชุดละ ${size} ข้อ`}
                >
                  {size} ข้อ
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right Controls */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
          {/* Timer */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
              isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-stone-100 text-stone-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 opacity-60" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          {/* Live Score & Batch Progress */}
          <div
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                : 'bg-stone-100 border-stone-200 text-stone-700'
            }`}
          >
            <span>
              ตอบถูก: <strong className="text-emerald-400 font-bold">{correctCount}</strong>/{answeredCount} ข้อ
            </span>
            <div
              className={`w-10 h-1.5 rounded-full overflow-hidden ${
                isDark ? 'bg-zinc-800' : 'bg-stone-200'
              }`}
            >
              <div
                className={`h-full transition-all duration-300 ${
                  isDark ? 'bg-amber-400' : 'bg-stone-800'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Shuffle Batch Button */}
          <button
            onClick={onReshuffleBatch}
            className={`p-1.5 rounded-lg border transition ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800'
                : 'bg-white border-stone-200 text-stone-600 hover:text-amber-900 hover:bg-stone-50'
            }`}
            title="สุ่มสลับโจทย์ในรอบนี้ใหม่"
            aria-label="Reshuffle"
            id="reshuffle-btn"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg border transition ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
            title={soundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
            aria-label="Toggle Sound"
            id="sound-toggle-btn"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 opacity-50" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg border transition ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-amber-400 hover:bg-zinc-800'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
            title={isDark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด (ถนอมสายตา)'}
            aria-label="Toggle Dark Mode"
            id="theme-toggle-btn"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* User Profile & Logout Controls */}
          {username && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenProfile}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition active:scale-95 ${
                  isDark
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20'
                    : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100 shadow-2xs'
                }`}
                title="แก้ไขโปรไฟล์ส่วนตัว"
                id="user-profile-btn"
              >
                <img
                  src={supabaseSim.getProfile(username).avatar}
                  alt={username}
                  className="w-4 h-4 rounded-full object-cover ring-1 ring-amber-400"
                />
                <span className="max-w-[80px] sm:max-w-[100px] truncate font-black">{username}</span>
                <Edit3 className="w-3 h-3 text-amber-400 opacity-80" />
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className={`flex items-center gap-1 p-1.5 rounded-lg border text-xs font-bold transition active:scale-95 ${
                    isDark
                      ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20'
                      : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 shadow-2xs'
                  }`}
                  title="ออกจากระบบ"
                  id="user-logout-btn"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="hidden md:inline text-[11px]">ออก</span>
                </button>
              )}
            </div>
          )}

          {/* View mode toggle */}
          <div
            className={`flex items-center rounded-lg p-0.5 border text-xs ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-stone-100 border-stone-200'
            }`}
          >
            <button
              onClick={() => onToggleViewMode('all')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition ${
                viewMode === 'all'
                  ? isDark
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'bg-white text-stone-900 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              id="view-all-mode-btn"
              title="ดูข้อสอบแบบรายการทั้งหมด"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">รายการ</span>
            </button>
            <button
              onClick={() => onToggleViewMode('single')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition ${
                viewMode === 'single'
                  ? isDark
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'bg-white text-stone-900 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              id="view-single-mode-btn"
              title="ดูข้อสอบแบบทีละข้อ (โฟกัส)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ทีละข้อ</span>
            </button>
          </div>

          {/* Dynamic Subject Study Guide */}
          <button
            onClick={onOpenGuide}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition shadow-2xs ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
            id="grammar-guide-btn"
            title={`เปิดคู่มือสรุปเนื้อหาวิชา ${currentSubjectName}`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {currentSubjectName.includes('อังกฤษ') ? 'สรุปไวยากรณ์' : `สรุป${currentSubjectName}`}
            </span>
          </button>

          {/* Reset Current Batch Button */}
          <button
            onClick={onResetBatch}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition shadow-2xs ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
            id="reset-quiz-btn"
            title="ล้างคำตอบในรอบปัจจุบัน"
          >
            <RefreshCw className="w-3.5 h-3.5 opacity-60" />
            <span className="hidden sm:inline">รีเซ็ต</span>
          </button>

          {/* View Summary Action */}
          <button
            onClick={onShowSummary}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition active:scale-98 shadow-xs ${
              isDark
                ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
            id="summary-header-btn"
            title="ดูสรุปคะแนนและผลวิเคราะห์ทั้งหมด"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>สรุปผล</span>
          </button>
        </div>
      </div>
    </header>
  );
};
