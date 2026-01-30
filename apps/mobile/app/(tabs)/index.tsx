/**
 * Home Screen
 * Displays stats card with all 14 skills
 */

import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useGameStore } from '../../src/store/gameStore';
import {
  SKILLS,
  levelFromXp,
  progressToNextLevel,
  getTotalLevel,
  getXpBarColor,
  SkillId,
} from '@xpgains/core';

/**
 * Skill tile component
 */
function SkillTile({ skillId }: { skillId: SkillId }) {
  const { state } = useGameStore();
  const skill = SKILLS.find(s => s.id === skillId);
  const xp = state.stats.skillXp[skillId] || 0;
  const level = levelFromXp(xp);
  const progress = progressToNextLevel(xp);
  const barColor = getXpBarColor(progress);

  if (!skill) return null;

  return (
    <Pressable style={styles.skillTile}>
      <View style={styles.skillIcon}>
        <Text style={styles.skillIconText}>
          {skill.name.charAt(0)}
        </Text>
      </View>
      <Text style={styles.skillName} numberOfLines={1}>
        {skill.name}
      </Text>
      <Text style={styles.skillLevel}>{level}</Text>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progress}%`, backgroundColor: barColor },
          ]}
        />
      </View>
    </Pressable>
  );
}

/**
 * Total level tile component
 */
function TotalLevelTile() {
  const { state } = useGameStore();
  const totalLevel = getTotalLevel(state.stats.skillXp);
  const maxTotal = 99 * 14; // 1386

  return (
    <View style={[styles.skillTile, styles.totalTile]}>
      <Text style={styles.totalLabel}>Total</Text>
      <Text style={styles.totalLevel}>{totalLevel}</Text>
      <Text style={styles.totalMax}>/ {maxTotal}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { state } = useGameStore();

  // Split skills into rows (5 columns per row, last row has Total)
  const upperSkills = SKILLS.filter(s => s.bodyRegion === 'upper');
  const lowerSkills = SKILLS.filter(s => s.bodyRegion === 'lower');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Stats</Text>
        <Text style={styles.subtitle}>
          Level up by training each muscle group
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Upper Body */}
        <Text style={styles.sectionLabel}>Upper Body</Text>
        <View style={styles.skillRow}>
          {upperSkills.slice(0, 5).map(skill => (
            <SkillTile key={skill.id} skillId={skill.id} />
          ))}
        </View>
        <View style={styles.skillRow}>
          {upperSkills.slice(5).map(skill => (
            <SkillTile key={skill.id} skillId={skill.id} />
          ))}
        </View>

        {/* Lower Body */}
        <Text style={styles.sectionLabel}>Lower Body</Text>
        <View style={styles.skillRow}>
          {lowerSkills.map(skill => (
            <SkillTile key={skill.id} skillId={skill.id} />
          ))}
          <TotalLevelTile />
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {state.history.workoutSessions.length}
          </Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {state.history.xpEvents.length}
          </Text>
          <Text style={styles.statLabel}>Sets Logged</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {state.progress.streakCount || 0}
          </Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
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
  statsGrid: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  skillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  skillTile: {
    width: '18%',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  skillIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff981f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  skillIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  skillName: {
    fontSize: 9,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 2,
  },
  skillLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressBarContainer: {
    width: '100%',
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  totalTile: {
    backgroundColor: '#2a2a1a',
    borderColor: '#ff981f',
  },
  totalLabel: {
    fontSize: 10,
    color: '#ff981f',
    marginBottom: 4,
  },
  totalLevel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff981f',
  },
  totalMax: {
    fontSize: 10,
    color: '#888',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff981f',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});
