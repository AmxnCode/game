import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGameState } from '../hooks/useGameState';
import GameBoard from '../components/GameBoard';
import ScoreBar from '../components/ScoreBar';
import GeneratorBar from '../components/GeneratorBar';
import MergeChainGuide from '../components/MergeChainGuide';
import GameOverModal from '../components/GameOverModal';
import DailyRewardModal from '../components/DailyRewardModal';
import SettingsModal from '../components/SettingsModal';
import AchievementsModal from '../components/AchievementsModal';
import LeaderboardModal from '../components/LeaderboardModal';
import EventBanner from '../components/EventBanner';

import { getBoardFillPercent, isBoardFull } from '../utils/gameEngine';
import { COLORS, CHAIN_UNLOCK_SCORES } from '../constants/config';

interface Toast {
  text: string;
  isCombo: boolean;
  key: number;
}

const GameScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
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
    dailyRewardAvailable,
    onClaimDailyReward,
    adAvailable,
    onWatchAd,
    onDoubleScoreAd,
    settings,
    onToggleSetting,
    newAchievements,
    clearNewAchievements,
  } = useGameState();

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastKey, setToastKey] = useState(0);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    if (dailyRewardAvailable && !isLoading) {
      const timer = setTimeout(() => setShowDailyReward(true), 600);
      return () => clearTimeout(timer);
    }
  }, [dailyRewardAvailable, isLoading]);

  useEffect(() => {
    if (newAchievements.length > 0) {
      const timer = setTimeout(() => clearNewAchievements(), 4000);
      return () => clearTimeout(timer);
    }
  }, [newAchievements, clearNewAchievements]);

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

  const handleClaimDailyReward = useCallback(() => {
    onClaimDailyReward();
    setShowDailyReward(false);
  }, [onClaimDailyReward]);

  const handleNewGame = useCallback(() => {
    setShowDailyReward(false);
    onNewGame();
  }, [onNewGame]);

  const fillPercent = getBoardFillPercent(state.cells);
  const boardFull = isBoardFull(state.cells);
  const coinsEarned = state.coins;
  const chainList: ('gem' | 'food' | 'magic')[] = ['gem', 'food', 'magic'];
  const lastUnlockedIndex = chainList.findLastIndex((ch) => state.unlockedChains.includes(ch));

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.gameTitle}>Match Items</Text>
            <Pressable
              onPress={() => setShowSettings(true)}
              style={styles.settingsBtn}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Open settings"
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </Pressable>
          </View>
          <Text style={styles.tagline}>Merge Puzzle</Text>
        </View>

        {/* Event banner */}
        <EventBanner />

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

        {/* Achievement toast */}
        {newAchievements.length > 0 && (
          <View style={styles.achToast}>
            <Text style={styles.achToastText}>
              🏆 New Achievement{newAchievements.length > 1 ? 's' : ''} Unlocked!
            </Text>
          </View>
        )}

        {/* Ad reward button */}
        {adAvailable && !state.isGameOver && (
          <Pressable
            onPress={onWatchAd}
            style={({ pressed }) => [
              styles.adRewardBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.adRewardText}>📺 Watch Ad — Get 25 Coins</Text>
          </Pressable>
        )}

        {/* Hint instruction */}
        <Text style={styles.tip}>
          Tap to select · Tap matching item to merge · Drag to move · Long press to sell
        </Text>

        {/* Generator bar */}
        <GeneratorBar
          generators={state.generators}
          onSpawn={onSpawn}
          boardIsFull={boardFull}
        />

        {/* Bottom actions */}
        <View style={styles.actions}>
          <View style={styles.actionRow}>
            <Pressable
              onPress={() => setShowAchievements(true)}
              style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={styles.actionIcon}>🏆</Text>
              <Text style={styles.actionLabel}>Achievements</Text>
            </Pressable>

            <Pressable
              onPress={onShowHint}
              style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={styles.actionIcon}>💡</Text>
              <Text style={styles.actionLabel}>Hint</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowLeaderboard(true)}
              style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={styles.actionIcon}>🏅</Text>
              <Text style={styles.actionLabel}>Scores</Text>
            </Pressable>

            <Pressable
              onPress={handleNewGame}
              style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={styles.actionIcon}>🔄</Text>
              <Text style={styles.actionLabel}>New Game</Text>
            </Pressable>
          </View>

          <View style={styles.actionRow}>
            <MergeChainGuide unlockedChains={state.unlockedChains} />
          </View>
        </View>

        {/* Unlock progress bars */}
        {chainList.map((chain) => {
          const prevIdx = chainList.indexOf(chain) - 1;
          const prevUnlocked = prevIdx < 0 || state.unlockedChains.includes(chainList[prevIdx]);
          const alreadyUnlocked = state.unlockedChains.includes(chain);
          if (alreadyUnlocked || !prevUnlocked) return null;

          const emoji = chain === 'gem' ? '💎' : chain === 'food' ? '🍎' : '✨';
          const label = chain === 'gem' ? 'Gems' : chain === 'food' ? 'Food' : 'Magic';

          return (
            <View key={chain} style={styles.unlockBar}>
              <Text style={styles.unlockLabel}>
                {emoji} {label}
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, (state.score / CHAIN_UNLOCK_SCORES[chain]) * 100)}%` as any },
                  ]}
                />
              </View>
              <Text style={styles.unlockText}>
                {state.score} / {CHAIN_UNLOCK_SCORES[chain]} pts
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Game Over modal */}
      <GameOverModal
        visible={state.isGameOver}
        score={state.score}
        highScore={state.highScore}
        isNewHighScore={state.score >= state.highScore && state.score > 0}
        totalMerges={state.totalMerges}
        bestCombo={state.bestCombo}
        coinsEarned={coinsEarned}
        adAvailable={adAvailable}
        onNewGame={handleNewGame}
        onDoubleScore={onDoubleScoreAd}
      />

      {/* Daily Reward modal */}
      <DailyRewardModal
        visible={showDailyReward}
        streakDay={state.dailyRewardDay}
        onClaim={handleClaimDailyReward}
        onClose={() => setShowDailyReward(false)}
      />

      {/* Settings modal */}
      <SettingsModal
        visible={showSettings}
        settings={settings}
        onToggle={onToggleSetting}
        onClose={() => setShowSettings(false)}
      />

      {/* Achievements modal */}
      <AchievementsModal
        visible={showAchievements}
        unlockedIds={state.unlockedAchievements}
        state={{
          totalMerges: state.totalMerges,
          bestCombo: state.bestCombo,
          itemsMerged: state.itemsMerged,
          score: state.score,
          coins: state.coins,
          totalSold: state.totalSold,
        }}
        onClose={() => setShowAchievements(false)}
      />

      {/* Leaderboard modal */}
      <LeaderboardModal
        visible={showLeaderboard}
        highScores={state.highScores}
        currentScore={state.score}
        onClose={() => setShowLeaderboard(false)}
      />
    </View>
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
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  gameTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  settingsBtn: {
    padding: 8,
    position: 'absolute',
    right: 4,
  },
  settingsIcon: {
    fontSize: 20,
  },
  tagline: {
    color: COLORS.accentLight,
    fontSize: 11,
    fontWeight: '700',
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.success + '88',
  },
  toastCombo: {
    borderColor: COLORS.combo,
    backgroundColor: '#ff440030',
  },
  toastText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  achToast: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.gold + '66',
    alignItems: 'center',
  },
  achToastText: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '800',
  },
  tip: {
    color: COLORS.textDim,
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  adRewardBtn: {
    backgroundColor: COLORS.combo,
    marginHorizontal: 12,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  adRewardText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  actions: {
    gap: 8,
    paddingHorizontal: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: COLORS.cellBorder,
    maxWidth: 90,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabel: {
    color: COLORS.textDim,
    fontSize: 9,
    fontWeight: '700',
  },
  unlockBar: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 12,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.gold + '33',
    gap: 6,
  },
  unlockLabel: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.cellBorder,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 4,
  },
  unlockText: {
    color: COLORS.textDim,
    fontSize: 11,
    textAlign: 'right',
    fontWeight: '600',
  },
});

export default GameScreen;
