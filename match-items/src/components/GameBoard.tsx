import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import BoardCell from './BoardCell';
import { Cell } from '../utils/gameEngine';
import { MergeHint } from '../utils/gameEngine';
import { BOARD_COLS, COLORS } from '../constants/config';
import { MergeResult } from '../utils/gameEngine';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BOARD_PADDING = 10;
const GAP = 4;
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
        if (cell.itemId) setSelectedIndex(index);
        return;
      }
      if (selectedIndex === index) {
        setSelectedIndex(null);
        return;
      }
      const fromCell = cells[selectedIndex];
      if (fromCell.itemId && cell.itemId && fromCell.itemId === cell.itemId) {
        onMerge(selectedIndex, index);
        setSelectedIndex(null);
        return;
      }
      if (!cell.itemId) {
        onMove(selectedIndex, index);
        setSelectedIndex(null);
        return;
      }
      setSelectedIndex(index);
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

  const handleDragStart = useCallback(() => {}, []);
  const handleDragEnd = useCallback(
    (fromIndex: number, toIndex: number) => {
      const fromCell = cells[fromIndex];
      const toCell = cells[toIndex];
      if (fromCell.itemId && toCell.itemId && fromCell.itemId === toCell.itemId) {
        onMerge(fromIndex, toIndex);
      } else if (!toCell.itemId) {
        onMove(fromIndex, toIndex);
      }
      setSelectedIndex(null);
    },
    [cells, onMerge, onMove]
  );

  return (
    <View style={styles.board}>
      {cells.map((cell) => (
        <BoardCell
          key={cell.index}
          index={cell.index}
          itemId={cell.itemId}
          isSelected={cell.index === selectedIndex}
          isHinted={hint !== null && (cell.index === hint.fromIndex || cell.index === hint.toIndex)}
          onTap={handleTap}
          onLongPress={handleLongPress}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
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
    width: SCREEN_WIDTH,
  },
});

export default React.memo(GameBoard);
