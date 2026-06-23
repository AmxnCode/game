import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/config';

interface Props {
  visible: boolean;
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  totalMerges: number;
  bestCombo: number;
  coinsEarned: number;
  adAvailable: boolean;
  onNewGame: () => void;
  onDoubleScore: () => void;
}

const GameOverModal: React.FC<Props> = ({
  visible,
  score,
  highScore,
  isNewHighScore,
  totalMerges,
  bestCombo,
  coinsEarned,
  adAvailable,
  onNewGame,
  onDoubleScore,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Game Over</Text>

          {isNewHighScore && (
            <Text style={styles.newBest}>🏆 New Best!</Text>
          )}

          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.score}>{score.toLocaleString()}</Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{totalMerges}</Text>
              <Text style={styles.statLbl}>Merges</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>x{bestCombo}</Text>
              <Text style={styles.statLbl}>Best Combo</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>🪙 {coinsEarned}</Text>
              <Text style={styles.statLbl}>Earned</Text>
            </View>
          </View>

          <Text style={styles.bestText}>Best: {highScore.toLocaleString()}</Text>

          {adAvailable && (
            <Pressable
              onPress={onDoubleScore}
              style={({ pressed }) => [styles.adBtn, { opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={styles.adBtnText}>📺 Double Score</Text>
            </Pressable>
          )}

          <Pressable
            onPress={onNewGame}
            style={({ pressed }) => [styles.playBtn, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.playBtnText}>▶ Play Again</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: 300,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.cellBorder,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },
  newBest: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: '800',
  },
  scoreLabel: {
    color: COLORS.textDim,
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '700',
    marginTop: 8,
  },
  score: {
    color: COLORS.text,
    fontSize: 48,
    fontWeight: '900',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cellBorder,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cellBorder,
    marginVertical: 8,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  statVal: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  statLbl: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: '600',
  },
  bestText: {
    color: COLORS.textDim,
    fontSize: 13,
  },
  adBtn: {
    backgroundColor: COLORS.combo,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  adBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  playBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  playBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default GameOverModal;
