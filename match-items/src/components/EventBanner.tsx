import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, isWeekend, WEEKEND_MULTIPLIER } from '../constants/config';

const EventBanner: React.FC = () => {
  if (!isWeekend()) return null;

  return (
    <View style={styles.banner}>
      <Text>🎉</Text>
      <View style={styles.texts}>
        <Text style={styles.title}>Weekend {WEEKEND_MULTIPLIER}x Event!</Text>
        <Text style={styles.sub}>Double merge scores all weekend</Text>
      </View>
      <Text>🎉</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.gold + '18',
    borderRadius: 14,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.gold + '33',
  },
  texts: {
    alignItems: 'center',
  },
  title: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '800',
  },
  sub: {
    color: COLORS.textDim,
    fontSize: 11,
  },
});

export default EventBanner;
