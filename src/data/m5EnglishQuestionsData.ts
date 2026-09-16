import { Question } from '../types';
import { m5EnglishQuestionsPart1 } from './m5EnglishQuestionsPart1';
import { m5EnglishQuestionsPart2 } from './m5EnglishQuestionsPart2';
import { m5EnglishQuestionsPart3 } from './m5EnglishQuestionsPart3';

export const m5EnglishQuestions: Question[] = [
  ...m5EnglishQuestionsPart1,
  ...m5EnglishQuestionsPart2,
  ...m5EnglishQuestionsPart3
];
