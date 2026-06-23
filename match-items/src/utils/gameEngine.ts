import {
  ALL_ITEMS,
  getNextTier,
  SPAWNABLE_ITEMS,
  ItemDef,
} from '../constants/items';
import {
  BOARD_COLS,
  BOARD_ROWS,
  TOTAL_CELLS,
  SELL_COIN_VALUES,
  COMBO_WINDOW_MS,
  COMBO_MULTIPLIERS,
  CHAIN_UNLOCK_SCORES,
  MAX_DAILY_ADS,
  DAILY_REWARD_COINS,
  AD_REWARD_COINS,
  ACHIEVEMENTS,
  WEEKEND_MULTIPLIER,
} from '../constants/config';

export interface Cell {
  index: number;
  itemId: string | null;
  locked: boolean;
}

export interface GameState {
  cells: Cell[];
  score: number;
  coins: number;
  highScore: number;
  moveCount: number;
  lastMergeTime: number;
  comboCount: number;
  unlockedChains: string[];
  generators: GeneratorState[];
  isGameOver: boolean;

  dailyRewardDay: number;
  dailyRewardClaimDate: string;
  adsWatchedToday: number;

  totalMerges: number;
  bestCombo: number;
  itemsMerged: number;
  totalSold: number;

  unlockedAchievements: string[];
  highScores: number[];
  lastPlayedDate: string;
}

export interface GeneratorState {
  chain: string;
  cooldownUntil: number;
}

export interface MergeResult {
  newState: GameState;
  mergedItem: ItemDef;
  pointsEarned: number;
  isCombo: boolean;
  comboMultiplier: number;
  newChainUnlocked: string | null;
}

export function indexToRowCol(index: number): { row: number; col: number } {
  return { row: Math.floor(index / BOARD_COLS), col: index % BOARD_COLS };
}

export function rowColToIndex(row: number, col: number): number {
  return row * BOARD_COLS + col;
}

export function getEmptyCells(cells: Cell[]): Cell[] {
  return cells.filter((c) => !c.itemId && !c.locked);
}

export function getFirstEmptyCell(cells: Cell[]): Cell | null {
  return cells.find((c) => !c.itemId && !c.locked) ?? null;
}

export function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

export function getScoreMultiplier(): number {
  return isWeekend() ? WEEKEND_MULTIPLIER : 1;
}

export function createInitialState(): GameState {
  const cells: Cell[] = Array.from({ length: TOTAL_CELLS }, (_, i) => ({
    index: i,
    itemId: null,
    locked: false,
  }));

  cells[0].itemId = 'seed';
  cells[1].itemId = 'seed';
  cells[2].itemId = 'pebble';

  return {
    cells,
    score: 0,
    coins: 50,
    highScore: 0,
    moveCount: 0,
    lastMergeTime: 0,
    comboCount: 0,
    unlockedChains: ['nature'],
    generators: [{ chain: 'nature', cooldownUntil: 0 }],
    isGameOver: false,
    dailyRewardDay: 0,
    dailyRewardClaimDate: '',
    adsWatchedToday: 0,
    totalMerges: 0,
    bestCombo: 0,
    itemsMerged: 0,
    totalSold: 0,
    unlockedAchievements: [],
    highScores: [],
    lastPlayedDate: getTodayStr(),
  };
}

export function spawnFromGenerator(
  state: GameState,
  chain: string,
  now: number
): { newState: GameState; spawnedItemId: string; cellIndex: number } | { error: string } {
  const gen = state.generators.find((g) => g.chain === chain);
  if (!gen) return { error: 'Generator not found' };
  if (now < gen.cooldownUntil) return { error: 'Generator on cooldown' };

  const emptyCell = getFirstEmptyCell(state.cells);
  if (!emptyCell) return { error: 'Board is full' };

  const spawnItem = SPAWNABLE_ITEMS.find((i) => i.chain === chain);
  if (!spawnItem) return { error: 'No spawnable item for chain' };

  const newCells = state.cells.map((c) =>
    c.index === emptyCell.index ? { ...c, itemId: spawnItem.id } : c
  );

  const newGenerators = state.generators.map((g) =>
    g.chain === chain ? { ...g, cooldownUntil: now + 0 } : g
  );

  return {
    newState: {
      ...state,
      cells: newCells,
      generators: newGenerators,
      moveCount: state.moveCount + 1,
    },
    spawnedItemId: spawnItem.id,
    cellIndex: emptyCell.index,
  };
}

export function moveItem(
  state: GameState,
  fromIndex: number,
  toIndex: number
): GameState {
  if (fromIndex === toIndex) return state;
  const from = state.cells[fromIndex];
  const to = state.cells[toIndex];
  if (!from.itemId) return state;
  if (to.locked) return state;

  const newCells = state.cells.map((c) => {
    if (c.index === fromIndex) return { ...c, itemId: to.itemId };
    if (c.index === toIndex) return { ...c, itemId: from.itemId };
    return c;
  });

  return { ...state, cells: newCells };
}

