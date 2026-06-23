/** Game configuration constants */

export const BOARD_COLS = 5;
export const BOARD_ROWS = 8;
export const TOTAL_CELLS = BOARD_COLS * BOARD_ROWS; // 40

/** How many cells must stay free before "board warning" shows */
export const BOARD_WARNING_THRESHOLD = 4;

/** Score milestones that unlock new generator chains */
export const CHAIN_UNLOCK_SCORES: Record<string, number> = {
  nature: 0,     // unlocked from start
  gem: 200,      // unlock gem chain at 200 pts
  food: 600,     // unlock food chain at 600 pts
};

/** Max items per generator tap */
export const GENERATOR_SPAWN_COUNT = 1;

/** How many items to clear when player uses "Sell" on an item (earns coins) */
export const SELL_COIN_VALUES: Record<number, number> = {
  1: 1,
  2: 2,
  3: 5,
  4: 12,
  5: 30,
  6: 75,
  7: 180,
  8: 500,
};

/** Daily reward coins per streak day (1-7 cycle) */
export const DAILY_REWARD_COINS = [10, 15, 20, 25, 30, 40, 60];

/** Combo multiplier: merges within X ms of each other get a multiplier */
export const COMBO_WINDOW_MS = 2000;
export const COMBO_MULTIPLIERS = [1, 1.5, 2, 2.5, 3]; // index = combo count - 1

/** Colors */
export const COLORS = {
  background: '#0f0f23',
  boardBackground: '#1a1a35',
  cellEmpty: '#252545',
  cellBorder: '#3a3a60',
  accent: '#6c63ff',
  accentLight: '#9d96ff',
  gold: '#ffd700',
  success: '#4ade80',
  danger: '#f87171',
  text: '#ffffff',
  textDim: '#8888aa',
  surface: '#1e1e3f',
  surfaceRaised: '#2a2a50',
};
