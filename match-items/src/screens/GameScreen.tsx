/**
 * Main game screen.
 * Assembles all components.
 */

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { useGameState } from '../hooks/useGameState';
import GameBoard from '../components/GameBoard';
import ScoreBar from '../components/ScoreBar';
import GeneratorBar from '../components/GeneratorBar';
import MergeChainGuide from '../components/MergeChainGuide';
import GameOverModal from '../components/GameOverModal';

import { getBoardFillPercent, isBoardFull } from '../utils/gameEngine';
import { COLORS } from '../constants/config';

// Floating toast for merge feedback
interface Toast {
  text: string;
  isCombo: boolean;
  key: number;
}

const GameScreen: React.FC = () => {
  const {
    state,
    isLoading,
    hint,
    onSpawn,
    onMerge,
    onMove,
    onSell,
    onNewGame,
    onShowHint,
  } = useGameState();

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastKey, setToastKey] = useState(0);

  const showToast = useCallback((text: string, isCombo: boolean) => {
    const key = toastKey + 1;
    setToastKey(key);
    setToasts((prev) => [...prev.slice(-2), { text, isCombo, key }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.key !== key));
    }, 1200);
  }, [toastKey]);

  const handleMerge = useCallback(
    (from: number, to: number) => {
      const result = onMerge(from, to);
      if (result) {
        const prefix = result.isCombo
          ? `🔥 x${result.comboMultiplier}x COMBO! `
          : '';
        showToast(`${prefix}+${result.pointsEarned} ${result.mergedItem.label}!`, result.isCombo);

        if (result.newChainUnlocked) {
          showToast(`🎉 ${result.newChainUnlocked} chain unlocked!`, false);
        }
      }
      return result;
    },
    [onMerge, showToast]
  );

  const handleSell = useCallback(
    (index: number) => {
      const coins = onSell(index);
      if (coins > 0) showToast(`🪙 +${coins} sold`, false);
    },
    [onSell, showToast]
  );

  const fillPercent = getBoardFillPercent(state.cells);
  const boardFull = isBoardFull(state.cells);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.gameTitle}>Match Items</Text>
          <Text style={styles.tagline}>Merge Puzzle</Text>
        </View>

        {/* Score bar */}
        <ScoreBar
          score={state.score}
          highScore={state.highScore}
          coins={state.coins}
          comboCount={state.comboCount}
          boardFillPercent={fillPercent}
        />

        {/* Board */}
        <View style={styles.boardWrapper}>
          <GameBoard
            cells={state.cells}
            hint={hint}
            onMerge={handleMerge}
            onMove={onMove}
            onSell={handleSell}
          />
          {/* Toast overlays */}
          <View style={styles.toastLayer} pointerEvents="none">
            {toasts.map((t) => (
              <View
                key={t.key}
                style={[styles.toast, t.isCombo && styles.toastCombo]}
              >
                <Text style={styles.toastText}>{t.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Hint instruction */}
        <Text style={styles.tip}>
          Tap to select · Tap matching item to merge · Long press to sell
        </Text>

        {/* Generator bar */}
        <GeneratorBar
          generators={state.generators}
          onSpawn={onSpawn}
          boardIsFull={boardFull}
        />

        {/* Bottom actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={onShowHint}
            style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Show merge hint"
          >
            <Text style={styles.actionIcon}>💡</Text>
            <Text style={styles.actionLabel}>Hint</Text>
          </Pressable>

          <MergeChainGuide unlockedChains={state.unlockedChains} />

          <Pressable
            onPress={onNewGame}
            style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Start new game"
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionLabel}>New Game</Text>
          </Pressable>
        </View>

        {/* Unlock progress */}
        {!state.unlockedChains.includes('gem') && (
          <View style={styles.unlockBar}>
            <Text style={styles.unlockText}>
              💎 Gems unlock at 200 pts ({Math.max(0, 200 - state.score)} to go)
            </Text>
          </View>
        )}
        {state.unlockedChains.includes('gem') && !state.unlockedChains.includes('food') && (
          <View style={styles.unlockBar}>
            <Text style={styles.unlockText}>
              🍎 Food unlock at 600 pts ({Math.max(0, 600 - state.score)} to go)
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Game Over modal */}
      <GameOverModal
        visible={state.isGameOver}
        score={state.score}
        highScore={state.highScore}
        isNewHighScore={state.score >= state.highScore && state.score > 0}
        onNewGame={onNewGame}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingVertical: 12,
    gap: 12,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  gameTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tagline: {
    color: COLORS.accentLight,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  boardWrapper: {
    position: 'relative',
  },
  toastLayer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  toast: {
    backgroundColor: '#000000cc',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  toastCombo: {
    borderColor: '#ff8844',
    backgroundColor: '#ff440030',
  },
  toastText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  tip: {
    color: COLORS.textDim,
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  actionBtn: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: COLORS.cellBorder,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: '600',
  },
  unlockBar: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.gold + '44',
  },
  unlockText: {
    color: COLORS.gold,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default GameScreen;
