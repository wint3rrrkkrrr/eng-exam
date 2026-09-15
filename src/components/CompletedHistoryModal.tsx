import React, { useState } from 'react';
import { 
  X, 
  History, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Search, 
  Trash2, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Question, CompletedQuestionRecord, ThemeMode } from '../types';

interface CompletedHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedRecords: Record<number, CompletedQuestionRecord>;
  allQuestions: Question[];
  onResetHistory: () => void;
  onPracticeMissedFromHistory: () => void;
  theme: ThemeMode;
}

export const CompletedHistoryModal: React.FC<CompletedHistoryModalProps> = ({
  isOpen,
  onClose,
  completedRecords,
  allQuestions,
  onResetHistory,
  onPracticeMissedFromHistory,
  theme,
}) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const completedIds = Object.keys(completedRecords).map(Number);
  const totalInBank = allQuestions.length;
  const completedCount = completedIds.length;

  const completedQuestionsList = completedIds
    .map((id) => {
      const q = allQuestions.find((item) => item.id === id);
      const rec = completedRecords[id];
      return { q, rec };
    })
    .filter((item): item is { q: Question; rec: CompletedQuestionRecord } => item.q !== undefined);

  let totalCorrect = 0;
  let totalWrong = 0;
  completedQuestionsList.forEach(({ rec }) => {
    if (rec.isCorrect) totalCorrect++;
    else totalWrong++;
  });

  const accuracy = completedCount > 0 ? Math.round((totalCorrect / completedCount) * 100) : 0;

  const filteredList = completedQuestionsList.filter(({ q, rec }) => {
    if (filter === 'correct' && !rec.isCorrect) return false;
    if (filter === 'wrong' && rec.isCorrect) return false;
    if (search.trim()) {
      const query = search.toLowerCase();
      const matchQ = q.question.toLowerCase().includes(query);
      const matchTopic = q.topic.toLowerCase().includes(query);
      const matchExp = q.explanation.toLowerCase().includes(query);
      return matchQ || matchTopic || matchExp;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
          isDark ? 'bg-[#12141c] border-zinc-800 text-zinc-100' : 'bg-white border-stone-200 text-stone-900'
        }`}
        id="completed-history-modal"
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
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>คลังโจทย์ที่เคยทำแล้ว</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isDark ? 'bg-zinc-800 text-amber-300' : 'bg-stone-200 text-stone-800'
                }`}>
                  {completedCount}/{totalInBank} ข้อ
                </span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                โจทย์ที่ทำแล้วจะถูกตัดออกจากชุดสุ่มรอบใหม่ และเก็บประวัติไว้ที่นี่
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition ${
              isDark
                ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                : 'hover:bg-stone-200 text-stone-500 hover:text-stone-900'
            }`}
            id="close-history-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div
          className={`p-4 border-b grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs ${
            isDark ? 'border-zinc-800 bg-[#151722]' : 'border-stone-200 bg-stone-100/50'
          }`}
        >
          <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200'}`}>
            <span className={`block text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>ทำสะสมทั้งหมด</span>
            <strong className="text-base font-extrabold">{completedCount} <span className="text-xs font-normal opacity-70">/ {totalInBank} ข้อ</span></strong>
          </div>
          <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
            <span className="block text-[11px] font-medium opacity-80">ตอบถูกต้อง</span>
            <strong className="text-base font-extrabold">{totalCorrect} ข้อ ({accuracy}%)</strong>
          </div>
          <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-rose-950/30 border-rose-800/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
            <span className="block text-[11px] font-medium opacity-80">ตอบผิด</span>
            <strong className="text-base font-extrabold">{totalWrong} ข้อ</strong>
          </div>
          <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-amber-950/30 border-amber-800/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            <span className="block text-[11px] font-medium opacity-80">คงเหลือยังไม่ทำ</span>
            <strong className="text-base font-extrabold">{totalInBank - completedCount} ข้อ</strong>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div
          className={`p-3 sm:p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDark ? 'border-zinc-800 bg-[#12141c]' : 'border-stone-200 bg-white'
          }`}
        >
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-stone-400'}`} />
            <input
              type="text"
              placeholder="ค้นหาโจทย์, หมวดหมู่, หรือคำอธิบาย..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-xl border focus:outline-hidden ${
                isDark
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-200 placeholder-zinc-500'
                  : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>

          {/* Filter Chips */}
          <div
            className={`flex items-center rounded-xl p-1 border text-xs shrink-0 ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-stone-100 border-stone-200'
            }`}
          >
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? isDark
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'bg-white text-stone-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              ทั้งหมด ({completedCount})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition ${
                filter === 'correct'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>ถูก ({totalCorrect})</span>
            </button>
            <button
              onClick={() => setFilter('wrong')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition ${
                filter === 'wrong'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <XCircle className="w-3 h-3" />
              <span>ผิด ({totalWrong})</span>
            </button>
          </div>
        </div>

        {/* Action quick buttons */}
        <div className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2 text-xs ${
          isDark ? 'border-zinc-800 bg-[#161823]/70' : 'border-stone-200 bg-stone-50'
        }`}>
          <div className="flex items-center gap-2">
            {totalWrong > 0 && (
              <button
                onClick={() => {
                  onPracticeMissedFromHistory();
                  onClose();
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold border transition ${
                  isDark
                    ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300'
                    : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-950'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>ฝึกทำเฉพาะข้อที่เคยตอบผิด ({totalWrong} ข้อ)</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              if (window.confirm('คุณต้องการรีเซ็ตประวัติคลังข้อสอบทั้งหมดเพื่อเริ่มต้นใหม่ใช่หรือไม่?')) {
                onResetHistory();
                onClose();
              }
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ล้างประวัติคลังข้อสอบ</span>
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredList.length === 0 ? (
            <div className="text-center py-12">
              <History className={`w-12 h-12 mx-auto mb-3 opacity-30 ${isDark ? 'text-zinc-500' : 'text-stone-400'}`} />
              <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-zinc-300' : 'text-stone-700'}`}>
                {completedCount === 0
                  ? 'ยังไม่มีโจทย์ที่เคยทำ'
                  : 'ไม่พบโจทย์ที่ตรงกับตัวกรอง'}
              </p>
              <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-stone-500'}`}>
                {completedCount === 0
                  ? 'เมื่อคุณตอบข้อสอบและกดทำต่อ ข้อสอบเดิมจะถูกบันทึกไว้ในคลังนี้ทันที'
                  : 'ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่ทั้งหมด'}
              </p>
            </div>
          ) : (
            filteredList.map(({ q, rec }) => {
              const isExpanded = expandedId === q.id;
              const isCorrect = rec.isCorrect;

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border transition-all ${
                    isDark
                      ? 'bg-[#181a24] border-zinc-800/80 text-zinc-200'
                      : 'bg-white border-stone-200 text-stone-800'
                  }`}
                >
                  {/* Item Header */}
                  <div
                    className="p-4 flex items-start justify-between gap-3 cursor-pointer hover:opacity-95"
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                          isCorrect
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-stone-100 text-stone-700'
                          }`}>
                            {q.topic}
                          </span>
                          <span className={`text-[11px] font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isCorrect ? 'ตอบถูกต้อง' : `คุณตอบ: ${rec.selectedOption}`}
                          </span>
                        </div>
                        <p className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-zinc-100' : 'text-stone-900'}`}>
                          {q.question}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-amber-400 shrink-0 mt-1">
                      {isExpanded ? 'ย่อคำอธิบาย' : 'ดูเฉลยละเอียด'}
                    </span>
                  </div>

                  {/* Expanded Explanation */}
                  {isExpanded && (
                    <div
                      className={`p-4 border-t text-xs space-y-2.5 ${
                        isDark ? 'border-zinc-800/80 bg-zinc-900/50' : 'border-stone-100 bg-stone-50/70'
                      }`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isTheAnswer = opt === q.answer;
                          const isUserChoice = opt === rec.selectedOption;
                          return (
                            <div
                              key={optIdx}
                              className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                                isTheAnswer
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                                  : isUserChoice
                                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-bold'
                                  : isDark
                                  ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                                  : 'bg-white border-stone-200 text-stone-600'
                              }`}
                            >
                              <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                              {isTheAnswer && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md font-bold">
                                  คำตอบที่ถูกต้อง
                                </span>
                              )}
                              {isUserChoice && !isTheAnswer && (
                                <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-md font-bold">
                                  ที่คุณตอบ
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className={`p-3 rounded-xl border ${
                        isDark ? 'bg-amber-950/20 border-amber-800/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                          <span>คำอธิบายเฉลย:</span>
                        </div>
                        <p className="leading-relaxed">{q.explanation}</p>
                        <div className="mt-2 text-[11px] font-semibold text-amber-400">
                          📌 กฎไวยากรณ์: {q.ruleSummary}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t text-center text-xs flex items-center justify-between ${
            isDark ? 'border-zinc-800 bg-[#161823] text-zinc-400' : 'border-stone-200 bg-stone-50 text-stone-500'
          }`}
        >
          <span>คลังข้อสอบภาษาอังกฤษ • สร้างสรรค์โดย WINTER</span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs ${
              isDark ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300' : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            กลับสู่แบบทดสอบ
          </button>
        </div>
      </div>
    </div>
  );
};
