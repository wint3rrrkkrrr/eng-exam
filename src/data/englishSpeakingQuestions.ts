import { Question } from '../types';
import { englishSpeakingPart1 } from './englishSpeakingPart1';
import { englishSpeakingPart2 } from './englishSpeakingPart2';

export const englishSpeakingQuestions: Question[] = [
  ...englishSpeakingPart1,
  ...englishSpeakingPart2,
];
