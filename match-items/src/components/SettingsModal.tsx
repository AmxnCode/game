import React from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { COLORS } from '../constants/config';
import { Settings } from '../utils/storage';

interface Props {
  visible: boolean;
  settings: Settings;
  onToggle: (key: keyof Settings) => void;
  onClose: () => void;
}

const LABELS: Record<keyof Settings, { label: string; icon: string }> = {
  soundEnabled: { label: 'Sound Effects', icon: '🔊' },
  hapticsEnabled: { label: 'Haptics', icon: '📳' },
  showMergeHints: { label: 'Merge Hints', icon: '💡' },
  notificationsEnabled: { label: 'Daily Notifications', icon: '🔔' },
};

const SettingsModal: React.FC<Props> = ({ visible, settings, onToggle, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>⚙️ Settings</Text>

          {(Object.keys(LABELS) as (keyof Settings)[]).map((key) => (
            <View key={key} style={styles.row}>
              <Text style={styles.rowLabel}>
                {LABELS[key].icon} {LABELS[key].label}
              </Text>
              <Switch
                value={settings[key] as boolean}
                onValueChange={() => onToggle(key)}
                trackColor={{ false: COLORS.cellBorder, true: COLORS.accent + '88' }}
                thumbColor={settings[key] ? '#fff' : COLORS.textDim}
              />
            </View>
          ))}

          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: 300,
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.cellBorder,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rowLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  closeBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SettingsModal;
