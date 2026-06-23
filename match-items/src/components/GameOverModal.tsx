/**
 * Game Over modal.
 * Shows final score and new game button.
 * No forced ads, no pay-to-continue wall.
 */

import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../constants/config';

interface Props {
  visible: boolean;
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onNewGame: () => void;
}

const GameOverModal: React.FC<Props> = ({
  visible,
  score,
  highScore,
  isNewHighScore,
  onNewGame,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Board Full!</Text>
          <Text style={styles.subtitle}>No more merges possible</Text>

          {isNewHighScore && (
            <Text style={styles.newBest}>🏆 New High Score!</Text>
          )}

          <Text style={styles.scoreLabel}>Your Score</Text>
          <Text style={styles.score}>{score.toLocaleString()}</Text>

          <Text style={styles.bestLabel}>
            Best: {highScore.toLocaleString()}
          </Text>

          <Pressable
            onPress={onNewGame}
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Start new game"
          >
            <Text style={styles.buttonText}>▶ Play Again</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#000000bb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: 300,
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.textDim,
    fontSize: 14,
  },
  newBest: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 4,
  },
  scoreLabel: {
    color: COLORS.textDim,
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 8,
  },
  score: {
    color: COLORS.text,
    fontSize: 48,
    fontWeight: '900',
  },
  bestLabel: {
    color: COLORS.textDim,
    fontSize: 13,
    marginBottom: 8,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default GameOverModal;
