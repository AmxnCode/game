import React, { useCallback, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  PanResponder,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { ItemDef, ITEM_MAP } from '../constants/items';
import { COLORS } from '../constants/config';

interface Props {
  index: number;
  itemId: string | null;
  isSelected: boolean;
  isHinted: boolean;
  onTap: (index: number) => void;
  onLongPress: (index: number) => void;
  onDragStart?: (index: number) => void;
  onDragEnd?: (fromIndex: number, toIndex: number) => void;
  size: number;
}

const TIER_COLORS: Record<number, string> = {
  1: '#a8a8b0',
  2: '#4ade80',
  3: '#60a5fa',
  4: '#c084fc',
  5: '#f59e0b',
  6: '#f97316',
  7: '#ef4444',
  8: '#ffd700',
};

const BoardCell: React.FC<Props> = ({
  index,
  itemId,
  isSelected,
  isHinted,
  onTap,
  onLongPress,
  onDragStart,
  onDragEnd,
  size,
}) => {
  const item: ItemDef | undefined = itemId ? ITEM_MAP.get(itemId) : undefined;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8;
      },
      onPanResponderGrant: () => {
        if (itemId && onDragStart) {
          isDragging.value = true;
          translateX.value = withTiming(0);
          translateY.value = withTiming(0);
          runOnJS(onDragStart)(index);
        }
      },
      onPanResponderMove: (_, gesture) => {
        translateX.value = gesture.dx;
        translateY.value = gesture.dy;
      },
      onPanResponderRelease: (_, gesture) => {
        if (!onDragEnd) return;
        const cellWidth = size + 4;
        const cols = 5;
        const toIndex = index + Math.round(gesture.dx / cellWidth) + Math.round(gesture.dy / cellWidth) * cols;
        if (toIndex >= 0 && toIndex < 40 && toIndex !== index) {
          runOnJS(onDragEnd)(index, toIndex);
        }
        isDragging.value = false;
        translateX.value = withSpring(0, { stiffness: 200, damping: 20 });
        translateY.value = withSpring(0, { stiffness: 200, damping: 20 });
      },
      onPanResponderTerminate: () => {
        isDragging.value = false;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      },
    })
  ).current;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    zIndex: isDragging.value ? 100 : 1,
  }));

  const handlePress = useCallback(() => {
    onTap(index);
  }, [index, onTap]);

  const handleLongPress = useCallback(() => {
    onLongPress(index);
  }, [index, onLongPress]);

  const bgColor = isSelected
    ? COLORS.accent + '22'
    : isHinted
    ? COLORS.success + '18'
    : item
    ? item.color + '1a'
    : COLORS.cellEmpty;

  const borderColor = isSelected
    ? COLORS.accent
    : isHinted
    ? COLORS.success
    : item
    ? TIER_COLORS[item.tier] + '66'
    : COLORS.cellBorder;

  return (
    <View
      style={{ width: size, height: size, margin: 2 }}
      {...panResponder.panHandlers}
    >
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={400}
        style={({ pressed }) => [
          styles.cell,
          animatedStyle,
          {
            backgroundColor: bgColor,
            borderColor: borderColor,
            borderStyle: isHinted ? 'dashed' : 'solid',
            opacity: pressed ? 0.85 : 1,
          },
        ]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={item ? `${item.label} tier ${item.tier}` : 'Empty cell'}
      >
        {item ? (
          <View style={styles.itemContainer}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={[styles.tierDot, { backgroundColor: TIER_COLORS[item.tier] }]} />
          </View>
        ) : null}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  emoji: {
    fontSize: 28,
  },
  tierDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default React.memo(BoardCell);
