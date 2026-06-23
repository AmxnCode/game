import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ALL_ITEMS } from '../constants/items';
import { COLORS } from '../constants/config';

interface Props {
  unlockedChains: string[];
}

const CHAIN_LABELS: Record<string, string> = {
  nature: '🌿 Nature',
  gem: '💎 Gems',
  food: '🍽️ Food',
  magic: '✨ Magic',
};

const MergeChainGuide: React.FC<Props> = ({ unlockedChains }) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [styles.trigger, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Text style={styles.triggerText}>📖 Guide</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
        <View style={styles.sheet}>
          <Text style={styles.title}>Merge Chains</Text>
          <Text style={styles.subtitle}>Merge 2 of the same item → next tier</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {unlockedChains.map((chain) => {
              const chainItems = ALL_ITEMS.filter((i) => i.chain === chain).sort((a, b) => a.tier - b.tier);
              return (
                <View key={chain} style={styles.chainBlock}>
                  <Text style={styles.chainTitle}>{CHAIN_LABELS[chain]}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chainRow}>
                    {chainItems.map((item, idx) => (
                      <View key={item.id} style={styles.tierItem}>
                        <View style={[styles.tierCircle, { backgroundColor: item.color + '33', borderColor: item.color + '66' }]}>
                          <Text style={styles.tierEmoji}>{item.emoji}</Text>
                        </View>
                        <Text style={styles.tierLabel} numberOfLines={2}>{item.label}</Text>
                        <Text style={styles.tierPoints}>+{item.points}</Text>
                        {idx < chainItems.length - 1 && <Text style={styles.arrow}>→</Text>}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              );
            })}
          </ScrollView>

          <Pressable onPress={() => setVisible(false)} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flex: 1,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cellBorder,
    maxWidth: 90,
  },
  triggerText: {
    color: COLORS.textDim,
    fontSize: 9,
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#00000077',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '75%',
    borderTopWidth: 1,
    borderColor: COLORS.cellBorder,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textDim,
    fontSize: 13,
    marginBottom: 16,
  },
  chainBlock: {
    marginBottom: 20,
  },
  chainTitle: {
    color: COLORS.accentLight,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tierItem: {
    alignItems: 'center',
    position: 'relative',
    marginRight: 24,
  },
  tierCircle: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierEmoji: {
    fontSize: 26,
  },
  tierLabel: {
    color: COLORS.text,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 56,
    fontWeight: '600',
  },
  tierPoints: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
  },
  arrow: {
    position: 'absolute',
    right: -18,
    top: 16,
    color: COLORS.textDim,
    fontSize: 14,
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

export default MergeChainGuide;
