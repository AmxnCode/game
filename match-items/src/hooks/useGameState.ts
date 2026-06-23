import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  GameState,
  createInitialState,
  spawnFromGenerator,
  mergeItems,
  moveItem,
  sellItem,
  checkGameOver,
  findMergeHint,
  MergeHint,
  MergeResult,
  canClaimDailyReward,
  claimDailyReward,
  canWatchAd,
  applyAdReward,
  getTodayStr,
  checkNewAchievements,
  addToLeaderboard,
} from '../utils/gameEngine';
import { loadGame, saveGame, loadSettings, saveSettings, Settings, DEFAULT_SETTINGS } from '../utils/storage';
import { AD_REWARD_COINS } from '../constants/config';
import {
  playMerge,
  playCombo,
  playSpawn,
  playSell,
  playCoin,
  playGameOver,
  playAchievement,
  playDailyReward,
  setSoundEnabled,
} from '../services/sound';

export interface UseGameStateReturn {
  state: GameState;
  isLoading: boolean;
  hint: MergeHint | null;

  onSpawn: (chain: string) => void;
  onMerge: (fromIndex: number, toIndex: number) => MergeResult | null;
  onMove: (fromIndex: number, toIndex: number) => void;
  onSell: (cellIndex: number) => number;
  onNewGame: () => void;
  onShowHint: () => void;

  dailyRewardAvailable: boolean;
  onClaimDailyReward: () => void;
  adAvailable: boolean;
  onWatchAd: () => number | undefined;
  onDoubleScoreAd: () => void;

  settings: Settings;
  onToggleSetting: (key: keyof Settings) => void;
  newAchievements: string[];
  clearNewAchievements: () => void;
}

