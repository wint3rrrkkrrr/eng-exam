import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { QuestionCard } from './components/QuestionCard';
import { QuestionPalette } from './components/QuestionPalette';
import { ResultSummary } from './components/ResultSummary';
import { SingleQuestionView } from './components/SingleQuestionView';
import { GrammarGuideModal } from './components/GrammarGuideModal';
import { SubjectSelector } from './components/SubjectSelector';
import { CompletedHistoryModal } from './components/CompletedHistoryModal';
import { allQuestions } from './data/questionsData';
import { biologyQuestions } from './data/biologyQuestionsData';
import { historyQuestions } from './data/historyQuestionsData';
import { mathQuestions } from './data/mathQuestionsData';
import { cQuestions } from './data/cQuestionsData';
import { physicsQuestions } from './data/physicsQuestionsData';
import { englishSpeakingQuestions } from './data/englishSpeakingQuestions';
import { musicQuestions } from './data/musicQuestions';
import { subjectsList } from './data/subjectsData';
import { Question, QuizViewMode, CategoryStat, ThemeMode, CompletedQuestionRecord } from './types';
import { 
  AlertCircle, 
  ArrowUp, 
  Sparkles, 
  BookOpen, 
  Flame, 
  LayoutGrid, 
  CheckCircle2, 
  Shuffle, 
  History,
  ArrowRight,
  RotateCcw,
  Snowflake,
  GraduationCap,
  Languages,
  Atom,
  Calculator,
  Terminal,
  Lightbulb,
  Globe,
  Music
} from 'lucide-react';
import { soundFX } from './utils/audio';
import { triggerConfetti } from './utils/confetti';
import { getQuestionDifficulty } from './utils/difficulty';
import logoImage from './assets/images/winter_exam_logo_1789496745669.jpg';

// Helper to shuffle array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getSubjectIcon(iconName: string, className: string) {
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
}

function getSubjectColorClasses(subjectId: string) {
  switch (subjectId) {
    case 'english':
    case 'english-speaking':
      return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    case 'biology':
      return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    case 'history':
    case 'music':
      return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    case 'math':
      return 'bg-sky-500/10 border-sky-500/20 text-sky-400';
    case 'c-programming':
      return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    case 'physics':
      return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
    default:
      return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
  }
}

