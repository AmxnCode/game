import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, createInitialState } from './gameEngine';

const SAVE_KEY = 'match_items_save_v1';
const SETTINGS_KEY = 'match_items_settings_v1';

export interface Settings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  showMergeHints: boolean;
  notificationsEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  hapticsEnabled: true,
  showMergeHints: true,
  notificationsEnabled: true,
};

export async function saveGame(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save game:', e);
  }
}

export async function loadGame(): Promise<GameState> {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed.cells || !Array.isArray(parsed.cells)) return createInitialState();
    const fresh = createInitialState();
    return {
      ...fresh,
      ...parsed,
      dailyRewardDay: parsed.dailyRewardDay ?? fresh.dailyRewardDay,
      dailyRewardClaimDate: parsed.dailyRewardClaimDate ?? fresh.dailyRewardClaimDate,
      adsWatchedToday: parsed.adsWatchedToday ?? fresh.adsWatchedToday,
      totalMerges: parsed.totalMerges ?? fresh.totalMerges,
      bestCombo: parsed.bestCombo ?? fresh.bestCombo,
      itemsMerged: parsed.itemsMerged ?? fresh.itemsMerged,
      totalSold: parsed.totalSold ?? fresh.totalSold,
      unlockedAchievements: parsed.unlockedAchievements ?? fresh.unlockedAchievements,
      highScores: parsed.highScores ?? fresh.highScores,
      lastPlayedDate: parsed.lastPlayedDate ?? fresh.lastPlayedDate,
    };
  } catch (e) {
    console.warn('Failed to load game, starting fresh:', e);
    return createInitialState();
  }
}

export async function clearSave(): Promise<void> {
  await AsyncStorage.removeItem(SAVE_KEY);
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as Settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
