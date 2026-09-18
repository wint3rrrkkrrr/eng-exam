import { Question } from '../types';
import { musicQuestionsPart1 } from './musicQuestionsPart1';
import { musicQuestionsPart2 } from './musicQuestionsPart2';

// Combine both parts of music questions to form the complete 200 questions bank
export const musicQuestions: Question[] = [
  ...musicQuestionsPart1,
  ...musicQuestionsPart2
];
