import React from 'react';
import { Bookmark, CheckCircle2, XCircle, Filter, Sparkles } from 'lucide-react';
import { Question, ThemeMode } from '../types';

interface QuestionPaletteProps {
  questions: Question[];
  answers: Record<number, string>;
  flagged: number[];
  isSubmitted: boolean;
  instantFeedback?: boolean;
  currentQuestionId?: number;
  onSelectQuestion: (questionId: number) => void;
  activeFilter: 'all' | 'unanswered' | 'flagged' | 'correct' | 'wrong';
  onFilterChange: (filter: 'all' | 'unanswered' | 'flagged' | 'correct' | 'wrong') => void;
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
  allTopics: string[];
  theme: ThemeMode;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  answers,
  flagged,
  isSubmitted,
  instantFeedback = true,
  currentQuestionId,
  onSelectQuestion,
  activeFilter,
  onFilterChange,
  selectedTopic,
  onTopicChange,
  allTopics,
  theme,
}) => {
  const isDark = theme === 'dark';
  const answeredCount = Object.keys(answers).filter((id) =>
    questions.some((q) => q.id === Number(id))
  ).length;
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = flagged.filter((id) =>
    questions.some((q) => q.id === id)
  ).length;

  let correctCount = 0;
  let wrongCount = 0;
  questions.forEach((q) => {
    if (answers[q.id] !== undefined) {
      if (answers[q.id] === q.answer) correctCount++;
      else wrongCount++;
    }
  });

  return (
    <div
      className={`rounded-2xl border p-4 shadow-xs transition-colors ${
        isDark ? 'bg-[#161821] border-zinc-800 text-zinc-100' : 'bg-white border-stone-200 text-stone-900'
      }`}
      id="question-palette-panel"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
          ตารางข้อสอบ ({questions.length} ข้อ)
        </h2>
        <span className={`text-xs font-semibold ${isDark ? 'text-amber-400' : 'text-stone-700'}`}>
          ทำแล้ว {answeredCount}/{questions.length} ข้อ
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-3 text-xs">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-2.5 py-1 rounded-md font-semibold transition ${
            activeFilter === 'all'
              ? isDark
                ? 'bg-amber-400 text-zinc-950 font-bold'
                : 'bg-stone-900 text-white font-bold'
              : isDark
              ? 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
          id="filter-all-btn"
        >
          ทั้งหมด ({questions.length})
        </button>

        {answeredCount > 0 && (
          <>
            <button
              onClick={() => onFilterChange('correct')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition ${
                activeFilter === 'correct'
                  ? 'bg-emerald-600 text-white'
                  : isDark
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
              id="filter-correct-btn"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>ถูก ({correctCount})</span>
            </button>
            <button
              onClick={() => onFilterChange('wrong')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition ${
                activeFilter === 'wrong'
                  ? 'bg-rose-600 text-white'
                  : isDark
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
              id="filter-wrong-btn"
            >
              <XCircle className="w-3 h-3" />
              <span>ผิด ({wrongCount})</span>
            </button>
          </>
        )}

        {unansweredCount > 0 && (
          <button
            onClick={() => onFilterChange('unanswered')}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              activeFilter === 'unanswered'
                ? isDark
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-800 text-white'
                : isDark
                ? 'bg-zinc-800 text-amber-300 hover:bg-zinc-700'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
            id="filter-unanswered-btn"
          >
            ยังไม่ตอบ ({unansweredCount})
          </button>
        )}

        {flaggedCount > 0 && (
          <button
            onClick={() => onFilterChange('flagged')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition ${
              activeFilter === 'flagged'
                ? 'bg-zinc-700 text-white'
                : isDark
                ? 'bg-zinc-800 text-zinc-300'
                : 'bg-stone-100 text-stone-700'
            }`}
            id="filter-flagged-btn"
          >
            <Bookmark className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>ติดดาว ({flaggedCount})</span>
          </button>
        )}
      </div>

      {/* Topic Filter Dropdown */}
      <div className="mb-3">
        <div className={`flex items-center gap-1 text-[11px] font-semibold mb-1 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
          <Filter className="w-3 h-3" />
          <span>กรองตามหัวข้อเรื่อง:</span>
        </div>
        <select
          value={selectedTopic}
          onChange={(e) => onTopicChange(e.target.value)}
          className={`w-full text-xs rounded-lg p-2 font-medium border focus:outline-hidden ${
            isDark
              ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
              : 'bg-stone-50 border-stone-200 text-stone-800'
          }`}
          id="topic-filter-select"
        >
          <option value="all">ทุกหัวข้อไวยากรณ์ (All Topics)</option>
          {allTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-5 lg:grid-cols-8 gap-1.5 pt-1">
        {questions.map((q, idx) => {
          const isAnswered = answers[q.id] !== undefined;
          const isFlagged = flagged.includes(q.id);
          const isCurrent = currentQuestionId === q.id;
          const isCorrect = isAnswered && answers[q.id] === q.answer;
          const isWrong = isAnswered && answers[q.id] !== q.answer;

          let btnClass = isDark
            ? 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100';

          if (isAnswered) {
            if (isCorrect) {
              btnClass = 'bg-emerald-600 text-white border-emerald-500 font-bold';
            } else if (isWrong) {
              btnClass = 'bg-rose-600 text-white border-rose-500 font-bold';
            }
          }

          if (isCurrent) {
            btnClass += isDark ? ' ring-2 ring-amber-400 ring-offset-1 ring-offset-zinc-950' : ' ring-2 ring-stone-900 ring-offset-1';
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(q.id)}
              className={`relative h-8 rounded-lg text-xs font-semibold border flex items-center justify-center transition-all ${btnClass}`}
              title={`ข้อ ${idx + 1}: ${q.topic} - ${isAnswered ? (isCorrect ? 'ตอบถูก' : 'ตอบผิด') : 'ยังไม่ได้ตอบ'}`}
              id={`palette-q-${q.id}`}
            >
              {idx + 1}
              {isFlagged && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-zinc-900" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div
        className={`mt-3.5 pt-3 border-t flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] ${
          isDark ? 'border-zinc-800 text-zinc-400' : 'border-stone-100 text-stone-500'
        }`}
      >
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block" />
          <span>ตอบถูก</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-rose-600 inline-block" />
          <span>ตอบผิด</span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`w-2.5 h-2.5 rounded border inline-block ${
              isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-stone-100 border-stone-300'
            }`}
          />
          <span>ยังไม่ตอบ</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          <span>ติดดาว</span>
        </div>
      </div>
    </div>
  );
};
