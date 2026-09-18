import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Languages, 
  BookOpen, 
  Atom, 
  Globe, 
  Calculator, 
  Terminal,
  Lightbulb,
  Sparkles, 
  CheckCircle2, 
  PlusCircle,
  Flame,
  Shuffle,
  History,
  X,
  Music
} from 'lucide-react';
import { SubjectInfo, ThemeMode } from '../types';
import { availableSubjects } from '../data/subjectsData';

interface SubjectSelectorProps {
  currentSubjectId: string;
  onSelectSubject: (subjectId: string, batchSize?: number, difficulty?: 'All' | 'Easy' | 'Medium' | 'Hard') => void;
  completedCount: number;
  totalQuestionsInSubject: number;
  theme: ThemeMode;
  onClose?: () => void;
  onOpenHistory?: () => void;
  difficultyFilter: 'All' | 'Easy' | 'Medium' | 'Hard';
  onDifficultyFilterChange: (difficulty: 'All' | 'Easy' | 'Medium' | 'Hard') => void;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  currentSubjectId,
  onSelectSubject,
  completedCount,
  totalQuestionsInSubject,
  theme,
  onClose,
  onOpenHistory,
  difficultyFilter,
  onDifficultyFilterChange,
}) => {
  const [selectedBatchSize, setSelectedBatchSize] = useState<number>(20);

  const getSubjectIcon = (iconName: string, className: string, color: string) => {
    switch (iconName) {
      case 'Languages':
        return <Languages className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Atom':
        return <Atom className={className} />;
      case 'Globe':
        return <Globe className={className} />;
      case 'Calculator':
        return <Calculator className={className} />;
      case 'Terminal':
        return <Terminal className={className} />;
      case 'Lightbulb':
        return <Lightbulb className={className} />;
      case 'Music':
        return <Music className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  const isDark = theme === 'dark';
  const totalReadySubjects = availableSubjects.filter(s => s.isReady).length;
  const totalReadyQuestions = availableSubjects.reduce((sum, s) => sum + (s.isReady ? s.totalQuestions : 0), 0);

  const recommendedIds = ['physics', 'music', 'english-speaking', 'c-programming'];
  const recommendedSubjects = availableSubjects.filter(s => recommendedIds.includes(s.id));
  const otherSubjects = availableSubjects.filter(s => !recommendedIds.includes(s.id));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs"
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 210 }}
        className={`w-full max-w-6xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
          isDark ? 'bg-[#12141c] border-zinc-800 text-zinc-100' : 'bg-white border-stone-200 text-stone-900'
        }`}
        id="subject-selector-modal"
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between gap-4 ${
            isDark ? 'border-zinc-800 bg-[#161823]' : 'border-stone-200 bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isDark ? 'bg-amber-400 text-zinc-950 font-bold' : 'bg-stone-900 text-white'
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <span>เลือกวิชาและจำนวนข้อสอบ</span>
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>สร้างสรรค์โดย WINTER</span>
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                สุ่มข้อสอบจากคลัง ไม่ต้องแยกชุด และตัดโจทย์ที่เคยทำแล้วออกให้อัตโนมัติ
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition ${
                isDark
                  ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                  : 'hover:bg-stone-200 text-stone-500 hover:text-stone-900'
              }`}
              id="close-subject-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Batch Size Selector Option */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-stone-50 border-stone-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block mb-0.5">
                  ตั้งค่าจำนวนข้อสอบต่อรอบ (Random Batch Size)
                </span>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                  เลือกจำนวนข้อที่ต้องการทำในแต่ละรอบ (ระบบจะสุ่มข้อที่ไม่เคยทำมาให้)
                </p>
              </div>

              {completedCount > 0 && onOpenHistory && (
                <button
                  onClick={() => {
                    if (onClose) onClose();
                    onOpenHistory();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    isDark
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border-amber-500/30'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>ดูคลังที่ทำแล้ว ({completedCount}/{totalQuestionsInSubject} ข้อ)</span>
                </button>
              )}
            </div>

            {/* Chips for batch count */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[10, 20, 30, 50, 100].map((count) => {
                const isSelected = selectedBatchSize === count;
                const label = `${count} ข้อ`;
                return (
                  <button
                    key={count}
                    onClick={() => setSelectedBatchSize(count)}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition active:scale-95 flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? isDark
                          ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md font-extrabold'
                          : 'bg-stone-900 text-white border-stone-800 shadow-sm'
                        : isDark
                        ? 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border-zinc-700'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`text-[10px] font-normal ${isSelected ? (isDark ? 'text-zinc-800' : 'text-stone-300') : 'opacity-60'}`}>
                      {count === 10 ? 'ชุดสั้น เร่งด่วน' : count === 20 ? 'กำลังพอดี (แนะนำ)' : count === 30 ? 'ปานกลาง' : count === 50 ? 'ชุดมาตรฐาน' : 'ทั้งคลัง 100 ข้อ'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Level Option */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-stone-50 border-stone-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block mb-0.5">
                  ระดับความยาก (Difficulty Level)
                </span>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                  เลือกเพื่อกรองระดับความยากของข้อสอบในการสุ่มรอบนี้ (มีครบทุกระดับในทุกวิชา)
                </p>
              </div>
            </div>

            {/* Chips for difficulty */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => {
                const isSelected = difficultyFilter === diff;
                const label = diff === 'All' ? 'คละระดับทั้งหมด' : diff === 'Easy' ? 'ง่าย (Easy)' : diff === 'Medium' ? 'ปานกลาง (Medium)' : 'ยาก (Hard)';
                const desc = diff === 'All' ? 'ทุกข้อในคลัง' : diff === 'Easy' ? 'เน้นปรับพื้นฐาน' : diff === 'Medium' ? 'ฝึกความคล่องตัว' : 'ท้าทายโจทย์สอบจริง';

                return (
                  <button
                    key={diff}
                    onClick={() => onDifficultyFilterChange(diff)}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition active:scale-95 flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? isDark
                          ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md font-extrabold'
                          : 'bg-stone-900 text-white border-stone-800 shadow-sm'
                        : isDark
                        ? 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border-zinc-700'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`text-[10px] font-normal ${isSelected ? (isDark ? 'text-zinc-800' : 'text-stone-300') : 'opacity-60'}`}>
                      {desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Cards */}
          <div className="space-y-8">
            {/* 1. Recommended & New Subjects */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                <span className={`text-sm font-black uppercase tracking-wider block ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  วิชาเพิ่มใหม่แนะนำ 🔥 (โดดเด่นแนะนำเป็นพิเศษ)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {recommendedSubjects.map((subject) => {
                  const isSelected = subject.id === currentSubjectId;
                  const isReady = subject.isReady;

                  return (
                    <div
                      key={subject.id}
                      className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between relative overflow-hidden group ${
                        isDark
                          ? isSelected
                            ? 'bg-zinc-900/90 border-amber-400 ring-2 ring-amber-400/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : isReady
                            ? 'bg-zinc-900/60 border-amber-500/30 hover:border-amber-400/60 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:scale-[1.01]'
                            : 'bg-zinc-900/20 border-zinc-800/60 opacity-75'
                          : isSelected
                          ? 'bg-amber-50/10 border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                          : isReady
                          ? 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-md hover:scale-[1.01]'
                          : 'bg-stone-50 border-stone-200/80 opacity-75'
                      }`}
                    >
                      {/* NEW Ribbon tag */}
                      <div className="absolute top-0 right-0 z-10">
                        <span className="inline-flex items-center gap-0.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-bl-xl shadow-xs">
                          NEW
                        </span>
                      </div>

                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                              subject.id === 'english' || subject.id === 'english-speaking'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : subject.id === 'biology'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : subject.id === 'history' || subject.id === 'music'
                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                                : subject.id === 'math'
                                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                                : subject.id === 'c-programming'
                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                : subject.id === 'physics'
                                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                            }`}
                          >
                            {getSubjectIcon(subject.icon, 'w-5 h-5', subject.color)}
                          </div>

                          {isReady ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>คลัง {subject.totalQuestions} ข้อ</span>
                            </span>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                              isDark ? 'bg-zinc-800/80 text-zinc-400 border-zinc-700' : 'bg-stone-100 text-stone-500 border-stone-200'
                            }`}>
                              พร้อมรับเนื้อหาเพิ่ม
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold mb-1 pr-6">
                          {subject.name}
                        </h3>
                        <div className={`text-xs font-medium mb-2 ${isDark ? 'text-amber-400/90' : 'text-amber-700'}`}>
                          {subject.nameEn}
                        </div>
                        <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                          {subject.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800/60">
                        {isReady ? (
                          <button
                            onClick={() => {
                              onSelectSubject(subject.id, selectedBatchSize, difficultyFilter);
                              if (onClose) onClose();
                            }}
                            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition active:scale-98 flex items-center justify-center gap-2 ${
                              isSelected
                                ? isDark
                                  ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold shadow-sm'
                                  : 'bg-stone-900 hover:bg-stone-800 text-white'
                                : isDark
                                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300'
                            }`}
                          >
                            <Shuffle className="w-3.5 h-3.5" />
                            <span>{isSelected ? `สุ่มข้อสอบ (${selectedBatchSize} ข้อ)` : `เลือกวิชานี้ (${selectedBatchSize} ข้อ)`}</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-between py-1 text-xs">
                            <span className={isDark ? 'text-zinc-500' : 'text-stone-400'}>
                              ส่งข้อสอบเพิ่มเติมได้ทันที
                            </span>
                            <span className="font-semibold text-amber-500 flex items-center gap-1">
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>รอโจทย์ใหม่</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Standard / Other Subjects */}
            <div className="space-y-3">
              <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                วิชามาตรฐานอื่นๆ 📚 (คลังเนื้อหาหลักดั้งเดิม)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {otherSubjects.map((subject) => {
                  const isSelected = subject.id === currentSubjectId;
                  const isReady = subject.isReady;

                  return (
                    <div
                      key={subject.id}
                      className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between ${
                        isDark
                          ? isSelected
                            ? 'bg-zinc-900/90 border-amber-500/60 ring-2 ring-amber-500/20 shadow-lg'
                            : isReady
                            ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                            : 'bg-zinc-900/20 border-zinc-800/60 opacity-75'
                          : isSelected
                          ? 'bg-white border-amber-500/80 ring-2 ring-amber-500/20 shadow-md'
                          : isReady
                          ? 'bg-white border-stone-200 hover:border-stone-300'
                          : 'bg-stone-50 border-stone-200/80 opacity-75'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                              subject.id === 'english' || subject.id === 'english-speaking'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : subject.id === 'biology'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : subject.id === 'history' || subject.id === 'music'
                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                                : subject.id === 'math'
                                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                                : subject.id === 'c-programming'
                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                : subject.id === 'physics'
                                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                            }`}
                          >
                            {getSubjectIcon(subject.icon, 'w-5 h-5', subject.color)}
                          </div>

                          {isReady ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>คลัง {subject.totalQuestions} ข้อ</span>
                            </span>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                              isDark ? 'bg-zinc-800/80 text-zinc-400 border-zinc-700' : 'bg-stone-100 text-stone-500 border-stone-200'
                            }`}>
                              พร้อมรับเนื้อหาเพิ่ม
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold mb-1">
                          {subject.name}
                        </h3>
                        <div className={`text-xs font-medium mb-2 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                          {subject.nameEn}
                        </div>
                        <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                          {subject.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800/60">
                        {isReady ? (
                          <button
                            onClick={() => {
                              onSelectSubject(subject.id, selectedBatchSize, difficultyFilter);
                              if (onClose) onClose();
                            }}
                            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition active:scale-98 flex items-center justify-center gap-2 ${
                              isSelected
                                ? isDark
                                  ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold shadow-sm'
                                  : 'bg-stone-900 hover:bg-stone-800 text-white'
                                : isDark
                                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300'
                            }`}
                          >
                            <Shuffle className="w-3.5 h-3.5" />
                            <span>{isSelected ? `สุ่มข้อสอบ (${selectedBatchSize} ข้อ)` : `เลือกวิชานี้ (${selectedBatchSize} ข้อ)`}</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-between py-1 text-xs">
                            <span className={isDark ? 'text-zinc-500' : 'text-stone-400'}>
                              ส่งข้อสอบเพิ่มเติมได้ทันที
                            </span>
                            <span className="font-semibold text-amber-500 flex items-center gap-1">
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>รอโจทย์ใหม่</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t text-center text-xs flex items-center justify-between gap-2 flex-wrap ${
            isDark ? 'border-zinc-800 bg-[#161823] text-zinc-400' : 'border-stone-200 bg-stone-50 text-stone-500'
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            <span>คลังข้อสอบและแบบฝึกหัดอัจฉริยะ {totalReadySubjects} วิชา ({totalReadyQuestions} ข้อ)</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-bold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>สร้างสรรค์โดย WINTER</span>
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs transition ${
                isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-stone-200 hover:bg-stone-300 text-stone-800'
              }`}
            >
              เข้าสู่แบบทดสอบ
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
