export const BOARD_COLS = 5;
export const BOARD_ROWS = 8;
export const TOTAL_CELLS = BOARD_COLS * BOARD_ROWS;

export const BOARD_WARNING_THRESHOLD = 4;

export const CHAIN_UNLOCK_SCORES: Record<string, number> = {
  nature: 0,
  gem: 200,
  food: 600,
  magic: 1500,
};

export const GENERATOR_SPAWN_COUNT = 1;

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

export const DAILY_REWARD_COINS = [10, 15, 20, 25, 30, 40, 60];
export const AD_REWARD_COINS = 25;
export const MAX_DAILY_ADS = 10;

export const COMBO_WINDOW_MS = 2000;
export const COMBO_MULTIPLIERS = [1, 1.5, 2, 2.5, 3];

export const DOUBLE_SCORE_COST_COINS = 50;

export const COLORS = {
  background: '#1a1a2e',
  boardBackground: '#16213e',
  cellEmpty: '#2a2a4a',
  cellBorder: '#3a3a5c',
  accent: '#4f8cff',
  accentLight: '#7aadff',
  gold: '#ffd700',
  success: '#4ade80',
  danger: '#f87171',
  text: '#ffffff',
  textDim: '#8888aa',
  surface: '#1f1f3a',
  surfaceRaised: '#2a2a4a',
  combo: '#ff8844',
  magic: '#ff69b4',
};

export interface AchievementDef {
  id: string;
  label: string;
  description: string;
  icon: string;
  condition: (state: { totalMerges: number; bestCombo: number; itemsMerged: number; score: number; coins: number; totalSold: number }) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_merge', label: 'First Merge', description: 'Perform your first merge', icon: '🤝', condition: (s) => s.totalMerges >= 1 },
  { id: 'merger_10', label: 'Merge Apprentice', description: 'Merge 10 times', icon: '🔨', condition: (s) => s.totalMerges >= 10 },
  { id: 'merger_50', label: 'Merge Master', description: 'Merge 50 times', icon: '⚒️', condition: (s) => s.totalMerges >= 50 },
  { id: 'merger_200', label: 'Merge Legend', description: 'Merge 200 times', icon: '🏅', condition: (s) => s.totalMerges >= 200 },
  { id: 'combo_3', label: 'Combo Starter', description: 'Reach a 3x combo', icon: '🔥', condition: (s) => s.bestCombo >= 3 },
  { id: 'combo_5', label: 'Combo King', description: 'Reach a 5x combo', icon: '💥', condition: (s) => s.bestCombo >= 5 },
  { id: 'tier_6', label: 'High Tier', description: 'Merge a tier-6 item', icon: '⭐', condition: (s) => s.itemsMerged >= 2 },
  { id: 'tier_8', label: 'Legendary Merge', description: 'Merge a tier-8 item', icon: '👑', condition: (s) => s.itemsMerged >= 2 },
  { id: 'score_500', label: '500 Points', description: 'Reach 500 points in one game', icon: '🎯', condition: (s) => s.score >= 500 },
  { id: 'score_2000', label: '2,000 Points', description: 'Reach 2,000 points in one game', icon: '🚀', condition: (s) => s.score >= 2000 },
  { id: 'coins_100', label: 'Coin Collector', description: 'Earn 100 coins total', icon: '🪙', condition: (s) => s.coins >= 100 },
  { id: 'coins_500', label: 'Coin Hoarder', description: 'Earn 500 coins total', icon: '💰', condition: (s) => s.coins >= 500 },
  { id: 'first_sell', label: 'Garage Sale', description: 'Sell your first item', icon: '🏪', condition: (s) => s.totalSold >= 1 },
  { id: 'seller_20', label: 'Merchant', description: 'Sell 20 items', icon: '🧺', condition: (s) => s.totalSold >= 20 },
];

export const WEEKEND_MULTIPLIER = 2;
export const EVENT_ACTIVE_DAYS = [0, 6];

export function isWeekend(): boolean {
  const today = new Date().getDay();
  return EVENT_ACTIVE_DAYS.includes(today);
}

export const NOTIFICATION_TITLE = 'Match Items';
export const NOTIFICATION_BODY = '🎁 Your daily reward is waiting! Come back and play!';
