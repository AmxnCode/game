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
      : COLORS.accent;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.block}>
          <Text style={styles.label}>SCORE</Text>
          <Text style={styles.value}>{score.toLocaleString()}</Text>
        </View>

        {comboCount >= 2 && (
          <View style={styles.comboBadge}>
            <Text style={styles.comboText}>x{comboCount}</Text>
          </View>
        )}

        <View style={styles.block}>
          <Text style={styles.label}>BEST</Text>
          <Text style={styles.value}>{highScore.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.block}>
          <Text style={styles.label}>COINS</Text>
          <Text style={[styles.value, styles.goldValue]}>🪙 {coins}</Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>BOARD</Text>
          <View style={styles.fillRow}>
            <View style={styles.fillBg}>
              <View
                style={[
                  styles.fill,
                  { width: `${Math.min(100, boardFillPercent)}%` as any, backgroundColor: fillColor },
                ]}
              />
            </View>
            <Text style={[styles.fillText, { color: fillColor }]}>
              {boardFillPercent}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cellBorder,
    marginVertical: 10,
  },
  block: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  value: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  goldValue: {
    color: COLORS.gold,
  },
  comboBadge: {
    backgroundColor: COLORS.combo + '22',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  comboText: {
    color: COLORS.combo,
    fontSize: 16,
    fontWeight: '800',
  },
  fillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fillBg: {
    width: 60,
    height: 6,
    backgroundColor: COLORS.cellBorder,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  fillText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default React.memo(ScoreBar);
