import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, CheckCircle2, XCircle, Sparkles, RotateCcw, Lightbulb, AlertTriangle } from 'lucide-react';
import { Question, ThemeMode } from '../types';
import { getQuestionDifficulty } from '../utils/difficulty';
import { DynamicScienceDiagram } from './DynamicScienceDiagram';

const formatOptionText = (option: string, isMath: boolean): string => {
  if (!isMath) return option;
  if (!option.includes('/')) return option;

  const fracRegex = /^(\d+)\/(\d+)$/;
  const match = option.trim().match(fracRegex);
  if (match) {
    const num = parseInt(match[1], 10);
    const den = parseInt(match[2], 10);
    if (den !== 0) {
      const val = num / den;
      let formattedVal: string;
      if (val % 1 === 0) {
        formattedVal = val.toString();
      } else {
        formattedVal = parseFloat(val.toFixed(4)).toString();
      }
      return `${option} (${formattedVal})`;
    }
  }
  return option;
};

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
  const [showLockedWarning, setShowLockedWarning] = useState<boolean>(false);

  // Reveal status: ONLY reveal after user has actually selected an option
  const isRevealed = selectedOption !== undefined;
  const isCorrect = isRevealed && selectedOption === question.answer;
  const isWrong = isRevealed && selectedOption !== question.answer;

  const handleOptionClick = (option: string) => {
    if (selectedOption !== undefined) {
      // User has already answered this question and cannot change answer
      if (selectedOption !== option) {
        setShowLockedWarning(true);
        setTimeout(() => {
          setShowLockedWarning(false);
        }, 3000);
      }
      return;
    }
    onSelectOption(option);
  };

  const isDark = theme === 'dark';

  const parseQuestionSegments = (textString: string) => {
    const segments: Array<{ type: 'text' | 'diagram'; content: string }> = [];
    const parts = textString.split('```');
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        let content = parts[i];
        if (content.startsWith('text\n')) {
          content = content.substring(5);
        } else if (content.startsWith('text\r\n')) {
          content = content.substring(6);
        } else if (content.startsWith('\n')) {
          content = content.substring(1);
        }
        segments.push({ type: 'diagram', content: content.trimEnd() });
      } else {
        if (parts[i]) {
          segments.push({ type: 'text', content: parts[i] });
        }
      }
    }
    return segments;
  };

  const renderQuestionText = (text: string) => {
    const segments = parseQuestionSegments(text);
    return (
      <div className="space-y-3">
        {segments.map((seg, idx) => {
          if (seg.type === 'diagram') {
            return (
              <div
                key={idx}
                className={`my-4 p-4 rounded-xl border font-mono text-xs sm:text-sm overflow-x-auto shadow-xs leading-relaxed ${
                  isDark
                    ? 'bg-zinc-950 border-zinc-800 text-amber-400/90'
                    : 'bg-stone-100 border-stone-200 text-stone-800 font-semibold'
                }`}
              >
                <div
                  className={`text-[10px] uppercase tracking-wider font-sans font-bold mb-2 flex items-center gap-1.5 ${
                    isDark ? 'text-zinc-500' : 'text-stone-400'
                  }`}
                >
                  <span>📊 แผนภาพจำลองสถานการณ์ (Diagram)</span>
                </div>
                <pre className="font-mono whitespace-pre">{seg.content}</pre>
              </div>
            );
          } else {
            const textVal = seg.content;
            if (textVal.includes('___')) {
              const parts = textVal.split('___');
              return (
                <div key={idx} className="whitespace-pre-line inline">
                  {parts.map((part, pIdx) => (
                    <React.Fragment key={pIdx}>
                      {part}
                      {pIdx < parts.length - 1 && (
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
                      )}
                    </React.Fragment>
                  ))}
                </div>
              );
            }
            return (
              <div key={idx} className="whitespace-pre-line inline">
                {textVal}
              </div>
            );
          }
        })}
      </div>
    );
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
          {(() => {
            const diffVal = getQuestionDifficulty(question);
            const diffLabel = diffVal === 'Easy' ? 'ง่าย' : diffVal === 'Medium' ? 'ปานกลาง' : 'ยาก';
            const diffBadgeColor = diffVal === 'Easy'
              ? isDark
                ? 'bg-[#0f2d1e] text-emerald-400 border border-emerald-800/60'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : diffVal === 'Medium'
              ? isDark
                ? 'bg-[#332200]/80 text-amber-400 border border-amber-800/60'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
              : isDark
              ? 'bg-[#331111]/80 text-rose-400 border border-rose-800/60'
              : 'bg-rose-50 text-rose-700 border-rose-200';
            return (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${diffBadgeColor}`}
              >
                {diffLabel}
              </span>
            );
          })()}
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

      {/* Dynamic Contextual Science/Physics Diagram */}
      <div className="mb-5">
        <DynamicScienceDiagram question={question} isDark={isDark} />
      </div>

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
            <motion.label
              whileHover={{ scale: selectedOption !== undefined ? 1 : 1.012, x: selectedOption !== undefined ? 0 : 3 }}
              whileTap={{ scale: selectedOption !== undefined ? 1 : 0.985 }}
              transition={{ type: 'spring', damping: 25, stiffness: 450 }}
              key={`${question.id}-option-${optIdx}`}
              id={`option-label-${question.id}-${optIdx}`}
              onClick={(e) => {
                e.preventDefault();
                handleOptionClick(option);
              }}
              className={`flex items-center justify-between p-3 sm:px-4 rounded-xl border text-sm transition-all select-none ${
                selectedOption !== undefined ? 'cursor-not-allowed' : 'cursor-pointer'
              } ${optionStyle}`}
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
                <span className="leading-tight font-medium">
                  {formatOptionText(option, question.id >= 301 && question.id <= 400)}
                </span>
              </div>

              {/* Radio input */}
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={isSelected}
                disabled={selectedOption !== undefined}
                onChange={() => handleOptionClick(option)}
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
            </motion.label>
          );
        })}
      </div>

      {/* Warning banner when user tries to change their already submitted answer */}
      {showLockedWarning && (
        <div
          className={`mt-3.5 p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold animate-in fade-in zoom-in-95 duration-200 ${
            isDark
              ? 'bg-yellow-950/70 border-yellow-500/80 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
              : 'bg-yellow-50 border-yellow-400 text-yellow-900 shadow-sm'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
          <span>
            ไม่สามารถเปลี่ยนคำตอบได้: <strong>ข้อนี้เคยตอบผิดแล้ว</strong> (ระบบบันทึกคำตอบแรกไว้แล้ว)
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
                    💡 ทำไมถึงตอบ "{formatOptionText(question.answer, question.id >= 301 && question.id <= 400)}"?
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
