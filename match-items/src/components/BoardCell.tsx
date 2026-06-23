/**
 * Single cell on the game board.
 * Handles:
 * - Displaying the item (emoji + label)
 * - Tap to select
 * - Highlight when selected or hinted
 * - Sell long-press
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import { ItemDef, ITEM_MAP } from '../constants/items';
import { COLORS } from '../constants/config';

interface Props {
  index: number;
  itemId: string | null;
  isSelected: boolean;
  isHinted: boolean;
  onTap: (index: number) => void;
  onLongPress: (index: number) => void;
  size: number;
}

const BoardCell: React.FC<Props> = ({
  index,
  itemId,
  isSelected,
  isHinted,
  onTap,
  onLongPress,
  size,
}) => {
  const item: ItemDef | undefined = itemId ? ITEM_MAP.get(itemId) : undefined;

  const handlePress = useCallback(() => onTap(index), [index, onTap]);
  const handleLongPress = useCallback(() => onLongPress(index), [index, onLongPress]);

  const bgColor = isSelected
    ? COLORS.accent
    : isHinted
    ? '#2a5030'
    : item
    ? item.color + '33'  // tinted with low alpha
    : COLORS.cellEmpty;

  const borderColor = isSelected
    ? COLORS.accentLight
    : isHinted
    ? COLORS.success
    : item
    ? item.color + '88'
    : COLORS.cellBorder;

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={400}
      style={({ pressed }) => [
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor: bgColor,
          borderColor: borderColor,
          opacity: pressed ? 0.75 : 1,
          transform: [{ scale: isSelected ? 1.05 : 1 }],
        },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={item ? `${item.label} tier ${item.tier}` : 'Empty cell'}
      accessibilityHint={item ? 'Tap to select, long press to sell' : 'Tap a selected item to move here'}
    >
      {item ? (
        <View style={styles.itemContainer}>
          <Text style={[styles.emoji, { fontSize: size * 0.38 }]}>
            {item.emoji}
          </Text>
          <Text
            style={[styles.tierDot, { fontSize: size * 0.14 }]}
            numberOfLines={1}
          >
            {'●'.repeat(item.tier)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cell: {
    margin: 2,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  emoji: {
    lineHeight: undefined,
    textAlign: 'center',
  },
  tierDot: {
    color: '#ffffff99',
    letterSpacing: -1,
  },
});

export default React.memo(BoardCell);
