export interface Question {
  id: number;
  setId?: 'set1' | 'set2' | string;
  topic: string;
  category: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  ruleSummary: string;
}

export interface SubjectInfo {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  description: string;
  totalQuestions: number;
  isReady: boolean;
}

export type QuizViewMode = 'all' | 'single';
export type ThemeMode = 'dark' | 'light';

export interface CategoryStat {
  topic: string;
  total: number;
  correct: number;
  percentage: number;
}

export interface CompletedQuestionRecord {
  questionId: number;
  selectedOption: string;
  isCorrect: boolean;
  timestamp: number;
}
