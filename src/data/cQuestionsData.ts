import { Question } from '../types';
import { cQuestionsPart1 } from './cQuestionsPart1';
import { cQuestionsPart2 } from './cQuestionsPart2';
import { cQuestionsPart3 } from './cQuestionsPart3';
import { cQuestionsPart4 } from './cQuestionsPart4';

export const cQuestions: Question[] = [
  ...cQuestionsPart1,
  ...cQuestionsPart2,
  ...cQuestionsPart3,
  ...cQuestionsPart4
];
