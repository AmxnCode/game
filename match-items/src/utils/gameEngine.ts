/**
 * Core game engine — pure functions, no side effects.
 * All state mutations happen here and return new state objects.
 */

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
} from '../constants/config';

// ─── Types ────────────────────────────────────────────────────────

export interface Cell {
  index: number;        // 0-based flat index
  itemId: string | null;
  locked: boolean;      // locked cells can't have items placed on them
}

export interface GameState {
  cells: Cell[];
  score: number;
  coins: number;
  highScore: number;
  moveCount: number;
  lastMergeTime: number;   // timestamp of last merge (for combos)
  comboCount: number;
  unlockedChains: string[];
  generators: GeneratorState[];
  isGameOver: boolean;
}

export interface GeneratorState {
  chain: string;
  cooldownUntil: number; // timestamp — 0 means ready
}

export interface MergeResult {
  newState: GameState;
  mergedItem: ItemDef;
  pointsEarned: number;
  isCombo: boolean;
  comboMultiplier: number;
  newChainUnlocked: string | null;
}

// ─── Board helpers ────────────────────────────────────────────────

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

// ─── Initial state ────────────────────────────────────────────────

export function createInitialState(): GameState {
  const cells: Cell[] = Array.from({ length: TOTAL_CELLS }, (_, i) => ({
    index: i,
    itemId: null,
    locked: false,
  }));

  // Pre-place 3 starter seeds on the board
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
  };
}

// ─── Spawn item from generator ────────────────────────────────────

export interface SpawnResult {
  newState: GameState;
  spawnedItemId: string;
  cellIndex: number;
}

export function spawnFromGenerator(
  state: GameState,
  chain: string,
  now: number
): SpawnResult | { error: string } {
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
    g.chain === chain ? { ...g, cooldownUntil: now + 0 } : g  // no cooldown — free to play
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

// ─── Move item (drag) ─────────────────────────────────────────────

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
    if (c.index === fromIndex) return { ...c, itemId: to.itemId }; // swap
    if (c.index === toIndex) return { ...c, itemId: from.itemId };
    return c;
  });

  return { ...state, cells: newCells };
}

// ─── Merge two identical items ────────────────────────────────────

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

  // Combo calculation
  const timeSinceLast = now - state.lastMergeTime;
  const isCombo = timeSinceLast <= COMBO_WINDOW_MS && state.comboCount > 0;
  const newComboCount = isCombo ? Math.min(state.comboCount + 1, 4) : 1;
  const comboMultiplier = COMBO_MULTIPLIERS[newComboCount - 1];

  const basePoints = next.points;
  const pointsEarned = Math.round(basePoints * comboMultiplier);
  const newScore = state.score + pointsEarned;
  const newHighScore = Math.max(state.highScore, newScore);

  // The merged item lands on toIndex, fromIndex becomes empty
  const newCells = state.cells.map((c) => {
    if (c.index === toIndex) return { ...c, itemId: next.id };
    if (c.index === fromIndex) return { ...c, itemId: null };
    return c;
  });

  // Check if a new chain unlocks
  let newChainUnlocked: string | null = null;
  const newUnlockedChains = [...state.unlockedChains];
  for (const [chain, threshold] of Object.entries(CHAIN_UNLOCK_SCORES)) {
    if (!newUnlockedChains.includes(chain) && newScore >= threshold) {
      newUnlockedChains.push(chain);
      newChainUnlocked = chain;
    }
  }

  // Add generator for newly unlocked chain
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

// ─── Sell item for coins ──────────────────────────────────────────

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
    newState: { ...state, cells: newCells, coins: state.coins + coinsEarned },
    coinsEarned,
  };
}

// ─── Board full check ─────────────────────────────────────────────

export function isBoardFull(cells: Cell[]): boolean {
  return getEmptyCells(cells).length === 0;
}

export function getBoardFillPercent(cells: Cell[]): number {
  const filled = cells.filter((c) => c.itemId).length;
  return Math.round((filled / TOTAL_CELLS) * 100);
}

// ─── Auto-merge hint: find the best merge available ───────────────

export interface MergeHint {
  fromIndex: number;
  toIndex: number;
  itemId: string;
}

export function findMergeHint(cells: Cell[]): MergeHint | null {
  // Find any two cells with the same item that can be merged
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

// ─── Check game over: board full + no valid merges ────────────────

export function checkGameOver(state: GameState): boolean {
  if (!isBoardFull(state.cells)) return false;
  return findMergeHint(state.cells) === null;
}
