import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, ACHIEVEMENTS } from '../constants/config';

interface Props {
  visible: boolean;
  unlockedIds: string[];
  state: { totalMerges: number; bestCombo: number; itemsMerged: number; score: number; coins: number; totalSold: number };
  onClose: () => void;
}

const AchievementsModal: React.FC<Props> = ({ visible, unlockedIds, state, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>🏆 Achievements</Text>
        <Text style={styles.count}>
          {unlockedIds.length} / {ACHIEVEMENTS.length} unlocked
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = unlockedIds.includes(ach.id);
            return (
              <View
                key={ach.id}
                style={[styles.row, unlocked && styles.rowUnlocked]}
              >
                <Text style={styles.icon}>
                  {unlocked ? ach.icon : '🔒'}
                </Text>
                <View style={styles.info}>
                  <Text style={[styles.label, !unlocked && styles.labelDim]}>
                    {ach.label}
                  </Text>
                  <Text style={styles.desc}>{ach.description}</Text>
                </View>
                {unlocked && <Text>✅</Text>}
              </View>
            );
          })}
        </ScrollView>

        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000077',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderColor: COLORS.cellBorder,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  count: {
    color: COLORS.textDim,
    fontSize: 13,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: COLORS.surfaceRaised,
  },
  rowUnlocked: {
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: 1,
    borderColor: COLORS.gold + '44',
  },
  icon: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  info: {
    flex: 1,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  labelDim: {
    color: COLORS.textDim,
  },
  desc: {
    color: COLORS.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AchievementsModal;
