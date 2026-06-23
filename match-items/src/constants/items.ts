export interface ItemDef {
  id: string;
  tier: number;
  chain: string;
  emoji: string;
  label: string;
  points: number;
  color: string;
}

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

const MAGIC: ItemDef[] = [
  { id: 'spark',          tier: 1, chain: 'magic', emoji: '✨', label: 'Spark',          points: 2,   color: '#ffe0f0' },
  { id: 'glow',           tier: 2, chain: 'magic', emoji: '💫', label: 'Glow',           points: 5,   color: '#ffc8e0' },
  { id: 'charm',          tier: 3, chain: 'magic', emoji: '🍀', label: 'Charm',          points: 12,  color: '#ffa8d0' },
  { id: 'spell',          tier: 4, chain: 'magic', emoji: '📜', label: 'Spell',          points: 30,  color: '#ff80c0' },
  { id: 'wand',           tier: 5, chain: 'magic', emoji: '🪄', label: 'Wand',           points: 70,  color: '#ff60b0' },
  { id: 'potion',         tier: 6, chain: 'magic', emoji: '🧪', label: 'Potion',         points: 160, color: '#ff40a0' },
  { id: 'crystal_ball',  tier: 7, chain: 'magic', emoji: '🔮', label: 'Crystal Ball',   points: 400, color: '#ff20a0' },
  { id: 'phoenix',       tier: 8, chain: 'magic', emoji: '🦄', label: 'Phoenix',        points: 1000, color: '#ff0090' },
];

export const ALL_ITEMS: ItemDef[] = [...NATURE, ...GEM, ...FOOD, ...MAGIC];

export const ITEM_MAP = new Map<string, ItemDef>(
  ALL_ITEMS.map((item) => [item.id, item])
);

export function getNextTier(itemId: string): ItemDef | null {
  const current = ITEM_MAP.get(itemId);
  if (!current) return null;
  return ALL_ITEMS.find(
    (i) => i.chain === current.chain && i.tier === current.tier + 1
  ) ?? null;
}

export function getChainStart(chain: string): ItemDef {
  return ALL_ITEMS.find((i) => i.chain === chain && i.tier === 1)!;
}

export const SPAWNABLE_ITEMS: ItemDef[] = ALL_ITEMS.filter((i) => i.tier === 1);

export const CHAINS = ['nature', 'gem', 'food', 'magic'] as const;
export type Chain = typeof CHAINS[number];
