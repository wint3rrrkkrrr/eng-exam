import React from 'react';
import { 
  Trophy, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  PieChart, 
  Flame, 
  ArrowRight,
  History,
  Sparkles
} from 'lucide-react';
import { CategoryStat, ThemeMode } from '../types';

interface ResultSummaryProps {
  score: number;
  totalQuestions: number;
  unansweredCount: number;
  timeSpentSeconds: number;
  categoryStats: CategoryStat[];
  onRetakeAll: () => void;
  onRetakeMissed: () => void;
  onContinueNextBatch: () => void;
  onOpenHistory: () => void;
  onOpenGuide: () => void;
  onFilterIncorrect: () => void;
  onScrollToQuiz: () => void;
  theme: ThemeMode;
  maxStreak: number;
  remainingBankCount: number;
  completedBankCount: number;
  totalBankCount: number;
  batchSize: number;
  subjectId: string;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({
  score,
  totalQuestions,
  unansweredCount,
  timeSpentSeconds,
  categoryStats,
  onRetakeAll,
  onRetakeMissed,
  onContinueNextBatch,
  onOpenHistory,
  onOpenGuide,
  onFilterIncorrect,
  onScrollToQuiz,
  theme,
  maxStreak,
  remainingBankCount,
  completedBankCount,
  totalBankCount,
  batchSize,
  subjectId,
}) => {
  const isDark = theme === 'dark';
  const percent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  let message = 'ทำได้ดีมาก! ลองทบทวนข้อที่ตอบผิด หรือกดทำต่อเพื่อสุ่มโจทย์ใหม่ที่ยังไม่เคยทำ';
  if (subjectId === 'biology') {
    message = 'ทำได้ดีพอสมควร! มีความเข้าใจในบทเรียนชีววิทยาที่ดี แต่อ่านสรุปเพื่อเพิ่มความแม่นยำ';
  } else if (subjectId === 'history') {
    message = 'ทำได้ดีพอสมควร! มีความรอบรู้ในเรื่องประวัติศาสตร์และอารยธรรมที่ดี ทบทวนจุดสำคัญอีกนิด';
  } else if (subjectId === 'math') {
    message = 'ทำได้ดีพอสมควร! ทำโจทย์คณิตศาสตร์ได้ดี แต่อ่านทบทวนวิธีคิดและสมบัติของความน่าจะเป็นเพิ่มเติมได้';
  } else if (subjectId === 'english') {
    message = 'ทำได้ดีพอสมควร! มีความเข้าใจพื้นฐานไวยากรณ์ที่ดี แต่อ่านสรุปเพื่อเพิ่มความมั่นใจได้';
  }

  let badgeText = 'ระดับดี (Proficient)';
  let badgeColor = isDark
    ? 'bg-amber-950/80 text-amber-300 border-amber-800'
    : 'bg-amber-100 text-amber-900 border-amber-300';

  if (percent >= 80) {
    if (subjectId === 'biology') {
      message = 'ยอดเยี่ยมมาก! มีความเข้าใจอย่างถ่องแท้ในเรื่องโครงสร้างพืชดอก วัฏจักรชีวิต และการลำเลียงสาร';
    } else if (subjectId === 'history') {
      message = 'ยอดเยี่ยมมาก! แม่นยำในอารยธรรมโลกโบราณ ทั้งตะวันตก (กรีก, โรมัน) และตะวันออก (จีน, อินเดีย)';
    } else if (subjectId === 'math') {
      message = 'ยอดเยี่ยมมาก! มีทักษะการคำนวณและเข้าใจกฎการนับ ความน่าจะเป็น และวิธีจัดหมู่เป็นอย่างดี';
    } else {
      message = 'ยอดเยี่ยมมาก! เข้าใจหลักไวยากรณ์ Modal Verbs & Future Forms ได้อย่างแม่นยำ';
    }
    badgeText = percent === 100 ? '⭐ คะแนนเต็ม 100% สมบูรณ์แบบ!' : '🏆 ผ่านเกณฑ์ระดับดีเยี่ยม (Mastery)';
    badgeColor = isDark
      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
      : 'bg-emerald-100 text-emerald-900 border-emerald-300';
  } else if (percent < 50) {
    if (subjectId === 'biology') {
      message = 'สู้ๆ นะ! ลองอ่านคู่มือสรุปชีววิทยาเพิ่มเติม โดยเฉพาะกลไก C3/C4/CAM และการปฏิสนธิซ้อน';
    } else if (subjectId === 'history') {
      message = 'สู้ๆ นะ! ลองอ่านคู่มือสรุปประวัติศาสตร์และอารยธรรมโบราณเพิ่มเติม แล้วกลับมาท้าทายใหม่อีกครั้ง';
    } else if (subjectId === 'math') {
      message = 'สู้ๆ นะ! ลองอ่านคู่มือสรุปสูตรคณิตศาสตร์ กฎการบวก/คูณ และการคำนวณแฟกทอเรียลเพิ่มเติม';
    } else {
      message = 'สู้ๆ นะ! ลองอ่านคู่มือสรุปกฎไวยากรณ์ภาษาอังกฤษเพิ่มเติม และฝึกฝนทำข้อสอบซ้ำอีกครั้ง';
    }
    badgeText = 'ควรทบทวนเพิ่มเติม (Needs Practice)';
    badgeColor = isDark
      ? 'bg-rose-950/80 text-rose-300 border-rose-800'
      : 'bg-rose-100 text-rose-900 border-rose-300';
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins} นาที ${remainder} วินาที`;
  };

  const missedCount = totalQuestions - score;
  const isBankAllCompleted = remainingBankCount === 0;

  return (
    <div
      className={`rounded-3xl border p-6 sm:p-8 shadow-xs transition-colors ${
        isDark ? 'bg-[#161821] border-zinc-800 text-zinc-100' : 'bg-white border-stone-200 text-stone-900'
      }`}
      id="result-summary-card"
    >
      {/* Top Banner */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 shadow-md ${
            isDark
              ? 'bg-amber-400 text-zinc-950'
              : 'bg-stone-900 text-amber-400'
          }`}
        >
          <Trophy className="w-8 h-8" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeColor}`}>
            {badgeText}
          </span>
          {maxStreak >= 2 && (
            <span
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                isDark ? 'bg-orange-950/70 text-orange-400 border-orange-800' : 'bg-orange-50 text-orange-700 border-orange-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>คอมโบสูงสุด: {maxStreak} ข้อติด</span>
            </span>
          )}
        </div>

        <div className="text-4xl sm:text-5xl font-black tracking-tight my-2">
          {score} <span className={`text-2xl sm:text-3xl font-semibold ${isDark ? 'text-zinc-600' : 'text-stone-400'}`}>/ {totalQuestions}</span>
          <span className={`text-2xl sm:text-3xl font-bold ml-2 ${isDark ? 'text-amber-400' : 'text-stone-700'}`}>({percent}%)</span>
        </div>

        <p className={`text-base sm:text-lg font-medium mb-3 ${isDark ? 'text-zinc-300' : 'text-stone-800'}`}>
          {message}
        </p>

        {/* Bank Progress Notification */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3 border ${
          isBankAllCompleted
            ? isDark
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : isDark
            ? 'bg-zinc-900 border-zinc-700 text-zinc-300'
            : 'bg-stone-100 border-stone-200 text-stone-700'
        }`}>
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {isBankAllCompleted
              ? `🎉 ทำครบทั้งคลังแล้ว (${completedBankCount}/${totalBankCount} ข้อ)`
              : `ทำสะสมในคลังแล้ว ${completedBankCount}/${totalBankCount} ข้อ (เหลือยังไม่ทำอีก ${remainingBankCount} ข้อ)`}
          </span>
        </div>

        <div className={`flex flex-wrap items-center justify-center gap-4 text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
          <span>เวลาที่ใช้: <strong className={isDark ? 'text-zinc-200' : 'text-stone-800'}>{formatTime(timeSpentSeconds)}</strong></span>
          <span>•</span>
          <span>ตอบถูก: <strong className="text-emerald-500">{score} ข้อ</strong></span>
          <span>•</span>
          <span>ตอบผิด: <strong className="text-rose-500">{missedCount} ข้อ</strong></span>
          {unansweredCount > 0 && (
            <>
              <span>•</span>
              <span>ยังไม่ตอบ: <strong className="text-amber-500">{unansweredCount} ข้อ</strong></span>
            </>
          )}
        </div>
      </div>

      {/* Main Action Callouts */}
      <div className="max-w-2xl mx-auto space-y-3 mb-8">
        {/* Primary CTA: Continue to Next Batch */}
        {!isBankAllCompleted ? (
          <button
            onClick={onContinueNextBatch}
            className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-extrabold text-base shadow-lg transition active:scale-98 ${
              isDark
                ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-amber-950/40'
                : 'bg-stone-900 hover:bg-stone-800 text-white shadow-stone-300'
            }`}
            id="continue-next-batch-btn"
          >
            <span>ทำข้อสอบต่อ (สุ่มชุดใหม่ {Math.min(batchSize, remainingBankCount)} ข้อ)</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className={`p-4 rounded-2xl border text-center ${
            isDark ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <Sparkles className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
            <p className="font-bold text-sm">คุณทำครบทุกข้อในคลัง {totalBankCount} ข้อเรียบร้อยแล้ว!</p>
            <p className="text-xs opacity-80 mt-0.5">สามารถกดรีเซ็ตเพื่อเริ่มสุ่มรอบใหม่ หรือเปิดดูประวัติเฉลยทั้งหมดได้</p>
          </div>
        )}

        {/* Secondary Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {missedCount > 0 ? (
            <button
              onClick={onFilterIncorrect}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs transition active:scale-98 ${
                isDark
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-200'
              }`}
              id="review-incorrect-btn"
            >
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>ดูข้อที่ผิดในรอบนี้ ({missedCount} ข้อ)</span>
            </button>
          ) : (
            <button
              onClick={onScrollToQuiz}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs transition active:scale-98 ${
                isDark
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-emerald-300 border border-emerald-500/30'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-200'
              }`}
              id="review-all-btn"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ดูเฉลยรอบนี้</span>
            </button>
          )}

          {missedCount > 0 && (
            <button
              onClick={onRetakeMissed}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition border ${
                isDark
                  ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
                  : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
              }`}
              id="retry-missed-btn"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
              <span>ทำซ้ำข้อผิดรอบนี้</span>
            </button>
          )}

          <button
            onClick={onOpenHistory}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition border ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
                : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
            }`}
            id="view-history-btn"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>คลังข้อที่เคยทำแล้ว</span>
          </button>
        </div>
      </div>

      {/* Topic Performance Breakdown */}
      <div className={`border-t pt-6 ${isDark ? 'border-zinc-800' : 'border-stone-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-400" />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-zinc-200' : 'text-stone-900'}`}>
              สถิติแยกตามหัวข้อบทเรียน (รอบปัจจุบัน)
            </h3>
          </div>
          <button
            onClick={onOpenGuide}
            className={`text-xs font-semibold underline flex items-center gap-1 ${
              isDark ? 'text-amber-400 hover:text-amber-300' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>เปิดคู่มือสรุปเนื้อหาประจำวิชา</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryStats.map((stat) => {
            const isPerfect = stat.percentage === 100;
            const isGood = stat.percentage >= 70;
            return (
              <div
                key={stat.topic}
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  isDark
                    ? 'bg-zinc-900/60 border-zinc-800'
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-semibold ${isDark ? 'text-zinc-200' : 'text-stone-800'}`}>
                    {stat.topic}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isPerfect
                        ? 'text-emerald-400'
                        : isGood
                        ? isDark ? 'text-zinc-200' : 'text-stone-800'
                        : 'text-rose-400'
                    }`}
                  >
                    {stat.correct}/{stat.total} ({stat.percentage}%)
                  </span>
                </div>
                {/* Progress bar */}
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-stone-200'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPerfect
                        ? 'bg-emerald-500'
                        : isGood
                        ? isDark ? 'bg-amber-400' : 'bg-stone-700'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
