import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/config';

interface Props {
  visible: boolean;
  highScores: number[];
  currentScore: number;
  onClose: () => void;
}

const LeaderboardModal: React.FC<Props> = ({ visible, highScores, currentScore, onClose }) => {
  const displayScores = highScores.length > 0 ? highScores : [currentScore].filter(s => s > 0);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>🏆 Leaderboard</Text>
          <Text style={styles.sub}>Top 10 Scores</Text>

          {displayScores.length === 0 ? (
            <Text style={styles.empty}>No scores yet. Play a game!</Text>
          ) : (
            <View style={styles.list}>
              {displayScores.map((s, i) => (
                <View
                  key={i}
                  style={[styles.row, i === 0 && styles.rowFirst]}
                >
                  <Text style={[styles.rank, i < 3 && styles.rankTop]}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </Text>
                  <Text style={styles.score}>{s.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}

          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
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
    padding: 24,
    width: 280,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.gold + '44',
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },
  sub: {
    color: COLORS.textDim,
    fontSize: 12,
    marginBottom: 8,
  },
  empty: {
    color: COLORS.textDim,
    fontSize: 14,
    paddingVertical: 20,
  },
  list: {
    width: '100%',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: 10,
  },
  rowFirst: {
    borderWidth: 1,
    borderColor: COLORS.gold + '66',
  },
  rank: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    width: 36,
    textAlign: 'center',
  },
  rankTop: {
    fontSize: 20,
  },
  score: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    textAlign: 'right',
  },
  closeBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 12,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LeaderboardModal;
