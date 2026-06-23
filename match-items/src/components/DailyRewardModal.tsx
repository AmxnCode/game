import React, { useEffect, useRef } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, DAILY_REWARD_COINS } from '../constants/config';

interface Props {
  visible: boolean;
  streakDay: number;
  onClaim: () => void;
  onClose: () => void;
}

const DailyRewardModal: React.FC<Props> = ({ visible, streakDay, onClaim, onClose }) => {
  const claimed = useRef(false);

  useEffect(() => {
    if (visible) claimed.current = false;
  }, [visible]);

  const reward = DAILY_REWARD_COINS[streakDay];
  const nextReward = DAILY_REWARD_COINS[(streakDay + 1) % 7];

  const handleClaim = () => {
    if (claimed.current) return;
    claimed.current = true;
    onClaim();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>🎁 Daily Reward</Text>

          <View style={styles.coinBox}>
            <Text style={styles.coinEmoji}>🪙</Text>
            <Text style={styles.coinAmount}>+{reward}</Text>
          </View>

          <Text style={styles.streak}>Day {streakDay + 1} streak</Text>

          <View style={styles.dots}>
            {DAILY_REWARD_COINS.map((c, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === streakDay && styles.dotActive,
                  i < streakDay && styles.dotClaimed,
                ]}
              >
                <Text style={[styles.dotText, i <= streakDay && styles.dotTextActive]}>
                  {c}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.next}>Next: +{nextReward} coins</Text>

          <Pressable
            onPress={handleClaim}
            style={({ pressed }) => [styles.claimBtn, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.claimText}>Claim 🎉</Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={styles.skipText}>Not now</Text>
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
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.gold + '44',
  },
  title: {
    color: COLORS.gold,
    fontSize: 22,
    fontWeight: '900',
  },
  coinBox: {
    alignItems: 'center',
    gap: 4,
    marginVertical: 8,
  },
  coinEmoji: {
    fontSize: 48,
  },
  coinAmount: {
    color: COLORS.gold,
    fontSize: 36,
    fontWeight: '900',
  },
  streak: {
    color: COLORS.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.cellBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: COLORS.gold,
  },
  dotClaimed: {
    backgroundColor: COLORS.success + '44',
  },
  dotText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textDim,
  },
  dotTextActive: {
    color: '#000',
  },
  next: {
    color: COLORS.textDim,
    fontSize: 12,
  },
  claimBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  claimText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800',
  },
  skipBtn: {
    paddingVertical: 6,
  },
  skipText: {
    color: COLORS.textDim,
    fontSize: 13,
  },
});

export default DailyRewardModal;
