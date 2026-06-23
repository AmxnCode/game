/**
 * Top score / coins / combo bar
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/config';

interface Props {
  score: number;
  highScore: number;
  coins: number;
  comboCount: number;
  boardFillPercent: number;
}

const ScoreBar: React.FC<Props> = ({
  score,
  highScore,
  coins,
  comboCount,
  boardFillPercent,
}) => {
  const fillColor =
    boardFillPercent >= 90
      ? COLORS.danger
      : boardFillPercent >= 70
      ? '#f59e0b'
      : COLORS.success;

  return (
    <View style={styles.container}>
      {/* Score */}
      <View style={styles.block}>
        <Text style={styles.dimLabel}>SCORE</Text>
        <Text style={styles.value}>{score.toLocaleString()}</Text>
      </View>

      {/* Combo */}
      {comboCount >= 2 && (
        <View style={[styles.block, styles.comboBlock]}>
          <Text style={styles.comboText}>🔥 x{comboCount}</Text>
        </View>
      )}

      {/* High score */}
      <View style={styles.block}>
        <Text style={styles.dimLabel}>BEST</Text>
        <Text style={styles.value}>{highScore.toLocaleString()}</Text>
      </View>

      {/* Coins */}
      <View style={styles.block}>
        <Text style={styles.dimLabel}>COINS</Text>
        <Text style={[styles.value, { color: COLORS.gold }]}>
          🪙 {coins}
        </Text>
      </View>

      {/* Board fill indicator */}
      <View style={[styles.block, styles.fillBlock]}>
        <Text style={styles.dimLabel}>BOARD</Text>
        <View style={styles.fillBarBg}>
          <View
            style={[
              styles.fillBarFill,
              { width: `${boardFillPercent}%` as any, backgroundColor: fillColor },
            ]}
          />
        </View>
        <Text style={[styles.fillPercent, { color: fillColor }]}>
          {boardFillPercent}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginHorizontal: 8,
    gap: 8,
  },
  block: {
    alignItems: 'center',
    flex: 1,
  },
  dimLabel: {
    color: COLORS.textDim,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  value: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  comboBlock: {
    backgroundColor: '#ff440020',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  comboText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ff8844',
  },
  fillBlock: {
    gap: 3,
  },
  fillBarBg: {
    width: 44,
    height: 5,
    backgroundColor: COLORS.cellBorder,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fillBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  fillPercent: {
    fontSize: 9,
    fontWeight: '700',
  },
});

export default React.memo(ScoreBar);