export function mergeItems(
  state: GameState,
  fromIndex: number,
  toIndex: number,
  now: number
): MergeResult | { error: string } {
  const fromCell = state.cells[fromIndex];
  const toCell = state.cells[toIndex];

  if (!fromCell.itemId || !toCell.itemId) return { error: 'Empty cell' };
  if (fromCell.itemId !== toCell.itemId) return { error: 'Items do not match' };

  const next = getNextTier(fromCell.itemId);
  if (!next) return { error: 'Max tier reached' };

  const timeSinceLast = now - state.lastMergeTime;
  const isCombo = timeSinceLast <= COMBO_WINDOW_MS && state.comboCount > 0;
  const newComboCount = isCombo ? Math.min(state.comboCount + 1, 4) : 1;
  const comboMultiplier = COMBO_MULTIPLIERS[newComboCount - 1];

  const basePoints = next.points;
  const weekendMultiplier = getScoreMultiplier();
  const pointsEarned = Math.round(basePoints * comboMultiplier * weekendMultiplier);
  const newScore = state.score + pointsEarned;
  const newHighScore = Math.max(state.highScore, newScore);

  const newCells = state.cells.map((c) => {
    if (c.index === toIndex) return { ...c, itemId: next.id };
    if (c.index === fromIndex) return { ...c, itemId: null };
    return c;
  });

  let newChainUnlocked: string | null = null;
  const newUnlockedChains = [...state.unlockedChains];
  for (const [chain, threshold] of Object.entries(CHAIN_UNLOCK_SCORES)) {
    if (!newUnlockedChains.includes(chain) && newScore >= threshold) {
      newUnlockedChains.push(chain);
      newChainUnlocked = chain;
    }
  }

  let newGenerators = [...state.generators];
  if (newChainUnlocked && !newGenerators.find((g) => g.chain === newChainUnlocked)) {
    newGenerators.push({ chain: newChainUnlocked, cooldownUntil: 0 });
  }

  const newState: GameState = {
    ...state,
    cells: newCells,
    score: newScore,
    highScore: newHighScore,
    moveCount: state.moveCount + 1,
    lastMergeTime: now,
    comboCount: newComboCount,
    unlockedChains: newUnlockedChains,
    generators: newGenerators,
    totalMerges: state.totalMerges + 1,
    itemsMerged: state.itemsMerged + 2,
    bestCombo: Math.max(state.bestCombo, newComboCount),
  };

  return {
    newState,
    mergedItem: next,
    pointsEarned,
    isCombo,
    comboMultiplier,
    newChainUnlocked,
  };
}

export function sellItem(
  state: GameState,
  cellIndex: number
): { newState: GameState; coinsEarned: number } | { error: string } {
  const cell = state.cells[cellIndex];
  if (!cell.itemId) return { error: 'No item to sell' };

  const itemDef = ALL_ITEMS.find((i) => i.id === cell.itemId);
  if (!itemDef) return { error: 'Unknown item' };

  const coinsEarned = SELL_COIN_VALUES[itemDef.tier] ?? 1;
  const newCells = state.cells.map((c) =>
    c.index === cellIndex ? { ...c, itemId: null } : c
  );

  return {
    newState: { ...state, cells: newCells, coins: state.coins + coinsEarned, totalSold: state.totalSold + 1 },
    coinsEarned,
  };
}

export function isBoardFull(cells: Cell[]): boolean {
  return getEmptyCells(cells).length === 0;
}

export function getBoardFillPercent(cells: Cell[]): number {
  const filled = cells.filter((c) => c.itemId).length;
  return Math.round((filled / TOTAL_CELLS) * 100);
}

export interface MergeHint {
  fromIndex: number;
  toIndex: number;
  itemId: string;
}

export function findMergeHint(cells: Cell[]): MergeHint | null {
  const byItem = new Map<string, number[]>();
  for (const cell of cells) {
    if (!cell.itemId) continue;
    const existing = byItem.get(cell.itemId) ?? [];
    existing.push(cell.index);
    byItem.set(cell.itemId, existing);
  }

  for (const [itemId, indices] of byItem.entries()) {
    if (indices.length >= 2 && getNextTier(itemId)) {
      return { fromIndex: indices[0], toIndex: indices[1], itemId };
    }
  }
  return null;
}

export function canClaimDailyReward(state: GameState, today: string): boolean {
  return state.dailyRewardClaimDate !== today;
}

export function claimDailyReward(state: GameState, today: string): GameState {
  const yesterday = getYesterday(today);
  const streakContinues = state.dailyRewardClaimDate === yesterday;
  const newDay = streakContinues
    ? (state.dailyRewardDay + 1) % 7
    : 0;
  return {
    ...state,
    dailyRewardDay: newDay,
    dailyRewardClaimDate: today,
    coins: state.coins + DAILY_REWARD_COINS[newDay],
  };
}

function getYesterday(today: string): string {
  const d = new Date(today + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function canWatchAd(state: GameState, today: string): boolean {
  return state.adsWatchedToday < MAX_DAILY_ADS;
}

export function applyAdReward(state: GameState, today: string): GameState {
  return {
    ...state,
    coins: state.coins + AD_REWARD_COINS,
    adsWatchedToday: state.adsWatchedToday + 1,
  };
}

export function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function checkGameOver(state: GameState): boolean {
  if (!isBoardFull(state.cells)) return false;
  return findMergeHint(state.cells) === null;
}

export function checkNewAchievements(state: GameState): string[] {
  const ctx = {
    totalMerges: state.totalMerges,
    bestCombo: state.bestCombo,
    itemsMerged: state.itemsMerged,
    score: state.score,
    coins: state.coins,
    totalSold: state.totalSold,
  };
  const newlyUnlocked: string[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (!state.unlockedAchievements.includes(ach.id) && ach.condition(ctx)) {
      newlyUnlocked.push(ach.id);
    }
  }
  return newlyUnlocked;
}

export function addToLeaderboard(highScores: number[], score: number): number[] {
  const updated = [...highScores, score].sort((a, b) => b - a).slice(0, 10);
  return updated;
}
