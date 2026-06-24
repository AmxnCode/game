import React, { useEffect, useRef } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { COLORS, ACHIEVEMENTS } from '../constants/config';

interface Props {
  visible: boolean;
  achievementId: string | null;
  onClose: () => void;
}

const AchievementCelebrationModal: React.FC<Props> = ({
  visible,
  achievementId,
  onClose,
}) => {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  const dismissed = useRef(false);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const badgeRotate = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      dismissed.current = false;
      scale.value = withSpring(1, { stiffness: 200, damping: 12 });
      opacity.value = withTiming(1, { duration: 200 });
      iconScale.value = withSequence(
        withSpring(1.4, { stiffness: 200, damping: 10 }),
        withSpring(1, { stiffness: 200, damping: 12 })
      );
      badgeRotate.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );

      const timer = setTimeout(() => {
        if (!dismissed.current) onClose();
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      scale.value = 0;
      opacity.value = 0;
      iconScale.value = 0;
      badgeRotate.value = 0;
    }
  }, [visible, onClose, scale, opacity, iconScale, badgeRotate]);

  const handleClose = () => {
    dismissed.current = true;
    onClose();
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${interpolate(badgeRotate.value, [-10, 10], [-10, 10])}deg` },
    ],
  }));

  if (!achievement) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={styles.pressArea} onPress={handleClose}>
          <Animated.View style={[styles.card, cardStyle]}>
            <View style={styles.confettiRow}>
              <Text style={styles.confetti}>🎉</Text>
              <Animated.View style={iconStyle}>
                <View style={styles.iconCircle}>
                  <Text style={styles.icon}>{achievement.icon}</Text>
                </View>
              </Animated.View>
              <Text style={styles.confetti}>🎉</Text>
            </View>

            <Text style={styles.title}>Achievement Unlocked!</Text>
            <Text style={styles.name}>{achievement.label}</Text>
            <Text style={styles.desc}>{achievement.description}</Text>

            <Pressable onPress={handleClose} style={styles.btn}>
              <Text style={styles.btnText}>Awesome! 🏆</Text>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#000000cc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    width: '100%',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: 300,
    gap: 10,
    borderWidth: 2,
    borderColor: COLORS.gold + '55',
  },
  confettiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  confetti: {
    fontSize: 28,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gold + '22',
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 44,
  },
  title: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  name: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  desc: {
    color: COLORS.textDim,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  btn: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default AchievementCelebrationModal;
