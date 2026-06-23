/**
 * The main game board grid.
 * Manages cell selection and triggers merge/move on second tap.
 */

import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import BoardCell from './BoardCell';
import { Cell } from '../utils/gameEngine';
import { MergeHint } from '../utils/gameEngine';
import { BOARD_COLS, BOARD_ROWS, COLORS } from '../constants/config';
import { ITEM_MAP } from '../constants/items';
import { MergeResult } from '../utils/gameEngine';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BOARD_PADDING = 12;
const GAP = 4; // 2 * 2 margin per cell
const CELL_SIZE = Math.floor(
  (SCREEN_WIDTH - BOARD_PADDING * 2 - GAP * BOARD_COLS) / BOARD_COLS
);

interface Props {
  cells: Cell[];
  hint: MergeHint | null;
  onMerge: (from: number, to: number) => MergeResult | null;
  onMove: (from: number, to: number) => void;
  onSell: (index: number) => void;
}

const GameBoard: React.FC<Props> = ({ cells, hint, onMerge, onMove, onSell }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleTap = useCallback(
    (index: number) => {
      const cell = cells[index];

      if (selectedIndex === null) {
        // Nothing selected — select this cell (only if it has an item)
        if (cell.itemId) {
          setSelectedIndex(index);
        }
        return;
      }

      if (selectedIndex === index) {
        // Tapped same cell — deselect
        setSelectedIndex(null);
        return;
      }

      const fromCell = cells[selectedIndex];
      const toCell = cell;

      if (fromCell.itemId && toCell.itemId && fromCell.itemId === toCell.itemId) {
        // Same item — try to merge
        const result = onMerge(selectedIndex, index);
        setSelectedIndex(null);
        return;
      }

      if (!toCell.itemId) {
        // Empty target — move
        onMove(selectedIndex, index);
        setSelectedIndex(null);
        return;
      }

      // Different item on target — swap selection to the new cell
      if (toCell.itemId) {
        setSelectedIndex(index);
      }
    },
    [cells, selectedIndex, onMerge, onMove]
  );

  const handleLongPress = useCallback(
    (index: number) => {
      setSelectedIndex(null);
      onSell(index);
    },
    [onSell]
  );

  return (
    <View style={styles.board}>
      {cells.map((cell) => (
        <BoardCell
          key={cell.index}
          index={cell.index}
          itemId={cell.itemId}
          isSelected={cell.index === selectedIndex}
          isHinted={
            hint !== null &&
            (cell.index === hint.fromIndex || cell.index === hint.toIndex)
          }
          onTap={handleTap}
          onLongPress={handleLongPress}
          size={CELL_SIZE}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: BOARD_PADDING,
    backgroundColor: COLORS.boardBackground,
    borderRadius: 16,
    alignSelf: 'center',
    width: SCREEN_WIDTH - 16,
  },
});

export default React.memo(GameBoard);
