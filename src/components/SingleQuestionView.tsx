import React from 'react';
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, Flame, Sparkles, XCircle, RotateCcw } from 'lucide-react';
import { Question, ThemeMode } from '../types';

interface SingleQuestionViewProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedOption?: string;
  isFlagged?: boolean;
  isSubmitted: boolean;
  instantFeedback?: boolean;
  onSelectOption: (option: string) => void;
  onClearOption?: () => void;
  onToggleFlag: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  theme: ThemeMode;
  streakCount: number;
}

export const SingleQuestionView: React.FC<SingleQuestionViewProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  isFlagged,
  isSubmitted,
  instantFeedback = true,
  onSelectOption,
  onClearOption,
  onToggleFlag,
  onNext,
  onPrev,
  onSubmit,
  theme,
  streakCount,
}) => {
  const isDark = theme === 'dark';
  const showFeedback = instantFeedback ? selectedOption !== undefined : isSubmitted;
  const isCorrect = showFeedback && selectedOption === question.answer;
  const isWrong = showFeedback && selectedOption !== undefined && selectedOption !== question.answer;

  const optionLetters = ['A', 'B', 'C', 'D'];

  const renderQuestionText = (text: string) => {
    if (text.includes('___')) {
      const parts = text.split('___');
      return (
        <span>
          {parts[0]}
          <span
            className={`inline-block px-3.5 py-1 mx-1 font-mono font-bold rounded-lg border-b-2 transition-all ${
              showFeedback
                ? isCorrect
                  ? isDark
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-600'
                  : isDark
                  ? 'bg-rose-950/80 text-rose-300 border-rose-400'
                  : 'bg-rose-100 text-rose-900 border-rose-600'
                : selectedOption
                ? isDark
                  ? 'bg-zinc-800 text-amber-300 border-amber-400'
                  : 'bg-stone-100 text-stone-900 border-stone-800'
                : isDark
                ? 'bg-zinc-800 text-zinc-400 border-zinc-600'
                : 'bg-stone-100 text-stone-400 border-stone-300'
            }`}
          >
            {selectedOption || '_______'}
          </span>
          {parts[1]}
        </span>
      );
    }
    return <span>{text}</span>;
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div
      className={`rounded-2xl border p-6 sm:p-8 shadow-xs max-w-3xl mx-auto transition-colors ${
        isDark ? 'bg-[#161821] border-zinc-800 text-zinc-100' : 'bg-white border-stone-200 text-stone-900'
      }`}
      id="single-question-view"
    >
      {/* Top Navigation Bar */}
      <div
        className={`flex items-center justify-between gap-3 mb-6 pb-4 border-b ${
          isDark ? 'border-zinc-800/80' : 'border-stone-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
              isDark ? 'bg-amber-400 text-zinc-950 font-extrabold' : 'bg-stone-900 text-white'
            }`}
          >
            ข้อที่ {currentIndex + 1} จาก {totalQuestions}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
              isDark
                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300'
                : 'bg-stone-100 border-stone-200 text-stone-700'
            }`}
          >
            {question.topic}
          </span>
          {streakCount >= 2 && (
            <span className="flex items-center gap-1 text-xs font-bold text-orange-500 animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-orange-500" />
              <span>{streakCount} ข้อติด! 🔥</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showFeedback && onClearOption && (
            <button
              onClick={onClearOption}
              className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 transition ${
                isDark
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
              }`}
              title="ลองตอบข้อนี้ใหม่อีกครั้ง"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ทำใหม่</span>
            </button>
          )}

          <button
            onClick={onToggleFlag}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
              isFlagged
                ? isDark
                  ? 'bg-amber-950 border-amber-700 text-amber-300'
                  : 'bg-amber-100 border-amber-300 text-amber-900'
                : isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
            title={isFlagged ? 'ยกเลิกการติดดาว' : 'ติดดาวทบทวน'}
            aria-label={isFlagged ? `Unflag question ${question.id}` : `Flag question ${question.id}`}
            id={`single-flag-btn-${question.id}`}
          >
            <Bookmark className={`w-4 h-4 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span className="hidden sm:inline">{isFlagged ? 'ทบทวน' : 'ติดดาว'}</span>
          </button>
        </div>
      </div>

      {/* Question Headline */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold leading-snug">
          {renderQuestionText(question.question)}
        </h2>
      </div>

      {/* Options List */}
      <div className="space-y-3 mb-6" role="radiogroup">
        {question.options.map((option, optIdx) => {
          const isSelected = selectedOption === option;
          const isThisOptionCorrect = showFeedback && option === question.answer;
          const isThisOptionWrongSelected = showFeedback && isSelected && option !== question.answer;

          let optionStyle = isDark
            ? 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-200'
            : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-900';

          if (!showFeedback) {
            if (isSelected) {
              optionStyle = isDark
                ? 'border-amber-400 bg-amber-500/15 text-amber-200 font-bold ring-1 ring-amber-400/40'
                : 'border-stone-900 bg-stone-900 text-white font-semibold shadow-xs';
            }
          } else {
            if (isThisOptionCorrect) {
              optionStyle = isDark
                ? 'border-emerald-600 bg-emerald-950/80 text-emerald-200 font-bold ring-2 ring-emerald-500/50'
                : 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400';
            } else if (isThisOptionWrongSelected) {
              optionStyle = isDark
                ? 'border-rose-600 bg-rose-950/80 text-rose-200 font-bold ring-2 ring-rose-500/50'
                : 'border-rose-400 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-300';
            } else {
              optionStyle = isDark
                ? 'border-zinc-800/40 bg-zinc-900/10 text-zinc-500 opacity-40'
                : 'border-stone-200 bg-stone-50/50 text-stone-400 opacity-50';
            }
          }

          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelectOption(option)}
              className={`w-full text-left flex items-center justify-between p-4 rounded-xl border text-base cursor-pointer transition-all ${optionStyle}`}
              id={`single-option-btn-${question.id}-${optIdx}`}
            >
              <div className="flex items-center gap-3.5 flex-1">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    !showFeedback
                      ? isSelected
                        ? isDark
                          ? 'bg-amber-400 text-zinc-950'
                          : 'bg-white text-stone-950'
                        : isDark
                        ? 'bg-zinc-800 border border-zinc-700 text-zinc-300'
                        : 'bg-white border border-stone-300 text-stone-700'
                      : isThisOptionCorrect
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isThisOptionWrongSelected
                      ? 'bg-rose-600 text-white shadow-xs'
                      : isDark
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  }`}
                >
                  {optionLetters[optIdx]}
                </span>
                <span className="font-semibold text-sm sm:text-base">{option}</span>
              </div>

              {showFeedback && (
                <div className="shrink-0 ml-2">
                  {isThisOptionCorrect && (
                    <span
                      className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                        isDark ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-700' : 'text-emerald-800 bg-emerald-100'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      คำตอบที่ถูกต้อง
                    </span>
                  )}
                  {isThisOptionWrongSelected && (
                    <span
                      className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                        isDark ? 'text-rose-300 bg-rose-950/80 border border-rose-700' : 'text-rose-800 bg-rose-100'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-rose-500" />
                      ตัวเลือกที่คุณตอบ
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation banner with detailed Thai explanation */}
      {showFeedback && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm space-y-2 animate-in fade-in duration-200 ${
            isDark
              ? isCorrect
                ? 'bg-emerald-950/30 border-emerald-900/60 text-zinc-300'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
              : isCorrect
              ? 'bg-emerald-50/70 border-emerald-200 text-stone-800'
              : 'bg-stone-50 border-stone-200 text-stone-800'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-md bg-amber-500/15 text-amber-400 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span
                  className={`font-bold text-xs sm:text-sm ${
                    isCorrect
                      ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                      : isDark ? 'text-amber-400' : 'text-amber-800'
                  }`}
                >
                  💡 ทำไมถึงตอบ "{question.answer}"?
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-200 text-stone-700'
                }`}>
                  {question.ruleSummary}
                </span>
              </div>
              <p className={`leading-relaxed text-xs sm:text-sm ${isDark ? 'text-zinc-300' : 'text-stone-700'}`}>
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div
        className={`flex items-center justify-between pt-4 border-t ${
          isDark ? 'border-zinc-800/80' : 'border-stone-100'
        }`}
      >
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
            currentIndex === 0
              ? 'opacity-30 cursor-not-allowed border-zinc-800 text-zinc-600'
              : isDark
              ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800'
              : 'bg-white border-stone-300 text-stone-800 hover:bg-stone-100'
          }`}
          id="single-prev-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ข้อก่อนหน้า</span>
        </button>

        <span className="text-xs text-zinc-500 font-medium hidden sm:inline">
          กด 1–4 เพื่อเลือกตอบ • ← / → เพื่อเปลี่ยนข้อ
        </span>

        {isLastQuestion ? (
          <button
            onClick={onSubmit}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-xs transition active:scale-95 ${
              isDark
                ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300 font-extrabold'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
            id="single-submit-btn"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ดูผลสรุปคะแนน</span>
          </button>
        ) : (
          <button
            onClick={onNext}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold border transition active:scale-95 ${
              isDark
                ? 'bg-amber-400 border-amber-400 text-zinc-950 hover:bg-amber-300'
                : 'bg-stone-900 border-stone-900 text-white hover:bg-stone-800'
            }`}
            id="single-next-btn"
          >
            <span>ข้อถัดไป</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
