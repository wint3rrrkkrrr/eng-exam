import { Question } from '../types';

/**
 * Deterministically determines the difficulty of a question if not already specified.
 * Easy: id % 3 === 1
 * Medium: id % 3 === 2
 * Hard: id % 3 === 0
 */
export function getQuestionDifficulty(q: Question): 'Easy' | 'Medium' | 'Hard' {
  if (q.difficulty) {
    return q.difficulty;
  }
  
  const mod = q.id % 3;
  if (mod === 1) return 'Easy';
  if (mod === 2) return 'Medium';
  return 'Hard';
}