export default function App() {
  // Theme state: defaults to Dark Mode
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('grammar_quiz_theme');
      return (saved as ThemeMode) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('grammar_quiz_sound');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Subject state
  const [currentSubjectId, setCurrentSubjectId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('quiz_current_subject_id_v1');
      if (saved && (saved === 'english' || saved === 'biology' || saved === 'history' || saved === 'math' || saved === 'c-programming' || saved === 'physics')) {
        return saved;
      }
      return 'english';
    } catch {
      return 'english';
    }
  });
  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);
  const [showSubjectSelector, setShowSubjectSelector] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Batch size state (Default: 20 questions)
  const [batchSize, setBatchSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('grammar_quiz_batch_size');
      return saved ? parseInt(saved, 10) : 20;
    } catch {
      return 20;
    }
  });

  // Difficulty filter state (Default: 'All')
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>(() => {
    try {
      const saved = localStorage.getItem('grammar_quiz_difficulty_filter');
      return (saved as 'All' | 'Easy' | 'Medium' | 'Hard') || 'All';
    } catch {
      return 'All';
    }
  });

  // Completed Questions History Pool across all sessions
  const [completedHistory, setCompletedHistory] = useState<Record<number, CompletedQuestionRecord>>(() => {
    try {
      const saved = localStorage.getItem('grammar_quiz_completed_history_v5');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Master bank of questions for the active subject
  const currentSubject = useMemo(() => {
    return subjectsList.find((s) => s.id === currentSubjectId) || subjectsList[0];
  }, [currentSubjectId]);

  const masterBank: Question[] = useMemo(() => {
    if (currentSubjectId === 'biology') {
      return biologyQuestions;
    }
    if (currentSubjectId === 'history') {
      return historyQuestions;
    }
    if (currentSubjectId === 'math') {
      return mathQuestions;
    }
    if (currentSubjectId === 'c-programming') {
      return cQuestions;
    }
    if (currentSubjectId === 'physics') {
      return physicsQuestions;
    }
    if (currentSubjectId === 'english-speaking') {
      return englishSpeakingQuestions;
    }
    if (currentSubjectId === 'music') {
      return musicQuestions;
    }
    return allQuestions; // default english
  }, [currentSubjectId]);

  // Current active batch question IDs
  const [currentBatchIds, setCurrentBatchIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('grammar_quiz_current_batch_ids_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback below
    }

    // Initialize initial batch from unseen pool
    const savedCompleted: Record<number, CompletedQuestionRecord> = (() => {
      try {
        const s = localStorage.getItem('grammar_quiz_completed_history_v5');
        return s ? JSON.parse(s) : {};
      } catch {
        return {};
      }
    })();

    const initialBank = allQuestions;
    const unseen = initialBank.filter((q) => !savedCompleted[q.id]);
    const pool = unseen.length > 0 ? unseen : initialBank;
    const shuffled = shuffleArray(pool);
    const count = 20;
    return shuffled.slice(0, Math.min(count, shuffled.length)).map((q) => q.id);
  });

  // Current batch questions derived from master bank with shuffled options
  const questions: Question[] = useMemo(() => {
    return currentBatchIds
      .map((id) => {
        const found = masterBank.find((q) => q.id === id);
        if (!found) return undefined;
        return {
          ...found,
          options: shuffleArray(found.options),
        };
      })
      .filter((q): q is Question => q !== undefined);
  }, [currentBatchIds, masterBank]);

  // Current batch active answers
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('grammar_quiz_current_answers_v5');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Flagged questions in current batch
  const [flagged, setFlagged] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('grammar_quiz_flagged_v5');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [viewMode, setViewMode] = useState<QuizViewMode>('all');
  const [currentSingleIdx, setCurrentSingleIdx] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unanswered' | 'flagged' | 'correct' | 'wrong'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [showSummaryView, setShowSummaryView] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);

  const resultRef = useRef<HTMLDivElement>(null);

  // Sync current subject id
  useEffect(() => {
    try {
      localStorage.setItem('quiz_current_subject_id_v1', currentSubjectId);
    } catch {
      // ignore
    }
  }, [currentSubjectId]);

  // Sync theme
  useEffect(() => {
    try {
      localStorage.setItem('grammar_quiz_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  }, [theme]);

  // Sync sound settings
  useEffect(() => {
    try {
      localStorage.setItem('grammar_quiz_sound', JSON.stringify(soundEnabled));
      soundFX.enabled = soundEnabled;
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  // Sync batch size
  useEffect(() => {
    try {
      localStorage.setItem('grammar_quiz_batch_size', batchSize.toString());
    } catch {
      // ignore
    }
  }, [batchSize]);

  // Sync difficulty filter
  useEffect(() => {
    try {
      localStorage.setItem('grammar_quiz_difficulty_filter', difficultyFilter);
    } catch {
      // ignore
    }
  }, [difficultyFilter]);

  // Sync completed history
  useEffect(() => {
    try {
      localStorage.setItem('grammar_quiz_completed_history_v5', JSON.stringify(completedHistory));
    } catch {
      // ignore
    }
  }, [completedHistory]);

  // Sync current batch IDs
  useEffect(() => {
    try {
      localStorage.setItem('grammar_quiz_current_batch_ids_v5', JSON.stringify(currentBatchIds));
    } catch {
      // ignore
    }
  }, [currentBatchIds]);

  // Sync current answers & flagged
  useEffect(() => {
    try {
      localStorage.setItem('grammar_quiz_current_answers_v5', JSON.stringify(answers));
    } catch {
      // ignore
    }
  }, [answers]);

  useEffect(() => {
    try {
      localStorage.setItem('grammar_quiz_flagged_v5', JSON.stringify(flagged));
    } catch {
      // ignore
    }
  }, [flagged]);




  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  // Helper: Draw a new batch of questions from uncompleted pool
  const drawNewBatch = useCallback((customBatchSize?: number, targetBank?: Question[], targetDifficulty?: 'All' | 'Easy' | 'Medium' | 'Hard') => {
    const size = customBatchSize || batchSize;
    const bank = targetBank || masterBank;
    const diff = targetDifficulty !== undefined ? targetDifficulty : difficultyFilter;

    // Filter by difficulty if specified
    const filteredBank = diff === 'All' 
      ? bank 
      : bank.filter((q) => getQuestionDifficulty(q) === diff);

    const uncompleted = filteredBank.filter((q) => !completedHistory[q.id]);
    
    let newBatch: Question[] = [];
    if (uncompleted.length > 0) {
      const shuffled = shuffleArray(uncompleted);
      newBatch = shuffled.slice(0, Math.min(size, shuffled.length));
    } else if (filteredBank.length > 0) {
      // All questions in this filtered bank have been completed! Reshuffle from all
      const shuffled = shuffleArray(filteredBank);
      newBatch = shuffled.slice(0, Math.min(size, shuffled.length));
    } else {
      // Fallback if filtered bank is completely empty
      const uncompletedUnfiltered = bank.filter((q) => !completedHistory[q.id]);
      const shuffled = shuffleArray(uncompletedUnfiltered.length > 0 ? uncompletedUnfiltered : bank);
      newBatch = shuffled.slice(0, Math.min(size, shuffled.length));
    }

    const newIds = newBatch.map((q) => q.id);
    setCurrentBatchIds(newIds);
    setAnswers({});
    setFlagged([]);
    setCurrentSingleIdx(0);
    setActiveFilter('all');
    setSelectedTopic('all');
    setShowSummaryView(false);
    setStreakCount(0);
    setSecondsElapsed(0);
  }, [masterBank, completedHistory, batchSize, difficultyFilter]);

  // Handle "ทำต่อ (Continue Next Batch)"
  const handleContinueNextBatch = () => {
    soundFX.playTap();
    drawNewBatch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle changing batch size
  const handleBatchSizeChange = (newSize: number) => {
    soundFX.playTap();
    setBatchSize(newSize);
    drawNewBatch(newSize);
  };

  // Handle subject change from modal
  const handleSelectSubject = (subjectId: string, customSize?: number, customDifficulty?: 'All' | 'Easy' | 'Medium' | 'Hard') => {
    soundFX.playTap();
    setCurrentSubjectId(subjectId);
    const targetSize = customSize || batchSize;
    if (customSize) {
      setBatchSize(customSize);
    }
    const targetDifficulty = customDifficulty !== undefined ? customDifficulty : difficultyFilter;
    if (customDifficulty !== undefined) {
      setDifficultyFilter(customDifficulty);
    }
    setShowSubjectSelector(false);

    // Determine target bank immediately for clean instant switch
    let targetBank: Question[] = allQuestions;
    if (subjectId === 'biology') targetBank = biologyQuestions;
    else if (subjectId === 'history') targetBank = historyQuestions;
    else if (subjectId === 'math') targetBank = mathQuestions;
    else if (subjectId === 'c-programming') targetBank = cQuestions;
    else if (subjectId === 'physics') targetBank = physicsQuestions;
    else if (subjectId === 'english-speaking') targetBank = englishSpeakingQuestions;
    else if (subjectId === 'music') targetBank = musicQuestions;

    drawNewBatch(targetSize, targetBank, targetDifficulty);
  };

  // Reshuffle current batch
  const handleReshuffleBatch = () => {
    soundFX.playTap();
    drawNewBatch();
  };

  // Reset entire completed history and start fresh
  const handleResetEntireHistory = () => {
    soundFX.playTap();
    setCompletedHistory({});
    setAnswers({});
    setFlagged([]);
    setShowSummaryView(false);
    setStreakCount(0);
    setMaxStreak(0);
    setSecondsElapsed(0);
    
    // Draw fresh batch from complete bank
    const shuffled = shuffleArray(masterBank);
    const newBatch = shuffled.slice(0, Math.min(batchSize, shuffled.length));
    setCurrentBatchIds(newBatch.map((q) => q.id));
  };

  // Re-practice missed questions from completed history
  const handlePracticeMissedFromHistory = () => {
    soundFX.playTap();
    const missedIds = (Object.values(completedHistory) as CompletedQuestionRecord[])
      .filter((rec) => !rec.isCorrect)
      .map((rec) => rec.questionId);

    if (missedIds.length === 0) return;

    const missedQuestions = masterBank.filter((q) => missedIds.includes(q.id));
    const pool = missedQuestions.length > 0 ? missedQuestions : masterBank;
    const shuffled = shuffleArray(pool);
    const newBatch = shuffled.slice(0, Math.min(batchSize, shuffled.length));

    setCurrentBatchIds(newBatch.map((q) => q.id));
    setAnswers({});
    setFlagged([]);
    setShowSummaryView(false);
    setCurrentSingleIdx(0);
    setActiveFilter('all');
    setSelectedTopic('all');
    setStreakCount(0);
    setSecondsElapsed(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Extract all unique topics in current batch
  const allTopics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => set.add(q.topic));
    return Array.from(set);
  }, [questions]);

  // Bank counts
  const totalBankCount = masterBank.length;
  const currentSubjectCompletedCount = useMemo(() => {
    const bankIds = new Set(masterBank.map((q) => q.id));
    return Object.keys(completedHistory).filter((idStr) => bankIds.has(parseInt(idStr, 10))).length;
  }, [masterBank, completedHistory]);
  const completedBankCount = currentSubjectCompletedCount;
  const remainingBankCount = Math.max(0, totalBankCount - completedBankCount);

  // Score for current batch
  const correctCount = useMemo(() => {
    let s = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) s++;
    });
    return s;
  }, [questions, answers]);

  const answeredCount = useMemo(() => {
    return questions.filter((q) => answers[q.id] !== undefined).length;
  }, [questions, answers]);

  const unansweredCount = useMemo(() => {
    return questions.length - answeredCount;
  }, [questions, answeredCount]);

  const isBatchFinished = questions.length > 0 && answeredCount === questions.length;

  // Timer interval - Pauses on landing page, summary view, or when all questions are answered
  useEffect(() => {
    if (showLandingPage || showSummaryView || isBatchFinished) {
      return;
    }
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showLandingPage, showSummaryView, isBatchFinished]);

  // Category statistics in current batch
  const categoryStats: CategoryStat[] = useMemo(() => {
    const map = new Map<string, { total: number; correct: number }>();
    questions.forEach((q) => {
      const entry = map.get(q.topic) || { total: 0, correct: 0 };
      entry.total += 1;
      if (answers[q.id] === q.answer) {
        entry.correct += 1;
      }
      map.set(q.topic, entry);
    });

    return Array.from(map.entries()).map(([topic, data]) => ({
      topic,
      total: data.total,
      correct: data.correct,
      percentage: Math.round((data.correct / data.total) * 100),
    }));
  }, [questions, answers]);

  // Filter questions for list display
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) {
        return false;
      }
      if (activeFilter === 'unanswered') {
        return answers[q.id] === undefined;
      }
      if (activeFilter === 'flagged') {
        return flagged.includes(q.id);
      }
      if (activeFilter === 'correct') {
        return answers[q.id] !== undefined && answers[q.id] === q.answer;
      }
      if (activeFilter === 'wrong') {
        return answers[q.id] !== undefined && answers[q.id] !== q.answer;
      }
      return true;
    });
  }, [questions, selectedTopic, activeFilter, answers, flagged]);

  // Instant Feedback Handler: also saves into completedHistory pool automatically
  const handleSelectOption = (questionId: number, option: string) => {
    const currentQ = questions.find((q) => q.id === questionId);
    if (!currentQ) return;

    const isCorrect = currentQ.answer === option;

    if (isCorrect) {
      soundFX.playCorrect();
      setStreakCount((s) => {
        const next = s + 1;
        setMaxStreak((m) => Math.max(m, next));
        if (next >= 5 && next % 5 === 0) {
          triggerConfetti();
        }
        return next;
      });
    } else {
      soundFX.playWrong();
      setStreakCount(0);
    }

    // Save in batch answers
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));

    // Archive into completed history pool (โจทย์ที่เคยทำแล้ว)
    setCompletedHistory((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOption: option,
        isCorrect,
        timestamp: Date.now(),
      },
    }));

    // If all questions in the active batch are answered, trigger celebratory confetti
    if (answeredCount + (answers[questionId] ? 0 : 1) === questions.length) {
      triggerConfetti();
    }
  };

  const handleToggleFlag = (questionId: number) => {
    soundFX.playTap();
    setFlagged((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleResetCurrentBatch = () => {
    if (window.confirm('คุณต้องการรีเซ็ตคำตอบในรอบปัจจุบันนี้ใช่หรือไม่?')) {
      soundFX.playTap();
      const currentIds = new Set(questions.map((q) => q.id));
      setAnswers({});
      setFlagged((prev) => prev.filter((id) => !currentIds.has(id)));
      setShowSummaryView(false);
      setSecondsElapsed(0);
      setStreakCount(0);
      setActiveFilter('all');
      setSelectedTopic('all');
      setCurrentSingleIdx(0);
    }
  };

  const handleRetakeMissedInBatch = () => {
    soundFX.playTap();
    const newAnswers: Record<number, string> = { ...answers };
    questions.forEach((q) => {
      if (answers[q.id] !== q.answer) {
        delete newAnswers[q.id];
      }
    });
    setAnswers(newAnswers);
    setShowSummaryView(false);
    setActiveFilter('unanswered');
    setViewMode('all');
  };

  const handleRetakeAllInBatch = () => {
    soundFX.playTap();
    setAnswers({});
    setShowSummaryView(false);
    setActiveFilter('all');
    setSelectedTopic('all');
    setCurrentSingleIdx(0);
    setStreakCount(0);
  };

  const handlePaletteSelectQuestion = (questionId: number) => {
    soundFX.playTap();
    if (viewMode === 'single') {
      const idx = questions.findIndex((q) => q.id === questionId);
      if (idx !== -1) setCurrentSingleIdx(idx);
    } else {
      if (activeFilter !== 'all' || selectedTopic !== 'all') {
        setActiveFilter('all');
        setSelectedTopic('all');
      }
      setTimeout(() => {
        const el = document.getElementById(`question-card-${questionId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  };

  // Keyboard navigation for single view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (viewMode === 'single') {
        const currentQ = questions[currentSingleIdx];
        if (e.key === 'ArrowRight' && currentSingleIdx < questions.length - 1) {
          setCurrentSingleIdx((i) => i + 1);
        } else if (e.key === 'ArrowLeft' && currentSingleIdx > 0) {
          setCurrentSingleIdx((i) => i - 1);
        } else if (['1', '2', '3', '4'].includes(e.key) && currentQ) {
          const optIdx = parseInt(e.key) - 1;
          if (currentQ.options[optIdx]) {
            handleSelectOption(currentQ.id, currentQ.options[optIdx]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentSingleIdx, questions]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDark = theme === 'dark';

  if (showLandingPage) {
    return (
      <div
        className={`min-h-screen flex flex-col font-sans transition-colors duration-200 justify-between relative overflow-hidden ${
          isDark ? 'bg-[#0b0c12] text-zinc-100' : 'bg-stone-50 text-stone-900'
        }`}
      >
        {/* Decorative subtle background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Landing Page Header / Quick settings */}
        <header className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <img src={logoImage} alt="WINTER Prep Hub Logo" className="w-8 h-8 rounded-xl object-cover border border-blue-500/20 shadow-xs" referrerPolicy="no-referrer" />
            <span className="font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-amber-300">WINTER Prep Hub</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-xl border transition-all ${
                isDark
                  ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 shadow-2xs'
              }`}
              title={soundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
            >
              {soundEnabled ? (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-amber-400">เสียงเปิดอยู่</span>
                </div>
              ) : (
                <span className="text-xs font-bold text-stone-400">เสียงปิดอยู่</span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={handleToggleTheme}
              className={`p-2 rounded-xl border transition-all ${
                isDark
                  ? 'bg-zinc-900/60 border-zinc-800 text-amber-400 hover:bg-zinc-800'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100 shadow-2xs'
              }`}
              title={isDark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด (ถนอมสายตา)'}
            >
              {isDark ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-amber-400">โหมดมืด</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-600">โหมดสว่าง</span>
                </div>
              )}
            </button>
          </div>
        </header>

        {/* Main Hero Panel */}
        <main className="flex-1 flex flex-col justify-center items-center max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-12 relative z-10">
          <div className="text-center space-y-6 max-w-3xl">
            {/* Giant Custom Generated Logo */}
            <div className="inline-flex items-center justify-center relative mb-4 group">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl animate-pulse transition-all duration-300 group-hover:scale-110" />
              <div className="relative p-2.5 rounded-full bg-gradient-to-br from-blue-500/20 to-amber-500/20 border border-blue-500/20 shadow-xl transition-all duration-500 hover:scale-105">
                <img
                  src={logoImage}
                  alt="WINTER Prep Hub Giant Logo"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-amber-400/50 shadow-inner"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Site Title */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-zinc-100 to-amber-400">
                WINTER Prep Hub
              </h1>
              
              {/* Creator Credit Tag */}
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-amber-500/10 text-amber-300 border border-amber-500/25 shadow-sm animate-pulse">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>สร้างสรรค์โดย WINTER</span>
                </span>
              </div>
            </div>

            <p className={`text-sm sm:text-base max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
              ยินดีต้อนรับสู่ระบบคลังข้อสอบและแบบฝึกหัดอัจฉริยะที่รวบรวมโจทย์สอบวัดระดับคุณภาพสูงไว้มากถึง <strong>1,200 ข้อ</strong> ครอบคลุมเนื้อหาสำคัญอย่างเจาะลึก พร้อมระบบสุ่มคลัง ตัดโจทย์ซ้ำ และเฉลยอธิบายละเอียดภาษาไทย
            </p>

            {/* Subjects Showcase - Recommended */}
            <div className="space-y-4 pt-6 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                <h2 className="text-xs font-black uppercase tracking-wider text-amber-400">
                  วิชาเพิ่มใหม่แนะนำ 🔥
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {subjectsList.filter(s => s.isReady && ['physics', 'music', 'english-speaking', 'c-programming'].includes(s.id)).map((sub) => {
                  const colorClasses = getSubjectColorClasses(sub.id);
                  return (
                    <div key={sub.id} className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] flex gap-3 relative overflow-hidden ${
                      isDark 
                        ? 'bg-zinc-900/60 border-amber-500/20 shadow-[0_4px_12px_rgba(245,158,11,0.05)]' 
                        : 'bg-white border-amber-200 shadow-2xs'
                    }`}>
                      {/* NEW Badge */}
                      <span className="absolute top-0 right-0 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-bl-lg shadow-xs">
                        NEW
                      </span>
                      
                      <div className={`p-2.5 h-fit rounded-xl border shrink-0 ${colorClasses}`}>
                        {getSubjectIcon(sub.icon, "w-5 h-5")}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2 pr-6">
                          <h3 className="font-bold text-sm sm:text-base">{sub.name}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClasses}`}>
                            {sub.totalQuestions} ข้อ
                          </span>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                          {sub.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subjects Showcase - Others */}
            <div className="space-y-4 pt-8 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                  วิชามาตรฐานอื่นๆ 📚
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {subjectsList.filter(s => s.isReady && !['physics', 'music', 'english-speaking', 'c-programming'].includes(s.id)).map((sub) => {
                  const colorClasses = getSubjectColorClasses(sub.id);
                  return (
                    <div key={sub.id} className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] flex gap-3 ${
                      isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-stone-200 shadow-2xs'
                    }`}>
                      <div className={`p-2.5 h-fit rounded-xl border shrink-0 ${colorClasses}`}>
                        {getSubjectIcon(sub.icon, "w-5 h-5")}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-sm sm:text-base">{sub.name}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClasses}`}>
                            {sub.totalQuestions} ข้อ
                          </span>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                          {sub.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Giant Action Button */}
            <div className="pt-8">
              <button
                onClick={() => {
                  setShowLandingPage(false);
                  setShowSubjectSelector(true);
                  if (soundEnabled) {
                    try { soundFX.playTap(); } catch (e) {}
                  }
                }}
                className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm sm:text-base tracking-wide transition-all duration-300 transform active:scale-95 shadow-lg hover:shadow-amber-500/20 hover:scale-[1.03] ${
                  isDark
                    ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
              >
                <span>เริ่มทำข้อสอบเลย</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className={`text-[11px] mt-2.5 font-semibold ${isDark ? 'text-zinc-500' : 'text-stone-500'}`}>
                คลิกเพื่อไปที่หน้าต่างเลือกวิชาและเลือกจำนวนข้อสอบที่ต้องการสุ่มได้ตามต้องการ
              </p>
            </div>
          </div>
        </main>

        {/* Landing Page Footer */}
        <footer className={`py-6 border-t text-center text-xs relative z-10 ${
          isDark ? 'border-zinc-900/60 text-zinc-500 bg-[#08090d]' : 'border-stone-200/80 text-stone-500 bg-stone-100/30'
        }`}>
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-medium">
            <span>คลังข้อสอบและแบบฝึกหัดอัจฉริยะ 6 วิชา (1,200 ข้อ) • WINTER exam</span>
            <span className="flex items-center gap-1 font-bold text-amber-500/95">
              <Sparkles className="w-3.5 h-3.5" />
              <span>สร้างสรรค์โดย WINTER ด้วยความปราณีต ❄️</span>
            </span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#0b0c10] text-zinc-100 selection:bg-amber-400 selection:text-zinc-950' : 'bg-stone-100/70 text-stone-900 selection:bg-stone-200'
      }`}
    >
      {/* Subject Selector Modal */}
      {showSubjectSelector && (
        <SubjectSelector
          currentSubjectId={currentSubjectId}
          onSelectSubject={handleSelectSubject}
          completedCount={completedBankCount}
          totalQuestionsInSubject={totalBankCount}
          theme={theme}
          onClose={() => setShowSubjectSelector(false)}
          onOpenHistory={() => {
            setShowSubjectSelector(false);
            setShowHistoryModal(true);
          }}
          difficultyFilter={difficultyFilter}
          onDifficultyFilterChange={setDifficultyFilter}
        />
      )}

      {/* Completed Questions History Modal */}
      <CompletedHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        completedRecords={completedHistory}
        allQuestions={masterBank}
        onResetHistory={handleResetEntireHistory}
        onPracticeMissedFromHistory={handlePracticeMissedFromHistory}
        theme={theme}
      />

      {/* Header */}
      <Header
        currentSubjectName={currentSubject.name}
        totalQuestionsInBatch={questions.length}
        totalQuestionsInBank={totalBankCount}
        completedBankCount={completedBankCount}
        answeredCount={answeredCount}
        correctCount={correctCount}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSubjectSelector={() => setShowSubjectSelector(true)}
        onOpenHistory={() => setShowHistoryModal(true)}
        onResetBatch={handleResetCurrentBatch}
        onShowSummary={() => {
          setShowSummaryView(true);
          setTimeout(() => {
            if (resultRef.current) {
              resultRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }}
        onReshuffleBatch={handleReshuffleBatch}
        onBatchSizeChange={handleBatchSizeChange}
        currentBatchSize={batchSize}
        secondsElapsed={secondsElapsed}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        streakCount={streakCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Dynamic Random Pool Info Banner */}
        <div
          className={`mb-5 rounded-2xl border p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
            isDark ? 'bg-[#161821] border-zinc-800' : 'bg-white border-stone-200'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {/* Random Batch Mode Badge */}
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isDark
                    ? 'bg-amber-950/70 text-amber-300 border-amber-800'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                <Shuffle className="w-3 h-3 text-amber-400" />
                <span>สุ่มรอบละ {questions.length} ข้อ</span>
              </span>

              {/* Bank Progress Badge */}
              <button
                onClick={() => setShowHistoryModal(true)}
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition hover:opacity-80 ${
                  isDark
                    ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                    : 'bg-stone-100 text-stone-800 border-stone-200'
                }`}
                title="คลิกเพื่อดูคลังข้อที่เคยทำแล้ว"
              >
                <History className="w-3 h-3 text-amber-400" />
                <span>คลังทำสะสม: {completedBankCount}/{totalBankCount} ข้อ</span>
                {remainingBankCount > 0 ? (
                  <span className="text-amber-400">(เหลืออีก {remainingBankCount} ข้อ)</span>
                ) : (
                  <span className="text-emerald-400">(ครบทั้งคลังแล้ว)</span>
                )}
              </button>

              {/* Instant Feedback indicator badge */}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>เฉลยทันทีที่ตอบ</span>
              </span>

              {/* Creator Tag */}
              <span className={`text-[11px] font-semibold flex items-center gap-1 ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                <span>สร้างสรรค์โดย</span>
                <strong className={isDark ? 'text-amber-300 font-extrabold' : 'text-stone-800 font-extrabold'}>WINTER</strong>
              </span>
            </div>

            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
              คลังข้อสอบวิชา {currentSubject.name} ทั้งหมด {totalBankCount} ข้อ — ระบบจะสุ่มข้อที่ไม่เคยทำมาให้รอบละ {batchSize} ข้อ และเมื่อกดทำต่อจะตัดโจทย์เดิมออกไปเก็บในประวัติให้อัตโนมัติ
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            {/* Continue / Next Batch Button */}
            <button
              onClick={handleContinueNextBatch}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-98 shadow-sm ${
                isDark
                  ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold'
                  : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
              title="สุ่มชุดใหม่ โดยตัดโจทย์เดิมที่เคยทำแล้วออก"
              id="top-continue-next-btn"
            >
              <span>สุ่มชุดถัดไป</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowHistoryModal(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                isDark
                  ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
              }`}
              title="ดูคลังโจทย์ที่เคยทำแล้ว"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>โจทย์ที่เคยทำแล้ว</span>
            </button>
          </div>
        </div>

        {/* Results Banner when user clicks summary or answers all */}
        {(showSummaryView || (questions.length > 0 && answeredCount === questions.length)) && (
          <div ref={resultRef} className="mb-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <ResultSummary
              score={correctCount}
              totalQuestions={questions.length}
              unansweredCount={unansweredCount}
              timeSpentSeconds={secondsElapsed}
              categoryStats={categoryStats}
              onRetakeAll={handleRetakeAllInBatch}
              onRetakeMissed={handleRetakeMissedInBatch}
              onContinueNextBatch={handleContinueNextBatch}
              onOpenHistory={() => setShowHistoryModal(true)}
              onOpenGuide={() => setIsGuideOpen(true)}
              onFilterIncorrect={() => {
                setActiveFilter('wrong');
                setViewMode('all');
                setShowSummaryView(false);
              }}
              onScrollToQuiz={() => {
                setActiveFilter('all');
                setViewMode('all');
                setShowSummaryView(false);
              }}
              theme={theme}
              maxStreak={maxStreak}
              remainingBankCount={remainingBankCount}
              completedBankCount={completedBankCount}
              totalBankCount={totalBankCount}
              batchSize={batchSize}
              subjectId={currentSubjectId}
            />
          </div>
        )}

        {/* View Mode Switching */}
        {viewMode === 'single' ? (
          <div className="space-y-6">
            {questions[currentSingleIdx] && (
              <SingleQuestionView
                question={questions[currentSingleIdx]}
                currentIndex={currentSingleIdx}
                totalQuestions={questions.length}
                selectedOption={answers[questions[currentSingleIdx]?.id]}
                isFlagged={flagged.includes(questions[currentSingleIdx]?.id)}
                isSubmitted={true}
                instantFeedback={true}
                onSelectOption={(opt) => handleSelectOption(questions[currentSingleIdx].id, opt)}
                onToggleFlag={() => handleToggleFlag(questions[currentSingleIdx].id)}
                onNext={() => setCurrentSingleIdx((i) => Math.min(questions.length - 1, i + 1))}
                onPrev={() => setCurrentSingleIdx((i) => Math.max(0, i - 1))}
                onSubmit={() => {
                  setShowSummaryView(true);
                  setTimeout(() => {
                    if (resultRef.current) {
                      resultRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
                theme={theme}
                streakCount={streakCount}
              />
            )}

            {/* Quick navigator palette */}
            <div className="max-w-3xl mx-auto">
              <QuestionPalette
                questions={questions}
                answers={answers}
                flagged={flagged}
                isSubmitted={true}
                instantFeedback={true}
                currentQuestionId={questions[currentSingleIdx]?.id}
                onSelectQuestion={handlePaletteSelectQuestion}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                selectedTopic={selectedTopic}
                onTopicChange={setSelectedTopic}
                allTopics={allTopics}
                theme={theme}
              />
            </div>
          </div>
        ) : (
          /* List Mode (All Questions in Batch) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Questions Column */}
            <div className="lg:col-span-8 space-y-4" id="quiz-questions-list">
              {/* Active Filter notification bar */}
              {(activeFilter !== 'all' || selectedTopic !== 'all') && (
                <div
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold ${
                    isDark
                      ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>
                      กำลังแสดง {filteredQuestions.length} ข้อ (
                      {activeFilter === 'correct' && 'ตัวกรอง: ตอบถูก'}
                      {activeFilter === 'wrong' && 'ตัวกรอง: ตอบผิด'}
                      {activeFilter === 'unanswered' && 'ตัวกรอง: ยังไม่ตอบ'}
                      {activeFilter === 'flagged' && 'ตัวกรอง: ติดดาว'}
                      {selectedTopic !== 'all' && ` • หมวดหมู่: ${selectedTopic}`})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveFilter('all');
                      setSelectedTopic('all');
                    }}
                    className="underline font-bold hover:opacity-80"
                  >
                    ล้างตัวกรอง
                  </button>
                </div>
              )}

              {filteredQuestions.length === 0 ? (
                <div
                  className={`p-8 text-center rounded-2xl border ${
                    isDark ? 'bg-[#161821] border-zinc-800' : 'bg-white border-stone-200'
                  }`}
                >
                  <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-zinc-300' : 'text-stone-700'}`}>
                    ไม่พบข้อสอบที่ตรงกับตัวกรองที่คุณเลือก
                  </p>
                  <button
                    onClick={() => {
                      setActiveFilter('all');
                      setSelectedTopic('all');
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold ${
                      isDark ? 'bg-amber-400 text-zinc-950' : 'bg-stone-900 text-white'
                    }`}
                  >
                    แสดงข้อสอบทั้งหมด
                  </button>
                </div>
              ) : (
                filteredQuestions.map((q, idx) => {
                  return (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      selectedOption={answers[q.id]}
                      isFlagged={flagged.includes(q.id)}
                      isSubmitted={true}
                      instantFeedback={true}
                      onSelectOption={(opt) => handleSelectOption(q.id, opt)}
                      onToggleFlag={() => handleToggleFlag(q.id)}
                      index={idx}
                      theme={theme}
                    />
                  );
                })
              )}

              {/* Bottom Quick Summary & Continue Action Card */}
              <div
                className={`p-6 sm:p-7 rounded-2xl border text-center space-y-3 mt-6 shadow-xs ${
                  isDark ? 'bg-[#161821] border-zinc-800' : 'bg-white border-stone-200'
                }`}
              >
                <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-zinc-100' : 'text-stone-900'}`}>
                  ทำไปแล้ว {answeredCount} จาก {questions.length} ข้อในรอบนี้ (ตอบถูก {correctCount} ข้อ)
                </h3>
                <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-zinc-400' : 'text-stone-500'}`}>
                  {unansweredCount > 0
                    ? `เหลืออีก ${unansweredCount} ข้อในรอบนี้ หรือคลิก "ทำต่อ" เพื่อสุ่มชุดข้อสอบใหม่ทันที`
                    : 'รอบนี้ครบทุกข้อแล้ว! กด "ทำต่อ" เพื่อสุ่มโจทย์ที่ยังไม่เคยทำชุดถัดไปได้เลย'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button
                    onClick={handleContinueNextBatch}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition active:scale-98 flex items-center gap-2 ${
                      isDark
                        ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                    id="continue-next-bottom-btn"
                  >
                    <span>ทำข้อสอบต่อ (สุ่มชุดใหม่)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setShowSummaryView(true);
                      setTimeout(() => {
                        if (resultRef.current) {
                          resultRef.current.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition border ${
                      isDark
                        ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
                        : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-800'
                    }`}
                  >
                    ดูรายงานสรุปผล
                  </button>

                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition border ${
                      isDark
                        ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-amber-300'
                        : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-amber-900'
                    }`}
                  >
                    ดูคลังข้อที่เคยทำแล้ว
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sticky Sidebar */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
              <QuestionPalette
                questions={questions}
                answers={answers}
                flagged={flagged}
                isSubmitted={true}
                instantFeedback={true}
                onSelectQuestion={handlePaletteSelectQuestion}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                selectedTopic={selectedTopic}
                onTopicChange={setSelectedTopic}
                allTopics={allTopics}
                theme={theme}
              />

              {/* Study helper card */}
              <div
                className={`rounded-2xl border p-4 space-y-2.5 text-xs transition-colors ${
                  isDark
                    ? 'bg-[#161821] border-zinc-800 text-zinc-300'
                    : 'bg-stone-50 border-stone-200/90 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span className={isDark ? 'text-zinc-100' : 'text-stone-900'}>
                    คู่มือสรุปเนื้อหาวิชา {currentSubject.name}
                  </span>
                </div>
                <p className={`leading-relaxed ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                  {currentSubjectId === 'english'
                    ? 'ทบทวนความแตกต่างระหว่าง can vs could vs will be able to, mustn\'t vs don\'t have to, \'d better และ Future Forms ได้ตลอดเวลา'
                    : currentSubjectId === 'biology'
                    ? 'สรุปเนื้อหาโครงสร้างพืชดอก การสืบพันธุ์แบบอาศัยเพศ วัฏจักรชีวิตแบบสลับ และการงอกของเมล็ด'
                    : currentSubjectId === 'history'
                    ? 'สรุปประเด็นสำคัญของอารยธรรมกรีก โรมัน ระบอบฟิวดัล และสงครามครูเสด'
                    : currentSubjectId === 'math'
                    ? 'สรุปสูตรและหลักคิดสำคัญ: ความน่าจะเป็น, กฎการบวก/การคูณ, แฟกทอเรียล, P(n,r), C(n,r) และเหตุการณ์อิสระ'
                    : 'สรุปเนื้อหาโครงสร้างภาษาซี อัลกอริทึม การประกาศตัวแปร ฟังก์ชัน printf/scanf ตัวดำเนินการ นิพจน์ คำสั่งเงื่อนไข และคำสั่งวนซ้ำ'}
                </p>
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className={`w-full py-2.5 px-3 rounded-xl border font-bold text-center transition ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-amber-300'
                      : 'bg-white border-stone-300 hover:bg-stone-100 text-stone-800 shadow-2xs'
                  }`}
                  id="open-guide-sidebar-btn"
                >
                  เปิดอ่านคู่มือสรุปเนื้อหา
                </button>
              </div>

              {/* Scroll to Top */}
              <button
                onClick={scrollToTop}
                className={`w-full py-2 text-xs font-semibold flex items-center justify-center gap-1 transition ${
                  isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>กลับสู่ด้านบนสุด</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Grammar / Study Guide Modal */}
      <GrammarGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        theme={theme}
        subjectId={currentSubjectId}
      />

      {/* Footer with Creator Credit WINTER */}
      <footer
        className={`mt-12 py-6 border-t text-center text-xs transition-colors ${
          isDark ? 'bg-[#0f1117] border-zinc-800/80 text-zinc-500' : 'bg-white border-stone-200 text-stone-500'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span>แบบทดสอบ 4 วิชา (ภาษาอังกฤษ • ชีววิทยา • ประวัติศาสตร์สากล • คณิตศาสตร์)</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-bold text-amber-400">
              <Sparkles className="w-3 h-3" />
              <span>สร้างสรรค์โดย WINTER</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-zinc-400">
            <span>สุ่มคลังข้อสอบอัจฉริยะ 380 ข้อ • ตัดข้อเดิมอัตโนมัติเมื่อทำต่อ</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
