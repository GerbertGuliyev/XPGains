/**
 * Settings Screen
 * User preferences and account management
 */

import { ScrollView, View, Text, StyleSheet, Pressable, Switch, Alert } from 'react-native';
import { useGameStore } from '../../src/store/gameStore';

/**
 * Settings section component
 */
function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

/**
 * Settings row component
 */
function SettingsRow({
  label,
  value,
  onPress,
  rightElement,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) {
  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {rightElement}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { state, updateSettings, resetProgress, getTotalLevel } = useGameStore();

  const handleUnitToggle = () => {
    updateSettings({
      unit: state.settings.unit === 'kg' ? 'lbs' : 'kg',
    });
  };

  const handleThemeToggle = () => {
    updateSettings({
      theme: state.settings.theme === 'classic' ? 'mithril' : 'classic',
    });
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Progress',
      'This will delete ALL your progress including XP, workouts, and settings. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            Alert.alert('Progress Reset', 'Your progress has been reset.');
          },
        },
      ]
    );
  };

  const totalLevel = getTotalLevel();
  const totalXp = Object.values(state.stats.skillXp).reduce((a, b) => a + b, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Section */}
      <SettingsSection title="Profile">
        <SettingsRow
          label="Display Name"
          value={state.profile.displayName || 'Not set'}
        />
        <SettingsRow label="Total Level" value={totalLevel.toString()} />
        <SettingsRow label="Total XP" value={totalXp.toLocaleString()} />
      </SettingsSection>

      {/* Preferences Section */}
      <SettingsSection title="Preferences">
        <SettingsRow
          label="Weight Unit"
          rightElement={
            <View style={styles.toggleContainer}>
              <Text style={[styles.toggleLabel, state.settings.unit === 'kg' && styles.toggleActive]}>
                KG
              </Text>
              <Switch
                value={state.settings.unit === 'lbs'}
                onValueChange={handleUnitToggle}
                trackColor={{ false: '#333', true: '#ff981f' }}
                thumbColor="#fff"
              />
              <Text style={[styles.toggleLabel, state.settings.unit === 'lbs' && styles.toggleActive]}>
                LBS
              </Text>
            </View>
          }
        />
        <SettingsRow
          label="Theme"
          value={state.settings.theme === 'classic' ? 'Classic' : 'Mithril'}
          onPress={handleThemeToggle}
        />
        <SettingsRow
          label="Language"
          value={(state.settings.language || 'en').toUpperCase()}
        />
      </SettingsSection>

      {/* Account Section */}
      <SettingsSection title="Account">
        <SettingsRow
          label="Sign In"
          value="Guest Mode"
        />
        <SettingsRow
          label="Sync Status"
          value={state.meta.pendingSync ? 'Pending' : 'Synced'}
        />
      </SettingsSection>

      {/* Data Section */}
      <SettingsSection title="Data">
        <SettingsRow
          label="Export Data"
          onPress={() => Alert.alert('Coming Soon', 'Data export will be available soon.')}
        />
        <SettingsRow
          label="Import Data"
          onPress={() => Alert.alert('Coming Soon', 'Data import will be available soon.')}
        />
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection title="Danger Zone">
        <Pressable style={styles.dangerButton} onPress={handleReset}>
          <Text style={styles.dangerButtonText}>Reset All Progress</Text>
        </Pressable>
      </SettingsSection>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appName}>XPGains</Text>
        <Text style={styles.appVersion}>v1.0.0</Text>
        <Text style={styles.appTagline}>Track your progress</Text>
        <Text style={styles.copyright}>
          © 2026 Gerbert Guliyev. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  rowLabel: {
    fontSize: 16,
    color: '#fff',
  },
  rowValue: {
    fontSize: 14,
    color: '#888',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 12,
    color: '#666',
  },
  toggleActive: {
    color: '#ff981f',
    fontWeight: '600',
  },
  dangerButton: {
    padding: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#ff5722',
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff981f',
  },
  appVersion: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  appTagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  copyright: {
    fontSize: 10,
    color: '#555',
    marginTop: 16,
  },
});
