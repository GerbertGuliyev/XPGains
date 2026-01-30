/**
 * XP Calculation Tests
 */

import { calculateXpGain, isSkillNeglected, getSpilloverXp } from '../domain/xp';
import { EXERCISES, getExerciseById } from '../data/exercises';
import { XP_CONFIG } from '../data/xpConfig';
import type { RecentSet, LogEntry } from '../types';

describe('XP Calculation', () => {
  describe('calculateXpGain', () => {
    const baseParams = {
      reps: 10,
      weightKg: 80,
      exerciseId: 'bench_press',
      skillLevel: 1,
      recentSets: [] as RecentSet[],
      isNeglected: false,
    };

    it('calculates base XP for compound exercises', () => {
      const xp = calculateXpGain(baseParams);

      // Bench press: compound (50 base), 10 reps (1.0x), 80kg (1.0x intensity at ref 80)
      expect(xp).toBe(50);
    });

    it('calculates base XP for isolation exercises', () => {
      const xp = calculateXpGain({
        ...baseParams,
        exerciseId: 'dumbbell_curl',
        weightKg: 16, // Reference weight for dumbbell curl
      });

      // Dumbbell curl: isolation (35 base), 10 reps (1.0x), 16kg (1.0x intensity)
      expect(xp).toBe(35);
    });

    it('applies reps factor correctly', () => {
      // 6 reps = 0.6x
      const xp6 = calculateXpGain({ ...baseParams, reps: 6 });
      // 20 reps = 2.0x
      const xp20 = calculateXpGain({ ...baseParams, reps: 20 });

      expect(xp6).toBe(Math.round(50 * 0.6)); // 30
      expect(xp20).toBe(Math.round(50 * 2.0)); // 100
    });

    it('clamps reps factor between 0.6 and 2.0', () => {
      const xp3 = calculateXpGain({ ...baseParams, reps: 3 }); // Would be 0.3x
      const xp30 = calculateXpGain({ ...baseParams, reps: 30 }); // Would be 3.0x

      expect(xp3).toBe(Math.round(50 * 0.6)); // Clamped to min
      expect(xp30).toBe(Math.round(50 * 2.0)); // Clamped to max
    });

    it('applies intensity factor based on weight vs reference', () => {
      // Light weight (40kg vs 80kg ref) = sqrt(0.5) ≈ 0.707
      const xpLight = calculateXpGain({ ...baseParams, weightKg: 40 });
      // Heavy weight (160kg vs 80kg ref) = sqrt(2) ≈ 1.414
      const xpHeavy = calculateXpGain({ ...baseParams, weightKg: 160 });

      expect(xpLight).toBe(Math.round(50 * Math.sqrt(40 / 80)));
      expect(xpHeavy).toBe(Math.round(50 * Math.sqrt(160 / 80)));
    });

    it('uses 1.0 intensity for bodyweight exercises', () => {
      const xp = calculateXpGain({
        ...baseParams,
        exerciseId: 'push_ups',
        weightKg: 0,
      });

      // Push ups: compound (50 base), 10 reps (1.0x), bodyweight (1.0x intensity)
      expect(xp).toBe(50);
    });

    it('applies neglected muscle bonus (+10%)', () => {
      const normalXp = calculateXpGain(baseParams);
      const neglectedXp = calculateXpGain({ ...baseParams, isNeglected: true });

      expect(neglectedXp).toBe(Math.round(normalXp * 1.1));
    });

    it('returns minimum 1 XP', () => {
      const xp = calculateXpGain({
        ...baseParams,
        reps: 1,
        weightKg: 0.1,
        exerciseId: 'crunch',
      });

      expect(xp).toBeGreaterThanOrEqual(1);
    });

    it('applies diminishing returns after grace period', () => {
      const recentSets: RecentSet[] = [
        { exerciseId: 'bench_press', weight: 80, reps: 10, timestamp: Date.now() },
        { exerciseId: 'bench_press', weight: 80, reps: 10, timestamp: Date.now() },
      ];

      const normalXp = calculateXpGain(baseParams);
      const diminishedXp = calculateXpGain({ ...baseParams, recentSets });

      // After grace period (1 set at level 1), diminishing kicks in
      expect(diminishedXp).toBeLessThan(normalXp);
    });

    it('does not apply diminishing when exceeding previous reps', () => {
      const recentSets: RecentSet[] = [
        { exerciseId: 'bench_press', weight: 80, reps: 8, timestamp: Date.now() },
      ];

      const xpNormal = calculateXpGain(baseParams);
      const xpAfterPR = calculateXpGain({
        ...baseParams,
        reps: 12, // Exceeds previous 8 reps
        recentSets,
      });

      // Should get full XP since exceeding previous best
      expect(xpAfterPR).toBeGreaterThan(xpNormal * 0.85);
    });
  });

  describe('isSkillNeglected', () => {
    const createLogEntry = (
      skillId: string,
      daysAgo: number
    ): LogEntry => ({
      id: Math.random().toString(),
      timestamp: Date.now() - daysAgo * 24 * 60 * 60 * 1000,
      skillId: skillId as any,
      exerciseId: 'bench_press',
      weight: 60,
      reps: 10,
      xpAwarded: 50,
    });

    it('returns false for never-trained muscles', () => {
      const logEntries: LogEntry[] = [
        createLogEntry('back_lats', 5),
      ];

      // Chest has never been trained
      expect(isSkillNeglected('chest', logEntries)).toBe(false);
    });

    it('returns false for recently trained muscles', () => {
      const logEntries: LogEntry[] = [
        createLogEntry('chest', 3), // Trained 3 days ago
      ];

      expect(isSkillNeglected('chest', logEntries)).toBe(false);
    });

    it('returns true for muscles trained before but not recently', () => {
      const logEntries: LogEntry[] = [
        createLogEntry('chest', 10), // Trained 10 days ago
      ];

      expect(isSkillNeglected('chest', logEntries)).toBe(true);
    });

    it('uses custom threshold when provided', () => {
      const logEntries: LogEntry[] = [
        createLogEntry('chest', 5), // Trained 5 days ago
      ];

      // Default 7-day threshold: not neglected
      expect(isSkillNeglected('chest', logEntries, 7)).toBe(false);

      // Custom 3-day threshold: neglected
      expect(isSkillNeglected('chest', logEntries, 3)).toBe(true);
    });
  });

  describe('getSpilloverXp', () => {
    it('returns spillover for compound exercises', () => {
      const spillover = getSpilloverXp('bench_press', 100);

      expect(spillover).toHaveLength(2);
      expect(spillover.find(s => s.skillId === 'triceps')?.xp).toBe(15);
      expect(spillover.find(s => s.skillId === 'delts')?.xp).toBe(10);
    });

    it('returns empty array for isolation exercises', () => {
      const spillover = getSpilloverXp('dumbbell_curl', 100);

      expect(spillover).toHaveLength(0);
    });

    it('calculates spillover based on parent XP', () => {
      const spillover50 = getSpilloverXp('bench_press', 50);
      const spillover100 = getSpilloverXp('bench_press', 100);

      expect(spillover100[0].xp).toBe(spillover50[0].xp * 2);
    });

    it('rounds spillover XP', () => {
      const spillover = getSpilloverXp('bench_press', 33);

      // 33 * 0.15 = 4.95, should round to 5
      expect(spillover.find(s => s.skillId === 'triceps')?.xp).toBe(5);
    });
  });
});
