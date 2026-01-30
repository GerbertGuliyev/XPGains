/**
 * Log Screen
 * Displays training history with undo functionality
 */

import { ScrollView, View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useGameStore } from '../../src/store/gameStore';
import {
  SKILLS,
  getExerciseById,
  formatDate,
  formatWeight,
  groupBy,
  startOfDay,
  LogEntry,
} from '@xpgains/core';

/**
 * Log entry component
 */
function LogEntryItem({ entry }: { entry: LogEntry }) {
  const { state, undoLogEntry } = useGameStore();
  const exercise = getExerciseById(entry.exerciseId);
  const skill = SKILLS.find(s => s.id === entry.skillId);
  const displayUnit = state.settings.unit;

  const handleUndo = () => {
    Alert.alert(
      'Undo Set',
      'This will remove this set and subtract the XP. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Undo',
          style: 'destructive',
          onPress: () => undoLogEntry(entry),
        },
      ]
    );
  };

  return (
    <View style={styles.logEntry}>
      <View style={styles.logEntryMain}>
        <View style={styles.logEntryInfo}>
          <Text style={styles.exerciseName}>
            {exercise?.name || entry.exerciseId}
          </Text>
          <Text style={styles.exerciseDetails}>
            {formatWeight(entry.weight, displayUnit)} × {entry.reps} reps
          </Text>
        </View>
        <View style={styles.logEntryXp}>
          <Text style={styles.xpAmount}>+{entry.xpAwarded}</Text>
          <Text style={styles.xpLabel}>{skill?.name}</Text>
        </View>
      </View>

      {/* Spillover XP */}
      {entry.spillover && entry.spillover.length > 0 && (
        <View style={styles.spilloverContainer}>
          {entry.spillover.map((spill, index) => {
            const spillSkill = SKILLS.find(s => s.id === spill.skillId);
            return (
              <Text key={index} style={styles.spilloverText}>
                +{spill.xp} {spillSkill?.name}
              </Text>
            );
          })}
        </View>
      )}

      <Pressable onPress={handleUndo} style={styles.undoButton}>
        <Text style={styles.undoText}>Undo</Text>
      </Pressable>
    </View>
  );
}

/**
 * Day group component
 */
function DayGroup({
  date,
  entries,
}: {
  date: string;
  entries: LogEntry[];
}) {
  const totalXp = entries.reduce((sum, e) => sum + e.xpAwarded, 0);

  return (
    <View style={styles.dayGroup}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayDate}>{formatDate(new Date(parseInt(date)), 'long')}</Text>
        <Text style={styles.dayXp}>+{totalXp} XP</Text>
      </View>
      {entries.map(entry => (
        <LogEntryItem key={entry.id} entry={entry} />
      ))}
    </View>
  );
}

export default function LogScreen() {
  const { logEntries } = useGameStore();

  // Group entries by day
  const entriesByDay = groupBy(logEntries, entry => {
    return startOfDay(new Date(entry.timestamp)).getTime().toString();
  });

  // Sort days descending (most recent first)
  const sortedDays = Object.keys(entriesByDay).sort(
    (a, b) => parseInt(b) - parseInt(a)
  );

  if (logEntries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No Training History</Text>
        <Text style={styles.emptySubtitle}>
          Complete a workout to see your progress here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Training Log</Text>
        <Text style={styles.subtitle}>
          {logEntries.length} sets logged
        </Text>
      </View>

      {sortedDays.map(day => (
        <DayGroup key={day} date={day} entries={entriesByDay[day]} />
      ))}
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
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  dayGroup: {
    marginBottom: 24,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dayXp: {
    fontSize: 14,
    color: '#ff981f',
    fontWeight: '600',
  },
  logEntry: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  logEntryMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logEntryInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  exerciseDetails: {
    fontSize: 12,
    color: '#888',
  },
  logEntryXp: {
    alignItems: 'flex-end',
  },
  xpAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  xpLabel: {
    fontSize: 10,
    color: '#888',
  },
  spilloverContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  spilloverText: {
    fontSize: 10,
    color: '#81c784',
    backgroundColor: '#1b5e20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  undoButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  undoText: {
    fontSize: 12,
    color: '#ff5722',
  },
});
