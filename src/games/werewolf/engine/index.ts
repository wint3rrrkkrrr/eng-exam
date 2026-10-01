// engine/index.ts — จุดเข้าเดียวของเครื่องยนต์ (TypeScript ล้วน ไม่มี React/Supabase)
export * from './types';
export { ROLES, ROLE_LIST, getRole } from './roles';
export { DEFAULT_SETTINGS, withDefaults, validateSetup } from './settings';
export type { SetupIssue } from './settings';
export { createGame } from './state';
export type { NewPlayer, CreateGameOptions } from './state';
export { applyAction } from './reducer';
export { currentSlot, legalTargets, witchOptions } from './night';
export { buildView, VEILED } from './view';
export type { MyView, MyTurn, PublicPlayerView } from './view';
export { checkWinners } from './win';
export { analyzeBalance } from './balance';
export { playBotGame, botActionFor } from './bots';
export { hashSeed } from './rng';
export { presetRoles } from './presets';
