import { Question } from '../types';
import { physicsQuestionsPart1 } from './physicsQuestionsPart1';
import { physicsQuestionsPart2 } from './physicsQuestionsPart2';
import { physicsQuestionsPart3 } from './physicsQuestionsPart3';
import { physicsQuestionsPart4 } from './physicsQuestionsPart4';

export const physicsQuestions: Question[] = [
  ...physicsQuestionsPart1,
  ...physicsQuestionsPart2,
  ...physicsQuestionsPart3,
  ...physicsQuestionsPart4
];
