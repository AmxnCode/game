/**
 * Row of generator buttons — one per unlocked chain.
 * Tap to spawn a new tier-1 item onto the board.
 * No energy, no cooldown. Free to play as much as you want.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GeneratorState } from '../utils/gameEngine';
import { ITEM_MAP, getChainStart } from '../constants/items';
import { COLORS } from '../constants/config';

interface Props {
  generators: GeneratorState[];
  onSpawn: (chain: string) => void;
  boardIsFull: boolean;
}

const CHAIN_LABELS: Record<string, string> = {
  nature: 'Nature',
  gem: 'Gems',
  food: 'Food',
};

const GeneratorBar: React.FC<Props> = ({ generators, onSpawn, boardIsFull }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tap to spawn</Text>
      <View style={styles.row}>
        {generators.map((gen) => {
          const startItem = getChainStart(gen.chain);
          return (
            <Pressable
              key={gen.chain}
              onPress={() => onSpawn(gen.chain)}
              disabled={boardIsFull}
              style={({ pressed }) => [
                styles.button,
                boardIsFull && styles.buttonDisabled,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Spawn ${CHAIN_LABELS[gen.chain]} item`}
              accessibilityState={{ disabled: boardIsFull }}
            >
              <Text style={styles.emoji}>{startItem.emoji}</Text>
              <Text style={styles.chainLabel}>{CHAIN_LABELS[gen.chain]}</Text>
            </Pressable>
          );
        })}
      </View>
      {boardIsFull && (
        <Text style={styles.fullWarning}>⚠️ Board full — sell an item to continue</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  label: {
    color: COLORS.textDim,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accent + '88',
    minWidth: 80,
    gap: 4,
  },
  buttonDisabled: {
    borderColor: COLORS.cellBorder,
    opacity: 0.5,
  },
  emoji: {
    fontSize: 28,
  },
  chainLabel: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
  },
  fullWarning: {
    color: COLORS.danger,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default React.memo(GeneratorBar);
