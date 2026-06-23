/**
 * Central game state hook.
 * Wraps the pure game engine and handles:
 * - React state
 * - Auto-save on every change
 * - Haptic feedback
 * - Combo timer resets
 */

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
} from '../utils/gameEngine';
import { loadGame, saveGame } from '../utils/storage';

export interface UseGameStateReturn {
  state: GameState;
  isLoading: boolean;
  hint: MergeHint | null;

  // actions
  onSpawn: (chain: string) => void;
  onMerge: (fromIndex: number, toIndex: number) => MergeResult | null;
  onMove: (fromIndex: number, toIndex: number) => void;
  onSell: (cellIndex: number) => number;  // returns coins earned
  onNewGame: () => void;
  onShowHint: () => void;
}

export function useGameState(): UseGameStateReturn {
  const [state, setState] = useState<GameState>(createInitialState());
  const [isLoading, setIsLoading] = useState(true);
  const [hint, setHint] = useState<MergeHint | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved game on mount
  useEffect(() => {
    loadGame().then((saved) => {
      setState(saved);
      setIsLoading(false);
    });
  }, []);

  // Debounced auto-save — save 500ms after last action
  const scheduleSave = useCallback((newState: GameState) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveGame(newState), 500);
  }, []);

  const updateState = useCallback(
    (newState: GameState) => {
      setState(newState);
      scheduleSave(newState);
      // Clear hint when state changes
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
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateState(result.newState);
    },
    [state, updateState]
  );

  const onMerge = useCallback(
    (fromIndex: number, toIndex: number): MergeResult | null => {
      const now = Date.now();
      const result = mergeItems(state, fromIndex, toIndex, now);
      if ('error' in result) return null;

      // Stronger haptic for higher tier merges
      const tier = result.mergedItem.tier;
      if (tier >= 6) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (result.isCombo) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const withGameOverCheck = checkGameOver(result.newState)
        ? { ...result.newState, isGameOver: true }
        : result.newState;

      updateState(withGameOverCheck);
      return result;
    },
    [state, updateState]
  );

  const onMove = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newState = moveItem(state, fromIndex, toIndex);
      if (newState !== state) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        updateState(newState);
      }
    },
    [state, updateState]
  );

  const onSell = useCallback(
    (cellIndex: number): number => {
      const result = sellItem(state, cellIndex);
      if ('error' in result) return 0;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateState(result.newState);
      return result.coinsEarned;
    },
    [state, updateState]
  );

  const onNewGame = useCallback(() => {
    const fresh = createInitialState();
    // Preserve high score
    const withHighScore = { ...fresh, highScore: state.highScore };
    updateState(withHighScore);
  }, [state.highScore, updateState]);

  const onShowHint = useCallback(() => {
    const h = findMergeHint(state.cells);
    setHint(h);
    if (h) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Auto-clear hint after 3 seconds
    setTimeout(() => setHint(null), 3000);
  }, [state.cells]);

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
  };
}
