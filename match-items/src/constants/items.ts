/**
 * Item definitions for Match Items — Merge Puzzle
 *
 * Each "chain" is a merge evolution tree.
 * Merging 2 identical items produces the next tier.
 * Max tier = 8 per chain. This is always visible to the player (no guessing).
 *
 * Design principle: keep chains short & clear so players never need to Google.
 */

export interface ItemDef {
  id: string;        // unique key
  tier: number;      // 1 = lowest, 8 = max
  chain: string;     // which evolution chain this belongs to
  emoji: string;     // visual representation (no assets needed)
  label: string;     // display name
  points: number;    // score value when created
  color: string;     // cell background tint
}

// ─── CHAIN: NATURE ───────────────────────────────────────────────
// Seed → Sprout → Flower → Bush → Tree → Apple Tree → Golden Tree → Ancient Tree
const NATURE: ItemDef[] = [
  { id: 'seed',         tier: 1, chain: 'nature', emoji: '🌱', label: 'Seed',         points: 1,    color: '#d4f0c0' },
  { id: 'sprout',       tier: 2, chain: 'nature', emoji: '🌿', label: 'Sprout',       points: 3,    color: '#b8e8a0' },
  { id: 'flower',       tier: 3, chain: 'nature', emoji: '🌸', label: 'Flower',       points: 8,    color: '#ffd6e8' },
  { id: 'bush',         tier: 4, chain: 'nature', emoji: '🌳', label: 'Bush',         points: 20,   color: '#a8d88a' },
  { id: 'tree',         tier: 5, chain: 'nature', emoji: '🌲', label: 'Tree',         points: 50,   color: '#78c850' },
  { id: 'apple_tree',   tier: 6, chain: 'nature', emoji: '🍎', label: 'Apple Tree',   points: 120,  color: '#ff8a80' },
  { id: 'golden_tree',  tier: 7, chain: 'nature', emoji: '✨', label: 'Golden Tree',  points: 300,  color: '#ffd700' },
  { id: 'ancient_tree', tier: 8, chain: 'nature', emoji: '🌟', label: 'Ancient Tree', points: 800,  color: '#ffec99' },
];

// ─── CHAIN: GEM ──────────────────────────────────────────────────
// Pebble → Stone → Crystal → Gem → Ruby → Diamond → Star Gem → Cosmic Gem
const GEM: ItemDef[] = [
  { id: 'pebble',      tier: 1, chain: 'gem', emoji: '🪨', label: 'Pebble',      points: 1,    color: '#e0e0e0' },
  { id: 'stone',       tier: 2, chain: 'gem', emoji: '💎', label: 'Stone',       points: 3,    color: '#d0d8e0' },
  { id: 'crystal',     tier: 3, chain: 'gem', emoji: '🔷', label: 'Crystal',     points: 8,    color: '#b3d9ff' },
  { id: 'gem',         tier: 4, chain: 'gem', emoji: '💠', label: 'Gem',         points: 20,   color: '#80c8ff' },
  { id: 'ruby',        tier: 5, chain: 'gem', emoji: '❤️', label: 'Ruby',        points: 50,   color: '#ff8080' },
  { id: 'diamond',     tier: 6, chain: 'gem', emoji: '💎', label: 'Diamond',     points: 120,  color: '#e0f4ff' },
  { id: 'star_gem',    tier: 7, chain: 'gem', emoji: '⭐', label: 'Star Gem',    points: 300,  color: '#fff380' },
  { id: 'cosmic_gem',  tier: 8, chain: 'gem', emoji: '🌠', label: 'Cosmic Gem',  points: 800,  color: '#c8a0ff' },
];

// ─── CHAIN: FOOD ─────────────────────────────────────────────────
// Berry → Apple → Cake → Pie → Feast → Banquet → Royal Feast → Legendary Meal
const FOOD: ItemDef[] = [
  { id: 'berry',          tier: 1, chain: 'food', emoji: '🫐', label: 'Berry',          points: 1,   color: '#d8b4fe' },
  { id: 'apple',          tier: 2, chain: 'food', emoji: '🍎', label: 'Apple',          points: 3,   color: '#fca5a5' },
  { id: 'cake',           tier: 3, chain: 'food', emoji: '🎂', label: 'Cake',           points: 8,   color: '#fde68a' },
  { id: 'pie',            tier: 4, chain: 'food', emoji: '🥧', label: 'Pie',            points: 20,  color: '#fed7aa' },
  { id: 'feast',          tier: 5, chain: 'food', emoji: '🍽️', label: 'Feast',          points: 50,  color: '#fbbf24' },
  { id: 'banquet',        tier: 6, chain: 'food', emoji: '🥂', label: 'Banquet',        points: 120, color: '#f59e0b' },
  { id: 'royal_feast',    tier: 7, chain: 'food', emoji: '👑', label: 'Royal Feast',    points: 300, color: '#ffd700' },
  { id: 'legendary_meal', tier: 8, chain: 'food', emoji: '🌈', label: 'Legendary Meal', points: 800, color: '#fbcfe8' },
];

// ─── All items flat map ───────────────────────────────────────────
export const ALL_ITEMS: ItemDef[] = [...NATURE, ...GEM, ...FOOD];

export const ITEM_MAP = new Map<string, ItemDef>(
  ALL_ITEMS.map((item) => [item.id, item])
);

/** Given an item id, returns the next tier item in the same chain, or null if max tier */
export function getNextTier(itemId: string): ItemDef | null {
  const current = ITEM_MAP.get(itemId);
  if (!current) return null;
  return ALL_ITEMS.find(
    (i) => i.chain === current.chain && i.tier === current.tier + 1
  ) ?? null;
}

/** Returns the first (tier-1) item of a chain */
export function getChainStart(chain: string): ItemDef {
  return ALL_ITEMS.find((i) => i.chain === chain && i.tier === 1)!;
}

/** Items that spawn from the generator (tier 1 of each chain) */
export const SPAWNABLE_ITEMS: ItemDef[] = ALL_ITEMS.filter((i) => i.tier === 1);

/** Chains available in game */
export const CHAINS = ['nature', 'gem', 'food'] as const;
export type Chain = typeof CHAINS[number];
