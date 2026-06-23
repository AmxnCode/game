import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GeneratorState } from '../utils/gameEngine';
import { getChainStart } from '../constants/items';
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
      <Text style={styles.label}>TAP TO SPAWN</Text>
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
            >
              <Text style={styles.emoji}>{startItem.emoji}</Text>
              <Text style={styles.chainLabel}>{CHAIN_LABELS[gen.chain]}</Text>
            </Pressable>
          );
        })}
      </View>
      {boardIsFull && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>Board full — sell an item</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  label: {
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accent + '44',
    gap: 4,
  },
  buttonDisabled: {
    borderColor: COLORS.cellBorder,
    opacity: 0.4,
  },
  emoji: {
    fontSize: 30,
  },
  chainLabel: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '700',
  },
  warning: {
    backgroundColor: COLORS.danger + '18',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  warningText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default React.memo(GeneratorBar);