export function useGameState(): UseGameStateReturn {
  const [state, setState] = useState<GameState>(createInitialState());
  const [isLoading, setIsLoading] = useState(true);
  const [hint, setHint] = useState<MergeHint | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([loadGame(), loadSettings()]).then(([saved, loadedSettings]) => {
      const today = getTodayStr();
      if (saved.dailyRewardClaimDate !== today) {
        saved.adsWatchedToday = 0;
      }
      setState(saved);
      setSettings(loadedSettings);
      setSoundEnabled(loadedSettings.soundEnabled);
      setIsLoading(false);
    });
  }, []);

  const scheduleSave = useCallback((newState: GameState) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveGame(newState), 500);
  }, []);

  const updateState = useCallback(
    (newState: GameState) => {
      setState(newState);
      scheduleSave(newState);
      setHint(null);
    },
    [scheduleSave]
  );

  const onSpawn = useCallback(
    (chain: string) => {
      const now = Date.now();
      const result = spawnFromGenerator(state, chain, now);
      if ('error' in result) {
        if (result.error === 'Board is full') {
          if (settings.hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        return;
      }
      if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playSpawn();
      updateState(result.newState);
    },
    [state, settings, updateState]
  );

  const onMerge = useCallback(
    (fromIndex: number, toIndex: number): MergeResult | null => {
      const now = Date.now();
      const result = mergeItems(state, fromIndex, toIndex, now);
      if ('error' in result) return null;

      if (settings.hapticsEnabled) {
        const tier = result.mergedItem.tier;
        if (tier >= 6) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (result.isCombo) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }

      if (result.isCombo) playCombo();
      else playMerge();

      // Check achievements
      const resultWithAchievements = { ...result.newState };
      const newlyUnlocked = checkNewAchievements(resultWithAchievements);
      if (newlyUnlocked.length > 0) {
        resultWithAchievements.unlockedAchievements = [
          ...new Set([...result.newState.unlockedAchievements, ...newlyUnlocked]),
        ];
        playAchievement();
        setNewAchievements((prev) => [...prev, ...newlyUnlocked]);
      }

      const withGameOverCheck = checkGameOver(resultWithAchievements)
        ? { ...resultWithAchievements, isGameOver: true }
        : resultWithAchievements;

      if (withGameOverCheck.isGameOver) {
        playGameOver();
        // Add to leaderboard
        const newScores = addToLeaderboard(withGameOverCheck.highScores, withGameOverCheck.score);
        withGameOverCheck.highScores = newScores;
      }

      updateState(withGameOverCheck);
      return result;
    },
    [state, settings, updateState]
  );

  const onMove = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newState = moveItem(state, fromIndex, toIndex);
      if (newState !== state) {
        if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        updateState(newState);
      }
    },
    [state, settings, updateState]
  );

  const onSell = useCallback(
    (cellIndex: number): number => {
      const result = sellItem(state, cellIndex);
      if ('error' in result) return 0;
      if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playSell();

      // Check sell achievements
      const newlyUnlocked = checkNewAchievements(result.newState);
      if (newlyUnlocked.length > 0) {
        result.newState.unlockedAchievements = [
          ...new Set([...result.newState.unlockedAchievements, ...newlyUnlocked]),
        ];
        playAchievement();
        setNewAchievements((prev) => [...prev, ...newlyUnlocked]);
      }

      updateState(result.newState);
      return result.coinsEarned;
    },
    [state, settings, updateState]
  );

  const onNewGame = useCallback(() => {
    const fresh = createInitialState();
    const withHighScore = {
      ...fresh,
      highScore: state.highScore,
      dailyRewardDay: state.dailyRewardDay,
      dailyRewardClaimDate: state.dailyRewardClaimDate,
      unlockedAchievements: state.unlockedAchievements,
      highScores: state.highScores,
    };
    updateState(withHighScore);
  }, [state, updateState]);

  const onShowHint = useCallback(() => {
    const h = findMergeHint(state.cells);
    setHint(h);
    if (h && settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTimeout(() => setHint(null), 3000);
  }, [state.cells, settings]);

  // ── Monetization ──

  const today = getTodayStr();
  const dailyRewardAvailable = canClaimDailyReward(state, today);
  const adAvailable = canWatchAd(state, today);

  const onClaimDailyReward = useCallback(() => {
    const today = getTodayStr();
    if (!canClaimDailyReward(state, today)) return;
    const newState = claimDailyReward(state, today);
    if (settings.hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playDailyReward();
    updateState(newState);
  }, [state, settings, updateState]);

  const onWatchAd = useCallback(() => {
    const today = getTodayStr();
    if (!canWatchAd(state, today)) return;
    const rewardAmount = AD_REWARD_COINS;
    const newState = applyAdReward(state, today);
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playCoin();
    updateState(newState);
    return rewardAmount;
  }, [state, settings, updateState]);

  const onDoubleScoreAd = useCallback(() => {
    const today = getTodayStr();
    if (!canWatchAd(state, today)) return;
    const doubled = state.score * 2;
    const newHighScores = addToLeaderboard(state.highScores, doubled);
    const newState = {
      ...applyAdReward(state, today),
      score: doubled,
      highScore: Math.max(state.highScore, doubled),
      isGameOver: false,
      highScores: newHighScores,
    };
    if (settings.hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playCoin();
    updateState(newState);
  }, [state, settings, updateState]);

  // ── Settings ──

  const onToggleSetting = useCallback(
    (key: keyof Settings) => {
      const updated = { ...settings, [key]: !settings[key] };
      setSettings(updated);
      saveSettings(updated);
      if (key === 'soundEnabled') setSoundEnabled(updated.soundEnabled);
    },
    [settings]
  );

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  return {
    state,
    isLoading,
    hint,
    onSpawn,
    onMerge,
    onMove,
    onSell,
    onNewGame,
    onShowHint,
    dailyRewardAvailable,
    onClaimDailyReward,
    adAvailable,
    onWatchAd,
    onDoubleScoreAd,
    settings,
    onToggleSetting,
    newAchievements,
    clearNewAchievements,
  };
}
