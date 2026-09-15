import React from 'react';
import { Bookmark, CheckCircle2, XCircle, Sparkles, RotateCcw, Lightbulb } from 'lucide-react';
import { Question, ThemeMode } from '../types';

interface QuestionCardProps {
  question: Question;
  selectedOption?: string;
  isFlagged?: boolean;
  isSubmitted: boolean;
  instantFeedback?: boolean;
  onSelectOption: (option: string) => void;
  onClearOption?: () => void;
  onToggleFlag: () => void;
  index: number;
  theme: ThemeMode;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  isFlagged,
  isSubmitted,
  instantFeedback = true,
  onSelectOption,
  onClearOption,
  onToggleFlag,
  index,
  theme,
}) => {
  // Reveal status: If instantFeedback is active, reveal once selected; otherwise reveal on submit
  const isRevealed = instantFeedback ? selectedOption !== undefined : isSubmitted;
  const isCorrect = isRevealed && selectedOption === question.answer;
  const isWrong = isRevealed && selectedOption !== undefined && selectedOption !== question.answer;
  const isUnanswered = isSubmitted && !selectedOption;

  const isDark = theme === 'dark';

  const renderQuestionText = (text: string) => {
    if (text.includes('___')) {
      const parts = text.split('___');
      return (
        <span>
          {parts[0]}
          <span
            className={`inline-block px-3 py-0.5 mx-1 font-mono font-bold rounded border-b-2 transition-colors ${
              isRevealed
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
                  : 'bg-stone-100 text-stone-900 border-stone-600'
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

  const optionLetters = ['A', 'B', 'C', 'D'];

  // Card container dynamic styling
  let cardBorder = isDark ? 'border-zinc-800/80 bg-[#161821]' : 'border-stone-200 bg-white';
  if (isRevealed) {
    if (isCorrect) {
      cardBorder = isDark 
        ? 'border-emerald-700/80 bg-[#12231c] ring-1 ring-emerald-500/30' 
        : 'border-emerald-400 ring-1 ring-emerald-200 bg-emerald-50/20';
    } else if (isWrong) {
      cardBorder = isDark 
        ? 'border-rose-700/80 bg-[#25151a] ring-1 ring-rose-500/30' 
        : 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20';
    }
  }

  return (
    <div
      id={`question-card-${question.id}`}
      className={`relative rounded-2xl transition-all duration-200 p-5 sm:p-6 border shadow-xs ${cardBorder}`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${
              isDark
                ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                : 'bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            ข้อที่ {index + 1} (Q{question.id})
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              isDark
                ? 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}
          >
            {question.topic}
          </span>
          <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
            {question.category}
          </span>
        </div>

        {/* Flag button & Reset button */}
        <div className="flex items-center gap-1.5">
          {isRevealed && onClearOption && (
            <button
              type="button"
              onClick={onClearOption}
              className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition ${
                isDark
                  ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-700/60'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200'
              }`}
              title="ลองตอบข้อนี้ใหม่อีกครั้ง"
              aria-label={`Retry question ${question.id}`}
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">ทำใหม่</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleFlag}
            id={`flag-btn-${question.id}`}
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md transition ${
              isFlagged
                ? isDark
                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                : isDark
                ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
            }`}
            title={isFlagged ? 'ยกเลิกการติดดาว' : 'ติดดาวทบทวน'}
            aria-label={isFlagged ? `Unflag question ${question.id}` : `Flag question ${question.id}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span className="hidden sm:inline">{isFlagged ? 'ทบทวน' : 'ติดดาว'}</span>
          </button>
        </div>
      </div>

      {/* Question Prompt */}
      <h3
        className={`text-base sm:text-lg font-semibold leading-snug mb-4 ${
          isDark ? 'text-zinc-100' : 'text-stone-900'
        }`}
      >
        <span className={`font-normal mr-2 ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>
          {index + 1}.
        </span>
        {renderQuestionText(question.question)}
      </h3>

      {/* Options List */}
      <div className="space-y-2.5" role="radiogroup" aria-label={`Options for question ${question.id}`}>
        {question.options.map((option, optIdx) => {
          const isSelected = selectedOption === option;
          const isThisOptionCorrect = isRevealed && option === question.answer;
          const isThisOptionWrongSelected = isRevealed && isSelected && option !== question.answer;

          let optionStyle = isDark
            ? 'border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-800/80 text-zinc-200'
            : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100/90 text-stone-800';

          if (!isRevealed) {
            if (isSelected) {
              optionStyle = isDark
                ? 'border-amber-500 bg-amber-500/15 text-amber-200 font-semibold ring-1 ring-amber-500/30'
                : 'border-stone-800 bg-stone-900 text-white font-medium shadow-xs';
            }
          } else {
            if (isThisOptionCorrect) {
              optionStyle = isDark
                ? 'border-emerald-600 bg-emerald-950/80 text-emerald-200 font-semibold ring-2 ring-emerald-500/50'
                : 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-400';
            } else if (isThisOptionWrongSelected) {
              optionStyle = isDark
                ? 'border-rose-600 bg-rose-950/80 text-rose-200 font-semibold ring-2 ring-rose-500/50'
                : 'border-rose-400 bg-rose-50 text-rose-950 font-semibold ring-2 ring-rose-300';
            } else {
              optionStyle = isDark
                ? 'border-zinc-800/50 bg-zinc-900/20 text-zinc-500 opacity-50'
                : 'border-stone-200 bg-stone-50/40 text-stone-400 opacity-60';
            }
          }

          return (
            <label
              key={option}
              id={`option-label-${question.id}-${optIdx}`}
              className={`flex items-center justify-between p-3 sm:px-4 rounded-xl border text-sm cursor-pointer transition-all select-none ${optionStyle}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    !isRevealed
                      ? isSelected
                        ? isDark
                          ? 'bg-amber-400 text-zinc-950'
                          : 'bg-white text-stone-950'
                        : isDark
                        ? 'bg-zinc-800 border border-zinc-700 text-zinc-300'
                        : 'bg-white border border-stone-300 text-stone-600'
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
                <span className="leading-tight font-medium">{option}</span>
              </div>

              {/* Radio input */}
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={isSelected}
                onChange={() => onSelectOption(option)}
                className="sr-only"
                id={`radio-${question.id}-${optIdx}`}
              />

              {/* Result Indicator Badge */}
              {isRevealed && (
                <div className="shrink-0 ml-2">
                  {isThisOptionCorrect && (
                    <span
                      className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        isDark ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-700' : 'text-emerald-800 bg-emerald-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ถูกต้อง
                    </span>
                  )}
                  {isThisOptionWrongSelected && (
                    <span
                      className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        isDark ? 'text-rose-300 bg-rose-950/80 border border-rose-700' : 'text-rose-800 bg-rose-100'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      ที่คุณเลือก
                    </span>
                  )}
                </div>
              )}
            </label>
          );
        })}
      </div>

      {/* Unanswered banner when user manually submitted without choosing */}
      {isUnanswered && (
        <div
          className={`mt-3.5 p-3 rounded-xl border flex items-center gap-2 text-xs ${
            isDark
              ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            ยังไม่ได้ตอบข้อนี้ คำตอบที่ถูกต้องคือ: <strong>"{question.answer}"</strong>
          </span>
        </div>
      )}

      {/* Detailed Thai Explanation & Grammar Rule Box */}
      {isRevealed && (
        <div
          className={`mt-4 pt-4 border-t animate-in fade-in duration-200 ${
            isDark ? 'border-zinc-800' : 'border-stone-200/80'
          }`}
        >
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm space-y-2.5 ${
              isDark
                ? isCorrect
                  ? 'bg-emerald-950/30 border-emerald-900/60 text-zinc-300'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
                : isCorrect
                ? 'bg-emerald-50/60 border-emerald-200 text-stone-800'
                : 'bg-stone-50 border-stone-200/90 text-stone-800'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-md bg-amber-500/15 text-amber-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1.5 flex-1">
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
                    isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-200/70 text-stone-700'
                  }`}>
                    {question.ruleSummary}
                  </span>
                </div>

                <p className={`text-xs sm:text-[13px] leading-relaxed ${isDark ? 'text-zinc-300' : 'text-stone-700'}`}>
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
