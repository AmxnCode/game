/**
 * Merge chain guide — always accessible so players never need to Google.
 * Shows all chains and their evolution paths.
 */

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ALL_ITEMS } from '../constants/items';
import { COLORS } from '../constants/config';

interface Props {
  unlockedChains: string[];
}

const CHAIN_LABELS: Record<string, string> = {
  nature: '🌿 Nature',
  gem: '💎 Gems',
  food: '🍽️ Food',
};

const MergeChainGuide: React.FC<Props> = ({ unlockedChains }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={styles.trigger}
        accessible
        accessibilityRole="button"
        accessibilityLabel="View merge guide"
      >
        <Text style={styles.triggerText}>📖 Merge Guide</Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
        <View style={styles.sheet}>
          <Text style={styles.title}>Merge Chains</Text>
          <Text style={styles.subtitle}>
            Merge 2 of the same item → next tier
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {unlockedChains.map((chain) => {
              const chainItems = ALL_ITEMS.filter(
                (i) => i.chain === chain
              ).sort((a, b) => a.tier - b.tier);

              return (
                <View key={chain} style={styles.chainBlock}>
                  <Text style={styles.chainTitle}>{CHAIN_LABELS[chain]}</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chainRow}
                  >
                    {chainItems.map((item, idx) => (
                      <View key={item.id} style={styles.tierItem}>
                        <View
                          style={[
                            styles.tierCircle,
                            { backgroundColor: item.color + '44', borderColor: item.color },
                          ]}
                        >
                          <Text style={styles.tierEmoji}>{item.emoji}</Text>
                        </View>
                        <Text style={styles.tierLabel} numberOfLines={2}>
                          {item.label}
                        </Text>
                        <Text style={styles.tierPoints}>+{item.points}</Text>
                        {idx < chainItems.length - 1 && (
                          <Text style={styles.arrow}>→</Text>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              );
            })}
          </ScrollView>

          <Pressable onPress={() => setVisible(false)} style={styles.closeBtn}>
            <Text style={styles.closeTxt}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.cellBorder,
  },
  triggerText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '75%',
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
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
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 4,
  },
  tierItem: {
    alignItems: 'center',
    position: 'relative',
    marginRight: 24,
  },
  tierCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierEmoji: {
    fontSize: 24,
  },
  tierLabel: {
    color: COLORS.text,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 52,
    fontWeight: '500',
  },
  tierPoints: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: '700',
  },
  arrow: {
    position: 'absolute',
    right: -18,
    top: 14,
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
  closeTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MergeChainGuide;
